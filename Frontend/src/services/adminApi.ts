// Clean, simple API client for admin operations
const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:3001' : '';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}/api/admin/tracks${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
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
