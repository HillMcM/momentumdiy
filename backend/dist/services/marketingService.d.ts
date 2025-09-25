import { MarketingGoal, MarketingModule, MarketingTask, CreateMarketingGoalRequest, UpdateMarketingGoalRequest, ApiResponse } from '../types';
export declare class MarketingService {
    static getMarketingGoals(): Promise<ApiResponse<MarketingGoal[]>>;
    static getActiveMarketingGoal(): Promise<ApiResponse<MarketingGoal | null>>;
    static createMarketingGoal(goalData: CreateMarketingGoalRequest): Promise<ApiResponse<MarketingGoal>>;
    static updateMarketingGoal(id: string, updates: UpdateMarketingGoalRequest): Promise<ApiResponse<MarketingGoal>>;
    static deleteMarketingGoal(id: string): Promise<ApiResponse<void>>;
    static seedSocialMediaModules(goalId: string): Promise<ApiResponse<void>>;
    static activateTrackForUser(trackDefinitionId: string): Promise<ApiResponse<MarketingGoal>>;
    static setActiveMarketingGoal(goalId: string): Promise<ApiResponse<void>>;
    static syncPhasesFromTrackDefinition(goalId: string): Promise<ApiResponse<void>>;
    static updateMarketingGoalProgress(goalId: string, progress: number): Promise<ApiResponse<MarketingGoal>>;
    static getMarketingModules(goalId: string): Promise<ApiResponse<MarketingModule[]>>;
    static createMarketingModule(moduleData: Omit<MarketingModule, 'id' | 'tasks'> & {
        goalId: string;
    }): Promise<ApiResponse<MarketingModule>>;
    static getMarketingTasks(moduleId: string): Promise<ApiResponse<MarketingTask[]>>;
    static createMarketingTask(taskData: Omit<MarketingTask, 'id'> & {
        moduleId: string;
    }): Promise<ApiResponse<MarketingTask>>;
    static updateMarketingTaskCompletion(taskId: string, isCompleted: boolean): Promise<ApiResponse<MarketingTask>>;
    private static mapDatabaseGoalToGoal;
    private static mapDatabaseModuleToModule;
    static updateMarketingGoalPhases(goalId: string, phases: any[]): Promise<ApiResponse<MarketingGoal>>;
}
//# sourceMappingURL=marketingService.d.ts.map