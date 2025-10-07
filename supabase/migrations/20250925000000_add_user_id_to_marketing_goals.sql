-- Add user_id column to marketing_goals table to link goals to specific users (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'marketing_goals' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.marketing_goals 
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add active_goal_id to profiles table to track which marketing goal is currently active (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'active_goal_id'
    ) THEN
        ALTER TABLE public.profiles
        ADD COLUMN active_goal_id UUID REFERENCES public.marketing_goals(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_marketing_goals_user_id ON public.marketing_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_active_goal_id ON public.profiles(active_goal_id);

-- Update RLS policy to be more restrictive - users can only access their own goals
DROP POLICY IF EXISTS "Authenticated users can access marketing goals" ON public.marketing_goals;
DROP POLICY IF EXISTS "Users can access own marketing goals" ON public.marketing_goals;

CREATE POLICY "Users can access own marketing goals" ON public.marketing_goals FOR ALL USING (auth.uid() = user_id);

-- Comments for documentation
COMMENT ON COLUMN public.marketing_goals.user_id IS 'Links marketing goals to specific users for proper data isolation';
COMMENT ON COLUMN public.profiles.active_goal_id IS 'References the currently active marketing goal for the user';
