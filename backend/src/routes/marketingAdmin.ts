import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';

// NOTE: Lightweight admin API for creating/editing marketing track templates
// Uses existing Supabase tables observed in scripts:
// - marketing_track_definitions
// - marketing_module_definitions
// - marketing_task_definitions

const router = Router();

// Helpers
function badRequest(res: Response, msg: string) {
  return res.status(400).json({ success: false, error: msg });
}

// TRACK DEFINITIONS
router.get('/tracks', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('marketing_track_definitions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Internal server error' });
  }
});

router.post('/tracks', async (req: Request, res: Response) => {
  try {
    const { slug, title, description, phases } = req.body || {};
    if (!slug || !title) return badRequest(res, 'slug and title are required');
    const { data, error } = await supabase
      .from('marketing_track_definitions')
      .insert([{ slug, title, description: description || '', phases: phases || null }])
      .select('*')
      .single();
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Internal server error' });
  }
});

router.put('/tracks/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'];
    const body = req.body || {};
    const { slug, title, description, phases } = body;
    const update: Record<string, any> = {};
    if (slug !== undefined) update['slug'] = slug;
    if (title !== undefined) update['title'] = title;
    if (description !== undefined) update['description'] = description;
    if (phases !== undefined) update['phases'] = phases;
    const { data, error } = await supabase
      .from('marketing_track_definitions')
      .update(update)
      .eq('id', id)
      .select('*')
      .single();
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Internal server error' });
  }
});

router.delete('/tracks/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'];
    const { error } = await supabase.from('marketing_track_definitions').delete().eq('id', id);
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Internal server error' });
  }
});

// MODULE DEFINITIONS
router.get('/tracks/:trackId/modules', async (req: Request, res: Response) => {
  try {
    const trackId = req.params['trackId'];
    const { data, error } = await supabase
      .from('marketing_module_definitions')
      .select('*')
      .eq('track_id', trackId)
      .order('week_number', { ascending: true });
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Internal server error' });
  }
});

router.post('/tracks/:trackId/modules', async (req: Request, res: Response) => {
  try {
    const trackId = req.params['trackId'];
    const { weekNumber, title, subtitle, content, proTip } = req.body || {};
    if (!weekNumber || !title) return badRequest(res, 'weekNumber and title are required');
    const { data, error } = await supabase
      .from('marketing_module_definitions')
      .insert([{ track_id: trackId, week_number: weekNumber, title, subtitle: subtitle || null, content: content || '', pro_tip: proTip || '' }])
      .select('*')
      .single();
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Internal server error' });
  }
});

router.put('/modules/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'];
    const body = req.body || {};
    const { weekNumber, title, subtitle, content, proTip } = body;
    const update: Record<string, any> = {};
    if (weekNumber !== undefined) update['week_number'] = weekNumber;
    if (title !== undefined) update['title'] = title;
    if (subtitle !== undefined) update['subtitle'] = subtitle;
    if (content !== undefined) update['content'] = content;
    if (proTip !== undefined) update['pro_tip'] = proTip;
    const { data, error } = await supabase
      .from('marketing_module_definitions')
      .update(update)
      .eq('id', id)
      .select('*')
      .single();
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Internal server error' });
  }
});

router.delete('/modules/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'];
    const { error } = await supabase.from('marketing_module_definitions').delete().eq('id', id);
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Internal server error' });
  }
});

// TASK DEFINITIONS
router.get('/modules/:moduleId/tasks', async (req: Request, res: Response) => {
  try {
    const moduleId = req.params['moduleId'];
    const { data, error } = await supabase
      .from('marketing_task_definitions')
      .select('*')
      .eq('module_id', moduleId)
      .order('order_index', { ascending: true });
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Internal server error' });
  }
});

router.post('/modules/:moduleId/tasks', async (req: Request, res: Response) => {
  try {
    const moduleId = req.params['moduleId'];
    const { title, description, estimatedTime, orderIndex } = req.body || {};
    if (!title) return badRequest(res, 'title is required');
    const { data, error } = await supabase
      .from('marketing_task_definitions')
      .insert([{ module_id: moduleId, title, description: description || '', estimated_time: estimatedTime || '', order_index: orderIndex ?? 0 }])
      .select('*')
      .single();
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Internal server error' });
  }
});

router.put('/tasks/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'];
    const body = req.body || {};
    const { title, description, estimatedTime, orderIndex } = body;
    const update: Record<string, any> = {};
    if (title !== undefined) update['title'] = title;
    if (description !== undefined) update['description'] = description;
    if (estimatedTime !== undefined) update['estimated_time'] = estimatedTime;
    if (orderIndex !== undefined) update['order_index'] = orderIndex;
    const { data, error } = await supabase
      .from('marketing_task_definitions')
      .update(update)
      .eq('id', id)
      .select('*')
      .single();
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Internal server error' });
  }
});

router.delete('/tasks/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'];
    const { error } = await supabase.from('marketing_task_definitions').delete().eq('id', id);
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Internal server error' });
  }
});

// PUBLISH: materialize a track definition into a marketing goal + modules + tasks
router.post('/tracks/:trackId/publish', async (req: Request, res: Response) => {
  try {
    const trackId = req.params['trackId'];
    const { goalTitle, description, industry = 'General', duration = 12 } = req.body || {};
    if (!goalTitle) return badRequest(res, 'goalTitle is required');

    // 1) Create a goal
    const { data: goal, error: goalErr } = await supabase
      .from('marketing_goals')
      .insert([{ title: goalTitle, description: description || '', industry, duration, is_active: false, current_week: 1, progress: 0 }])
      .select('*')
      .single();
    if (goalErr) return res.status(500).json({ success: false, error: goalErr.message });

    // 2) Fetch module definitions
    const { data: modules, error: modErr } = await supabase
      .from('marketing_module_definitions')
      .select('*')
      .eq('track_id', trackId)
      .order('week_number');
    if (modErr) return res.status(500).json({ success: false, error: modErr.message });

    // 3) Insert modules
    for (const m of modules || []) {
      const { data: newMod, error: insErr } = await supabase
        .from('marketing_modules')
        .insert([{ goal_id: goal.id, week_number: m.week_number, title: m.title, description: m.subtitle || m.description || '', content: m.content || '', is_unlocked: m.week_number === 1, is_completed: false }])
        .select('*')
        .single();
      if (insErr) return res.status(500).json({ success: false, error: insErr.message });

      // 4) Fetch task definitions for this module
      const { data: tasks, error: tErr } = await supabase
        .from('marketing_task_definitions')
        .select('*')
        .eq('module_id', m.id)
        .order('order_index', { ascending: true });
      if (tErr) return res.status(500).json({ success: false, error: tErr.message });

      // 5) Insert tasks
      for (const t of tasks || []) {
        const { error: insTaskErr } = await supabase
          .from('marketing_tasks')
          .insert([{ module_id: newMod.id, title: t.title, description: t.description || '', estimated_time: t.estimated_time || '', is_completed: false }]);
        if (insTaskErr) return res.status(500).json({ success: false, error: insTaskErr.message });
      }
    }

    return res.json({ success: true, data: { goalId: goal.id } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Internal server error' });
  }
});

export default router;


