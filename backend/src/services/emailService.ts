/**
 * Refactored EmailService - Clean, maintainable, and modular
 * 
 * This refactored version uses the new template system for:
 * - Better maintainability
 * - Consistent styling
 * - Reduced code duplication
 * - Type safety
 * - Easy template updates
 */

import { Resend } from 'resend';
import { 
  EmailTemplateFactory,
  WelcomeTemplateData,
  OnboardingCompleteTemplateData,
  TrialEndingTemplateData,
  SubscriptionActiveTemplateData,
  SubscriptionCancelledTemplateData,
  WeeklyProgressTemplateData,
  TaskReminderTemplateData,
  FeedbackTemplateData,
  PartnerApprovalTemplateData,
  PartnerRejectionTemplateData
} from './emailTemplates';
import { BRANDING } from '../config/branding';
import { ENV } from '../config/environment';
import { logger } from '../utils/logger';

// Initialize Resend only if API key is available (for testing compatibility)
let resend: Resend | null = null;
try {
  if (ENV.resendApiKey && ENV.resendApiKey !== 're_your_resend_api_key_here') {
    resend = new Resend(ENV.resendApiKey);
  }
} catch (error) {
  logger.warn('Resend API key not configured or invalid, email features disabled');
}

// ============================================================================
// LEGACY INTERFACES (for backward compatibility)
// ============================================================================

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

// ============================================================================
// REFACTORED EMAIL SERVICE
// ============================================================================

