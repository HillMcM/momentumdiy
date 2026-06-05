import { useState, useCallback } from 'react';
import type { Task, TaskStatus } from '../types';

interface DeletedTask {
  task: Task;
  timestamp: Date;
  status: TaskStatus;
  columnOrder: string[];
}

interface UseTaskHistoryReturn {
  deletedTasks: DeletedTask[];
  deleteTask: (task: Task, status: TaskStatus, columnOrder: string[]) => void;
  undoDelete: () => { task: Task; status: TaskStatus; columnOrder: string[] } | null;
  canUndo: boolean;
  clearHistory: () => void;
}

/**
 * Hook for managing task deletion history with undo functionality
 */
export function useTaskHistory(maxHistory = 5): UseTaskHistoryReturn {
  const [deletedTasks, setDeletedTasks] = useState<DeletedTask[]>([]);

  const deleteTask = useCallback((task: Task, status: TaskStatus, columnOrder: string[]) => {
    setDeletedTasks(prev => {
      const newHistory = [
        { task, timestamp: new Date(), status, columnOrder },
        ...prev
      ].slice(0, maxHistory);
      return newHistory;
    });
  }, [maxHistory]);

  const undoDelete = useCallback(() => {
    if (deletedTasks.length === 0) return null;

    const lastDeleted = deletedTasks[0];
    setDeletedTasks(prev => prev.slice(1));
    
    return {
      task: lastDeleted.task,
      status: lastDeleted.status,
      columnOrder: lastDeleted.columnOrder
    };
  }, [deletedTasks]);

  const clearHistory = useCallback(() => {
    setDeletedTasks([]);
  }, []);

  return {
    deletedTasks,
    deleteTask,
    undoDelete,
    canUndo: deletedTasks.length > 0,
    clearHistory
  };
}

