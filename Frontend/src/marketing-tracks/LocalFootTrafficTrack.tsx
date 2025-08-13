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
  
  // Generate tasks for a module based on the real database structure
  const generateTasksForModule = (module: any, goal: any) => {
    const weekNumber = module.weekNumber;
    const moduleId = module.id;
    
    // Generate tasks based on the actual Local Foot Traffic track structure from the database
    switch (weekNumber) {
      case 1: // Audit Visibility - 3 tasks
        return [
          {
            id: `${moduleId}-w1-online`,
            title: 'Online Presence Audit',
            description: 'Review and assess your current online presence across all platforms',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w1-online` }
          },
          {
            id: `${moduleId}-w1-baseline`,
            title: 'Baseline Metrics',
            description: 'Establish current performance metrics and benchmarks',
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
            title: 'Storefront & Signage Photos',
            description: 'Document current storefront appearance and signage',
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
      case 2: // Content Strategy - 3 tasks
        return [
          {
            id: `${moduleId}-w2-content`,
            title: 'Content Pillars',
            description: 'Define your core content themes and messaging',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w2-content` }
          },
          {
            id: `${moduleId}-w2-calendar`,
            title: 'Content Calendar',
            description: 'Create your posting schedule and content plan',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w2-calendar` }
          },
          {
            id: `${moduleId}-w2-templates`,
            title: 'Content Templates',
            description: 'Develop reusable templates for consistent posting',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w2-templates` }
          }
        ];
      case 3: // Social Media Setup - 3 tasks
        return [
          {
            id: `${moduleId}-w3-profiles`,
            title: 'Profile Optimization',
            description: 'Optimize all social media profiles for local SEO',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w3-profiles` }
          },
          {
            id: `${moduleId}-w3-strategy`,
            title: 'Platform Strategy',
            description: 'Develop platform-specific content strategies',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w3-strategy` }
          },
          {
            id: `${moduleId}-w3-automation`,
            title: 'Posting Automation',
            description: 'Set up automated posting and scheduling tools',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w3-automation` }
          }
        ];
      case 4: // Local SEO & Google - 2 tasks
        return [
          {
            id: `${moduleId}-w4-seo`,
            title: 'Local SEO Audit',
            description: 'Conduct comprehensive local SEO audit',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w4-seo` }
          },
          {
            id: `${moduleId}-w4-google`,
            title: 'Google Business Optimization',
            description: 'Optimize Google Business Profile',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w4-google` }
          }
        ];
      case 5: // Community Engagement - 2 tasks
        return [
          {
            id: `${moduleId}-w5-community`,
            title: 'Community Outreach',
            description: 'Identify and engage with local community leaders',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w5-community` }
          },
          {
            id: `${moduleId}-w5-influencers`,
            title: 'Local Influencer Research',
            description: 'Research and connect with local influencers',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w5-influencers` }
          }
        ];
      case 6: // Paid Local Advertising - 2 tasks
        return [
          {
            id: `${moduleId}-w6-ads`,
            title: 'Local Ad Campaigns',
            description: 'Create targeted local advertising campaigns',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w6-ads` }
          },
          {
            id: `${moduleId}-w6-targeting`,
            title: 'Audience Targeting',
            description: 'Define and target local audience segments',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w6-targeting` }
          }
        ];
      case 7: // Partnership Marketing - 2 tasks
        return [
          {
            id: `${moduleId}-w7-partners`,
            title: 'Partner Identification',
            description: 'Identify potential local business partners',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w7-partners` }
          },
          {
            id: `${moduleId}-w7-collaboration`,
            title: 'Collaboration Planning',
            description: 'Plan collaborative marketing initiatives',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w7-collaboration` }
          }
        ];
      case 8: // Event Marketing - 2 tasks
        return [
          {
            id: `${moduleId}-w8-events`,
            title: 'Event Planning',
            description: 'Plan local marketing events and activations',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w8-events` }
          },
          {
            id: `${moduleId}-w8-promotion`,
            title: 'Event Promotion',
            description: 'Create event promotion strategy',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w8-promotion` }
          }
        ];
      case 9: // Customer Referral Program - 2 tasks
        return [
          {
            id: `${moduleId}-w9-referral`,
            title: 'Referral Program Design',
            description: 'Design customer referral program',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w9-referral` }
          },
          {
            id: `${moduleId}-w9-loyalty`,
            title: 'Loyalty Program',
            description: 'Create customer loyalty program',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w9-loyalty` }
          }
        ];
      case 10: // Analytics & Optimization - 2 tasks
        return [
          {
            id: `${moduleId}-w10-analytics`,
            title: 'Performance Tracking',
            description: 'Set up comprehensive performance tracking',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w10-analytics` }
          },
          {
            id: `${moduleId}-w10-optimization`,
            title: 'Strategy Optimization',
            description: 'Optimize strategies based on data',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w10-optimization` }
          }
        ];
      case 11: // Advanced Local SEO - 2 tasks
        return [
          {
            id: `${moduleId}-w11-advanced`,
            title: 'Advanced SEO Techniques',
            description: 'Implement advanced local SEO strategies',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w11-advanced` }
          },
          {
            id: `${moduleId}-w11-technical`,
            title: 'Technical SEO',
            description: 'Address technical SEO issues',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w11-technical` }
          }
        ];
      case 12: // Scale & Automate - 2 tasks
        return [
          {
            id: `${moduleId}-w12-scale`,
            title: 'Scale Strategies',
            description: 'Scale successful marketing strategies',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w12-scale` }
          },
          {
            id: `${moduleId}-w12-automation`,
            title: 'Process Automation',
            description: 'Automate marketing processes',
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
