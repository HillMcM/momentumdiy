# Email System Verification Guide

## How to Verify Emails Are Actually Being Sent

### 1. Check Backend Logs

When the cron job runs, look for these log entries:

#### When Emails ARE Sent:
```
Starting task reminder notifications
Found active users for task reminders: { count: 5 }
Task reminder sent: { userEmail: 'user@example.com', daysInactive: 3, ... }
Task reminder notifications completed: { totalUsers: 5, usersChecked: 5, emailsSent: 2, emailsSkipped: 3, errors: 0 }
```

#### When No Emails Are Sent (but system is working):
```
Starting task reminder notifications
Found active users for task reminders: { count: 5 }
Task reminder notifications completed: { totalUsers: 5, usersChecked: 5, emailsSent: 0, emailsSkipped: 5, errors: 0 }
```

**Key metrics to look for:**
- `emailsSent`: Number of emails actually sent
- `emailsSkipped`: Number skipped (not at interval, preferences disabled, etc.)
- `errors`: Should be 0 if everything is working

### 2. Check Resend Dashboard

The most reliable way to verify emails are being sent:

1. **Go to Resend Dashboard**: https://resend.com/emails
2. **Check the "Emails" section** for recent sends
3. **Look for**:
   - Email addresses (your users)
   - Status: "Delivered" or "Bounced"
   - Subject lines: "Task Reminder", "Weekly Progress Report", etc.
   - Timestamps matching when cron ran

**Note**: Emails may show in Resend even if they're filtered to spam. Check your email's spam folder too!

### 3. Understand Why Emails Might Not Be Sent

#### Task Reminders:
- Only sent at specific inactivity intervals: **3, 7, 12, 17, or 24 days**
- Only for users with incomplete tasks
- Only at **2 PM** (14:00) daily
- User must have `task_reminders` preference enabled (default: true)

#### Weekly Progress Reports:
- Only sent on **Mondays at 9 AM**
- Only for users with completed onboarding
- User must have `weekly_progress` preference enabled (default: true)
- User must have progress data (active track)

#### Trial Ending Notifications:
- Sent daily at **10 AM**
- Only when trial ends in exactly **7, 3, or 1 days**
- Always sent (preferences can't disable trial emails)

### 4. Test Email System Manually

Test sending emails directly to verify the system works:

```bash
# Test all notification types at once
curl -X POST https://momentumdiy-backend.onrender.com/api/notifications/automated/run-all

# Test specific types
curl -X POST https://momentumdiy-backend.onrender.com/api/notifications/automated/task-reminders
curl -X POST https://momentumdiy-backend.onrender.com/api/notifications/automated/weekly-progress
curl -X POST https://momentumdiy-backend.onrender.com/api/notifications/automated/trial-ending
```

Then check:
1. Backend logs for email sending messages
2. Resend dashboard for sent emails
3. Your inbox (check spam too!)

### 5. Common Reasons No Emails Are Sent

✅ **System Working Correctly**:
- No users match criteria (e.g., no one inactive for 3+ days)
- Not the right time (e.g., not Monday 9 AM for weekly reports)
- All tasks completed (no incomplete tasks to remind about)

❌ **System Issues**:
- `RESEND_API_KEY` not configured → Check logs for "Email service not configured"
- Invalid email addresses → Check logs for "Invalid email address"
- Domain not verified in Resend → Emails will fail to send
- Environment variables missing → Check cron job settings

### 6. Verify Your Account Gets Emails

To test with your own account:

1. **Check your profile in the app**:
   - Go to your profile/settings
   - Verify email preferences are enabled
   - Verify you have an active track

2. **Check your activity**:
   - Task reminders only send if you're inactive 3, 7, 12, 17, or 24 days
   - Weekly progress only sends on Mondays at 9 AM
   - Trial ending only sends at 7, 3, or 1 days before trial ends

3. **Test manually** (for your account):
   ```bash
   # This will check the schedule and send if conditions are met
   curl -X POST https://momentumdiy-backend.onrender.com/api/notifications/automated/schedule
   ```

### 7. What the Logs Tell You

When cron runs at a time when NO emails are scheduled:

```
Evaluating notification schedule: { dayOfWeek: 2, hour: 2, minute: 44, dayName: 'Tuesday' }
Skipping weekly progress reports - not Monday 9 AM
Skipping trial ending notifications - not 10 AM
Skipping task reminders - not 2 PM
No notifications scheduled for this time. Schedule: Weekly reports (Mon 9 AM), Trial ending (Daily 10 AM), Task reminders (Daily 2 PM)
Scheduled notifications completed
```

**This is normal!** The cron runs every hour, but only sends emails at specific times.

When emails ARE sent:

```
Evaluating notification schedule: { dayOfWeek: 1, hour: 9, minute: 0, dayName: 'Monday' }
Triggering weekly progress reports
Starting weekly progress reports
Found active users for weekly reports: { count: 3 }
Weekly progress report sent: { userEmail: 'user1@example.com' }
Weekly progress report sent: { userEmail: 'user2@example.com' }
Weekly progress reports completed: { totalUsers: 3, emailsSent: 2, emailsSkipped: 1, errors: 0 }
```

## Summary

To verify emails are working:
1. ✅ Check Resend dashboard - **Most reliable** (shows all sent emails)
2. ✅ Check backend logs - Shows what the system attempted
3. ✅ Check your inbox (and spam folder)
4. ✅ Test manually via API to trigger immediately

The cron job running successfully just means the scheduler is working. Actual email sending happens when:
- It's the right time (Mon 9 AM, Daily 10 AM, Daily 2 PM)
- Users match the criteria
- Email service is configured correctly

