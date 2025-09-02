import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
// Alternative: import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import './App.css';
import TaskTrackerWidget from './TaskTrackerWidget';
import TaskTrackerPage from './TaskTrackerPage';
import MarketingTrackWidget from './MarketingTrackWidget';
import MarketingTrackPage from './MarketingTrackPage';
import { LocalFootTrafficTrack, SocialMediaStrategyTrack } from './marketing-tracks';
import SocialProfileManager from './SocialProfileManager';
import ProfilePage from './ProfilePage';
import { useState, useEffect, useRef, useCallback } from 'react';
import type { Project, Task, MarketingGoal } from './types';
import OctopusLogo from './assets/octopus_icon.png';
import SidebarToggleIcon from './assets/sidebar_toggle.svg';
import { apiService } from './services/api';
import AIMarketingAssistant from './AIMarketingAssistant';
import FloatingAssistant from './FloatingAssistant';

import LandingPage from './LandingPage';
import AuthPage from './AuthPage';
import { useAuth } from './contexts/useAuth';
import { MarketingProvider, useMarketing } from './contexts/MarketingContext';

import { supabase } from './lib/supabase';
import { mockTasks, mockMarketingGoals } from './mockData';
import { convertMarketingTasksToTasks, getActiveGoal } from './services/marketingService';
import CheckoutPage from './CheckoutPage';
import SubscriptionPage from './SubscriptionPage';


// Component to handle task synchronization between marketing track and task tracker
function TaskSync({ tasks, setTasks }: { tasks: Task[], setTasks: (tasks: Task[]) => void }) {
  const { activeGoal } = useMarketing();
  
  // Sync marketing tasks to task tracker
  useEffect(() => {
    console.log('🔄 Marketing tasks sync effect triggered');
    console.log('📊 Current tasks count:', tasks.length);
    console.log('🎯 Active goal:', activeGoal);
    console.log('🔍 Active goal modules unlock status:', activeGoal?.modules.map(m => `Week ${m.weekNumber}: unlocked=${m.isUnlocked}`));
    
    if (!activeGoal) {
      console.log('❌ No active marketing goal to sync');
      return;
    }
    
    // Convert marketing tasks to regular tasks (only from unlocked modules)
    const marketingTasks = convertMarketingTasksToTasks(activeGoal);
    console.log('🔄 Converted marketing tasks from unlocked modules:', marketingTasks);
    
    // Get all marketing task IDs that should be in the task tracker
    const marketingTaskIds = new Set(marketingTasks.map(t => t.id));
    
    // Remove tasks that are no longer from unlocked modules
    const nonMarketingTasks = tasks.filter(task => !task.marketingTrack);
    const validMarketingTasks = tasks.filter(task => 
      task.marketingTrack && marketingTaskIds.has(task.id)
    );
    
    // Add new marketing tasks that aren't already in the tracker
    const existingTaskIds = new Set(tasks.map(t => t.id));
    const newMarketingTasks = marketingTasks.filter(t => !existingTaskIds.has(t.id));
    
    // Combine all tasks: non-marketing + valid marketing + new marketing
    const updatedTasks = [...nonMarketingTasks, ...validMarketingTasks, ...newMarketingTasks];
    
    const removedCount = tasks.length - (nonMarketingTasks.length + validMarketingTasks.length);
    const addedCount = newMarketingTasks.length;
    
    if (removedCount > 0 || addedCount > 0) {
      console.log(`✅ Task sync complete: ${removedCount} removed, ${addedCount} added`);
      setTasks(updatedTasks);
    } else {
      console.log('ℹ️ No task changes needed');
    }
  }, [activeGoal, tasks]);
  
  return null; // This component doesn't render anything
}

// Comment out deactivated component imports to prevent build errors
/*
import ProjectTrackerWidget from './ProjectTrackerWidget';
import ProjectTrackerPage from './ProjectTrackerPage';
import AssetLibraryWidget from './AssetLibraryWidget';
import AssetLibraryPage from './AssetLibraryPage';
import CalendarWidget from './CalendarWidget';
import CalendarPage from './CalendarPage';
import TestPage from './TestPage';
import SimpleTest from './SimpleTest';
import CreateEventModal from './CreateEventModal';
*/

