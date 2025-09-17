import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/useAuth';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // Auto-disable auth for preview/feature branches
  const isPreviewBranch = window.location.hostname !== 'app.momentumdiy.com' && 
                          window.location.hostname !== 'momentumdiy.com';

  if (loading) {
    return (
      <div style={{ padding: '2rem', color: '#FFF1E7' }}>Loading…</div>
    );
  }

  // Skip authentication for preview branches
  if (isPreviewBranch) {
    return (
      <>
        {/* Preview Mode Banner */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(90deg, #FF6B35, #F7931E)',
          color: 'white',
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: 'bold',
          textAlign: 'center',
          zIndex: 10000,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          🔧 PREVIEW MODE - Authentication Disabled for Feature Branch
        </div>
        <div style={{ paddingTop: '40px' }}>
          <Outlet />
        </div>
      </>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <Outlet />;
}


