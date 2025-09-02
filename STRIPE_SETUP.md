# Stripe Payment Integration Setup

This guide will help you set up Stripe payments with a 30-day free trial for new customers.

## 🚀 Quick Start

### 1. Create a Stripe Account
1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete the business verification process
3. Enable test mode for development

### 2. Get Your API Keys
1. In your Stripe dashboard, go to "Developers" → "API keys"
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

### 3. Configure Environment Variables

#### Backend (.env file in /backend directory)
```bash
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Price IDs (you'll create these in step 4)
STRIPE_PRICE_PREMIUM_MONTHLY=price_premium_monthly
STRIPE_PRICE_PREMIUM_YEARLY=price_premium_yearly
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_enterprise_monthly
STRIPE_PRICE_ENTERPRISE_YEARLY=price_enterprise_yearly
```

#### Frontend (.env file in /Frontend directory)
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
VITE_STRIPE_PRICE_PREMIUM_MONTHLY=price_premium_monthly
VITE_STRIPE_PRICE_PREMIUM_YEARLY=price_premium_yearly
VITE_STRIPE_PRICE_ENTERPRISE_MONTHLY=price_enterprise_monthly
VITE_STRIPE_PRICE_ENTERPRISE_YEARLY=price_enterprise_yearly
```

### 4. Create Products and Prices in Stripe

#### Premium Plan
1. Go to "Products" in your Stripe dashboard
2. Create a new product called "Premium Plan"
3. Add pricing:
   - Monthly: $29/month
   - Yearly: $299/year (20% discount)

#### Enterprise Plan
1. Create a new product called "Enterprise Plan"
2. Add pricing:
   - Monthly: $99/month
   - Yearly: $999/year (15% discount)

### 5. Update Price IDs
1. After creating products, copy the price IDs from Stripe
2. Update your environment variables with the actual price IDs

### 6. Set Up Webhooks (Production)

For production, you'll need to set up webhooks to handle subscription events:

1. In Stripe dashboard: "Developers" → "Webhooks"
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook signing secret to your environment variables

## 🎯 Features Included

### ✅ 30-Day Free Trial
- New customers get 30 days free, no credit card required
- Trial automatically converts to paid subscription
- Customers can cancel anytime during trial

### ✅ Subscription Management
- View current plan and status
- Cancel subscription (effective at period end)
- Upgrade/downgrade plans
- Payment history

### ✅ Secure Payment Processing
- PCI-compliant payment forms
- 3D Secure support
- Failed payment handling
- Automatic retries

### ✅ Database Integration
- Subscription status tracking
- Trial period management
- Payment history
- Customer data synchronization

## 🔧 API Endpoints

### Create Subscription
```
POST /api/stripe/create-subscription
{
  "plan": "premium" | "enterprise",
  "interval": "monthly" | "yearly"
}
```

### Get Subscription Details
```
GET /api/stripe/subscription
```

### Cancel Subscription
```
POST /api/stripe/cancel-subscription
```

### Get Profile (with subscription info)
```
GET /api/stripe/profile
```

### Webhook Handler
```
POST /api/stripe/webhook
```

## 🎨 Frontend Components

### CheckoutPage
- `/checkout/:plan/:interval` - Main checkout flow
- Supports both monthly and yearly billing
- 30-day trial messaging
- Secure Stripe Elements integration

### SubscriptionPage
- `/app/manage-subscription` - Subscription management
- Current plan details
- Billing history
- Cancel/upgrade options

### CheckoutForm
- Stripe Elements integration
- Payment method collection
- Trial confirmation
- Error handling

## 🔒 Security Features

- All payment data handled by Stripe (PCI compliant)
- Webhook signature verification
- Secure token storage
- Row-level security in Supabase
- Environment variable protection

## 🚀 Testing

### Test Card Numbers
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

### Trial Testing
- New customers automatically get 30-day trials
- Use test mode to simulate trial expiration
- Webhooks can be tested in Stripe dashboard

## 📊 Database Schema

The following fields are added to the `profiles` table:
- `subscription_status` - Current status (trial, active, canceled, expired)
- `stripe_customer_id` - Stripe customer identifier
- `trial_start_date` - When trial began
- `trial_end_date` - When trial expires
- `subscription_start_date` - When paid subscription started
- `subscription_end_date` - When current billing period ends
- `subscription_plan` - Current plan (premium, enterprise)
- `last_payment_date` - Last successful payment
- `next_payment_date` - Next billing date

## 🎯 Next Steps

1. Set up your Stripe account and get API keys
2. Configure environment variables
3. Create products and prices in Stripe
4. Test the checkout flow
5. Set up webhooks for production
6. Deploy and monitor

The integration is designed to be secure, user-friendly, and scalable. The 30-day free trial helps reduce friction for new customers while the comprehensive subscription management keeps existing customers engaged.
