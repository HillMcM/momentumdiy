import rateLimit from 'express-rate-limit';

export function routeRateLimit(maxPerMinute: number) {
  return rateLimit({
    windowMs: 60_000,
    max: maxPerMinute,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Rate limit exceeded' },
  });
}


