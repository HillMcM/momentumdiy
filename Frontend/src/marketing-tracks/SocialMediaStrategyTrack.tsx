import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MarketingGoal, Project } from '../types';



interface SocialMediaStrategyTrackProps {
  marketingGoals: MarketingGoal[];
  onMarketingGoalsChange: (goals: MarketingGoal[]) => void;
  onProjectsChange: (projects: Project[]) => void;
  projects: Project[];
}





export default function SocialMediaStrategyTrack({ 
  marketingGoals,
  onMarketingGoalsChange,
  onProjectsChange,
  projects
}: SocialMediaStrategyTrackProps) {

  const navigate = useNavigate();



  // Find the Social Media Strategy goal
  const activeGoal = marketingGoals.find(g => 
    g.title.toLowerCase().includes('social media') || 
    g.title.toLowerCase().includes('social media strategy') ||
    g.title.toLowerCase().includes('improve social media')
  );

  const startSocialMediaStrategyTrack = () => {
    if (!activeGoal) return;
    
    // Clear processed goals to prevent infinite loops
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
    
    // Create a new project for this track
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
    
    // Navigate to the marketing track page to see the activated track
    navigate('/app/marketing-track');
  };

  // If no Social Media Strategy goal is found, redirect to overview
  useEffect(() => {
    if (!activeGoal) {
      navigate('/app/marketing-track');
    }
  }, [activeGoal, navigate]);










  if (!activeGoal) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#FFF1E7' }}>
        <div style={{ 
          background: 'linear-gradient(180deg, rgba(104,109,202,0.06), rgba(25,22,40,0.35))',
          borderRadius: '16px',
          padding: '3rem 2rem',
          border: '2px solid rgba(104, 109, 202, 0.25)',
          boxShadow: '0 10px 28px rgba(0,0,0,0.35)',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '2rem', color: '#FFF1E7' }}>
            Start Your Social Media Strategy Journey
          </h2>
          <p style={{ margin: '0 0 2rem 0', color: '#FFF1E7', opacity: 0.8, fontSize: '1.1rem', lineHeight: 1.6 }}>
            Transform your social media presence and build meaningful connections with your audience through our comprehensive 12-week Social Media Strategy program.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/app/marketing-track')}
              style={{ 
                padding: '1rem 2rem', 
                borderRadius: 8, 
                border: '1px solid rgba(104,109,202,0.3)', 
                background: 'rgba(104,109,202,0.15)', 
                color: '#686DCA', 
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 600,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(104,109,202,0.25)';
                e.currentTarget.style.borderColor = 'rgba(104,109,202,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(104,109,202,0.15)';
                e.currentTarget.style.borderColor = 'rgba(104,109,202,0.3)';
              }}
            >
              View All Tracks
            </button>
            <button 
              onClick={startSocialMediaStrategyTrack}
              style={{ 
                padding: '1rem 2rem', 
                borderRadius: 8, 
                border: 'none', 
                background: 'linear-gradient(135deg, #686DCA, #5A5FBD)', 
                color: '#FFF1E7', 
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: '0 4px 15px rgba(104,109,202,0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(104,109,202,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(104,109,202,0.3)';
              }}
            >
              Start Social Media Strategy Track
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          background: 'linear-gradient(180deg, rgba(104,109,202,0.06), rgba(25,22,40,0.35))',
          borderRadius: '16px',
          padding: '2rem',
          border: '2px solid rgba(104, 109, 202, 0.25)',
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
              Preview of all 12 weeks in your Social Media Strategy journey
            </p>
          </div>

          {/* Weekly Preview Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {activeGoal.modules.map((module) => (
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
                  e.currentTarget.style.borderColor = 'rgba(104, 109, 202, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                {/* Week Number Badge */}
                <div style={{ 
                  display: 'inline-block',
                  background: 'rgba(104, 109, 202, 0.2)',
                  color: '#686DCA',
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

                {/* Task Count */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  color: '#686DCA',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}>
                  <span>📋</span>
                  <span>{module.tasks.length} tasks</span>
                </div>
              </div>
            ))}
          </div>


        </div>
      </div>


    </div>
  );
}
