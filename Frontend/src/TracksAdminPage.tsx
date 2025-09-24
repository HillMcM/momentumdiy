import { useState, useEffect, useMemo } from 'react';
import { adminApi } from './services/adminApi';

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
  const [editingMode, setEditingMode] = useState<'track' | 'module' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Forms
  const [trackForm, setTrackForm] = useState({
    slug: '',
    title: '',
    description: '',
    industry_tags: '',
    duration_weeks: 12
  });

  const [moduleForm, setModuleForm] = useState({
    week_number: 1,
    title: '',
    description: '',
    content: '',
    pro_tip: ''
  });

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    estimated_time: '30min',
    order_index: 0
  });

  const [bulkTasksText, setBulkTasksText] = useState('');

  // Computed
  const orderedModules = useMemo((): TrackModule[] => {
    return [...(modules || [])].sort((a, b) => a.week_number - b.week_number);
  }, [modules]);

  const orderedTasks = useMemo(() => {
    return [...(tasks || [])].sort((a, b) => a.order_index - b.order_index);
  }, [tasks]);

  // Load tracks on mount
  useEffect(() => {
    loadTracks();
  }, []);

  // Load modules when track selected
  useEffect(() => {
    if (selectedTrack) {
      loadModules(selectedTrack.id);
      setSelectedModule(null);
      setTasks([]);
    }
  }, [selectedTrack]);

  // Load tasks when module selected
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

  // Track operations
  const handleCreateTrack = async () => {
    try {
      const trackData = {
        ...trackForm,
        industry_tags: trackForm.industry_tags.split(',').map(t => t.trim()).filter(Boolean)
      };
      
      const response = await adminApi.createTrackDefinition(trackData);
      if (response.success) {
        showMessage('Track created successfully');
        await loadTracks();
        setTrackForm({
          slug: '',
          title: '',
          description: '',
          industry_tags: '',
          duration_weeks: 12
        });
      } else {
        showMessage(response.error || 'Failed to create track', true);
      }
    } catch (error) {
      showMessage('Failed to create track', true);
    }
  };

  const handleUpdateTrack = async () => {
    if (!selectedTrack) return;
    
    try {
      const trackData = {
        ...trackForm,
        industry_tags: trackForm.industry_tags.split(',').map(t => t.trim()).filter(Boolean)
      };
      
      const response = await adminApi.updateTrackDefinition(selectedTrack.id, trackData);
      if (response.success) {
        showMessage('Track updated successfully');
        await loadTracks();
        setSelectedTrack(response.data);
      } else {
        showMessage(response.error || 'Failed to update track', true);
      }
    } catch (error) {
      showMessage('Failed to update track', true);
    }
  };

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
  const handleCreateModule = async () => {
    if (!selectedTrack) return;
    
    try {
      const response = await adminApi.createTrackModule(selectedTrack.id, moduleForm);
      if (response.success) {
        showMessage('Module created successfully');
        await loadModules(selectedTrack.id);
        setModuleForm({
          week_number: 1,
          title: '',
          description: '',
          content: '',
          pro_tip: ''
        });
      } else {
        showMessage(response.error || 'Failed to create module', true);
      }
    } catch (error) {
      showMessage('Failed to create module', true);
    }
  };

  const handleUpdateModule = async () => {
    if (!selectedModule) return;
    
    console.log('🔧 Selected module object:', selectedModule);
    console.log('🔧 Updating module ID:', selectedModule.id);
    console.log('🔧 Module form data:', moduleForm);
    
    try {
      const response = await adminApi.updateTrackModule(selectedModule.id, moduleForm);
      console.log('🔧 API response:', response);
      
      if (response.success) {
        showMessage('Module updated successfully');
        await loadModules(selectedModule.goal_id);
        setSelectedModule(response.data);
      } else {
        console.error('🔧 API error:', response.error);
        showMessage(response.error || 'Failed to update module', true);
      }
    } catch (error) {
      console.error('🔧 Network error:', error);
      showMessage('Failed to update module', true);
    }
  };

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

  // Task operations
  const handleCreateTask = async () => {
    if (!selectedModule) return;
    
    try {
      const response = await adminApi.createTrackTask(selectedModule.id, taskForm);
      if (response.success) {
        showMessage('Task created successfully');
        await loadTasks(selectedModule.id);
        setTaskForm({
          title: '',
          description: '',
          estimated_time: '30min',
          order_index: 0
        });
      } else {
        showMessage(response.error || 'Failed to create task', true);
      }
    } catch (error) {
      showMessage('Failed to create task', true);
    }
  };

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

  const handleCreateBulkTasks = async () => {
    if (!selectedModule || !bulkTasksText.trim()) return;
    
    try {
      const response = await adminApi.createBulkTasks(selectedModule.id, bulkTasksText);
      if (response.success) {
        const created = (response.data as any)?.created || 0;
        showMessage(`Created ${created} tasks`);
        await loadTasks(selectedModule.id);
        setBulkTasksText('');
      } else {
        showMessage(response.error || 'Failed to create tasks', true);
      }
    } catch (error) {
      showMessage('Failed to create tasks', true);
    }
  };

  // Event handlers
  const handleTrackSelect = (track: TrackDefinition) => {
    setSelectedTrack(track);
    setSelectedModule(null);
    setEditingMode(null);
    setTrackForm({
      slug: track.slug,
      title: track.title,
      description: track.description,
      industry_tags: track.industry_tags?.join(', ') || '',
      duration_weeks: track.duration_weeks
    });
  };

  const handleModuleSelect = (module: TrackModule) => {
    console.log('🔧 Module selected:', module);
    console.log('🔧 Module ID:', module.id);
    console.log('🔧 Module goal_id:', module.goal_id);
    console.log('🔧 Setting selectedModule to:', module);
    setSelectedModule(module);
    setEditingMode('module');
    console.log('🔧 Setting moduleForm with data:', {
      week_number: module.week_number,
      title: module.title,
      description: module.description || '',
      content: module.content,
      pro_tip: module.pro_tip || ''
    });
    setModuleForm({
      week_number: module.week_number,
      title: module.title,
      description: module.description || '',
      content: module.content,
      pro_tip: module.pro_tip || ''
    });
  };

  const handleEditTrack = () => {
    setEditingMode('track');
    setSelectedModule(null);
  };

  const handleEditModule = (module: TrackModule) => {
    setSelectedModule(module);
    setEditingMode('module');
    setModuleForm({
      week_number: module.week_number,
      title: module.title,
      description: module.description || '',
      content: module.content,
      pro_tip: module.pro_tip || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingMode(null);
    setSelectedModule(null);
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

        {/* Three-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Tracks */}
          <div className="bg-[#1B1628] rounded-2xl border border-[#2A243E] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Tracks</h2>
              <button 
                onClick={handleCreateTrack}
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

            {/* Track Form - Only show when in track editing mode */}
            {editingMode === 'track' && (
              <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Slug</label>
                <input
                  value={trackForm.slug}
                  onChange={e => setTrackForm({ ...trackForm, slug: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#141127] border border-[#2A243E] text-white text-sm"
                  placeholder="social-media-strategy"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input
                  value={trackForm.title}
                  onChange={e => setTrackForm({ ...trackForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#141127] border border-[#2A243E] text-white text-sm"
                  placeholder="Improve Social Media Strategy"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea
                  value={trackForm.description}
                  onChange={e => setTrackForm({ ...trackForm, description: e.target.value })}
                  className="w-full h-20 px-3 py-2 rounded bg-[#141127] border border-[#2A243E] text-white text-sm"
                  placeholder="Track introduction..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Industry Tags (comma-separated)</label>
                <input
                  value={trackForm.industry_tags}
                  onChange={e => setTrackForm({ ...trackForm, industry_tags: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-[#141127] border border-[#2A243E] text-white text-sm"
                  placeholder="Social Media, Marketing, etc."
                />
              </div>
              <div className="flex gap-2">
                {selectedTrack ? (
                  <>
                    <button
                      onClick={handleUpdateTrack}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Update Track
                    </button>
                    <button
                      onClick={handleDeleteTrack}
                      className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Delete
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleCreateTrack}
                    className="w-full px-3 py-2 bg-[#EF8E81] text-white rounded text-sm hover:bg-[#EF8E81]/80"
                  >
                    Create Track
                  </button>
                )}
              </div>
              {selectedTrack && (
                <div className="space-y-2">
                  <button
                    onClick={handleGenerateModules}
                    className="w-full px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Generate 12 Weeks
                  </button>
                  <button
                    onClick={handlePublishTrack}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Publish Track
                  </button>
                </div>
              )}
              </div>
            )}
          </div>

          {/* Column 2: Modules */}
          <div className="bg-[#1B1628] rounded-2xl border border-[#2A243E] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">
                {editingMode === 'module' ? `Editing Module: Week ${selectedModule?.week_number}` : `Modules ${selectedTrack && `(${selectedTrack.title})`}`}
              </h2>
              <div className="flex gap-2">
                {selectedTrack && editingMode !== 'module' && (
                  <button
                    onClick={handleEditTrack}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                  >
                    Edit Track
                  </button>
                )}
                {editingMode === 'module' && (
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                )}
                {selectedTrack && editingMode !== 'module' && (
                  <button
                    onClick={handleCreateModule}
                    className="px-3 py-1 bg-[#EF8E81] text-white rounded-lg text-sm hover:bg-[#EF8E81]/80"
                  >
                    Create Module
                  </button>
                )}
              </div>
            </div>

            {/* Module List - Only show when not editing a module */}
            {editingMode !== 'module' && (
              <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                {orderedModules.map((module) => (
                  <div
                    key={module.id}
                    className="p-3 rounded-lg border bg-[#141127] border-[#2A243E] hover:border-[#EF8E81]/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-white text-sm">Week {module.week_number}: {module.title}</h3>
                        <p className="text-xs text-gray-400">{module.content.substring(0, 60)}...</p>
                      </div>
                      <button
                        onClick={() => handleEditModule(module)}
                        className="ml-3 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Module Form - Only show when in module editing mode */}
            {editingMode === 'module' && selectedModule && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Week #</label>
                    <input
                      type="number"
                      value={moduleForm.week_number}
                      onChange={e => setModuleForm({ ...moduleForm, week_number: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 rounded bg-[#141127] border border-[#2A243E] text-white text-sm"
                      min="1"
                      max="12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Title</label>
                    <input
                      value={moduleForm.title}
                      onChange={e => setModuleForm({ ...moduleForm, title: e.target.value })}
                      className="w-full px-3 py-2 rounded bg-[#141127] border border-[#2A243E] text-white text-sm"
                      placeholder="Week title"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Content (Markdown)</label>
                  <textarea
                    value={moduleForm.content}
                    onChange={e => setModuleForm({ ...moduleForm, content: e.target.value })}
                    className="w-full h-40 px-3 py-2 rounded bg-[#141127] border border-[#2A243E] text-white font-mono text-sm"
                    placeholder="# Week Title

## Key Topics
- Important point 1
- Important point 2

**Bold** for emphasis, *italic* for subtle emphasis
Use blank lines between paragraphs for better readability."
                  />
                  <div className="mt-1 text-xs text-gray-400">
                    💡 Use markdown: # headers, - lists, **bold**, *italic*, `code`, &gt; quotes
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Pro Tip (Optional)</label>
                  <textarea
                    value={moduleForm.pro_tip}
                    onChange={e => setModuleForm({ ...moduleForm, pro_tip: e.target.value })}
                    className="w-full h-24 px-3 py-2 rounded bg-[#141127] border border-[#2A243E] text-white font-mono text-sm"
                    placeholder="💡 Pro tip content here...

This will appear as a special highlighted section in the user interface."
                  />
                  <div className="mt-1 text-xs text-gray-400">
                    💡 Optional pro tip that will be highlighted in the user interface
                  </div>
                </div>
                <div className="flex gap-2">
                  {selectedModule ? (
                    <>
                      <button
                        onClick={handleUpdateModule}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Update Module
                      </button>
                      <button
                        onClick={handleDeleteModule}
                        className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        Delete
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleCreateModule}
                      className="w-full px-3 py-2 bg-[#EF8E81] text-white rounded text-sm hover:bg-[#EF8E81]/80"
                    >
                      Create Module
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Column 3: Tasks */}
          <div className="bg-[#1B1628] rounded-2xl border border-[#2A243E] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">
                Tasks {selectedModule && `(Week ${selectedModule.week_number})`}
              </h2>
              {selectedModule && (
                <button
                  onClick={handleCreateTask}
                  className="px-3 py-1 bg-[#EF8E81] text-white rounded-lg text-sm hover:bg-[#EF8E81]/80"
                >
                  Create
                </button>
              )}
            </div>

            {/* Task List */}
            <div className="space-y-2 mb-6 max-h-40 overflow-y-auto">
              {orderedTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-lg border bg-[#141127] border-[#2A243E]"
                >
                  <h3 className="font-medium text-white text-sm">{task.title}</h3>
                  <p className="text-xs text-gray-400">{task.estimated_time}</p>
                </div>
              ))}
            </div>

            {/* Bulk Tasks */}
            {selectedModule && (
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-1">Quick Tasks (one per line)</label>
                <textarea
                  value={bulkTasksText}
                  onChange={e => setBulkTasksText(e.target.value)}
                  className="w-full h-20 px-3 py-2 rounded bg-[#141127] border border-[#2A243E] text-white text-sm"
                  placeholder={`Complete social media audit\nRecord baseline metrics\nCreate content calendar`}
                />
                <button
                  onClick={handleCreateBulkTasks}
                  className="w-full mt-2 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Create Bulk Tasks
                </button>
              </div>
            )}

            {/* Task Form */}
            {selectedModule && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Title</label>
                  <input
                    value={taskForm.title}
                    onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-[#141127] border border-[#2A243E] text-white text-sm"
                    placeholder="Task title"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <textarea
                    value={taskForm.description}
                    onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                    className="w-full h-20 px-3 py-2 rounded bg-[#141127] border border-[#2A243E] text-white text-sm"
                    placeholder="Task description..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Estimated Time</label>
                  <input
                    value={taskForm.estimated_time}
                    onChange={e => setTaskForm({ ...taskForm, estimated_time: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-[#141127] border border-[#2A243E] text-white text-sm"
                    placeholder="30min"
                  />
                </div>
                <button
                  onClick={handleCreateTask}
                  className="w-full px-3 py-2 bg-[#EF8E81] text-white rounded text-sm hover:bg-[#EF8E81]/80"
                >
                  Create Task
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}