import * as express from 'express';
import { AIService, ConversationContext, ChatMessage } from '../services/aiService';
import { AIUsageService } from '../services/aiUsageService';
import { routeRateLimit } from '../middleware/rate';
import { MarketingService } from '../services/marketingService';
import { logger } from '../utils/logger';
import { TaskService } from '../services/taskService';
import { ApiResponse } from '../types';
import { supabasePublic } from '../config/supabase';

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

// POST /api/ai/chat - Send a message to the AI assistant with usage tracking
router.post('/chat', routeRateLimit(30), async (req, res) => {
  try {
    const { message, conversationHistory = [], userBusinessType, userIndustry, userExperienceLevel, pagePath }: ChatRequest = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Get user ID from auth header
    const authHeader = req.headers.authorization;
    let userId: string | undefined;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user } } = await supabasePublic.auth.getUser(token);
      userId = user?.id;
    }

    // Check usage limit before processing (if user is authenticated)
    if (userId) {
      const usageCheck = await AIUsageService.canMakeRequest(userId);
      
      if (!usageCheck.allowed) {
        const warningMessage = AIUsageService.getWarningMessage(usageCheck.warningLevel, usageCheck.usage);
        return res.status(429).json({
          success: false,
          error: warningMessage || 'You\'ve reached your monthly AI assistant limit. Your access will reset next month!'
        });
      }
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

    // Generate AI response with Sonnet 4.5 features
    const { response: aiResponse, usage } = await AIService.generateResponse(
      message,
      context,
      conversationHistory,
      userId
    );

    // Record usage for tracking and billing (if user is authenticated)
    if (userId && usage) {
      const usageRecord = {
        userId,
        inputTokens: usage.input_tokens || 0,
        outputTokens: usage.output_tokens || 0,
        cachedTokens: (usage.cache_read_input_tokens || 0) + (usage.cache_creation_input_tokens || 0),
        cacheCreationTokens: usage.cache_creation_input_tokens || 0,
        cacheReadTokens: usage.cache_read_input_tokens || 0,
        costCents: AIUsageService.calculateCost({
          inputTokens: usage.input_tokens || 0,
          outputTokens: usage.output_tokens || 0,
          cacheCreationTokens: usage.cache_creation_input_tokens,
          cacheReadTokens: usage.cache_read_input_tokens
        }),
        endpoint: '/api/ai/chat',
        modelVersion: 'claude-sonnet-4-5-20250929'
      };

      // Record usage asynchronously (don't block response)
      AIUsageService.recordUsage(usageRecord).catch(err => 
        logger.error('Failed to record usage', err)
      );
    }

    // Check for usage warnings after recording
    let usageWarning: string | null = null;
    if (userId) {
      const usageCheck = await AIUsageService.canMakeRequest(userId);
      if (usageCheck.warningLevel) {
        usageWarning = AIUsageService.getWarningMessage(usageCheck.warningLevel, usageCheck.usage);
      }
    }

    const response: ApiResponse<ChatResponse> = {
      success: true,
      data: {
        response: aiResponse,
        context
      },
      message: 'AI response generated successfully',
      ...(usageWarning && { warning: usageWarning })
    };

    return res.json(response);

  } catch (error) {
    logger.error('AI chat error', error);
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
    logger.error('AI context error', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to load user context'
    });
  }
});

// GET /api/ai/usage - Get user's current AI usage stats
router.get('/usage', routeRateLimit(30), async (req, res) => {
  try {
    // Get user ID from auth header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabasePublic.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token'
      });
    }

    // Get usage stats
    const [monthlyUsage, usageLimit] = await Promise.all([
      AIUsageService.getMonthlyUsage(user.id),
      AIUsageService.checkUsageLimit(user.id)
    ]);

    const response: ApiResponse<any> = {
      success: true,
      data: {
        monthly: monthlyUsage,
        limit: usageLimit,
        warning: usageLimit ? AIUsageService.getWarningMessage(
          usageLimit.currentCostCents >= usageLimit.limitCostCents * 0.9 ? 'critical' :
          usageLimit.currentCostCents >= usageLimit.limitCostCents * 0.75 ? 'warning' : null,
          usageLimit
        ) : null
      },
      message: 'Usage stats retrieved successfully'
    };

    return res.json(response);

  } catch (error) {
    logger.error('Error getting AI usage', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get usage stats'
    });
  }
});

export default router;
