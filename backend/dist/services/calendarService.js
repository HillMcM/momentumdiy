"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarService = void 0;
const supabase_1 = require("../config/supabase");
class CalendarService {
    static async getCalendarEvents(startDate, endDate) {
        try {
            let query = supabase_1.supabase
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
            const events = data.map(this.mapDatabaseEventToEvent);
            return {
                success: true,
                data: events
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    static async getCalendarEventById(id) {
        try {
            const { data, error } = await supabase_1.supabase
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
            const event = this.mapDatabaseEventToEvent(data);
            return {
                success: true,
                data: event
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    static async createCalendarEvent(eventData) {
        try {
            const { data, error } = await supabase_1.supabase
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
            const event = this.mapDatabaseEventToEvent(data);
            return {
                success: true,
                data: event,
                message: 'Calendar event created successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    static async updateCalendarEvent(id, updates) {
        try {
            const updateData = {};
            if (updates.title !== undefined)
                updateData.title = updates.title;
            if (updates.description !== undefined)
                updateData.description = updates.description;
            if (updates.start !== undefined)
                updateData.start_time = new Date(updates.start).toISOString();
            if (updates.end !== undefined) {
                updateData.end_time = updates.end ? new Date(updates.end).toISOString() : null;
            }
            if (updates.type !== undefined)
                updateData.type = updates.type;
            if (updates.refId !== undefined)
                updateData.ref_id = updates.refId;
            if (updates.category !== undefined)
                updateData.category = updates.category;
            const { data, error } = await supabase_1.supabase
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
            const event = this.mapDatabaseEventToEvent(data);
            return {
                success: true,
                data: event,
                message: 'Calendar event updated successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    static async deleteCalendarEvent(id) {
        try {
            const { error } = await supabase_1.supabase
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
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    static async getEventsByDateRange(startDate, endDate) {
        return this.getCalendarEvents(startDate, endDate);
    }
    static async getEventsByType(type) {
        try {
            const { data, error } = await supabase_1.supabase
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
            const events = data.map(this.mapDatabaseEventToEvent);
            return {
                success: true,
                data: events
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    static async getEventsByCategory(category) {
        try {
            const { data, error } = await supabase_1.supabase
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
            const events = data.map(this.mapDatabaseEventToEvent);
            return {
                success: true,
                data: events
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    static async getEventsByReference(refId) {
        try {
            const { data, error } = await supabase_1.supabase
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
            const events = data.map(this.mapDatabaseEventToEvent);
            return {
                success: true,
                data: events
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    static mapDatabaseEventToEvent(dbEvent) {
        const event = {
            id: dbEvent.id,
            title: dbEvent.title,
            start: dbEvent.start_time,
            type: dbEvent.type,
        };
        if (dbEvent.description)
            event.description = dbEvent.description;
        if (dbEvent.end_time)
            event.end = dbEvent.end_time;
        if (dbEvent.ref_id)
            event.refId = dbEvent.ref_id;
        if (dbEvent.category)
            event.category = dbEvent.category;
        return event;
    }
}
exports.CalendarService = CalendarService;
//# sourceMappingURL=calendarService.js.map