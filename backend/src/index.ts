// IMPORTANT: initialize Sentry before anything else
import './instrument';
import * as Sentry from '@sentry/node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
// Removed custom wrapper; use Sentry's express helpers directly
import dotenv from 'dotenv';

// Import routes
import taskRoutes from './routes/tasks';
import projectRoutes from './routes/projects';
import marketingRoutes from './routes/marketing';
import calendarRoutes from './routes/calendar';
import assetRoutes from './routes/assets';
import aiRoutes from './routes/ai';
import profileRoutes from './routes/profile';
import profileEnhancementsRoutes from './routes/profile-enhancements';
import stripeRoutes from './routes/stripe';
import feedbackRoutes from './routes/feedback';
import notificationRoutes from './routes/notifications';
import automatedNotificationsRoutes from './routes/automatedNotifications';
import emailPreferencesRoutes from './routes/emailPreferences';
import affiliateRoutes from './routes/affiliate';
import mainRoutes from './routes/index';
import tracksAdminRoutes from './routes/marketingTracks';
import testRoutes from './routes/testRoutes';
import socialStrategyRoutes from './routes/socialStrategyRoutes';
import { logger } from './utils/logger';


// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 3001;

// Sentry init is in instrument.ts. We'll attach the error handler below.

// When running behind a proxy (Render, Vercel, etc.), trust X-Forwarded-* headers
// so that rate limiting and logging use the real client IP rather than the proxy IP.
app.set('trust proxy', 1);

// CORS configuration
const configuredOrigins = (process.env['CORS_ORIGIN'] || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests
    if (!origin) return callback(null, true);

    // In development, allow localhost/127.0.0.1 on any port
    const devOk = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
    
    // Allow Vercel feature branch URLs
    const vercelFeatureOk = /^https:\/\/momentumdiy-git-feature-.*-hillarys-projects-.*\.vercel\.app$/.test(origin);

    // If configured, allow explicit origins OR dev localhost OR Vercel feature branches
    if (configuredOrigins.length > 0) {
      // Check if origin matches any configured origin (with or without www)
      const originWithoutWww = origin.replace(/^https?:\/\/www\./, 'https://');
      const originWithWww = origin.replace(/^https:\/\/([^/]+)/, 'https://www.$1');
      
      const isConfiguredOrigin = configuredOrigins.some(configuredOrigin => {
        const configuredWithoutWww = configuredOrigin.replace(/^https?:\/\/www\./, 'https://');
        const configuredWithWww = configuredOrigin.replace(/^https:\/\/([^/]+)/, 'https://www.$1');
        
        // Match if either origin matches any variant of configured origin
        return origin === configuredOrigin || 
               originWithoutWww === configuredWithoutWww ||
               originWithWww === configuredWithWww ||
               origin === configuredWithoutWww ||
               origin === configuredWithWww;
      });
      
      const allowed = isConfiguredOrigin || devOk || vercelFeatureOk;
      return callback(allowed ? null : new Error('Not allowed by CORS'), allowed);
    }

    // No explicit config: allow dev localhost
    return callback(devOk ? null : new Error('Not allowed by CORS'), devOk);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Handle CORS preflight for all routes
app.options('*', cors(corsOptions));

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'), // 15 minutes
  max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100'), // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes except admin routes
app.use((req, res, next) => {
  // Skip rate limiting for admin routes and health checks
  if (req.path.startsWith('/api/admin/') || req.path === '/health' || req.path === '/') {
    return next();
  }
  return limiter(req, res, next);
});

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env['NODE_ENV'] === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env['NODE_ENV'] || 'development'
  });
});

// API routes - main routes first to avoid conflicts
app.use('/api', mainRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/admin/tracks', tracksAdminRoutes);
app.use('/api/admin/modules', tracksAdminRoutes);
app.use('/api/test', testRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/profile', profileEnhancementsRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/affiliate', affiliateRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/notifications/automated', automatedNotificationsRoutes);
app.use('/api/email-preferences', emailPreferencesRoutes);
app.use('/api/social-strategy', socialStrategyRoutes);


// Sentry verification route: intentionally throws to test error capture
app.get('/debug/sentry-test', () => {
  throw new Error('Sentry test error');
});

// Alternate Sentry debug route (matches Sentry docs example)
app.get('/debug-sentry', (_req, _res) => {
  throw new Error('My first Sentry error!');
});

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Client Portal Backend API',
    version: '1.0.0',
    endpoints: {
      tasks: '/api/tasks',
      projects: '/api/projects',
      marketing: '/api/marketing',
      admin: '/api/admin/tracks',
      calendar: '/api/calendar',
      profile: '/api/profile',
      health: '/health'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Global error handler
// Sentry error handler must be registered after routes and before other error middleware
Sentry.setupExpressErrorHandler(app);
app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Global error handler', error);
  
  res.status(500).json({
    success: false,
    error: process.env['NODE_ENV'] === 'development' ? error.message : 'Internal server error',
    ...(process.env['NODE_ENV'] === 'development' && { stack: error.stack })
  });
});

// Start server
app.listen(PORT, () => {
  logger.info('Server started', {
    port: PORT,
    environment: process.env['NODE_ENV'] || 'development',
    healthCheck: `http://localhost:${PORT}/health`
  });
  
  if (process.env['NODE_ENV'] === 'development') {
    logger.debug('Development mode', { supabaseUrl: process.env['SUPABASE_URL'] || 'http://127.0.0.1:54321' });
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app; 