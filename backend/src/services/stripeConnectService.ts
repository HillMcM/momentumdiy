import { stripe } from '../config/stripe';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import Stripe from 'stripe';

// const PLATFORM_FEE_PERCENTAGE = 0; // We take 0% platform fee; affiliates get the full commission - not used currently

export class StripeConnectService {
  /**
   * Create a Stripe Connect Express account for an affiliate
   */
  static async createConnectAccount(
    userId: string,
    email: string,
    businessName?: string
  ): Promise<{ success: boolean; accountId?: string; error?: string }> {
    try {
      // Check if user already has a Connect account
      const { data: affiliate } = await supabase
        .from('affiliate_programs')
        .select('stripe_connect_account_id')
        .eq('user_id', userId)
        .single();

      if (!affiliate) {
        return { success: false, error: 'Affiliate program not found' };
      }

      if (affiliate.stripe_connect_account_id) {
        return { success: true, accountId: affiliate.stripe_connect_account_id };
      }

      // Create Stripe Connect Express account
      // Note: For affiliate payouts, we need transfers capability
      // Stripe may require platform approval for transfers-only accounts
      // Adding card_payments as well to avoid approval requirement
      // Settings: Automatic payouts enabled (daily) - transfers automatically go to bank account
      const account = await stripe.accounts.create({
        type: 'express',
        email: email,
        business_type: 'individual',
        capabilities: {
          transfers: { requested: true },
          card_payments: { requested: true },
        },
        business_profile: {
          name: businessName || 'Affiliate',
        },
        settings: {
          payouts: {
            schedule: {
              interval: 'daily', // Automatic daily payouts to bank account
            },
          },
        },
        metadata: {
          user_id: userId,
          purpose: 'affiliate_payouts',
        },
      });

      // Update affiliate program with Connect account ID
      const { error: updateError } = await supabase
        .from('affiliate_programs')
        .update({ stripe_connect_account_id: account.id })
        .eq('user_id', userId);

      if (updateError) {
        logger.error('Error updating affiliate with Connect account ID', updateError, { userId });
        return { success: false, error: 'Failed to save Connect account' };
      }

      logger.info('Stripe Connect account created', { userId, accountId: account.id });

      return { success: true, accountId: account.id };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error creating Stripe Connect account', error, { userId, email, errorMessage });
      
      // Return more specific error message if it's a Stripe error
      if (error instanceof Error && error.message) {
        // Check for specific errors that need user action
        if (error.message.includes('transfers') && error.message.includes('card_payments')) {
          return { 
            success: false, 
            error: 'Platform approval required: Please contact Stripe Support to enable transfers-only Connect accounts, or we can add card_payments capability (requires additional onboarding). Contact: https://support.stripe.com/contact'
          };
        }
        return { success: false, error: `Stripe error: ${error.message}` };
      }
      
      return { success: false, error: 'Failed to create Connect account' };
    }
  }

