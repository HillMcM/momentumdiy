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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = exports.AIConfig = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const dotenv = __importStar(require("dotenv"));
const aiPromptTemplates_1 = require("./aiPromptTemplates");
const environment_1 = require("../config/environment");
const logger_1 = require("../utils/logger");
dotenv.config();
const anthropic = new sdk_1.default({
    apiKey: environment_1.ENV.anthropicApiKey,
});
class AIConfig {
}
exports.AIConfig = AIConfig;
AIConfig.MODEL = 'claude-3-sonnet-20240229';
AIConfig.MAX_TOKENS = 2000;
AIConfig.TEMPERATURE = 0.7;
AIConfig.MAX_HISTORY_LENGTH = 5;
class AIService {
    static async generateResponse(userMessage, context, conversationHistory = []) {
        try {
            const systemPrompt = aiPromptTemplates_1.PromptAssembler.assembleSystemPrompt(context);
            const messages = this.prepareMessages(systemPrompt, userMessage, conversationHistory);
            const response = await this.callAnthropicAPI(messages);
            return response;
        }
        catch (error) {
            logger_1.logger.error('AI Service Error', error, { userMessage });
            return this.getFallbackResponse(error);
        }
    }
    static async generateResponseWithStatus(userMessage, context, conversationHistory = []) {
        try {
            const message = await this.generateResponse(userMessage, context, conversationHistory);
            return {
                success: true,
                message: message
            };
        }
        catch (error) {
            return {
                success: false,
                message: this.getFallbackResponse(error),
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static prepareMessages(systemPrompt, userMessage, conversationHistory) {
        const messages = [
            {
                role: 'user',
                content: `${systemPrompt}

User's message: ${userMessage}

Please respond as Hillary, keeping in mind the user's current marketing track progress and business context.`
            }
        ];
        const recentHistory = conversationHistory.slice(-AIConfig.MAX_HISTORY_LENGTH);
        if (recentHistory.length > 0) {
            messages.unshift(...recentHistory.map(msg => ({
                role: msg.role,
                content: msg.content
            })));
        }
        return messages;
    }
    static async callAnthropicAPI(messages) {
        const response = await anthropic.messages.create({
            model: AIConfig.MODEL,
            max_tokens: AIConfig.MAX_TOKENS,
            messages,
            temperature: AIConfig.TEMPERATURE,
        });
        if (response.content && response.content.length > 0) {
            const firstContent = response.content[0];
            if (firstContent && firstContent.type === 'text') {
                return firstContent.text;
            }
        }
        throw new Error('No valid response content received from AI');
    }
    static getFallbackResponse(error) {
        if (error instanceof Error && error.message.includes('API key')) {
            return 'I apologize, but I\'m having trouble connecting to my AI service right now. Please try again in a moment, or contact support if the issue persists.';
        }
        return 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.';
    }
    static getSystemPrompt(context) {
        return aiPromptTemplates_1.PromptAssembler.assembleSystemPrompt(context);
    }
    static async testAI(message = 'Hello, I need help with marketing') {
        const testContext = {
            marketingGoals: [],
            currentTasks: [],
            activeTrack: null,
            userBusinessType: 'Test Business',
            userIndustry: 'General',
            userExperienceLevel: 'Beginner',
            pagePath: '/app'
        };
        return this.generateResponseWithStatus(message, testContext);
    }
    static validateConfiguration() {
        const errors = [];
        if (!process.env['antropic_api_key']) {
            errors.push('Anthropic API key is not configured');
        }
        if (!AIConfig.MODEL) {
            errors.push('AI model is not configured');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    static async createSystemPrompt(context) {
        logger_1.logger.warn('createSystemPrompt is deprecated, use getSystemPrompt instead');
        return this.getSystemPrompt(context);
    }
    static async getBusinessContext(context) {
        logger_1.logger.warn('getBusinessContext is deprecated, use getSystemPrompt instead');
        return this.getSystemPrompt(context);
    }
}
exports.AIService = AIService;
//# sourceMappingURL=aiService.js.map