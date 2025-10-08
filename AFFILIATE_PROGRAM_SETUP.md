# Affiliate Program Setup Guide

## Overview

The affiliate program allows users to earn 20% recurring commissions for 12 months when they refer new paid subscribers. This guide covers the complete setup process.

## Architecture

### Database
- **5 new tables** in Supabase:
  - `affiliate_programs`: User opt-ins and account info
  - `referrals`: Referred users and their conversion status
  - `affiliate_earnings`: Commission transaction log
  - `affiliate_payouts`: Payout history and status
  - `referral_clicks`: Click tracking for analytics

### Backend Services
- **AffiliateService**: Core business logic
- **StripeConnectService**: Payout management via Stripe Connect
- **Updated StripeService**: Webhook integration for commission tracking

### Frontend Pages
- **AffiliateProgramPage**: Landing page with eligibility check and opt-in
- **AffiliateDashboardPage**: Earnings tracking and payout management
- **AdminAffiliatePage**: Program analytics and payout processing

## Setup Instructions

### 1. Database Migration

Run the migration to create the affiliate program tables:

```bash
cd supabase
# The migration file is: migrations/20251008000000_affiliate_program.sql
# It will be applied automatically on next Supabase deployment
```

Or apply manually via Supabase Dashboard:
1. Go to SQL Editor
2. Paste contents of `supabase/migrations/20251008000000_affiliate_program.sql`
3. Execute

### 2. Stripe Connect Setup

#### Create Connect Application

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Connect** → **Settings**
3. Enable Connect if not already enabled
4. Configure your platform settings:
   - **Platform name**: MomentumDIY
   - **Support email**: Your support email
   - **Platform URL**: Your production URL

#### Get Connect Client ID

1. In Connect Settings, copy your **Connect Client ID**
2. It starts with `ca_`

#### Configure Environment Variables

Add to `backend/.env`:

```env
STRIPE_CONNECT_CLIENT_ID=ca_xxx_your_connect_client_id
AFFILIATE_COOKIE_DOMAIN=.yourdomain.com
AFFILIATE_MIN_PAYOUT=10
AFFILIATE_COMMISSION_RATE=0.20
AFFILIATE_COMMISSION_MONTHS=12
```

For production (Render):
1. Go to Render Dashboard → Your Backend Service
2. Environment → Add Environment Variables
3. Add the same variables as above

#### Set Up Connect Webhooks

1. In Stripe Dashboard: **Developers** → **Webhooks**
2. Add endpoint: `https://your-backend-url.com/api/affiliate/connect-webhook`
3. Select these events:
   - `account.updated`
   - `transfer.created`
   - `transfer.updated`
   - `transfer.failed`
4. Copy the webhook signing secret
5. Add to environment variables:
   ```env
   STRIPE_CONNECT_WEBHOOK_SECRET=whsec_xxx
   ```

### 3. Update Stripe Subscription Webhooks

Ensure your existing Stripe webhook includes `invoice.payment_succeeded` events (it should already be configured). This triggers commission calculations.

### 4. Deploy Backend Changes

```bash
cd backend
npm install
npm run build

# Deploy to Render (using deploy hook or git push)
```

### 5. Deploy Frontend Changes

```bash
cd Frontend
npm install
npm run build

# Deploy to Vercel
```

### 6. Configure Render Cron Job

1. Go to Render Dashboard → Your Backend Service
2. Navigate to **Cron Jobs** tab
3. Add new cron job:
   - **Name**: Process Affiliate Payouts
   - **Command**: `npm run process-affiliate-payouts`
   - **Schedule**: `0 0 1 * *` (Monthly on 1st at midnight)
   - **Timezone**: Your preferred timezone

Or manually via `render.yaml`:

```yaml
services:
  - type: web
    name: your-backend
    # ... existing config ...
    
  - type: cron
    name: process-affiliate-payouts
    env: production
    schedule: "0 0 1 * *"
    buildCommand: npm install && npm run build
    startCommand: npm run process-affiliate-payouts
    envVars:
      - fromService:
          type: web
          name: your-backend
          envVarKey: DATABASE_URL
      # ... copy all other env vars from main service
```

## Testing the Program

### Test Affiliate Sign-Up Flow

1. **Create eligible account**:
   - Sign up for an account
   - Subscribe to a paid plan (use Stripe test card)
   - Wait 30 days OR manually update `subscription_start_date` in database to be 30+ days ago

2. **Opt into program**:
   - Navigate to `/app/affiliate/program`
   - Should show "You're Eligible!"
   - Click "Join Affiliate Program"
   - Verify dashboard appears at `/app/affiliate/dashboard`

3. **Complete Stripe Connect**:
   - In affiliate dashboard, click "Complete Onboarding"
   - Use Stripe test mode details
   - Verify "Stripe Connected" status

### Test Referral Flow

1. **Get referral link**:
   - In affiliate dashboard, copy referral link
   - Example: `https://yoursite.com/?ref=MOMENTUM-ABC12345`