  /**
   * Create an account link for onboarding
   */
  static async createAccountLink(
    accountId: string,
    returnUrl: string,
    refreshUrl: string
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        return_url: returnUrl,
        refresh_url: refreshUrl,
        type: 'account_onboarding',
      });

      return { success: true, url: accountLink.url };
    } catch (error) {
      logger.error('Error creating account link', error, { accountId });
      return { success: false, error: 'Failed to create onboarding link' };
    }
  }

  /**
   * Get the status of a Connect account
   */
  static async getAccountStatus(
    accountId: string
  ): Promise<{
    success: boolean;
    account?: Stripe.Account;
    onboardingComplete?: boolean;
    error?: string;
  }> {
    try {
      const account = await stripe.accounts.retrieve(accountId);

      // Check if onboarding is complete
      const onboardingComplete =
        account.details_submitted === true &&
        account.charges_enabled === true &&
        account.payouts_enabled === true;

      // Ensure automatic payouts are set (update if needed)
      if (onboardingComplete && account.settings?.payouts?.schedule?.interval !== 'daily') {
        await this.setAutomaticPayouts(accountId);
      }

      return { success: true, account, onboardingComplete };
    } catch (error) {
      logger.error('Error getting account status', error, { accountId });
      return { success: false, error: 'Failed to get account status' };
    }
  }

  /**
   * Update onboarding status in database
   */
  static async updateOnboardingStatus(
    userId: string,
    complete: boolean
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('affiliate_programs')
        .update({ connect_onboarding_complete: complete })
        .eq('user_id', userId);

      if (error) {
        logger.error('Error updating onboarding status', error, { userId });
        return { success: false, error: 'Failed to update onboarding status' };
      }

      return { success: true };
    } catch (error) {
      logger.error('Error updating onboarding status', error, { userId });
      return { success: false, error: 'Failed to update onboarding status' };
    }
  }

  /**
   * Update Connect account to use automatic payouts (daily schedule)
   */
  static async setAutomaticPayouts(
    accountId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await stripe.accounts.update(accountId, {
        settings: {
          payouts: {
            schedule: {
              interval: 'daily', // Automatic daily payouts to bank account
            },
          },
        },
      });

      logger.info('Updated Connect account to automatic daily payouts', { accountId });
      return { success: true };
    } catch (error) {
      logger.error('Error updating payout schedule', error, { accountId });
      return { success: false, error: 'Failed to update payout schedule' };
    }
  }

  /**
   * Create a payout (transfer) to an affiliate's Connect account
   */
  static async createPayout(
    accountId: string,
    amount: number,
    payoutId: string,
    currency: string = 'usd'
  ): Promise<{ success: boolean; transfer?: Stripe.Transfer; error?: string }> {
    try {
      // Convert amount to cents
      const amountInCents = Math.round(amount * 100);

      // Create a transfer to the Connect account
      const transfer = await stripe.transfers.create({
        amount: amountInCents,
        currency: currency,
        destination: accountId,
        description: `Affiliate payout - ${payoutId}`,
        metadata: {
          payout_id: payoutId,
          type: 'affiliate_commission',
        },
      });

      logger.info('Payout transfer created', {
        accountId,
        amount,
        transferId: transfer.id,
        payoutId,
      });

      return { success: true, transfer };
    } catch (error) {
      logger.error('Error creating payout transfer', error, { accountId, amount, payoutId });
      return { success: false, error: 'Failed to create payout transfer' };
    }
  }

  /**
   * Process a payout from the affiliate_payouts table
   */
  static async processPayout(
    payoutId: string
  ): Promise<{ success: boolean; transfer?: Stripe.Transfer; error?: string }> {
    try {
      // Get payout details
      const { data: payout, error: payoutError } = await supabase
        .from('affiliate_payouts')
        .select(
          `
          *,
          affiliate:affiliate_programs (
            stripe_connect_account_id,
            connect_onboarding_complete,
            user_id
          )
        `
        )
        .eq('id', payoutId)
        .single();

      if (payoutError || !payout) {
        return { success: false, error: 'Payout not found' };
      }

      if (payout.status !== 'pending') {
        return { success: false, error: `Payout status is ${payout.status}, not pending` };
      }

      const affiliate = payout.affiliate as any;

      if (!affiliate.connect_onboarding_complete) {
        await supabase
          .from('affiliate_payouts')
          .update({
            status: 'failed',
            error_message: 'Connect onboarding not complete',
          })
          .eq('id', payoutId);

        return { success: false, error: 'Connect onboarding not complete' };
      }

      if (!affiliate.stripe_connect_account_id) {
        await supabase
          .from('affiliate_payouts')
          .update({
            status: 'failed',
            error_message: 'No Connect account ID',
          })
          .eq('id', payoutId);

        return { success: false, error: 'No Connect account ID' };
      }

      // Mark as processing
      await supabase
        .from('affiliate_payouts')
        .update({ status: 'processing' })
        .eq('id', payoutId);

      // Create the transfer
      const result = await this.createPayout(
        affiliate.stripe_connect_account_id,
        payout.amount,
        payoutId
      );

      if (!result.success) {
        // Mark as failed
        await supabase
          .from('affiliate_payouts')
          .update({
            status: 'failed',
            error_message: result.error || 'Transfer failed',
          })
          .eq('id', payoutId);

        return result;
      }

      // Mark as completed and update affiliate balance
      await supabase
        .from('affiliate_payouts')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString(),
          stripe_transfer_id: result.transfer!.id,
        })
        .eq('id', payoutId);

      // Update affiliate program balances
      const { data: affiliateProgram } = await supabase
        .from('affiliate_programs')
        .select('pending_balance, total_paid_out')
        .eq('id', payout.affiliate_id)
        .single();

      if (affiliateProgram) {
        await supabase
          .from('affiliate_programs')
          .update({
            pending_balance: Math.max(0, (affiliateProgram.pending_balance || 0) - payout.amount),
            total_paid_out: (affiliateProgram.total_paid_out || 0) + payout.amount,
            last_payout_at: new Date().toISOString(),
          })
          .eq('id', payout.affiliate_id);
      }

      // Link earnings to this payout
      await supabase
        .from('affiliate_earnings')
        .update({ payout_id: payoutId })
        .eq('affiliate_id', payout.affiliate_id)
        .is('payout_id', null);

      logger.info('Payout processed successfully', {
        payoutId,
        amount: payout.amount,
        transferId: result.transfer!.id,
      });

      return { success: true, transfer: result.transfer! };
    } catch (error) {
      logger.error('Error processing payout', error, { payoutId });

      // Mark as failed
      await supabase
        .from('affiliate_payouts')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
        })
        .eq('id', payoutId);

      return { success: false, error: 'Failed to process payout' };
    }
  }

  /**
   * Process all pending payouts
   */
  static async processAllPendingPayouts(): Promise<{
    success: boolean;
    processed?: number;
    failed?: number;
    errors?: string[];
  }> {
    try {
      // Get all pending payouts
      const { data: pendingPayouts, error } = await supabase
        .from('affiliate_payouts')
        .select('id')
        .eq('status', 'pending')
        .order('requested_at', { ascending: true });

      if (error) {
        logger.error('Error fetching pending payouts', error);
        return { success: false, errors: ['Failed to fetch pending payouts'] };
      }

      if (!pendingPayouts || pendingPayouts.length === 0) {
        logger.info('No pending payouts to process');
        return { success: true, processed: 0, failed: 0 };
      }

      let processed = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const payout of pendingPayouts) {
        const result = await this.processPayout(payout.id);
        if (result.success) {
          processed++;
        } else {
          failed++;
          errors.push(`Payout ${payout.id}: ${result.error}`);
        }

        // Add a small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      logger.info('Batch payout processing complete', { processed, failed });

      return { success: true, processed, failed, errors };
    } catch (error) {
      logger.error('Error processing pending payouts', error);
      return { success: false, errors: ['Failed to process pending payouts'] };
    }
  }

  /**
   * Handle Stripe Connect webhooks
   */
  static async handleConnectWebhook(event: Stripe.Event): Promise<{ success: boolean }> {
    try {
      switch (event.type) {
        case 'account.updated': {
          const account = event.data.object as Stripe.Account;

          // Check if onboarding is complete
          const onboardingComplete =
            account.details_submitted === true &&
            account.charges_enabled === true &&
            account.payouts_enabled === true;

          // Get user_id from metadata
          const userId = account.metadata?.['user_id'];

          if (userId) {
            await this.updateOnboardingStatus(userId, onboardingComplete);
            logger.info('Connect account updated', { accountId: account.id, onboardingComplete });
          }
          break;
        }

        case 'transfer.created':
        case 'transfer.updated': {
          const transfer = event.data.object as Stripe.Transfer;
          logger.info('Transfer event received', {
            type: event.type,
            transferId: transfer.id,
            amount: transfer.amount / 100,
          });
          break;
        }

        default:
          logger.debug('Unhandled Connect webhook event', { type: event.type });
          break;
      }

      // Handle transfer.failed separately since it may not be in the type union
      if ((event.type as string) === 'transfer.failed') {
        const transfer = event.data.object as Stripe.Transfer;
        const payoutId = transfer.metadata?.['payout_id'];

        if (payoutId) {
          await supabase
            .from('affiliate_payouts')
            .update({
              status: 'failed',
              error_message: 'Transfer failed in Stripe',
            })
            .eq('id', payoutId);

          logger.error('Transfer failed', { transferId: transfer.id, payoutId });
        }
      }

      return { success: true };
    } catch (error) {
      logger.error('Error handling Connect webhook', error, { eventType: event.type });
      return { success: false };
    }
  }

  /**
   * Delete a Connect account (for cleanup/testing)
   */
  static async deleteConnectAccount(accountId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await stripe.accounts.del(accountId);
      logger.info('Connect account deleted', { accountId });
      return { success: true };
    } catch (error) {
      logger.error('Error deleting Connect account', error, { accountId });
      return { success: false, error: 'Failed to delete Connect account' };
    }
  }
}
