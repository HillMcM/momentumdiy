import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

// Constants
const COMMISSION_RATE = parseFloat(process.env['AFFILIATE_COMMISSION_RATE'] || '0.20');
const COMMISSION_MONTHS = parseInt(process.env['AFFILIATE_COMMISSION_MONTHS'] || '12');
const MIN_PAYOUT = parseFloat(process.env['AFFILIATE_MIN_PAYOUT'] || '10');
const ELIGIBILITY_DAYS = 30;
const COOKIE_NAME = 'momentum_ref';
const COOKIE_EXPIRY_DAYS = 90;

interface AffiliateProgram {
  id: string;
  user_id: string;
  referral_code: string;
  stripe_connect_account_id: string | null;
  connect_onboarding_complete: boolean;
  status: 'active' | 'paused' | 'suspended';
  opted_in_at: string;
  total_referrals: number;
  total_earnings: number;
  total_paid_out: number;
  pending_balance: number;
  last_payout_at: string | null;
}

interface Referral {
  id: string;
  affiliate_id: string;
  referred_user_id: string;
  referral_code_used: string;
  signed_up_at: string;
  first_payment_at: string | null;
  status: 'pending' | 'converted' | 'expired';
  stripe_subscription_id: string | null;
  commission_start_date: string | null;
  commission_end_date: string | null;
  total_commission_earned: number;
}

interface AffiliateEarning {
  id: string;
  affiliate_id: string;
  referral_id: string;
  stripe_invoice_id: string;
  amount: number;
  subscription_amount: number;
  commission_month: number;
  earned_at: string;
  payout_id: string | null;
}

