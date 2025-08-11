import { Router, Request, Response } from 'express';
import { TaskService } from '../services/taskService';
import { validate } from '../middleware/validate';
import { routeRateLimit } from '../middleware/rate';
import { CreateTaskRequest, UpdateTaskRequest } from '../types';

const router = Router();

/**
 * GET /api/tasks
 * Get all tasks with optional filtering
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { projectId, status } = req.query as { projectId?: string; status?: string };
    
    const result = await TaskService.getTasks(
      projectId,
      status
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
 * GET /api/tasks/:id
 * Get a single task by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    
    const result = await TaskService.getTaskById(id);

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
 * POST /api/tasks
 * Create a new task
 */
router.post('/', routeRateLimit(60), validate((req) => {
  const body = req.body || {};
  if (!body.title || typeof body.title !== 'string') return 'Title is required';
  return undefined;
}), async (req: Request, res: Response) => {
  try {
    const taskData: CreateTaskRequest = req.body;
    
    // Validate required fields
    if (!taskData.title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }

    const result = await TaskService.createTask(taskData);

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
 * PUT /api/tasks/:id
 * Update an existing task
 */
router.put('/:id', routeRateLimit(60), async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    const updates: UpdateTaskRequest = { ...req.body, id };
    
    const result = await TaskService.updateTask(id, updates);

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
 * DELETE /api/tasks/:id
 * Delete a task
 */
router.delete('/:id', routeRateLimit(60), async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    
    const result = await TaskService.deleteTask(id);

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
 * PATCH /api/tasks/:id/status
 * Update task status
 */
router.patch('/:id/status', routeRateLimit(60), validate((req) => {
  const { status } = req.body || {};
  if (!status) return 'Status is required';
  return undefined;
}), async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    const result = await TaskService.updateTaskStatus(id, status);

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
 * PATCH /api/tasks/:id/time-spent
 * Update task time spent
 */
router.patch('/:id/time-spent', routeRateLimit(60), validate((req) => {
  const { timeSpent } = req.body || {};
  if (timeSpent === undefined) return 'Time spent is required';
  return undefined;
}), async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    const { timeSpent } = req.body;
    
    if (!timeSpent) {
      return res.status(400).json({
        success: false,
        error: 'Time spent is required'
      });
    }

    const result = await TaskService.updateTaskTimeSpent(id, timeSpent);

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
 * GET /api/tasks/project/:projectId
 * Get tasks by project ID
 */
router.get('/project/:projectId', async (req: Request, res: Response) => {
  try {
    const projectId = req.params['projectId'] as string;
    
    const result = await TaskService.getTasksByProject(projectId);

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