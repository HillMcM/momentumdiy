-- =====================================================
-- IMPROVE ROW LEVEL SECURITY POLICIES
-- =====================================================
-- This migration strengthens RLS policies to ensure proper data isolation
-- and removes hardcoded admin emails in favor of application-level checks

-- =====================================================
-- 1. FIX USER-SPECIFIC DATA ACCESS
-- =====================================================

-- Projects: Should be user-specific
DROP POLICY IF EXISTS "Authenticated users can access projects" ON public.projects;

CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);

-- Tasks: Should be user-specific
DROP POLICY IF EXISTS "Authenticated users can access tasks" ON public.tasks;

CREATE POLICY "Users can view own tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON public.tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Calendar Events: Should be user-specific
DROP POLICY IF EXISTS "Authenticated users can access calendar events" ON public.calendar_events;

CREATE POLICY "Users can view own calendar events" ON public.calendar_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calendar events" ON public.calendar_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar events" ON public.calendar_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar events" ON public.calendar_events
  FOR DELETE USING (auth.uid() = user_id);

-- Assets: Should be user-specific
DROP POLICY IF EXISTS "Authenticated users can access assets" ON public.assets;

CREATE POLICY "Users can view own assets" ON public.assets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assets" ON public.assets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assets" ON public.assets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets" ON public.assets
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 2. MARKETING GOALS - User-specific with admin override
-- =====================================================

-- Drop the old policy with hardcoded admin emails
DROP POLICY IF EXISTS "Admins can manage marketing goals" ON public.marketing_goals;
DROP POLICY IF EXISTS "Authenticated users can view marketing goals" ON public.marketing_goals;
DROP POLICY IF EXISTS "Authenticated users can access marketing goals" ON public.marketing_goals;

-- Users can view their own goals or goals without a user_id (global templates)
CREATE POLICY "Users can view own or global marketing goals" ON public.marketing_goals
  FOR SELECT USING (
    auth.uid() = user_id OR user_id IS NULL
  );

-- Users can insert their own goals
CREATE POLICY "Users can insert own marketing goals" ON public.marketing_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can update their own goals
CREATE POLICY "Users can update own marketing goals" ON public.marketing_goals
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own goals
CREATE POLICY "Users can delete own marketing goals" ON public.marketing_goals
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 3. MARKETING TRACKS - Read for all, admin manages
-- =====================================================

-- Marketing tracks (definitions) should be readable by all but only modified by admins
-- Note: Admin checks are handled at the application layer via admin.ts config

DROP POLICY IF EXISTS "Authenticated users can access marketing track definitions" ON public.marketing_track_definitions;
DROP POLICY IF EXISTS "Authenticated users can access marketing track definitions" ON public.marketing_tracks;

-- All authenticated users can view track definitions (templates)
CREATE POLICY "Users can view marketing tracks" ON public.marketing_tracks
  FOR SELECT USING (auth.role() = 'authenticated');

-- Track modifications should be done through backend API with admin checks
-- These policies prevent direct database modification by non-admins
CREATE POLICY "Service role can manage marketing tracks" ON public.marketing_tracks
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 4. MARKETING MODULES - Read for all
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can access marketing modules" ON public.marketing_modules;

CREATE POLICY "Users can view marketing modules" ON public.marketing_modules
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage marketing modules" ON public.marketing_modules
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 5. MARKETING TASKS - User-specific
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can access marketing tasks" ON public.marketing_tasks;

-- Users can only see and manage their own marketing tasks
CREATE POLICY "Users can view own marketing tasks" ON public.marketing_tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own marketing tasks" ON public.marketing_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own marketing tasks" ON public.marketing_tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own marketing tasks" ON public.marketing_tasks
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 6. BRANDING KITS - User-specific
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can access branding kits" ON public.branding_kits;

CREATE POLICY "Users can view own branding kits" ON public.branding_kits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own branding kits" ON public.branding_kits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own branding kits" ON public.branding_kits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own branding kits" ON public.branding_kits
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 7. BRANDING KIT ASSETS - User-specific via kit
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can access branding kit assets" ON public.branding_kit_assets;

CREATE POLICY "Users can view own branding kit assets" ON public.branding_kit_assets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.branding_kits
      WHERE branding_kits.id = branding_kit_assets.branding_kit_id
      AND branding_kits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own branding kit assets" ON public.branding_kit_assets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.branding_kits
      WHERE branding_kits.id = branding_kit_assets.branding_kit_id
      AND branding_kits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own branding kit assets" ON public.branding_kit_assets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.branding_kits
      WHERE branding_kits.id = branding_kit_assets.branding_kit_id
      AND branding_kits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own branding kit assets" ON public.branding_kit_assets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.branding_kits
      WHERE branding_kits.id = branding_kit_assets.branding_kit_id
      AND branding_kits.user_id = auth.uid()
    )
  );

-- =====================================================
-- 8. CHECK FOR NEW TABLES AND ENABLE RLS
-- =====================================================

-- Social Strategy Hub tables
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'social_strategy_tasks') THEN
    ALTER TABLE public.social_strategy_tasks ENABLE ROW LEVEL SECURITY;
    
    -- Drop any existing policies
    DROP POLICY IF EXISTS "Users can manage own social strategy tasks" ON public.social_strategy_tasks;
    
    -- Create user-specific policies
    CREATE POLICY "Users can view own social strategy tasks" ON public.social_strategy_tasks
      FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own social strategy tasks" ON public.social_strategy_tasks
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update own social strategy tasks" ON public.social_strategy_tasks
      FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete own social strategy tasks" ON public.social_strategy_tasks
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- AI Usage Tracking
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'ai_usage_tracking') THEN
    ALTER TABLE public.ai_usage_tracking ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view own AI usage" ON public.ai_usage_tracking;
    
    CREATE POLICY "Users can view own AI usage" ON public.ai_usage_tracking
      FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Service role can manage AI usage" ON public.ai_usage_tracking
      FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- Affiliate Program tables
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'affiliate_referrals') THEN
    ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view own referrals" ON public.affiliate_referrals;
    
    CREATE POLICY "Users can view own referrals" ON public.affiliate_referrals
      FOR SELECT USING (auth.uid() = referrer_id);
    CREATE POLICY "Service role can manage referrals" ON public.affiliate_referrals
      FOR ALL USING (auth.role() = 'service_role');
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'affiliate_payouts') THEN
    ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view own payouts" ON public.affiliate_payouts;
    
    CREATE POLICY "Users can view own payouts" ON public.affiliate_payouts
      FOR SELECT USING (auth.uid() = affiliate_id);
    CREATE POLICY "Service role can manage payouts" ON public.affiliate_payouts
      FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- =====================================================
-- 9. ADD HELPFUL COMMENTS
-- =====================================================

COMMENT ON POLICY "Users can view own projects" ON public.projects IS 
  'Users can only view their own projects for data isolation';

COMMENT ON POLICY "Users can view own marketing tasks" ON public.marketing_tasks IS 
  'User-specific marketing task access for privacy and data isolation';

COMMENT ON POLICY "Service role can manage marketing tracks" ON public.marketing_tracks IS 
  'Track definitions managed via backend API with admin checks in application layer';


