"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const emailService_1 = require("./emailService");
class NotificationService {
    static async sendWelcomeNotification(user) {
        try {
            await emailService_1.EmailService.sendNotificationEmail({
                name: user.name,
                email: user.email,
                type: 'welcome'
            });
            console.log(`📧 Welcome email sent to ${user.email}`);
        }
        catch (error) {
            console.error('❌ Error sending welcome email:', error);
        }
    }
    static async sendOnboardingCompleteNotification(user, onboardingData) {
        try {
            await emailService_1.EmailService.sendNotificationEmail({
                name: user.name,
                email: user.email,
                type: 'onboarding_complete',
                data: onboardingData
            });
            console.log(`📧 Onboarding complete email sent to ${user.email}`);
        }
        catch (error) {
            console.error('❌ Error sending onboarding complete email:', error);
        }
    }
    static async sendTrialEndingNotification(user, daysLeft) {
        try {
            await emailService_1.EmailService.sendNotificationEmail({
                name: user.name,
                email: user.email,
                type: 'trial_ending',
                data: { daysLeft }
            });
            console.log(`📧 Trial ending email sent to ${user.email} (${daysLeft} days left)`);
        }
        catch (error) {
            console.error('❌ Error sending trial ending email:', error);
        }
    }
    static async sendSubscriptionActiveNotification(user, plan) {
        try {
            await emailService_1.EmailService.sendNotificationEmail({
                name: user.name,
                email: user.email,
                type: 'subscription_active',
                data: { plan }
            });
            console.log(`📧 Subscription active email sent to ${user.email}`);
        }
        catch (error) {
            console.error('❌ Error sending subscription active email:', error);
        }
    }
    static async sendSubscriptionCancelledNotification(user) {
        try {
            await emailService_1.EmailService.sendNotificationEmail({
                name: user.name,
                email: user.email,
                type: 'subscription_cancelled'
            });
            console.log(`📧 Subscription cancelled email sent to ${user.email}`);
        }
        catch (error) {
            console.error('❌ Error sending subscription cancelled email:', error);
        }
    }
    static async sendWeeklyProgressNotification(user, progressData) {
        try {
            await emailService_1.EmailService.sendNotificationEmail({
                name: user.name,
                email: user.email,
                type: 'weekly_progress',
                data: progressData
            });
            console.log(`📧 Weekly progress email sent to ${user.email}`);
        }
        catch (error) {
            console.error('❌ Error sending weekly progress email:', error);
        }
    }
    static async sendTaskReminderNotification(user, taskName) {
        try {
            await emailService_1.EmailService.sendNotificationEmail({
                name: user.name,
                email: user.email,
                type: 'task_reminder',
                data: { taskName }
            });
            console.log(`📧 Task reminder email sent to ${user.email}`);
        }
        catch (error) {
            console.error('❌ Error sending task reminder email:', error);
        }
    }
    static async checkTrialEndingNotifications(users) {
        const now = new Date();
        for (const user of users) {
            if (user.subscription_status === 'trial' && user.trial_end_date) {
                const trialEnd = new Date(user.trial_end_date);
                const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                if (daysLeft === 7 || daysLeft === 3 || daysLeft === 1) {
                    await this.sendTrialEndingNotification(user, daysLeft);
                }
            }
        }
    }
    static async sendWeeklyProgressReports(users) {
        const activeUsers = users.filter(user => user.subscription_status === 'active' ||
            (user.subscription_status === 'trial' && user.onboarding_completed));
        for (const user of activeUsers) {
            const progressData = {
                completedTasks: 5,
                totalTasks: 12,
                weekNumber: 3,
                trackName: user.selected_track || 'Marketing Track'
            };
            await this.sendWeeklyProgressNotification(user, progressData);
        }
    }
    static async sendTaskReminders(_users) {
        console.log('📧 Task reminder check would run here');
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notificationService.js.map