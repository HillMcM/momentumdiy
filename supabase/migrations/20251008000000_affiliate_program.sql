-- Affiliate/Referral Program Schema
-- Complete implementation of affiliate tracking, commissions, and payouts

-- =====================================================
-- TABLE 1: AFFILIATE PROGRAMS
-- =====================================================
-- Tracks users who have opted into the affiliate program
CREATE TABLE IF NOT EXISTS public.affiliate_programs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    referral_code TEXT UNIQUE NOT NULL,
    stripe_connect_account_id TEXT,
    connect_onboarding_complete BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'suspended')),
    opted_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_referrals INTEGER DEFAULT 0,
    total_earnings NUMERIC(10, 2) DEFAULT 0,
    total_paid_out NUMERIC(10, 2) DEFAULT 0,
    pending_balance NUMERIC(10, 2) DEFAULT 0,
    last_payout_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliate_programs_user_id ON public.affiliate_programs(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_programs_referral_code ON public.affiliate_programs(referral_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_programs_status ON public.affiliate_programs(status);

-- Enable RLS
ALTER TABLE public.affiliate_programs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for affiliate_programs
DROP POLICY IF EXISTS "Users can read own affiliate program" ON public.affiliate_programs;
CREATE POLICY "Users can read own affiliate program" ON public.affiliate_programs
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own affiliate program" ON public.affiliate_programs;
CREATE POLICY "Users can update own affiliate program" ON public.affiliate_programs
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own affiliate program" ON public.affiliate_programs;
CREATE POLICY "Users can insert own affiliate program" ON public.affiliate_programs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- TABLE 2: REFERRALS
-- =====================================================
-- Tracks each user who was referred by an affiliate
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    affiliate_id UUID REFERENCES public.affiliate_programs(id) ON DELETE CASCADE NOT NULL,
    referred_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    referral_code_used TEXT NOT NULL,
    signed_up_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    first_payment_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'expired')),
    stripe_subscription_id TEXT,
    commission_start_date TIMESTAMP WITH TIME ZONE,
    commission_end_date TIMESTAMP WITH TIME ZONE,
    total_commission_earned NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_referrals_affiliate_id ON public.referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON public.referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_stripe_subscription_id ON public.referrals(stripe_subscription_id);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referrals
