import { Router, Request, Response } from 'express';
import { sendWelcomeEmail } from '../services/emailService';
import { BillingService } from '../services/billingService';

const router = Router();

// Simple in-memory store for dev; replace with Supabase later if needed
let baselineMetrics: any = null;
let contentPillars: string[] = [];

router.get('/baseline-metrics', (_req: Request, res: Response) => {
  return res.json({ success: true, data: baselineMetrics });
});

router.post('/baseline-metrics', (req: Request, res: Response) => {
  const body = req.body || {};
  if (body && typeof body === 'object' && body.platforms && typeof body.platforms === 'object') {
    const out: any = { platforms: {}, recordedAt: new Date().toISOString() };
    const platforms = body.platforms || {};
    for (const [key, val] of Object.entries(platforms as Record<string, any>)) {
      const v = val || {};
      (out.platforms as any)[key] = {
        followers: Number((v as any).followers || 0),
        avgLikes: Number((v as any).avgLikes || 0),
        avgComments: Number((v as any).avgComments || 0),
        avgStoryViews: Number((v as any).avgStoryViews || 0)
      };
    }
    baselineMetrics = out;
    return res.json({ success: true, data: baselineMetrics, message: 'Baseline metrics saved' });
  }

  // Backward-compatible format
  const { platform = 'instagram', followers, avgLikes, avgComments, avgStoryViews } = body as any;
  if (
    followers === undefined || avgLikes === undefined || avgComments === undefined || avgStoryViews === undefined
  ) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  baselineMetrics = {
    platform,
    followers: Number(followers),
    avgLikes: Number(avgLikes),
    avgComments: Number(avgComments),
    avgStoryViews: Number(avgStoryViews),
    recordedAt: new Date().toISOString(),
  };
  return res.json({ success: true, data: baselineMetrics, message: 'Baseline metrics saved' });
});

router.get('/content-pillars', (_req: Request, res: Response) => {
  return res.json({ success: true, data: contentPillars });
});

router.post('/content-pillars', (req: Request, res: Response) => {
  const { pillars } = (req.body || {}) as { pillars?: string[] };
  if (!Array.isArray(pillars) || pillars.length === 0) {
    return res.status(400).json({ success: false, error: 'pillars must be a non-empty array of strings' });
  }
  contentPillars = pillars.map(p => String(p)).slice(0, 8);
  return res.json({ success: true, data: contentPillars, message: 'Content pillars saved' });
});

export default router;

// Dev-only: email test endpoint (requires POSTMARK_* envs)
router.post('/email/test', async (req: Request, res: Response) => {
  const { to } = (req.body || {}) as { to?: string };
  if (!to) return res.status(400).json({ success: false, error: 'to is required' });
  const result = await sendWelcomeEmail(to);
  return res.status(result.success ? 200 : 500).json(result);
});

// Stripe checkout session (scaffold). Requires STRIPE_SECRET_KEY & a Price ID.
router.post('/billing/checkout', async (req: Request, res: Response) => {
  try {
    const { priceId, successUrl, cancelUrl, email } = (req.body || {}) as any;
    if (!priceId || !successUrl || !cancelUrl) {
      return res.status(400).json({ success: false, error: 'priceId, successUrl, cancelUrl are required' });
    }
    const session = await BillingService.createCheckoutSession({
      priceId,
      successUrl,
      cancelUrl,
      customerEmail: email,
    });
    return res.json({ success: true, data: { id: session.id, url: session.url } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Failed to create session' });
  }
});


