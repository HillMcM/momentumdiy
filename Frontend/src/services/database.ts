import { supabase } from '../lib/supabase';
import type { 
  Task, 
  Project, 
  MarketingGoal, 
  MarketingModule, 
  MarketingTask, 
  CalendarEvent, 
  Asset, 
  AssetCategory, 
  BrandingKit, 
  ShareLink,
  TimelinePhase 
} from '../types';

// Database service class
export class DatabaseService {
  // Task operations
  static async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createTask(task: Omit<Task, 'id'>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Project operations
  static async getProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createProject(project: Omit<Project, 'id'>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Marketing Goal operations
  static async getMarketingGoals(): Promise<MarketingGoal[]> {
    const { data, error } = await supabase
      .from('marketing_goals')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createMarketingGoal(goal: Omit<MarketingGoal, 'id'>): Promise<MarketingGoal> {
    const { data, error } = await supabase
      .from('marketing_goals')
      .insert([goal])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateMarketingGoal(id: string, updates: Partial<MarketingGoal>): Promise<MarketingGoal> {
    const { data, error } = await supabase
      .from('marketing_goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteMarketingGoal(id: string): Promise<void> {
    const { error } = await supabase
      .from('marketing_goals')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Marketing Module operations
  static async getMarketingModules(goalId?: string): Promise<MarketingModule[]> {
    let query = supabase
      .from('marketing_modules')
      .select('*')
      .order('week_number', { ascending: true });
    
    if (goalId) {
      query = query.eq('goal_id', goalId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async createMarketingModule(module: Omit<MarketingModule, 'id'>): Promise<MarketingModule> {
    const { data, error } = await supabase
      .from('marketing_modules')
      .insert([module])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateMarketingModule(id: string, updates: Partial<MarketingModule>): Promise<MarketingModule> {
    const { data, error } = await supabase
      .from('marketing_modules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Marketing Task operations
  static async getMarketingTasks(moduleId?: string): Promise<MarketingTask[]> {
    let query = supabase
      .from('marketing_tasks')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (moduleId) {
      query = query.eq('module_id', moduleId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async createMarketingTask(task: Omit<MarketingTask, 'id'>): Promise<MarketingTask> {
    const { data, error } = await supabase
      .from('marketing_tasks')
      .insert([task])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateMarketingTask(id: string, updates: Partial<MarketingTask>): Promise<MarketingTask> {
    const { data, error } = await supabase
      .from('marketing_tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Calendar Event operations
  static async getCalendarEvents(): Promise<CalendarEvent[]> {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  static async createCalendarEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert([event])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const { data, error } = await supabase
      .from('calendar_events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteCalendarEvent(id: string): Promise<void> {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Asset operations
  static async getAssets(): Promise<Asset[]> {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .order('upload_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createAsset(asset: Omit<Asset, 'id'>): Promise<Asset> {
    const { data, error } = await supabase
      .from('assets')
      .insert([asset])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateAsset(id: string, updates: Partial<Asset>): Promise<Asset> {
    const { data, error } = await supabase
      .from('assets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteAsset(id: string): Promise<void> {
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Asset Category operations
  static async getAssetCategories(): Promise<AssetCategory[]> {
    const { data, error } = await supabase
      .from('asset_categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  // Branding Kit operations
  static async getBrandingKits(): Promise<BrandingKit[]> {
    const { data, error } = await supabase
      .from('branding_kits')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createBrandingKit(kit: Omit<BrandingKit, 'id'>): Promise<BrandingKit> {
    const { data, error } = await supabase
      .from('branding_kits')
      .insert([kit])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateBrandingKit(id: string, updates: Partial<BrandingKit>): Promise<BrandingKit> {
    const { data, error } = await supabase
      .from('branding_kits')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteBrandingKit(id: string): Promise<void> {
    const { error } = await supabase
      .from('branding_kits')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Share Link operations
  static async getShareLinks(): Promise<ShareLink[]> {
    const { data, error } = await supabase
      .from('share_links')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createShareLink(link: Omit<ShareLink, 'id'>): Promise<ShareLink> {
    const { data, error } = await supabase
      .from('share_links')
      .insert([link])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateShareLink(id: string, updates: Partial<ShareLink>): Promise<ShareLink> {
    const { data, error } = await supabase
      .from('share_links')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteShareLink(id: string): Promise<void> {
    const { error } = await supabase
      .from('share_links')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Timeline Phase operations
  static async getTimelinePhases(projectId?: string): Promise<TimelinePhase[]> {
    let query = supabase
      .from('timeline_phases')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async createTimelinePhase(phase: Omit<TimelinePhase, 'id'>): Promise<TimelinePhase> {
    const { data, error } = await supabase
      .from('timeline_phases')
      .insert([phase])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateTimelinePhase(id: string, updates: Partial<TimelinePhase>): Promise<TimelinePhase> {
    const { data, error } = await supabase
      .from('timeline_phases')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteTimelinePhase(id: string): Promise<void> {
    const { error } = await supabase
      .from('timeline_phases')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Utility methods
  static async getActiveMarketingGoal(): Promise<MarketingGoal | null> {
    const { data, error } = await supabase
      .from('marketing_goals')
      .select('*')
      .eq('is_active', true)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
    return data;
  }

  static async setActiveMarketingGoal(goalId: string): Promise<void> {
    // First, deactivate all goals
    await supabase
      .from('marketing_goals')
      .update({ is_active: false });
    
    // Then activate the specified goal
    const { error } = await supabase
      .from('marketing_goals')
      .update({ is_active: true })
      .eq('id', goalId);
    
    if (error) throw error;
  }

  static async getTasksByProject(projectId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async getAssetsByCategory(categoryId: string): Promise<Asset[]> {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('category', categoryId)
      .order('upload_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
} 