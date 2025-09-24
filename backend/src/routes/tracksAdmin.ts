import { Router } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// =====================
// MARKETING TRACKS ADMIN API
// =====================
// Simple, clean API for managing marketing track content

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
    console.error('Error fetching track definitions:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch track definitions' });
  }
});

// POST /admin/tracks/definitions - Create new track definition
router.post('/definitions', async (req, res) => {
  try {
    const { slug, title, description, industry_tags, duration_weeks } = req.body;

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
        duration_weeks: duration_weeks || 12
      }])
      .select()
      .single();

    if (error) throw error;
    return res.json({ success: true, data });
  } catch (error) {
    console.error('Error creating track definition:', error);
    return res.status(500).json({ success: false, error: 'Failed to create track definition' });
  }
});

// PUT /admin/tracks/definitions/:id - Update track definition
router.put('/definitions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Clean up industry_tags if provided
    if (updates.industry_tags && !Array.isArray(updates.industry_tags)) {
      updates.industry_tags = [updates.industry_tags].filter(Boolean);
    }

    const { data, error } = await supabase
      .from('marketing_track_definitions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.json({ success: true, data });
  } catch (error) {
    console.error('Error updating track definition:', error);
    return res.status(500).json({ success: false, error: 'Failed to update track definition' });
  }
});

// DELETE /admin/tracks/definitions/:id - Delete track definition
router.delete('/definitions/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('marketing_track_definitions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return res.json({ success: true, message: 'Track definition deleted' });
  } catch (error) {
    console.error('Error deleting track definition:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete track definition' });
  }
});

// ===============
// TRACK MODULES API
// ===============

// GET /admin/tracks/definitions/:trackId/modules - Get modules for a track
router.get('/definitions/:trackId/modules', async (req, res) => {
  try {
    const { trackId } = req.params;

    const { data, error } = await supabase
      .from('marketing_modules')
      .select('*')
      .eq('goal_id', trackId)
      .order('week_number', { ascending: true });

    if (error) throw error;
    return res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Error fetching track modules:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch track modules' });
  }
});

// POST /admin/tracks/definitions/:trackId/modules - Create new module
router.post('/definitions/:trackId/modules', async (req, res) => {
  try {
    const { trackId } = req.params;
    const { week_number, title, description, content } = req.body;

    if (!week_number || !title || !content) {
      return res.status(400).json({ success: false, error: 'Missing required fields: week_number, title, content' });
    }

    const { data, error } = await supabase
      .from('marketing_modules')
      .insert([{
        goal_id: trackId,
        week_number: parseInt(week_number),
        title,
        description: description || '',
        content,
        is_unlocked: false,
        is_completed: false
      }])
      .select()
      .single();

    if (error) throw error;
    return res.json({ success: true, data });
  } catch (error) {
    console.error('Error creating track module:', error);
    return res.status(500).json({ success: false, error: 'Failed to create track module' });
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
    console.error('Error updating track module:', error);
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
    return res.json({ success: true, message: 'Module deleted' });
  } catch (error) {
    console.error('Error deleting track module:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete track module' });
  }
});

// =============
// TRACK TASKS API
// =============

// GET /admin/tracks/modules/:moduleId/tasks - Get tasks for a module
router.get('/modules/:moduleId/tasks', async (req, res) => {
  try {
    const { moduleId } = req.params;

    const { data, error } = await supabase
      .from('marketing_tasks')
      .select('*')
      .eq('module_id', moduleId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Error fetching track tasks:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch track tasks' });
  }
});

// POST /admin/tracks/modules/:moduleId/tasks - Create new task
router.post('/modules/:moduleId/tasks', async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { title, description, estimated_time, order_index } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, error: 'Missing required fields: title, description' });
    }

    const { data, error } = await supabase
      .from('marketing_tasks')
      .insert([{
        module_id: moduleId,
        title,
        description,
        estimated_time: estimated_time || '30min',
        order_index: parseInt(order_index) || 0
      }])
      .select()
      .single();

    if (error) throw error;
    return res.json({ success: true, data });
  } catch (error) {
    console.error('Error creating track task:', error);
    return res.status(500).json({ success: false, error: 'Failed to create track task' });
  }
});

