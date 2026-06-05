# Render Cron Job Setup Guide

## Current Configuration

The cron job is configured in `backend/render.yaml`:

```yaml
jobs:
  - type: cron
    name: automated-notifications
    schedule: "0 * * * *"  # Every hour at minute 0
    buildCommand: npm install
    startCommand: npx tsx src/scripts/runAutomatedNotifications.ts schedule
    envVars:
      - key: NODE_ENV
        value: production
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_ANON_KEY
        sync: false
      - key: SUPABASE_SERVICE_ROLE_KEY
        sync: false
      - key: RESEND_API_KEY
        sync: false
      - key: BRAND_EMAIL
        sync: false
      - key: BRAND_NAME
        sync: false
      - key: ANTHROPIC_API_KEY
        sync: false
```

## How to Set Up in Render Dashboard

### Manual Setup (Recommended)

Render's Blueprint (render.yaml) doesn't always automatically create cron jobs, so you'll need to create it manually:

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click the "New +" button** at the top of your dashboard (or click "New" from your backend service page)
3. **Select "Cron Job"** from the dropdown
4. **Configure the cron job**:
   - **Name**: `automated-notifications`
   - **Repository**: Select your GitHub repository (`momentumdiy` or `HillMcM/momentumdiy`)
   - **Branch**: `main`
   - **Runtime**: **Node** (NOT Docker - we need tsx which is a dev dependency)
   - **Root Directory**: `backend` (important - your backend code is in the `backend` folder)
   - **Schedule**: `0 * * * *` (every hour at minute 0)
   - **Command**: `npx tsx src/scripts/runAutomatedNotifications.ts schedule`
   - **Build Command**: `npm install` (or leave blank - Render will auto-detect)
   - **Plan**: Starter (or same as your web service)

5. **Set Environment Variables** (same as your web service):
   - `NODE_ENV` = `production`
   - `SUPABASE_URL` = (from your web service)
   - `SUPABASE_ANON_KEY` = (from your web service)
   - `SUPABASE_SERVICE_ROLE_KEY` = (from your web service)
   - `RESEND_API_KEY` = (from your web service)
   - `BRAND_EMAIL` = `info@momentumdiy.com` (or your verified Resend domain)
   - `BRAND_NAME` = `MomentumDIY`
   - `ANTHROPIC_API_KEY` = (from your web service)

6. **Save** the cron job

## Verify Cron Job is Running

1. **Go to Render Dashboard** → Look for **`automated-notifications`** in your list of services/jobs
2. **Click on the cron job** to open it
3. **Check the "Logs" tab** to see recent runs
4. **Check the "Settings" tab** to verify:
   - Status: Should be "Active" or "Enabled"
   - Schedule: `0 * * * *`
   - Command: `npx tsx src/scripts/runAutomatedNotifications.ts schedule`

**Note**: In Render, cron jobs appear as separate items in your dashboard list (not under a "Cron Jobs" tab). Look for `automated-notifications` alongside your web services.

## Expected Log Output

### Build Logs (What you just saw)
The build logs show dependency installation. You should see "Build successful 🎉" at the end.

### Execution Logs (What to look for next)
When the cron job actually **executes** (runs the script), you should see:

```
🚀 Running automated notifications: schedule
📅 Current time: 2024-01-15T14:00:00.000Z
Evaluating notification schedule
[DEBUG] dayOfWeek: 1, hour: 14, minute: 0
Triggering task reminders
Starting task reminder notifications
...
```

## Troubleshooting

### Cron Job Not Running

1. **Check if cron job exists**:
   - Go to Render Dashboard → Look for `automated-notifications` in your services list
   - It should appear alongside your web services

2. **Check if cron job is enabled**:
   - Click on the cron job
   - Go to "Settings" tab
   - Verify status is "Active" or "Enabled"

3. **Check logs for errors**:
   - Click on the cron job
   - View "Recent Runs" and click on a run
   - Check logs for errors

### Common Errors

**Error**: `Cannot find module 'tsx'`
- **Fix**: Make sure `tsx` is in `package.json` dependencies (it should be)

**Error**: `Cannot find module '../services/automatedNotificationsService'`
- **Fix**: The cron job needs access to the source files. Make sure `rootDir: backend` is set correctly

**Error**: `RESEND_API_KEY not found`
- **Fix**: Add `RESEND_API_KEY` to the cron job's environment variables

**Error**: `Email service not configured`
- **Fix**: Verify `RESEND_API_KEY` is set correctly in environment variables

### Test the Cron Job Manually

You can manually trigger the cron job from Render Dashboard:

1. Go to Render Dashboard
2. Find and click on `automated-notifications` in your services list
3. Click **"Manual Deploy"** or **"Trigger Deploy"** button
4. Check the **"Logs"** tab to see the output

Or test via API:
```bash
curl -X POST https://momentumdiy-backend.onrender.com/api/notifications/automated/schedule
```

## Schedule Times

The cron job runs **every hour at minute 0** (e.g., 1:00 PM, 2:00 PM, 3:00 PM).

Inside the cron job, it checks:
- **Monday 9 AM**: Weekly progress reports
- **Daily 10 AM**: Trial ending notifications
- **Daily 2 PM**: Task reminders (for inactive users)

## Next Steps

1. ✅ Verify cron job exists in Render Dashboard
2. ✅ Check environment variables are set
3. ✅ Run the job manually to test
4. ✅ Check logs for successful execution
5. ✅ Verify emails are being sent (check Resend dashboard)

