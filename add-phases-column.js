const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mnjczhlwcnwipdbajwkj.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uamN6aGx3Y253aXBkYmFqd2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxMzI0NTMsImV4cCI6MjA0OTcwODQ1M30.qBcqDHKOK1ZOkFUJJgTXqNMJTJhPjKJb7_kJLHJ9ddc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addPhasesColumn() {
  try {
    console.log('Adding phases column to marketing_track_definitions...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.marketing_track_definitions 
        ADD COLUMN IF NOT EXISTS phases JSONB DEFAULT '[]'::jsonb;
        
        COMMENT ON COLUMN public.marketing_track_definitions.phases IS 'JSON array storing phase information (title, description, startWeek, endWeek, color)';
      `
    });

    if (error) {
      console.error('Error adding phases column:', error);
      return;
    }

    console.log('✅ Successfully added phases column');
    console.log('Result:', data);

  } catch (error) {
    console.error('Failed to add phases column:', error);
  }
}

addPhasesColumn();
