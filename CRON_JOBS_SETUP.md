# 🕐 Cron Jobs Setup Guide for Automated Email Notifications

This guide explains how to set up cron jobs to automatically run our email notification system in production.

## 📋 **What We Need to Schedule**

Our automated notification system has three types of emails that need to be scheduled:

1. **Weekly Progress Reports** - Every Monday at 9 AM
2. **Trial Ending Notifications** - Daily at 10 AM  
3. **Task Reminders** - Every Wednesday at 2 PM

## 🖥️ **Option 1: Server-Based Cron Jobs (Recommended)**

### **Step 1: Access Your Production Server**

If you're using Render, Vercel, or another cloud provider, you'll need to set up a separate server or use their cron job features.

### **Step 2: Set Up the Environment**

```bash
# Create a directory for our cron jobs
mkdir -p /opt/momentumdiy/cron
cd /opt/momentumdiy/cron

# Clone your repository (or copy the backend files)
git clone https://github.com/HillMcM/momentumdiy.git
cd momentumdiy/backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your production values:
# - RESEND_API_KEY=your_resend_key
# - SUPABASE_URL=your_supabase_url
# - SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **Step 3: Create Cron Job Script**

```bash
# Create a wrapper script
sudo nano /opt/momentumdiy/cron/run-notifications.sh
```

```bash
#!/bin/bash

# Set the working directory
cd /opt/momentumdiy/momentumdiy/backend

# Load environment variables
source .env

# Run the notifications
echo "$(date): Running automated notifications" >> /var/log/momentumdiy-notifications.log
npm run automated-notifications schedule >> /var/log/momentumdiy-notifications.log 2>&1
echo "$(date): Completed automated notifications" >> /var/log/momentumdiy-notifications.log
```

```bash
# Make the script executable
sudo chmod +x /opt/momentumdiy/cron/run-notifications.sh
```

### **Step 4: Set Up Cron Jobs**

```bash
# Edit the crontab
sudo crontab -e
```

Add these lines:

```bash
# Weekly Progress Reports - Every Monday at 9 AM
0 9 * * 1 cd /opt/momentumdiy/momentumdiy/backend && npm run automated-notifications weekly-progress >> /var/log/momentumdiy-weekly.log 2>&1

# Trial Ending Notifications - Daily at 10 AM
0 10 * * * cd /opt/momentumdiy/momentumdiy/backend && npm run automated-notifications trial-ending >> /var/log/momentumdiy-trial.log 2>&1

# Task Reminders - Every Wednesday at 2 PM
0 14 * * 3 cd /opt/momentumdiy/momentumdiy/backend && npm run automated-notifications task-reminders >> /var/log/momentumdiy-tasks.log 2>&1

# Or use the unified scheduler (recommended)
0 * * * * /opt/momentumdiy/cron/run-notifications.sh
```

## ☁️ **Option 2: Cloud-Based Cron Jobs**

### **Using Render Cron Jobs**

If your backend is hosted on Render, you can use their cron job feature:

1. **Go to your Render dashboard**
2. **Create a new Cron Job**
3. **Configure it with these settings:**

```bash
# Command
npm run automated-notifications schedule

# Schedule (every hour)
0 * * * *

# Environment variables (same as your web service)
RESEND_API_KEY=your_resend_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **Using Vercel Cron Jobs**

Add this to your `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/notifications/automated/schedule",
      "schedule": "0 * * * *"
    }
  ]
}
```

### **Using GitHub Actions**

Create `.github/workflows/notifications.yml`:

```yaml
name: Automated Notifications

on:
  schedule:
    # Run every hour
    - cron: '0 * * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  send-notifications:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd backend
          npm install
          
      - name: Run automated notifications
        run: |
          cd backend
          npm run automated-notifications schedule
        env:
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

## 🔧 **Option 3: External Cron Service**

### **Using Cron-job.org (Free)**

1. **Go to [cron-job.org](https://cron-job.org)**
2. **Create a free account**
3. **Set up these cron jobs:**

```bash
# Weekly Progress Reports
URL: https://momentumdiy-backend.onrender.com/api/notifications/automated/weekly-progress
Method: POST
Schedule: 0 9 * * 1 (Every Monday at 9 AM)

# Trial Ending Notifications  
URL: https://momentumdiy-backend.onrender.com/api/notifications/automated/trial-ending
Method: POST
Schedule: 0 10 * * * (Every day at 10 AM)

# Task Reminders
URL: https://momentumdiy-backend.onrender.com/api/notifications/automated/task-reminders
Method: POST
Schedule: 0 14 * * 3 (Every Wednesday at 2 PM)
```

### **Using EasyCron (Paid)**

Similar setup to cron-job.org but with more features and reliability.

## 📊 **Monitoring & Logging**

### **Check Cron Job Status**

```bash
# View cron job logs
sudo tail -f /var/log/momentumdiy-notifications.log

# Check if cron is running
sudo systemctl status cron

# View cron jobs
sudo crontab -l
```

### **Test Your Setup**

```bash
# Test the notification script manually
cd /path/to/backend
npm run automated-notifications schedule

# Test specific notification types
npm run automated-notifications weekly-progress
npm run automated-notifications trial-ending
npm run automated-notifications task-reminders
```

### **Monitor Email Delivery**

1. **Check Resend dashboard** for email delivery statistics
2. **Monitor your application logs** for notification success/failure
3. **Set up alerts** for failed notifications

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Cron jobs not running:**
   ```bash
   # Check cron service status
   sudo systemctl status cron
   
   # Restart cron service
   sudo systemctl restart cron
   ```

2. **Environment variables not loading:**
   ```bash
   # Make sure .env file is in the correct location
   # Check file permissions
   ls -la .env
   ```

3. **Permission errors:**
   ```bash
   # Make sure the script is executable
   chmod +x /path/to/script.sh
   
   # Check file ownership
   ls -la /path/to/script.sh
   ```

4. **Node.js not found:**
   ```bash
   # Use full path to node
   /usr/bin/node /path/to/script.js
   
   # Or add node to PATH in cron
   PATH=/usr/local/bin:/usr/bin:/bin
   ```

### **Debug Mode**

Add debugging to your cron jobs:

```bash
# Add verbose logging
0 9 * * 1 cd /path/to/backend && npm run automated-notifications weekly-progress >> /var/log/debug.log 2>&1 && echo "$(date): Weekly progress completed" >> /var/log/debug.log
```

## 🎯 **Recommended Setup**

For production, I recommend:

1. **Use the unified scheduler** (`npm run automated-notifications schedule`) that runs every hour
2. **Set up proper logging** to track success/failure
3. **Use a dedicated server** or cloud cron service
4. **Monitor email delivery rates** through Resend dashboard
5. **Set up alerts** for failed notifications

## 📈 **Scaling Considerations**

As your user base grows:

1. **Monitor performance** - large user bases may need longer execution times
2. **Consider rate limiting** - ensure you don't exceed email service limits
3. **Batch processing** - for very large user bases, consider batching notifications
4. **Load balancing** - distribute cron jobs across multiple servers if needed

---

## 🎉 **You're All Set!**

With this setup, your automated email notification system will run reliably in production, keeping your users engaged and informed about their marketing progress! 🚀
