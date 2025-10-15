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
AIConfig.MODEL = 'claude-sonnet-4-5-20250929';
AIConfig.MAX_TOKENS = 4000;
AIConfig.TEMPERATURE = 0.7;
AIConfig.MAX_HISTORY_LENGTH = 10;
class AIService {
    static async generateResponse(userMessage, context, conversationHistory = [], userId) {
        try {
            const systemPrompt = aiPromptTemplates_1.PromptAssembler.assembleSystemPrompt(context);
            const { messages, systemPrompt: separatedSystemPrompt } = this.prepareMessages(systemPrompt, userMessage, conversationHistory);
            const result = await this.callAnthropicAPI(messages, separatedSystemPrompt, userId);
            return result;
        }
        catch (error) {
            logger_1.logger.error('AI Service Error', error, {
                userMessage,
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
                errorStack: error instanceof Error ? error.stack : undefined
            });
            return {
                response: this.getFallbackResponse(error),
                usage: null
            };
        }
    }
    static async generateResponseWithStatus(userMessage, context, conversationHistory = [], userId) {
        try {
            const result = await this.generateResponse(userMessage, context, conversationHistory, userId);
            return {
                success: true,
                message: result.response
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
        const messages = [];
        const recentHistory = conversationHistory.slice(-AIConfig.MAX_HISTORY_LENGTH);
        if (recentHistory.length > 0) {
            messages.push(...recentHistory.map(msg => ({
                role: msg.role,
                content: msg.content
            })));
        }
        messages.push({
            role: 'user',
            content: `${userMessage}

Please respond as Hillary, keeping in mind the user's current marketing track progress and business context.`
        });
        return { messages, systemPrompt };
    }
    static async callAnthropicAPI(messages, systemPrompt, userId) {
        const requestParams = {
            model: AIConfig.MODEL,
            max_tokens: AIConfig.MAX_TOKENS,
            messages,
            temperature: AIConfig.TEMPERATURE,
        };
        if (systemPrompt) {
            requestParams.system = [
                {
                    type: 'text',
                    text: systemPrompt,
                    cache_control: { type: 'ephemeral' }
                }
            ];
        }
        const response = await anthropic.messages.create(requestParams);
        if (response.usage) {
            const usage = response.usage;
            logger_1.logger.info('AI usage stats', {
                userId: userId || 'unknown',
                model: AIConfig.MODEL,
                input_tokens: usage.input_tokens || 0,
                output_tokens: usage.output_tokens || 0,
                cache_creation: usage.cache_creation_input_tokens || 0,
                cache_hits: usage.cache_read_input_tokens || 0,
            });
        }
        if (response.content && response.content.length > 0) {
            const firstContent = response.content[0];
            if (firstContent && firstContent.type === 'text') {
                return {
                    response: firstContent.text,
                    usage: response.usage
                };
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
        if (!process.env['ANTHROPIC_API_KEY']) {
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