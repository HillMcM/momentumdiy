import { useState, useEffect, useCallback } from 'react';
import type { EventCategory } from './types';

interface QuickEventModalProps {
  open: boolean;
  startDate: string;
  projects: Array<{ id: string; name: string }>;
  onSave: (eventData: { 
    title: string; 
    description: string; 
    duration: number; // in minutes
    projectId?: string;
    category?: EventCategory;
  }) => void;
  onCancel: () => void;
}

export default function QuickEventModal({ open, startDate, projects, onSave, onCancel }: QuickEventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(60); // default 1 hour
  const [isAllDay, setIsAllDay] = useState(false);
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<EventCategory>('meeting');
  const [isValid, setIsValid] = useState(false);

  const eventCategories = [
    { value: 'meeting', label: 'Meeting' },
    { value: 'social-post', label: 'Social Media Post' },
    { value: 'networking', label: 'Networking Event' },
    { value: 'content-creation', label: 'Content Creation' },
    { value: 'email-campaign', label: 'Email Campaign' },
    { value: 'ad-campaign', label: 'Ad Campaign' },
    { value: 'website-update', label: 'Website Update' },
    { value: 'client-presentation', label: 'Client Presentation' },
    { value: 'strategy-session', label: 'Strategy Session' },
    { value: 'training', label: 'Training' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    // Reset form when modal opens
    if (open) {
      setTitle('');
      setDescription('');
      setDuration(60);
      setIsAllDay(false);
      setProjectId(undefined);
    }
  }, [open]);

  useEffect(() => {
    // Validate form
    const titleValid = title.trim().length > 0;
    const durationValid = duration > 0;
    setIsValid(titleValid && durationValid);
  }, [title, duration]);

  const handleSave = useCallback(() => {
    if (isValid) {
      onSave({ 
        title: title.trim(), 
        description: description.trim(),
        duration: isAllDay ? 0 : duration, // 0 for all-day events
        projectId,
        category
      });
    }
  }, [isValid, onSave, title, description, duration, isAllDay, projectId, category]);

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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const calculateEndTime = () => {
    if (isAllDay) return 'All day';
    const start = new Date(startDate);
    const end = new Date(start.getTime() + duration * 60000);
    return formatTime(end.toISOString());
  };

  const durationOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
    { value: 180, label: '3 hours' },
    { value: 240, label: '4 hours' },
    { value: 480, label: '8 hours' },
  ];

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="modal-content" style={{
        background: '#22202F', color: '#FFF1E7', borderRadius: 12, padding: '2rem', minWidth: 400, maxWidth: 500,
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)', position: 'relative'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Quick Event</h2>
        
        <div style={{ 
          background: 'rgba(239, 142, 129, 0.1)', 
          border: '1px solid rgba(239, 142, 129, 0.3)', 
          borderRadius: 8, 
          padding: '1rem', 
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          color: '#EF8E81'
        }}>
          <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Selected Time:</div>
          <div>{formatDate(startDate)}</div>
          <div style={{ opacity: 0.8 }}>
            {formatTime(startDate)} - {calculateEndTime()}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label>
            Event Title *
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter event title..."
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
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            marginBottom: '1rem',
            padding: '0.75rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 8
          }}>
            <input
              type="checkbox"
              id="allDay"
              checked={isAllDay}
              onChange={e => setIsAllDay(e.target.checked)}
              style={{ 
                width: '1.2rem', 
                height: '1.2rem',
                accentColor: '#EF8E81'
              }}
            />
            <label 
              htmlFor="allDay" 
              style={{ 
                cursor: 'pointer',
                fontWeight: 600,
                color: '#FFF1E7'
              }}
            >
              All-day event
            </label>
          </div>
          
          {!isAllDay && (
            <label>
              Duration
              <select
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
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
              >
                {durationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          )}
          
          <label>
            Link to Project
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
                fontSize: '1rem'
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
          
          <label>
            Category
            <select
              value={category}
              onChange={e => setCategory(e.target.value as EventCategory)}
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
            >
              {eventCategories.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          
          <label>
            Description
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Enter event description (optional)..."
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                borderRadius: 8, 
                border: '1px solid #444', 
                background: '#191628', 
                color: '#FFF1E7', 
                marginTop: 4, 
                minHeight: 80,
                transition: 'border-color 0.2s',
                outline: 'none',
                resize: 'vertical',
                fontSize: '1rem'
              }}
              onFocus={(e) => e.target.style.borderColor = '#EF8E81'}
              onBlur={(e) => e.target.style.borderColor = '#444'}
            />
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
          <button 
            onClick={onCancel} 
            style={{ 
              background: 'none', 
              color: '#FFF1E7', 
              border: '1px solid #444', 
              borderRadius: 8, 
              padding: '0.75rem 1.5rem', 
              fontWeight: 600, 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = '#666';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.borderColor = '#444';
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            style={{ 
              background: isValid ? '#EF8E81' : '#666', 
              color: '#FFF1E7', 
              border: 'none', 
              borderRadius: 8, 
              padding: '0.75rem 1.5rem', 
              fontWeight: 700, 
              cursor: isValid ? 'pointer' : 'not-allowed', 
              opacity: isValid ? 1 : 0.7,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (isValid) {
                e.currentTarget.style.background = '#ffb09e';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (isValid) {
                e.currentTarget.style.background = '#EF8E81';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            Create Event
          </button>
        </div>

        <div style={{ 
          marginTop: '1rem', 
          padding: '0.5rem', 
          background: 'rgba(255, 255, 255, 0.05)', 
          borderRadius: 6, 
          fontSize: '0.8rem', 
          color: '#FFF1E7', 
          opacity: 0.7,
          textAlign: 'center'
        }}>
          💡 Tip: Press Ctrl+Enter to create, or Escape to cancel
        </div>
      </div>
    </div>
  );
} 