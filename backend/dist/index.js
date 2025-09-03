"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./instrument");
const Sentry = __importStar(require("@sentry/node"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const projects_1 = __importDefault(require("./routes/projects"));
const marketing_1 = __importDefault(require("./routes/marketing"));
const calendar_1 = __importDefault(require("./routes/calendar"));
const assets_1 = __importDefault(require("./routes/assets"));
const ai_1 = __importDefault(require("./routes/ai"));
const profile_1 = __importDefault(require("./routes/profile"));
const stripe_1 = __importDefault(require("./routes/stripe"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env['PORT'] || 3001;
app.set('trust proxy', 1);
if ((process.env['NODE_ENV'] || 'development') !== 'production') {
    app.use((req, res, next) => {
        const origin = req.headers.origin || '*';
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Vary', 'Origin');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
        if (req.method === 'OPTIONS') {
            res.sendStatus(204);
            return;
        }
        next();
        return;
    });
}
const configuredOrigins = (process.env['CORS_ORIGIN'] || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        const devOk = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
        if (configuredOrigins.length > 0) {
            const allowed = configuredOrigins.includes(origin) || devOk;
            return callback(allowed ? null : new Error('Not allowed by CORS'), allowed);
        }
        return callback(devOk ? null : new Error('Not allowed by CORS'), devOk);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use((0, cors_1.default)(corsOptions));
if ((process.env['NODE_ENV'] || 'development') !== 'production') {
    app.use((req, res, next) => {
        const origin = req.headers.origin;
        if (origin && /^(http:\/\/(localhost|127\.0\.0\.1):\d+)$/.test(origin)) {
            res.header('Access-Control-Allow-Origin', origin);
            res.header('Vary', 'Origin');
        }
        else {
            res.header('Access-Control-Allow-Origin', '*');
        }
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
        if (req.method === 'OPTIONS') {
            res.sendStatus(200);
            return;
        }
        next();
        return;
    });
}
app.options('*', (0, cors_1.default)(corsOptions));
app.use((0, helmet_1.default)());
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'),
    max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100'),
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
app.use((0, compression_1.default)());
if (process.env['NODE_ENV'] === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined'));
}
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.get('/health', (_req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env['NODE_ENV'] || 'development'
    });
});
app.use('/api/tasks', tasks_1.default);
app.use('/api/projects', projects_1.default);
app.use('/api/marketing', marketing_1.default);
app.use('/api/calendar', calendar_1.default);
app.use('/api/assets', assets_1.default);
app.use('/api/ai', ai_1.default);
app.use('/api/profile', profile_1.default);
app.use('/api/stripe', stripe_1.default);
app.get('/debug/sentry-test', () => {
    throw new Error('Sentry test error');
});
app.get('/debug-sentry', (_req, _res) => {
    throw new Error('My first Sentry error!');
});
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
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.originalUrl
    });
});
Sentry.setupExpressErrorHandler(app);
app.use((error, _req, res, _next) => {
    console.error('Global error handler:', error);
    res.status(500).json({
        success: false,
        error: process.env['NODE_ENV'] === 'development' ? error.message : 'Internal server error',
        ...(process.env['NODE_ENV'] === 'development' && { stack: error.stack })
    });
});
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env['NODE_ENV'] || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/`);
    if (process.env['NODE_ENV'] === 'development') {
        console.log(`🎯 Supabase URL: ${process.env['SUPABASE_URL'] || 'http://127.0.0.1:54321'}`);
    }
});
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});
exports.default = app;
//# sourceMappingURL=index.js.map