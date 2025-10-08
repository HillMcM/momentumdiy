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
const rate_1 = require("../middleware/rate");
const marketingService_1 = require("../services/marketingService");
const logger_1 = require("../utils/logger");
const taskService_1 = require("../services/taskService");
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
        const aiResponse = await aiService_1.AIService.generateResponse(message, context, conversationHistory);
        const response = {
            success: true,
            data: {
                response: aiResponse,
                context
            },
            message: 'AI response generated successfully'
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
exports.default = router;
//# sourceMappingURL=ai.js.map