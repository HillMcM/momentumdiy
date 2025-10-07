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
  FeedbackTemplateData
} from './emailTemplates';

const resend = new Resend(process.env['RESEND_API_KEY'] || 're_HAwFtwhA_E1nrZGWHUWiA5E3Pbd4kHN2M');

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
      
      const result = await resend.emails.send({
        from: 'MomentumDIY <hello@momentumdiy.com>',
        to: 'info@hillaryedenmcmullen.com',
        subject: `New Feedback: ${data.subject}`,
        html: emailContent,
      });

      console.log('📧 Feedback email sent successfully:', result);
      return { success: true };

    } catch (error) {
      console.error('❌ Error sending feedback email:', error);
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
      
      const result = await resend.emails.send({
        from: 'MomentumDIY <hello@momentumdiy.com>',
        to: data.email,
        subject: 'Welcome to MomentumDIY - Let\'s Grow Your Business!',
        html: emailContent,
      });

      console.log('📧 Welcome email sent successfully:', result);
      return { success: true };

    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
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
      
      const result = await resend.emails.send({
        from: 'MomentumDIY <hello@momentumdiy.com>',
        to: 'info@hillaryedenmcmullen.com',
        subject: 'Test Email - MomentumDIY Template System',
        html: emailContent,
      });

      console.log('📧 Test email sent successfully:', result);
      return { success: true };

    } catch (error) {
      console.error('❌ Error sending test email:', error);
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

      const result = await resend.emails.send({
        from: 'MomentumDIY <hello@momentumdiy.com>',
        to: email,
        subject: subject,
        html: emailContent,
      });

      console.log(`📧 ${type} notification sent successfully:`, result);
      return { success: true };

    } catch (error) {
      console.error(`❌ Error sending ${data.type} notification:`, error);
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
}
