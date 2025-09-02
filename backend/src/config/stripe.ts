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
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

export const STRIPE_CONFIG = {
  publishableKey: stripePublishableKey,
  secretKey: stripeSecretKey,
  webhookSecret: process.env['STRIPE_WEBHOOK_SECRET'] || '',
  prices: {
    premium: {
      monthly: process.env['STRIPE_PRICE_PREMIUM_MONTHLY'] || 'price_premium_monthly',
      yearly: process.env['STRIPE_PRICE_PREMIUM_YEARLY'] || 'price_premium_yearly',
    },
    enterprise: {
      monthly: process.env['STRIPE_PRICE_ENTERPRISE_MONTHLY'] || 'price_enterprise_monthly',
      yearly: process.env['STRIPE_PRICE_ENTERPRISE_YEARLY'] || 'price_enterprise_yearly',
    }
  },
  trialDays: 30,
} as const;

export type StripePriceIds = typeof STRIPE_CONFIG.prices;
