import * as supabase from '../config/supabase';
import type { ApiResponse } from '../types';
import { randomUUID } from 'crypto';

interface DbSocialMediaStrategy {
  id: string;
  user_id: string;
  track_id: string;
  content_pillars: any[];
  brand_voice: any;
  visual_style: any;
  posting_schedule: any;
  baseline_metrics: any;
  current_metrics: any;
  weekly_snapshots: any[];
  notes?: string;
  collaborators: any[];
  created_at: string;
  updated_at: string;
}

interface SocialMediaStrategy {
  id: string;
  userId: string;
  trackId: string;
  contentPillars: any[];
  brandVoice: any;
  visualStyle: any;
  postingSchedule: any;
  baselineMetrics: any;
  currentMetrics: any;
  weeklySnapshots: any[];
  notes?: string;
  collaborators: any[];
  createdAt: string;
  updatedAt: string;
}

// Convert database snake_case to frontend camelCase
function dbToFrontend(db: DbSocialMediaStrategy): SocialMediaStrategy {
  const result: any = {
    id: db.id,
    userId: db.user_id,
    trackId: db.track_id,
    contentPillars: db.content_pillars || [],
    brandVoice: db.brand_voice || {},
    visualStyle: db.visual_style || {},
    postingSchedule: db.posting_schedule || {},
    baselineMetrics: db.baseline_metrics || {},
    currentMetrics: db.current_metrics || {},
    weeklySnapshots: db.weekly_snapshots || [],
    collaborators: db.collaborators || [],
    createdAt: db.created_at,
    updatedAt: db.updated_at
  };
  
  if (db.notes) result.notes = db.notes;
  
  return result as SocialMediaStrategy;
}

// Convert frontend camelCase to database snake_case
function frontendToDb(strategy: Partial<SocialMediaStrategy>): Partial<DbSocialMediaStrategy> {
  const db: any = {};
  
  if (strategy.contentPillars !== undefined) db.content_pillars = strategy.contentPillars;
  if (strategy.brandVoice !== undefined) db.brand_voice = strategy.brandVoice;
  if (strategy.visualStyle !== undefined) db.visual_style = strategy.visualStyle;
  if (strategy.postingSchedule !== undefined) db.posting_schedule = strategy.postingSchedule;
  if (strategy.baselineMetrics !== undefined) db.baseline_metrics = strategy.baselineMetrics;
  if (strategy.currentMetrics !== undefined) db.current_metrics = strategy.currentMetrics;
  if (strategy.weeklySnapshots !== undefined) db.weekly_snapshots = strategy.weeklySnapshots;
  if (strategy.notes !== undefined) db.notes = strategy.notes;
  if (strategy.collaborators !== undefined) db.collaborators = strategy.collaborators;
  
  return db;
}

// Convert database share link snake_case to frontend camelCase
function dbToFrontendShareLink(db: DbSocialStrategyShareLink): SocialStrategyShareLink {
  const result: any = {
    id: db.id,
    strategyId: db.strategy_id,
    accessCode: db.access_code,
    isActive: db.is_active,
    createdAt: db.created_at
  };
  
  if (db.recipient_name) result.recipientName = db.recipient_name;
  if (db.recipient_email) result.recipientEmail = db.recipient_email;
  if (db.expires_at) result.expiresAt = db.expires_at;
  if (db.last_accessed_at) result.lastAccessedAt = db.last_accessed_at;
  
  return result as SocialStrategyShareLink;
}

interface ShareLinkOptions {
  recipientName?: string;
  recipientEmail?: string;
  expiresAt?: string;
}

interface DbSocialStrategyShareLink {
  id: string;
  strategy_id: string;
  access_code: string;
  recipient_name?: string;
  recipient_email?: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  last_accessed_at?: string;
}

interface SocialStrategyShareLink {
  id: string;
  strategyId: string;
  accessCode: string;
  recipientName?: string;
  recipientEmail?: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
  lastAccessedAt?: string;
}

