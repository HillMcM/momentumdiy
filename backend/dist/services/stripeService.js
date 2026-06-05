"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const stripe_1 = require("../config/stripe");
const supabase_1 = require("../config/supabase");
const logger_1 = require("../utils/logger");
class StripeService {
    static async createOrRetrieveCustomer(userId, email, name) {
        try {
            const { data: profile } = await supabase_1.supabase
                .from('profiles')
                .select('stripe_customer_id')
                .eq('id', userId)
                .single();
            if (profile?.stripe_customer_id) {
                return profile.stripe_customer_id;
            }
            const customerData = {
                email,
                metadata: {
                    supabase_user_id: userId,
                },
            };
            if (name) {
                customerData.name = name;
            }
            const customer = await stripe_1.stripe.customers.create(customerData);
            await supabase_1.supabase
                .from('profiles')
                .update({
                stripe_customer_id: customer.id,
                updated_at: new Date().toISOString(),
            })
                .eq('id', userId);
            return customer.id;
        }
        catch (error) {
            logger_1.logger.error('Error creating/retrieving Stripe customer', error, { email, name });
            throw new Error('Failed to create customer');
        }
    }
    static async createSubscription(subscriptionData) {
        const { userId, email, name, plan, interval } = subscriptionData;
        try {
            const customerId = await this.createOrRetrieveCustomer(userId, email, name);
            const planPrices = stripe_1.STRIPE_CONFIG.prices[plan];
            if (!planPrices) {
                throw new Error(`Invalid plan: ${plan}`);
            }
            const priceId = planPrices[interval];
            if (!priceId) {
                throw new Error(`Invalid interval ${interval} for plan ${plan}`);
            }
            const subscription = await stripe_1.stripe.subscriptions.create({
                customer: customerId,
                items: [{
                        price: priceId,
                    }],
                trial_period_days: stripe_1.STRIPE_CONFIG.trialDays,
                metadata: {
                    supabase_user_id: userId,
                    plan,
                    interval,
                },
                payment_behavior: 'default_incomplete',
                expand: ['latest_invoice.payment_intent'],
            });
            const trialStart = new Date();
            const trialEnd = new Date(trialStart);
            trialEnd.setDate(trialEnd.getDate() + stripe_1.STRIPE_CONFIG.trialDays);
            await supabase_1.supabase
                .from('profiles')
                .update({
                subscription_status: 'trial',
                subscription_plan: plan,
                trial_start_date: trialStart.toISOString(),
                trial_end_date: trialEnd.toISOString(),
                updated_at: new Date().toISOString(),
            })
                .eq('id', userId);
            let clientSecret;
            if (subscription.latest_invoice && typeof subscription.latest_invoice === 'object') {
                const invoice = subscription.latest_invoice;
                clientSecret = invoice.payment_intent?.client_secret;
            }
            return {
                subscriptionId: subscription.id,
                clientSecret,
                trialEnd: trialEnd.toISOString(),
            };
        }
        catch (error) {
            logger_1.logger.error('Error creating subscription', error, { userId, email, plan });
            throw new Error('Failed to create subscription');
        }
    }
    static async cancelSubscription(userId) {
        try {
            const { data: profile } = await supabase_1.supabase
                .from('profiles')
                .select('stripe_customer_id, subscription_status')
                .eq('id', userId)
                .single();
            if (!profile?.stripe_customer_id) {
                throw new Error('No Stripe customer found');
            }
            const subscriptions = await stripe_1.stripe.subscriptions.list({
                customer: profile.stripe_customer_id,
                status: 'active',
            });
            if (subscriptions.data.length === 0) {
                throw new Error('No active subscription found');
            }
            const subscription = subscriptions.data[0];
            if (subscription) {
                await stripe_1.stripe.subscriptions.update(subscription.id, {
                    cancel_at_period_end: true,
                });
                const subscriptionData = subscription;
                await supabase_1.supabase
                    .from('profiles')
                    .update({
                    subscription_status: 'canceled',
                    subscription_end_date: new Date(subscriptionData.current_period_end * 1000).toISOString(),
                    updated_at: new Date().toISOString(),
                })
                    .eq('id', userId);
            }
            return { success: true };
        }
        catch (error) {
            logger_1.logger.error('Error canceling subscription', error, { userId });
            throw new Error('Failed to cancel subscription');
        }
    }
    static async getSubscriptionDetails(userId) {
        try {
            const { data: profile } = await supabase_1.supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            if (!profile?.stripe_customer_id) {
                return null;
            }
            const subscriptions = await stripe_1.stripe.subscriptions.list({
                customer: profile.stripe_customer_id,
                status: 'all',
                limit: 1,
            });
            if (subscriptions.data.length === 0) {
                return {
                    status: profile.subscription_status || 'trial',
                    trialEnd: profile.trial_end_date,
                    plan: profile.subscription_plan,
                };
            }
            const subscription = subscriptions.data[0];
            if (subscription) {
                const subscriptionData = subscription;
                return {
                    status: subscription.status,
                    currentPeriodStart: new Date(subscriptionData.current_period_start * 1000),
                    currentPeriodEnd: new Date(subscriptionData.current_period_end * 1000),
                    cancelAtPeriodEnd: subscription.cancel_at_period_end,
                    plan: profile.subscription_plan,
                    trialEnd: profile.trial_end_date,
                };
            }
            return {
                status: profile.subscription_status || 'trial',
                trialEnd: profile.trial_end_date,
                plan: profile.subscription_plan,
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting subscription details', error, { userId });
            throw new Error('Failed to get subscription details');
        }
    }
    static async handleWebhook(event) {
        try {
            switch (event.type) {
                case 'customer.subscription.created':
                case 'customer.subscription.updated':
                    await this.handleSubscriptionUpdate(event.data.object);
                    break;
                case 'customer.subscription.deleted':
                    await this.handleSubscriptionCancellation(event.data.object);
                    break;
                case 'invoice.payment_succeeded':
                    await this.handlePaymentSuccess(event.data.object);
                    break;
                case 'invoice.payment_failed':
                    await this.handlePaymentFailure(event.data.object);
                    break;
                default:
                    logger_1.logger.debug(`Unhandled webhook event: ${event.type}`);
            }
        }
        catch (error) {
            logger_1.logger.error('Error handling webhook', error, { eventType: event.type });
            throw error;
        }
    }
    static async handleSubscriptionUpdate(subscription) {
        const customerId = subscription.customer;
        const userId = subscription.metadata.supabase_user_id;
        if (!userId)
            return;
        const status = subscription.status;
        const currentPeriodStart = new Date(subscription.current_period_start * 1000);
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
        await supabase_1.supabase
            .from('profiles')
            .update({
            subscription_status: status,
            subscription_start_date: currentPeriodStart.toISOString(),
            subscription_end_date: currentPeriodEnd.toISOString(),
            updated_at: new Date().toISOString(),
        })
            .eq('stripe_customer_id', customerId);
    }
    static async handleSubscriptionCancellation(subscription) {
        const customerId = subscription.customer;
        await supabase_1.supabase
            .from('profiles')
            .update({
            subscription_status: 'canceled',
            subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
        })
            .eq('stripe_customer_id', customerId);
    }
    static async handlePaymentSuccess(invoice) {
        const customerId = invoice.customer;
        const subscriptionId = invoice.subscription;
        const invoiceId = invoice.id;
        const amountPaid = invoice.amount_paid / 100;
        await supabase_1.supabase
            .from('profiles')
            .update({
            last_payment_date: new Date().toISOString(),
            next_payment_date: new Date(invoice.next_payment_attempt * 1000).toISOString(),
            updated_at: new Date().toISOString(),
        })
            .eq('stripe_customer_id', customerId);
        const { data: profile } = await supabase_1.supabase
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single();
        if (!profile) {
            logger_1.logger.warn('No profile found for customer', { customerId });
            return;
        }
        const userId = profile.id;
        await this.processAffiliateCommission(userId, subscriptionId, amountPaid, invoiceId);
    }
    static async processAffiliateCommission(userId, subscriptionId, amountPaid, invoiceId) {
        try {
            if (!subscriptionId) {
                return;
            }
            const { data: referral } = await supabase_1.supabase
                .from('referrals')
                .select('*, affiliate:affiliate_programs(*)')
                .eq('referred_user_id', userId)
                .single();
            if (!referral) {
                return;
            }
            const affiliate = referral.affiliate;
            if (!affiliate || affiliate.status !== 'active') {
                logger_1.logger.warn('Affiliate account not active, skipping commission', {
                    userId,
                    affiliateId: referral.affiliate_id,
                    affiliateStatus: affiliate?.status,
                });
                return;
            }
            const now = new Date();
            let commissionStartDate = null;
            let commissionEndDate = null;
            let isFirstPayment = false;
            if (referral.status === 'pending') {
                isFirstPayment = true;
                commissionStartDate = now;
                commissionEndDate = new Date(now);
                commissionEndDate.setMonth(commissionEndDate.getMonth() + 12);
                await supabase_1.supabase
                    .from('referrals')
                    .update({
                    status: 'converted',
                    first_payment_at: now.toISOString(),
                    commission_start_date: commissionStartDate.toISOString(),
                    commission_end_date: commissionEndDate.toISOString(),
                    stripe_subscription_id: subscriptionId,
                    updated_at: now.toISOString(),
                })
                    .eq('id', referral.id);
                logger_1.logger.info('Referral converted on first payment', {
                    userId,
                    referralId: referral.id,
                    affiliateId: referral.affiliate_id,
                });
            }
            else if (referral.status === 'converted' && referral.commission_start_date) {
                commissionStartDate = new Date(referral.commission_start_date);
                commissionEndDate = referral.commission_end_date ? new Date(referral.commission_end_date) : null;
            }
            else {
                return;
            }
            if (commissionEndDate && now > commissionEndDate) {
                logger_1.logger.info('Commission period expired, skipping commission', {
                    userId,
                    referralId: referral.id,
                    commissionEndDate: commissionEndDate.toISOString(),
                });
                return;
            }
            const COMMISSION_RATE = 0.20;
            const commissionAmount = amountPaid * COMMISSION_RATE;
            if (!commissionStartDate) {
                return;
            }
            const monthsSinceStart = Math.floor((now.getTime() - commissionStartDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
            const commissionMonth = Math.min(monthsSinceStart + 1, 12);
            const { data: existingEarning } = await supabase_1.supabase
                .from('affiliate_earnings')
                .select('id')
                .eq('stripe_invoice_id', invoiceId)
                .single();
            if (existingEarning) {
                logger_1.logger.info('Commission already processed for this invoice', { invoiceId });
                return;
            }
            const { error: earningsError } = await supabase_1.supabase
                .from('affiliate_earnings')
                .insert({
                affiliate_id: referral.affiliate_id,
                referral_id: referral.id,
                stripe_invoice_id: invoiceId,
                amount: commissionAmount,
                subscription_amount: amountPaid,
                commission_month: commissionMonth,
                earned_at: now.toISOString(),
            });
            if (earningsError) {
                logger_1.logger.error('Error creating affiliate earnings', earningsError, {
                    userId,
                    referralId: referral.id,
                    affiliateId: referral.affiliate_id,
                });
                return;
            }
            const { data: affiliateProgram } = await supabase_1.supabase
                .from('affiliate_programs')
                .select('total_earnings, pending_balance')
                .eq('id', referral.affiliate_id)
                .single();
            if (affiliateProgram) {
                const newTotalEarnings = (parseFloat(affiliateProgram.total_earnings?.toString() || '0')) + commissionAmount;
                const newPendingBalance = (parseFloat(affiliateProgram.pending_balance?.toString() || '0')) + commissionAmount;
                await supabase_1.supabase
                    .from('affiliate_programs')
                    .update({
                    total_earnings: newTotalEarnings,
                    pending_balance: newPendingBalance,
                    updated_at: now.toISOString(),
                })
                    .eq('id', referral.affiliate_id);
            }
            const newTotalCommission = (parseFloat(referral.total_commission_earned?.toString() || '0')) + commissionAmount;
            await supabase_1.supabase
                .from('referrals')
                .update({
                total_commission_earned: newTotalCommission,
                updated_at: now.toISOString(),
            })
                .eq('id', referral.id);
            logger_1.logger.info('Affiliate commission processed', {
                userId,
                referralId: referral.id,
                affiliateId: referral.affiliate_id,
                commissionAmount,
                commissionMonth,
                isFirstPayment,
                invoiceId,
            });
        }
        catch (error) {
            logger_1.logger.error('Error processing affiliate commission', error, {
                userId,
                subscriptionId,
                amountPaid,
                invoiceId,
            });
        }
    }
    static async handlePaymentFailure(invoice) {
        const customerId = invoice.customer;
        logger_1.logger.warn('Payment failed for customer', { customerId });
    }
}
exports.StripeService = StripeService;
//# sourceMappingURL=stripeService.js.map