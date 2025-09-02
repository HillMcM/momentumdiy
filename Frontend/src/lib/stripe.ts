import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  throw new Error('VITE_STRIPE_PUBLISHABLE_KEY environment variable is required');
}

// Create Stripe instance
export const stripePromise = loadStripe(stripePublishableKey);

export const STRIPE_CONFIG = {
  publishableKey: stripePublishableKey,
  prices: {
    premium: {
      monthly: import.meta.env.VITE_STRIPE_PRICE_PREMIUM_MONTHLY || 'price_premium_monthly',
      yearly: import.meta.env.VITE_STRIPE_PRICE_PREMIUM_YEARLY || 'price_premium_yearly',
    },
    enterprise: {
      monthly: import.meta.env.VITE_STRIPE_PRICE_ENTERPRISE_MONTHLY || 'price_enterprise_monthly',
      yearly: import.meta.env.VITE_STRIPE_PRICE_ENTERPRISE_YEARLY || 'price_enterprise_yearly',
    }
  },
  trialDays: 30,
} as const;
