# 🔧 Cron Job Fix Guide - Email Automation

## 🚨 Issue Identified

Your cronjob URL is malformed, causing a 404 error:

**Current (Broken) URL:**
```
https://momentumdiy-backend.onrender.com/api/notifications/automated/schedulehttp://
```

**Correct URL:**
```
https://momentumdiy-backend.onrender.com/api/notifications/automated/schedule
```

Notice the extra `http://` at the end of the broken URL - this is causing the 404 error.

---

## ✅ Solution: Fix Your Cron Job URL

### **Step 1: Log into cron-job.org**

1. Go to https://cron-job.org/
2. Sign in to your account

### **Step 2: Update the Cronjob**

1. Find your cronjob named **"MomentumDIY Automated Notifications"** (or similar)
2. Click **"Edit"** on the cronjob
3. **Update the URL** to:
   ```
   https://momentumdiy-backend.onrender.com/api/notifications/automated/schedule
   ```
4. **Verify these settings:**
   - **Method**: POST
   - **Schedule**: `0 * * * *` (every hour at minute 0)
   - **Enabled**: Yes
   
5. Click **"Save"**

### **Step 3: Verify Environment Variables on Render**

Make sure your Render backend service has these environment variables set:

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Select your **"momentumdiy-backend"** service
3. Go to **"Environment"** tab
4. Verify these variables exist:

```bash
# Required for email sending
RESEND_API_KEY=re_your_resend_api_key_here

# Required for database access
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Required for app configuration
NODE_ENV=production
PORT=3001
```

If `RESEND_API_KEY` is missing:
1. Click **"Add Environment Variable"**
2. **Key**: `RESEND_API_KEY`
3. **Value**: Your Resend API key (get from [Resend Dashboard](https://resend.com/api-keys))
4. Click **"Save Changes"**

### **Step 4: Test the Endpoint**

Before re-enabling the cronjob, test the endpoint manually:

```bash
# Test from your terminal
curl -X POST https://momentumdiy-backend.onrender.com/api/notifications/automated/schedule
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Scheduled notifications have been checked and processed"
}
```

**If you get an error**, check:
- ✅ Backend service is running on Render
- ✅ Environment variables are set correctly
- ✅ Resend API key is valid
- ✅ Supabase connection is working

### **Step 5: Re-Enable the Cronjob**

1. Go back to cron-job.org
2. Find your updated cronjob
3. Click **"Enable"** to re-activate it

---

## 🔍 How the Email System Works

### **Automated Email Types:**

1. **Weekly Progress Reports**
   - **When**: Every Monday at 9 AM
   - **Who**: Active users who completed onboarding
   - **What**: Progress summary with completed tasks and current week

2. **Trial Ending Notifications**
   - **When**: Daily at 10 AM
   - **Who**: Users whose trial ends in 7, 3, or 1 days
   - **What**: Reminder to upgrade before trial expires

3. **Task Reminders**
   - **When**: Every Wednesday at 2 PM
   - **Who**: Users inactive for 3+ days with incomplete tasks
   - **What**: Gentle reminder to continue their marketing journey

### **The Scheduler Logic:**

The cronjob hits `/api/notifications/automated/schedule` every hour. The backend then checks:
- **Current day of week** (0 = Sunday, 1 = Monday, etc.)
- **Current hour** (0-23)
- **Sends appropriate emails** based on the schedule above

---

## 📊 Monitoring Your Emails

### **Check Email Delivery:**

1. **Resend Dashboard**
   - Go to: https://resend.com/emails
   - View all sent emails
   - Check delivery status
   - See open rates and bounces

2. **Render Logs**
   - Go to your backend service in Render
   - Click on **"Logs"** tab
   - Look for these messages:
     ```
     ✅ "📧 Weekly progress report sent to user@example.com"
     ✅ "📧 Trial ending email sent to user@example.com (3 days left)"
     ✅ "📧 Task reminder sent to user@example.com (5 days inactive)"
     ```

3. **Error Messages to Watch For:**
   ```
   ❌ "Email service not configured" → RESEND_API_KEY missing
   ❌ "Error fetching users" → Supabase connection issue
   ❌ "Error sending email" → Resend API issue
   ```

---

## 🧪 Manual Testing

### **Test Individual Email Types:**

```bash
# Test weekly progress reports
curl -X POST https://momentumdiy-backend.onrender.com/api/notifications/automated/weekly-progress

# Test trial ending notifications
curl -X POST https://momentumdiy-backend.onrender.com/api/notifications/automated/trial-ending

# Test task reminders
curl -X POST https://momentumdiy-backend.onrender.com/api/notifications/automated/task-reminders

# Test all notifications at once
curl -X POST https://momentumdiy-backend.onrender.com/api/notifications/automated/run-all
```

### **Expected Response:**
```json
{
  "success": true,
  "message": "Weekly progress reports have been sent"
}
```

---

## 🆘 Troubleshooting

### **Problem: Cronjob fails with 404 error**
**Solution:** Check the URL is exactly:
```
https://momentumdiy-backend.onrender.com/api/notifications/automated/schedule
```
(No extra `http://` at the end!)

### **Problem: Emails not sending**
**Solutions:**
1. ✅ Check `RESEND_API_KEY` is set on Render
2. ✅ Verify Resend API key is active at https://resend.com/api-keys
3. ✅ Check Resend account isn't over quota
4. ✅ Verify domain is verified in Resend (if using custom domain)

### **Problem: No users receiving emails**
**Solutions:**
1. ✅ Check users have valid email addresses in database
2. ✅ Verify users have completed onboarding (`onboarding_completed = true`)
3. ✅ Confirm users have active subscriptions (`subscription_status = 'active'` or `'trial'`)
4. ✅ Check user email preferences allow notifications

### **Problem: Wrong users getting emails**
**Solutions:**
1. ✅ Check user subscription status in Supabase
2. ✅ Verify trial end dates are set correctly
3. ✅ Confirm marketing goals are active for users

---

## 🎯 Quick Checklist

Before re-enabling your cronjob:

- [ ] Cronjob URL is correct (no `http://` at the end)
- [ ] Cronjob method is set to POST
- [ ] Cronjob schedule is `0 * * * *` (every hour)
- [ ] `RESEND_API_KEY` is set on Render backend
- [ ] `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set on Render
- [ ] Resend API key is valid and active
- [ ] Backend service is running on Render
- [ ] Manual test of endpoint returns success
- [ ] Resend dashboard shows emails being sent

---

## 📧 Resend Setup Verification

If you haven't set up Resend yet:

1. **Sign up for Resend** at https://resend.com
2. **Verify your domain** (or use Resend's test domain)
3. **Get your API key** from https://resend.com/api-keys
4. **Add to Render** as `RESEND_API_KEY` environment variable
5. **Test email** sending with:
   ```bash
   curl -X POST https://momentumdiy-backend.onrender.com/api/email/test
   ```

---

## 🎉 Success!

Once everything is configured correctly, your automated email system will:
- ✅ Send weekly progress updates to active users
- ✅ Remind users when their trial is ending
- ✅ Re-engage inactive users with task reminders
- ✅ Respect user email preferences
- ✅ Log all activities for monitoring
- ✅ Handle errors gracefully without stopping

Your users will receive timely, relevant emails that drive engagement and conversions! 🚀

