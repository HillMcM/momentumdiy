"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
const aiService_1 = require("../services/aiService");
const aiUsageService_1 = require("../services/aiUsageService");
const rate_1 = require("../middleware/rate");
const marketingService_1 = require("../services/marketingService");
const logger_1 = require("../utils/logger");
const taskService_1 = require("../services/taskService");
const supabase_1 = require("../config/supabase");
const router = express.Router();
router.post('/chat', (0, rate_1.routeRateLimit)(30), async (req, res) => {
    try {
        const { message, conversationHistory = [], userBusinessType, userIndustry, userExperienceLevel, pagePath } = req.body;
        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }
        const authHeader = req.headers.authorization;
        let userId;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const { data: { user } } = await supabase_1.supabasePublic.auth.getUser(token);
            userId = user?.id;
        }
        if (userId) {
            const usageCheck = await aiUsageService_1.AIUsageService.canMakeRequest(userId);
            if (!usageCheck.allowed) {
                const warningMessage = aiUsageService_1.AIUsageService.getWarningMessage(usageCheck.warningLevel, usageCheck.usage);
                return res.status(429).json({
                    success: false,
                    error: warningMessage || 'You\'ve reached your monthly AI assistant limit. Your access will reset next month!'
                });
            }
        }
        const [marketingGoalsResponse, tasksResponse] = await Promise.all([
            marketingService_1.MarketingService.getMarketingGoals(),
            taskService_1.TaskService.getTasks()
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
        const context = {
            marketingGoals,
            currentTasks: tasks.filter(task => task.status === 'todo'),
            activeTrack,
            userBusinessType: userBusinessType || 'Not specified',
            userIndustry: userIndustry || 'General',
            userExperienceLevel: userExperienceLevel || 'Not specified',
            pagePath: pagePath || '/app',
        };
        const { response: aiResponse, usage } = await aiService_1.AIService.generateResponse(message, context, conversationHistory, userId);
        if (userId && usage) {
            const usageRecord = {
                userId,
                inputTokens: usage.input_tokens || 0,
                outputTokens: usage.output_tokens || 0,
                cachedTokens: (usage.cache_read_input_tokens || 0) + (usage.cache_creation_input_tokens || 0),
                cacheCreationTokens: usage.cache_creation_input_tokens || 0,
                cacheReadTokens: usage.cache_read_input_tokens || 0,
                costCents: aiUsageService_1.AIUsageService.calculateCost({
                    inputTokens: usage.input_tokens || 0,
                    outputTokens: usage.output_tokens || 0,
                    cacheCreationTokens: usage.cache_creation_input_tokens,
                    cacheReadTokens: usage.cache_read_input_tokens
                }),
                endpoint: '/api/ai/chat',
                modelVersion: 'claude-sonnet-4-5-20250929'
            };
            aiUsageService_1.AIUsageService.recordUsage(usageRecord).catch(err => logger_1.logger.error('Failed to record usage', err));
        }
        let usageWarning = null;
        if (userId) {
            const usageCheck = await aiUsageService_1.AIUsageService.canMakeRequest(userId);
            if (usageCheck.warningLevel) {
                usageWarning = aiUsageService_1.AIUsageService.getWarningMessage(usageCheck.warningLevel, usageCheck.usage);
            }
        }
        const response = {
            success: true,
            data: {
                response: aiResponse,
                context
            },
            message: 'AI response generated successfully',
            ...(usageWarning && { warning: usageWarning })
        };
        return res.json(response);
    }
    catch (error) {
        logger_1.logger.error('AI chat error', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to generate AI response'
        });
    }
});
router.get('/context', async (_req, res) => {
    try {
        const [marketingGoalsResponse, tasksResponse] = await Promise.all([
            marketingService_1.MarketingService.getMarketingGoals(),
            taskService_1.TaskService.getTasks()
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
        const context = {
            marketingGoals,
            currentTasks: tasks.filter(task => task.status === 'todo'),
            activeTrack
        };
        const response = {
            success: true,
            data: context,
            message: 'User context loaded successfully'
        };
        return res.json(response);
    }
    catch (error) {
        logger_1.logger.error('AI context error', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to load user context'
        });
    }
});
router.get('/usage', (0, rate_1.routeRateLimit)(30), async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        const token = authHeader.substring(7);
        const { data: { user }, error } = await supabase_1.supabasePublic.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid authentication token'
            });
        }
        const [monthlyUsage, usageLimit] = await Promise.all([
            aiUsageService_1.AIUsageService.getMonthlyUsage(user.id),
            aiUsageService_1.AIUsageService.checkUsageLimit(user.id)
        ]);
        const response = {
            success: true,
            data: {
                monthly: monthlyUsage,
                limit: usageLimit,
                warning: usageLimit ? aiUsageService_1.AIUsageService.getWarningMessage(usageLimit.currentCostCents >= usageLimit.limitCostCents * 0.9 ? 'critical' :
                    usageLimit.currentCostCents >= usageLimit.limitCostCents * 0.75 ? 'warning' : null, usageLimit) : null
            },
            message: 'Usage stats retrieved successfully'
        };
        return res.json(response);
    }
    catch (error) {
        logger_1.logger.error('Error getting AI usage', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to get usage stats'
        });
    }
});
exports.default = router;
//# sourceMappingURL=ai.js.map