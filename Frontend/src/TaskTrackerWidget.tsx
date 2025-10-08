import { useState, useEffect, useRef } from 'react';
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
import { useIsMobile } from './hooks/useMediaQuery';
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
function SortableTaskCard({ task, onEdit, onCheck }: { task: Task; onEdit: (task: Task) => void; onCheck: (task: Task) => void }) {
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

  const statusRing = {
    todo: '#686DCA',
    'in-progress': '#CD845E',
    completed: '#5ECD7D'
  } as const;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
    background: task.marketingTrack
      ? (isHovered ? 'rgba(239,142,129,0.18)' : 'rgba(239,142,129,0.12)')
      : (isHovered ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)'),
    borderRadius: '12px',
    padding: '0.9rem',
    marginBottom: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    userSelect: 'none' as const,
    touchAction: 'none' as const,
    border: task.marketingTrack ? '1px solid rgba(239,142,129,0.3)' : '1px solid rgba(255,255,255,0.1)',
    cursor: 'pointer',
    boxShadow: isHovered ? '0 8px 22px rgba(0,0,0,0.25)' : '0 2px 10px rgba(0,0,0,0.15)'
  };

  return (
    <div ref={setNodeRef} style={style} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
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

      {/* Content */}
      <div 
        style={{ flex: 1 }}
        onClick={(e) => {
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
          marginBottom: task.marketingTrack ? '0.35rem' : '0',
          fontWeight: 600,
          letterSpacing: '0.2px'
        }}>
          {task.title}
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
      </div>
    </div>
  );
}

// Droppable Column
function DroppableColumn({ columnKey, children, isMobile }: { columnKey: TaskStatus; children: React.ReactNode; isMobile?: boolean }) {
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
        width: isMobile ? '100%' : '33%',
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
}

