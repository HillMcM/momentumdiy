import { EmailService } from './emailService';
import { EmailPreferences } from '../types';
import { logger } from '../utils/logger';

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

export interface OnboardingData {
  businessName?: string;
  businessType?: string;
  industry?: string;
  selectedTrack?: string;
  [key: string]: unknown;
}

export interface ProgressData {
  completedTasks: number;
  totalTasks: number;
  weekNumber: number;
  trackName: string;
  [key: string]: unknown;
}

export class NotificationService {
  /**
   * Send welcome email when user signs up
   */
  static async sendWelcomeNotification(user: UserProfile): Promise<void> {
    try {
      await EmailService.sendNotificationEmail({
        name: user.name,
        email: user.email,
        type: 'welcome'
      });
      logger.info('Welcome email sent', { email: user.email });
    } catch (error) {
      logger.error('Error sending welcome email', error, { email: user.email });
    }
  }

  /**
   * Send onboarding complete email
   */
  static async sendOnboardingCompleteNotification(user: UserProfile, onboardingData: OnboardingData): Promise<void> {
    try {
      await EmailService.sendNotificationEmail({
        name: user.name,
        email: user.email,
        type: 'onboarding_complete',
        data: onboardingData
      });
      logger.info('Onboarding complete email sent', { email: user.email });
    } catch (error) {
      logger.error('Error sending onboarding complete email', error, { email: user.email });
    }
  }

  /**
   * Send trial ending reminder
   */
  static async sendTrialEndingNotification(user: UserProfile, daysLeft: number): Promise<void> {
    try {
      await EmailService.sendNotificationEmail({
        name: user.name,
        email: user.email,
        type: 'trial_ending',
        data: { daysLeft }
      });
      logger.info('Trial ending email sent', { email: user.email, daysLeft });
    } catch (error) {
      logger.error('Error sending trial ending email', error, { email: user.email, daysLeft });
    }
  }

  /**
   * Send subscription activated email
   */
  static async sendSubscriptionActiveNotification(user: UserProfile, plan: string): Promise<void> {
    try {
      await EmailService.sendNotificationEmail({
        name: user.name,
        email: user.email,
        type: 'subscription_active',
        data: { plan }
      });
      logger.info('Subscription active email sent', { email: user.email, plan });
    } catch (error) {
      logger.error('Error sending subscription active email', error, { email: user.email, plan });
    }
  }

  /**
   * Send subscription cancelled email
   */
  static async sendSubscriptionCancelledNotification(user: UserProfile): Promise<void> {
    try {
      await EmailService.sendNotificationEmail({
        name: user.name,
        email: user.email,
        type: 'subscription_cancelled'
      });
      logger.info('Subscription cancelled email sent', { email: user.email });
    } catch (error) {
      logger.error('Error sending subscription cancelled email', error, { email: user.email });
    }
  }

  /**
   * Send weekly progress report
   */
  static async sendWeeklyProgressNotification(user: UserProfile, progressData: ProgressData): Promise<void> {
    try {
      await EmailService.sendNotificationEmail({
        name: user.name,
        email: user.email,
        type: 'weekly_progress',
        data: progressData
      });
      logger.info('Weekly progress email sent', { email: user.email });
    } catch (error) {
      logger.error('Error sending weekly progress email', error, { email: user.email });
    }
  }

  /**
   * Send task reminder
   */
  static async sendTaskReminderNotification(user: UserProfile, taskName: string): Promise<void> {
    try {
      await EmailService.sendNotificationEmail({
        name: user.name,
        email: user.email,
        type: 'task_reminder',
        data: { taskName }
      });
      logger.info('Task reminder email sent', { email: user.email, taskName });
    } catch (error) {
      logger.error('Error sending task reminder email', error, { email: user.email, taskName });
    }
  }

  /**
   * Check and send trial ending notifications
   */
  static async checkTrialEndingNotifications(users: UserProfile[]): Promise<void> {
    const now = new Date();
    
    for (const user of users) {
      if (user.subscription_status === 'trial' && user.trial_end_date) {
        const trialEnd = new Date(user.trial_end_date);
        const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        // Send reminders at 7 days, 3 days, and 1 day before trial ends
        if (daysLeft === 7 || daysLeft === 3 || daysLeft === 1) {
          await this.sendTrialEndingNotification(user, daysLeft);
        }
      }
    }
  }

  /**
   * Send weekly progress reports to active users
   */
  static async sendWeeklyProgressReports(users: UserProfile[]): Promise<void> {
    const activeUsers = users.filter(user => 
      user.subscription_status === 'active' || 
      (user.subscription_status === 'trial' && user.onboarding_completed)
    );

    for (const user of activeUsers) {
      // Calculate progress data (this would come from your database)
      const progressData = {
        completedTasks: 5, // This would be calculated from actual data
        totalTasks: 12,
        weekNumber: 3,
        trackName: user.selected_track || 'Marketing Track'
      };

      await this.sendWeeklyProgressNotification(user, progressData);
    }
  }

  /**
   * Send task reminders for overdue tasks
   */
  static async sendTaskReminders(_users: UserProfile[]): Promise<void> {
    // This would check for users with overdue tasks
    // For now, this is a placeholder
    logger.debug('Task reminder check would run here');
  }
}
