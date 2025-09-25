#!/usr/bin/env node

/**
 * Script to check if any user data still exists for the admin email
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

async function checkUserData() {
  try {
    console.log('🔍 Checking for any remaining user data for:', ADMIN_EMAIL);
    
    // Check auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error listing users:', authError.message);
      return;
    }
    
    const authUser = authUsers.users.find(user => user.email === ADMIN_EMAIL);
    
    if (authUser) {
      console.log('⚠️  Found auth user:', {
        id: authUser.id,
        email: authUser.email,
        created_at: authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at
      });
      
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('❌ Error checking profile:', profileError.message);
      } else if (profile) {
        console.log('⚠️  Found profile:', {
          id: profile.id,
          email: profile.email,
          onboarding_completed: profile.onboarding_completed,
          created_at: profile.created_at,
          updated_at: profile.updated_at
        });
      } else {
        console.log('✅ No profile found');
      }
      
      // Check for any tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', authUser.id);
      
      if (tasksError) {
        console.log('⚠️  Tasks check result:', tasksError.message);
      } else {
        console.log(`📋 Found ${tasks?.length || 0} tasks`);
      }
      
      // Check for any projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', authUser.id);
      
      if (projectsError) {
        console.log('⚠️  Projects check result:', projectsError.message);
      } else {
        console.log(`📁 Found ${projects?.length || 0} projects`);
      }
      
    } else {
      console.log('✅ No auth user found with email:', ADMIN_EMAIL);
    }
    
  } catch (error) {
    console.error('❌ Error checking user data:', error.message);
    process.exit(1);
  }
}

// Run the check
checkUserData();
