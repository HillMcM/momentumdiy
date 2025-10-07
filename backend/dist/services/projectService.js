"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const projectServiceHelpers_1 = require("./projectServiceHelpers");
class ProjectService {
    static async getProjects(status) {
        try {
            const { data, error } = await projectServiceHelpers_1.ProjectQueries.getAll(status);
            if (error) {
                return projectServiceHelpers_1.ErrorHandler.handleError(error);
            }
            const projects = await Promise.all(data.map(async (dbProject) => {
                return await projectServiceHelpers_1.ProjectDataMapper.mapDatabaseProjectToProject(dbProject);
            }));
            return projectServiceHelpers_1.ResponseBuilder.success(projects);
        }
        catch (error) {
            return projectServiceHelpers_1.ErrorHandler.handleError(error);
        }
    }
    static async getProjectById(id) {
        try {
            const { data, error } = await projectServiceHelpers_1.ProjectQueries.getById(id);
            if (error) {
                return projectServiceHelpers_1.ErrorHandler.handleError(error);
            }
            if (!data) {
                return projectServiceHelpers_1.ErrorHandler.handleNotFound('Project');
            }
            const project = await projectServiceHelpers_1.ProjectDataMapper.mapDatabaseProjectToProject(data);
            return projectServiceHelpers_1.ResponseBuilder.success(project);
        }
        catch (error) {
            return projectServiceHelpers_1.ErrorHandler.handleError(error);
        }
    }
    static async createProject(projectData) {
        try {
            const validation = projectServiceHelpers_1.ProjectValidator.validateCreateRequest(projectData);
            if (!validation.valid) {
                return projectServiceHelpers_1.ErrorHandler.handleValidationError(validation.error);
            }
            const dbData = projectServiceHelpers_1.ProjectDataMapper.mapCreateRequestToDb(projectData);
            const { data, error } = await projectServiceHelpers_1.ProjectQueries.create(dbData);
            if (error) {
                return projectServiceHelpers_1.ErrorHandler.handleError(error);
            }
            const project = await projectServiceHelpers_1.ProjectDataMapper.mapDatabaseProjectToProject(data);
            return projectServiceHelpers_1.ResponseBuilder.success(project, 'Project created successfully');
        }
        catch (error) {
            return projectServiceHelpers_1.ErrorHandler.handleError(error);
        }
    }
    static async updateProject(id, updates) {
        try {
            const validation = projectServiceHelpers_1.ProjectValidator.validateUpdateRequest(updates);
            if (!validation.valid) {
                return projectServiceHelpers_1.ErrorHandler.handleValidationError(validation.error);
            }
            const updateData = projectServiceHelpers_1.ProjectDataMapper.mapUpdateRequestToDb(updates);
            const { data, error } = await projectServiceHelpers_1.ProjectQueries.update(id, updateData);
            if (error) {
                return projectServiceHelpers_1.ErrorHandler.handleError(error);
            }
            if (!data) {
                return projectServiceHelpers_1.ErrorHandler.handleNotFound('Project');
            }
            const project = await projectServiceHelpers_1.ProjectDataMapper.mapDatabaseProjectToProject(data);
            return projectServiceHelpers_1.ResponseBuilder.success(project, 'Project updated successfully');
        }
        catch (error) {
            return projectServiceHelpers_1.ErrorHandler.handleError(error);
        }
    }
    static async deleteProject(id) {
        try {
            const { error } = await projectServiceHelpers_1.ProjectQueries.delete(id);
            if (error) {
                return projectServiceHelpers_1.ErrorHandler.handleError(error);
            }
            return projectServiceHelpers_1.ResponseBuilder.successMessage('Project deleted successfully');
        }
        catch (error) {
            return projectServiceHelpers_1.ErrorHandler.handleError(error);
        }
    }
    static async getTimelinePhases(projectId) {
        return await projectServiceHelpers_1.TimelineQueries.getPhases(projectId);
    }
    static async createTimelinePhase(phaseData) {
        try {
            const validation = projectServiceHelpers_1.ProjectValidator.validatePhaseData(phaseData);
            if (!validation.valid) {
                return projectServiceHelpers_1.ErrorHandler.handleValidationError(validation.error);
            }
            const dbData = projectServiceHelpers_1.ProjectDataMapper.mapPhaseRequestToDb(phaseData);
            const { data, error } = await projectServiceHelpers_1.TimelineQueries.createPhase(dbData);
            if (error) {
                return projectServiceHelpers_1.ErrorHandler.handleError(error);
            }
            const phase = projectServiceHelpers_1.ProjectDataMapper.mapDatabasePhaseToPhase(data);
            return projectServiceHelpers_1.ResponseBuilder.success(phase, 'Timeline phase created successfully');
        }
        catch (error) {
            return projectServiceHelpers_1.ErrorHandler.handleError(error);
        }
    }
    static async updateProjectProgress(projectId) {
        try {
            const { progress } = await projectServiceHelpers_1.ProgressCalculator.calculateProjectProgress(projectId);
            const { error } = await projectServiceHelpers_1.ProjectQueries.updateProgress(projectId, progress);
            if (error) {
                return projectServiceHelpers_1.ErrorHandler.handleError(error);
            }
            return projectServiceHelpers_1.ResponseBuilder.successMessage('Project progress updated successfully');
        }
        catch (error) {
            return projectServiceHelpers_1.ErrorHandler.handleError(error);
        }
    }
    static async getProjectProgressDetails(projectId) {
        try {
            const details = await projectServiceHelpers_1.ProgressCalculator.calculateProjectProgress(projectId);
            return projectServiceHelpers_1.ResponseBuilder.success(details);
        }
        catch (error) {
            return projectServiceHelpers_1.ErrorHandler.handleError(error);
        }
    }
    static validateProjectData(projectData) {
        return projectServiceHelpers_1.ProjectValidator.validateCreateRequest(projectData);
    }
    static validateUpdateData(updates) {
        return projectServiceHelpers_1.ProjectValidator.validateUpdateRequest(updates);
    }
}
exports.ProjectService = ProjectService;
//# sourceMappingURL=projectService.js.map