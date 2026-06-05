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
    static async getUserProgressData(userId) {
        try {
            const goalsResponse = await marketingService_1.MarketingService.getActiveMarketingGoal(userId);
            if (!goalsResponse.success || !goalsResponse.data) {
                return null;
            }
            const activeGoal = goalsResponse.data;
            if (!activeGoal) {
                return null;
            }
            const { data: modulesData, error: modulesError } = await supabase_1.supabase
                .from('marketing_modules')
                .select('id')
                .eq('track_id', activeGoal.trackDefinitionId || activeGoal.id);
            if (modulesError || !modulesData || modulesData.length === 0) {
                logger_1.logger.error('Error fetching modules for progress data', modulesError);
                return null;
            }
            const moduleIds = modulesData.map(m => m.id);
            const { data: tasksData, error: tasksError } = await supabase_1.supabase
                .from('marketing_tasks')
                .select('id')
                .in('module_id', moduleIds);
            if (tasksError || !tasksData) {
                logger_1.logger.error('Error fetching tasks for progress data', tasksError);
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
            const { data: completionsData, error: completionsError } = await supabase_1.supabase
                .from('user_task_completions')
                .select('completed_at')
                .eq('user_id', userId)
                .in('task_id', taskIds)
                .order('completed_at', { ascending: false });
            if (completionsError) {
                logger_1.logger.error('Error fetching task completions for progress data', completionsError);
                return null;
            }
            const completedTasks = completionsData?.length || 0;
            const lastActivityDate = completionsData && completionsData.length > 0
                ? completionsData[0]?.completed_at
                : undefined;
            const daysSinceLastActivity = lastActivityDate
                ? Math.floor((new Date().getTime() - new Date(lastActivityDate).getTime()) / (1000 * 60 * 60 * 24))
                : undefined;
            const { data: profileData } = await supabase_1.supabase
                .from('profiles')
                .select('last_activity')
                .eq('id', userId)
                .single();
            let finalDaysSinceLastActivity = daysSinceLastActivity;
            if (finalDaysSinceLastActivity === undefined && profileData?.last_activity) {
                finalDaysSinceLastActivity = Math.floor((new Date().getTime() - new Date(profileData.last_activity).getTime()) / (1000 * 60 * 60 * 24));
            }
            return {
                completedTasks,
                totalTasks,
                weekNumber: activeGoal.currentWeek,
                trackName: activeGoal.title,
                ...(lastActivityDate && { lastActivityDate }),
                ...(finalDaysSinceLastActivity !== undefined && { daysSinceLastActivity: finalDaysSinceLastActivity })
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
            let emailsSent = 0;
            let emailsSkipped = 0;
            let errors = 0;
            for (const user of activeUsers) {
                try {
                    if (!this.shouldSendEmail(user, 'weekly_progress')) {
                        logger_1.logger.debug('Skipping weekly progress email (preference disabled)', { userEmail: user.email });
                        emailsSkipped++;
                        continue;
                    }
                    const progressData = await this.getUserProgressData(user.id);
                    if (progressData) {
                        await notificationService_1.NotificationService.sendWeeklyProgressNotification(user, progressData);
                        logger_1.logger.info('Weekly progress report sent', { userEmail: user.email });
                        emailsSent++;
                    }
                    else {
                        logger_1.logger.warn('No progress data found for user', { userEmail: user.email });
                        emailsSkipped++;
                    }
                }
                catch (error) {
                    logger_1.logger.error('Error sending weekly report', error, { userEmail: user.email });
                    errors++;
                }
            }
            logger_1.logger.info('Weekly progress reports completed', {
                totalUsers: activeUsers.length,
                emailsSent,
                emailsSkipped,
                errors
            });
        }
        catch (error) {
            logger_1.logger.error('Error in sendWeeklyProgressReports', error);
        }
    }
    static async sendTrialEndingNotifications() {
        logger_1.logger.info('Starting trial ending notifications');
        try {
            const users = await this.getAllUsers();
            logger_1.logger.info('Found total users', { count: users.length });
            const usersForTrialEmails = users.filter(user => this.shouldSendEmail(user, 'trial_emails'));
            logger_1.logger.info('Users eligible for trial ending emails', { count: usersForTrialEmails.length });
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
            logger_1.logger.info('Found active users for task reminders', { count: activeUsers.length });
            const reminderIntervals = [3, 7, 12, 17, 24];
            let emailsSent = 0;
            let emailsSkipped = 0;
            let errors = 0;
            let usersChecked = 0;
            for (const user of activeUsers) {
                try {
                    usersChecked++;
                    if (!this.shouldSendEmail(user, 'task_reminders')) {
                        logger_1.logger.debug('Skipping task reminder email (preference disabled)', { userEmail: user.email });
                        emailsSkipped++;
                        continue;
                    }
                    const progressData = await this.getUserProgressData(user.id);
                    if (!progressData ||
                        !progressData.daysSinceLastActivity ||
                        progressData.completedTasks >= progressData.totalTasks) {
                        emailsSkipped++;
                        continue;
                    }
                    const daysInactive = progressData.daysSinceLastActivity;
                    const matchingInterval = reminderIntervals.find(interval => daysInactive >= interval && daysInactive < interval + 1);
                    if (matchingInterval !== undefined) {
                        const reminderNumber = reminderIntervals.indexOf(matchingInterval) + 1;
                        await notificationService_1.NotificationService.sendTaskReminderNotification(user, `${progressData.trackName} tasks`, reminderNumber, daysInactive);
                        logger_1.logger.info('Task reminder sent', {
                            userEmail: user.email,
                            daysInactive,
                            reminderNumber: reminderNumber,
                            interval: matchingInterval
                        });
                        emailsSent++;
                    }
                    else {
                        emailsSkipped++;
                        logger_1.logger.debug('User not at reminder interval', {
                            userEmail: user.email,
                            daysInactive,
                            intervals: reminderIntervals
                        });
                    }
                }
                catch (error) {
                    logger_1.logger.error('Error sending task reminder', error, { userEmail: user.email });
                    errors++;
                }
            }
            logger_1.logger.info('Task reminder notifications completed', {
                totalUsers: activeUsers.length,
                usersChecked,
                emailsSent,
                emailsSkipped,
                errors
            });
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
        const minute = now.getMinutes();
        logger_1.logger.info('Evaluating notification schedule', {
            dayOfWeek,
            hour,
            minute,
            dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]
        });
        let notificationsTriggered = 0;
        if (dayOfWeek === 1 && hour === 9 && minute < 60) {
            logger_1.logger.info('Triggering weekly progress reports');
            await this.sendWeeklyProgressReports();
            notificationsTriggered++;
        }
        else {
            logger_1.logger.debug('Skipping weekly progress reports - not Monday 9 AM', { dayOfWeek, hour, minute });
        }
        if (hour === 10 && minute < 60) {
            logger_1.logger.info('Triggering trial ending notifications');
            await this.sendTrialEndingNotifications();
            notificationsTriggered++;
        }
        else {
            logger_1.logger.debug('Skipping trial ending notifications - not 10 AM', { hour, minute });
        }
        if (hour === 14 && minute < 60) {
            logger_1.logger.info('Triggering task reminders');
            await this.sendTaskReminders();
            notificationsTriggered++;
        }
        else {
            logger_1.logger.debug('Skipping task reminders - not 2 PM', { hour, minute });
        }
        if (notificationsTriggered === 0) {
            logger_1.logger.info('No notifications scheduled for this time. Schedule: Weekly reports (Mon 9 AM), Trial ending (Daily 10 AM), Task reminders (Daily 2 PM)');
        }
        else {
            logger_1.logger.info(`Triggered ${notificationsTriggered} notification type(s) for this hour`);
        }
    }
}
exports.AutomatedNotificationsService = AutomatedNotificationsService;
//# sourceMappingURL=automatedNotificationsService.js.map