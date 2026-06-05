import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import './App.css';
// Core components (always loaded)
import TaskTrackerWidget from './TaskTrackerWidget';
import TaskTrackerPage from './TaskTrackerPage';
import MarketingTrackWidget from './MarketingTrackWidget';
import MarketingTrackPage from './MarketingTrackPage';
import ProfilePage from './ProfilePage';
import AffiliateHowItWorksModal from './components/AffiliateHowItWorksModal';
import HelpIcon from './components/HelpIcon';
import Breadcrumbs from './components/Breadcrumbs';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import QuickSearch from './components/QuickSearch';
import OfflineBanner from './components/OfflineBanner';
import TrialCountdownBanner from './components/TrialCountdownBanner';
import MobileBottomNav from './components/MobileBottomNav';
import { useAffiliateStatus } from './hooks/useAffiliateStatus';

import { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';

// Lazy-loaded components for code splitting
const SocialProfileManager = lazy(() => import('./SocialProfileManager'));
const SocialStrategyHub = lazy(() => import('./pages/SocialStrategyHub'));
const SharedStrategyView = lazy(() => import('./pages/SharedStrategyView'));
const AssetLibrary = lazy(() => import('./pages/AssetLibrary'));
const SharedAssets = lazy(() => import('./pages/SharedAssets'));
import { useIsMobile } from './hooks/useMediaQuery';
import type { Project, Task, MarketingGoal } from './types';
import OctopusLogo from './assets/octopus_icon.png';
import { logger } from './utils/logger';
// import SidebarToggleIcon from './assets/sidebar_toggle.svg';
import { apiService } from './services/api';
// Lazy-loaded heavy components for code splitting
const AIMarketingAssistant = lazy(() => import('./AIMarketingAssistant'));
const FloatingAssistant = lazy(() => import('./FloatingAssistant'));
const SocialMediaGeneratorPage = lazy(() => import('./SocialMediaGeneratorPage'));
const AffiliateProgramPage = lazy(() => import('./AffiliateProgramPage'));
const AffiliateDashboardPage = lazy(() => import('./AffiliateDashboardPage'));
const AdminAffiliatePage = lazy(() => import('./AdminAffiliatePage'));
const AffiliatePartnerApplicationPage = lazy(() => import('./AffiliatePartnerApplicationPage'));
import AdminGuard from './components/AdminGuard';
const VisualTracksAdminPage = lazy(() => import('./VisualTracksAdminPage'));
const TracksAdminPage = lazy(() => import('./TracksAdminPage'));

// Core pages (always loaded)
// LandingPage is served as static index.html, not a React component
import AuthPage from './AuthPage';
import SubscriptionPage from './SubscriptionPage';
import PricingPage from './PricingPage';
import FeedbackPage from './FeedbackPage';
import TermsPage from './TermsPage';
import PrivacyPolicyPage from './PrivacyPolicyPage';
import AffiliateProgramTermsPage from './AffiliateProgramTermsPage';
import MarketingTracksPage from './MarketingTracksPage';
import FeaturesPage from './FeaturesPage';
import SubscriptionGuard from './components/SubscriptionGuard';
import PersonalizedDashboard from './components/PersonalizedDashboard';
import NotificationContainer from './components/NotificationContainer';
import NotificationBell from './components/NotificationBell';
import LoadingSpinner from './components/LoadingSpinner';
import OnboardingWizard, { type OnboardingData } from './components/OnboardingWizard';
import { useAuth } from './contexts/useAuth';
import { MarketingProvider, useMarketing } from './contexts/MarketingContext';
import { OnboardingProvider, useOnboarding } from './contexts/OnboardingContext';
import { useSubscription } from './hooks/useSubscription';
import { useActivityReminders } from './hooks/useActivityReminders';
import { useNotificationHelpers } from './hooks/useNotificationHelpers';

import { supabase } from './lib/supabase';
// Removed mock data imports - using real database data only
import { convertMarketingTasksToTasks, getActiveGoal } from './services/marketingService';

// Admin Access Modal Component
function AdminAccessModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  if (!isOpen) return null;

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus the modal after a short delay to ensure it's rendered
      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.focus();
        }
      }, 100);
    } else {
      // Return focus to the previously focused element when modal closes
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    }

    return () => {
      // Cleanup focus when component unmounts
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen]);

  // Keyboard event handling for accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-access-modal-title"
      aria-describedby="admin-access-modal-description"
    >
      <div
        ref={modalRef}
        className="bg-[#1B1628] rounded-2xl border border-[#2A243E] p-8 max-w-md mx-4"
        role="document"
        tabIndex={-1}
      >
        <h3 id="admin-access-modal-title" className="text-xl font-bold text-white mb-4">🔐 Admin Access</h3>
        <p id="admin-access-modal-description" className="text-gray-300 mb-6">
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
// Lazy-loaded components already defined above


