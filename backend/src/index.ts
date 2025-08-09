// IMPORTANT: initialize Sentry before anything else
import './instrument';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { getSentryErrorHandler } from './observability/sentry';
import dotenv from 'dotenv';

// Import routes
import taskRoutes from './routes/tasks';
import projectRoutes from './routes/projects';
import marketingRoutes from './routes/marketing';
import calendarRoutes from './routes/calendar';
import assetRoutes from './routes/assets';
import aiRoutes from './routes/ai';
import profileRoutes from './routes/profile';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 3001;

// Sentry request/tracing handlers are applied in instrument.ts via Sentry.init.

// Ultra-permissive CORS for local development (placed FIRST)
if ((process.env['NODE_ENV'] || 'development') !== 'production') {
  app.use((req, res, next) => {
    const origin = (req.headers.origin as string) || '*';
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return; // ensure explicit return for TS
    }
    next();
    return; // ensure explicit return for TS
  });
}

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

    // If configured, allow explicit origins OR dev localhost
    if (configuredOrigins.length > 0) {
      const allowed = configuredOrigins.includes(origin) || devOk;
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

// Dev fallback CORS headers (ensure ACAO is present for local preview servers)
if ((process.env['NODE_ENV'] || 'development') !== 'production') {
  app.use((req, res, next) => {
    const origin = req.headers.origin as string | undefined;
    if (origin && /^(http:\/\/(localhost|127\.0\.0\.1):\d+)$/.test(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Vary', 'Origin');
    } else {
      res.header('Access-Control-Allow-Origin', '*');
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return; // ensure explicit return for TS
    }
    next();
    return; // ensure explicit return for TS
  });
}

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

app.use(limiter);

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

// API routes
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/profile', profileRoutes);

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
app.use(getSentryErrorHandler());
app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Global error handler:', error);
  
  res.status(500).json({
    success: false,
    error: process.env['NODE_ENV'] === 'development' ? error.message : 'Internal server error',
    ...(process.env['NODE_ENV'] === 'development' && { stack: error.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env['NODE_ENV'] || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/`);
  
  if (process.env['NODE_ENV'] === 'development') {
    console.log(`🎯 Supabase URL: ${process.env['SUPABASE_URL'] || 'http://127.0.0.1:54321'}`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app; 