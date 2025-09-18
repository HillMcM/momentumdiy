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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSelectTrack = async (track: Track) => {
    setSelectedTrack(track);
    setSelectedModule(null);
    setTasks([]);
    const res = await api.adminListModules(track.id);
    if (res.success) setModules(res.data || []);
  };

  const handleSelectModule = async (mod: Module) => {
    setSelectedModule(mod);
    const res = await api.adminListTasks(mod.id);
    if (res.success) setTasks(res.data || []);
  };

  const handleCreateTrack = async () => {
    const slug = prompt('Enter track slug (e.g., social-media-strategy)');
    const title = prompt('Enter track title');
    if (!slug || !title) return;
    const res = await api.adminCreateTrack({ slug, title });
    if (res.success && res.data) setTracks([res.data, ...tracks]);
  };

  const handleCreateModule = async () => {
    if (!selectedTrack) return;
    const weekNumber = Number(prompt('Week number')); if (!weekNumber) return;
    const title = prompt('Week title') || '';
    const subtitle = prompt('Week subtitle') || '';
    const res = await api.adminCreateModule(selectedTrack.id, { weekNumber, title, subtitle });
    if (res.success && res.data) setModules([...modules, res.data]);
  };

  const handleCreateTask = async () => {
    if (!selectedModule) return;
    const title = prompt('Task title') || '';
    const description = prompt('Task description') || '';
    const estimatedTime = prompt('Estimated time (e.g., 30min)') || '';
    const res = await api.adminCreateTask(selectedModule.id, { title, description, estimatedTime, orderIndex: tasks.length });
    if (res.success && res.data) setTasks([...tasks, res.data]);
  };

  const handlePublish = async () => {
    if (!selectedTrack) return;
    const goalTitle = prompt('Goal title to publish as (e.g., Improve Social Media Strategy & Engagement)') || selectedTrack.title;
    const res = await api.adminPublishTrack(selectedTrack.id, { goalTitle, description: selectedTrack.description, duration: 12 });
    if (res.success) alert(`Published. Goal ID: ${res.data?.goalId}`);
    else alert(res.error || 'Publish failed');
  };

  return (
    <div className="min-h-screen bg-transparent text-white p-6" style={{ background: 'transparent !important' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Marketing Track Admin</h1>
          <div className="flex gap-3">
            <button className="px-3 py-2 rounded bg-[#686DCA] hover:bg-[#5a5fb8]" onClick={handleCreateTrack}>New Track</button>
            {selectedTrack && (
              <button className="px-3 py-2 rounded bg-[#EF8E81] hover:bg-[#d77e70]" onClick={handlePublish}>Publish Track</button>
            )}
          </div>
        </div>

        {error && <div className="mb-4 text-red-400">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tracks */}
          <div className="bg-[#1B1628] rounded-2xl border border-[#2A243E] p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Tracks</h2>
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
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
          </div>

          {/* Modules */}
          <div className="bg-[#1B1628] rounded-2xl border border-[#2A243E] p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Modules</h2>
              {selectedTrack && (
                <button className="px-2 py-1 rounded bg-[#686DCA] hover:bg-[#5a5fb8] text-sm" onClick={handleCreateModule}>New</button>
              )}
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
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
          </div>

          {/* Tasks */}
          <div className="bg-[#1B1628] rounded-2xl border border-[#2A243E] p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Tasks</h2>
              {selectedModule && (
                <button className="px-2 py-1 rounded bg-[#686DCA] hover:bg-[#5a5fb8] text-sm" onClick={handleCreateTask}>New</button>
              )}
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {!selectedModule ? (
                <div className="text-gray-400">Select a module</div>
              ) : tasks.length === 0 ? (
                <div className="text-gray-400">No tasks yet.</div>
              ) : (
                tasks.map(t => (
                  <div key={t.id} className="px-3 py-2 rounded border border-[#2A243E]">
                    <div className="font-medium">{t.title}</div>
                    {t.description && <div className="text-sm text-gray-400">{t.description}</div>}
                    {t.estimated_time && <div className="text-xs text-gray-500 mt-1">{t.estimated_time}</div>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


