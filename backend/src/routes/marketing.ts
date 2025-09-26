import { Router, Request, Response } from 'express';
import { MarketingService } from '../services/marketingService';
import { NotionSyncService } from '../services/notionSyncService';
import { Client as NotionClient } from '@notionhq/client';
import { CreateMarketingGoalRequest, UpdateMarketingGoalRequest } from '../types';
import { routeRateLimit } from '../middleware/rate';
import { validate } from '../middleware/validate';
import { supabase, supabaseAuth } from '../config/supabase';

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
  } catch (_error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/marketing/goals/active
 * Get active marketing goal for the authenticated user
 */
router.get('/goals/active', async (req: Request, res: Response) => {
  try {
    // Set the user context for RLS
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization header required'
      });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Pass the user ID to the service method
    const result = await MarketingService.getActiveMarketingGoal(user.id);

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
  } catch (_error) {
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
router.post('/goals', routeRateLimit(10), validate((req) => {
  const body = req.body || {};
  if (!body.title) return 'Title is required';
  if (!body.duration || body.duration < 1) return 'Duration must be at least 1 week';
  return undefined;
}), async (req: Request, res: Response) => {
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
  } catch (_error) {
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
router.put('/goals/:id', routeRateLimit(10), async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    const updates: UpdateMarketingGoalRequest = { ...req.body, id };
    
    const result = await MarketingService.updateMarketingGoal(id, updates);

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
 * PATCH /api/marketing/tracks/:id/activate
 * Activate a track definition for the authenticated user
 */
router.patch('/tracks/:id/activate', async (req: Request, res: Response) => {
  try {
    const trackDefinitionId = req.params['id'] as string;
    
    // Set the user context for RLS
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization header required'
      });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Pass the user ID to the service method
    const result = await MarketingService.activateTrackForUser(trackDefinitionId, user.id);

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
 * POST /api/marketing/goals/:id/sync-phases
 * Sync phases from track definition to marketing goal
 */
router.post('/goals/:id/sync-phases', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    
    const result = await MarketingService.syncPhasesFromTrackDefinition(id);

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
  } catch (_error) {
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
router.post('/goals/:id/modules', routeRateLimit(20), validate((req) => {
  const body = req.body || {};
  if (!body.title) return 'Module title is required';
  if (!body.weekNumber || body.weekNumber < 1) return 'Week number must be at least 1';
  return undefined;
}), async (req: Request, res: Response) => {
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
  } catch (_error) {
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
  } catch (_error) {
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
router.post('/modules/:id/tasks', routeRateLimit(60), validate((req) => {
  const body = req.body || {};
  if (!body.title) return 'Task title is required';
  return undefined;
}), async (req: Request, res: Response) => {
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
  } catch (_error) {
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
router.patch('/tasks/:id/completion', routeRateLimit(60), validate((req) => {
  const { isCompleted } = req.body || {};
  if (typeof isCompleted !== 'boolean') return 'isCompleted must be a boolean';
  return undefined;
}), async (req: Request, res: Response) => {
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
  } catch (_error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * PUT /api/marketing/tasks/:id
 * Update marketing task (for frontend compatibility)
 */
router.put('/tasks/:id', routeRateLimit(60), validate((req) => {
  const { isCompleted } = req.body || {};
  if (typeof isCompleted !== 'boolean') return 'isCompleted must be a boolean';
  return undefined;
}), async (req: Request, res: Response) => {
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
  } catch (_error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * PUT /api/marketing/goals/:id
 * Update marketing goal (for frontend compatibility)
 */
router.put('/goals/:id', routeRateLimit(10), validate((req) => {
  const { progress } = req.body || {};
  if (typeof progress !== 'number' || progress < 0 || progress > 100) {
    return 'Progress must be a number between 0 and 100';
  }
  return undefined;
}), async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    const { progress } = req.body;
    
    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        error: 'Progress must be a number between 0 and 100'
      });
    }

    const result = await MarketingService.updateMarketingGoalProgress(id, progress);

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
  } catch (_error) {
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

// Admin: Activate only selected goal titles (deactivate the rest)
router.post('/activate-selected', routeRateLimit(2), async (req: Request, res: Response) => {
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

    const { data: goals, error } = await supabase
      .from('marketing_goals')
      .select('id, title, is_active');
    if (error) return res.status(500).json({ success: false, error: error.message });

    const titleSet = new Set((titles as string[]).map(t => t.trim().toLowerCase()));
    const toActivate = (goals || []).filter(g => titleSet.has((g.title || '').toLowerCase())).map(g => g.id);
    const toDeactivate = (goals || []).filter(g => !titleSet.has((g.title || '').toLowerCase())).map(g => g.id);

    if (toActivate.length > 0) {
      const { error: actErr } = await supabase.from('marketing_goals').update({ is_active: true }).in('id', toActivate);
      if (actErr) return res.status(500).json({ success: false, error: actErr.message });
    }
    if (toDeactivate.length > 0) {
      const { error: deErr } = await supabase.from('marketing_goals').update({ is_active: false }).in('id', toDeactivate);
      if (deErr) return res.status(500).json({ success: false, error: deErr.message });
    }

    return res.json({ success: true, data: { activated: toActivate.length, deactivated: toDeactivate.length } });
  } catch (error) {
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Failed to activate selected' });
  }
});

// Admin: Consolidate weekly tasks to a bounded number per week for a given goal title
router.post('/consolidate-tasks', routeRateLimit(2), async (req: Request, res: Response) => {
  try {
    const adminToken = req.header('x-admin-token') || req.header('X-Admin-Token');
    const serverToken = process.env['ADMIN_TOKEN'] || process.env['ADMIN_KEY'];
    if (!serverToken) {
      return res.status(500).json({ success: false, error: 'ADMIN_TOKEN not configured on server' });
    }
    if (adminToken !== serverToken) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const { title, min = 2, max = 5 } = req.body || {} as { title?: string; min?: number; max?: number };
    if (!title) return res.status(400).json({ success: false, error: 'title is required' });
    const minTasks = Math.max(1, Math.floor(min));
    const maxTasks = Math.max(minTasks, Math.floor(max));

    const { data: goals, error: gErr } = await supabase
      .from('marketing_goals')
      .select('id, title')
      .eq('title', title)
      .limit(1);
    if (gErr) return res.status(500).json({ success: false, error: gErr.message });
    const goal = (goals || [])[0];
    if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });

    const { data: modules, error: mErr } = await supabase
      .from('marketing_modules')
      .select('id, week_number, title, description')
      .eq('goal_id', goal.id)
      .order('week_number', { ascending: true });
    if (mErr) return res.status(500).json({ success: false, error: mErr.message });

    let totalBefore = 0;
    let totalAfter = 0;

    for (const mod of modules || []) {
      const { data: tasks, error: tErr } = await supabase
        .from('marketing_tasks')
        .select('id, title, description')
        .eq('module_id', mod.id)
        .order('id', { ascending: true });
      if (tErr) return res.status(500).json({ success: false, error: tErr.message });

      const originals = tasks || [];
      totalBefore += originals.length;
      if (originals.length === 0) continue;

      // Decide group count between [minTasks, maxTasks]
      let groupCount = originals.length <= maxTasks ? originals.length : maxTasks;
      if (groupCount < minTasks) groupCount = Math.min(minTasks, Math.max(1, originals.length));
      groupCount = Math.max(minTasks, Math.min(maxTasks, groupCount));

      const size = Math.ceil(originals.length / groupCount);
      const groups: typeof originals[] = [];
      for (let i = 0; i < originals.length; i += size) {
        groups.push(originals.slice(i, i + size));
      }
      // If we ended up with more than max groups due to rounding, merge last groups
      while (groups.length > maxTasks) {
        const last = groups.pop();
        if (!last) break;
        if (groups.length === 0) {
          groups.push(last);
          break;
        }
        const prev = groups[groups.length - 1];
        if (prev) prev.push(...last);
      }
      // Ensure at least min groups: if fewer, split first group
      while (groups.length < minTasks && groups[0] && groups[0].length > 1) {
        const first = groups[0];
        const half = Math.ceil(first.length / 2);
        groups.splice(0, 1, first.slice(0, half), first.slice(half));
      }

      // Replace tasks with consolidated ones
      const { error: delErr } = await supabase.from('marketing_tasks').delete().eq('module_id', mod.id);
      if (delErr) return res.status(500).json({ success: false, error: delErr.message });

      let index = 1;
      for (const group of groups) {
        const header = group[0]?.title?.trim() || `Task ${index}`;
        const descriptionLines = group.map(g => `- ${g.title}${g.description ? ` — ${g.description}` : ''}`);
        const niceTitle = `${mod.title?.trim() || 'Week'} – ${header}`.slice(0, 200);
        const fullDescription = `This task consolidates related actions for week ${mod.week_number}:
${descriptionLines.join('\n')}`.slice(0, 4000);
        const { error: insErr } = await supabase
          .from('marketing_tasks')
          .insert([{ module_id: mod.id, title: niceTitle, description: fullDescription, estimated_time: '', is_completed: false }]);
        if (insErr) return res.status(500).json({ success: false, error: insErr.message });
        index++;
      }
      totalAfter += groups.length;
    }

    return res.json({ success: true, data: { totalBefore, totalAfter }, message: 'Consolidation complete' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Failed to consolidate tasks' });
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
 * PUT /api/marketing/goals/:id/phases
 * Update phases for a marketing goal
 */
router.put('/goals/:id/phases', routeRateLimit(10), validate((req) => {
  const { phases } = req.body || {};
  if (!Array.isArray(phases)) return 'Phases must be an array';
  if (phases.length === 0) return 'At least one phase is required';
  
  for (const phase of phases) {
    if (!phase.title) return 'Each phase must have a title';
    if (!phase.description) return 'Each phase must have a description';
    if (typeof phase.startWeek !== 'number' || phase.startWeek < 1) return 'Each phase must have a valid startWeek';
    if (typeof phase.endWeek !== 'number' || phase.endWeek < 1) return 'Each phase must have a valid endWeek';
    if (phase.startWeek > phase.endWeek) return 'Phase startWeek must be <= endWeek';
  }
  return undefined;
}), async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    const { phases } = req.body;
    
    const result = await MarketingService.updateMarketingGoalPhases(id, phases);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error('Error updating phases:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
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
  } catch (_error) {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});