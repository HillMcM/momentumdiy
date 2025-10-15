-- =====================================================
-- IMPROVE ROW LEVEL SECURITY POLICIES (CORRECTED)
-- =====================================================
-- This migration strengthens RLS policies where possible
-- Note: Some tables (projects, tasks, calendar_events, assets) don't have user_id columns
-- These will need a future migration to add user_id columns for proper data isolation

-- =====================================================
-- 1. TABLES WITHOUT USER_ID - KEEP CURRENT POLICIES
-- =====================================================
-- Projects, tasks, calendar_events, and assets tables don't have user_id columns
-- We'll leave their current policies in place for now
-- TODO: Future migration should add user_id columns to these tables

-- =====================================================
-- 2. MARKETING GOALS - User-specific with admin override
-- =====================================================

-- Drop the old policy with hardcoded admin emails
DROP POLICY IF EXISTS "Admins can manage marketing goals" ON public.marketing_goals;
DROP POLICY IF EXISTS "Authenticated users can view marketing goals" ON public.marketing_goals;
DROP POLICY IF EXISTS "Authenticated users can access marketing goals" ON public.marketing_goals;

-- Users can view their own goals or goals without a user_id (global templates)
DO $$
BEGIN
  -- Only apply if user_id column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marketing_goals' AND column_name = 'user_id'
  ) THEN
    CREATE POLICY "Users can view own or global marketing goals" ON public.marketing_goals
      FOR SELECT USING (
        auth.uid() = user_id OR user_id IS NULL
      );

    CREATE POLICY "Users can insert own marketing goals" ON public.marketing_goals
      FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

    CREATE POLICY "Users can update own marketing goals" ON public.marketing_goals
      FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete own marketing goals" ON public.marketing_goals
      FOR DELETE USING (auth.uid() = user_id);
  ELSE
    -- Fallback: Keep current policy
    CREATE POLICY "Authenticated users can view marketing goals" ON public.marketing_goals
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- =====================================================
-- 3. MARKETING TRACKS - Read for all, admin manages
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can access marketing track definitions" ON public.marketing_track_definitions;
DROP POLICY IF EXISTS "Authenticated users can access marketing tracks" ON public.marketing_tracks;

-- Check if table is named marketing_tracks or marketing_track_definitions
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'marketing_tracks') THEN
    -- All authenticated users can view track definitions (templates)
    CREATE POLICY "Users can view marketing tracks" ON public.marketing_tracks
      FOR SELECT USING (auth.role() = 'authenticated');

    -- Track modifications via service role only
    CREATE POLICY "Service role can manage marketing tracks" ON public.marketing_tracks
      FOR ALL USING (auth.role() = 'service_role');
      
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'marketing_track_definitions') THEN
    -- All authenticated users can view track definitions (templates)
    CREATE POLICY "Users can view marketing track definitions" ON public.marketing_track_definitions
      FOR SELECT USING (auth.role() = 'authenticated');

    -- Track modifications via service role only
    CREATE POLICY "Service role can manage marketing track definitions" ON public.marketing_track_definitions
      FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- =====================================================
-- 4. MARKETING MODULES - Read for all
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can access marketing modules" ON public.marketing_modules;

CREATE POLICY "Users can view marketing modules" ON public.marketing_modules
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage marketing modules" ON public.marketing_modules
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 5. MARKETING TASKS - User-specific IF user_id exists
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can access marketing tasks" ON public.marketing_tasks;

-- Check if marketing_tasks has user_id column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marketing_tasks' AND column_name = 'user_id'
  ) THEN
    -- User-specific policies
    CREATE POLICY "Users can view own marketing tasks" ON public.marketing_tasks
      FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own marketing tasks" ON public.marketing_tasks
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own marketing tasks" ON public.marketing_tasks
      FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete own marketing tasks" ON public.marketing_tasks
      FOR DELETE USING (auth.uid() = user_id);
  ELSE
    -- Fallback: Allow all authenticated users (current behavior)
    CREATE POLICY "Authenticated users can access marketing tasks" ON public.marketing_tasks
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- =====================================================
-- 6. BRANDING KITS - User-specific IF user_id exists
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can access branding kits" ON public.branding_kits;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'branding_kits' AND column_name = 'user_id'
  ) THEN
    CREATE POLICY "Users can view own branding kits" ON public.branding_kits
      FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own branding kits" ON public.branding_kits
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own branding kits" ON public.branding_kits
      FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete own branding kits" ON public.branding_kits
      FOR DELETE USING (auth.uid() = user_id);
  ELSE
    -- Fallback: Allow all authenticated users
    CREATE POLICY "Authenticated users can access branding kits" ON public.branding_kits
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- =====================================================
-- 7. BRANDING KIT ASSETS - Via branding kit relationship
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can access branding kit assets" ON public.branding_kit_assets;

