export interface FeedbackEmailData {
    name: string;
    email: string;
    subject: string;
    message: string;
    rating: number;
    category: string;
}
export interface WelcomeEmailData {
    name: string;
    email: string;
}
export interface NotificationEmailData {
    name: string;
    email: string;
    type: 'welcome' | 'onboarding_complete' | 'trial_ending' | 'subscription_active' | 'subscription_cancelled' | 'weekly_progress' | 'task_reminder';
    data?: any;
}
export declare class EmailService {
    static sendFeedbackEmail(data: FeedbackEmailData): Promise<{
        success: boolean;
        error?: string;
    }>;
    static sendWelcomeEmail(data: WelcomeEmailData): Promise<{
        success: boolean;
        error?: string;
    }>;
    static sendTestEmail(): Promise<{
        success: boolean;
        error?: string;
    }>;
    static sendNotificationEmail(data: NotificationEmailData): Promise<{
        success: boolean;
        error?: string;
    }>;
    static getWelcomeEmailTemplate(name: string): string;
    static getOnboardingCompleteTemplate(name: string, data: any): string;
    static getTrialEndingTemplate(name: string, data: any): string;
    static getSubscriptionActiveTemplate(name: string, data: any): string;
    static getSubscriptionCancelledTemplate(name: string, data: any): string;
    static getWeeklyProgressTemplate(name: string, data: any): string;
    static getTaskReminderTemplate(name: string, data: any): string;
}
//# sourceMappingURL=emailService.d.ts.map