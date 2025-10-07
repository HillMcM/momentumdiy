"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const resend_1 = require("resend");
const emailTemplates_1 = require("./emailTemplates");
const resend = new resend_1.Resend(process.env['RESEND_API_KEY'] || 're_HAwFtwhA_E1nrZGWHUWiA5E3Pbd4kHN2M');
class EmailService {
    static async sendFeedbackEmail(data) {
        try {
            const templateData = {
                name: data.name,
                email: data.email,
                subject: data.subject,
                message: data.message,
                rating: data.rating,
                category: data.category
            };
            const emailContent = emailTemplates_1.EmailTemplateFactory.createFeedbackTemplate(templateData);
            const result = await resend.emails.send({
                from: 'MomentumDIY <hello@momentumdiy.com>',
                to: 'info@hillaryedenmcmullen.com',
                subject: `New Feedback: ${data.subject}`,
                html: emailContent,
            });
            console.log('📧 Feedback email sent successfully:', result);
            return { success: true };
        }
        catch (error) {
            console.error('❌ Error sending feedback email:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async sendWelcomeEmail(data) {
        try {
            const templateData = {
                name: data.name,
                email: data.email
            };
            const emailContent = emailTemplates_1.EmailTemplateFactory.createWelcomeTemplate(templateData);
            const result = await resend.emails.send({
                from: 'MomentumDIY <hello@momentumdiy.com>',
                to: data.email,
                subject: 'Welcome to MomentumDIY - Let\'s Grow Your Business!',
                html: emailContent,
            });
            console.log('📧 Welcome email sent successfully:', result);
            return { success: true };
        }
        catch (error) {
            console.error('❌ Error sending welcome email:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async sendTestEmail() {
        try {
            const testData = {
                name: 'Test User',
                email: 'test@example.com'
            };
            const emailContent = emailTemplates_1.EmailTemplateFactory.createWelcomeTemplate(testData);
            const result = await resend.emails.send({
                from: 'MomentumDIY <hello@momentumdiy.com>',
                to: 'info@hillaryedenmcmullen.com',
                subject: 'Test Email - MomentumDIY Template System',
                html: emailContent,
            });
            console.log('📧 Test email sent successfully:', result);
            return { success: true };
        }
        catch (error) {
            console.error('❌ Error sending test email:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async sendNotificationEmail(data) {
        try {
            const { name, email, type, data: notificationData } = data;
            let emailContent = '';
            let subject = '';
            switch (type) {
                case 'welcome': {
                    const templateData = { name, email };
                    emailContent = emailTemplates_1.EmailTemplateFactory.createWelcomeTemplate(templateData);
                    subject = 'Welcome to MomentumDIY - Let\'s Grow Your Business!';
                    break;
                }
                case 'onboarding_complete': {
                    const templateData = {
                        name,
                        email,
                        selectedTrack: notificationData?.selectedTrack
                    };
                    emailContent = emailTemplates_1.EmailTemplateFactory.createOnboardingCompleteTemplate(templateData);
                    subject = '🎉 Onboarding Complete - Your Marketing Journey Starts Now!';
                    break;
                }
                case 'trial_ending': {
                    const templateData = {
                        name,
                        email,
                        daysRemaining: notificationData?.daysRemaining,
                        trialEndDate: notificationData?.trialEndDate
                    };
                    emailContent = emailTemplates_1.EmailTemplateFactory.createTrialEndingTemplate(templateData);
                    subject = '⏰ Your Free Trial Ends Soon - Don\'t Miss Out!';
                    break;
                }
                case 'subscription_active': {
                    const templateData = {
                        name,
                        email,
                        planName: notificationData?.planName,
                        nextBillingDate: notificationData?.nextBillingDate
                    };
                    emailContent = emailTemplates_1.EmailTemplateFactory.createSubscriptionActiveTemplate(templateData);
                    subject = '✅ Subscription Activated - Welcome to MomentumDIY!';
                    break;
                }
                case 'subscription_cancelled': {
                    const templateData = {
                        name,
                        email,
                        cancellationDate: notificationData?.cancellationDate,
                        feedback: notificationData?.feedback
                    };
                    emailContent = emailTemplates_1.EmailTemplateFactory.createSubscriptionCancelledTemplate(templateData);
                    subject = 'We\'re Sorry to See You Go - Here\'s What You\'ll Miss';
                    break;
                }
                case 'weekly_progress': {
                    const templateData = {
                        name,
                        email,
                        weekNumber: notificationData?.weekNumber,
                        completedTasks: notificationData?.completedTasks,
                        totalTasks: notificationData?.totalTasks,
                        nextWeekTasks: notificationData?.nextWeekTasks
                    };
                    emailContent = emailTemplates_1.EmailTemplateFactory.createWeeklyProgressTemplate(templateData);
                    subject = '📊 Your Weekly Marketing Progress Report';
                    break;
                }
                case 'task_reminder': {
                    const templateData = {
                        name,
                        email,
                        taskTitle: notificationData?.taskTitle,
                        dueDate: notificationData?.dueDate,
                        trackName: notificationData?.trackName
                    };
                    emailContent = emailTemplates_1.EmailTemplateFactory.createTaskReminderTemplate(templateData);
                    subject = '⏰ Task Reminder - Keep Your Marketing Momentum Going!';
                    break;
                }
                default:
                    throw new Error(`Unknown notification type: ${type}`);
            }
            const result = await resend.emails.send({
                from: 'MomentumDIY <hello@momentumdiy.com>',
                to: email,
                subject: subject,
                html: emailContent,
            });
            console.log(`📧 ${type} notification sent successfully:`, result);
            return { success: true };
        }
        catch (error) {
            console.error(`❌ Error sending ${data.type} notification:`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static getWelcomeEmailTemplate(name) {
        const templateData = { name, email: 'test@example.com' };
        return emailTemplates_1.EmailTemplateFactory.createWelcomeTemplate(templateData);
    }
    static getOnboardingCompleteTemplate(name, data) {
        const templateData = {
            name,
            email: 'test@example.com',
            selectedTrack: data?.selectedTrack
        };
        return emailTemplates_1.EmailTemplateFactory.createOnboardingCompleteTemplate(templateData);
    }
    static getTrialEndingTemplate(name, data) {
        const templateData = {
            name,
            email: 'test@example.com',
            daysRemaining: data?.daysRemaining,
            trialEndDate: data?.trialEndDate
        };
        return emailTemplates_1.EmailTemplateFactory.createTrialEndingTemplate(templateData);
    }
    static getSubscriptionActiveTemplate(name, data) {
        const templateData = {
            name,
            email: 'test@example.com',
            planName: data?.planName,
            nextBillingDate: data?.nextBillingDate
        };
        return emailTemplates_1.EmailTemplateFactory.createSubscriptionActiveTemplate(templateData);
    }
    static getSubscriptionCancelledTemplate(name, data) {
        const templateData = {
            name,
            email: 'test@example.com',
            cancellationDate: data?.cancellationDate,
            feedback: data?.feedback
        };
        return emailTemplates_1.EmailTemplateFactory.createSubscriptionCancelledTemplate(templateData);
    }
    static getWeeklyProgressTemplate(name, data) {
        const templateData = {
            name,
            email: 'test@example.com',
            weekNumber: data?.weekNumber,
            completedTasks: data?.completedTasks,
            totalTasks: data?.totalTasks,
            nextWeekTasks: data?.nextWeekTasks
        };
        return emailTemplates_1.EmailTemplateFactory.createWeeklyProgressTemplate(templateData);
    }
    static getTaskReminderTemplate(name, data) {
        const templateData = {
            name,
            email: 'test@example.com',
            taskTitle: data?.taskTitle,
            dueDate: data?.dueDate,
            trackName: data?.trackName
        };
        return emailTemplates_1.EmailTemplateFactory.createTaskReminderTemplate(templateData);
    }
}
exports.EmailService = EmailService;
//# sourceMappingURL=emailService.js.map