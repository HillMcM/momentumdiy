import type { 
  Task, 
  Project, 
  MarketingGoal, 
  MarketingTask,
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
import { supabase } from '../lib/supabase';

// Prefer explicit env at build time; fall back to heuristics
const fromEnv = (() => {
  if (typeof import.meta === 'undefined') return '';
  const meta = import.meta as { env?: { VITE_API_BASE_URL?: string } };
  if (!meta.env) return '';
  return meta.env.VITE_API_BASE_URL || '';
})();

function isLocalHost(hostname: string | undefined): boolean {
  if (!hostname) return false;
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '10.0.0.53';
}

// Get the appropriate backend URL based on environment
function getBackendUrl(): string {
  // Check if we're in production (Vercel)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Production domains
    if (hostname === 'momentumdiy.vercel.app' || 
        hostname === 'momentumdiy-git-main-hillmcm.vercel.app' ||
        hostname.includes('vercel.app')) {
      return 'https://momentumdiy-backend.onrender.com';
    }
    
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '10.0.0.53') {
      return 'http://10.0.0.53:3002'; // Local backend
    }
  }
  
  // Default to production backend
  return 'https://momentumdiy-backend.onrender.com';
}

const defaultProdBackend = 'https://momentumdiy-backend.onrender.com';

export const API_BASE_URL = fromEnv
  ? fromEnv.replace(/\/$/, '') + '/api'
  : ((typeof window !== 'undefined' && isLocalHost(window.location.hostname))
      ? `${getBackendUrl()}/api`
      : `${defaultProdBackend}/api`);

