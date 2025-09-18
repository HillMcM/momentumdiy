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