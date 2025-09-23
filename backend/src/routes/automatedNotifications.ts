import { Router, Request, Response } from 'express';
import { AutomatedNotificationsService } from '../services/automatedNotificationsService';
import { routeRateLimit } from '../middleware/rate';

const router = Router();

/**
 * POST /api/notifications/automated/run-all
 * Manually trigger all automated notifications
 */
router.post('/run-all', routeRateLimit(5), async (_req: Request, res: Response) => {
  try {
    console.log('🚀 Manual trigger of all automated notifications');
    
    await AutomatedNotificationsService.runAllNotifications();
    
    return res.json({
      success: true,
      message: 'All automated notifications have been processed'
    });
  } catch (error) {
    console.error('❌ Error running automated notifications:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to run automated notifications'
    });
  }
});

/**
 * POST /api/notifications/automated/weekly-progress
 * Manually trigger weekly progress reports
 */
router.post('/weekly-progress', routeRateLimit(10), async (_req: Request, res: Response) => {
  try {
    console.log('📊 Manual trigger of weekly progress reports');
    
    await AutomatedNotificationsService.sendWeeklyProgressReports();
    
    return res.json({
      success: true,
      message: 'Weekly progress reports have been sent'
    });
  } catch (error) {
    console.error('❌ Error sending weekly progress reports:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to send weekly progress reports'
    });
  }
});

/**
 * POST /api/notifications/automated/trial-ending
 * Manually trigger trial ending notifications
 */
router.post('/trial-ending', routeRateLimit(10), async (_req: Request, res: Response) => {
  try {
    console.log('⏰ Manual trigger of trial ending notifications');
    
    await AutomatedNotificationsService.sendTrialEndingNotifications();
    
    return res.json({
      success: true,
      message: 'Trial ending notifications have been sent'
    });
  } catch (error) {
    console.error('❌ Error sending trial ending notifications:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to send trial ending notifications'
    });
  }
});

/**
 * POST /api/notifications/automated/task-reminders
 * Manually trigger task reminder notifications
 */
router.post('/task-reminders', routeRateLimit(10), async (_req: Request, res: Response) => {
  try {
    console.log('📋 Manual trigger of task reminder notifications');
    
    await AutomatedNotificationsService.sendTaskReminders();
    
    return res.json({
      success: true,
      message: 'Task reminder notifications have been sent'
    });
  } catch (error) {
    console.error('❌ Error sending task reminder notifications:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to send task reminder notifications'
    });
  }
});

/**
 * POST /api/notifications/automated/schedule
 * Check and run scheduled notifications based on current time
 */
router.post('/schedule', routeRateLimit(5), async (_req: Request, res: Response) => {
  try {
    console.log('📅 Checking scheduled notifications');
    
    await AutomatedNotificationsService.scheduleNotifications();
    
    return res.json({
      success: true,
      message: 'Scheduled notifications have been checked and processed'
    });
  } catch (error) {
    console.error('❌ Error running scheduled notifications:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to run scheduled notifications'
    });
  }
});

export default router;
