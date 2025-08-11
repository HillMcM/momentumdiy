-- Add archived flag to tasks
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- Index to speed up filtering by archived
CREATE INDEX IF NOT EXISTS idx_tasks_is_archived ON public.tasks(is_archived);

