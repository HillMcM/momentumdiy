import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

export interface FounderStatus {
  isFounder: boolean;
  founderNumber?: number;
  spotsRemaining: number;
  totalSpots: number;
  message?: string;
}

export class FounderPricingService {
  private static readonly TOTAL_FOUNDER_SPOTS = 250;

  /**
   * Check if founder spots are still available
   */
  static async getFounderAvailability(): Promise<FounderStatus> {
    try {
      const { data, error } = await supabase.rpc('get_founder_count');
      
      if (error) {
        logger.error('Error getting founder count', error);
        throw error;
      }

      const currentCount = data || 0;
      const spotsRemaining = Math.max(0, this.TOTAL_FOUNDER_SPOTS - currentCount);
      const isAvailable = spotsRemaining > 0;

      return {
        isFounder: false,
        spotsRemaining,
        totalSpots: this.TOTAL_FOUNDER_SPOTS,
        message: isAvailable 
          ? `${spotsRemaining} founder spots remaining!` 
          : 'All founder spots have been claimed'
      };
    } catch (error) {
      logger.error('Error checking founder availability', error);
      throw new Error('Failed to check founder availability');
    }
  }

  /**
   * Check if a specific user is a founder
   */
  static async getUserFounderStatus(userId: string): Promise<FounderStatus> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_founder, founder_number, founder_claimed_at')
        .eq('id', userId)
        .single();

      if (error) {
        logger.error('Error getting user founder status', error);
        throw error;
      }

      // Get total availability
      const availability = await this.getFounderAvailability();

      const message = profile?.is_founder 
        ? `You're Founder #${profile.founder_number}!` 
        : availability.message;

      return {
        isFounder: profile?.is_founder || false,
        founderNumber: profile?.founder_number || undefined,
        spotsRemaining: availability.spotsRemaining,
        totalSpots: this.TOTAL_FOUNDER_SPOTS,
        ...(message && { message })
      };
    } catch (error) {
      logger.error('Error getting user founder status', error);
      throw new Error('Failed to get user founder status');
    }
  }

  /**
   * Claim a founder spot for a user (atomic operation)
   */
  static async claimFounderStatus(userId: string): Promise<{
    success: boolean;
    founderNumber?: number;
    message: string;
  }> {
    try {
      const { data, error } = await supabase.rpc('claim_founder_status', {
        p_user_id: userId
      });

      if (error) {
        logger.error('Error claiming founder status', error);
        throw error;
      }

      const result = data?.[0];
      
      if (!result) {
        throw new Error('No result from claim_founder_status');
      }

      return {
        success: result.success,
        founderNumber: result.founder_number || undefined,
        message: result.message
      };
    } catch (error) {
      logger.error('Error claiming founder status', error);
      throw new Error('Failed to claim founder status');
    }
  }

  /**
   * Get the appropriate Stripe price IDs based on user's founder status
   */
  static getPriceIds(isFounder: boolean, interval: 'monthly' | 'yearly'): {
    priceId: string;
    displayPrice: string;
  } {
    if (isFounder) {
      // Founder pricing
      return {
        priceId: interval === 'monthly' 
          ? process.env['STRIPE_PRICE_FOUNDER_MONTHLY'] || ''
          : process.env['STRIPE_PRICE_FOUNDER_YEARLY'] || '',
        displayPrice: interval === 'monthly' ? '$9.99/month' : '$99/year'
      };
    } else {
      // Regular pricing
      return {
        priceId: interval === 'monthly'
          ? process.env['STRIPE_PRICE_MONTHLY'] || ''
          : process.env['STRIPE_PRICE_YEARLY'] || '',
        displayPrice: interval === 'monthly' ? '$14.99/month' : '$149.99/year'
      };
    }
  }
}

