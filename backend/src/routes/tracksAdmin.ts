import { Router } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

console.log('🔧 tracksAdmin routes module loaded');

// =====================
// MARKETING TRACKS ADMIN API
// =====================
// Simple, clean API for managing marketing track content

// Test endpoint to verify backend is working
router.get('/test', (_req, res) => {
  console.log('🧪 Test endpoint hit!');
  res.json({ success: true, message: 'Backend is working!', timestamp: new Date().toISOString() });
});

// Test PUT endpoint
router.put('/test-put', (req, res) => {
  console.log('🧪 Test PUT endpoint hit!');
  res.json({ success: true, message: 'PUT endpoint is working!', body: req.body });
});

// Test PUT endpoint with different path
router.put('/test-update/:id', (req, res) => {
  console.log('🧪 Test PUT /test-update/:id endpoint hit!');
  res.json({ success: true, message: 'PUT /test-update/:id is working!', id: req.params.id, body: req.body });
});

// Minimal test PUT endpoint
router.put('/minimal-test', (_req, res) => {
  res.json({ success: true, message: 'Minimal PUT test working!' });
});

// GET /admin/tracks/definitions - List all track definitions
router.get('/definitions', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('marketing_track_definitions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Parse phases from JSON string to array for frontend
    const processedData = (data || []).map(track => ({
      ...track,
      phases: track.phases ? (typeof track.phases === 'string' ? JSON.parse(track.phases) : track.phases) : []
    }));
    
    return res.json({ success: true, data: processedData });
  } catch (error) {
    console.error('Error fetching track definitions:', error);
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

    // Convert phases array to JSON string for database storage
    let phasesString = phases;
    if (phases && Array.isArray(phases)) {
      try {
        phasesString = JSON.stringify(phases);
      } catch (stringifyError) {
        console.error('Error stringifying phases:', stringifyError);
        return res.status(400).json({ success: false, error: 'Invalid phases format' });
      }
    } else if (phases && typeof phases === 'string') {
      // Validate it's valid JSON
      try {
        JSON.parse(phases);
      } catch (parseError) {
        console.error('Error parsing phases JSON:', parseError);
        return res.status(400).json({ success: false, error: 'Invalid phases JSON format' });
      }
    }

    const { data, error } = await supabase
      .from('marketing_track_definitions')
      .insert([{
        slug,
        title,
        description,
        industry_tags: Array.isArray(industry_tags) ? industry_tags : [industry_tags].filter(Boolean),
        duration_weeks: duration_weeks || 12,
        phases: phasesString || '[]'
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
  console.log('🚀 PUT /definitions/:id - Route hit! [DEPLOYMENT TEST 2025-09-24-17:05]');
  
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

    // Prepare update data without updated_at to avoid schema issues
    const updateData = {
      ...updates
    };
    
    // Remove updated_at to avoid potential schema issues
    delete updateData.updated_at;
    
    console.log('📊 Final update data:', JSON.stringify(updateData, null, 2));
    
    const { data, error } = await supabase
      .from('marketing_track_definitions')
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

console.log('🔧 PUT /definitions/:id route registered');

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
    const { week_number, title, description, content, pro_tip } = req.body;

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
        pro_tip: pro_tip || null,
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

    // Filter out pro_tip if it's null or undefined to avoid column errors
    const filteredUpdates = { ...updates };
    if (filteredUpdates.pro_tip === null || filteredUpdates.pro_tip === undefined) {
      delete filteredUpdates.pro_tip;
    }

    const { data, error } = await supabase
      .from('marketing_modules')
      .update(filteredUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      // If the error is about pro_tip column not existing, try again without it
      if (error.message && error.message.includes('pro_tip')) {
        console.log('Pro_tip column not found, retrying without pro_tip field');
        const { pro_tip, ...updatesWithoutProTip } = filteredUpdates;
        const { data: retryData, error: retryError } = await supabase
          .from('marketing_modules')
          .update(updatesWithoutProTip)
          .eq('id', id)
          .select()
          .single();
        
        if (retryError) throw retryError;
        return res.json({ success: true, data: retryData });
      }
      throw error;
    }
    
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

    // Get existing live modules for this goal
    const { data: existingLiveModules, error: existingModulesError } = await supabase
      .from('marketing_modules')
      .select('*')
      .eq('goal_id', goalId)
      .is('track_definition_id', null) // Only live modules, not template modules
      .order('week_number', { ascending: true });

    if (existingModulesError) {
      return res.status(500).json({ success: false, error: 'Failed to fetch existing live modules' });
    }

    // Prepare module data for upsert
    const liveModules = modules?.map(module => ({
      goal_id: goalId,
      week_number: module.week_number,
      title: module.title,
      description: module.description,
      content: module.content,
      pro_tip: module.pro_tip || null,
      is_unlocked: module.week_number === 1, // Only first week unlocked
      is_completed: false
    })) || [];

    let createdModules = [];
    let updatedModules = [];

    // Process each module - update existing or create new
    for (const moduleData of liveModules) {
      const existingModule = existingLiveModules?.find(m => m.week_number === moduleData.week_number);
      
      if (existingModule) {
        // Update existing module
        const { data: updatedModule, error: updateError } = await supabase
          .from('marketing_modules')
          .update({
            title: moduleData.title,
            description: moduleData.description,
            content: moduleData.content,
            pro_tip: moduleData.pro_tip,
            is_unlocked: moduleData.is_unlocked,
            // Keep existing is_completed status
            updated_at: new Date().toISOString()
          })
          .eq('id', existingModule.id)
          .select()
          .single();

        if (updateError) {
          console.error(`Error updating module ${existingModule.id}:`, updateError);
          return res.status(500).json({ success: false, error: `Failed to update module ${existingModule.id}` });
        }
        
        updatedModules.push(updatedModule);
      } else {
        // Create new module
        const { data: newModule, error: createError } = await supabase
          .from('marketing_modules')
          .insert([moduleData])
          .select()
          .single();

        if (createError) {
          console.error(`Error creating module for week ${moduleData.week_number}:`, createError);
          return res.status(500).json({ success: false, error: `Failed to create module for week ${moduleData.week_number}` });
        }
        
        createdModules.push(newModule);
      }
    }

    // Delete any live modules that are no longer in the template
    const templateWeekNumbers = modules?.map(m => m.week_number) || [];
    const modulesToDelete = existingLiveModules?.filter(m => !templateWeekNumbers.includes(m.week_number)) || [];
    
    if (modulesToDelete.length > 0) {
      const moduleIdsToDelete = modulesToDelete.map(m => m.id);
      const { error: deleteError } = await supabase
        .from('marketing_modules')
        .delete()
        .in('id', moduleIdsToDelete);

      if (deleteError) {
        console.error('Error deleting obsolete modules:', deleteError);
        return res.status(500).json({ success: false, error: 'Failed to delete obsolete modules' });
      }
    }

    // Combine created and updated modules for task processing
    const allLiveModules = [...createdModules, ...updatedModules];

    // Process tasks for all modules (both created and updated)
    const liveTasks = [];
    for (const module of allLiveModules || []) {
      const templateModule = modules?.find(m => m.week_number === module.week_number);
      const moduleTasks = tasks?.filter(t => t.module_id === templateModule?.id) || [];
      
      // Get existing tasks for this module
      const { data: existingTasks } = await supabase
        .from('marketing_tasks')
        .select('*')
        .eq('module_id', module.id);

      // Delete existing tasks for this module
      if (existingTasks && existingTasks.length > 0) {
        const { error: deleteTasksError } = await supabase
          .from('marketing_tasks')
          .delete()
          .eq('module_id', module.id);

        if (deleteTasksError) {
          console.error(`Error deleting tasks for module ${module.id}:`, deleteTasksError);
          return res.status(500).json({ success: false, error: `Failed to delete tasks for module ${module.id}` });
        }
      }
      
      // Create new tasks
      for (const task of moduleTasks) {
        liveTasks.push({
          module_id: module.id,
          title: task.title,
          description: task.description,
          estimated_time: task.estimated_time,
          order_index: task.order_index || 0,
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
      modulesCreated: createdModules?.length || 0,
      modulesUpdated: updatedModules?.length || 0,
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