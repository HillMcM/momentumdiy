import { useAuth } from '../contexts/useAuth';

// List of admin email addresses - should match AdminGuard
const ADMIN_EMAILS = [
  'info@hillaryedenmcmullen.com',
];

/**
 * Hook to check if the current user is an admin.
 * 
 * Usage:
 * ```tsx
 * const { isAdmin } = useIsAdmin();
 * {isAdmin && <AdminButton />}
 * ```
 */
export function useIsAdmin() {
  const { user } = useAuth();
  const isAdmin = user && user.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
  
  return { isAdmin: !!isAdmin };
}

