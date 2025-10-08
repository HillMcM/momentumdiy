import { Router } from 'express';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

const router = Router();

// GET /admin/tracks/definitions - List all track definitions
router.get('/definitions', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('marketing_track_definitions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return res.json({ success: true, data: data || [] });
  } catch (error) {
    logger.error('Error fetching track definitions', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch track definitions' });
  }
});

// POST /admin/tracks/definitions - Create new track definition
router.post('/definitions', async (req, res) => {
  try {
    const { slug, title, description, industry_tags, duration_weeks, phases } = req.body;

    if (!slug || !title || !description) {
      return res.status(400).json({ success: false, error: 'Missing required fields: slug, title, description' });
    }

    const { data, error } = await supabase
      .from('marketing_track_definitions')
      .insert([{
        slug,
        title,
        description,
        industry_tags: Array.isArray(industry_tags) ? industry_tags : [industry_tags].filter(Boolean),
        duration_weeks: duration_weeks || 12,
        phases: phases || []
      }])
      .select()
      .single();

    if (error) throw error;
    return res.json({ success: true, data });
  } catch (error) {
    logger.error('Error creating track definition', error);
    return res.status(500).json({ success: false, error: 'Failed to create track definition' });
  }
});

// GET /admin/tracks/definitions/:trackId/modules - Get modules for a track
router.get('/definitions/:trackId/modules', async (req, res) => {
  try {
    const { trackId } = req.params;

    const { data, error } = await supabase
      .from('marketing_modules')
      .select('*')
      .eq('track_definition_id', trackId)
      .order('week_number', { ascending: true });

    if (error) throw error;
    return res.json({ success: true, data: data || [] });
  } catch (error) {
    logger.error('Error fetching track modules', error, { trackId: req.params.trackId });
    return res.status(500).json({ success: false, error: 'Failed to fetch track modules' });
  }
});

// POST /admin/tracks/definitions/:trackId/modules - Create new module
router.post('/definitions/:trackId/modules', async (req, res) => {
  try {
    const { trackId } = req.params;
    const { week_number, title, description, content, pro_tip } = req.body;

    logger.info('Creating module for track', { trackId, weekNumber: week_number, title });

    if (!week_number || !title || !content) {
      return res.status(400).json({ success: false, error: 'Missing required fields: week_number, title, content' });
    }

    // First, verify the track definition exists
    const { data: trackDef, error: trackError } = await supabase
      .from('marketing_track_definitions')
      .select('id')
      .eq('id', trackId)
      .single();

    if (trackError || !trackDef) {
      logger.error('Track definition not found', trackError, { trackId });
      return res.status(404).json({ success: false, error: 'Track definition not found' });
    }

    const { data, error } = await supabase
      .from('marketing_modules')
      .insert([{
        track_definition_id: trackId,
        week_number: parseInt(week_number),
        title,
        description: description || '',
        content,
        pro_tip: pro_tip || null,
        is_unlocked: false,
        is_completed: false
      }])
      .select()
      .single();

    if (error) {
      logger.error('Database error creating module', error, { trackId });
      throw error;
    }

    logger.info('Module created successfully', { moduleId: data.id, trackId });
    return res.json({ success: true, data });
  } catch (error) {
    const trackId = req.params.trackId;
    logger.error('Error creating track module', error, { trackId });
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to create track module',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /admin/tracks/modules/:id - Update module
router.put('/modules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Convert week_number to integer if provided
    if (updates.week_number) {
      updates.week_number = parseInt(updates.week_number);
    }

    const { data, error } = await supabase
      .from('marketing_modules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.json({ success: true, data });
  } catch (error) {
    logger.error('Error updating track module', error, { moduleId: req.params.id });
    return res.status(500).json({ success: false, error: 'Failed to update track module' });
  }
});

// DELETE /admin/tracks/modules/:id - Delete module
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
    logger.error('Error deleting track module', error, { moduleId: req.params.id });
    return res.status(500).json({ success: false, error: 'Failed to delete track module' });
  }
});

export default router;
