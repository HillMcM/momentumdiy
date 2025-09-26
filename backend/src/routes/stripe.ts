import * as express from 'express';
import { StripeService, SubscriptionData } from '../services/stripeService';
import { supabase, supabasePublic } from '../config/supabase';
import { routeRateLimit } from '../middleware/rate';
import Stripe from 'stripe';

const router = express.Router();

// Create subscription
router.post('/create-subscription', routeRateLimit(10), async (req, res) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - No valid token provided'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify the token and get user
    const { data: { user }, error } = await supabasePublic.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Invalid token'
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
    // Get the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - No valid token provided'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify the token and get user
    const { data: { user }, error } = await supabasePublic.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Invalid token'
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
    // Get the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - No valid token provided'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify the token and get user
    const { data: { user }, error } = await supabasePublic.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Invalid token'
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
    // Get the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - No valid token provided'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify the token and get user
    const { data: { user }, error } = await supabasePublic.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Invalid token'
      });
    }

    // Greenlist check for owner/admin accounts
    const greenlistedEmails = [
      'info@hillaryedenmcmullen.com',
      'hillary@momentumdiy.com',
      'admin@momentumdiy.com'
    ];
    
    const isGreenlisted = greenlistedEmails.includes(user.email?.toLowerCase() || '');

    const { data: profile, error: profileError } = await supabase
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
      console.error('Error fetching profile:', profileError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch profile'
      });
    }

    let finalProfile = profile;
    
    if (!finalProfile) {
      // Create profile - greenlisted users get unlimited access, others get 30-day trial
      const trialStart = new Date();
      const trialEnd = new Date(trialStart);
      trialEnd.setDate(trialEnd.getDate() + 30);
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || 'unknown@example.com', // Handle null email
          subscription_status: isGreenlisted ? 'active' : 'trial',
          trial_start_date: isGreenlisted ? null : trialStart.toISOString(),
          trial_end_date: isGreenlisted ? null : trialEnd.toISOString(),
          subscription_plan: 'monthly'
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        console.error('User data:', { id: user.id, email: user.email });
        return res.status(500).json({
          success: false,
          error: `Failed to create profile: ${createError.message}`
        });
      }

      // Use the newly created profile
      finalProfile = newProfile;
    }

    // Check if trial has expired (skip for greenlisted users)
    if (!isGreenlisted && finalProfile.subscription_status === 'trial' && finalProfile.trial_end_date) {
      const trialEnd = new Date(finalProfile.trial_end_date);
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

        finalProfile.subscription_status = 'expired';
      }
    }

    // Override subscription status for greenlisted users
    if (isGreenlisted) {
      finalProfile.subscription_status = 'active';
    }

    return res.json({
      success: true,
      data: finalProfile
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
    // eslint-disable-next-line @typescript-eslint/no-require-imports
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

// Public checkout endpoints (no authentication required)



// Verify payment and get customer details
router.post('/verify-payment', routeRateLimit(10), async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    const stripe = new Stripe(process.env['STRIPE_SECRET_KEY']!, {
      apiVersion: '2025-08-27.basil',
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'subscription'],
    });

    if (!session.customer || !session.subscription) {
      return res.status(400).json({
        success: false,
        error: 'Invalid session or payment not completed'
      });
    }

    const customer = session.customer as Stripe.Customer;
    const subscription = session.subscription as Stripe.Subscription;

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
        current_period_start: (subscription as any).current_period_start,
        current_period_end: (subscription as any).current_period_end,
      },
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to verify payment'
    });
  }
});

// Helper function to get price ID
function getPriceId(plan: string, interval: string): string | null {
  const priceMap: Record<string, Record<string, string>> = {
    monthly: {
      monthly: process.env['STRIPE_PRICE_MONTHLY']!,
    },
    annual: {
      yearly: process.env['STRIPE_PRICE_ANNUAL']!,
    },
    spark: {
      monthly: process.env['STRIPE_PRICE_SPARK_MONTHLY']!,
    },
    growth: {
      monthly: process.env['STRIPE_PRICE_GROWTH_MONTHLY']!,
    },
    lead: {
      monthly: process.env['STRIPE_PRICE_LEAD_MONTHLY']!,
    },
  };

  return priceMap[plan]?.[interval] || null;
}

// Public checkout endpoints (no authentication required)

// Create Stripe Checkout Session
router.post('/create-checkout-session', routeRateLimit(10), async (req, res) => {
  try {
    const { plan, interval, successUrl, cancelUrl } = req.body;

    if (!plan || !interval || !successUrl || !cancelUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: plan, interval, successUrl, cancelUrl'
      });
    }

    // Get the price ID based on plan and interval
    const priceId = getPriceId(plan, interval);
    if (!priceId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan or interval combination'
      });
    }

    const stripe = new Stripe(process.env['STRIPE_SECRET_KEY']!, {
      apiVersion: '2025-08-27.basil',
    });

    // Create checkout session
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
      // Collect billing address
      billing_address_collection: 'required',
    });

    return res.json({
      success: true,
      data: {
        sessionUrl: session.url,
      },
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create checkout session'
    });
  }
});

// Verify payment and get customer details
router.post('/verify-payment', routeRateLimit(10), async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    const stripe = new Stripe(process.env['STRIPE_SECRET_KEY']!, {
      apiVersion: '2025-08-27.basil',
    });

    // Retrieve the session
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
        status: (session.subscription as any)?.status || 'active',
        current_period_start: (session.subscription as any)?.current_period_start,
        current_period_end: (session.subscription as any)?.current_period_end,
      },
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to verify payment'
    });
  }
});

// Update user profile (including onboarding data)
router.put('/profile', routeRateLimit(10), async (req, res) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - No valid token provided'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify the token and get user
    const { data: { user }, error } = await supabasePublic.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Invalid token'
      });
    }

    const updateData = req.body;

    // Update the profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to update profile'
      });
    }

    return res.json({
      success: true,
      data: updatedProfile
    });
  } catch (error) {
    console.error('Error in profile update:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
