import express from 'express';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { AffiliateService } from '../services/affiliateService';
import { StripeConnectService } from '../services/stripeConnectService';

const router = express.Router();

// Rate limiting for affiliate routes
const routeRateLimit = (maxRequests: number) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Simple rate limiting - in production, use Redis or similar
    next();
  };
};

// Auth middleware
const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - No valid token provided',
      });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Invalid token',
      });
    }

    // Attach user to request
    (req as any).user = user;
    next();
  } catch (error) {
    logger.error('Auth middleware error', error);
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
    });
  }
};

// Admin middleware
const requireAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const ADMIN_EMAILS = ['info@hillaryedenmcmullen.com'];
    if (!user.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden - Admin access required',
      });
    }

    next();
  } catch (error) {
    logger.error('Admin middleware error', error);
    return res.status(403).json({
      success: false,
      error: 'Forbidden',
    });
  }
};

// =====================================================
// USER ENDPOINTS
// =====================================================

/**
 * Check if user is eligible to become an affiliate
 */
router.get('/eligibility', requireAuth, routeRateLimit(10), async (req, res) => {
  try {
    const user = (req as any).user;
    const result = await AffiliateService.checkEligibility(user.id);

    return res.json(result);
  } catch (error) {
    logger.error('Error checking affiliate eligibility', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * Opt into the affiliate program
 */
router.post('/opt-in', requireAuth, routeRateLimit(5), async (req, res) => {
  try {
    const user = (req as any).user;
    const result = await AffiliateService.createAffiliateAccount(user.id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    logger.error('Error creating affiliate account', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * Get affiliate dashboard data
 */
router.get('/dashboard', requireAuth, routeRateLimit(20), async (req, res) => {
  try {
    const user = (req as any).user;
    const result = await AffiliateService.getAffiliateDashboardData(user.id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.json(result);
  } catch (error) {
    logger.error('Error getting affiliate dashboard', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * Get Stripe Connect onboarding link
 */
router.post('/connect/onboard', requireAuth, routeRateLimit(5), async (req, res) => {
  try {
    const user = (req as any).user;
    const { returnUrl, refreshUrl } = req.body;

    if (!returnUrl || !refreshUrl) {
      return res.status(400).json({
        success: false,
        error: 'returnUrl and refreshUrl are required',
      });
    }

    const result = await StripeConnectService.createOnboardingLink(
      user.id,
      user.email || '',
      returnUrl,
      refreshUrl
    );

    return res.json(result);
  } catch (error) {
    logger.error('Error creating Connect onboarding link', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * Check Connect account status
 */
router.get('/connect/status', requireAuth, routeRateLimit(20), async (req, res) => {
  try {
    const user = (req as any).user;
    const result = await StripeConnectService.getAccountStatus(user.id);

    return res.json(result);
  } catch (error) {
    logger.error('Error checking Connect status', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * Request payout
 */
router.post('/payout/request', requireAuth, routeRateLimit(5), async (req, res) => {
  try {
    const user = (req as any).user;
    const result = await AffiliateService.requestPayout(user.id);

    return res.json(result);
  } catch (error) {
    logger.error('Error requesting payout', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// =====================================================
// PUBLIC ENDPOINTS
// =====================================================

/**
 * Track referral click and set cookie
 */
router.get('/track/:code', routeRateLimit(50), async (req, res) => {
  try {
    const { code } = req.params;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Referral code is required',
      });
    }

    const metadata = {
      ipAddress: req.ip || req.headers['x-forwarded-for'] as string,
      userAgent: req.headers['user-agent'] as string | undefined,
    };

    const result = await AffiliateService.trackReferralClick(code, metadata);

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Set cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
    };

    res.cookie('momentum_ref', code, cookieOptions);

    // Redirect to main site
    const redirectUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(redirectUrl);
  } catch (error) {
    logger.error('Error tracking referral click', error);
    const redirectUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(redirectUrl);
  }
});

/**
 * Validate referral code
 */
router.post('/validate-code', routeRateLimit(20), async (req, res) => {
  try {
    const { referralCode } = req.body;

    if (!referralCode) {
      return res.status(400).json({
        success: false,
        error: 'Referral code is required',
      });
    }

    const result = await AffiliateService.validateReferralCode(referralCode);

    return res.json(result);
  } catch (error) {
    logger.error('Error validating referral code', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * Link referral to user (called after signup)
 */
router.post('/link-referral', requireAuth, routeRateLimit(10), async (req, res) => {
  try {
    const user = (req as any).user;
    const { referralCode } = req.body;

    if (!referralCode) {
      return res.status(400).json({
        success: false,
        error: 'Referral code is required',
      });
    }

    const result = await AffiliateService.linkReferralToUser(user.id, referralCode);

    return res.json(result);
  } catch (error) {
    logger.error('Error linking referral', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// =====================================================
// ADMIN ENDPOINTS
// =====================================================

/**
 * Get program-wide statistics
 */
router.get('/admin/stats', requireAuth, requireAdmin, routeRateLimit(20), async (_req, res) => {
  try {
    const result = await AffiliateService.getAdminStats();

    if (!result.success) {
      return res.status(500).json(result);
    }

    return res.json(result);
  } catch (error) {
    logger.error('Error getting admin stats', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * Get all affiliates with their stats
 */
router.get('/admin/affiliates', requireAuth, requireAdmin, routeRateLimit(20), async (_req, res) => {
  try {
    const { data: affiliates, error } = await supabase
      .from('affiliate_programs')
      .select(`
        *,
        profiles!affiliate_programs_user_id_fkey(
          email,
          first_name,
          last_name
        )
      `)
      .order('opted_in_at', { ascending: false });

    if (error) {
      logger.error('Error fetching affiliates', error);
      return res.status(500).json({
        success: false,
        error: 'Database error',
      });
    }

    return res.json({
      success: true,
      affiliates,
    });
  } catch (error) {
    logger.error('Error getting admin affiliates', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * Get payout history and pending payouts
 */
router.get('/admin/payouts', requireAuth, requireAdmin, routeRateLimit(20), async (_req, res) => {
  try {
    const { data: payouts, error } = await supabase
      .from('affiliate_payouts')
      .select(`
        *,
        affiliate_programs!affiliate_payouts_affiliate_id_fkey(
          referral_code,
          profiles!affiliate_programs_user_id_fkey(
            email,
            first_name,
            last_name
          )
        )
      `)
      .order('requested_at', { ascending: false });

    if (error) {
      logger.error('Error fetching payouts', error);
      return res.status(500).json({
        success: false,
        error: 'Database error',
      });
    }

    return res.json({
      success: true,
      payouts,
    });
  } catch (error) {
    logger.error('Error getting admin payouts', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * Process all pending payouts
 */
router.post('/admin/process-payouts', requireAuth, requireAdmin, routeRateLimit(5), async (_req, res) => {
  try {
    const result = await StripeConnectService.processAllPendingPayouts();

    return res.json(result);
  } catch (error) {
    logger.error('Error processing payouts', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * Get revenue analysis report
 */
router.get('/admin/revenue-report', requireAuth, requireAdmin, routeRateLimit(20), async (_req, res) => {
  try {
    const { data: earnings, error } = await supabase
      .from('affiliate_earnings')
      .select(`
        *,
        referrals!affiliate_earnings_referral_id_fkey(
          stripe_subscription_id,
          commission_start_date,
          commission_end_date
        ),
        affiliate_programs!affiliate_earnings_affiliate_id_fkey(
          referral_code
        )
      `)
      .order('earned_at', { ascending: false });

    if (error) {
      logger.error('Error fetching earnings', error);
      return res.status(500).json({
        success: false,
        error: 'Database error',
      });
    }

    // Calculate totals
    const totalEarnings = earnings?.reduce((sum, earning) => sum + (earning.amount || 0), 0) || 0;
    const totalRevenue = earnings?.reduce((sum, earning) => sum + (earning.subscription_amount || 0), 0) || 0;

    return res.json({
      success: true,
      earnings,
      totals: {
        totalEarnings,
        totalRevenue,
        netProfit: totalRevenue - totalEarnings,
      },
    });
  } catch (error) {
    logger.error('Error getting revenue report', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
