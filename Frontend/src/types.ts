export type TaskStatus = 'todo' | 'in-progress' | 'completed';
export type ProjectStatus = 'active' | 'completed';

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

export interface MarketingModule {
  id: string;
  weekNumber: number;
  title: string;
  description: string;
  content: string;
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
}

export interface Task {
  id: string;
  title: string;
  description: string;
  responsible: string;
  deadline: string | null;
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

export interface Project {
  id: string;
  name: string;
  description: string;
  deadline: string | null;
  tasks: string[]; // Array of task IDs assigned to this project
  progress: number; // Calculated based on completed tasks
  status: ProjectStatus; // Project status
  timeline: TimelinePhase[]; // Timeline phases for the project
}

export type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  start: string; // ISO date string
  end?: string; // ISO date string
  type: 'task' | 'project' | 'custom';
  refId?: string; // task or project id if applicable
  category?: EventCategory; // Marketing event category
};

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

// API Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Task API Types
export interface CreateTaskRequest {
  title: string;
  description: string;
  responsible: string;
  deadline?: string | null;
  project?: string;
  status: TaskStatus;
  projectId?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  responsible?: string;
  deadline?: string | null;
  project?: string;
  status?: TaskStatus;
  projectId?: string;
  timeSpent?: string;
  notifications?: boolean;
}

// Project API Types
export interface CreateProjectRequest {
  name: string;
  description: string;
  deadline?: string | null;
  status: ProjectStatus;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  deadline?: string | null;
  status?: ProjectStatus;
  tasks?: string[];
  timeline?: TimelinePhase[];
}

// Marketing API Types
export interface CreateMarketingGoalRequest {
  title: string;
  description: string;
  industry: string;
  duration: number;
  modules?: MarketingModule[];
}

export interface UpdateMarketingGoalRequest {
  title?: string;
  description?: string;
  industry?: string;
  duration?: number;
  isActive?: boolean;
  currentWeek?: number;
  progress?: number;
}

// Calendar API Types
export interface CreateCalendarEventRequest {
  title: string;
  description?: string;
  start: string;
  end?: string;
  type: 'task' | 'project' | 'custom';
  refId?: string;
  category?: EventCategory;
}

export interface UpdateCalendarEventRequest {
  title?: string;
  description?: string;
  start?: string;
  end?: string;
  type?: 'task' | 'project' | 'custom';
  refId?: string;
  category?: EventCategory;
}

// Asset API Types
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

export interface UpdateAssetRequest {
  name?: string;
  description?: string;
  category?: string;
  fileType?: string;
  fileSize?: number;
  url?: string;
  tags?: string[];
  isPublic?: boolean;
} 