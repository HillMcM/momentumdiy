import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import './App.css';
import TaskTrackerWidget from './TaskTrackerWidget';
import TaskTrackerPage from './TaskTrackerPage';
import MarketingTrackWidget from './MarketingTrackWidget';
import MarketingTrackPage from './MarketingTrackPage';
import { LocalFootTrafficTrack, SocialMediaStrategyTrack } from './marketing-tracks';
import SocialProfileManager from './SocialProfileManager';
import ProfilePage from './ProfilePage';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useWindowFocus } from './hooks/useWindowFocus';
import type { Project, Task, MarketingGoal } from './types';
import OctopusLogo from './assets/octopus_icon.png';
// import SidebarToggleIcon from './assets/sidebar_toggle.svg';
import { apiService } from './services/api';
import AIMarketingAssistant from './AIMarketingAssistant';
import FloatingAssistant from './FloatingAssistant';
import AdminGuard from './components/AdminGuard';

import LandingPage from './LandingPage';
import AuthPage from './AuthPage';
import { useAuth } from './contexts/useAuth';
import { MarketingProvider, useMarketing } from './contexts/MarketingContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { useSubscription } from './hooks/useSubscription';
import EnvTest from './EnvTest';

import { supabase } from './lib/supabase';
// Removed mock data imports - using real database data only
import { convertMarketingTasksToTasks, getActiveGoal } from './services/marketingService';

// Admin Access Modal Component
function AdminAccessModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1B1628] rounded-2xl border border-[#2A243E] p-8 max-w-md mx-4">
        <h3 className="text-xl font-bold text-white mb-4">🔐 Admin Access</h3>
        <p className="text-gray-300 mb-6">
          You've discovered the secret admin access! This is for development and content management only.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/app/admin/marketing-tracks')}
            className="flex-1 bg-gradient-to-r from-[#EF8E81] to-[#D4AF37] text-white font-semibold py-2 px-4 rounded-lg hover:from-[#EF8E81]/90 hover:to-[#D4AF37]/90 transition-colors"
          >
            Open Admin Panel
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-[#2A243E] hover:bg-[#3A344E] text-gray-300 hover:text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-4 text-center">
          Tip: You can also use Ctrl+Shift+A to access this
        </p>
      </div>
    </div>
  );
}
import CheckoutPage from './CheckoutPage';
import CheckoutSuccessPage from './CheckoutSuccessPage';
import SubscriptionPage from './SubscriptionPage';
import PricingPage from './PricingPage';
import TracksAdminPage from './TracksAdminPage';
import VisualTracksAdminPage from './VisualTracksAdminPage';
import FeedbackPage from './FeedbackPage';
import SocialMediaGeneratorPage from './SocialMediaGeneratorPage';
import SubscriptionGuard from './components/SubscriptionGuard';
import PersonalizedDashboard from './components/PersonalizedDashboard';
import OnboardingWizard from './components/OnboardingWizard';
import NotificationContainer from './components/NotificationContainer';
import NotificationBell from './components/NotificationBell';


