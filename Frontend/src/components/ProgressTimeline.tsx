import type { MarketingGoal } from '../types';

interface ProgressTimelineProps {
  activeGoal: MarketingGoal;
  onWeekClick?: (weekNumber: number) => void;
}

export default function ProgressTimeline({ activeGoal, onWeekClick }: ProgressTimelineProps) {
  const totalWeeks = activeGoal.duration || 12;
  const currentWeek = activeGoal.currentWeek || 1;

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h4 style={{ 
        fontSize: '1rem', 
        fontWeight: 600, 
        color: '#FFF1E7', 
        marginBottom: '1rem' 
      }}>
        12-Week Journey Progress
      </h4>

      {/* Timeline Container */}
      <div style={{ 
        position: 'relative',
        padding: '1rem 0'
      }}>
        {/* Progress Line */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '0',
          right: '0',
          height: '4px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '2px',
          transform: 'translateY(-50%)'
        }}>
          {/* Completed Progress */}
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            background: 'linear-gradient(90deg, #EF8E81 0%, #D4AF37 100%)',
            borderRadius: '2px',
            width: `${(currentWeek / totalWeeks) * 100}%`,
            transition: 'width 0.5s ease'
          }} />
        </div>

        {/* Week Markers */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${totalWeeks}, 1fr)`,
          gap: '0.25rem',
          position: 'relative',
          zIndex: 1
        }}>
          {Array.from({ length: totalWeeks }, (_, i) => {
            const weekNum = i + 1;
            const isCompleted = weekNum < currentWeek;
            const isCurrent = weekNum === currentWeek;
            const isFuture = weekNum > currentWeek;

            return (
              <div
                key={weekNum}
                onClick={() => !isFuture && onWeekClick?.(weekNum)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: !isFuture ? 'pointer' : 'default'
                }}
              >
                {/* Week Circle */}
                <div style={{
                  width: isCurrent ? '40px' : '32px',
                  height: isCurrent ? '40px' : '32px',
                  borderRadius: '50%',
                  background: isCompleted 
                    ? '#10B981' 
                    : isCurrent 
                      ? '#EF8E81' 
                      : 'rgba(255, 255, 255, 0.1)',
                  border: isCurrent ? '3px solid #EF8E81' : 'none',
                  boxShadow: isCurrent ? '0 0 20px rgba(239, 142, 129, 0.4)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: isCurrent ? '1rem' : '0.85rem',
                  color: isCompleted || isCurrent ? '#FFF' : 'rgba(255, 255, 255, 0.4)',
                  transition: 'all 0.3s',
                  position: 'relative'
                }}
                onMouseOver={(e) => {
                  if (!isFuture) {
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                >
                  {isCompleted ? '✓' : weekNum}
                  
                  {/* Pulse animation for current week */}
                  {isCurrent && (
                    <div style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      border: '2px solid #EF8E81',
                      animation: 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }} />
                  )}
                </div>

                {/* Week Label */}
                <div style={{
                  fontSize: '0.65rem',
                  fontWeight: isCurrent ? 600 : 400,
                  color: isCurrent ? '#EF8E81' : 'rgba(255, 255, 255, 0.5)',
                  textAlign: 'center',
                  whiteSpace: 'nowrap'
                }}>
                  {isCurrent && '▼ '}
                  Week {weekNum}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1.5rem',
        marginTop: '1.5rem',
        fontSize: '0.75rem',
        color: 'rgba(255, 255, 255, 0.6)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ 
            width: '16px', 
            height: '16px', 
            borderRadius: '50%', 
            background: '#10B981' 
          }} />
          <span>Completed</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ 
            width: '16px', 
            height: '16px', 
            borderRadius: '50%', 
            background: '#EF8E81',
            border: '2px solid #EF8E81'
          }} />
          <span>Current</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ 
            width: '16px', 
            height: '16px', 
            borderRadius: '50%', 
            background: 'rgba(255, 255, 255, 0.1)' 
          }} />
          <span>Upcoming</span>
        </div>
      </div>

      {/* Add CSS animation for pulse effect */}
      <style>{`
        @keyframes pulse-ring {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.3);
          }
        }
      `}</style>
    </div>
  );
}

