import { CalendarEvent, CreateCalendarEventRequest, UpdateCalendarEventRequest, ApiResponse } from '../types';
export declare class CalendarService {
    static getCalendarEvents(startDate?: string, endDate?: string): Promise<ApiResponse<CalendarEvent[]>>;
    static getCalendarEventById(id: string): Promise<ApiResponse<CalendarEvent>>;
    static createCalendarEvent(eventData: CreateCalendarEventRequest): Promise<ApiResponse<CalendarEvent>>;
    static updateCalendarEvent(id: string, updates: UpdateCalendarEventRequest): Promise<ApiResponse<CalendarEvent>>;
    static deleteCalendarEvent(id: string): Promise<ApiResponse<void>>;
    static getEventsByDateRange(startDate: string, endDate: string): Promise<ApiResponse<CalendarEvent[]>>;
    static getEventsByType(type: 'task' | 'project' | 'custom'): Promise<ApiResponse<CalendarEvent[]>>;
    static getEventsByCategory(category: string): Promise<ApiResponse<CalendarEvent[]>>;
    static getEventsByReference(refId: string): Promise<ApiResponse<CalendarEvent[]>>;
    private static mapDatabaseEventToEvent;
}
//# sourceMappingURL=calendarService.d.ts.map