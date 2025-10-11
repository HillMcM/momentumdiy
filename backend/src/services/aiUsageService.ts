/**
 * AI Usage Tracking Service
 * Tracks token usage and enforces $5/month limit
 */

import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

export interface UsageRecord {
  userId: string;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  costCents: number; // Cost in cents (e.g., 64 = $0.0064)
  endpoint?: string;
  modelVersion?: string;
}

export interface UsageStats {
  conversations: number;
  costCents: number;
  costDollars: number;
  percentageOfLimit: number;
}

export interface UsageLimit {
  withinLimit: boolean;
  currentCostCents: number;
  limitCostCents: number;
  remainingCents: number;
  conversationsUsed: number;
  estimatedConversationsRemaining: number;
}

export class AIUsageService {
  /**
   * Monthly limit in cents ($5.00 = 500 cents)
   */
  static readonly MONTHLY_LIMIT_CENTS = 500; // $5.00

  /**
   * Cost calculation based on Sonnet 4.5 pricing
   * Input: $3/million, Output: $15/million
   * Cache write (5min): $3.75/million, Cache read: $0.30/million
   */
  static calculateCost(usage: {
    inputTokens: number;
    outputTokens: number;
    cacheCreationTokens?: number;
    cacheReadTokens?: number;
  }): number {
    const INPUT_COST_PER_TOKEN = 3 / 1_000_000; // $3 per million
    const OUTPUT_COST_PER_TOKEN = 15 / 1_000_000; // $15 per million
    const CACHE_WRITE_COST_PER_TOKEN = 3.75 / 1_000_000; // $3.75 per million
    const CACHE_READ_COST_PER_TOKEN = 0.30 / 1_000_000; // $0.30 per million

    let cost = 0;

    // Regular input tokens
    const regularInputTokens = usage.inputTokens - (usage.cacheReadTokens || 0);
    cost += regularInputTokens * INPUT_COST_PER_TOKEN;

    // Output tokens
    cost += usage.outputTokens * OUTPUT_COST_PER_TOKEN;

    // Cache creation tokens
    if (usage.cacheCreationTokens) {
      cost += usage.cacheCreationTokens * CACHE_WRITE_COST_PER_TOKEN;
    }

    // Cache read tokens (hits)
    if (usage.cacheReadTokens) {
      cost += usage.cacheReadTokens * CACHE_READ_COST_PER_TOKEN;
    }

    // Return cost in cents
    return Math.ceil(cost * 100);
  }

  /**
   * Record AI usage for a conversation
   */
  static async recordUsage(record: UsageRecord): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_usage_tracking')
        .insert({
          user_id: record.userId,
          conversation_date: new Date().toISOString().split('T')[0],
          input_tokens: record.inputTokens,
          output_tokens: record.outputTokens,
          cached_tokens: record.cachedTokens,
          cache_creation_tokens: record.cacheCreationTokens,
          cache_read_tokens: record.cacheReadTokens,
          cost_cents: record.costCents,
          endpoint: record.endpoint,
          model_version: record.modelVersion,
        });

      if (error) {
        logger.error('Failed to record AI usage', error, { userId: record.userId });
      } else {
        logger.info('AI usage recorded', {
          userId: record.userId,
          costCents: record.costCents,
          inputTokens: record.inputTokens,
          outputTokens: record.outputTokens,
        });
      }
    } catch (error) {
      logger.error('Error recording AI usage', error);
    }
  }

  /**
   * Get current month usage for a user
   */
  static async getMonthlyUsage(userId: string): Promise<UsageStats | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_monthly_ai_usage', { p_user_id: userId })
        .single();

      if (error || !data) {
        logger.error('Failed to get monthly usage', error, { userId });
        return null;
      }

      const result = data as any;
      return {
        conversations: result.conversations || 0,
        costCents: result.cost_cents || 0,
        costDollars: parseFloat(result.cost_dollars || '0'),
        percentageOfLimit: result.percentage_of_limit || 0,
      };
    } catch (error) {
      logger.error('Error getting monthly usage', error);
      return null;
    }
  }

  /**
   * Check if user has exceeded usage limit
   */
  static async checkUsageLimit(userId: string): Promise<UsageLimit | null> {
    try {
      const { data, error } = await supabase
        .rpc('check_ai_usage_limit', { p_user_id: userId })
        .single();

      if (error || !data) {
        logger.error('Failed to check usage limit', error, { userId });
        return null;
      }

      const result = data as any;
      return {
        withinLimit: result.within_limit || false,
        currentCostCents: result.current_cost_cents || 0,
        limitCostCents: result.limit_cost_cents || 500,
        remainingCents: result.remaining_cents || 0,
        conversationsUsed: result.conversations_used || 0,
        estimatedConversationsRemaining: result.estimated_conversations_remaining || 0,
      };
    } catch (error) {
      logger.error('Error checking usage limit', error);
      return null;
    }
  }

  /**
   * Check if user can make another AI request
   * Returns warning level: null (ok), 'warning' (75%+), 'critical' (90%+), 'exceeded' (100%+)
   */
  static async canMakeRequest(
    userId: string
  ): Promise<{ allowed: boolean; warningLevel: 'warning' | 'critical' | 'exceeded' | null; usage: UsageLimit | null }> {
    const usage = await this.checkUsageLimit(userId);

    if (!usage) {
      // If we can't check usage, allow the request (fail open)
      return { allowed: true, warningLevel: null, usage: null };
    }

    const percentageUsed = (usage.currentCostCents / usage.limitCostCents) * 100;

    // Hard limit at 100%
    if (percentageUsed >= 100) {
      return { allowed: false, warningLevel: 'exceeded', usage };
    }

    // Warning levels
    let warningLevel: 'warning' | 'critical' | null = null;
    if (percentageUsed >= 90) {
      warningLevel = 'critical';
    } else if (percentageUsed >= 75) {
      warningLevel = 'warning';
    }

    return { allowed: true, warningLevel, usage };
  }

  /**
   * Get warning message based on usage
   */
  static getWarningMessage(warningLevel: 'warning' | 'critical' | 'exceeded' | null, usage: UsageLimit | null): string | null {
    if (!warningLevel || !usage) return null;

    const percentUsed = Math.round((usage.currentCostCents / usage.limitCostCents) * 100);

    switch (warningLevel) {
      case 'warning':
        return `You've used ${percentUsed}% of your monthly AI assistant budget. You're doing great! Just a friendly heads up about your usage.`;
      
      case 'critical':
        return `You've used ${percentUsed}% of your monthly AI assistant budget. You still have access, but you're getting close to your limit for this month.`;
      
      case 'exceeded':
        return `You've reached your monthly AI assistant limit. Your access will reset at the start of next month. In the meantime, feel free to explore other features!`;
      
      default:
        return null;
    }
  }
}

