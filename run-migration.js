const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://mnjczhlwcnwipdbajwkj.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uamN6aGx3Y253aXBkYmFqd2tqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MjA3MDMyNzQ4MH0.2Cr-bU8k-xo5GVH3gLWg60mHuQMEtCORpqT2e-Jv3Ow';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  try {
    console.log('🚀 Running migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase/migrations/20250925000000_add_user_id_to_marketing_goals.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration SQL:', migrationSql.substring(0, 200) + '...');
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: migrationSql 
    });
    
    if (error) {
      console.error('❌ Migration failed:', error);
    } else {
      console.log('✅ Migration completed successfully!', data);
    }
    
  } catch (err) {
    console.error('❌ Error running migration:', err);
  }
}

runMigration();
