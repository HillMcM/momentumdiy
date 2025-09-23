# 🕐 Render Cron Job Setup Instructions

## Step 1: Create New Cron Job in Render Dashboard

1. **Go to your Render dashboard**: https://dashboard.render.com
2. **Click "New +"** in the top right
3. **Select "Cron Job"**

## Step 2: Configure the Cron Job

### **Basic Settings:**
- **Name**: `MomentumDIY Automated Notifications`
- **Environment**: `Docker` (if using Docker) or `Node` (if using Node.js)
- **Region**: `Oregon` (same as your backend)
- **Branch**: `main`

### **Build & Deploy Settings:**
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run automated-notifications schedule`
- **Plan**: `Free` (sufficient for cron jobs)

### **Environment Variables:**
Copy these from your existing backend service:
```
RESEND_API_KEY=your_resend_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NODE_ENV=production
```

### **Schedule:**
```
0 * * * *    (Every hour at minute 0)
```

### **Advanced Settings:**
- **Auto-Deploy**: `Yes`
- **Health Check Path**: Leave empty (not needed for cron jobs)

## Step 3: Deploy and Test

1. **Click "Create Cron Job"**
2. **Wait for deployment** (usually 2-3 minutes)
3. **Check logs** to ensure it's working
4. **Test manually** using the API endpoint

## Step 4: Manual Testing

Test the cron job by calling the API endpoint:

```bash
curl -X POST https://momentumdiy-backend.onrender.com/api/notifications/automated/schedule
```

You should see a response like:
```json
{
  "success": true,
  "message": "Scheduled notifications have been checked and processed"
}
```

## Step 5: Monitor the Cron Job

1. **Check Render logs** for the cron job
2. **Monitor email delivery** in Resend dashboard
3. **Check backend logs** for notification success/failure

## Expected Behavior

The unified scheduler will:
- **Run every hour**
- **Check current time and day**
- **Send weekly progress reports** on Mondays at 9 AM
- **Send trial ending notifications** daily at 10 AM
- **Send task reminders** on Wednesdays at 2 PM
- **Respect user email preferences**
- **Log all activities** for monitoring

## Troubleshooting

If the cron job fails:
1. **Check Render logs** for error messages
2. **Verify environment variables** are set correctly
3. **Test the API endpoint** manually
4. **Check Supabase connection** and permissions
5. **Verify Resend API key** is valid

## Alternative: External Cron Service

If Render cron jobs don't work well, you can use an external service:

### Using cron-job.org (Free):
1. Go to https://cron-job.org
2. Create account and add new cron job
3. URL: `https://momentumdiy-backend.onrender.com/api/notifications/automated/schedule`
4. Method: POST
5. Schedule: `0 * * * *` (every hour)
6. Add headers if needed for authentication

This will ping your API endpoint every hour to trigger the scheduler.
