import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { Task } from '../types';

interface QuickSearchProps {
  isOpen: boolean;
  onClose: () => void;
  tasks?: Task[];
}

interface SearchResult {
  type: 'page' | 'feature' | 'task';
  label: string;
  path: string;
  description?: string;
  taskId?: string;
}

const searchableItems: SearchResult[] = [
  { type: 'page', label: 'Dashboard', path: '/app', description: 'Main dashboard' },
  { type: 'page', label: 'Profile', path: '/app/profile', description: 'Manage your profile' },
  { type: 'page', label: 'Marketing Track', path: '/app/marketing-track', description: 'View your marketing track' },
  { type: 'page', label: 'Task Tracker', path: '/app/task-tracker', description: 'Manage your tasks' },
  { type: 'page', label: 'AI Marketing Assistant', path: '/app/ai-marketing-assistant', description: 'Get AI-powered marketing advice' },
  { type: 'page', label: 'Social Media Generator', path: '/app/social-generator', description: 'Generate social media posts' },
  { type: 'page', label: 'Social Profile Manager', path: '/app/profile-manager', description: 'Manage social media profiles' },
  { type: 'page', label: 'Social Strategy Hub', path: '/app/social-strategy', description: 'Create social media strategies' },
  { type: 'page', label: 'Asset Library', path: '/app/assets', description: 'View your assets' },
  { type: 'page', label: 'Affiliate Program', path: '/app/affiliate/program', description: 'Manage affiliate program' },
  { type: 'feature', label: 'Search Tasks', path: '/app/task-tracker', description: 'Search for tasks' },
  { type: 'feature', label: 'Create Task', path: '/app/task-tracker', description: 'Add a new task' },
];

export default function QuickSearch({ isOpen, onClose, tasks = [] }: QuickSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchLower = query.toLowerCase();
    
    // Search pages and features
    const pageResults = searchableItems.filter(item => {
      const labelMatch = item.label.toLowerCase().includes(searchLower);
      const descMatch = item.description?.toLowerCase().includes(searchLower);
      return labelMatch || descMatch;
    });

    // Search tasks
    const taskResults: SearchResult[] = tasks
      .filter(task => {
        const titleMatch = task.title.toLowerCase().includes(searchLower);
        const descMatch = task.description?.toLowerCase().includes(searchLower);
        const projectMatch = task.project?.toLowerCase().includes(searchLower);
        return titleMatch || descMatch || projectMatch;
      })
      .slice(0, 5)
      .map(task => ({
        type: 'task' as const,
        label: task.title,
        path: '/app/task-tracker',
        description: task.description || task.project || `Status: ${task.status}`,
        taskId: task.id
      }));

    // Combine and limit results
    const allResults = [...pageResults, ...taskResults].slice(0, 10);
    setResults(allResults);
    setSelectedIndex(0);
  }, [query, tasks]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, results.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelect = (item: SearchResult) => {
    navigate(item.path);
    setQuery('');
    onClose();
    
    // If it's a task, scroll to it after navigation
    if (item.type === 'task' && item.taskId) {
      setTimeout(() => {
        const taskElement = document.querySelector(`[data-task-id="${item.taskId}"]`);
        if (taskElement) {
          taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Highlight the task briefly
          taskElement.classList.add('highlight-task');
          setTimeout(() => taskElement.classList.remove('highlight-task'), 2000);
        }
      }, 300);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay style={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          position: 'fixed',
          inset: 0,
          animation: 'overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 9998,
        }} />
        <Dialog.Content
          style={{
            position: 'fixed',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90vw',
            maxWidth: '600px',
            backgroundColor: '#23233a',
            borderRadius: '12px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)',
            animation: 'contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 9999,
            overflow: 'hidden',
          }}
          onEscapeKeyDown={onClose}
        >
          <div style={{ padding: '1rem' }}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search features and tasks..."
              style={{
                width: '100%',
                background: '#191628',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                color: '#FFF1E7',
                fontSize: '1rem',
                outline: 'none',
              }}
            />
          </div>

          {results.length > 0 && (
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              {results.map((item, index) => (
                <button
                  key={`${item.type}-${item.path}-${index}`}
                  onClick={() => handleSelect(item)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: index === selectedIndex ? 'rgba(239, 142, 129, 0.15)' : 'transparent',
                    border: 'none',
                    color: '#FFF1E7',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {item.type === 'task' && (
                      <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>📋</span>
                    )}
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', flex: 1 }}>
                      {item.label}
                    </div>
                    {item.type === 'task' && (() => {
                      const task = tasks.find(t => t.id === item.taskId);
                      const status = task?.status || 'todo';
                      return (
                        <span style={{ 
                          fontSize: '0.7rem', 
                          padding: '0.15rem 0.4rem',
                          background: status === 'completed' ? 'rgba(16, 185, 129, 0.2)' : 
                                     status === 'in-progress' ? 'rgba(59, 130, 246, 0.2)' : 
                                     'rgba(156, 163, 175, 0.2)',
                          borderRadius: '4px',
                          textTransform: 'capitalize',
                          color: status === 'completed' ? '#10B981' : 
                                 status === 'in-progress' ? '#3B82F6' : 
                                 '#9CA3AF'
                        }}>
                          {status}
                        </span>
                      );
                    })()}
                  </div>
                  {item.description && (
                    <div style={{ fontSize: '0.8rem', opacity: 0.7, marginLeft: item.type === 'task' ? '1.5rem' : '0' }}>
                      {item.description}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {query && results.length === 0 && (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.5)',
            }}>
              No results found for "{query}"
            </div>
          )}

          {!query && (
            <div style={{
              padding: '1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '0.75rem',
              color: 'rgba(255, 255, 255, 0.5)',
              display: 'flex',
              justifyContent: 'space-between',
            }}>
              <span>Use ↑↓ to navigate, Enter to select, Esc to close</span>
              <kbd style={{
                background: '#191628',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                padding: '0.25rem 0.5rem',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                color: '#EF8E81',
              }}>
                ⌘K
              </kbd>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

