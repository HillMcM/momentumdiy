-- Safe migration for marketing track definitions and pro tips
-- This handles existing objects gracefully
-- Run this in your Supabase SQL Editor

-- 1. Create marketing_track_definitions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.marketing_track_definitions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  industry_tags TEXT[] DEFAULT '{}',
  duration_weeks INTEGER DEFAULT 12,
  phases JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add comment to explain the phases column
COMMENT ON COLUMN public.marketing_track_definitions.phases IS 'JSON array storing phase information (title, description, startWeek, endWeek, color)';

-- 3. Enable RLS (safe to run multiple times)
ALTER TABLE public.marketing_track_definitions ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policy if it exists, then create new one
DROP POLICY IF EXISTS "Authenticated users can access marketing track definitions" ON public.marketing_track_definitions;
CREATE POLICY "Authenticated users can access marketing track definitions" ON public.marketing_track_definitions FOR ALL USING (auth.role() = 'authenticated');

-- 5. Create trigger for updated_at column (if the function exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    DROP TRIGGER IF EXISTS update_marketing_track_definitions_updated_at ON public.marketing_track_definitions;
    CREATE TRIGGER update_marketing_track_definitions_updated_at 
      BEFORE UPDATE ON public.marketing_track_definitions 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- 6. Create indexes for better performance (IF NOT EXISTS handles duplicates)
CREATE INDEX IF NOT EXISTS idx_marketing_track_definitions_slug ON public.marketing_track_definitions(slug);
CREATE INDEX IF NOT EXISTS idx_marketing_track_definitions_industry_tags ON public.marketing_track_definitions USING GIN(industry_tags);

-- 7. Add pro_tip column to marketing_modules table
ALTER TABLE public.marketing_modules 
ADD COLUMN IF NOT EXISTS pro_tip TEXT;

-- 8. Add comment to explain the pro_tip column
COMMENT ON COLUMN public.marketing_modules.pro_tip IS 'Weekly pro tip content for marketing modules';

-- 9. Create index for better performance on pro_tip searches
CREATE INDEX IF NOT EXISTS idx_marketing_modules_pro_tip ON public.marketing_modules(pro_tip) WHERE pro_tip IS NOT NULL;

-- 10. Add track_definition_id to marketing_goals if it doesn't exist
ALTER TABLE public.marketing_goals 
ADD COLUMN IF NOT EXISTS track_definition_id UUID REFERENCES public.marketing_track_definitions(id);

-- 11. Add phases column to marketing_goals if it doesn't exist
ALTER TABLE public.marketing_goals 
ADD COLUMN IF NOT EXISTS phases JSONB DEFAULT '[]'::jsonb;

-- 12. Add comment to explain the phases column in marketing_goals
COMMENT ON COLUMN public.marketing_goals.phases IS 'JSON array storing phase information for the active marketing goal';
