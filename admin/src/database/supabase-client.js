/**
 * Supabase Client Configuration
 * 
 * Centralized Supabase client for all database operations
 */

const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL?.replace('@', ''); // Clean URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  logger.error('Supabase credentials not configured');
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in environment variables');
}

// Use service key for backend operations (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test connection
async function testConnection() {
  try {
    const { data, error } = await supabase.from('agent_executions').select('count', { count: 'exact', head: true });
    if (error) {
      logger.warn('Supabase connection test: tables may not exist yet', error.message);
    } else {
      logger.info('✅ Supabase connected successfully');
    }
  } catch (error) {
    logger.error('Supabase connection test failed:', error);
  }
}

// Test on initialization
testConnection();

module.exports = supabase;

