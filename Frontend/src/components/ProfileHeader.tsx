import { useMarketing } from '../contexts/MarketingContext';
import { getMomentumBadge } from '../utils/momentumCalculator';
import { useIsMobile } from '../hooks/useMediaQuery';

interface ProfileHeaderProps {
  profile: {
    full_name?: string | null;
    business_name?: string | null;
    location?: string | null;
    brand_logo?: string | null;
    avatar_url?: string | null;
    momentum_score?: number | null;
  };
  onEditClick?: () => void;
}

export default function ProfileHeader({ profile, onEditClick }: ProfileHeaderProps) {
  const { activeGoal } = useMarketing();
  const isMobile = useIsMobile();
  
  const momentumBadge = getMomentumBadge(profile.momentum_score || 0);
  const displayName = profile.business_name || profile.full_name || 'User';
  const avatarSrc = profile.brand_logo || profile.avatar_url;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1B1628 0%, #2A243E 100%)',
      border: '1px solid rgba(239, 142, 129, 0.2)',
      borderRadius: '16px',
      padding: isMobile ? '1rem' : '1.5rem',
      marginBottom: '2rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center', 
        gap: isMobile ? '1rem' : '1.5rem', 
        flexWrap: 'wrap' 
      }}>
        {/* Avatar/Logo */}
        <div style={{
          width: isMobile ? '60px' : '80px',
          height: isMobile ? '60px' : '80px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '3px solid #EF8E81',
          background: avatarSrc ? 'transparent' : 'linear-gradient(135deg, #EF8E81 0%, #D4AF37 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {avatarSrc ? (
            <img 
              src={avatarSrc} 
              alt={displayName} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{ fontSize: '2rem', fontWeight: 700, color: '#FFF1E7' }}>
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Info Section */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h2 style={{ 
              margin: 0, 
              fontSize: '1.5rem', 
              fontWeight: 700, 
              color: '#FFF1E7' 
            }}>
              {displayName}
            </h2>
            
            {profile.location && (
              <span style={{ 
                fontSize: '0.9rem', 
                color: '#FFF1E7', 
                opacity: 0.7,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                📍 {profile.location}
              </span>
            )}
          </div>

          {/* Active Track Info */}
          {activeGoal && (
            <div style={{ 
              marginTop: '0.5rem',
              fontSize: '0.9rem',
              color: '#FFF1E7',
              opacity: 0.9
            }}>
              <span style={{ fontWeight: 600, color: '#EF8E81' }}>
                🎯 {activeGoal.title}
              </span>
              <span style={{ opacity: 0.7, marginLeft: '0.5rem' }}>
                Week {activeGoal.currentWeek}/{activeGoal.duration} • {activeGoal.progress}% complete
              </span>
            </div>
          )}
        </div>

        {/* Momentum Score Badge */}
        <div style={{
          background: `${momentumBadge.color}20`,
          border: `2px solid ${momentumBadge.color}`,
          borderRadius: '12px',
          padding: isMobile ? '0.75rem' : '0.75rem 1.25rem',
          textAlign: 'center',
          minWidth: isMobile ? '100%' : '140px',
          flex: isMobile ? '1' : 'none'
        }}>
          <div style={{ 
            fontSize: '0.75rem', 
            fontWeight: 600,
            color: '#FFF1E7',
            opacity: 0.8,
            marginBottom: '0.25rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Momentum Score
          </div>
          <div style={{ 
            fontSize: '2rem', 
            fontWeight: 700,
            color: momentumBadge.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <span>{momentumBadge.emoji}</span>
            <span>{momentumBadge.score}</span>
          </div>
        </div>

        {/* Edit Button */}
        {onEditClick && (
          <button
            onClick={onEditClick}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(239, 142, 129, 0.1)',
              color: '#EF8E81',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              width: isMobile ? '100%' : 'auto',
              minHeight: '44px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#EF8E81';
              e.currentTarget.style.color = '#1B1628';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(239, 142, 129, 0.1)';
              e.currentTarget.style.color = '#EF8E81';
            }}
          >
            ✏️ Edit Profile
          </button>
        )}
      </div>

      {/* Momentum Message */}
      {(profile.momentum_score || 0) > 0 && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem 1rem',
          background: 'rgba(239, 142, 129, 0.05)',
          borderRadius: '8px',
          borderLeft: `4px solid ${momentumBadge.color}`,
          fontSize: '0.85rem',
          color: '#FFF1E7',
          opacity: 0.9
        }}>
          {momentumBadge.message}
        </div>
      )}
    </div>
  );
}

