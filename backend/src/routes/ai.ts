import * as express from 'express';
import { AIService, ConversationContext, ChatMessage } from '../services/aiService';
import { routeRateLimit } from '../middleware/rate';
import { MarketingService } from '../services/marketingService';
import { TaskService } from '../services/taskService';
import { ApiResponse } from '../types';

const router = express.Router();

interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
  userBusinessType?: string;
  userIndustry?: string;
  userExperienceLevel?: string;
  pagePath?: string;
}

interface ChatResponse {
  response: string;
  context: ConversationContext;
}

// POST /api/ai/chat - Send a message to the AI assistant
router.post('/chat', routeRateLimit(30), async (req, res) => {
  try {
    const { message, conversationHistory = [], userBusinessType, userIndustry, userExperienceLevel, pagePath }: ChatRequest = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Get user's current marketing data
    const [marketingGoalsResponse, tasksResponse] = await Promise.all([
      MarketingService.getMarketingGoals(),
      TaskService.getTasks()
    ]);

    if (!marketingGoalsResponse.success || !tasksResponse.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to load user data'
      });
    }

    const marketingGoals = marketingGoalsResponse.data || [];
    const tasks = tasksResponse.data || [];
    const activeTrack = marketingGoals.find(goal => goal.isActive) || null;

    // Create conversation context with business intelligence
    const context: ConversationContext = {
      marketingGoals,
      currentTasks: tasks.filter(task => task.status === 'todo'),
      activeTrack,
      userBusinessType: userBusinessType || 'Not specified',
      userIndustry: userIndustry || 'General',
      userExperienceLevel: userExperienceLevel || 'Not specified',
      pagePath: pagePath || '/app',

    };

    // Generate AI response
    const aiResponse = await AIService.generateResponse(
      message,
      context,
      conversationHistory
    );

    const response: ApiResponse<ChatResponse> = {
      success: true,
      data: {
        response: aiResponse,
        context
      },
      message: 'AI response generated successfully'
    };

    return res.json(response);

  } catch (error) {
    console.error('AI Chat Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate AI response'
    });
  }
});

// GET /api/ai/context - Get current user context for AI
router.get('/context', async (_req, res) => {
  try {
    // Get user's current marketing data
    const [marketingGoalsResponse, tasksResponse] = await Promise.all([
      MarketingService.getMarketingGoals(),
      TaskService.getTasks()
    ]);

    if (!marketingGoalsResponse.success || !tasksResponse.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to load user data'
      });
    }

    const marketingGoals = marketingGoalsResponse.data || [];
    const tasks = tasksResponse.data || [];
    const activeTrack = marketingGoals.find(goal => goal.isActive) || null;

    const context: ConversationContext = {
      marketingGoals,
      currentTasks: tasks.filter(task => task.status === 'todo'),
      activeTrack
    };

    const response: ApiResponse<ConversationContext> = {
      success: true,
      data: context,
      message: 'User context loaded successfully'
    };

    return res.json(response);

  } catch (error) {
    console.error('AI Context Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to load user context'
    });
  }
});

export default router;
