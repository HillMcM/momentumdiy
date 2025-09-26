-- Add user_id column to marketing_goals table to link goals to specific users
ALTER TABLE public.marketing_goals 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add active_goal_id to profiles table to track which marketing goal is currently active
ALTER TABLE public.profiles
ADD COLUMN active_goal_id UUID REFERENCES public.marketing_goals(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_marketing_goals_user_id ON public.marketing_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_active_goal_id ON public.profiles(active_goal_id);

-- Update RLS policy to be more restrictive - users can only access their own goals
DROP POLICY "Authenticated users can access marketing goals" ON public.marketing_goals;
CREATE POLICY "Users can access own marketing goals" ON public.marketing_goals FOR ALL USING (auth.uid() = user_id);

-- Comments for documentation
COMMENT ON COLUMN public.marketing_goals.user_id IS 'Links marketing goals to specific users for proper data isolation';
COMMENT ON COLUMN public.profiles.active_goal_id IS 'References the currently active marketing goal for the user';
