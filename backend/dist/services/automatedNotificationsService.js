"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomatedNotificationsService = void 0;
const supabase_1 = require("../config/supabase");
const notificationService_1 = require("./notificationService");
const marketingService_1 = require("./marketingService");
const logger_1 = require("../utils/logger");
class AutomatedNotificationsService {
    static async getAllUsers() {
        try {
            const { data: profiles, error } = await supabase_1.supabase
                .from('profiles')
                .select('*');
            if (error) {
                logger_1.logger.error('Error fetching users for notifications', error);
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
        }
        catch (error) {
            logger_1.logger.error('Error in getAllUsers', error);
            return [];
        }
    }
    static shouldSendEmail(user, emailType) {
        const preferences = user.email_preferences || {
            weekly_progress: true,
            task_reminders: true,
            marketing_emails: true,
            trial_emails: true
        };
        if (emailType === 'trial_emails') {
            return true;
        }
        return preferences[emailType] === true;
    }
    static async getUserProgressData(_userId) {
        try {
            const goalsResponse = await marketingService_1.MarketingService.getMarketingGoals();
            if (!goalsResponse.success || !goalsResponse.data) {
                return null;
            }
            const activeGoal = goalsResponse.data.find(goal => goal.isActive);
            if (!activeGoal) {
                return null;
            }
            const { data: tasksData, error: tasksError } = await supabase_1.supabase
                .from('tasks')
                .select('*')
                .eq('marketing_track->>goalId', activeGoal.id);
            if (tasksError || !tasksData) {
                logger_1.logger.error('Error fetching tasks for progress data', tasksError);
                return null;
            }
            const marketingTasks = tasksData;
            const completedTasks = marketingTasks.filter(task => task.status === 'completed').length;
            const totalTasks = marketingTasks.length;
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
        }
        catch (error) {
            logger_1.logger.error('Error getting user progress data', error);
            return null;
        }
    }
    static async sendWeeklyProgressReports() {
        logger_1.logger.info('Starting weekly progress reports');
        try {
            const users = await this.getAllUsers();
            const activeUsers = users.filter(user => (user.subscription_status === 'active' || user.subscription_status === 'trial') &&
                user.onboarding_completed);
            logger_1.logger.info('Found active users for weekly reports', { count: activeUsers.length });
            for (const user of activeUsers) {
                try {
                    if (!this.shouldSendEmail(user, 'weekly_progress')) {
                        logger_1.logger.debug('Skipping weekly progress email (preference disabled)', { userEmail: user.email });
                        continue;
                    }
                    const progressData = await this.getUserProgressData(user.id);
                    if (progressData) {
                        await notificationService_1.NotificationService.sendWeeklyProgressNotification(user, progressData);
                        logger_1.logger.info('Weekly progress report sent', { userEmail: user.email });
                    }
                    else {
                        logger_1.logger.warn('No progress data found for user', { userEmail: user.email });
                    }
                }
                catch (error) {
                    logger_1.logger.error('Error sending weekly report', error, { userEmail: user.email });
                }
            }
            logger_1.logger.info('Weekly progress reports completed');
        }
        catch (error) {
            logger_1.logger.error('Error in sendWeeklyProgressReports', error);
        }
    }
    static async sendTrialEndingNotifications() {
        logger_1.logger.info('Starting trial ending notifications');
        try {
            const users = await this.getAllUsers();
            const usersForTrialEmails = users.filter(user => this.shouldSendEmail(user, 'trial_emails'));
            await notificationService_1.NotificationService.checkTrialEndingNotifications(usersForTrialEmails);
            logger_1.logger.info('Trial ending notifications completed');
        }
        catch (error) {
            logger_1.logger.error('Error in sendTrialEndingNotifications', error);
        }
    }
    static async sendTaskReminders() {
        logger_1.logger.info('Starting task reminder notifications');
        try {
            const users = await this.getAllUsers();
            const activeUsers = users.filter(user => (user.subscription_status === 'active' || user.subscription_status === 'trial') &&
                user.onboarding_completed);
            for (const user of activeUsers) {
                try {
                    if (!this.shouldSendEmail(user, 'task_reminders')) {
                        logger_1.logger.debug('Skipping task reminder email (preference disabled)', { userEmail: user.email });
                        continue;
                    }
                    const progressData = await this.getUserProgressData(user.id);
                    if (progressData &&
                        progressData.daysSinceLastActivity &&
                        progressData.daysSinceLastActivity >= 3 &&
                        progressData.completedTasks < progressData.totalTasks) {
                        await notificationService_1.NotificationService.sendTaskReminderNotification(user, `${progressData.trackName} tasks`);
                        logger_1.logger.info('Task reminder sent', {
                            userEmail: user.email,
                            daysInactive: progressData.daysSinceLastActivity
                        });
                    }
                }
                catch (error) {
                    logger_1.logger.error('Error sending task reminder', error, { userEmail: user.email });
                }
            }
            logger_1.logger.info('Task reminder notifications completed');
        }
        catch (error) {
            logger_1.logger.error('Error in sendTaskReminders', error);
        }
    }
    static async runAllNotifications() {
        logger_1.logger.info('Running all automated notifications');
        try {
            await Promise.all([
                this.sendWeeklyProgressReports(),
                this.sendTrialEndingNotifications(),
                this.sendTaskReminders()
            ]);
            logger_1.logger.info('All automated notifications completed');
        }
        catch (error) {
            logger_1.logger.error('Error running automated notifications', error);
        }
    }
    static async scheduleNotifications() {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const hour = now.getHours();
        logger_1.logger.debug('Evaluating notification schedule', { dayOfWeek, hour });
        if (dayOfWeek === 1 && hour === 9) {
            await this.sendWeeklyProgressReports();
        }
        if (hour === 10) {
            await this.sendTrialEndingNotifications();
        }
        if (dayOfWeek === 3 && hour === 14) {
            await this.sendTaskReminders();
        }
    }
}
exports.AutomatedNotificationsService = AutomatedNotificationsService;
//# sourceMappingURL=automatedNotificationsService.js.map