// Component to handle task synchronization between marketing track and task tracker
function TaskSync({ tasks, setTasks }: { tasks: Task[], setTasks: (tasks: Task[]) => void }) {
  const { activeGoal, updateActiveGoal } = useMarketing();
  
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
  }, [activeGoal]);

  // Sync task tracker changes back to marketing track
  useEffect(() => {
    if (!activeGoal) return;

    // Find tasks that have marketing track links and check if their status changed
    const marketingTasks = tasks.filter(task => task.marketingTrack);
    
    if (marketingTasks.length === 0) return;

    // Check if any marketing tasks have status changes that need to be synced
    const tasksToSync = marketingTasks.filter(task => {
      if (!task.marketingTrack) return false;
      
      // Find the corresponding marketing task
      const module = activeGoal.modules.find(m => m.id === task.marketingTrack!.moduleId);
      if (!module) return false;
      
      const marketingTask = module.tasks.find(t => t.id === task.marketingTrack!.marketingTaskId);
      if (!marketingTask) return false;
      
      // Check if the status is different
      const expectedCompleted = task.status === 'completed';
      return marketingTask.isCompleted !== expectedCompleted;
    });

    if (tasksToSync.length > 0) {
      console.log('🔄 Syncing task tracker changes to marketing track:', tasksToSync.length, 'tasks');
      
      // Update the marketing goal with the new task statuses
      const updatedGoal = {
        ...activeGoal,
        modules: activeGoal.modules.map(module => ({
          ...module,
          tasks: module.tasks.map(marketingTask => {
            const correspondingTask = tasksToSync.find(task => 
              task.marketingTrack?.marketingTaskId === marketingTask.id
            );
            
            if (correspondingTask) {
              return {
                ...marketingTask,
                isCompleted: correspondingTask.status === 'completed'
              };
            }
            
            return marketingTask;
          })
        }))
      };

      // Recalculate progress
      const allTasks = updatedGoal.modules.flatMap(m => m.tasks);
      const completedTasks = allTasks.filter(t => t.isCompleted).length;
      const totalTasks = allTasks.length;
      const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      updatedGoal.progress = overallProgress;

      updateActiveGoal(updatedGoal);
      
      // Persist changes to the backend
      (async () => {
        try {
          for (const task of tasksToSync) {
            if (task.marketingTrack?.marketingTaskId) {
              await apiService.updateMarketingTaskCompletion(
                task.marketingTrack.marketingTaskId, 
                task.status === 'completed'
              );
            }
          }
          console.log('✅ Synced task tracker changes to marketing track and persisted to backend');
        } catch (error) {
          console.error('❌ Failed to persist marketing task changes:', error);
        }
      })();
    }
  }, [tasks, activeGoal, updateActiveGoal]);
  
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

