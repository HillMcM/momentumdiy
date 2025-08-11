import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import TaskTrackerWidget from './TaskTrackerWidget';
import TaskTrackerPage from './TaskTrackerPage';
import MarketingTrackWidget from './MarketingTrackWidget';
import MarketingTrackPage from './MarketingTrackPage';
import ProfilePage from './ProfilePage';
import { useState, useEffect } from 'react';
import type { Project, Task, MarketingGoal } from './types';
import OctopusLogo from './assets/octopus_icon.png';
import { apiService } from './services/api';
import AIMarketingAssistant from './AIMarketingAssistant';
import FloatingAssistant from './FloatingAssistant';
import ProtectedRoute from './ProtectedRoute';
import LandingPage from './LandingPage';
import AuthPage from './AuthPage';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';

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
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {user ? (
          <button className="upgrade-btn" onClick={() => signOut()}>Sign out</button>
        ) : (
          <Link className="upgrade-btn" to="/auth">Sign in</Link>
        )}
      </div>
    </header>
  );
}

function SidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <button className="sidebar-toggle" onClick={onClick} aria-label="Toggle sidebar" title="Open menu">
      <img src={OctopusLogo} alt="menu" style={{ width: 24, height: 24, filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
    </button>
  );
}

function Sidebar({ hidden }: { hidden: boolean }) {
  const location = useLocation();
  const { user } = useAuth();
  const deriveNameFromUser = (u: any | null) => {
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
        if (!user) return;
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
  }, [user?.id]);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLinkClick = (path: string) => {
    console.log('Navigating to:', path);
  };

  return (
    <nav className={`sidebar${hidden ? ' hidden' : ''}`}>
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
  onMarketingGoalsChange: (goals: MarketingGoal[]) => void;
}

