import { supabase } from '../config/supabase';
import { NotificationService, UserProfile, ProgressData } from './notificationService';
import { MarketingService } from './marketingService';
import { DatabaseTask, EmailPreferences } from '../types';
import { logger } from '../utils/logger';

export class AutomatedNotificationsService {
  /**
   * Get all users who should receive notifications
   */
  private static async getAllUsers(): Promise<UserProfile[]> {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        logger.error('Error fetching users for notifications', error);
        return [];
      }

      return profiles?.map(profile => ({
        id: profile.id,
        email: profile.email || '',
        name: profile.business_name || profile.full_name || profile.email?.split('@')[0] || 'User',
        subscription_status: profile.subscription_status || 'trial',
        trial_end_date: profile.trial_end_date,
        onboarding_completed: profile.onboarding_completed || false,
        selected_track: profile.selected_track,
        last_activity: profile.last_activity,
        email_preferences: profile.email_preferences || {
          weekly_progress: true,
          task_reminders: true,
          marketing_emails: true,
          trial_emails: true
        }
      })) || [];
    } catch (error) {
      logger.error('Error in getAllUsers', error);
      return [];
    }
  }

  /**
   * Check if user wants to receive a specific type of email
   */
  private static shouldSendEmail(user: UserProfile, emailType: keyof EmailPreferences): boolean {
    const preferences = user.email_preferences || {
      weekly_progress: true,
      task_reminders: true,
      marketing_emails: true,
      trial_emails: true
    };

    // Always send trial emails regardless of preferences
    if (emailType === 'trial_emails') {
      return true;
    }

    return preferences[emailType] === true;
  }

  /**
   * Get user's progress data for weekly reports
   */
  private static async getUserProgressData(_userId: string): Promise<ProgressData | null> {
    try {
      // Get user's active marketing goal
      const goalsResponse = await MarketingService.getMarketingGoals();
      if (!goalsResponse.success || !goalsResponse.data) {
        return null;
      }

      const activeGoal = goalsResponse.data.find(goal => goal.isActive);
      if (!activeGoal) {
        return null;
      }

      // Get user's tasks directly from database
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('marketing_track->>goalId', activeGoal.id);

      if (tasksError || !tasksData) {
        logger.error('Error fetching tasks for progress data', tasksError);
        return null;
      }

      const marketingTasks = tasksData as DatabaseTask[];
      const completedTasks = marketingTasks.filter(task => task.status === 'completed').length;
      const totalTasks = marketingTasks.length;

      // Calculate days since last activity
      const completedTasksWithDates = marketingTasks
        .filter(task => task.status === 'completed' && task.updated_at)
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

      const lastActivityDate = completedTasksWithDates[0]?.updated_at;
      const daysSinceLastActivity = lastActivityDate 
        ? Math.floor((new Date().getTime() - new Date(lastActivityDate).getTime()) / (1000 * 60 * 60 * 24))
        : undefined;

      return {
        completedTasks,
        totalTasks,
        weekNumber: activeGoal.currentWeek,
        trackName: activeGoal.title,
        ...(lastActivityDate && { lastActivityDate }),
        ...(daysSinceLastActivity !== undefined && { daysSinceLastActivity })
      };
    } catch (error) {
      logger.error('Error getting user progress data', error);
      return null;
    }
  }

  /**
   * Send weekly progress reports to active users
   */
  static async sendWeeklyProgressReports(): Promise<void> {
    logger.info('Starting weekly progress reports');
    
    try {
      const users = await this.getAllUsers();
      const activeUsers = users.filter(user => 
        (user.subscription_status === 'active' || user.subscription_status === 'trial') &&
        user.onboarding_completed
      );

      logger.info('Found active users for weekly reports', { count: activeUsers.length });

      for (const user of activeUsers) {
        try {
          // Check if user wants to receive weekly progress emails
          if (!this.shouldSendEmail(user, 'weekly_progress')) {
            logger.debug('Skipping weekly progress email (preference disabled)', { userEmail: user.email });
            continue;
          }

          const progressData = await this.getUserProgressData(user.id);
          if (progressData) {
            await NotificationService.sendWeeklyProgressNotification(user, progressData);
            logger.info('Weekly progress report sent', { userEmail: user.email });
          } else {
            logger.warn('No progress data found for user', { userEmail: user.email });
          }
        } catch (error) {
          logger.error('Error sending weekly report', error, { userEmail: user.email });
        }
      }

      logger.info('Weekly progress reports completed');
    } catch (error) {
      logger.error('Error in sendWeeklyProgressReports', error);
    }
  }

  /**
   * Send trial ending notifications
   */
  static async sendTrialEndingNotifications(): Promise<void> {
    logger.info('Starting trial ending notifications');
    
    try {
      const users = await this.getAllUsers();
      
      // Filter users who want to receive trial emails (always true, but we check anyway)
      const usersForTrialEmails = users.filter(user => 
        this.shouldSendEmail(user, 'trial_emails')
      );
      
      await NotificationService.checkTrialEndingNotifications(usersForTrialEmails);
      logger.info('Trial ending notifications completed');
    } catch (error) {
      logger.error('Error in sendTrialEndingNotifications', error);
    }
  }

  /**
   * Send task reminders for users who haven't been active
   */
  static async sendTaskReminders(): Promise<void> {
    logger.info('Starting task reminder notifications');
    
    try {
      const users = await this.getAllUsers();
      const activeUsers = users.filter(user => 
        (user.subscription_status === 'active' || user.subscription_status === 'trial') &&
        user.onboarding_completed
      );

      for (const user of activeUsers) {
        try {
          // Check if user wants to receive task reminder emails
          if (!this.shouldSendEmail(user, 'task_reminders')) {
            logger.debug('Skipping task reminder email (preference disabled)', { userEmail: user.email });
            continue;
          }

          const progressData = await this.getUserProgressData(user.id);
          
          // Send reminder if user hasn't been active for 3+ days and has incomplete tasks
          if (progressData && 
              progressData.daysSinceLastActivity && 
              progressData.daysSinceLastActivity >= 3 &&
              progressData.completedTasks < progressData.totalTasks) {
            
            await NotificationService.sendTaskReminderNotification(
              user, 
              `${progressData.trackName} tasks`
            );
            logger.info('Task reminder sent', { 
              userEmail: user.email, 
              daysInactive: progressData.daysSinceLastActivity 
            });
          }
        } catch (error) {
          logger.error('Error sending task reminder', error, { userEmail: user.email });
        }
      }

      logger.info('Task reminder notifications completed');
    } catch (error) {
      logger.error('Error in sendTaskReminders', error);
    }
  }

  /**
   * Run all automated notifications
   */
  static async runAllNotifications(): Promise<void> {
    logger.info('Running all automated notifications');
    
    try {
      // Run all notification types
      await Promise.all([
        this.sendWeeklyProgressReports(),
        this.sendTrialEndingNotifications(),
        this.sendTaskReminders()
      ]);
      
      logger.info('All automated notifications completed');
    } catch (error) {
      logger.error('Error running automated notifications', error);
    }
  }

  /**
   * Schedule notifications (this would typically be called by a cron job)
   */
  static async scheduleNotifications(): Promise<void> {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const hour = now.getHours();

    logger.debug('Evaluating notification schedule', { dayOfWeek, hour });

    // Send weekly progress reports on Mondays at 9 AM
    if (dayOfWeek === 1 && hour === 9) {
      await this.sendWeeklyProgressReports();
    }

    // Send trial ending notifications daily at 10 AM
    if (hour === 10) {
      await this.sendTrialEndingNotifications();
    }

    // Send task reminders on Wednesdays at 2 PM
    if (dayOfWeek === 3 && hour === 14) {
      await this.sendTaskReminders();
    }
  }
}
