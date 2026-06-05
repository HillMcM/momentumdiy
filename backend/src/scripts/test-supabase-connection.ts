import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

// Test script to verify Supabase connection
async function testSupabaseConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    console.log('📍 Supabase URL:', process.env['SUPABASE_URL'] || 'http://127.0.0.1:54321');
    
    // Test basic connection
    const { error } = await supabase
      .from('marketing_goals')
      .select('count')
      .limit(1);

    if (error) {
      logger.error('Supabase connection failed', error, { 
        message: 'Please check your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
      });
      return;
    }

    console.log('✅ Supabase connection successful!');
    
    // Test if we can find the active goal
    const { data: activeGoal, error: goalError } = await supabase
      .from('marketing_goals')
      .select('*')
      .eq('is_active', true)
      .single();

    if (goalError) {
      if (goalError.code === 'PGRST116') {
        console.log('⚠️  No active marketing goal found');
        console.log('💡 Run: npm run seed-marketing-track to create content');
      } else {
        logger.error('Error checking for active goal', goalError);
      }
    } else {
      console.log('🎯 Active goal found:', activeGoal.title);
      console.log('📊 Goal ID:', activeGoal.id);
    }

  } catch (error) {
    logger.error('Connection test failed', error);
  }
}

// Run the test
testSupabaseConnection();
