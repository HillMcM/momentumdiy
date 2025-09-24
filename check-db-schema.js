// Script to check the current database schema
const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual production credentials
const supabaseUrl = 'https://mnjczhlwcnwipdbajwkj.supabase.co';
const supabaseKey = 'YOUR_SERVICE_ROLE_KEY_HERE'; // Replace with actual key

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  try {
    console.log('🔍 Checking database schema...');
    
    // Check if the table exists and get its structure
    const { data, error } = await supabase
      .from('marketing_track_definitions')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error accessing table:', error);
      return;
    }
    
    console.log('✅ Table accessible');
    console.log('📊 Sample data:', data);
    
    // Check specific track
    const { data: trackData, error: trackError } = await supabase
      .from('marketing_track_definitions')
      .select('id, title, phases, duration_weeks')
      .eq('id', '39e8bef9-f453-49a2-b33e-dfe0a82df0bd')
      .single();
    
    if (trackError) {
      console.error('❌ Error fetching track:', trackError);
    } else {
      console.log('📊 Track data:', trackData);
    }
    
  } catch (err) {
    console.error('❌ Connection error:', err);
  }
}

checkSchema();
