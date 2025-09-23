import { EmailService } from './emailService';
import { EmailPreferences } from '../types';

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
      console.log(`📧 Welcome email sent to ${user.email}`);
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
    }
  }

  /**
   * Send onboarding complete email
   */
  static async sendOnboardingCompleteNotification(user: UserProfile, onboardingData: any): Promise<void> {
    try {
      await EmailService.sendNotificationEmail({
        name: user.name,
        email: user.email,
        type: 'onboarding_complete',
        data: onboardingData
      });
      console.log(`📧 Onboarding complete email sent to ${user.email}`);
    } catch (error) {
      console.error('❌ Error sending onboarding complete email:', error);
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
      console.log(`📧 Trial ending email sent to ${user.email} (${daysLeft} days left)`);
    } catch (error) {
      console.error('❌ Error sending trial ending email:', error);
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
      console.log(`📧 Subscription active email sent to ${user.email}`);
    } catch (error) {
      console.error('❌ Error sending subscription active email:', error);
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
      console.log(`📧 Subscription cancelled email sent to ${user.email}`);
    } catch (error) {
      console.error('❌ Error sending subscription cancelled email:', error);
    }
  }

  /**
   * Send weekly progress report
   */
  static async sendWeeklyProgressNotification(user: UserProfile, progressData: any): Promise<void> {
    try {
      await EmailService.sendNotificationEmail({
        name: user.name,
        email: user.email,
        type: 'weekly_progress',
        data: progressData
      });
      console.log(`📧 Weekly progress email sent to ${user.email}`);
    } catch (error) {
      console.error('❌ Error sending weekly progress email:', error);
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
      console.log(`📧 Task reminder email sent to ${user.email}`);
    } catch (error) {
      console.error('❌ Error sending task reminder email:', error);
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
    console.log('📧 Task reminder check would run here');
  }
}
