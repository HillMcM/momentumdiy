import { useState, useEffect, useMemo } from 'react';
import { adminApi } from './services/adminApi';
import TrackEditor from './components/TrackEditor';
import ModuleEditor from './components/ModuleEditor';

// Simple types for admin interface
interface TrackDefinition {
  id: string;
  slug: string;
  title: string;
  description: string;
  industry_tags?: string[];
  duration_weeks: number;
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

export default function TracksAdminPage() {
  // State
  const [tracks, setTracks] = useState<TrackDefinition[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<TrackDefinition | null>(null);
  const [modules, setModules] = useState<TrackModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<TrackModule | null>(null);
  const [tasks, setTasks] = useState<TrackTask[]>([]);
  const [editingMode, setEditingMode] = useState<'track' | 'module' | 'create-track' | 'create-module' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // New event handlers for separate editors
  const handleTrackSaved = async (savedTrack: TrackDefinition) => {
    showMessage('Track saved successfully');
    setEditingMode(null);
    await loadTracks();
    setSelectedTrack(savedTrack);
    await loadModules(savedTrack.id);
  };

  const handleModuleSaved = async (savedModule: TrackModule) => {
    showMessage('Module saved successfully');
    setEditingMode(null);
    setSelectedModule(savedModule);
    await loadModules(savedModule.goal_id);
  };

  const handleCreateNewTrack = () => {
    setEditingMode('create-track');
    setSelectedTrack(null);
    setModules([]);
    setTasks([]);
  };

  const handleCreateNewModule = () => {
    if (!selectedTrack) return;
    setEditingMode('create-module');
    setSelectedModule(null);
  };

  const handleEditTrack = () => {
    setEditingMode('track');
    setSelectedModule(null);
  };

  const handleEditModule = (module: TrackModule) => {
    setSelectedModule(module);
    setEditingMode('module');
  };

  const handleCancelEdit = () => {
    setEditingMode(null);
    setSelectedModule(null);
  };

  // Computed
  const orderedModules = useMemo((): TrackModule[] => {
    return [...(modules || [])].sort((a, b) => a.week_number - b.week_number);
  }, [modules]);

  const orderedTasks = useMemo(() => {
    return [...(tasks || [])].sort((a, b) => a.order_index - b.order_index);
  }, [tasks]);

  // Load tracks on mount
  useEffect(() => {
    const init = async () => {
      await loadTracks();
    };
    init();
  }, []);

  // Load modules when track selected
  useEffect(() => {
    if (selectedTrack) {
      const init = async () => {
        await loadModules(selectedTrack.id);
      };
      init();
      setSelectedModule(null);
      setTasks([]);
    }
  }, [selectedTrack]);

  // Load tasks when module selected
  useEffect(() => {
    if (selectedModule) {
      const init = async () => {
        await loadTasks(selectedModule.id);
      };
      init();
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

  // Track operations
  const handleDeleteTrack = async () => {
    if (!selectedTrack || !confirm('Are you sure you want to delete this track?')) return;
    
    try {
      const response = await adminApi.deleteTrackDefinition(selectedTrack.id);
      if (response.success) {
        showMessage('Track deleted successfully');
        await loadTracks();
        setSelectedTrack(null);
        setModules([]);
        setTasks([]);
      } else {
        showMessage(response.error || 'Failed to delete track', true);
      }
    } catch (error) {
      showMessage('Failed to delete track', true);
    }
  };

  // Module operations
  const handleDeleteModule = async () => {
    if (!selectedModule || !confirm('Are you sure you want to delete this module?')) return;
    
    try {
      const response = await adminApi.deleteTrackModule(selectedModule.id);
      if (response.success) {
        showMessage('Module deleted successfully');
        await loadModules(selectedModule.goal_id);
        setSelectedModule(null);
        setTasks([]);
      } else {
        showMessage(response.error || 'Failed to delete module', true);
      }
    } catch (error) {
      showMessage('Failed to delete module', true);
    }
  };

  // Task operations (now handled by ModuleEditor)

  // Bulk operations
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
    
    if (!confirm(`Publish "${selectedTrack.title}" to live system? This will make it available to users.`)) {
      return;
    }
    
    try {
      const response = await adminApi.publishTrack(selectedTrack.id);
      if (response.success) {
        const data = response.data as any;
        showMessage(`Published track successfully! Created ${data?.modulesPublished || 0} modules and ${data?.tasksPublished || 0} tasks.`);
      } else {
        showMessage(response.error || 'Failed to publish track', true);
      }
    } catch (error) {
      showMessage('Failed to publish track', true);
    }
  };

  // Event handlers
  const handleTrackSelect = (track: TrackDefinition) => {
    setSelectedTrack(track);
    setSelectedModule(null);
    setEditingMode(null);
  };

  const handleModuleSelect = (module: TrackModule) => {
    setSelectedModule(module);
    setEditingMode(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#EF8E81] mb-4"></div>
            <p className="text-gray-400">Loading admin panel...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Marketing Tracks Admin</h1>
          <p className="text-gray-400">Create and manage marketing track content</p>
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

        {/* Show editors when in editing mode */}
        {(editingMode === 'track' || editingMode === 'create-track') && (
          <TrackEditor
            track={editingMode === 'track' ? selectedTrack : null}
            onSave={handleTrackSaved}
            onCancel={handleCancelEdit}
            isCreating={editingMode === 'create-track'}
          />
        )}

        {(editingMode === 'module' || editingMode === 'create-module') && (
          <ModuleEditor
            module={editingMode === 'module' ? selectedModule : null}
            trackId={selectedTrack?.id || ''}
            onSave={handleModuleSaved}
            onCancel={handleCancelEdit}
            isCreating={editingMode === 'create-module'}
          />
        )}

        {/* Show main interface when not editing */}
        {!editingMode && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Column 1: Tracks */}
            <div className="bg-[#1B1628] rounded-2xl border border-[#2A243E] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Tracks</h2>
                <button 
                  onClick={handleCreateNewTrack}
                  className="px-3 py-1 bg-[#EF8E81] text-white rounded-lg text-sm hover:bg-[#EF8E81]/80"
                >
                  Create
                </button>
              </div>

              {/* Track List */}
              <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                {tracks.map((track) => (
                  <div
                    key={track.id}
                    onClick={() => handleTrackSelect(track)}
                    className={`p-3 rounded-lg cursor-pointer border ${
                      selectedTrack?.id === track.id
                        ? 'bg-[#EF8E81]/20 border-[#EF8E81]/30'
                        : 'bg-[#141127] border-[#2A243E] hover:border-[#EF8E81]/20'
                    }`}
                  >
                    <h3 className="font-medium text-white text-sm">{track.title}</h3>
                    <p className="text-xs text-gray-400">{track.slug}</p>
                  </div>
                ))}
              </div>

              {/* Track Actions */}
              {selectedTrack && (
                <div className="space-y-2">
                  <button
                    onClick={handleEditTrack}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Edit Track
                  </button>
                  <button
                    onClick={handleDeleteTrack}
                    className="w-full px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Delete Track
                  </button>
                  <button
                    onClick={handleGenerateModules}
                    className="w-full px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Generate 12 Weeks
                  </button>
                  <button
                    onClick={handlePublishTrack}
                    className="w-full px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                  >
                    Publish Track
                  </button>
                </div>
              )}
            </div>

            {/* Column 2: Modules */}
            <div className="bg-[#1B1628] rounded-2xl border border-[#2A243E] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  Modules {selectedTrack && `(${selectedTrack.title})`}
                </h2>
                {selectedTrack && (
                  <button
                    onClick={handleCreateNewModule}
                    className="px-3 py-1 bg-[#EF8E81] text-white rounded-lg text-sm hover:bg-[#EF8E81]/80"
                  >
                    Create Module
                  </button>
                )}
              </div>

              {/* Module List */}
              <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                {orderedModules.map((module) => (
                  <div
                    key={module.id}
                    onClick={() => handleModuleSelect(module)}
                    className={`p-3 rounded-lg cursor-pointer border ${
                      selectedModule?.id === module.id
                        ? 'bg-[#EF8E81]/20 border-[#EF8E81]/30'
                        : 'bg-[#141127] border-[#2A243E] hover:border-[#EF8E81]/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-white text-sm">Week {module.week_number}: {module.title}</h3>
                        <p className="text-xs text-gray-400">{module.content.substring(0, 60)}...</p>
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
              </div>

              {/* Module Actions */}
              {selectedModule && (
                <div className="space-y-2">
                  <button
                    onClick={() => handleEditModule(selectedModule)}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Edit Module
                  </button>
                  <button
                    onClick={handleDeleteModule}
                    className="w-full px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Delete Module
                  </button>
                </div>
              )}
            </div>

            {/* Column 3: Tasks */}
            <div className="bg-[#1B1628] rounded-2xl border border-[#2A243E] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  Tasks {selectedModule && `(Week ${selectedModule.week_number})`}
                </h2>
              </div>

              {/* Task List */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {orderedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-lg border bg-[#141127] border-[#2A243E]"
                  >
                    <h3 className="font-medium text-white text-sm">{task.title}</h3>
                    <p className="text-xs text-gray-400">{task.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{task.estimated_time}</p>
                  </div>
                ))}
                {orderedTasks.length === 0 && selectedModule && (
                  <p className="text-gray-500 text-sm italic">No tasks for this module. Edit the module to add tasks.</p>
                )}
                {!selectedModule && (
                  <p className="text-gray-500 text-sm italic">Select a module to view its tasks.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}