export default function TaskTrackerWidget({ projects, tasks, onTasksChange, onProjectsChange }: TaskTrackerWidgetProps) {
  const { showTaskCompleted, showProgressUpdate } = useNotificationHelpers();
  const isMobile = useIsMobile();
  const DEBUG = (import.meta as { env?: { DEV?: boolean } }).env?.DEV && (typeof localStorage !== 'undefined' && localStorage.getItem('debugLogs') === '1');
  if (DEBUG) {
    logger.debug('TaskTrackerWidget render', { tasksCount: tasks.length });
  }
  
  const [viewMode, setViewMode] = useState<'kanban' | 'deadline' | 'archived'>('kanban');
  const [order, setOrder] = useState<ColumnOrder>(initialOrder);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  // Ref to track previous tasks to prevent infinite loops
  const prevTasksRef = useRef<Task[]>([]);

  // Initialize order from tasks
  useEffect(() => {
    if (DEBUG) {
      logger.debug('TaskTrackerWidget tasks changed', { tasksCount: tasks.length });
    }
    
    const newOrder: ColumnOrder = {
      todo: tasks.filter(t => t.status === 'todo').map(t => t.id),
      'in-progress': tasks.filter(t => t.status === 'in-progress').map(t => t.id),
      completed: tasks.filter(t => t.status === 'completed').map(t => t.id),
    };
    if (DEBUG) {
      logger.debug('TaskTrackerWidget new order', { orderCount: newOrder.length });
    }
    setOrder(newOrder);
  }, [tasks, DEBUG]);

  // Update project progress when tasks change
  useEffect(() => {
    // Check if tasks actually changed to prevent infinite loops
    const tasksChanged = JSON.stringify(tasks) !== JSON.stringify(prevTasksRef.current);
    if (!tasksChanged) return;
    
    if (DEBUG) {
      logger.debug('TaskTrackerWidget updating project progress');
    }
    
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
  }, [tasks, projects, onProjectsChange, DEBUG]);

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
      onTasksChange(tasks.filter(t => t.id !== editingTask.id));
      // Remove from column order
      setOrder({
        ...order,
        [editingTask.status]: order[editingTask.status].filter(id => id !== editingTask.id)
      });
      closeModal();
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
      showTaskCompleted(task.title);
      
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
        if (DEBUG) logger.warn('Failed to persist task status', err);
      }
    })();
  };

  const updateField = (field: keyof Task, value: string | Date | null) => {
    if (editingTask) {
      setEditingTask({
        ...editingTask,
        [field]: field === 'deadline' && value ? (value instanceof Date ? value.toISOString() : value) : value
      });
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
        <h1 style={{ margin: 0, fontSize: isMobile ? '1.25rem' : '1.5rem', color: '#FFF1E7' }}>Task Tracker</h1>
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center', 
          gap: '0.5rem' 
        }}>
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

      {viewMode === 'kanban' && (
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
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '1.5rem' : '1rem', 
          alignItems: 'flex-start' 
        }}>
          {columns.map(({ key }) => (
            <DroppableColumn key={key} columnKey={key} isMobile={isMobile}>
              <div style={{ maxHeight: isMobile ? 300 : 400, overflowY: 'auto', paddingRight: 4 }}>
                <SortableContext items={order[key as Task['status']]} strategy={verticalListSortingStrategy}>
                  {order[key as Task['status']].map((taskId: string) => {
                    const task = tasks.find(t => t.id === taskId);
                    if (!task) return null;
                    return (
                      <SortableTaskCard
                        key={task.id}
                        task={task}
                        onEdit={openEditModal}
                        onCheck={handleCheck}
                      />
                    );
                  })}
                </SortableContext>
              </div>
            </DroppableColumn>
          ))}
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

      {viewMode === 'deadline' && (
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '0.75rem' }}>
          <div style={{ display: 'flex', fontWeight: 600, opacity: 0.85, padding: '0.5rem 0.75rem', color: '#FFF1E7' }}>
            <div style={{ flex: 1 }}>Task</div>
            <div style={{ width: 180 }}>Deadline</div>
            <div style={{ width: 120 }}>Status</div>
          </div>
          <div style={{ maxHeight: 420, overflowY: 'auto', paddingRight: 4 }}>
            {tasks
              .filter(t => !!t.deadline)
              .sort((a, b) => new Date(a.deadline as string).getTime() - new Date(b.deadline as string).getTime())
              .map(task => (
                <div key={task.id} role="button" onClick={() => openEditModal(task)} style={{ display: 'flex', alignItems: 'center', padding: '0.6rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}>
                  <div style={{ flex: 1, color: '#FFF1E7' }}>
                    <div style={{ fontWeight: 600 }}>{task.title}</div>
                    {task.marketingTrack && <div style={{ fontSize: '0.75rem', color: '#EF8E81' }}>🎯 Marketing Track</div>}
                  </div>
                  <div style={{ width: 180, color: '#FFF1E7', opacity: 0.85 }}>{task.deadline ? new Date(task.deadline).toLocaleDateString() : '-'}</div>
                  <div style={{ width: 120 }}>
                    <span style={{ padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.8rem', background: task.status==='completed'?'#5ECD7D':task.status==='in-progress'?'#CD845E':'#686DCA', color: task.status==='completed'?'#22202F':'#FFF1E7' }}>{task.status.replace('-', ' ')}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {viewMode === 'archived' && (
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '0.75rem' }}>
          <div style={{ display: 'flex', fontWeight: 600, opacity: 0.85, padding: '0.5rem 0.75rem', color: '#FFF1E7' }}>
            <div style={{ flex: 1 }}>Task</div>
            <div style={{ width: 180 }}>Archived</div>
          </div>
          <div style={{ maxHeight: 420, overflowY: 'auto', paddingRight: 4 }}>
            {tasks
              .filter(t => (t as Task & { isArchived?: boolean }).isArchived)
              .map(task => (
                <div key={task.id} style={{ display: 'flex', alignItems: 'center', padding: '0.6rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ flex: 1, color: '#FFF1E7' }}>
                    <div style={{ fontWeight: 600 }}>{task.title}</div>
                    {task.marketingTrack && <div style={{ fontSize: '0.75rem', color: '#EF8E81' }}>🎯 Marketing Track</div>}
                  </div>
                  <div style={{ width: 180, color: '#FFF1E7', opacity: 0.85 }}>Yes</div>
                </div>
              ))}
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
            <Dialog.Title style={{ margin: 0, marginBottom: '1.5rem' }}>
              {editingTask?.id === tasks.find(t => t.id === editingTask?.id)?.id ? 'Edit Task' : 'Create Task'}
            </Dialog.Title>
            <Dialog.Description style={{ margin: 0, marginBottom: '1rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              {editingTask?.id === tasks.find(t => t.id === editingTask?.id)?.id ? 'Update the task details below.' : 'Fill in the details to create a new task.'}
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
    </div>
  );
}

// TypeScript module declaration for import
export {}; 