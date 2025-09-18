import { useEffect, useState, useMemo } from 'react';
import { useMarketing } from './contexts/MarketingContext';
import { useNotificationHelpers } from './hooks/useNotificationHelpers';
import { MarketingTrackProvider } from './contexts/MarketingTrackContext';
import type { MarketingGoal, MarketingModule, MarketingTask } from './types';
import TaskModal from './components/marketingTrack/TaskModal';

interface MarketingTrackPageProps {
  // Props removed - using context instead
}

/**
 * MarketingTrackPage now dynamically renders any active marketing goal
 * using the universal track template that matches the production UI.
 */
export default function MarketingTrackPage(_props: MarketingTrackPageProps) {
  const { activeGoal, isLoading, updateGoalProgress, updateMarketingGoals } = useMarketing();
  const { showTaskCompleted, showModuleCompleted } = useNotificationHelpers();
  const [selectedTask, setSelectedTask] = useState<MarketingTask | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Handle task completion
  const handleTaskToggle = async (taskToUpdate: MarketingTask) => {
    if (!activeGoal) return;

    const isCompleted = !taskToUpdate.isCompleted;
    
    // Update the task in the active goal
    const updatedGoal = {
      ...activeGoal,
      modules: activeGoal.modules.map(module => ({
        ...module,
        tasks: module.tasks.map(task => 
          task.id === taskToUpdate.id 
            ? { ...task, isCompleted }
            : task
        )
      }))
    };

    // Calculate new progress
    const totalTasks = updatedGoal.modules.reduce((sum, module) => sum + module.tasks.length, 0);
    const completedTasks = updatedGoal.modules.reduce((sum, module) => 
      sum + module.tasks.filter(task => task.isCompleted).length, 0
    );
    const newProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    updatedGoal.progress = newProgress;

    // Update context
    updateMarketingGoals([updatedGoal]);
    
    // Update database
    await updateGoalProgress(updatedGoal.id, newProgress);
    
    // Show notification
    showTaskCompleted(taskToUpdate.title);
    
    // Close modal
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  };

  const handleTaskClick = (task: MarketingTask) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

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

  if (!activeGoal) {
    return (
      <div className="min-h-screen bg-transparent text-white p-6" style={{ background: 'transparent !important' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="bg-[#1B1628] rounded-2xl border border-[#2A243E] p-8">
              <h2 className="text-2xl font-bold text-white mb-4">No Active Marketing Track</h2>
              <p className="text-gray-400 mb-6">
                You don't have an active marketing track yet. Contact your admin to activate a track for you.
              </p>
              <div className="bg-[#EF8E81]/10 border border-[#EF8E81]/20 rounded-lg p-4">
                <p className="text-[#EF8E81] text-sm">
                  💡 Tip: Marketing tracks are created and activated by administrators through the admin panel.
                </p>
              </div>
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
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#EF8E81] flex items-center justify-center">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Foundation Phase</h2>
                  <p className="text-gray-400 text-sm">Building your strategy foundation</p>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Modules */}
          <div className="space-y-6">
            {activeGoal.modules.map((module, index) => {
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

                    {/* Module Content */}
                    {isUnlocked && module.content && (
                      <div className="prose prose-invert max-w-none">
                        <div className="text-gray-300 text-sm leading-relaxed">
                          {module.content.split('\n').slice(0, 3).join('\n')}
                          {module.content.split('\n').length > 3 && '...'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tasks */}
                  {isUnlocked && module.tasks.length > 0 && (
                    <div className="px-6 pb-6">
                      <div className="pt-4 border-t border-[#2A243E]">
                        <h4 className="text-sm font-medium text-gray-300 mb-3">Tasks for this week:</h4>
                        <div className="space-y-2">
                          {module.tasks.map((task) => (
                            <div 
                              key={task.id}
                              onClick={() => handleTaskClick(task)}
                              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                task.isCompleted 
                                  ? 'bg-green-500/10 border border-green-500/20' 
                                  : 'bg-[#141127] border border-[#2A243E] hover:border-[#EF8E81]/30'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                task.isCompleted 
                                  ? 'bg-green-500 border-green-500' 
                                  : 'border-[#2A243E] hover:border-[#EF8E81]'
                              }`}>
                                {task.isCompleted && (
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              <div className="flex-1">
                                <span className={`text-sm font-medium ${
                                  task.isCompleted ? 'text-green-300 line-through' : 'text-white'
                                }`}>
                                  {task.title}
                                </span>
                                {task.estimatedTime && (
                                  <span className="text-gray-500 ml-2 text-xs">({task.estimatedTime})</span>
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
          onToggle={handleTaskToggle}
        />
      )}
    </MarketingTrackProvider>
  );
}