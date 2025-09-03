import * as express from 'express';
import { StripeService, SubscriptionData } from '../services/stripeService';
import { supabase } from '../config/supabase';
import { routeRateLimit } from '../middleware/rate';

const router = express.Router();

// Create subscription
router.post('/create-subscription', routeRateLimit(10), async (req, res) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const { plan, interval }: { plan: 'monthly' | 'annual' | 'spark' | 'growth' | 'lead'; interval: 'monthly' | 'yearly' } = req.body;

    if (!plan || !interval) {
      return res.status(400).json({
        success: false,
        error: 'Plan and interval are required'
      });
    }

    // Get user profile for email and name
    const { data: profile } = await supabase
      .from('profiles')
      .select('business_name, contact_email')
      .eq('id', user.id)
      .single();

    const subscriptionData: SubscriptionData = {
      userId: user.id,
      email: user.email || profile?.contact_email || '',
      name: profile?.business_name || user.user_metadata?.['full_name'],
      plan,
      interval,
    };

    const result = await StripeService.createSubscription(subscriptionData);

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create subscription'
    });
  }
});

// Get subscription details
router.get('/subscription', routeRateLimit(30), async (req, res) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const subscriptionDetails = await StripeService.getSubscriptionDetails(user.id);

    return res.json({
      success: true,
      data: subscriptionDetails
    });
  } catch (error) {
    console.error('Error getting subscription:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get subscription'
    });
  }
});

// Cancel subscription
router.post('/cancel-subscription', routeRateLimit(10), async (req, res) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    await StripeService.cancelSubscription(user.id);

    return res.json({
      success: true,
      message: 'Subscription canceled successfully'
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel subscription'
    });
  }
});

// Get user profile with subscription info
router.get('/profile', routeRateLimit(30), async (req, res) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const { data: profile } = await supabase
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
      .single();

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }

    // Check if trial has expired
    if (profile.subscription_status === 'trial' && profile.trial_end_date) {
      const trialEnd = new Date(profile.trial_end_date);
      const now = new Date();

      if (now > trialEnd) {
        // Trial expired, update status
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'expired',
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        profile.subscription_status = 'expired';
      }
    }

    return res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get profile'
    });
  }
});

// Webhook endpoint for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env['STRIPE_WEBHOOK_SECRET'];

  let event;

  try {
    const stripe = require('stripe')(process.env['STRIPE_SECRET_KEY']);
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    await StripeService.handleWebhook(event);
    return res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
});

export default router;
