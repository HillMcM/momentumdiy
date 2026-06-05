import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import HelpIcon from './components/HelpIcon';
import { taskTemplates, createTaskFromTemplate, type TaskTemplate } from './utils/taskTemplates';
import type { TaskPriority } from './types';
import { useSwipeGesture } from './hooks/useSwipeGesture';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { useNotificationHelpers } from './hooks/useNotificationHelpers';
import { useIsMobile, useIsCompact } from './hooks/useMediaQuery';
import ConfirmDialog from './components/ConfirmDialog';
import { useTaskHistory } from './hooks/useTaskHistory';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import * as Dialog from '@radix-ui/react-dialog';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import type { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Task, Project, TaskStatus } from './types';
import { apiService } from './services/api';
import { logger } from './utils/logger';

// Small confetti burst around a target element (used when checking a task)
function burstConfettiAround(element: HTMLElement) {
  try {
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '0px';
    container.style.top = '0px';
    container.style.width = '100vw';
    container.style.height = '100vh';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '100000';
    document.body.appendChild(container);
    const colors = ['#EF8E81','#686DCA','#5ECD7D','#FF9D57'];
    const pieces = 26;
    for (let i = 0; i < pieces; i++) {
      const piece = document.createElement('div');
      piece.style.position = 'absolute';
      const size = 6 + Math.random() * 6;
      piece.style.width = `${size}px`;
      piece.style.height = `${size}px`;
      piece.style.background = colors[i % colors.length];
      piece.style.borderRadius = Math.random() > 0.6 ? '50%' : '2px';
      piece.style.left = `${x}px`;
      piece.style.top = `${y}px`;
      const angle = (Math.PI * 2 * i) / pieces;
      const distance = 70 + Math.random() * 60;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      piece.animate([
        { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) rotate(${i * 35}deg)`, opacity: 0 }
      ], { duration: 800 + Math.random() * 400, easing: 'cubic-bezier(.2,.8,.2,1)' });
      container.appendChild(piece);
    }
    setTimeout(() => { if (container.parentNode) container.parentNode.removeChild(container); }, 900);
  } catch {
    // Ignore errors in cleanup
  }
}

const columns = [
  { key: 'todo' as TaskStatus, label: 'To-Do', accent: 'todo-accent' },
  { key: 'in-progress' as TaskStatus, label: 'In Progress', accent: 'in-progress-accent' },
  { key: 'completed' as TaskStatus, label: 'Completed', accent: 'completed-accent' },
] as const;

const columnAccentColors = {
  todo: '#686DCA',
  'in-progress': '#CD845E',
  completed: '#5ECD7D'
} as const;

// Add a stable order state for each column
type ColumnOrder = {
  [K in TaskStatus]: string[];
};

const initialOrder: ColumnOrder = {
  todo: [],
  'in-progress': [],
  completed: [],
};

// Sortable Task Card
function SortableTaskCard({ 
  task, 
  onEdit, 
  onCheck, 
  isSelected = false,
  onSelect 
}: { 
  task: Task; 
  onEdit: (task: Task) => void; 
  onCheck: (task: Task) => void;
  isSelected?: boolean;
  onSelect?: (e: React.MouseEvent) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task
    }
  });

  const [isHovered, setIsHovered] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  
  // Swipe gesture for completing tasks on mobile
  const swipeRef = useSwipeGesture(
    {
      onSwipeLeft: () => {
        // Swipe left to complete (only if not already completed)
        if (task.status !== 'completed') {
          onCheck(task);
        }
        setSwipeOffset(0);
      },
      onSwipeRight: () => {
        // Swipe right to uncomplete (only if completed)
        if (task.status === 'completed') {
          onCheck(task);
        }
        setSwipeOffset(0);
      }
    },
    {
      threshold: 100, // Need to swipe at least 100px
      velocity: 0.3,
      preventDefault: false // Don't prevent default to allow drag-and-drop to work
    }
  );

  const statusRing = {
    todo: '#686DCA',
    'in-progress': '#CD845E',
    completed: '#5ECD7D'
  } as const;

  const priorityColors: Record<TaskPriority, string> = {
    urgent: '#EF4444',
    high: '#F59E0B',
    medium: '#3B82F6',
    low: '#6B7280'
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
    background: isSelected
      ? 'rgba(239,142,129,0.25)'
      : task.marketingTrack
      ? (isHovered ? 'rgba(239,142,129,0.18)' : 'rgba(239,142,129,0.12)')
      : (isHovered ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)'),
    borderRadius: '12px',
    padding: '0.9rem',
    marginBottom: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    userSelect: 'none' as const,
    touchAction: 'none' as const,
    border: isSelected
      ? '2px solid #EF8E81'
      : task.marketingTrack
      ? '1px solid rgba(239,142,129,0.3)'
      : '1px solid rgba(255,255,255,0.1)',
    cursor: 'pointer',
    boxShadow: isHovered || isSelected ? '0 8px 22px rgba(0,0,0,0.25)' : '0 2px 10px rgba(0,0,0,0.15)'
  };

  // Combine refs for drag-and-drop and swipe
  const combinedRef = useCallback((node: HTMLDivElement | null) => {
    setNodeRef(node);
    if (swipeRef && typeof swipeRef === 'object' && 'current' in swipeRef) {
      (swipeRef as React.MutableRefObject<HTMLElement | null>).current = node;
    }
  }, [setNodeRef]);

  return (
    <div 
      ref={combinedRef}
      data-task-id={task.id}
      style={{
        ...style,
        transform: `translateX(${swipeOffset}px) ${CSS.Transform.toString(transform)}`,
        transition: swipeOffset !== 0 ? 'transform 0.2s' : transition
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        style={{
          width: '12px',
          height: '20px',
          marginRight: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
          cursor: isDragging ? 'grabbing' : 'grab',
          opacity: 0.3,
          flexShrink: 0,
          touchAction: 'none',
        }}
      >
        <div style={{ width: '100%', height: '2px', background: '#FFF1E7', borderRadius: '1px' }} />
        <div style={{ width: '100%', height: '2px', background: '#FFF1E7', borderRadius: '1px' }} />
        <div style={{ width: '100%', height: '2px', background: '#FFF1E7', borderRadius: '1px' }} />
      </div>

      {/* Checkbox */}
      <span
        onClick={(e) => {
          e.stopPropagation();
          if (task.status !== 'completed') {
            burstConfettiAround(e.currentTarget as HTMLElement);
          }
          onCheck(task);
        }}
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          border: `2px solid ${statusRing[task.status]}`,
          marginRight: 12,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: task.status === 'completed' ? '#5ECD7D' : 'transparent',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          flexShrink: 0,
        }}
        aria-label={task.status === 'completed' ? 'Completed' : 'Mark as complete'}
      >
        {task.status === 'completed' && (
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 10.5L9 14.5L15 7.5" stroke="#22202F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>

      {/* Selection Checkbox */}
      {onSelect && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(e as any);
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(e);
          }}
          style={{
            marginRight: '8px',
            width: '18px',
            height: '18px',
            cursor: 'pointer',
            flexShrink: 0
          }}
        />
      )}

      {/* Priority Indicator */}
      {task.priority && task.priority !== 'medium' && (
        <div style={{
          width: '4px',
          height: '40px',
          background: priorityColors[task.priority],
          borderRadius: '2px',
          marginRight: '8px',
          flexShrink: 0
        }} title={`Priority: ${task.priority}`} />
      )}

      {/* Content */}
      <div 
        style={{ flex: 1 }}
        onClick={(e) => {
          if (onSelect && (e.ctrlKey || e.metaKey)) {
            onSelect(e);
            return;
          }
          e.stopPropagation();
          if (!isDragging) {
            onEdit(task);
          }
        }}
      >
        <div style={{ 
          fontSize: '1rem',
          color: '#FFF1E7',
          opacity: task.status === 'completed' ? 0.5 : 1,
          textDecoration: task.status === 'completed' ? 'line-through' : 'none',
          marginBottom: (task.marketingTrack || task.priority) ? '0.35rem' : '0',
          fontWeight: 600,
          letterSpacing: '0.2px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {task.title}
          {task.priority && task.priority !== 'medium' && (
            <span style={{
              fontSize: '0.7rem',
              padding: '0.2rem 0.4rem',
              borderRadius: '4px',
              background: priorityColors[task.priority] + '40',
              color: priorityColors[task.priority],
              fontWeight: 700,
              textTransform: 'uppercase'
            }}>
              {task.priority}
            </span>
          )}
        </div>
        {task.marketingTrack && (
          <div style={{
            fontSize: '0.85rem',
            color: '#EF8E81',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            marginTop: '0.25rem'
          }}>
            <span>🎯</span>
            <span>Marketing Track</span>
          </div>
        )}
        {task.deadline && (
          <div style={{
            fontSize: '0.75rem',
            color: '#FFF1E7',
            opacity: 0.6,
            marginTop: '0.25rem'
          }}>
            📅 {new Date(task.deadline).toLocaleDateString()}
          </div>
        )}
        {task.parentTaskId && (
          <div style={{
            fontSize: '0.75rem',
            color: '#3B82F6',
            opacity: 0.8,
            marginTop: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            <span>↳</span>
            <span>Subtask</span>
          </div>
        )}
        {task.dependsOn && task.dependsOn.length > 0 && (
          <div style={{
            fontSize: '0.75rem',
            color: '#F59E0B',
            opacity: 0.8,
            marginTop: '0.25rem'
          }}>
            ⛓ Depends on {task.dependsOn.length} task{task.dependsOn.length > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}

// Droppable Column
function DroppableColumn({ columnKey, children, isCompact }: { columnKey: TaskStatus; children: React.ReactNode; isCompact?: boolean }) {
  const { setNodeRef } = useDroppable({
    id: columnKey,
    data: {
      type: 'column',
      columnKey
    }
  });

  const columnColor = columnAccentColors[columnKey];

  return (
    <div 
      ref={setNodeRef} 
      style={{ 
        minHeight: 200, 
        width: isCompact ? '100%' : '33%',
        padding: '1rem',
        background: '#22202F',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease',
        position: 'relative',
        boxShadow: `0 0 10px 1px ${columnColor}`,
      }}
    >
      <div style={{ 
        padding: '0.75rem',
        background: columnColor,
        borderRadius: '8px',
        marginBottom: '1rem',
        color: '#FFF1E7',
        fontWeight: 600,
      }}>
        {columns.find(col => col.key === columnKey)?.label}
      </div>
      {children}
    </div>
  );
}

interface TaskTrackerWidgetProps {
  projects: Project[];
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  onProjectsChange: (projects: Project[]) => void;
  showEmptyState?: boolean;
  activeGoal?: any; // MarketingGoal type
}

export default function TaskTrackerWidget({ 
  projects, 
  tasks, 
  onTasksChange, 
  onProjectsChange,
  showEmptyState = false,
  activeGoal = null
}: TaskTrackerWidgetProps) {
  const { showTaskCompleted, showProgressUpdate, showSuccess } = useNotificationHelpers();
  const isMobile = useIsMobile();
  const isCompact = useIsCompact(); // Use vertical layout at 1100px or less
  const taskHistory = useTaskHistory(5); // Track last 5 deleted tasks
  
  const [viewMode, setViewMode] = useState<'kanban' | 'deadline' | 'archived'>('kanban');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'title' | 'none'>('none');
  const [order, setOrder] = useState<ColumnOrder>(initialOrder);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  
  // Ref to track previous tasks to prevent infinite loops
  const prevTasksRef = useRef<Task[]>([]);

  // Initialize order from tasks
  useEffect(() => {
    const newOrder: ColumnOrder = {
      todo: tasks.filter(t => t.status === 'todo').map(t => t.id),
      'in-progress': tasks.filter(t => t.status === 'in-progress').map(t => t.id),
      completed: tasks.filter(t => t.status === 'completed').map(t => t.id),
    };
    setOrder(newOrder);
  }, [tasks]);

  // Update project progress when tasks change
  useEffect(() => {
    // Check if tasks actually changed to prevent infinite loops
    const tasksChanged = JSON.stringify(tasks) !== JSON.stringify(prevTasksRef.current);
    if (!tasksChanged) return;
    
    const updatedProjects = projects.map(project => {
      const projectTasks = tasks.filter(task => project.tasks.includes(task.id));
      const totalWeight = projectTasks.reduce((sum, task) => {
        switch (task.status) {
          case 'completed':
            return sum + 100;
          case 'in-progress':
            return sum + 50;
          default:
            return sum;
        }
      }, 0);
      
      const newProgress = projectTasks.length > 0 ? Math.round(totalWeight / projectTasks.length) : 0;
      const shouldComplete = projectTasks.length > 0 && projectTasks.every(task => task.status === 'completed');
      
      return {
        ...project,
        progress: newProgress,
        status: shouldComplete ? 'completed' as const : 'active' as const
      };
    });
    
    // Only update if projects actually changed
    const projectsChanged = JSON.stringify(updatedProjects) !== JSON.stringify(projects);
    if (projectsChanged) {
      onProjectsChange(updatedProjects);
    }
    
    // Update the ref with current tasks
    prevTasksRef.current = tasks;
  }, [tasks, projects, onProjectsChange]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [quickAddValue, setQuickAddValue] = useState('');
  const quickAddRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Quick add: 'q' key (only when not in input/textarea)
      if (e.key === 'q' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName || '')) {
        e.preventDefault();
        quickAddRef.current?.focus();
      }
      
      // Create task: 'c' key
      if ((e.key === 'c' || e.key === 'n') && (e.ctrlKey || e.metaKey) && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName || '')) {
        e.preventDefault();
        openCreateModal();
      }
      
      // Select all: Ctrl/Cmd + A in task list (when not in input)
      if ((e.key === 'a' || e.key === 'A') && (e.ctrlKey || e.metaKey) && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName || '')) {
        e.preventDefault();
        setSelectedTasks(new Set(tasks.map(t => t.id)));
      }
      
      // Bulk complete: Ctrl/Cmd + Enter with selected tasks
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && selectedTasks.size > 0) {
        e.preventDefault();
        handleBulkComplete();
      }
      
      // Bulk delete: Delete or Backspace with selected tasks
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedTasks.size > 0 && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName || '')) {
        e.preventDefault();
        handleBulkDelete();
      }
      
      // Escape: Clear selection
      if (e.key === 'Escape' && selectedTasks.size > 0) {
        e.preventDefault();
        setSelectedTasks(new Set());
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [tasks, selectedTasks]);

  const handleQuickAdd = useCallback((template?: TaskTemplate) => {
    if (template) {
      const templateData = createTaskFromTemplate(template, tasks[0]?.project, tasks[0]?.projectId);
      const newTask: Task = {
        id: `tmp:${Date.now()}`,
        ...templateData,
        responsible: '',
        deadline: null,
        project: templateData.project || '',
        timeSpent: '',
        notifications: true,
        status: 'todo',
      } as Task;
      onTasksChange([...tasks, newTask]);
      setQuickAddValue('');
      setShowTemplates(false);
    } else if (quickAddValue.trim()) {
      const newTask: Task = {
        id: `tmp:${Date.now()}`,
        title: quickAddValue.trim(),
        description: '',
        responsible: '',
        deadline: null,
        project: tasks[0]?.project || '',
        projectId: tasks[0]?.projectId,
        timeSpent: '',
        notifications: true,
        status: 'todo',
        priority: 'medium',
      };
      onTasksChange([...tasks, newTask]);
      setQuickAddValue('');
      setShowQuickAdd(false);
    }
  }, [quickAddValue, tasks, onTasksChange]);

  const handleBulkComplete = useCallback(() => {
    const updatedTasks = tasks.map(t => 
      selectedTasks.has(t.id) && t.status !== 'completed'
        ? { ...t, status: 'completed' as TaskStatus }
        : t
    );
    onTasksChange(updatedTasks);
    setSelectedTasks(new Set());
  }, [tasks, selectedTasks, onTasksChange]);

  const handleBulkDelete = useCallback(() => {
    setShowBulkDeleteConfirm(true);
  }, []);

  const confirmBulkDelete = useCallback(() => {
    // Save deleted tasks to history
    const tasksToDelete = tasks.filter(t => selectedTasks.has(t.id));
    tasksToDelete.forEach(task => {
      taskHistory.deleteTask(task, task.status, order[task.status]);
    });
    
    const deletedCount = tasksToDelete.length;
    const remainingTasks = tasks.filter(t => !selectedTasks.has(t.id));
    onTasksChange(remainingTasks);
    
    // Update column orders
    const updatedOrder = { ...order };
    tasksToDelete.forEach(task => {
      updatedOrder[task.status] = updatedOrder[task.status].filter(id => id !== task.id);
    });
    setOrder(updatedOrder);
    
    setSelectedTasks(new Set());
    setShowBulkDeleteConfirm(false);
    
    // Show undo notification (restore last deleted task if only one)
    if (deletedCount === 1) {
      const deletedTask = tasksToDelete[0];
      showSuccess('Task Deleted', `"${deletedTask.title}" has been deleted.`, {
        label: 'Undo',
        onClick: () => {
          const restored = taskHistory.undoDelete();
          if (restored) {
            onTasksChange([...remainingTasks, restored.task]);
            setOrder({
              ...updatedOrder,
              [restored.status]: [...updatedOrder[restored.status], restored.task.id]
            });
            showSuccess('Task Restored', `"${restored.task.title}" has been restored.`);
          }
        }
      });
    } else {
      showSuccess('Tasks Deleted', `${deletedCount} tasks have been deleted.`);
    }
  }, [tasks, selectedTasks, onTasksChange, order, taskHistory, showSuccess]);

  const toggleTaskSelection = useCallback((taskId: string, e?: React.MouseEvent) => {
    if (e?.ctrlKey || e?.metaKey || e?.shiftKey) {
      e.preventDefault();
      setSelectedTasks(prev => {
        const newSet = new Set(prev);
        if (newSet.has(taskId)) {
          newSet.delete(taskId);
        } else {
          newSet.add(taskId);
        }
        return newSet;
      });
    }
  }, []);

  const openCreateModal = () => {
    const newTask: Task = {
      id: `tmp:${Date.now()}`,
      title: '',
      description: '',
      responsible: '',
      deadline: null,
      project: '',
      timeSpent: '',
      notifications: false,
      status: 'todo',
      priority: 'medium',
    };
    setEditingTask(newTask);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask({ ...task });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleSave = () => {
    if (editingTask) {
      if (tasks.find(t => t.id === editingTask.id)) {
        // Update existing task
        onTasksChange(tasks.map(t => t.id === editingTask.id ? editingTask : t));
      } else {
        // Add new task
        onTasksChange([...tasks, editingTask]);
        // Add to column order
        setOrder({
          ...order,
          [editingTask.status]: [...order[editingTask.status], editingTask.id]
        });
      }
      closeModal();
    }
  };

  const handleDelete = () => {
    if (editingTask) {
      setTaskToDelete(editingTask);
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      // Save to history before deleting
      taskHistory.deleteTask(taskToDelete, taskToDelete.status, order[taskToDelete.status]);
      
      onTasksChange(tasks.filter(t => t.id !== taskToDelete.id));
      // Remove from column order
      setOrder({
        ...order,
        [taskToDelete.status]: order[taskToDelete.status].filter(id => id !== taskToDelete.id)
      });
      
      const deletedTaskName = taskToDelete.title;
      setTaskToDelete(null);
      setShowDeleteConfirm(false);
      closeModal();
      
      // Show undo notification
      showSuccess('Task Deleted', `"${deletedTaskName}" has been deleted.`, {
        label: 'Undo',
        onClick: () => {
          const restored = taskHistory.undoDelete();
          if (restored) {
            // Restore task
            onTasksChange([...tasks, restored.task]);
            // Restore column order
            setOrder({
              ...order,
              [restored.status]: [...restored.columnOrder, restored.task.id]
            });
            showSuccess('Task Restored', `"${restored.task.title}" has been restored.`);
          }
        }
      });
    }
  };

  const archiveTask = (task: Task) => {
    onTasksChange(tasks.map(t => t.id === task.id ? ({ ...t, isArchived: true } as Task) : t));
    setOrder({
      ...order,
      [task.status]: order[task.status].filter(id => id !== task.id),
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    const task = tasks.find(t => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find(t => t.id === active.id);
    const overColumn = over.data.current?.type === 'column' ? over.id as Task['status'] : tasks.find(t => t.id === over.id)?.status;

    if (activeTask && overColumn && activeTask.status !== overColumn) {
      onTasksChange(tasks.map(t => {
        if (t.id === active.id) {
          return { ...t, status: overColumn };
        }
        return t;
      }));

      // Update order
      setOrder({
        ...order,
        [activeTask.status]: order[activeTask.status].filter(id => id !== active.id),
        [overColumn]: [...order[overColumn], active.id as string]
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      setActiveTask(null);
      return;
    }

    if (active.id !== over.id) {
      const activeTask = tasks.find(t => t.id === active.id);
      if (!activeTask) return;

      const activeIndex = order[activeTask.status].indexOf(active.id as string);
      const overTask = tasks.find(t => t.id === over.id);
      
      if (overTask && activeTask.status === overTask.status) {
        const overIndex = order[overTask.status].indexOf(over.id as string);
        
        setOrder({
          ...order,
          [activeTask.status]: arrayMove(order[activeTask.status], activeIndex, overIndex)
        });
      }
    }

    setActiveId(null);
    setActiveTask(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setActiveTask(null);
  };

  const handleCheck = (task: Task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    
    // Update task status
    onTasksChange(tasks.map(t => {
      if (t.id === task.id) {
        return { ...t, status: newStatus };
      }
      return t;
    }));

    // Update order
    setOrder({
      ...order,
      [task.status]: order[task.status].filter(id => id !== task.id),
      [newStatus]: [...order[newStatus], task.id]
    });

    // Show encouraging notification when task is completed
    if (newStatus === 'completed') {
      const shareContent = {
        taskName: task.title,
        trackName: activeGoal?.title || undefined,
        progress: activeGoal?.progress || undefined,
        weekNumber: activeGoal?.currentWeek || undefined,
        completedTasks: tasks.filter(t => t.status === 'completed').length + 1,
        totalTasks: tasks.length,
      };
      
      showTaskCompleted(task.title, undefined, shareContent);
      
      // Show progress update
      const completedTasks = tasks.filter(t => t.status === 'completed').length + 1; // +1 for the task we just completed
      const totalTasks = tasks.length;
      showProgressUpdate(completedTasks, totalTasks);
    }

    // Persist changes asynchronously
    (async () => {
      try {
        // If this task is linked to a marketing task, only update the marketing task
        if (task.marketingTrack && task.marketingTrack.marketingTaskId) {
          await apiService.updateMarketingTaskCompletion(task.marketingTrack.marketingTaskId, newStatus === 'completed');
        } else {
          // Only update main task status if this is a real task id and not a marketing task
          if (!String(task.id).startsWith('tmp:')) {
            await apiService.updateTaskStatus(task.id, newStatus);
          }
        }
      } catch (err) {
        logger.warn('Failed to persist task status', err);
      }
    })();
  };

  const updateField = (field: keyof Task, value: string | Date | null | TaskPriority | undefined) => {
    if (editingTask) {
      setEditingTask({
        ...editingTask,
        [field]: field === 'deadline' && value ? (value instanceof Date ? value.toISOString() : value) : value
      } as Task);
    }
  };

  return (
    <div style={{ padding: isMobile ? '0.75rem' : '1rem' }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'stretch' : 'center', 
        marginBottom: '1.25rem',
        gap: isMobile ? '1rem' : '0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h1 style={{ margin: 0, fontSize: isMobile ? '1.25rem' : '1.5rem', color: '#FFF1E7' }}>Task Tracker</h1>
          <HelpIcon 
            content="Drag and drop tasks between columns. Click a task to edit details. Marketing track tasks appear with a 🎯 icon and sync automatically." 
            position="bottom"
          />
        </div>
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center', 
          gap: '0.5rem' 
        }}>
          <button
            onClick={() => window.print()}
            className="print-button"
            style={{
              padding: isMobile ? '0.65rem' : '0.45rem 0.75rem',
              minHeight: '44px',
              display: isMobile ? 'block' : 'inline-block'
            }}
            title="Print this view"
          >
            🖨️ Print
          </button>
          <div style={{ 
            display: 'flex', 
            background: 'rgba(255,255,255,0.06)', 
            border: '1px solid rgba(255,255,255,0.12)', 
            borderRadius: 10, 
            padding: 2,
            justifyContent: isMobile ? 'stretch' : 'flex-start'
          }}>
            <button onClick={() => setViewMode('kanban')} style={{ 
              padding: isMobile ? '0.65rem' : '0.45rem 0.75rem', 
              border: 'none', 
              borderRadius: 8, 
              background: viewMode==='kanban'?'#2a2740':'transparent', 
              color: '#FFF1E7', 
              cursor: 'pointer',
              flex: isMobile ? '1' : 'none',
              minHeight: '44px'
            }}>Kanban</button>
            <button onClick={() => setViewMode('deadline')} style={{ 
              padding: isMobile ? '0.65rem' : '0.45rem 0.75rem', 
              border: 'none', 
              borderRadius: 8, 
              background: viewMode==='deadline'?'#2a2740':'transparent', 
              color: '#FFF1E7', 
              cursor: 'pointer',
              flex: isMobile ? '1' : 'none',
              minHeight: '44px'
            }}>Due Soon</button>
            <button onClick={() => setViewMode('archived')} style={{ 
              padding: isMobile ? '0.65rem' : '0.45rem 0.75rem', 
              border: 'none', 
              borderRadius: 8, 
              background: viewMode==='archived'?'#2a2740':'transparent', 
              color: '#FFF1E7', 
              cursor: 'pointer',
              flex: isMobile ? '1' : 'none',
              minHeight: '44px'
            }}>Archived</button>
          </div>
          <button
            onClick={openCreateModal}
            style={{
              background: '#EF8E81',
              color: '#FFF1E7',
              border: 'none',
              borderRadius: '8px',
              padding: isMobile ? '0.75rem 1rem' : '0.65rem 1rem',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              minHeight: '44px'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Add Task
          </button>
        </div>
      </div>

      {/* Empty State */}
      {showEmptyState && tasks.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem 2rem',
          background: 'rgba(239, 142, 129, 0.05)',
          borderRadius: '12px',
          border: '1px solid rgba(239, 142, 129, 0.1)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 1.5rem',
            background: 'rgba(239, 142, 129, 0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem'
          }}>
            📋
          </div>
          <h3 style={{
            margin: 0,
            marginBottom: '0.5rem',
            color: '#EF8E81',
            fontSize: '1.25rem',
            fontWeight: 600
          }}>
            {activeGoal ? 'No Tasks Yet' : 'No Tasks in Your Tracker'}
          </h3>
          <p style={{
            margin: 0,
            marginBottom: '1.5rem',
            color: '#FFF1E7',
            opacity: 0.7,
            fontSize: '0.95rem',
            maxWidth: '400px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            {activeGoal 
              ? `Your marketing track tasks will appear here once your current week's module unlocks. You can also add custom tasks anytime.`
              : 'Get started by choosing a marketing track or creating your first task.'
            }
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {!activeGoal && (
              <Link
                to="/app/marketing-track"
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#EF8E81',
                  color: '#FFF1E7',
                  borderRadius: '8px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'background 0.2s',
                  display: 'inline-block'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#E67A6E';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#EF8E81';
                }}
              >
                Choose a Marketing Track
              </Link>
            )}
            <button
              onClick={openCreateModal}
              style={{
                padding: '0.75rem 1.5rem',
                background: activeGoal ? '#EF8E81' : 'transparent',
                color: activeGoal ? '#FFF1E7' : '#EF8E81',
                border: activeGoal ? 'none' : '1px solid rgba(239, 142, 129, 0.5)',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (activeGoal) {
                  e.currentTarget.style.background = '#E67A6E';
                } else {
                  e.currentTarget.style.background = 'rgba(239, 142, 129, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeGoal) {
                  e.currentTarget.style.background = '#EF8E81';
                } else {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              Create Your First Task
            </button>
          </div>
        </div>
      )}

      {viewMode === 'kanban' && !showEmptyState && (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div style={{ 
          display: 'flex', 
          flexDirection: isCompact ? 'column' : 'row',
          gap: isCompact ? '1.5rem' : '1rem', 
          alignItems: 'flex-start' 
        }}>
          {columns.map(({ key }) => {
            const columnTasks = order[key as Task['status']];
            const isEmpty = columnTasks.length === 0;
            
            return (
              <DroppableColumn key={key} columnKey={key} isCompact={isCompact}>
                {isEmpty ? (
                  <div style={{ 
                    padding: '2rem 1rem', 
                    textAlign: 'center', 
                    color: '#FFF1E7', 
                    opacity: 0.4,
                    fontSize: '0.875rem',
                    minHeight: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div>
                      <div style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>
                        {key === 'todo' ? '📝' : key === 'in-progress' ? '⚙️' : '✓'}
                      </div>
                      <p style={{ margin: 0 }}>No {key.replace('-', ' ')} tasks</p>
                      {key === 'todo' && (
                        <button
                          onClick={openCreateModal}
                          style={{
                            marginTop: '0.75rem',
                            padding: '0.5rem 1rem',
                            background: 'rgba(239, 142, 129, 0.2)',
                            color: '#EF8E81',
                            border: '1px solid rgba(239, 142, 129, 0.3)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}
                        >
                          Add Task
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ maxHeight: isMobile ? 300 : 400, overflowY: 'auto', paddingRight: 4 }}>
                    <SortableContext items={columnTasks} strategy={verticalListSortingStrategy}>
                      {(() => {
                        // Sort tasks based on sortBy setting
                        let sortedTasks = columnTasks.map((taskId: string) => tasks.find(t => t.id === taskId)).filter(Boolean) as Task[];
                        
                        if (sortBy === 'priority') {
                          const priorityOrder: Record<TaskPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
                          sortedTasks = sortedTasks.sort((a, b) => {
                            const aPriority = a.priority || 'medium';
                            const bPriority = b.priority || 'medium';
                            return (priorityOrder[aPriority] || 2) - (priorityOrder[bPriority] || 2);
                          });
                        } else if (sortBy === 'deadline') {
                          sortedTasks = sortedTasks.sort((a, b) => {
                            if (!a.deadline && !b.deadline) return 0;
                            if (!a.deadline) return 1;
                            if (!b.deadline) return -1;
                            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
                          });
                        } else if (sortBy === 'title') {
                          sortedTasks = sortedTasks.sort((a, b) => a.title.localeCompare(b.title));
                        }
                        
                        return sortedTasks.map((task: Task) => (
                          <SortableTaskCard
                            key={task.id}
                            task={task}
                            onEdit={openEditModal}
                            onCheck={handleCheck}
                            isSelected={selectedTasks.has(task.id)}
                            onSelect={(e) => toggleTaskSelection(task.id, e)}
                          />
                        ));
                      })()}
                    </SortableContext>
                  </div>
                )}
              </DroppableColumn>
            );
          })}
        </div>

        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.5',
              },
            },
          }),
        }}>
          {activeId && activeTask ? (
            <SortableTaskCard
              task={activeTask}
              onEdit={openEditModal}
              onCheck={handleCheck}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
      )}

      {viewMode === 'deadline' && !showEmptyState && (
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '0.75rem' }}>
          <div style={{ display: 'flex', fontWeight: 600, opacity: 0.85, padding: '0.5rem 0.75rem', color: '#FFF1E7' }}>
            <div style={{ flex: 1 }}>Task</div>
            <div style={{ width: 180 }}>Deadline</div>
            <div style={{ width: 120 }}>Status</div>
          </div>
          <div style={{ maxHeight: 420, overflowY: 'auto', paddingRight: 4 }}>
            {tasks.filter(t => !!t.deadline).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#FFF1E7', opacity: 0.5 }}>
                <p>No tasks with deadlines yet.</p>
                <button
                  onClick={openCreateModal}
                  style={{
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    background: '#EF8E81',
                    color: '#FFF1E7',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Add a Task with Deadline
                </button>
              </div>
            ) : (
              (() => {
                let sortedTasks = tasks.filter(t => !!t.deadline);
                
                // Apply sorting
                if (sortBy === 'priority') {
                  const priorityOrder: Record<TaskPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
                  sortedTasks = sortedTasks.sort((a, b) => {
                    const aPriority = a.priority || 'medium';
                    const bPriority = b.priority || 'medium';
                    return (priorityOrder[aPriority] || 2) - (priorityOrder[bPriority] || 2);
                  });
                } else {
                  // Default to deadline sorting
                  sortedTasks = sortedTasks.sort((a, b) => new Date(a.deadline as string).getTime() - new Date(b.deadline as string).getTime());
                }
                
                return sortedTasks.map(task => (
                  <div key={task.id} role="button" onClick={() => openEditModal(task)} style={{ display: 'flex', alignItems: 'center', padding: '0.6rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}>
                    <div style={{ flex: 1, color: '#FFF1E7' }}>
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {task.title}
                        {task.priority && task.priority !== 'medium' && (
                          <span style={{
                            fontSize: '0.65rem',
                            padding: '0.15rem 0.35rem',
                            borderRadius: '4px',
                            background: priorityColors[task.priority] + '40',
                            color: priorityColors[task.priority],
                            fontWeight: 700,
                            textTransform: 'uppercase'
                          }}>
                            {task.priority}
                          </span>
                        )}
                      </div>
                      {task.marketingTrack && <div style={{ fontSize: '0.75rem', color: '#EF8E81' }}>🎯 Marketing Track</div>}
                      {task.parentTaskId && <div style={{ fontSize: '0.75rem', color: '#3B82F6', opacity: 0.8 }}>↳ Subtask</div>}
                      {task.dependsOn && task.dependsOn.length > 0 && <div style={{ fontSize: '0.75rem', color: '#F59E0B', opacity: 0.8 }}>⛓ Depends on {task.dependsOn.length} task{task.dependsOn.length > 1 ? 's' : ''}</div>}
                    </div>
                    <div style={{ width: 180, color: '#FFF1E7', opacity: 0.85 }}>{task.deadline ? new Date(task.deadline).toLocaleDateString() : '-'}</div>
                    <div style={{ width: 120 }}>
                      <span style={{ padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.8rem', background: task.status==='completed'?'#5ECD7D':task.status==='in-progress'?'#CD845E':'#686DCA', color: task.status==='completed'?'#22202F':'#FFF1E7' }}>{task.status.replace('-', ' ')}</span>
                    </div>
                  </div>
                ));
              })()
            )}
          </div>
        </div>
      )}

      {viewMode === 'archived' && !showEmptyState && (
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '0.75rem' }}>
          <div style={{ display: 'flex', fontWeight: 600, opacity: 0.85, padding: '0.5rem 0.75rem', color: '#FFF1E7' }}>
            <div style={{ flex: 1 }}>Task</div>
            <div style={{ width: 180 }}>Archived</div>
          </div>
          <div style={{ maxHeight: 420, overflowY: 'auto', paddingRight: 4 }}>
            {tasks.filter(t => (t as Task & { isArchived?: boolean }).isArchived).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#FFF1E7', opacity: 0.5 }}>
                <p>No archived tasks.</p>
              </div>
            ) : (
              tasks
                .filter(t => (t as Task & { isArchived?: boolean }).isArchived)
                .map(task => (
                  <div key={task.id} style={{ display: 'flex', alignItems: 'center', padding: '0.6rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ flex: 1, color: '#FFF1E7' }}>
                      <div style={{ fontWeight: 600 }}>{task.title}</div>
                      {task.marketingTrack && <div style={{ fontSize: '0.75rem', color: '#EF8E81' }}>🎯 Marketing Track</div>}
                    </div>
                    <div style={{ width: 180, color: '#FFF1E7', opacity: 0.85 }}>Yes</div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            position: 'fixed',
            inset: 0,
            animation: 'overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
          }} />
          <Dialog.Content style={{
            backgroundColor: '#22202F',
            borderRadius: '16px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35)',
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(560px, 92vw)',
            maxHeight: '86vh',
            padding: '1.25rem',
            animation: 'contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
            color: '#FFF1E7',
            border: '1px solid rgba(239,142,129,0.28)',
            overflow: 'hidden',
            overflowX: 'hidden',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Dialog.Title asChild>
              <h2 style={{ margin: 0, marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold', color: '#FFF1E7' }}>
                {editingTask?.id === tasks.find(t => t.id === editingTask?.id)?.id ? 'Edit Task' : 'Create Task'}
              </h2>
            </Dialog.Title>
            <Dialog.Description asChild>
              <p style={{ margin: 0, marginBottom: '1rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                {editingTask?.id === tasks.find(t => t.id === editingTask?.id)?.id ? 'Update the task details below.' : 'Fill in the details to create a new task.'}
              </p>
            </Dialog.Description>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', width: '100%', boxSizing: 'border-box', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title</label>
                <input
                  value={editingTask?.title || ''}
                  onChange={(e) => updateField('title', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.7rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#FFF1E7',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                <textarea
                  value={editingTask?.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.7rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#FFF1E7',
                    minHeight: '90px',
                    resize: 'vertical',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Project</label>
                <select
                  value={editingTask?.project || ''}
                  onChange={(e) => updateField('project', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.7rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#FFF1E7',
                    appearance: 'none',
                    cursor: 'pointer',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.name}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Responsible</label>
                <input
                  value={editingTask?.responsible || ''}
                  onChange={(e) => updateField('responsible', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.7rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#FFF1E7',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Deadline</label>
                <div style={{ width: '100%' }}>
                  <DatePicker
                    selected={editingTask?.deadline ? new Date(editingTask.deadline) : null}
                    onChange={(date) => updateField('deadline', date)}
                    dateFormat="MMMM d, yyyy"
                    wrapperClassName="date-picker-wrapper"
                    className="date-input"
                  />
                </div>
              </div>

              {/* Priority */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#FFF1E7', fontWeight: 600, fontSize: '0.9rem' }}>
                  Priority
                </label>
                <select
                  value={editingTask?.priority || 'medium'}
                  onChange={(e) => updateField('priority', e.target.value as TaskPriority)}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    color: '#FFF1E7',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Parent Task (Subtask) */}
              {tasks.length > 0 && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#FFF1E7', fontWeight: 600, fontSize: '0.9rem' }}>
                    Parent Task (Make this a subtask)
                  </label>
                  <select
                    value={editingTask?.parentTaskId || ''}
                    onChange={(e) => updateField('parentTaskId', e.target.value || undefined)}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#FFF1E7',
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">None (Top-level task)</option>
                    {tasks.filter(t => t.id !== editingTask?.id && !t.parentTaskId).map(task => (
                      <option key={task.id} value={task.id}>{task.title}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Dependencies */}
              {tasks.length > 0 && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#FFF1E7', fontWeight: 600, fontSize: '0.9rem' }}>
                    Depends On
                  </label>
                  <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', padding: '0.5rem', background: 'rgba(255, 255, 255, 0.04)' }}>
                    {tasks.filter(t => t.id !== editingTask?.id).map(task => (
                      <label key={task.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={editingTask?.dependsOn?.includes(task.id) || false}
                          onChange={(e) => {
                            if (editingTask) {
                              const currentDepends = editingTask.dependsOn || [];
                              const newDepends = e.target.checked
                                ? [...currentDepends, task.id]
                                : currentDepends.filter(id => id !== task.id);
                              setEditingTask({ ...editingTask, dependsOn: newDepends });
                            }
                          }}
                          style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                        />
                        <span style={{ color: '#FFF1E7', fontSize: '0.9rem' }}>{task.title}</span>
                      </label>
                    ))}
                    {tasks.filter(t => t.id !== editingTask?.id).length === 0 && (
                      <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem' }}>No other tasks available</span>
                    )}
                  </div>
                </div>
              )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', justifyContent: 'space-between', flexShrink: 0 }}>
              {editingTask && (
                <button
                  onClick={() => archiveTask(editingTask)}
                  style={{
                    padding: '0.6rem 1rem',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#FFF1E7',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                  }}
                >
                  Archive
                </button>
              )}
                <button
                  onClick={handleSave}
                  style={{
                    padding: '0.6rem 1rem',
                    background: 'linear-gradient(90deg, #EF8E81 0%, #ffb09e 100%)',
                    color: '#FFF1E7',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                  }}
                >
                  Save
                </button>
                {editingTask?.id === tasks.find(t => t.id === editingTask?.id)?.id && (
                  <button
                    onClick={handleDelete}
                    style={{
                      padding: '0.6rem 1rem',
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#FFF1E7',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      
      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Task?"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmColor="#EF4444"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setTaskToDelete(null);
        }}
      />
      
      <ConfirmDialog
        isOpen={showBulkDeleteConfirm}
        title="Delete Tasks?"
        message={`Are you sure you want to delete ${selectedTasks.size} selected task${selectedTasks.size > 1 ? 's' : ''}? This action cannot be undone.`}
        confirmLabel="Delete All"
        cancelLabel="Cancel"
        confirmColor="#EF4444"
        onConfirm={confirmBulkDelete}
        onCancel={() => setShowBulkDeleteConfirm(false)}
      />
    </div>
  );
}

// TypeScript module declaration for import
export {}; 