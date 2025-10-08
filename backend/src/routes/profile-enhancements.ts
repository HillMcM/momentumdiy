/**
 * Profile Enhancement Routes
 * API endpoints for enhanced profile features including AI capabilities
 */

import { Router, Request, Response } from 'express';
import { routeRateLimit } from '../middleware/rate';
import { AIBrandingService } from '../services/aiBrandingService';
import { MomentumService } from '../services/momentumService';
import { supabase } from '../config/supabase';
import { MarketingService } from '../services/marketingService';

const router = Router();

/**
 * POST /api/profile/upload-logo
 * Upload brand logo (Base64)
 */
router.post('/upload-logo', routeRateLimit(10), async (req: Request, res: Response) => {
  try {
    const { userId, logoBase64 } = req.body;

    if (!userId || !logoBase64) {
      return res.status(400).json({
        success: false,
        error: 'userId and logoBase64 are required'
      });
    }

    // Validate Base64 format
    if (!logoBase64.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image format. Must be Base64 encoded image.'
      });
    }

    // Update profile with logo
    const { error } = await supabase
      .from('profiles')
      .update({ brand_logo: logoBase64 })
      .eq('id', userId);

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    return res.json({
      success: true,
      message: 'Logo uploaded successfully'
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/profile/ai-color-suggestions
 * Get AI-suggested complementary colors
 */
router.post('/ai-color-suggestions', routeRateLimit(10), async (req: Request, res: Response) => {
  try {
    const { primaryColor, logoBase64 } = req.body;

    if (!primaryColor) {
      return res.status(400).json({
        success: false,
        error: 'primaryColor is required'
      });
    }

    const suggestions = await AIBrandingService.suggestColors(primaryColor, logoBase64);

    return res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('AI color suggestion error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate color suggestions'
    });
  }
});

/**
 * POST /api/profile/business-insights
 * Get AI-generated business insights
 */
router.post('/business-insights', routeRateLimit(10), async (req: Request, res: Response) => {
  try {
    const { skillLevels, businessCategory, location, competitors } = req.body;

    const insights = await AIBrandingService.generateBusinessInsights({
      skillLevels: skillLevels || {},
      businessCategory: businessCategory || 'General',
      location: location || 'Unknown',
      competitors: competitors || []
    });

    return res.json({
      success: true,
      insights
    });
  } catch (error) {
    console.error('Business insights error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate business insights'
    });
  }
});

/**
 * GET /api/profile/momentum-score/:userId
 * Calculate and return momentum score
 */
router.get('/momentum-score/:userId', routeRateLimit(30), async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    const result = await MomentumService.calculateMomentumScore(userId);

    if (!result.success) {
      return res.status(500).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error('Momentum score error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to calculate momentum score'
    });
  }
});

/**
 * POST /api/profile/weekly-note
 * Save a weekly reflection note
 */
router.post('/weekly-note', routeRateLimit(20), async (req: Request, res: Response) => {
  try {
    const { userId, week, note } = req.body;

    if (!userId || !week || !note) {
      return res.status(400).json({
        success: false,
        error: 'userId, week, and note are required'
      });
    }

    const result = await MomentumService.saveWeeklyNote(userId, { week, note });

    if (!result.success) {
      return res.status(500).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error('Weekly note save error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to save weekly note'
    });
  }
});

/**
 * GET /api/profile/weekly-notes/:userId
 * Get all weekly notes for a user
 */
router.get('/weekly-notes/:userId', routeRateLimit(30), async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    const result = await MomentumService.getWeeklyNotes(userId);

    if (!result.success) {
      return res.status(500).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error('Get weekly notes error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch weekly notes'
    });
  }
});

/**
 * POST /api/profile/track-recommendations
 * Get AI recommendation for next track
 */
router.post('/track-recommendations', routeRateLimit(10), async (req: Request, res: Response) => {
  try {
    const { completedTrack, businessGoals, skillLevels } = req.body;

    if (!completedTrack) {
      return res.status(400).json({
        success: false,
        error: 'completedTrack is required'
      });
    }

    // Get available tracks
    const tracksResponse = await MarketingService.getMarketingGoals();
    
    if (!tracksResponse.success || !tracksResponse.data) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch available tracks'
      });
    }

    const availableTracks = tracksResponse.data
      .filter(track => track.id !== completedTrack.id)
      .map(track => ({
        id: track.id,
        title: track.title,
        description: track.description
      }));

    const recommendation = await AIBrandingService.recommendNextTrack({
      completedTrack,
      businessGoals: businessGoals || 'General business growth',
      skillLevels: skillLevels || {},
      availableTracks
    });

    return res.json({
      success: true,
      recommendation
    });
  } catch (error) {
    console.error('Track recommendation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate track recommendation'
    });
  }
});

/**
 * GET /api/profile/progress-data/:userId
 * Get comprehensive progress data
 */
router.get('/progress-data/:userId', routeRateLimit(30), async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    const result = await MomentumService.getProgressData(userId);

    if (!result.success) {
      return res.status(500).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error('Progress data error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch progress data'
    });
  }
});

export default router;

