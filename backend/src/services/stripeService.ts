import { stripe, STRIPE_CONFIG } from '../config/stripe';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

export interface SubscriptionData {
  userId: string;
  email: string;
  name?: string;
  plan: 'monthly' | 'annual' | 'spark' | 'growth' | 'lead';
  interval: 'monthly' | 'yearly';
}

export interface CustomerData {
  id: string;
  email: string;
  name?: string;
  subscription_status: string;
  trial_start_date?: Date;
  trial_end_date?: Date;
  subscription_start_date?: Date;
  subscription_end_date?: Date;
  subscription_plan?: string;
  stripe_customer_id?: string;
}

export class StripeService {
  /**
   * Create or retrieve a Stripe customer
   */
  static async createOrRetrieveCustomer(userId: string, email: string, name?: string): Promise<string> {
    try {
      // Check if user already has a Stripe customer ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', userId)
        .single();

      if (profile?.stripe_customer_id) {
        return profile.stripe_customer_id;
      }

      // Create new Stripe customer
      const customerData: any = {
        email,
        metadata: {
          supabase_user_id: userId,
        },
      };
      
      if (name) {
        customerData.name = name;
      }
      
      const customer = await stripe.customers.create(customerData);

      // Save customer ID to profile
      await supabase
        .from('profiles')
        .update({
          stripe_customer_id: customer.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      return customer.id;
    } catch (error) {
      logger.error('Error creating/retrieving Stripe customer', error, { email, name });
      throw new Error('Failed to create customer');
    }
  }

  /**
   * Create a subscription with trial
   */
  static async createSubscription(subscriptionData: SubscriptionData) {
    try {
      const { userId, email, name, plan, interval } = subscriptionData;

      // Get or create customer
      const customerId = await this.createOrRetrieveCustomer(userId, email, name);

      // Get price ID
      const planPrices = STRIPE_CONFIG.prices[plan as keyof typeof STRIPE_CONFIG.prices];
      if (!planPrices) {
        throw new Error(`Invalid plan: ${plan}`);
      }

      const priceId = planPrices[interval as keyof typeof planPrices];
      if (!priceId) {
        throw new Error(`Invalid interval ${interval} for plan ${plan}`);
      }

      // Create subscription with trial
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price: priceId,
        }],
        trial_period_days: STRIPE_CONFIG.trialDays,
        metadata: {
          supabase_user_id: userId,
          plan,
          interval,
        },
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      // Update profile with trial information
      const trialStart = new Date();
      const trialEnd = new Date(trialStart);
      trialEnd.setDate(trialEnd.getDate() + STRIPE_CONFIG.trialDays);

      await supabase
        .from('profiles')
        .update({
          subscription_status: 'trial',
          subscription_plan: plan,
          trial_start_date: trialStart.toISOString(),
          trial_end_date: trialEnd.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      let clientSecret: string | undefined;
      if (subscription.latest_invoice && typeof subscription.latest_invoice === 'object') {
        const invoice = subscription.latest_invoice as any;
        clientSecret = invoice.payment_intent?.client_secret;
      }

      return {
        subscriptionId: subscription.id,
        clientSecret,
        trialEnd: trialEnd.toISOString(),
      };
    } catch (error) {
      logger.error('Error creating subscription', error, { userId, email, plan });
      throw new Error('Failed to create subscription');
    }
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(userId: string) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id, subscription_status')
        .eq('id', userId)
        .single();

      if (!profile?.stripe_customer_id) {
        throw new Error('No Stripe customer found');
      }

      // Get active subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: 'active',
      });

      if (subscriptions.data.length === 0) {
        throw new Error('No active subscription found');
      }

      // Cancel the subscription (effective at period end)
      const subscription = subscriptions.data[0];
      if (subscription) {
        await stripe.subscriptions.update(subscription.id, {
          cancel_at_period_end: true,
        });

        // Update profile
        const subscriptionData = subscription as any;
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'canceled',
            subscription_end_date: new Date(subscriptionData.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
      }

      return { success: true };
    } catch (error) {
      logger.error('Error canceling subscription', error, { userId });
      throw new Error('Failed to cancel subscription');
    }
  }

  /**
   * Get subscription details
   */
  static async getSubscriptionDetails(userId: string) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!profile?.stripe_customer_id) {
        return null;
      }

      const subscriptions = await stripe.subscriptions.list({
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
        const subscriptionData = subscription as any;
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
    } catch (error) {
      logger.error('Error getting subscription details', error, { userId });
      throw new Error('Failed to get subscription details');
    }
  }

  /**
   * Handle Stripe webhooks
   */
  static async handleWebhook(event: any) {
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
          logger.debug(`Unhandled webhook event: ${event.type}`);
      }
    } catch (error) {
      logger.error('Error handling webhook', error, { eventType: event.type });
      throw error;
    }
  }

  private static async handleSubscriptionUpdate(subscription: any) {
    const customerId = subscription.customer;
    const userId = subscription.metadata.supabase_user_id;

    if (!userId) return;

    const status = subscription.status;
    const currentPeriodStart = new Date(subscription.current_period_start * 1000);
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

    await supabase
      .from('profiles')
      .update({
        subscription_status: status,
        subscription_start_date: currentPeriodStart.toISOString(),
        subscription_end_date: currentPeriodEnd.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', customerId);
  }

  private static async handleSubscriptionCancellation(subscription: any) {
    const customerId = subscription.customer;

    await supabase
      .from('profiles')
      .update({
        subscription_status: 'canceled',
        subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', customerId);
  }

  private static async handlePaymentSuccess(invoice: any) {
    const customerId = invoice.customer;

    await supabase
      .from('profiles')
      .update({
        last_payment_date: new Date().toISOString(),
        next_payment_date: new Date(invoice.next_payment_attempt * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', customerId);
  }

  private static async handlePaymentFailure(invoice: any) {
    const customerId = invoice.customer;

    // Could implement payment failure handling (email notifications, etc.)
    logger.warn('Payment failed for customer', { customerId });
  }
}
