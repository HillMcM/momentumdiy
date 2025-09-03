// Stripe configuration with actual product data
export const STRIPE_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  // Price IDs for different plans (from actual Stripe products)
  priceIds: {
    monthly: import.meta.env.VITE_STRIPE_PRICE_MONTHLY || 'price_1S2mLRLJEASc0GWlyTWyxFcz',
    annual: import.meta.env.VITE_STRIPE_PRICE_ANNUAL || 'price_1S2mLlLJEASc0GWlPZyyXHe3',
    spark: import.meta.env.VITE_STRIPE_PRICE_SPARK_MONTHLY || 'price_1S2mMZLJEASc0GWlk7hY3y22',
    growth: import.meta.env.VITE_STRIPE_PRICE_GROWTH_MONTHLY || 'price_1S2mMyLJEASc0GWlUwQFoST9',
    lead: import.meta.env.VITE_STRIPE_PRICE_LEAD_MONTHLY || 'price_1S2mNJLJEASc0GWlZciOqD3p',
  },
  // Product information for UI display
  products: {
    monthly: {
      name: 'MomentumDIY Monthly',
      price: 14.99,
      interval: 'month',
      description: 'Full access to MomentumDIY platform',
      features: [
        'Complete marketing strategy platform',
        'Task management and tracking',
        'Marketing content library',
        'Progress monitoring tools',
        'Monthly support sessions'
      ]
    },
    annual: {
      name: 'MomentumDIY Annual',
      price: 143.88,
      interval: 'year',
      description: 'Full access to MomentumDIY platform (annual plan)',
      features: [
        'Complete marketing strategy platform',
        'Task management and tracking',
        'Marketing content library',
        'Progress monitoring tools',
        'Monthly support sessions',
        '2 months free vs monthly plan'
      ]
    },
    spark: {
      name: 'Spark Membership',
      price: 100.00,
      interval: 'month',
      description: 'MomentumDIY Access + 1 hour of 1:1 marketing consultation',
      features: [
        'Complete marketing strategy platform',
        'Task management and tracking',
        'Marketing content library',
        'Progress monitoring tools',
        '1 hour 1:1 consultation with Hillary'
      ]
    },
    growth: {
      name: 'Growth Membership',
      price: 600.00,
      interval: 'month',
      description: 'MomentumDIY Access + 5 hours of 1:1 marketing consultation',
      features: [
        'Complete marketing strategy platform',
        'Task management and tracking',
        'Marketing content library',
        'Progress monitoring tools',
        '5 hours 1:1 consultation with Hillary',
        'Priority support and guidance'
      ]
    },
    lead: {
      name: 'Lead Membership',
      price: 1400.00,
      interval: 'month',
      description: 'MomentumDIY Access + 10 hours of 1:1 marketing consultation',
      features: [
        'Complete marketing strategy platform',
        'Task management and tracking',
        'Marketing content library',
        'Progress monitoring tools',
        '10 hours 1:1 consultation with Hillary',
        'VIP support and strategic guidance',
        'Custom marketing strategy development'
      ]
    }
  }
};
