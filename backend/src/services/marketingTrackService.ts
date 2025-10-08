import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

export interface TrackDefinition {
  id: string;
  slug: string;
  title: string;
  description: string;
  duration_weeks: number;
  phases: any[];
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrackModule {
  id: string;
  track_id: string;
  week_number: number;
  title: string;
  description: string;
  content: string;
  pro_tip: string;
  created_at: string;
  updated_at: string;
}

export interface TrackTask {
  id: string;
  module_id: string;
  title: string;
  description: string;
  estimated_time: string;
  order_index: number;
  created_at: string;
}

export interface UserTrackProgress {
  id: string;
  user_id: string;
  track_id: string;
  start_date: string;
  current_week: number;
  progress: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class MarketingTrackService {
  // ===============
  // ADMIN METHODS
  // ===============

  /**
   * Get all track definitions
   */
  static async getTrackDefinitions(): Promise<ApiResponse<TrackDefinition[]>> {
    try {
      const { data, error } = await supabase
        .from('marketing_tracks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create new track definition
   */
  static async createTrackDefinition(trackData: {
    slug: string;
    title: string;
    description: string;
    industry_tags?: string[];
    duration_weeks?: number;
    phases?: any[];
  }): Promise<ApiResponse<TrackDefinition>> {
    try {
      const { data, error } = await supabase
        .from('marketing_tracks')
        .insert([{
          slug: trackData.slug,
          title: trackData.title,
          description: trackData.description,
          industry_tags: trackData.industry_tags || [],
          duration_weeks: trackData.duration_weeks || 12,
          phases: trackData.phases || []
        }])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get modules for a track definition
   */
  static async getTrackModules(trackId: string): Promise<ApiResponse<TrackModule[]>> {
    try {
      const { data, error } = await supabase
        .from('marketing_modules')
        .select('*')
        .eq('track_id', trackId)
        .order('week_number', { ascending: true });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create new module for track definition
   */
  static async createTrackModule(trackId: string, moduleData: {
    week_number: number;
    title: string;
    description?: string;
    content: string;
    pro_tip?: string;
  }): Promise<ApiResponse<TrackModule>> {
    try {
      // Verify track definition exists
      const { data: trackDef, error: trackError } = await supabase
        .from('marketing_tracks')
        .select('id')
        .eq('id', trackId)
        .single();

      if (trackError || !trackDef) {
        return { success: false, error: 'Track definition not found' };
      }

      const { data, error } = await supabase
        .from('marketing_modules')
        .insert([{
          track_id: trackId,
          week_number: moduleData.week_number,
          title: moduleData.title,
          description: moduleData.description || '',
          content: moduleData.content,
          pro_tip: moduleData.pro_tip || null
        }])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get tasks for a module
   */
  static async getModuleTasks(moduleId: string): Promise<ApiResponse<TrackTask[]>> {
    try {
      const { data, error } = await supabase
        .from('marketing_tasks')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create task for module
   */
  static async createModuleTask(moduleId: string, taskData: {
    title: string;
    description?: string;
    estimated_time?: string;
    order_index?: number;
  }): Promise<ApiResponse<TrackTask>> {
    try {
      const { data, error } = await supabase
        .from('marketing_tasks')
        .insert([{
          module_id: moduleId,
          title: taskData.title,
          description: taskData.description || '',
          estimated_time: taskData.estimated_time || '30min',
          order_index: taskData.order_index || 0
        }])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ===============
  // USER METHODS
  // ===============

  /**
   * Get published track definitions available to users
   */
  static async getPublishedTracks(): Promise<ApiResponse<TrackDefinition[]>> {
    try {
      const { data, error} = await supabase
        .from('marketing_tracks')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false});

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Activate track for user
   */
  static async activateTrackForUser(userId: string, trackId: string): Promise<ApiResponse<UserTrackProgress>> {
    try {
      // Check if user already has an active track
      const { data: existingProgress } = await supabase
        .from('user_track_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (existingProgress) {
        return { success: false, error: 'User already has an active track' };
      }

      // Create new track progress
      const { data, error } = await supabase
        .from('user_track_progress')
        .insert([{
          user_id: userId,
          track_id: trackId,
          start_date: new Date().toISOString(),
          current_week: 1,
          progress: 0,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      // Initialize module progress for all modules in the track
      await this.initializeUserModuleProgress(userId, trackId);

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Initialize user module progress for a track
   */
  private static async initializeUserModuleProgress(userId: string, trackId: string): Promise<void> {
    try {
      // Get all modules for the track
      const { data: modules } = await supabase
        .from('marketing_modules')
        .select('id, week_number')
        .eq('track_id', trackId)
        .order('week_number', { ascending: true });

      if (!modules) return;

      // Create progress records for all modules
      const progressRecords = modules.map(module => ({
        user_id: userId,
        module_id: module.id,
        is_unlocked: module.week_number === 1, // Only first week unlocked
        is_completed: false
      }));

      await supabase
        .from('user_module_progress')
        .insert(progressRecords);

      // Initialize task progress for all tasks
      for (const module of modules) {
        const { data: tasks } = await supabase
          .from('marketing_tasks')
          .select('id')
          .eq('module_id', module.id);

        if (tasks && tasks.length > 0) {
          const taskProgressRecords = tasks.map(task => ({
            user_id: userId,
            task_id: task.id,
            is_completed: false
          }));

          await supabase
            .from('user_task_progress')
            .insert(taskProgressRecords);
        }
      }
    } catch (error) {
      logger.error('Error initializing user module progress', error, { userId, trackId });
    }
  }

  /**
   * Get user's active track progress
   */
  static async getUserTrackProgress(userId: string): Promise<ApiResponse<UserTrackProgress | null>> {
    try {
      const { data, error } = await supabase
        .from('user_track_progress')
        .select(`
          *,
          marketing_tracks!inner(title, description, duration_weeks, phases)
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return { success: true, data: data || null };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update weekly content drip based on start date
   */
  static async updateWeeklyDrip(userId: string): Promise<ApiResponse<void>> {
    try {
      // Get user's active track progress
      const progressResponse = await this.getUserTrackProgress(userId);
      if (!progressResponse.success || !progressResponse.data) {
        return { success: false, error: 'No active track found' };
      }

      const progress = progressResponse.data;
      const startDate = new Date(progress.start_date);
      const now = new Date();
      const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const currentWeek = Math.min(Math.floor(daysSinceStart / 7) + 1, 12);

      // Update current week if it has changed
      if (currentWeek !== progress.current_week) {
        await supabase
          .from('user_track_progress')
          .update({ current_week: currentWeek })
          .eq('id', progress.id);

        // Unlock modules up to current week
        // First get the module IDs that should be unlocked
        const { data: modulesToUnlock } = await supabase
          .from('marketing_modules')
          .select('id')
          .eq('track_id', progress.track_id)
          .lte('week_number', currentWeek);

        if (modulesToUnlock && modulesToUnlock.length > 0) {
          const moduleIds = modulesToUnlock.map(m => m.id);
          await supabase
            .from('user_module_progress')
            .update({ 
              is_unlocked: true,
              unlocked_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .in('module_id', moduleIds);
        }
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
