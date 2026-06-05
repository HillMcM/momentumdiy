import React, { useState, useCallback } from 'react';

interface SettingsSnapshot {
  timestamp: Date;
  data: Record<string, any>;
  description?: string;
}

interface UseSettingsHistoryReturn<T> {
  current: T | null;
  history: SettingsSnapshot[];
  saveSnapshot: (data: T, description?: string) => void;
  undo: () => T | null;
  canUndo: boolean;
  clearHistory: () => void;
}

/**
 * Hook for managing settings change history with undo functionality
 */
export function useSettingsHistory<T extends Record<string, any>>(
  initialData?: T,
  maxHistory = 10
): UseSettingsHistoryReturn<T> {
  const [current, setCurrent] = useState<T | null>(initialData || null);
  const [history, setHistory] = useState<SettingsSnapshot[]>([]);
  
  // Sync with initialData changes (but don't add to history)
  React.useEffect(() => {
    if (initialData && initialData !== current) {
      setCurrent(initialData);
    }
  }, [initialData]);

  const saveSnapshot = useCallback((data: T, description?: string) => {
    // Only save if data actually changed
    if (current && JSON.stringify(current) === JSON.stringify(data)) {
      return;
    }

    // Save current state to history before updating
    if (current) {
      setHistory(prev => {
        const newHistory = [
          { timestamp: new Date(), data: current, description },
          ...prev
        ].slice(0, maxHistory); // Keep only last maxHistory snapshots
        return newHistory;
      });
    }

    setCurrent(data);
  }, [current, maxHistory]);

  const undo = useCallback(() => {
    if (history.length === 0) return null;

    const previous = history[0];
    setCurrent(previous.data as T);
    setHistory(prev => prev.slice(1));
    return previous.data as T;
  }, [history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    current,
    history,
    saveSnapshot,
    undo,
    canUndo: history.length > 0,
    clearHistory
  };
}

