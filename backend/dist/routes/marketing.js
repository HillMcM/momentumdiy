"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const marketingService_1 = require("../services/marketingService");
const notionSyncService_1 = require("../services/notionSyncService");
const client_1 = require("@notionhq/client");
const rate_1 = require("../middleware/rate");
const validate_1 = require("../middleware/validate");
const supabase_1 = require("../config/supabase");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
router.get('/goals', async (_req, res) => {
    try {
        const result = await marketingService_1.MarketingService.getMarketingGoals();
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
router.get('/tracks/:id/preview', async (req, res) => {
    try {
        const { id } = req.params;
        const { data: track, error: trackError } = await supabase_1.supabase
            .from('marketing_tracks')
            .select('id, title, description, industry_tags, duration_weeks, phases, slug')
            .eq('id', id)
            .eq('published', true)
            .single();
        if (trackError || !track) {
            return res.status(404).json({
                success: false,
                error: 'Track not found or not published'
            });
        }
        const { data: modules, error: modulesError } = await supabase_1.supabase
            .from('marketing_modules')
            .select('id, week_number, title')
            .eq('track_id', id)
            .order('week_number', { ascending: true });
        if (modulesError) {
            logger_1.logger.error('Error fetching track modules for preview', modulesError, { trackId: id });
            return res.json({
                success: true,
                data: {
                    ...track,
                    modules: []
                }
            });
        }
        const modulesWithTaskCounts = await Promise.all((modules || []).map(async (module) => {
            const { count, error: taskCountError } = await supabase_1.supabase
                .from('marketing_tasks')
                .select('*', { count: 'exact', head: true })
                .eq('module_id', module.id);
            return {
                week_number: module.week_number,
                title: module.title,
                task_count: taskCountError ? 0 : (count || 0)
            };
        }));
        return res.json({
            success: true,
            data: {
                ...track,
                modules: modulesWithTaskCounts
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error getting track preview', error, { trackId: req.params['id'] });
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.get('/goals/active', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Authorization header required'
            });
        }
        const token = authHeader.substring(7);
        const { data: { user }, error: authError } = await supabase_1.supabaseAuth.auth.getUser(token);
        if (authError || !user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }
        const result = await marketingService_1.MarketingService.getActiveMarketingGoal(user.id);
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
    catch (_error) {
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
    catch (_error) {
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
    catch (_error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.patch('/tracks/:id/activate', async (req, res) => {
    try {
        const trackDefinitionId = req.params['id'];
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Authorization header required'
            });
        }
        const token = authHeader.substring(7);
        const { data: { user }, error: authError } = await supabase_1.supabaseAuth.auth.getUser(token);
        if (authError || !user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }
        const result = await marketingService_1.MarketingService.activateTrackForUser(trackDefinitionId, user.id);
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
router.post('/goals/:id/sync-phases', async (req, res) => {
    try {
        const id = req.params['id'];
        const result = await marketingService_1.MarketingService.syncPhasesFromTrackDefinition(id);
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
router.get('/goals/:id/modules', async (req, res) => {
    try {
        const id = req.params['id'];
        const result = await marketingService_1.MarketingService.getMarketingModules(id);
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
    catch (_error) {
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
    catch (_error) {
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
    catch (_error) {
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
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Authorization header required'
            });
        }
        const token = authHeader.substring(7);
        const { data: { user }, error: authError } = await supabase_1.supabaseAuth.auth.getUser(token);
        if (authError || !user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }
        const id = req.params['id'];
        const { isCompleted } = req.body;
        if (typeof isCompleted !== 'boolean') {
            return res.status(400).json({
                success: false,
                error: 'isCompleted must be a boolean'
            });
        }
        const result = await marketingService_1.MarketingService.updateMarketingTaskCompletion(id, isCompleted, user.id);
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
router.put('/tasks/:id', (0, rate_1.routeRateLimit)(60), (0, validate_1.validate)((req) => {
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
    catch (_error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.put('/goals/:id', (0, rate_1.routeRateLimit)(10), (0, validate_1.validate)((req) => {
    const { progress } = req.body || {};
    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
        return 'Progress must be a number between 0 and 100';
    }
    return undefined;
}), async (req, res) => {
    try {
        const id = req.params['id'];
        const { progress } = req.body;
        if (typeof progress !== 'number' || progress < 0 || progress > 100) {
            return res.status(400).json({
                success: false,
                error: 'Progress must be a number between 0 and 100'
            });
        }
        const result = await marketingService_1.MarketingService.updateMarketingGoalProgress(id, progress);
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
    catch (_error) {
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
router.post('/activate-selected', (0, rate_1.routeRateLimit)(2), async (req, res) => {
    try {
        const adminToken = req.header('x-admin-token') || req.header('X-Admin-Token');
        const serverToken = process.env['ADMIN_TOKEN'] || process.env['ADMIN_KEY'];
        if (!serverToken) {
            return res.status(500).json({ success: false, error: 'ADMIN_TOKEN not configured on server' });
        }
        if (adminToken !== serverToken) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }
        const { titles } = req.body || {};
        if (!Array.isArray(titles) || titles.length === 0) {
            return res.status(400).json({ success: false, error: 'titles[] is required' });
        }
        const { data: goals, error } = await supabase_1.supabase
            .from('marketing_goals')
            .select('id, title, is_active');
        if (error)
            return res.status(500).json({ success: false, error: error.message });
        const titleSet = new Set(titles.map(t => t.trim().toLowerCase()));
        const toActivate = (goals || []).filter(g => titleSet.has((g.title || '').toLowerCase())).map(g => g.id);
        const toDeactivate = (goals || []).filter(g => !titleSet.has((g.title || '').toLowerCase())).map(g => g.id);
        if (toActivate.length > 0) {
            const { error: actErr } = await supabase_1.supabase.from('marketing_goals').update({ is_active: true }).in('id', toActivate);
            if (actErr)
                return res.status(500).json({ success: false, error: actErr.message });
        }
        if (toDeactivate.length > 0) {
            const { error: deErr } = await supabase_1.supabase.from('marketing_goals').update({ is_active: false }).in('id', toDeactivate);
            if (deErr)
                return res.status(500).json({ success: false, error: deErr.message });
        }
        return res.json({ success: true, data: { activated: toActivate.length, deactivated: toDeactivate.length } });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Failed to activate selected' });
    }
});
router.post('/consolidate-tasks', (0, rate_1.routeRateLimit)(2), async (req, res) => {
    try {
        const adminToken = req.header('x-admin-token') || req.header('X-Admin-Token');
        const serverToken = process.env['ADMIN_TOKEN'] || process.env['ADMIN_KEY'];
        if (!serverToken) {
            return res.status(500).json({ success: false, error: 'ADMIN_TOKEN not configured on server' });
        }
        if (adminToken !== serverToken) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }
        const { title, min = 2, max = 5 } = req.body || {};
        if (!title)
            return res.status(400).json({ success: false, error: 'title is required' });
        const minTasks = Math.max(1, Math.floor(min));
        const maxTasks = Math.max(minTasks, Math.floor(max));
        const { data: goals, error: gErr } = await supabase_1.supabase
            .from('marketing_goals')
            .select('id, title')
            .eq('title', title)
            .limit(1);
        if (gErr)
            return res.status(500).json({ success: false, error: gErr.message });
        const goal = (goals || [])[0];
        if (!goal)
            return res.status(404).json({ success: false, error: 'Goal not found' });
        const { data: modules, error: mErr } = await supabase_1.supabase
            .from('marketing_modules')
            .select('id, week_number, title, description')
            .eq('goal_id', goal.id)
            .order('week_number', { ascending: true });
        if (mErr)
            return res.status(500).json({ success: false, error: mErr.message });
        let totalBefore = 0;
        let totalAfter = 0;
        for (const mod of modules || []) {
            const { data: tasks, error: tErr } = await supabase_1.supabase
                .from('marketing_tasks')
                .select('id, title, description')
                .eq('module_id', mod.id)
                .order('id', { ascending: true });
            if (tErr)
                return res.status(500).json({ success: false, error: tErr.message });
            const originals = tasks || [];
            totalBefore += originals.length;
            if (originals.length === 0)
                continue;
            let groupCount = originals.length <= maxTasks ? originals.length : maxTasks;
            if (groupCount < minTasks)
                groupCount = Math.min(minTasks, Math.max(1, originals.length));
            groupCount = Math.max(minTasks, Math.min(maxTasks, groupCount));
            const size = Math.ceil(originals.length / groupCount);
            const groups = [];
            for (let i = 0; i < originals.length; i += size) {
                groups.push(originals.slice(i, i + size));
            }
            while (groups.length > maxTasks) {
                const last = groups.pop();
                if (!last)
                    break;
                if (groups.length === 0) {
                    groups.push(last);
                    break;
                }
                const prev = groups[groups.length - 1];
                if (prev)
                    prev.push(...last);
            }
            while (groups.length < minTasks && groups[0] && groups[0].length > 1) {
                const first = groups[0];
                const half = Math.ceil(first.length / 2);
                groups.splice(0, 1, first.slice(0, half), first.slice(half));
            }
            const { error: delErr } = await supabase_1.supabase.from('marketing_tasks').delete().eq('module_id', mod.id);
            if (delErr)
                return res.status(500).json({ success: false, error: delErr.message });
            let index = 1;
            for (const group of groups) {
                const header = group[0]?.title?.trim() || `Task ${index}`;
                const descriptionLines = group.map(g => `- ${g.title}${g.description ? ` — ${g.description}` : ''}`);
                const niceTitle = `${mod.title?.trim() || 'Week'} – ${header}`.slice(0, 200);
                const fullDescription = `This task consolidates related actions for week ${mod.week_number}:
${descriptionLines.join('\n')}`.slice(0, 4000);
                const { error: insErr } = await supabase_1.supabase
                    .from('marketing_tasks')
                    .insert([{ module_id: mod.id, title: niceTitle, description: fullDescription, estimated_time: '', is_completed: false }]);
                if (insErr)
                    return res.status(500).json({ success: false, error: insErr.message });
                index++;
            }
            totalAfter += groups.length;
        }
        return res.json({ success: true, data: { totalBefore, totalAfter }, message: 'Consolidation complete' });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Failed to consolidate tasks' });
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
router.put('/goals/:id/phases', (0, rate_1.routeRateLimit)(10), (0, validate_1.validate)((req) => {
    const { phases } = req.body || {};
    if (!Array.isArray(phases))
        return 'Phases must be an array';
    if (phases.length === 0)
        return 'At least one phase is required';
    for (const phase of phases) {
        if (!phase.title)
            return 'Each phase must have a title';
        if (!phase.description)
            return 'Each phase must have a description';
        if (typeof phase.startWeek !== 'number' || phase.startWeek < 1)
            return 'Each phase must have a valid startWeek';
        if (typeof phase.endWeek !== 'number' || phase.endWeek < 1)
            return 'Each phase must have a valid endWeek';
        if (phase.startWeek > phase.endWeek)
            return 'Phase startWeek must be <= endWeek';
    }
    return undefined;
}), async (req, res) => {
    try {
        const id = req.params['id'];
        const { phases } = req.body;
        const result = await marketingService_1.MarketingService.updateMarketingGoalPhases(id, phases);
        if (!result.success) {
            return res.status(400).json(result);
        }
        return res.json(result);
    }
    catch (error) {
        logger_1.logger.error('Error updating phases', error, { goalId: req.params['id'] });
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
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
    catch (_error) {
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
//# sourceMappingURL=marketing.js.map