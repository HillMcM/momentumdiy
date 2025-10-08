import { useState, useEffect, useRef } from 'react';
import type { CalendarEvent, EventCategory } from './types';

interface CreateEventModalProps {
  open: boolean;
  startDate?: string;
  projects: Array<{ id: string; name: string }>;
  event?: CalendarEvent; // For editing mode
  onSave: (eventData: { 
    title: string; 
    description: string; 
    startTime: string; 
    endTime: string; 
    projectId?: string;
    category?: EventCategory;
  }) => void;
  onCancel: () => void;
  onDelete?: (eventId: string) => void; // For deleting events
}

export default function CreateEventModal({ open, startDate, projects, event, onSave, onCancel, onDelete }: CreateEventModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [isAllDay, setIsAllDay] = useState(true);
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<EventCategory>('meeting');
  const [isValid, setIsValid] = useState(false);

  const isEditing = !!event;

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
    if (open) {
      if (isEditing && event) {
        // Pre-fill form for editing
        setTitle(event.title);
        setDescription(event.description || '');
        
        // Handle start time
        if (event.start) {
          const startDate = new Date(event.start);
          if (startDate.getHours() === 0 && startDate.getMinutes() === 0) {
            setIsAllDay(true);
            setStartTime('09:00');
            setEndTime('10:00');
          } else {
            setIsAllDay(false);
            setStartTime(startDate.toTimeString().slice(0, 5));
            
            // Handle end time
            if (event.end) {
              const endDate = new Date(event.end);
              setEndTime(endDate.toTimeString().slice(0, 5));
            } else {
              setEndTime('10:00');
            }
          }
        }
        
        setProjectId(event.refId?.toString());
        setCategory(event.category || 'meeting');
      } else {
        // Reset form for creating
        setTitle('');
        setDescription('');
        setStartTime('09:00');
        setEndTime('10:00');
        setIsAllDay(true);
        setProjectId(undefined);
      }
    }
  }, [open, isEditing, event]);

  useEffect(() => {
    // Validate form
    const titleValid = title.trim().length > 0;
    const timeValid = isAllDay || startTime < endTime;
    setIsValid(titleValid && timeValid);
  }, [title, startTime, endTime, isAllDay]);

  // Focus management for accessibility
  useEffect(() => {
    if (open) {
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
  }, [open]);

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
  }, [open, onCancel, isValid]);

  if (!open) return null;

  const handleSave = () => {
    if (isValid) {
      onSave({ 
        title: title.trim(), 
        description: description.trim(),
        startTime: isAllDay ? '' : startTime,
        endTime: isAllDay ? '' : endTime,
        projectId,
        category
      });
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };



  const getEventDate = () => {
    if (isEditing && event?.start) {
      return formatDate(event.start);
    }
    if (startDate) {
      return formatDate(startDate);
    }
    return 'Select a date';
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-event-modal-title"
      aria-describedby="create-event-modal-description"
    >
      <div
        ref={modalRef}
        className="modal-content"
        style={{
          background: '#22202F', color: '#FFF1E7', borderRadius: 12, padding: '2rem', minWidth: 400, maxWidth: 500,
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)', position: 'relative'
        }}
        role="document"
        tabIndex={-1}
      >
        <h2 id="create-event-modal-title" style={{ marginTop: 0, marginBottom: '1rem' }}>
          {isEditing ? 'Edit Event' : 'Create New Event'}
        </h2>
        <p id="create-event-modal-description" style={{ margin: 0, marginBottom: '1.5rem', color: 'rgba(255, 255, 255, 0.7)' }}>
          {isEditing ? 'Update the event details below.' : 'Fill in the details below to create a new calendar event.'}
        </p>
        
        <div style={{ 
          background: 'rgba(239, 142, 129, 0.1)', 
          border: '1px solid rgba(239, 142, 129, 0.3)', 
          borderRadius: 8, 
          padding: '1rem', 
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          color: '#EF8E81'
        }}>
          <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Event Date:</div>
          <div>{getEventDate()}</div>
          <div style={{ opacity: 0.8, marginTop: '0.5rem' }}>
            All-day event (or set specific time below)
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
            <>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ flex: 1 }}>
                  Start Time
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
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
                
                <label style={{ flex: 1 }}>
                  End Time
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
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
              </div>
              {startTime >= endTime && (
                <div style={{ 
                  color: '#EF8E81', 
                  fontSize: '0.85rem', 
                  marginTop: '-0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  ⚠️ End time must be after start time
                </div>
              )}
            </>
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
              {eventCategories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {isEditing && onDelete && (
              <button 
                onClick={() => {
                  if (event && onDelete) {
                    onDelete(event.id);
                  }
                }}
                style={{ 
                  background: '#dc3545', 
                  color: '#FFF1E7', 
                  border: 'none', 
                  borderRadius: 8, 
                  padding: '0.75rem 1.5rem', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e74c3c';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#dc3545';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Delete Event
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
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
              {isEditing ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
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