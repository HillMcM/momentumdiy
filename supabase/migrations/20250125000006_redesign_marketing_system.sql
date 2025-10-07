-- Marketing Track System Redesign
-- Clean separation between templates (admin) and user progress

-- Create user track progress table
CREATE TABLE IF NOT EXISTS public.user_track_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  track_definition_id UUID REFERENCES public.marketing_track_definitions(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  current_week INTEGER DEFAULT 1,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, track_definition_id) -- One active track per user
);

-- Create user module progress table
CREATE TABLE IF NOT EXISTS public.user_module_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.marketing_modules(id) ON DELETE CASCADE,
  is_unlocked BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module_id) -- One progress record per user per module
);

-- Create user task progress table
CREATE TABLE IF NOT EXISTS public.user_task_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.marketing_tasks(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, task_id) -- One progress record per user per task
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_track_progress_user_id ON public.user_track_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_track_progress_track_id ON public.user_track_progress(track_definition_id);
CREATE INDEX IF NOT EXISTS idx_user_track_progress_active ON public.user_track_progress(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_user_module_progress_user_id ON public.user_module_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_module_progress_module_id ON public.user_module_progress(module_id);

CREATE INDEX IF NOT EXISTS idx_user_task_progress_user_id ON public.user_task_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_task_progress_task_id ON public.user_task_progress(task_id);

-- Add updated_at triggers (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_user_track_progress_updated_at' 
        AND event_object_table = 'user_track_progress'
    ) THEN
        CREATE TRIGGER update_user_track_progress_updated_at BEFORE UPDATE ON public.user_track_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_user_module_progress_updated_at' 
        AND event_object_table = 'user_module_progress'
    ) THEN
        CREATE TRIGGER update_user_module_progress_updated_at BEFORE UPDATE ON public.user_module_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_user_task_progress_updated_at' 
        AND event_object_table = 'user_task_progress'
    ) THEN
        CREATE TRIGGER update_user_task_progress_updated_at BEFORE UPDATE ON public.user_task_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Add RLS policies
ALTER TABLE public.user_track_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_task_progress ENABLE ROW LEVEL SECURITY;

-- Users can only access their own progress (drop existing policies first)
DROP POLICY IF EXISTS "Users can access own track progress" ON public.user_track_progress;
DROP POLICY IF EXISTS "Users can access own module progress" ON public.user_module_progress;
DROP POLICY IF EXISTS "Users can access own task progress" ON public.user_task_progress;

CREATE POLICY "Users can access own track progress" ON public.user_track_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own module progress" ON public.user_module_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own task progress" ON public.user_task_progress FOR ALL USING (auth.uid() = user_id);

-- Comments for documentation
COMMENT ON TABLE public.user_track_progress IS 'Tracks individual user progress through marketing tracks';
COMMENT ON TABLE public.user_module_progress IS 'Tracks individual user progress through weekly modules';
COMMENT ON TABLE public.user_task_progress IS 'Tracks individual user completion of marketing tasks';
