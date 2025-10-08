/**
 * Environment Variable Validation and Configuration
 * 
 * This module validates required environment variables at startup
 * and provides type-safe access to configuration values.
 */

export interface EnvironmentConfig {
  // Server
  port: number;
  nodeEnv: string;
  
  // Supabase
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  
  // Stripe
  stripeSecretKey: string;
  stripePublishableKey: string;
  stripeWebhookSecret: string;
  
  // Email
  resendApiKey: string;
  
  // AI Services
  anthropicApiKey: string;
  
  // CORS
  corsOrigin: string;
  
  // Rate Limiting
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
}

/**
 * Validate and return environment configuration
 * Throws error if required variables are missing
 */
export function validateEnvironment(): EnvironmentConfig {
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'ANTHROPIC_API_KEY',
    'RESEND_API_KEY'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0 && process.env['NODE_ENV'] === 'production') {
    throw new Error(
      `Missing required environment variables in production: ${missing.join(', ')}`
    );
  }
  
  return {
    port: parseInt(process.env['PORT'] || '3001', 10),
    nodeEnv: process.env['NODE_ENV'] || 'development',
    
    supabaseUrl: process.env['SUPABASE_URL'] || 'http://127.0.0.1:54321',
    supabaseAnonKey: process.env['SUPABASE_ANON_KEY'] || '',
    supabaseServiceRoleKey: process.env['SUPABASE_SERVICE_ROLE_KEY'] || '',
    
    stripeSecretKey: process.env['STRIPE_SECRET_KEY'] || '',
    stripePublishableKey: process.env['STRIPE_PUBLISHABLE_KEY'] || '',
    stripeWebhookSecret: process.env['STRIPE_WEBHOOK_SECRET'] || '',
    
    resendApiKey: process.env['RESEND_API_KEY'] || '',
    
    anthropicApiKey: process.env['ANTHROPIC_API_KEY'] || '',
    
    corsOrigin: process.env['CORS_ORIGIN'] || '',
    
    rateLimitWindowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10),
    rateLimitMaxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100', 10)
  };
}

export const ENV = validateEnvironment();

