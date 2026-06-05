/**
 * Script to add action links to specific tasks in the Social Media Strategy track
 * This creates quick access buttons that link tasks directly to the Social Strategy Hub
 */

import * as supabase from '../config/supabase';
import { logger } from '../utils/logger';

interface ActionLink {
  url: string;
  label: string;
  tab?: string;
}

// Define which tasks should have action links
const TASK_ACTION_LINKS: Record<string, ActionLink> = {
  // Week 2: Content Pillars
  'Define 3–4 content pillars for your brand': {
    url: '/app/social-strategy',
    label: 'Open Strategy Hub',
    tab: 'pillars'
  },
  'Link pillars to content ideas': {
    url: '/app/social-strategy',
    label: 'Open Strategy Hub',
    tab: 'pillars'
  },
  
  // Week 3: Brand Voice & Visuals
  'Craft your brand voice guidelines': {
    url: '/app/social-strategy',
    label: 'Define Brand Voice',
    tab: 'voice'
  },
  'Define your visual style basics': {
    url: '/app/social-strategy',
    label: 'Set Visual Style',
    tab: 'voice'
  },
  
  // Week 5: Content Schedule
  'Determine your realistic posting frequency': {
    url: '/app/social-strategy',
    label: 'Plan Schedule',
    tab: 'schedule'
  },
  'Outline your weekly content schedule': {
    url: '/app/social-strategy',
    label: 'Build Schedule',
    tab: 'schedule'
  },
  
  // Week 6: Templates
  'Choose 2–4 post formats to templatize': {
    url: '/app/social-strategy',
    label: 'Upload Templates',
    tab: 'templates'
  },
  'Create your templates in a design tool': {
    url: '/app/social-strategy',
    label: 'Manage Templates',
    tab: 'templates'
  },
  
  // Week 1: Metrics Baseline
  'Record baseline engagement metrics': {
    url: '/app/social-strategy',
    label: 'Track Metrics',
    tab: 'metrics'
  },
  'Conduct a quick social media audit': {
    url: '/app/social-strategy',
    label: 'View Strategy Hub',
    tab: 'pillars'
  },
  
  // Week 12: Review
  'Review your performance metrics': {
    url: '/app/social-strategy',
    label: 'View Metrics',
    tab: 'metrics'
  },
};

async function addActionLinksToTasks() {
  try {
    console.log('🔗 Starting to add action links to Social Media Strategy tasks...\n');

    // Find the Social Media Strategy track definition
    const { data: trackDef, error: trackError } = await supabase.default
      .from('marketing_track_definitions')
      .select('id, title')
      .ilike('title', '%social media%')
      .single();

    if (trackError || !trackDef) {
      logger.error('Could not find Social Media Strategy track', trackError);
      return;
    }

    console.log(`✅ Found track: "${trackDef.title}" (${trackDef.id})\n`);

    // Get all active goals for this track
    const { data: goals, error: goalsError } = await supabase.default
      .from('marketing_goals')
      .select('id, title, user_id')
      .eq('track_definition_id', trackDef.id);

    if (goalsError) {
      logger.error('Error fetching goals', goalsError);
      return;
    }

    if (!goals || goals.length === 0) {
      console.log('⚠️  No active goals found for this track yet.');
      console.log('   Users will get action links automatically when they activate this track.\n');
    } else {
      console.log(`📋 Found ${goals.length} active goal(s) for this track\n`);
    }

    // Get all modules for all goals of this track
    const goalIds = goals?.map(g => g.id) || [];
    const { data: modules, error: modulesError } = await supabase.default
      .from('marketing_modules')
      .select('id, title, goal_id')
      .in('goal_id', goalIds);

    if (modulesError) {
      logger.error('Error fetching modules', modulesError);
      return;
    }

    console.log(`📦 Found ${modules?.length || 0} module(s)\n`);

    // Get all tasks for these modules
    const moduleIds = modules?.map(m => m.id) || [];
    const { data: tasks, error: tasksError } = await supabase.default
      .from('marketing_tasks')
      .select('id, title, module_id, action_link')
      .in('module_id', moduleIds);

    if (tasksError) {
      logger.error('Error fetching tasks', tasksError);
      return;
    }

    console.log(`✏️  Found ${tasks?.length || 0} task(s)\n`);

    // Update tasks that match our action link definitions
    let updatedCount = 0;
    let skippedCount = 0;

    for (const task of tasks || []) {
      // Check if this task should have an action link
      const matchingLink = Object.entries(TASK_ACTION_LINKS).find(([titlePattern, _]) => 
        task.title.toLowerCase().includes(titlePattern.toLowerCase()) ||
        titlePattern.toLowerCase().includes(task.title.toLowerCase())
      );

      if (matchingLink) {
        const [_, actionLink] = matchingLink;
        
        // Only update if action_link is null or different
        if (!task.action_link || JSON.stringify(task.action_link) !== JSON.stringify(actionLink)) {
          const { error: updateError } = await supabase.default
            .from('marketing_tasks')
            .update({ action_link: actionLink })
            .eq('id', task.id);

          if (updateError) {
            logger.error(`Failed to update task "${task.title}"`, updateError);
          } else {
            console.log(`   ✅ Added link to: "${task.title}" → ${actionLink.tab} tab`);
            updatedCount++;
          }
        } else {
          console.log(`   ⏭️  Skipped (already has link): "${task.title}"`);
          skippedCount++;
        }
      }
    }

    console.log(`\n🎉 Done! Updated ${updatedCount} task(s), skipped ${skippedCount} task(s)\n`);

    if (updatedCount === 0 && tasks && tasks.length > 0) {
      console.log('💡 Tip: Task titles may have changed. Check TASK_ACTION_LINKS mapping.\n');
    }

  } catch (error) {
    logger.error('Script error', error);
  }
}

// Run if executed directly
if (require.main === module) {
  addActionLinksToTasks().then(() => {
    console.log('✨ Script completed');
    process.exit(0);
  }).catch(error => {
    logger.error('Script failed', error);
    process.exit(1);
  });
}

export { addActionLinksToTasks };

