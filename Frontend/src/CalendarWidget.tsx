import { useMemo, useState } from 'react';
import type { CalendarEvent, Task, Project, EventCategory } from './types';
import { getCalendarEvents } from './utils';
import CreateEventModal from './CreateEventModal';
import { apiService } from './services/api';
import { logger } from './utils/logger';

interface CalendarWidgetProps {
  tasks: Task[];
  projects: Project[];
  customEvents: CalendarEvent[];
  onCustomEventsChange: (events: CalendarEvent[]) => void;
  onEventClick: (event: CalendarEvent) => void;
}

function getStartOfWeek(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // Sunday
  return d;
}
function getEndOfWeek(date: Date) {
  const d = getStartOfWeek(date);
  d.setDate(d.getDate() + 6); // Saturday
  d.setHours(23, 59, 59, 999);
  return d;
}

export default function CalendarWidget({ tasks, projects, customEvents, onCustomEventsChange, onEventClick }: CalendarWidgetProps) {
  const [creatingEvent, setCreatingEvent] = useState<{ start: string; end: string } | null>(null);
  
  const allEvents = useMemo(() => getCalendarEvents(tasks, projects, customEvents), [tasks, projects, customEvents]);
  const now = new Date();
  const weekStart = getStartOfWeek(now);
  const weekEnd = getEndOfWeek(now);

  // Filter events for this week - be more inclusive
  const weekEvents = allEvents.filter(e => {
    try {
      const eventDate = new Date(e.start);
      // Include events that start on or after the start of the week and before the end of the week
      // Also include events that are today (current date)
      const isInWeek = eventDate >= weekStart && eventDate <= weekEnd;
      const isToday = eventDate.toDateString() === now.toDateString();
      return isInWeek || isToday;
    } catch (error) {
      logger.error('Error parsing event date', error, { eventStart: e.start });
      return false;
    }
  }).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const handleCreateEvent = async (eventData: { 
    title: string; 
    description: string; 
    startTime: string; 
    endTime: string; 
    projectId?: string;
    category?: EventCategory;
  }) => {
    if (creatingEvent) {
      let start: string;
      let end: string;
      
      if (eventData.startTime && eventData.endTime) {
        // Specific time event
        const startDateTime = new Date(creatingEvent.start);
        const [startHour, startMinute] = eventData.startTime.split(':').map(Number);
        startDateTime.setHours(startHour, startMinute, 0, 0);
        
        const endDateTime = new Date(creatingEvent.end);
        const [endHour, endMinute] = eventData.endTime.split(':').map(Number);
        endDateTime.setHours(endHour, endMinute, 0, 0);
        
        start = startDateTime.toISOString();
        end = endDateTime.toISOString();
      } else {
        // All-day event - ensure we're using the correct date
        const startDate = new Date(creatingEvent.start);
        const endDate = new Date(creatingEvent.end);
        
        // Set to start of day in local timezone
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        
        start = startDate.toISOString();
        end = endDate.toISOString();
      }
      
      try {
        const response = await apiService.createCalendarEvent({
          title: eventData.title,
          description: eventData.description,
          start,
          end,
          type: 'custom',
          refId: eventData.projectId,
          category: eventData.category,
        });

        if (response.success && response.data) {
          onCustomEventsChange([...customEvents, response.data]);
        } else {
          console.error('Failed to create calendar event:', response.error);
        }
      } catch (error) {
        console.error('Error creating calendar event:', error);
      }
      
      setCreatingEvent(null);
    }
  };

  const handleCancelCreate = () => {
    setCreatingEvent(null);
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const accentColor = '#EF8E81';

  const getCategoryLabel = (category?: EventCategory) => {
    if (!category) return '';
    
    const categoryLabels: Record<EventCategory, string> = {
      'meeting': 'Meeting',
      'social-post': 'Social Media Post',
      'networking': 'Networking Event',
      'content-creation': 'Content Creation',
      'email-campaign': 'Email Campaign',
      'ad-campaign': 'Ad Campaign',
      'website-update': 'Website Update',
      'client-presentation': 'Client Presentation',
      'strategy-session': 'Strategy Session',
      'training': 'Training',
      'other': 'Other'
    };
    
    return categoryLabels[category];
  };

  return (
    <div className="widget" style={{ padding: '1rem', borderRadius: '12px', minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ color: '#FFF1E7', margin: 0, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.5px' }}>This Week's Marketing Calendar</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => {
              const today = new Date();
              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);
              setCreatingEvent({
                start: today.toISOString().split('T')[0],
                end: tomorrow.toISOString().split('T')[0]
              });
            }}
            style={{
              background: '#EF8E81',
              color: '#FFF1E7',
              border: 'none',
              borderRadius: '6px',
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(239, 142, 129, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ffb09e';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 142, 129, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#EF8E81';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 142, 129, 0.2)';
            }}
          >
            + Create Event
          </button>

        </div>
      </div>
      {weekEvents.length === 0 ? (
        <div style={{ 
          color: '#FFF1E7', 
          opacity: 0.7, 
          textAlign: 'center', 
          padding: '2rem',
          background: 'rgba(239, 142, 129, 0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(239, 142, 129, 0.1)'
        }}>
          No events this week.
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {weekEvents.map(event => {
            const date = new Date(event.start);
            const day = dayNames[date.getDay()];
            const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            return (
              <li
                key={event.id}
                onClick={() => onEventClick(event)}
                style={{
                  background: '#23233a',
                  borderLeft: `6px solid ${accentColor}`,
                  borderRadius: '8px',
                  marginBottom: '0.75rem',
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  transition: 'all 0.2s',
                  border: '1px solid rgba(239, 142, 129, 0.1)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#2a2a3a';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#23233a';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div style={{ minWidth: 70, fontWeight: 600, color: accentColor }}>{day}</div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <span style={{ color: '#FFF1E7', fontWeight: 600, fontSize: '1.05em' }}>{event.title}</span>
                  <span style={{ color: '#FFF1E7', opacity: 0.7, fontSize: '0.98em' }}>{dateStr}</span>
                </div>
                <div style={{ color: accentColor, fontWeight: 700, fontSize: '0.98em', textTransform: 'capitalize' }}>
                  {event.type === 'custom' && event.category ? getCategoryLabel(event.category) : event.type}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      
      <CreateEventModal
        open={!!creatingEvent}
        startDate={creatingEvent?.start || ''}
        projects={projects.map(p => ({ id: p.id, name: p.name }))}
        onSave={handleCreateEvent}
        onCancel={handleCancelCreate}
      />
    </div>
  );
} 