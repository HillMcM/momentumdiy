const { supabase } = require('./dist/config/supabase');

async function addPhasesColumn() {
  try {
    console.log('Adding phases column to marketing_track_definitions...');
    
    // First, let's check the current schema
    const { data: currentSchema, error: schemaError } = await supabase
      .from('marketing_track_definitions')
      .select('*')
      .limit(1);

    if (schemaError) {
      console.error('Error checking current schema:', schemaError);
      return;
    }

    console.log('Current schema keys:', Object.keys(currentSchema[0] || {}));

    // Check if phases column already exists
    if (currentSchema[0] && 'phases' in currentSchema[0]) {
      console.log('✅ Phases column already exists');
      return;
    }

    // Use raw SQL to add the column
    const { data, error } = await supabase
      .rpc('exec_sql', {
        sql: `ALTER TABLE public.marketing_track_definitions ADD COLUMN IF NOT EXISTS phases JSONB DEFAULT '[]'::jsonb;`
      });

    if (error) {
      console.error('Error adding phases column:', error);
      
      // Alternative approach - try using a direct query
      console.log('Trying alternative approach...');
      const { error: altError } = await supabase
        .from('marketing_track_definitions')
        .select('phases')
        .limit(1);
        
      if (altError && altError.message.includes('column "phases" does not exist')) {
        console.log('Column definitely does not exist. Manual database update needed.');
      } else {
        console.log('Column might already exist or there\'s another issue:', altError);
      }
      
      return;
    }

    console.log('✅ Successfully added phases column');
    console.log('Result:', data);

  } catch (error) {
    console.error('Failed to add phases column:', error);
  }
}

addPhasesColumn();
