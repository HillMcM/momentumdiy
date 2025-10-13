/**
 * Refactored AIService - Clean, modular, and maintainable
 * 
 * This refactored version provides:
 * - Modular prompt system
 * - Separated concerns
 * - Better testability
 * - Easier maintenance
 * - Type safety
 */

import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
import { PromptAssembler } from './aiPromptTemplates';
import { ENV } from '../config/environment';
import { logger } from '../utils/logger';
import type { MarketingGoal, Task } from '../types';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: ENV.anthropicApiKey,
});

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface ConversationContext {
  marketingGoals: MarketingGoal[];
  currentTasks: Task[];
  activeTrack: MarketingGoal | null;
  userBusinessType?: string;
  userIndustry?: string;
  userExperienceLevel?: string;
  pagePath?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  success: boolean;
  message: string;
  error?: string;
}

// ============================================================================
// AI SERVICE CONFIGURATION
// ============================================================================

export class AIConfig {
  static readonly MODEL = 'claude-sonnet-4-5-20250929';
  static readonly MAX_TOKENS = 4000; // Generous limit for detailed, helpful responses
  static readonly TEMPERATURE = 0.7;
  static readonly MAX_HISTORY_LENGTH = 10; // More context for better continuity
}

// ============================================================================
// REFACTORED AI SERVICE
// ============================================================================

export class AIService {
  /**
   * Generate AI response using modular prompt system
   * Main entry point for AI interactions
   */
  static async generateResponse(
    userMessage: string,
    context: ConversationContext,
    conversationHistory: ChatMessage[] = [],
    userId?: string
  ): Promise<{ response: string; usage: any }> {
    try {
      // Build the system prompt using modular components
      const systemPrompt = PromptAssembler.assembleSystemPrompt(context);
      
      // Prepare messages for the AI (now returns system prompt separately for caching)
      const { messages, systemPrompt: separatedSystemPrompt } = this.prepareMessages(
        systemPrompt, 
        userMessage, 
        conversationHistory
      );
      
      // Generate response from AI with Sonnet 4.5 features (caching, memory tool, etc.)
      const result = await this.callAnthropicAPI(messages, separatedSystemPrompt, userId);
      
      return result;
    } catch (error) {
      logger.error('AI Service Error', error, { 
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

  /**
   * Generate AI response with structured return type
   * Alternative method that returns success/error status
   */
  static async generateResponseWithStatus(
    userMessage: string,
    context: ConversationContext,
    conversationHistory: ChatMessage[] = [],
    userId?: string
  ): Promise<AIResponse> {
    try {
      const result = await this.generateResponse(userMessage, context, conversationHistory, userId);
      return {
        success: true,
        message: result.response
      };
    } catch (error) {
      return {
        success: false,
        message: this.getFallbackResponse(error),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Prepare messages for the AI API call
   * Now returns both messages and system prompt separately for caching
   */
  private static prepareMessages(
    systemPrompt: string,
    userMessage: string,
    conversationHistory: ChatMessage[]
  ): { messages: Anthropic.Messages.MessageParam[]; systemPrompt: string } {
    // Separate system prompt for caching (90% cost reduction on cached content)
    const messages: Anthropic.Messages.MessageParam[] = [];

    // Add conversation history for context (last 5 messages to stay within limits)
    const recentHistory = conversationHistory.slice(-AIConfig.MAX_HISTORY_LENGTH);
    if (recentHistory.length > 0) {
      messages.push(...recentHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })));
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: `${userMessage}

Please respond as Hillary, keeping in mind the user's current marketing track progress and business context.`
    });

    return { messages, systemPrompt };
  }

  /**
   * Call the Anthropic API with prompt caching and usage tracking
   * Sonnet 4.5 features: Caching, Memory tool support, Context editing
   */
  private static async callAnthropicAPI(
    messages: Anthropic.Messages.MessageParam[],
    systemPrompt?: string,
    userId?: string
  ): Promise<{ response: string; usage: any }> {
    // Configure request with Sonnet 4.5 optimizations
    const requestParams: any = {
      model: AIConfig.MODEL,
      max_tokens: AIConfig.MAX_TOKENS,
      messages,
      temperature: AIConfig.TEMPERATURE,
    };

    // Add system prompt with caching if provided
    // This saves 90% on the system prompt cost after the first request
    if (systemPrompt) {
      requestParams.system = [
        {
          type: 'text',
          text: systemPrompt,
          cache_control: { type: 'ephemeral' }
        }
      ];
    }

    // NOTE: Beta features (memory tool, context management) temporarily disabled
    // These can cause API failures if not properly configured
    // Enable Memory tool (Beta) for Sonnet 4.5 - DISABLED
    // requestParams.tools = [
    //   {
    //     type: 'memory_20250818',
    //     name: 'memory'
    //   }
    // ];

    // Enable context management features (Beta) - DISABLED
    // requestParams.betas = ['context-management-2025-06-27'];

    const response = await anthropic.messages.create(requestParams);

    // Log comprehensive usage stats
    if (response.usage) {
      const usage = response.usage as any;
      logger.info('AI usage stats', {
        userId: userId || 'unknown',
        model: AIConfig.MODEL,
        input_tokens: usage.input_tokens || 0,
        output_tokens: usage.output_tokens || 0,
        cache_creation: usage.cache_creation_input_tokens || 0,
        cache_hits: usage.cache_read_input_tokens || 0,
      });
    }

    // Handle the response content properly
    if (response.content && response.content.length > 0) {
      const firstContent = response.content[0];
      if (firstContent && firstContent.type === 'text') {
        return {
          response: (firstContent as any).text,
          usage: response.usage
        };
      }
    }
    
    throw new Error('No valid response content received from AI');
  }

  /**
   * Get fallback response when AI fails
   */
  private static getFallbackResponse(error: unknown): string {
    if (error instanceof Error && error.message.includes('API key')) {
      return 'I apologize, but I\'m having trouble connecting to my AI service right now. Please try again in a moment, or contact support if the issue persists.';
    }
    
    return 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.';
  }

  // ============================================================================
  // CONVENIENCE METHODS FOR TESTING AND DEBUGGING
  // ============================================================================

  /**
   * Get the system prompt for a given context (for testing/debugging)
   */
  static getSystemPrompt(context: ConversationContext): string {
    return PromptAssembler.assembleSystemPrompt(context);
  }

  /**
   * Test the AI service with a simple message
   */
  static async testAI(message: string = 'Hello, I need help with marketing'): Promise<AIResponse> {
    const testContext: ConversationContext = {
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

  /**
   * Validate AI service configuration
   */
  static validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

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

  // ============================================================================
  // LEGACY COMPATIBILITY METHODS
  // ============================================================================

  /**
   * Legacy method for backward compatibility
   * @deprecated Use generateResponse instead
   */
  static async createSystemPrompt(context: ConversationContext): Promise<string> {
    logger.warn('createSystemPrompt is deprecated, use getSystemPrompt instead');
    return this.getSystemPrompt(context);
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use generateResponse instead
   */
  static async getBusinessContext(context: ConversationContext): Promise<string> {
    logger.warn('getBusinessContext is deprecated, use getSystemPrompt instead');
    return this.getSystemPrompt(context);
  }
}