// PUT /admin/tracks/tasks/:id - Update task
router.put('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Convert order_index to integer if provided
    if (updates.order_index !== undefined) {
      updates.order_index = parseInt(updates.order_index) || 0;
    }

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

// DELETE /admin/tracks/tasks/:id - Delete task
router.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('marketing_tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    console.error('Error deleting track task:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete track task' });
  }
});

// ==================
// BULK OPERATIONS API
// ==================

// POST /admin/tracks/definitions/:trackId/generate-modules - Generate 12 week modules
router.post('/definitions/:trackId/generate-modules', async (req, res) => {
  try {
    const { trackId } = req.params;

    // Get track definition details
    const { data: trackDef, error: trackError } = await supabase
      .from('marketing_track_definitions')
      .select('*')
      .eq('id', trackId)
      .single();

    if (trackError || !trackDef) {
      return res.status(404).json({ success: false, error: 'Track definition not found' });
    }

    // Create or get a template marketing goal for this track definition
    let templateGoalId = trackId; // Try using trackId first
    
    // Check if we can use the trackId directly (if there's already a goal with this ID)
    const { data: existingGoal } = await supabase
      .from('marketing_goals')
      .select('id')
      .eq('id', trackId)
      .single();

    if (!existingGoal) {
      // Create a template goal for this track definition
      const { data: newGoal, error: goalError } = await supabase
        .from('marketing_goals')
        .insert([{
          id: trackId, // Use the same ID as track definition
          title: trackDef.title + ' (Template)',
          description: trackDef.description,
          duration: trackDef.duration_weeks,
          industry: trackDef.industry_tags?.[0] || 'general',
          is_active: false, // Template goals are not active
          current_week: 1,
          progress: 0,
          track_definition_id: trackId
        }])
        .select('id')
        .single();

      if (goalError) {
        console.error('Error creating template goal:', goalError);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to create template goal',
          details: goalError.message
        });
      }
      templateGoalId = newGoal.id;
    }

    // Check if modules already exist for this template goal
    const { data: existing } = await supabase
      .from('marketing_modules')
      .select('week_number')
      .eq('goal_id', templateGoalId);

    const existingWeeks = existing?.map(m => m.week_number) || [];
    
    // Generate modules for missing weeks (start with just Week 1 for testing)
    const modulesToInsert = [];
    for (let week = 1; week <= 12; week++) {
      if (!existingWeeks.includes(week)) {
        modulesToInsert.push({
          goal_id: templateGoalId, // Use the template goal ID
          week_number: week,
          title: `Week ${week}`,
          description: `Week ${week} description`,
          content: `# Week ${week} Content\n\nAdd your content here...`,
          is_unlocked: week === 1,
          is_completed: false
        });
      }
    }

    if (modulesToInsert.length > 0) {
      const { data, error } = await supabase
        .from('marketing_modules')
        .insert(modulesToInsert)
        .select();

      if (error) {
        console.error('Supabase error generating modules:', error);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to generate modules',
          details: error.message
        });
      }
      return res.json({ success: true, data, created: modulesToInsert.length });
    } else {
      return res.json({ success: true, data: [], created: 0, message: 'All weeks already exist' });
    }
  } catch (error) {
    console.error('Error generating modules:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to generate modules',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /admin/tracks/modules/:moduleId/bulk-tasks - Create multiple tasks from text
router.post('/modules/:moduleId/bulk-tasks', async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { tasks_text } = req.body;

    if (!tasks_text) {
      return res.status(400).json({ success: false, error: 'Missing tasks_text' });
    }

    // Parse tasks from text (one task per line)
    const lines = tasks_text.split('\n').filter((line: string) => line.trim());
    const tasksToInsert = lines.map((line: string, index: number) => {
      const trimmedLine = line.trim();
      
      // Try to parse format: "Title (time): Description"
      const match = trimmedLine.match(/^(.+?)\s*\(([^)]+)\)\s*:\s*(.+)$/);
      if (match && match[1] && match[2] && match[3]) {
        const [, title, estimatedTime, description] = match;
        return {
          module_id: moduleId,
          title: title.trim(),
          description: description.trim(),
          estimated_time: estimatedTime.trim(),
          order_index: index
        };
      }
      
      // Fallback: treat entire line as title with default time
      return {
        module_id: moduleId,
        title: trimmedLine,
        description: '', // Empty description for simple format
        estimated_time: '30min',
        order_index: index
      };
    });

    if (tasksToInsert.length > 0) {
      const { data, error } = await supabase
        .from('marketing_tasks')
        .insert(tasksToInsert)
        .select();

      if (error) throw error;
      return res.json({ success: true, data, created: tasksToInsert.length });
    } else {
      return res.json({ success: true, data: [], created: 0, message: 'No valid tasks found' });
    }
  } catch (error) {
    console.error('Error creating bulk tasks:', error);
    return res.status(500).json({ success: false, error: 'Failed to create bulk tasks' });
  }
});

