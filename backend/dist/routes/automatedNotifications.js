"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const automatedNotificationsService_1 = require("../services/automatedNotificationsService");
const rate_1 = require("../middleware/rate");
const router = (0, express_1.Router)();
router.post('/run-all', (0, rate_1.routeRateLimit)(5), async (_req, res) => {
    try {
        console.log('🚀 Manual trigger of all automated notifications');
        await automatedNotificationsService_1.AutomatedNotificationsService.runAllNotifications();
        return res.json({
            success: true,
            message: 'All automated notifications have been processed'
        });
    }
    catch (error) {
        console.error('❌ Error running automated notifications:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to run automated notifications'
        });
    }
});
router.post('/weekly-progress', (0, rate_1.routeRateLimit)(10), async (_req, res) => {
    try {
        console.log('📊 Manual trigger of weekly progress reports');
        await automatedNotificationsService_1.AutomatedNotificationsService.sendWeeklyProgressReports();
        return res.json({
            success: true,
            message: 'Weekly progress reports have been sent'
        });
    }
    catch (error) {
        console.error('❌ Error sending weekly progress reports:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to send weekly progress reports'
        });
    }
});
router.post('/trial-ending', (0, rate_1.routeRateLimit)(10), async (_req, res) => {
    try {
        console.log('⏰ Manual trigger of trial ending notifications');
        await automatedNotificationsService_1.AutomatedNotificationsService.sendTrialEndingNotifications();
        return res.json({
            success: true,
            message: 'Trial ending notifications have been sent'
        });
    }
    catch (error) {
        console.error('❌ Error sending trial ending notifications:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to send trial ending notifications'
        });
    }
});
router.post('/task-reminders', (0, rate_1.routeRateLimit)(10), async (_req, res) => {
    try {
        console.log('📋 Manual trigger of task reminder notifications');
        await automatedNotificationsService_1.AutomatedNotificationsService.sendTaskReminders();
        return res.json({
            success: true,
            message: 'Task reminder notifications have been sent'
        });
    }
    catch (error) {
        console.error('❌ Error sending task reminder notifications:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to send task reminder notifications'
        });
    }
});
router.post('/schedule', (0, rate_1.routeRateLimit)(5), async (_req, res) => {
    try {
        console.log('📅 Checking scheduled notifications');
        await automatedNotificationsService_1.AutomatedNotificationsService.scheduleNotifications();
        return res.json({
            success: true,
            message: 'Scheduled notifications have been checked and processed'
        });
    }
    catch (error) {
        console.error('❌ Error running scheduled notifications:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to run scheduled notifications'
        });
    }
});
exports.default = router;
//# sourceMappingURL=automatedNotifications.js.map