import { useAuth } from '../contexts/useAuth';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

interface AdminGuardProps {
  children: React.ReactNode;
}

// List of admin email addresses - add your email here
const ADMIN_EMAILS = [
  'info@hillaryedenmcmullen.com', // Admin email
];

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading } = useAuth();

  // Wait for auth to finish loading before making decision
  // This prevents hook order issues with lazy-loaded children
  if (loading) {
    return (
      <LoadingSpinner
        fullScreen
        message="Loading..."
        size="lg"
      />
    );
  }

  // Check if user is authenticated and is an admin
  const isAdmin = user && user.email && ADMIN_EMAILS.includes(user.email.toLowerCase());

  if (!isAdmin) {
    // Redirect non-admin users to dashboard
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}
