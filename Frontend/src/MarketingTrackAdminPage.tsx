import { useEffect, useMemo, useState } from 'react';
import api from './services/api';

type Track = any;
type Module = any;
type Task = any;

export default function MarketingTrackAdminPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forms
  const [trackForm, setTrackForm] = useState({ slug: '', title: '', description: '', phases: '' });
  const [moduleForm, setModuleForm] = useState({ weekNumber: '', title: '', introduction: '', content: '', proTip: '' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', estimatedTime: '', orderIndex: '' });
  const [bulkTasksText, setBulkTasksText] = useState('');

  const orderedModules = useMemo(() => {
    return [...modules].sort((a, b) => (a.week_number ?? a.weekNumber) - (b.week_number ?? b.weekNumber));
  }, [modules]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await api.adminListTracks();
      if (res.success) setTracks(res.data || []);
      else setError(res.error || 'Failed to load tracks');
      setLoading(false);
    })();
  }, []);

  const resetModuleContext = () => {
    setSelectedModule(null);
    setTasks([]);
    setTaskForm({ title: '', description: '', estimatedTime: '', orderIndex: '' });
  };

  const handleSelectTrack = async (track: Track) => {
    setSelectedTrack(track);
    setTrackForm({ slug: track.slug || '', title: track.title || '', description: track.description || '', phases: (track.phases && JSON.stringify(track.phases, null, 2)) || '' });
    resetModuleContext();
    const res = await api.adminListModules(track.id);
    if (res.success) setModules(res.data || []);
  };

  const handleSelectModule = async (mod: Module) => {
    setSelectedModule(mod);
    setModuleForm({
      weekNumber: String(mod.week_number ?? mod.weekNumber ?? ''),
      title: mod.title || '',
      introduction: mod.subtitle || mod.description || '',
      content: mod.content || '',
      proTip: mod.pro_tip || mod.proTip || ''
    });
    const res = await api.adminListTasks(mod.id);
    if (res.success) setTasks(res.data || []);
  };

  const handleSelectTask = (t: Task) => {
    setSelectedTask(t);
    setTaskForm({
      title: t.title || '',
      description: t.description || '',
      estimatedTime: t.estimated_time || t.estimatedTime || '',
      orderIndex: String(t.order_index ?? t.orderIndex ?? '')
    });
  };

  // Track actions
  const createTrack = async () => {
    const payload = {
      slug: trackForm.slug.trim(),
      title: trackForm.title.trim(),
      description: trackForm.description,
      phases: safeParseJson(trackForm.phases)
    };
    if (!payload.slug || !payload.title) return alert('Slug and title are required');
    const res = await api.adminCreateTrack(payload);
    if (res.success && res.data) {
      setTracks([res.data, ...tracks]);
      setSelectedTrack(res.data);
    } else if (!res.success) alert(res.error || 'Failed to create track');
  };

  const updateTrack = async () => {
    if (!selectedTrack) return;
    const payload = {
      slug: trackForm.slug.trim(),
      title: trackForm.title.trim(),
      description: trackForm.description,
      phases: safeParseJson(trackForm.phases)
    };
    const res = await api.adminUpdateTrack(selectedTrack.id, payload);
    if (res.success && res.data) {
      const updated = tracks.map(t => (t.id === res.data.id ? res.data : t));
      setTracks(updated);
      setSelectedTrack(res.data);
    } else if (!res.success) alert(res.error || 'Failed to update track');
  };

  const deleteTrack = async () => {
    if (!selectedTrack) return;
    if (!confirm('Delete this track?')) return;
    const res = await api.adminDeleteTrack(selectedTrack.id);
    if (res.success) {
      setTracks(tracks.filter(t => t.id !== selectedTrack.id));
      setSelectedTrack(null);
      setModules([]);
      resetModuleContext();
      setTrackForm({ slug: '', title: '', description: '', phases: '' });
    } else alert(res.error || 'Failed to delete');
  };

  const publishTrack = async () => {
    if (!selectedTrack) return;
    const goalTitle = prompt('Goal title to publish as?', selectedTrack.title) || selectedTrack.title;
    const res = await api.adminPublishTrack(selectedTrack.id, { goalTitle, description: selectedTrack.description, duration: 12 });
    if (res.success) alert(`Published. Goal ID: ${res.data?.goalId}`);
    else alert(res.error || 'Publish failed');
  };

  // Module actions
  const createModule = async () => {
    if (!selectedTrack) return;
    const weekNumber = Number(moduleForm.weekNumber);
    if (!weekNumber || !moduleForm.title.trim()) return alert('Week number and title are required');
    const res = await api.adminCreateModule(selectedTrack.id, {
      weekNumber,
      title: moduleForm.title.trim(),
      subtitle: moduleForm.introduction, // store introduction in subtitle/description column
      content: moduleForm.content,
      proTip: moduleForm.proTip,
    });
    if (res.success && res.data) setModules([...modules, res.data]);
    else if (!res.success) alert(res.error || 'Failed to create module');
  };

  const updateModule = async () => {
    if (!selectedModule) return;
    const payload: any = {
      weekNumber: Number(moduleForm.weekNumber),
      title: moduleForm.title.trim(),
      subtitle: moduleForm.introduction,
      content: moduleForm.content,
      proTip: moduleForm.proTip,
    };
    const res = await api.adminUpdateModule(selectedModule.id, payload);
    if (res.success && res.data) {
      const updated = modules.map(m => (m.id === res.data.id ? res.data : m));
      setModules(updated);
      setSelectedModule(res.data);
    } else if (!res.success) alert(res.error || 'Failed to update module');
  };

  const deleteModule = async () => {
    if (!selectedModule) return;
    if (!confirm('Delete this module?')) return;
    const res = await api.adminDeleteModule(selectedModule.id);
    if (res.success) {
      setModules(modules.filter(m => m.id !== selectedModule.id));
      setSelectedModule(null);
      setTasks([]);
      setModuleForm({ weekNumber: '', title: '', introduction: '', content: '', proTip: '' });
    } else alert(res.error || 'Failed to delete module');
  };

  // Task actions
  const createTask = async () => {
    if (!selectedModule) return;
    if (!taskForm.title.trim()) return alert('Task title is required');
    const payload = {
      title: taskForm.title.trim(),
      description: taskForm.description,
      estimatedTime: taskForm.estimatedTime,
      orderIndex: taskForm.orderIndex ? Number(taskForm.orderIndex) : tasks.length,
    };
    const res = await api.adminCreateTask(selectedModule.id, payload);
    if (res.success && res.data) setTasks([...tasks, res.data]);
    else if (!res.success) alert(res.error || 'Failed to create task');
  };

  const updateTask = async () => {
    if (!selectedTask) return;
    const payload: any = {
      title: taskForm.title.trim(),
      description: taskForm.description,
      estimatedTime: taskForm.estimatedTime,
      orderIndex: taskForm.orderIndex ? Number(taskForm.orderIndex) : undefined,
    };
    const res = await api.adminUpdateTask(selectedTask.id, payload);
    if (res.success && res.data) {
      const updated = tasks.map(t => (t.id === res.data.id ? res.data : t));
      setTasks(updated);
      setSelectedTask(res.data);
    } else if (!res.success) alert(res.error || 'Failed to update task');
  };

  const deleteTask = async () => {
    if (!selectedTask) return;
    if (!confirm('Delete this task?')) return;
    const res = await api.adminDeleteTask(selectedTask.id);
    if (res.success) {
      setTasks(tasks.filter(t => t.id !== selectedTask.id));
      setSelectedTask(null);
      setTaskForm({ title: '', description: '', estimatedTime: '', orderIndex: '' });
    } else alert(res.error || 'Failed to delete task');
  };

  // Helpers: replace tasks from bulk list (one per line; format: Title: Description | 30min)
  const replaceTasksFromList = async () => {
    if (!selectedModule) return;
    const lines = bulkTasksText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return alert('Provide at least one line');
    // delete existing tasks
    for (const t of tasks) {
      await api.adminDeleteTask(t.id);
    }
    const created: Task[] = [];
    let idx = 0;
    for (const line of lines) {
      const [left, rest] = line.split('|');
      const [title, desc] = (left || '').split(':');
      const estimatedTime = (rest || '').trim();
      const payload = {
        title: (title || line).trim(),
        description: (desc || '').trim(),
        estimatedTime,
        orderIndex: idx,
      };
      const res = await api.adminCreateTask(selectedModule.id, payload);
      if (res.success && res.data) {
        created.push(res.data);
        idx += 1;
      }
    }
    setTasks(created);
    alert('Replaced tasks from list');
  };

  // Helpers: scaffold 12 weeks if missing
  const generateTwelveWeeks = async () => {
    if (!selectedTrack) return;
    const existingWeeks = new Set((modules || []).map((m: any) => Number(m.week_number ?? m.weekNumber)));
    const toCreate: number[] = [];
    for (let w = 1; w <= 12; w++) if (!existingWeeks.has(w)) toCreate.push(w);
    for (const w of toCreate) {
      const res = await api.adminCreateModule(selectedTrack.id, {
        weekNumber: w,
        title: `Week ${w} Title`,
        subtitle: 'Introduction',
        content: '',
        proTip: ''
      });
      if (res.success && res.data) setModules(m => [...m, res.data]);
    }
    if (toCreate.length === 0) alert('All 12 weeks already exist');
  };

  return (
    <div className="min-h-screen bg-transparent text-white p-6" style={{ background: 'transparent !important' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Marketing Track Admin</h1>
          <div className="flex gap-3">
            {selectedTrack && (
              <button className="px-3 py-2 rounded bg-[#EF8E81] hover:bg-[#d77e70]" onClick={publishTrack}>Publish Track</button>
            )}
          </div>
        </div>

        {error && <div className="mb-4 text-red-400">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tracks */}
          <div className="bg-[#1B1628] rounded-2xl border border-[#2A243E] p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Tracks</h2>
              <button className="px-2 py-1 rounded bg-[#686DCA] hover:bg-[#5a5fb8] text-sm" onClick={() => { setSelectedTrack(null); setTrackForm({ slug: '', title: '', description: '', phases: '' }); }}>New</button>
            </div>
            <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1 mb-4">
              {loading ? (
                <div className="text-gray-400">Loading...</div>
              ) : tracks.length === 0 ? (
                <div className="text-gray-400">No tracks yet.</div>
              ) : (
                tracks.map(t => (
                  <button key={t.id} onClick={() => handleSelectTrack(t)} className={`w-full text-left px-3 py-2 rounded border ${selectedTrack?.id === t.id ? 'border-[#EF8E81] bg-[#2A243E]' : 'border-[#2A243E] hover:bg-[#2A243E]/50'}`}>
                    <div className="font-medium">{t.title}</div>
                    <div className="text-xs text-gray-400">{t.slug}</div>
                  </button>
                ))
              )}
            </div>

            {/* Track Form */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Slug</label>
                <input value={trackForm.slug} onChange={e => setTrackForm({ ...trackForm, slug: e.target.value })} className="w-full px-3 py-2 rounded bg-[#141127] border border-[#2A243E]" placeholder="social-media-strategy" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input value={trackForm.title} onChange={e => setTrackForm({ ...trackForm, title: e.target.value })} className="w-full px-3 py-2 rounded bg-[#141127] border border-[#2A243E]" placeholder="Improve Social Media Strategy & Engagement" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Track Introduction</label>
                <textarea value={trackForm.description} onChange={e => setTrackForm({ ...trackForm, description: e.target.value })} className="w-full h-24 px-3 py-2 rounded bg-[#141127] border border-[#2A243E]" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Phases (JSON)</label>
                <textarea value={trackForm.phases} onChange={e => setTrackForm({ ...trackForm, phases: e.target.value })} className="w-full h-24 px-3 py-2 rounded bg-[#141127] border border-[#2A243E]" placeholder='[{"title":"Phase 1","weeks":[1,2,3]}]' />
              </div>
              <div className="flex gap-2">
                {!selectedTrack ? (
                  <button className="flex-1 px-3 py-2 rounded bg-[#686DCA] hover:bg-[#5a5fb8]" onClick={createTrack}>Create Track</button>
                ) : (
                  <>
                    <button className="flex-1 px-3 py-2 rounded bg-[#686DCA] hover:bg-[#5a5fb8]" onClick={updateTrack}>Save</button>
                    <button className="px-3 py-2 rounded bg-red-600 hover:bg-red-700" onClick={deleteTrack}>Delete</button>
                    <button className="px-3 py-2 rounded bg-[#2A243E] hover:bg-[#3a3456]" onClick={generateTwelveWeeks}>Generate 12 Weeks</button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Modules */}
          <div className="bg-[#1B1628] rounded-2xl border border-[#2A243E] p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Modules</h2>
              {selectedTrack && (
                <button className="px-2 py-1 rounded bg-[#686DCA] hover:bg-[#5a5fb8] text-sm" onClick={() => { setSelectedModule(null); setModuleForm({ weekNumber: '', title: '', introduction: '', content: '', proTip: '' }); }}>New</button>
              )}
            </div>
            <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1 mb-4">
              {!selectedTrack ? (
                <div className="text-gray-400">Select a track</div>
              ) : orderedModules.length === 0 ? (
                <div className="text-gray-400">No modules yet.</div>
              ) : (
                orderedModules.map(m => (
                  <button key={m.id} onClick={() => handleSelectModule(m)} className={`w-full text-left px-3 py-2 rounded border ${selectedModule?.id === m.id ? 'border-[#EF8E81] bg-[#2A243E]' : 'border-[#2A243E] hover:bg-[#2A243E]/50'}`}>
                    <div className="font-medium">Week {m.week_number || m.weekNumber}: {m.title}</div>
                    {m.subtitle && <div className="text-xs text-gray-400">{m.subtitle}</div>}
                  </button>
                ))
              )}
            </div>

            {/* Module Form */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Week #</label>
                  <input value={moduleForm.weekNumber} onChange={e => setModuleForm({ ...moduleForm, weekNumber: e.target.value })} className="w-full px-3 py-2 rounded bg-[#141127] border border-[#2A243E]" placeholder="1" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Title</label>
                  <input value={moduleForm.title} onChange={e => setModuleForm({ ...moduleForm, title: e.target.value })} className="w-full px-3 py-2 rounded bg-[#141127] border border-[#2A243E]" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Week Introduction</label>
                <input value={moduleForm.introduction} onChange={e => setModuleForm({ ...moduleForm, introduction: e.target.value })} className="w-full px-3 py-2 rounded bg-[#141127] border border-[#2A243E]" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Content (markdown)</label>
                <textarea value={moduleForm.content} onChange={e => setModuleForm({ ...moduleForm, content: e.target.value })} className="w-full h-32 px-3 py-2 rounded bg-[#141127] border border-[#2A243E]" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Pro Tip</label>
                <textarea value={moduleForm.proTip} onChange={e => setModuleForm({ ...moduleForm, proTip: e.target.value })} className="w-full h-20 px-3 py-2 rounded bg-[#141127] border border-[#2A243E]" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Quick Tasks (one per line: Title: Description | 30min)</label>
                <textarea value={bulkTasksText} onChange={e => setBulkTasksText(e.target.value)} className="w-full h-24 px-3 py-2 rounded bg-[#141127] border border-[#2A243E]" placeholder="Measure baseline: Followers, likes, comments | 20-30min\nProfile audit: Bio, pic, links | 20-30min" />
                <div className="mt-2">
                  <button className="px-3 py-2 rounded bg-[#2A243E] hover:bg-[#3a3456] text-sm" onClick={replaceTasksFromList} disabled={!selectedModule}>Replace Tasks From List</button>
                </div>
              </div>
              <div className="flex gap-2">
                {!selectedModule ? (
                  <button className="flex-1 px-3 py-2 rounded bg-[#686DCA] hover:bg-[#5a5fb8]" onClick={createModule} disabled={!selectedTrack}>Create Module</button>
                ) : (
                  <>
                    <button className="flex-1 px-3 py-2 rounded bg-[#686DCA] hover:bg-[#5a5fb8]" onClick={updateModule}>Save</button>
                    <button className="px-3 py-2 rounded bg-red-600 hover:bg-red-700" onClick={deleteModule}>Delete</button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="bg-[#1B1628] rounded-2xl border border-[#2A243E] p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Tasks</h2>
              {selectedModule && (
                <button className="px-2 py-1 rounded bg-[#686DCA] hover:bg-[#5a5fb8] text-sm" onClick={() => { setSelectedTask(null); setTaskForm({ title: '', description: '', estimatedTime: '', orderIndex: '' }); }}>New</button>
              )}
            </div>
            <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1 mb-4">
              {!selectedModule ? (
                <div className="text-gray-400">Select a module</div>
              ) : tasks.length === 0 ? (
                <div className="text-gray-400">No tasks yet.</div>
              ) : (
                tasks.map(t => (
                  <button key={t.id} onClick={() => handleSelectTask(t)} className={`w-full text-left px-3 py-2 rounded border ${selectedTask?.id === t.id ? 'border-[#EF8E81] bg-[#2A243E]' : 'border-[#2A243E] hover:bg-[#2A243E]/50'}`}>
                    <div className="font-medium">{t.title}</div>
                    {t.description && <div className="text-sm text-gray-400">{t.description}</div>}
                    <div className="text-xs text-gray-500 mt-1">{t.estimated_time || t.estimatedTime}</div>
                  </button>
                ))
              )}
            </div>

            {/* Task Form */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} className="w-full px-3 py-2 rounded bg-[#141127] border border-[#2A243E]" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} className="w-full h-20 px-3 py-2 rounded bg-[#141127] border border-[#2A243E]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Estimated Time</label>
                  <input value={taskForm.estimatedTime} onChange={e => setTaskForm({ ...taskForm, estimatedTime: e.target.value })} className="w-full px-3 py-2 rounded bg-[#141127] border border-[#2A243E]" placeholder="30min" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Order</label>
                  <input value={taskForm.orderIndex} onChange={e => setTaskForm({ ...taskForm, orderIndex: e.target.value })} className="w-full px-3 py-2 rounded bg-[#141127] border border-[#2A243E]" placeholder="0" />
                </div>
              </div>
              <div className="flex gap-2">
                {!selectedTask ? (
                  <button className="flex-1 px-3 py-2 rounded bg-[#686DCA] hover:bg-[#5a5fb8]" onClick={createTask} disabled={!selectedModule}>Create Task</button>
                ) : (
                  <>
                    <button className="flex-1 px-3 py-2 rounded bg-[#686DCA] hover:bg-[#5a5fb8]" onClick={updateTask}>Save</button>
                    <button className="px-3 py-2 rounded bg-red-600 hover:bg-red-700" onClick={deleteTask}>Delete</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function safeParseJson(value: string): any | null {
  if (!value) return null;
  try { return JSON.parse(value); } catch { return null; }
}


