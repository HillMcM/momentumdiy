import { useState, useEffect, useCallback } from 'react';
import type { Project } from './types';

interface TaskModalProps {
  open: boolean;
  onSave: (taskData: { 
    title: string; 
    description: string; 
    responsible: string;
    deadline: string | null;
    projectId?: string;
    marketingTrack?: {
      goalId: string;
      moduleId: string;
    };
  }) => void;
  onCancel: () => void;
  projects: Project[];
  marketingTrack?: {
    goalId: string;
    moduleId: string;
    goalTitle: string;
    moduleTitle: string;
  };
}

export default function TaskModal({ open, onSave, onCancel, projects, marketingTrack }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [responsible, setResponsible] = useState('Hillary');
  const [deadline, setDeadline] = useState<string>('');
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (open) {
      // Reset form for creating
      setTitle('');
      setDescription('');
      setResponsible('Hillary');
      setDeadline('');
      setProjectId(undefined);
    }
  }, [open]);

  useEffect(() => {
    // Validate form
    const titleValid = title.trim().length > 0;
    setIsValid(titleValid);
  }, [title]);

  const handleSave = useCallback(() => {
    if (isValid) {
      onSave({ 
        title: title.trim(), 
        description: description.trim(),
        responsible: responsible.trim(),
        deadline: deadline || null,
        projectId,
        marketingTrack: marketingTrack ? {
          goalId: marketingTrack.goalId,
          moduleId: marketingTrack.moduleId
        } : undefined
      });
    }
  }, [isValid, onSave, title, description, responsible, deadline, projectId, marketingTrack]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter' && e.ctrlKey && isValid) {
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel, isValid, handleSave]);

  if (!open) return null;

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getMinDate = () => {
    return formatDate(new Date());
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="modal-content" style={{
        background: '#22202F', color: '#FFF1E7', borderRadius: 12, padding: '2rem', minWidth: 400, maxWidth: 500,
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)', position: 'relative'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>
          Create New Task
        </h2>
        
        {marketingTrack && (
          <div style={{ 
            background: 'rgba(104, 109, 202, 0.1)', 
            border: '1px solid rgba(104, 109, 202, 0.3)', 
            borderRadius: 8, 
            padding: '1rem', 
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            color: '#686DCA'
          }}>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Marketing Track Task:</div>
            <div>{marketingTrack.goalTitle}</div>
            <div style={{ opacity: 0.8, marginTop: '0.25rem' }}>
              Week: {marketingTrack.moduleTitle}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label>
            Task Title *
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter task title..."
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                borderRadius: 8, 
                border: '1px solid #444', 
                background: '#191628', 
                color: '#FFF1E7', 
                marginTop: 4,
                transition: 'border-color 0.2s',
                outline: 'none',
                fontSize: '1rem'
              }}
              onFocus={(e) => e.target.style.borderColor = '#EF8E81'}
              onBlur={(e) => e.target.style.borderColor = '#444'}
              autoFocus
            />
          </label>

          <label>
            Description
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Enter task description..."
              rows={3}
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                borderRadius: 8, 
                border: '1px solid #444', 
                background: '#191628', 
                color: '#FFF1E7', 
                marginTop: 4,
                transition: 'border-color 0.2s',
                outline: 'none',
                fontSize: '1rem',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => e.target.style.borderColor = '#EF8E81'}
              onBlur={(e) => e.target.style.borderColor = '#444'}
            />
          </label>

          <label>
            Responsible
            <input
              type="text"
              value={responsible}
              onChange={e => setResponsible(e.target.value)}
              placeholder="Enter responsible person..."
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                borderRadius: 8, 
                border: '1px solid #444', 
                background: '#191628', 
                color: '#FFF1E7', 
                marginTop: 4,
                transition: 'border-color 0.2s',
                outline: 'none',
                fontSize: '1rem'
              }}
              onFocus={(e) => e.target.style.borderColor = '#EF8E81'}
              onBlur={(e) => e.target.style.borderColor = '#444'}
            />
          </label>

          <label>
            Deadline
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              min={getMinDate()}
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                borderRadius: 8, 
                border: '1px solid #444', 
                background: '#191628', 
                color: '#FFF1E7', 
                marginTop: 4,
                transition: 'border-color 0.2s',
                outline: 'none',
                fontSize: '1rem'
              }}
              onFocus={(e) => e.target.style.borderColor = '#EF8E81'}
              onBlur={(e) => e.target.style.borderColor = '#444'}
            />
          </label>

          <label>
            Project (Optional)
            <select
              value={projectId || ''}
              onChange={e => setProjectId(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                borderRadius: 8, 
                border: '1px solid #444', 
                background: '#191628', 
                color: '#FFF1E7', 
                marginTop: 4,
                transition: 'border-color 0.2s',
                outline: 'none',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
              onFocus={(e) => e.target.style.borderColor = '#EF8E81'}
              onBlur={(e) => e.target.style.borderColor = '#444'}
            >
              <option value="">No project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button
            onClick={handleSave}
            disabled={!isValid}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: isValid ? '#EF8E81' : 'rgba(255, 255, 255, 0.1)',
              color: '#FFF1E7',
              border: 'none',
              borderRadius: 8,
              cursor: isValid ? 'pointer' : 'not-allowed',
              fontSize: '1rem',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (isValid) e.currentTarget.style.background = '#ffb09e';
            }}
            onMouseLeave={(e) => {
              if (isValid) e.currentTarget.style.background = '#EF8E81';
            }}
          >
            Create Task
          </button>
          <button
            onClick={onCancel}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              color: '#FFF1E7',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Cancel
          </button>
        </div>

        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem', 
          background: 'rgba(255, 255, 255, 0.05)', 
          borderRadius: 8, 
          fontSize: '0.8rem', 
          color: '#FFF1E7',
          opacity: 0.7
        }}>
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Keyboard shortcuts:</div>
          <div>Ctrl + Enter: Create task</div>
          <div>Escape: Cancel</div>
        </div>
      </div>
    </div>
  );
} 