import React from 'react';
import type { MarketingTask } from '../../types';

interface TaskItemProps {
  task: MarketingTask;
  onToggle: (id: string, nextCompleted: boolean) => void;
  onTaskClick: (task: MarketingTask) => void;
}

export default function TaskItem({ task, onToggle, onTaskClick }: TaskItemProps) {
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal when clicking checkbox
    onToggle(task.id, !task.isCompleted);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onTaskClick(task);
    }
  };

  const handleCardClick = () => {
    onTaskClick(task);
  };

  return (
    <div 
      className="flex items-center gap-4 p-4 rounded-lg hover:bg-[#1B1628] transition-colors cursor-pointer"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for task: ${task.title}`}
    >
      <button
        onClick={handleToggle}
        className="w-5 h-5 rounded-full border-2 border-[#686DCA] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#EF8E81] focus:ring-offset-2 focus:ring-offset-[#141127] transition-colors"
        aria-checked={task.isCompleted}
        role="checkbox"
      >
        {task.isCompleted && (
          <div className="w-2.5 h-2.5 rounded-full bg-[#686DCA]" />
        )}
      </button>

      <div className="flex-1">
        <h4 className={`font-bold ${task.isCompleted ? 'text-gray-500 line-through' : 'text-white'}`}>
          {task.title}
        </h4>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full border border-blue-500/30">
          {task.estimatedTime}
        </span>
      </div>
    </div>
  );
}
