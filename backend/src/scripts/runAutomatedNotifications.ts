#!/usr/bin/env tsx

/**
 * Script to run automated notifications
 * This can be called by a cron job or scheduled task
 * 
 * Usage:
 * - Run all notifications: npm run automated-notifications
 * - Run weekly progress: npm run automated-notifications -- weekly-progress
 * - Run trial ending: npm run automated-notifications -- trial-ending
 * - Run task reminders: npm run automated-notifications -- task-reminders
 * - Run scheduled: npm run automated-notifications -- schedule
 */

import { AutomatedNotificationsService } from '../services/automatedNotificationsService';
import { logger } from '../utils/logger';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'all';

  logger.info(`Running automated notifications: ${command}`, { currentTime: new Date().toISOString() });

  try {
    switch (command) {
      case 'weekly-progress':
        await AutomatedNotificationsService.sendWeeklyProgressReports();
        logger.info('Weekly progress reports completed');
        break;

      case 'trial-ending':
        await AutomatedNotificationsService.sendTrialEndingNotifications();
        logger.info('Trial ending notifications completed');
        break;

      case 'task-reminders':
        await AutomatedNotificationsService.sendTaskReminders();
        logger.info('Task reminders completed');
        break;

      case 'schedule':
        await AutomatedNotificationsService.scheduleNotifications();
        logger.info('Scheduled notifications completed');
        break;

      case 'all':
      default:
        await AutomatedNotificationsService.runAllNotifications();
        logger.info('All automated notifications completed');
        break;
    }

    logger.info('Automated notifications script completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error running automated notifications', error);
    process.exit(1);
  }
}

// Run the script
main();
