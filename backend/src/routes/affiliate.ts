import express from 'express';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { StripeConnectService } from '../services/stripeConnectService';

const router = express.Router();

// Simple auth middleware
const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized - No valid token provided',
      });
      return;
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized - Invalid token',
      });
      return;
    }

    (req as any).user = user;
    next();
  } catch (error) {
    logger.error('Auth middleware error', error);
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
    });
  }
};

// Admin middleware
const requireAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    const ADMIN_EMAILS = ['info@hillaryedenmcmullen.com'];
    if (!user.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      res.status(403).json({
        success: false,
        error: 'Forbidden - Admin access required',
      });
      return;
    }

    next();
  } catch (error) {
    logger.error('Admin middleware error', error);
    res.status(403).json({
      success: false,
      error: 'Forbidden',
    });
  }
};

// Check eligibility
router.get('/eligibility', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    
    // Check if user has been active for 30+ days (account age, not just subscription)
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('created_at, trial_start_date, subscription_start_date')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      return res.json({
        success: false,
        eligible: false,
        reason: 'Profile not found',
      });
    }

    // Determine the earliest date: account creation, trial start, or subscription start
    // This represents when the user first started using the app
    const dateOptions: (Date | null)[] = [
      profile.created_at ? new Date(profile.created_at) : null,
      profile.trial_start_date ? new Date(profile.trial_start_date) : null,
      profile.subscription_start_date ? new Date(profile.subscription_start_date) : null,
    ];
    
    const dates: Date[] = dateOptions.filter((date): date is Date => date !== null);

    if (dates.length === 0) {
      return res.json({
        success: false,
        eligible: false,
        reason: 'Unable to determine account age',
      });
    }

    // Use the earliest date (when user first started using the app)
    const accountStartDate = new Date(Math.min(...dates.map((d: Date) => d.getTime())));
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const eligible = accountStartDate <= thirtyDaysAgo;

    return res.json({
      success: true,
      eligible,
      reason: eligible ? 'Eligible' : 'Must be active for 30+ days',
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

// Check enrollment status (lightweight check for frontend to avoid heavy queries and 404s)
router.get('/status', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { data: affiliate, error } = await supabase
      .from('affiliate_programs')
      .select('id, status')
      .eq('user_id', user.id)
      .single();

    if (error || !affiliate) {
      return res.json({
        success: true,
        isAffiliate: false,
        status: null,
      });
    }

    return res.json({
      success: true,
      isAffiliate: true,
      status: affiliate.status,
    });
  } catch (error) {
    logger.error('Error checking affiliate status', error);
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
      return res.json({
        success: false,
        error: 'Affiliate account not found',
      });
    }

    // Get referrals
    const { data: referrals } = await supabase
      .from('referrals')
      .select('*')
      .eq('affiliate_id', affiliate.id);

    // Get profile data for referred users
    const referredUserIds = referrals?.map(r => r.referred_user_id) || [];
    let referredProfiles: any[] = [];
    if (referredUserIds.length > 0) {
      const { data } = await supabase
        .from('profiles')
        .select('id, business_name, contact_email')
        .in('id', referredUserIds);
      referredProfiles = data || [];
    }

    // Create a map of user ID to profile
    const profileMap = new Map(
      referredProfiles.map(p => [p.id, { business_name: p.business_name, contact_email: p.contact_email }])
    );

    // Get earnings
    const { data: earnings } = await supabase
      .from('affiliate_earnings')
      .select('*')
      .eq('affiliate_id', affiliate.id)
      .order('earned_at', { ascending: false });

    // Get payouts
    const { data: payouts } = await supabase
      .from('affiliate_payouts')
      .select('*')
      .eq('affiliate_id', affiliate.id)
      .order('requested_at', { ascending: false });

    // Calculate stats
    const totalReferrals = referrals?.length || 0;
    const convertedReferrals = referrals?.filter(r => r.status === 'converted').length || 0;
    const conversionRate = totalReferrals > 0 ? Math.round((convertedReferrals / totalReferrals) * 100) : 0;
    const activeReferrals = referrals?.filter(r => r.status === 'converted').length || 0;
    const MIN_PAYOUT = 10;
    const canRequestPayout = (affiliate.pending_balance || 0) >= MIN_PAYOUT && affiliate.stripe_connect_account_id !== null;

    return res.json({
      success: true,
      data: {
        affiliate: {
          id: affiliate.id,
          referral_code: affiliate.referral_code,
          status: affiliate.status,
          total_referrals: totalReferrals,
          total_earnings: parseFloat(affiliate.total_earnings?.toString() || '0'),
          total_paid_out: parseFloat(affiliate.total_paid_out?.toString() || '0'),
          pending_balance: parseFloat(affiliate.pending_balance?.toString() || '0'),
          bank_account_added: affiliate.stripe_connect_account_id !== null,
          stripe_connect_account_id: affiliate.stripe_connect_account_id,
        },
        referrals: (referrals || []).map(r => ({
          id: r.id,
          referred_user_id: r.referred_user_id,
          referral_code_used: r.referral_code_used,
          signed_up_at: r.signed_up_at,
          first_payment_at: r.first_payment_at,
          status: r.status,
          total_commission_earned: parseFloat(r.total_commission_earned?.toString() || '0'),
          profiles: profileMap.get(r.referred_user_id) || { business_name: null, contact_email: null },
        })),
        earnings: (earnings || []).map(e => ({
          id: e.id,
          amount: parseFloat(e.amount?.toString() || '0'),
          subscription_amount: parseFloat(e.subscription_amount?.toString() || '0'),
          commission_month: e.commission_month,
          earned_at: e.earned_at,
          stripe_invoice_id: e.stripe_invoice_id,
        })),
        payouts: (payouts || []).map(p => ({
          id: p.id,
          amount: parseFloat(p.amount?.toString() || '0'),
          status: p.status,
          requested_at: p.requested_at,
          processed_at: p.processed_at,
          stripe_transfer_id: p.stripe_transfer_id,
        })),
        stats: {
          conversionRate,
          activeReferrals,
          canRequestPayout,
          minPayout: MIN_PAYOUT,
        },
      },
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

// Create Stripe Connect account
router.post('/connect/create-account', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    
    // First check if affiliate program exists
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliate_programs')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (affiliateError || !affiliate) {
      logger.error('Affiliate program not found for user', affiliateError, { userId: user.id });
      return res.status(404).json({
        success: false,
        error: 'Affiliate program not found. Please join the affiliate program first.',
      });
    }
    
    // Get user profile for email and business name
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, business_name, contact_email')
      .eq('id', user.id)
      .single();

    if (profileError) {
      logger.error('Error fetching profile', profileError, { userId: user.id });
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch user profile',
      });
    }

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
      });
    }

    // Get email from profile, contact_email, or user object
    const email = profile.email || profile.contact_email || user.email;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required to create Connect account. Please update your profile with an email address.',
      });
    }

    const result = await StripeConnectService.createConnectAccount(
      user.id,
      email,
      profile.business_name || undefined
    );

    if (!result.success) {
      logger.error('Failed to create Connect account', { userId: user.id, error: result.error });
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to create Connect account',
      });
    }

    return res.json({
      success: true,
      accountId: result.accountId,
    });
  } catch (error) {
    logger.error('Error creating Connect account', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Get onboarding link for Stripe Connect
router.post('/connect/onboarding-link', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { returnUrl, refreshUrl } = req.body;

    if (!returnUrl || !refreshUrl) {
      return res.status(400).json({
        success: false,
        error: 'returnUrl and refreshUrl are required',
      });
    }

    // Get affiliate program to check for Connect account
    const { data: affiliate } = await supabase
      .from('affiliate_programs')
      .select('stripe_connect_account_id')
      .eq('user_id', user.id)
      .single();

    if (!affiliate) {
      return res.status(404).json({
        success: false,
        error: 'Affiliate program not found',
      });
    }

    if (!affiliate.stripe_connect_account_id) {
      return res.status(400).json({
        success: false,
        error: 'Stripe Connect account not created. Please create account first.',
      });
    }

    const result = await StripeConnectService.createAccountLink(
      affiliate.stripe_connect_account_id,
      returnUrl,
      refreshUrl
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to create onboarding link',
      });
    }

    return res.json({
      success: true,
      url: result.url,
    });
  } catch (error) {
    logger.error('Error creating onboarding link', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Get Connect account status
router.get('/connect/status', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    
    // Get affiliate program
    const { data: affiliate } = await supabase
      .from('affiliate_programs')
      .select('stripe_connect_account_id, connect_onboarding_complete')
      .eq('user_id', user.id)
      .single();

    if (!affiliate) {
      return res.status(404).json({
        success: false,
        error: 'Affiliate program not found',
      });
    }

    if (!affiliate.stripe_connect_account_id) {
      return res.json({
        success: true,
        hasAccount: false,
        onboardingComplete: false,
      });
    }

    // Get status from Stripe
    const statusResult = await StripeConnectService.getAccountStatus(
      affiliate.stripe_connect_account_id
    );

    if (!statusResult.success) {
      return res.status(400).json({
        success: false,
        error: statusResult.error || 'Failed to get account status',
      });
    }

    return res.json({
      success: true,
      hasAccount: true,
      onboardingComplete: statusResult.onboardingComplete || false,
      account: statusResult.account,
    });
  } catch (error) {
    logger.error('Error getting Connect status', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Request payout (on-demand)
router.post('/payout/request', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const MIN_PAYOUT = 10;

    // Get affiliate program
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliate_programs')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (affiliateError || !affiliate) {
      return res.status(404).json({
        success: false,
        error: 'Affiliate program not found',
      });
    }

    // Check minimum balance
    const pendingBalance = parseFloat(affiliate.pending_balance?.toString() || '0');
    if (pendingBalance < MIN_PAYOUT) {
      return res.status(400).json({
        success: false,
        error: `Minimum balance of $${MIN_PAYOUT} required for payout. Current balance: $${pendingBalance.toFixed(2)}`,
      });
    }

    // Check if Connect account is set up
    if (!affiliate.stripe_connect_account_id) {
      return res.status(400).json({
        success: false,
        error: 'Please set up your bank account first',
      });
    }

    // Check onboarding status
    const statusResult = await StripeConnectService.getAccountStatus(
      affiliate.stripe_connect_account_id
    );

    if (!statusResult.success || !statusResult.onboardingComplete) {
      return res.status(400).json({
        success: false,
        error: 'Please complete bank account setup first',
      });
    }

    // Check for existing pending payouts
    const { data: pendingPayout } = await supabase
      .from('affiliate_payouts')
      .select('id')
      .eq('affiliate_id', affiliate.id)
      .eq('status', 'pending')
      .single();

    if (pendingPayout) {
      return res.status(400).json({
        success: false,
        error: 'You already have a pending payout',
      });
    }

    // Create payout record
    const { data: payout, error: payoutError } = await supabase
      .from('affiliate_payouts')
      .insert({
        affiliate_id: affiliate.id,
        amount: pendingBalance,
        status: 'pending',
        requested_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (payoutError || !payout) {
      logger.error('Error creating payout record', payoutError);
      return res.status(500).json({
        success: false,
        error: 'Failed to create payout request',
      });
    }

    // Immediately process the payout
    const processResult = await StripeConnectService.processPayout(payout.id);

    if (!processResult.success) {
      return res.status(400).json({
        success: false,
        error: processResult.error || 'Failed to process payout',
        payout: {
          id: payout.id,
          status: 'failed',
        },
      });
    }

    // Get updated payout status
    const { data: updatedPayout } = await supabase
      .from('affiliate_payouts')
      .select('*')
      .eq('id', payout.id)
      .single();

    return res.json({
      success: true,
      payout: updatedPayout,
      message: 'Payout processed successfully',
    });
  } catch (error) {
    logger.error('Error requesting payout', error);
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

// =====================================================
// PARTNER AFFILIATE ROUTES
// =====================================================

// Helper function to generate referral code
function generateReferralCode(name: string): string {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 3);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${initials}${random}`;
}

// Helper function to generate secure password
function generateSecurePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Apply for partner program (public endpoint)
router.post('/partner/apply', async (req, res) => {
  try {
    const { email, fullName, companyName, industry, website, reasonForApplying, expectedReferralsPerMonth } = req.body;

    if (!email || !fullName || !reasonForApplying) {
      return res.status(400).json({
        success: false,
        error: 'Email, full name, and reason are required'
      });
    }

    // Check if application already exists for this email
    const { data: existing } = await supabase
      .from('affiliate_partner_applications')
      .select('id, status')
      .eq('email', email.toLowerCase())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      if (existing.status === 'pending') {
        return res.status(400).json({
          success: false,
          error: 'You already have a pending application'
        });
      }
      if (existing.status === 'approved') {
        return res.status(400).json({
          success: false,
          error: 'You have already been approved. Please check your email for your dashboard link.'
        });
      }
    }

    // Create application
    const { data: application, error } = await supabase
      .from('affiliate_partner_applications')
      .insert([{
        email: email.toLowerCase(),
        full_name: fullName,
        company_name: companyName,
        industry,
        website,
        reason_for_applying: reasonForApplying,
        expected_referrals_per_month: expectedReferralsPerMonth ? parseInt(expectedReferralsPerMonth) : null,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      logger.error('Error creating partner application', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to submit application'
      });
    }

    logger.info('New partner application submitted', { applicationId: application.id, email: application.email });

    // Send notification email to admin about new application
    try {
      const frontendUrl = process.env['FRONTEND_URL'] || 'https://momentumdiy.com';
      const applicationUrl = `${frontendUrl}/app/admin/affiliate`;
      
      const { EmailService } = await import('../services/emailService');
      await EmailService.sendAdminPartnerApplicationNotification({
        applicationId: application.id,
        applicantName: application.full_name,
        applicantEmail: application.email,
        companyName: application.company_name || undefined,
        applicationUrl
      });
    } catch (emailError) {
      // Don't fail the request if email fails, just log it
      logger.error('Failed to send admin notification email', emailError);
    }

    return res.json({
      success: true,
      data: { id: application.id }
    });
  } catch (error) {
    logger.error('Partner application error', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Admin: Get all partner applications
router.get('/partner/applications', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = supabase
      .from('affiliate_partner_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && typeof status === 'string') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching applications', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch applications'
      });
    }

    return res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    logger.error('Error fetching applications', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Admin: Approve partner application
router.post('/partner/approve/:applicationId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const user = (req as any).user;

    // Get application
    const { data: application, error: appError } = await supabase
      .from('affiliate_partner_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Application has already been processed'
      });
    }

    // Check if user already exists by checking profiles table first
    let userId: string | null = null;
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', application.email.toLowerCase())
      .maybeSingle();
    
    if (existingProfile) {
      userId = existingProfile.id;
    } else {
      // Create user account for partner
      const tempPassword = generateSecurePassword();
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: application.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: application.full_name,
          partner_affiliate: true
        }
      });

      if (createError || !newUser.user) {
        logger.error('Error creating partner user', createError);
        return res.status(500).json({
          success: false,
          error: 'Failed to create partner account'
        });
      }

      userId = newUser.user.id;

      // Create profile
      await supabase
        .from('profiles')
        .insert([{
          id: userId,
          email: application.email,
          full_name: application.full_name,
          business_name: application.company_name || application.full_name
        }]);
    }

    // Generate referral code
    const referralCode = generateReferralCode(application.full_name);

    // Create affiliate program entry
    const { data: affiliateProgram, error: affiliateError } = await supabase
      .from('affiliate_programs')
      .insert([{
        user_id: userId,
        referral_code: referralCode,
        partner_type: 'partner',
        application_id: application.id,
        status: 'active'
      }])
      .select()
      .single();

    if (affiliateError) {
      logger.error('Error creating affiliate program', affiliateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to create affiliate program'
      });
    }

    // Update application status
    await supabase
      .from('affiliate_partner_applications')
      .update({
        status: 'approved',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', applicationId);

    // Generate dashboard URL (partners will need to sign in with their email)
    const frontendUrl = process.env['FRONTEND_URL'] || 'https://momentumdiy.com';
    const dashboardUrl = `${frontendUrl}/app/affiliate/dashboard`;
    
    // Import EmailService dynamically to avoid circular dependencies
    const { EmailService } = await import('../services/emailService');
    
    await EmailService.sendPartnerApprovalEmail({
      email: application.email,
      name: application.full_name,
      dashboardUrl,
      referralCode
    });

    logger.info('Partner application approved', { 
      applicationId, 
      userId, 
      referralCode 
    });

    return res.json({
      success: true,
      data: {
        affiliateProgramId: affiliateProgram.id,
        referralCode,
        userId
      }
    });
  } catch (error) {
    logger.error('Error approving application', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Admin: Reject partner application
router.post('/partner/reject/:applicationId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { rejectionReason } = req.body;
    const user = (req as any).user;

    // Get application
    const { data: application, error: appError } = await supabase
      .from('affiliate_partner_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Application has already been processed'
      });
    }

    // Update application status
    const { error: updateError } = await supabase
      .from('affiliate_partner_applications')
      .update({
        status: 'rejected',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason: rejectionReason || 'Application did not meet requirements'
      })
      .eq('id', applicationId);

    if (updateError) {
      logger.error('Error rejecting application', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to reject application'
      });
    }

    // Send rejection email to applicant
    try {
      const { EmailService } = await import('../services/emailService');
      await EmailService.sendPartnerRejectionEmail({
        email: application.email,
        name: application.full_name,
        rejectionReason: rejectionReason || undefined
      });
    } catch (emailError) {
      // Don't fail the request if email fails, just log it
      logger.error('Failed to send rejection email', emailError);
    }

    logger.info('Partner application rejected', { applicationId });

    return res.json({
      success: true,
      message: 'Application rejected successfully'
    });
  } catch (error) {
    logger.error('Error rejecting application', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
