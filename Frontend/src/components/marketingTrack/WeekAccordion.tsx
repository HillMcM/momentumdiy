import React, { useState, useContext } from 'react';
import type { MarketingModule, MarketingTask } from '../../types';
import LessonCard from './LessonCard';
import TaskList from './TaskList';
import { countTasks } from '../../utils/date';
import { MarketingTrackContext } from '../../contexts/MarketingTrackContext';

interface WeekAccordionProps {
  module: MarketingModule;
  currentWeek: number;
  onTaskToggle: (taskId: string, isCompleted: boolean) => void;
  onTaskClick: (task: MarketingTask) => void;
}

export default function WeekAccordion({
  module,
  currentWeek,
  onTaskToggle,
  onTaskClick
}: WeekAccordionProps) {
  const isCurrentWeek = module.weekNumber === currentWeek;
  const isPastWeek = module.weekNumber < currentWeek && module.isUnlocked;
  const isLocked = !module.isUnlocked;
  
  // Current week always expanded, past weeks collapsed by default
  const [localExpanded, setLocalExpanded] = useState(isCurrentWeek);
  const { done, total } = countTasks(module);
  
  // Debug logging removed for production

  const context = useContext(MarketingTrackContext);
  
  // Pro tips are now stored directly in the module.pro_tip field from the database
  const proTip = module.pro_tip ? { title: 'Pro Tip', content: module.pro_tip } : null;

  const handleToggle = () => {
    if (isLocked) return;
    
    const newExpandedState = !localExpanded;
    setLocalExpanded(newExpandedState);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div 
      className={`${isLocked ? 'opacity-60' : ''} ${
        isCurrentWeek ? 'ring-2 ring-[#EF8E81] shadow-lg shadow-[#EF8E81]/20' : ''
      } rounded-lg overflow-hidden transition-all`}
    >
      {/* Header */}
      <button
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`w-full text-left p-6 transition-colors focus:outline-none focus:ring-2 focus:ring-[#EF8E81] focus:ring-offset-2 focus:ring-offset-[#141127] ${
          isLocked ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-[#1B1628]/40'
        } ${
          isCurrentWeek ? 'bg-gradient-to-r from-[#EF8E81]/10 to-transparent' : ''
        }`}
        disabled={isLocked}
        aria-expanded={localExpanded}
        title={isLocked ? `Unlocks in Week ${module.weekNumber}` : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isLocked ? (
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            ) : (
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${localExpanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            <div>
              <h3 className="text-lg font-semibold text-white">
                Week {module.weekNumber}: {module.title}
              </h3>
              {module.description && (
                <p className="text-sm text-gray-400 mt-1">{module.description}</p>
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
            <span className="text-sm text-gray-400 font-medium">
              {done}/{total} tasks
            </span>
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {localExpanded && !isLocked && (
        <div className="border-t border-[#2A243E]/40 bg-[#141127]/30">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#1B1628]/60 backdrop-blur-sm rounded-2xl border border-[#2A243E]/40 p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Weekly Lesson</h4>
                <LessonCard module={module} />
              </div>
              <div className="bg-[#1B1628]/60 backdrop-blur-sm rounded-2xl border border-[#2A243E]/40 p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Weekly Tasks</h4>
                <TaskList tasks={module.tasks} onTaskToggle={onTaskToggle} onTaskClick={onTaskClick} />
              </div>
            </div>
            
            {/* Pro Tip Callout - Full Width */}
            {renderer && proTip && (
              <div className="mt-6">
                {renderer.renderProTip(module.content)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
