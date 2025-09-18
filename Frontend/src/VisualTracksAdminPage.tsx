import { useState, useEffect, useMemo } from 'react';
import { adminApi } from './services/adminApi';

// Types for the visual admin interface
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
  const [tasks, setTasks] = useState<{ [moduleId: string]: TrackTask[] }>({});
  const [publishedGoals, setPublishedGoals] = useState<PublishedGoal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<'view' | 'edit' | 'create'>('view');

  // Editing states
  const [editingTrack, setEditingTrack] = useState<Partial<TrackDefinition>>({});
  const [editingModules, setEditingModules] = useState<{ [weekNumber: number]: Partial<TrackModule> }>({});
  const [editingTasks, setEditingTasks] = useState<{ [moduleId: string]: Partial<TrackTask>[] }>({});

  // Computed
  const orderedModules = useMemo(() => {
    return [...modules].sort((a, b) => a.week_number - b.week_number);
  }, [modules]);

  // Load data
  useEffect(() => {
    loadTracks();
    loadPublishedGoals();
  }, []);

  useEffect(() => {
    if (selectedTrack) {
      loadModules(selectedTrack.id);
      setEditingTrack(selectedTrack);
    }
  }, [selectedTrack]);

  useEffect(() => {
    // Load tasks for all modules
    const loadAllTasks = async () => {
      const tasksByModule: { [moduleId: string]: TrackTask[] } = {};
      for (const module of modules) {
        const response = await adminApi.listTrackTasks(module.id);
        if (response.success) {
          tasksByModule[module.id] = response.data || [];
        }
      }
      setTasks(tasksByModule);
    };

    if (modules.length > 0) {
      loadAllTasks();
    }
  }, [modules]);

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
        // Initialize editing state for modules
        const editingState: { [weekNumber: number]: Partial<TrackModule> } = {};
        (response.data || []).forEach((module: TrackModule) => {
          editingState[module.week_number] = { ...module };
        });
        setEditingModules(editingState);
      } else {
        showMessage(response.error || 'Failed to load modules', true);
      }
    } catch (error) {
      showMessage('Failed to load modules', true);
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

  // Track operations
  const handleCreateNewTrack = () => {
    setEditMode('create');
    setSelectedTrack(null);
    setModules([]);
    setTasks({});
    setEditingTrack({
      slug: '',
      title: '',
      description: '',
      industry_tags: [],
      duration_weeks: 12
    });
    
    // Create 12 empty modules for editing
    const emptyModules: { [weekNumber: number]: Partial<TrackModule> } = {};
    for (let i = 1; i <= 12; i++) {
      emptyModules[i] = {
        week_number: i,
        title: `Week ${i}`,
        description: '',
        content: '',
        is_unlocked: i === 1,
        is_completed: false
      };
    }
    setEditingModules(emptyModules);
  };

  const handleSaveTrack = async () => {
    if (!editingTrack.slug || !editingTrack.title || !editingTrack.description) {
      showMessage('Please fill in all required fields (slug, title, description)', true);
      return;
    }

    try {
      let trackResponse;
      
      if (editMode === 'create') {
        // Create new track
        trackResponse = await adminApi.createTrackDefinition(editingTrack);
      } else {
        // Update existing track
        trackResponse = await adminApi.updateTrackDefinition(selectedTrack!.id, editingTrack);
      }

      if (!trackResponse.success) {
        showMessage(trackResponse.error || 'Failed to save track', true);
        return;
      }

      const trackId = trackResponse.data.id;

      // Generate modules if creating new track
      if (editMode === 'create') {
        const generateResponse = await adminApi.generateTrackModules(trackId);
        if (!generateResponse.success) {
          showMessage('Track created but failed to generate modules', true);
          return;
        }
      }

      // Save all module content
      for (const weekNumber of Object.keys(editingModules)) {
        const moduleData = editingModules[parseInt(weekNumber)];
        if (moduleData && moduleData.id) {
          await adminApi.updateTrackModule(moduleData.id, moduleData);
        }
      }

      showMessage('Track saved successfully!');
      await loadTracks();
      setEditMode('view');
      
      // Select the saved track
      if (editMode === 'create') {
        const newTrack = tracks.find(t => t.id === trackId);
        if (newTrack) setSelectedTrack(newTrack);
      }
    } catch (error) {
      showMessage('Failed to save track', true);
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

  const handleActivateGoal = async (goalId: string) => {
    try {
      const response = await adminApi.activateGoal(goalId);
      if (response.success) {
        showMessage('Goal activated successfully!');
        await loadPublishedGoals();
      } else {
        showMessage(response.error || 'Failed to activate goal', true);
      }
    } catch (error) {
      showMessage('Failed to activate goal', true);
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
              <h1 className="text-3xl font-bold text-white mb-2">Marketing Tracks Admin</h1>
              <p className="text-gray-400">Create and manage marketing track content</p>
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
                    onClick={() => setEditMode(editMode === 'edit' ? 'view' : 'edit')}
                    className="bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full px-4 py-2 text-sm font-medium hover:bg-blue-500/30"
                  >
                    {editMode === 'edit' ? 'Cancel Edit' : 'Edit Track'}
                  </button>
                  <button
                    onClick={handlePublishTrack}
                    className="bg-green-500/20 text-green-300 border border-green-500/30 rounded-full px-4 py-2 text-sm font-medium hover:bg-green-500/30"
                  >
                    Publish Track
                  </button>
                </>
              )}
              {(editMode === 'edit' || editMode === 'create') && (
                <button
                  onClick={handleSaveTrack}
                  className="bg-green-600 text-white border border-green-600 rounded-full px-4 py-2 text-sm font-medium hover:bg-green-700"
                >
                  Save Changes
                </button>
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
                  setSelectedTrack(track || null);
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

          {/* Track Title and Description */}
          {(selectedTrack || editMode === 'create') && (
            <>
              {editMode === 'edit' || editMode === 'create' ? (
                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Track Slug:</label>
                    <input
                      value={editingTrack.slug || ''}
                      onChange={(e) => setEditingTrack({ ...editingTrack, slug: e.target.value })}
                      className="w-full px-3 py-2 rounded bg-[#141127] border border-[#2A243E] text-white"
                      placeholder="social-media-strategy"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Track Title:</label>
                    <input
                      value={editingTrack.title || ''}
                      onChange={(e) => setEditingTrack({ ...editingTrack, title: e.target.value })}
                      className="w-full px-3 py-2 rounded bg-[#141127] border border-[#2A243E] text-white text-2xl font-bold"
                      placeholder="Improve Social Media Strategy & Engagement"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Track Description:</label>
                    <textarea
                      value={editingTrack.description || ''}
                      onChange={(e) => setEditingTrack({ ...editingTrack, description: e.target.value })}
                      className="w-full h-24 px-3 py-2 rounded bg-[#141127] border border-[#2A243E] text-white text-lg"
                      placeholder="Transform your social media presence with our comprehensive 12-week strategy..."
                    />
                  </div>
                </div>
              ) : (
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-white mb-4">{selectedTrack?.title}</h1>
                  <p className="text-gray-300 text-lg leading-relaxed">{selectedTrack?.description}</p>
                </div>
              )}

              {/* Progress Bar (Static in Admin) */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">Track Progress (Preview)</span>
                  <span className="text-sm font-medium text-[#EF8E81]">0%</span>
                </div>
                <div className="w-full bg-[#2A243E] rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#EF8E81] to-[#D4AF37] transition-all duration-300 ease-out"
                    style={{ width: '0%' }}
                  />
                </div>
              </div>

              {/* Phase Section */}
              <div className="pt-6 border-t border-[#2A243E] mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#EF8E81] flex items-center justify-center">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Foundation Phase</h2>
                    <p className="text-gray-400 text-sm">Weeks 1-4: Building your strategy foundation</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Weekly Modules */}
        {(selectedTrack || editMode === 'create') && (
          <div className="space-y-6">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((weekNumber) => {
              const module = editingModules[weekNumber];
              const moduleTasks = module?.id ? tasks[module.id] || [] : [];
              
              return (
                <div key={weekNumber} className="bg-[#1B1628] rounded-2xl border border-[#2A243E] p-6">
                  {/* Week Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#2A243E] flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{weekNumber}</span>
                      </div>
                      {editMode === 'edit' || editMode === 'create' ? (
                        <input
                          value={module?.title || ''}
                          onChange={(e) => setEditingModules({
                            ...editingModules,
                            [weekNumber]: { ...module, title: e.target.value }
                          })}
                          className="text-xl font-semibold bg-transparent border-b border-[#2A243E] text-white px-2 py-1 focus:border-[#EF8E81] outline-none"
                          placeholder={`Week ${weekNumber} Title`}
                        />
                      ) : (
                        <h3 className="text-xl font-semibold text-white">
                          {module?.title || `Week ${weekNumber}`}
                        </h3>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      {moduleTasks.length} tasks
                    </div>
                  </div>

                  {/* Week Content */}
                  {editMode === 'edit' || editMode === 'create' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Week Description:</label>
                        <input
                          value={module?.description || ''}
                          onChange={(e) => setEditingModules({
                            ...editingModules,
                            [weekNumber]: { ...module, description: e.target.value }
                          })}
                          className="w-full px-3 py-2 rounded bg-[#141127] border border-[#2A243E] text-white"
                          placeholder="Brief description of this week"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Week Content (Markdown):</label>
                        <textarea
                          value={module?.content || ''}
                          onChange={(e) => setEditingModules({
                            ...editingModules,
                            [weekNumber]: { ...module, content: e.target.value }
                          })}
                          className="w-full h-32 px-3 py-2 rounded bg-[#141127] border border-[#2A243E] text-white font-mono text-sm"
                          placeholder="# Week content in markdown format..."
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-300">
                      <p className="mb-4">{module?.description}</p>
                      <div className="bg-[#141127] rounded-lg p-4 font-mono text-sm">
                        {module?.content || 'No content added yet'}
                      </div>
                    </div>
                  )}

                  {/* Tasks Preview */}
                  {moduleTasks.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[#2A243E]">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Tasks:</h4>
                      <div className="space-y-2">
                        {moduleTasks.map((task) => (
                          <div key={task.id} className="flex items-center gap-3 text-sm">
                            <div className="w-4 h-4 rounded border border-[#2A243E]"></div>
                            <span className="text-gray-300">{task.title}</span>
                            <span className="text-gray-500 ml-auto">{task.estimated_time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Published Goals Section */}
        {publishedGoals.length > 0 && (
          <div className="mt-12 bg-[#1B1628] rounded-2xl border border-[#2A243E] p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Published Goals</h2>
            <div className="space-y-4">
              {publishedGoals.map((goal) => (
                <div key={goal.id} className="flex items-center justify-between p-4 bg-[#141127] rounded-lg border border-[#2A243E]">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{goal.title}</h3>
                    <p className="text-gray-400 text-sm">{goal.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {goal.is_active ? (
                      <div className="bg-green-500/20 text-green-300 border border-green-500/30 rounded-full px-3 py-1 text-sm font-medium">
                        Active
                      </div>
                    ) : (
                      <button
                        onClick={() => handleActivateGoal(goal.id)}
                        className="bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full px-3 py-1 text-sm font-medium hover:bg-blue-500/30"
                      >
                        Activate
                      </button>
                    )}
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
