-- Fix marketing track architecture for scalability
-- Instead of duplicating marketing_goals per user, store track progress in profiles

-- Add track progress fields to profiles table (only if they don't exist)
DO $$ 
BEGIN
    -- Add active_track_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'active_track_id') THEN
        ALTER TABLE public.profiles ADD COLUMN active_track_id UUID REFERENCES public.marketing_track_definitions(id) ON DELETE SET NULL;
    END IF;
    
    -- Add track_start_date column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'track_start_date') THEN
        ALTER TABLE public.profiles ADD COLUMN track_start_date TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add track_current_week column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'track_current_week') THEN
        ALTER TABLE public.profiles ADD COLUMN track_current_week INTEGER DEFAULT 1;
    END IF;
    
    -- Add track_progress column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'track_progress') THEN
        ALTER TABLE public.profiles ADD COLUMN track_progress INTEGER DEFAULT 0 CHECK (track_progress >= 0 AND track_progress <= 100);
    END IF;
    
    -- Add track_week_start_dates column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'track_week_start_dates') THEN
        ALTER TABLE public.profiles ADD COLUMN track_week_start_dates JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    -- Add track_last_week_advancement column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'track_last_week_advancement') THEN
        ALTER TABLE public.profiles ADD COLUMN track_last_week_advancement TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add track_completion_date column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'track_completion_date') THEN
        ALTER TABLE public.profiles ADD COLUMN track_completion_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

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
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketing_goals' AND column_name = 'user_id') THEN
        ALTER TABLE public.marketing_goals DROP COLUMN user_id;
    END IF;
END $$;

-- Restore original marketing_goals policies (global track management)
DO $$
BEGIN
    -- Create policy for authenticated users to view marketing goals
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'marketing_goals' 
        AND policyname = 'Authenticated users can view marketing goals'
    ) THEN
        CREATE POLICY "Authenticated users can view marketing goals" ON public.marketing_goals 
        FOR SELECT USING (auth.role() = 'authenticated');
    END IF;

    -- Create policy for admins to manage marketing goals
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'marketing_goals' 
        AND policyname = 'Admins can manage marketing goals'
    ) THEN
        CREATE POLICY "Admins can manage marketing goals" ON public.marketing_goals 
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() 
                AND email IN ('info@hillaryedenmcmullen.com')
            )
        );
    END IF;
END $$;

-- Add policies for profile track progress (user-specific)
DO $$
BEGIN
    -- Create policy for users to view own track progress
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can view own track progress'
    ) THEN
        CREATE POLICY "Users can view own track progress" ON public.profiles 
        FOR SELECT USING (auth.uid() = id);
    END IF;

    -- Create policy for users to update own track progress
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can update own track progress'
    ) THEN
        CREATE POLICY "Users can update own track progress" ON public.profiles 
        FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

-- Add comments for clarity
COMMENT ON COLUMN public.profiles.active_track_id IS 'Currently active marketing track definition ID';
COMMENT ON COLUMN public.profiles.track_start_date IS 'When the user started their current track';
COMMENT ON COLUMN public.profiles.track_current_week IS 'Current week number in the track (1-based)';
COMMENT ON COLUMN public.profiles.track_progress IS 'Overall track completion percentage (0-100)';
COMMENT ON COLUMN public.profiles.track_week_start_dates IS 'Array of timestamps when each week was started';
COMMENT ON COLUMN public.profiles.track_last_week_advancement IS 'When the user last advanced to the next week';
COMMENT ON COLUMN public.profiles.track_completion_date IS 'When the user completed the track';
