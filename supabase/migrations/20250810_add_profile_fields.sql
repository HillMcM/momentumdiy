-- Extend profiles with richer business/marketing personalization fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS business_name TEXT,
  ADD COLUMN IF NOT EXISTS business_category TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS business_size TEXT,
  ADD COLUMN IF NOT EXISTS primary_marketing_goal TEXT,
  ADD COLUMN IF NOT EXISTS marketing_channels TEXT[] DEFAULT '{}'::TEXT[],
  ADD COLUMN IF NOT EXISTS skill_levels JSONB DEFAULT '{}'::JSONB,
  ADD COLUMN IF NOT EXISTS industry_keywords TEXT[] DEFAULT '{}'::TEXT[],
  ADD COLUMN IF NOT EXISTS brand_primary_color TEXT,
  ADD COLUMN IF NOT EXISTS brand_secondary_color TEXT,
  ADD COLUMN IF NOT EXISTS brand_font_heading TEXT,
  ADD COLUMN IF NOT EXISTS brand_font_body TEXT,
  ADD COLUMN IF NOT EXISTS favorite_templates TEXT[] DEFAULT '{}'::TEXT[],
  ADD COLUMN IF NOT EXISTS favorite_tools TEXT[] DEFAULT '{}'::TEXT[],
  ADD COLUMN IF NOT EXISTS ai_pinned JSONB DEFAULT '[]'::JSONB;

-- Keep updated_at fresh
UPDATE public.profiles SET updated_at = NOW();