function Header() {
  const { user, signOut } = useAuth();
  return (
    <header className="main-header">
      <div className="header-left">
        <img src={OctopusLogo} alt="MomentumDIY Logo" className="header-logo" />
        <span className="header-app-name">MomentumDIY</span>
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <button 
          className="upgrade-btn"
          style={{ 
            background: '#EF8E81 !important', 
            color: '#FFF1E7 !important', 
            border: 'none !important', 
            borderRadius: '999px !important', 
            padding: '0.75rem 2rem !important', 
            fontSize: '1.1rem !important', 
            fontWeight: '700 !important', 
            boxShadow: '0 4px 16px 0 rgba(239, 142, 129, 0.25) !important', 
            cursor: 'pointer !important', 
            transition: 'background 0.2s, box-shadow 0.2s !important', 
            outline: 'none !important' 
          }}
        >
          Upgrade
        </button>
        {user ? (
          <button 
            className="upgrade-btn" 
            onClick={() => signOut()}
            style={{ 
              background: '#EF8E81 !important', 
              color: '#FFF1E7 !important', 
              border: 'none !important', 
              borderRadius: '999px !important', 
              padding: '0.75rem 2rem !important', 
              fontSize: '1.1rem !important', 
              fontWeight: '700 !important', 
              boxShadow: '0 4px 16px 0 rgba(239, 142, 129, 0.25) !important', 
              cursor: 'pointer !important', 
              transition: 'background 0.2s, box-shadow 0.2s !important', 
              outline: 'none !important' 
            }}
          >
            Sign out
          </button>
        ) : (
          <span 
            className="upgrade-btn" 
            style={{ 
              background: '#10b981 !important', 
              color: '#FFF1E7 !important', 
              border: 'none !important', 
              borderRadius: '999px !important', 
              padding: '0.75rem 2rem !important', 
              fontSize: '1.1rem !important', 
              fontWeight: '700 !important', 
              boxShadow: '0 4px 16px 0 rgba(16, 185, 129, 0.25) !important', 
              cursor: 'pointer !important', 
              transition: 'background 0.2s, box-shadow 0.2s !important', 
              outline: 'none !important' 
            }}
          >
            🚀 Development Mode
          </span>
        )}
      </div>
    </header>
  );
}

function SidebarToggle({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button className={className || 'sidebar-toggle'} onClick={onClick} aria-label="Toggle sidebar" title="Open menu">
      <img src={SidebarToggleIcon} alt="menu" style={{ width: 24, height: 24 }} />
    </button>
  );
}