// Component to handle activity reminders inside MarketingProvider
function ActivityReminders() {
  useActivityReminders();
  return null;
}

// Component to handle task synchronization between marketing track and task tracker

function TaskSync({
  tasks, 
  setTasks, 
  setMarketingGoals 
}: { 
  tasks: Task[], 
  setTasks: (tasks: Task[]) => void,
  setMarketingGoals?: (goals: MarketingGoal[]) => void
}) {
  const { activeGoal, updateActiveGoal } = useMarketing();
  
  // Sync activeGoal from MarketingProvider to parent marketingGoals state
  useEffect(() => {
    if (setMarketingGoals) {
      setMarketingGoals(activeGoal ? [activeGoal] : []);
    }
  }, [activeGoal, setMarketingGoals]);
  
  // Sync marketing tasks to task tracker
  useEffect(() => {
    if (!activeGoal) {
      return;
    }
    
    // Convert marketing tasks to regular tasks (only from unlocked modules)
    const marketingTasks = convertMarketingTasksToTasks(activeGoal);
    
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
      setTasks(updatedTasks);
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
        } catch (error) {
          logger.error('Failed to persist marketing task changes', error);
        }
      })();
    }
  }, [tasks, activeGoal, updateActiveGoal]);
  
  return null; // This component doesn't render anything
}


function Header({ onLogoClick, onSearchClick }: { onLogoClick?: () => void; onSearchClick?: () => void }) {
  const { user, signOut } = useAuth();
  const { subscription } = useSubscription();
  const isMobile = useIsMobile();
  
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
      {/* Hide buttons on mobile - they'll be in the sidebar */}
      {!isMobile && (
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        {onSearchClick && (
          <button
            onClick={onSearchClick}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = '#FFF1E7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
            }}
            title="Search (Press / or ⌘K)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <span>Search</span>
            <kbd style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              padding: '0.125rem 0.375rem',
              fontSize: '0.7rem',
              fontFamily: 'monospace',
              color: 'rgba(255, 255, 255, 0.5)',
            }}>/</kbd>
          </button>
        )}
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
      )}
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

