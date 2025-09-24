import { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TrackModule {
  id: string;
  goal_id: string;
  week_number: number;
  title: string;
  description?: string;
  content: string;
  pro_tip?: string;
  is_unlocked: boolean;
  is_completed: boolean;
  created_at: string;
}

interface TrackTask {
  id: string;
  module_id: string;
  title: string;
  description: string;
  estimated_time: string;
  order_index: number;
  created_at: string;
}

interface ModuleEditorProps {
  module: TrackModule | null;
  trackId: string;
  onSave: (savedModule: TrackModule) => void;
  onCancel: () => void;
  isCreating?: boolean;
}

export default function ModuleEditor({ module, trackId, onSave, onCancel, isCreating = false }: ModuleEditorProps) {
  const [formData, setFormData] = useState({
    week_number: 1,
    title: '',
    description: '',
    content: '',
    pro_tip: ''
  });
  
  const [tasks, setTasks] = useState<TrackTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const showMessage = (msg: string, isError = false) => {
    if (isError) {
      setError(msg);
    } else {
      // For now, just log success messages
      console.log('Success:', msg);
    }
    setTimeout(() => {
      setError(null);
    }, 3000);
  };

  // Initialize form data when module changes
  useEffect(() => {
    if (module) {
      setFormData({
        week_number: module.week_number,
        title: module.title,
        description: module.description || '',
        content: module.content,
        pro_tip: module.pro_tip || ''
      });
    } else if (isCreating) {
      setFormData({
        week_number: 1,
        title: '',
        description: '',
        content: '',
        pro_tip: ''
      });
    }
  }, [module, isCreating]);

  // Load tasks when module changes
  useEffect(() => {
    if (module && module.id) {
      loadTasks();
    }
  }, [module]);

  const loadTasks = async () => {
    if (!module?.id) return;
    
    try {
      const response = await adminApi.listTrackTasks(module.id);
      if (response.success) {
        // Sort tasks by order_index to ensure proper ordering
        const sortedTasks = (response.data || []).sort((a, b) => a.order_index - b.order_index);
        setTasks(sortedTasks);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      setError('Please fill in all required fields (title, content)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let response;
      if (isCreating) {
        response = await adminApi.createTrackModule(trackId, formData);
      } else {
        response = await adminApi.updateTrackModule(module!.id, formData);
      }

      if (response.success) {
        onSave(response.data);
      } else {
        setError(response.error || 'Failed to save module');
      }
    } catch (error) {
      setError('Failed to save module');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!module?.id) return;

    const taskData = {
      title: 'New Task',
      description: 'Task description',
      estimated_time: '30min',
      order_index: tasks.length
    };

    try {
      const response = await adminApi.createTrackTask(module.id, taskData);
      if (response.success) {
        await loadTasks(); // Reload tasks
      } else {
        setError(response.error || 'Failed to create task');
      }
    } catch (error) {
      setError('Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<TrackTask>) => {
    try {
      const response = await adminApi.updateTrackTask(taskId, updates);
      if (response.success) {
        await loadTasks(); // Reload tasks
      } else {
        setError(response.error || 'Failed to update task');
      }
    } catch (error) {
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await adminApi.deleteTrackTask(taskId);
      if (response.success) {
        await loadTasks(); // Reload tasks
      } else {
        setError(response.error || 'Failed to delete task');
      }
    } catch (error) {
      setError('Failed to delete task');
    }
  };

  const handleBulkCreateTasks = async (tasksText: string) => {
    if (!module?.id || !tasksText.trim()) return;

    try {
      const response = await adminApi.createBulkTasks(module.id, tasksText);
      if (response.success) {
        await loadTasks(); // Reload tasks
      } else {
        setError(response.error || 'Failed to create tasks');
      }
    } catch (error) {
      setError('Failed to create tasks');
    }
  };

  const handleBulkCreateTasksFromTextarea = async (tasksText: string) => {
    if (!module?.id || !tasksText.trim()) return;

    try {
      const response = await adminApi.createBulkTasks(module.id, tasksText);
      if (response.success) {
        await loadTasks(); // Reload tasks
        showMessage(`Created ${(response.data as any)?.created || 0} tasks`);
      } else {
        setError(response.error || 'Failed to create tasks');
      }
    } catch (error) {
      setError('Failed to create tasks');
    }
  };

  // Handle drag and drop reordering
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = tasks.findIndex(task => task.id === active.id);
    const newIndex = tasks.findIndex(task => task.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Update local state immediately for better UX
    const reorderedTasks = arrayMove(tasks, oldIndex, newIndex);
    setTasks(reorderedTasks);

    // Update order indices in the backend
    try {
      const updates = reorderedTasks.map((task, index) => ({
        id: task.id,
        order_index: index
      }));

      // Update all tasks with new order indices
      await Promise.all(updates.map(update => 
        adminApi.updateTrackTask(update.id, { order_index: update.order_index })
      ));

      showMessage('Task order updated successfully');
    } catch (error) {
      console.error('Failed to update task order:', error);
      setError('Failed to update task order');
      // Revert to original order on error
      await loadTasks();
    }
  };

  return (
    <div className="bg-[#1B1628] rounded-2xl border border-[#2A243E] p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          {isCreating ? 'Create New Module' : `Edit Module: Week ${module?.week_number}`}
        </h2>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="bg-gray-600 text-white border border-gray-600 rounded-full px-4 py-2 text-sm font-medium hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-green-600 text-white border border-green-600 rounded-full px-4 py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Module'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Module Basic Information */}
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Week Number:</label>
            <input
              type="number"
              min="1"
              max="12"
              value={formData.week_number}
              onChange={(e) => setFormData({ ...formData, week_number: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 rounded bg-[#141127] border border-[#2A243E] text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title:</label>
            <input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded bg-[#141127] border border-[#2A243E] text-white"
              placeholder="Week title"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description:</label>
          <input
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 rounded bg-[#141127] border border-[#2A243E] text-white"
            placeholder="Brief description of this week"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Content (Markdown):</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full h-40 px-3 py-2 rounded bg-[#141127] border border-[#2A243E] text-white font-mono text-sm"
            placeholder={`# Week ${formData.week_number}: Main Topic

## Key Concepts
- Bullet point 1
- Bullet point 2

### Action Steps
1. Numbered step 1
2. Numbered step 2

**Bold text** for emphasis
*Italic text* for subtle emphasis
\`code snippets\` for technical terms

> Quote important insights

Use blank lines to separate paragraphs for better readability.`}
          />
          <div className="mt-1 text-xs text-gray-400">
            💡 Tip: Use markdown formatting for better readability. Headers (#), lists (-), **bold**, *italic*, `code`, and &gt; quotes are supported.
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Pro Tip:</label>
          <textarea
            value={formData.pro_tip}
            onChange={(e) => setFormData({ ...formData, pro_tip: e.target.value })}
            className="w-full h-24 px-3 py-2 rounded bg-[#141127] border border-[#2A243E] text-white text-sm"
            placeholder="Add a helpful pro tip for this week..."
          />
          <div className="mt-1 text-xs text-gray-400">
            💡 Optional pro tip that will be highlighted in the user interface
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      {!isCreating && module && (
        <div className="pt-6 border-t border-[#2A243E]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Tasks for this Module</h3>
              <p className="text-xs text-gray-400 mt-1">
                💡 Drag the grip icon (⋮⋮) to reorder tasks. Order matters for user workflow!
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreateTask}
                className="text-xs bg-[#EF8E81] text-white px-3 py-1 rounded hover:bg-[#EF8E81]/80"
              >
                + Add Task
              </button>
            </div>
          </div>

          {/* Bulk Task Creation */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Quick Tasks (one per line):</label>
            <textarea
              placeholder={`Complete social media audit\nRecord baseline metrics\nCreate content calendar`}
              className="w-full h-20 px-3 py-2 rounded bg-[#141127] border border-[#2A243E] text-white text-sm"
              onBlur={(e) => {
                if (e.target.value.trim()) {
                  handleBulkCreateTasksFromTextarea(e.target.value);
                  e.target.value = '';
                }
              }}
            />
            <div className="mt-1 text-xs text-gray-400">
              💡 Type tasks here and click outside to create them all at once
            </div>
          </div>

          {/* Task List with Drag and Drop */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <SortableTaskItem
                    key={task.id}
                    task={task}
                    onUpdate={(updates) => handleUpdateTask(task.id, updates)}
                    onDelete={() => handleDeleteTask(task.id)}
                  />
                ))}
                {tasks.length === 0 && (
                  <p className="text-gray-500 text-sm italic">No tasks added yet. Click "Add Task" to create tasks for this module.</p>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}

// Sortable Task Item Component
interface TaskItemProps {
  task: TrackTask;
  onUpdate: (updates: Partial<TrackTask>) => void;
  onDelete: () => void;
}

function SortableTaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-[#141127] rounded-lg border border-[#2A243E] ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
    >
      <TaskItem task={task} onUpdate={onUpdate} onDelete={onDelete} dragHandleProps={{...attributes, ...listeners}} />
    </div>
  );
}

// Task Item Component
function TaskItem({ task, onUpdate, onDelete, dragHandleProps }: TaskItemProps & { dragHandleProps?: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description,
    estimated_time: task.estimated_time
  });

  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      title: task.title,
      description: task.description,
      estimated_time: task.estimated_time
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-[#141127] rounded-lg p-4 border border-[#2A243E]">
      {isEditing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Task Title:</label>
              <input
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                className="w-full px-2 py-1 rounded bg-[#1B1628] border border-[#2A243E] text-white text-sm"
                placeholder="Task name"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Estimated Time:</label>
              <input
                value={editData.estimated_time}
                onChange={(e) => setEditData({ ...editData, estimated_time: e.target.value })}
                className="w-full px-2 py-1 rounded bg-[#1B1628] border border-[#2A243E] text-white text-sm"
                placeholder="30min"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Task Description:</label>
            <textarea
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              className="w-full px-2 py-1 rounded bg-[#1B1628] border border-[#2A243E] text-white text-sm h-16"
              placeholder="Describe what the user needs to do..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="text-xs text-gray-400 hover:text-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={onDelete}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3 flex-1">
            {/* Drag Handle */}
            {dragHandleProps && (
              <div
                {...dragHandleProps}
                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-300 p-1"
                title="Drag to reorder"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </div>
            )}
            <div className="flex-1">
              <h4 className="font-medium text-white text-sm">{task.title}</h4>
              {task.description && (
                <p className="text-gray-400 text-xs mt-1">{task.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-xs">{task.estimated_time}</span>
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
