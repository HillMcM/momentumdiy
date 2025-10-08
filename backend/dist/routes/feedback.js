"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rate_1 = require("../middleware/rate");
const emailService_1 = require("../services/emailService");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
router.post('/', (0, rate_1.routeRateLimit)(5), async (req, res) => {
    try {
        const { name, email, subject, message, rating, category } = req.body;
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: name, email, subject, and message are required'
            });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format'
            });
        }
        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({
                success: false,
                error: 'Rating must be between 1 and 5'
            });
        }
        const emailResult = await emailService_1.EmailService.sendFeedbackEmail({
            name,
            email,
            subject,
            message,
            rating: rating || 0,
            category: category || 'general'
        });
        if (!emailResult.success) {
            logger_1.logger.error('Failed to send feedback email', { error: emailResult.error, category });
            return res.status(500).json({
                success: false,
                error: 'Failed to send feedback email'
            });
        }
        return res.json({
            success: true,
            message: 'Feedback submitted successfully. Thank you for your input!'
        });
    }
    catch (error) {
        logger_1.logger.error('Error processing feedback', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.post('/test', (0, rate_1.routeRateLimit)(2), async (_req, res) => {
    try {
        const emailResult = await emailService_1.EmailService.sendTestEmail();
        if (!emailResult.success) {
            return res.status(500).json({
                success: false,
                error: emailResult.error || 'Failed to send test email'
            });
        }
        return res.json({
            success: true,
            message: 'Test email sent successfully!'
        });
    }
    catch (error) {
        logger_1.logger.error('Error sending test email', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=feedback.js.map