-- Complete Database Schema Refactor
-- Based on user requirements: clean, maintainable, scalable architecture

-- =====================================================
-- PHASE 1: RENAME marketing_track_definitions TO marketing_tracks
-- =====================================================

-- Rename the table
ALTER TABLE public.marketing_track_definitions RENAME TO marketing_tracks;

-- Update all foreign key references with safety checks
DO $$ 
BEGIN
    -- Update marketing_modules foreign key
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'marketing_modules_track_def_fk') THEN
        ALTER TABLE public.marketing_modules DROP CONSTRAINT marketing_modules_track_def_fk;
        RAISE NOTICE 'Dropped old marketing_modules_track_def_fk constraint';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'marketing_modules_track_id_fkey') THEN
        ALTER TABLE public.marketing_modules ADD CONSTRAINT marketing_modules_track_id_fkey 
            FOREIGN KEY (track_definition_id) REFERENCES public.marketing_tracks(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added marketing_modules_track_id_fkey constraint';
    ELSE
        RAISE NOTICE 'marketing_modules_track_id_fkey constraint already exists, skipping';
    END IF;
    
    -- Update profiles foreign key
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'profiles_active_track_id_fkey') THEN
        ALTER TABLE public.profiles DROP CONSTRAINT profiles_active_track_id_fkey;
        RAISE NOTICE 'Dropped old profiles_active_track_id_fkey constraint';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'profiles_active_track_id_fkey') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_active_track_id_fkey 
            FOREIGN KEY (active_track_id) REFERENCES public.marketing_tracks(id);
        RAISE NOTICE 'Added profiles_active_track_id_fkey constraint';
    ELSE
        RAISE NOTICE 'profiles_active_track_id_fkey constraint already exists, skipping';
    END IF;
END $$;

-- Rename the column in marketing_modules for consistency
ALTER TABLE public.marketing_modules RENAME COLUMN track_definition_id TO track_id;

-- =====================================================
-- PHASE 2: MOVE TRACK PROGRESS TO PROFILES TABLE
-- =====================================================

-- Add missing track progress columns to profiles if they don't exist
DO $$ 
BEGIN
    -- Add track progress columns to profiles
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'active_track_id') THEN
        ALTER TABLE public.profiles ADD COLUMN active_track_id UUID REFERENCES public.marketing_tracks(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'track_start_date') THEN
        ALTER TABLE public.profiles ADD COLUMN track_start_date TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'track_current_week') THEN
        ALTER TABLE public.profiles ADD COLUMN track_current_week INTEGER DEFAULT 1;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'track_progress') THEN
        ALTER TABLE public.profiles ADD COLUMN track_progress INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'track_week_start_dates') THEN
        ALTER TABLE public.profiles ADD COLUMN track_week_start_dates JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'track_last_week_advancement') THEN
        ALTER TABLE public.profiles ADD COLUMN track_last_week_advancement TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'track_completion_date') THEN
        ALTER TABLE public.profiles ADD COLUMN track_completion_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Migrate data from user_track_progress to profiles (only if table exists and has data)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_track_progress') THEN
        UPDATE public.profiles 
        SET 
            active_track_id = utp.track_definition_id,
            track_start_date = utp.start_date,
            track_current_week = utp.current_week,
            track_progress = utp.progress,
            track_week_start_dates = '[]'::jsonb, -- Initialize empty array, will be populated by application logic
            track_last_week_advancement = NULL, -- Not available in user_track_progress
            track_completion_date = CASE WHEN utp.progress >= 100 THEN utp.updated_at ELSE NULL END
        FROM public.user_track_progress utp
        WHERE profiles.id = utp.user_id 
          AND utp.is_active = true
          AND profiles.active_track_id IS NULL;
          
        RAISE NOTICE 'Migrated % records from user_track_progress to profiles', (SELECT COUNT(*) FROM public.user_track_progress WHERE is_active = true);
    ELSE
        RAISE NOTICE 'user_track_progress table does not exist, skipping migration';
    END IF;
END $$;

-- =====================================================
-- PHASE 3: CLEAN UP PROFILES TABLE - REMOVE JSONB, ADD PROPER COLUMNS
-- =====================================================

