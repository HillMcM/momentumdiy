import { Router, Request, Response } from 'express';
import { AssetService } from '../services/assetService';
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
  } catch (error) {
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
  } catch (error) {
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
router.post('/', async (req: Request, res: Response) => {
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
  } catch (error) {
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
router.put('/:id', async (req: Request, res: Response) => {
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
  } catch (error) {
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
router.delete('/:id', async (req: Request, res: Response) => {
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
  } catch (error) {
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
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router; 