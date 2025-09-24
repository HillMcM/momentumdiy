-- Add track_definition_id to marketing_goals table
ALTER TABLE public.marketing_goals 
ADD COLUMN IF NOT EXISTS track_definition_id UUID REFERENCES public.marketing_track_definitions(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_marketing_goals_track_definition_id ON public.marketing_goals(track_definition_id);
