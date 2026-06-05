import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MarketingGoal, MarketingTask } from '../types';
import { useNotificationHelpers } from '../hooks/useNotificationHelpers';
import { useErrorHandler } from '../hooks/useErrorHandler';
import TaskModal from './marketingTrack/TaskModal';
import ErrorDisplay from './ErrorDisplay';
import LoadingSpinner from './LoadingSpinner';
import LoadingSkeleton from './LoadingSkeleton';

interface UniversalTrackRendererProps {
  trackSlug: string;
  marketingGoals: MarketingGoal[];
  onMarketingGoalsChange: (goals: MarketingGoal[]) => void;
  tracksApi: any; // Will be injected
}

export default function UniversalTrackRenderer({ 
  trackSlug, 
  marketingGoals, 
  onMarketingGoalsChange,
  tracksApi 
}: UniversalTrackRendererProps) {
  const navigate = useNavigate();
  const { showTaskCompleted, showModuleCompleted } = useNotificationHelpers();
  const [selectedTask, setSelectedTask] = useState<MarketingTask | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [trackData, setTrackData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useErrorHandler();

  // Load track data from new API
  useEffect(() => {
    const loadTrack = async () => {
      setLoading(true);
      try {
        const response = await tracksApi.getTrack(trackSlug);
        if (response.success) {
          setTrackData(response.data);
          setError(null);
        } else {
          const errorMessage = response.error || 'Failed to load track';
          setError(errorMessage);
          handleError(new Error(errorMessage), {
            showNotification: false, // ErrorDisplay will show it
            notificationTitle: 'Failed to Load Track',
            context: { trackSlug }
          });
        }
      } catch (err) {
        const errorMessage = 'Failed to load track';
        setError(errorMessage);
        handleError(err, {
          showNotification: false, // ErrorDisplay will show it
          notificationTitle: 'Failed to Load Track',
          context: { trackSlug }
        });
      } finally {
        setLoading(false);
      }
    };

    loadTrack();
  }, [trackSlug, tracksApi]);

  // Find existing marketing goal for this track (for backward compatibility)
  const existingGoal = marketingGoals.find(g => 
    g.title.toLowerCase().includes(trackSlug.replace('-', ' ')) ||
    (trackData && g.title === trackData.title)
  );

  // Create a unified goal object from either source
  const activeGoal: MarketingGoal | null = trackData ? {
    id: existingGoal?.id || `track-${trackData.id}`,
    title: trackData.title,
    description: trackData.description,
    industry: trackData.industry || 'General',
    duration: trackData.duration,
    modules: trackData.modules.map((module: any) => ({
      id: module.id,
      weekNumber: module.weekNumber,
      title: module.title,
      subtitle: module.subtitle,
      introduction: module.introduction,
      content: module.content,
      proTip: module.proTip,
      tasks: module.tasks || [],
      isUnlocked: true, // For now, unlock all modules
      isCompleted: false
    })),
    isActive: existingGoal?.isActive || false,
    currentWeek: existingGoal?.currentWeek || 1,
    progress: existingGoal?.progress || 0,
    startDate: existingGoal?.startDate,
    weekStartDates: existingGoal?.weekStartDates,
    lastWeekAdvancement: existingGoal?.lastWeekAdvancement
  } : null;

  // Handle task click to open modal
  const handleTaskClick = useCallback((task: MarketingTask) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  }, []);

  // Handle task toggle
  const handleTaskToggle = useCallback(async (task: MarketingTask) => {
    if (!activeGoal) return;

    const newCompletionState = !task.isCompleted;
    
    // Update the task in the goal
    const updatedGoal = {
      ...activeGoal,
      modules: activeGoal.modules.map(module => {
        if (module.tasks.some(t => t.id === task.id)) {
          const updatedTasks = module.tasks.map(t => 
            t.id === task.id ? { ...t, isCompleted: newCompletionState } : t
          );
          
          // Check if module is now complete
          const moduleCompleted = updatedTasks.every(t => t.isCompleted);
          
          return {
            ...module,
            tasks: updatedTasks,
            isCompleted: moduleCompleted
          };
        }
        return module;
      })
    };

    // Calculate overall progress
    const totalTasks = updatedGoal.modules.reduce((sum, m) => sum + m.tasks.length, 0);
    const completedTasks = updatedGoal.modules.reduce((sum, m) => 
      sum + m.tasks.filter(t => t.isCompleted).length, 0);
    updatedGoal.progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Update goals array
    const updatedGoals = existingGoal 
      ? marketingGoals.map(g => g.id === existingGoal.id ? updatedGoal : g)
      : [...marketingGoals, updatedGoal];

    onMarketingGoalsChange(updatedGoals);

    // Show notification
    if (newCompletionState) {
      showTaskCompleted(task.title);
      
      // Check if module was just completed
      const updatedModule = updatedGoal.modules.find(m => 
        m.tasks.some(t => t.id === task.id)
      );
      if (updatedModule?.isCompleted) {
        showModuleCompleted(updatedModule.title, updatedModule.weekNumber);
      }
    }

    // Close modal
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  }, [activeGoal, existingGoal, marketingGoals, onMarketingGoalsChange, showTaskCompleted, showModuleCompleted]);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent text-white p-6" style={{ background: 'transparent !important' }}>
        <div className="max-w-6xl mx-auto">
          <LoadingSkeleton lines={5} showTitle className="mb-6" />
          <LoadingSkeleton lines={3} className="mb-6" />
          <LoadingSkeleton lines={4} />
        </div>
      </div>
    );
  }

  if (error || !trackData) {
    return (
      <ErrorDisplay
        error={error || 'Track not found'}
        title="Track Not Found"
        backLabel="Back to Dashboard"
        onRetry={async () => {
          setError(null);
          setLoading(true);
          try {
            const response = await tracksApi.getTrackBySlug(trackSlug);
            if (response.success && response.data) {
              setTrackData(response.data);
            } else {
              setError(response.error || 'Failed to load track');
            }
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load track';
            setError(errorMessage);
            handleError(new Error(errorMessage), {
              showNotification: false,
            });
          } finally {
            setLoading(false);
          }
        }}
      />
    );
  }

  if (!activeGoal) {
    return (
      <ErrorDisplay
        error="Track data loaded but not active"
        title="Track Not Active"
        backLabel="Back to Dashboard"
        action={{
          label: 'Go to Marketing Tracks',
          onClick: () => navigate('/app/marketing-track')
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white p-6" style={{ background: 'transparent !important' }}>
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="bg-[#1B1628] rounded-2xl border border-[#2A243E] p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{activeGoal.title}</h1>
              <p className="text-gray-400">Marketing Track</p>
            </div>

            <div className="flex gap-3">
              {activeGoal.isActive && (
                <div className="bg-green-500/20 text-green-300 border border-green-500/30 rounded-full px-3 py-1 text-sm font-medium">
                  Active • Week {activeGoal.currentWeek} of {activeGoal.duration}
                </div>
              )}
            </div>
          </div>

          {/* Intro paragraph */}
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            {activeGoal.description}
          </p>

          {/* Overall Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Overall Progress</span>
              <span className="text-sm font-medium text-[#EF8E81]">{Math.round(activeGoal.progress)}%</span>
            </div>
            <div className="w-full bg-[#2A243E] rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#EF8E81] to-[#D4AF37] transition-all duration-300 ease-out"
                style={{ width: `${Math.round(activeGoal.progress)}%` }}
              />
            </div>
          </div>

          {/* Phase block */}
          <div className="mt-8 pt-6 border-t border-[#2A243E]">
            <h3 className="text-xl font-semibold text-white mb-3">
              {trackData.phases?.[0]?.title || 'Phase 1: Foundation & Strategy'}
            </h3>
            <p className="text-gray-400 leading-relaxed">
              {trackData.phases?.[0]?.description || 'Build a strong foundation with strategic planning, content creation, and audience engagement.'}
            </p>
          </div>
        </div>

        {/* Weekly Modules */}
        <div className="space-y-6">
          {activeGoal.modules
            .filter(module => module.weekNumber <= (activeGoal.currentWeek || 1))
            .map((module) => (
            <div key={module.id} className="bg-[#1B1628] rounded-2xl border border-[#2A243E] p-8">
              
              {/* Module Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Week {module.weekNumber}: {module.title}
                  </h2>
                  {module.subtitle && (
                    <p className="text-gray-400">{module.subtitle}</p>
                  )}
                </div>
                
                {module.isCompleted && (
                  <div className="bg-green-500/20 text-green-300 border border-green-500/30 rounded-full px-3 py-1 text-sm font-medium">
                    Completed
                  </div>
                )}
              </div>

              {/* Module Introduction */}
              {module.introduction && (
                <div className="mb-6 p-4 bg-[#2A243E]/30 rounded-lg border-l-4 border-[#EF8E81]">
                  <p className="text-gray-300 leading-relaxed">{module.introduction}</p>
                </div>
              )}

              {/* Module Content */}
              <div className="mb-8">
                <div className="prose prose-invert max-w-none text-gray-300">
                  <div dangerouslySetInnerHTML={{ 
                    __html: module.content.replace(/\n/g, '<br>') 
                  }} />
                </div>
              </div>

              {/* Tasks */}
              {module.tasks && module.tasks.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">This Week's Tasks</h3>
                  <div className="grid gap-3">
                    {module.tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleTaskClick(task)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          task.isCompleted
                            ? 'bg-green-500/10 border-green-500/30'
                            : 'bg-[#141127] border-[#2A243E] hover:border-[#EF8E81]/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className={`font-bold ${
                              task.isCompleted ? 'text-green-300 line-through' : 'text-white'
                            }`}>
                              {task.title}
                            </h4>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500">
                              {task.estimatedTime}
                            </span>
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              task.isCompleted
                                ? 'bg-green-500 border-green-500'
                                : 'border-gray-400 hover:border-[#EF8E81]'
                            }`}>
                              {task.isCompleted && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pro Tip */}
              {module.proTip && (
                <div className="p-4 bg-gradient-to-r from-[#EF8E81]/10 to-[#D4AF37]/10 rounded-lg border border-[#EF8E81]/20">
                  <h4 className="text-[#EF8E81] font-semibold mb-2">💡 Pro Tip</h4>
                  <p className="text-gray-300 leading-relaxed">{module.proTip}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Task Modal */}
        {selectedTask && (
          <TaskModal
            isOpen={isTaskModalOpen}
            onClose={() => {
              setIsTaskModalOpen(false);
              setSelectedTask(null);
            }}
            task={selectedTask}
            onToggle={() => handleTaskToggle(selectedTask)}
          />
        )}
      </div>
    </div>
  );
}
