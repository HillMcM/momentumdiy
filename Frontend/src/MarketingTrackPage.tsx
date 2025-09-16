import { useState, useCallback } from 'react';
import { useMarketing } from './contexts/MarketingContext';
import { toggleMarketingTask, updateGoalProgress } from './services/marketingService';
import { calculateModuleProgress, computeNextUnlockLabel } from './utils/date';
import WeekAccordion from './components/marketingTrack/WeekAccordion';
import TaskModal from './components/marketingTrack/TaskModal';
import { useNotificationHelpers } from './hooks/useNotificationHelpers';
import type { MarketingTask } from './types';

interface MarketingTrackPageProps {
  // Props removed - using context instead
}

export default function MarketingTrackPage(_props: MarketingTrackPageProps) {
  const { activeGoal, currentModule, setActiveGoal, setCurrentModule, isLoading, error, refreshMarketingData, onTaskStatusChange } = useMarketing();
  const { showTaskCompleted, showModuleCompleted, showMarketingTrackProgress } = useNotificationHelpers();
  const [selectedTask, setSelectedTask] = useState<MarketingTask | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Handle task click to open modal
  const handleTaskClick = useCallback((task: MarketingTask) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  }, []);

  // Handle task toggle
  const handleTaskToggle = useCallback(async (taskId: string, isCompleted: boolean) => {
    if (!activeGoal || !currentModule) return;

    try {
      // Optimistic update
      const updatedModule = {
        ...currentModule,
        tasks: currentModule.tasks.map(task =>
          task.id === taskId ? { ...task, isCompleted } : task
        )
      };
      setCurrentModule(updatedModule);

      // Update the goal with the new module
      const updatedGoal = {
        ...activeGoal,
        modules: activeGoal.modules.map(mod =>
          mod.id === currentModule.id ? updatedModule : mod
        )
      };
      setActiveGoal(updatedGoal);

      // Calculate new progress based on current module
      const newProgress = calculateModuleProgress(updatedModule);

      // Update progress optimistically
      const optimisticGoal = { ...updatedGoal, progress: newProgress };
      setActiveGoal(optimisticGoal);

      // Persist to backend
      const taskResponse = await toggleMarketingTask(taskId, isCompleted);
      if (!taskResponse.success) {
        console.error('Failed to toggle task:', taskResponse.error);
        // Revert on error
        setActiveGoal(activeGoal);
        setCurrentModule(currentModule);
        return;
      }

      // Update goal progress
      const progressResponse = await updateGoalProgress(activeGoal.id, newProgress);
      if (!progressResponse.success) {
        console.error('Failed to update progress:', progressResponse.error);
      }

      // Refresh context data to keep widget in sync
      await refreshMarketingData();

      // Also sync with regular task tracker
      if (onTaskStatusChange) {
        onTaskStatusChange(taskId, isCompleted);
      }

      // Show encouraging notifications
      if (isCompleted) {
        const completedTask = updatedModule.tasks.find(t => t.id === taskId);
        if (completedTask) {
          showTaskCompleted(completedTask.title);
        }

        // Check if module is now complete
        const allTasksCompleted = updatedModule.tasks.every(task => task.isCompleted);
        if (allTasksCompleted) {
          showModuleCompleted(updatedModule.title, updatedModule.weekNumber);
        }

        // Show track progress
        const trackProgress = Math.round(newProgress);
        showMarketingTrackProgress(activeGoal.title, trackProgress);
      }

    } catch (err) {
      console.error('Error toggling task:', err);
      // Revert on error
      setActiveGoal(activeGoal);
      setCurrentModule(currentModule);
    }
  }, [activeGoal, currentModule, showTaskCompleted, showModuleCompleted, showMarketingTrackProgress]);





  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#141127] flex items-center justify-center">
        <div className="text-white">Loading marketing track...</div>
      </div>
    );
  }

  // Error state
  if (error || !activeGoal) {
    return (
      <div className="min-h-screen bg-[#141127] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Marketing Track</h1>
          <p className="text-gray-400">
            {error || 'No active marketing goal found. Please start a marketing track.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white p-6 marketing-track-page" style={{ background: 'transparent !important' }}>
      <div className="max-w-6xl mx-auto">
        {/* Page Header - Transparent Background */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Marketing Tracks</h1>
            <p className="text-gray-400 mt-1">Active Track</p>
          </div>
        </div>





        {/* Main Track Card */}
        <div className="bg-[#1B1628]/80 backdrop-blur-sm rounded-2xl border border-[#2A243E]/60 overflow-hidden">
          {/* Header Row */}
          <div className="p-8 border-b border-[#2A243E]/60">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{activeGoal.title}</h2>
              <div className="flex gap-3">
                {activeGoal.isActive && (
                  <div className="bg-green-500/20 text-green-300 border border-green-500/30 rounded-full px-3 py-1 text-sm font-medium">
                    Active • Week {activeGoal.currentWeek} of {activeGoal.duration}
                  </div>
                )}
                {activeGoal.currentWeek >= activeGoal.duration ? (
                  <div className="bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full px-3 py-1 text-sm font-medium">
                    Track Complete! 🎉
                  </div>
                ) : (
                  <div className="bg-[#EF8E81]/20 text-[#EF8E81] border border-[#EF8E81]/30 rounded-full px-3 py-1 text-sm font-medium">
                    {computeNextUnlockLabel(activeGoal)}
                  </div>
                )}
              </div>
            </div>

            {/* Intro Copy */}
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              {activeGoal.description || "This 12-week plan guides you through practical steps to get more people through your door. Each week has a focused theme with actionable tasks."}
            </p>

            {/* Overall Progress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">Overall Progress</span>
                <span className="text-sm font-medium text-[#EF8E81]">{activeGoal.progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-[#EF8E81] h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, activeGoal.progress))}%` }}
                />
              </div>
            </div>

            {/* Phase Block */}
            <div className="mt-8 pt-6 border-t border-[#2A243E]/60">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Phase 1: Spark Traffic</h3>
                  <p className="text-[#EF8E81] font-medium mb-3">Goal: Get people in the door immediately.</p>
                  <p className="text-gray-400 leading-relaxed text-sm">
                    Focus on quick wins and foundational marketing activities that create immediate visibility and drive initial foot traffic.
                    This phase emphasizes practical, actionable steps you can implement right away to start seeing results.
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* All Weeks Section */}
          <div className="border-t border-[#2A243E]">
            {activeGoal.modules.map((module) => (
              <WeekAccordion
                key={module.id}
                module={module}
                currentWeek={activeGoal.currentWeek}
                onTaskToggle={handleTaskToggle}
                onTaskClick={handleTaskClick}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        onToggle={handleTaskToggle}
      />
    </div>
  );
}