// POST /admin/tracks/modules/:moduleId/tasks - Create multiple tasks from structured data
router.post('/modules/:moduleId/tasks', async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { tasks } = req.body;

    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ success: false, error: 'Missing tasks array' });
    }

    // Validate and structure tasks
    const tasksToInsert = tasks.map((task: any, index: number) => ({
      module_id: moduleId,
      title: task.title?.trim() || '',
      description: task.description?.trim() || '',
      estimated_time: task.estimated_time?.trim() || '30min',
      order_index: index
    }));

    if (tasksToInsert.length > 0) {
      const { data, error } = await supabase
        .from('marketing_tasks')
        .insert(tasksToInsert)
        .select();

      if (error) throw error;
      return res.json({ success: true, data, created: tasksToInsert.length });
    } else {
      return res.json({ success: true, data: [], created: 0, message: 'No tasks provided' });
    }
  } catch (error) {
    console.error('Error creating tasks:', error);
    return res.status(500).json({ success: false, error: 'Failed to create tasks' });
  }
});

// ==================
// PUBLISHING API
// ==================

// POST /admin/tracks/definitions/:trackId/publish - Publish track to live system
router.post('/definitions/:trackId/publish', async (req, res) => {
  try {
    const { trackId } = req.params;

    // Get track definition
    const { data: trackDef, error: trackError } = await supabase
      .from('marketing_track_definitions')
      .select('*')
      .eq('id', trackId)
      .single();

    if (trackError || !trackDef) {
      return res.status(404).json({ success: false, error: 'Track definition not found' });
    }

    // Get track modules
    const { data: modules, error: modulesError } = await supabase
      .from('marketing_modules')
      .select('*')
      .eq('goal_id', trackId) // Note: using goal_id for template linkage
      .order('week_number', { ascending: true });

    if (modulesError) {
      return res.status(500).json({ success: false, error: 'Failed to fetch track modules' });
    }

    // Get tasks for all modules
    const moduleIds = modules?.map(m => m.id) || [];
    const { data: tasks, error: tasksError } = await supabase
      .from('marketing_tasks')
      .select('*')
      .in('module_id', moduleIds)
      .order('order_index', { ascending: true });

    if (tasksError) {
      return res.status(500).json({ success: false, error: 'Failed to fetch track tasks' });
    }

    // Check if a marketing goal already exists for this track
    const { data: existingGoal } = await supabase
      .from('marketing_goals')
      .select('*')
      .eq('track_definition_id', trackId)
      .single();

    let goalId;

    if (existingGoal) {
      // Update existing goal
      const { data: updatedGoal, error: updateError } = await supabase
        .from('marketing_goals')
        .update({
          title: trackDef.title,
          description: trackDef.description,
          duration: trackDef.duration_weeks,
          industry: trackDef.industry_tags?.[0] || null,
          is_active: true, // Published tracks are available for users
          updated_at: new Date().toISOString()
        })
        .eq('id', existingGoal.id)
        .select()
        .single();

      if (updateError) {
        return res.status(500).json({ success: false, error: 'Failed to update marketing goal' });
      }
      goalId = updatedGoal.id;
    } else {
      // Create new marketing goal
      const { data: newGoal, error: goalError } = await supabase
        .from('marketing_goals')
        .insert([{
          title: trackDef.title,
          description: trackDef.description,
          duration: trackDef.duration_weeks,
          industry: trackDef.industry_tags?.[0] || null,
          track_definition_id: trackId,
          is_active: true, // Published tracks are available for users
          current_week: 1,
          progress: 0
        }])
        .select()
        .single();

      if (goalError) {
        return res.status(500).json({ success: false, error: 'Failed to create marketing goal' });
      }
      goalId = newGoal.id;
    }

    // Delete existing live modules for this goal (but not template modules)
    // If goalId === trackId, we need to be more careful about what we delete
    if (goalId === trackId) {
      // When the live goal ID is the same as track definition ID,
      // delete modules that don't have a track_definition_id (these are live modules)
      await supabase
        .from('marketing_modules')
        .delete()
        .eq('goal_id', goalId)
        .is('track_definition_id', null);
    } else {
      // When they're different, simply delete all modules for the live goal
      await supabase
        .from('marketing_modules')
        .delete()
        .eq('goal_id', goalId);
    }

    // Create live modules
    const liveModules = modules?.map(module => ({
      goal_id: goalId,
      week_number: module.week_number,
      title: module.title,
      description: module.description,
      content: module.content,
      is_unlocked: module.week_number === 1, // Only first week unlocked
      is_completed: false
    })) || [];

    const { data: createdModules, error: moduleCreateError } = await supabase
      .from('marketing_modules')
      .insert(liveModules)
      .select();

    if (moduleCreateError) {
      return res.status(500).json({ success: false, error: 'Failed to create live modules' });
    }

    // Create live tasks
    const liveTasks = [];
    for (const module of createdModules || []) {
      const templateModule = modules?.find(m => m.week_number === module.week_number);
      const moduleTasks = tasks?.filter(t => t.module_id === templateModule?.id) || [];
      
      for (const task of moduleTasks) {
        liveTasks.push({
          module_id: module.id,
          title: task.title,
          description: task.description,
          estimated_time: task.estimated_time,
          is_completed: false
        });
      }
    }

    if (liveTasks.length > 0) {
      const { error: taskCreateError } = await supabase
        .from('marketing_tasks')
        .insert(liveTasks);

      if (taskCreateError) {
        return res.status(500).json({ success: false, error: 'Failed to create live tasks' });
      }
    }

    return res.json({ 
      success: true, 
      message: 'Track published successfully',
      goalId,
      modulesPublished: createdModules?.length || 0,
      tasksPublished: liveTasks.length
    });
  } catch (error) {
    console.error('Error publishing track:', error);
    return res.status(500).json({ success: false, error: 'Failed to publish track' });
  }
});

// GET /admin/tracks/goals - List all published goals
router.get('/goals', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('marketing_goals')
      .select(`
        id,
        title,
        description,
        industry,
        duration,
        is_active,
        start_date,
        current_week,
        progress,
        created_at,
        updated_at,
        track_definition_id,
        marketing_track_definitions!inner(slug, title)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Error fetching published goals:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch published goals' });
  }
});

// POST /admin/tracks/goals/:goalId/activate - Activate a published goal for users
router.post('/goals/:goalId/activate', async (req, res) => {
  try {
    const { goalId } = req.params;

    // Deactivate all other goals first
    await supabase
      .from('marketing_goals')
      .update({ is_active: false })
      .neq('id', goalId);

    // Activate this goal
    const { data, error } = await supabase
      .from('marketing_goals')
      .update({ 
        is_active: true,
        start_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', goalId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, error: 'Failed to activate goal' });
    }

    return res.json({ success: true, message: 'Goal activated successfully', data });
  } catch (error) {
    console.error('Error activating goal:', error);
    return res.status(500).json({ success: false, error: 'Failed to activate goal' });
  }
});

export default router;