import { Link, useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path: string;
}

const routeLabels: Record<string, string> = {
  '/app': 'Dashboard',
  '/app/profile': 'Profile',
  '/app/marketing-track': 'Marketing Track',
  '/app/profile-manager': 'Social Profile Manager',
  '/app/social-strategy': 'Social Strategy Hub',
  '/app/assets': 'Asset Library',
  '/app/task-tracker': 'Task Tracker',
  '/app/ai-marketing-assistant': 'AI Marketing Assistant',
  '/app/social-generator': 'Social Media Generator',
  '/app/affiliate/program': 'Affiliate Program',
  '/app/manage-subscription': 'Subscription Management',
  '/app/admin/affiliate': 'Affiliate Admin',
  '/app/admin/marketing-tracks': 'Marketing Tracks Admin',
};

export default function Breadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  // Don't show breadcrumbs on dashboard or if path is too short
  if (pathSegments.length <= 1 || location.pathname === '/app') {
    return null;
  }

  const items: BreadcrumbItem[] = [
    { label: 'Dashboard', path: '/app' }
  ];

  // Build breadcrumb items from path segments
  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    // Skip 'app' segment as we already have Dashboard
    if (segment === 'app') return;
    
    currentPath += `/${segment}`;
    
    // Get label from routeLabels or format segment name
    const label = routeLabels[currentPath] || 
      segment.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    
    items.push({ label, path: currentPath });
  });

  return (
    <nav 
      className="breadcrumbs" 
      aria-label="Breadcrumb"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 0',
        fontSize: '0.875rem',
        color: '#FFF1E7',
        opacity: 0.8,
        marginBottom: '1rem'
      }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <span key={item.path} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {index > 0 && (
              <span style={{ color: '#FFF1E7', opacity: 0.4 }}>›</span>
            )}
            {isLast ? (
              <span style={{ color: '#EF8E81', fontWeight: 600 }}>
                {item.label}
              </span>
            ) : (
              <Link
                to={item.path}
                style={{
                  color: '#FFF1E7',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                  opacity: 0.7
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.color = '#EF8E81';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.7';
                  e.currentTarget.style.color = '#FFF1E7';
                }}
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

