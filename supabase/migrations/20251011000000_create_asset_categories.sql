-- Create asset categories table if it doesn't exist
-- This provides predefined categories for organizing assets

CREATE TABLE IF NOT EXISTS public.asset_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO public.asset_categories (id, name, icon, color) VALUES
  ('logos', 'Logos', '🎨', '#EF8E81'),
  ('photos', 'Photos', '📸', '#4ECDC4'),
  ('documents', 'Documents', '📄', '#45B7D1'),
  ('videos', 'Videos', '🎥', '#96CEB4'),
  ('templates', 'Templates', '📋', '#FFEAA7'),
  ('other', 'Other', '📁', '#95A5A6')
ON CONFLICT (id) DO NOTHING;

-- Add comment
COMMENT ON TABLE public.asset_categories IS 'Predefined categories for organizing assets in the Asset Library';

-- Enable RLS
ALTER TABLE public.asset_categories ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read categories (they're static)
CREATE POLICY "Anyone can view asset categories"
  ON public.asset_categories
  FOR SELECT
  TO public
  USING (true);

