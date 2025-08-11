"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const marketingService_1 = require("../services/marketingService");
const notionSyncService_1 = require("../services/notionSyncService");
const client_1 = require("@notionhq/client");
const rate_1 = require("../middleware/rate");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
router.get('/goals', async (_req, res) => {
    try {
        const result = await marketingService_1.MarketingService.getMarketingGoals();
        if (!result.success) {
            return res.status(400).json(result);
        }
        return res.json(result);
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.get('/goals/active', async (_req, res) => {
    try {
        const result = await marketingService_1.MarketingService.getActiveMarketingGoal();
        if (!result.success) {
            return res.status(400).json(result);
        }
        return res.json(result);
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.get('/goals/:id', async (req, res) => {
    try {
        const id = req.params['id'];
        const result = await marketingService_1.MarketingService.getMarketingGoals();
        if (!result.success || !result.data) {
            return res.status(404).json({
                success: false,
                error: 'Marketing goal not found'
            });
        }
        const goal = result.data.find(g => g.id === id);
        if (!goal) {
            return res.status(404).json({
                success: false,
                error: 'Marketing goal not found'
            });
        }
        return res.json({
            success: true,
            data: goal
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.post('/goals', (0, rate_1.routeRateLimit)(10), (0, validate_1.validate)((req) => {
    const body = req.body || {};
    if (!body.title)
        return 'Title is required';
    if (!body.duration || body.duration < 1)
        return 'Duration must be at least 1 week';
    return undefined;
}), async (req, res) => {
    try {
        const goalData = req.body;
        if (!goalData.title) {
            return res.status(400).json({
                success: false,
                error: 'Title is required'
            });
        }
        if (!goalData.duration || goalData.duration < 1) {
            return res.status(400).json({
                success: false,
                error: 'Duration must be at least 1 week'
            });
        }
        const result = await marketingService_1.MarketingService.createMarketingGoal(goalData);
        if (!result.success) {
            return res.status(400).json(result);
        }
        return res.status(201).json(result);
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.put('/goals/:id', (0, rate_1.routeRateLimit)(10), async (req, res) => {
    try {
        const id = req.params['id'];
        const updates = { ...req.body, id };
        const result = await marketingService_1.MarketingService.updateMarketingGoal(id, updates);
        if (!result.success) {
            return res.status(404).json(result);
        }
        return res.json(result);
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.patch('/goals/:id/activate', async (req, res) => {
    try {
        const id = req.params['id'];
        const result = await marketingService_1.MarketingService.setActiveMarketingGoal(id);
        if (!result.success) {
            return res.status(400).json(result);
        }
        return res.json(result);
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.get('/goals/:id/modules', async (req, res) => {
    try {
        const id = req.params['id'];
        const result = await marketingService_1.MarketingService.getMarketingModules(id);
        if (!result.success) {
            return res.status(400).json(result);
        }
        return res.json(result);
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.post('/goals/:id/modules', (0, rate_1.routeRateLimit)(20), (0, validate_1.validate)((req) => {
    const body = req.body || {};
    if (!body.title)
        return 'Module title is required';
    if (!body.weekNumber || body.weekNumber < 1)
        return 'Week number must be at least 1';
    return undefined;
}), async (req, res) => {
    try {
        const id = req.params['id'];
        const moduleData = req.body;
        if (!moduleData.title) {
            return res.status(400).json({
                success: false,
                error: 'Module title is required'
            });
        }
        if (!moduleData.weekNumber || moduleData.weekNumber < 1) {
            return res.status(400).json({
                success: false,
                error: 'Week number must be at least 1'
            });
        }
        const result = await marketingService_1.MarketingService.createMarketingModule({
            ...moduleData,
            goalId: id
        });
        if (!result.success) {
            return res.status(400).json(result);
        }
        return res.status(201).json(result);
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.get('/modules/:id/tasks', async (req, res) => {
    try {
        const id = req.params['id'];
        const result = await marketingService_1.MarketingService.getMarketingTasks(id);
        if (!result.success) {
            return res.status(400).json(result);
        }
        return res.json(result);
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.post('/modules/:id/tasks', (0, rate_1.routeRateLimit)(60), (0, validate_1.validate)((req) => {
    const body = req.body || {};
    if (!body.title)
        return 'Task title is required';
    return undefined;
}), async (req, res) => {
    try {
        const id = req.params['id'];
        const taskData = req.body;
        if (!taskData.title) {
            return res.status(400).json({
                success: false,
                error: 'Task title is required'
            });
        }
        const result = await marketingService_1.MarketingService.createMarketingTask({
            ...taskData,
            moduleId: id
        });
        if (!result.success) {
            return res.status(400).json(result);
        }
        return res.status(201).json(result);
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.patch('/tasks/:id/completion', (0, rate_1.routeRateLimit)(60), (0, validate_1.validate)((req) => {
    const { isCompleted } = req.body || {};
    if (typeof isCompleted !== 'boolean')
        return 'isCompleted must be a boolean';
    return undefined;
}), async (req, res) => {
    try {
        const id = req.params['id'];
        const { isCompleted } = req.body;
        if (typeof isCompleted !== 'boolean') {
            return res.status(400).json({
                success: false,
                error: 'isCompleted must be a boolean'
            });
        }
        const result = await marketingService_1.MarketingService.updateMarketingTaskCompletion(id, isCompleted);
        if (!result.success) {
            return res.status(404).json(result);
        }
        return res.json(result);
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
exports.default = router;
router.delete('/goals/:id', async (req, res) => {
    try {
        const id = req.params['id'];
        const result = await marketingService_1.MarketingService.deleteMarketingGoal(id);
        if (!result.success) {
            return res.status(400).json(result);
        }
        return res.json(result);
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.post('/sync-notion', (0, rate_1.routeRateLimit)(2), async (req, res) => {
    try {
        const { databaseId: rawDbId, url, title } = req.body || {};
        let databaseId = rawDbId;
        if (!databaseId && typeof url === 'string') {
            const match = url.match(/[0-9a-fA-F]{32}/);
            if (match)
                databaseId = match[0];
        }
        if (!databaseId)
            databaseId = process.env['NOTION_MARKETING_DB_ID'];
        if (!databaseId && (title || process.env['NOTION_MARKETING_DB_TITLE'])) {
            const token = process.env['NOTION_API_KEY'];
            if (!token) {
                return res.status(400).json({ success: false, error: 'NOTION_API_KEY not set' });
            }
            const notion = new client_1.Client({ auth: token });
            const queryTitle = title || process.env['NOTION_MARKETING_DB_TITLE'];
            const search = await notion.search({
                query: queryTitle,
                filter: { value: 'database', property: 'object' },
                sort: { direction: 'descending', timestamp: 'last_edited_time' }
            });
            const db = (search.results || []).find((r) => (r.title?.[0]?.plain_text || '').toLowerCase() === queryTitle.toLowerCase());
            if (db?.id) {
                databaseId = db.id;
            }
        }
        if (!databaseId) {
            return res.status(400).json({ success: false, error: 'Provide databaseId or url, or set NOTION_MARKETING_DB_ID' });
        }
        const result = await notionSyncService_1.NotionSyncService.syncMarketing(databaseId);
        return res.json({ success: true, data: result, message: 'Synced from Notion' });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Failed to sync' });
    }
});
router.post('/sync-notion/container', (0, rate_1.routeRateLimit)(2), async (req, res) => {
    try {
        const { url } = req.body || {};
        if (!url)
            return res.status(400).json({ success: false, error: 'url is required' });
        const result = await notionSyncService_1.NotionSyncService.syncContainer(url);
        return res.json({ success: true, data: result, message: 'Synced from Notion container page' });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Failed to sync from container' });
    }
});
router.post('/sync-notion/goal', (0, rate_1.routeRateLimit)(2), async (req, res) => {
    try {
        const { title, url } = req.body || {};
        if (!title || !url)
            return res.status(400).json({ success: false, error: 'title and url are required' });
        const result = await notionSyncService_1.NotionSyncService.syncGoalFromPage(title, url);
        return res.json({ success: true, data: result, message: 'Synced goal from Notion page' });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Failed to sync goal from page' });
    }
});
router.post('/sync-notion/debug', (0, rate_1.routeRateLimit)(2), async (req, res) => {
    try {
        const { url } = req.body || {};
        if (!url)
            return res.status(400).json({ success: false, error: 'url is required' });
        const result = await notionSyncService_1.NotionSyncService.debugPageBlocks(url);
        return res.json(result);
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Failed to debug page' });
    }
});
router.post('/goals/:id/seed-social', async (req, res) => {
    try {
        const id = req.params['id'];
        const result = await marketingService_1.MarketingService.seedSocialMediaModules(id);
        if (!result.success)
            return res.status(400).json(result);
        return res.json(result);
    }
    catch (error) {
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
//# sourceMappingURL=marketing.js.map