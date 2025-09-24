-- Add phases column to marketing_goals table
ALTER TABLE public.marketing_goals 
ADD COLUMN IF NOT EXISTS phases JSONB DEFAULT '[]'::jsonb;

-- Add comment to explain the phases column
COMMENT ON COLUMN public.marketing_goals.phases IS 'JSON array storing phase information (title, description, startWeek, endWeek, color)';

-- Set default 4-phase structure for existing goals
UPDATE public.marketing_goals 
SET phases = '[
  {"id": "1", "title": "Phase 1: Spark Traffic", "description": "Get people in the door immediately", "startWeek": 1, "endWeek": 3, "color": "#EF8E81"},
  {"id": "2", "title": "Phase 2: Build Momentum", "description": "Create consistent engagement", "startWeek": 4, "endWeek": 6, "color": "#D4AF37"},
  {"id": "3", "title": "Phase 3: Scale Up", "description": "Expand your reach and impact", "startWeek": 7, "endWeek": 9, "color": "#8B5CF6"},
  {"id": "4", "title": "Phase 4: Optimize", "description": "Refine and perfect your strategy", "startWeek": 10, "endWeek": 12, "color": "#10B981"}
]'::jsonb
WHERE phases IS NULL OR phases = '[]'::jsonb;
