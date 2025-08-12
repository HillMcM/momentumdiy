import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MarketingGoal } from '../types';



interface LocalFootTrafficTrackProps {
  marketingGoals: MarketingGoal[];
}



export default function LocalFootTrafficTrack({ 
  marketingGoals
}: LocalFootTrafficTrackProps) {

  const navigate = useNavigate();


  // Find the Local Foot Traffic goal
  const activeGoal = marketingGoals.find(g => 
    g.title.toLowerCase().includes('foot traffic') || 
    g.title.toLowerCase().includes('local foot traffic') ||
    g.title.toLowerCase().includes('increase local foot traffic') ||
    g.title.toLowerCase().includes('improving local foot traffic')
  );

  // If no Local Foot Traffic goal is found, redirect to overview
  useEffect(() => {
    if (!activeGoal) {
      navigate('/app/marketing-track');
    }
  }, [activeGoal, navigate]);

















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
              onClick={() => navigate('/app/marketing-track')}
              style={{ 
                padding: '1rem 2rem', 
                borderRadius: 8, 
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

          {/* Call to Action */}
          <div style={{ 
            marginTop: '2rem', 
            padding: '1.5rem', 
            background: 'rgba(239, 142, 129, 0.1)', 
            borderRadius: 10, 
            border: '1px solid rgba(239, 142, 129, 0.2)',
            textAlign: 'center'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#FFF1E7', fontWeight: 600 }}>
              Ready to Get Started?
            </h4>
            <p style={{ margin: '0 0 1rem 0', color: '#FFF1E7', opacity: 0.8, fontSize: '0.9rem' }}>
              Go back to the overview and activate this track to begin your Local Foot Traffic journey
            </p>
            <button 
              onClick={() => navigate('/app/marketing-track')}
              style={{ 
                padding: '0.75rem 1.5rem', 
                borderRadius: 8, 
                border: 'none', 
                background: '#EF8E81', 
                color: '#22202F', 
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ffb09e';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#EF8E81';
              }}
            >
              Back to Marketing Tracks
            </button>
          </div>
        </div>
      </div>


    </div>
  );
}