export class SocialStrategyService {
  /**
   * Check if user has ever activated a social media track
   */
  static async hasEverActivatedSocialTrack(userId: string): Promise<ApiResponse<boolean>> {
    try {
      if (!userId) {
        return {
          success: false,
          error: 'User ID is required'
        };
      }

      // Check if user has any social media strategies (meaning they've activated a social track before)
      const { data, error } = await supabase.default
        .from('social_media_strategies')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data: (data && data.length > 0) || false
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get or create social media strategy for the current user
   */
  static async getSocialStrategy(userId: string): Promise<ApiResponse<SocialMediaStrategy>> {
    try {
      if (!userId) {
        return {
          success: false,
          error: 'User ID is required'
        };
      }

      const user = { id: userId };

      // Get user's active track (if any)
      const { data: profile } = await supabase.default
        .from('profiles')
        .select('active_track_id')
        .eq('id', user.id)
        .single();

      // Check if strategy already exists for this user
      // If user has an active track, use that; otherwise use their most recent strategy
      const { data: existing, error: fetchError } = await supabase.default
        .from('social_media_strategies')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        return {
          success: false,
          error: fetchError.message
        };
      }

      if (existing) {
        return {
          success: true,
          data: dbToFrontend(existing as DbSocialMediaStrategy)
        };
      }

      // Create new strategy with defaults (use active track if available)
      const trackId = profile?.active_track_id || null;
      
      const { data: newStrategy, error: createError } = await supabase.default
        .from('social_media_strategies')
        .insert({
          user_id: user.id,
          track_id: trackId,
          content_pillars: [],
          brand_voice: {},
          visual_style: {},
          posting_schedule: { frequency: 3, days: ['monday', 'wednesday', 'friday'], postTypes: {} },
          baseline_metrics: {},
          current_metrics: {},
          weekly_snapshots: [],
          collaborators: []
        })
        .select()
        .single();

      if (createError) {
        return {
          success: false,
          error: createError.message
        };
      }

      return {
        success: true,
        data: dbToFrontend(newStrategy as DbSocialMediaStrategy)
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Update social media strategy
   */
  static async updateSocialStrategy(userId: string, updates: Partial<SocialMediaStrategy>): Promise<ApiResponse<SocialMediaStrategy>> {
    try {
      if (!userId) {
        return {
          success: false,
          error: 'User ID is required'
        };
      }

      const user = { id: userId };

      // Get the user's most recent strategy first
      const { data: existingStrategy, error: fetchError } = await supabase.default
        .from('social_media_strategies')
        .select('id')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError || !existingStrategy) {
        return {
          success: false,
          error: 'Strategy not found'
        };
      }

      // Convert camelCase to snake_case for database
      const dbUpdates = frontendToDb(updates);

      // Update the specific strategy
      const { data: updated, error: updateError } = await supabase.default
        .from('social_media_strategies')
        .update({
          ...dbUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingStrategy.id)
        .select()
        .single();

      if (updateError) {
        return {
          success: false,
          error: updateError.message
        };
      }

      return {
        success: true,
        data: dbToFrontend(updated as DbSocialMediaStrategy)
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Create a share link for a strategy
   */
  static async createShareLink(userId: string, options: ShareLinkOptions = {}): Promise<ApiResponse<SocialStrategyShareLink>> {
    try {
      if (!userId) {
        return {
          success: false,
          error: 'User ID is required'
        };
      }

      // Get user's strategy
      const strategyResponse = await this.getSocialStrategy(userId);
      if (!strategyResponse.success || !strategyResponse.data) {
        return {
          success: false,
          error: 'Strategy not found'
        };
      }

      // Generate unique access code
      const accessCode = randomUUID().split('-')[0]; // Short 8-character code

      // Create share link
      const { data: shareLink, error: createError } = await supabase.default
        .from('social_strategy_share_links')
        .insert({
          strategy_id: strategyResponse.data.id,
          access_code: accessCode,
          recipient_name: options.recipientName,
          recipient_email: options.recipientEmail,
          expires_at: options.expiresAt,
          is_active: true
        })
        .select()
        .single();

      if (createError) {
        return {
          success: false,
          error: createError.message
        };
      }

      return {
        success: true,
        data: dbToFrontendShareLink(shareLink as DbSocialStrategyShareLink)
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get all share links for current user's strategy
   */
  static async getShareLinks(userId: string): Promise<ApiResponse<SocialStrategyShareLink[]>> {
    try {
      if (!userId) {
        return {
          success: false,
          error: 'User ID is required'
        };
      }

      // Get user's strategy
      const strategyResponse = await this.getSocialStrategy(userId);
      if (!strategyResponse.success || !strategyResponse.data) {
        return {
          success: true,
          data: []
        };
      }

      // Get share links
      const { data: shareLinks, error: fetchError } = await supabase.default
        .from('social_strategy_share_links')
        .select('*')
        .eq('strategy_id', strategyResponse.data.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        return {
          success: false,
          error: fetchError.message
        };
      }

      return {
        success: true,
        data: shareLinks.map(link => dbToFrontendShareLink(link as DbSocialStrategyShareLink))
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get shared strategy by access code (public access, no auth required)
   */
  static async getSharedStrategy(accessCode: string): Promise<ApiResponse<{ strategy: SocialMediaStrategy; ownerName?: string }>> {
    try {
      // Find share link
      const { data: shareLink, error: linkError } = await supabase.default
        .from('social_strategy_share_links')
        .select('*, social_media_strategies(*)')
        .eq('access_code', accessCode)
        .eq('is_active', true)
        .single();

      if (linkError || !shareLink) {
        return {
          success: false,
          error: 'Share link not found or expired'
        };
      }

      // Check expiration
      if (shareLink.expires_at) {
        const expirationDate = new Date(shareLink.expires_at);
        if (expirationDate < new Date()) {
          return {
            success: false,
            error: 'Share link has expired'
          };
        }
      }

      // Update last accessed time
      await supabase.default
        .from('social_strategy_share_links')
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('id', shareLink.id);

      // Get owner's business name
      const strategy = (shareLink as any).social_media_strategies;
      const { data: profile } = await supabase.default
        .from('profiles')
        .select('business_name, full_name')
        .eq('id', strategy.user_id)
        .single();

      return {
        success: true,
        data: {
          strategy: dbToFrontend(strategy as DbSocialMediaStrategy),
          ownerName: profile?.business_name || profile?.full_name || 'Business'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Delete (revoke) a share link
   */
  static async deleteShareLink(userId: string, linkId: string): Promise<ApiResponse<void>> {
    try {
      if (!userId) {
        return {
          success: false,
          error: 'User ID is required'
        };
      }

      // Get user's strategy to verify ownership
      const strategyResponse = await this.getSocialStrategy(userId);
      if (!strategyResponse.success || !strategyResponse.data) {
        return {
          success: false,
          error: 'Strategy not found'
        };
      }

      // Delete the share link
      const { error: deleteError } = await supabase.default
        .from('social_strategy_share_links')
        .delete()
        .eq('id', linkId)
        .eq('strategy_id', strategyResponse.data.id);

      if (deleteError) {
        return {
          success: false,
          error: deleteError.message
        };
      }

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Toggle share link active status
   */
  static async toggleShareLink(userId: string, linkId: string, isActive: boolean): Promise<ApiResponse<SocialStrategyShareLink>> {
    try {
      if (!userId) {
        return {
          success: false,
          error: 'User ID is required'
        };
      }

      // Get user's strategy to verify ownership
      const strategyResponse = await this.getSocialStrategy(userId);
      if (!strategyResponse.success || !strategyResponse.data) {
        return {
          success: false,
          error: 'Strategy not found'
        };
      }

      // Update the share link
      const { data: updated, error: updateError } = await supabase.default
        .from('social_strategy_share_links')
        .update({ is_active: isActive })
        .eq('id', linkId)
        .eq('strategy_id', strategyResponse.data.id)
        .select()
        .single();

      if (updateError) {
        return {
          success: false,
          error: updateError.message
        };
      }

      return {
        success: true,
        data: dbToFrontendShareLink(updated as DbSocialStrategyShareLink)
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

