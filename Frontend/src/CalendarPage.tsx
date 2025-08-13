import { useMemo, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { CalendarEvent, Task, Project, EventCategory } from './types';
import { getCalendarEvents } from './utils';
import CreateEventModal from './CreateEventModal';
import QuickEventModal from './QuickEventModal';
import { apiService } from './services/api';

interface CalendarPageProps {
  tasks: Task[];
  projects: Project[];
  customEvents: CalendarEvent[];
  onCustomEventsChange: (events: CalendarEvent[]) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export default function CalendarPage({ tasks, projects, customEvents, onCustomEventsChange, onEventClick }: CalendarPageProps) {
  const [view, setView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth');
  const [creatingEvent, setCreatingEvent] = useState<{ start: string; end: string } | null>(null);
  const [quickEvent, setQuickEvent] = useState<{ start: string; end: string } | null>(null);
  const [calendarRef, setCalendarRef] = useState<{ getApi: () => { view: { type: string }; changeView: (view: string) => void } } | null>(null);
  const events = useMemo(() => getCalendarEvents(tasks, projects, customEvents), [tasks, projects, customEvents]);

  // Handle view changes
  useEffect(() => {
    if (calendarRef && calendarRef.getApi) {
      const api = calendarRef.getApi();
      if (api && api.view.type !== view) {
        api.changeView(view);
      }
    }
  }, [view, calendarRef]);

  const handleDateSelect = (selectInfo: { startStr: string; endStr: string }) => {
    // For month view, we want to create an all-day event on the selected date
    if (view === 'dayGridMonth') {
      const selectedDate = new Date(selectInfo.startStr);
      
      setCreatingEvent({
        start: selectedDate.toISOString().split('T')[0], // Just the date part
        end: selectedDate.toISOString().split('T')[0]
      });
    } else {
      // For week/day views, show the quick event modal
      setQuickEvent({
        start: selectInfo.startStr,
        end: selectInfo.endStr
      });
    }
  };

  const handleEventClick = (clickInfo: { event: { id: string } }) => {
    const calEvent = events.find(e => e.id === clickInfo.event.id);
    if (calEvent) onEventClick(calEvent);
  };

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
        
        // Set to start of day in local timezone and adjust for timezone
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        
        // Convert to UTC while preserving the local date
        const startYear = startDate.getFullYear();
        const startMonth = startDate.getMonth();
        const startDay = startDate.getDate();
        
        const endYear = endDate.getFullYear();
        const endMonth = endDate.getMonth();
        const endDay = endDate.getDate();
        
        // Create UTC dates for the same local date
        start = new Date(Date.UTC(startYear, startMonth, startDay)).toISOString();
        end = new Date(Date.UTC(endYear, endMonth, endDay, 23, 59, 59, 999)).toISOString();
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

  const handleQuickEventSave = async (eventData: { 
    title: string; 
    description: string; 
    duration: number; 
    projectId?: string;
    category?: EventCategory;
  }) => {
    if (quickEvent) {
      let start: string;
      let end: string;
      
      if (eventData.duration === 0) {
        // All-day event
        const startDate = new Date(quickEvent.start);
        
        // Convert to UTC while preserving the local date
        const year = startDate.getFullYear();
        const month = startDate.getMonth();
        const day = startDate.getDate();
        
        // Create UTC dates for the same local date
        start = new Date(Date.UTC(year, month, day)).toISOString();
        end = new Date(Date.UTC(year, month, day, 23, 59, 59, 999)).toISOString();
      } else {
        // Timed event - use the selected start time and calculate end time
        const startDateTime = new Date(quickEvent.start);
        const endDateTime = new Date(startDateTime.getTime() + eventData.duration * 60000);
        
        start = startDateTime.toISOString();
        end = endDateTime.toISOString();
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
      
      setQuickEvent(null);
    }
  };

  const handleQuickEventCancel = () => {
    setQuickEvent(null);
  };

  return (
    <div className="widget" style={{ padding: '2rem', borderRadius: '12px', minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ color: '#FFF1E7', margin: 0, fontSize: '2rem', fontWeight: 700, letterSpacing: '1px' }}>Marketing Calendar</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className={view === 'dayGridMonth' ? 'active' : ''} 
            onClick={() => setView('dayGridMonth')}
            style={{
              background: view === 'dayGridMonth' ? '#EF8E81' : 'transparent',
              color: '#FFF1E7',
              border: '1px solid #EF8E81',
              borderRadius: '999px',
              padding: '0.5rem 1.2rem',
              fontSize: '1rem',
              fontWeight: view === 'dayGridMonth' ? 700 : 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: view === 'dayGridMonth' ? '0 2px 8px 0 rgba(239, 142, 129, 0.15)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (view !== 'dayGridMonth') {
                e.currentTarget.style.background = 'rgba(239, 142, 129, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (view !== 'dayGridMonth') {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            Month
          </button>
          <button 
            className={view === 'timeGridWeek' ? 'active' : ''} 
            onClick={() => setView('timeGridWeek')}
            style={{
              background: view === 'timeGridWeek' ? '#EF8E81' : 'transparent',
              color: '#FFF1E7',
              border: '1px solid #EF8E81',
              borderRadius: '999px',
              padding: '0.5rem 1.2rem',
              fontSize: '1rem',
              fontWeight: view === 'timeGridWeek' ? 700 : 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: view === 'timeGridWeek' ? '0 2px 8px 0 rgba(239, 142, 129, 0.15)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (view !== 'timeGridWeek') {
                e.currentTarget.style.background = 'rgba(239, 142, 129, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (view !== 'timeGridWeek') {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            Week
          </button>
          <button 
            className={view === 'timeGridDay' ? 'active' : ''} 
            onClick={() => setView('timeGridDay')}
            style={{
              background: view === 'timeGridDay' ? '#EF8E81' : 'transparent',
              color: '#FFF1E7',
              border: '1px solid #EF8E81',
              borderRadius: '999px',
              padding: '0.5rem 1.2rem',
              fontSize: '1rem',
              fontWeight: view === 'timeGridDay' ? 700 : 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: view === 'timeGridDay' ? '0 2px 8px 0 rgba(239, 142, 129, 0.15)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (view !== 'timeGridDay') {
                e.currentTarget.style.background = 'rgba(239, 142, 129, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (view !== 'timeGridDay') {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            Day
          </button>
        </div>
      </div>
      
      <div style={{ 
        marginBottom: '1rem', 
        padding: '0.75rem', 
        background: 'rgba(239, 142, 129, 0.1)', 
        border: '1px solid rgba(239, 142, 129, 0.3)', 
        borderRadius: 8, 
        fontSize: '0.9rem', 
        color: '#EF8E81',
        textAlign: 'center'
      }}>
        {view === 'dayGridMonth' 
          ? '💡 Click on any date to create an all-day event'
          : '💡 Click and drag to select time slots for events (15-minute increments)'
        }
      </div>
      
      <div style={{
        background: '#23233a',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(239, 142, 129, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Beveled edge effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(239, 142, 129, 0.3) 50%, transparent 100%)',
          zIndex: 1
        }} />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(239, 142, 129, 0.3) 50%, transparent 100%)',
          zIndex: 1
        }} />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '2px',
          background: 'linear-gradient(180deg, transparent 0%, rgba(239, 142, 129, 0.3) 50%, transparent 100%)',
          zIndex: 1
        }} />
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '2px',
          background: 'linear-gradient(180deg, transparent 0%, rgba(239, 142, 129, 0.3) 50%, transparent 100%)',
          zIndex: 1
        }} />
        
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={view}
          views={{
            dayGridMonth: { 
              buttonText: 'Month',
              selectable: true,
              selectMirror: false
            },
            timeGridWeek: { 
              buttonText: 'Week',
              selectable: true,
              selectMirror: true,
              slotDuration: '00:15:00', // 15-minute increments
              slotMinTime: '06:00:00',
              slotMaxTime: '22:00:00'
            },
            timeGridDay: { 
              buttonText: 'Day',
              selectable: true,
              selectMirror: true,
              slotDuration: '00:15:00', // 15-minute increments
              slotMinTime: '06:00:00',
              slotMaxTime: '22:00:00'
            }
          }}
          headerToolbar={false}
          height="auto"
          events={events}
          selectable={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventBackgroundColor="#EF8E81"
          eventBorderColor="#EF8E81"
          eventTextColor="#FFF1E7"
          ref={setCalendarRef}
          selectConstraint={{
            start: '06:00',
            end: '22:00',
            dows: [0, 1, 2, 3, 4, 5, 6] // All days of week
          }}
        />
      </div>
      
      <CreateEventModal
        open={!!creatingEvent}
        startDate={creatingEvent?.start || ''}
        projects={projects.map(p => ({ id: p.id, name: p.name }))}
        onSave={handleCreateEvent}
        onCancel={handleCancelCreate}
      />
      
      <QuickEventModal
        open={!!quickEvent}
        startDate={quickEvent?.start || ''}
        projects={projects}
        onSave={handleQuickEventSave}
        onCancel={handleQuickEventCancel}
      />
    </div>
  );
} 