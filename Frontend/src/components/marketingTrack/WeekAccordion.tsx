import React, { useState } from 'react';
import type { MarketingModule, MarketingTask } from '../../types';
import LessonCard from './LessonCard';
import TaskList from './TaskList';
import { countTasks } from '../../utils/date';

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
  const [localExpanded, setLocalExpanded] = useState(module.weekNumber === currentWeek);
  const { done, total } = countTasks(module);

  const isCurrentWeek = module.weekNumber === currentWeek;
  const isLocked = !module.isUnlocked;
  
  // Debug logging
  console.log(`🔓 Week ${module.weekNumber}: isUnlocked=${module.isUnlocked}, isLocked=${isLocked}, currentWeek=${currentWeek}`);

  // Extract Pro Tip content from module.content
  const extractProTip = (content: string) => {
    const proTipMatch = content.match(/<h[1-6]>(Pro Tip:.*?)<\/h[1-6]>(.*?)(?=<h[1-6]|$)/is);
    
    if (proTipMatch) {
      const proTipTitle = proTipMatch[1];
      const proTipContent = proTipMatch[2];
      
      return {
        title: proTipTitle,
        content: proTipContent.trim()
      };
    }
    
    return null;
  };

  const proTip = extractProTip(module.content);

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
    <div className={`${isLocked ? 'opacity-60' : ''}`}>
      {/* Header */}
      <button
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`w-full text-left p-6 hover:bg-[#1B1628]/40 transition-colors focus:outline-none focus:ring-2 focus:ring-[#EF8E81] focus:ring-offset-2 focus:ring-offset-[#141127] ${
          isLocked ? 'cursor-not-allowed' : 'cursor-pointer'
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
            {proTip && (
              <div className="mt-6 p-6 bg-[#EF8E81]/10 border border-[#EF8E81]/20 rounded-2xl">
                <h4 className="text-lg font-semibold text-[#EF8E81] mb-3">{proTip.title}</h4>
                <div 
                  className="prose prose-invert max-w-none text-gray-300"
                  dangerouslySetInnerHTML={{ 
                    __html: proTip.content
                      .replace(/<p>/gi, '<p class="text-gray-300 mb-4 leading-relaxed">')
                      .replace(/<ul>/gi, '<ul class="text-gray-300 mb-4 space-y-2 ml-6">')
                      .replace(/<li>/gi, '<li class="list-disc">')
                      .replace(/<strong>/gi, '<strong class="text-white font-semibold">')
                      .replace(/<em>/gi, '<em class="text-[#EF8E81]">')
                  }} 
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