function Sidebar({ hidden, onToggle, showProfileManager, showSocialStrategy, mobileOpen }: { hidden: boolean; onToggle: () => void; showProfileManager?: boolean; showSocialStrategy?: boolean; mobileOpen?: boolean }) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { subscription } = useSubscription();
  const isMobile = useIsMobile();
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

  const handleLinkClick = (_path: string) => {
    // Debug logging removed for production
  };

  // Check if user is admin
  const ADMIN_EMAILS = ['info@hillaryedenmcmullen.com'];
  const isAdmin = user && user.email && ADMIN_EMAILS.includes(user.email.toLowerCase());

  return (
    <nav className={`sidebar${hidden ? ' hidden' : ''}${mobileOpen ? ' mobile-open' : ''}`}>
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
        {/* Core Section */}
        <li style={{ marginTop: '0.5rem', paddingTop: '0.5rem' }}>
          <div style={{ padding: '0.5rem 1.5rem', fontSize: '0.7rem', fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Core
          </div>
        </li>
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

        {/* Tools Section */}
        <li style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ padding: '0.5rem 1.5rem', fontSize: '0.7rem', fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Tools
          </div>
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
        {showProfileManager && (
          <li>
            <Link 
              to="/app/profile-manager" 
              className={isActive('/app/profile-manager') ? 'active' : ''}
              onClick={() => handleLinkClick('/app/profile-manager')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span>Social Profile Manager</span>
              <HelpIcon 
                content="Available after completing the 'Improve Social Media Strategy' track. Manage your social media profiles in one place." 
                position="right"
                className="w-3 h-3"
              />
            </Link>
          </li>
        )}
        {showSocialStrategy && (
          <li>
            <Link 
              to="/app/social-strategy" 
              className={isActive('/app/social-strategy') ? 'active' : ''}
              onClick={() => handleLinkClick('/app/social-strategy')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span>Social Strategy Hub</span>
              <HelpIcon 
                content="Available when you have a social media marketing track active. Create and manage your social media content strategy." 
                position="right"
                className="w-3 h-3"
              />
            </Link>
          </li>
        )}
        <li>
          <Link 
            to="/app/assets" 
            className={isActive('/app/assets') ? 'active' : ''}
            onClick={() => handleLinkClick('/app/assets')}
          >
            Asset Library
          </Link>
        </li>
        <li>
          <Link
            to="/app/affiliate/program" 
            className={isActive('/app/affiliate/program') ? 'active' : ''}
            onClick={() => handleLinkClick('/app/affiliate/program')}
          >
            💰 Affiliate Program
          </Link>
        </li>
      </ul>
      
      {/* Mobile Quick Actions */}
      {isMobile && (
        <div style={{ 
          padding: '1rem', 
          borderTop: '1px solid rgba(255,255,255,0.1)', 
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          marginTop: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{ 
            fontSize: '0.7rem', 
            fontWeight: '700', 
            color: 'rgba(255,255,255,0.4)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.1em',
            marginBottom: '0.75rem',
            paddingLeft: '0.5rem'
          }}>
            Quick Actions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link
              to="/app/task-tracker"
              onClick={() => handleLinkClick('/app/task-tracker')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                background: 'rgba(239, 142, 129, 0.15)',
                border: '1px solid rgba(239, 142, 129, 0.3)',
                borderRadius: '8px',
                color: '#FFF1E7',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: '500',
                minHeight: '44px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 142, 129, 0.25)';
                e.currentTarget.style.borderColor = 'rgba(239, 142, 129, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 142, 129, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(239, 142, 129, 0.3)';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
              </svg>
              <span>Add Task</span>
            </Link>
            <Link
              to="/app/ai-marketing-assistant"
              onClick={() => handleLinkClick('/app/ai-marketing-assistant')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#FFF1E7',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: '500',
                minHeight: '44px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path>
              </svg>
              <span>Ask AI</span>
            </Link>
          </div>
        </div>
      )}
      
      <div className="sidebar-footer">
        {/* Mobile-only: Subscription status, Upgrade, and Sign Out */}
        {isMobile && (
          <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', marginBottom: '0.5rem' }}>
            {subscription && (
              <div style={{ 
                background: subscription.hasAccess ? '#10b981' : '#ef4444', 
                color: '#FFF', 
                padding: '0.5rem 1rem', 
                borderRadius: '8px', 
                fontSize: '0.85rem', 
                fontWeight: '600',
                textAlign: 'center',
                marginBottom: '0.75rem'
              }}>
                {subscription.subscription_status === 'trial' 
                  ? subscription.daysRemaining ? `${subscription.daysRemaining} days left` : 'Trial'
                  : subscription.subscription_status === 'active' ? 'Active' 
                  : 'Expired'
                }
              </div>
            )}
            <Link 
              to="/pricing"
              style={{ 
                display: 'block',
                background: '#EF8E81', 
                color: '#FFF', 
                border: 'none', 
                borderRadius: '8px', 
                padding: '0.75rem 1rem', 
                fontSize: '0.95rem', 
                fontWeight: '600', 
                textAlign: 'center',
                marginBottom: '0.5rem',
                textDecoration: 'none',
                minHeight: '44px'
              }}
            >
              ⭐ Upgrade
            </Link>
            {user && (
              <button 
                onClick={() => signOut()}
                style={{ 
                  width: '100%',
                  background: '#6b7280', 
                  color: '#FFF', 
                  border: 'none', 
                  borderRadius: '8px', 
                  padding: '0.75rem 1rem', 
                  fontSize: '0.95rem', 
                  fontWeight: '600', 
                  cursor: 'pointer',
                  minHeight: '44px'
                }}
              >
                🚪 Sign Out
              </button>
            )}
          </div>
        )}
        
        {isAdmin && (
          <>
            <li style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: '600', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Admin
              </div>
            </li>
            <li>
              <Link 
                to="/app/admin/affiliate" 
                className={isActive('/app/admin/affiliate') ? 'active' : ''}
                onClick={() => handleLinkClick('/app/admin/affiliate')}
              >
                🔧 Affiliate Admin
              </Link>
            </li>
            <li>
              <Link 
                to="/app/admin/marketing-tracks" 
                className={isActive('/app/admin/marketing-tracks') ? 'active' : ''}
                onClick={() => handleLinkClick('/app/admin/marketing-tracks')}
              >
                🔧 Marketing Tracks
              </Link>
            </li>
          </>
        )}
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

// Removed unused Placeholder component

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
  const [showAffiliateModal, setShowAffiliateModal] = useState(false);
  const { isAffiliate, loading: affiliateLoading } = useAffiliateStatus();
  const activeGoal = marketingGoals.find(g => g.isActive);
  const { onboardingData } = useOnboarding();
  
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
    
    // Track if we should show empty state (no fallback to all tasks)
    const hasVisibleTasks = visibleTasks.length > 0;

  const handleSubsetTasksChange = (updatedVisible: Task[]) => {
    if (!activeGoal) {
      onTasksChange(updatedVisible);
      return;
    }
    const others = tasks.filter(t => !(t.marketingTrack && t.marketingTrack.goalId === activeGoal.id));
    onTasksChange([...others, ...updatedVisible]);
  };

  // Determine if we should show get started guide
  const [showGetStartedGuide, setShowGetStartedGuide] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('getStartedGuideDismissed') !== 'true';
    }
    return true;
  });
  
  const isNewUser = !onboardingData && !activeGoal && showGetStartedGuide;
  const hasNoTasks = !hasVisibleTasks && tasks.length === 0;

  return (
    <div>
      {/* Get Started Guide for New Users */}
      {isNewUser && (
        <div className="mb-6 p-6 bg-gradient-to-r from-[#EF8E81]/15 to-[#D4AF37]/15 rounded-2xl border border-[#EF8E81]/30">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#EF8E81] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🚀</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-[#FFF1E7] mb-2">Get Started with MomentumDIY</h3>
              <p className="text-[#FFF1E7]/80 mb-4">
                Welcome! To get the most out of MomentumDIY, we recommend completing your profile setup and choosing a marketing track.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/app/profile"
                  className="px-4 py-2 bg-[#EF8E81] text-white font-semibold rounded-lg hover:bg-[#E67A6E] transition-colors text-sm"
                >
                  Complete Your Profile
                </Link>
                <Link
                  to="/app/marketing-track"
                  className="px-4 py-2 bg-transparent border border-[#EF8E81]/50 text-[#EF8E81] font-semibold rounded-lg hover:bg-[#EF8E81]/10 transition-colors text-sm"
                >
                  Choose a Marketing Track
                </Link>
              </div>
            </div>
            <button
              onClick={() => {
                // Hide guide (store in localStorage)
                localStorage.setItem('getStartedGuideDismissed', 'true');
                setShowGetStartedGuide(false);
              }}
              className="text-[#FFF1E7]/50 hover:text-[#FFF1E7] transition-colors"
              aria-label="Dismiss guide"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="relative">
        <MarketingTrackWidget />
        {activeGoal && (
          <div className="absolute top-2 right-2">
            <HelpIcon 
              content="Your marketing track shows your weekly progress. Click to view this week's lessons and tasks." 
              position="left"
            />
          </div>
        )}
      </div>

      {/* Social Media Generator CTA */}
      <div className="bg-gradient-to-r from-[#EF8E81] to-[#65170C] rounded-2xl p-8 mb-8 text-white relative">
        <div className="absolute top-4 right-4">
          <HelpIcon 
            content="Generate ready-to-post social media content with AI. Creates 2 variations customized to your brand colors and logo for any platform." 
            position="left"
            className="bg-white/10 hover:bg-white/20"
          />
        </div>
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
        tasks={hasVisibleTasks ? visibleTasks : []}
        onTasksChange={handleSubsetTasksChange}
        onProjectsChange={onProjectsChange}
        showEmptyState={!hasVisibleTasks}
        activeGoal={activeGoal}
      />

      {/* Affiliate How It Works Link - Footer */}
      {!affiliateLoading && isAffiliate && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginTop: '2rem',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <button
            onClick={() => setShowAffiliateModal(true)}
            style={{
              background: 'transparent',
              border: '1px solid rgba(239, 142, 129, 0.3)',
              color: '#EF8E81',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 142, 129, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(239, 142, 129, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(239, 142, 129, 0.3)';
            }}
          >
            💰 Affiliate Program: How It Works
          </button>
        </div>
      )}

      {/* Affiliate How It Works Modal */}
      <AffiliateHowItWorksModal 
        isOpen={showAffiliateModal}
        onClose={() => setShowAffiliateModal(false)}
      />

    </div>
  );
}

function ProtectedApp({ onLogoClick }: { onLogoClick?: () => void }) {
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { showSuccess } = useNotificationHelpers();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [marketingGoals, setMarketingGoals] = useState<MarketingGoal[]>([]);
  const [hasSocialStrategyAccess, setHasSocialStrategyAccess] = useState(false);
  
  // Check if user has ever activated a social media track (for persistent hub access)
  useEffect(() => {
    const checkSocialAccess = async () => {
      try {
        const result = await apiService.hasSocialStrategyAccess();
        if (result.success && result.data) {
          setHasSocialStrategyAccess(true);
        }
      } catch (error) {
        logger.error('Error checking social strategy access', error);
      }
    };
    
    if (user) {
      checkSocialAccess();
    }
  }, [user]);
  
  const [sidebarHidden, setSidebarHidden] = useState<boolean>(() => {
    // Check localStorage for sidebar state
    const saved = localStorage.getItem('sidebarHidden');
    return saved ? JSON.parse(saved) : false;
  });

  // Mobile sidebar state (separate from desktop toggle)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Keyboard shortcuts and quick search state
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showQuickSearch, setShowQuickSearch] = useState(false);

  // Function to toggle sidebar and persist state
  const toggleSidebar = useCallback(() => {
    setSidebarHidden(prev => {
      const newState = !prev;
      localStorage.setItem('sidebarHidden', JSON.stringify(newState));
      return newState;
    });
  }, []);

  // Mobile sidebar toggle
  const toggleMobileSidebar = useCallback(() => {
    setMobileSidebarOpen(prev => !prev);
  }, []);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Quick search: Cmd/Ctrl + K or /
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowQuickSearch(true);
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setShowQuickSearch(true);
      } else if (e.key === '?' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      } else if (e.key === 'Escape') {
        setShowQuickSearch(false);
        setShowKeyboardShortcuts(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

  // Load data from API on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Load tasks from marketing goals (empty initially)
        setTasks([]);

        // Load projects (empty in development)
        setProjects([]);

        // Note: Marketing goals are now loaded by MarketingProvider to avoid duplicate API calls
        // The activeGoal from MarketingProvider will be synced to marketingGoals state below
        setMarketingGoals([]);

      } catch (error) {
        logger.error('Unexpected error loading data', error);
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

  // Separate effect for onboarding check - only run when component is fully loaded
  useEffect(() => {
    if (isLoading || !user) return;

    // Wait for a short delay to ensure auth is fully complete
    const checkOnboarding = async () => {
      // Check if user needs onboarding - only on app pages after auth completion
      const isOnAppPages = location.pathname.startsWith('/app');
      const isOnAuthPage = location.pathname.startsWith('/auth');

      if (isOnAppPages && !isOnAuthPage) {
        try {
          const profileResponse = await apiService.getProfile();
          const hasCompletedOnboarding = profileResponse.success && 
            (profileResponse.data as any)?.onboarding_completed === true;
          
          setShowOnboarding(!hasCompletedOnboarding);
        } catch (error) {
          logger.error('Error checking onboarding status', error);
          setShowOnboarding(false);
        }
      } else {
        setShowOnboarding(false);
      }
    };

    // Add a small delay to ensure auth flow is complete
    const timeoutId = setTimeout(checkOnboarding, 1000);
    return () => clearTimeout(timeoutId);
  }, [isLoading, user, location.pathname]);

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
  
  const debouncedCreateTask = useCallback(async (taskData: { title: string; description: string; responsible: string; status: 'todo' | 'in-progress' | 'completed'; deadline?: string | null; project?: string; projectId?: string; priority?: string; parentTaskId?: string; dependsOn?: string[] }) => {
    const taskKey = `${taskData.title}:${taskData.project || taskData.projectId}`;
    
    // Clear existing timeout for this task
    if (taskCreationQueue.current.has(taskKey)) {
      clearTimeout(taskCreationQueue.current.get(taskKey)!);
    }
    
    // Reduced debounce from 500ms to 200ms for better responsiveness
    // Still debounced to prevent API spam but feels more instant
    const timeoutId = setTimeout(async () => {
      try {
        const response = await apiService.createTask(taskData);
        if (response.success && response.data) {
          // Update the task with the real ID from the server
          setTasks(prevTasks => {
            const placeholderTask = prevTasks.find(t => t.id === taskKey || (t.id.startsWith('tmp:') && t.title === taskData.title));
            if (placeholderTask) {
              return prevTasks.map(t => t.id === placeholderTask.id ? response.data : t);
            }
            return prevTasks;
          });
          // Don't show success notification for every task to avoid spam
        } else {
          logger.error('Failed to create task', new Error(response.error), { title: taskData.title });
        }
      } catch (error) {
        logger.error('Error creating task', error, { title: taskData.title });
      } finally {
        // Remove from queue
        taskCreationQueue.current.delete(taskKey);
      }
    }, 200); // Reduced from 500ms to 200ms for better responsiveness
    
    taskCreationQueue.current.set(taskKey, timeoutId);
  }, []);

  const handleTasksChange = useCallback(async (updatedTasks: Task[]) => {
    // Treat ids that contain "-w" as placeholders that must be created first
    const isPlaceholderId = (id: string) => id.includes('-w');
    const newTasks = updatedTasks.filter(t => !tasks.find(existing => existing.id === t.id) || isPlaceholderId(t.id));
    
    // Update local state immediately for UI responsiveness
    setTasks(dedupeTasks(updatedTasks));
    
    // Persist changes to database using debounced creation
    try {
      // Handle new tasks with debouncing
      for (const newTask of newTasks) {
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
          
          if (response.success) {
            // Success feedback is handled by optimistic updates and notifications
          } else {
            logger.error('Failed to update task', new Error(response.error), { title: updatedTask.title });
          }
        }
      }
    } catch (error) {
      logger.error('Error persisting task changes', error);
    }
    
    // Check if we're adding new marketing track tasks (which means we're setting up a track)
    const hasNewMarketingTasks = newTasks.some(task => task.marketingTrack);
    if (hasNewMarketingTasks) {
      return;
    }

    // Sync marketing track tasks but preserve active goal states
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
    // Update local state immediately for UI responsiveness
    setProjects(updatedProjects);
    
    // Persist changes to database
    try {
      const newProjects = updatedProjects.filter(p => !projects.find(existing => existing.id === p.id));
      const deletedProjects = projects.filter(p => !updatedProjects.find(up => up.id === p.id));
      
      // Handle new projects
      for (const newProject of newProjects) {
        // Create in database
        try {
          const response = await apiService.createProject({
            name: newProject.name,
            description: newProject.description || '',
            deadline: newProject.deadline,
            status: newProject.status
          });
          
          if (response.success && response.data) {
            logger.info('Project created successfully', { projectId: response.data?.id });
            showSuccess('Project Created', `"${newProject.name}" has been created successfully.`);
          } else {
            logger.error('Failed to create project', new Error(response.error), { name: newProject.name });
          }
        } catch (error) {
          logger.error('Error creating project', error, { name: newProject.name });
        }
      }
      
      // Handle updated projects
      const existingProjects = updatedProjects.filter(p => !newProjects.find(np => np.id === p.id));
      for (const updatedProject of existingProjects) {
        const originalProject = projects.find(p => p.id === updatedProject.id);
        if (originalProject && JSON.stringify(originalProject) !== JSON.stringify(updatedProject)) {
          const response = await apiService.updateProject(updatedProject.id, {
            name: updatedProject.name,
            description: updatedProject.description || '',
            deadline: updatedProject.deadline,
            status: updatedProject.status
          });
          
          if (response.success) {
            showSuccess('Project Updated', `"${updatedProject.name}" has been updated successfully.`);
          } else {
            logger.error('Failed to update project', new Error(response.error), { id: updatedProject.id });
          }
        }
      }
      
      // Handle deleted projects
      for (const deletedProject of deletedProjects) {
        const response = await apiService.deleteProject(deletedProject.id);
        
        if (response.success) {
          showSuccess('Project Deleted', `"${deletedProject.name}" has been deleted successfully.`);
        } else {
          logger.error('Failed to delete project', new Error(response.error), { id: deletedProject.id });
        }
      }
    } catch (error) {
      logger.error('Error persisting project changes', error);
    }
  }, [projects, setProjects]);

  const handleMarketingGoalsChange = useCallback(async (updatedGoals: MarketingGoal[]) => {
    // Update local state immediately for UI responsiveness
    setMarketingGoals(updatedGoals);
    
    // Persist changes to database, but never downgrade currentWeek
    try {
      const newGoals = updatedGoals.filter(g => !marketingGoals.find(existing => existing.id === g.id));
      
      // Handle new goals
      for (const newGoal of newGoals) {
        const response = await apiService.createMarketingGoal({
          title: newGoal.title,
          description: newGoal.description || '',
          industry: newGoal.industry || 'General',
          duration: newGoal.duration || 12
        });
        
        if (!response.success) {
          logger.error('Failed to create marketing goal', new Error(response.error), { title: newGoal.title });
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
          const nextWeek = Math.max(existingGoal.currentWeek, originalGoal.currentWeek);
          const response = await apiService.updateMarketingGoal(existingGoal.id, {
            isActive: existingGoal.isActive,
            currentWeek: nextWeek,
            progress: existingGoal.progress
          });
          
          if (!response.success) {
            logger.error('Failed to update marketing goal', new Error(response.error), { id: existingGoal.id });
          }
        }
      }
    } catch (error) {
      logger.error('Error persisting marketing goals', error);
    }
  }, [marketingGoals, setMarketingGoals]);

  const handleOnboardingComplete = useCallback(async (onboardingData: OnboardingData) => {
    logger.info('Onboarding completed', { onboardingData });
    logger.debug('About to close onboarding wizard');

    try {
      // The OnboardingWizard component already handles track activation
      // We just need to refresh the marketing data to show the activated track
      logger.debug('Refreshing marketing data after onboarding');
      
      // Skip refreshing marketing goals here - the track activation already handles this
      logger.debug('Skipping marketing goals refresh - track activation already handled');

      // Force reload marketing data after onboarding to show the activated track
      try {
        logger.debug('Force refreshing marketing data after onboarding');
        const activeGoalResponse = await getActiveGoal();
        if (activeGoalResponse.success && activeGoalResponse.data) {
          const marketingGoalsArray = [activeGoalResponse.data];
          setMarketingGoals(marketingGoalsArray);
          logger.info('Active goal refreshed after onboarding', { title: activeGoalResponse.data.title });
        } else {
          logger.warn('No active goal found after onboarding');
        }
      } catch (error) {
        logger.error('Error refreshing marketing data after onboarding', error);
      }

      logger.info('Onboarding setup complete - track activated and data refreshed');

      // Send onboarding complete notification
      try {
        const notificationResponse = await apiService.sendNotification({
          type: 'onboarding_complete',
          data: onboardingData
        });
        if (notificationResponse.success) {
          logger.info('Onboarding complete notification sent');
        } else {
          logger.warn('Onboarding notification failed', { error: notificationResponse.error });
        }
      } catch (error) {
        logger.error('Error sending onboarding notification', error);
        // Don't block onboarding completion if notification fails
      }

      // Close the onboarding modal
      setShowOnboarding(false);

    } catch (error) {
      logger.error('Error setting up onboarding', error);
    }
  }, [marketingGoals, projects, handleMarketingGoalsChange, handleProjectsChange]);

  // Comment out unused handlers for now


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
      handleTasksChange(updatedTasks);
    }
  }, [marketingGoals, tasks, projects, handleTasksChange]);

  // Function to sync marketing task changes with regular tasks
  const handleMarketingTaskStatusChange = useCallback((taskId: string, isCompleted: boolean) => {
    // Find the corresponding regular task and update its status
    const regularTask = tasks.find(t => t.marketingTrack?.marketingTaskId === taskId);
    if (regularTask) {
      const newStatus: 'todo' | 'in-progress' | 'completed' = isCompleted ? 'completed' : 'todo';
      if (regularTask.status !== newStatus) {
        const updatedTasks = tasks.map(t => 
          t.id === regularTask.id ? { ...t, status: newStatus } : t
        );
        setTasks(updatedTasks);
      }
    }
  }, [tasks]);



  logger.debug('App component about to render JSX');

  if (isLoading) {
    return (
      <>
        <Header onLogoClick={onLogoClick} onSearchClick={() => setShowQuickSearch(true)} />
        <div className={`app-shell${sidebarHidden ? ' collapsed' : ''}`} style={{ position: 'relative' }}>
          <Sidebar hidden={sidebarHidden} onToggle={toggleSidebar} />
          {/* Only show sidebar toggle on mobile during loading */}
          {isMobile && (
            <div style={{ position: 'fixed', top: 80, left: 12, zIndex: 110 }}>
              <SidebarToggle onClick={toggleSidebar} />
            </div>
          )}
          <main className="main-content">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
              <LoadingSpinner message="Loading..." size="sm" />
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Header onLogoClick={onLogoClick} onSearchClick={() => setShowQuickSearch(true)} />
      <OfflineBanner />
      <TrialCountdownBanner />
      <NotificationContainer />
      
      {/* Mobile Hamburger Menu */}
      <button 
        className="mobile-menu-button"
        onClick={toggleMobileSidebar}
        aria-label="Toggle menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {/* Mobile Sidebar Overlay */}
      <div 
        className={`sidebar-overlay${mobileSidebarOpen ? ' visible' : ''}`}
        onClick={toggleMobileSidebar}
      />

      <div className={`app-shell${sidebarHidden ? ' collapsed' : ''}`} style={{ position: 'relative' }}>
        <Sidebar
          hidden={sidebarHidden}
          onToggle={toggleSidebar}
          showProfileManager={Boolean(marketingGoals.find(g => g.title === 'Improve Social Media Strategy & Engagement' && g.currentWeek >= g.duration))}
          showSocialStrategy={hasSocialStrategyAccess || Boolean(marketingGoals.find(g => {
            const titleLower = g.title?.toLowerCase() || '';
            return titleLower.includes('social media') || titleLower.includes('social');
          }))}
          mobileOpen={mobileSidebarOpen}
        />
        {/* Attach opener only when collapsed */}
        {sidebarHidden && (
          <SidebarToggle className="sidebar-opener" onClick={toggleSidebar} />
        )}
        <main className="main-content">
          <MarketingProvider onTaskStatusChange={handleMarketingTaskStatusChange}>
            <ActivityReminders />
            <TaskSync tasks={tasks} setTasks={setTasks} setMarketingGoals={setMarketingGoals} />
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
            <Route
              path="profile-manager"
              element={
                marketingGoals.some(g => g.title === 'Improve Social Media Strategy & Engagement' && g.currentWeek >= g.duration)
                  ? <Suspense fallback={<div className="flex items-center justify-center p-8"><LoadingSpinner size="md" /></div>}>
                      <SocialProfileManager marketingGoals={marketingGoals} />
                    </Suspense>
                  : <Navigate to="/app/marketing-track" replace />
              }
            />
            <Route
              path="social-strategy"
              element={
                hasSocialStrategyAccess || marketingGoals.some(g => {
                  const titleLower = g.title?.toLowerCase() || '';
                  return titleLower.includes('social media') || titleLower.includes('social');
                })
                  ? <Suspense fallback={<div className="flex items-center justify-center p-8"><LoadingSpinner size="md" /></div>}>
                      <SocialStrategyHub />
                    </Suspense>
                  : <Navigate to="/app/marketing-track" replace />
              }
            />
            <Route path="assets" element={
              <Suspense fallback={<div className="flex items-center justify-center p-8"><LoadingSpinner size="md" /></div>}>
                <AssetLibrary />
              </Suspense>
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
            <Route path="ai-marketing-assistant" element={
              <Suspense fallback={<div className="flex items-center justify-center p-8"><LoadingSpinner size="md" /></div>}>
                <AIMarketingAssistant />
              </Suspense>
            } />
            <Route path="social-generator" element={
              <Suspense fallback={<div className="flex items-center justify-center p-8"><LoadingSpinner size="md" /></div>}>
                <SocialMediaGeneratorPage />
              </Suspense>
            } />
            <Route path="affiliate/program" element={
              <Suspense fallback={<div className="flex items-center justify-center p-8"><LoadingSpinner size="md" /></div>}>
                <AffiliateProgramPage />
              </Suspense>
            } />
            <Route path="affiliate/dashboard" element={
              <Suspense fallback={<div className="flex items-center justify-center p-8"><LoadingSpinner size="md" /></div>}>
                <AffiliateDashboardPage />
              </Suspense>
            } />
            <Route path="admin/affiliate" element={
              <Suspense fallback={<div className="flex items-center justify-center p-8"><LoadingSpinner size="md" /></div>}>
                <AdminGuard>
                  <AdminAffiliatePage />
                </AdminGuard>
              </Suspense>
            } />
            <Route path="manage-subscription" element={<SubscriptionPage />} />
            <Route path="feedback" element={<FeedbackPage />} />
            <Route path="admin/marketing-tracks" element={
              <Suspense fallback={<div className="flex items-center justify-center p-8"><LoadingSpinner size="md" /></div>}>
                <AdminGuard>
                  <VisualTracksAdminPage />
                </AdminGuard>
              </Suspense>
            } />
            <Route path="admin/marketing-tracks-old" element={
              <Suspense fallback={<div className="flex items-center justify-center p-8"><LoadingSpinner size="md" /></div>}>
                <AdminGuard>
                  <TracksAdminPage />
                </AdminGuard>
              </Suspense>
            } />
              </Routes>
              <Suspense fallback={null}>
                <FloatingAssistant />
              </Suspense>
            </PersonalizedDashboard>
          </MarketingProvider>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />

        {/* Keyboard Shortcuts Modal */}
        <KeyboardShortcutsModal 
          isOpen={showKeyboardShortcuts}
          onClose={() => setShowKeyboardShortcuts(false)}
        />

        {/* Quick Search */}
        <QuickSearch
          isOpen={showQuickSearch}
          onClose={() => setShowQuickSearch(false)}
          tasks={tasks}
        />
      </div>
    </>
  );
}

function App() {
  
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
        {/* Landing page is served as static index.html, not a React route */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/affiliate-terms" element={<AffiliateProgramTermsPage />} />
        <Route path="/tracks" element={<MarketingTracksPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/affiliate-partner/apply" element={
          <Suspense fallback={<LoadingSpinner fullScreen size="md" />}>
            <AffiliatePartnerApplicationPage />
          </Suspense>
        } />

        {/* Pricing */}
        <Route path="/pricing" element={<PricingPage />} />

        {/* Checkout - Public */}
        <Route path="/checkout/:plan/:interval" element={<CheckoutPage />} />
        <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />

        {/* Shared Strategy View - Public */}
        <Route path="/shared/strategy/:accessCode" element={
          <Suspense fallback={<LoadingSpinner fullScreen size="md" />}>
            <SharedStrategyView />
          </Suspense>
        } />

        {/* Shared Assets View - Public */}
        <Route path="/shared/assets/:accessCode" element={
          <Suspense fallback={<LoadingSpinner fullScreen size="md" />}>
            <SharedAssets />
          </Suspense>
        } />

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
