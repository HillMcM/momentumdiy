import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { ENV } from './environment';

dotenv.config();

const supabaseUrl = ENV.supabaseUrl;
const supabaseServiceKey = ENV.supabaseServiceRoleKey;

// Create Supabase client with service role key for backend operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Create Supabase client with anon key for public operations
const supabaseAnonKey = ENV.supabaseAnonKey;

export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);

// Create Supabase client for user authentication (uses service role key to validate user tokens)
export const supabaseAuth = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export default supabase; 