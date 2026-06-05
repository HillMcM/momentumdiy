import { Router, Request, Response } from 'express';
import { AssetService } from '../services/assetService';
import { validate } from '../middleware/validate';
import { routeRateLimit } from '../middleware/rate';
import { authenticate } from '../middleware/auth';
import { CreateAssetRequest, UpdateAssetRequest } from '../types';

const router = Router();

/**
 * GET /api/assets
 * Get all assets with optional filtering
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;
    
    const result = await AssetService.getAssets(
      category as string,
      search as string
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (_error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/assets/shared/:accessCode
 * Public endpoint to retrieve assets shared via an access code
 */
router.get('/shared/:accessCode', routeRateLimit(60), async (req: Request, res: Response) => {
  try {
    const { accessCode } = req.params;
    if (!accessCode) {
      return res.status(400).json({
        success: false,
        error: 'Access code is required'
      });
    }

    const result = await AssetService.getSharedAssets(accessCode);
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (_error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/assets/share
 * Get all share links created by the current user
 */
router.get('/share', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const result = await AssetService.getShareLinks(user.id);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (_error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/assets/share
 * Create a new share link
 */
router.post('/share', authenticate, routeRateLimit(60), validate((req) => {
  const body = req.body || {};
  if (!body.name) return 'Share link name is required';
  return undefined;
}), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const result = await AssetService.createShareLink(user.id, req.body);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(201).json(result);
  } catch (_error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * PATCH /api/assets/share/:linkId
 * Update an existing share link
 */
router.patch('/share/:linkId', authenticate, routeRateLimit(60), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { linkId } = req.params;
    if (!linkId) {
      return res.status(400).json({
        success: false,
        error: 'Share link ID is required'
      });
    }

    const result = await AssetService.updateShareLink(user.id, linkId, req.body);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (_error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * DELETE /api/assets/share/:linkId
 * Delete/revoke an existing share link
 */
router.delete('/share/:linkId', authenticate, routeRateLimit(60), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { linkId } = req.params;
    if (!linkId) {
      return res.status(400).json({
        success: false,
        error: 'Share link ID is required'
      });
    }

    const result = await AssetService.deleteShareLink(user.id, linkId);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (_error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/assets/:id
 * Get a single asset by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Asset ID is required'
      });
    }
    
    const result = await AssetService.getAssetById(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.json(result);
  } catch (_error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/assets
 * Create a new asset
 */
router.post('/', routeRateLimit(60), validate((req) => {
  const body = req.body || {};
  if (!body.name) return 'Name is required';
  if (!body.category) return 'Category is required';
  return undefined;
}), async (req: Request, res: Response) => {
  try {
    const assetData: CreateAssetRequest = req.body;
    
    // Validate required fields
    if (!assetData.name) {
      return res.status(400).json({
        success: false,
        error: 'Name is required'
      });
    }

    if (!assetData.category) {
      return res.status(400).json({
        success: false,
        error: 'Category is required'
      });
    }

    const result = await AssetService.createAsset(assetData);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (_error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * PUT /api/assets/:id
 * Update an existing asset
 */
router.put('/:id', routeRateLimit(60), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Asset ID is required'
      });
    }
    
    const updates: UpdateAssetRequest = { ...req.body, id };
    
    const result = await AssetService.updateAsset(id, updates);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.json(result);
  } catch (_error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * DELETE /api/assets/:id
 * Delete an asset
 */
router.delete('/:id', routeRateLimit(60), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Asset ID is required'
      });
    }
    
    const result = await AssetService.deleteAsset(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.json(result);
  } catch (_error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/assets/category/:category
 * Get assets by category
 */
router.get('/category/:category', async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    
    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Category is required'
      });
    }
    
    const result = await AssetService.getAssetsByCategory(category);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (_error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router; 