import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useIsMobile } from '../hooks/useMediaQuery';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    path: '/app',
    label: 'Dashboard',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
    )
  },
  {
    path: '/app/marketing-track',
    label: 'Track',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
      </svg>
    )
  },
  {
    path: '/app/task-tracker',
    label: 'Tasks',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11l3 3L22 4"></path>
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
      </svg>
    )
  },
  {
    path: '/app/profile',
    label: 'Profile',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    )
  }
];

export default function MobileBottomNav() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Don't show on auth pages or landing page
  if (!isMobile || !location.pathname.startsWith('/app')) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === '/app') {
      return location.pathname === '/app';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#23233a',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0.5rem 0',
        zIndex: 1000,
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' // Safe area for iOS
      }}
      aria-label="Bottom navigation"
    >
      {navItems.map((item) => {
        const active = isActive(item.path);
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={(e) => {
              // If already on the path, prevent navigation to allow scrolling to top
              if (location.pathname === item.path) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem 1rem',
              minWidth: '44px',
              minHeight: '44px',
              textDecoration: 'none',
              color: active ? '#EF8E81' : 'rgba(255, 255, 255, 0.6)',
              transition: 'color 0.2s',
              borderRadius: '8px',
              WebkitTapHighlightColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
              }
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.25rem',
                opacity: active ? 1 : 0.8,
                transform: active ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 0.2s, opacity 0.2s'
              }}
            >
              {item.icon}
            </div>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: active ? '600' : '400',
                textAlign: 'center'
              }}
            >
              {item.label}
            </span>
            {active && (
              <div
                style={{
                  position: 'absolute',
                  top: '0',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '24px',
                  height: '2px',
                  background: '#EF8E81',
                  borderRadius: '0 0 2px 2px'
                }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

