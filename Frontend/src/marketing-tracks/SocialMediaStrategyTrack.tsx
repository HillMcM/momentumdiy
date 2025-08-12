import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MarketingGoal } from '../types';



interface SocialMediaStrategyTrackProps {
  marketingGoals: MarketingGoal[];
}





export default function SocialMediaStrategyTrack({ 
  marketingGoals
}: SocialMediaStrategyTrackProps) {

  const navigate = useNavigate();



  // Find the Social Media Strategy goal
  const activeGoal = marketingGoals.find(g => 
    g.title.toLowerCase().includes('social media') || 
    g.title.toLowerCase().includes('social media strategy') ||
    g.title.toLowerCase().includes('improve social media')
  );

  // If no Social Media Strategy goal is found, redirect to overview
  useEffect(() => {
    if (!activeGoal) {
      navigate('/app/marketing-track');
    }
  }, [activeGoal, navigate]);










  if (!activeGoal) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#FFF1E7' }}>
        <h2>Social Media Strategy Track Not Found</h2>
        <p>Please activate the Social Media Strategy track from the marketing tracks overview.</p>
        <button 
          onClick={() => navigate('/app/marketing-track')}
          style={{ padding: '0.75rem 1.5rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(239,142,129,0.2)', color: '#EF8E81', cursor: 'pointer' }}
        >
          Back to Marketing Tracks
        </button>
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

          {/* Call to Action */}
          <div style={{ 
            marginTop: '2rem', 
            padding: '1.5rem', 
            background: 'rgba(104, 109, 202, 0.1)', 
            borderRadius: 10, 
            border: '1px solid rgba(104, 109, 202, 0.2)',
            textAlign: 'center'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#FFF1E7', fontWeight: 600 }}>
              Ready to Get Started?
            </h4>
            <p style={{ margin: '0 0 1rem 0', color: '#FFF1E7', opacity: 0.8, fontSize: '0.9rem' }}>
              Go back to the overview and activate this track to begin your Social Media Strategy journey
            </p>

            <button 
              onClick={() => navigate('/app/marketing-track')}
              style={{ 
                padding: '0.75rem 1.5rem', 
                borderRadius: 8, 
                border: 'none', 
                background: '#686DCA', 
                color: '#22202F', 
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#8a8fd8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#686DCA';
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
