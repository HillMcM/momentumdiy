import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MarketingGoal } from '../types';
import { apiService } from '../services/api';



interface SocialMediaStrategyTrackProps {
  marketingGoals: MarketingGoal[];
  onMarketingGoalsChange: (goals: MarketingGoal[]) => void;
}



type PostType = 'Educate' | 'Promote' | 'Connect';
type PlannerRow = { day: string; type: PostType; pillar: string; caption: string };

export default function SocialMediaStrategyTrack({ 
  marketingGoals, 
  onMarketingGoalsChange 
}: SocialMediaStrategyTrackProps) {

  const navigate = useNavigate();
  const [confettiAt, setConfettiAt] = useState(0);
  const [interactiveOpen, setInteractiveOpen] = useState(false);
  const [interactiveTask, setInteractiveTask] = useState<{ id: string; title: string; description: string } | null>(null);
  const [plannerMode, setPlannerMode] = useState<'beginner' | 'confident'>('beginner');

  // Social Media specific state
  const [planner, setPlanner] = useState<PlannerRow[]>([
    { day: 'Monday', type: 'Connect', pillar: 'Behind the Scenes', caption: '' },
    { day: 'Tuesday', type: 'Educate', pillar: 'Tip or FAQ', caption: '' },
    { day: 'Wednesday', type: 'Connect', pillar: 'Personal Story', caption: '' },
    { day: 'Thursday', type: 'Promote', pillar: 'Product/Service Feature', caption: '' },
    { day: 'Friday', type: 'Connect', pillar: 'Fun or Community Post', caption: '' }
  ]);

  // Find the Social Media Strategy goal
  const activeGoal = marketingGoals.find(g => 
    g.title.toLowerCase().includes('social media') || 
    g.title.toLowerCase().includes('social media strategy') ||
    g.title.toLowerCase().includes('improve social media')
  );

  // If no Social Media Strategy goal is active, redirect to overview
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

      {/* Current Week Section */}
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
                background: '#686DCA',
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
                    return <h5 key={idx} style={{ margin: '1rem 0 0.5rem 0', color: '#686DCA', fontSize: '1rem' }}>{line.substring(3)}</h5>;
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
                        color: '#686DCA', 
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

          {/* Social Content Plan */}
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(104,109,202,0.04)', borderRadius: 10, border: '1px solid rgba(104,109,202,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h5 style={{ margin: 0, fontSize: '1rem', color: '#FFF1E7', fontWeight: 600 }}>
                Social Content Plan
              </h5>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ color: '#FFF1E7', opacity: 0.8, fontSize: 12 }}>Rhythm</span>
                <button 
                  onClick={() => setPlannerMode('beginner')} 
                  disabled={plannerMode === 'beginner'} 
                  style={{ 
                    padding: '0.3rem 0.6rem', 
                    borderRadius: 999, 
                    border: '1px solid rgba(255,255,255,0.15)', 
                    background: plannerMode === 'beginner' ? '#686DCA' : 'transparent', 
                    color: plannerMode === 'beginner' ? '#191628' : '#FFF1E7', 
                    cursor: 'pointer' 
                  }}
                >
                  Beginner 3x
                </button>
                <button 
                  onClick={() => setPlannerMode('confident')} 
                  disabled={plannerMode === 'confident'} 
                  style={{ 
                    padding: '0.3rem 0.6rem', 
                    borderRadius: 999, 
                    border: '1px solid rgba(255,255,255,0.15)', 
                    background: plannerMode === 'confident' ? '#686DCA' : 'transparent', 
                    color: plannerMode === 'confident' ? '#191628' : '#FFF1E7', 
                    cursor: 'pointer' 
                  }}
                >
                  Confident 5x
                </button>
              </div>
            </div>

            {/* Planner Grid */}
            <div style={{ overflowX: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, tableLayout: 'fixed' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: '#FFF1E7', opacity: 0.8 }}>
                    <th style={{ padding: '8px' }}>Day</th>
                    <th style={{ padding: '8px' }}>Type</th>
                    <th style={{ padding: '8px' }}>Pillar</th>
                    <th style={{ padding: '8px' }}>Caption (draft)</th>
                  </tr>
                </thead>
                <tbody>
                  {(plannerMode === 'beginner' ? planner.filter(r => ['Monday','Wednesday','Friday'].includes(r.day)) : planner).map((row, idx) => (
                    <tr key={row.day} style={{ background: idx % 2 ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                      <td style={{ padding: '8px', color: '#FFF1E7' }}>{row.day}</td>
                      <td style={{ padding: '8px', color: '#FFF1E7' }}>
                        <select 
                          value={row.type} 
                          onChange={(e) => setPlanner(pl => { 
                            const next = [...pl]; 
                            next[idx] = { ...next[idx], type: e.target.value as PostType }; 
                            return next; 
                          })} 
                          style={{ 
                            background: 'rgba(255,255,255,0.06)', 
                            color: '#FFF1E7', 
                            border: '1px solid rgba(255,255,255,0.12)', 
                            borderRadius: 6, 
                            padding: '6px 8px', 
                            width: '100%' 
                          }}
                        >
                          <option value="Connect">Connect</option>
                          <option value="Educate">Educate</option>
                          <option value="Promote">Promote</option>
                        </select>
                      </td>
                      <td style={{ padding: '8px', color: '#FFF1E7' }}>{row.pillar}</td>
                      <td style={{ padding: '8px' }}>
                        <input 
                          value={row.caption} 
                          onChange={(e) => setPlanner(pl => { 
                            const next = [...pl]; 
                            next[idx] = { ...next[idx], caption: e.target.value }; 
                            return next; 
                          })} 
                          placeholder="Draft caption…" 
                          style={{ 
                            background: 'rgba(255,255,255,0.06)', 
                            color: '#FFF1E7', 
                            border: '1px solid rgba(255,255,255,0.12)', 
                            borderRadius: 6, 
                            padding: '6px 8px', 
                            width: '100%' 
                          }} 
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
          <div style={{ width: 'min(860px, 96vw)', height: 'min(88vh, 720px)', background: '#22202F', color: '#FFF1E7', border: '1px solid rgba(104,109,202,0.3)', borderRadius: 12, padding: '1rem 1.5rem', boxShadow: '0 12px 40px rgba(0,0,0,0.45)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
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
