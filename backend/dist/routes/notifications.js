"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rate_1 = require("../middleware/rate");
const notificationService_1 = require("../services/notificationService");
const supabase_1 = require("../config/supabase");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
router.post('/send', (0, rate_1.routeRateLimit)(10), async (req, res) => {
    try {
        const { type, data } = req.body;
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        const token = authHeader.substring(7);
        const { data: { user }, error: authError } = await supabase_1.supabase.auth.getUser(token);
        if (authError || !user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid authentication token'
            });
        }
        const { data: profile, error: profileError } = await supabase_1.supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        if (profileError || !profile) {
            return res.status(404).json({
                success: false,
                error: 'User profile not found'
            });
        }
        const userEmail = user.email || profile.email;
        const userName = profile.business_name || profile.full_name || user.email?.split('@')[0] || 'User';
        if (!userEmail) {
            return res.status(400).json({
                success: false,
                error: 'User email is required'
            });
        }
        const userProfile = {
            id: user.id,
            email: userEmail,
            name: userName,
            subscription_status: profile.subscription_status || 'trial',
            trial_end_date: profile.trial_end_date,
            onboarding_completed: profile.onboarding_completed || false,
            selected_track: profile.selected_track,
            last_activity: profile.updated_at
        };
        switch (type) {
            case 'welcome':
                await notificationService_1.NotificationService.sendWelcomeNotification(userProfile);
                break;
            case 'onboarding_complete':
                await notificationService_1.NotificationService.sendOnboardingCompleteNotification(userProfile, data);
                break;
            case 'trial_ending':
                await notificationService_1.NotificationService.sendTrialEndingNotification(userProfile, data?.daysLeft || 3);
                break;
            case 'subscription_active':
                await notificationService_1.NotificationService.sendSubscriptionActiveNotification(userProfile, data?.plan || 'monthly');
                break;
            case 'subscription_cancelled':
                await notificationService_1.NotificationService.sendSubscriptionCancelledNotification(userProfile);
                break;
            case 'weekly_progress':
                await notificationService_1.NotificationService.sendWeeklyProgressNotification(userProfile, data);
                break;
            case 'task_reminder':
                await notificationService_1.NotificationService.sendTaskReminderNotification(userProfile, data?.taskName || 'your marketing task');
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: `Unknown notification type: ${type}`
                });
        }
        return res.json({
            success: true,
            message: `${type} notification sent successfully`
        });
    }
    catch (error) {
        logger_1.logger.error('Error sending notification', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.post('/test', (0, rate_1.routeRateLimit)(5), async (req, res) => {
    try {
        const { type = 'welcome', email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required for test notifications'
            });
        }
        const testUserProfile = {
            id: 'test-user',
            email: email,
            name: 'Test User',
            subscription_status: 'trial',
            trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            onboarding_completed: true,
            selected_track: 'local-foot-traffic',
            last_activity: new Date().toISOString()
        };
        switch (type) {
            case 'welcome':
                await notificationService_1.NotificationService.sendWelcomeNotification(testUserProfile);
                break;
            case 'onboarding_complete':
                await notificationService_1.NotificationService.sendOnboardingCompleteNotification(testUserProfile, {
                    selectedTrack: 'local-foot-traffic'
                });
                break;
            case 'trial_ending':
                await notificationService_1.NotificationService.sendTrialEndingNotification(testUserProfile, 3);
                break;
            case 'subscription_active':
                await notificationService_1.NotificationService.sendSubscriptionActiveNotification(testUserProfile, 'monthly');
                break;
            case 'weekly_progress':
                await notificationService_1.NotificationService.sendWeeklyProgressNotification(testUserProfile, {
                    completedTasks: 8,
                    totalTasks: 12,
                    weekNumber: 3,
                    trackName: 'Increase Local Foot Traffic'
                });
                break;
            case 'task_reminder':
                await notificationService_1.NotificationService.sendTaskReminderNotification(testUserProfile, 'Create social media content');
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: `Unknown notification type: ${type}`
                });
        }
        return res.json({
            success: true,
            message: `Test ${type} notification sent to ${email}`
        });
    }
    catch (error) {
        logger_1.logger.error('Error sending test notification', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=notifications.js.map