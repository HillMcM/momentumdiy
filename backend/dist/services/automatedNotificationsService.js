"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomatedNotificationsService = void 0;
const supabase_1 = require("../config/supabase");
const notificationService_1 = require("./notificationService");
const marketingService_1 = require("./marketingService");
class AutomatedNotificationsService {
    static async getAllUsers() {
        try {
            const { data: profiles, error } = await supabase_1.supabase
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
            console.error('Error in getAllUsers:', error);
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
                console.error('Error fetching tasks:', tasksError);
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
            console.error('Error getting user progress data:', error);
            return null;
        }
    }
    static async sendWeeklyProgressReports() {
        console.log('📧 Starting weekly progress reports...');
        try {
            const users = await this.getAllUsers();
            const activeUsers = users.filter(user => (user.subscription_status === 'active' || user.subscription_status === 'trial') &&
                user.onboarding_completed);
            console.log(`📊 Found ${activeUsers.length} active users for weekly reports`);
            for (const user of activeUsers) {
                try {
                    if (!this.shouldSendEmail(user, 'weekly_progress')) {
                        console.log(`⏭️ Skipping weekly progress email for ${user.email} (preference disabled)`);
                        continue;
                    }
                    const progressData = await this.getUserProgressData(user.id);
                    if (progressData) {
                        await notificationService_1.NotificationService.sendWeeklyProgressNotification(user, progressData);
                        console.log(`✅ Weekly progress report sent to ${user.email}`);
                    }
                    else {
                        console.log(`⚠️ No progress data found for ${user.email}`);
                    }
                }
                catch (error) {
                    console.error(`❌ Error sending weekly report to ${user.email}:`, error);
                }
            }
            console.log('✅ Weekly progress reports completed');
        }
        catch (error) {
            console.error('❌ Error in sendWeeklyProgressReports:', error);
        }
    }
    static async sendTrialEndingNotifications() {
        console.log('📧 Starting trial ending notifications...');
        try {
            const users = await this.getAllUsers();
            const usersForTrialEmails = users.filter(user => this.shouldSendEmail(user, 'trial_emails'));
            await notificationService_1.NotificationService.checkTrialEndingNotifications(usersForTrialEmails);
            console.log('✅ Trial ending notifications completed');
        }
        catch (error) {
            console.error('❌ Error in sendTrialEndingNotifications:', error);
        }
    }
    static async sendTaskReminders() {
        console.log('📧 Starting task reminder notifications...');
        try {
            const users = await this.getAllUsers();
            const activeUsers = users.filter(user => (user.subscription_status === 'active' || user.subscription_status === 'trial') &&
                user.onboarding_completed);
            for (const user of activeUsers) {
                try {
                    if (!this.shouldSendEmail(user, 'task_reminders')) {
                        console.log(`⏭️ Skipping task reminder email for ${user.email} (preference disabled)`);
                        continue;
                    }
                    const progressData = await this.getUserProgressData(user.id);
                    if (progressData &&
                        progressData.daysSinceLastActivity &&
                        progressData.daysSinceLastActivity >= 3 &&
                        progressData.completedTasks < progressData.totalTasks) {
                        await notificationService_1.NotificationService.sendTaskReminderNotification(user, `${progressData.trackName} tasks`);
                        console.log(`✅ Task reminder sent to ${user.email} (${progressData.daysSinceLastActivity} days inactive)`);
                    }
                }
                catch (error) {
                    console.error(`❌ Error sending task reminder to ${user.email}:`, error);
                }
            }
            console.log('✅ Task reminder notifications completed');
        }
        catch (error) {
            console.error('❌ Error in sendTaskReminders:', error);
        }
    }
    static async runAllNotifications() {
        console.log('🚀 Running all automated notifications...');
        try {
            await Promise.all([
                this.sendWeeklyProgressReports(),
                this.sendTrialEndingNotifications(),
                this.sendTaskReminders()
            ]);
            console.log('✅ All automated notifications completed');
        }
        catch (error) {
            console.error('❌ Error running automated notifications:', error);
        }
    }
    static async scheduleNotifications() {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const hour = now.getHours();
        console.log(`📅 Scheduling notifications - Day: ${dayOfWeek}, Hour: ${hour}`);
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