/**
 * Project Service Helpers - Modular utilities for project management
 * 
 * This module provides:
 * - Reusable data mappers
 * - Validation utilities
 * - Response builders
 * - Error handlers
 */

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

// ============================================================================
// DATA MAPPERS
// ============================================================================

export class ProjectDataMapper {
  /**
   * Map database project to frontend project format
   */
  static async mapDatabaseProjectToProject(dbProject: DatabaseProject): Promise<Project> {
    // Get tasks for this project
    const tasksResponse = await TaskService.getTasksByProject(dbProject.id);
    const tasks = tasksResponse.success ? tasksResponse.data || [] : [];
    const taskIds = tasks.map(task => task.id);

    // Get timeline phases
    const phasesResponse = await TimelineQueries.getPhases(dbProject.id);
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

  /**
   * Map timeline phase data from database
   */
  static mapDatabasePhaseToPhase(dbPhase: any): TimelinePhase {
    return {
      id: dbPhase.id,
      name: dbPhase.name,
      description: dbPhase.description || '',
      startDate: dbPhase.start_date ? new Date(dbPhase.start_date) : null,
      endDate: dbPhase.end_date ? new Date(dbPhase.end_date) : null,
      status: dbPhase.status,
      tasks: [],
      order: dbPhase.order_index
    };
  }

  /**
   * Map create project request to database format
   */
  static mapCreateRequestToDb(projectData: CreateProjectRequest): any {
    return {
      name: projectData.name,
      description: projectData.description || '',
      deadline: projectData.deadline ? new Date(projectData.deadline).toISOString() : null,
      status: projectData.status || 'active',
      progress: 0
    };
  }

  /**
   * Map update project request to database format
   */
  static mapUpdateRequestToDb(updates: UpdateProjectRequest): any {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.deadline !== undefined) {
      updateData.deadline = updates.deadline ? new Date(updates.deadline).toISOString() : null;
    }
    if (updates.status !== undefined) updateData.status = updates.status;

    return updateData;
  }

  /**
   * Map timeline phase request to database format
   */
  static mapPhaseRequestToDb(phaseData: Omit<TimelinePhase, 'id'> & { projectId: string }): any {
    return {
      project_id: phaseData.projectId,
      name: phaseData.name,
      description: phaseData.description,
      start_date: phaseData.startDate ? new Date(phaseData.startDate).toISOString() : null,
      end_date: phaseData.endDate ? new Date(phaseData.endDate).toISOString() : null,
      status: phaseData.status,
      order_index: phaseData.order
    };
  }
}

// ============================================================================
// DATABASE QUERIES
// ============================================================================

export class ProjectQueries {
  /**
   * Get all projects with optional filtering
   */
  static async getAll(status?: string) {
    let query = supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    return await query;
  }

  /**
   * Get project by ID
   */
  static async getById(id: string) {
    return await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
  }

  /**
   * Create new project
   */
  static async create(projectData: any) {
    return await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single();
  }

  /**
   * Update project
   */
  static async update(id: string, updateData: any) {
    return await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
  }

  /**
   * Delete project
   */
  static async delete(id: string) {
    return await supabase
      .from('projects')
      .delete()
      .eq('id', id);
  }

  /**
   * Update project progress
   */
  static async updateProgress(projectId: string, progress: number) {
    return await supabase
      .from('projects')
      .update({ progress })
      .eq('id', projectId);
  }
}

