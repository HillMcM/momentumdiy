#!/usr/bin/env node

/**
 * Script to ensure the new user has a proper profile setup
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: './.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ADMIN_EMAIL = 'info@hillaryedenmcmullen.com';

async function fixNewUser() {
  try {
    console.log('🔍 Checking current user state for:', ADMIN_EMAIL);
    
    // Get the current auth user
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error listing users:', authError.message);
      return;
    }
    
    const authUser = authUsers.users.find(user => user.email === ADMIN_EMAIL);
    
    if (!authUser) {
      console.log('❌ No auth user found');
      return;
    }
    
    console.log('✅ Found auth user:', authUser.id);
    
    // Check if profile exists
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();
    
    if (profileError && profileError.code === 'PGRST116') {
      // Profile doesn't exist, create one
      console.log('📝 Creating new profile for user...');
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || null,
          avatar_url: authUser.user_metadata?.avatar_url || null,
          onboarding_completed: false,
          subscription_status: 'trial',
          trial_start_date: new Date().toISOString(),
          trial_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
          subscription_plan: 'premium'
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Error creating profile:', createError.message);
        return;
      }
      
      console.log('✅ Created new profile:', {
        id: newProfile.id,
        email: newProfile.email,
        onboarding_completed: newProfile.onboarding_completed
      });
      
    } else if (existingProfile) {
      console.log('📝 Profile already exists, resetting to new user state...');
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: false,
          onboarding_data: {},
          business_type: null,
          business_stage: null,
          primary_goal: null,
          biggest_challenge: [],
          current_activities: [],
          time_available: null,
          quiz_answers: {},
          recommended_track: null,
          selected_track: null,
          business_name: null,
          business_category: null,
          location: null,
          contact_email: null,
          business_size: null,
          primary_marketing_goal: null,
          marketing_channels: [],
          skill_levels: {},
          industry_keywords: [],
          brand_primary_color: null,
          brand_secondary_color: null,
          brand_font_heading: null,
          brand_font_body: null,
          favorite_templates: [],
          favorite_tools: [],
          ai_pinned: [],
          updated_at: new Date().toISOString()
        })
        .eq('id', authUser.id);
      
      if (updateError) {
        console.error('❌ Error updating profile:', updateError.message);
        return;
      }
      
      console.log('✅ Reset profile to new user state');
    }
    
    console.log('🎉 User is now ready for a fresh onboarding experience!');
    
  } catch (error) {
    console.error('❌ Error fixing new user:', error.message);
    process.exit(1);
  }
}

// Run the fix
fixNewUser();
