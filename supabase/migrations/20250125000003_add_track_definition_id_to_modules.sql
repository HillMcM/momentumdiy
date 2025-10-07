-- Add track_definition_id column to marketing_modules table
-- This allows modules to be directly linked to track definitions for admin management

-- Add the track_definition_id column
ALTER TABLE public.marketing_modules 
ADD COLUMN track_definition_id UUID REFERENCES public.marketing_track_definitions(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_marketing_modules_track_definition_id ON public.marketing_modules(track_definition_id);

-- Add constraint to ensure modules have either goal_id OR track_definition_id (but not both)
-- This allows for backward compatibility while transitioning to the new architecture
ALTER TABLE public.marketing_modules 
ADD CONSTRAINT check_module_reference 
CHECK (
  (goal_id IS NOT NULL AND track_definition_id IS NULL) OR 
  (goal_id IS NULL AND track_definition_id IS NOT NULL)
);

-- Add comment for documentation
COMMENT ON COLUMN public.marketing_modules.track_definition_id IS 'Links modules directly to track definitions for admin management and template creation';
