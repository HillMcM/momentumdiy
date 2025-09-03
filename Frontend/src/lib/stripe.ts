// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  // Price IDs for different plans
  priceIds: {
    monthly: import.meta.env.VITE_STRIPE_PRICE_MONTHLY || 'price_1S2mLRLJEASc0GWlyTWyxFcz',
    annual: import.meta.env.VITE_STRIPE_PRICE_ANNUAL || 'price_1S2mLlLJEASc0GWlPZyyXHe3',
    spark: import.meta.env.VITE_STRIPE_PRICE_SPARK_MONTHLY || 'price_1S2mMZLJEASc0GWlk7hY3y22',
    growth: import.meta.env.VITE_STRIPE_PRICE_GROWTH_MONTHLY || 'price_1S2mMyLJEASc0GWlUwQFoST9',
    lead: import.meta.env.VITE_STRIPE_PRICE_LEAD_MONTHLY || 'price_1S2mNJLJEASc0GWlZciOqD3p',
  }
};
