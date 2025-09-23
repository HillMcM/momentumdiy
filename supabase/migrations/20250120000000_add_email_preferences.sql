-- Add email preferences to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_preferences JSONB DEFAULT '{
  "weekly_progress": true,
  "task_reminders": true,
  "marketing_emails": true,
  "trial_emails": true
}'::jsonb;

-- Add comment to explain the email preferences structure
COMMENT ON COLUMN public.profiles.email_preferences IS 'User email notification preferences. Structure: {"weekly_progress": boolean, "task_reminders": boolean, "marketing_emails": boolean, "trial_emails": boolean}. trial_emails should always be true and cannot be disabled.';

-- Create an index on email_preferences for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_email_preferences ON public.profiles USING gin (email_preferences);
