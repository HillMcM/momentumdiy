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
  const [confettiAt, setConfettiAt] = useState(0);
  const [interactiveOpen, setInteractiveOpen] = useState(false);
  const [interactiveTask, setInteractiveTask] = useState<{ id: string; title: string; description: string } | null>(null);

  // Find the Local Foot Traffic goal
  const activeGoal = marketingGoals.find(g => 
    g.title.toLowerCase().includes('foot traffic') || 
    g.title.toLowerCase().includes('local foot traffic') ||
    g.title.toLowerCase().includes('increase local foot traffic') ||
    g.title.toLowerCase().includes('improving local foot traffic')
  );

  // If no Local Foot Traffic goal is active, redirect to overview
  useEffect(() => {
    if (!activeGoal) {
      navigate('/app/marketing-track');
    }
  }, [activeGoal, navigate]);




  const currentModule = activeGoal?.modules.find(m => m.weekNumber === activeGoal.currentWeek);

  const burstConfettiAt = useCallback(() => {
    setConfettiAt(Date.now());
    setTimeout(() => setConfettiAt(0), 2000);
  }, []);

  const toggleTaskCompletion = useCallback((goalId: string, moduleId: string, taskId: string) => {
    const updatedGoals = marketingGoals.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          modules: goal.modules.map(module => module.id === moduleId
            ? { ...module, tasks: module.tasks.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t) }
            : module
          )
        };
      }
      return goal;
    });

    onMarketingGoalsChange(updatedGoals);
    burstConfettiAt();

    // Persist completion to backend
    const m = updatedGoals.find(g => g.id === goalId)?.modules.find(m => m.id === moduleId);
    const toggledTask = m?.tasks.find(t => t.id === taskId);
    if (toggledTask) {
      (async () => {
        try {
          const resp = await apiService.updateMarketingTaskCompletion(taskId, toggledTask.isCompleted);
          if (!resp.success) {
            console.error('Failed to persist marketing task completion:', resp.error);
            // Rollback on failure
            const rolledBackGoals = marketingGoals.map(goal => {
              if (goal.id === goalId) {
                return {
                  ...goal,
                  modules: goal.modules.map(module => module.id === moduleId
                    ? { ...module, tasks: module.tasks.map(t => t.id === taskId ? { ...t, isCompleted: !toggledTask.isCompleted } : t) }
                    : module
                  )
                };
              }
              return goal;
            });
            onMarketingGoalsChange(rolledBackGoals);
          }
        } catch (err) {
          console.error('Error persisting marketing task completion:', err);
        }
      })();
    }
  }, [marketingGoals, onMarketingGoalsChange, burstConfettiAt]);

  const openInteractiveTask = useCallback((taskId: string, taskTitle: string, taskDesc: string) => {
    setInteractiveTask({ id: taskId, title: taskTitle, description: taskDesc });
    setInteractiveOpen(true);
  }, []);

  const closeInteractiveTask = useCallback(() => {
    setInteractiveOpen(false);
    setInteractiveTask(null);
  }, []);

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

  if (!activeGoal || !currentModule) {
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

      {/* Current Week Section */}
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
          {/* Week Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: '1.75rem', color: '#FFF1E7', marginBottom: '0.5rem' }}>
                Week {activeGoal.currentWeek} of {activeGoal.duration}
              </h2>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#FFF1E7', marginBottom: '0.5rem' }}>
                {currentModule.title}
              </h3>
              <p style={{ margin: 0, color: '#FFF1E7', opacity: 0.7, fontSize: '1rem' }}>
                {currentModule.description}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{
                background: '#EF8E81',
                color: '#22202F',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}>
                Active • Week {activeGoal.currentWeek}
              </span>
            </div>
          </div>

          {/* Week Content and Tasks Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'stretch' }}>
            {/* Week Content */}
            <div>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#FFF1E7', fontWeight: 600 }}>
                Week Content
              </h4>
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                padding: '1rem',
                color: '#FFF1E7',
                lineHeight: '1.6',
                fontSize: '0.9rem',
                maxHeight: '400px',
                overflowY: 'auto'
              }}>
                {currentModule.content.split('\n').map((line, idx) => {
                  if (line.startsWith('## ')) {
                    return <h5 key={idx} style={{ margin: '1rem 0 0.5rem 0', color: '#EF8E81', fontSize: '1rem' }}>{line.substring(3)}</h5>;
                  }
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <strong key={idx} style={{ color: '#FFF1E7' }}>{line.substring(2, line.length - 2)}</strong>;
                  }
                  if (line.trim() === '') {
                    return <div key={idx} style={{ height: '0.5rem' }} />;
                  }
                  return <p key={idx} style={{ margin: '0.5rem 0' }}>{line}</p>;
                })}
              </div>
            </div>

            {/* Week Tasks */}
            <div>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#FFF1E7', fontWeight: 600 }}>
                Week Tasks
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {currentModule.tasks.map((task) => (
                  <div
                    key={task.id}
                                         onClick={() => openInteractiveTask(task.id, task.title, task.description)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '1rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${task.isCompleted ? 'rgba(94, 205, 125, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskCompletion(activeGoal.id, currentModule.id, task.id);
                      }}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: `2px solid ${task.isCompleted ? '#5ECD7D' : '#686DCA'}`,
                        background: task.isCompleted ? '#5ECD7D' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}
                    >
                      {task.isCompleted && (
                        <span style={{ color: '#22202F', fontSize: '12px', fontWeight: 'bold' }}>✓</span>
                      )}
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        color: '#FFF1E7', 
                        fontSize: '1rem', 
                        fontWeight: 600,
                        marginBottom: '0.25rem',
                        textDecoration: task.isCompleted ? 'line-through' : 'none',
                        opacity: task.isCompleted ? 0.7 : 1
                      }}>
                        {task.title}
                      </div>
                      <div style={{ 
                        color: '#FFF1E7', 
                        opacity: 0.7, 
                        fontSize: '0.9rem',
                        marginBottom: '0.5rem'
                      }}>
                        {task.description}
                      </div>
                      <div style={{ 
                        color: '#EF8E81', 
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}>
                        ⏱️ {task.estimatedTime}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Week Progress Summary */}
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
            <h5 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#FFF1E7', fontWeight: 600 }}>
              Week Progress
            </h5>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#FFF1E7', opacity: 0.8, fontSize: '0.9rem' }}>Tasks Completed</span>
              <span style={{ color: '#EF8E81', fontWeight: 600, fontSize: '0.9rem' }}>
                {currentModule.tasks.filter(t => t.isCompleted).length} of {currentModule.tasks.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Confetti */}
      {confettiAt > 0 && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99998 }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: 0,
              left: `${(i * 97) % 100}%`,
              width: 8,
              height: 8,
              background: ['#EF8E81','#686DCA','#5ECD7D','#FF9D57'][i % 4],
              borderRadius: 2,
              transform: `translateY(${(Date.now()-confettiAt)/2 + (i*10)}px) rotate(${i*30}deg)`,
              transition: 'transform 0.1s linear'
            }} />
          ))}
        </div>
      )}

      {/* Interactive Task Modal */}
      {interactiveOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '1rem' }} onClick={closeInteractiveTask}>
          <div style={{ width: 'min(860px, 96vw)', height: 'min(88vh, 720px)', background: '#22202F', color: '#FFF1E7', border: '1px solid rgba(239,142,129,0.3)', borderRadius: 12, padding: '1rem 1.5rem', boxShadow: '0 12px 40px rgba(0,0,0,0.45)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{interactiveTask?.title}</h2>
              <button onClick={closeInteractiveTask} style={{ background: 'transparent', color: '#FFF1E7', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
              {renderInteractiveContentForTask(interactiveTask)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
