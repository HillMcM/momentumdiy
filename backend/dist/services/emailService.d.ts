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
}
//# sourceMappingURL=emailService.d.ts.map