function Dashboard({ 
  projects, 
  tasks, 
  marketingGoals, 
  onProjectsChange, 
  onTasksChange,
  onMarketingGoalsChange
}: DashboardProps) {
  const activeGoal = marketingGoals.find(g => g.isActive);
  const visibleTasks = activeGoal 
    ? tasks.filter(t => t.marketingTrack && t.marketingTrack.goalId === activeGoal.id)
    : tasks;

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
      <MarketingTrackWidget marketingGoals={marketingGoals} onMarketingGoalsChange={onMarketingGoalsChange} />
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
        console.log('Loading data from API...');
        
        // Test backend connectivity first
        console.log('Testing backend connectivity...');
        try {
          // Use backend base URL from env-aware API module
          const { BACKEND_BASE_URL } = await import('./services/api');
          const healthResponse = await fetch(`${BACKEND_BASE_URL}/health`);
          if (healthResponse.ok) {
            console.log('✅ Backend is running and responding');
          } else {
            console.error('❌ Backend health check failed:', healthResponse.status);
          }
        } catch (healthError) {
          console.error('❌ Backend connectivity test failed:', healthError);
        }
        
        // Load tasks
        console.log('Fetching tasks from API...');
        const tasksResponse = await apiService.getTasks();
        console.log('Tasks API response:', tasksResponse);
        if (tasksResponse.success && tasksResponse.data) {
          setTasks(dedupeTasks(tasksResponse.data));
          console.log('✅ Loaded tasks:', tasksResponse.data.length);
        } else {
          console.error('❌ Failed to load tasks:', tasksResponse.error);
        }
        
        // Load projects
        console.log('Fetching projects from API...');
        const projectsResponse = await apiService.getProjects();
        console.log('Projects API response:', projectsResponse);
        if (projectsResponse.success && projectsResponse.data) {
          setProjects(projectsResponse.data);
          console.log('✅ Loaded projects:', projectsResponse.data.length);
        } else {
          console.error('❌ Failed to load projects:', projectsResponse.error);
        }
        
        // Load marketing goals directly from Supabase-backed API
        console.log('Fetching marketing goals from API...');
        const goalsResponse = await apiService.getMarketingGoals();
        console.log('Marketing goals API response:', goalsResponse);
        if (goalsResponse.success && goalsResponse.data) {
          setMarketingGoals(goalsResponse.data);
          console.log('✅ Loaded marketing goals:', goalsResponse.data.length);
        } else {
          console.error('❌ Failed to load marketing goals:', goalsResponse.error);
        }
        
        // Load calendar events
        console.log('Fetching calendar events from API...');
        const eventsResponse = await apiService.getCalendarEvents();
        console.log('Calendar events API response:', eventsResponse);
        if (eventsResponse.success && eventsResponse.data) {
          // setCustomEvents(eventsResponse.data); // This line was commented out in the new_code, so it's commented out here.
          console.log('✅ Loaded calendar events:', eventsResponse.data.length);
        } else {
          console.log('ℹ️ No calendar events loaded or error occurred');
        }

        // Comment out asset loading since asset library is deactivated
        /*
        // Load assets
        const assetsResponse = await apiService.getAssets();
        console.log('Assets API response:', assetsResponse);
        if (assetsResponse.success && assetsResponse.data) {
          // setAssets(assetsResponse.data); // This line was commented out in the new_code, so it's commented out here.
          console.log('Loaded assets:', assetsResponse.data.length);
        } else {
          console.log('No assets loaded or error occurred');
        }
        */
        
      } catch (error) {
        console.error('❌ Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleTasksChange = async (updatedTasks: Task[]) => {
    console.log('App: handleTasksChange called with', updatedTasks.length, 'tasks');
    const newTasks = updatedTasks.filter(t => !tasks.find(existing => existing.id === t.id));
    console.log('App: New tasks:', newTasks);
    
    // Update local state immediately for UI responsiveness
    setTasks(dedupeTasks(updatedTasks));
    
    // Persist changes to database
    try {
      // Handle new tasks
      for (const newTask of newTasks) {
        console.log('Creating new task:', newTask.title);
        const looksLikeUuid = typeof newTask.projectId === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(newTask.projectId);
        const payload: any = {
          title: newTask.title,
          description: newTask.description || '',
          responsible: newTask.responsible,
          status: newTask.status,
          deadline: newTask.deadline,
          project: newTask.project,
        };
        if (looksLikeUuid) payload.projectId = newTask.projectId;
        const response = await apiService.createTask(payload);
        
        if (!response.success) {
          console.error('Failed to create task:', response.error);
        }
      }
      
      // Handle updated tasks
      const existingTasks = updatedTasks.filter(t => !newTasks.find(nt => nt.id === t.id));
      for (const updatedTask of existingTasks) {
        const originalTask = tasks.find(t => t.id === updatedTask.id);
        if (originalTask && JSON.stringify(originalTask) !== JSON.stringify(updatedTask)) {
          console.log('Updating task:', updatedTask.title);
          const looksLikeUuid = typeof updatedTask.projectId === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(updatedTask.projectId);
          const updatePayload: any = {
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
    
    setMarketingGoals(updatedGoals);
  };

  const handleProjectsChange = async (updatedProjects: Project[]) => {
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
  };

  const handleMarketingGoalsChange = async (updatedGoals: MarketingGoal[]) => {
    console.log('App: handleMarketingGoalsChange called with', updatedGoals.length, 'goals');
    console.log('App: Updated goals details:');
    updatedGoals.forEach((g, index) => {
      console.log(`  Goal ${index + 1}:`, { id: g.id, title: g.title, isActive: g.isActive, currentWeek: g.currentWeek });
    });
    
    // Update local state immediately for UI responsiveness
    setMarketingGoals(updatedGoals);
    
    // Persist changes to database
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
          originalGoal.progress !== existingGoal.progress
        )) {
          console.log('Updating marketing goal:', existingGoal.title);
          const response = await apiService.updateMarketingGoal(existingGoal.id, {
            isActive: existingGoal.isActive,
            currentWeek: existingGoal.currentWeek,
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
  };

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

  console.log('App component about to render JSX...');

  if (isLoading) {
    return (
      <>
        <Header />
        <div className={`app-shell${sidebarHidden ? ' collapsed' : ''}`} style={{ position: 'relative' }}>
          <Sidebar hidden={sidebarHidden} />
          <SidebarToggle onClick={() => setSidebarHidden(s => !s)} />
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
        <Sidebar hidden={sidebarHidden} />
        <SidebarToggle onClick={() => setSidebarHidden(s => !s)} />
        <main className="main-content">
          <Routes>
            <Route index element={
              <Dashboard 
                projects={projects}
                tasks={tasks}
                marketingGoals={marketingGoals}
                onProjectsChange={handleProjectsChange}
                onTasksChange={handleTasksChange}
                onMarketingGoalsChange={handleMarketingGoalsChange}
              />
            } />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="marketing-track" element={
              <MarketingTrackPage 
                marketingGoals={marketingGoals}
                onMarketingGoalsChange={handleMarketingGoalsChange}
                onTasksChange={handleTasksChange}
                tasks={tasks}
                projects={projects}
                onProjectsChange={handleProjectsChange}
              />
            } />
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
            <Route path="manage-subscription" element={<Placeholder title="Manage Subscription" />} />
            <Route path="feedback" element={<Placeholder title="Feedback" />} />
          </Routes>
          <FloatingAssistant />
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

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/app/*" element={<ProtectedApp />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
