import { logger } from '../utils/logger';

// Clean, simple API client for admin operations
function getBackendUrl(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Production domains
    if (hostname === 'momentumdiy.vercel.app' || 
        hostname === 'momentumdiy-git-main-hillmcm.vercel.app' ||
        hostname === 'momentumdiy.com') {
      return 'https://momentumdiy-backend.onrender.com';
    }
    
    // Feature branch deployments
    if (hostname.includes('vercel.app')) {
      return 'https://momentumdiy-backend.onrender.com';
    }
    
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3001';
    }
  }
  
  // Default to production backend
  return 'https://momentumdiy-backend.onrender.com';
}

const API_BASE_URL = getBackendUrl();

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}/api/admin/tracks${endpoint}`;
    logger.debug('Admin API request', { url, method: options.method });
    
    // Get authentication token
    const { supabase } = await import('../lib/supabase');
    const { data: { session } } = await supabase.auth.getSession();
    logger.debug('Admin API session check', { hasSession: !!session });
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` }),
        ...options.headers,
      },
      ...options,
    });

    logger.debug('API response status', { status: response.status });
    const data = await response.json();
    logger.debug('API response data', { data });
    return data;
  } catch (error) {
    logger.error('API request failed', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error' 
    };
  }
}

// Track Definitions
export const adminApi = {
  // Track Definitions
  async listTrackDefinitions(): Promise<ApiResponse<any[]>> {
    return apiRequest('/definitions');
  },

  async createTrackDefinition(data: any): Promise<ApiResponse<any>> {
    return apiRequest('/definitions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTrackDefinition(id: string, data: any): Promise<ApiResponse<any>> {
    return apiRequest(`/definitions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteTrackDefinition(id: string): Promise<ApiResponse<any>> {
    return apiRequest(`/definitions/${id}`, {
      method: 'DELETE',
    });
  },

  // Track Modules
  async listTrackModules(trackId: string): Promise<ApiResponse<any[]>> {
    return apiRequest(`/definitions/${trackId}/modules`);
  },

  async createTrackModule(trackId: string, data: any): Promise<ApiResponse<any>> {
    return apiRequest(`/definitions/${trackId}/modules`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTrackModule(id: string, data: any): Promise<ApiResponse<any>> {
    return apiRequest(`/modules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteTrackModule(id: string): Promise<ApiResponse<any>> {
    return apiRequest(`/modules/${id}`, {
      method: 'DELETE',
    });
  },

  // Track Tasks
  async listTrackTasks(moduleId: string): Promise<ApiResponse<any[]>> {
    return apiRequest(`/modules/${moduleId}/tasks`);
  },

  async createTrackTask(moduleId: string, data: any): Promise<ApiResponse<any>> {
    return apiRequest(`/modules/${moduleId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTrackTask(id: string, data: any): Promise<ApiResponse<any>> {
    return apiRequest(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteTrackTask(id: string): Promise<ApiResponse<any>> {
    return apiRequest(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  // Bulk Operations
  async generateTrackModules(trackId: string): Promise<ApiResponse<any>> {
    return apiRequest(`/definitions/${trackId}/generate-modules`, {
      method: 'POST',
    });
  },

  async createBulkTasks(moduleId: string, tasksText: string): Promise<ApiResponse<any>> {
    return apiRequest(`/modules/${moduleId}/bulk-tasks`, {
      method: 'POST',
      body: JSON.stringify({ tasks_text: tasksText }),
    });
  },

  async createTasks(moduleId: string, tasks: Array<{title: string, description: string, estimated_time: string}>): Promise<ApiResponse<any>> {
    return apiRequest(`/modules/${moduleId}/tasks`, {
      method: 'POST',
      body: JSON.stringify({ tasks }),
    });
  },

  // Publishing Operations
  async publishTrack(trackId: string): Promise<ApiResponse<any>> {
    return apiRequest(`/definitions/${trackId}/publish`, {
      method: 'POST',
    });
  },

  // Goals Management
  async listPublishedGoals(): Promise<ApiResponse<any[]>> {
    return apiRequest('/goals');
  },

  async activateGoal(goalId: string): Promise<ApiResponse<any>> {
    return apiRequest(`/goals/${goalId}/activate`, {
      method: 'POST',
    });
  },
};
