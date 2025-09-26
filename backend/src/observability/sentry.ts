import type express from 'express';

/**
 * Initializes Sentry if SENTRY_DSN is provided. Uses runtime require so the app
 * can run even if @sentry/node is not installed. This keeps deployment simple
 * until Sentry is enabled.
 */
export function initSentry(app: express.Express): { enabled: boolean } {
  const dsn = process.env['SENTRY_DSN'];
  if (!dsn) return { enabled: false };

  try {
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Sentry = require('@sentry/node');
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('@sentry/tracing');

    Sentry.init({
      dsn,
      environment: process.env['NODE_ENV'] || 'development',
      tracesSampleRate: Number(process.env['SENTRY_TRACES_SAMPLE_RATE'] || '0.1'),
    });

    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());

    // Attach error handler later in the chain (exported below)
    return { enabled: true };
  } catch (_err: any) {
    console.warn('Sentry not initialized (module missing?):', _err?.message || _err);
    return { enabled: false };
  }
}

/**
 * Returns Sentry error handler middleware if Sentry is available; otherwise a
 * no-op handler that simply forwards to the next error middleware.
 */
export function getSentryErrorHandler(): express.ErrorRequestHandler {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Sentry = require('@sentry/node');
    return Sentry.Handlers.errorHandler();
  } catch {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return (err, _req, _res, next) => next(err);
  }
}


