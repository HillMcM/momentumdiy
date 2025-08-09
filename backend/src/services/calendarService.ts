import { supabase } from '../config/supabase';
import { 
  CalendarEvent, 
  CreateCalendarEventRequest, 
  UpdateCalendarEventRequest, 
  ApiResponse,
  DatabaseCalendarEvent 
} from '../types';

export class CalendarService {
  /**
   * Get all calendar events with optional date filtering
   */
  static async getCalendarEvents(startDate?: string, endDate?: string): Promise<ApiResponse<CalendarEvent[]>> {
    try {
      let query = supabase
        .from('calendar_events')
        .select('*')
        .order('start_time', { ascending: true });

      if (startDate) {
        query = query.gte('start_time', startDate);
      }

      if (endDate) {
        query = query.lte('start_time', endDate);
      }

      const { data, error } = await query;

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      const events: CalendarEvent[] = (data as DatabaseCalendarEvent[]).map(this.mapDatabaseEventToEvent);

      return {
        success: true,
        data: events
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get a single calendar event by ID
   */
  static async getCalendarEventById(id: string): Promise<ApiResponse<CalendarEvent>> {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      if (!data) {
        return {
          success: false,
          error: 'Calendar event not found'
        };
      }

      const event = this.mapDatabaseEventToEvent(data as DatabaseCalendarEvent);

      return {
        success: true,
        data: event
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Create a new calendar event
   */
  static async createCalendarEvent(eventData: CreateCalendarEventRequest): Promise<ApiResponse<CalendarEvent>> {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert([{
          title: eventData.title,
          description: eventData.description || '',
          start_time: new Date(eventData.start).toISOString(),
          end_time: eventData.end ? new Date(eventData.end).toISOString() : null,
          type: eventData.type,
          ref_id: eventData.refId || null,
          category: eventData.category || null
        }])
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      const event = this.mapDatabaseEventToEvent(data as DatabaseCalendarEvent);

      return {
        success: true,
        data: event,
        message: 'Calendar event created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Update an existing calendar event
   */
  static async updateCalendarEvent(id: string, updates: UpdateCalendarEventRequest): Promise<ApiResponse<CalendarEvent>> {
    try {
      const updateData: any = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.start !== undefined) updateData.start_time = new Date(updates.start).toISOString();
      if (updates.end !== undefined) {
        updateData.end_time = updates.end ? new Date(updates.end).toISOString() : null;
      }
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.refId !== undefined) updateData.ref_id = updates.refId;
      if (updates.category !== undefined) updateData.category = updates.category;

      const { data, error } = await supabase
        .from('calendar_events')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      if (!data) {
        return {
          success: false,
          error: 'Calendar event not found'
        };
      }

      const event = this.mapDatabaseEventToEvent(data as DatabaseCalendarEvent);

      return {
        success: true,
        data: event,
        message: 'Calendar event updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Delete a calendar event
   */
  static async deleteCalendarEvent(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        message: 'Calendar event deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get events for a specific date range
   */
  static async getEventsByDateRange(startDate: string, endDate: string): Promise<ApiResponse<CalendarEvent[]>> {
    return this.getCalendarEvents(startDate, endDate);
  }

  /**
   * Get events by type (task, project, custom)
   */
  static async getEventsByType(type: 'task' | 'project' | 'custom'): Promise<ApiResponse<CalendarEvent[]>> {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('type', type)
        .order('start_time', { ascending: true });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      const events: CalendarEvent[] = (data as DatabaseCalendarEvent[]).map(this.mapDatabaseEventToEvent);

      return {
        success: true,
        data: events
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get events by category
   */
  static async getEventsByCategory(category: string): Promise<ApiResponse<CalendarEvent[]>> {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('category', category)
        .order('start_time', { ascending: true });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      const events: CalendarEvent[] = (data as DatabaseCalendarEvent[]).map(this.mapDatabaseEventToEvent);

      return {
        success: true,
        data: events
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get events for a specific reference (task or project)
   */
  static async getEventsByReference(refId: string): Promise<ApiResponse<CalendarEvent[]>> {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('ref_id', refId)
        .order('start_time', { ascending: true });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      const events: CalendarEvent[] = (data as DatabaseCalendarEvent[]).map(this.mapDatabaseEventToEvent);

      return {
        success: true,
        data: events
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Map database event to frontend event format
   */
  private static mapDatabaseEventToEvent(dbEvent: DatabaseCalendarEvent): CalendarEvent {
    const event: CalendarEvent = {
      id: dbEvent.id,
      title: dbEvent.title,
      start: dbEvent.start_time,
      type: dbEvent.type,
    };
    if (dbEvent.description) event.description = dbEvent.description;
    if (dbEvent.end_time) event.end = dbEvent.end_time;
    if (dbEvent.ref_id) event.refId = dbEvent.ref_id;
    if (dbEvent.category) event.category = dbEvent.category;
    return event;
  }
} 