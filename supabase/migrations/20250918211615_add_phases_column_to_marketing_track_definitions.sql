-- Add phases column to marketing_track_definitions table for storing phase configuration
ALTER TABLE public.marketing_track_definitions 
ADD COLUMN IF NOT EXISTS phases JSONB DEFAULT '[]'::jsonb;

-- Add comment to explain the column
COMMENT ON COLUMN public.marketing_track_definitions.phases IS 'JSON array storing phase information (title, description, startWeek, endWeek, color)';

-- Set default 4-phase structure for existing tracks
UPDATE public.marketing_track_definitions 
SET phases = '[
  {"id": "1", "title": "Foundation Phase", "description": "Building your strategy foundation", "startWeek": 1, "endWeek": 3, "color": "#EF8E81"},
  {"id": "2", "title": "Implementation Phase", "description": "Putting strategies into action", "startWeek": 4, "endWeek": 6, "color": "#D4AF37"},
  {"id": "3", "title": "Growth Phase", "description": "Scaling and expanding your reach", "startWeek": 7, "endWeek": 9, "color": "#8B5CF6"},
  {"id": "4", "title": "Optimization Phase", "description": "Refining and optimizing performance", "startWeek": 10, "endWeek": 12, "color": "#10B981"}
]'::jsonb
WHERE phases IS NULL OR phases = '[]'::jsonb;
