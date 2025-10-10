-- Add action_link field to marketing_tasks table
-- This allows tasks to link to specific features or pages in the app

-- Only add the column if the marketing_tasks table exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'marketing_tasks'
  ) THEN
    -- Add column if it doesn't already exist
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'marketing_tasks' 
      AND column_name = 'action_link'
    ) THEN
      ALTER TABLE public.marketing_tasks
      ADD COLUMN action_link JSONB DEFAULT NULL;
      
      -- Add comment
      COMMENT ON COLUMN public.marketing_tasks.action_link IS 'Optional action link for tasks: {url: string, label: string, tab?: string}';
    END IF;
  END IF;
END $$;

-- Example usage:
-- action_link = '{"url": "/app/social-strategy", "label": "Open Strategy Hub", "tab": "pillars"}'

