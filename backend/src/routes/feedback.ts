import { Router, Request, Response } from 'express';
import { routeRateLimit } from '../middleware/rate';
import { EmailService } from '../services/emailService';
import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /api/feedback
 * Submit feedback form
 */
router.post('/', routeRateLimit(5), async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message, rating, category } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, email, subject, and message are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Validate rating (1-5)
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    // Send email using Resend
    const emailResult = await EmailService.sendFeedbackEmail({
      name,
      email,
      subject,
      message,
      rating: rating || 0,
      category: category || 'general'
    });

    if (!emailResult.success) {
      logger.error('Failed to send feedback email', { error: emailResult.error, category });
      return res.status(500).json({
        success: false,
        error: 'Failed to send feedback email'
      });
    }

    return res.json({
      success: true,
      message: 'Feedback submitted successfully. Thank you for your input!'
    });

  } catch (error) {
    logger.error('Error processing feedback', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/feedback/test
 * Send a test email
 */
router.post('/test', routeRateLimit(2), async (_req: Request, res: Response) => {
  try {
    const emailResult = await EmailService.sendTestEmail();

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

  } catch (error) {
    logger.error('Error sending test email', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
