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
    monthly: {
      monthly: import.meta.env.VITE_STRIPE_PRICE_MONTHLY_MONTHLY || 'price_monthly_monthly',
    },
    annual: {
      yearly: import.meta.env.VITE_STRIPE_PRICE_ANNUAL_YEARLY || 'price_annual_yearly',
    },
    spark: {
      monthly: import.meta.env.VITE_STRIPE_PRICE_SPARK_MONTHLY || 'price_spark_monthly',
      yearly: import.meta.env.VITE_STRIPE_PRICE_SPARK_YEARLY || 'price_spark_yearly',
    },
    growth: {
      monthly: import.meta.env.VITE_STRIPE_PRICE_GROWTH_MONTHLY || 'price_growth_monthly',
      yearly: import.meta.env.VITE_STRIPE_PRICE_GROWTH_YEARLY || 'price_growth_yearly',
    },
    lead: {
      monthly: import.meta.env.VITE_STRIPE_PRICE_LEAD_MONTHLY || 'price_lead_monthly',
      yearly: import.meta.env.VITE_STRIPE_PRICE_LEAD_YEARLY || 'price_lead_yearly',
    }
  },
  trialDays: 30,
} as const;
