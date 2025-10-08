import { Router } from 'express';
import { MarketingTrackService } from '../services/marketingTrackService';
import { supabase } from '../config/supabase';

const router = Router();

// ===============
// ADMIN ROUTES
// ===============

// GET /api/admin/tracks/definitions - List all track definitions
router.get('/definitions', async (_req, res) => {
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

// POST /api/admin/tracks/definitions - Create new track definition
router.post('/definitions', async (req, res) => {
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

// GET /api/admin/tracks/definitions/:id/modules - Get modules for a track
router.get('/definitions/:id/modules', async (req, res) => {
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

// POST /api/admin/tracks/definitions/:id/modules - Create new module
router.post('/definitions/:id/modules', async (req, res) => {
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

// PUT /api/admin/tracks/modules/:id - Update module
router.put('/modules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('marketing_modules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.json({ success: true, data });
  } catch (error) {
    console.error('Error updating track module:', error);
    return res.status(500).json({ success: false, error: 'Failed to update track module' });
  }
});

// DELETE /api/admin/tracks/modules/:id - Delete module
router.delete('/modules/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('marketing_modules')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return res.json({ success: true, message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Error deleting track module:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete track module' });
  }
});

// GET /api/admin/tracks/modules/:id/tasks - Get tasks for a module
router.get('/modules/:id/tasks', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await MarketingTrackService.getModuleTasks(id);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    return res.json(result);
  } catch (error) {
    console.error('Error in GET /api/admin/tracks/modules/:id/tasks:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/admin/tracks/modules/:id/tasks - Create task for module
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
    console.error('Error in POST /api/admin/tracks/modules/:id/tasks:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// PUT /api/admin/tracks/tasks/:id - Update task
router.put('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('marketing_tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.json({ success: true, data });
  } catch (error) {
    console.error('Error updating track task:', error);
    return res.status(500).json({ success: false, error: 'Failed to update track task' });
  }
});

// DELETE /api/admin/tracks/tasks/:id - Delete task
router.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('marketing_tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting track task:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete track task' });
  }
});

// GET /api/admin/tracks/goals - List published tracks (renamed for compatibility)
router.get('/goals', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('marketing_tracks')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Error fetching published tracks:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch published tracks' });
  }
});

// PUT /admin/tracks/definitions/:id - Update track definition
router.put('/definitions/:id', async (req, res) => {
  console.log('🚀 PUT /definitions/:id - Route hit!');
  
  try {
    const { id } = req.params;
    const updates = req.body;

    console.log('🔄 Update track definition request:', { id, updates });

    // Clean up industry_tags if provided
    if (updates.industry_tags && !Array.isArray(updates.industry_tags)) {
      updates.industry_tags = [updates.industry_tags].filter(Boolean);
    }

    // Handle phases - convert array to JSON string for database storage
    if (updates.phases) {
      if (Array.isArray(updates.phases)) {
        console.log('📝 Converting phases array to JSON string:', updates.phases);
        updates.phases = JSON.stringify(updates.phases);
        console.log('✅ Successfully converted phases to string:', updates.phases);
      } else if (typeof updates.phases === 'string') {
        try {
          console.log('📝 Validating phases JSON string:', updates.phases);
          JSON.parse(updates.phases); // Validate it's valid JSON
          console.log('✅ Phases string is valid JSON');
        } catch (parseError) {
          console.error('❌ Error validating phases JSON:', parseError);
          return res.status(400).json({ success: false, error: 'Invalid phases JSON format' });
        }
      } else {
        console.error('❌ Invalid phases format:', typeof updates.phases, updates.phases);
        return res.status(400).json({ success: false, error: 'Phases must be an array or JSON string' });
      }
    }

    // Prepare update data with only safe fields
    const updateData = {
      title: updates.title,
      description: updates.description,
      slug: updates.slug,
      industry_tags: updates.industry_tags,
      duration_weeks: updates.duration_weeks,
      phases: updates.phases
    };
    
    // Remove any undefined fields
    Object.keys(updateData).forEach(key => {
      if ((updateData as any)[key] === undefined) {
        delete (updateData as any)[key];
      }
    });
    
    console.log('📊 Final update data:', JSON.stringify(updateData, null, 2));
    
    // Use standard update without updated_at field
    const { data, error } = await supabase
      .from('marketing_tracks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Database error',
        details: error.message 
      });
    }
    
    console.log('✅ Successfully updated track definition:', data);
    return res.json({ success: true, data });
  } catch (error: any) {
    console.error('❌ Error updating track definition:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to update track definition',
      details: error.message || 'Unknown error'
    });
  }
});

export default router;
