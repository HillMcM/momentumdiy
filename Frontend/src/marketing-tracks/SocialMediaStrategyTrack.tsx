import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MarketingGoal } from '../types';
import { apiService } from '../services/api';



interface SocialMediaStrategyTrackProps {
  marketingGoals: MarketingGoal[];
  onMarketingGoalsChange: (goals: MarketingGoal[]) => void;
}





export default function SocialMediaStrategyTrack({ 
  marketingGoals, 
  onMarketingGoalsChange 
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








  const renderInteractiveContentForTask = (t: { id: string; title: string; description: string } | null): React.ReactNode => {
    if (!t) return null;

    const lower = t.title.toLowerCase();

    // Social Media specific interactive sections
    if (lower.includes('content pillars') || lower.includes('choose your content pillars')) {
      return (
        <div>
          <h2 style={{ marginTop: 0 }}>Choose Your Content Pillars</h2>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 700, color: '#FFF1E7', marginBottom: '0.25rem' }}>Why create content pillars?</div>
            <p style={{ margin: 0, opacity: 0.85 }}>
              Content pillars are the repeatable themes that shape your message. They give you clarity, make planning faster,
              and help your audience understand what you stand for. Once you lock them, your weekly plan becomes plug‑and‑play.
            </p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Pillar 1
                <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.25rem' }}>
                  Your main content theme
                </div>
              </label>
              <input
                placeholder="e.g., Behind the Scenes, Tips & Tricks, Customer Stories"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 8,
                  border: '1px solid #444',
                  background: '#191628',
                  color: '#FFF1E7',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Pillar 2
                <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.25rem' }}>
                  Your secondary content theme
                </div>
              </label>
              <input
                placeholder="e.g., Product Features, Industry Insights, Team Spotlights"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 8,
                  border: '1px solid #444',
                  background: '#191628',
                  color: '#FFF1E7',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Pillar 3
                <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.25rem' }}>
                  Your third content theme
                </div>
              </label>
              <input
                placeholder="e.g., Community Engagement, Local Events, Fun Facts"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 8,
                  border: '1px solid #444',
                  background: '#191628',
                  color: '#FFF1E7',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button style={{ padding: '0.75rem 1.5rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(104,109,202,0.2)', color: '#686DCA', cursor: 'pointer' }}>Save Pillars</button>
          </div>
        </div>
      );
    }

    if (lower.includes('plan this week') || lower.includes("plan this week's") || lower.includes('3 posts')) {
      return (
        <div>
          <h2 style={{ marginTop: 0 }}>Plan This Week's Posts</h2>
          <p style={{ opacity: 0.85, marginBottom: '1.5rem' }}>
            We'll use three post types to keep things clear and consistent. Draft your captions below.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '0.9rem' }}>
              <div style={{ fontWeight: 700, color: '#FFF1E7' }}>Educate</div>
              <p style={{ margin: '0.25rem 0', opacity: 0.85 }}>Teach something useful that relates to your product or service.</p>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Example: "Answer a common customer question or give a useful tip related to your work."</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '0.9rem' }}>
              <div style={{ fontWeight: 700, color: '#FFF1E7' }}>Connect</div>
              <p style={{ margin: '0.25rem 0', opacity: 0.85 }}>Humanize your brand and build trust with small stories.</p>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                Examples: "Here's what we're working on this week…", "Share why you started your business, or something you're proud of."
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '0.9rem' }}>
              <div style={{ fontWeight: 700, color: '#FFF1E7' }}>Promote</div>
              <p style={{ margin: '0.25rem 0', opacity: 0.85 }}>Spotlight one offer and invite people to take the next step.</p>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                Examples: "Highlight 1 offer you love—show it, describe it, and invite people in."
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button style={{ padding: '0.75rem 1.5rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(104,109,202,0.2)', color: '#686DCA', cursor: 'pointer' }}>Save Plan</button>
          </div>
        </div>
      );
    }

    // Default fallback
    return (
      <div>
        <h2 style={{ marginTop: 0 }}>{t.title}</h2>
        <p style={{ opacity: 0.85 }}>{t.description}</p>
        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button style={{ padding: '0.75rem 1.5rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(104,109,202,0.2)', color: '#686DCA', cursor: 'pointer' }}>Mark In Progress</button>
          <button style={{ padding: '0.75rem 1.5rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(94,205,125,0.2)', color: '#5ECD7D', cursor: 'pointer' }}>Completed</button>
        </div>
      </div>
    );
  };

  if (!activeGoal || !currentModule) {
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
