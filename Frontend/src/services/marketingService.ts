import type { MarketingGoal, ApiResponse, Task } from '../types';
import { BACKEND_BASE_URL } from './api';

// Get published marketing tracks available for selection
export async function getPublishedTracks(): Promise<ApiResponse<MarketingGoal[]>> {
  const url = `${BACKEND_BASE_URL}/api/marketing/goals`;
  console.log('🔍 Fetching published tracks from:', url);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HTTP error:', response.status, errorText);
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
        data: []
      };
    }

    const result = await response.json();
    console.log('📊 Published tracks response:', result);

    if (!result.success) {
      console.error('❌ API error:', result.error);
      return {
        success: false,
        error: result.error || 'Unknown API error',
        data: []
      };
    }

    // Filter for published/active goals only
    const publishedTracks = (result.data || []).filter((track: MarketingGoal) => track.isActive);

    return {
      success: true,
      data: publishedTracks,
      message: result.message
    };

  } catch (error) {
    console.error('❌ Network error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
      data: []
    };
  }
}

// Activate a marketing track for the user
export async function activateTrack(trackId: string): Promise<ApiResponse<MarketingGoal>> {
  const url = `${BACKEND_BASE_URL}/api/marketing/goals/${trackId}/activate`;
  console.log('🔍 Activating track:', trackId);
  
  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HTTP error:', response.status, errorText);
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
        data: undefined
      };
    }

    const result = await response.json();
    console.log('📊 Activate track response:', result);

    return result;

  } catch (error) {
    console.error('❌ Network error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
      data: undefined
    };
  }
}

// Get active marketing goal
export async function getActiveGoal(): Promise<ApiResponse<MarketingGoal>> {
  // TEMPORARY: Return mock data for feature branch testing
  const BYPASS_AUTH = true;
  
  if (BYPASS_AUTH) {
    console.log('🔍 Using mock data for testing');
    
    const mockGoal: MarketingGoal = {
      id: 'mock-goal-id',
      title: 'Increase Local Foot Traffic',
      description: 'Ready to boost your local foot traffic? This 12-week plan will guide you through practical steps to get more people through your door. It\'s broken into four phases, each with a specific goal, and each week has a theme with actionable tasks.',
      industry: 'retail',
      duration: 12,
      isActive: true,
      currentWeek: 1,
      progress: 7,
      startDate: new Date(),
      phases: [
        {
          id: '1',
          title: 'Phase 1: Spark Traffic',
          description: 'Get people in the door immediately',
          startWeek: 1,
          endWeek: 3,
          color: '#EF8E81'
        },
        {
          id: '2',
          title: 'Phase 2: Build Momentum',
          description: 'Create lasting customer relationships',
          startWeek: 4,
          endWeek: 6,
          color: '#D4AF37'
        },
        {
          id: '3',
          title: 'Phase 3: Scale Up',
          description: 'Expand your reach and impact',
          startWeek: 7,
          endWeek: 9,
          color: '#8B5CF6'
        },
        {
          id: '4',
          title: 'Phase 4: Optimize',
          description: 'Refine and perfect your strategy',
          startWeek: 10,
          endWeek: 12,
          color: '#10B981'
        }
      ],
      currentPhase: {
        id: '1',
        title: 'Phase 1: Spark Traffic',
        description: 'Get people in the door immediately',
        startWeek: 1,
        endWeek: 3,
        color: '#EF8E81'
      },
      modules: [
        {
          id: 'mock-module-1',
          weekNumber: 1,
          title: 'Week 1: Launch a Simple In-Store Offer + Signage',
          description: 'Week 1 description',
          content: `**Theme:** Kickstart traffic with an irresistible offer and clear signage. This sets the stage for immediate ROI (Return on Investment – basically, seeing a quick payoff for your efforts). By the end of this week, you want to see new faces walking in because of your promotion.

**Why this matters:** A limited-time in-store offer (like a special discount or freebie) creates urgency and gives people a reason to visit now, not later. Coupled with eye-catching signage (signs in your window, door, or sidewalk), you'll grab the attention of anyone passing by. Signage is often the first impression of your business – make it count! (Fun fact: a study found about 76% of consumers have entered a store they'd never visited before just because a sign caught their eye. That means a good sign can literally pull new customers in off the street.)

**Pro Tip:** Keep the vibe positive and fun. When promoting the offer, be excited! For example, 'We're doing something special: this week all coffee comes with a free cookie! Hope you enjoy it!' Enthusiasm is contagious and makes customers feel like they're part of something exciting. Also, make sure your team (if you have one) is on the same page and equally informed about the offer details. Lastly, plan for a slight increase in traffic - have enough stock of the item on sale or ingredients for that free cookie, etc. Nothing's worse than drawing people in and then disappointing them by running out.`,
          tasks: [
            {
              id: 'mock-task-1',
              title: 'Measure your starting point',
              description: 'Before anything else, record your current foot traffic. For example, count how many people come in this week normally. This is your baseline to compare later. Also note any daily sales or other metrics you care about.',
              estimatedTime: '15min',
              isCompleted: false
            },
            {
              id: 'mock-task-2',
              title: 'Create a simple, juicy offer',
              description: 'Think of a promotion that will entice folks immediately. It could be "Buy one, get one 50% off," "Free dessert with any meal," or "10% off for first-time customers." Make it easy to understand and valuable enough that people feel they shouldn\'t miss it.',
              estimatedTime: '30min',
              isCompleted: false
            },
            {
              id: 'mock-task-3',
              title: 'Prepare your signage',
              description: 'Once your offer is decided, advertise it with a bold sign. For example, a chalkboard on the sidewalk or a bright poster in your window that says "This Week Only: [Your Offer]!" Use big, clear letters. Someone walking or driving by should grasp it in seconds.',
              estimatedTime: '30min',
              isCompleted: false
            },
            {
              id: 'mock-task-4',
              title: 'Promote in-store',
              description: 'Tell every customer who comes in about the offer. If they buy something, make sure they know about the deal (maybe they\'ll purchase more or tell a friend). You can say, "By the way, we have a special this week…"',
              estimatedTime: '15min',
              isCompleted: false
            },
            {
              id: 'mock-task-5',
              title: 'Run the offer for a limited time',
              description: 'A short timeframe (like one week or two weeks maximum) adds urgency. Let customers know it\'s "for a limited time." This encourages immediate action. At the end of the promo period, you\'ll also be able to clearly see the bump it gave you.',
              estimatedTime: '15min',
              isCompleted: false
            }
          ],
          isUnlocked: true,
          isCompleted: false
        }
      ]
    };

    return {
      success: true,
      data: mockGoal,
      message: 'Mock data for testing'
    };
  }

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
      const errorText = await response.text();
      console.error('❌ HTTP error:', response.status, errorText);
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
        data: undefined
      };
    }

    const result = await response.json();
    console.log('📊 Raw response:', result);

    if (!result.success) {
      console.error('❌ API error:', result.error);
      return {
        success: false,
        error: result.error || 'Unknown API error',
        data: undefined
      };
    }

    // Transform the response data to match our frontend types
    const transformedData = result.data ? {
      ...result.data,
      startDate: result.data.startDate ? new Date(result.data.startDate) : new Date(),
      weekStartDates: result.data.weekStartDates?.map((date: string) => new Date(date)) || [],
      lastWeekAdvancement: result.data.lastWeekAdvancement ? new Date(result.data.lastWeekAdvancement) : new Date(),
      modules: result.data.modules?.map((module: any) => ({
        ...module,
        unlockedAt: module.unlockedAt ? new Date(module.unlockedAt) : null,
        completedAt: module.completedAt ? new Date(module.completedAt) : null,
      })) || []
    } : null;

    console.log('✅ Transformed data:', transformedData);
    return {
      success: true,
      data: transformedData,
      message: result.message
    };

  } catch (error) {
    console.error('❌ Network error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
      data: undefined
    };
  }
}

