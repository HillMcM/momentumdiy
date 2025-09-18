-- Add phases column to marketing_track_definitions table
ALTER TABLE public.marketing_track_definitions 
ADD COLUMN IF NOT EXISTS phases JSONB DEFAULT '[]'::jsonb;

-- Add comment to explain the column
COMMENT ON COLUMN public.marketing_track_definitions.phases IS 'JSON array storing phase information (title, description, startWeek, endWeek, color)';
