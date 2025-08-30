import { useState, useEffect, useCallback } from 'react';
import type { MarketingGoal, MarketingModule } from './types';
import { getActiveGoal, getModulesForGoal, toggleMarketingTask, updateGoalProgress } from './services/marketingService';
import WeekAccordion from './components/marketingTrack/WeekAccordion';
import { calculateModuleProgress, computeNextUnlockLabel } from './utils/date';

interface MarketingTrackPageProps {
  marketingGoals: MarketingGoal[];
  onMarketingGoalsChange: (goals: MarketingGoal[]) => void;
}

export default function MarketingTrackPage(_props: MarketingTrackPageProps) {
  const [activeGoal, setActiveGoal] = useState<MarketingGoal | null>(null);
  const [currentModule, setCurrentModule] = useState<MarketingModule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load active goal and its modules
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get active goal
        const goalResponse = await getActiveGoal();
        if (!goalResponse.success || !goalResponse.data) {
          setError('No active marketing goal found');
          return;
        }

        const goal = goalResponse.data;
        setActiveGoal(goal);

        // Get modules for this goal
        const modulesResponse = await getModulesForGoal(goal.id);
        if (modulesResponse.success && modulesResponse.data) {
          const updatedGoal = { ...goal, modules: modulesResponse.data };
          setActiveGoal(updatedGoal);

          // Find current module
          const currentMod = modulesResponse.data.find(m => m.weekNumber === goal.currentWeek);
          if (currentMod) {
            setCurrentModule(currentMod);
          }
        }

      } catch (err) {
        console.error('Failed to load marketing track data:', err);
        setError('Failed to load marketing track data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
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

    } catch (err) {
      console.error('Error toggling task:', err);
      // Revert on error
      setActiveGoal(activeGoal);
      setCurrentModule(currentModule);
    }
  }, [activeGoal, currentModule]);

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
    <div className="min-h-screen bg-[#141127] text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Marketing Tracks</h1>
            <p className="text-gray-400 mt-1">Active Track</p>
          </div>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Upgrade
          </button>
        </div>

        {/* Main Track Card */}
        <div className="bg-[#1B1628] rounded-2xl border border-[#2A243E] overflow-hidden">
          {/* Header Row */}
          <div className="p-8 border-b border-[#2A243E]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{activeGoal.title}</h2>
              <div className="flex gap-3">
                {activeGoal.isActive && (
                  <div className="bg-green-500/20 text-green-300 border border-green-500/30 rounded-full px-3 py-1 text-sm font-medium">
                    Active • Week {activeGoal.currentWeek} of {activeGoal.duration}
                  </div>
                )}
                <div className="bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full px-3 py-1 text-sm font-medium">
                  {computeNextUnlockLabel(activeGoal)}
                </div>
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
                <span className="text-sm font-medium text-purple-300">{activeGoal.progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, activeGoal.progress))}%` }}
                />
              </div>
            </div>

            {/* Phase Block */}
            <div className="mt-8 pt-6 border-t border-[#2A243E]">
              <h3 className="text-xl font-semibold text-white mb-2">Phase 1: Spark Traffic</h3>
              <p className="text-purple-300 font-medium mb-3">Goal: Get people in the door immediately.</p>
              <p className="text-gray-400 leading-relaxed text-sm">
                Focus on quick wins and foundational marketing activities that create immediate visibility and drive initial foot traffic.
                This phase emphasizes practical, actionable steps you can implement right away to start seeing results.
              </p>
            </div>
          </div>

          {/* Current Week Expanded */}
          {currentModule && (
            <WeekAccordion
              module={currentModule}
              currentWeek={activeGoal.currentWeek}
              onTaskToggle={handleTaskToggle}
              isExpanded={true}
            />
          )}

          {/* All Weeks Section */}
          <div className="border-t border-[#2A243E]">
            {activeGoal.modules.map((module) => (
              <WeekAccordion
                key={module.id}
                module={module}
                currentWeek={activeGoal.currentWeek}
                onTaskToggle={handleTaskToggle}
                isExpanded={false}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
