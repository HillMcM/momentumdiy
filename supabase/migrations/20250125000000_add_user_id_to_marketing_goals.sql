-- Add user_id field to marketing_goals table to make tracks individualized per user
-- This allows each user to have their own track progress and timing

-- Add user_id column to marketing_goals table
ALTER TABLE public.marketing_goals 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for better performance on user_id queries
CREATE INDEX IF NOT EXISTS idx_marketing_goals_user_id ON public.marketing_goals(user_id);

-- Create index for user_id + is_active for efficient active goal lookups
CREATE INDEX IF NOT EXISTS idx_marketing_goals_user_active ON public.marketing_goals(user_id, is_active);

-- Update RLS policies to include user_id
DROP POLICY IF EXISTS "Users can view marketing goals" ON public.marketing_goals;
DROP POLICY IF EXISTS "Users can update marketing goals" ON public.marketing_goals;
DROP POLICY IF EXISTS "Users can insert marketing goals" ON public.marketing_goals;
DROP POLICY IF EXISTS "Users can delete marketing goals" ON public.marketing_goals;

-- Create new user-specific policies
CREATE POLICY "Users can view own marketing goals" ON public.marketing_goals 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own marketing goals" ON public.marketing_goals 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own marketing goals" ON public.marketing_goals 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own marketing goals" ON public.marketing_goals 
  FOR DELETE USING (auth.uid() = user_id);

-- Add admin policy for managing all goals (for admin panel)
CREATE POLICY "Admins can manage all marketing goals" ON public.marketing_goals 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND email IN ('info@hillaryedenmcmullen.com')
    )
  );

-- Note: Existing marketing_goals records will have NULL user_id
-- These should be handled by the application logic or cleaned up manually
