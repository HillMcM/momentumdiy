"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSentry = initSentry;
exports.getSentryErrorHandler = getSentryErrorHandler;
function initSentry(app) {
    const dsn = process.env['SENTRY_DSN'];
    if (!dsn)
        return { enabled: false };
    try {
        const Sentry = require('@sentry/node');
        require('@sentry/tracing');
        Sentry.init({
            dsn,
            environment: process.env['NODE_ENV'] || 'development',
            tracesSampleRate: Number(process.env['SENTRY_TRACES_SAMPLE_RATE'] || '0.1'),
        });
        app.use(Sentry.Handlers.requestHandler());
        app.use(Sentry.Handlers.tracingHandler());
        return { enabled: true };
    }
    catch (err) {
        console.warn('Sentry not initialized (module missing?):', err?.message || err);
        return { enabled: false };
    }
}
function getSentryErrorHandler() {
    try {
        const Sentry = require('@sentry/node');
        return Sentry.Handlers.errorHandler();
    }
    catch {
        return (err, _req, _res, next) => next(err);
    }
}
//# sourceMappingURL=sentry.js.map