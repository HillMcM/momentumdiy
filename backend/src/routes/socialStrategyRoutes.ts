import { Router, Request, Response } from 'express';
import { SocialStrategyService } from '../services/socialStrategyService';
import { supabase } from '../config/supabase';

const router = Router();

/**
 * GET /api/social-strategy/has-access
 * Check if user has ever activated a social media track (for UI visibility)
 */
router.get('/has-access', async (req: Request, res: Response) => {
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
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token'
      });
    }

    const result = await SocialStrategyService.hasEverActivatedSocialTrack(user.id);
    
    return res.json(result);
  } catch (error) {
    console.error('Error checking social strategy access:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/social-strategy
 * Get current user's social media strategy
 */
router.get('/', async (req: Request, res: Response) => {
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
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token'
      });
    }

    const result = await SocialStrategyService.getSocialStrategy(user.id);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error('Error fetching social strategy:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * PUT /api/social-strategy
 * Update current user's social media strategy
 */
router.put('/', async (req: Request, res: Response) => {
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
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token'
      });
    }

    const updates = req.body;
    
    const result = await SocialStrategyService.updateSocialStrategy(user.id, updates);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error('Error updating social strategy:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/social-strategy/share
 * Create a share link for current user's strategy
 */
router.post('/share', async (req: Request, res: Response) => {
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
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token'
      });
    }

    const options = req.body;
    
    const result = await SocialStrategyService.createShareLink(user.id, options);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error('Error creating share link:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/social-strategy/share
 * Get all share links for current user's strategy
 */
router.get('/share', async (req: Request, res: Response) => {
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
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token'
      });
    }

    const result = await SocialStrategyService.getShareLinks(user.id);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error('Error fetching share links:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/social-strategy/shared/:accessCode
 * Get shared strategy by access code (public, no auth required)
 */
router.get('/shared/:accessCode', async (req: Request, res: Response) => {
  try {
    const { accessCode } = req.params;
    
    if (!accessCode) {
      return res.status(400).json({
        success: false,
        error: 'Access code is required'
      });
    }
    
    const result = await SocialStrategyService.getSharedStrategy(accessCode);
    
    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error('Error fetching shared strategy:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * DELETE /api/social-strategy/share/:linkId
 * Delete (revoke) a share link
 */
router.delete('/share/:linkId', async (req: Request, res: Response) => {
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
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token'
      });
    }

    const { linkId } = req.params;
    
    if (!linkId) {
      return res.status(400).json({
        success: false,
        error: 'Link ID is required'
      });
    }
    
    const result = await SocialStrategyService.deleteShareLink(user.id, linkId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error('Error deleting share link:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * PATCH /api/social-strategy/share/:linkId
 * Toggle share link active status
 */
router.patch('/share/:linkId', async (req: Request, res: Response) => {
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
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token'
      });
    }

    const { linkId } = req.params;
    const { is_active } = req.body;
    
    if (!linkId) {
      return res.status(400).json({
        success: false,
        error: 'Link ID is required'
      });
    }
    
    const result = await SocialStrategyService.toggleShareLink(user.id, linkId, is_active);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error('Error toggling share link:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;

