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
                logger_1.logger.error('Email service not configured - Resend API key missing or invalid', {
                    hasApiKey: !!environment_1.ENV.resendApiKey,
                    apiKeyLength: environment_1.ENV.resendApiKey?.length || 0,
                    apiKeyPrefix: environment_1.ENV.resendApiKey?.substring(0, 3) || 'none'
                });
                return {
                    success: false,
                    error: 'Email service not configured. RESEND_API_KEY is required.'
                };
            }
            if (!email || !email.includes('@')) {
                logger_1.logger.error('Invalid email address provided', { email, type });
                return {
                    success: false,
                    error: 'Invalid email address'
                };
            }
            const fromAddress = branding_1.BRANDING.email || 'hello@momentumdiy.com';
            if (!fromAddress || !fromAddress.includes('@')) {
                logger_1.logger.error('Invalid from address in branding config', { fromAddress, type });
                return {
                    success: false,
                    error: 'Invalid from address configuration'
                };
            }
            logger_1.logger.debug('Attempting to send email', {
                type,
                to: email,
                from: `${branding_1.BRANDING.name} <${fromAddress}>`,
                subject
            });
            const result = await resend.emails.send({
                from: `${branding_1.BRANDING.name} <${fromAddress}>`,
                to: email,
                subject: subject,
                html: emailContent,
            });
            logger_1.logger.info(`${type} notification sent successfully`, {
                result,
                emailId: result.data?.id,
                to: email,
                type
            });
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
    static async sendPartnerApprovalEmail(data) {
        try {
            const templateData = {
                name: data.name,
                email: data.email,
                dashboardUrl: data.dashboardUrl,
                referralCode: data.referralCode
            };
            const emailContent = emailTemplates_1.EmailTemplateFactory.createPartnerApprovalTemplate(templateData);
            if (!resend) {
                logger_1.logger.warn('Email service not configured, skipping email send');
                return { success: true };
            }
            await resend.emails.send({
                from: `${branding_1.BRANDING.name} <${branding_1.BRANDING.email}>`,
                to: data.email,
                subject: '🎉 Welcome to the Affiliate Partner Program!',
                html: emailContent,
            });
            logger_1.logger.info('Partner approval email sent successfully', {
                email: data.email,
                referralCode: data.referralCode
            });
            return { success: true };
        }
        catch (error) {
            logger_1.logger.error('Error sending partner approval email', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async sendPartnerRejectionEmail(data) {
        try {
            const templateData = {
                name: data.name,
                email: data.email,
                ...(data.rejectionReason && { rejectionReason: data.rejectionReason })
            };
            const emailContent = emailTemplates_1.EmailTemplateFactory.createPartnerRejectionTemplate(templateData);
            if (!resend) {
                logger_1.logger.warn('Email service not configured, skipping email send');
                return { success: true };
            }
            await resend.emails.send({
                from: `${branding_1.BRANDING.name} <${branding_1.BRANDING.email}>`,
                to: data.email,
                subject: `Affiliate Partner Application Update - ${branding_1.BRANDING.name}`,
                html: emailContent,
            });
            logger_1.logger.info('Partner rejection email sent successfully', {
                email: data.email,
                name: data.name
            });
            return { success: true };
        }
        catch (error) {
            logger_1.logger.error('Error sending partner rejection email', error);
            return { success: false, error: 'Failed to send email' };
        }
    }
    static async sendAdminPartnerApplicationNotification(data) {
        try {
            const adminEmails = (process.env['ADMIN_EMAILS'] || 'info@hillaryedenmcmullen.com')
                .split(',')
                .map(email => email.trim())
                .filter(Boolean);
            if (adminEmails.length === 0) {
                logger_1.logger.warn('No admin emails configured for partner application notifications');
                return { success: true };
            }
            const emailContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #EF8E81 0%, #D4AF37 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">New Partner Application</h1>
          </div>
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
            <h2 style="color: #2A2438; margin-top: 0;">Application Details</h2>
            <p><strong>Applicant Name:</strong> ${data.applicantName}</p>
            <p><strong>Email:</strong> <a href="mailto:${data.applicantEmail}">${data.applicantEmail}</a></p>
            ${data.companyName ? `<p><strong>Company:</strong> ${data.companyName}</p>` : ''}
            <p><strong>Application ID:</strong> ${data.applicationId}</p>
            
            <div style="margin: 30px 0;">
              <a href="${data.applicationUrl}" 
                 style="display: inline-block; background: #EF8E81; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Review Application
              </a>
            </div>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
              This is an automated notification from ${branding_1.BRANDING.name}.
            </p>
          </div>
        </body>
        </html>
      `;
            if (!resend) {
                logger_1.logger.warn('Email service not configured, skipping admin notification');
                return { success: true };
            }
            const emailPromises = adminEmails.map(adminEmail => resend.emails.send({
                from: `${branding_1.BRANDING.name} <${branding_1.BRANDING.email}>`,
                to: adminEmail,
                subject: `New Partner Application: ${data.applicantName}`,
                html: emailContent,
            }));
            await Promise.all(emailPromises);
            logger_1.logger.info('Admin partner application notification sent', {
                applicationId: data.applicationId,
                adminEmails
            });
            return { success: true };
        }
        catch (error) {
            logger_1.logger.error('Error sending admin partner application notification', error);
            return { success: false, error: 'Failed to send email' };
        }
    }
}
exports.EmailService = EmailService;
//# sourceMappingURL=emailService.js.map