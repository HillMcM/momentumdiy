const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'your-service-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyProTipMigration() {
  try {
    console.log('🔄 Applying pro_tip migration to marketing_modules table...');
    
    // Add the pro_tip column
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.marketing_modules 
        ADD COLUMN IF NOT EXISTS pro_tip TEXT;
      `
    });
    
    if (alterError) {
      console.error('❌ Error adding pro_tip column:', alterError);
      return;
    }
    
    console.log('✅ Successfully added pro_tip column');
    
    // Add comment
    const { error: commentError } = await supabase.rpc('exec_sql', {
      sql: `
        COMMENT ON COLUMN public.marketing_modules.pro_tip IS 'Weekly pro tip content for marketing modules';
      `
    });
    
    if (commentError) {
      console.warn('⚠️ Warning: Could not add comment:', commentError.message);
    } else {
      console.log('✅ Successfully added column comment');
    }
    
    // Create index
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_marketing_modules_pro_tip 
        ON public.marketing_modules(pro_tip) 
        WHERE pro_tip IS NOT NULL;
      `
    });
    
    if (indexError) {
      console.warn('⚠️ Warning: Could not create index:', indexError.message);
    } else {
      console.log('✅ Successfully created index');
    }
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run the migration
applyProTipMigration();
