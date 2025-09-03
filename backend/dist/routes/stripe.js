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
        console.error('Error creating subscription:', error);
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
        console.error('Error getting subscription:', error);
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
        console.error('Error canceling subscription:', error);
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
        const { data: profile } = await supabase_1.supabase
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
        if (profile.subscription_status === 'trial' && profile.trial_end_date) {
            const trialEnd = new Date(profile.trial_end_date);
            const now = new Date();
            if (now > trialEnd) {
                await supabase_1.supabase
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
    }
    catch (error) {
        console.error('Error getting profile:', error);
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
        console.log(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    try {
        await stripeService_1.StripeService.handleWebhook(event);
        return res.json({ received: true });
    }
    catch (error) {
        console.error('Error handling webhook:', error);
        return res.status(500).json({ error: 'Webhook handler failed' });
    }
});
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
            customer_creation: 'always',
            billing_address_collection: 'required',
        });
        return res.json({
            success: true,
            sessionId: session.id,
        });
    }
    catch (error) {
        console.error('Error creating checkout session:', error);
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
                current_period_start: subscription.current_period_start,
                current_period_end: subscription.current_period_end,
            },
        });
    }
    catch (error) {
        console.error('Error verifying payment:', error);
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
exports.default = router;
//# sourceMappingURL=stripe.js.map