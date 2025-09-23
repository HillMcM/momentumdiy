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
export declare class NotificationService {
    static sendWelcomeNotification(user: UserProfile): Promise<void>;
    static sendOnboardingCompleteNotification(user: UserProfile, onboardingData: any): Promise<void>;
    static sendTrialEndingNotification(user: UserProfile, daysLeft: number): Promise<void>;
    static sendSubscriptionActiveNotification(user: UserProfile, plan: string): Promise<void>;
    static sendSubscriptionCancelledNotification(user: UserProfile): Promise<void>;
    static sendWeeklyProgressNotification(user: UserProfile, progressData: any): Promise<void>;
    static sendTaskReminderNotification(user: UserProfile, taskName: string): Promise<void>;
    static checkTrialEndingNotifications(users: UserProfile[]): Promise<void>;
    static sendWeeklyProgressReports(users: UserProfile[]): Promise<void>;
    static sendTaskReminders(_users: UserProfile[]): Promise<void>;
}
//# sourceMappingURL=notificationService.d.ts.map