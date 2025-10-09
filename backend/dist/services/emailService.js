"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const resend_1 = require("resend");
const emailTemplates_1 = require("./emailTemplates");
const branding_1 = require("../config/branding");
const environment_1 = require("../config/environment");
const logger_1 = require("../utils/logger");
let resend = null;
try {
    if (environment_1.ENV.resendApiKey && environment_1.ENV.resendApiKey !== 're_your_resend_api_key_here') {
        resend = new resend_1.Resend(environment_1.ENV.resendApiKey);
    }
}
catch (error) {
    logger_1.logger.warn('Resend API key not configured or invalid, email features disabled');
}
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
            if (!resend) {
                logger_1.logger.warn('Email service not configured, skipping email send');
                return { success: true };
            }
            const result = await resend.emails.send({
                from: `${branding_1.BRANDING.name} <${branding_1.BRANDING.email}>`,
                to: branding_1.BRANDING.supportEmail,
                subject: `New Feedback: ${data.subject}`,
                html: emailContent,
            });
            logger_1.logger.info('Feedback email sent successfully', { result });
            return { success: true };
        }
        catch (error) {
            logger_1.logger.error('Error sending feedback email', error);
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
            if (!resend) {
                logger_1.logger.warn('Email service not configured, skipping email send');
                return { success: true };
            }
            const result = await resend.emails.send({
                from: `${branding_1.BRANDING.name} <${branding_1.BRANDING.email}>`,
                to: data.email,
                subject: `Welcome to ${branding_1.BRANDING.name} - Let's Grow Your Business!`,
                html: emailContent,
            });
            logger_1.logger.info('Welcome email sent successfully', { result });
            return { success: true };
        }
        catch (error) {
            logger_1.logger.error('Error sending welcome email', error);
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
            if (!resend) {
                logger_1.logger.warn('Email service not configured, skipping email send');
                return { success: true };
            }
            const result = await resend.emails.send({
                from: `${branding_1.BRANDING.name} <${branding_1.BRANDING.email}>`,
                to: branding_1.BRANDING.supportEmail,
                subject: `Test Email - ${branding_1.BRANDING.name} Template System`,
                html: emailContent,
            });
            logger_1.logger.info('Test email sent successfully', { result });
            return { success: true };
        }
        catch (error) {
            logger_1.logger.error('Error sending test email', error);
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
            if (!resend) {
                logger_1.logger.warn('Email service not configured, skipping email send');
                return { success: true };
            }
            const result = await resend.emails.send({
                from: `${branding_1.BRANDING.name} <${branding_1.BRANDING.email}>`,
                to: email,
                subject: subject,
                html: emailContent,
            });
            logger_1.logger.info(`${type} notification sent successfully`, { result });
            return { success: true };
        }
        catch (error) {
            logger_1.logger.error(`Error sending ${data.type} notification`, error);
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