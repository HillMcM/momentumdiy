-- Affiliate Partner Applications Schema
-- Allows professionals in the industry to apply to become affiliate partners

-- =====================================================
-- TABLE: AFFILIATE PARTNER APPLICATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.affiliate_partner_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    company_name TEXT,
    industry TEXT,
    website TEXT,
    reason_for_applying TEXT NOT NULL,
    expected_referrals_per_month INTEGER,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliate_partner_applications_email ON public.affiliate_partner_applications(email);
CREATE INDEX IF NOT EXISTS idx_affiliate_partner_applications_status ON public.affiliate_partner_applications(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_partner_applications_created_at ON public.affiliate_partner_applications(created_at);

-- Enable RLS
ALTER TABLE public.affiliate_partner_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for affiliate_partner_applications
-- Public can insert (submit applications)
DROP POLICY IF EXISTS "Public can submit applications" ON public.affiliate_partner_applications;
CREATE POLICY "Public can submit applications" ON public.affiliate_partner_applications
    FOR INSERT WITH CHECK (true);

-- Users can read their own applications
DROP POLICY IF EXISTS "Users can read own applications" ON public.affiliate_partner_applications;
CREATE POLICY "Users can read own applications" ON public.affiliate_partner_applications
    FOR SELECT USING (
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- Admins can read all applications
DROP POLICY IF EXISTS "Admins can read all applications" ON public.affiliate_partner_applications;
CREATE POLICY "Admins can read all applications" ON public.affiliate_partner_applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND email = 'info@hillaryedenmcmullen.com'
        )
    );

-- Admins can update applications
DROP POLICY IF EXISTS "Admins can update applications" ON public.affiliate_partner_applications;
CREATE POLICY "Admins can update applications" ON public.affiliate_partner_applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND email = 'info@hillaryedenmcmullen.com'
        )
    );

-- =====================================================
-- UPDATE AFFILIATE_PROGRAMS TABLE
-- =====================================================
-- Add partner_type and application_id to affiliate_programs
ALTER TABLE public.affiliate_programs 
    ADD COLUMN IF NOT EXISTS partner_type TEXT DEFAULT 'user' CHECK (partner_type IN ('user', 'partner')),
    ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES public.affiliate_partner_applications(id);

-- Create index for partner_type
CREATE INDEX IF NOT EXISTS idx_affiliate_programs_partner_type ON public.affiliate_programs(partner_type);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_affiliate_partner_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_affiliate_partner_applications_updated_at ON public.affiliate_partner_applications;
CREATE TRIGGER update_affiliate_partner_applications_updated_at
    BEFORE UPDATE ON public.affiliate_partner_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_affiliate_partner_applications_updated_at();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.affiliate_partner_applications IS 'Applications from professionals who want to become affiliate partners';
COMMENT ON COLUMN public.affiliate_partner_applications.status IS 'pending: awaiting review, approved: application approved, rejected: application rejected';
COMMENT ON COLUMN public.affiliate_programs.partner_type IS 'user: regular app user affiliate, partner: professional industry affiliate';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

DO $$ 
BEGIN
    RAISE NOTICE 'Affiliate partner applications schema created successfully!';
    RAISE NOTICE 'Table created: affiliate_partner_applications';
    RAISE NOTICE 'Updated table: affiliate_programs (added partner_type and application_id)';
END $$;

