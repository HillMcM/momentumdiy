import { Router } from 'express';
import { MarketingTrackService } from '../services/marketingTrackService';

const router = Router();

// ===============
// ADMIN ROUTES
// ===============

// GET /api/admin/tracks - List all track definitions
router.get('/', async (_req, res) => {
  try {
    const result = await MarketingTrackService.getTrackDefinitions();
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    return res.json(result);
  } catch (error) {
    console.error('Error in GET /api/admin/tracks:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/admin/tracks - Create new track definition
router.post('/', async (req, res) => {
  try {
    const { slug, title, description, industry_tags, duration_weeks, phases } = req.body;

    if (!slug || !title || !description) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: slug, title, description'
      });
    }

    const result = await MarketingTrackService.createTrackDefinition({
      slug,
      title,
      description,
      industry_tags,
      duration_weeks,
      phases
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error('Error in POST /api/admin/tracks:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/admin/tracks/:id/modules - Get modules for a track
router.get('/:id/modules', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await MarketingTrackService.getTrackModules(id);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    return res.json(result);
  } catch (error) {
    console.error('Error in GET /api/admin/tracks/:id/modules:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/admin/tracks/:id/modules - Create new module
router.post('/:id/modules', async (req, res) => {
  try {
    const { id } = req.params;
    const { week_number, title, description, content, pro_tip } = req.body;

    if (!week_number || !title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: week_number, title, content'
      });
    }

    const result = await MarketingTrackService.createTrackModule(id, {
      week_number: parseInt(week_number),
      title,
      description,
      content,
      pro_tip
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error('Error in POST /api/admin/tracks/:id/modules:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/admin/modules/:id/tasks - Get tasks for a module
router.get('/modules/:id/tasks', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await MarketingTrackService.getModuleTasks(id);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    return res.json(result);
  } catch (error) {
    console.error('Error in GET /api/admin/modules/:id/tasks:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/admin/modules/:id/tasks - Create task for module
router.post('/modules/:id/tasks', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, estimated_time, order_index } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: title'
      });
    }

    const result = await MarketingTrackService.createModuleTask(id, {
      title,
      description,
      estimated_time,
      order_index
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error('Error in POST /api/admin/modules/:id/tasks:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
