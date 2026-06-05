# Email System Setup & Troubleshooting Guide

## Email Platform: Resend

Your app uses **Resend** (https://resend.com) for sending transactional emails.

## Required Setup Steps

### 1. Get Resend API Key

1. Sign up at https://resend.com (or log in)
2. Go to **API Keys** section
3. Create a new API key
4. Copy the API key (starts with `re_`)

### 2. Configure Environment Variables

Add to your Render backend service environment variables:

```bash
RESEND_API_KEY=re_your_actual_api_key_here
```

**Important**: Make sure this is set in your Render production environment!

### 3. Verify Sender Domain (Required for Production)

**CRITICAL**: You must verify your sender domain in Resend before emails will be delivered!

1. Go to Resend Dashboard → **Domains**
2. Add your domain (e.g., `momentumdiy.com` or `hillaryedenmcmullen.com`)
3. Add the DNS records Resend provides to your domain's DNS settings
4. Wait for verification (can take a few minutes to 48 hours)

**OR** Use Resend's default domain for testing:
- Domain: `onboarding.resend.dev`
- From: `onboarding@onboarding.resend.dev`

Update `BRAND_EMAIL` in your environment to match verified domain:
```bash
BRAND_EMAIL=onboarding@onboarding.resend.dev  # For testing with Resend's domain
# OR
BRAND_EMAIL=info@momentumdiy.com  # Once your domain is verified
```

### 4. Verify Cron Job is Running

The automated notifications run via a Render cron job that executes every hour.

Check in Render Dashboard:
1. Go to your backend service
2. Look for **Cron Jobs** section
3. Verify `automated-notifications` cron job exists and is enabled
4. Check **Logs** to see if it's running

Expected log output when cron runs:
```
🚀 Running automated notifications: schedule
📅 Current time: [timestamp]
Evaluating notification schedule
```

## Testing Email System

### Manual Test via API

Test sending an email directly:

```bash
curl -X POST https://momentumdiy-backend.onrender.com/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "welcome",
    "email": "your-email@example.com"
  }'
```

### Test All Notification Types

```bash
# Test weekly progress report
curl -X POST https://momentumdiy-backend.onrender.com/api/notifications/automated/weekly-progress

# Test task reminders
curl -X POST https://momentumdiy-backend.onrender.com/api/notifications/automated/task-reminders

# Test trial ending notifications
curl -X POST https://momentumdiy-backend.onrender.com/api/notifications/automated/trial-ending

# Test all notifications
curl -X POST https://momentumdiy-backend.onrender.com/api/notifications/automated/run-all
```

## Troubleshooting

### No Emails Received

1. **Check Resend Dashboard**
   - Go to https://resend.com/emails
   - Look for sent emails
   - Check if they show as "Delivered" or have errors

2. **Check Backend Logs**
   - Look for error messages about `RESEND_API_KEY`
   - Check for "Email service not configured" warnings
   - Verify cron job is running

3. **Check Environment Variables**
   - Verify `RESEND_API_KEY` is set in Render
   - Verify `BRAND_EMAIL` matches verified domain
   - Check that domain is verified in Resend

4. **Common Issues**

   **Issue**: "Email service not configured"
   - **Fix**: Set `RESEND_API_KEY` environment variable in Render

   **Issue**: Emails show as sent in Resend but not received
   - **Fix**: Check spam folder, verify domain DNS records are correct

   **Issue**: "Invalid from address" error
   - **Fix**: Verify `BRAND_EMAIL` is set and matches verified domain

   **Issue**: Cron job not running
   - **Fix**: Check Render cron job is enabled
   - **Fix**: Verify `render.yaml` has correct cron job configuration

### Check Cron Job Status

View cron job logs in Render:
1. Go to your backend service
2. Click on **Cron Jobs** tab
3. Click on `automated-notifications` job
4. View recent runs and logs

### Verify Email Configuration

Check if email service is properly configured:

```bash
# Check environment variables
curl https://momentumdiy-backend.onrender.com/health

# Check logs for email service initialization
# Look for: "Resend API key not configured" (BAD) or no warning (GOOD)
```

## Email Types & Schedule

| Type | Schedule | Description |
|------|----------|-------------|
| Weekly Progress | Monday 9 AM | Progress report for active users |
| Trial Ending | Daily 10 AM | Reminders at 7, 3, 1 days before trial ends |
| Task Reminders | Daily 2 PM | For users inactive 3, 7, 12, 17, or 24 days |

## Notification Preferences

Users can control email preferences in their profile:
- `weekly_progress`: Weekly progress reports (default: true)
- `task_reminders`: Task reminder emails (default: true)
- `marketing_emails`: Marketing emails (default: true)
- `trial_emails`: Trial ending emails (always true, cannot disable)

## Resend Limits

Free tier: 3,000 emails/month
- Upgrade if you need more capacity
- Check usage in Resend Dashboard

## Next Steps After Setup

1. ✅ Verify `RESEND_API_KEY` is set in Render
2. ✅ Verify sender domain in Resend
3. ✅ Test sending an email via API
4. ✅ Check Resend dashboard for sent emails
5. ✅ Verify cron job is running
6. ✅ Check backend logs for email sending errors

