-- Add onboarding-specific fields to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_data JSONB DEFAULT '{}'::JSONB,
  ADD COLUMN IF NOT EXISTS business_type TEXT,
  ADD COLUMN IF NOT EXISTS business_stage TEXT,
  ADD COLUMN IF NOT EXISTS primary_goal TEXT,
  ADD COLUMN IF NOT EXISTS biggest_challenge TEXT[] DEFAULT '{}'::TEXT[],
  ADD COLUMN IF NOT EXISTS current_activities TEXT[] DEFAULT '{}'::TEXT[],
  ADD COLUMN IF NOT EXISTS time_available TEXT,
  ADD COLUMN IF NOT EXISTS quiz_answers JSONB DEFAULT '{}'::JSONB,
  ADD COLUMN IF NOT EXISTS recommended_track TEXT,
  ADD COLUMN IF NOT EXISTS selected_track TEXT,
  ADD COLUMN IF NOT EXISTS notification_preferences TEXT[] DEFAULT '{}'::TEXT[],
  ADD COLUMN IF NOT EXISTS check_in_day TEXT DEFAULT 'monday';

-- Keep updated_at fresh
UPDATE public.profiles SET updated_at = NOW();
