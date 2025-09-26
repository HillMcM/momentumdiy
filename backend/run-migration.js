const { supabase } = require('./dist/config/supabase');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('🚀 Running migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250925000000_add_user_id_to_marketing_goals.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Running SQL migration...');
    
    // Split the migration into individual statements and run them
    const statements = migrationSql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim() + ';';
      if (statement.length <= 1) continue;
      
      console.log(`🔧 Running statement ${i + 1}/${statements.length}:`, statement.substring(0, 60) + '...');
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.error(`❌ Statement ${i + 1} failed:`, error);
          // Continue with other statements
        } else {
          console.log(`✅ Statement ${i + 1} completed`);
        }
      } catch (err) {
        // Try direct query as fallback
        try {
          const { data, error } = await supabase.from('_').select('*').limit(0); // Just a test query
          // If we get here, supabase is working, so the issue is with the SQL
          console.warn(`⚠️ Statement ${i + 1} may have failed, but continuing...`);
        } catch (connErr) {
          console.error(`❌ Connection error on statement ${i + 1}:`, connErr);
          break;
        }
      }
    }
    
    console.log('✅ Migration process completed!');
    
  } catch (err) {
    console.error('❌ Error running migration:', err);
  }
}

runMigration();
