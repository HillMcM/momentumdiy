#!/usr/bin/env node

/**
 * Script to delete user profile data while preserving admin access
 * This script will:
 * 1. Delete user profile data from the profiles table
 * 2. Delete associated tasks, projects, and other user data
 * 3. Preserve admin access by keeping the email in AdminGuard.tsx
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: './.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in backend/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ADMIN_EMAIL = 'info@hillaryedenmcmullen.com';

async function deleteUserData() {
  try {
    console.log('🔍 Looking up user data for:', ADMIN_EMAIL);
    
    // First, get the user ID from auth.users using the service role client
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error listing users:', authError.message);
      return;
    }
    
    const authUser = authUsers.users.find(user => user.email === ADMIN_EMAIL);
    
    if (!authUser) {
      console.log('ℹ️  No user found with email:', ADMIN_EMAIL);
      return;
    }
    
    const userId = authUser.id;
    console.log('✅ Found user ID:', userId);
    
    // Delete user data in the correct order (respecting foreign key constraints)
    console.log('🗑️  Deleting user data...');
    
    // 1. Delete marketing tasks (if any)
    const { error: marketingTasksError } = await supabase
      .from('marketing_tasks')
      .delete()
      .eq('user_id', userId);
    
    if (marketingTasksError) {
      console.log('⚠️  Marketing tasks delete result:', marketingTasksError.message);
    } else {
      console.log('✅ Deleted marketing tasks');
    }
    
    // 2. Delete marketing modules (if any)
    const { error: marketingModulesError } = await supabase
      .from('marketing_modules')
      .delete()
      .eq('user_id', userId);
    
    if (marketingModulesError) {
      console.log('⚠️  Marketing modules delete result:', marketingModulesError.message);
    } else {
      console.log('✅ Deleted marketing modules');
    }
    
    // 3. Delete marketing goals (if any)
    const { error: marketingGoalsError } = await supabase
      .from('marketing_goals')
      .delete()
      .eq('user_id', userId);
    
    if (marketingGoalsError) {
      console.log('⚠️  Marketing goals delete result:', marketingGoalsError.message);
    } else {
      console.log('✅ Deleted marketing goals');
    }
    
    // 4. Delete tasks
    const { error: tasksError } = await supabase
      .from('tasks')
      .delete()
      .eq('user_id', userId);
    
    if (tasksError) {
      console.log('⚠️  Tasks delete result:', tasksError.message);
    } else {
      console.log('✅ Deleted tasks');
    }
    
    // 5. Delete projects
    const { error: projectsError } = await supabase
      .from('projects')
      .delete()
      .eq('user_id', userId);
    
    if (projectsError) {
      console.log('⚠️  Projects delete result:', projectsError.message);
    } else {
      console.log('✅ Deleted projects');
    }
    
    // 6. Delete calendar events
    const { error: calendarError } = await supabase
      .from('calendar_events')
      .delete()
      .eq('user_id', userId);
    
    if (calendarError) {
      console.log('⚠️  Calendar events delete result:', calendarError.message);
    } else {
      console.log('✅ Deleted calendar events');
    }
    
    // 7. Delete business metrics
    const { error: metricsError } = await supabase
      .from('business_metrics')
      .delete()
      .eq('user_id', userId);
    
    if (metricsError) {
      console.log('⚠️  Business metrics delete result:', metricsError.message);
    } else {
      console.log('✅ Deleted business metrics');
    }
    
    // 8. Delete branding kit assets
    const { error: brandingAssetsError } = await supabase
      .from('branding_kit_assets')
      .delete()
      .eq('user_id', userId);
    
    if (brandingAssetsError) {
      console.log('⚠️  Branding kit assets delete result:', brandingAssetsError.message);
    } else {
      console.log('✅ Deleted branding kit assets');
    }
    
    // 9. Delete branding kits
    const { error: brandingKitsError } = await supabase
      .from('branding_kits')
      .delete()
      .eq('user_id', userId);
    
    if (brandingKitsError) {
      console.log('⚠️  Branding kits delete result:', brandingKitsError.message);
    } else {
      console.log('✅ Deleted branding kits');
    }
    
    // 10. Delete assets
    const { error: assetsError } = await supabase
      .from('assets')
      .delete()
      .eq('user_id', userId);
    
    if (assetsError) {
      console.log('⚠️  Assets delete result:', assetsError.message);
    } else {
      console.log('✅ Deleted assets');
    }
    
    // 11. Delete share links
    const { error: shareLinksError } = await supabase
      .from('share_links')
      .delete()
      .eq('user_id', userId);
    
    if (shareLinksError) {
      console.log('⚠️  Share links delete result:', shareLinksError.message);
    } else {
      console.log('✅ Deleted share links');
    }
    
    // 12. Delete timeline phases
    const { error: timelineError } = await supabase
      .from('timeline_phases')
      .delete()
      .eq('user_id', userId);
    
    if (timelineError) {
      console.log('⚠️  Timeline phases delete result:', timelineError.message);
    } else {
      console.log('✅ Deleted timeline phases');
    }
    
    // 13. Finally, delete the profile (this will cascade to auth.users due to the foreign key)
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (profileError) {
      console.log('⚠️  Profile delete result:', profileError.message);
    } else {
      console.log('✅ Deleted profile');
    }
    
    // 14. Delete from auth.users
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);
    
    if (authDeleteError) {
      console.log('⚠️  Auth user delete result:', authDeleteError.message);
    } else {
      console.log('✅ Deleted auth user');
    }
    
    console.log('🎉 User data deletion completed!');
    console.log('✅ Admin access preserved (hardcoded in AdminGuard.tsx)');
    console.log('📝 You can now test the full user experience from landing page to onboarding');
    
  } catch (error) {
    console.error('❌ Error deleting user data:', error.message);
    process.exit(1);
  }
}

// Run the deletion
deleteUserData();