2. **Test referral click**:
   - Open incognito browser
   - Visit referral link
   - Verify "Referred by a friend!" banner appears
   - Check backend logs for click tracking

3. **Test referral signup**:
   - Sign up for new account (still in incognito)
   - Verify in database:
     - `referrals` table has new record with status 'pending'
     - `referral_clicks` has `converted = true`

4. **Test commission calculation**:
   - Subscribe the referred user (after trial or immediately)
   - Use Stripe test webhook CLI or wait for actual payment
   - Verify in database:
     - `referrals` status changed to 'converted'
     - `affiliate_earnings` has new record
     - `affiliate_programs` has updated `pending_balance`

### Test Payout Flow

1. **Request payout** (balance >= $10):
   - In affiliate dashboard, click "Request Payout"
   - Verify `affiliate_payouts` has pending record

2. **Process payout**:
   - Admin dashboard: `/app/admin/affiliate`
   - Click "Process All Payouts"
   - OR run manually: `npm run process-affiliate-payouts`

3. **Verify payout**:
   - Check Stripe Dashboard → Transfers
   - Verify payout status is 'completed'
   - Verify balance was deducted from affiliate

### Test Admin Dashboard

1. Navigate to `/app/admin/affiliate` (must be admin email)
2. Verify all tabs work:
   - **Overview**: Shows aggregate stats
   - **Affiliates**: Lists all affiliates with data
   - **Payouts**: Shows payout history
   - **Revenue**: Shows revenue breakdown

## Stripe Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

Use any future expiry date and any 3-digit CVC.

## Commission Calculation Logic

1. **User signs up via referral link**: Cookie set for 90 days
2. **User creates account**: Referral record created (status: 'pending')
3. **User makes first payment**: 
   - Referral status → 'converted'
   - Commission period starts (12 months)
   - First earning recorded
4. **Subsequent payments**: 
   - Check if within 12-month period
   - Calculate 20% commission
   - Record earning
   - Update affiliate balance

## Security Considerations

- ✅ RLS policies on all tables
- ✅ Cookie security (httpOnly, secure in production)
- ✅ Rate limiting on API endpoints
- ✅ Admin-only routes protected by AdminGuard
- ✅ Stripe webhook signature verification
- ✅ Payout validation before transfer

## Monitoring

### Key Metrics to Track

- Referral conversion rate
- Average commission per affiliate
- Program ROI (revenue vs. commissions)
- Payout success rate
- Cookie attribution accuracy

### Logs to Monitor

Backend logs will show:
- `Referral click tracked`
- `Referral converted on first payment`
- `Affiliate commission recorded`
- `Payout processed successfully`

Use Sentry for error tracking (already integrated).

## Troubleshooting

### Referral not linking

**Issue**: New user signs up but referral not created

**Check**:
1. Cookie was set (check Network tab)
2. localStorage has `referral_code`
3. `/api/affiliate/link-referral` was called in auth flow
4. Check backend logs

**Fix**: Ensure ReferralTracker component is in AuthPage and link-referral endpoint is being called

### Commission not calculating

**Issue**: User made payment but no commission recorded

**Check**:
1. Stripe webhook is configured and firing
2. `invoice.payment_succeeded` event is being sent
3. Referral status is 'converted' or 'pending'
4. Check backend logs for errors

**Fix**: Verify webhook secret and that handlePaymentSuccess is updated

### Payout failing

**Issue**: Payout status stuck in 'processing' or 'failed'

**Check**:
1. Affiliate has completed Stripe Connect onboarding
2. Connect account is active in Stripe
3. Balance is >= $10
4. Check Stripe Dashboard → Transfers for errors

**Fix**: Check error_message in affiliate_payouts table

## Analytics Queries

```sql
-- Top performing affiliates
SELECT 
  ap.referral_code,
  p.business_name,
  ap.total_referrals,
  ap.total_earnings,
  ap.pending_balance
FROM affiliate_programs ap
JOIN profiles p ON p.id = ap.user_id
ORDER BY ap.total_earnings DESC
LIMIT 10;

-- Recent conversions
SELECT 
  r.*,
  p.business_name as referee_name
FROM referrals r
JOIN profiles p ON p.id = r.referred_user_id
WHERE r.status = 'converted'
  AND r.first_payment_at > NOW() - INTERVAL '30 days'
ORDER BY r.first_payment_at DESC;

-- Commission by month
SELECT 
  DATE_TRUNC('month', earned_at) as month,
  COUNT(*) as earnings_count,
  SUM(amount) as total_commissions,
  SUM(subscription_amount) as total_revenue
FROM affiliate_earnings
GROUP BY DATE_TRUNC('month', earned_at)
ORDER BY month DESC;
```

## Support

For issues or questions:
1. Check this guide
2. Review backend logs in Render
3. Check Sentry for errors
4. Verify Stripe webhook logs

## Future Enhancements

Potential improvements:
- Email notifications for affiliates (new referral, payout processed)
- More detailed analytics dashboard
- Custom commission tiers for top performers
- Marketing materials/assets for affiliates
- Referral leaderboard
- Affiliate-specific promo codes
