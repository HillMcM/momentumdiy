#!/usr/bin/env tsx
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const automatedNotificationsService_1 = require("../services/automatedNotificationsService");
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'all';
    console.log(`🚀 Running automated notifications: ${command}`);
    console.log(`📅 Current time: ${new Date().toISOString()}`);
    try {
        switch (command) {
            case 'weekly-progress':
                await automatedNotificationsService_1.AutomatedNotificationsService.sendWeeklyProgressReports();
                console.log('✅ Weekly progress reports completed');
                break;
            case 'trial-ending':
                await automatedNotificationsService_1.AutomatedNotificationsService.sendTrialEndingNotifications();
                console.log('✅ Trial ending notifications completed');
                break;
            case 'task-reminders':
                await automatedNotificationsService_1.AutomatedNotificationsService.sendTaskReminders();
                console.log('✅ Task reminders completed');
                break;
            case 'schedule':
                await automatedNotificationsService_1.AutomatedNotificationsService.scheduleNotifications();
                console.log('✅ Scheduled notifications completed');
                break;
            case 'all':
            default:
                await automatedNotificationsService_1.AutomatedNotificationsService.runAllNotifications();
                console.log('✅ All automated notifications completed');
                break;
        }
        console.log('🎉 Automated notifications script completed successfully');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error running automated notifications:', error);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=runAutomatedNotifications.js.map