function Header({ onLogoClick }: { onLogoClick?: () => void }) {
  const { user, signOut } = useAuth();
  const { subscription } = useSubscription();
  
  const getSubscriptionStatus = () => {
    if (!subscription) return null;
    
    if (subscription.subscription_status === 'trial') {
      return subscription.daysRemaining ? `${subscription.daysRemaining} days left` : 'Trial';
    } else if (subscription.subscription_status === 'active') {
      return 'Active';
    } else if (subscription.subscription_status === 'expired') {
      return 'Expired';
    }
    return null;
  };

  return (
    <header className="main-header">
      <div className="header-left">
        <img 
          src={OctopusLogo} 
          alt="MomentumDIY Logo" 
          className="header-logo" 
          onClick={onLogoClick}
          style={{ cursor: 'pointer' }}
        />
        <span className="header-app-name">MomentumDIY</span>
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        {subscription && (
          <div style={{ 
            background: subscription.hasAccess ? '#10b981' : '#ef4444', 
            color: '#FFF1E7', 
            padding: '0.5rem 1rem', 
            borderRadius: '999px', 
            fontSize: '0.9rem', 
            fontWeight: '600' 
          }}>
            {getSubscriptionStatus()}
          </div>
        )}
        <Link 
          to="/pricing"
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
            outline: 'none !important',
            textDecoration: 'none !important'
          }}
        >
          Upgrade
        </Link>
        {user ? (
          <button 
            className="upgrade-btn" 
            onClick={() => signOut()}
            style={{ 
              background: '#6b7280 !important', 
              color: '#FFF1E7 !important', 
              border: 'none !important', 
              borderRadius: '999px !important', 
              padding: '0.75rem 2rem !important', 
              fontSize: '1.1rem !important', 
              fontWeight: '700 !important', 
              boxShadow: '0 4px 16px 0 rgba(107, 114, 128, 0.25) !important', 
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
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ width: 24, height: 24 }}>
        {/* Cream color icon */}
        <defs>
          <style>
            {`.cream { stroke: #FFF1E7; fill: none; }
            .cream-fill { fill: #FFF1E7; stroke: none; }`}
          </style>
        </defs>
        {/* Outer rounded square */}
        <rect x="2.5" y="2.5" width="19" height="19" rx="4.5" className="cream" strokeWidth="2.5"/>
        {/* Vertical bar near the left */}
        <rect x="7" y="5" width="3" height="14" rx="1.5" className="cream-fill"/>
      </svg>
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
      <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3rem 1rem 1rem 1rem' }}>
        <Link to="/app/profile" style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}>
          {businessName}
        </Link>
        <NotificationBell />
      </div>
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
        <li>
          <Link 
            to="/app/social-generator" 
            className={isActive('/app/social-generator') ? 'active' : ''}
            onClick={() => handleLinkClick('/app/social-generator')}
          >
            Social Media Generator
          </Link>
        </li>
        {/* Non-core features are temporarily hidden
        - Marketing Calendar
        - Project Management  
        - Asset Library
        - Test Pages
        */}
      </ul>
      <div className="sidebar-footer">
        <Link 
          to="/app/manage-subscription" 
          className={isActive('/app/manage-subscription') ? 'active' : ''}
          onClick={() => handleLinkClick('/app/manage-subscription')}
        >
          Subscription Management
        </Link>
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
      ? tasks.filter(t => {
          // Regular tasks (not marketing track)
          if (!t.marketingTrack) {
            return activeProject && t.projectId === activeProject.id;
          }
          
          // Marketing track tasks - only show if module is unlocked
          if (t.marketingTrack.goalId === activeGoal.id) {
            const module = activeGoal.modules.find(m => m.id === t.marketingTrack!.moduleId);
            return module ? module.isUnlocked : false;
          }
          
          return false;
        })
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

      {/* Social Media Generator CTA */}
      <div className="bg-gradient-to-r from-[#EF8E81] to-[#65170C] rounded-2xl p-8 mb-8 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">🎨 AI-Powered Social Media Generator</h2>
            <p className="text-white/90 mb-4">
              Create stunning social media posts in seconds with Gemini 2.5 Flash AI. 
              Generate 2 unique variations for any platform with your brand colors and logo.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-white/20 rounded-full px-3 py-1 text-sm">⚡ Lightning Fast</span>
              <span className="bg-white/20 rounded-full px-3 py-1 text-sm">🎯 Brand Aware</span>
              <span className="bg-white/20 rounded-full px-3 py-1 text-sm">📱 All Platforms</span>
              <span className="bg-white/20 rounded-full px-3 py-1 text-sm">💰 Cost Optimized</span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Link 
              to="/app/social-generator" 
              className="bg-white text-[#EF8E81] font-bold px-8 py-3 rounded-full hover:bg-white/90 transition-colors inline-block"
            >
              Try Social Generator
            </Link>
          </div>
        </div>
      </div>

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

function ProtectedApp({ onLogoClick }: { onLogoClick?: () => void }) {
  console.log('App component rendering...');
  
  const location = useLocation();
  const { isFocused } = useWindowFocus();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [marketingGoals, setMarketingGoals] = useState<MarketingGoal[]>([]);
  

  // Debug: Track if component is mounting vs re-rendering
  const mountTimeRef = useRef(Date.now());
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;
  
  console.log(`🔄 App render #${renderCountRef.current} - Mounted ${Math.round((Date.now() - mountTimeRef.current) / 1000)}s ago`);

  // Debug window focus changes
  useEffect(() => {
    console.log('🪟 Window focus changed:', isFocused ? 'FOCUSED' : 'UNFOCUSED');
  }, [isFocused]);
  const [sidebarHidden, setSidebarHidden] = useState<boolean>(() => {
    // Check localStorage for sidebar state
    const saved = localStorage.getItem('sidebarHidden');
    return saved ? JSON.parse(saved) : false;
  });

  // Function to toggle sidebar and persist state
  const toggleSidebar = useCallback(() => {
    setSidebarHidden(prev => {
      const newState = !prev;
      localStorage.setItem('sidebarHidden', JSON.stringify(newState));
      return newState;
    });
  }, []);

  // Comment out non-core state for now
  // const [assets, setAssets] = useState<Asset[]>([]);
  // const [brandingKits, setBrandingKits] = useState<BrandingKit[]>([]);
  // const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  // const [customEvents, setCustomEvents] = useState<CalendarEvent[]>([]);
  // const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

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

        // Load tasks from marketing goals (empty initially)
        setTasks([]);
        console.log('✅ Initialized empty tasks array');

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
            // No active goal - user needs to select a track
            console.log('ℹ️ No active marketing goal - user should select a track');
            setMarketingGoals([]);
          }
        } catch (error) {
          console.warn('⚠️ Marketing service error:', error);
          setMarketingGoals([]);
        }

        // Skip calendar events (deactivated)
        console.log('🚫 Skipping calendar API call - feature deactivated');

        console.log('🎉 All data loaded successfully!');

        // Check if user needs onboarding
        try {
          const profileResponse = await apiService.getProfile();
          const hasCompletedOnboarding = profileResponse.success && 
            (profileResponse.data as any)?.onboarding_completed === true;
          
          if (!hasCompletedOnboarding) {
            console.log('🎯 Onboarding not completed, showing onboarding wizard');
            setShowOnboarding(true);
          } else {
            console.log('✅ Onboarding already completed, skipping wizard');
            setShowOnboarding(false);
          }
        } catch (error) {
          console.log('🎯 Error checking onboarding status, showing onboarding as fallback');
          setShowOnboarding(true);
        }

      } catch (error) {
        console.error('❌ Unexpected error loading data:', error);
        // Set empty data on error
        setTasks([]);
        setMarketingGoals([]);
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
      
      // Handle updated tasks (skip marketing track tasks as they're handled separately)
      const existingTasks = updatedTasks.filter(t => !newTasks.find(nt => nt.id === t.id) && !t.marketingTrack);
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

  const handleOnboardingComplete = useCallback(async (onboardingData: any) => {
    console.log('🎉 Onboarding completed:', onboardingData);
    console.log('🔧 About to close onboarding wizard...');

    try {
      // Create the marketing goal based on selected track
      const trackTitle = onboardingData.selectedTrack === 'local-foot-traffic'
        ? 'Increase Local Foot Traffic'
        : 'Improve Social Media Strategy & Engagement';

      // Create the goal in the backend first
      const goalResponse = await apiService.createMarketingGoal({
        title: trackTitle,
        description: `12-week ${trackTitle} program`,
        industry: onboardingData.industry || 'General',
        duration: 12,
        isActive: true
      });

      if (goalResponse.success && goalResponse.data) {
        // Add the new goal to the list
        const updatedGoals = [...marketingGoals, goalResponse.data];
        await handleMarketingGoalsChange(updatedGoals);
      } else {
        console.error('Failed to create marketing goal:', goalResponse.error);
      }

      // Create a project for the marketing track
      const newProject: Project = {
        id: `project-${Date.now()}`,
        name: trackTitle,
        description: `Marketing track project for ${onboardingData.businessName}`,
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
        tasks: [],
        progress: 0,
        status: 'active',
        timeline: []
      };

      await handleProjectsChange([...projects, newProject]);

      console.log('✅ Onboarding setup complete - marketing goal and project created');

      // Send onboarding complete notification
      try {
        const notificationResponse = await apiService.sendNotification({
          type: 'onboarding_complete',
          data: onboardingData
        });
        if (notificationResponse.success) {
          console.log('📧 Onboarding complete notification sent');
        }
      } catch (error) {
        console.error('❌ Error sending onboarding notification:', error);
      }

      // Close the onboarding modal
      console.log('🔧 Setting showOnboarding to false...');
      setShowOnboarding(false);
      console.log('✅ Onboarding wizard should now be closed');

    } catch (error) {
      console.error('❌ Error setting up onboarding:', error);
    }
  }, [marketingGoals, projects, handleMarketingGoalsChange, handleProjectsChange]);

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
        <Header onLogoClick={onLogoClick} />
        <div className={`app-shell${sidebarHidden ? ' collapsed' : ''}`} style={{ position: 'relative' }}>
          <Sidebar hidden={sidebarHidden} onToggle={toggleSidebar} />
          <div style={{ position: 'fixed', top: 80, left: 12, zIndex: 110 }}>
            <SidebarToggle onClick={toggleSidebar} />
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
      <Header onLogoClick={onLogoClick} />
      <NotificationContainer />
      <div className={`app-shell${sidebarHidden ? ' collapsed' : ''}`} style={{ position: 'relative' }}>
        <Sidebar
          hidden={sidebarHidden}
          onToggle={toggleSidebar}
          showProfileManager={Boolean(marketingGoals.find(g => g.title === 'Improve Social Media Strategy & Engagement' && g.currentWeek >= g.duration))}
        />
        {/* Attach opener only when collapsed */}
        {sidebarHidden && (
          <SidebarToggle className="sidebar-opener" onClick={toggleSidebar} />
        )}
        <main className="main-content">
          <MarketingProvider onTaskStatusChange={handleMarketingTaskStatusChange}>
            <TaskSync tasks={tasks} setTasks={setTasks} />
            <OnboardingWizard
              isOpen={showOnboarding}
              onSkip={() => setShowOnboarding(false)}
              onComplete={handleOnboardingComplete}
            />
            <PersonalizedDashboard>
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
            <Route path="marketing-track" element={<MarketingTrackPage tasks={tasks} onTasksChange={handleTasksChange} />} />
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
                tasks={tasks}
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
            <Route path="social-generator" element={<SocialMediaGeneratorPage />} />
            <Route path="manage-subscription" element={<SubscriptionPage />} />
            <Route path="feedback" element={<Placeholder title="Feedback" />} />
            <Route path="admin/marketing-tracks" element={
              <AdminGuard>
                <VisualTracksAdminPage />
              </AdminGuard>
            } />
            <Route path="admin/marketing-tracks-old" element={
              <AdminGuard>
                <TracksAdminPage />
              </AdminGuard>
            } />
              </Routes>
              <FloatingAssistant />
            </PersonalizedDashboard>
          </MarketingProvider>
        </main>
      </div>
    </>
  );
}

