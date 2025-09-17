import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  projects,
  tasks,
  trackSlug,
  trackConfig
}: UniversalTrackTemplateProps) {
  const navigate = useNavigate();
  const { showTaskCompleted, showModuleCompleted } = useNotificationHelpers();
  const [selectedTask, setSelectedTask] = useState<MarketingTask | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  
  // Find the active goal for this track
  const activeGoal = marketingGoals.find(g => 
    g.title.toLowerCase().includes(trackSlug.replace('-', ' ')) ||
    g.title === trackConfig.title
  );

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

      // Show notification
      showTaskCompleted(isCompleted);

      // Check if module is completed
      const allTasksCompleted = updatedModule.tasks?.every(task => task.isCompleted) || false;
      if (allTasksCompleted && !updatedModule.isCompleted) {
        showModuleCompleted();
      }

    } catch (error) {
      console.error('Error toggling task:', error);
    }
  }, [activeGoal, marketingGoals, onMarketingGoalsChange, showTaskCompleted, showModuleCompleted]);

  // If no active goal, show track selection interface
  if (!activeGoal) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'transparent', 
        color: '#FFF1E7', 
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>
            {trackConfig.title}
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.8, marginBottom: '2rem' }}>
            {trackConfig.description}
          </p>
          <p style={{ color: '#FFF1E7', opacity: 0.6 }}>
            No active {trackConfig.journeyName} track found. Please start a track from the track picker.
          </p>
        </div>
      </div>
    );
  }

  // If track is active, show the full track interface
  return (
    <MarketingTrackProvider activeGoal={activeGoal}>
      <div style={{ 
        minHeight: '100vh', 
        background: 'transparent', 
        color: '#FFF1E7', 
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ 
              margin: '0 0 0.5rem 0', 
              fontSize: '2.5rem', 
              fontWeight: 700, 
              color: '#FFF1E7' 
            }}>
              {activeGoal.title}
            </h1>
            <p style={{ margin: '0.5rem 0 0 0', color: '#FFF1E7', opacity: 0.7, fontSize: '1.1rem' }}>
              {activeGoal.description}
            </p>
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#FFF1E7', opacity: 0.7, fontSize: '0.9rem' }}>Overall Progress</span>
              <span style={{ color: '#FFF1E7', fontWeight: 600 }}>{Math.round(activeGoal.progress)}%</span>
            </div>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              background: 'rgba(42, 36, 62, 0.6)', 
              borderRadius: '4px', 
              overflow: 'hidden' 
            }}>
              <div 
                style={{ 
                  width: `${Math.round(activeGoal.progress)}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, #EF8E81, #D4AF37)', 
                  transition: 'width 0.5s ease' 
                }}
              />
            </div>
          </div>

          {/* Phase Section */}
          <div style={{ 
            marginBottom: '2rem', 
            padding: '1.5rem', 
            background: 'rgba(42, 36, 62, 0.3)', 
            borderRadius: '12px', 
            border: '1px solid rgba(42, 36, 62, 0.6)' 
          }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', color: '#FFF1E7', fontWeight: 600 }}>
              Phase 1: Foundations & Quick Wins
            </h3>
            <p style={{ margin: '0 0 0.5rem 0', color: '#EF8E81', fontWeight: 600 }}>
              Goal: Set up your social media presence for success with clear baselines, themes, and recognizable style.
            </p>
            <p style={{ margin: 0, color: '#FFF1E7', opacity: 0.8, lineHeight: '1.6' }}>
              Each phase starts with a quick win to give you an immediate confidence boost, then builds systems and habits that stack over time.
            </p>
          </div>

          {/* Weekly Modules */}
          <div style={{ display: 'grid', gap: '1.5rem' }}>
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
          
          {/* Task Modal */}
          <TaskModal
            isOpen={isTaskModalOpen}
            onClose={() => setIsTaskModalOpen(false)}
            task={selectedTask}
            onTaskToggle={handleTaskToggle}
          />
        </div>
      </div>
    </MarketingTrackProvider>
  );
}