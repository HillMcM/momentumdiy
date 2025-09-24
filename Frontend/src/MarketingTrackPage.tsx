import { useEffect, useState } from 'react';
import { useMarketing } from './contexts/MarketingContext';
import { useNotificationHelpers } from './hooks/useNotificationHelpers';
import { MarketingTrackProvider } from './contexts/MarketingTrackContext';
import type { MarketingGoal, MarketingTask, Task } from './types';
import TaskModal from './components/marketingTrack/TaskModal';
import { getPublishedTracks, activateTrack } from './services/marketingService';
import { renderContentPreview, renderMarketingContent } from './utils/contentRenderer';
import { BACKEND_BASE_URL } from './services/api';

interface MarketingTrackPageProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
}

/**
 * MarketingTrackPage now dynamically renders any active marketing goal
 * using the universal track template that matches the production UI.
 */
export default function MarketingTrackPage({ tasks, onTasksChange }: MarketingTrackPageProps) {
  const { activeGoal, isLoading, refreshMarketingData, updateActiveGoal } = useMarketing();
  const { showTaskCompleted } = useNotificationHelpers();
  const [selectedTask, setSelectedTask] = useState<MarketingTask | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [publishedTracks, setPublishedTracks] = useState<MarketingGoal[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [activatingTrack, setActivatingTrack] = useState<string | null>(null);
  const [showTrackSelection, setShowTrackSelection] = useState(true); // Always show selection first

  // Sync marketing task completion with task tracker
  const syncWithTaskTracker = async (marketingTaskId: string, isCompleted: boolean) => {
    try {
      // Find the corresponding task in the task tracker
      const correspondingTask = tasks.find(task => 
        task.marketingTrack?.marketingTaskId === marketingTaskId
      );

      if (correspondingTask) {
        // Update the task status in the task tracker
        const newStatus = isCompleted ? 'completed' as const : 'todo' as const;
        const updatedTasks = tasks.map(task => 
          task.id === correspondingTask.id 
            ? { ...task, status: newStatus }
            : task
        );
        
        onTasksChange(updatedTasks);
        
        // Note: We don't need to update the main task via API for marketing track tasks
        // since they only exist in the marketing_tasks table, not the main tasks table
        
        console.log(`✅ Synced marketing task ${marketingTaskId} with task tracker task ${correspondingTask.id}`);
      }
    } catch (error) {
      console.error('Error syncing with task tracker:', error);
    }
  };

  // Handle task completion
  const handleTaskToggle = async (taskToUpdate: MarketingTask) => {
    if (!activeGoal) return;

    try {
      // Update task completion status via API
      const response = await fetch(`${BACKEND_BASE_URL}/api/marketing/tasks/${taskToUpdate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isCompleted: !taskToUpdate.isCompleted
        })
      });

      if (response.ok) {
        // Update the local state immediately for better UX
        const updatedGoal = {
          ...activeGoal,
          modules: activeGoal.modules.map(module => ({
            ...module,
            tasks: module.tasks.map(task => 
              task.id === taskToUpdate.id 
                ? { ...task, isCompleted: !task.isCompleted }
                : task
            )
          }))
        };

        // Calculate updated progress
        const allTasks = updatedGoal.modules.flatMap(m => m.tasks);
        const completedTasks = allTasks.filter(t => t.isCompleted).length;
        const totalTasks = allTasks.length;
        const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        updatedGoal.progress = overallProgress;

        // Update the active goal in context
        updateActiveGoal(updatedGoal);
        
        // Sync with task tracker
        await syncWithTaskTracker(taskToUpdate.id, !taskToUpdate.isCompleted);
        
        // Show notification
        showTaskCompleted(taskToUpdate.title);
      } else {
        console.error('Failed to update task:', await response.text());
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
    
    // Close modal
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  };

  const handleTaskClick = (task: MarketingTask) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  // Load published tracks when no active goal exists
  const loadPublishedTracks = async () => {
    setLoadingTracks(true);
    try {
      const response = await getPublishedTracks();
      if (response.success) {
        setPublishedTracks(response.data || []);
      } else {
        console.error('Failed to load published tracks:', response.error);
      }
    } catch (error) {
      console.error('Error loading published tracks:', error);
    } finally {
      setLoadingTracks(false);
    }
  };

  // Handle track activation
  const handleActivateTrack = async (trackId: string) => {
    setActivatingTrack(trackId);
    try {
      const response = await activateTrack(trackId);
      if (response.success) {
        // Refresh marketing data to load the newly activated track
        await refreshMarketingData();
        // Hide track selection after successful activation
        setShowTrackSelection(false);
    } else {
        console.error('Failed to activate track:', response.error);
        // You might want to show a user-friendly error message here
      }
    } catch (error) {
      console.error('Error activating track:', error);
    } finally {
      setActivatingTrack(null);
    }
  };

  // Load published tracks for selection only when no active goal or track is completed
  useEffect(() => {
    if (!isLoading && (!activeGoal || (activeGoal.progress ?? 0) >= 100)) {
      loadPublishedTracks();
    }
  }, [isLoading, activeGoal]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent text-white p-6" style={{ background: 'transparent !important' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#EF8E81] mb-4"></div>
            <p className="text-gray-400">Loading your marketing track...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!activeGoal || (showTrackSelection && (activeGoal.progress ?? 0) >= 100)) {
  return (
    <div className="min-h-screen bg-transparent text-white p-6" style={{ background: 'transparent !important' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
            <div className="bg-[#1B1628] rounded-2xl border border-[#2A243E] p-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                {(activeGoal?.progress ?? 0) >= 100 ? 'Choose Your Next Marketing Track' : 'Choose Your Marketing Track'}
              </h2>
              <p className="text-gray-400 mb-8">
                {(activeGoal?.progress ?? 0) >= 100 
                  ? 'Congratulations on completing your track! Select a new marketing track to continue your journey.'
                  : 'Select a marketing track to start your journey. Once you choose a track, you\'ll be committed to completing it over 12 weeks. Each track is designed to help you achieve specific business goals.'
                }
              </p>

              {loadingTracks ? (
                <div className="flex items-center justify-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#EF8E81] mb-4"></div>
                  <p className="text-gray-400 ml-4">Loading available tracks...</p>
                </div>
              ) : publishedTracks.length === 0 ? (
                <div className="bg-[#EF8E81]/10 border border-[#EF8E81]/20 rounded-lg p-6">
                  <p className="text-[#EF8E81] text-sm">
                    📋 No marketing tracks are currently available. Check back later or contact support.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {publishedTracks.map((track) => {
                    const isCurrentlyActive = activeGoal && activeGoal.id === track.id;
                    return (
                      <div 
                        key={track.id}
                        className={`bg-[#141127] border rounded-xl p-6 text-left transition-colors ${
                          isCurrentlyActive 
                            ? 'border-[#EF8E81] shadow-lg shadow-[#EF8E81]/10' 
                            : 'border-[#2A243E] hover:border-[#EF8E81]/30'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-semibold text-white">{track.title}</h3>
                          {isCurrentlyActive && (
                            <div className="bg-green-500/20 text-green-300 border border-green-500/30 rounded-full px-2 py-1 text-xs font-medium">
                              Active
                            </div>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                          {track.description}
                        </p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm text-gray-500">
                            {track.duration || 12} weeks
                          </span>
                          <span className="text-sm text-gray-500">
                            {track.modules?.length || 0} modules
                          </span>
                        </div>

                        {isCurrentlyActive ? (
                          <button
                            onClick={() => setShowTrackSelection(false)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                          >
                            Continue Track
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivateTrack(track.id)}
                            disabled={activatingTrack === track.id}
                            className="w-full bg-gradient-to-r from-[#EF8E81] to-[#D4AF37] text-white font-semibold py-2 px-4 rounded-lg hover:from-[#EF8E81]/90 hover:to-[#D4AF37]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {activatingTrack === track.id ? (
                              <div className="flex items-center justify-center">
                                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Activating...
                              </div>
                            ) : (
                              'Start This Track'
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render the marketing track using the same UI as production
  return (
    <MarketingTrackProvider activeGoal={activeGoal}>
      <div className="min-h-screen bg-transparent text-white p-6" style={{ background: 'transparent !important' }}>
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="bg-[#1B1628] rounded-2xl border border-[#2A243E] p-8 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{activeGoal.title}</h1>
                <p className="text-gray-400">Active Track</p>
              </div>

              <div className="flex gap-3">
                {activeGoal.isActive && (
                  <div className="bg-green-500/20 text-green-300 border border-green-500/30 rounded-full px-3 py-1 text-sm font-medium">
                    Active • Week {activeGoal.currentWeek} of {activeGoal.duration}
                  </div>
                )}
                {(activeGoal.progress ?? 0) >= 100 && (
                  <div className="bg-[#EF8E81]/20 text-[#EF8E81] border border-[#EF8E81]/30 rounded-full px-3 py-1 text-sm font-medium">
                    Track Completed! 🎉
                  </div>
                )}
              </div>
            </div>

            {/* Intro paragraph */}
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              {activeGoal.description}
            </p>

            {/* Completion message */}
            {(activeGoal.progress ?? 0) >= 100 && (
              <div className="bg-gradient-to-r from-[#EF8E81]/10 to-[#D4AF37]/10 rounded-xl p-6 border border-[#EF8E81]/20 mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#EF8E81] flex items-center justify-center">
                    <span className="text-white text-lg">🎉</span>
                  </div>
                  <h3 className="text-xl font-semibold text-[#EF8E81]">Congratulations!</h3>
                </div>
                <p className="text-gray-300">
                  You've successfully completed this marketing track! You can now choose a new track to continue your marketing journey.
                </p>
                <button
                  onClick={() => setShowTrackSelection(true)}
                  className="mt-4 bg-gradient-to-r from-[#EF8E81] to-[#D4AF37] text-white font-semibold py-2 px-4 rounded-lg hover:from-[#EF8E81]/90 hover:to-[#D4AF37]/90 transition-colors"
                >
                  Choose Next Track
                </button>
              </div>
            )}

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

            {/* Phase block - Dynamic based on current week */}
            <div className="mt-8 pt-6 border-t border-[#2A243E]">
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ 
                    backgroundColor: activeGoal.currentPhase?.color || '#EF8E81' 
                  }}
                >
                  <span className="text-white text-sm font-bold">
                    {activeGoal.currentPhase?.id || '1'}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {activeGoal.currentPhase?.title || 'Phase 1: Spark Traffic'}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {activeGoal.currentPhase?.description || 'Get people in the door immediately'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Modules */}
          <div className="space-y-6">
            {activeGoal.modules.map((module) => {
              const completedTasks = module.tasks.filter(task => task.isCompleted).length;
              const totalTasks = module.tasks.length;
              const moduleProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
              const isCurrentWeek = module.weekNumber === activeGoal.currentWeek;
              const isUnlocked = module.isUnlocked || module.weekNumber <= activeGoal.currentWeek;

              return (
                <div 
                  key={module.id}
                  className={`bg-[#1B1628] rounded-2xl border transition-all duration-200 ${
                    isCurrentWeek 
                      ? 'border-[#EF8E81] shadow-lg shadow-[#EF8E81]/10' 
                      : 'border-[#2A243E]'
                  }`}
                >
                  {/* Module Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCurrentWeek 
                            ? 'bg-[#EF8E81]' 
                            : isUnlocked 
                              ? 'bg-[#2A243E]' 
                              : 'bg-gray-600'
                        }`}>
                          <span className="text-white text-sm font-bold">{module.weekNumber}</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">{module.title}</h3>
                          {module.description && (
                            <p className="text-gray-400 text-sm">{module.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">
                        {completedTasks}/{totalTasks} tasks
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-300">Week Progress</span>
                        <span className="text-sm font-medium text-[#EF8E81]">{Math.round(moduleProgress)}%</span>
                      </div>
                      <div className="w-full bg-[#2A243E] rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#EF8E81] to-[#D4AF37] transition-all duration-300 ease-out"
                          style={{ width: `${moduleProgress}%` }}
                        />
                      </div>
                    </div>

                    {/* Module Content - Full display for current week */}
                    {isUnlocked && module.content && (
                      <div className="max-w-none">
                        {isCurrentWeek ? (
                          <div className="space-y-6">
                            {/* Weekly Lesson */}
                            <div className="bg-[#141127] rounded-xl p-6 border border-[#2A243E]">
                              <h4 className="text-lg font-semibold text-white mb-4">Weekly Lesson</h4>
                              <div className="space-y-4">
                                {renderMarketingContent(module.content)}
                              </div>
                            </div>
                            
                            {/* Pro Tip */}
                            {(() => {
                              console.log('🎯 MarketingTrackPage - Module data:', module);
                              console.log('🎯 MarketingTrackPage - Pro tip value:', module.proTip);
                              console.log('🎯 MarketingTrackPage - Pro tip exists:', !!module.proTip);
                              return module.proTip && (
                                <div className="bg-gradient-to-r from-[#EF8E81]/10 to-[#D4AF37]/10 rounded-xl p-6 border border-[#EF8E81]/20">
                                  <h5 className="text-lg font-semibold text-[#EF8E81] mb-3 flex items-center gap-2">
                                    <span>💡</span> Pro Tip
                                  </h5>
                                  <div className="text-gray-300 leading-relaxed">
                                    {renderMarketingContent(module.proTip)}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">
                            {renderContentPreview(module.content, 2)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Tasks */}
                  {isUnlocked && module.tasks.length > 0 && (
                    <div className="px-6 pb-6">
                      <div className="pt-4 border-t border-[#2A243E]">
                        <h4 className="text-sm font-medium text-gray-300 mb-3">Tasks for this week:</h4>
                        <div className="space-y-3">
                          {module.tasks.map((task) => (
                            <div 
                              key={task.id}
                              className={`flex items-center gap-3 p-4 rounded-lg transition-colors ${
                                task.isCompleted 
                                  ? 'bg-green-500/10 border border-green-500/20' 
                                  : 'bg-[#141127] border border-[#2A243E] hover:border-[#EF8E81]/30'
                              }`}
                            >
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTaskToggle(task);
                                }}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
                                  task.isCompleted 
                                    ? 'bg-green-500 border-green-500' 
                                    : 'border-[#2A243E] hover:border-[#EF8E81]'
                                }`}
                              >
                                {task.isCompleted && (
                                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              <div 
                                className="flex-1 cursor-pointer"
                                onClick={() => handleTaskClick(task)}
                              >
                                <span className={`text-base font-medium ${
                                  task.isCompleted ? 'text-green-300 line-through' : 'text-white'
                                }`}>
                                  {task.title}
                                </span>
                                {task.estimatedTime && (
                                  <span className="text-gray-400 ml-2 text-sm">({task.estimatedTime})</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Locked State */}
                  {!isUnlocked && (
                    <div className="p-6">
                      <div className="text-center py-8 text-gray-500">
                        <div className="w-12 h-12 mx-auto mb-3 bg-gray-600 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="text-sm">This week will unlock automatically</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
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
          onToggle={(_taskId, _isCompleted) => {
            const task = selectedTask;
            if (task) {
              handleTaskToggle(task);
            }
          }}
        />
      )}
    </MarketingTrackProvider>
  );
}