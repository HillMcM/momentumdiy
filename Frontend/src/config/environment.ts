// Environment configuration for the frontend
export const API_URL = import.meta.env.VITE_API_URL || 'https://momentumdiy-backend.onrender.com';
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

// Affiliate program configuration
export const AFFILIATE_COOKIE_DOMAIN = import.meta.env.VITE_AFFILIATE_COOKIE_DOMAIN || '.momentumdiy.com';
export const AFFILIATE_MIN_PAYOUT = 10;
export const AFFILIATE_COMMISSION_RATE = 0.20;
export const AFFILIATE_COMMISSION_MONTHS = 12;