function Sidebar({ hidden, onToggle, showProfileManager }: { hidden: boolean; onToggle: () => void; showProfileManager?: boolean }) {
  const location = useLocation();
  const { user } = useAuth();
  const deriveNameFromUser = (u: { user_metadata?: { full_name?: string; name?: string }; email?: string } | null) => {
    if (!u) return 'Business Name';
    const metaName = (u.user_metadata && (u.user_metadata.full_name || u.user_metadata.name)) || '';
    const emailName = (u.email ? String(u.email).split('@')[0] : '') || '';
    return metaName?.trim() || emailName || 'Business Name';
  };
  const [businessName, setBusinessName] = useState<string>(deriveNameFromUser(user));

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!user) {
          // In development mode without auth, use a default business name
          if (mounted) {
            setBusinessName('MomentumDIY Business');
          }
          return;
        }
        const { data } = await supabase
          .from('profiles')
          .select('business_name, full_name, email')
          .eq('id', user.id)
          .maybeSingle();
        if (!mounted) return;
        const name = (data?.business_name?.trim()) || (data?.full_name?.trim()) || (data?.email?.split('@')[0]) || deriveNameFromUser(user);
        setBusinessName(name);
      } catch {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, [user, user?.id]);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLinkClick = (path: string) => {
    console.log('Navigating to:', path);
  };

  return (
    <nav className={`sidebar${hidden ? ' hidden' : ''}`}>
      {!hidden && (
        <div style={{ position: 'absolute', top: 8, right: 8 }}>
          <SidebarToggle onClick={onToggle} />
        </div>
      )}
      <Link to="/app/profile" className="sidebar-header" style={{ display: 'block', textDecoration: 'none' }}>
        {businessName}
      </Link>
      <ul>
        <li>
          <Link 
            to="/app" 
            className={isActive('/app') ? 'active' : ''}
            onClick={() => handleLinkClick('/app')}
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link 
            to="/app/profile" 
            className={isActive('/app/profile') ? 'active' : ''}
            onClick={() => handleLinkClick('/app/profile')}
          >
            Profile
          </Link>
        </li>
        <li>
          <Link 
            to="/app/marketing-track" 
            className={isActive('/app/marketing-track') ? 'active' : ''}
            onClick={() => handleLinkClick('/app/marketing-track')}
          >
            Marketing Track
          </Link>
        </li>
        {showProfileManager && (
          <li>
            <Link 
              to="/app/profile-manager" 
              className={isActive('/app/profile-manager') ? 'active' : ''}
              onClick={() => handleLinkClick('/app/profile-manager')}
            >
              Social Profile Manager
            </Link>
          </li>
        )}
        <li>
          <Link 
            to="/app/task-tracker" 
            className={isActive('/app/task-tracker') ? 'active' : ''}
            onClick={() => handleLinkClick('/app/task-tracker')}
          >
            Task Tracker
          </Link>
        </li>
        <li>
          <Link 
            to="/app/ai-marketing-assistant" 
            className={isActive('/app/ai-marketing-assistant') ? 'active' : ''}
            onClick={() => handleLinkClick('/app/ai-marketing-assistant')}
          >
            AI Marketing Assistant
          </Link>
        </li>
        {/* Non-core features are temporarily hidden
        - Marketing Calendar
        - Project Management  
        - Asset Library
        - Manage Subscription
        - Test Pages
        */}
      </ul>
      <div className="sidebar-footer">
        <Link 
          to="/feedback" 
          className={isActive('/feedback') ? 'active' : ''}
          onClick={() => handleLinkClick('/feedback')}
        >
          Feedback
        </Link>
        <Link 
          to="/terms" 
          className={isActive('/terms') ? 'active' : ''}
          onClick={() => handleLinkClick('/terms')}
        >
          Terms & Conditions
        </Link>
      </div>
    </nav>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>{title}</h1>
      <p>This feature is coming soon!</p>
    </div>
  );
}

interface DashboardProps {
  projects: Project[];
  tasks: Task[];
  marketingGoals: MarketingGoal[];
  onProjectsChange: (projects: Project[]) => void;
  onTasksChange: (tasks: Task[]) => void;
}

function Dashboard({ 
  projects, 
  tasks, 
  marketingGoals, 
  onProjectsChange, 
  onTasksChange
}: DashboardProps) {
  const activeGoal = marketingGoals.find(g => g.isActive);
    // Include tasks linked via marketingTrack OR via the active goal's projectId
    const activeProject = activeGoal ? projects.find(p => p.name === activeGoal.title) : undefined;
    let visibleTasks = activeGoal 
      ? tasks.filter(t => (
          (t.marketingTrack && t.marketingTrack.goalId === activeGoal.id) ||
          (activeProject && t.projectId === activeProject.id)
        ))
      : tasks;
    // Fallback: if none found via filters, show all tasks so dashboard isn't empty
    if (activeGoal && visibleTasks.length === 0) {
      visibleTasks = tasks;
    }

  const handleSubsetTasksChange = (updatedVisible: Task[]) => {
    if (!activeGoal) {
      onTasksChange(updatedVisible);
      return;
    }
    const others = tasks.filter(t => !(t.marketingTrack && t.marketingTrack.goalId === activeGoal.id));
    onTasksChange([...others, ...updatedVisible]);
  };
  return (
    <div>
      <MarketingTrackWidget />

      <TaskTrackerWidget 
        projects={projects}
        tasks={visibleTasks}
        onTasksChange={handleSubsetTasksChange}
        onProjectsChange={onProjectsChange}
      />
      {/* Comment out non-core widgets for now */}
      {/* 
      <ProjectTrackerWidget 
        projects={projects}
        onProjectsChange={onProjectsChange}
        tasks={tasks}
      />
      <AssetLibraryWidget 
        assets={assets}
        brandingKits={brandingKits}
        shareLinks={shareLinks}
        onAssetsChange={onAssetsChange}
        onBrandingKitsChange={onBrandingKitsChange}
        onShareLinksChange={onShareLinksChange}
        onNavigateToAssetLibrary={handleNavigateToAssetLibrary}
      />
      */}
    </div>
  );
}

