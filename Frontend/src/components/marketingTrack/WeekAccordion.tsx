import React, { useState } from 'react';
import type { MarketingModule } from '../../types';
import LessonCard from './LessonCard';
import TaskList from './TaskList';
import { countTasks } from '../../utils/date';

interface WeekAccordionProps {
  module: MarketingModule;
  currentWeek: number;
  onTaskToggle: (taskId: string, isCompleted: boolean) => void;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export default function WeekAccordion({
  module,
  currentWeek,
  onTaskToggle,
  isExpanded = false,
  onToggle
}: WeekAccordionProps) {
  const [localExpanded, setLocalExpanded] = useState(isExpanded);
  const { done, total } = countTasks(module);

  const isCurrentWeek = module.weekNumber === currentWeek;
  const isLocked = !module.isUnlocked;

  const handleToggle = () => {
    if (isLocked) return;
    if (onToggle) {
      onToggle();
    } else {
      setLocalExpanded(!localExpanded);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className={`${isLocked ? 'opacity-60' : ''}`}>
      {/* Header */}
      <button
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`w-full text-left p-6 hover:bg-[#1B1628] transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#141127] ${
          isLocked ? 'cursor-not-allowed' : 'cursor-pointer'
        }`}
        disabled={isLocked}
        aria-expanded={localExpanded || isExpanded}
        title={isLocked ? `Unlocks in Week ${module.weekNumber}` : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${localExpanded || isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
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
              <div className="bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-full px-3 py-1 text-sm font-medium">
                Current Week
              </div>
            )}
            <span className="text-sm text-gray-400">
              {done}/{total}
            </span>
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {(localExpanded || isExpanded) && !isLocked && (
        <div className="border-t border-[#2A243E] bg-[#141127]">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#1B1628] rounded-2xl border border-[#2A243E] p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Weekly Lesson</h4>
                <LessonCard module={module} />
              </div>
              <div className="bg-[#1B1628] rounded-2xl border border-[#2A243E] p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Weekly Tasks</h4>
                <TaskList tasks={module.tasks} onTaskToggle={onTaskToggle} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
