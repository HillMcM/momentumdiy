import type { MarketingGoal, MarketingModule, MarketingTask, ApiResponse } from '../types';

// Mock data for the 12-week Increase Local Foot Traffic track
function getMockActiveGoal(): MarketingGoal {
  return {
    id: 'increase-local-foot-traffic',
    title: 'Increase Local Foot Traffic',
    description: 'Build a comprehensive marketing strategy to drive more local customers to your business through targeted campaigns, community engagement, and digital presence optimization.',
    industry: 'Local Business',
    duration: 12,
    isActive: true,
    startDate: new Date(),
    currentWeek: 3,
    progress: 25,
    modules: getMockModulesForGoal('increase-local-foot-traffic')
  };
}

function getMockModulesForGoal(goalId: string): MarketingModule[] {
  if (goalId === 'increase-local-foot-traffic') {
    return [
      {
        id: 'week-1',
        weekNumber: 1,
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
</ul>
        `,
        isUnlocked: true,
        isCompleted: true,
        tasks: [
          {
            id: 'task-1-1',
            taskId: 'week-1',
            title: 'Complete Brand Assessment',
            description: 'Audit your current brand elements, messaging, and positioning',
            estimatedTime: '45min',
            isCompleted: true,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'task-1-2',
            taskId: 'week-1',
            title: 'Define Target Audience',
            description: 'Create detailed customer avatars for your ideal local customers',
            estimatedTime: '30min',
            isCompleted: true
          },
          {
            id: 'task-1-3',
            taskId: 'week-1',
            title: 'Set Marketing Goals',
            description: 'Establish specific, measurable goals for foot traffic increase',
            estimatedTime: '20min',
            isCompleted: true
          }
        ]
      },
      {
        id: 'week-2',
        weekNumber: 2,
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
</ul>
        `,
        isUnlocked: true,
        isCompleted: true,
        tasks: [
          {
            id: 'task-2-1',
            taskId: 'week-2',
            title: 'Claim and Optimize Google My Business',
            description: 'Set up and fully optimize your Google My Business listing',
            estimatedTime: '60min',
            isCompleted: true
          },
          {
            id: 'task-2-2',
            taskId: 'week-2',
            title: 'Local Keyword Research',
            description: 'Research and identify local search terms your customers use',
            estimatedTime: '45min',
            isCompleted: true
          },
          {
            id: 'task-2-3',
            taskId: 'week-2',
            title: 'Review Response Strategy',
            description: 'Create a system for managing and responding to customer reviews',
            estimatedTime: '30min',
            isCompleted: true
          }
        ]
      },
      {
        id: 'week-3',
        weekNumber: 3,
        title: 'Social Media Strategy',
        description: 'Build a social media presence that drives local engagement.',
        content: `
<h2>Theme: Building Community Connections</h2>
<p>Social media isn't just about posting content - it's about building relationships with your local community and creating authentic engagement.</p>

<h3>Why this matters:</h3>
<p>Local businesses that actively engage on social media see 2x more foot traffic than those who don't. Social media helps you stay top-of-mind with local customers.</p>

<h3>Pro Tip:</h3>
<p>Focus on quality engagement over quantity of posts. Meaningful interactions with your community build stronger customer relationships.</p>

<p>This week's focus:</p>
<ul>
<li>Platform selection based on your audience</li>
<li>Content calendar creation</li>
<li>Community engagement strategies</li>
<li>Local event promotion</li>
<li>User-generated content campaigns</li>
</ul>
        `,
        isUnlocked: true,
        isCompleted: false,
        tasks: [
          {
            id: 'task-3-1',
            taskId: 'week-3',
            title: 'Choose Primary Platforms',
            description: 'Select 2-3 social platforms where your target customers are most active',
            estimatedTime: '30min',
            isCompleted: false
          },
          {
            id: 'task-3-2',
            taskId: 'week-3',
            title: 'Create Content Calendar',
            description: 'Plan 2 weeks of social media content focused on local engagement',
            estimatedTime: '60min',
            isCompleted: false
          },
          {
            id: 'task-3-3',
            taskId: 'week-3',
            title: 'Engagement Strategy',
            description: 'Develop a plan for responding to comments and messages within 24 hours',
            estimatedTime: '25min',
            isCompleted: false
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

// Get the active marketing goal
export async function getActiveGoal(): Promise<ApiResponse<MarketingGoal | null>> {
  try {
    const response = await fetch('/api/marketing/goals?isActive=true', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('Backend not available, using mock data');
      return {
        success: true,
        data: getMockActiveGoal(),
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Backend not available, using mock data:', error);
    return {
      success: true,
      data: getMockActiveGoal(),
    };
  }
}

// Get modules for a specific goal
export async function getModulesForGoal(goalId: string): Promise<ApiResponse<MarketingModule[]>> {
  try {
    const response = await fetch(`/api/marketing/modules?goalId=${goalId}`, {
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
    const response = await fetch(`/api/marketing/tasks/${taskId}`, {
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
    const response = await fetch(`/api/marketing/goals/${goalId}`, {
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
