const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const AgentManager = require('./agents/agent-manager');
const Scheduler = require('./utils/scheduler');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize agent manager and scheduler
const agentManager = new AgentManager();
const scheduler = new Scheduler(agentManager);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
      styleSrcElem: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "http://localhost:*", "https://localhost:*"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));
app.use(cors());

// Rate limiting - more permissive for dashboard, stricter for API
const dashboardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 minutes for dashboard
  message: {
    error: 'Too many requests to dashboard',
    message: 'Please wait a moment before trying again'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes for API
  message: {
    error: 'Too many API requests',
    message: 'Please wait a moment before trying again'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting
app.use('/dashboard', dashboardLimiter);
app.use('/api', apiLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Basic health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'MomentumDIY AI Agent System'
  });
});

// Serve static dashboard with cache-busting headers
app.use('/dashboard', (req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
}, express.static('src/dashboard'));

// Serve favicon with proper handling
app.get('/favicon.ico', (req, res) => {
  res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
  res.status(204).end(); // No content response for favicon
});

// Make agent manager available to routes
app.locals.agentManager = agentManager;
app.locals.scheduler = scheduler;

// API routes
app.use('/api/agents', require('./api/agents'));
app.use('/api/approval', require('./api/approval'));
app.use('/api/dashboard', require('./api/dashboard'));
app.use('/api/analytics', require('./api/analytics'));
app.use('/api/content', require('./api/content'));
app.use('/auth', require('./api/auth'));

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.status === 429) {
    return res.status(429).json({
      error: 'Too many requests',
      message: 'Please wait a moment before trying again',
      retryAfter: err.headers?.['retry-after'] || 60
    });
  }
  
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MomentumDIY AI Agent System running on port ${PORT}`);
  console.log(`📊 Dashboard available at http://localhost:${PORT}/dashboard`);
  console.log(`🔗 API available at http://localhost:${PORT}/api`);
  
  // Start the scheduler
  scheduler.start();
  console.log(`⏰ Scheduler started - Weekly content marketing workflow active`);
  console.log(`   📊 Monday 8 AM: Market Research`);
  console.log(`   ✍️ Tuesday 8 AM: Blog Creation`);
  console.log(`   📱 Wednesday 8 AM: Social Content`);
  console.log(`   📤 Thu-Fri 2 PM: Social Posting`);
});

module.exports = app; 