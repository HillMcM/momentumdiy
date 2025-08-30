import { useMemo, useState } from 'react';
import type { MarketingGoal, MarketingModule } from './types';
import { useNavigate } from 'react-router-dom';
import { useMarketing } from './contexts/MarketingContext';

interface MarketingTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: MarketingGoal | null;
  module: MarketingModule | null;
}

function MarketingTrackModal({ isOpen, onClose, goal, module }: MarketingTrackModalProps) {
  if (!isOpen || !goal || !module) return null;

  // REMOVED: withFallback function that generated fake data
  // If you see this error, marketing data is incomplete

  const renderRichContent = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    const out: React.ReactNode[] = [];
    let list: string[] = [];
    const flush = () => { if (list.length) { out.push(
      <ul style={{ margin: '0.5rem 0 0.5rem 1.25rem' }}>{list.map((li, i) => <li key={`li-${i}`} style={{ marginBottom: '0.25rem' }}>{li}</li>)}</ul>
    ); list = []; } };
    lines.forEach((raw, idx) => {
      const line = raw.trim();
      if (line.length === 0) { flush(); out.push(<div key={`sp-${idx}`} style={{ height: 6 }} />); return; }
      if (line.startsWith('## ')) { flush(); out.push(<h4 key={`h2-${idx}`} style={{ margin: '0.5rem 0' }}>{line.slice(3)}</h4>); return; }
      if (line.startsWith('### ')) { flush(); out.push(<h5 key={`h3-${idx}`} style={{ margin: '0.5rem 0', opacity: 0.9 }}>{line.slice(4)}</h5>); return; }
      if (/^(-|\*|•|–)\s/.test(line)) { list.push(line.replace(/^(-|\*|•|–)\s/, '')); return; }
      flush(); out.push(<p key={`p-${idx}`} style={{ margin: '0.25rem 0', opacity: 0.9 }}>{line}</p>);
    });
    flush();
    return out;
  };

      // REMOVED: withFallback call that generated fake data
    // If you see this error, marketing data is incomplete
    const filledModule = module;
    
    // Validate that the module has real data
    if (!filledModule.title || !filledModule.description || !filledModule.content) {
      console.error('❌ MISSING MARKETING DATA:', {
        goalTitle: goal.title,
        weekNumber: filledModule.weekNumber,
        moduleId: filledModule.id,
        hasTitle: !!filledModule.title,
        hasDescription: !!filledModule.description,
        hasContent: !!filledModule.content
      });
      throw new Error(`Marketing module ${filledModule.weekNumber} for "${goal.title}" is missing required data. Check database seeding.`);
    }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: '#22202F',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        border: '1px solid rgba(239, 142, 129, 0.3)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.75rem', color: '#FFF1E7', marginBottom: '0.5rem' }}>
              {goal.title}
            </h2>
            <p style={{ margin: 0, color: '#FFF1E7', opacity: 0.7, fontSize: '1rem' }}>
              Week {filledModule.weekNumber} of {goal.duration} • {goal.industry}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFF1E7',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            ×
          </button>
        </div>

        {/* Week Focus */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#EF8E81', marginBottom: '1rem' }}>
            Week {filledModule.weekNumber} Focus
          </h3>
          <p style={{ 
            margin: 0, 
            color: '#FFF1E7', 
            fontSize: '1.1rem',
            lineHeight: '1.6',
            marginBottom: '1.5rem'
          }}>
            {filledModule.description}
          </p>
        </div>

        {/* Detailed Content */}
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ margin: 0, fontSize: '1.25rem', color: '#FFF1E7', marginBottom: '1rem' }}>
            This Week's Content
          </h4>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              margin: 0,
              color: '#FFF1E7',
              fontSize: '0.95rem',
              lineHeight: '1.6',
            }}>
              {renderRichContent(filledModule.content)}
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div>
          <h4 style={{ margin: 0, fontSize: '1.25rem', color: '#FFF1E7', marginBottom: '1rem' }}>
            Action Items ({filledModule.tasks.filter(t => t.isCompleted).length}/{filledModule.tasks.length} completed)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filledModule.tasks.map(task => (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  border: `1px solid ${task.isCompleted ? 'rgba(94, 205, 125, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: `2px solid ${task.isCompleted ? '#5ECD7D' : '#686DCA'}`,
                  background: task.isCompleted ? '#5ECD7D' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  {task.isCompleted && (
                    <span style={{ color: '#22202F', fontSize: '12px', fontWeight: 'bold' }}>✓</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    color: '#FFF1E7', 
                    fontSize: '1rem', 
                    fontWeight: 600,
                    textDecoration: task.isCompleted ? 'line-through' : 'none',
                    opacity: task.isCompleted ? 0.7 : 1,
                    marginBottom: '0.5rem'
                  }}>
                    {task.title}
                  </div>
                  <div style={{ 
                    color: '#FFF1E7', 
                    fontSize: '0.9rem', 
                    opacity: 0.7,
                    marginBottom: '0.5rem',
                    lineHeight: '1.5'
                  }}>
                    {task.shortDescription || task.description}
                  </div>
                  <div style={{ 
                    color: '#EF8E81', 
                    fontSize: '0.85rem',
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
    </div>
  );
}

export default function MarketingTrackWidget() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { activeGoal, isLoading, error, refreshMarketingData } = useMarketing();

  const currentModule = useMemo(() => {
    if (!activeGoal) return null;
    const m = activeGoal.modules.find(module => module.weekNumber === activeGoal.currentWeek);
    if (!m) return null;
    return m;
  }, [activeGoal]);

  const handleWidgetClick = () => {
    if (activeGoal && currentModule) {
      setIsModalOpen(true);
    }
  };



  if (!activeGoal || !currentModule) {
    return (
      <div className="widget" style={{ padding: '1rem', borderRadius: '12px', minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ color: '#FFF1E7', margin: 0, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.5px' }}>
            Marketing Track
          </h2>
        </div>
        <div style={{ 
          color: '#FFF1E7', 
          opacity: 0.7, 
          textAlign: 'center', 
          padding: '2rem',
          background: 'rgba(239, 142, 129, 0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(239, 142, 129, 0.1)'
        }}>
          <h3 style={{ margin: 0, marginBottom: '0.5rem', color: '#EF8E81' }}>No Active Track</h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            Start a marketing track to begin your strategic journey
          </p>
        </div>
      </div>
    );
  }

  const completedTasks = currentModule.tasks?.filter(task => task.isCompleted).length || 0;
  const totalTasks = currentModule.tasks?.length || 0;
  const weekProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <>
      <div 
        className="widget" 
        style={{ 
          padding: '1rem', 
          borderRadius: '12px', 
          minWidth: 0,
          cursor: 'pointer',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}
        onClick={handleWidgetClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ color: '#FFF1E7', margin: 0, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.5px' }}>
            Marketing Track
          </h2>
          <div style={{ 
            color: '#EF8E81', 
            fontSize: '0.875rem',
            opacity: 0.8
          }}>
            Click to view details →
          </div>
        </div>

        {/* Track Info */}
        <div style={{
          background: '#23233a',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid rgba(239, 142, 129, 0.2)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}>
          {/* Track Header */}
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: '1.25rem', 
              color: '#FFF1E7', 
              marginBottom: '0.25rem',
              fontWeight: 600
            }}>
              {activeGoal.title}
            </h3>
            <p style={{ 
              margin: 0, 
              color: '#FFF1E7', 
              opacity: 0.7, 
              fontSize: '0.9rem',
              marginBottom: '0.5rem'
            }}>
              {activeGoal.industry} • Week {activeGoal.currentWeek} of {activeGoal.duration}
            </p>
            
            {/* Overall Progress */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ color: '#FFF1E7', fontSize: '0.875rem', fontWeight: 600 }}>Track Progress</span>
                <span style={{ color: '#EF8E81', fontSize: '0.875rem', fontWeight: 600 }}>{activeGoal.progress}%</span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '8px', 
                background: 'rgba(255, 255, 255, 0.1)', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${activeGoal.progress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #EF8E81 0%, #ffb09e 100%)',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          </div>

          {/* Current Week Focus */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ 
              margin: 0, 
              fontSize: '1.1rem', 
              color: '#EF8E81', 
              marginBottom: '0.5rem',
              fontWeight: 600
            }}>
              Week {currentModule.weekNumber} Focus
            </h4>
            <p style={{ 
              margin: 0, 
              color: '#FFF1E7', 
              fontSize: '0.95rem',
              lineHeight: '1.5',
              marginBottom: '1rem'
            }}>
              {currentModule.description}
            </p>

            {/* Week Progress */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ color: '#FFF1E7', fontSize: '0.875rem', fontWeight: 600 }}>This Week's Progress</span>
                <span style={{ color: '#686DCA', fontSize: '0.875rem', fontWeight: 600 }}>
                  {completedTasks}/{totalTasks} tasks
                </span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '6px', 
                background: 'rgba(255, 255, 255, 0.1)', 
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${weekProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #686DCA 0%, #7a7fd8 100%)',
                  borderRadius: '3px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          </div>

          {/* Current Week Tasks Preview - Three Column Layout */}
          <div>
            <h5 style={{ 
              margin: 0, 
              fontSize: '1rem', 
              color: '#FFF1E7', 
              marginBottom: '0.75rem',
              fontWeight: 600
            }}>
              This Week's Tasks
            </h5>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '0.5rem' 
            }}>
              {currentModule.tasks.slice(0, 3).map(task => (
                <div
                  key={task.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '6px',
                    border: `1px solid ${task.isCompleted ? 'rgba(94, 205, 125, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                    minHeight: '80px'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      border: `2px solid ${task.isCompleted ? '#5ECD7D' : '#686DCA'}`,
                      background: task.isCompleted ? '#5ECD7D' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {task.isCompleted && (
                        <span style={{ color: '#22202F', fontSize: '8px', fontWeight: 'bold' }}>✓</span>
                      )}
                    </div>
                    <div style={{ 
                      color: '#FFF1E7', 
                      fontSize: '0.8rem', 
                      fontWeight: 600,
                      textDecoration: task.isCompleted ? 'line-through' : 'none',
                      opacity: task.isCompleted ? 0.7 : 1,
                      lineHeight: '1.2'
                    }}>
                      {task.title}
                    </div>
                  </div>
                  <div style={{ 
                    color: '#FFF1E7', 
                    fontSize: '0.7rem', 
                    opacity: 0.6,
                    marginTop: 'auto'
                  }}>
                    {task.estimatedTime}
                  </div>
                </div>
              ))}
            </div>
            {currentModule.tasks.length > 3 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '0.5rem',
                color: '#FFF1E7', 
                opacity: 0.6,
                fontSize: '0.85rem'
              }}>
                +{currentModule.tasks.length - 3} more tasks
              </div>
            )}
          </div>

          {/* Pro Tip Preview */}
          {(() => {
            const proTipMatch = currentModule.content.match(/<h[1-6]>(Pro Tip:.*?)<\/h[1-6]>(.*?)(?=<h[1-6]|$)/is);
            if (!proTipMatch) return null;
            
            const proTipTitle = proTipMatch[1];
            const proTipContent = proTipMatch[2].trim();
            
            return (
              <div style={{ 
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(239, 142, 129, 0.08)',
                borderRadius: '8px',
                border: '1px solid rgba(239, 142, 129, 0.2)'
              }}>
                <h5 style={{ 
                  margin: 0, 
                  fontSize: '0.95rem', 
                  color: '#EF8E81', 
                  marginBottom: '0.5rem',
                  fontWeight: 600
                }}>
                  💡 {proTipTitle}
                </h5>
                <p style={{ 
                  margin: 0, 
                  color: '#FFF1E7', 
                  fontSize: '0.85rem',
                  lineHeight: '1.4',
                  opacity: 0.9
                }}>
                  {proTipContent.replace(/<[^>]*>/g, '').substring(0, 120)}
                  {proTipContent.replace(/<[^>]*>/g, '').length > 120 ? '...' : ''}
                </p>
              </div>
            );
          })()}

          {/* Navigation Button */}
          <div style={{ 
            marginTop: '1.5rem',
            textAlign: 'center'
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate('/app/marketing-track');
              }}
              style={{
                background: 'rgba(239, 142, 129, 0.1)',
                border: '1px solid rgba(239, 142, 129, 0.3)',
                color: '#EF8E81',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 142, 129, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(239, 142, 129, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 142, 129, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(239, 142, 129, 0.3)';
              }}
            >
              View Full Marketing Track →
            </button>
          </div>
        </div>
      </div>

      <MarketingTrackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        goal={activeGoal}
        module={currentModule}
      />
    </>
  );
} 