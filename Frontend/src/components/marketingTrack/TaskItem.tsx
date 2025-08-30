import React from 'react';
import type { MarketingTask } from '../../types';

interface TaskItemProps {
  task: MarketingTask;
  onToggle: (id: string, nextCompleted: boolean) => void;
}

export default function TaskItem({ task, onToggle }: TaskItemProps) {
  const handleToggle = () => {
    onToggle(task.id, !task.isCompleted);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-[#1B1628] transition-colors">
      <button
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className="w-5 h-5 rounded border-2 border-gray-500 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#141127]"
        aria-checked={task.isCompleted}
        role="checkbox"
      >
        {task.isCompleted && (
          <svg className="w-3 h-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      <div className="flex-1">
        <h4 className={`font-medium ${task.isCompleted ? 'text-gray-500 line-through' : 'text-white'}`}>
          {task.title}
        </h4>
        {task.description && (
          <p className={`text-sm mt-1 ${task.isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
            {task.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full border border-blue-500/30">
          {task.estimatedTime}
        </span>
      </div>
    </div>
  );
}
