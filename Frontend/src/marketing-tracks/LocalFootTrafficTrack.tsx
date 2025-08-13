import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MarketingGoal, Project, Task } from '../types';

interface LocalFootTrafficTrackProps {
  marketingGoals: MarketingGoal[];
  onMarketingGoalsChange: (goals: MarketingGoal[]) => void;
  onProjectsChange: (projects: Project[]) => void;
  projects: Project[];
  tasks: Task[]; // Add tasks prop to receive real task data
}

// REMOVED: withFallback function that generated fake data
// This was masking real data issues and should not exist
// If you see this error, it means the marketing track data is incomplete
// and needs to be properly seeded from the database



export default function LocalFootTrafficTrack({ 
  marketingGoals, 
  onMarketingGoalsChange, 
  onProjectsChange, 
  projects,
  tasks 
}: LocalFootTrafficTrackProps) {
  const navigate = useNavigate();
  
  // Generate tasks for a module based on its content and week number
  const generateTasksForModule = (module: any, goal: any) => {
    const weekNumber = module.weekNumber;
    const moduleId = module.id;
    
    // Generate tasks based on the Local Foot Traffic track structure
    switch (weekNumber) {
      case 1: // Audit Visibility
        return [
          {
            id: `${moduleId}-w1-audit-online`,
            title: 'Audit Online Presence',
            description: 'Review Google Business Profile, website accuracy, and social media presence',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w1-audit-online` }
          },
          {
            id: `${moduleId}-w1-audit-signage`,
            title: 'Audit Physical Signage',
            description: 'Stand across the street: does signage clearly convey what you offer?',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w1-audit-signage` }
          },
          {
            id: `${moduleId}-w1-baseline`,
            title: 'Capture Baseline Metrics',
            description: 'Record weekly walk-ins, Google views, social engagement, and weekly revenue',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w1-baseline` }
          },
          {
            id: `${moduleId}-w1-photos`,
            title: 'Upload Storefront Photos',
            description: 'Take and upload photos from across the street to see what first-time visitors see',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w1-photos` }
          }
        ];
      case 2: // Content Strategy
        return [
          {
            id: `${moduleId}-w2-content-pillars`,
            title: 'Define Content Pillars',
            description: 'Choose 3-4 brand-aligned content themes for consistent messaging',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w2-content-pillars` }
          },
          {
            id: `${moduleId}-w2-posting-plan`,
            title: 'Create Posting Schedule',
            description: 'Develop a weekly content calendar with specific themes for each day',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w2-posting-plan` }
          }
        ];
      case 3: // Social Media Setup
        return [
          {
            id: `${moduleId}-w3-profile-optimization`,
            title: 'Optimize Social Profiles',
            description: 'Update profile photos, bios, and links across all social platforms',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w3-profile-optimization` }
          },
          {
            id: `${moduleId}-w3-content-batch`,
            title: 'Create Content Batch',
            description: 'Develop 2 weeks worth of content following your content pillars',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w3-content-batch` }
          }
        ];
      case 4: // Local SEO & Google
        return [
          {
            id: `${moduleId}-w4-google-business`,
            title: 'Optimize Google Business Profile',
            description: 'Update hours, services, photos, and respond to reviews',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w4-google-business` }
          },
          {
            id: `${moduleId}-w4-local-keywords`,
            title: 'Research Local Keywords',
            description: 'Identify location-based search terms your customers use',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w4-local-keywords` }
          }
        ];
      case 5: // Community Engagement
        return [
          {
            id: `${moduleId}-w5-local-research`,
            title: 'Research Local Community',
            description: 'Identify local events, groups, and influencers in your area',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w5-local-research` }
          },
          {
            id: `${moduleId}-w5-engagement-plan`,
            title: 'Create Engagement Plan',
            description: 'Plan how to participate in local community events and discussions',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w5-engagement-plan` }
          }
        ];
      case 6: // Paid Local Advertising
        return [
          {
            id: `${moduleId}-w6-ad-strategy`,
            title: 'Develop Ad Strategy',
            description: 'Create targeted local advertising campaigns for your audience',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w6-ad-strategy` }
          },
          {
            id: `${moduleId}-w6-ad-setup`,
            title: 'Setup Ad Campaigns',
            description: 'Launch Facebook/Google ads targeting local customers',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w6-ad-setup` }
          }
        ];
      case 7: // Partnership Marketing
        return [
          {
            id: `${moduleId}-w7-partner-research`,
            title: 'Research Local Partners',
            description: 'Identify complementary businesses for cross-promotion opportunities',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w7-partner-research` }
          },
          {
            id: `${moduleId}-w7-partnership-plan`,
            title: 'Create Partnership Plan',
            description: 'Develop strategy for collaborating with local businesses',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w7-partnership-plan` }
          }
        ];
      case 8: // Event Marketing
        return [
          {
            id: `${moduleId}-w8-event-planning`,
            title: 'Plan Local Events',
            description: 'Design events or activations to bring people to your location',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w8-event-planning` }
          },
          {
            id: `${moduleId}-w8-event-promotion`,
            title: 'Promote Events',
            description: 'Create marketing materials and social media campaigns for events',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w8-event-promotion` }
          }
        ];
      case 9: // Customer Referral Program
        return [
          {
            id: `${moduleId}-w9-referral-design`,
            title: 'Design Referral Program',
            description: 'Create incentives and structure for customer referrals',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w9-referral-design` }
          },
          {
            id: `${moduleId}-w9-referral-launch`,
            title: 'Launch Referral Program',
            description: 'Announce program to existing customers and track referrals',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w9-referral-launch` }
          }
        ];
      case 10: // Analytics & Optimization
        return [
          {
            id: `${moduleId}-w10-analytics-setup`,
            title: 'Setup Analytics Tracking',
            description: 'Implement tracking for all marketing activities and conversions',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w10-analytics-setup` }
          },
          {
            id: `${moduleId}-w10-optimize-strategies`,
            title: 'Optimize Strategies',
            description: 'Analyze performance data and adjust marketing approaches',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w10-optimize-strategies` }
          }
        ];
      case 11: // Advanced Local SEO
        return [
          {
            id: `${moduleId}-w11-advanced-seo`,
            title: 'Implement Advanced SEO',
            description: 'Apply advanced local SEO techniques and schema markup',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w11-advanced-seo` }
          },
          {
            id: `${moduleId}-w11-technical-seo`,
            title: 'Technical SEO Audit',
            description: 'Address technical SEO issues and improve site performance',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w11-technical-seo` }
          }
        ];
      case 12: // Scale & Automate
        return [
          {
            id: `${moduleId}-w12-scale-strategies`,
            title: 'Scale Successful Strategies',
            description: 'Expand what\'s working to reach more local customers',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w12-scale-strategies` }
          },
          {
            id: `${moduleId}-w12-automation`,
            title: 'Automate Processes',
            description: 'Set up automation for repetitive marketing tasks',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w12-automation` }
          }
        ];
      default:
        return [];
    }
  };
  
  // Find the Local Foot Traffic goal
  const activeGoal = marketingGoals.find(g => g.title === 'Increase Local Foot Traffic');

  const startLocalFootTrafficTrack = () => {
    if (!activeGoal) return;
    
    const updatedGoals = marketingGoals.map(g => {
      if (g.id === activeGoal.id) {
        return { 
          ...g, 
          isActive: true, 
          startDate: new Date(), 
          currentWeek: 1, 
          progress: 0, 
          weekStartDates: [new Date()], 
          lastWeekAdvancement: new Date(),
          modules: g.modules.map((module, index) => ({
            ...module,
            isUnlocked: index === 0, // Only unlock first week
            isCompleted: false
          }))
        };
      } else {
        return { 
          ...g, 
          isActive: false, 
          currentWeek: 0, 
          progress: 0, 
          modules: g.modules.map(module => ({ 
            ...module, 
            isUnlocked: false, 
            isCompleted: false 
          }))
        };
      }
    });
    
    onMarketingGoalsChange(updatedGoals);
    
    const projectId = Math.max(0, ...projects.map(p => parseInt(p.id) || 0)) + 1;
    const newProject: Project = {
      id: projectId.toString(),
      name: activeGoal.title,
      description: activeGoal.description,
      deadline: new Date(Date.now() + (activeGoal.duration * 7 * 24 * 60 * 60 * 1000)).toISOString(),
      tasks: [],
      progress: 0,
      status: 'active',
      timeline: activeGoal.modules.map((module) => ({
        id: module.id,
        name: `Week ${module.weekNumber}: ${module.title}`,
        description: module.description,
        startDate: new Date(Date.now() + ((module.weekNumber - 1) * 7 * 24 * 60 * 60 * 1000)),
        endDate: new Date(Date.now() + (module.weekNumber * 7 * 24 * 60 * 60 * 1000)),
        status: module.weekNumber === 1 ? 'in-progress' : 'not-started',
        tasks: [],
        order: module.weekNumber
      }))
    };
    
    onProjectsChange([...projects, newProject]);
    
    // Stay on the current track page - the track is now active and content will update
    // No navigation needed - user stays on /app/marketing-track/local-foot-traffic
  };

  // If no Local Foot Traffic goal is found, redirect to overview
  useEffect(() => {
    if (!activeGoal) {
      navigate('/app/marketing-track');
    }
  }, [activeGoal, navigate]);

  // If no goal found, show the start track CTA
  if (!activeGoal) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#FFF1E7' }}>
        <div style={{ 
          background: 'linear-gradient(180deg, rgba(239,142,129,0.06), rgba(25,22,40,0.35))',
          borderRadius: '16px',
          padding: '3rem 2rem',
          border: '2px solid rgba(239, 142, 129, 0.25)',
          boxShadow: '0 10px 28px rgba(0,0,0,0.35)',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '2rem', color: '#FFF1E7' }}>
            Start Your Local Foot Traffic Journey
          </h2>
          <p style={{ margin: '0 0 2rem 0', color: '#FFF1E7', opacity: 0.8, fontSize: '1.1rem', lineHeight: 1.6 }}>
            Boost your local business visibility and drive more customers through your doors with our proven 12-week Local Foot Traffic strategy.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/app/marketing-track')}
              style={{ 
                padding: '1rem 2rem', 
                borderRadius: 8, 
                border: '1px solid rgba(239,142,129,0.3)', 
                background: 'rgba(239,142,129,0.15)', 
                color: '#EF8E81', 
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 600,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239,142,129,0.25)';
                e.currentTarget.style.borderColor = 'rgba(239,142,129,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239,142,129,0.15)';
                e.currentTarget.style.borderColor = 'rgba(239,142,129,0.3)';
              }}
            >
              View All Tracks
            </button>
            <button 
              onClick={startLocalFootTrafficTrack}
              style={{ 
                padding: '1rem 2rem', 
                borderRadius: '8', 
                border: 'none', 
                background: 'linear-gradient(135deg, #EF8E81, #E67E73)', 
                color: '#FFF1E7', 
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: '0 4px 15px rgba(239,142,129,0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(239,142,129,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(239,142,129,0.3)';
              }}
            >
              Start Local Foot Traffic Track
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If goal is found but not active, show the preview with start track CTA
  if (!activeGoal.isActive) {
    return (
      <div className="widget" style={{ padding: '2rem', minHeight: '100vh', color: '#FFF1E7' }}>
        {/* Header with back button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            onClick={() => navigate('/app/marketing-track')}
            style={{ padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#FFF1E7', cursor: 'pointer' }}
          >
            ← Back to Tracks
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 700, color: '#FFF1E7' }}>
              {activeGoal.title}
            </h1>
            <p style={{ margin: '0.5rem 0 0 0', color: '#FFF1E7', opacity: 0.7, fontSize: '1.1rem' }}>
              {activeGoal.description}
            </p>
          </div>
        </div>

        {/* Track Overview Section */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{
            background: 'linear-gradient(180deg, rgba(239,142,129,0.06), rgba(25,22,40,0.35))',
            borderRadius: '16px',
            padding: '2rem',
            border: '2px solid rgba(239, 142, 129, 0.25)',
            boxShadow: '0 10px 28px rgba(0,0,0,0.35)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Track Header */}
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem', color: '#FFF1E7' }}>
                Track Overview
              </h2>
              <p style={{ margin: 0, color: '#FFF1E7', opacity: 0.7, fontSize: '1rem' }}>
                Preview of all 12 weeks in your Local Foot Traffic journey
              </p>
            </div>

            {/* Weekly Preview Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {activeGoal.modules.map((module) => {
                // Count tasks for this module - first try to find linked tasks, then generate from module content
                let moduleTasks = tasks.filter(task => {
                  // Check if task belongs to this marketing module
                  const taskMarketingTrack = task.marketingTrack;
                  if (taskMarketingTrack && taskMarketingTrack.moduleId) {
                    // This task is linked to a marketing track module
                    return taskMarketingTrack.moduleId === module.id;
                  }
                  return false;
                });
                
                // If no linked tasks found, generate tasks based on module content
                if (moduleTasks.length === 0) {
                  const generatedTasks = generateTasksForModule(module, activeGoal);
                  moduleTasks = generatedTasks;
                }
                
                // Debug logging
                console.log('Track Overview Real Data:', {
                  goalTitle: activeGoal.title,
                  weekNumber: module.weekNumber,
                  moduleId: module.id,
                  moduleTitle: module.title,
                  realTaskCount: moduleTasks.length,
                  allTasks: tasks.length,
                  sampleTask: moduleTasks[0] || 'No tasks found',
                  tasksGenerated: moduleTasks.length > 0 ? 'Yes' : 'No'
                });
                
                return (
                  <div
                    key={module.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(239, 142, 129, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                  >
                    {/* Week Number Badge */}
                    <div style={{ 
                      display: 'inline-block',
                      background: 'rgba(239, 142, 129, 0.2)',
                      color: '#EF8E81',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '1rem'
                    }}>
                      Week {module.weekNumber}
                    </div>

                    {/* Week Title */}
                    <h3 style={{ 
                      margin: '0 0 0.75rem 0', 
                      fontSize: '1.1rem', 
                      color: '#FFF1E7', 
                      fontWeight: 600,
                      lineHeight: '1.4'
                    }}>
                      {module.title}
                    </h3>

                    {/* Week Description */}
                    <p style={{ 
                      margin: '0 0 1rem 0', 
                      color: '#FFF1E7', 
                      opacity: 0.7, 
                      fontSize: '0.9rem',
                      lineHeight: '1.5'
                    }}>
                      {module.description}
                    </p>

                    {/* Task Count - Now using REAL data */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      color: '#EF8E81',
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}>
                      <span>📋</span>
                      <span>{moduleTasks.length} tasks</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Start Track CTA */}
            <div style={{ 
              marginTop: '3rem', 
              padding: '2.5rem', 
              background: 'linear-gradient(135deg, rgba(239, 142, 129, 0.1), rgba(239, 142, 129, 0.05))', 
              borderRadius: '16px', 
              border: '2px solid rgba(239, 142, 129, 0.3)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background accent */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #EF8E81, #E67E73)',
                borderRadius: '16px 16px 0 0'
              }} />
              
              <h3 style={{ 
                margin: '0 0 1rem 0', 
                fontSize: '1.75rem', 
                color: '#FFF1E7', 
                fontWeight: 700,
                textAlign: 'center'
              }}>
                Ready to Start Your Local Foot Traffic Journey?
              </h3>
              <p style={{ 
                margin: '0 0 2rem 0', 
                color: '#FFF1E7', 
                opacity: 0.8, 
                fontSize: '1.1rem', 
                lineHeight: 1.6,
                maxWidth: '600px',
                marginLeft: 'auto',
                marginRight: 'auto',
                textAlign: 'center'
              }}>
                Click the button below to activate this track and unlock Week 1 content. You'll get immediate access to your first week's tasks and can start building your local business visibility right away.
              </p>
              <button 
                onClick={startLocalFootTrafficTrack}
                style={{ 
                  padding: '1.25rem 3rem', 
                  borderRadius: '12px', 
                  border: 'none', 
                  background: 'linear-gradient(135deg, #EF8E81, #E67E73)', 
                  color: '#22202F', 
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  boxShadow: '0 8px 25px rgba(239,142,129,0.4)',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'block',
                  margin: '0 auto'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(239,142,129,0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(239,142,129,0.4)';
                }}
              >
                🚀 Start Track Now
              </button>
              <p style={{ 
                margin: '1rem 0 0 0', 
                color: '#FFF1E7', 
                opacity: 0.6, 
                fontSize: '0.9rem',
                textAlign: 'center'
              }}>
                Unlocks Week 1 content and creates your project timeline
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If track is active, show the active track content
  return (
    <div className="widget" style={{ padding: '2rem', minHeight: '100vh', color: '#FFF1E7' }}>
      {/* Header with back button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate('/app/marketing-track')}
          style={{ padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#FFF1E7', cursor: 'pointer' }}
        >
          ← Back to Tracks
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 700, color: '#FFF1E7' }}>
            {activeGoal.title}
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#FFF1E7', opacity: 0.7, fontSize: '1.1rem' }}>
            {activeGoal.description}
          </p>
        </div>
      </div>

      {/* Active Track Status */}
      <div style={{ 
        marginBottom: '2rem', 
        padding: '1.5rem', 
        background: 'rgba(239, 142, 129, 0.1)', 
        borderRadius: '12px', 
        border: '1px solid rgba(239, 142, 129, 0.2)' 
      }}>
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', color: '#FFF1E7' }}>
          🎯 Track Active - Week {activeGoal.currentWeek} of {activeGoal.duration}
        </h2>
        <p style={{ margin: 0, color: '#FFF1E7', opacity: 0.8 }}>
          Your Local Foot Traffic track is now active! You can view your progress and manage tasks from the main Marketing Track page.
        </p>
        <button 
          onClick={() => navigate('/app/marketing-track')}
          style={{ 
            marginTop: '1rem',
            padding: '0.75rem 1.5rem', 
            borderRadius: 8, 
            border: 'none', 
            background: '#EF8E81', 
            color: '#22202F', 
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Go to Marketing Track Dashboard
        </button>
      </div>
    </div>
  );
}
