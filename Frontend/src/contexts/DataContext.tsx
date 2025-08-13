import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { DatabaseService } from '../services/database';
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

interface DataContextType {
  // State
  tasks: Task[];
  projects: Project[];
  marketingGoals: MarketingGoal[];
  marketingModules: MarketingModule[];
  marketingTasks: MarketingTask[];
  calendarEvents: CalendarEvent[];
  assets: Asset[];
  assetCategories: AssetCategory[];
  brandingKits: BrandingKit[];
  shareLinks: ShareLink[];
  timelinePhases: TimelinePhase[];
  activeMarketingGoal: MarketingGoal | null;
  loading: boolean;
  error: string | null;

  // Actions
  refreshData: () => Promise<void>;
  setActiveMarketingGoal: (goalId: string) => Promise<void>;
  
  // Task actions
  createTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  // Project actions
  createProject: (project: Omit<Project, 'id'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  // Marketing actions
  createMarketingGoal: (goal: Omit<MarketingGoal, 'id'>) => Promise<void>;
  updateMarketingGoal: (id: string, updates: Partial<MarketingGoal>) => Promise<void>;
  deleteMarketingGoal: (id: string) => Promise<void>;
  createMarketingModule: (module: Omit<MarketingModule, 'id'>) => Promise<void>;
  updateMarketingModule: (id: string, updates: Partial<MarketingModule>) => Promise<void>;
  createMarketingTask: (task: Omit<MarketingTask, 'id'>) => Promise<void>;
  updateMarketingTask: (id: string, updates: Partial<MarketingTask>) => Promise<void>;
  
  // Calendar actions
  createCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteCalendarEvent: (id: string) => Promise<void>;
  
  // Asset actions
  createAsset: (asset: Omit<Asset, 'id'>) => Promise<void>;
  updateAsset: (id: string, updates: Partial<Asset>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  
  // Branding kit actions
  createBrandingKit: (kit: Omit<BrandingKit, 'id'>) => Promise<void>;
  updateBrandingKit: (id: string, updates: Partial<BrandingKit>) => Promise<void>;
  deleteBrandingKit: (id: string) => Promise<void>;
  
  // Share link actions
  createShareLink: (link: Omit<ShareLink, 'id'>) => Promise<void>;
  updateShareLink: (id: string, updates: Partial<ShareLink>) => Promise<void>;
  deleteShareLink: (id: string) => Promise<void>;
  
  // Timeline actions
  createTimelinePhase: (phase: Omit<TimelinePhase, 'id'>) => Promise<void>;
  updateTimelinePhase: (id: string, updates: Partial<TimelinePhase>) => Promise<void>;
  deleteTimelinePhase: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);



interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [marketingGoals, setMarketingGoals] = useState<MarketingGoal[]>([]);
  const [marketingModules, setMarketingModules] = useState<MarketingModule[]>([]);
  const [marketingTasks, setMarketingTasks] = useState<MarketingTask[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetCategories, setAssetCategories] = useState<AssetCategory[]>([]);
  const [brandingKits, setBrandingKits] = useState<BrandingKit[]>([]);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [timelinePhases, setTimelinePhases] = useState<TimelinePhase[]>([]);
  const [activeMarketingGoal, setActiveMarketingGoalState] = useState<MarketingGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        tasksData,
        marketingGoalsData,
        marketingModulesData,
        marketingTasksData,
        assetsData,
        assetCategoriesData,
        brandingKitsData,
        shareLinksData,
        timelinePhasesData,
        activeGoalData
      ] = await Promise.all([
        DatabaseService.getTasks(),
        DatabaseService.getMarketingGoals(),
        DatabaseService.getMarketingModules(),
        DatabaseService.getMarketingTasks(),
        DatabaseService.getAssets(),
        DatabaseService.getAssetCategories(),
        DatabaseService.getBrandingKits(),
        DatabaseService.getShareLinks(),
        DatabaseService.getTimelinePhases(),
        DatabaseService.getActiveMarketingGoal()
      ]);

