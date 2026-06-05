#!/usr/bin/env tsx
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const automatedNotificationsService_1 = require("../services/automatedNotificationsService");
const logger_1 = require("../utils/logger");
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'all';
    logger_1.logger.info(`Running automated notifications: ${command}`, { currentTime: new Date().toISOString() });
    try {
        switch (command) {
            case 'weekly-progress':
                await automatedNotificationsService_1.AutomatedNotificationsService.sendWeeklyProgressReports();
                logger_1.logger.info('Weekly progress reports completed');
                break;
            case 'trial-ending':
                await automatedNotificationsService_1.AutomatedNotificationsService.sendTrialEndingNotifications();
                logger_1.logger.info('Trial ending notifications completed');
                break;
            case 'task-reminders':
                await automatedNotificationsService_1.AutomatedNotificationsService.sendTaskReminders();
                logger_1.logger.info('Task reminders completed');
                break;
            case 'schedule':
                await automatedNotificationsService_1.AutomatedNotificationsService.scheduleNotifications();
                logger_1.logger.info('Scheduled notifications completed');
                break;
            case 'all':
            default:
                await automatedNotificationsService_1.AutomatedNotificationsService.runAllNotifications();
                logger_1.logger.info('All automated notifications completed');
                break;
        }
        logger_1.logger.info('Automated notifications script completed successfully');
        process.exit(0);
    }
    catch (error) {
        logger_1.logger.error('Error running automated notifications', error);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=runAutomatedNotifications.js.map