import { supabase } from '../config/supabase';
import { 
  Project, 
  CreateProjectRequest, 
  UpdateProjectRequest, 
  ApiResponse,
  DatabaseProject,
  TimelinePhase 
} from '../types';
import { TaskService } from './taskService';

export class ProjectService {
  /**
   * Get all projects with optional filtering
   */
  static async getProjects(status?: string): Promise<ApiResponse<Project[]>> {
    try {
      let query = supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

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

      const projects: Project[] = await Promise.all(
        (data as DatabaseProject[]).map(async (dbProject) => {
          return await this.mapDatabaseProjectToProject(dbProject);
        })
      );

      return {
        success: true,
        data: projects
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get a single project by ID
   */
  static async getProjectById(id: string): Promise<ApiResponse<Project>> {
    try {
      const { data, error } = await supabase
        .from('projects')
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
          error: 'Project not found'
        };
      }

      const project = await this.mapDatabaseProjectToProject(data as DatabaseProject);

      return {
        success: true,
        data: project
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Create a new project
   */
  static async createProject(projectData: CreateProjectRequest): Promise<ApiResponse<Project>> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          name: projectData.name,
          description: projectData.description || '',
          deadline: projectData.deadline ? new Date(projectData.deadline).toISOString() : null,
          status: projectData.status || 'active',
          progress: 0
        }])
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      const project = await this.mapDatabaseProjectToProject(data as DatabaseProject);

      return {
        success: true,
        data: project,
        message: 'Project created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Update an existing project
   */
  static async updateProject(id: string, updates: UpdateProjectRequest): Promise<ApiResponse<Project>> {
    try {
      const updateData: any = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.deadline !== undefined) {
        updateData.deadline = updates.deadline ? new Date(updates.deadline).toISOString() : null;
      }
      if (updates.status !== undefined) updateData.status = updates.status;

      const { data, error } = await supabase
        .from('projects')
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
          error: 'Project not found'
        };
      }

      const project = await this.mapDatabaseProjectToProject(data as DatabaseProject);

      return {
        success: true,
        data: project,
        message: 'Project updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Delete a project
   */
  static async deleteProject(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('projects')
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
        message: 'Project deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get timeline phases for a project
   */
  static async getTimelinePhases(projectId: string): Promise<ApiResponse<TimelinePhase[]>> {
    try {
      const { data, error } = await supabase
        .from('timeline_phases')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      const phases: TimelinePhase[] = data.map((phase: any) => ({
        id: phase.id,
        name: phase.name,
        description: phase.description || '',
        startDate: phase.start_date ? new Date(phase.start_date) : null,
        endDate: phase.end_date ? new Date(phase.end_date) : null,
        status: phase.status,
        tasks: [], // This would need to be populated from task data
        order: phase.order_index
      }));

      return {
        success: true,
        data: phases
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Create a timeline phase
   */
  static async createTimelinePhase(phaseData: Omit<TimelinePhase, 'id'> & { projectId: string }): Promise<ApiResponse<TimelinePhase>> {
    try {
      const { data, error } = await supabase
        .from('timeline_phases')
        .insert([{
          project_id: phaseData.projectId,
          name: phaseData.name,
          description: phaseData.description,
          start_date: phaseData.startDate ? new Date(phaseData.startDate).toISOString() : null,
          end_date: phaseData.endDate ? new Date(phaseData.endDate).toISOString() : null,
          status: phaseData.status,
          order_index: phaseData.order
        }])
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      const phase: TimelinePhase = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        startDate: data.start_date ? new Date(data.start_date) : null,
        endDate: data.end_date ? new Date(data.end_date) : null,
        status: data.status,
        tasks: [],
        order: data.order_index
      };

      return {
        success: true,
        data: phase,
        message: 'Timeline phase created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Update project progress based on completed tasks
   */
  static async updateProjectProgress(projectId: string): Promise<ApiResponse<void>> {
    try {
      // Get all tasks for the project
      const tasksResponse = await TaskService.getTasksByProject(projectId);
      
      if (!tasksResponse.success || !tasksResponse.data) {
        return {
          success: false,
          error: 'Failed to fetch project tasks'
        };
      }

      const tasks = tasksResponse.data;
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(task => task.status === 'completed').length;
      
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Update project progress
      const { error } = await supabase
        .from('projects')
        .update({ progress })
        .eq('id', projectId);

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        message: 'Project progress updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Map database project to frontend project format
   */
  private static async mapDatabaseProjectToProject(dbProject: DatabaseProject): Promise<Project> {
    // Get tasks for this project
    const tasksResponse = await TaskService.getTasksByProject(dbProject.id);
    const tasks = tasksResponse.success ? tasksResponse.data || [] : [];
    const taskIds = tasks.map(task => task.id);

    // Get timeline phases
    const phasesResponse = await this.getTimelinePhases(dbProject.id);
    const timeline = phasesResponse.success ? phasesResponse.data || [] : [];

    return {
      id: dbProject.id,
      name: dbProject.name,
      description: dbProject.description || '',
      deadline: dbProject.deadline ? new Date(dbProject.deadline) : null,
      tasks: taskIds,
      progress: dbProject.progress,
      status: dbProject.status,
      timeline
    };
  }
} 