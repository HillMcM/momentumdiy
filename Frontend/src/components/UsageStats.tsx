import React from 'react';
import { useMarketing } from '../contexts/MarketingContext';
import type { Task } from '../types';

interface UsageStatsProps {
  tasks: Task[];
}

/**
 * Component that displays usage/engagement statistics for trial users.
 * Shows what they've accomplished during their trial.
 */
export default function UsageStats({ tasks }: UsageStatsProps) {
  const { activeGoal } = useMarketing();

  // Calculate usage stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const activeProjects = new Set(tasks.filter(t => t.project).map(t => t.project)).size;
  const weeksCompleted = activeGoal 
    ? activeGoal.modules.filter(m => m.isCompleted).length 
    : 0;
  const totalWeeks = activeGoal?.duration || 0;
  const trackProgress = totalWeeks > 0 ? Math.round((weeksCompleted / totalWeeks) * 100) : 0;

  return (
    <div className="bg-gradient-to-br from-[#1B1628]/90 to-[#2A2438]/90 backdrop-blur-sm rounded-2xl border border-[#EF8E81]/20 p-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-[#EF8E81]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Your Trial Progress
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#2A2438]/50 rounded-lg p-4 border border-[#2A243E]">
          <div className="text-2xl font-bold text-[#EF8E81] mb-1">{completedTasks}</div>
          <div className="text-sm text-gray-400">Tasks Completed</div>
          {totalTasks > 0 && (
            <div className="text-xs text-gray-500 mt-1">{completionRate}% completion rate</div>
          )}
        </div>
        
        <div className="bg-[#2A2438]/50 rounded-lg p-4 border border-[#2A243E]">
          <div className="text-2xl font-bold text-[#EF8E81] mb-1">{totalTasks}</div>
          <div className="text-sm text-gray-400">Total Tasks</div>
        </div>
        
        {activeGoal && (
          <>
            <div className="bg-[#2A2438]/50 rounded-lg p-4 border border-[#2A243E]">
              <div className="text-2xl font-bold text-[#EF8E81] mb-1">{weeksCompleted}</div>
              <div className="text-sm text-gray-400">Weeks Completed</div>
              {totalWeeks > 0 && (
                <div className="text-xs text-gray-500 mt-1">{trackProgress}% of track</div>
              )}
            </div>
            
            <div className="bg-[#2A2438]/50 rounded-lg p-4 border border-[#2A243E]">
              <div className="text-2xl font-bold text-[#EF8E81] mb-1">{activeProjects}</div>
              <div className="text-sm text-gray-400">Active Projects</div>
            </div>
          </>
        )}
      </div>
      
      {totalTasks === 0 && !activeGoal && (
        <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-center">
          <p className="text-amber-300 text-sm">
            💡 Start using MomentumDIY to see your progress here! Complete tasks and track your marketing journey.
          </p>
        </div>
      )}
    </div>
  );
}
