// Core Types
export type TaskStatus = 'todo' | 'in-progress' | 'completed';
export type ProjectStatus = 'active' | 'completed';

// Email Preferences Types
export interface EmailPreferences {
  weekly_progress: boolean;
  task_reminders: boolean;
  marketing_emails: boolean;
  trial_emails: boolean; // Always true, cannot be disabled
}

export type EventCategory = 
  | 'meeting'
  | 'social-post'
  | 'networking'
  | 'content-creation'
  | 'email-campaign'
  | 'ad-campaign'
  | 'website-update'
  | 'client-presentation'
  | 'strategy-session'
  | 'training'
  | 'other';

// Timeline and Project Types
export interface TimelinePhase {
  id: string;
  name: string;
  description: string;
  startDate: Date | null;
  endDate: Date | null;
  status: 'not-started' | 'in-progress' | 'completed';
  tasks: string[]; // Array of task IDs assigned to this phase
  order: number; // For maintaining phase order
}

export interface Project {
  id: string;
  name: string;
  description: string;
  deadline: Date | null;
  tasks: string[]; // Array of task IDs assigned to this project
  progress: number; // Calculated based on completed tasks
  status: ProjectStatus; // Project status
  timeline: TimelinePhase[]; // Timeline phases for the project
}

// Task Types
export interface Task {
  id: string;
  title: string;
  description: string;
  responsible: string;
  deadline: Date | null;
  project: string;
  timeSpent: string;
  notifications: boolean;
  status: TaskStatus;
  projectId?: string; // ID of the project this task belongs to
  marketingTrack?: {
    goalId: string;
    moduleId: string;
    marketingTaskId: string;
  };
}

// Marketing Types
export interface MarketingModule {
  id: string;
  weekNumber: number;
  title: string;
  description: string;
  content: string;
  proTip?: string;
  tasks: MarketingTask[];
  isUnlocked: boolean;
  isCompleted: boolean;
}

export interface MarketingTask {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  isCompleted: boolean;
  dueDate?: Date;
  taskId?: string; // Links to the corresponding Task in the main task tracker
}

export interface MarketingPhase {
  id: string;
  title: string;
  description: string;
  startWeek: number;
  endWeek: number;
  color: string;
}

export interface MarketingGoal {
  id: string;
  title: string;
  description: string;
  industry: string;
  duration: number; // in weeks
  modules: MarketingModule[];
  isActive: boolean;
  startDate?: Date;
  currentWeek: number;
  progress: number; // percentage complete
  weekStartDates?: Date[]; // Array of dates when each week was started
  lastWeekAdvancement?: Date; // Date when the last week advancement occurred
  phases?: MarketingPhase[]; // Phase information from track definition
  currentPhase?: MarketingPhase; // Current phase based on current week
}

// Calendar Types
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string; // ISO date string
  end?: string; // ISO date string
  type: 'task' | 'project' | 'custom';
  refId?: string; // task or project id if applicable
  category?: EventCategory; // Marketing event category
}

// Asset Library Types
export interface AssetCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Asset {
  id: string;
  name: string;
  description: string;
  category: string;
  fileType: string;
  fileSize: number;
  uploadDate: Date;
  url: string;
  tags: string[];
  isPublic: boolean;
}

export interface BrandingKit {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  assets: string[]; // Array of asset IDs
  isComplete: boolean;
  completionPercentage: number;
}

export interface ShareLink {
  id: string;
  name: string;
  email: string;
  permissions: string[];
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
  accessCode: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request Types
export interface CreateTaskRequest {
  title: string;
  description?: string;
  responsible?: string;
  deadline?: string;
  projectId?: string;
  timeSpent?: string;
  notifications?: boolean;
  status?: TaskStatus;
  marketingTrack?: {
    goalId: string;
    moduleId: string;
    marketingTaskId: string;
  };
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  id: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  deadline?: string;
  status?: ProjectStatus;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  id: string;
}

export interface CreateMarketingGoalRequest {
  title: string;
  description?: string;
  industry?: string;
  duration: number;
  isActive?: boolean;
  startDate?: string;
}

export interface UpdateMarketingGoalRequest extends Partial<CreateMarketingGoalRequest> {
  id: string;
}

export interface CreateCalendarEventRequest {
  title: string;
  description?: string;
  start: string;
  end?: string;
  type: 'task' | 'project' | 'custom';
  refId?: string;
  category?: EventCategory;
}

export interface UpdateCalendarEventRequest extends Partial<CreateCalendarEventRequest> {
  id: string;
}

export interface CreateAssetRequest {
  name: string;
  description?: string;
  category: string;
  fileType: string;
  fileSize: number;
  url: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface UpdateAssetRequest extends Partial<CreateAssetRequest> {
  id: string;
}

export interface CreateBrandingKitRequest {
  name: string;
  description?: string;
  assets?: string[];
}

export interface UpdateBrandingKitRequest extends Partial<CreateBrandingKitRequest> {
  id: string;
}

export interface CreateShareLinkRequest {
  name: string;
  email: string;
  permissions: string[];
  expiresAt: string;
}

export interface UpdateShareLinkRequest extends Partial<CreateShareLinkRequest> {
  id: string;
}

// Database Types (for Supabase)
export interface DatabaseTask {
  id: string;
  title: string;
  description: string | null;
  responsible: string | null;
  deadline: string | null;
  project_id: string | null;
  time_spent: string;
  notifications: boolean;
  status: TaskStatus;
  marketing_track: any | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseProject {
  id: string;
  name: string;
  description: string | null;
  deadline: string | null;
  status: ProjectStatus;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseMarketingGoal {
  id: string;
  title: string;
  description: string | null;
  industry: string | null;
  duration: number;
  is_active: boolean;
  start_date: string | null;
  current_week: number;
  progress: number;
  week_start_dates: any | null;
  last_week_advancement: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseCalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  type: 'task' | 'project' | 'custom';
  ref_id: string | null;
  category: EventCategory | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseAsset {
  id: string;
  name: string;
  description: string | null;
  category: string;
  file_type: string;
  file_size: number;
  upload_date: string;
  url: string;
  tags: string[] | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
} 