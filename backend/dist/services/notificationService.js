"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const emailService_1 = require("./emailService");
const logger_1 = require("../utils/logger");
class NotificationService {
    static async sendWelcomeNotification(user) {
        try {
            await emailService_1.EmailService.sendNotificationEmail({
                name: user.name,
                email: user.email,
                type: 'welcome'
            });
            logger_1.logger.info('Welcome email sent', { email: user.email });
        }
        catch (error) {
            logger_1.logger.error('Error sending welcome email', error, { email: user.email });
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
            logger_1.logger.info('Onboarding complete email sent', { email: user.email });
        }
        catch (error) {
            logger_1.logger.error('Error sending onboarding complete email', error, { email: user.email });
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
            logger_1.logger.info('Trial ending email sent', { email: user.email, daysLeft });
        }
        catch (error) {
            logger_1.logger.error('Error sending trial ending email', error, { email: user.email, daysLeft });
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
            logger_1.logger.info('Subscription active email sent', { email: user.email, plan });
        }
        catch (error) {
            logger_1.logger.error('Error sending subscription active email', error, { email: user.email, plan });
        }
    }
    static async sendSubscriptionCancelledNotification(user) {
        try {
            await emailService_1.EmailService.sendNotificationEmail({
                name: user.name,
                email: user.email,
                type: 'subscription_cancelled'
            });
            logger_1.logger.info('Subscription cancelled email sent', { email: user.email });
        }
        catch (error) {
            logger_1.logger.error('Error sending subscription cancelled email', error, { email: user.email });
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
            logger_1.logger.info('Weekly progress email sent', { email: user.email });
        }
        catch (error) {
            logger_1.logger.error('Error sending weekly progress email', error, { email: user.email });
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
            logger_1.logger.info('Task reminder email sent', { email: user.email, taskName });
        }
        catch (error) {
            logger_1.logger.error('Error sending task reminder email', error, { email: user.email, taskName });
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
        logger_1.logger.debug('Task reminder check would run here');
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notificationService.js.map