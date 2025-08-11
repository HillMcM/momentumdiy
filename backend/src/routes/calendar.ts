import { Router, Request, Response } from 'express';
import { CalendarService } from '../services/calendarService';
import { validate } from '../middleware/validate';
import { routeRateLimit } from '../middleware/rate';
import { CreateCalendarEventRequest, UpdateCalendarEventRequest } from '../types';

const router = Router();

/**
 * GET /api/calendar/events
 * Get all calendar events with optional date filtering
 */
router.get('/events', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    
    const result = await CalendarService.getCalendarEvents(startDate, endDate);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/calendar/events/:id
 * Get a single calendar event by ID
 */
router.get('/events/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    
    const result = await CalendarService.getCalendarEventById(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/calendar/events
 * Create a new calendar event
 */
router.post('/events', routeRateLimit(60), validate((req) => {
  const body = req.body || {};
  if (!body.title) return 'Title is required';
  if (!body.start) return 'Start time is required';
  if (!body.type) return 'Event type is required';
  return undefined;
}), async (req: Request, res: Response) => {
  try {
    const eventData: CreateCalendarEventRequest = req.body;
    
    // Validate required fields
    if (!eventData.title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }

    if (!eventData.start) {
      return res.status(400).json({
        success: false,
        error: 'Start time is required'
      });
    }

    if (!eventData.type) {
      return res.status(400).json({
        success: false,
        error: 'Event type is required'
      });
    }

    // Validate date format
    try {
      new Date(eventData.start);
      if (eventData.end) {
        new Date(eventData.end);
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format'
      });
    }

    const result = await CalendarService.createCalendarEvent(eventData);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * PUT /api/calendar/events/:id
 * Update an existing calendar event
 */
router.put('/events/:id', routeRateLimit(60), async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    const updates: UpdateCalendarEventRequest = { ...req.body, id };
    
    const result = await CalendarService.updateCalendarEvent(id, updates);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * DELETE /api/calendar/events/:id
 * Delete a calendar event
 */
router.delete('/events/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
    
    const result = await CalendarService.deleteCalendarEvent(id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/calendar/events/date-range
 * Get events for a specific date range
 */
router.get('/events/date-range', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Start date and end date are required'
      });
    }

    const result = await CalendarService.getEventsByDateRange(startDate, endDate);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/calendar/events/type/:type
 * Get events by type (task, project, custom)
 */
router.get('/events/type/:type', async (req: Request, res: Response) => {
  try {
    const type = req.params['type'] as string;
    
    if (!['task', 'project', 'custom'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid event type. Must be task, project, or custom'
      });
    }

    const result = await CalendarService.getEventsByType(type as 'task' | 'project' | 'custom');

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/calendar/events/category/:category
 * Get events by category
 */
router.get('/events/category/:category', async (req: Request, res: Response) => {
  try {
    const category = req.params['category'] as string;
    
    const result = await CalendarService.getEventsByCategory(category);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/calendar/events/reference/:refId
 * Get events for a specific reference (task or project)
 */
router.get('/events/reference/:refId', async (req: Request, res: Response) => {
  try {
    const refId = req.params['refId'] as string;
    
    const result = await CalendarService.getEventsByReference(refId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router; 