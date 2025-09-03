import Stripe from 'stripe';

const stripeSecretKey = process.env['STRIPE_SECRET_KEY'];
const stripePublishableKey = process.env['STRIPE_PUBLISHABLE_KEY'];

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

if (!stripePublishableKey) {
  throw new Error('STRIPE_PUBLISHABLE_KEY environment variable is required');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-08-27.basil',
  typescript: true,
});

export const STRIPE_CONFIG = {
  publishableKey: stripePublishableKey,
  secretKey: stripeSecretKey,
  webhookSecret: process.env['STRIPE_WEBHOOK_SECRET'] || '',
  prices: {
    monthly: {
      monthly: process.env['STRIPE_PRICE_MONTHLY'] || 'price_monthly',
      yearly: process.env['STRIPE_PRICE_MONTHLY'] || 'price_monthly', // Same price for now
    },
    annual: {
      monthly: process.env['STRIPE_PRICE_ANNUAL'] || 'price_annual',
      yearly: process.env['STRIPE_PRICE_ANNUAL'] || 'price_annual', // Same price for now
    },
    spark: {
      monthly: process.env['STRIPE_PRICE_SPARK_MONTHLY'] || 'price_spark_monthly',
      yearly: process.env['STRIPE_PRICE_SPARK_MONTHLY'] || 'price_spark_monthly', // Same price for now
    },
    growth: {
      monthly: process.env['STRIPE_PRICE_GROWTH_MONTHLY'] || 'price_growth_monthly',
      yearly: process.env['STRIPE_PRICE_GROWTH_MONTHLY'] || 'price_growth_monthly', // Same price for now
    },
    lead: {
      monthly: process.env['STRIPE_PRICE_LEAD_MONTHLY'] || 'price_lead_monthly',
      yearly: process.env['STRIPE_PRICE_LEAD_MONTHLY'] || 'price_lead_monthly', // Same price for now
    }
  },
  trialDays: 30,
} as const;

export type StripePriceIds = typeof STRIPE_CONFIG.prices;
