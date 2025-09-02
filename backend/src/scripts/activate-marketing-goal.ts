import { supabase } from '../config/supabase';

// This script activates the marketing goal in Supabase
async function activateMarketingGoal() {
  try {
    console.log('🔄 Activating marketing goal in Supabase...');

    // Find the goal we created
    const { data: goals, error: fetchError } = await supabase
      .from('marketing_goals')
      .select('*')
      .eq('title', 'Increase Local Foot Traffic');

    if (fetchError) {
      console.error('❌ Error fetching goals:', fetchError);
      return;
    }

    if (!goals || goals.length === 0) {
      console.error('❌ No marketing goal found with title "Increase Local Foot Traffic"');
      return;
    }

    const goal = goals[0];
    console.log('📊 Found goal:', goal.id, goal.title);

    // Activate the goal
    const { error: updateError } = await supabase
      .from('marketing_goals')
      .update({ is_active: true })
      .eq('id', goal.id);

    if (updateError) {
      console.error('❌ Error activating goal:', updateError);
      return;
    }

    console.log('✅ Marketing goal activated successfully!');
    console.log('🎯 Goal ID:', goal.id);
    console.log('📋 Title:', goal.title);
  } catch (error) {
    console.error('❌ Error activating marketing goal:', error);
  }
}

// Run the script
activateMarketingGoal();
