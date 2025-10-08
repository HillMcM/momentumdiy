/**
 * Momentum Service
 * Handles momentum score calculation and progress tracking
 */

import { supabase } from '../config/supabase';
import { ApiResponse } from '../types';

interface MomentumFactors {
  tasksCompleted: number;
  totalTasks: number;
  completionSpeed: number;
  currentStreak: number;
  weeklyConsistency: number;
}

interface WeeklyNote {
  week: number;
  date: string;
  note: string;
}

export class MomentumService {
  /**
   * Calculate momentum score for a user
   */
  static async calculateMomentumScore(userId: string): Promise<ApiResponse<{ score: number; factors: MomentumFactors }>> {
    try {
      // Get user profile with track data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        return {
          success: false,
          error: profileError.message
        };
      }

      // If no active track, return 0
      if (!profile.active_track_id) {
        return {
          success: true,
          data: {
            score: 0,
            factors: {
              tasksCompleted: 0,
              totalTasks: 0,
              completionSpeed: 0,
              currentStreak: 0,
              weeklyConsistency: 0
            }
          }
        };
      }

      // Get all tasks for user's active track
      const { data: modules, error: modulesError } = await supabase
        .from('marketing_modules')
        .select('*, marketing_tasks(*)')
        .eq('track_id', profile.active_track_id);

      if (modulesError) {
        return {
          success: false,
          error: modulesError.message
        };
      }

      // Count completed tasks
      let tasksCompleted = 0;
      let totalTasks = 0;

      for (const module of modules || []) {
        const tasks = (module as any).marketing_tasks || [];
        totalTasks += tasks.length;
        tasksCompleted += tasks.filter((t: any) => t.is_completed).length;
      }

      // Calculate completion speed (days ahead or behind)
      const startDate = new Date(profile.track_start_date);
      const now = new Date();
      const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const expectedWeek = Math.floor(daysSinceStart / 7) + 1;
      const currentWeek = profile.track_current_week || 1;
      const weeksDifference = currentWeek - expectedWeek;
      const completionSpeed = weeksDifference * 7; // Convert to days

      // Calculate streak from weekly notes
      const weeklyNotes: WeeklyNote[] = profile.weekly_notes || [];
      const currentStreak = this.calculateStreak(weeklyNotes, currentWeek);

      // Calculate weekly consistency (simplified for now)
      const weeklyConsistency = 85; // Default to "good" - can be enhanced later

      // Calculate weighted score
      const factors: MomentumFactors = {
        tasksCompleted,
        totalTasks,
        completionSpeed,
        currentStreak,
        weeklyConsistency
      };

      const score = this.computeWeightedScore(factors);

      // Update profile with new momentum score
      await supabase
        .from('profiles')
        .update({ momentum_score: score })
        .eq('id', userId);

      return {
        success: true,
        data: { score, factors }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Compute weighted momentum score from factors
   */
  private static computeWeightedScore(factors: MomentumFactors): number {
    const taskWeight = 0.50;
    const speedWeight = 0.25;
    const streakWeight = 0.25;

    const taskScore = factors.totalTasks > 0 
      ? (factors.tasksCompleted / factors.totalTasks) * 100 
      : 0;
    
    const speedScore = Math.max(0, Math.min(100, 50 + (factors.completionSpeed * 10)));
    const streakScore = Math.min(100, factors.currentStreak * 10);

    const finalScore = Math.round(
      (taskScore * taskWeight) + 
      (speedScore * speedWeight) + 
      (streakScore * streakWeight)
    );

    return Math.max(0, Math.min(100, finalScore));
  }

  /**
   * Calculate current streak from weekly notes
   */
  private static calculateStreak(weeklyNotes: WeeklyNote[], currentWeek: number): number {
    if (!weeklyNotes || weeklyNotes.length === 0) return 0;

    // Sort by week descending
    const sorted = [...weeklyNotes].sort((a, b) => b.week - a.week);
    
    let streak = 0;
    let expectedWeek = currentWeek;

    for (const note of sorted) {
      if (note.week === expectedWeek) {
        streak++;
        expectedWeek--;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Get weekly notes for a user
   */
  static async getWeeklyNotes(userId: string): Promise<ApiResponse<WeeklyNote[]>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('weekly_notes')
        .eq('id', userId)
        .single();

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data: data.weekly_notes || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Save a weekly note
   */
  static async saveWeeklyNote(
    userId: string, 
    note: Omit<WeeklyNote, 'date'> & { date?: string }
  ): Promise<ApiResponse<WeeklyNote[]>> {
    try {
      // Get existing notes
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('weekly_notes')
        .eq('id', userId)
        .single();

      if (fetchError) {
        return {
          success: false,
          error: fetchError.message
        };
      }

      const existingNotes: WeeklyNote[] = profile.weekly_notes || [];
      
      // Create new note with current date if not provided
      const newNote: WeeklyNote = {
        week: note.week,
        date: note.date || new Date().toISOString(),
        note: note.note
      };

      // Remove any existing note for this week
      const filteredNotes = existingNotes.filter(n => n.week !== note.week);
      
      // Add new note
      const updatedNotes = [...filteredNotes, newNote].sort((a, b) => b.week - a.week);

      // Save to database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ weekly_notes: updatedNotes })
        .eq('id', userId);

      if (updateError) {
        return {
          success: false,
          error: updateError.message
        };
      }

      return {
        success: true,
        data: updatedNotes
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get comprehensive progress data for a user
   */
  static async getProgressData(userId: string): Promise<ApiResponse<{
    tasksCompleted: number;
    totalTasks: number;
    currentWeek: number;
    totalWeeks: number;
    progress: number;
    momentum: number;
  }>> {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        return {
          success: false,
          error: profileError.message
        };
      }

      if (!profile.active_track_id) {
        return {
          success: true,
          data: {
            tasksCompleted: 0,
            totalTasks: 0,
            currentWeek: 0,
            totalWeeks: 0,
            progress: 0,
            momentum: 0
          }
        };
      }

      // Get track info
      const { data: track, error: trackError } = await supabase
        .from('marketing_tracks')
        .select('duration_weeks')
        .eq('id', profile.active_track_id)
        .single();

      if (trackError) {
        return {
          success: false,
          error: trackError.message
        };
      }

      // Get tasks
      const { data: modules } = await supabase
        .from('marketing_modules')
        .select('*, marketing_tasks(*)')
        .eq('track_id', profile.active_track_id);

      let tasksCompleted = 0;
      let totalTasks = 0;

      for (const module of modules || []) {
        const tasks = (module as any).marketing_tasks || [];
        totalTasks += tasks.length;
        tasksCompleted += tasks.filter((t: any) => t.is_completed).length;
      }

      return {
        success: true,
        data: {
          tasksCompleted,
          totalTasks,
          currentWeek: profile.track_current_week || 1,
          totalWeeks: track.duration_weeks || 12,
          progress: profile.track_progress || 0,
          momentum: profile.momentum_score || 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

