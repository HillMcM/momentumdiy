# 📧 Email System Architecture - How Everything Connects

## 🔗 System Overview

Here's how your cronjob, backend app, and Resend email service work together:

```
┌─────────────────┐
│  Cron-Job.org   │ ← External scheduler (every hour)
└────────┬────────┘
         │ HTTP POST Request
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              Render Backend (Node.js/Express)           │
│                                                         │
│  ┌────────────────────────────────────────────────┐   │
│  │  Route: /api/notifications/automated/schedule  │   │
│  │  File: routes/automatedNotifications.ts        │   │
│  └─────────────────┬──────────────────────────────┘   │
│                    │                                    │
│                    ▼                                    │
│  ┌────────────────────────────────────────────────┐   │
│  │  Service: AutomatedNotificationsService        │   │
│  │  File: services/automatedNotificationsService.ts│  │
│  │                                                 │   │
│  │  Checks:                                        │   │
│  │  • Current day of week                          │   │
│  │  • Current hour                                 │   │
│  │  • Sends appropriate notifications              │   │
│  └─────────────────┬──────────────────────────────┘   │
│                    │                                    │
│                    ▼                                    │
│  ┌────────────────────────────────────────────────┐   │
│  │  Service: NotificationService                   │   │
│  │  File: services/notificationService.ts          │   │
│  │                                                 │   │
│  │  Orchestrates sending notifications             │   │
│  └─────────────────┬──────────────────────────────┘   │
│                    │                                    │
│                    ▼                                    │
│  ┌────────────────────────────────────────────────┐   │
│  │  Service: EmailService                          │   │
│  │  File: services/emailService.ts                 │   │
│  │                                                 │   │
│  │  • Uses Resend SDK                              │   │
│  │  • Generates HTML from templates                │   │
│  │  • Sends emails via Resend API                  │   │
│  └─────────────────┬──────────────────────────────┘   │
│                    │                                    │
└────────────────────┼────────────────────────────────────┘
                     │ HTTPS API Call
                     │ (Authorization: Bearer RESEND_API_KEY)
                     ▼
            ┌──────────────────┐
            │  Resend API      │ ← Email sending service
            │  resend.com      │
            └─────────┬────────┘
                      │
                      ▼
            ┌──────────────────┐
            │  User's Inbox    │ ← Gmail, Outlook, etc.
            └──────────────────┘
```

---

## 📍 Key Components

### **1. Cron-Job.org (External Scheduler)**
- **Purpose**: Triggers the backend endpoint on a schedule
- **Schedule**: Every hour at minute 0 (`0 * * * *`)
- **URL**: `https://momentumdiy-backend.onrender.com/api/notifications/automated/schedule`
- **Method**: POST
- **Why External?**: Render's free tier doesn't include built-in cron jobs

### **2. Backend API Endpoint**
- **File**: `backend/src/routes/automatedNotifications.ts`
- **Route**: `POST /api/notifications/automated/schedule`
- **Function**: Receives cron trigger and runs the scheduler

```typescript
router.post('/schedule', routeRateLimit(5), async (_req: Request, res: Response) => {
  try {
    logger.info('Checking scheduled notifications');
    await AutomatedNotificationsService.scheduleNotifications();
    return res.json({
      success: true,
      message: 'Scheduled notifications have been checked and processed'
    });
  } catch (error) {
    logger.error('Error running scheduled notifications', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to run scheduled notifications'
    });
  }
});
```

### **3. AutomatedNotificationsService**
- **File**: `backend/src/services/automatedNotificationsService.ts`
- **Purpose**: Determines which notifications to send based on time
- **Logic**:

```typescript
static async scheduleNotifications(): Promise<void> {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const hour = now.getHours();

  // Send weekly progress reports on Mondays at 9 AM
  if (dayOfWeek === 1 && hour === 9) {
    await this.sendWeeklyProgressReports();
  }

  // Send trial ending notifications daily at 10 AM
  if (hour === 10) {
    await this.sendTrialEndingNotifications();
  }

  // Send task reminders on Wednesdays at 2 PM
  if (dayOfWeek === 3 && hour === 14) {
    await this.sendTaskReminders();
  }
}
```

### **4. NotificationService**
- **File**: `backend/src/services/notificationService.ts`
- **Purpose**: Orchestrates the sending of different notification types
- **Functions**:
  - `sendWelcomeNotification(user)`
  - `sendOnboardingCompleteNotification(user, data)`
  - `sendTrialEndingNotification(user, daysLeft)`
  - `sendWeeklyProgressNotification(user, progressData)`
  - `sendTaskReminderNotification(user, taskName)`
  - etc.

### **5. EmailService**
- **File**: `backend/src/services/emailService.ts`
- **Purpose**: Low-level email sending using Resend SDK
- **Dependencies**:
  - Resend SDK (`import { Resend } from 'resend'`)
  - Email templates (`emailTemplates.ts`)
  - Environment config (needs `RESEND_API_KEY`)

```typescript
// Initialize Resend with API key
const resend = new Resend(ENV.resendApiKey);

// Send email
await resend.emails.send({
  from: `${BRANDING.name} <${BRANDING.email}>`,
  to: user.email,
  subject: 'Your subject here',
  html: emailContent,
});
```

### **6. Resend API**
- **Service**: Third-party email delivery service
- **Website**: https://resend.com
- **Purpose**: Handles actual email delivery
- **Authentication**: Uses API key (`RESEND_API_KEY`)
- **Features**:
  - Email delivery
  - Bounce handling
  - Delivery tracking
  - Email analytics

---

## 🔐 Environment Variables Required

### **On Render Backend:**

```bash
# Email Service
RESEND_API_KEY=re_your_resend_api_key_here

# Database (to fetch users)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App Config
NODE_ENV=production
PORT=3001
```

