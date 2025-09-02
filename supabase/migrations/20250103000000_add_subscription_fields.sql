-- Add subscription fields to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'premium',
  ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS next_payment_date TIMESTAMP WITH TIME ZONE;

-- Create index for Stripe customer ID for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);

-- Create index for subscription status for filtering
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);

-- Update existing profiles to have trial status with 30-day trial
UPDATE public.profiles
SET
  subscription_status = 'trial',
  trial_start_date = NOW(),
  trial_end_date = NOW() + INTERVAL '30 days'
WHERE subscription_status IS NULL OR subscription_status = '';

-- Keep updated_at fresh
UPDATE public.profiles SET updated_at = NOW();