// Get marketing goal by ID
export async function getMarketingGoal(goalId: string): Promise<ApiResponse<MarketingGoal>> {
  const url = `${BACKEND_BASE_URL}/api/marketing/goals/${goalId}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
        data: undefined
      };
    }

    const result = await response.json();
    
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Unknown API error',
        data: undefined
      };
    }

    // Transform dates
    const transformedData = result.data ? {
      ...result.data,
      startDate: result.data.startDate ? new Date(result.data.startDate) : new Date(),
      weekStartDates: result.data.weekStartDates?.map((date: string) => new Date(date)) || [],
      lastWeekAdvancement: result.data.lastWeekAdvancement ? new Date(result.data.lastWeekAdvancement) : new Date(),
      modules: result.data.modules?.map((module: any) => ({
        ...module,
        unlockedAt: module.unlockedAt ? new Date(module.unlockedAt) : null,
        completedAt: module.completedAt ? new Date(module.completedAt) : null,
      })) || []
    } : null;

    return {
      success: true,
      data: transformedData,
      message: result.message
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
      data: undefined
    };
  }
}

// Update marketing goal progress
export async function updateGoalProgress(goalId: string, progress: number): Promise<ApiResponse<MarketingGoal>> {
  const url = `${BACKEND_BASE_URL}/api/marketing/goals/${goalId}/progress`;
  
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ progress })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
        data: undefined
      };
    }

    const result = await response.json();
    return result;

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
      data: undefined
    };
  }
}

// Convert marketing tasks to regular tasks
export function convertMarketingTasksToTasks(marketingGoal: MarketingGoal): Task[] {
  const tasks: Task[] = [];
  
  marketingGoal.modules?.forEach((module) => {
    module.tasks?.forEach((task) => {
      tasks.push({
        id: task.id,
        title: task.title,
        description: task.description || '',
        responsible: 'User', // Default responsible person
        deadline: task.dueDate ? task.dueDate.toISOString() : null,
        project: marketingGoal.title,
        timeSpent: '0h',
        notifications: false,
        status: task.isCompleted ? 'completed' : 'todo',
        isArchived: false,
        projectId: marketingGoal.id,
        marketingTrack: {
          goalId: marketingGoal.id,
          moduleId: module.id,
          marketingTaskId: task.id
        }
      });
    });
  });
  
  return tasks;
}

// Toggle marketing task completion status (placeholder function)
export async function toggleMarketingTask(taskId: string, isCompleted: boolean): Promise<ApiResponse<any>> {
  // This function would typically make an API call to update task status
  // For now, return a success response since we don't have this endpoint implemented
  return {
    success: true,
    data: { taskId, isCompleted },
    message: 'Task status updated successfully'
  };
}