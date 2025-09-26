const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mnjczhlwcnwipdbajwkj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uamN6aGx3Y253aXBkYmFqd2tqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc1MTQ4MCwiZXhwIjoyMDcwMzI3NDgwfQ.DBFNaa-35vS5iKdW79yRDFIbXqTzxZ0mfnABdt5vqrc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 Checking marketing_goals...');
  const { data: goals, error: goalsError } = await supabase
    .from('marketing_goals')
    .select('*');
  
  if (goalsError) {
    console.error('❌ Error fetching goals:', goalsError);
  } else {
    console.log('📊 Marketing goals:', goals?.length || 0);
    goals?.forEach(goal => {
      console.log(`  - ${goal.id}: ${goal.title} (user_id: ${goal.user_id})`);
    });
  }

  console.log('\n🔍 Checking marketing_modules...');
  const { data: modules, error: modulesError } = await supabase
    .from('marketing_modules')
    .select('*');
  
  if (modulesError) {
    console.error('❌ Error fetching modules:', modulesError);
  } else {
    console.log('📊 Marketing modules:', modules?.length || 0);
    modules?.forEach(module => {
      console.log(`  - ${module.id}: ${module.title} (goal_id: ${module.goal_id})`);
    });
  }

  console.log('\n🔍 Checking profiles...');
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, active_track_id, active_goal_id');
  
  if (profilesError) {
    console.error('❌ Error fetching profiles:', profilesError);
  } else {
    console.log('📊 Profiles:', profiles?.length || 0);
    profiles?.forEach(profile => {
      console.log(`  - ${profile.id}: active_track_id=${profile.active_track_id}, active_goal_id=${profile.active_goal_id}`);
    });
  }
}

checkDatabase().catch(console.error);
