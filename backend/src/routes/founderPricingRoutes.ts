import { Router, Request, Response } from 'express';
import { FounderPricingService } from '../services/founderPricingService';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/founder/availability
 * Check how many founder spots are available (public)
 */
router.get('/availability', async (req: Request, res: Response) => {
  try {
    const status = await FounderPricingService.getFounderAvailability();
    return res.json({ success: true, data: status });
  } catch (error) {
    logger.error('Error getting founder availability', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to check founder availability' 
    });
  }
});

/**
 * GET /api/founder/status
 * Check if current user is a founder (authenticated)
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const status = await FounderPricingService.getUserFounderStatus(user.id);
    return res.json({ success: true, data: status });
  } catch (error) {
    logger.error('Error getting user founder status', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to get founder status' 
    });
  }
});

/**
 * POST /api/founder/claim
 * Claim a founder spot (authenticated)
 */
router.post('/claim', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const result = await FounderPricingService.claimFounderStatus(user.id);
    
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.message });
    }

    return res.json({ 
      success: true, 
      data: {
        founderNumber: result.founderNumber,
        message: result.message
      }
    });
  } catch (error) {
    logger.error('Error claiming founder status', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to claim founder status' 
    });
  }
});

export default router;