DROP POLICY IF EXISTS "Affiliates can read own referrals" ON public.referrals;
CREATE POLICY "Affiliates can read own referrals" ON public.referrals
    FOR SELECT USING (
        affiliate_id IN (
            SELECT id FROM public.affiliate_programs WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "System can manage referrals" ON public.referrals;
CREATE POLICY "System can manage referrals" ON public.referrals
    FOR ALL USING (true);

-- =====================================================
-- TABLE 3: AFFILIATE EARNINGS
-- =====================================================
-- Transaction log for each commission payment
CREATE TABLE IF NOT EXISTS public.affiliate_earnings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    affiliate_id UUID REFERENCES public.affiliate_programs(id) ON DELETE CASCADE NOT NULL,
    referral_id UUID REFERENCES public.referrals(id) ON DELETE CASCADE NOT NULL,
    stripe_invoice_id TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    subscription_amount NUMERIC(10, 2) NOT NULL,
    commission_month INTEGER NOT NULL CHECK (commission_month >= 1 AND commission_month <= 12),
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    payout_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_affiliate_id ON public.affiliate_earnings(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_referral_id ON public.affiliate_earnings(referral_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_payout_id ON public.affiliate_earnings(payout_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_earnings_stripe_invoice_id ON public.affiliate_earnings(stripe_invoice_id);

-- Enable RLS
ALTER TABLE public.affiliate_earnings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for affiliate_earnings
DROP POLICY IF EXISTS "Affiliates can read own earnings" ON public.affiliate_earnings;
CREATE POLICY "Affiliates can read own earnings" ON public.affiliate_earnings
    FOR SELECT USING (
        affiliate_id IN (
            SELECT id FROM public.affiliate_programs WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "System can manage earnings" ON public.affiliate_earnings;
CREATE POLICY "System can manage earnings" ON public.affiliate_earnings
    FOR ALL USING (true);

-- =====================================================
-- TABLE 4: AFFILIATE PAYOUTS
-- =====================================================
-- Payout history and status tracking
CREATE TABLE IF NOT EXISTS public.affiliate_payouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    affiliate_id UUID REFERENCES public.affiliate_programs(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    stripe_transfer_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key for affiliate_earnings.payout_id
ALTER TABLE public.affiliate_earnings 
    ADD CONSTRAINT affiliate_earnings_payout_id_fkey 
    FOREIGN KEY (payout_id) REFERENCES public.affiliate_payouts(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_affiliate_id ON public.affiliate_payouts(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_status ON public.affiliate_payouts(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_stripe_transfer_id ON public.affiliate_payouts(stripe_transfer_id);

-- Enable RLS
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for affiliate_payouts
DROP POLICY IF EXISTS "Affiliates can read own payouts" ON public.affiliate_payouts;
CREATE POLICY "Affiliates can read own payouts" ON public.affiliate_payouts
    FOR SELECT USING (
        affiliate_id IN (
            SELECT id FROM public.affiliate_programs WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "System can manage payouts" ON public.affiliate_payouts;
CREATE POLICY "System can manage payouts" ON public.affiliate_payouts
    FOR ALL USING (true);

-- =====================================================
-- TABLE 5: REFERRAL CLICKS
-- =====================================================
-- Track referral link clicks for analytics
CREATE TABLE IF NOT EXISTS public.referral_clicks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referral_code TEXT NOT NULL,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT,
    converted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_referral_clicks_referral_code ON public.referral_clicks(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_clicks_clicked_at ON public.referral_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_referral_clicks_converted ON public.referral_clicks(converted);

-- No RLS on referral_clicks - public tracking table

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_affiliate_programs_updated_at ON public.affiliate_programs;
CREATE TRIGGER update_affiliate_programs_updated_at
    BEFORE UPDATE ON public.affiliate_programs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_referrals_updated_at ON public.referrals;
CREATE TRIGGER update_referrals_updated_at
    BEFORE UPDATE ON public.referrals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_affiliate_payouts_updated_at ON public.affiliate_payouts;
CREATE TRIGGER update_affiliate_payouts_updated_at
    BEFORE UPDATE ON public.affiliate_payouts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.affiliate_programs IS 'Users who have opted into the affiliate program';
COMMENT ON TABLE public.referrals IS 'Users who were referred by affiliates';
COMMENT ON TABLE public.affiliate_earnings IS 'Transaction log of commission payments';
COMMENT ON TABLE public.affiliate_payouts IS 'Payout history and status tracking';
COMMENT ON TABLE public.referral_clicks IS 'Analytics tracking for referral link clicks';

COMMENT ON COLUMN public.affiliate_programs.referral_code IS 'Unique referral code for this affiliate';
COMMENT ON COLUMN public.affiliate_programs.stripe_connect_account_id IS 'Stripe Connect account ID for payouts';
COMMENT ON COLUMN public.referrals.status IS 'pending: signed up but not paid, converted: made first payment, expired: 90 days passed without conversion';
COMMENT ON COLUMN public.affiliate_earnings.commission_month IS 'Which month of 12-month commission period (1-12)';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

DO $$ 
BEGIN
    RAISE NOTICE 'Affiliate program schema created successfully!';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '  - affiliate_programs: User opt-ins and stats';
    RAISE NOTICE '  - referrals: Referred user tracking';
    RAISE NOTICE '  - affiliate_earnings: Commission transaction log';
    RAISE NOTICE '  - affiliate_payouts: Payout history';
    RAISE NOTICE '  - referral_clicks: Click tracking analytics';
END $$;
