import { useEffect, useState, useRef } from 'react';
import { useMarketing } from './contexts/MarketingContext';
import { useNotificationHelpers } from './hooks/useNotificationHelpers';
import { MarketingTrackProvider } from './contexts/MarketingTrackContext';
import type { MarketingGoal, MarketingTask, Task, MarketingPhase } from './types';
import TaskModal from './components/marketingTrack/TaskModal';
import TaskActionButton from './components/marketingTrack/TaskActionButton';
import MarkdownRenderer from './components/MarkdownRenderer';
import CompletionConfetti from './components/CompletionConfetti';
import HelpIcon from './components/HelpIcon';
import LoadingSkeleton from './components/LoadingSkeleton';
import { getPublishedTracks, activateTrack, updateMarketingGoalPhases } from './services/marketingService';
import { renderContentPreview, renderMarketingContent } from './utils/contentRenderer';
import { apiService } from './services/api';
import { useIsMobile } from './hooks/useMediaQuery';
import { logger } from './utils/logger';
// Updated: 2025-09-24 - Phase update functionality added

interface MarketingTrackPageProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
}

/**
 * MarketingTrackPage now dynamically renders any active marketing goal
 * using the universal track template that matches the production UI.
 */
export default function MarketingTrackPage({ tasks, onTasksChange }: MarketingTrackPageProps) {
  const { activeGoal, isLoading, refreshMarketingData, updateActiveGoal, updatePhases } = useMarketing();
  const { showTaskCompleted, showModuleCompleted, showError, showSuccess } = useNotificationHelpers();
  const isMobile = useIsMobile();
  const [selectedTask, setSelectedTask] = useState<MarketingTask | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [publishedTracks, setPublishedTracks] = useState<MarketingGoal[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [activatingTrack, setActivatingTrack] = useState<string | null>(null);
  const [showTrackSelection, setShowTrackSelection] = useState(false); // Only show selection when no active goal
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());
  const [lessonCollapsed, setLessonCollapsed] = useState(isMobile); // Collapse lesson on mobile by default
  const [expandedTaskDescriptions, setExpandedTaskDescriptions] = useState<Set<string>>(new Set());
  const [completedModuleId, setCompletedModuleId] = useState<string | null>(null);
  const currentWeekRef = useRef<HTMLDivElement>(null);

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
        
        logger.info('Synced marketing task with task tracker', { marketingTaskId, taskTrackerId: correspondingTask.id });
      }
    } catch (error) {
      logger.error('Error syncing with task tracker', error, { marketingTaskId });
    }
  };

  // Handle task completion with optimistic updates
  const handleTaskToggle = async (taskToUpdate: MarketingTask) => {
    if (!activeGoal) return;

    const newCompletionState = !taskToUpdate.isCompleted;
    
    // Optimistic update - update UI immediately
    const previousGoal = { ...activeGoal };
    const optimisticGoal = {
      ...activeGoal,
      modules: activeGoal.modules.map(module => ({
        ...module,
        tasks: module.tasks.map(task => 
          task.id === taskToUpdate.id 
            ? { ...task, isCompleted: newCompletionState }
            : task
        )
      }))
    };

    // Calculate updated progress
    const allTasks = optimisticGoal.modules.flatMap(m => m.tasks);
    const completedTasks = allTasks.filter(t => t.isCompleted).length;
    const totalTasks = allTasks.length;
    const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    optimisticGoal.progress = overallProgress;

    // Update UI immediately (optimistic)
    updateActiveGoal(optimisticGoal);

    // Show notification immediately for better UX
    if (newCompletionState) {
      showTaskCompleted(taskToUpdate.title);
    }

    // Check for module completion (optimistic)
    if (newCompletionState) {
      const taskModule = optimisticGoal.modules.find(m => 
        m.tasks.some(t => t.id === taskToUpdate.id)
      );
      
      if (taskModule) {
        const allModuleTasksCompleted = taskModule.tasks.every(t => t.isCompleted);
        const wasPreviouslyCompleted = previousGoal.modules
          .find(m => m.id === taskModule.id)?.tasks.every(t => t.isCompleted) || false;
        
        if (allModuleTasksCompleted && !wasPreviouslyCompleted) {
          taskModule.isCompleted = true;
          setCompletedModuleId(taskModule.id);
          setTimeout(() => setCompletedModuleId(null), 5000);
          showModuleCompleted(taskModule.title, taskModule.weekNumber);
        }
      }
    }

    // Persist to backend
    try {
      const response = await apiService.updateMarketingTaskCompletion(taskToUpdate.id, newCompletionState);

      if (!response.success) {
        // Rollback optimistic update on failure
        updateActiveGoal(previousGoal);
        showError('Failed to update task', response.error || 'Please try again');
        return;
      }

      // Sync with task tracker
      await syncWithTaskTracker(taskToUpdate.id, newCompletionState);
    } catch (error) {
      // Rollback optimistic update on error
      updateActiveGoal(previousGoal);
      logger.error('Error updating task', error, { taskId: taskToUpdate.id });
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task. Please try again.';
      showError('Task Update Failed', errorMessage);
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
        logger.error('Failed to load published tracks', { error: response.error });
      }
    } catch (error) {
      logger.error('Error loading published tracks', error);
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
        // Force refresh marketing data to load the newly activated track immediately
        await refreshMarketingData();
        // Hide track selection after successful activation
        setShowTrackSelection(false);
        // Show success feedback
        const track = publishedTracks.find(t => t.id === trackId);
        if (track) {
          showSuccess('Track Activated', `"${track.title}" is now your active marketing track! Let's get started.`);
        }
    } else {
        logger.error('Failed to activate track', { trackId, error: response.error });
        // You might want to show a user-friendly error message here
      }
    } catch (error) {
      logger.error('Error activating track', error, { trackId });
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

  // Initialize current week as expanded and scroll to it
  useEffect(() => {
    if (activeGoal) {
      // Always expand current week
      setExpandedWeeks(new Set([activeGoal.currentWeek]));
      
      // Scroll to current week after a brief delay
      setTimeout(() => {
        currentWeekRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [activeGoal?.currentWeek]);
  
  const toggleWeekExpansion = (weekNumber: number) => {
    setExpandedWeeks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(weekNumber)) {
        newSet.delete(weekNumber);
      } else {
        newSet.add(weekNumber);
      }
      return newSet;
    });
  };


  if (isLoading) {
    return (
      <div className={`min-h-screen bg-transparent text-white ${isMobile ? 'p-4' : 'p-6'}`} style={{ background: 'transparent !important' }}>
        <div className="max-w-6xl mx-auto">
          <LoadingSkeleton lines={5} showTitle className="mb-6" />
          <LoadingSkeleton lines={3} className="mb-6" />
          <LoadingSkeleton lines={4} />
        </div>
      </div>
    );
  }

  if (!activeGoal || showTrackSelection) {
  return (
    <div className={`min-h-screen bg-transparent text-white ${isMobile ? 'p-4' : 'p-6'}`} style={{ background: 'transparent !important' }}>
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
              {activeGoal && (activeGoal.progress ?? 0) < 100 && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6 text-left">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-blue-300 font-medium mb-1">Track in Progress</p>
                      <p className="text-blue-200/80 text-sm">
                        You're currently on the <strong>{activeGoal.title}</strong> track. You can choose a new track once you complete your current track.
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
                        ) : activeGoal && (activeGoal.progress ?? 0) < 100 ? (
                          <div className="space-y-2">
                            <button
                              disabled
                              className="w-full bg-gray-600 text-gray-400 font-semibold py-2 px-4 rounded-lg cursor-not-allowed relative group"
                              title="Complete your current track before starting a new one"
                            >
                              Complete Current Track First
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-gray-800 text-white text-xs rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                You can only have one active track at a time. Complete your current track to start a new one.
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                              </div>
                            </button>
                            <p className="text-xs text-gray-500 text-center">
                              Finish <strong>{activeGoal.title}</strong> to unlock new tracks
                            </p>
                          </div>
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
      <div className={`min-h-screen bg-transparent text-white ${isMobile ? 'p-4' : 'p-6'}`} style={{ background: 'transparent !important' }}>
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className={`bg-[#1B1628] rounded-2xl border border-[#2A243E] ${isMobile ? 'p-4' : 'p-8'} mb-8`}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{activeGoal.title}</h1>
                <p className="text-gray-400">Active Track</p>
              </div>

              <div className="flex gap-3 items-center">
                <button
                  onClick={() => window.print()}
                  className="print-button"
                  style={{
                    padding: '0.5rem 1rem',
                    minHeight: '44px'
                  }}
                  title="Print this track"
                >
                  🖨️ Print
                </button>
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

            {/* Intro paragraph with Example Outcomes */}
            {(() => {
              // Extract example outcomes from description
              const extractOutcomes = (description: string): string[] => {
                const outcomes: string[] = [];
                
                // Pattern 1: "Example outcomes:" followed by bullet points or comma-separated list
                // Try to match with newline first, then try inline (same line)
                let exampleOutcomesMatch = description.match(/(?:Example outcomes?):\s*([\s\S]*?)(?=\n\n[A-Z]|$)/i);
                if (!exampleOutcomesMatch) {
                  // Try inline format (same line, ends with period or end of string)
                  exampleOutcomesMatch = description.match(/(?:Example outcomes?):\s*([^.]*(?:\.[^.]*)*?)(?=\s+[A-Z]|$)/i);
                }
                
                if (exampleOutcomesMatch) {
                  const outcomesText = exampleOutcomesMatch[1].trim();
                  
                  // First try to extract bullet points
                  const bulletMatches = outcomesText.match(/^\s*[-*•]\s*(.+)$/gm);
                  if (bulletMatches && bulletMatches.length > 0) {
                    const bullets = bulletMatches.map(m => m.replace(/^\s*[-*•]\s*/, '').trim()).filter(s => s.length > 0);
                    outcomes.push(...bullets);
                  } else {
                    // If no bullets, try comma-separated format
                    const commaSeparated = outcomesText.split(',').map(s => s.trim()).filter(s => s.length > 0);
                    if (commaSeparated.length > 0) {
                      outcomes.push(...commaSeparated);
                    }
                  }
                }
                
                // Pattern 2: Look for bullet-like patterns anywhere in description (fallback)
                if (outcomes.length === 0) {
                  const bulletMatches = description.match(/(?:^|\n)[\s]*[-*•]\s*([^\n]+)/g);
                  if (bulletMatches && bulletMatches.length > 0) {
                    const bullets = bulletMatches.map(m => m.replace(/^[\s]*[-*•]\s*/, '').trim()).filter(s => s.length > 0);
                    if (bullets.length > 0) {
                      outcomes.push(...bullets);
                    }
                  }
                }
                
                return outcomes.slice(0, 5); // Limit to 5 outcomes
              };
              
              const outcomes = extractOutcomes(activeGoal.description);
              
              // Remove the "Example outcomes:" section and all bullet points from description
              let descriptionWithoutOutcomes = activeGoal.description
                .replace(/(?:Example outcomes?):\s*[\s\S]*?(?=\n\n[A-Z]|$)/i, '')
                .replace(/(?:^|\n)[\s]*[-*•]\s*[^\n]+/g, '')
                .replace(/Example outcomes?:\s*[^.]*(?:\.[^.]*)*/gi, '') // Also remove inline comma-separated outcomes
                .trim();
              
              // Clean up any double newlines or extra whitespace
              descriptionWithoutOutcomes = descriptionWithoutOutcomes.replace(/\n{3,}/g, '\n\n').trim();
              
              return outcomes.length > 0 ? (
                <div className="flex flex-col lg:flex-row gap-8 items-start mb-8">
                  <p className="text-gray-300 text-lg leading-relaxed flex-1">
                    {descriptionWithoutOutcomes || activeGoal.description}
                  </p>
                  <div className="lg:w-80 flex-shrink-0">
                    <h3 className="text-xl font-bold text-white mb-4">Example Outcomes</h3>
                    <ul className="space-y-3">
                      {outcomes.map((outcome, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-gray-300">
                          <span className="text-[#EF8E81] mt-1 flex-shrink-0">→</span>
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                  {activeGoal.description}
                </p>
              );
            })()}

            {/* Completion message */}
            {(activeGoal.progress ?? 0) >= 100 && (
              <>
                <CompletionConfetti isComplete={true} duration={6000} />
                <div className="bg-gradient-to-r from-[#EF8E81]/10 to-[#D4AF37]/10 rounded-xl p-6 border border-[#EF8E81]/20 mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#EF8E81] flex items-center justify-center">
                      <span className="text-white text-lg">🎉</span>
                    </div>
                    <h3 className="text-xl font-semibold text-[#EF8E81]">Congratulations!</h3>
                  </div>
                  <p className="text-gray-300 mb-4">
                    You've successfully completed this marketing track! You can now choose a new track to continue your marketing journey.
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => setShowTrackSelection(true)}
                      className="bg-gradient-to-r from-[#EF8E81] to-[#D4AF37] text-white font-semibold py-2 px-4 rounded-lg hover:from-[#EF8E81]/90 hover:to-[#D4AF37]/90 transition-colors"
                    >
                      Choose Next Track
                    </button>
                    <button
                      onClick={() => {
                        // Scroll to top of track to review
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="bg-transparent border border-[#EF8E81]/30 text-[#EF8E81] font-semibold py-2 px-4 rounded-lg hover:bg-[#EF8E81]/10 transition-colors"
                    >
                      Review Completed Track
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Week Progression Info */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h4 className="text-blue-300 font-semibold mb-2">How Weeks Advance</h4>
                  <p className="text-blue-200/80 text-sm mb-2">
                    Weeks unlock automatically each week. You can work on past weeks anytime by scrolling down and expanding them. If you're behind, don't worry - catch up at your own pace!
                  </p>
                  {activeGoal.modules.some(m => m.weekNumber > activeGoal.currentWeek) && (
                    <p className="text-blue-200/70 text-xs">
                      Next week unlocks automatically in <strong>7 days</strong>. Preview upcoming weeks below.
                    </p>
                  )}
                </div>
              </div>
            </div>

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
            {(() => {
              logger.debug('Phase debug', {
                currentWeek: activeGoal.currentWeek,
                phases: activeGoal.phases,
                currentPhase: activeGoal.currentPhase
              });
              return activeGoal.currentPhase && (
                <div className="mt-8 pt-6 border-t border-[#2A243E]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ 
                          backgroundColor: activeGoal.currentPhase.color || '#EF8E81' 
                        }}
                      >
                        <span className="text-white text-sm font-bold">
                          {activeGoal.currentPhase.id || '1'}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-white">
                          {activeGoal.currentPhase.title}
                        </h2>
                        <p className="text-gray-400 text-sm">
                          {activeGoal.currentPhase.description}
                        </p>
                        <p className="text-[#EF8E81]/60 text-xs mt-1">
                          Weeks {activeGoal.currentPhase.startWeek} - {activeGoal.currentPhase.endWeek}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Catch Up Banner - If behind */}
          {(() => {
            const pastWeeks = activeGoal.modules.filter(m => 
              m.weekNumber < activeGoal.currentWeek && 
              m.tasks.some(t => !t.isCompleted)
            );
            const isBehind = pastWeeks.length > 0;
            
            if (!isBehind) return null;
            
            return (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="text-amber-300 font-semibold mb-1">Behind on Tasks?</h4>
                    <p className="text-amber-200/80 text-sm mb-3">
                      You have incomplete tasks from {pastWeeks.length} previous {pastWeeks.length === 1 ? 'week' : 'weeks'}. Scroll down to catch up on past weeks, or continue with the current week - you can always go back!
                    </p>
                    <button
                      onClick={() => {
                        currentWeekRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="text-amber-300 hover:text-amber-200 text-sm font-medium underline"
                    >
                      Jump to Current Week →
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Confetti for Module Completion */}
          {completedModuleId && (
            <CompletionConfetti isComplete={true} duration={5000} />
          )}

          {/* Weekly Modules - Current week first, then others */}
          <div className="space-y-6">
            {/* Current Week - Prime Real Estate */}
            {activeGoal.modules
              .filter(module => module.weekNumber === activeGoal.currentWeek)
              .map((module) => {
              const completedTasks = module.tasks.filter(task => task.isCompleted).length;
              const totalTasks = module.tasks.length;
              const moduleProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
              const isCurrentWeek = module.weekNumber === activeGoal.currentWeek;
              const isPastWeek = module.weekNumber < activeGoal.currentWeek && module.isUnlocked;
              const isUnlocked = module.isUnlocked || module.weekNumber <= activeGoal.currentWeek;
              const isExpanded = expandedWeeks.has(module.weekNumber);

              // Condensed view for locked weeks
              if (!isUnlocked) {
                return (
                  <div 
                    key={module.id}
                    className="bg-[#1B1628] rounded-xl border border-[#2A243E] p-4 opacity-75"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{module.weekNumber}</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-300">{module.title}</h3>
                          <p className="text-gray-500 text-sm">{totalTasks} tasks</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-500 text-sm">Locked</span>
                        </div>
                        <div className="w-16 bg-gray-700 rounded-full h-1.5">
                          <div className="w-0 h-full bg-gray-600 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div 
                  key={module.id}
                  ref={isCurrentWeek ? currentWeekRef : null}
                  className={`bg-[#1B1628] rounded-2xl border transition-all duration-200 ${
                    isCurrentWeek 
                      ? 'ring-2 ring-[#EF8E81] border-[#EF8E81] shadow-lg shadow-[#EF8E81]/20' 
                      : 'border-[#2A243E]'
                  }`}
                >
                  {/* Module Header - Collapsible button for past weeks */}
                  <button
                    onClick={() => !isCurrentWeek && toggleWeekExpansion(module.weekNumber)}
                    className={`w-full ${isMobile ? 'p-4 pb-3' : 'p-6 pb-4'} text-left transition-colors ${
                      !isCurrentWeek ? 'hover:bg-[#2A243E]/20 cursor-pointer' : 'cursor-default'
                    } ${isCurrentWeek ? 'bg-gradient-to-r from-[#EF8E81]/10 to-transparent' : ''}`}
                    style={{ minHeight: isMobile ? '60px' : 'auto' }}
                  >
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
                      <div className="flex items-center gap-3">
                        {isCurrentWeek && (
                          <div className="bg-[#EF8E81] text-white border border-[#EF8E81] rounded-full px-4 py-1.5 text-sm font-bold shadow-md animate-pulse">
                            ✨ Current Week
                          </div>
                        )}
                        {isPastWeek && (
                          <div className="bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 rounded-full px-3 py-1 text-xs font-medium">
                            ✓ Completed
                          </div>
                        )}
                        <div className="text-sm text-gray-400 font-medium">
                          {completedTasks}/{totalTasks} tasks
                        </div>
                        {!isCurrentWeek && (
                          <svg 
                            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
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
                  </button>

                  {/* Expanded Content - only show if week is expanded or is current week */}
                  {(isExpanded || isCurrentWeek) && (
                    <div className="px-6 pb-6">
                      {/* Module Content - Full display for current week */}
                      {isUnlocked && module.content && (
                      <div className="max-w-none">
                        {isCurrentWeek ? (
                          <div className="space-y-6">
                            {/* Weekly Lesson - Collapsible on mobile */}
                            <div className="bg-[#141127] rounded-xl border border-[#2A243E]">
                              <button
                                onClick={() => isMobile && setLessonCollapsed(!lessonCollapsed)}
                                className={`w-full p-6 text-left ${isMobile ? 'flex items-center justify-between' : ''}`}
                              >
                                <h4 className="text-lg font-semibold text-white">Weekly Lesson</h4>
                                {isMobile && (
                                  <svg 
                                    className={`w-5 h-5 text-white transition-transform ${lessonCollapsed ? '' : 'rotate-180'}`}
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                )}
                              </button>
                              {(!isMobile || !lessonCollapsed) && (
                                <div className="px-6 pb-6">
                                  <MarkdownRenderer content={module.content} />
                                </div>
                              )}
                            </div>
                            
                            {/* Pro Tip */}
                            {(() => {
                              logger.debug('MarketingTrackPage module data', { 
                                moduleId: module.id, 
                                hasProTip: !!module.proTip 
                              });
                              return module.proTip && (
                                <div className="bg-gradient-to-r from-[#EF8E81]/10 to-[#D4AF37]/10 rounded-xl p-6 border border-[#EF8E81]/20">
                                  <h5 className="text-lg font-semibold text-[#EF8E81] mb-3 flex items-center gap-2">
                                    <span>💡</span> Pro Tip
                                  </h5>
                                  <MarkdownRenderer content={module.proTip} />
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
                    
                    {/* Tasks */}
                    {isUnlocked && module.tasks.length > 0 && (
                      <div className="pt-4 border-t border-[#2A243E] mt-6">
                        <h4 className="text-sm font-medium text-gray-300 mb-3">Tasks for this week:</h4>
                        <div className="space-y-3">
                          {module.tasks.map((task) => (
                            <div 
                              key={task.id}
                              className={`flex items-start gap-3 p-4 rounded-lg transition-colors ${
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
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 mt-0.5 ${
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
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
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
                                  {task.description && task.description.trim() && (
                                    <HelpIcon
                                      content={task.description.length > 200 ? task.description.substring(0, 200) + '...' : task.description}
                                      position="left"
                                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                                    />
                                  )}
                                </div>
                                {task.description && task.description.trim() && (
                                  <div className="mt-2">
                                    {expandedTaskDescriptions.has(task.id) ? (
                                      <div className="text-sm text-gray-400">
                                        <MarkdownRenderer content={task.description} />
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setExpandedTaskDescriptions(prev => {
                                              const newSet = new Set(prev);
                                              newSet.delete(task.id);
                                              return newSet;
                                            });
                                          }}
                                          className="text-[#EF8E81] text-xs mt-2 hover:underline"
                                        >
                                          Show less
                                        </button>
                                      </div>
                                    ) : task.description.length > 100 ? (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setExpandedTaskDescriptions(prev => new Set(prev).add(task.id));
                                        }}
                                        className="text-[#EF8E81] text-xs hover:underline"
                                      >
                                        Show description ({task.description.substring(0, 80).trim()}...)
                                      </button>
                                    ) : (
                                      <div className="text-sm text-gray-400 mt-1">
                                        {task.description}
                                      </div>
                                    )}
                                  </div>
                                )}
                                {task.actionLink && (
                                  <div className="mt-3">
                                    <TaskActionButton actionLink={task.actionLink} variant="secondary" />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  )}

                </div>
              );
            })}
            
            {/* Divider & Section Header for Past Weeks */}
            {activeGoal.modules.some(m => m.weekNumber < activeGoal.currentWeek) && (
              <div className="space-y-4 my-8">
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#2A243E] to-transparent"></div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    Previous Weeks
                  </h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#2A243E] to-transparent"></div>
                </div>
                {activeGoal.modules.some(m => 
                  m.weekNumber < activeGoal.currentWeek && 
                  m.tasks.some(t => !t.isCompleted)
                ) && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-center">
                    <p className="text-amber-200/80 text-xs">
                      💡 <strong>Tip:</strong> You can expand any previous week below to review content and complete missed tasks. No pressure - work at your own pace!
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Past Weeks - Collapsed by default */}
            {activeGoal.modules
              .filter(module => module.weekNumber < activeGoal.currentWeek)
              .sort((a, b) => b.weekNumber - a.weekNumber) // Reverse chronological
              .map((module) => {
              const completedTasks = module.tasks.filter(task => task.isCompleted).length;
              const totalTasks = module.tasks.length;
              const moduleProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
              const isCurrentWeek = false;
              const isPastWeek = true;
              const isUnlocked = module.isUnlocked || module.weekNumber <= activeGoal.currentWeek;
              const isExpanded = expandedWeeks.has(module.weekNumber);

              return (
                <div 
                  key={module.id}
                  className="bg-[#1B1628] rounded-2xl border border-[#2A243E] transition-all duration-200"
                >
                  {/* Module Header - Collapsible button */}
                  <button
                    onClick={() => toggleWeekExpansion(module.weekNumber)}
                    className="w-full p-6 pb-4 text-left transition-colors hover:bg-[#2A243E]/20 cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#2A243E]">
                          <span className="text-white text-sm font-bold">{module.weekNumber}</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">{module.title}</h3>
                          {module.description && (
                            <p className="text-gray-400 text-sm">{module.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 rounded-full px-3 py-1 text-xs font-medium">
                          ✓ Completed
                        </div>
                        <div className="text-sm text-gray-400 font-medium">
                          {completedTasks}/{totalTasks} tasks
                        </div>
                        <svg 
                          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
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
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-6 pb-6">
                      {/* Module Content */}
                      {isUnlocked && module.content && (
                      <div className="max-w-none">
                        <div className="text-sm text-gray-400">
                          {renderContentPreview(module.content, 2)}
                        </div>
                      </div>
                    )}
                    
                    {/* Tasks */}
                    {isUnlocked && module.tasks.length > 0 && (
                      <div className="pt-4 border-t border-[#2A243E] mt-6">
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
                                className="cursor-pointer"
                              >
                                {task.isCompleted ? (
                                  <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <div className="w-6 h-6 rounded-full border-2 border-gray-500 hover:border-[#EF8E81] transition-colors" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div 
                                    className="flex-1 cursor-pointer"
                                    onClick={() => handleTaskClick(task)}
                                  >
                                    <span className={`text-white font-medium ${
                                      task.isCompleted ? 'line-through text-gray-400' : ''
                                    }`}>
                                      {task.title}
                                    </span>
                                    {task.estimatedTime && (
                                      <span className="text-gray-400 ml-2 text-sm">({task.estimatedTime})</span>
                                    )}
                                  </div>
                                  {task.description && task.description.trim() && (
                                    <HelpIcon
                                      content={task.description.length > 200 ? task.description.substring(0, 200) + '...' : task.description}
                                      position="left"
                                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                                    />
                                  )}
                                </div>
                                {task.description && task.description.trim() && (
                                  <div className="mt-2">
                                    {expandedTaskDescriptions.has(task.id) ? (
                                      <div className="text-sm text-gray-400">
                                        <MarkdownRenderer content={task.description} />
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setExpandedTaskDescriptions(prev => {
                                              const newSet = new Set(prev);
                                              newSet.delete(task.id);
                                              return newSet;
                                            });
                                          }}
                                          className="text-[#EF8E81] text-xs mt-2 hover:underline"
                                        >
                                          Show less
                                        </button>
                                      </div>
                                    ) : task.description.length > 100 ? (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setExpandedTaskDescriptions(prev => new Set(prev).add(task.id));
                                        }}
                                        className="text-[#EF8E81] text-xs hover:underline"
                                      >
                                        Show description ({task.description.substring(0, 80).trim()}...)
                                      </button>
                                    ) : (
                                      <div className="text-sm text-gray-400 mt-1">
                                        {task.description}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  )}

                </div>
              );
            })}
            
            {/* Divider & Section Header for Future Weeks */}
            {activeGoal.modules.some(m => m.weekNumber > activeGoal.currentWeek) && (
              <div className="space-y-4 my-8">
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#2A243E] to-transparent"></div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Upcoming Weeks
                  </h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#2A243E] to-transparent"></div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
                  <p className="text-blue-200/80 text-xs">
                    🔮 <strong>Preview:</strong> These weeks unlock automatically as you progress. You can see what's coming up!
                  </p>
                </div>
              </div>
            )}
            
            {/* Future/Locked Weeks */}
            {activeGoal.modules
              .filter(module => module.weekNumber > activeGoal.currentWeek)
              .map((module) => {
              const totalTasks = module.tasks.length;
              const weeksUntilUnlock = module.weekNumber - activeGoal.currentWeek;

              return (
                <div 
                  key={module.id}
                  className="bg-[#1B1628] rounded-xl border border-[#2A243E] p-4 opacity-75 hover:opacity-90 transition-opacity"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">{module.weekNumber}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-300">{module.title}</h3>
                        <p className="text-gray-500 text-sm">
                          {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'} • Unlocks in {weeksUntilUnlock} {weeksUntilUnlock === 1 ? 'week' : 'weeks'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-500 text-sm">Locked</span>
                      </div>
                    </div>
                  </div>
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
}// Pro tip functionality update Tue Sep 23 23:28:42 EDT 2025