export class AffiliateService {
  /**
   * Check if a user is eligible to become an affiliate
   * Must be subscribed for 30+ days
   */
  static async checkEligibility(userId: string): Promise<{ eligible: boolean; reason?: string }> {
    try {
      // Get user's profile with subscription info
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_start_date')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        return { eligible: false, reason: 'Profile not found' };
      }

      // Check if user has an active subscription
      if (profile.subscription_status !== 'active' && profile.subscription_status !== 'trial') {
        return { eligible: false, reason: 'Active subscription required' };
      }

      // Check if subscribed for 30+ days
      if (!profile.subscription_start_date) {
        return { eligible: false, reason: 'Subscription start date not found' };
      }

      const subscriptionStart = new Date(profile.subscription_start_date);
      const daysSinceSubscription = Math.floor(
        (Date.now() - subscriptionStart.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceSubscription < ELIGIBILITY_DAYS) {
        return {
          eligible: false,
          reason: `Must be subscribed for ${ELIGIBILITY_DAYS} days (${daysSinceSubscription} days so far)`,
        };
      }

      // Check if already an affiliate
      const { data: existingAffiliate } = await supabase
        .from('affiliate_programs')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingAffiliate) {
        return { eligible: false, reason: 'Already enrolled in affiliate program' };
      }

      return { eligible: true };
    } catch (error) {
      logger.error('Error checking affiliate eligibility', error, { userId });
      return { eligible: false, reason: 'Error checking eligibility' };
    }
  }

  /**
   * Generate a unique referral code
   */
  static async generateReferralCode(): Promise<string> {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code: string;
    let isUnique = false;

    while (!isUnique) {
      // Generate 8-character code
      code = Array.from({ length: 8 }, () =>
        characters.charAt(Math.floor(Math.random() * characters.length))
      ).join('');

      // Add prefix
      code = `MOMENTUM-${code}`;

      // Check if unique
      const { data } = await supabase
        .from('affiliate_programs')
        .select('id')
        .eq('referral_code', code)
        .single();

      isUnique = !data;
    }

    return code!;
  }

  /**
   * Create an affiliate account for a user
   */
  static async createAffiliateAccount(
    userId: string
  ): Promise<{ success: boolean; affiliateProgram?: AffiliateProgram; error?: string }> {
    try {
      // Check eligibility first
      const eligibility = await this.checkEligibility(userId);
      if (!eligibility.eligible) {
        return { success: false, error: eligibility.reason || 'Not eligible' };
      }

      // Generate unique referral code
      const referralCode = await this.generateReferralCode();

      // Create affiliate program record
      const { data: affiliateProgram, error } = await supabase
        .from('affiliate_programs')
        .insert({
          user_id: userId,
          referral_code: referralCode,
          status: 'active',
        })
        .select()
        .single();

      if (error) {
        logger.error('Error creating affiliate account', error, { userId });
        return { success: false, error: 'Failed to create affiliate account' };
      }

      logger.info('Affiliate account created', { userId, referralCode });

      return { success: true, affiliateProgram };
    } catch (error) {
      logger.error('Error creating affiliate account', error, { userId });
      return { success: false, error: 'Failed to create affiliate account' };
    }
  }

  /**
   * Track a referral click
   */
  static async trackReferralClick(
    referralCode: string,
    metadata: { ipAddress?: string; userAgent?: string }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Verify referral code exists and is active
      const { data: affiliate } = await supabase
        .from('affiliate_programs')
        .select('id, status')
        .eq('referral_code', referralCode)
        .single();

      if (!affiliate) {
        return { success: false, error: 'Invalid referral code' };
      }

      if (affiliate.status !== 'active') {
        return { success: false, error: 'Referral code is not active' };
      }

      // Log the click
      const { error } = await supabase.from('referral_clicks').insert({
        referral_code: referralCode,
        ip_address: metadata.ipAddress,
        user_agent: metadata.userAgent,
      });

      if (error) {
        logger.error('Error tracking referral click', error, { referralCode });
        return { success: false, error: 'Failed to track click' };
      }

      logger.info('Referral click tracked', { referralCode });

      return { success: true };
    } catch (error) {
      logger.error('Error tracking referral click', error, { referralCode });
      return { success: false, error: 'Failed to track click' };
    }
  }

  /**
   * Get referral code from cookie string
   */
  static getReferralFromCookie(cookieString?: string): string | null {
    if (!cookieString) return null;

    const cookies = cookieString.split(';').map(c => c.trim());
    const refCookie = cookies.find(c => c.startsWith(`${COOKIE_NAME}=`));

    if (!refCookie) return null;

    return refCookie.split('=')[1];
  }

  /**
   * Convert a referral when a new user signs up
   */
  static async convertReferral(
    newUserId: string,
    referralCode: string
  ): Promise<{ success: boolean; referral?: Referral; error?: string }> {
    try {
      // Get affiliate program for this code
      const { data: affiliate, error: affiliateError } = await supabase
        .from('affiliate_programs')
        .select('id, status')
        .eq('referral_code', referralCode)
        .single();

      if (affiliateError || !affiliate) {
        return { success: false, error: 'Invalid referral code' };
      }

      if (affiliate.status !== 'active') {
        return { success: false, error: 'Affiliate program not active' };
      }

      // Check if user is already a referral
      const { data: existingReferral } = await supabase
        .from('referrals')
        .select('id')
        .eq('referred_user_id', newUserId)
        .single();

      if (existingReferral) {
        return { success: false, error: 'User already referred' };
      }

      // Create referral record
      const { data: referral, error: referralError } = await supabase
        .from('referrals')
        .insert({
          affiliate_id: affiliate.id,
          referred_user_id: newUserId,
          referral_code_used: referralCode,
          status: 'pending',
        })
        .select()
        .single();

      if (referralError) {
        logger.error('Error creating referral', referralError, { newUserId, referralCode });
        return { success: false, error: 'Failed to create referral' };
      }

      // Update affiliate's total referrals count
      await supabase
        .from('affiliate_programs')
        .update({ total_referrals: affiliate.id })
        .eq('id', affiliate.id);

      // Update click record as converted
      await supabase
        .from('referral_clicks')
        .update({ converted: true })
        .eq('referral_code', referralCode)
        .order('clicked_at', { ascending: false })
        .limit(1);

      logger.info('Referral converted', { newUserId, referralCode, referralId: referral.id });

      return { success: true, referral };
    } catch (error) {
      logger.error('Error converting referral', error, { newUserId, referralCode });
      return { success: false, error: 'Failed to convert referral' };
    }
  }

  /**
   * Mark a referral as having made first payment
   */
  static async markReferralConverted(
    referredUserId: string,
    stripeSubscriptionId: string
  ): Promise<{ success: boolean; referral?: Referral; error?: string }> {
    try {
      const now = new Date();
      const commissionEndDate = new Date();
      commissionEndDate.setMonth(commissionEndDate.getMonth() + COMMISSION_MONTHS);

      const { data: referral, error } = await supabase
        .from('referrals')
        .update({
          status: 'converted',
          first_payment_at: now.toISOString(),
          stripe_subscription_id: stripeSubscriptionId,
          commission_start_date: now.toISOString(),
          commission_end_date: commissionEndDate.toISOString(),
        })
        .eq('referred_user_id', referredUserId)
        .eq('status', 'pending')
        .select()
        .single();

      if (error) {
        logger.error('Error marking referral as converted', error, { referredUserId });
        return { success: false, error: 'Failed to mark referral as converted' };
      }

      if (!referral) {
        return { success: false, error: 'Referral not found or already converted' };
      }

      logger.info('Referral marked as converted', { referredUserId, referralId: referral.id });

      return { success: true, referral };
    } catch (error) {
      logger.error('Error marking referral as converted', error, { referredUserId });
      return { success: false, error: 'Failed to mark referral as converted' };
    }
  }

  /**
   * Calculate commission amount
   */
  static calculateCommission(subscriptionAmount: number): number {
    return Math.round(subscriptionAmount * COMMISSION_RATE * 100) / 100;
  }

  /**
   * Record an earning for an affiliate
   */
  static async recordEarning(
    affiliateId: string,
    referralId: string,
    stripeInvoiceId: string,
    subscriptionAmount: number
  ): Promise<{ success: boolean; earning?: AffiliateEarning; error?: string }> {
    try {
      // Get referral to determine commission month
      const { data: referral, error: referralError } = await supabase
        .from('referrals')
        .select('commission_start_date, total_commission_earned')
        .eq('id', referralId)
        .single();

      if (referralError || !referral) {
        return { success: false, error: 'Referral not found' };
      }

      // Check if already recorded
      const { data: existingEarning } = await supabase
        .from('affiliate_earnings')
        .select('id')
        .eq('stripe_invoice_id', stripeInvoiceId)
        .single();

      if (existingEarning) {
        return { success: false, error: 'Earning already recorded for this invoice' };
      }

      // Calculate which commission month this is (1-12)
      const commissionStart = new Date(referral.commission_start_date!);
      const now = new Date();
      const monthsSinceStart = Math.floor(
        (now.getTime() - commissionStart.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );
      const commissionMonth = Math.min(monthsSinceStart + 1, COMMISSION_MONTHS);

      // Calculate commission
      const commissionAmount = this.calculateCommission(subscriptionAmount);

      // Create earning record
      const { data: earning, error } = await supabase
        .from('affiliate_earnings')
        .insert({
          affiliate_id: affiliateId,
          referral_id: referralId,
          stripe_invoice_id: stripeInvoiceId,
          amount: commissionAmount,
          subscription_amount: subscriptionAmount,
          commission_month: commissionMonth,
        })
        .select()
        .single();

      if (error) {
        logger.error('Error recording earning', error, { affiliateId, referralId });
        return { success: false, error: 'Failed to record earning' };
      }

      // Update affiliate program totals
      const { data: affiliate } = await supabase
        .from('affiliate_programs')
        .select('total_earnings, pending_balance')
        .eq('id', affiliateId)
        .single();

      if (affiliate) {
        await supabase
          .from('affiliate_programs')
          .update({
            total_earnings: (affiliate.total_earnings || 0) + commissionAmount,
            pending_balance: (affiliate.pending_balance || 0) + commissionAmount,
          })
          .eq('id', affiliateId);
      }

      // Update referral total
      await supabase
        .from('referrals')
        .update({
          total_commission_earned: (referral.total_commission_earned || 0) + commissionAmount,
        })
        .eq('id', referralId);

      logger.info('Earning recorded', {
        affiliateId,
        referralId,
        amount: commissionAmount,
        commissionMonth,
      });

      return { success: true, earning };
    } catch (error) {
      logger.error('Error recording earning', error, { affiliateId, referralId });
      return { success: false, error: 'Failed to record earning' };
    }
  }

  /**
   * Get affiliate dashboard data
   */
  static async getAffiliateDashboard(userId: string) {
    try {
      // Get affiliate program
      const { data: affiliate, error: affiliateError } = await supabase
        .from('affiliate_programs')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (affiliateError || !affiliate) {
        return { success: false, error: 'Affiliate program not found' };
      }

      // Get referrals
      const { data: referrals, error: referralsError } = await supabase
        .from('referrals')
        .select(`
          *,
          profiles:referred_user_id (
            business_name,
            contact_email
          )
        `)
        .eq('affiliate_id', affiliate.id)
        .order('signed_up_at', { ascending: false });

      if (referralsError) {
        logger.error('Error fetching referrals', referralsError, { userId });
      }

      // Get earnings
      const { data: earnings, error: earningsError } = await supabase
        .from('affiliate_earnings')
        .select('*')
        .eq('affiliate_id', affiliate.id)
        .order('earned_at', { ascending: false });

      if (earningsError) {
        logger.error('Error fetching earnings', earningsError, { userId });
      }

      // Get payouts
      const { data: payouts, error: payoutsError } = await supabase
        .from('affiliate_payouts')
        .select('*')
        .eq('affiliate_id', affiliate.id)
        .order('requested_at', { ascending: false });

      if (payoutsError) {
        logger.error('Error fetching payouts', payoutsError, { userId });
      }

      // Calculate conversion rate
      const totalReferrals = referrals?.length || 0;
      const convertedReferrals = referrals?.filter(r => r.status === 'converted').length || 0;
      const conversionRate =
        totalReferrals > 0 ? Math.round((convertedReferrals / totalReferrals) * 100) : 0;

      return {
        success: true,
        data: {
          affiliate,
          referrals: referrals || [],
          earnings: earnings || [],
          payouts: payouts || [],
          stats: {
            conversionRate,
            activeReferrals: convertedReferrals,
            canRequestPayout: (affiliate.pending_balance || 0) >= MIN_PAYOUT,
            minPayout: MIN_PAYOUT,
          },
        },
      };
    } catch (error) {
      logger.error('Error getting affiliate dashboard', error, { userId });
      return { success: false, error: 'Failed to get dashboard data' };
    }
  }

  /**
   * Request a payout
   */
  static async requestPayout(userId: string): Promise<{ success: boolean; payout?: any; error?: string }> {
    try {
      // Get affiliate program
      const { data: affiliate, error: affiliateError } = await supabase
        .from('affiliate_programs')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (affiliateError || !affiliate) {
        return { success: false, error: 'Affiliate program not found' };
      }

      // Check if eligible for payout
      if ((affiliate.pending_balance || 0) < MIN_PAYOUT) {
        return {
          success: false,
          error: `Minimum balance of $${MIN_PAYOUT} required for payout`,
        };
      }

      if (!affiliate.connect_onboarding_complete) {
        return {
          success: false,
          error: 'Please complete Stripe Connect onboarding first',
        };
      }

      // Check for pending payouts
      const { data: pendingPayout } = await supabase
        .from('affiliate_payouts')
        .select('id')
        .eq('affiliate_id', affiliate.id)
        .in('status', ['pending', 'processing'])
        .single();

      if (pendingPayout) {
        return { success: false, error: 'You already have a pending payout' };
      }

      // Create payout request
      const { data: payout, error: payoutError } = await supabase
        .from('affiliate_payouts')
        .insert({
          affiliate_id: affiliate.id,
          amount: affiliate.pending_balance,
          status: 'pending',
        })
        .select()
        .single();

      if (payoutError) {
        logger.error('Error creating payout request', payoutError, { userId });
        return { success: false, error: 'Failed to create payout request' };
      }

      logger.info('Payout requested', { userId, amount: affiliate.pending_balance });

      return { success: true, payout };
    } catch (error) {
      logger.error('Error requesting payout', error, { userId });
      return { success: false, error: 'Failed to request payout' };
    }
  }

  /**
   * Get affiliate by referral code
   */
  static async getAffiliateByCode(referralCode: string) {
    try {
      const { data: affiliate, error } = await supabase
        .from('affiliate_programs')
        .select('*')
        .eq('referral_code', referralCode)
        .single();

      if (error || !affiliate) {
        return { success: false, error: 'Affiliate not found' };
      }

      return { success: true, affiliate };
    } catch (error) {
      logger.error('Error getting affiliate by code', error, { referralCode });
      return { success: false, error: 'Failed to get affiliate' };
    }
  }

  /**
   * Get referral by user ID
   */
  static async getReferralByUserId(userId: string) {
    try {
      const { data: referral, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referred_user_id', userId)
        .single();

      if (error || !referral) {
        return { success: false, error: 'Referral not found' };
      }

      return { success: true, referral };
    } catch (error) {
      logger.error('Error getting referral by user ID', error, { userId });
      return { success: false, error: 'Failed to get referral' };
    }
  }

  /**
   * Expire old pending referrals (90+ days)
   */
  static async expireOldReferrals(): Promise<{ success: boolean; expired?: number }> {
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() - COOKIE_EXPIRY_DAYS);

      const { data, error } = await supabase
        .from('referrals')
        .update({ status: 'expired' })
        .eq('status', 'pending')
        .lt('signed_up_at', expiryDate.toISOString())
        .select();

      if (error) {
        logger.error('Error expiring old referrals', error);
        return { success: false };
      }

      const expiredCount = data?.length || 0;
      if (expiredCount > 0) {
        logger.info('Expired old referrals', { count: expiredCount });
      }

      return { success: true, expired: expiredCount };
    } catch (error) {
      logger.error('Error expiring old referrals', error);
      return { success: false };
    }
  }

  /**
   * Get admin statistics
   */
  static async getAdminStats() {
    try {
      // Get total affiliates
      const { count: totalAffiliates } = await supabase
        .from('affiliate_programs')
        .select('*', { count: 'exact', head: true });

      // Get active affiliates
      const { count: activeAffiliates } = await supabase
        .from('affiliate_programs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get total referrals
      const { count: totalReferrals } = await supabase
        .from('referrals')
        .select('*', { count: 'exact', head: true });

      // Get converted referrals
      const { count: convertedReferrals } = await supabase
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'converted');

      // Get total earnings
      const { data: earningsData } = await supabase
        .from('affiliate_earnings')
        .select('amount, subscription_amount');

      const totalCommissions = earningsData?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
      const totalRevenue = earningsData?.reduce((sum, e) => sum + (e.subscription_amount || 0), 0) || 0;

      // Get total paid out
      const { data: payoutsData } = await supabase
        .from('affiliate_payouts')
        .select('amount')
        .eq('status', 'completed');

      const totalPaidOut = payoutsData?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      // Get pending payouts
      const { data: pendingPayoutsData } = await supabase
        .from('affiliate_payouts')
        .select('amount')
        .in('status', ['pending', 'processing']);

      const pendingPayouts = pendingPayoutsData?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      return {
        success: true,
        data: {
          totalAffiliates: totalAffiliates || 0,
          activeAffiliates: activeAffiliates || 0,
          totalReferrals: totalReferrals || 0,
          convertedReferrals: convertedReferrals || 0,
          conversionRate:
            totalReferrals && totalReferrals > 0
              ? Math.round(((convertedReferrals || 0) / totalReferrals) * 100)
              : 0,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalCommissions: Math.round(totalCommissions * 100) / 100,
          totalPaidOut: Math.round(totalPaidOut * 100) / 100,
          pendingPayouts: Math.round(pendingPayouts * 100) / 100,
          netProfit: Math.round((totalRevenue - totalCommissions) * 100) / 100,
          averageCommissionPerAffiliate:
            totalAffiliates && totalAffiliates > 0
              ? Math.round((totalCommissions / totalAffiliates) * 100) / 100
              : 0,
        },
      };
    } catch (error) {
      logger.error('Error getting admin stats', error);
      return { success: false, error: 'Failed to get admin stats' };
    }
  }
}