export class EmailService {
  /**
   * Send feedback email to admin
   * Refactored to use new template system
   */
  static async sendFeedbackEmail(data: FeedbackEmailData): Promise<{ success: boolean; error?: string }> {
    try {
      const templateData: FeedbackTemplateData = {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        rating: data.rating,
        category: data.category
      };

      const emailContent = EmailTemplateFactory.createFeedbackTemplate(templateData);
      
      if (!resend) {
        logger.warn('Email service not configured, skipping email send');
        return { success: true };
      }

      const result = await resend.emails.send({
        from: `${BRANDING.name} <${BRANDING.email}>`,
        to: BRANDING.supportEmail,
        subject: `New Feedback: ${data.subject}`,
        html: emailContent,
      });

      logger.info('Feedback email sent successfully', { result });
      return { success: true };

    } catch (error) {
      logger.error('Error sending feedback email', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Send welcome email
   * Refactored to use new template system
   */
  static async sendWelcomeEmail(data: WelcomeEmailData): Promise<{ success: boolean; error?: string }> {
    try {
      const templateData: WelcomeTemplateData = {
        name: data.name,
        email: data.email
      };

      const emailContent = EmailTemplateFactory.createWelcomeTemplate(templateData);
      
      if (!resend) {
        logger.warn('Email service not configured, skipping email send');
        return { success: true };
      }

      const result = await resend.emails.send({
        from: `${BRANDING.name} <${BRANDING.email}>`,
        to: data.email,
        subject: `Welcome to ${BRANDING.name} - Let's Grow Your Business!`,
        html: emailContent,
      });

      logger.info('Welcome email sent successfully', { result });
      return { success: true };

    } catch (error) {
      logger.error('Error sending welcome email', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Send test email
   * Refactored to use new template system
   */
  static async sendTestEmail(): Promise<{ success: boolean; error?: string }> {
    try {
      const testData: WelcomeTemplateData = {
        name: 'Test User',
        email: 'test@example.com'
      };

      const emailContent = EmailTemplateFactory.createWelcomeTemplate(testData);
      
      if (!resend) {
        logger.warn('Email service not configured, skipping email send');
        return { success: true };
      }

      const result = await resend.emails.send({
        from: `${BRANDING.name} <${BRANDING.email}>`,
        to: BRANDING.supportEmail,
        subject: `Test Email - ${BRANDING.name} Template System`,
        html: emailContent,
      });

      logger.info('Test email sent successfully', { result });
      return { success: true };

    } catch (error) {
      logger.error('Error sending test email', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Send notification email
   * Refactored to use new template system with proper type mapping
   */
  static async sendNotificationEmail(data: NotificationEmailData): Promise<{ success: boolean; error?: string }> {
    try {
      const { name, email, type, data: notificationData } = data;
      
      let emailContent = '';
      let subject = '';
      
      switch (type) {
        case 'welcome': {
          const templateData: WelcomeTemplateData = { name, email };
          emailContent = EmailTemplateFactory.createWelcomeTemplate(templateData);
          subject = 'Welcome to MomentumDIY - Let\'s Grow Your Business!';
          break;
        }
          
        case 'onboarding_complete': {
          const templateData: OnboardingCompleteTemplateData = { 
            name, 
            email, 
            selectedTrack: notificationData?.selectedTrack 
          };
          emailContent = EmailTemplateFactory.createOnboardingCompleteTemplate(templateData);
          subject = '🎉 Onboarding Complete - Your Marketing Journey Starts Now!';
          break;
        }
          
        case 'trial_ending': {
          const templateData: TrialEndingTemplateData = { 
            name, 
            email, 
            daysRemaining: notificationData?.daysRemaining,
            trialEndDate: notificationData?.trialEndDate
          };
          emailContent = EmailTemplateFactory.createTrialEndingTemplate(templateData);
          subject = '⏰ Your Free Trial Ends Soon - Don\'t Miss Out!';
          break;
        }
          
        case 'subscription_active': {
          const templateData: SubscriptionActiveTemplateData = { 
            name, 
            email, 
            planName: notificationData?.planName,
            nextBillingDate: notificationData?.nextBillingDate
          };
          emailContent = EmailTemplateFactory.createSubscriptionActiveTemplate(templateData);
          subject = '✅ Subscription Activated - Welcome to MomentumDIY!';
          break;
        }
          
        case 'subscription_cancelled': {
          const templateData: SubscriptionCancelledTemplateData = { 
            name, 
            email, 
            cancellationDate: notificationData?.cancellationDate,
            feedback: notificationData?.feedback
          };
          emailContent = EmailTemplateFactory.createSubscriptionCancelledTemplate(templateData);
          subject = 'We\'re Sorry to See You Go - Here\'s What You\'ll Miss';
          break;
        }
          
        case 'weekly_progress': {
          const templateData: WeeklyProgressTemplateData = { 
            name, 
            email, 
            weekNumber: notificationData?.weekNumber,
            completedTasks: notificationData?.completedTasks,
            totalTasks: notificationData?.totalTasks,
            nextWeekTasks: notificationData?.nextWeekTasks
          };
          emailContent = EmailTemplateFactory.createWeeklyProgressTemplate(templateData);
          subject = '📊 Your Weekly Marketing Progress Report';
          break;
        }
          
        case 'task_reminder': {
          const templateData: TaskReminderTemplateData = { 
            name, 
            email, 
            taskTitle: notificationData?.taskTitle,
            dueDate: notificationData?.dueDate,
            trackName: notificationData?.trackName
          };
          emailContent = EmailTemplateFactory.createTaskReminderTemplate(templateData);
          subject = '⏰ Task Reminder - Keep Your Marketing Momentum Going!';
          break;
        }
          
        default:
          throw new Error(`Unknown notification type: ${type}`);
      }

      if (!resend) {
        logger.error('Email service not configured - Resend API key missing or invalid', {
          hasApiKey: !!ENV.resendApiKey,
          apiKeyLength: ENV.resendApiKey?.length || 0,
          apiKeyPrefix: ENV.resendApiKey?.substring(0, 3) || 'none'
        });
        return { 
          success: false, 
          error: 'Email service not configured. RESEND_API_KEY is required.' 
        };
      }

      // Validate email address
      if (!email || !email.includes('@')) {
        logger.error('Invalid email address provided', { email, type });
        return { 
          success: false, 
          error: 'Invalid email address' 
        };
      }

      // Validate from address
      const fromAddress = BRANDING.email || 'hello@momentumdiy.com';
      if (!fromAddress || !fromAddress.includes('@')) {
        logger.error('Invalid from address in branding config', { fromAddress, type });
        return { 
          success: false, 
          error: 'Invalid from address configuration' 
        };
      }

      logger.debug('Attempting to send email', {
        type,
        to: email,
        from: `${BRANDING.name} <${fromAddress}>`,
        subject
      });

      const result = await resend.emails.send({
        from: `${BRANDING.name} <${fromAddress}>`,
        to: email,
        subject: subject,
        html: emailContent,
      });

      logger.info(`${type} notification sent successfully`, { 
        result,
        emailId: result.data?.id,
        to: email,
        type
      });
      return { success: true };

    } catch (error) {
      logger.error(`Error sending ${data.type} notification`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // ============================================================================
  // CONVENIENCE METHODS FOR DIRECT TEMPLATE ACCESS
  // ============================================================================

  /**
   * Get welcome email template (for testing or preview)
   */
  static getWelcomeEmailTemplate(name: string): string {
    const templateData: WelcomeTemplateData = { name, email: 'test@example.com' };
    return EmailTemplateFactory.createWelcomeTemplate(templateData);
  }

  /**
   * Get onboarding complete email template (for testing or preview)
   */
  static getOnboardingCompleteTemplate(name: string, data: any): string {
    const templateData: OnboardingCompleteTemplateData = { 
      name, 
      email: 'test@example.com',
      selectedTrack: data?.selectedTrack 
    };
    return EmailTemplateFactory.createOnboardingCompleteTemplate(templateData);
  }

  /**
   * Get trial ending email template (for testing or preview)
   */
  static getTrialEndingTemplate(name: string, data: any): string {
    const templateData: TrialEndingTemplateData = { 
      name, 
      email: 'test@example.com',
      daysRemaining: data?.daysRemaining,
      trialEndDate: data?.trialEndDate
    };
    return EmailTemplateFactory.createTrialEndingTemplate(templateData);
  }

  /**
   * Get subscription active email template (for testing or preview)
   */
  static getSubscriptionActiveTemplate(name: string, data: any): string {
    const templateData: SubscriptionActiveTemplateData = { 
      name, 
      email: 'test@example.com',
      planName: data?.planName,
      nextBillingDate: data?.nextBillingDate
    };
    return EmailTemplateFactory.createSubscriptionActiveTemplate(templateData);
  }

  /**
   * Get subscription cancelled email template (for testing or preview)
   */
  static getSubscriptionCancelledTemplate(name: string, data: any): string {
    const templateData: SubscriptionCancelledTemplateData = { 
      name, 
      email: 'test@example.com',
      cancellationDate: data?.cancellationDate,
      feedback: data?.feedback
    };
    return EmailTemplateFactory.createSubscriptionCancelledTemplate(templateData);
  }

  /**
   * Get weekly progress email template (for testing or preview)
   */
  static getWeeklyProgressTemplate(name: string, data: any): string {
    const templateData: WeeklyProgressTemplateData = { 
      name, 
      email: 'test@example.com',
      weekNumber: data?.weekNumber,
      completedTasks: data?.completedTasks,
      totalTasks: data?.totalTasks,
      nextWeekTasks: data?.nextWeekTasks
    };
    return EmailTemplateFactory.createWeeklyProgressTemplate(templateData);
  }

  /**
   * Get task reminder email template (for testing or preview)
   */
  static getTaskReminderTemplate(name: string, data: any): string {
    const templateData: TaskReminderTemplateData = { 
      name, 
      email: 'test@example.com',
      taskTitle: data?.taskTitle,
      dueDate: data?.dueDate,
      trackName: data?.trackName
    };
    return EmailTemplateFactory.createTaskReminderTemplate(templateData);
  }

  /**
   * Send partner approval email
   */
  static async sendPartnerApprovalEmail(data: {
    email: string;
    name: string;
    dashboardUrl: string;
    referralCode: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const templateData: PartnerApprovalTemplateData = {
        name: data.name,
        email: data.email,
        dashboardUrl: data.dashboardUrl,
        referralCode: data.referralCode
      };

      const emailContent = EmailTemplateFactory.createPartnerApprovalTemplate(templateData);
      
      if (!resend) {
        logger.warn('Email service not configured, skipping email send');
        return { success: true };
      }

      await resend.emails.send({
        from: `${BRANDING.name} <${BRANDING.email}>`,
        to: data.email,
        subject: '🎉 Welcome to the Affiliate Partner Program!',
        html: emailContent,
      });

      logger.info('Partner approval email sent successfully', { 
        email: data.email, 
        referralCode: data.referralCode 
      });
      return { success: true };

    } catch (error) {
      logger.error('Error sending partner approval email', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Send partner rejection email
   */
  static async sendPartnerRejectionEmail(data: {
    email: string;
    name: string;
    rejectionReason?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const templateData: PartnerRejectionTemplateData = {
        name: data.name,
        email: data.email,
        ...(data.rejectionReason && { rejectionReason: data.rejectionReason })
      };

      const emailContent = EmailTemplateFactory.createPartnerRejectionTemplate(templateData);
      
      if (!resend) {
        logger.warn('Email service not configured, skipping email send');
        return { success: true };
      }

      await resend.emails.send({
        from: `${BRANDING.name} <${BRANDING.email}>`,
        to: data.email,
        subject: `Affiliate Partner Application Update - ${BRANDING.name}`,
        html: emailContent,
      });

      logger.info('Partner rejection email sent successfully', { 
        email: data.email,
        name: data.name
      });

      return { success: true };
    } catch (error) {
      logger.error('Error sending partner rejection email', error);
      return { success: false, error: 'Failed to send email' };
    }
  }

  /**
   * Send admin notification about new partner application
   */
  static async sendAdminPartnerApplicationNotification(data: {
    applicationId: string;
    applicantName: string;
    applicantEmail: string;
    companyName?: string;
    applicationUrl: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const adminEmails = (process.env['ADMIN_EMAILS'] || 'info@hillaryedenmcmullen.com')
        .split(',')
        .map(email => email.trim())
        .filter(Boolean);

      if (adminEmails.length === 0) {
        logger.warn('No admin emails configured for partner application notifications');
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
              This is an automated notification from ${BRANDING.name}.
            </p>
          </div>
        </body>
        </html>
      `;
      
      if (!resend) {
        logger.warn('Email service not configured, skipping admin notification');
        return { success: true };
      }

      // Send to all admin emails
      const emailPromises = adminEmails.map(adminEmail =>
        resend.emails.send({
          from: `${BRANDING.name} <${BRANDING.email}>`,
          to: adminEmail,
          subject: `New Partner Application: ${data.applicantName}`,
          html: emailContent,
        })
      );

      await Promise.all(emailPromises);

      logger.info('Admin partner application notification sent', { 
        applicationId: data.applicationId,
        adminEmails
      });

      return { success: true };
    } catch (error) {
      logger.error('Error sending admin partner application notification', error);
      return { success: false, error: 'Failed to send email' };
    }
  }
}
