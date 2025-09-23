import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { routeRateLimit } from '../middleware/rate';
import { validate } from '../middleware/validate';
import { EmailPreferences } from '../types';

const router = Router();

/**
 * GET /api/email-preferences
 * Get user's email preferences
 */
router.get('/', routeRateLimit(30), async (req: Request, res: Response) => {
  try {
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

    // Get user's email preferences
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email_preferences')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching email preferences:', profileError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch email preferences'
      });
    }

    // Default preferences if none exist
    const defaultPreferences: EmailPreferences = {
      weekly_progress: true,
      task_reminders: true,
      marketing_emails: true,
      trial_emails: true
    };

    const emailPreferences = profile?.email_preferences || defaultPreferences;

    return res.json({
      success: true,
      data: emailPreferences
    });

  } catch (error) {
    console.error('Error getting email preferences:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * PUT /api/email-preferences
 * Update user's email preferences
 */
router.put('/', routeRateLimit(20), validate((req) => {
  const body = req.body || {};
  
  // Validate email preferences structure
  if (typeof body !== 'object') {
    return 'Email preferences must be an object';
  }

  const validKeys = ['weekly_progress', 'task_reminders', 'marketing_emails', 'trial_emails'];
  const receivedKeys = Object.keys(body);
  
  // Check if all received keys are valid
  for (const key of receivedKeys) {
    if (!validKeys.includes(key)) {
      return `Invalid email preference key: ${key}`;
    }
    if (typeof body[key] !== 'boolean') {
      return `Email preference ${key} must be a boolean`;
    }
  }

  // Ensure trial_emails is always true
  if (body.trial_emails === false) {
    return 'Trial emails cannot be disabled';
  }

  return undefined;
}), async (req: Request, res: Response) => {
  try {
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

    const preferences: Partial<EmailPreferences> = req.body;

    // Force trial_emails to be true (cannot be disabled)
    const updatedPreferences = {
      ...preferences,
      trial_emails: true
    };

    // Update user's email preferences
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ email_preferences: updatedPreferences })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating email preferences:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to update email preferences'
      });
    }

    return res.json({
      success: true,
      data: updatedPreferences,
      message: 'Email preferences updated successfully'
    });

  } catch (error) {
    console.error('Error updating email preferences:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/email-preferences/reset
 * Reset email preferences to defaults
 */
router.post('/reset', routeRateLimit(10), async (req: Request, res: Response) => {
  try {
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

    // Reset to default preferences
    const defaultPreferences: EmailPreferences = {
      weekly_progress: true,
      task_reminders: true,
      marketing_emails: true,
      trial_emails: true
    };

    // Update user's email preferences
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ email_preferences: defaultPreferences })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error resetting email preferences:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to reset email preferences'
      });
    }

    return res.json({
      success: true,
      data: defaultPreferences,
      message: 'Email preferences reset to defaults'
    });

  } catch (error) {
    console.error('Error resetting email preferences:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
