import { useState, useCallback } from 'react';
import type { MarketingGoal, Project, Task, MarketingTask } from '../types';
import WeekAccordion from './marketingTrack/WeekAccordion';
import TaskModal from './marketingTrack/TaskModal';
import { toggleMarketingTask, updateGoalProgress } from '../services/marketingService';
import { calculateModuleProgress } from '../utils/date';
import { useNotificationHelpers } from '../hooks/useNotificationHelpers';
import { MarketingTrackProvider } from '../contexts/MarketingTrackContext';

interface UniversalTrackTemplateProps {
  marketingGoals: MarketingGoal[];
  onMarketingGoalsChange: (goals: MarketingGoal[]) => void;
  onProjectsChange: (projects: Project[]) => void;
  projects: Project[];
  tasks: Task[];
  trackSlug: string;
  trackConfig: {
    slug: string;
    title: string;
    description: string;
    buttonText: string;
    journeyName: string;
    generateTasks: (module: any, goal: any) => Task[];
  };
}

export default function UniversalTrackTemplate({ 
  marketingGoals, 
  onMarketingGoalsChange, 
  trackSlug,
  trackConfig
}: UniversalTrackTemplateProps) {
  const { showTaskCompleted, showModuleCompleted } = useNotificationHelpers();
  const [selectedTask, setSelectedTask] = useState<MarketingTask | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  
  // Find the active goal for this track
  const rawActiveGoal = marketingGoals.find(g => 
    g.title.toLowerCase().includes(trackSlug.replace('-', ' ')) ||
    g.title === trackConfig.title
  );

  // Generate tasks for modules that don't have them using the track config
  const activeGoal = rawActiveGoal ? {
    ...rawActiveGoal,
    modules: rawActiveGoal.modules.map(module => {
      // If module already has tasks, use them; otherwise generate from content
      if (module.tasks && module.tasks.length > 0) {
        return module;
      }
      
      // Generate tasks from content using track config
      const generatedTasks = trackConfig.generateTasks(module, rawActiveGoal);
      
      // Convert Task[] to MarketingTask[]
      const marketingTasks: MarketingTask[] = generatedTasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        shortDescription: task.description.length > 100 
          ? task.description.substring(0, 100) + '...' 
          : task.description,
        estimatedTime: task.timeSpent || '30min', // timeSpent temporarily holds estimated time
        isCompleted: false,
        taskId: task.id
      }));
      
      return {
        ...module,
        tasks: marketingTasks
      };
    })
  } : null;

  // Handle task click to open modal
  const handleTaskClick = useCallback((task: MarketingTask) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  }, []);

  // Handle task toggle
  const handleTaskToggle = useCallback(async (taskId: string, isCompleted: boolean) => {
    if (!activeGoal) return;

    try {
      // Find the module containing this task
      const moduleWithTask = activeGoal.modules.find(module => 
        module.tasks?.some(task => task.id === taskId)
      );
      
      if (!moduleWithTask) return;

      // Update the task in the module
      const updatedModule = {
        ...moduleWithTask,
        tasks: moduleWithTask.tasks?.map(task =>
          task.id === taskId ? { ...task, isCompleted } : task
        ) || []
      };

      // Update the goal with the new module
      const updatedGoal = {
        ...activeGoal,
        modules: activeGoal.modules.map(mod =>
          mod.id === moduleWithTask.id ? updatedModule : mod
        )
      };

      // Calculate new progress
      const newProgress = calculateModuleProgress(updatedModule);
      const optimisticGoal = { ...updatedGoal, progress: newProgress };

      // Update the goals array
      const updatedGoals = marketingGoals.map(g => 
        g.id === activeGoal.id ? optimisticGoal : g
      );
      onMarketingGoalsChange(updatedGoals);

      // Persist to backend
      const taskResponse = await toggleMarketingTask(taskId, isCompleted);
      if (!taskResponse.success) {
        console.error('Failed to toggle task:', taskResponse.error);
        return;
      }

      // Update goal progress
      const progressResponse = await updateGoalProgress(activeGoal.id, newProgress);
      if (!progressResponse.success) {
        console.error('Failed to update progress:', progressResponse.error);
      }

      // Show notification only when completing (not uncompleting)
      if (isCompleted) {
        const taskToUpdate = updatedModule.tasks?.find(task => task.id === taskId);
        if (taskToUpdate) {
          showTaskCompleted(taskToUpdate.title);
        }

        // Check if module is completed
        const allTasksCompleted = updatedModule.tasks?.every((task: any) => task.isCompleted) || false;
        if (allTasksCompleted && !updatedModule.isCompleted) {
          showModuleCompleted(updatedModule.title, updatedModule.weekNumber);
        }
      }

    } catch (error) {
      console.error('Error toggling task:', error);
    }
  }, [activeGoal, marketingGoals, onMarketingGoalsChange, showTaskCompleted, showModuleCompleted]);

  // If no active goal, show track selection interface
  if (!activeGoal) {
    return (
      <div className="min-h-screen bg-transparent text-white p-6" style={{ background: 'transparent !important' }}>
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#1B1628] rounded-2xl border border-[#2A243E] p-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-4">
              {trackConfig.title}
            </h1>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              {trackConfig.description}
            </p>
            <div className="bg-[#2A243E]/30 rounded-lg p-6">
              <p className="text-gray-400">
                No active {trackConfig.journeyName} track found. Please start a track from the track picker.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If track is active, show the full track interface
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
              <h3 className="text-xl font-semibold text-white mb-3">Phase 1: Foundation & Strategy</h3>
              <p className="text-gray-400 leading-relaxed">
                Build a strong foundation with strategic planning, content creation, and audience engagement.
                This phase focuses on establishing your brand presence and creating sustainable marketing habits.
              </p>
            </div>
          </div>

          {/* Weekly Modules */}
          <div className="bg-[#1B1628] rounded-2xl border border-[#2A243E] overflow-hidden">
            {activeGoal.modules.map((module, index) => (
              <div key={module.id}>
                <WeekAccordion
                  module={module}
                  currentWeek={activeGoal.currentWeek}
                  onTaskToggle={handleTaskToggle}
                  onTaskClick={handleTaskClick}
                />
                {index < activeGoal.modules.length - 1 && (
                  <div className="border-t border-[#2A243E]/40" />
                )}
              </div>
            ))}
          </div>
          
          {/* Task Modal */}
          <TaskModal
            isOpen={isTaskModalOpen}
            onClose={() => setIsTaskModalOpen(false)}
            task={selectedTask}
            onToggle={handleTaskToggle}
          />
        </div>
      </div>
    </MarketingTrackProvider>
  );
}