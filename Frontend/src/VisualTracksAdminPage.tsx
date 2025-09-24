import { useState, useEffect } from 'react';
import { adminApi } from './services/adminApi';
import TrackEditor from './components/TrackEditor';
import ModuleEditor from './components/ModuleEditor';

// Types for the visual admin interface
interface TrackDefinition {
  id: string;
  slug: string;
  title: string;
  description: string;
  industry_tags?: string[];
  duration_weeks: number;
  phases?: any;
  created_at: string;
}

interface TrackModule {
  id: string;
  goal_id: string;
  week_number: number;
  title: string;
  description?: string;
  content: string;
  pro_tip?: string;
  is_unlocked: boolean;
  is_completed: boolean;
  created_at: string;
}

interface TrackTask {
  id: string;
  module_id: string;
  title: string;
  description: string;
  estimated_time: string;
  order_index: number;
  created_at: string;
}

interface PublishedGoal {
  id: string;
  title: string;
  description: string;
  industry: string;
  duration: number;
  is_active: boolean;
  start_date: string;
  current_week: number;
  progress: number;
  track_definition_id: string;
}

export default function VisualTracksAdminPage() {
  // State
  const [tracks, setTracks] = useState<TrackDefinition[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<TrackDefinition | null>(null);
  const [modules, setModules] = useState<TrackModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<TrackModule | null>(null);
  const [tasks, setTasks] = useState<TrackTask[]>([]);
  const [publishedGoals, setPublishedGoals] = useState<PublishedGoal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<'view' | 'track-edit' | 'track-create' | 'module-edit' | 'module-create'>('view');

  // Load data
  useEffect(() => {
    loadTracks();
    loadPublishedGoals();
  }, []);

  useEffect(() => {
    if (selectedTrack) {
      loadModules(selectedTrack.id);
      setSelectedModule(null);
      setTasks([]);
    }
  }, [selectedTrack]);

  useEffect(() => {
    if (selectedModule) {
      loadTasks(selectedModule.id);
    }
  }, [selectedModule]);

  // Utility functions
  const showMessage = (msg: string, isError = false) => {
    if (isError) {
      setError(msg);
      setSuccess(null);
    } else {
      setSuccess(msg);
      setError(null);
    }
    setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 3000);
  };

  // API functions
  const loadTracks = async () => {
    setLoading(true);
    try {
      const response = await adminApi.listTrackDefinitions();
      if (response.success) {
        setTracks(response.data || []);
      } else {
        showMessage(response.error || 'Failed to load tracks', true);
      }
    } catch (error) {
      showMessage('Failed to load tracks', true);
    } finally {
      setLoading(false);
    }
  };

  const loadModules = async (trackId: string) => {
    try {
      const response = await adminApi.listTrackModules(trackId);
      if (response.success) {
        setModules(response.data || []);
      } else {
        showMessage(response.error || 'Failed to load modules', true);
      }
    } catch (error) {
      showMessage('Failed to load modules', true);
    }
  };

  const loadTasks = async (moduleId: string) => {
    try {
      const response = await adminApi.listTrackTasks(moduleId);
      if (response.success) {
        setTasks(response.data || []);
      } else {
        showMessage(response.error || 'Failed to load tasks', true);
      }
    } catch (error) {
      showMessage('Failed to load tasks', true);
    }
  };

  const loadPublishedGoals = async () => {
    try {
      const response = await adminApi.listPublishedGoals();
      if (response.success) {
        setPublishedGoals(response.data || []);
      } else {
        showMessage(response.error || 'Failed to load published goals', true);
      }
    } catch (error) {
      showMessage('Failed to load published goals', true);
    }
  };

  // Event handlers
  const handleTrackSaved = async (savedTrack: TrackDefinition) => {
    showMessage('Track saved successfully');
    setEditMode('view');
    await loadTracks();
    setSelectedTrack(savedTrack);
    await loadModules(savedTrack.id);
  };

  const handleModuleSaved = async (savedModule: TrackModule) => {
    showMessage('Module saved successfully');
    setEditMode('view');
    setSelectedModule(savedModule);
    await loadModules(savedModule.goal_id);
  };

  const handleCreateNewTrack = () => {
    setEditMode('track-create');
    setSelectedTrack(null);
    setModules([]);
    setTasks([]);
  };

  const handleCreateNewModule = () => {
    if (!selectedTrack) return;
    setEditMode('module-create');
    setSelectedModule(null);
  };

  const handleEditTrack = () => {
    setEditMode('track-edit');
    setSelectedModule(null);
  };

  const handleEditModule = (module: TrackModule) => {
    setSelectedModule(module);
    setEditMode('module-edit');
  };

  const handleCancelEdit = () => {
    setEditMode('view');
    setSelectedModule(null);
  };

  const handleTrackSelect = (track: TrackDefinition) => {
    setSelectedTrack(track);
    setSelectedModule(null);
    setEditMode('view');
  };

  const handleModuleSelect = (module: TrackModule) => {
    setSelectedModule(module);
    setEditMode('view');
  };

  const handleGenerateModules = async () => {
    if (!selectedTrack) return;
    
    try {
      const response = await adminApi.generateTrackModules(selectedTrack.id);
      if (response.success) {
        const created = (response.data as any)?.created || 0;
        showMessage(`Generated ${created} modules`);
        await loadModules(selectedTrack.id);
      } else {
        showMessage(response.error || 'Failed to generate modules', true);
      }
    } catch (error) {
      showMessage('Failed to generate modules', true);
    }
  };

  const handlePublishTrack = async () => {
    if (!selectedTrack) return;
    
    if (!confirm(`Publish "${selectedTrack.title}" to live system?`)) return;
    
    try {
      const response = await adminApi.publishTrack(selectedTrack.id);
      if (response.success) {
        const data = response.data as any;
        showMessage(`Published successfully! Created ${data?.modulesPublished || 0} modules and ${data?.tasksPublished || 0} tasks.`);
        await loadPublishedGoals();
      } else {
        showMessage(response.error || 'Failed to publish track', true);
      }
    } catch (error) {
      showMessage('Failed to publish track', true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#EF8E81] mb-4"></div>
            <p className="text-gray-400">Loading marketing tracks...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-[#1B1628] rounded-2xl border border-[#2A243E] p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Visual Marketing Tracks Admin</h1>
              <p className="text-gray-400">Create and manage marketing track content with visual interface</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateNewTrack}
                className="bg-[#EF8E81] text-white border border-[#EF8E81] rounded-full px-4 py-2 text-sm font-medium hover:bg-[#EF8E81]/80"
              >
                Create New Track
              </button>
              {selectedTrack && (
                <>
                  <button
                    onClick={handleEditTrack}
                    className="bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full px-4 py-2 text-sm font-medium hover:bg-blue-500/30"
                  >
                    Edit Track
                  </button>
                  <button
                    onClick={handlePublishTrack}
                    className="bg-green-500/20 text-green-300 border border-green-500/30 rounded-full px-4 py-2 text-sm font-medium hover:bg-green-500/30"
                  >
                    Publish Track
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-300">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-6 bg-green-500/20 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-300">{success}</p>
            </div>
          )}

          {/* Track Selection */}
          {editMode === 'view' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Select Track to Edit:</label>
              <select
                value={selectedTrack?.id || ''}
                onChange={(e) => {
                  const track = tracks.find(t => t.id === e.target.value);
                  handleTrackSelect(track || null);
                }}
                className="w-full px-3 py-2 rounded bg-[#141127] border border-[#2A243E] text-white"
              >
                <option value="">Choose a track...</option>
                {tracks.map((track) => (
                  <option key={track.id} value={track.id}>
                    {track.title} ({track.slug})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Show editors when in editing mode */}
        {(editMode === 'track-edit' || editMode === 'track-create') && (
          <TrackEditor
            track={editMode === 'track-edit' ? selectedTrack : null}
            onSave={handleTrackSaved}
            onCancel={handleCancelEdit}
            isCreating={editMode === 'track-create'}
          />
        )}

        {(editMode === 'module-edit' || editMode === 'module-create') && (
          <ModuleEditor
            module={editMode === 'module-edit' ? selectedModule : null}
            trackId={selectedTrack?.id || ''}
            onSave={handleModuleSaved}
            onCancel={handleCancelEdit}
            isCreating={editMode === 'module-create'}
          />
        )}

        {/* Show main interface when not editing */}
        {editMode === 'view' && selectedTrack && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Track Overview */}
            <div className="bg-[#1B1628] rounded-2xl border border-[#2A243E] p-8">
              <h2 className="text-2xl font-bold text-white mb-4">{selectedTrack.title}</h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">{selectedTrack.description}</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Track Actions:</label>
                  <div className="space-y-2">
                    <button
                      onClick={handleEditTrack}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Edit Track Details
                    </button>
                    <button
                      onClick={handleGenerateModules}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Generate 12 Weeks
                    </button>
                    <button
                      onClick={handlePublishTrack}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Publish Track
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modules Overview */}
            <div className="bg-[#1B1628] rounded-2xl border border-[#2A243E] p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Modules ({modules.length})</h3>
                <button
                  onClick={handleCreateNewModule}
                  className="px-3 py-1 bg-[#EF8E81] text-white rounded-lg text-sm hover:bg-[#EF8E81]/80"
                >
                  Create Module
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {modules.map((module) => (
                  <div
                    key={module.id}
                    onClick={() => handleModuleSelect(module)}
                    className={`p-4 rounded-lg cursor-pointer border ${
                      selectedModule?.id === module.id
                        ? 'bg-[#EF8E81]/20 border-[#EF8E81]/30'
                        : 'bg-[#141127] border-[#2A243E] hover:border-[#EF8E81]/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-white">Week {module.week_number}: {module.title}</h4>
                        <p className="text-xs text-gray-400 mt-1">{module.content.substring(0, 80)}...</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditModule(module);
                        }}
                        className="ml-3 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
                {modules.length === 0 && (
                  <p className="text-gray-500 text-sm italic text-center py-8">
                    No modules yet. Click "Generate 12 Weeks" or "Create Module" to get started.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Published Goals Section */}
        {publishedGoals.length > 0 && (
          <div className="mt-12 bg-[#1B1628] rounded-2xl border border-[#2A243E] p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Published Goals</h2>
            <p className="text-gray-400 text-sm mb-6">
              These tracks have been published and are available to users.
            </p>
            <div className="space-y-4">
              {publishedGoals.map((goal) => (
                <div key={goal.id} className="flex items-center justify-between p-4 bg-[#141127] rounded-lg border border-[#2A243E]">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{goal.title}</h3>
                    <p className="text-gray-400 text-sm">{goal.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500/20 text-green-300 border border-green-500/30 rounded-full px-3 py-1 text-sm font-medium">
                      Published
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}