-- Add proper onboarding columns to profiles
DO $$ 
BEGIN
    -- Business information columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'industry') THEN
        ALTER TABLE public.profiles ADD COLUMN industry TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'start_date') THEN
        ALTER TABLE public.profiles ADD COLUMN start_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'check_in_day') THEN
        ALTER TABLE public.profiles ADD COLUMN check_in_day TEXT DEFAULT 'monday';
    END IF;
    
    -- Marketing preferences
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'marketing_channels') THEN
        ALTER TABLE public.profiles ADD COLUMN marketing_channels TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'skill_levels') THEN
        ALTER TABLE public.profiles ADD COLUMN skill_levels JSONB DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'industry_keywords') THEN
        ALTER TABLE public.profiles ADD COLUMN industry_keywords TEXT[] DEFAULT '{}';
    END IF;
    
    -- Brand information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'brand_primary_color') THEN
        ALTER TABLE public.profiles ADD COLUMN brand_primary_color TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'brand_secondary_color') THEN
        ALTER TABLE public.profiles ADD COLUMN brand_secondary_color TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'brand_font_heading') THEN
        ALTER TABLE public.profiles ADD COLUMN brand_font_heading TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'brand_font_body') THEN
        ALTER TABLE public.profiles ADD COLUMN brand_font_body TEXT;
    END IF;
    
    -- Preferences
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'favorite_templates') THEN
        ALTER TABLE public.profiles ADD COLUMN favorite_templates TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'favorite_tools') THEN
        ALTER TABLE public.profiles ADD COLUMN favorite_tools TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'ai_pinned') THEN
        ALTER TABLE public.profiles ADD COLUMN ai_pinned JSONB DEFAULT '[]';
    END IF;
END $$;

-- Migrate onboarding_data JSONB to individual columns
UPDATE public.profiles 
SET 
    industry = (onboarding_data->>'industry'),
    start_date = CASE 
        WHEN onboarding_data->>'startDate' IS NOT NULL 
        THEN (onboarding_data->>'startDate')::DATE 
        ELSE NULL 
    END,
    check_in_day = COALESCE(onboarding_data->>'checkInDay', 'monday'),
    primary_marketing_goal = COALESCE(onboarding_data->>'primaryGoal', primary_marketing_goal),
    business_type = COALESCE(onboarding_data->>'businessType', business_type),
    business_stage = COALESCE(onboarding_data->>'businessStage', business_stage),
    time_available = COALESCE(onboarding_data->>'timeAvailable', time_available),
    quiz_answers = CASE 
        WHEN onboarding_data->'quizAnswers' IS NOT NULL 
        THEN onboarding_data->'quizAnswers' 
        ELSE quiz_answers 
    END,
    selected_track = COALESCE(onboarding_data->>'selectedTrack', selected_track),
    biggest_challenge = CASE 
        WHEN onboarding_data->'biggestChallenge' IS NOT NULL 
        THEN ARRAY(SELECT jsonb_array_elements_text(onboarding_data->'biggestChallenge'))
        ELSE biggest_challenge 
    END,
    current_activities = CASE 
        WHEN onboarding_data->'currentActivities' IS NOT NULL 
        THEN ARRAY(SELECT jsonb_array_elements_text(onboarding_data->'currentActivities'))
        ELSE current_activities 
    END,
    notification_preferences = CASE 
        WHEN onboarding_data->'notificationPreferences' IS NOT NULL 
        THEN ARRAY(SELECT jsonb_array_elements_text(onboarding_data->'notificationPreferences'))
        ELSE notification_preferences 
    END
WHERE onboarding_data IS NOT NULL AND onboarding_data != '{}'::jsonb;

-- =====================================================
-- PHASE 4: REMOVE REDUNDANT TABLES
-- =====================================================

-- Drop marketing_goals table (functionality moved to profiles)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'marketing_goals') THEN
        DROP TABLE public.marketing_goals CASCADE;
        RAISE NOTICE 'Dropped marketing_goals table';
    ELSE
        RAISE NOTICE 'marketing_goals table does not exist, skipping';
    END IF;
END $$;

