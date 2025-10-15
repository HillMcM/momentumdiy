/**
 * Admin Configuration
 * 
 * Centralized configuration for admin users and permissions.
 * In production, consider moving this to environment variables or database.
 */

/**
 * List of admin/owner email addresses with elevated privileges
 * These accounts bypass certain restrictions and have admin access
 */
export const ADMIN_EMAILS = (
  process.env['ADMIN_EMAILS'] || 
  'info@hillaryedenmcmullen.com,hillary@momentumdiy.com,admin@momentumdiy.com'
)
  .split(',')
  .map(email => email.trim().toLowerCase())
  .filter(Boolean);

/**
 * Check if an email address has admin privileges
 */
export function isAdmin(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Check if a user ID has admin privileges
 * Requires database lookup - use with Supabase client
 */
export async function isAdminById(
  userId: string,
  supabaseClient: any
): Promise<boolean> {
  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single();
  
  return isAdmin(profile?.email);
}


