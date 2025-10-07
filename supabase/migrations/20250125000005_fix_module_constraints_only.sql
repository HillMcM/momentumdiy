-- Fix marketing_modules constraints to allow both goal_id and track_definition_id
-- Remove any restrictive constraints that might be causing issues

-- Drop any existing problematic constraints
ALTER TABLE public.marketing_modules 
DROP CONSTRAINT IF EXISTS check_module_reference;

-- Add a flexible constraint that allows both fields to exist (only if it doesn't already exist)
-- This is needed for backward compatibility during the transition
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_module_has_reference' 
        AND table_name = 'marketing_modules'
    ) THEN
        ALTER TABLE public.marketing_modules 
        ADD CONSTRAINT check_module_has_reference 
        CHECK (
          goal_id IS NOT NULL OR track_definition_id IS NOT NULL
        );
    END IF;
END $$;

-- Add comment for documentation
COMMENT ON CONSTRAINT check_module_has_reference ON public.marketing_modules IS 'Ensures modules have either goal_id (live modules) or track_definition_id (template modules)';
