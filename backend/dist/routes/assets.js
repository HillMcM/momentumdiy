"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assetService_1 = require("../services/assetService");
const validate_1 = require("../middleware/validate");
const rate_1 = require("../middleware/rate");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const { category, search } = req.query;
        const result = await assetService_1.AssetService.getAssets(category, search);
        if (!result.success) {
            return res.status(400).json(result);
        }
        return res.json(result);
    }
    catch (_error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                error: 'Asset ID is required'
            });
        }
        const result = await assetService_1.AssetService.getAssetById(id);
        if (!result.success) {
            return res.status(404).json(result);
        }
        return res.json(result);
    }
    catch (_error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.post('/', (0, rate_1.routeRateLimit)(60), (0, validate_1.validate)((req) => {
    const body = req.body || {};
    if (!body.name)
        return 'Name is required';
    if (!body.category)
        return 'Category is required';
    return undefined;
}), async (req, res) => {
    try {
        const assetData = req.body;
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
        const result = await assetService_1.AssetService.createAsset(assetData);
        if (!result.success) {
            return res.status(400).json(result);
        }
        return res.status(201).json(result);
    }
    catch (_error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.put('/:id', (0, rate_1.routeRateLimit)(60), async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                error: 'Asset ID is required'
            });
        }
        const updates = { ...req.body, id };
        const result = await assetService_1.AssetService.updateAsset(id, updates);
        if (!result.success) {
            return res.status(404).json(result);
        }
        return res.json(result);
    }
    catch (_error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.delete('/:id', (0, rate_1.routeRateLimit)(60), async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                error: 'Asset ID is required'
            });
        }
        const result = await assetService_1.AssetService.deleteAsset(id);
        if (!result.success) {
            return res.status(404).json(result);
        }
        return res.json(result);
    }
    catch (_error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        if (!category) {
            return res.status(400).json({
                success: false,
                error: 'Category is required'
            });
        }
        const result = await assetService_1.AssetService.getAssetsByCategory(category);
        if (!result.success) {
            return res.status(400).json(result);
        }
        return res.json(result);
    }
    catch (_error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=assets.js.map