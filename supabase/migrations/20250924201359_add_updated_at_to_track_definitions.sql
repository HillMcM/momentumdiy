-- Add updated_at column to marketing_track_definitions table
ALTER TABLE public.marketing_track_definitions 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing records to have updated_at set to created_at
UPDATE public.marketing_track_definitions 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- Create trigger for updated_at column (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_marketing_track_definitions_updated_at'
    ) THEN
        CREATE TRIGGER update_marketing_track_definitions_updated_at 
        BEFORE UPDATE ON public.marketing_track_definitions 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