function ProtectedApp() {
  console.log('App component rendering...');
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [marketingGoals, setMarketingGoals] = useState<MarketingGoal[]>([]);
  const [sidebarHidden, setSidebarHidden] = useState<boolean>(false);
  
  // Comment out non-core state for now
  // const [assets, setAssets] = useState<Asset[]>([]);
  // const [brandingKits, setBrandingKits] = useState<BrandingKit[]>([]);
  // const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  // const [customEvents, setCustomEvents] = useState<CalendarEvent[]>([]);
  // const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);

  const dedupeTasks = (list: Task[]): Task[] => {
    const map = new Map<string, Task>();
    for (const t of list) {
      const key = t.marketingTrack ? `${t.marketingTrack.goalId}:${t.marketingTrack.moduleId}:${t.marketingTrack.marketingTaskId}` : `${t.project}|${t.title}`;
      const existing = map.get(key);
      // Prefer the marketingTrack-linked version when both exist
      if (!existing) {
        map.set(key, t);
      } else {
        const prefer = (existing.marketingTrack ? existing : t.marketingTrack ? t : existing);
        map.set(key, prefer);
      }
    }
    return Array.from(map.values());
  };

  console.log('App state initialized:', { tasks: tasks.length, projects: projects.length, marketingGoals: marketingGoals.length });
  console.log('App: Current marketing goals details:');
  marketingGoals.forEach((g, index) => {
    console.log(`  Goal ${index + 1}:`, { id: g.id, title: g.title, isActive: g.isActive, currentWeek: g.currentWeek });
  });

  // Load data from API on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log('🚀 Loading data in development mode...');

        // Skip all backend connectivity tests and API calls in development
        console.log('🔄 Using mock data for development - no backend required');

        // Load mock tasks immediately
        setTasks(mockTasks);
        console.log('✅ Loaded mock tasks:', mockTasks.length);

        // Load projects (empty in development)
        setProjects([]);

        // Load marketing goals from service (same source as marketing track page)
        try {
          console.log('🔄 Attempting to load marketing goals from service...');
          const activeGoalResponse = await getActiveGoal();
          console.log('📡 Service response:', activeGoalResponse);
          
          if (activeGoalResponse.success && activeGoalResponse.data) {
            // Create a marketing goals array with the active goal
            const marketingGoalsArray = [activeGoalResponse.data];
            setMarketingGoals(marketingGoalsArray);
            console.log('✅ Loaded marketing goals from service:', marketingGoalsArray.length);
            console.log('🎯 Active goal details:', activeGoalResponse.data);
          } else {
            // Fallback to mock data if service fails
            console.log('⚠️ Service failed, using mock marketing goals');
            setMarketingGoals(mockMarketingGoals);
            console.log('📊 Mock goals loaded:', mockMarketingGoals.length);
          }
        } catch (error) {
          console.warn('⚠️ Marketing service error, using mock data:', error);
          setMarketingGoals(mockMarketingGoals);
        }

        // Skip calendar events (deactivated)
        console.log('🚫 Skipping calendar API call - feature deactivated');

        console.log('🎉 All data loaded successfully from mock data!');

      } catch (error) {
        console.error('❌ Unexpected error loading data:', error);
        // Set fallback data on error
        setTasks(mockTasks);
        setMarketingGoals(mockMarketingGoals);
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Cleanup effect to clear pending task creation timeouts
  // Debounced task creation to prevent rapid duplicate API calls
  const taskCreationQueue = useRef<Map<string, NodeJS.Timeout>>(new Map());
  
  useEffect(() => {
    const currentQueue = taskCreationQueue.current;
    return () => {
      // Clear all pending timeouts when component unmounts
      currentQueue.forEach(timeoutId => {
        clearTimeout(timeoutId);
      });
      currentQueue.clear();
    };
  }, []);
  
  const debouncedCreateTask = useCallback(async (taskData: { title: string; description: string; responsible: string; status: 'todo' | 'in-progress' | 'completed'; deadline?: string | null; project?: string; projectId?: string }) => {
    const taskKey = `${taskData.title}:${taskData.project || taskData.projectId}`;
    
    // Clear existing timeout for this task
    if (taskCreationQueue.current.has(taskKey)) {
      clearTimeout(taskCreationQueue.current.get(taskKey)!);
    }
    
    // Set new timeout
    const timeoutId = setTimeout(async () => {
      try {
        console.log('Creating task after debounce:', taskData.title);
        const response = await apiService.createTask(taskData);
        if (!response.success) {
          console.error('Failed to create task:', response.error);
        }
      } catch (error) {
        console.error('Error creating task:', error);
      } finally {
        // Remove from queue
        taskCreationQueue.current.delete(taskKey);
      }
    }, 500); // 500ms debounce
    
    taskCreationQueue.current.set(taskKey, timeoutId);
  }, []);

  const handleTasksChange = useCallback(async (updatedTasks: Task[]) => {
    console.log('App: handleTasksChange called with', updatedTasks.length, 'tasks');
    // Treat ids that contain "-w" as placeholders that must be created first
    const isPlaceholderId = (id: string) => id.includes('-w');
    const newTasks = updatedTasks.filter(t => !tasks.find(existing => existing.id === t.id) || isPlaceholderId(t.id));
    console.log('App: New tasks:', newTasks);
    
    // Update local state immediately for UI responsiveness
    setTasks(dedupeTasks(updatedTasks));
    
    // Persist changes to database using debounced creation
    try {
      // Handle new tasks with debouncing
      for (const newTask of newTasks) {
        console.log('Queueing new task for creation:', newTask.title);
        const looksLikeUuid = typeof newTask.projectId === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(newTask.projectId);
        const payload: { title: string; description: string; responsible: string; status: 'todo' | 'in-progress' | 'completed'; deadline?: string | null; project?: string; projectId?: string } = {
          title: newTask.title,
          description: newTask.description || '',
          responsible: newTask.responsible,
          status: newTask.status,
          deadline: newTask.deadline,
          project: newTask.project,
        };
        if (looksLikeUuid) payload.projectId = newTask.projectId;
        
        // Use debounced creation instead of immediate API call
        await debouncedCreateTask(payload);
      }
      
      // Handle updated tasks
      const existingTasks = updatedTasks.filter(t => !newTasks.find(nt => nt.id === t.id));
      for (const updatedTask of existingTasks) {
        const originalTask = tasks.find(t => t.id === updatedTask.id);
        if (originalTask && !isPlaceholderId(updatedTask.id) && JSON.stringify(originalTask) !== JSON.stringify(updatedTask)) {
          console.log('Updating task:', updatedTask.title);
          const looksLikeUuid = typeof updatedTask.projectId === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(updatedTask.projectId);
          const updatePayload: { title: string; description: string; responsible: string; status: 'todo' | 'in-progress' | 'completed'; deadline?: string | null; project?: string; projectId?: string; timeSpent?: string; notifications?: boolean } = {
            title: updatedTask.title,
            description: updatedTask.description || '',
            responsible: updatedTask.responsible,
            status: updatedTask.status,
            deadline: updatedTask.deadline,
            project: updatedTask.project,
            timeSpent: updatedTask.timeSpent,
            notifications: updatedTask.notifications
          };
          if (looksLikeUuid) updatePayload.projectId = updatedTask.projectId;
          const response = await apiService.updateTask(updatedTask.id, updatePayload);
          
          if (!response.success) {
            console.error('Failed to update task:', response.error);
          }
        }
      }
    } catch (error) {
      console.error('Error persisting task changes:', error);
    }
    
    // Check if we're adding new marketing track tasks (which means we're setting up a track)
    const hasNewMarketingTasks = newTasks.some(task => task.marketingTrack);
    if (hasNewMarketingTasks) {
      console.log('App: Detected new marketing track tasks, skipping goal sync to preserve active state');
      return;
    }
    
    // Sync marketing track tasks but preserve active goal states
    console.log('App: Syncing marketing track tasks');
    const updatedGoals = marketingGoals.map(goal => {
      const updatedModules = goal.modules.map(module => {
        const updatedModuleTasks = module.tasks.map(marketingTask => {
          // Find the corresponding main task
          const mainTask = updatedTasks.find((t: Task) => t.marketingTrack?.marketingTaskId === marketingTask.id);
          if (mainTask) {
            return { ...marketingTask, isCompleted: mainTask.status === 'completed' };
          }
          return marketingTask;
        });
        return { ...module, tasks: updatedModuleTasks };
      });
      
      // Recalculate progress
      const totalTasks = updatedModules.reduce((sum, module) => sum + module.tasks.length, 0);
      const completedTasks = updatedModules.reduce((sum, module) => 
        sum + module.tasks.filter(task => task.isCompleted).length, 0
      );
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      // Preserve active goal state and current week
      return { 
        ...goal, 
        modules: updatedModules, 
        progress,
        isActive: goal.isActive, // Preserve active state
        currentWeek: goal.currentWeek // Preserve current week
      };
    });
    
    // Never downgrade currentWeek during this sync; merge with previous state
    setMarketingGoals(prevGoals => {
      return prevGoals.map(prevGoal => {
        const synced = updatedGoals.find(g => g.id === prevGoal.id) || prevGoal;
        const safeCurrentWeek = Math.max(prevGoal.currentWeek || 0, synced.currentWeek || 0);
        return { ...synced, currentWeek: safeCurrentWeek };
      });
    });
  }, [tasks, marketingGoals, setTasks, setMarketingGoals, debouncedCreateTask]);

  const handleProjectsChange = useCallback(async (updatedProjects: Project[]) => {
    console.log('App: handleProjectsChange called with', updatedProjects.length, 'projects');
    console.log('App: Projects:', updatedProjects.map(p => ({ id: p.id, name: p.name, status: p.status })));
    
    // Update local state immediately for UI responsiveness
    setProjects(updatedProjects);
    
    // Persist changes to database
    try {
      const newProjects = updatedProjects.filter(p => !projects.find(existing => existing.id === p.id));
      const deletedProjects = projects.filter(p => !updatedProjects.find(up => up.id === p.id));
      
      // Handle new projects
      for (const newProject of newProjects) {
        console.log('Creating new project:', newProject.name);
        // Create in database
        try {
          const response = await apiService.createProject({
            name: newProject.name,
            description: newProject.description || '',
            deadline: newProject.deadline,
            status: newProject.status
          });
          
          if (response.success && response.data) {
            console.log('Project created successfully:', response.data);
          } else {
            console.error('Failed to create project:', response.error);
          }
        } catch (error) {
          console.error('Error creating project:', error);
        }
      }
      
      // Handle updated projects
      const existingProjects = updatedProjects.filter(p => !newProjects.find(np => np.id === p.id));
      for (const updatedProject of existingProjects) {
        const originalProject = projects.find(p => p.id === updatedProject.id);
        if (originalProject && JSON.stringify(originalProject) !== JSON.stringify(updatedProject)) {
          console.log('Updating project:', updatedProject.name);
          const response = await apiService.updateProject(updatedProject.id, {
            name: updatedProject.name,
            description: updatedProject.description || '',
            deadline: updatedProject.deadline,
            status: updatedProject.status
          });
          
          if (!response.success) {
            console.error('Failed to update project:', response.error);
          }
        }
      }
      
      // Handle deleted projects
      for (const deletedProject of deletedProjects) {
        console.log('Deleting project:', deletedProject.name);
        const response = await apiService.deleteProject(deletedProject.id);
        
        if (!response.success) {
          console.error('Failed to delete project:', response.error);
        }
      }
    } catch (error) {
      console.error('Error persisting project changes:', error);
    }
  }, [projects, setProjects]);

  const handleMarketingGoalsChange = useCallback(async (updatedGoals: MarketingGoal[]) => {
    console.log('App: handleMarketingGoalsChange called with', updatedGoals.length, 'goals');
    console.log('App: Updated goals details:');
    updatedGoals.forEach((g, index) => {
      console.log(`  Goal ${index + 1}:`, { id: g.id, title: g.title, isActive: g.isActive, currentWeek: g.currentWeek });
    });
    
    // Update local state immediately for UI responsiveness
    setMarketingGoals(updatedGoals);
    
    // Persist changes to database, but never downgrade currentWeek
    try {
      const newGoals = updatedGoals.filter(g => !marketingGoals.find(existing => existing.id === g.id));
      
      // Handle new goals
      for (const newGoal of newGoals) {
        console.log('Creating new marketing goal:', newGoal.title);
        const response = await apiService.createMarketingGoal({
          title: newGoal.title,
          description: newGoal.description || '',
          industry: newGoal.industry || 'General',
          duration: newGoal.duration || 12
        });
        
        if (!response.success) {
          console.error('Failed to create marketing goal:', response.error);
        }
      }
      
      // Handle updated goals
      const existingGoals = updatedGoals.filter(g => !newGoals.find(ng => ng.id === g.id));
      for (const existingGoal of existingGoals) {
        const originalGoal = marketingGoals.find(g => g.id === existingGoal.id);
        if (originalGoal && (
          originalGoal.isActive !== existingGoal.isActive ||
          originalGoal.currentWeek !== existingGoal.currentWeek ||
          originalGoal.progress !== existingGoal.progress ||
          JSON.stringify(originalGoal.modules.map(m => m.tasks)) !== JSON.stringify(existingGoal.modules.map(m => m.tasks))
        )) {
          console.log('Updating marketing goal:', existingGoal.title);
          const nextWeek = Math.max(existingGoal.currentWeek, originalGoal.currentWeek);
          const response = await apiService.updateMarketingGoal(existingGoal.id, {
            isActive: existingGoal.isActive,
            currentWeek: nextWeek,
            progress: existingGoal.progress
          });
          
          if (!response.success) {
            console.error('Failed to update marketing goal:', response.error);
          }
        }
      }
    } catch (error) {
      console.error('Error persisting marketing goals:', error);
    }
  }, [marketingGoals, setMarketingGoals]);

  // Comment out unused handlers for now
  /*
  const handleAssetsChange = async (updatedAssets: Asset[]) => {
    // Implementation removed for now
  };

  const handleBrandingKitsChange = (updatedKits: BrandingKit[]) => {
    // Implementation removed for now
  };

  const handleShareLinksChange = (updatedLinks: ShareLink[]) => {
    // Implementation removed for now
  };

  const handleEventEdit = (event: CalendarEvent) => {
    // Implementation removed for now
  };

  const handleEventSave = async (eventData: { title: string; description: string; startTime: string; endTime: string; projectId?: string; category?: EventCategory }) => {
    // Implementation removed for now
  };

  const handleEventCancel = () => {
    // Implementation removed for now
  };

  const handleEventDelete = async (eventId: string) => {
    // Implementation removed for now
  };
  */

  // Monitor marketing goals state changes
  useEffect(() => {
    console.log('App: marketingGoals state changed to:', marketingGoals.length, 'goals');
    marketingGoals.forEach((g, index) => {
      console.log(`  Goal ${index + 1}:`, { id: g.id, title: g.title, isActive: g.isActive, currentWeek: g.currentWeek });
    });
  }, [marketingGoals]);

  // Auto-sync tasks with active marketing goal so dashboard reflects correct state without visiting the track page
  useEffect(() => {
    if (!marketingGoals.length || !tasks.length || !projects.length) return;
    const activeGoal = marketingGoals.find(g => g.isActive);
    if (!activeGoal) return;
    const activeProject = projects.find(p => p.name === activeGoal.title);
    if (!activeProject) return;

    let changed = false;
    const normalized = (s: string) => s.trim().toLowerCase();
    const modulesToCheck = activeGoal.modules.filter(m => m.weekNumber <= activeGoal.currentWeek);

    const updatedTasks = tasks.map(t => {
      let updated = t;
      if (t.projectId === activeProject.id) {
        for (const mod of modulesToCheck) {
          const mt = mod.tasks.find(mt => normalized(mt.title) === normalized(t.title));
          if (mt) {
            const newTrack = { goalId: activeGoal.id, moduleId: mod.id, marketingTaskId: mt.id } as Task['marketingTrack'];
            const needsTrack = !t.marketingTrack || t.marketingTrack.marketingTaskId !== mt.id || t.marketingTrack.goalId !== activeGoal.id;
            if (needsTrack) {
              // Only attach marketingTrack. Do NOT force status from module to avoid overriding user toggles.
              updated = { ...t, marketingTrack: newTrack };
              changed = true;
            }
            break;
          }
        }
      }
      return updated;
    });

    if (changed) {
      console.log('App: Auto-synced dashboard tasks with marketing track');
      handleTasksChange(updatedTasks);
    }
  }, [marketingGoals, tasks, projects, handleTasksChange]);

  // Function to sync marketing task changes with regular tasks
  const handleMarketingTaskStatusChange = useCallback((taskId: string, isCompleted: boolean) => {
    console.log(`Marketing task ${taskId} status changed to ${isCompleted ? 'completed' : 'incomplete'}`);
    
    // Find the corresponding regular task and update its status
    const regularTask = tasks.find(t => t.marketingTrack?.marketingTaskId === taskId);
    if (regularTask) {
      const newStatus: 'todo' | 'in-progress' | 'completed' = isCompleted ? 'completed' : 'todo';
      if (regularTask.status !== newStatus) {
        console.log(`Updating regular task ${regularTask.id} status to ${newStatus}`);
        const updatedTasks = tasks.map(t => 
          t.id === regularTask.id ? { ...t, status: newStatus } : t
        );
        setTasks(updatedTasks);
      }
    }
  }, [tasks]);



  console.log('App component about to render JSX...');

  if (isLoading) {
    return (
      <>
        <Header />
        <div className={`app-shell${sidebarHidden ? ' collapsed' : ''}`} style={{ position: 'relative' }}>
          <Sidebar hidden={sidebarHidden} onToggle={() => setSidebarHidden(s => !s)} />
          <div style={{ position: 'fixed', top: 80, left: 12, zIndex: 110 }}>
            <SidebarToggle onClick={() => setSidebarHidden(s => !s)} />
          </div>
          <main className="main-content">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
              <div>Loading...</div>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className={`app-shell${sidebarHidden ? ' collapsed' : ''}`} style={{ position: 'relative' }}>
        <Sidebar
          hidden={sidebarHidden}
          onToggle={() => setSidebarHidden(s => !s)}
          showProfileManager={Boolean(marketingGoals.find(g => g.title === 'Improve Social Media Strategy & Engagement' && g.currentWeek >= g.duration))}
        />
        {/* Attach opener only when collapsed */}
        {sidebarHidden && (
          <SidebarToggle className="sidebar-opener" onClick={() => setSidebarHidden(false)} />
        )}
        <main className="main-content">
          <MarketingProvider onTaskStatusChange={handleMarketingTaskStatusChange}>
            <TaskSync tasks={tasks} setTasks={setTasks} />
            <Routes>
            <Route index element={
              <Dashboard 
                projects={projects}
                tasks={tasks}
                marketingGoals={marketingGoals}
                onProjectsChange={handleProjectsChange}
                onTasksChange={handleTasksChange}
              />
            } />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="marketing-track" element={<MarketingTrackPage />} />
            <Route path="marketing-track/local-foot-traffic" element={
              <LocalFootTrafficTrack 
                marketingGoals={marketingGoals}
                onMarketingGoalsChange={handleMarketingGoalsChange}
                onProjectsChange={handleProjectsChange}
                projects={projects}
                tasks={tasks}
              />
            } />
            <Route path="marketing-track/social-media-strategy" element={
              <SocialMediaStrategyTrack 
                marketingGoals={marketingGoals}
                onMarketingGoalsChange={handleMarketingGoalsChange}
                onProjectsChange={handleProjectsChange}
                projects={projects}
              />
            } />
            <Route
              path="profile-manager"
              element={
                marketingGoals.some(g => g.title === 'Improve Social Media Strategy & Engagement' && g.currentWeek >= g.duration)
                  ? <SocialProfileManager marketingGoals={marketingGoals} />
                  : <Navigate to="/app/marketing-track" replace />
              }
            />
            <Route path="task-tracker" element={
              <TaskTrackerPage 
                tasks={tasks}
                projects={projects}
                onTasksChange={handleTasksChange}
                onProjectsChange={handleProjectsChange}
                marketingGoals={marketingGoals}
              />
            } />
            <Route path="ai-marketing-assistant" element={<AIMarketingAssistant />} />
            <Route path="manage-subscription" element={<SubscriptionPage />} />
            <Route path="feedback" element={<Placeholder title="Feedback" />} />
          </Routes>
          <FloatingAssistant />
          </MarketingProvider>
        </main>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/terms" element={<Placeholder title="Terms & Conditions" />} />

        {/* Checkout */}
        <Route path="/checkout/:plan/:interval" element={<CheckoutPage />} />

        {/* App - Now public (no auth required) */}
        <Route path="/app/*" element={
          <MarketingProvider>
            <ProtectedApp />
          </MarketingProvider>
        } />
      </Routes>
    </Router>
  );
}

export default App;
