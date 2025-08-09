import { Project, CreateProjectRequest, UpdateProjectRequest, ApiResponse, TimelinePhase } from '../types';
export declare class ProjectService {
    static getProjects(status?: string): Promise<ApiResponse<Project[]>>;
    static getProjectById(id: string): Promise<ApiResponse<Project>>;
    static createProject(projectData: CreateProjectRequest): Promise<ApiResponse<Project>>;
    static updateProject(id: string, updates: UpdateProjectRequest): Promise<ApiResponse<Project>>;
    static deleteProject(id: string): Promise<ApiResponse<void>>;
    static getTimelinePhases(projectId: string): Promise<ApiResponse<TimelinePhase[]>>;
    static createTimelinePhase(phaseData: Omit<TimelinePhase, 'id'> & {
        projectId: string;
    }): Promise<ApiResponse<TimelinePhase>>;
    static updateProjectProgress(projectId: string): Promise<ApiResponse<void>>;
    private static mapDatabaseProjectToProject;
}
//# sourceMappingURL=projectService.d.ts.map