export class TimelineQueries {
  /**
   * Get timeline phases for a project
   */
  static async getPhases(projectId: string): Promise<ApiResponse<TimelinePhase[]>> {
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

      const phases: TimelinePhase[] = data.map(dbPhase => 
        ProjectDataMapper.mapDatabasePhaseToPhase(dbPhase)
      );

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
   * Create timeline phase
   */
  static async createPhase(phaseData: any) {
    return await supabase
      .from('timeline_phases')
      .insert([phaseData])
      .select()
      .single();
  }
}

// ============================================================================
// VALIDATION
// ============================================================================

export class ProjectValidator {
  /**
   * Validate create project request
   */
  static validateCreateRequest(projectData: CreateProjectRequest): { valid: boolean; error?: string } {
    if (!projectData.name || projectData.name.trim().length === 0) {
      return { valid: false, error: 'Project name is required' };
    }

    if (projectData.name.length > 255) {
      return { valid: false, error: 'Project name must be 255 characters or less' };
    }

    if (projectData.deadline) {
      const deadline = new Date(projectData.deadline);
      if (isNaN(deadline.getTime())) {
        return { valid: false, error: 'Invalid deadline date format' };
      }
    }

    const validStatuses = ['active', 'completed', 'archived', 'on-hold'];
    if (projectData.status && !validStatuses.includes(projectData.status)) {
      return { valid: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` };
    }

    return { valid: true };
  }

  /**
   * Validate update project request
   */
  static validateUpdateRequest(updates: UpdateProjectRequest): { valid: boolean; error?: string } {
    if (updates.name !== undefined && (!updates.name || updates.name.trim().length === 0)) {
      return { valid: false, error: 'Project name cannot be empty' };
    }

    if (updates.name && updates.name.length > 255) {
      return { valid: false, error: 'Project name must be 255 characters or less' };
    }

    if (updates.deadline) {
      const deadline = new Date(updates.deadline);
      if (isNaN(deadline.getTime())) {
        return { valid: false, error: 'Invalid deadline date format' };
      }
    }

    const validStatuses = ['active', 'completed', 'archived', 'on-hold'];
    if (updates.status && !validStatuses.includes(updates.status)) {
      return { valid: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` };
    }

    return { valid: true };
  }

  /**
   * Validate timeline phase data
   */
  static validatePhaseData(phaseData: Omit<TimelinePhase, 'id'> & { projectId: string }): { valid: boolean; error?: string } {
    if (!phaseData.name || phaseData.name.trim().length === 0) {
      return { valid: false, error: 'Phase name is required' };
    }

    if (!phaseData.projectId) {
      return { valid: false, error: 'Project ID is required' };
    }

    if (phaseData.startDate && phaseData.endDate) {
      const start = new Date(phaseData.startDate);
      const end = new Date(phaseData.endDate);
      if (start > end) {
        return { valid: false, error: 'End date must be after start date' };
      }
    }

    return { valid: true };
  }
}

// ============================================================================
// PROGRESS CALCULATOR
// ============================================================================

export class ProgressCalculator {
  /**
   * Calculate project progress based on tasks
   */
  static async calculateProjectProgress(projectId: string): Promise<{ progress: number; totalTasks: number; completedTasks: number }> {
    const tasksResponse = await TaskService.getTasksByProject(projectId);
    
    if (!tasksResponse.success || !tasksResponse.data) {
      return { progress: 0, totalTasks: 0, completedTasks: 0 };
    }

    const tasks = tasksResponse.data;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return { progress, totalTasks, completedTasks };
  }
}

// ============================================================================
// ERROR HANDLER
// ============================================================================

export class ErrorHandler {
  /**
   * Handle database errors and create appropriate response
   */
  static handleError(error: any): ApiResponse<never> {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message
      };
    }
    
    return {
      success: false,
      error: 'Unknown error occurred'
    };
  }

  /**
   * Handle not found errors
   */
  static handleNotFound(resourceType: string): ApiResponse<never> {
    return {
      success: false,
      error: `${resourceType} not found`
    };
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(error: string): ApiResponse<never> {
    return {
      success: false,
      error: error
    };
  }
}

// ============================================================================
// RESPONSE BUILDER
// ============================================================================

export class ResponseBuilder {
  /**
   * Build success response
   */
  static success<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      ...(message && { message })
    };
  }

  /**
   * Build error response
   */
  static error(error: string): ApiResponse<never> {
    return {
      success: false,
      error
    };
  }

  /**
   * Build success response with message only
   */
  static successMessage(message: string): ApiResponse<void> {
    return {
      success: true,
      message
    };
  }
}

