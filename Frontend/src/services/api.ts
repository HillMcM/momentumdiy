import type { 
  Task, 
  Project, 
  MarketingGoal, 
  CalendarEvent,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateMarketingGoalRequest,
  UpdateMarketingGoalRequest,
  CreateCalendarEventRequest,
  UpdateCalendarEventRequest,
  ApiResponse
} from '../types';

// Prefer explicit env at build time; fall back to heuristics
const fromEnv = (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_API_BASE_URL)
  ? (import.meta as any).env.VITE_API_BASE_URL as string
  : '';

function isLocalHost(hostname: string | undefined): boolean {
  if (!hostname) return false;
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

const defaultProdBackend = 'https://momentumdiy-backend.onrender.com';

export const API_BASE_URL = fromEnv
  ? fromEnv.replace(/\/$/, '') + '/api'
  : ((typeof window !== 'undefined' && isLocalHost(window.location.hostname))
      ? 'http://localhost:3001/api'
      : `${defaultProdBackend}/api`);

// The backend base without the /api suffix, for endpoints like /health
export const BACKEND_BASE_URL = API_BASE_URL.replace(/\/?api$/, '');

class ApiService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      } as ApiResponse<T>;
    }
  }

  // Task API methods
  async getTasks(projectId?: string, status?: string): Promise<ApiResponse<Task[]>> {
    const params = new URLSearchParams();
    if (projectId) params.append('projectId', projectId);
    if (status) params.append('status', status);
    
    return this.request<Task[]>(`/tasks?${params.toString()}`);
  }

  async getTaskById(id: string): Promise<ApiResponse<Task>> {
    return this.request<Task>(`/tasks/${id}`);
  }

  async createTask(taskData: CreateTaskRequest): Promise<ApiResponse<Task>> {
    return this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(id: string, updates: UpdateTaskRequest): Promise<ApiResponse<Task>> {
    return this.request<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTask(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async updateTaskStatus(id: string, status: string): Promise<ApiResponse<Task>> {
    return this.request<Task>(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async updateTaskTimeSpent(id: string, timeSpent: string): Promise<ApiResponse<Task>> {
    return this.request<Task>(`/tasks/${id}/time-spent`, {
      method: 'PATCH',
      body: JSON.stringify({ timeSpent }),
    });
  }

  // Project API methods
  async getProjects(status?: string): Promise<ApiResponse<Project[]>> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    
    return this.request<Project[]>(`/projects?${params.toString()}`);
  }

  async getProjectById(id: string): Promise<ApiResponse<Project>> {
    return this.request<Project>(`/projects/${id}`);
  }

  async createProject(projectData: CreateProjectRequest): Promise<ApiResponse<Project>> {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(id: string, updates: UpdateProjectRequest): Promise<ApiResponse<Project>> {
    return this.request<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteProject(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  async updateProjectProgress(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/projects/${id}/progress`, {
      method: 'PATCH',
    });
  }

  // Marketing API methods
  async getMarketingGoals(): Promise<ApiResponse<MarketingGoal[]>> {
    return this.request<MarketingGoal[]>('/marketing/goals');
  }

  async getActiveMarketingGoal(): Promise<ApiResponse<MarketingGoal | null>> {
    return this.request<MarketingGoal | null>('/marketing/goals/active');
  }

  async getMarketingGoalById(id: string): Promise<ApiResponse<MarketingGoal>> {
    return this.request<MarketingGoal>(`/marketing/goals/${id}`);
  }

  async createMarketingGoal(goalData: CreateMarketingGoalRequest): Promise<ApiResponse<MarketingGoal>> {
    return this.request<MarketingGoal>('/marketing/goals', {
      method: 'POST',
      body: JSON.stringify(goalData),
    });
  }

  async updateMarketingGoal(id: string, updates: UpdateMarketingGoalRequest): Promise<ApiResponse<MarketingGoal>> {
    return this.request<MarketingGoal>(`/marketing/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async setActiveMarketingGoal(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/marketing/goals/${id}/activate`, {
      method: 'PATCH',
    });
  }

  // Notion sync endpoints
  async syncMarketingFromNotion(payload: { databaseId?: string; url?: string; title?: string } = {}): Promise<ApiResponse<any>> {
    return this.request<any>('/marketing/sync-notion', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async syncMarketingFromContainer(payload: { url: string }): Promise<ApiResponse<any>> {
    return this.request<any>('/marketing/sync-notion/container', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async syncMarketingGoalFromPage(payload: { title: string; url: string }): Promise<ApiResponse<any>> {
    return this.request<any>('/marketing/sync-notion/goal', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Calendar API methods
  async getCalendarEvents(startDate?: string, endDate?: string): Promise<ApiResponse<CalendarEvent[]>> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return this.request<CalendarEvent[]>(`/calendar/events?${params.toString()}`);
  }

  async getCalendarEventById(id: string): Promise<ApiResponse<CalendarEvent>> {
    return this.request<CalendarEvent>(`/calendar/events/${id}`);
  }

  async createCalendarEvent(eventData: CreateCalendarEventRequest): Promise<ApiResponse<CalendarEvent>> {
    return this.request<CalendarEvent>('/calendar/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateCalendarEvent(id: string, updates: UpdateCalendarEventRequest): Promise<ApiResponse<CalendarEvent>> {
    return this.request<CalendarEvent>(`/calendar/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteCalendarEvent(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/calendar/events/${id}`, {
      method: 'DELETE',
    });
  }

  async getEventsByDateRange(startDate: string, endDate: string): Promise<ApiResponse<CalendarEvent[]>> {
    return this.request<CalendarEvent[]>(`/calendar/events/date-range?startDate=${startDate}&endDate=${endDate}`);
  }

  async getEventsByType(type: 'task' | 'project' | 'custom'): Promise<ApiResponse<CalendarEvent[]>> {
    return this.request<CalendarEvent[]>(`/calendar/events/type/${type}`);
  }

  async getEventsByCategory(category: string): Promise<ApiResponse<CalendarEvent[]>> {
    return this.request<CalendarEvent[]>(`/calendar/events/category/${category}`);
  }

  // Profile API methods
  async getBaselineMetrics(): Promise<ApiResponse<any>> {
    return this.request<any>('/profile/baseline-metrics');
  }

  async saveBaselineMetrics(payload: { platform?: string; followers?: number; avgLikes?: number; avgComments?: number; avgStoryViews?: number; platforms?: Record<string, { followers?: number; avgLikes?: number; avgComments?: number; avgStoryViews?: number; }>; }): Promise<ApiResponse<any>> {
    return this.request<any>('/profile/baseline-metrics', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getContentPillars(): Promise<ApiResponse<string[]>> {
    return this.request<string[]>('/profile/content-pillars');
  }

  async saveContentPillars(pillars: string[]): Promise<ApiResponse<string[]>> {
    return this.request<string[]>('/profile/content-pillars', {
      method: 'POST',
      body: JSON.stringify({ pillars }),
    });
  }
}

export const apiService = new ApiService();
export default apiService; 