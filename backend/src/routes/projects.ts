import { Router, Request, Response } from 'express';
import { ProjectService } from '../services/projectService';
import { validate } from '../middleware/validate';
import { routeRateLimit } from '../middleware/rate';
import { CreateProjectRequest, UpdateProjectRequest } from '../types';

const router = Router();

/**
 * GET /api/projects
 * Get all projects with optional filtering
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status } = req.query as { status?: string };
    
    const result = await ProjectService.getProjects(status as string);

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
 * GET /api/projects/:id
 * Get a single project by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    
    const result = await ProjectService.getProjectById(id);

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
 * POST /api/projects
 * Create a new project
 */
router.post('/', routeRateLimit(30), validate((req) => {
  const body = req.body || {};
  if (!body.name || typeof body.name !== 'string') return 'Name is required';
  return undefined;
}), async (req: Request, res: Response) => {
  try {
    const projectData: CreateProjectRequest = req.body;
    
    // Validate required fields
    if (!projectData.name) {
      return res.status(400).json({
        success: false,
        error: 'Name is required'
      });
    }

    const result = await ProjectService.createProject(projectData);

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
 * PUT /api/projects/:id
 * Update an existing project
 */
router.put('/:id', routeRateLimit(30), async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    const updates: UpdateProjectRequest = { ...req.body, id };
    
    const result = await ProjectService.updateProject(id, updates);

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
 * DELETE /api/projects/:id
 * Delete a project
 */
router.delete('/:id', routeRateLimit(30), async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    
    const result = await ProjectService.deleteProject(id);

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
 * GET /api/projects/:id/timeline
 * Get timeline phases for a project
 */
router.get('/:id/timeline', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    
    const result = await ProjectService.getTimelinePhases(id);

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
 * POST /api/projects/:id/timeline
 * Create a timeline phase for a project
 */
router.post('/:id/timeline', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    const phaseData = req.body;
    
    // Validate required fields
    if (!phaseData.name) {
      return res.status(400).json({
        success: false,
        error: 'Phase name is required'
      });
    }

    const result = await ProjectService.createTimelinePhase({
      ...phaseData,
      projectId: id
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
 * PATCH /api/projects/:id/progress
 * Update project progress
 */
router.patch('/:id/progress', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    
    const result = await ProjectService.updateProjectProgress(id);

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