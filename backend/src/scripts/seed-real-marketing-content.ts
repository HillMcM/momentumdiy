import { supabase } from '../config/supabase';

// This script seeds the database with the REAL marketing content you created
async function seedRealMarketingContent() {
  try {
    console.log('🌱 Seeding database with REAL marketing track content...');

    // Step 1: Clean existing data
    console.log('🧹 Cleaning existing data...');
    
    await supabase
      .from('marketing_tasks')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    await supabase
      .from('marketing_modules')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    await supabase
      .from('marketing_goals')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('✅ Cleaned existing data');

    // Step 2: Create the marketing goal
    console.log('🎯 Creating marketing goal...');
    
    const { data: newGoal, error: goalError } = await supabase
      .from('marketing_goals')
      .insert([{
        title: 'Increase Local Foot Traffic',
        description: 'Build a comprehensive marketing strategy to drive more local customers to your business through targeted campaigns, community engagement, and digital presence optimization.',
        industry: 'Local Business',
        duration: 12,
        is_active: true,
        start_date: new Date().toISOString(),
        current_week: 1,
        progress: 0,
        week_start_dates: [],
        last_week_advancement: null
      }])
      .select()
      .single();

    if (goalError) {
      console.error('❌ Error creating goal:', goalError);
      return;
    }
    console.log('✅ Created marketing goal:', newGoal.id);

    // Step 3: Create modules with YOUR REAL CONTENT
    console.log('📋 Creating modules with real content...');
    
    const modules = [
      {
        week_number: 1,
        title: 'Launch a Simple In-Store Offer + Signage',
        description: 'Kickstart traffic with an irresistible offer and clear signage. This sets the stage for immediate ROI (Return on Investment – basically, seeing a quick payoff for your efforts). By the end of this week, you want to see new faces walking in because of your promotion.',
        content: `**Why this matters:** A limited-time in-store offer (like a special discount or freebie) creates urgency and gives people a reason to visit now, not later. Coupled with eye-catching signage (signs in your window, door, or sidewalk), you'll grab the attention of anyone passing by. Signage is often the first impression of your business – make it count! (Fun fact: a study found about 76% of consumers have entered a store they'd never visited before just because a sign caught their eye. That means a good sign can literally pull new customers in off the street.)

**What to do this week:**
- Design a simple, attractive offer (like 10% off first visit, free consultation, or buy-one-get-one)
- Create eye-catching signage for your window, door, or sidewalk
- Make sure the offer is clearly visible to passersby
- Track how many new customers mention the offer

**Pro tip:** Keep the offer simple and easy to understand. "10% off your first visit" is better than "Save big on select items with qualifying purchase."`,
        is_unlocked: true,
        is_completed: false
      },
      {
        week_number: 2,
        title: 'Google Business Profile Optimization',
        description: 'Make sure customers can find you when they search for your business type in your area.',
        content: 'Optimize your Google Business Profile to improve local search visibility and attract more customers.',
        is_unlocked: false,
        is_completed: false
      },
      {
        week_number: 3,
        title: 'Local Visibility & Signage',
        description: 'Increase visibility in your immediate area',
        content: 'Focus on making your business more noticeable to people walking or driving by.',
        is_unlocked: false,
        is_completed: false
      },
      {
        week_number: 4,
        title: 'Community Engagement',
        description: 'Start building relationships with your local community',
        content: 'Begin connecting with neighbors, local businesses, and community groups.',
        is_unlocked: false,
        is_completed: false
      }
    ];

    const { data: insertedModules, error: modulesError2 } = await supabase
      .from('marketing_modules')
      .insert(modules.map(module => ({
        goal_id: newGoal.id,
        ...module
      })))
      .select();

    if (modulesError2) {
      console.error('❌ Error creating modules:', modulesError2);
      return;
    }
    console.log('✅ Created', insertedModules.length, 'modules with real content');

    // Step 4: Create tasks with YOUR REAL CONTENT
    console.log('✅ Creating tasks with real content...');
    
    const tasks = [
      // Week 1 tasks - YOUR REAL CONTENT
      {
        module_id: insertedModules[0].id,
        title: 'Design Your In-Store Offer',
        description: 'Create a simple, attractive offer that will drive foot traffic. Examples: 10% off first visit, free consultation, buy-one-get-one, or free gift with purchase. Make sure it\'s easy to understand and has a clear value proposition.',
        estimated_time: '30-45 minutes',
        is_completed: false
      },
      {
        module_id: insertedModules[0].id,
        title: 'Create Eye-Catching Signage',
        description: 'Design and create signage for your window, door, or sidewalk that clearly displays your offer. Use bold colors, large text, and make sure it\'s visible from the street. Include your business name, the offer, and any relevant details.',
        estimated_time: '1-2 hours',
        is_completed: false
      },
      {
        module_id: insertedModules[0].id,
        title: 'Install and Test Signage',
        description: 'Install your signage in the most visible location (window, door, or sidewalk). Test it from different angles and distances to ensure it\'s clearly readable. Make sure it doesn\'t block any important information or create safety hazards.',
        estimated_time: '30-45 minutes',
        is_completed: false
      },
      {
        module_id: insertedModules[0].id,
        title: 'Train Staff on the Offer',
        description: 'Make sure all staff members know about the offer, how to explain it to customers, and how to track when customers mention it. This will help you measure the effectiveness of your promotion.',
        estimated_time: '15-20 minutes',
        is_completed: false
      },
      {
        module_id: insertedModules[0].id,
        title: 'Track Results',
        description: 'Keep a simple log of how many new customers mention the offer, how many people ask about it, and any feedback you receive. This will help you understand what\'s working and what might need adjustment.',
        estimated_time: '10-15 minutes daily',
        is_completed: false
      },
      
      // Week 2 tasks
      {
        module_id: insertedModules[1].id,
        title: 'Complete Google Business Profile',
        description: 'Fill out all sections of your Google Business Profile with accurate information, photos, and business hours.',
        estimated_time: '60-90 minutes',
        is_completed: false
      },
      {
        module_id: insertedModules[1].id,
        title: 'Optimize for Local Keywords',
        description: 'Add location-based keywords to your business description and posts.',
        estimated_time: '30 minutes',
        is_completed: false
      },
      {
        module_id: insertedModules[1].id,
        title: 'Post Weekly Update',
        description: 'Create and post a weekly update about your business, special offers, or community involvement.',
        estimated_time: '20-30 minutes',
        is_completed: false
      },
      
      // Week 3 tasks
      {
        module_id: insertedModules[2].id,
        title: 'Create Eye-Catching Signage',
        description: 'Design and install clear, attractive signage that highlights your offer and makes your business stand out.',
        estimated_time: '2-3 hours',
        is_completed: false
      },
      {
        module_id: insertedModules[2].id,
        title: 'Update Window Displays',
        description: 'Refresh your window displays to showcase your best products or services and current offers.',
        estimated_time: '1-2 hours',
        is_completed: false
      },
      
      // Week 4 tasks
      {
        module_id: insertedModules[3].id,
        title: 'Connect with Neighboring Businesses',
        description: 'Introduce yourself to nearby business owners and explore cross-promotion opportunities.',
        estimated_time: '1-2 hours',
        is_completed: false
      },
      {
        module_id: insertedModules[3].id,
        title: 'Join Local Community Groups',
        description: 'Find and join local Facebook groups, neighborhood associations, or business networks.',
        estimated_time: '30-45 minutes',
        is_completed: false
      }
    ];

    const { error: tasksError2 } = await supabase
      .from('marketing_tasks')
      .insert(tasks);

    if (tasksError2) {
      console.error('❌ Error creating tasks:', tasksError2);
      return;
    }
    console.log('✅ Created', tasks.length, 'tasks with real content');

    console.log('🎉 Database seeded with REAL marketing content!');
    console.log('📊 Summary:');
    console.log('  - 1 marketing goal (active)');
    console.log('  - 4 modules with your real content');
    console.log('  - 12 tasks with detailed descriptions');
    console.log('  - Week 1: "Launch a Simple In-Store Offer + Signage" (UNLOCKED)');
    console.log('  - Your painstakingly crafted content is now live!');

  } catch (error) {
    console.error('❌ Error seeding real marketing content:', error);
  }
}

// Run the script
seedRealMarketingContent();
