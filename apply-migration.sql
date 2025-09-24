-- Apply pro_tip migration to marketing_modules table
-- Run this in your Supabase SQL Editor

-- Add pro_tip column to marketing_modules table
ALTER TABLE public.marketing_modules 
ADD COLUMN IF NOT EXISTS pro_tip TEXT;

-- Add comment to explain the pro_tip column
COMMENT ON COLUMN public.marketing_modules.pro_tip IS 'Weekly pro tip content for marketing modules';

-- Create index for better performance on pro_tip searches
CREATE INDEX IF NOT EXISTS idx_marketing_modules_pro_tip ON public.marketing_modules(pro_tip) WHERE pro_tip IS NOT NULL;
