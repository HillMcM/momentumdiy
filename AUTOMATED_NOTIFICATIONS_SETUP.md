# 🤖 Automated Notifications Setup Guide

This guide explains how to set up and use the automated email notification system for MomentumDIY.

## 📧 What's Included

### ✅ **Weekly Progress Reports**
- **When**: Every Monday at 9 AM
- **Who**: Active users (trial or paid subscribers who completed onboarding)
- **What**: Progress summary including completed tasks, current week, and track name

### ✅ **Trial Ending Notifications**
- **When**: Daily at 10 AM (checks for users whose trial ends in 7, 3, or 1 days)
- **Who**: Users with active trials
- **What**: Reminder emails with days remaining and upgrade prompts

### ✅ **Task Reminders**
- **When**: Every Wednesday at 2 PM
- **Who**: Users who haven't been active for 3+ days and have incomplete tasks
- **What**: Gentle reminders to continue their marketing journey

## 🚀 How to Use

### **Manual Triggers (Development/Testing)**

```bash
# Run all automated notifications
npm run automated-notifications

# Run specific notification types
npm run automated-notifications -- weekly-progress
npm run automated-notifications -- trial-ending
npm run automated-notifications -- task-reminders
npm run automated-notifications -- schedule
```

### **API Endpoints**

```bash
# Trigger all notifications
POST /api/notifications/automated/run-all

# Trigger specific types
POST /api/notifications/automated/weekly-progress
POST /api/notifications/automated/trial-ending
POST /api/notifications/automated/task-reminders
POST /api/notifications/automated/schedule
```

### **Production Scheduling**

For production deployment, set up a cron job to run the scheduled notifications:

```bash
# Add to crontab (crontab -e)
# Run scheduled notifications every hour
0 * * * * cd /path/to/backend && npm run automated-notifications schedule

# Or run specific notifications at specific times
0 9 * * 1 cd /path/to/backend && npm run automated-notifications weekly-progress
0 10 * * * cd /path/to/backend && npm run automated-notifications trial-ending
0 14 * * 3 cd /path/to/backend && npm run automated-notifications task-reminders
```

## 🔧 Configuration

### **Environment Variables Required**

```env
# Email service (Resend)
RESEND_API_KEY=your_resend_api_key

# Database (Supabase)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **Email Templates**

The system uses existing email templates from `EmailService`:
- `welcome` - Welcome email for new users
- `weekly_progress` - Weekly progress reports
- `trial_ending` - Trial ending reminders
- `task_reminder` - Task completion reminders

## 📊 How It Works

### **User Selection Logic**

1. **Weekly Progress Reports**: 
   - Users with `subscription_status` = 'active' or 'trial'
   - Users who have completed onboarding (`onboarding_completed = true`)
   - Users with active marketing goals

2. **Trial Ending Notifications**:
   - Users with `subscription_status` = 'trial'
   - Users whose `trial_end_date` is 7, 3, or 1 days away

3. **Task Reminders**:
   - Active users (same as weekly progress)
   - Users who haven't completed tasks in 3+ days
   - Users with incomplete tasks in their active track

### **Progress Data Collection**

The system automatically calculates:
- **Completed Tasks**: Tasks with `status = 'completed'` in user's active marketing track
- **Total Tasks**: All tasks in user's active marketing track
- **Current Week**: From the active marketing goal's `currentWeek`
- **Track Name**: From the active marketing goal's `title`
- **Last Activity**: Date of most recently completed task

## 🧪 Testing

### **Test with Sample Data**

1. **Create test users** in your database with different subscription statuses
2. **Run manual triggers** to test each notification type
3. **Check email delivery** in your Resend dashboard
4. **Verify email content** matches expected templates

### **Test Commands**

```bash
# Test all notifications
curl -X POST http://localhost:3001/api/notifications/automated/run-all

# Test specific notification type
curl -X POST http://localhost:3001/api/notifications/automated/weekly-progress
```

## 🚨 Monitoring

### **Logs to Watch**

- ✅ `📧 Weekly progress report sent to {email}`
- ✅ `📧 Trial ending email sent to {email} ({days} days left)`
- ✅ `📧 Task reminder sent to {email} ({days} days inactive)`
- ❌ `❌ Error sending weekly report to {email}: {error}`

### **Error Handling**

The system includes comprehensive error handling:
- Individual user failures don't stop the entire process
- Detailed logging for debugging
- Graceful fallbacks for missing data

## 🔄 Maintenance

### **Regular Tasks**

1. **Monitor email delivery rates** in Resend dashboard
2. **Check logs** for failed notifications
3. **Update email templates** as needed
4. **Adjust timing** based on user engagement data

### **Scaling Considerations**

- **Rate limiting**: Already implemented (5-10 requests per endpoint)
- **Database queries**: Optimized with proper indexing
- **Email service limits**: Respects Resend's rate limits
- **Error recovery**: Continues processing even if individual emails fail

## 📈 Analytics

Track the effectiveness of your notifications:

1. **Email open rates** (via Resend dashboard)
2. **User engagement** after receiving notifications
3. **Trial conversion rates** from ending notifications
4. **Task completion rates** after reminders

## 🆘 Troubleshooting

### **Common Issues**

1. **No emails being sent**:
   - Check `RESEND_API_KEY` environment variable
   - Verify Supabase connection
   - Check user data in database

2. **Wrong recipients**:
   - Verify user subscription status
   - Check onboarding completion status
   - Confirm active marketing goals exist

3. **Missing progress data**:
   - Ensure marketing tracks are properly set up
   - Check task completion status
   - Verify user has active goals

### **Debug Commands**

```bash
# Check user data
npm run test-supabase-connection

# Test email service
curl -X POST http://localhost:3001/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","type":"welcome"}'

# Check notification service logs
tail -f logs/notifications.log
```

---

## 🎉 Success!

Your automated notification system is now set up and ready to engage users with timely, relevant communications that drive engagement and conversion! 🚀