-- These need to follow branding_kits policies
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'branding_kits' AND column_name = 'user_id'
  ) THEN
    -- User-specific via junction table
    CREATE POLICY "Users can view own branding kit assets" ON public.branding_kit_assets
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.branding_kits
          WHERE branding_kits.id = branding_kit_assets.kit_id
          AND branding_kits.user_id = auth.uid()
        )
      );

    CREATE POLICY "Users can manage own branding kit assets" ON public.branding_kit_assets
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.branding_kits
          WHERE branding_kits.id = branding_kit_assets.kit_id
          AND branding_kits.user_id = auth.uid()
        )
      );
  ELSE
    -- Fallback: Allow all authenticated users
    CREATE POLICY "Authenticated users can access branding kit assets" ON public.branding_kit_assets
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- =====================================================
-- 8. NEW TABLES - Add RLS if they exist
-- =====================================================

-- Social Strategy Hub tables
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'social_strategy_tasks') THEN
    ALTER TABLE public.social_strategy_tasks ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can manage own social strategy tasks" ON public.social_strategy_tasks;
    
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'social_strategy_tasks' AND column_name = 'user_id'
    ) THEN
      CREATE POLICY "Users can view own social strategy tasks" ON public.social_strategy_tasks
        FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY "Users can manage own social strategy tasks" ON public.social_strategy_tasks
        FOR ALL USING (auth.uid() = user_id);
    END IF;
  END IF;
END $$;

-- AI Usage Tracking
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'ai_usage_tracking') THEN
    ALTER TABLE public.ai_usage_tracking ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view own AI usage" ON public.ai_usage_tracking;
    
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'ai_usage_tracking' AND column_name = 'user_id'
    ) THEN
      CREATE POLICY "Users can view own AI usage" ON public.ai_usage_tracking
        FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY "Service role can manage AI usage" ON public.ai_usage_tracking
        FOR ALL USING (auth.role() = 'service_role');
    END IF;
  END IF;
END $$;

-- Affiliate Program tables
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'affiliate_referrals') THEN
    ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view own referrals" ON public.affiliate_referrals;
    
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'affiliate_referrals' AND column_name = 'referrer_id'
    ) THEN
      CREATE POLICY "Users can view own referrals" ON public.affiliate_referrals
        FOR SELECT USING (auth.uid() = referrer_id);
      CREATE POLICY "Service role can manage referrals" ON public.affiliate_referrals
        FOR ALL USING (auth.role() = 'service_role');
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'affiliate_payouts') THEN
    ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view own payouts" ON public.affiliate_payouts;
    
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'affiliate_payouts' AND column_name = 'affiliate_id'
    ) THEN
      CREATE POLICY "Users can view own payouts" ON public.affiliate_payouts
        FOR SELECT USING (auth.uid() = affiliate_id);
      CREATE POLICY "Service role can manage payouts" ON public.affiliate_payouts
        FOR ALL USING (auth.role() = 'service_role');
    END IF;
  END IF;
END $$;

-- =====================================================
-- 9. SUMMARY & RECOMMENDATIONS
-- =====================================================

COMMENT ON TABLE public.projects IS 
  'TODO: Add user_id column for proper RLS data isolation';

COMMENT ON TABLE public.tasks IS 
  'TODO: Add user_id column for proper RLS data isolation';

COMMENT ON TABLE public.calendar_events IS 
  'TODO: Add user_id column for proper RLS data isolation';

COMMENT ON TABLE public.assets IS 
  'TODO: Add user_id column for proper RLS data isolation';

-- Mark this migration as applied
DO $$
BEGIN
  RAISE NOTICE 'RLS policies updated where possible.';
  RAISE NOTICE 'Note: projects, tasks, calendar_events, and assets tables need user_id columns added in future migration for proper data isolation.';
END $$;

