import { useAuth } from '../contexts/useAuth';
import { Navigate } from 'react-router-dom';

interface AdminGuardProps {
  children: React.ReactNode;
}

// List of admin email addresses - add your email here
const ADMIN_EMAILS = [
  'info@hillaryedenmcmullen.com', // Admin email
];

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user } = useAuth();

  // Check if user is authenticated and is an admin
  const isAdmin = user && user.email && ADMIN_EMAILS.includes(user.email.toLowerCase());

  if (!isAdmin) {
    // Redirect non-admin users to dashboard
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}
