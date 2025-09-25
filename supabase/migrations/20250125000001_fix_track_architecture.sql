-- Fix marketing track architecture for scalability
-- Instead of duplicating marketing_goals per user, store track progress in profiles

-- Add track progress fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN active_track_id UUID REFERENCES public.marketing_track_definitions(id) ON DELETE SET NULL,
ADD COLUMN track_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN track_current_week INTEGER DEFAULT 1,
ADD COLUMN track_progress INTEGER DEFAULT 0 CHECK (track_progress >= 0 AND track_progress <= 100),
ADD COLUMN track_week_start_dates JSONB DEFAULT '[]'::jsonb,
ADD COLUMN track_last_week_advancement TIMESTAMP WITH TIME ZONE,
ADD COLUMN track_completion_date TIMESTAMP WITH TIME ZONE;

-- Create index for efficient track queries
CREATE INDEX IF NOT EXISTS idx_profiles_active_track ON public.profiles(active_track_id);

-- Drop the user-specific policies we created earlier (must be done before dropping column)
DROP POLICY IF EXISTS "Users can view own marketing goals" ON public.marketing_goals;
DROP POLICY IF EXISTS "Users can update own marketing goals" ON public.marketing_goals;
DROP POLICY IF EXISTS "Users can insert own marketing goals" ON public.marketing_goals;
DROP POLICY IF EXISTS "Users can delete own marketing goals" ON public.marketing_goals;
DROP POLICY IF EXISTS "Admins can manage all marketing goals" ON public.marketing_goals;

-- Revert the marketing_goals table changes since we're using a different approach
-- Remove user_id from marketing_goals (these should be global track definitions)
ALTER TABLE public.marketing_goals DROP COLUMN IF EXISTS user_id;

-- Restore original marketing_goals policies (global track management)
CREATE POLICY "Authenticated users can view marketing goals" ON public.marketing_goals 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage marketing goals" ON public.marketing_goals 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND email IN ('info@hillaryedenmcmullen.com')
    )
  );

-- Add policies for profile track progress (user-specific)
CREATE POLICY "Users can view own track progress" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own track progress" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Add comments for clarity
COMMENT ON COLUMN public.profiles.active_track_id IS 'Currently active marketing track definition ID';
COMMENT ON COLUMN public.profiles.track_start_date IS 'When the user started their current track';
COMMENT ON COLUMN public.profiles.track_current_week IS 'Current week number in the track (1-based)';
COMMENT ON COLUMN public.profiles.track_progress IS 'Overall track completion percentage (0-100)';
COMMENT ON COLUMN public.profiles.track_week_start_dates IS 'Array of timestamps when each week was started';
COMMENT ON COLUMN public.profiles.track_last_week_advancement IS 'When the user last advanced to the next week';
COMMENT ON COLUMN public.profiles.track_completion_date IS 'When the user completed the track';
