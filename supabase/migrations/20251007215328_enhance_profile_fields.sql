-- Profile Page Enhancement - Add New Fields
-- Migration to support enhanced profile features with AI capabilities

-- Add new columns to profiles table
DO $$ 
BEGIN
    -- Image storage (Base64 strings)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'brand_logo') THEN
        ALTER TABLE profiles ADD COLUMN brand_logo TEXT;
        RAISE NOTICE 'Added brand_logo column';
    END IF;

    -- Business intelligence fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'business_bio') THEN
        ALTER TABLE profiles ADD COLUMN business_bio TEXT;
        RAISE NOTICE 'Added business_bio column';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'operating_hours') THEN
        ALTER TABLE profiles ADD COLUMN operating_hours JSONB DEFAULT '{}'::jsonb;
        RAISE NOTICE 'Added operating_hours column';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'competitors') THEN
        ALTER TABLE profiles ADD COLUMN competitors TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added competitors column';
    END IF;

    -- Progress tracking fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'weekly_notes') THEN
        ALTER TABLE profiles ADD COLUMN weekly_notes JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Added weekly_notes column';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'momentum_score') THEN
        ALTER TABLE profiles ADD COLUMN momentum_score INTEGER DEFAULT 0;
        RAISE NOTICE 'Added momentum_score column';
    END IF;

    -- Favorites metadata
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'pinned_items') THEN
        ALTER TABLE profiles ADD COLUMN pinned_items TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added pinned_items column';
    END IF;

    -- Branding automation toggle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'apply_branding_to_templates') THEN
        ALTER TABLE profiles ADD COLUMN apply_branding_to_templates BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added apply_branding_to_templates column';
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN profiles.brand_logo IS 'Base64 encoded brand logo image for profile header and branding';
COMMENT ON COLUMN profiles.business_bio IS '2-3 sentence business summary for AI personalization';
COMMENT ON COLUMN profiles.operating_hours IS 'JSONB storing business hours by day for scheduling features';
COMMENT ON COLUMN profiles.competitors IS 'Array of competitor names for competitive analysis';
COMMENT ON COLUMN profiles.weekly_notes IS 'JSONB array of weekly reflection notes with { week, date, note }';
COMMENT ON COLUMN profiles.momentum_score IS 'Weighted score (0-100) based on task completion, speed, and consistency';
COMMENT ON COLUMN profiles.pinned_items IS 'Array of pinned template/tool IDs for quick access';
COMMENT ON COLUMN profiles.apply_branding_to_templates IS 'Auto-apply brand colors/fonts to generated content';

