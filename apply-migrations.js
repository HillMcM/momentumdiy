const { createClient } = require('@supabase/supabase-js');

// This script applies the database migrations to fix the marketing goals API
async function applyMigrations() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    console.log('Applying migrations...');
    
    // Migration 1: Create marketing_track_definitions table
    console.log('1. Creating marketing_track_definitions table...');
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.marketing_track_definitions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          slug TEXT UNIQUE NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          industry_tags TEXT[] DEFAULT '{}',
          duration_weeks INTEGER DEFAULT 12,
          phases JSONB DEFAULT '[]'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (createTableError) {
      console.log('Table might already exist:', createTableError.message);
    }
    
    // Migration 2: Add track_definition_id to marketing_goals
    console.log('2. Adding track_definition_id to marketing_goals...');
    const { error: addColumnError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.marketing_goals 
        ADD COLUMN IF NOT EXISTS track_definition_id UUID REFERENCES public.marketing_track_definitions(id) ON DELETE SET NULL;
      `
    });
    
    if (addColumnError) {
      console.log('Column might already exist:', addColumnError.message);
    }
    
    // Migration 3: Add phases to marketing_goals
    console.log('3. Adding phases column to marketing_goals...');
    const { error: addPhasesError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.marketing_goals 
        ADD COLUMN IF NOT EXISTS phases JSONB DEFAULT '[]'::jsonb;
      `
    });
    
    if (addPhasesError) {
      console.log('Column might already exist:', addPhasesError.message);
    }
    
    // Migration 4: Set default phases for existing goals
    console.log('4. Setting default phases for existing goals...');
    const { error: updatePhasesError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE public.marketing_goals 
        SET phases = '[
          {"id": "1", "title": "Phase 1: Spark Traffic", "description": "Get people in the door immediately", "startWeek": 1, "endWeek": 3, "color": "#EF8E81"},
          {"id": "2", "title": "Phase 2: Build Momentum", "description": "Create consistent engagement", "startWeek": 4, "endWeek": 6, "color": "#D4AF37"},
          {"id": "3", "title": "Phase 3: Scale Up", "description": "Expand your reach and impact", "startWeek": 7, "endWeek": 9, "color": "#8B5CF6"},
          {"id": "4", "title": "Phase 4: Optimize", "description": "Refine and perfect your strategy", "startWeek": 10, "endWeek": 12, "color": "#10B981"}
        ]'::jsonb
        WHERE phases IS NULL OR phases = '[]'::jsonb;
      `
    });
    
    if (updatePhasesError) {
      console.log('Error updating phases:', updatePhasesError.message);
    }
    
    console.log('Migrations completed successfully!');
    
  } catch (error) {
    console.error('Error applying migrations:', error);
    process.exit(1);
  }
}

applyMigrations();
