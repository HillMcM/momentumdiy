export interface ProgressData {
    completedTasks: number;
    totalTasks: number;
    weekNumber: number;
    trackName: string;
    lastActivityDate?: string;
    daysSinceLastActivity?: number;
}
export declare class AutomatedNotificationsService {
    private static getAllUsers;
    private static getUserProgressData;
    static sendWeeklyProgressReports(): Promise<void>;
    static sendTrialEndingNotifications(): Promise<void>;
    static sendTaskReminders(): Promise<void>;
    static runAllNotifications(): Promise<void>;
    static scheduleNotifications(): Promise<void>;
}
//# sourceMappingURL=automatedNotificationsService.d.ts.map