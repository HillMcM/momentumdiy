import { supabase } from '../config/supabase';

interface SeedMarketingGoal {
  id: string;
  title: string;
  description: string;
  industry: string;
  duration: number;
  is_active: boolean;
  current_week: number;
  progress: number;
  start_date: string;
}

interface SeedMarketingModule {
  id: string;
  goal_id: string;
  week_number: number;
  title: string;
  description: string;
  content: string;
  is_unlocked: boolean;
  is_completed: boolean;
}

interface SeedMarketingTask {
  id: string;
  module_id: string;
  title: string;
  description: string;
  estimated_time: string;
  is_completed: boolean;
  due_date?: string;
}

const marketingGoal: SeedMarketingGoal = {
  id: 'increase-local-foot-traffic',
  title: 'Increase Local Foot Traffic',
  description: 'Build a comprehensive marketing strategy to drive more local customers to your business through targeted campaigns, community engagement, and digital presence optimization.',
  industry: 'Local Business',
  duration: 12,
  is_active: true,
  current_week: 1,
  progress: 25,
  start_date: new Date().toISOString()
};

const marketingModules: SeedMarketingModule[] = [
  {
    id: 'week-1',
    goal_id: 'increase-local-foot-traffic',
    week_number: 1,
    title: 'Foundation & Brand Assessment',
    description: 'Establish your marketing foundation and assess your current brand presence.',
    content: `
<h2>Theme: Building Your Marketing Foundation</h2>
<p>Welcome to Week 1 of your 12-week journey to increase local foot traffic! This week focuses on establishing a solid foundation for your marketing efforts.</p>

<h3>Why this matters:</h3>
<p>Before you can effectively market to local customers, you need to understand your current position and set clear goals. This assessment will help you identify strengths, weaknesses, and opportunities in your local market.</p>

<h3>Pro Tip:</h3>
<p>Take your time with this assessment - the insights you gather now will inform all your future marketing decisions.</p>

<p>This week you'll:</p>
<ul>
<li>Complete a comprehensive brand audit</li>
<li>Analyze your current customer base</li>
<li>Set specific, measurable goals for foot traffic increase</li>
<li>Identify your unique value propositions</li>
<li>Create a customer avatar for your ideal local customer</li>
</ul>`,
    is_unlocked: true,
    is_completed: true
  },
  {
    id: 'week-2',
    goal_id: 'increase-local-foot-traffic',
    week_number: 2,
    title: 'Local SEO Optimization',
    description: 'Optimize your online presence for local search visibility.',
    content: `
<h2>Theme: Getting Found Locally</h2>
<p>Local SEO is crucial for driving foot traffic because most customers search for local businesses online before making purchasing decisions.</p>

<h3>Why this matters:</h3>
<p>92% of local searches happen on mobile devices, and 78% of these searches result in offline purchases. Optimizing for local search is essential for increasing foot traffic.</p>

<h3>Pro Tip:</h3>
<p>Consistency across all platforms (Google My Business, Facebook, Yelp, etc.) is key for local SEO success.</p>

<p>This week you'll focus on:</p>
<ul>
<li>Google My Business optimization</li>
<li>Local keyword research and implementation</li>
<li>Review management strategy</li>
<li>Local citation building</li>
<li>Mobile-friendly website optimization</li>
</ul>`,
    is_unlocked: false,
    is_completed: false
  },
  {
    id: 'week-3',
    goal_id: 'increase-local-foot-traffic',
    week_number: 3,
    title: 'Social Media Strategy',
    description: 'Develop a comprehensive social media presence to engage with local customers.',
    content: `
<h2>Theme: Social Media Engagement</h2>
<p>Social media is your direct line to local customers. It's where you can build relationships, share your story, and create community around your brand.</p>

<h3>Why this matters:</h3>
<p>Local customers use social media to discover businesses, read reviews, and stay updated on promotions. A strong social presence builds trust and drives foot traffic.</p>

<h3>Pro Tip:</h3>
<p>Focus on platforms where your local customers actually spend time - don't try to be everywhere at once.</p>

<p>This week you'll:</p>
<ul>
<li>Audit your current social media presence</li>
<li>Identify the best platforms for your audience</li>
<li>Create a content calendar</li>
<li>Develop engagement strategies</li>
<li>Plan local event promotions</li>
</ul>`,
    is_unlocked: false,
    is_completed: false
  }
  // Add more weeks as needed...
];

const marketingTasks: SeedMarketingTask[] = [
  // Week 1 tasks
  {
    id: 'task-1-1',
    module_id: 'week-1',
    title: 'Complete Brand Assessment',
    description: 'Audit your current brand elements, messaging, and positioning',
    estimated_time: '45min',
    is_completed: true,
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'task-1-2',
    module_id: 'week-1',
    title: 'Define Target Audience',
    description: 'Create detailed customer avatars for your ideal local customers',
    estimated_time: '30min',
    is_completed: true
  },
  {
    id: 'task-1-3',
    module_id: 'week-1',
    title: 'Set Marketing Goals',
    description: 'Establish specific, measurable goals for foot traffic increase',
    estimated_time: '20min',
    is_completed: true
  },
  // Week 2 tasks
  {
    id: 'task-2-1',
    module_id: 'week-2',
    title: 'Optimize Google My Business',
    description: 'Complete and optimize your Google My Business profile',
    estimated_time: '60min',
    is_completed: false
  },
  {
    id: 'task-2-2',
    module_id: 'week-2',
    title: 'Research Local Keywords',
    description: 'Identify high-value local search terms for your business',
    estimated_time: '45min',
    is_completed: false
  }
  // Add more tasks as needed...
];

export async function seedMarketingTrack() {
  try {
    console.log('🌱 Starting marketing track seeding...');

    // Insert marketing goal
    const { error: goalError } = await supabase
      .from('marketing_goals')
      .upsert([marketingGoal], { onConflict: 'id' });

    if (goalError) {
      console.error('❌ Error seeding marketing goal:', goalError);
      return;
    }
    console.log('✅ Marketing goal seeded successfully');

    // Insert marketing modules
    const { error: modulesError } = await supabase
      .from('marketing_modules')
      .upsert(marketingModules, { onConflict: 'id' });

    if (modulesError) {
      console.error('❌ Error seeding marketing modules:', modulesError);
      return;
    }
    console.log('✅ Marketing modules seeded successfully');

    // Insert marketing tasks
    const { error: tasksError } = await supabase
      .from('marketing_tasks')
      .upsert(marketingTasks, { onConflict: 'id' });

    if (tasksError) {
      console.error('❌ Error seeding marketing tasks:', tasksError);
      return;
    }
    console.log('✅ Marketing tasks seeded successfully');

    console.log('🎉 Marketing track seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  }
}

// Run if called directly
if (require.main === module) {
  seedMarketingTrack();
}