      setTasks(tasksData);
      setProjects([]); // DISABLED: Projects feature deactivated
      setMarketingGoals(marketingGoalsData);
      setMarketingModules(marketingModulesData);
      setMarketingTasks(marketingTasksData);
      setCalendarEvents([]); // DISABLED: Calendar feature deactivated
      setAssets(assetsData);
      setAssetCategories(assetCategoriesData);
      setBrandingKits(brandingKitsData);
      setShareLinks(shareLinksData);
      setTimelinePhases(timelinePhasesData);
      setActiveMarketingGoalState(activeGoalData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Refresh all data
  const refreshData = async () => {
    await loadData();
  };

  // Set active marketing goal
  const setActiveMarketingGoal = async (goalId: string) => {
    try {
      await DatabaseService.setActiveMarketingGoal(goalId);
      await loadData(); // Refresh to get updated data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error setting active marketing goal:', err);
    }
  };

  // Task actions
  const createTask = async (task: Omit<Task, 'id'>) => {
    try {
      const newTask = await DatabaseService.createTask(task);
      setTasks(prev => [newTask, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await DatabaseService.updateTask(id, updates);
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await DatabaseService.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  // Project actions
  const createProject = async (project: Omit<Project, 'id'>) => {
    try {
      const newProject = await DatabaseService.createProject(project);
      setProjects(prev => [newProject, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const updatedProject = await DatabaseService.updateProject(id, updates);
      setProjects(prev => prev.map(project => project.id === id ? updatedProject : project));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await DatabaseService.deleteProject(id);
      setProjects(prev => prev.filter(project => project.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  // Marketing actions
  const createMarketingGoal = async (goal: Omit<MarketingGoal, 'id'>) => {
    try {
      const newGoal = await DatabaseService.createMarketingGoal(goal);
      setMarketingGoals(prev => [newGoal, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const updateMarketingGoal = async (id: string, updates: Partial<MarketingGoal>) => {
    try {
      const updatedGoal = await DatabaseService.updateMarketingGoal(id, updates);
      setMarketingGoals(prev => prev.map(goal => goal.id === id ? updatedGoal : goal));
      if (activeMarketingGoal?.id === id) {
        setActiveMarketingGoalState(updatedGoal);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const deleteMarketingGoal = async (id: string) => {
    try {
      await DatabaseService.deleteMarketingGoal(id);
      setMarketingGoals(prev => prev.filter(goal => goal.id !== id));
      if (activeMarketingGoal?.id === id) {
        setActiveMarketingGoalState(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const createMarketingModule = async (module: Omit<MarketingModule, 'id'>) => {
    try {
      const newModule = await DatabaseService.createMarketingModule(module);
      setMarketingModules(prev => [...prev, newModule].sort((a, b) => a.weekNumber - b.weekNumber));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const updateMarketingModule = async (id: string, updates: Partial<MarketingModule>) => {
    try {
      const updatedModule = await DatabaseService.updateMarketingModule(id, updates);
      setMarketingModules(prev => prev.map(module => module.id === id ? updatedModule : module));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const createMarketingTask = async (task: Omit<MarketingTask, 'id'>) => {
    try {
      const newTask = await DatabaseService.createMarketingTask(task);
      setMarketingTasks(prev => [...prev, newTask]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const updateMarketingTask = async (id: string, updates: Partial<MarketingTask>) => {
    try {
      const updatedTask = await DatabaseService.updateMarketingTask(id, updates);
      setMarketingTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  // Calendar actions
  const createCalendarEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    try {
      const newEvent = await DatabaseService.createCalendarEvent(event);
      setCalendarEvents(prev => [...prev, newEvent].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const updateCalendarEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    try {
      const updatedEvent = await DatabaseService.updateCalendarEvent(id, updates);
      setCalendarEvents(prev => prev.map(event => event.id === id ? updatedEvent : event));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const deleteCalendarEvent = async (id: string) => {
    try {
      await DatabaseService.deleteCalendarEvent(id);
      setCalendarEvents(prev => prev.filter(event => event.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  // Asset actions
  const createAsset = async (asset: Omit<Asset, 'id'>) => {
    try {
      const newAsset = await DatabaseService.createAsset(asset);
      setAssets(prev => [newAsset, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const updateAsset = async (id: string, updates: Partial<Asset>) => {
    try {
      const updatedAsset = await DatabaseService.updateAsset(id, updates);
      setAssets(prev => prev.map(asset => asset.id === id ? updatedAsset : asset));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const deleteAsset = async (id: string) => {
    try {
      await DatabaseService.deleteAsset(id);
      setAssets(prev => prev.filter(asset => asset.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  // Branding kit actions
  const createBrandingKit = async (kit: Omit<BrandingKit, 'id'>) => {
    try {
      const newKit = await DatabaseService.createBrandingKit(kit);
      setBrandingKits(prev => [newKit, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const updateBrandingKit = async (id: string, updates: Partial<BrandingKit>) => {
    try {
      const updatedKit = await DatabaseService.updateBrandingKit(id, updates);
      setBrandingKits(prev => prev.map(kit => kit.id === id ? updatedKit : kit));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const deleteBrandingKit = async (id: string) => {
    try {
      await DatabaseService.deleteBrandingKit(id);
      setBrandingKits(prev => prev.filter(kit => kit.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  // Share link actions
  const createShareLink = async (link: Omit<ShareLink, 'id'>) => {
    try {
      const newLink = await DatabaseService.createShareLink(link);
      setShareLinks(prev => [newLink, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const updateShareLink = async (id: string, updates: Partial<ShareLink>) => {
    try {
      const updatedLink = await DatabaseService.updateShareLink(id, updates);
      setShareLinks(prev => prev.map(link => link.id === id ? updatedLink : link));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const deleteShareLink = async (id: string) => {
    try {
      await DatabaseService.deleteShareLink(id);
      setShareLinks(prev => prev.filter(link => link.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  // Timeline actions
  const createTimelinePhase = async (phase: Omit<TimelinePhase, 'id'>) => {
    try {
      const newPhase = await DatabaseService.createTimelinePhase(phase);
      setTimelinePhases(prev => [...prev, newPhase].sort((a, b) => a.order - b.order));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const updateTimelinePhase = async (id: string, updates: Partial<TimelinePhase>) => {
    try {
      const updatedPhase = await DatabaseService.updateTimelinePhase(id, updates);
      setTimelinePhases(prev => prev.map(phase => phase.id === id ? updatedPhase : phase));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const deleteTimelinePhase = async (id: string) => {
    try {
      await DatabaseService.deleteTimelinePhase(id);
      setTimelinePhases(prev => prev.filter(phase => phase.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const value: DataContextType = {
    // State
    tasks,
    projects,
    marketingGoals,
    marketingModules,
    marketingTasks,
    calendarEvents,
    assets,
    assetCategories,
    brandingKits,
    shareLinks,
    timelinePhases,
    activeMarketingGoal,
    loading,
    error,

    // Actions
    refreshData,
    setActiveMarketingGoal,
    createTask,
    updateTask,
    deleteTask,
    createProject,
    updateProject,
    deleteProject,
    createMarketingGoal,
    updateMarketingGoal,
    deleteMarketingGoal,
    createMarketingModule,
    updateMarketingModule,
    createMarketingTask,
    updateMarketingTask,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    createAsset,
    updateAsset,
    deleteAsset,
    createBrandingKit,
    updateBrandingKit,
    deleteBrandingKit,
    createShareLink,
    updateShareLink,
    deleteShareLink,
    createTimelinePhase,
    updateTimelinePhase,
    deleteTimelinePhase,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}; 