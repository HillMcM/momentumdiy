import { supabase } from '../config/supabase';
import { NotificationService, UserProfile } from './notificationService';
import { MarketingService } from './marketingService';
import { DatabaseTask } from '../types';

export interface ProgressData {
  completedTasks: number;
  totalTasks: number;
  weekNumber: number;
  trackName: string;
  lastActivityDate?: string;
  daysSinceLastActivity?: number;
}

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
        console.error('Error fetching users:', error);
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
        last_activity: profile.last_activity
      })) || [];
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      return [];
    }
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
        console.error('Error fetching tasks:', tasksError);
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
      console.error('Error getting user progress data:', error);
      return null;
    }
  }

  /**
   * Send weekly progress reports to active users
   */
  static async sendWeeklyProgressReports(): Promise<void> {
    console.log('📧 Starting weekly progress reports...');
    
    try {
      const users = await this.getAllUsers();
      const activeUsers = users.filter(user => 
        (user.subscription_status === 'active' || user.subscription_status === 'trial') &&
        user.onboarding_completed
      );

      console.log(`📊 Found ${activeUsers.length} active users for weekly reports`);

      for (const user of activeUsers) {
        try {
          const progressData = await this.getUserProgressData(user.id);
          if (progressData) {
            await NotificationService.sendWeeklyProgressNotification(user, progressData);
            console.log(`✅ Weekly progress report sent to ${user.email}`);
          } else {
            console.log(`⚠️ No progress data found for ${user.email}`);
          }
        } catch (error) {
          console.error(`❌ Error sending weekly report to ${user.email}:`, error);
        }
      }

      console.log('✅ Weekly progress reports completed');
    } catch (error) {
      console.error('❌ Error in sendWeeklyProgressReports:', error);
    }
  }

  /**
   * Send trial ending notifications
   */
  static async sendTrialEndingNotifications(): Promise<void> {
    console.log('📧 Starting trial ending notifications...');
    
    try {
      const users = await this.getAllUsers();
      await NotificationService.checkTrialEndingNotifications(users);
      console.log('✅ Trial ending notifications completed');
    } catch (error) {
      console.error('❌ Error in sendTrialEndingNotifications:', error);
    }
  }

  /**
   * Send task reminders for users who haven't been active
   */
  static async sendTaskReminders(): Promise<void> {
    console.log('📧 Starting task reminder notifications...');
    
    try {
      const users = await this.getAllUsers();
      const activeUsers = users.filter(user => 
        (user.subscription_status === 'active' || user.subscription_status === 'trial') &&
        user.onboarding_completed
      );

      for (const user of activeUsers) {
        try {
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
            console.log(`✅ Task reminder sent to ${user.email} (${progressData.daysSinceLastActivity} days inactive)`);
          }
        } catch (error) {
          console.error(`❌ Error sending task reminder to ${user.email}:`, error);
        }
      }

      console.log('✅ Task reminder notifications completed');
    } catch (error) {
      console.error('❌ Error in sendTaskReminders:', error);
    }
  }

  /**
   * Run all automated notifications
   */
  static async runAllNotifications(): Promise<void> {
    console.log('🚀 Running all automated notifications...');
    
    try {
      // Run all notification types
      await Promise.all([
        this.sendWeeklyProgressReports(),
        this.sendTrialEndingNotifications(),
        this.sendTaskReminders()
      ]);
      
      console.log('✅ All automated notifications completed');
    } catch (error) {
      console.error('❌ Error running automated notifications:', error);
    }
  }

  /**
   * Schedule notifications (this would typically be called by a cron job)
   */
  static async scheduleNotifications(): Promise<void> {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const hour = now.getHours();

    console.log(`📅 Scheduling notifications - Day: ${dayOfWeek}, Hour: ${hour}`);

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
