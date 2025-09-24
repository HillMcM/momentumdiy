-- Create marketing_track_definitions table
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

-- Add comment to explain the phases column
COMMENT ON COLUMN public.marketing_track_definitions.phases IS 'JSON array storing phase information (title, description, startWeek, endWeek, color)';

-- Enable RLS
ALTER TABLE public.marketing_track_definitions ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Authenticated users can access marketing track definitions" ON public.marketing_track_definitions FOR ALL USING (auth.role() = 'authenticated');

-- Create trigger for updated_at column
CREATE TRIGGER update_marketing_track_definitions_updated_at 
  BEFORE UPDATE ON public.marketing_track_definitions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_marketing_track_definitions_slug ON public.marketing_track_definitions(slug);
CREATE INDEX IF NOT EXISTS idx_marketing_track_definitions_industry_tags ON public.marketing_track_definitions USING GIN(industry_tags);