// The backend base without the /api suffix, for endpoints like /health
export const BACKEND_BASE_URL = API_BASE_URL.replace(/\/?api$/, '');

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOn429: boolean = true
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    // Check if we're in preview mode (skip auth)
    const isPreviewBranch = window.location.hostname !== 'app.momentumdiy.com' && 
                            window.location.hostname !== 'momentumdiy.com';

    // Get the current session for authentication (skip in preview mode)
    const authHeaders: Record<string, string> = {};
    
    if (!isPreviewBranch) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        authHeaders['Authorization'] = `Bearer ${session.access_token}`;
      }
    }

    // Only use mock responses when backend is not accessible
    // This prevents backend errors when the backend is not available
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.log('Using mock API response for localhost development');
      
      // Return appropriate mock data based on the endpoint
      if (endpoint.includes('/tasks/') && endpoint.includes('/status')) {
        // Mock task status update
        return {
          success: true,
          data: { id: endpoint.split('/')[2], status: 'completed' } as T,
          message: 'Task status updated successfully'
        };
      } else if (endpoint.includes('/tasks/') && options.method === 'PUT') {
        // Mock task update - return the task data that was sent
        const taskId = endpoint.split('/')[2];
        const body = options.body ? JSON.parse(options.body as string) : {};
        return {
          success: true,
          data: { id: taskId, ...body } as T,
          message: 'Task updated successfully'
        };
      } else if (endpoint.includes('/marketing-tasks/') && endpoint.includes('/completion')) {
        // Mock marketing task completion
        return {
          success: true,
          data: { id: endpoint.split('/')[2], isCompleted: true } as T,
          message: 'Marketing task completion updated'
        };
      } else {
        // Generic mock response
        return {
          success: true,
          data: {} as T,
          message: 'Mock response'
        };
      }
    }

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers,
      },
      ...options,
    };

    const attempt = async (triesLeft: number): Promise<ApiResponse<T>> => {
      try {
        console.log('API Request - Making request to:', url);
        console.log('API Request - Request config:', config);
        
        const response = await fetch(url, config);
        console.log('API Request - Response status:', response.status);
        console.log('API Request - Response headers:', Object.fromEntries(response.headers.entries()));
        
        const contentType = response.headers.get('content-type') || '';
        const data = contentType.includes('application/json') ? await response.json() : await response.text();
        console.log('API Request - Response data:', data);

        if (!response.ok) {
          // Backoff and retry on 429 Too Many Requests
          if (retryOn429 && response.status === 429 && triesLeft > 0) {
            // Honor Retry-After if present (seconds), else exponential backoff
            const retryAfterHeader = response.headers.get('retry-after');
            const retryAfterMs = retryAfterHeader ? parseInt(retryAfterHeader, 10) * 1000 : (1000 * Math.pow(2, 3 - triesLeft));
            await new Promise(res => setTimeout(res, isFinite(retryAfterMs) ? retryAfterMs : 1000));
            return attempt(triesLeft - 1);
          }
          const message = (data as { error?: string })?.error || `HTTP error! status: ${response.status}`;
          console.error('API Request - HTTP error:', message);
          throw new Error(message);
        }

        console.log('API Request - Success, returning data:', data);
        return data as ApiResponse<T>;
      } catch (error) {
        if (retryOn429 && triesLeft > 0 && (error as { message?: string })?.message?.includes('Too many requests')) {
          await new Promise(res => setTimeout(res, 1000 * Math.pow(2, 3 - triesLeft)));
          return attempt(triesLeft - 1);
        }
        console.error('API request failed:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        } as ApiResponse<T>;
      }
    };

    return attempt(3);
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

  async getArchivedTasks(): Promise<ApiResponse<Task[]>> {
    return this.request<Task[]>(`/tasks?archived=true`);
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

  // Marketing task completion
  async updateMarketingTaskCompletion(id: string, isCompleted: boolean): Promise<ApiResponse<MarketingTask>> {
    return this.request<MarketingTask>(`/marketing/tasks/${id}/completion`, {
      method: 'PATCH',
      body: JSON.stringify({ isCompleted }),
    });
  }

  async setActiveMarketingGoal(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/marketing/goals/${id}/activate`, {
      method: 'PATCH',
    });
  }

  // Notion sync endpoints
  async syncMarketingFromNotion(payload: { databaseId?: string; url?: string; title?: string } = {}): Promise<ApiResponse<unknown>> {
    return this.request<unknown>('/marketing/sync-notion', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async syncMarketingFromContainer(payload: { url: string }): Promise<ApiResponse<unknown>> {
    return this.request<unknown>('/marketing/sync-notion/container', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async syncMarketingGoalFromPage(payload: { title: string; url: string }): Promise<ApiResponse<unknown>> {
    return this.request<unknown>('/marketing/sync-notion/goal', {
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
  async getBaselineMetrics(): Promise<ApiResponse<unknown>> {
    return this.request<unknown>('/profile/baseline-metrics');
  }

  async saveBaselineMetrics(payload: { platform?: string; followers?: number; avgLikes?: number; avgComments?: number; avgStoryViews?: number; platforms?: Record<string, { followers?: number; avgLikes?: number; avgComments?: number; avgStoryViews?: number; }>; }): Promise<ApiResponse<unknown>> {
    return this.request<unknown>('/profile/baseline-metrics', {
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

  // Stripe API methods
  async createCheckoutSession(data: { plan: string; interval: string; successUrl: string; cancelUrl: string }): Promise<ApiResponse<{ sessionUrl: string }>> {
    console.log('API Service - Creating checkout session with data:', data);
    console.log('API Service - Using API_BASE_URL:', API_BASE_URL);
    
    const result = await this.request<{ sessionUrl: string }>('/stripe/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    console.log('API Service - Checkout session result:', result);
    return result;
  }

  // REMOVED: Old createSubscription method - replaced with createCheckoutSession

  async getSubscription(): Promise<ApiResponse<unknown>> {
    return this.request<unknown>('/stripe/subscription');
  }

  async cancelSubscription(): Promise<ApiResponse<unknown>> {
    return this.request<unknown>('/stripe/cancel-subscription', {
      method: 'POST',
    });
  }

  async getProfile(): Promise<ApiResponse<unknown>> {
    // Check if we're in preview mode
    const isPreviewBranch = window.location.hostname !== 'app.momentumdiy.com' && 
                            window.location.hostname !== 'momentumdiy.com';
    
    if (isPreviewBranch) {
      // Return mock profile data for preview mode
      return {
        success: true,
        data: {
          onboarding_completed: true,
          onboarding_data: {
            businessName: 'Preview Business',
            industry: 'marketing',
            goals: ['social_media']
          },
          subscription_status: 'active',
          has_access: true
        },
        message: 'Mock profile data for preview mode'
      };
    }
    
    return this.request<unknown>('/stripe/profile');
  }

  async updateProfile(data: any): Promise<ApiResponse<any>> {
    return this.request<any>('/stripe/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async submitFeedback(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
    rating: number;
    category: string;
  }): Promise<ApiResponse<any>> {
    return this.request<any>('/feedback', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async sendNotification(data: {
    type: string;
    data?: any;
  }): Promise<ApiResponse<any>> {
    return this.request<any>('/notifications/send', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Admin: Marketing Track Definitions
  async adminListTracks(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/marketing-admin/tracks');
  }

  async adminCreateTrack(payload: { slug: string; title: string; description?: string; phases?: any }): Promise<ApiResponse<any>> {
    return this.request<any>('/marketing-admin/tracks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async adminUpdateTrack(id: string, payload: Partial<{ slug: string; title: string; description: string; phases: any }>): Promise<ApiResponse<any>> {
    return this.request<any>(`/marketing-admin/tracks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async adminDeleteTrack(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/marketing-admin/tracks/${id}`, { method: 'DELETE' });
  }

  async adminListModules(trackId: string): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/marketing-admin/tracks/${trackId}/modules`);
  }

  async adminCreateModule(trackId: string, payload: { weekNumber: number; title: string; subtitle?: string; content?: string; proTip?: string }): Promise<ApiResponse<any>> {
    return this.request<any>(`/marketing-admin/tracks/${trackId}/modules`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async adminUpdateModule(id: string, payload: Partial<{ weekNumber: number; title: string; subtitle?: string; content?: string; proTip?: string }>): Promise<ApiResponse<any>> {
    return this.request<any>(`/marketing-admin/modules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async adminDeleteModule(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/marketing-admin/modules/${id}`, { method: 'DELETE' });
  }

  async adminListTasks(moduleId: string): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/marketing-admin/modules/${moduleId}/tasks`);
  }

  async adminCreateTask(moduleId: string, payload: { title: string; description?: string; estimatedTime?: string; orderIndex?: number }): Promise<ApiResponse<any>> {
    return this.request<any>(`/marketing-admin/modules/${moduleId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async adminUpdateTask(id: string, payload: Partial<{ title: string; description?: string; estimatedTime?: string; orderIndex?: number }>): Promise<ApiResponse<any>> {
    return this.request<any>(`/marketing-admin/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async adminDeleteTask(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/marketing-admin/tasks/${id}`, { method: 'DELETE' });
  }

  async adminPublishTrack(trackId: string, payload: { goalTitle: string; description?: string; industry?: string; duration?: number }): Promise<ApiResponse<{ goalId: string }>> {
    return this.request<{ goalId: string }>(`/marketing-admin/tracks/${trackId}/publish`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

}

export const apiService = new ApiService();
export default apiService; 