import type { MarketingGoal, MarketingModule, MarketingTask, ApiResponse, Task } from '../types';
import { BACKEND_BASE_URL } from './api';

// Mock data for the 12-week Increase Local Foot Traffic track
function getMockActiveGoal(): MarketingGoal {
  console.log('📋 Using mock data for Increase Local Foot Traffic');
  return {
    id: 'increase-local-foot-traffic',
    title: 'Increase Local Foot Traffic',
    description: 'Strategic marketing plan to boost local visibility and drive foot traffic to your business.',
    industry: 'Local Business',
    duration: 12,
    isActive: true,
    startDate: new Date(),
    currentWeek: 1,
    progress: 75,
    modules: getMockModulesForGoal('increase-local-foot-traffic')
  };
}

function getMockModulesForGoal(goalId: string): MarketingModule[] {
  if (goalId === 'increase-local-foot-traffic') {
    return [
      {
        id: 'week-1',
        weekNumber: 1,
        title: 'Week 1: Audit Visibility',
        description: 'Assess your current marketing presence and identify opportunities for improvement.',
        content: `<h2>Week 1: Audit Visibility</h2>
<p>Before you begin, jot down some baseline metrics – for example, how many walk-ins you get in an average week right now. These numbers will help you see how far you've come by Week 12. Remember to keep the tone fun and stay encouraged: you got this!</p>

<p><strong>Theme:</strong> Kickstart traffic with an irresistible offer and clear signage. This sets the stage for immediate ROI (Return on Investment – basically, seeing a quick payoff for your efforts). By the end of this week, you want to see new faces walking in because of your promotion.</p>

<p><strong>Why this matters:</strong> A limited-time in-store offer (like a special discount or freebie) creates urgency and gives people a reason to visit now, not later. Coupled with eye-catching signage (signs in your window, door, or sidewalk), you'll grab the attention of anyone passing by. Signage is often the first impression of your business – make it count! (Fun fact: a study found about 76% of consumers have entered a store they'd never visited before just because a sign caught their eye. That means a good sign can literally pull new customers in off the street.)</p>

<h4>Pro Tip:</h4>
<p>Keep the vibe positive and fun. When promoting the offer, be excited! For example, "We're doing something special: this week all coffee comes with a free cookie! Hope you enjoy it!" Enthusiasm is contagious and makes customers feel like they're part of something exciting. Also, make sure your team (if you have one) is on the same page and equally informed about the offer details. Lastly, plan for a slight increase in traffic – have enough stock of the item on sale or ingredients for that free cookie, etc. Nothing's worse than drawing people in and then disappointing them by running out.</p>`,
        isUnlocked: true,
        isCompleted: false,
        tasks: [
          {
            id: 'task-1-1',
            taskId: 'week-1',
            title: 'Measure your starting point',
            shortDescription: 'Record your current foot traffic and sales metrics as a baseline for comparison.',
            description: 'Before anything else, record your current foot traffic. For example, count how many people come in this week normally. This is your baseline to compare later. Also note any daily sales or other metrics you care about.',
            estimatedTime: '15min',
            isCompleted: false,
            dueDate: new Date(Date.now() + 0 * 7 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'task-1-2',
            taskId: 'week-1',
            title: 'Create a simple, juicy offer',
            shortDescription: 'Design a promotion that will entice people immediately with discounts, freebies, or special deals.',
            description: 'Think of a promotion that will entice folks immediately. It could be "Buy one, get one 50% off," "Free dessert with any meal," or "10% off for first-time customers." Make it easy to understand and valuable enough that people feel they shouldn\'t miss it. (Keep your costs in mind, but often a small perk can go a long way.) If you\'re unsure what offer would appeal, brainstorm a few ideas – maybe even ask a couple of regulars what would excite them, or use an AI assistant to suggest popular promotions in your industry.',
            estimatedTime: '30min',
            isCompleted: false,
            dueDate: new Date(Date.now() + 0 * 7 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'task-1-3',
            taskId: 'week-1',
            title: 'Prepare your signage',
            shortDescription: 'Create bold, clear signs advertising your offer for both outside and inside placement.',
            description: 'Once your offer is decided, advertise it with a bold sign. For example, a chalkboard on the sidewalk or a bright poster in your window that says "This Week Only: [Your Offer]!" Use big, clear letters. Someone walking or driving by should grasp it in seconds. Include a call to action like "Come in today" or an arrow pointing inside. If designing signs isn\'t your forte, you could ask a crafty friend for help or even get a quick design idea from an AI tool – but a hand-written enthusiastic message works fine too!',
            estimatedTime: '45min',
            isCompleted: false,
            dueDate: new Date(Date.now() + 0 * 7 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'task-1-4',
            taskId: 'week-1',
            title: 'Promote in-store',
            shortDescription: 'Tell every customer about the offer and ensure signs are visible to passersby.',
            description: 'Tell every customer who comes in about the offer. If they buy something, make sure they know about the deal (maybe they\'ll purchase more or tell a friend). You can say, "By the way, we have a special this week…" Also, place the sign where even people just walking by or driving slowly can see it. Consider both outside and inside placement (window, near the entrance, at the register). The goal is that no one in the vicinity misses your special deal.',
            estimatedTime: '20min',
            isCompleted: false,
            dueDate: new Date(Date.now() + 0 * 7 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'task-1-5',
            taskId: 'week-1',
            title: 'Run the offer for a limited time',
            shortDescription: 'Set a deadline (1-2 weeks) and communicate urgency to encourage immediate action.',
            description: 'A short timeframe (like one week or two weeks maximum) adds urgency. Let customers know it\'s "for a limited time." This encourages immediate action. At the end of the promo period, you\'ll also be able to clearly see the bump it gave you. (Pro Tip: If the offer is doing really well and you\'re able, you might extend it a bit — but generally, stick to the deadline so customers learn to jump on your deals.)',
            estimatedTime: '10min',
            isCompleted: false,
            dueDate: new Date(Date.now() + 0 * 7 * 24 * 60 * 60 * 1000)
          }
        ]
      },
      {
        id: 'week-2',
        weekNumber: 2,
        title: 'Week 2: Google Business Profile Optimization',
        description: 'Optimize your Google Business Profile to improve local search visibility and attract more customers.',
        content: `<h2>Week 2: Google Business Profile Optimization</h2>
<p>This week focuses on making sure your business shows up when people search for what you offer in your area. Google Business Profile is often the first thing potential customers see about your business.</p>

<p><strong>Why this matters:</strong> 92% of local searches happen on mobile devices, and 78% of these searches result in offline purchases. Optimizing for local search is essential for increasing foot traffic.</p>

<p><strong>Pro Tip:</strong> Consistency across all platforms (Google My Business, Facebook, Yelp, etc.) is key for local SEO success.</p>`,
        isUnlocked: false, // Locked since we're on week 1
        isCompleted: false,
        tasks: [
          {
            id: 'task-2-1',
            taskId: 'week-2',
            title: 'Claim and Optimize Google My Business',
            description: 'Set up and fully optimize your Google My Business listing with complete information, photos, and business hours.',
            estimatedTime: '60min',
            isCompleted: false,
            dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'task-2-2',
            taskId: 'week-2',
            title: 'Local Keyword Research',
            description: 'Research and identify local search terms your customers use to find businesses like yours.',
            estimatedTime: '45min',
            isCompleted: false,
            dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'task-2-3',
            taskId: 'week-2',
            title: 'Review Response Strategy',
            description: 'Create a system for managing and responding to customer reviews promptly and professionally.',
            estimatedTime: '30min',
            isCompleted: false,
            dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
          }
        ]
      },
      {
        id: 'week-3',
        weekNumber: 3,
        title: 'Week 3: Social Media Strategy',
        description: 'Build a social media presence that drives local engagement and community connections.',
        content: `<h2>Week 3: Social Media Strategy</h2>
<p>Social media isn't just about posting content - it's about building relationships with your local community and creating authentic engagement.</p>

<p><strong>Why this matters:</strong> Local businesses that actively engage on social media see 2x more foot traffic than those who don't. Social media helps you stay top-of-mind with local customers.</p>

<p><strong>Pro Tip:</strong> Focus on quality engagement over quantity of posts. Meaningful interactions with your community build stronger customer relationships.</p>`,
        isUnlocked: false, // Locked since we're on week 1
        isCompleted: false,
        tasks: [
          {
            id: 'task-3-1',
            taskId: 'week-3',
            title: 'Choose Primary Platforms',
            description: 'Select 2-3 social platforms where your target customers are most active and engaged.',
            estimatedTime: '30min',
            isCompleted: false,
            dueDate: new Date(Date.now() + 2 * 7 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'task-3-2',
            taskId: 'week-3',
            title: 'Create Content Calendar',
            description: 'Plan 2 weeks of social media content focused on local engagement and community building.',
            estimatedTime: '60min',
            isCompleted: false,
            dueDate: new Date(Date.now() + 2 * 7 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'task-3-3',
            taskId: 'week-3',
            title: 'Engagement Strategy',
            description: 'Develop a plan for responding to comments and messages within 24 hours to maintain active community engagement.',
            estimatedTime: '25min',
            isCompleted: false,
            dueDate: new Date(Date.now() + 2 * 7 * 60 * 60 * 1000)
          }
        ]
      },
      // Add more weeks 4-12 with similar structure
      ...Array.from({ length: 9 }, (_, i) => {
        const weekNum = i + 4;
        return {
          id: `week-${weekNum}`,
          weekNumber: weekNum,
          title: `Week ${weekNum} Strategy`,
          description: `Advanced marketing tactics for week ${weekNum}`,
          content: `
<h2>Theme: Advanced Local Marketing</h2>
<p>Continue building on your foundation with advanced strategies to drive more local foot traffic.</p>

<p>This week focuses on:</p>
<ul>
<li>Advanced local marketing tactics</li>
<li>Partnership development</li>
<li>Customer retention strategies</li>
<li>Performance measurement</li>
</ul>
          `,
          isUnlocked: weekNum <= 3, // Only unlock first 3 weeks initially
          isCompleted: false,
          tasks: [
            {
              id: `task-${weekNum}-1`,
              taskId: `week-${weekNum}`,
              title: `Week ${weekNum} Primary Task`,
              description: `Complete the main marketing activity for week ${weekNum}`,
              estimatedTime: '45min',
              isCompleted: false
            },
            {
              id: `task-${weekNum}-2`,
              taskId: `week-${weekNum}`,
              title: `Week ${weekNum} Secondary Task`,
              description: `Supporting activity to reinforce your marketing efforts`,
              estimatedTime: '30min',
              isCompleted: false
            }
          ]
        };
      })
    ];
  }
  return [];
}

// Get active marketing goal
export async function getActiveGoal(): Promise<ApiResponse<MarketingGoal>> {
  const url = `${BACKEND_BASE_URL}/api/marketing/goals/active`;
  console.log('🔍 Fetching from:', url);
  console.log('🔍 BACKEND_BASE_URL:', BACKEND_BASE_URL);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);

    if (!response.ok) {
      console.warn('❌ Backend not available, using mock data');
      return {
        success: true,
        data: getMockActiveGoal(),
      };
    }

    const data = await response.json();
    console.log('✅ Backend data received:', data);
    
    // Validate that we got the correct data
    if (data.success && data.data && data.data.title === 'Increase Local Foot Traffic') {
      console.log('✅ Correct marketing track data received from backend');
      return data;
    } else {
      console.warn('⚠️ Backend returned unexpected data, using mock data');
      return {
        success: true,
        data: getMockActiveGoal(),
      };
    }
  } catch (error) {
    console.error('❌ Error fetching from backend:', error);
    console.warn('⚠️ Backend not available, using mock data');
    return {
      success: true,
      data: getMockActiveGoal(),
    };
  }
}

// Get modules for a specific goal
export async function getModulesForGoal(goalId: string): Promise<ApiResponse<MarketingModule[]>> {
  try {
          const response = await fetch(`${BACKEND_BASE_URL}/api/marketing/goals/${goalId}/modules`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('Backend not available, using mock data');
      return {
        success: true,
        data: getMockModulesForGoal(goalId),
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Backend not available, using mock data:', error);
    return {
      success: true,
      data: getMockModulesForGoal(goalId),
    };
  }
}

// Toggle marketing task completion
export async function toggleMarketingTask(taskId: string, isCompleted: boolean): Promise<ApiResponse<MarketingTask>> {
  try {
          const response = await fetch(`${BACKEND_BASE_URL}/api/marketing/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isCompleted }),
    });

    if (!response.ok) {
      console.warn('Backend not available, simulating task toggle');
      return {
        success: true,
        data: {
          id: taskId,
          taskId: taskId.split('-').slice(0, 2).join('-'),
          title: `Task ${taskId}`,
          description: 'Task description',
          estimatedTime: '30min',
          isCompleted,
        },
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Backend not available, simulating task toggle:', error);
    return {
      success: true,
      data: {
        id: taskId,
        taskId: taskId.split('-').slice(0, 2).join('-'),
        title: `Task ${taskId}`,
        description: 'Task description',
        estimatedTime: '30min',
        isCompleted,
      },
    };
  }
}

// Update goal progress
export async function updateGoalProgress(goalId: string, progress: number): Promise<ApiResponse<MarketingGoal>> {
  try {
          const response = await fetch(`${BACKEND_BASE_URL}/api/marketing/goals/${goalId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ progress }),
    });

    if (!response.ok) {
      console.warn('Backend not available, simulating progress update');
      const mockGoal = getMockActiveGoal();
      return {
        success: true,
        data: { ...mockGoal, progress },
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Backend not available, simulating progress update:', error);
    const mockGoal = getMockActiveGoal();
    return {
      success: true,
      data: { ...mockGoal, progress },
    };
  }
}

// Convert marketing tasks to regular tasks for the task tracker
export function convertMarketingTasksToTasks(marketingGoal: MarketingGoal): Task[] {
  const tasks: Task[] = [];
  
  marketingGoal.modules.forEach(module => {
    console.log(`🔍 Checking module: Week ${module.weekNumber} - ${module.title} - isUnlocked: ${module.isUnlocked}`);
    
    // Only include tasks from unlocked modules
    if (!module.isUnlocked) {
      console.log(`🔒 Skipping tasks from locked module: Week ${module.weekNumber} - ${module.title}`);
      return;
    }
    
    console.log(`🔓 Including tasks from unlocked module: Week ${module.weekNumber} - ${module.title}`);
    
    module.tasks.forEach(marketingTask => {
      // Convert marketing task status to task status
      let status: 'todo' | 'in-progress' | 'completed' = 'todo';
      if (marketingTask.isCompleted) {
        status = 'completed';
      } else if (module.weekNumber === marketingGoal.currentWeek) {
        status = 'in-progress';
      }
      
      const task: Task = {
        id: marketingTask.id,
        title: marketingTask.title,
        description: marketingTask.description || '',
        responsible: 'Marketing Team', // Default responsible person
        deadline: marketingTask.dueDate ? new Date(marketingTask.dueDate).toISOString() : null,
        project: marketingGoal.title,
        timeSpent: '',
        notifications: false,
        status,
        // Add marketing track metadata
        marketingTrack: {
          goalId: marketingGoal.id,
          moduleId: module.id,
          marketingTaskId: marketingTask.id
        }
      };
      
      tasks.push(task);
    });
  });
  
  console.log(`📋 Converted ${tasks.length} tasks from unlocked modules only`);
  return tasks;
}
