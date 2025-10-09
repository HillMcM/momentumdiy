# ⚡ Quick Fix: Cronjob Email Issue

## 🔴 The Problem
Your cronjob URL has a typo - extra `http://` at the end causing 404 errors.

## 🟢 The Solution

### **1. Fix the URL (5 seconds)**

**Go to:** https://cron-job.org/  
**Change URL from:**
```
https://momentumdiy-backend.onrender.com/api/notifications/automated/schedulehttp://
```
**To:**
```
https://momentumdiy-backend.onrender.com/api/notifications/automated/schedule
```

### **2. Verify Resend API Key (2 minutes)**

**Go to:** https://dashboard.render.com/  
**Check Environment Variables:**
- Find your `momentumdiy-backend` service
- Go to "Environment" tab
- Verify `RESEND_API_KEY` exists
- If missing, add it from: https://resend.com/api-keys

### **3. Test It (30 seconds)**

**Run this command:**
```bash
curl -X POST https://momentumdiy-backend.onrender.com/api/notifications/automated/schedule
```

**Should return:**
```json
{"success": true, "message": "Scheduled notifications have been checked and processed"}
```

### **4. Re-Enable Cronjob**
Back on cron-job.org, click "Enable" to restart your cronjob.

---

## ✅ Done!
Your automated emails should now work properly. Check Resend dashboard to see emails being sent: https://resend.com/emails

## 📚 Need More Info?
See the full guide: `CRONJOB_FIX_GUIDE.md`


