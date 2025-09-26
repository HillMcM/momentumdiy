"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const calendarService_1 = require("../services/calendarService");
const validate_1 = require("../middleware/validate");
const rate_1 = require("../middleware/rate");
const router = (0, express_1.Router)();
router.get('/events', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const result = await calendarService_1.CalendarService.getCalendarEvents(startDate, endDate);
        if (!result.success) {
            return res.status(400).json(result);
        }
        return res.json(result);
    }
    catch (_error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.get('/events/:id', async (req, res) => {
    try {
        const id = req.params['id'];
        const result = await calendarService_1.CalendarService.getCalendarEventById(id);
        if (!result.success) {
            return res.status(404).json(result);
        }
        return res.json(result);
    }
    catch (_error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.post('/events', (0, rate_1.routeRateLimit)(60), (0, validate_1.validate)((req) => {
    const body = req.body || {};
    if (!body.title)
        return 'Title is required';
    if (!body.start)
        return 'Start time is required';
    if (!body.type)
        return 'Event type is required';
    return undefined;
}), async (req, res) => {
    try {
        const eventData = req.body;
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
        try {
            new Date(eventData.start);
            if (eventData.end) {
                new Date(eventData.end);
            }
        }
        catch (_error) {
            return res.status(400).json({
                success: false,
                error: 'Invalid date format'
            });
        }
        const result = await calendarService_1.CalendarService.createCalendarEvent(eventData);
        if (!result.success) {
            return res.status(400).json(result);
        }
        return res.status(201).json(result);
    }
    catch (_error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.put('/events/:id', (0, rate_1.routeRateLimit)(60), async (req, res) => {
    try {
        const id = req.params['id'];
        const updates = { ...req.body, id };
        const result = await calendarService_1.CalendarService.updateCalendarEvent(id, updates);
        if (!result.success) {
            return res.status(404).json(result);
        }
        return res.json(result);
    }
    catch (_error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.delete('/events/:id', async (req, res) => {
    try {
        const id = req.params['id'];
        const result = await calendarService_1.CalendarService.deleteCalendarEvent(id);
        if (!result.success) {
            return res.status(404).json(result);
        }
        return res.json(result);
    }
    catch (_error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.get('/events/date-range', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                error: 'Start date and end date are required'
            });
        }
        const result = await calendarService_1.CalendarService.getEventsByDateRange(startDate, endDate);
        if (!result.success) {
            return res.status(400).json(result);
        }
        return res.json(result);
    }
    catch (_error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.get('/events/type/:type', async (req, res) => {
    try {
        const type = req.params['type'];
        if (!['task', 'project', 'custom'].includes(type)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid event type. Must be task, project, or custom'
            });
        }
        const result = await calendarService_1.CalendarService.getEventsByType(type);
        if (!result.success) {
            return res.status(400).json(result);
        }
        return res.json(result);
    }
    catch (_error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.get('/events/category/:category', async (req, res) => {
    try {
        const category = req.params['category'];
        const result = await calendarService_1.CalendarService.getEventsByCategory(category);
        if (!result.success) {
            return res.status(400).json(result);
        }
        return res.json(result);
    }
    catch (_error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.get('/events/reference/:refId', async (req, res) => {
    try {
        const refId = req.params['refId'];
        const result = await calendarService_1.CalendarService.getEventsByReference(refId);
        if (!result.success) {
            return res.status(400).json(result);
        }
        return res.json(result);
    }
    catch (_error) {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=calendar.js.map