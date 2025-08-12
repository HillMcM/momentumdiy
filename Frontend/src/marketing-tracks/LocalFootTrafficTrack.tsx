import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MarketingGoal } from '../types';
import { apiService } from '../services/api';



interface LocalFootTrafficTrackProps {
  marketingGoals: MarketingGoal[];
  onMarketingGoalsChange: (goals: MarketingGoal[]) => void;
}



export default function LocalFootTrafficTrack({ 
  marketingGoals, 
  onMarketingGoalsChange 
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








  const renderInteractiveContentForTask = (t: { id: string; title: string; description: string } | null): React.ReactNode => {
    if (!t) return null;

    const lower = t.title.toLowerCase();

    // Week 1 Interactive Sections
    if (lower.includes('online presence audit')) {
      return (
        <div>
          <h2 style={{ marginTop: 0 }}>Online Presence Audit</h2>
          <p style={{ opacity: 0.85, marginBottom: '1.5rem' }}>
            Let's check how discoverable you are online. Fill out this audit to see where you're visible and where you might be invisible.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Google Business Profile
                <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.25rem' }}>
                  Is it claimed and accurate?
                </div>
              </label>
              <textarea
                placeholder="Describe the current state of your Google Business Profile..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 8,
                  border: '1px solid #444',
                  background: '#191628',
                  color: '#FFF1E7',
                  fontSize: '1rem',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Website
                <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.25rem' }}>
                  Does it reflect current hours, services, and offerings?
                </div>
              </label>
              <textarea
                placeholder="Describe your website's current state..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 8,
                  border: '1px solid #444',
                  background: '#191628',
                  color: '#FFF1E7',
                  fontSize: '1rem',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Social Media
                <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.25rem' }}>
                  Are you posting consistently and engaging with locals?
                </div>
              </label>
              <textarea
                placeholder="Describe your social media presence..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 8,
                  border: '1px solid #444',
                  background: '#191628',
                  color: '#FFF1E7',
                  fontSize: '1rem',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Online Reviews
                <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.25rem' }}>
                  What are people saying about finding you?
                </div>
              </label>
              <textarea
                placeholder="Summarize your current reviews and reputation..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 8,
                  border: '1px solid #444',
                  background: '#191628',
                  color: '#FFF1E7',
                  fontSize: '1rem',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button style={{ padding: '0.75rem 1.5rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(104,109,202,0.2)', color: '#686DCA', cursor: 'pointer' }}>Mark In Progress</button>
            <button style={{ padding: '0.75rem 1.5rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(94,205,125,0.2)', color: '#5ECD7D', cursor: 'pointer' }}>Completed</button>
          </div>
        </div>
      );
    }

    if (lower.includes('baseline metrics')) {
      return (
        <div>
          <h2 style={{ marginTop: 0 }}>Baseline Metrics</h2>
          <p style={{ opacity: 0.85, marginBottom: '1.5rem' }}>
            Capture these numbers to track your progress over the next 12 weeks. This is your starting point!
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Weekly Walk-ins
                <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.25rem' }}>
                  Count how many people come in without an appointment
                </div>
              </label>
              <input
                type="number"
                placeholder="0"
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
                Google Views
                <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.25rem' }}>
                  Monthly profile views from your Google Business Profile
                </div>
              </label>
              <input
                type="number"
                placeholder="0"
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
                Social Engagement
                <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.25rem' }}>
                  Average likes/comments per post
                </div>
              </label>
              <input
                type="number"
                placeholder="0"
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
                Weekly Revenue
                <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.25rem' }}>
                  Track weekly sales (optional but helpful)
                </div>
              </label>
              <input
                type="number"
                placeholder="0"
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

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button style={{ padding: '0.75rem 1.5rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(104,109,202,0.2)', color: '#686DCA', cursor: 'pointer' }}>Mark In Progress</button>
            <button style={{ padding: '0.75rem 1.5rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(94,205,125,0.2)', color: '#5ECD7D', cursor: 'pointer' }}>Completed</button>
          </div>
        </div>
      );
    }

    if (lower.includes('storefront') || lower.includes('signage photos')) {
      return (
        <div>
          <h2 style={{ marginTop: 0 }}>Storefront & Signage Photos</h2>
          <p style={{ opacity: 0.85, marginBottom: '1.5rem' }}>
            Take photos from across the street to see what first-time visitors see. This helps you understand your store's first impression.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Storefront from across the street
                <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.25rem' }}>
                  Upload a photo showing your store from a distance
                </div>
              </label>
              <input
                type="file"
                accept="image/*"
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
                Window signage and displays
                <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.25rem' }}>
                  Upload photos of your window displays and signage
                </div>
              </label>
              <input
                type="file"
                accept="image/*"
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
                Entryway and first impression
                <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.25rem' }}>
                  Upload photos of your entryway and entrance area
                </div>
              </label>
              <input
                type="file"
                accept="image/*"
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
                Any outdoor seating or display areas
                <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.25rem' }}>
                  Upload photos of outdoor areas if applicable
                </div>
              </label>
              <input
                type="file"
                accept="image/*"
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

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button style={{ padding: '0.75rem 1.5rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(104,109,202,0.2)', color: '#686DCA', cursor: 'pointer' }}>Mark In Progress</button>
            <button style={{ padding: '0.75rem 1.5rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(94,205,125,0.2)', color: '#5ECD7D', cursor: 'pointer' }}>Completed</button>
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

  if (!activeGoal) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#FFF1E7' }}>
        <h2>Local Foot Traffic Track Not Found</h2>
        <p>Please activate the Local Foot Traffic track from the marketing tracks overview.</p>
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
