import express from 'express';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

const router = express.Router();

// Simple auth middleware
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

// Check eligibility
router.get('/eligibility', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    
    // Check if user has been subscribed for 30+ days
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('subscription_start_date')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      return res.json({
        success: false,
        eligible: false,
        reason: 'Profile not found',
      });
    }

    if (!profile.subscription_start_date) {
      return res.json({
        success: false,
        eligible: false,
        reason: 'No active subscription',
      });
    }

    const subscriptionDate = new Date(profile.subscription_start_date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const eligible = subscriptionDate <= thirtyDaysAgo;

    return res.json({
      success: true,
      eligible,
      reason: eligible ? 'Eligible' : 'Must be subscribed for 30+ days',
    });
  } catch (error) {
    logger.error('Error checking eligibility', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Opt into affiliate program
router.post('/opt-in', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    
    // Check if already an affiliate
    const { data: existing } = await supabase
      .from('affiliate_programs')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existing) {
      return res.json({
        success: false,
        error: 'Already enrolled in affiliate program',
      });
    }

    // Generate referral code
    const referralCode = `MOMENTUM-${user.id.substring(0, 8).toUpperCase()}`;

    // Create affiliate record
    const { data: affiliate, error } = await supabase
      .from('affiliate_programs')
      .insert({
        user_id: user.id,
        referral_code: referralCode,
        status: 'active',
        opted_in_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating affiliate account', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create affiliate account',
      });
    }

    return res.json({
      success: true,
      affiliateProgram: affiliate,
    });
  } catch (error) {
    logger.error('Error opting into affiliate program', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Get dashboard data
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    
    // Get affiliate program
    const { data: affiliate, error } = await supabase
      .from('affiliate_programs')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !affiliate) {
      return res.status(404).json({
        success: false,
        error: 'Affiliate account not found',
      });
    }

    // Get referrals
    const { data: referrals } = await supabase
      .from('referrals')
      .select('*')
      .eq('affiliate_id', affiliate.id);

    // Get earnings
    const { data: earnings } = await supabase
      .from('affiliate_earnings')
      .select('*')
      .eq('affiliate_id', affiliate.id);

    // Get payouts
    const { data: payouts } = await supabase
      .from('affiliate_payouts')
      .select('*')
      .eq('affiliate_id', affiliate.id);

    return res.json({
      success: true,
      affiliateProgram: affiliate,
      referrals: referrals || [],
      earnings: earnings || [],
      payouts: payouts || [],
    });
  } catch (error) {
    logger.error('Error getting dashboard data', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Track referral click
router.get('/track/:code', async (req, res) => {
  try {
    const { code } = req.params;

    // Log the click
    await supabase
      .from('referral_clicks')
      .insert({
        referral_code: code,
        clicked_at: new Date().toISOString(),
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      });

    // Set cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'lax' as const,
      maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
    };

    res.cookie('momentum_ref', code, cookieOptions);

    // Redirect to main site
    const redirectUrl = process.env['FRONTEND_URL'] || 'http://localhost:5173';
    return res.redirect(redirectUrl);
  } catch (error) {
    logger.error('Error tracking referral click', error);
    const redirectUrl = process.env['FRONTEND_URL'] || 'http://localhost:5173';
    return res.redirect(redirectUrl);
  }
});

// Link referral to user
router.post('/link-referral', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { referralCode } = req.body;

    if (!referralCode) {
      return res.status(400).json({
        success: false,
        error: 'Referral code is required',
      });
    }

    // Find affiliate by referral code
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliate_programs')
      .select('id')
      .eq('referral_code', referralCode)
      .single();

    if (affiliateError || !affiliate) {
      return res.json({
        success: false,
        error: 'Invalid referral code',
      });
    }

    // Create referral record
    const { error: referralError } = await supabase
      .from('referrals')
      .insert({
        affiliate_id: affiliate.id,
        referred_user_id: user.id,
        referral_code_used: referralCode,
        signed_up_at: new Date().toISOString(),
        status: 'pending',
      });

    if (referralError) {
      logger.error('Error creating referral record', referralError);
      return res.status(500).json({
        success: false,
        error: 'Failed to link referral',
      });
    }

    return res.json({
      success: true,
      message: 'Referral linked successfully',
    });
  } catch (error) {
    logger.error('Error linking referral', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Admin: Get program stats
router.get('/admin/stats', requireAuth, requireAdmin, async (_req, res) => {
  try {
    // Get total affiliates
    const { count: totalAffiliates } = await supabase
      .from('affiliate_programs')
      .select('*', { count: 'exact', head: true });

    // Get total referrals
    const { count: totalReferrals } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true });

    // Get total earnings
    const { data: earnings } = await supabase
      .from('affiliate_earnings')
      .select('amount');

    const totalEarnings = earnings?.reduce((sum, earning) => sum + (earning.amount || 0), 0) || 0;

    // Get total payouts
    const { data: payouts } = await supabase
      .from('affiliate_payouts')
      .select('amount');

    const totalPayouts = payouts?.reduce((sum, payout) => sum + (payout.amount || 0), 0) || 0;

    return res.json({
      success: true,
      stats: {
        totalAffiliates: totalAffiliates || 0,
        totalReferrals: totalReferrals || 0,
        totalEarnings,
        totalPayouts,
        netProfit: totalEarnings - totalPayouts,
      },
    });
  } catch (error) {
    logger.error('Error getting admin stats', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Admin: Get all affiliates
router.get('/admin/affiliates', requireAuth, requireAdmin, async (_req, res) => {
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
      affiliates: affiliates || [],
    });
  } catch (error) {
    logger.error('Error getting admin affiliates', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
