import { Router, Request, Response } from 'express';
import { routeRateLimit } from '../middleware/rate';
import { NotificationService } from '../services/notificationService';
import { supabase } from '../config/supabase';

const router = Router();

/**
 * POST /api/notifications/send
 * Send a notification email to the current user
 */
router.post('/send', routeRateLimit(10), async (req: Request, res: Response) => {
  try {
    const { type, data } = req.body;
    
    // Get user from auth header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const token = authHeader.substring(7);
    
    // Verify token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token'
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
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

    // Create user profile object
    const userProfile = {
      id: user.id,
      email: user.email || profile.email || 'unknown@example.com',
      name: profile.business_name || profile.full_name || user.email?.split('@')[0] || 'User',
      subscription_status: profile.subscription_status || 'trial',
      trial_end_date: profile.trial_end_date,
      onboarding_completed: profile.onboarding_completed || false,
      selected_track: profile.selected_track,
      last_activity: profile.updated_at
    };

    // Send appropriate notification based on type
    switch (type) {
      case 'welcome':
        await NotificationService.sendWelcomeNotification(userProfile);
        break;
        
      case 'onboarding_complete':
        await NotificationService.sendOnboardingCompleteNotification(userProfile, data);
        break;
        
      case 'trial_ending':
        await NotificationService.sendTrialEndingNotification(userProfile, data?.daysLeft || 3);
        break;
        
      case 'subscription_active':
        await NotificationService.sendSubscriptionActiveNotification(userProfile, data?.plan || 'monthly');
        break;
        
      case 'subscription_cancelled':
        await NotificationService.sendSubscriptionCancelledNotification(userProfile);
        break;
        
      case 'weekly_progress':
        await NotificationService.sendWeeklyProgressNotification(userProfile, data);
        break;
        
      case 'task_reminder':
        await NotificationService.sendTaskReminderNotification(userProfile, data?.taskName || 'your marketing task');
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

  } catch (error) {
    console.error('Error sending notification:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/notifications/test
 * Send a test notification email
 */
router.post('/test', routeRateLimit(5), async (req: Request, res: Response) => {
  try {
    const { type = 'welcome', email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required for test notifications'
      });
    }

    // Create test user profile
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

    // Send test notification
    switch (type) {
      case 'welcome':
        await NotificationService.sendWelcomeNotification(testUserProfile);
        break;
        
      case 'onboarding_complete':
        await NotificationService.sendOnboardingCompleteNotification(testUserProfile, {
          selectedTrack: 'local-foot-traffic'
        });
        break;
        
      case 'trial_ending':
        await NotificationService.sendTrialEndingNotification(testUserProfile, 3);
        break;
        
      case 'subscription_active':
        await NotificationService.sendSubscriptionActiveNotification(testUserProfile, 'monthly');
        break;
        
      case 'weekly_progress':
        await NotificationService.sendWeeklyProgressNotification(testUserProfile, {
          completedTasks: 8,
          totalTasks: 12,
          weekNumber: 3,
          trackName: 'Increase Local Foot Traffic'
        });
        break;
        
      case 'task_reminder':
        await NotificationService.sendTaskReminderNotification(testUserProfile, 'Create social media content');
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

  } catch (error) {
    console.error('Error sending test notification:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
