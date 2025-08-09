import { supabase } from '../config/supabase';
import { 
  Task, 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  ApiResponse,
  DatabaseTask 
} from '../types';

export class TaskService {
  /**
   * Get all tasks with optional filtering
   */
  static async getTasks(projectId?: string, status?: string): Promise<ApiResponse<Task[]>> {
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      const tasks: Task[] = (data as DatabaseTask[]).map(this.mapDatabaseTaskToTask);

      return {
        success: true,
        data: tasks
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get a single task by ID
   */
  static async getTaskById(id: string): Promise<ApiResponse<Task>> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      if (!data) {
        return {
          success: false,
          error: 'Task not found'
        };
      }

      const task = this.mapDatabaseTaskToTask(data as DatabaseTask);

      return {
        success: true,
        data: task
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Create a new task
   */
  static async createTask(taskData: CreateTaskRequest): Promise<ApiResponse<Task>> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title: taskData.title,
          description: taskData.description || '',
          responsible: taskData.responsible || '',
          deadline: taskData.deadline ? new Date(taskData.deadline).toISOString() : null,
          project_id: taskData.projectId || null,
          time_spent: taskData.timeSpent || '0h',
          notifications: taskData.notifications ?? true,
          status: taskData.status || 'todo',
          marketing_track: taskData.marketingTrack || null
        }])
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      const task = this.mapDatabaseTaskToTask(data as DatabaseTask);

      return {
        success: true,
        data: task,
        message: 'Task created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Update an existing task
   */
  static async updateTask(id: string, updates: UpdateTaskRequest): Promise<ApiResponse<Task>> {
    try {
      const updateData: any = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.responsible !== undefined) updateData.responsible = updates.responsible;
      if (updates.deadline !== undefined) {
        updateData.deadline = updates.deadline ? new Date(updates.deadline).toISOString() : null;
      }
      if (updates.projectId !== undefined) updateData.project_id = updates.projectId;
      if (updates.timeSpent !== undefined) updateData.time_spent = updates.timeSpent;
      if (updates.notifications !== undefined) updateData.notifications = updates.notifications;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.marketingTrack !== undefined) updateData.marketing_track = updates.marketingTrack;

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      if (!data) {
        return {
          success: false,
          error: 'Task not found'
        };
      }

      const task = this.mapDatabaseTaskToTask(data as DatabaseTask);

      return {
        success: true,
        data: task,
        message: 'Task updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Delete a task
   */
  static async deleteTask(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        message: 'Task deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get tasks by project ID
   */
  static async getTasksByProject(projectId: string): Promise<ApiResponse<Task[]>> {
    return this.getTasks(projectId);
  }

  /**
   * Update task status
   */
  static async updateTaskStatus(id: string, status: string): Promise<ApiResponse<Task>> {
    return this.updateTask(id, { id, status: status as any });
  }

  /**
   * Update task time spent
   */
  static async updateTaskTimeSpent(id: string, timeSpent: string): Promise<ApiResponse<Task>> {
    return this.updateTask(id, { id, timeSpent });
  }

  /**
   * Map database task to frontend task format
   */
  private static mapDatabaseTaskToTask(dbTask: DatabaseTask): Task {
    const task: Task = {
      id: dbTask.id,
      title: dbTask.title,
      description: dbTask.description || '',
      responsible: dbTask.responsible || '',
      deadline: dbTask.deadline ? new Date(dbTask.deadline) : null,
      project: '',
      timeSpent: dbTask.time_spent,
      notifications: dbTask.notifications,
      status: dbTask.status,
    };
    if (dbTask.project_id) task.projectId = dbTask.project_id;
    if (dbTask.marketing_track) task.marketingTrack = dbTask.marketing_track;
    return task;
  }
} 