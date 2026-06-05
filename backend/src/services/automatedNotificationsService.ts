import { supabase } from '../config/supabase';
import { NotificationService, UserProfile, ProgressData } from './notificationService';
import { MarketingService } from './marketingService';
import { EmailPreferences } from '../types';
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
  private static async getUserProgressData(userId: string): Promise<ProgressData | null> {
    try {
      // Get user's active marketing goal (this is user-specific)
      const goalsResponse = await MarketingService.getActiveMarketingGoal(userId);
      if (!goalsResponse.success || !goalsResponse.data) {
        return null;
      }

      const activeGoal = goalsResponse.data;
      if (!activeGoal) {
        return null;
      }

      // Get user's task completions from user_task_completions table
      // First, get all tasks for the active track's modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('marketing_modules')
        .select('id')
        .eq('track_id', activeGoal.trackDefinitionId || activeGoal.id);

      if (modulesError || !modulesData || modulesData.length === 0) {
        logger.error('Error fetching modules for progress data', modulesError);
        return null;
      }

      const moduleIds = modulesData.map(m => m.id);

      // Get all tasks for these modules
      const { data: tasksData, error: tasksError } = await supabase
        .from('marketing_tasks')
        .select('id')
        .in('module_id', moduleIds);

      if (tasksError || !tasksData) {
        logger.error('Error fetching tasks for progress data', tasksError);
        return null;
      }

      const taskIds = tasksData.map(t => t.id);
      const totalTasks = taskIds.length;

      if (totalTasks === 0) {
        return {
          completedTasks: 0,
          totalTasks: 0,
          weekNumber: activeGoal.currentWeek,
          trackName: activeGoal.title
        };
      }

      // Get user's completed tasks
      const { data: completionsData, error: completionsError } = await supabase
        .from('user_task_completions')
        .select('completed_at')
        .eq('user_id', userId)
        .in('task_id', taskIds)
        .order('completed_at', { ascending: false });

      if (completionsError) {
        logger.error('Error fetching task completions for progress data', completionsError);
        return null;
      }

      const completedTasks = completionsData?.length || 0;
      
      // Calculate days since last activity
      const lastActivityDate = completionsData && completionsData.length > 0 
        ? completionsData[0]?.completed_at 
        : undefined;
      
      const daysSinceLastActivity = lastActivityDate 
        ? Math.floor((new Date().getTime() - new Date(lastActivityDate).getTime()) / (1000 * 60 * 60 * 24))
        : undefined;

      // If user has profile.last_activity, use that as fallback for inactivity calculation
      const { data: profileData } = await supabase
        .from('profiles')
        .select('last_activity')
        .eq('id', userId)
        .single();

      let finalDaysSinceLastActivity = daysSinceLastActivity;
      
      // If no task completions but profile has last_activity, use that
      if (finalDaysSinceLastActivity === undefined && profileData?.last_activity) {
        finalDaysSinceLastActivity = Math.floor(
          (new Date().getTime() - new Date(profileData.last_activity).getTime()) / (1000 * 60 * 60 * 24)
        );
      }

      return {
        completedTasks,
        totalTasks,
        weekNumber: activeGoal.currentWeek,
        trackName: activeGoal.title,
        ...(lastActivityDate && { lastActivityDate }),
        ...(finalDaysSinceLastActivity !== undefined && { daysSinceLastActivity: finalDaysSinceLastActivity })
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

      let emailsSent = 0;
      let emailsSkipped = 0;
      let errors = 0;

      for (const user of activeUsers) {
        try {
          // Check if user wants to receive weekly progress emails
          if (!this.shouldSendEmail(user, 'weekly_progress')) {
            logger.debug('Skipping weekly progress email (preference disabled)', { userEmail: user.email });
            emailsSkipped++;
            continue;
          }

          const progressData = await this.getUserProgressData(user.id);
          if (progressData) {
            await NotificationService.sendWeeklyProgressNotification(user, progressData);
            logger.info('Weekly progress report sent', { userEmail: user.email });
            emailsSent++;
          } else {
            logger.warn('No progress data found for user', { userEmail: user.email });
            emailsSkipped++;
          }
        } catch (error) {
          logger.error('Error sending weekly report', error, { userEmail: user.email });
          errors++;
        }
      }

      logger.info('Weekly progress reports completed', { 
        totalUsers: activeUsers.length,
        emailsSent,
        emailsSkipped,
        errors
      });
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
      
      logger.info('Found total users', { count: users.length });
      
      // Filter users who want to receive trial emails (always true, but we check anyway)
      const usersForTrialEmails = users.filter(user => 
        this.shouldSendEmail(user, 'trial_emails')
      );
      
      logger.info('Users eligible for trial ending emails', { count: usersForTrialEmails.length });
      
      await NotificationService.checkTrialEndingNotifications(usersForTrialEmails);
      logger.info('Trial ending notifications completed');
    } catch (error) {
      logger.error('Error in sendTrialEndingNotifications', error);
    }
  }

  /**
   * Send task reminders for users who haven't been active
   * Uses spaced intervals: 3, 7, 12, 17, and 24 days
   */
  static async sendTaskReminders(): Promise<void> {
    logger.info('Starting task reminder notifications');
    
    try {
      const users = await this.getAllUsers();
      const activeUsers = users.filter(user => 
        (user.subscription_status === 'active' || user.subscription_status === 'trial') &&
        user.onboarding_completed
      );

      logger.info('Found active users for task reminders', { count: activeUsers.length });

      // Define reminder intervals (days of inactivity)
      const reminderIntervals = [3, 7, 12, 17, 24];

      let emailsSent = 0;
      let emailsSkipped = 0;
      let errors = 0;
      let usersChecked = 0;

      for (const user of activeUsers) {
        try {
          usersChecked++;
          
          // Check if user wants to receive task reminder emails
          if (!this.shouldSendEmail(user, 'task_reminders')) {
            logger.debug('Skipping task reminder email (preference disabled)', { userEmail: user.email });
            emailsSkipped++;
            continue;
          }

          const progressData = await this.getUserProgressData(user.id);
          
          // Skip if user has no progress data or no incomplete tasks
          if (!progressData || 
              !progressData.daysSinceLastActivity || 
              progressData.completedTasks >= progressData.totalTasks) {
            emailsSkipped++;
            continue;
          }

          const daysInactive = progressData.daysSinceLastActivity;

          // Check if days of inactivity matches any reminder interval
          // Allow for 1-day window since cron runs daily (e.g., 3-4 days counts as 3 days)
          const matchingInterval = reminderIntervals.find(interval => 
            daysInactive >= interval && daysInactive < interval + 1
          );

          if (matchingInterval !== undefined) {
            // Get the reminder number (which interval this is, 1-indexed)
            const reminderNumber = reminderIntervals.indexOf(matchingInterval) + 1;

            await NotificationService.sendTaskReminderNotification(
              user, 
              `${progressData.trackName} tasks`,
              reminderNumber,
              daysInactive
            );
            logger.info('Task reminder sent', { 
              userEmail: user.email, 
              daysInactive,
              reminderNumber: reminderNumber,
              interval: matchingInterval
            });
            emailsSent++;
          } else {
            emailsSkipped++;
            logger.debug('User not at reminder interval', { 
              userEmail: user.email, 
              daysInactive,
              intervals: reminderIntervals 
            });
          }
        } catch (error) {
          logger.error('Error sending task reminder', error, { userEmail: user.email });
          errors++;
        }
      }

      logger.info('Task reminder notifications completed', { 
        totalUsers: activeUsers.length,
        usersChecked,
        emailsSent,
        emailsSkipped,
        errors
      });
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
   * Should be called every hour to check the schedule
   */
  static async scheduleNotifications(): Promise<void> {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const hour = now.getHours();
    const minute = now.getMinutes();

    logger.info('Evaluating notification schedule', { 
      dayOfWeek, 
      hour, 
      minute,
      dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]
    });

    let notificationsTriggered = 0;

    // Send weekly progress reports on Mondays at 9 AM (allow 9:00-9:59 window)
    if (dayOfWeek === 1 && hour === 9 && minute < 60) {
      logger.info('Triggering weekly progress reports');
      await this.sendWeeklyProgressReports();
      notificationsTriggered++;
    } else {
      logger.debug('Skipping weekly progress reports - not Monday 9 AM', { dayOfWeek, hour, minute });
    }

    // Send trial ending notifications daily at 10 AM (allow 10:00-10:59 window)
    if (hour === 10 && minute < 60) {
      logger.info('Triggering trial ending notifications');
      await this.sendTrialEndingNotifications();
      notificationsTriggered++;
    } else {
      logger.debug('Skipping trial ending notifications - not 10 AM', { hour, minute });
    }

    // Send task reminders daily at 2 PM
    // Uses spaced intervals (3, 7, 12, 17, 24 days) to avoid email fatigue
    if (hour === 14 && minute < 60) {
      logger.info('Triggering task reminders');
      await this.sendTaskReminders();
      notificationsTriggered++;
    } else {
      logger.debug('Skipping task reminders - not 2 PM', { hour, minute });
    }

    if (notificationsTriggered === 0) {
      logger.info('No notifications scheduled for this time. Schedule: Weekly reports (Mon 9 AM), Trial ending (Daily 10 AM), Task reminders (Daily 2 PM)');
    } else {
      logger.info(`Triggered ${notificationsTriggered} notification type(s) for this hour`);
    }
  }
}
