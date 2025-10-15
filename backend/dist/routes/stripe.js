"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
const stripeService_1 = require("../services/stripeService");
const supabase_1 = require("../config/supabase");
const rate_1 = require("../middleware/rate");
const logger_1 = require("../utils/logger");
const admin_1 = require("../config/admin");
const stripe_1 = __importDefault(require("stripe"));
const router = express.Router();
router.post('/create-subscription', (0, rate_1.routeRateLimit)(10), async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized - No valid token provided'
            });
        }
        const token = authHeader.substring(7);
        const { data: { user }, error } = await supabase_1.supabasePublic.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized - Invalid token'
            });
        }
        const { plan, interval } = req.body;
        if (!plan || !interval) {
            return res.status(400).json({
                success: false,
                error: 'Plan and interval are required'
            });
        }
        const { data: profile } = await supabase_1.supabase
            .from('profiles')
            .select('business_name, contact_email')
            .eq('id', user.id)
            .single();
        const subscriptionData = {
            userId: user.id,
            email: user.email || profile?.contact_email || '',
            name: profile?.business_name || user.user_metadata?.['full_name'],
            plan,
            interval,
        };
        const result = await stripeService_1.StripeService.createSubscription(subscriptionData);
        return res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        logger_1.logger.error('Error creating subscription', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create subscription'
        });
    }
});
router.get('/subscription', (0, rate_1.routeRateLimit)(30), async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized - No valid token provided'
            });
        }
        const token = authHeader.substring(7);
        const { data: { user }, error } = await supabase_1.supabasePublic.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized - Invalid token'
            });
        }
        const subscriptionDetails = await stripeService_1.StripeService.getSubscriptionDetails(user.id);
        return res.json({
            success: true,
            data: subscriptionDetails
        });
    }
    catch (error) {
        logger_1.logger.error('Error getting subscription', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get subscription'
        });
    }
});
router.post('/cancel-subscription', (0, rate_1.routeRateLimit)(10), async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized - No valid token provided'
            });
        }
        const token = authHeader.substring(7);
        const { data: { user }, error } = await supabase_1.supabasePublic.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized - Invalid token'
            });
        }
        await stripeService_1.StripeService.cancelSubscription(user.id);
        return res.json({
            success: true,
            message: 'Subscription canceled successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Error canceling subscription', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to cancel subscription'
        });
    }
});
router.get('/profile', (0, rate_1.routeRateLimit)(30), async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized - No valid token provided'
            });
        }
        const token = authHeader.substring(7);
        const { data: { user }, error } = await supabase_1.supabasePublic.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized - Invalid token'
            });
        }
        const isGreenlisted = (0, admin_1.isAdmin)(user.email);
        const { data: profile, error: profileError } = await supabase_1.supabase
            .from('profiles')
            .select(`
        *,
        subscription_status,
        stripe_customer_id,
        trial_start_date,
        trial_end_date,
        subscription_start_date,
        subscription_end_date,
        subscription_plan,
        last_payment_date,
        next_payment_date
      `)
            .eq('id', user.id)
            .maybeSingle();
        if (profileError) {
            logger_1.logger.error('Error fetching profile', profileError, { userId: user.id });
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch profile'
            });
        }
        let finalProfile = profile;
        if (!finalProfile) {
            const trialStart = new Date();
            const trialEnd = new Date(trialStart);
            trialEnd.setDate(trialEnd.getDate() + 30);
            const { data: newProfile, error: createError } = await supabase_1.supabase
                .from('profiles')
                .insert({
                id: user.id,
                email: user.email || 'unknown@example.com',
                subscription_status: isGreenlisted ? 'active' : 'trial',
                trial_start_date: isGreenlisted ? null : trialStart.toISOString(),
                trial_end_date: isGreenlisted ? null : trialEnd.toISOString(),
                subscription_plan: 'monthly'
            })
                .select()
                .single();
            if (createError) {
                logger_1.logger.error('Error creating profile', createError, { userId: user.id, email: user.email });
                return res.status(500).json({
                    success: false,
                    error: `Failed to create profile: ${createError.message}`
                });
            }
            finalProfile = newProfile;
        }
        if (!isGreenlisted && finalProfile.subscription_status === 'trial' && finalProfile.trial_end_date) {
            const trialEnd = new Date(finalProfile.trial_end_date);
            const now = new Date();
            if (now > trialEnd) {
                await supabase_1.supabase
                    .from('profiles')
                    .update({
                    subscription_status: 'expired',
                    updated_at: new Date().toISOString(),
                })
                    .eq('id', user.id);
                finalProfile.subscription_status = 'expired';
            }
        }
        if (isGreenlisted) {
            finalProfile.subscription_status = 'active';
        }
        return res.json({
            success: true,
            data: finalProfile
        });
    }
    catch (error) {
        logger_1.logger.error('Error getting profile', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get profile'
        });
    }
});
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env['STRIPE_WEBHOOK_SECRET'];
    let event;
    try {
        const stripe = require('stripe')(process.env['STRIPE_SECRET_KEY']);
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        logger_1.logger.warn('Webhook signature verification failed', { error: errorMessage });
        return res.status(400).send(`Webhook Error: ${errorMessage}`);
    }
    try {
        await stripeService_1.StripeService.handleWebhook(event);
        return res.json({ received: true });
    }
    catch (error) {
        logger_1.logger.error('Error handling webhook', error, { eventType: event?.type });
        return res.status(500).json({ error: 'Webhook handler failed' });
    }
});
router.post('/verify-payment', (0, rate_1.routeRateLimit)(10), async (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                error: 'Session ID is required'
            });
        }
        const stripe = new stripe_1.default(process.env['STRIPE_SECRET_KEY'], {
            apiVersion: '2025-08-27.basil',
        });
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['customer', 'subscription'],
        });
        if (!session.customer || !session.subscription) {
            return res.status(400).json({
                success: false,
                error: 'Invalid session or payment not completed'
            });
        }
        const customer = session.customer;
        const subscription = session.subscription;
        return res.json({
            success: true,
            customer: {
                id: customer.id,
                email: customer.email,
                name: customer.name,
            },
            subscription: {
                id: subscription.id,
                status: subscription.status,
                current_period_start: 'current_period_start' in subscription ? subscription.current_period_start : undefined,
                current_period_end: 'current_period_end' in subscription ? subscription.current_period_end : undefined,
            },
        });
    }
    catch (error) {
        logger_1.logger.error('Error verifying payment', error, { sessionId: req.body.sessionId });
        return res.status(500).json({
            success: false,
            error: 'Failed to verify payment'
        });
    }
});
function getPriceId(plan, interval) {
    const priceMap = {
        monthly: {
            monthly: process.env['STRIPE_PRICE_MONTHLY'],
        },
        annual: {
            yearly: process.env['STRIPE_PRICE_ANNUAL'],
        },
        spark: {
            monthly: process.env['STRIPE_PRICE_SPARK_MONTHLY'],
        },
        growth: {
            monthly: process.env['STRIPE_PRICE_GROWTH_MONTHLY'],
        },
        lead: {
            monthly: process.env['STRIPE_PRICE_LEAD_MONTHLY'],
        },
    };
    return priceMap[plan]?.[interval] || null;
}
router.post('/create-checkout-session', (0, rate_1.routeRateLimit)(10), async (req, res) => {
    try {
        const { plan, interval, successUrl, cancelUrl } = req.body;
        if (!plan || !interval || !successUrl || !cancelUrl) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters: plan, interval, successUrl, cancelUrl'
            });
        }
        const priceId = getPriceId(plan, interval);
        if (!priceId) {
            return res.status(400).json({
                success: false,
                error: 'Invalid plan or interval combination'
            });
        }
        const stripe = new stripe_1.default(process.env['STRIPE_SECRET_KEY'], {
            apiVersion: '2025-08-27.basil',
        });
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                plan,
                interval,
            },
            billing_address_collection: 'required',
        });
        return res.json({
            success: true,
            data: {
                sessionUrl: session.url,
            },
        });
    }
    catch (error) {
        logger_1.logger.error('Error creating checkout session', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to create checkout session'
        });
    }
});
router.post('/verify-payment', (0, rate_1.routeRateLimit)(10), async (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                error: 'Session ID is required'
            });
        }
        const stripe = new stripe_1.default(process.env['STRIPE_SECRET_KEY'], {
            apiVersion: '2025-08-27.basil',
        });
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['customer', 'subscription']
        });
        if (session.payment_status !== 'paid') {
            return res.status(400).json({
                success: false,
                error: 'Payment not completed'
            });
        }
        return res.json({
            success: true,
            customer: {
                id: session.customer,
                email: session.customer_details?.email,
                name: session.customer_details?.name,
            },
            subscription: {
                id: session.subscription,
                status: typeof session.subscription === 'object' && session.subscription !== null && 'status' in session.subscription
                    ? session.subscription.status
                    : 'active',
                current_period_start: typeof session.subscription === 'object' && session.subscription !== null && 'current_period_start' in session.subscription
                    ? session.subscription.current_period_start
                    : undefined,
                current_period_end: typeof session.subscription === 'object' && session.subscription !== null && 'current_period_end' in session.subscription
                    ? session.subscription.current_period_end
                    : undefined,
            },
        });
    }
    catch (error) {
        logger_1.logger.error('Error verifying payment', error, { sessionId: req.body.sessionId });
        return res.status(500).json({
            success: false,
            error: 'Failed to verify payment'
        });
    }
});
router.put('/profile', (0, rate_1.routeRateLimit)(10), async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized - No valid token provided'
            });
        }
        const token = authHeader.substring(7);
        const { data: { user }, error } = await supabase_1.supabasePublic.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized - Invalid token'
            });
        }
        const updateData = req.body;
        const { data: updatedProfile, error: updateError } = await supabase_1.supabase
            .from('profiles')
            .update({
            ...updateData,
            updated_at: new Date().toISOString(),
        })
            .eq('id', user.id)
            .select()
            .single();
        if (updateError) {
            logger_1.logger.error('Error updating profile', updateError, { userId: user.id });
            return res.status(500).json({
                success: false,
                error: 'Failed to update profile'
            });
        }
        return res.json({
            success: true,
            data: updatedProfile
        });
    }
    catch (error) {
        logger_1.logger.error('Error in profile update', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=stripe.js.map