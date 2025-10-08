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
import { AI_ASSISTANT } from '../config/branding';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: ENV.anthropicApiKey,
});

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface ConversationContext {
  marketingGoals: any[];
  currentTasks: any[];
  activeTrack: any | null;
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
  static readonly MODEL = 'claude-3-sonnet-20240229';
  static readonly MAX_TOKENS = 2000;
  static readonly TEMPERATURE = 0.7;
  static readonly MAX_HISTORY_LENGTH = 5;
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
    conversationHistory: ChatMessage[] = []
  ): Promise<string> {
    try {
      // Build the system prompt using modular components
      const systemPrompt = PromptAssembler.assembleSystemPrompt(context);
      
      // Prepare messages for the AI
      const messages = this.prepareMessages(systemPrompt, userMessage, conversationHistory);
      
      // Generate response from AI
      const response = await this.callAnthropicAPI(messages);
      
      return response;
    } catch (error) {
      console.error('AI Service Error:', error);
      return this.getFallbackResponse(error);
    }
  }

  /**
   * Generate AI response with structured return type
   * Alternative method that returns success/error status
   */
  static async generateResponseWithStatus(
    userMessage: string,
    context: ConversationContext,
    conversationHistory: ChatMessage[] = []
  ): Promise<AIResponse> {
    try {
      const message = await this.generateResponse(userMessage, context, conversationHistory);
      return {
        success: true,
        message: message
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
   */
  private static prepareMessages(
    systemPrompt: string,
    userMessage: string,
    conversationHistory: ChatMessage[]
  ): Anthropic.Messages.MessageParam[] {
    const messages: Anthropic.Messages.MessageParam[] = [
      {
        role: 'user',
        content: `${systemPrompt}

User's message: ${userMessage}

Please respond as Hillary, keeping in mind the user's current marketing track progress and business context.`
      }
    ];

    // Add conversation history for context (last 5 messages to stay within limits)
    const recentHistory = conversationHistory.slice(-AIConfig.MAX_HISTORY_LENGTH);
    if (recentHistory.length > 0) {
      messages.unshift(...recentHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })));
    }

    return messages;
  }

  /**
   * Call the Anthropic API
   */
  private static async callAnthropicAPI(messages: Anthropic.Messages.MessageParam[]): Promise<string> {
    const response = await anthropic.messages.create({
      model: AIConfig.MODEL,
      max_tokens: AIConfig.MAX_TOKENS,
      messages,
      temperature: AIConfig.TEMPERATURE,
    });

    // Handle the response content properly
    if (response.content && response.content.length > 0) {
      const firstContent = response.content[0];
      if (firstContent && firstContent.type === 'text') {
        return (firstContent as any).text;
      }
    }
    
    throw new Error('No valid response content received from AI');
  }

  /**
   * Get fallback response when AI fails
   */
  private static getFallbackResponse(error: any): string {
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

  // ============================================================================
  // LEGACY COMPATIBILITY METHODS
  // ============================================================================

  /**
   * Legacy method for backward compatibility
   * @deprecated Use generateResponse instead
   */
  static async createSystemPrompt(context: ConversationContext): Promise<string> {
    console.warn('createSystemPrompt is deprecated. Use getSystemPrompt instead.');
    return this.getSystemPrompt(context);
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use generateResponse instead
   */
  static async getBusinessContext(context: ConversationContext): Promise<string> {
    console.warn('getBusinessContext is deprecated. Use getSystemPrompt instead.');
    return this.getSystemPrompt(context);
  }
}
