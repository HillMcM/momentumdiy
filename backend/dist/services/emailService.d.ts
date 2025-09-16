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
    private static getEmailFootnote;
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
    private static getWelcomeEmailTemplate;
    private static getOnboardingCompleteTemplate;
    private static getTrialEndingTemplate;
    private static getSubscriptionActiveTemplate;
    private static getSubscriptionCancelledTemplate;
    private static getWeeklyProgressTemplate;
    private static getTaskReminderTemplate;
}
//# sourceMappingURL=emailService.d.ts.map