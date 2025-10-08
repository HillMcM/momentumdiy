import { EmailPreferences } from '../types';
export interface UserProfile {
    id: string;
    email: string;
    name: string;
    subscription_status: string;
    trial_end_date?: string;
    onboarding_completed: boolean;
    selected_track?: string;
    last_activity?: string;
    email_preferences?: EmailPreferences;
}
export interface OnboardingData {
    businessName?: string;
    businessType?: string;
    industry?: string;
    selectedTrack?: string;
    [key: string]: unknown;
}
export interface ProgressData {
    completedTasks: number;
    totalTasks: number;
    weekNumber: number;
    trackName: string;
    lastActivityDate?: string;
    daysSinceLastActivity?: number;
    [key: string]: unknown;
}
export declare class NotificationService {
    static sendWelcomeNotification(user: UserProfile): Promise<void>;
    static sendOnboardingCompleteNotification(user: UserProfile, onboardingData: OnboardingData): Promise<void>;
    static sendTrialEndingNotification(user: UserProfile, daysLeft: number): Promise<void>;
    static sendSubscriptionActiveNotification(user: UserProfile, plan: string): Promise<void>;
    static sendSubscriptionCancelledNotification(user: UserProfile): Promise<void>;
    static sendWeeklyProgressNotification(user: UserProfile, progressData: ProgressData): Promise<void>;
    static sendTaskReminderNotification(user: UserProfile, taskName: string): Promise<void>;
    static checkTrialEndingNotifications(users: UserProfile[]): Promise<void>;
    static sendWeeklyProgressReports(users: UserProfile[]): Promise<void>;
    static sendTaskReminders(_users: UserProfile[]): Promise<void>;
}
//# sourceMappingURL=notificationService.d.ts.map