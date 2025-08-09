import { Task, CreateTaskRequest, UpdateTaskRequest, ApiResponse } from '../types';
export declare class TaskService {
    static getTasks(projectId?: string, status?: string): Promise<ApiResponse<Task[]>>;
    static getTaskById(id: string): Promise<ApiResponse<Task>>;
    static createTask(taskData: CreateTaskRequest): Promise<ApiResponse<Task>>;
    static updateTask(id: string, updates: UpdateTaskRequest): Promise<ApiResponse<Task>>;
    static deleteTask(id: string): Promise<ApiResponse<void>>;
    static getTasksByProject(projectId: string): Promise<ApiResponse<Task[]>>;
    static updateTaskStatus(id: string, status: string): Promise<ApiResponse<Task>>;
    static updateTaskTimeSpent(id: string, timeSpent: string): Promise<ApiResponse<Task>>;
    private static mapDatabaseTaskToTask;
}
//# sourceMappingURL=taskService.d.ts.map