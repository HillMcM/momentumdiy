-- Add published status to marketing track definitions
-- This migration adds a published field to control which tracks are available for selection

-- Add published column to marketing_track_definitions
ALTER TABLE public.marketing_track_definitions 
ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false;

-- Add comment for clarity
COMMENT ON COLUMN public.marketing_track_definitions.published IS 'Whether this track definition is published and available for user selection';

-- Create index for faster filtering by published status
CREATE INDEX IF NOT EXISTS idx_marketing_track_definitions_published 
ON public.marketing_track_definitions(published);

-- Update existing track definitions to be unpublished by default
-- This ensures only explicitly published tracks are shown to users
UPDATE public.marketing_track_definitions 
SET published = false 
WHERE published IS NULL;
