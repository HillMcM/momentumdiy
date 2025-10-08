import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { MarketingTask } from '../../types';
import MarkdownRenderer from '../MarkdownRenderer';
import { useIsMobile } from '../../hooks/useMediaQuery';

interface TaskModalProps {
  task: MarketingTask | null;
  isOpen: boolean;
  onClose: () => void;
  onToggle: (taskId: string, isCompleted: boolean) => void;
}

export default function TaskModal({ task, isOpen, onClose, onToggle }: TaskModalProps) {
  const isMobile = useIsMobile();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  if (!isOpen || !task) return null;

  const handleToggle = () => {
    onToggle(task.id, !task.isCompleted);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus the modal after a short delay to ensure it's rendered
      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.focus();
        }
      }, 100);
    } else {
      // Return focus to the previously focused element when modal closes
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    }

    return () => {
      // Cleanup focus when component unmounts
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen]);

  // Keyboard event handling for accessibility (global escape handler)
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="marketing-task-modal-title"
      aria-describedby="marketing-task-modal-description"
    >
      <div
        ref={modalRef}
        className="bg-[#1B1628] rounded-2xl border border-[#2A243E] w-full max-h-[90vh] overflow-y-auto"
        style={{ maxWidth: isMobile ? 'calc(100vw - 2rem)' : '448px' }}
        role="document"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#2A243E]">
          <div className="flex items-center justify-between mb-4">
            <h2 id="marketing-task-modal-title" className="text-xl font-semibold text-white">Task Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Task Status */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={handleToggle}
              className="w-6 h-6 rounded-full border-2 border-[#686DCA] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#EF8E81] focus:ring-offset-2 focus:ring-offset-[#1B1628] transition-colors"
              aria-checked={task.isCompleted}
              role="checkbox"
            >
              {task.isCompleted && (
                <div className="w-3 h-3 rounded-full bg-[#686DCA]" />
              )}
            </button>
            <span className={`text-sm font-medium ${task.isCompleted ? 'text-green-400' : 'text-[#686DCA]'}`}>
              {task.isCompleted ? 'Completed' : 'To Do'}
            </span>
          </div>
        </div>

        {/* Description */}
        <p id="marketing-task-modal-description" className="px-6 pb-4 text-gray-300 text-sm">
          View and manage the details of this marketing task, including its description, completion status, and any associated information.
        </p>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">{task.title}</h3>
            {task.description && (
              <MarkdownRenderer content={task.description} />
            )}
          </div>

          {/* Task Info */}
          <div className="space-y-4">
            {/* Estimated Time */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-400">Estimated Time</p>
                <p className="text-white font-medium">{task.estimatedTime}</p>
              </div>
            </div>

            {/* Due Date */}
            {task.dueDate && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#EF8E81]/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#EF8E81]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Due Date</p>
                  <p className="text-white font-medium">
                    {new Date(task.dueDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Module Info */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-400">Week</p>
                <p className="text-white font-medium">Week {task.taskId?.replace('week-', '') || 'Unknown'}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleToggle}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                task.isCompleted
                  ? 'bg-gray-600 hover:bg-gray-700 text-white'
                  : 'bg-[#686DCA] hover:bg-[#5a5fb8] text-white'
              }`}
            >
              {task.isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg font-medium bg-gray-600 hover:bg-gray-700 text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
