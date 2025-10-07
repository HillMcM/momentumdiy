/**
 * Refactored ProjectService - Clean, modular, and maintainable
 * 
 * This refactored version provides:
 * - Reduced code duplication
 * - Better separation of concerns
 * - Input validation
 * - Simplified error handling
 * - Easier testing and maintenance
 */

import { 
  Project, 
  CreateProjectRequest, 
  UpdateProjectRequest, 
  ApiResponse,
  DatabaseProject,
  TimelinePhase 
} from '../types';

import {
  ProjectDataMapper,
  ProjectQueries,
  TimelineQueries,
  ProjectValidator,
  ProgressCalculator,
  ErrorHandler,
  ResponseBuilder
} from './projectServiceHelpers';

// ============================================================================
// REFACTORED PROJECT SERVICE
// ============================================================================

export class ProjectService {
  /**
   * Get all projects with optional filtering
   */
  static async getProjects(status?: string): Promise<ApiResponse<Project[]>> {
    try {
      const { data, error } = await ProjectQueries.getAll(status);

      if (error) {
        return ErrorHandler.handleError(error);
      }

      const projects: Project[] = await Promise.all(
        (data as DatabaseProject[]).map(async (dbProject) => {
          return await ProjectDataMapper.mapDatabaseProjectToProject(dbProject);
        })
      );

      return ResponseBuilder.success(projects);
    } catch (error) {
      return ErrorHandler.handleError(error);
    }
  }

  /**
   * Get a single project by ID
   */
  static async getProjectById(id: string): Promise<ApiResponse<Project>> {
    try {
      const { data, error } = await ProjectQueries.getById(id);

      if (error) {
        return ErrorHandler.handleError(error);
      }

      if (!data) {
        return ErrorHandler.handleNotFound('Project');
      }

      const project = await ProjectDataMapper.mapDatabaseProjectToProject(data as DatabaseProject);

      return ResponseBuilder.success(project);
    } catch (error) {
      return ErrorHandler.handleError(error);
    }
  }

  /**
   * Create a new project
   */
  static async createProject(projectData: CreateProjectRequest): Promise<ApiResponse<Project>> {
    try {
      // Validate input
      const validation = ProjectValidator.validateCreateRequest(projectData);
      if (!validation.valid) {
        return ErrorHandler.handleValidationError(validation.error!);
      }

      // Map to database format and create
      const dbData = ProjectDataMapper.mapCreateRequestToDb(projectData);
      const { data, error } = await ProjectQueries.create(dbData);

      if (error) {
        return ErrorHandler.handleError(error);
      }

      const project = await ProjectDataMapper.mapDatabaseProjectToProject(data as DatabaseProject);

      return ResponseBuilder.success(project, 'Project created successfully');
    } catch (error) {
      return ErrorHandler.handleError(error);
    }
  }

  /**
   * Update an existing project
   */
  static async updateProject(id: string, updates: UpdateProjectRequest): Promise<ApiResponse<Project>> {
    try {
      // Validate input
      const validation = ProjectValidator.validateUpdateRequest(updates);
      if (!validation.valid) {
        return ErrorHandler.handleValidationError(validation.error!);
      }

      // Map to database format and update
      const updateData = ProjectDataMapper.mapUpdateRequestToDb(updates);
      const { data, error } = await ProjectQueries.update(id, updateData);

      if (error) {
        return ErrorHandler.handleError(error);
      }

      if (!data) {
        return ErrorHandler.handleNotFound('Project');
      }

      const project = await ProjectDataMapper.mapDatabaseProjectToProject(data as DatabaseProject);

      return ResponseBuilder.success(project, 'Project updated successfully');
    } catch (error) {
      return ErrorHandler.handleError(error);
    }
  }

  /**
   * Delete a project
   */
  static async deleteProject(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await ProjectQueries.delete(id);

      if (error) {
        return ErrorHandler.handleError(error);
      }

      return ResponseBuilder.successMessage('Project deleted successfully');
    } catch (error) {
      return ErrorHandler.handleError(error);
    }
  }

  /**
   * Get timeline phases for a project
   */
  static async getTimelinePhases(projectId: string): Promise<ApiResponse<TimelinePhase[]>> {
    return await TimelineQueries.getPhases(projectId);
  }

  /**
   * Create a timeline phase
   */
  static async createTimelinePhase(phaseData: Omit<TimelinePhase, 'id'> & { projectId: string }): Promise<ApiResponse<TimelinePhase>> {
    try {
      // Validate input
      const validation = ProjectValidator.validatePhaseData(phaseData);
      if (!validation.valid) {
        return ErrorHandler.handleValidationError(validation.error!);
      }

      // Map to database format and create
      const dbData = ProjectDataMapper.mapPhaseRequestToDb(phaseData);
      const { data, error } = await TimelineQueries.createPhase(dbData);

      if (error) {
        return ErrorHandler.handleError(error);
      }

      const phase = ProjectDataMapper.mapDatabasePhaseToPhase(data);

      return ResponseBuilder.success(phase, 'Timeline phase created successfully');
    } catch (error) {
      return ErrorHandler.handleError(error);
    }
  }

  /**
   * Update project progress based on completed tasks
   */
  static async updateProjectProgress(projectId: string): Promise<ApiResponse<void>> {
    try {
      // Calculate progress
      const { progress } = await ProgressCalculator.calculateProjectProgress(projectId);

      // Update project
      const { error } = await ProjectQueries.updateProgress(projectId, progress);

      if (error) {
        return ErrorHandler.handleError(error);
      }

      return ResponseBuilder.successMessage('Project progress updated successfully');
    } catch (error) {
      return ErrorHandler.handleError(error);
    }
  }

  // ============================================================================
  // CONVENIENCE METHODS FOR TESTING AND DEBUGGING
  // ============================================================================

  /**
   * Get project progress details (for testing/debugging)
   */
  static async getProjectProgressDetails(projectId: string): Promise<ApiResponse<{
    progress: number;
    totalTasks: number;
    completedTasks: number;
  }>> {
    try {
      const details = await ProgressCalculator.calculateProjectProgress(projectId);
      return ResponseBuilder.success(details);
    } catch (error) {
      return ErrorHandler.handleError(error);
    }
  }

  /**
   * Validate project data without creating (for testing)
   */
  static validateProjectData(projectData: CreateProjectRequest): { valid: boolean; error?: string } {
    return ProjectValidator.validateCreateRequest(projectData);
  }

  /**
   * Validate update data without updating (for testing)
   */
  static validateUpdateData(updates: UpdateProjectRequest): { valid: boolean; error?: string } {
    return ProjectValidator.validateUpdateRequest(updates);
  }
}