-- Drop user progress tables (functionality moved to profiles and simple task completion)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_track_progress') THEN
        DROP TABLE public.user_track_progress CASCADE;
        RAISE NOTICE 'Dropped user_track_progress table';
    ELSE
        RAISE NOTICE 'user_track_progress table does not exist, skipping';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_module_progress') THEN
        DROP TABLE public.user_module_progress CASCADE;
        RAISE NOTICE 'Dropped user_module_progress table';
    ELSE
        RAISE NOTICE 'user_module_progress table does not exist, skipping';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_task_progress') THEN
        DROP TABLE public.user_task_progress CASCADE;
        RAISE NOTICE 'Dropped user_task_progress table';
    ELSE
        RAISE NOTICE 'user_task_progress table does not exist, skipping';
    END IF;
END $$;

-- =====================================================
-- PHASE 5: CREATE SIMPLE TASK COMPLETION TRACKING
-- =====================================================

-- Create simple task completion table
CREATE TABLE IF NOT EXISTS public.user_task_completions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.marketing_tasks(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, task_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_task_completions_user_id ON public.user_task_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_task_completions_task_id ON public.user_task_completions(task_id);

-- Enable RLS
ALTER TABLE public.user_task_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policy
DROP POLICY IF EXISTS "Users can access own task completions" ON public.user_task_completions;
CREATE POLICY "Users can access own task completions" ON public.user_task_completions 
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- PHASE 6: CLEAN UP PROFILES TABLE - REMOVE UNUSED COLUMNS
-- =====================================================

-- Remove columns that are no longer needed
ALTER TABLE public.profiles DROP COLUMN IF EXISTS onboarding_data;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS active_goal_id;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS recommended_track;

-- Remove any other redundant columns that might exist
ALTER TABLE public.profiles DROP COLUMN IF EXISTS module_definition_id;

-- =====================================================
-- PHASE 7: UPDATE CONSTRAINTS AND INDEXES
-- =====================================================

-- Add proper constraints to profiles (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'profiles_track_progress_check') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_track_progress_check 
            CHECK (track_progress >= 0 AND track_progress <= 100);
        RAISE NOTICE 'Added track_progress check constraint';
    ELSE
        RAISE NOTICE 'track_progress check constraint already exists, skipping';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'profiles_track_week_check') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_track_week_check 
            CHECK (track_current_week >= 1);
        RAISE NOTICE 'Added track_current_week check constraint';
    ELSE
        RAISE NOTICE 'track_current_week check constraint already exists, skipping';
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_active_track ON public.profiles(active_track_id) WHERE active_track_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_track_progress ON public.profiles(track_progress);
CREATE INDEX IF NOT EXISTS idx_profiles_business_type ON public.profiles(business_type);

-- =====================================================
-- PHASE 8: UPDATE COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.marketing_tracks IS 'Marketing track templates - the base content for all tracks';
COMMENT ON TABLE public.marketing_modules IS 'Weekly modules within marketing tracks';
COMMENT ON TABLE public.marketing_tasks IS 'Individual tasks within marketing modules';
COMMENT ON TABLE public.profiles IS 'User profiles with integrated track progress and business information';
COMMENT ON TABLE public.user_task_completions IS 'Simple tracking of which tasks users have completed';

COMMENT ON COLUMN public.profiles.active_track_id IS 'Currently active marketing track for this user';
COMMENT ON COLUMN public.profiles.track_current_week IS 'Current week in the active track (1-based)';
COMMENT ON COLUMN public.profiles.track_progress IS 'Overall progress through the active track (0-100)';
COMMENT ON COLUMN public.profiles.track_start_date IS 'When the user started their current track';
COMMENT ON COLUMN public.profiles.track_week_start_dates IS 'Array of timestamps when each week was started';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log completion
DO $$ 
BEGIN
    RAISE NOTICE 'Schema refactor completed successfully!';
    RAISE NOTICE 'Changes made:';
    RAISE NOTICE '  - Renamed marketing_track_definitions to marketing_tracks';
    RAISE NOTICE '  - Moved track progress to profiles table';
    RAISE NOTICE '  - Migrated onboarding_data to individual columns';
    RAISE NOTICE '  - Removed marketing_goals table';
    RAISE NOTICE '  - Removed user progress tables';
    RAISE NOTICE '  - Created simple user_task_completions table';
    RAISE NOTICE '  - Cleaned up profiles table structure';
END $$;
