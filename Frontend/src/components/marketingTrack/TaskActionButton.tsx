import * as React from 'react';
import { useNavigate } from 'react-router-dom';

interface TaskActionButtonProps {
  actionLink: {
    url: string;
    label: string;
    tab?: string;
  };
  variant?: 'primary' | 'secondary';
}

export default function TaskActionButton({ actionLink, variant = 'primary' }: TaskActionButtonProps) {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent task modal from opening when clicking the button
    
    // Navigate to URL with optional tab parameter
    if (actionLink.tab) {
      navigate(`${actionLink.url}?tab=${actionLink.tab}`);
    } else {
      navigate(actionLink.url);
    }
  };

  const styles = variant === 'primary'
    ? {
        background: '#EF8E81',
        color: '#FFF1E7',
        border: '2px solid #EF8E81',
        hoverBg: '#E67A6E'
      }
    : {
        background: 'transparent',
        color: '#EF8E81',
        border: '2px solid #EF8E81',
        hoverBg: 'rgba(239, 142, 129, 0.1)'
      };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all hover:scale-105"
      style={{
        background: styles.background,
        color: styles.color,
        border: styles.border
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = styles.hoverBg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = styles.background;
      }}
      title={`Go to ${actionLink.label}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
      {actionLink.label}
    </button>
  );
}

