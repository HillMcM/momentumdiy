import { Router, Request, Response } from 'express';
import { MarketingService } from '../services/marketingService';
import { NotionSyncService } from '../services/notionSyncService';
import { Client as NotionClient } from '@notionhq/client';
import { CreateMarketingGoalRequest, UpdateMarketingGoalRequest } from '../types';
import { routeRateLimit } from '../middleware/rate';

const router = Router();

/**
 * GET /api/marketing/goals
 * Get all marketing goals
 */
router.get('/goals', async (_req: Request, res: Response) => {
  try {
    const result = await MarketingService.getMarketingGoals();

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
 * GET /api/marketing/goals/active
 * Get active marketing goal
 */
router.get('/goals/active', async (_req: Request, res: Response) => {
  try {
    const result = await MarketingService.getActiveMarketingGoal();

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
 * GET /api/marketing/goals/:id
 * Get a single marketing goal by ID
 */
router.get('/goals/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    
    const result = await MarketingService.getMarketingGoals();
    
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
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/marketing/goals
 * Create a new marketing goal
 */
router.post('/goals', async (req: Request, res: Response) => {
  try {
    const goalData: CreateMarketingGoalRequest = req.body;
    
    // Validate required fields
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

    const result = await MarketingService.createMarketingGoal(goalData);

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
 * PUT /api/marketing/goals/:id
 * Update an existing marketing goal
 */
router.put('/goals/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    const updates: UpdateMarketingGoalRequest = { ...req.body, id };
    
    const result = await MarketingService.updateMarketingGoal(id, updates);

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
 * PATCH /api/marketing/goals/:id/activate
 * Set a marketing goal as active
 */
router.patch('/goals/:id/activate', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    
    const result = await MarketingService.setActiveMarketingGoal(id);

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
 * GET /api/marketing/goals/:id/modules
 * Get marketing modules for a goal
 */
router.get('/goals/:id/modules', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    
    const result = await MarketingService.getMarketingModules(id);

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
 * POST /api/marketing/goals/:id/modules
 * Create a marketing module for a goal
 */
router.post('/goals/:id/modules', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    const moduleData = req.body;
    
    // Validate required fields
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

    const result = await MarketingService.createMarketingModule({
      ...moduleData,
      goalId: id
    });

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
 * GET /api/marketing/modules/:id/tasks
 * Get marketing tasks for a module
 */
router.get('/modules/:id/tasks', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    
    const result = await MarketingService.getMarketingTasks(id);

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
 * POST /api/marketing/modules/:id/tasks
 * Create a marketing task for a module
 */
router.post('/modules/:id/tasks', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    const taskData = req.body;
    
    // Validate required fields
    if (!taskData.title) {
      return res.status(400).json({
        success: false,
        error: 'Task title is required'
      });
    }

    const result = await MarketingService.createMarketingTask({
      ...taskData,
      moduleId: id
    });

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
 * PATCH /api/marketing/tasks/:id/completion
 * Update marketing task completion status
 */
router.patch('/tasks/:id/completion', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    const { isCompleted } = req.body;
    
    if (typeof isCompleted !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'isCompleted must be a boolean'
      });
    }

    const result = await MarketingService.updateMarketingTaskCompletion(id, isCompleted);

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

export default router; 

/**
 * DELETE /api/marketing/goals/:id
 * Delete a marketing goal
 */
router.delete('/goals/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    const result = await MarketingService.deleteMarketingGoal(id);
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

// Notion sync endpoint
router.post('/sync-notion', routeRateLimit(2), async (req: Request, res: Response) => {
  try {
    const { databaseId: rawDbId, url, title } = req.body || {};
    let databaseId: string | undefined = rawDbId;

    if (!databaseId && typeof url === 'string') {
      const match = url.match(/[0-9a-fA-F]{32}/);
      if (match) databaseId = match[0];
    }

    if (!databaseId) databaseId = process.env['NOTION_MARKETING_DB_ID'];

    // As a fallback, try searching by title within the integration's workspace
    if (!databaseId && (title || process.env['NOTION_MARKETING_DB_TITLE'])) {
      const token = process.env['NOTION_API_KEY'];
      if (!token) {
        return res.status(400).json({ success: false, error: 'NOTION_API_KEY not set' });
      }
      const notion = new NotionClient({ auth: token });
      const queryTitle = title || process.env['NOTION_MARKETING_DB_TITLE']!;
      const search = await notion.search({
        query: queryTitle,
        filter: { value: 'database', property: 'object' },
        sort: { direction: 'descending', timestamp: 'last_edited_time' }
      } as any);
      const db = (search.results || []).find((r: any) => (r.title?.[0]?.plain_text || '').toLowerCase() === queryTitle.toLowerCase()) as any;
      if (db?.id) {
        databaseId = db.id;
      }
    }

    if (!databaseId) {
      return res.status(400).json({ success: false, error: 'Provide databaseId or url, or set NOTION_MARKETING_DB_ID' });
    }

    const result = await NotionSyncService.syncMarketing(databaseId);
    return res.json({ success: true, data: result, message: 'Synced from Notion' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Failed to sync' });
  }
});

// Fallback: sync when a container page hosts child pages
router.post('/sync-notion/container', routeRateLimit(2), async (req: Request, res: Response) => {
  try {
    const { url } = req.body || {};
    if (!url) return res.status(400).json({ success: false, error: 'url is required' });
    const result = await NotionSyncService.syncContainer(url);
    return res.json({ success: true, data: result, message: 'Synced from Notion container page' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Failed to sync from container' });
  }
});

// Sync a single goal from a specific Notion page
router.post('/sync-notion/goal', routeRateLimit(2), async (req: Request, res: Response) => {
  try {
    const { title, url } = req.body || {};
    if (!title || !url) return res.status(400).json({ success: false, error: 'title and url are required' });
    const result = await NotionSyncService.syncGoalFromPage(title, url);
    return res.json({ success: true, data: result, message: 'Synced goal from Notion page' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Failed to sync goal from page' });
  }
});

// Debug: peek at the first-level blocks for a Notion page
router.post('/sync-notion/debug', routeRateLimit(2), async (req: Request, res: Response) => {
  try {
    const { url } = req.body || {};
    if (!url) return res.status(400).json({ success: false, error: 'url is required' });
    const result = await NotionSyncService.debugPageBlocks(url);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Failed to debug page' });
  }
});

/**
 * POST /api/marketing/goals/:id/seed-social
 * Seed a 12-week social media curriculum (modules + tasks) for a goal
 */
router.post('/goals/:id/seed-social', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    const result = await MarketingService.seedSocialMediaModules(id);
    if (!result.success) return res.status(400).json(result);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});