---

## 🔄 Data Flow: Complete Example

### **Example: Sending Weekly Progress Report**

**1. Cronjob Triggers (Monday, 9:00 AM)**
```
Cron-Job.org → POST https://momentumdiy-backend.onrender.com/api/notifications/automated/schedule
```

**2. Backend Receives Request**
```typescript
// routes/automatedNotifications.ts
router.post('/schedule', async (req, res) => {
  await AutomatedNotificationsService.scheduleNotifications();
  res.json({ success: true });
});
```

**3. Scheduler Checks Time**
```typescript
// services/automatedNotificationsService.ts
const dayOfWeek = now.getDay(); // 1 (Monday)
const hour = now.getHours();     // 9

if (dayOfWeek === 1 && hour === 9) {
  await this.sendWeeklyProgressReports(); // ✅ RUNS THIS
}
```

**4. Fetch Users from Database**
```typescript
// services/automatedNotificationsService.ts
const users = await supabase
  .from('profiles')
  .select('*')
  .eq('subscription_status', 'active')
  .eq('onboarding_completed', true);
```

**5. Get Progress Data for Each User**
```typescript
// services/automatedNotificationsService.ts
const progressData = {
  completedTasks: 8,
  totalTasks: 12,
  weekNumber: 3,
  trackName: 'Increase Local Foot Traffic'
};
```

**6. Send Notification**
```typescript
// services/notificationService.ts
await NotificationService.sendWeeklyProgressNotification(user, progressData);
```

**7. Generate Email Content**
```typescript
// services/emailService.ts
const emailContent = EmailTemplateFactory.createWeeklyProgressTemplate({
  name: user.name,
  completedTasks: 8,
  totalTasks: 12,
  weekNumber: 3,
  trackName: 'Increase Local Foot Traffic',
  progressPercentage: 67
});
```

**8. Send via Resend**
```typescript
// services/emailService.ts
await resend.emails.send({
  from: 'MomentumDIY <info@momentumdiy.com>',
  to: 'user@example.com',
  subject: '📊 Your Weekly Marketing Progress Report',
  html: emailContent
});
```

**9. Resend Delivers Email**
```
Resend API → User's Email Provider (Gmail, Outlook, etc.) → User's Inbox ✅
```

---

## ❌ What Was Broken?

### **The Issue:**
Your cronjob URL had an extra `http://` at the end:
```
https://momentumdiy-backend.onrender.com/api/notifications/automated/schedulehttp://
                                                                      ^^^^^^^^^ TYPO!
```

This caused:
- ❌ 404 Not Found error (route doesn't exist)
- ❌ Cronjob failed 26 times
- ❌ Cronjob automatically disabled
- ❌ No emails were sent

### **The Fix:**
Simply remove the extra `http://`:
```
https://momentumdiy-backend.onrender.com/api/notifications/automated/schedule
```

---

## ✅ How to Verify Everything Works

### **1. Check Backend is Running**
```bash
curl https://momentumdiy-backend.onrender.com/health
```
Should return: `{"status":"ok"}`

### **2. Test Notification Endpoint**
```bash
curl -X POST https://momentumdiy-backend.onrender.com/api/notifications/automated/schedule
```
Should return: `{"success":true,"message":"Scheduled notifications have been checked and processed"}`

### **3. Check Resend Dashboard**
- Go to: https://resend.com/emails
- Look for recently sent emails
- Verify they were delivered successfully

### **4. Check Backend Logs**
- Go to: Render Dashboard → Your Backend Service → Logs
- Look for:
  ```
  ✅ "Checking scheduled notifications"
  ✅ "Weekly progress report sent to user@example.com"
  ```

---

## 🎯 Notification Schedule Reference

| Notification Type | Day | Time | Frequency | Recipients |
|------------------|-----|------|-----------|------------|
| Weekly Progress Reports | Monday | 9 AM | Weekly | Active users with completed onboarding |
| Trial Ending Notifications | Every day | 10 AM | Daily | Users with trials ending in 7, 3, or 1 days |
| Task Reminders | Wednesday | 2 PM | Weekly | Users inactive for 3+ days with incomplete tasks |

**All times are in the server's timezone (typically UTC)**

---

## 🔧 Manual Testing Commands

```bash
# Test specific notification types (don't wait for schedule)
curl -X POST https://momentumdiy-backend.onrender.com/api/notifications/automated/weekly-progress
curl -X POST https://momentumdiy-backend.onrender.com/api/notifications/automated/trial-ending
curl -X POST https://momentumdiy-backend.onrender.com/api/notifications/automated/task-reminders

# Test all notifications at once
curl -X POST https://momentumdiy-backend.onrender.com/api/notifications/automated/run-all
```

---

## 📚 Related Files

- `backend/src/routes/automatedNotifications.ts` - API endpoints
- `backend/src/services/automatedNotificationsService.ts` - Scheduling logic
- `backend/src/services/notificationService.ts` - Notification orchestration
- `backend/src/services/emailService.ts` - Email sending
- `backend/src/services/emailTemplates.ts` - Email HTML templates
- `backend/src/config/environment.ts` - Environment configuration
- `backend/src/config/branding.ts` - Branding configuration

---

## 🎉 Summary

Your email automation system is **fully functional** and properly integrated:

✅ **Cronjob** (cron-job.org) triggers the backend every hour  
✅ **Backend** checks time and sends appropriate notifications  
✅ **Supabase** provides user data  
✅ **Resend** delivers emails to users  
✅ **Templates** create beautiful, branded emails  
✅ **Logging** tracks all activities  
✅ **Error handling** ensures reliability  

The only issue was the malformed URL in your cronjob configuration. Once you fix that, everything will work perfectly! 🚀


