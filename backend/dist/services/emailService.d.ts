export interface SendEmailParams {
    to: string;
    subject: string;
    htmlBody?: string;
    textBody?: string;
    messageStream?: string;
}
export declare function sendEmail(params: SendEmailParams): Promise<{
    success: boolean;
    error?: string;
}>;
export declare function sendWelcomeEmail(to: string): Promise<{
    success: boolean;
    error?: string;
}>;
//# sourceMappingURL=emailService.d.ts.map