function App() {
  // Debug environment variables
  console.log('🔍 App.tsx - Environment variables:');
  console.log('VITE_DISABLE_AUTH:', import.meta.env.VITE_DISABLE_AUTH);
  console.log('VITE_DISABLE_AUTH type:', typeof import.meta.env.VITE_DISABLE_AUTH);
  console.log('VITE_DISABLE_AUTH === "true":', import.meta.env.VITE_DISABLE_AUTH === 'true');
  console.log('VITE_DISABLE_AUTH === "TRUE":', import.meta.env.VITE_DISABLE_AUTH === 'TRUE');
  console.log('Auth bypass should work:', import.meta.env.VITE_DISABLE_AUTH === 'true' || import.meta.env.VITE_DISABLE_AUTH === 'TRUE');
  console.log('All env vars:', import.meta.env);
  
  // Basic React debugging
  console.log('🚀 App component is rendering!');
  console.log('🔍 Current URL:', window.location.href);
  console.log('🔍 Current pathname:', window.location.pathname);
  
  // Production debugging
  if (window.location.hostname !== 'localhost') {
    console.log('🌐 Production environment detected');
    console.log('🔍 Auth disabled:', import.meta.env.VITE_DISABLE_AUTH === 'true');
    console.log('🚀 Force deployment - Auth bypass should be working now!');
  }
  
  // Secret admin access state
  const [adminClickCount, setAdminClickCount] = useState(0);
  const [showAdminAccess, setShowAdminAccess] = useState(false);
  
  // Handle secret admin access
  const handleLogoClick = () => {
    setAdminClickCount(prev => prev + 1);
    if (adminClickCount >= 4) { // 5 clicks total
      setShowAdminAccess(true);
      setAdminClickCount(0);
    }
  };
  
  // Keyboard shortcut for admin access (Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowAdminAccess(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return (
    <Router>
      <OnboardingProvider>
        <Routes>
        {/* Public */}
        <Route path="/" element={<><LandingPage /><EnvTest /></>} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/terms" element={<Placeholder title="Terms & Conditions" />} />

        {/* Pricing */}
        <Route path="/pricing" element={<PricingPage />} />

        {/* Checkout - Public */}
        <Route path="/checkout/:plan/:interval" element={<CheckoutPage />} />
        <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />

        {/* App - Protected with subscription guard */}
        <Route path="/app/*" element={
          <SubscriptionGuard>
            <ProtectedApp onLogoClick={handleLogoClick} />
          </SubscriptionGuard>
               } />
                 </Routes>
             </OnboardingProvider>
             
             {/* Secret Admin Access Modal */}
             <AdminAccessModal 
               isOpen={showAdminAccess} 
               onClose={() => setShowAdminAccess(false)} 
             />
           </Router>
         );
       }

export default App;
