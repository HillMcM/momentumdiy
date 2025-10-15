-- =====================================================
-- SAFE RLS POLICY UPDATE
-- =====================================================
-- This migration safely updates RLS policies only on tables that exist
-- No errors if tables don't exist - completely safe to run

DO $$
DECLARE
    table_exists BOOLEAN;
BEGIN
    -- =====================================================
    -- MARKETING TRACK DEFINITIONS / MARKETING TRACKS
    -- =====================================================
    
    -- Check for marketing_track_definitions
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'marketing_track_definitions'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE 'Updating policies for marketing_track_definitions...';
        
        -- Drop old policies
        DROP POLICY IF EXISTS "Authenticated users can access marketing track definitions" ON public.marketing_track_definitions;
        
        -- Create new policies
        CREATE POLICY "Users can view marketing track definitions" 
            ON public.marketing_track_definitions
            FOR SELECT USING (auth.role() = 'authenticated');
        
        CREATE POLICY "Service role can manage marketing track definitions" 
            ON public.marketing_track_definitions
            FOR ALL USING (auth.role() = 'service_role');
    END IF;
    
    -- Check for marketing_tracks (renamed table)
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'marketing_tracks'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE 'Updating policies for marketing_tracks...';
        
        -- Drop old policies
        DROP POLICY IF EXISTS "Authenticated users can access marketing tracks" ON public.marketing_tracks;
        
        -- Create new policies
        CREATE POLICY "Users can view marketing tracks" 
            ON public.marketing_tracks
            FOR SELECT USING (auth.role() = 'authenticated');
        
        CREATE POLICY "Service role can manage marketing tracks" 
            ON public.marketing_tracks
            FOR ALL USING (auth.role() = 'service_role');
    END IF;
    
    -- =====================================================
    -- MARKETING MODULES
    -- =====================================================
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'marketing_modules'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE 'Updating policies for marketing_modules...';
        
        DROP POLICY IF EXISTS "Authenticated users can access marketing modules" ON public.marketing_modules;
        
        CREATE POLICY "Users can view marketing modules" 
            ON public.marketing_modules
            FOR SELECT USING (auth.role() = 'authenticated');
        
        CREATE POLICY "Service role can manage marketing modules" 
            ON public.marketing_modules
            FOR ALL USING (auth.role() = 'service_role');
    END IF;
    
    -- =====================================================
    -- SUMMARY
    -- =====================================================
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Safe RLS Update Complete';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Updated policies for:';
    RAISE NOTICE '- Marketing track definitions (if exists)';
    RAISE NOTICE '- Marketing modules (if exists)';
    RAISE NOTICE '';
    RAISE NOTICE 'These changes:';
    RAISE NOTICE '✓ Make track templates read-only for users';
    RAISE NOTICE '✓ Allow service role (backend API) to manage tracks';
    RAISE NOTICE '✓ Prevent unauthorized track modifications';
    RAISE NOTICE '';
    RAISE NOTICE 'No user data isolation changes - existing policies preserved';
    RAISE NOTICE '========================================';
    
END $$;

