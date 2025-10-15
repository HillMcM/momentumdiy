# 🔍 Deployment Verification Checklist

**Issue:** Dashboard shows old data (Aug 5th) instead of real-time Supabase data

---

## 📊 WHAT USER IS SEEING

**API Response:**
```json
{
  "contentCreated": 20,
  "totalExecutions": 50,
  "lastExecution": "2025-08-05T00:14:07.937Z"  // ← OLD DATA from August!
}
```

**This indicates:**
- ❌ Backend is NOT using new Supabase code
- ❌ Still using old JSON file storage
- ❌ Latest deployment didn't go live

---

## ✅ VERIFICATION STEPS

### **Step 1: Find Correct Render Service**

The service ID `srv-d3nt3npgv73c73f6mi10` doesn't exist.

**Action Needed:**
1. Go to https://dashboard.render.com/
2. Find the service running at `admin.momentumdiy.com`
3. Click on it
4. Copy the service ID from URL: `https://dashboard.render.com/web/[SERVICE_ID_HERE]`

---

### **Step 2: Check Current Deployment**

Once we have the correct service ID:

**Check:**
- What commit is currently deployed?
- Is it `5f19d64f` (our latest)?
- Or an older commit?

**Expected Latest Commit:** `5f19d64f - Fix deployment error - Add missing meta-posting-integration.js`

---

### **Step 3: Check Environment Variables**

The new code requires Supabase environment variables:

**Required in Render:**
```
SUPABASE_URL=https://[your-project].supabase.co
SUPABASE_ANON_KEY=eyJh...
```

**If these are missing:**
- Code will crash trying to connect to Supabase
- Might fall back to old JSON file system
- Would explain why we're seeing old data

---

### **Step 4: Check Render Build Logs**

Look for these indicators:

**✅ Good Signs:**
```
==> Checking out commit 5f19d64f
==> Running build command 'cd admin && npm install'
==> Build successful 🎉
==> Running 'cd admin && node src/index.js'
Server started successfully on port 10000
Supabase client initialized successfully
```

**❌ Bad Signs:**
```
Error: Cannot find module '../database/supabase-client'
Falling back to file-based storage
Database connection failed
```

---

## 🚨 MOST LIKELY CAUSES

### **Cause 1: Wrong Git Branch Deployed**

**Symptom:** Render is deploying `main` branch instead of `ai-agents` branch

**Check:**
- Render → Service → Settings → Branch
- Should be: `ai-agents`
- Might be: `main` (would deploy old code)

**Fix:**
1. Go to Render service settings
2. Change branch to `ai-agents`
3. Save and redeploy

---

### **Cause 2: Missing Supabase Environment Variables**

**Symptom:** New code runs but can't connect to Supabase, falls back to old storage

**Check:**
- Render → Service → Environment
- Look for `SUPABASE_URL` and `SUPABASE_ANON_KEY`

**Fix:**
1. Add missing environment variables
2. Redeploy service

---

### **Cause 3: Build Path Issue**

**Symptom:** Render is building from wrong directory

**Check:**
- Render → Service → Settings → Build Command
- Should be: `cd admin && npm install`
- Start Command should be: `cd admin && node src/index.js`

**Fix:**
1. Verify commands are correct
2. Make sure `/admin` folder exists in repo
3. Redeploy

---

### **Cause 4: Old Deployment Still Running**

**Symptom:** New deployment succeeded but old container still serving traffic

**Check:**
- Render → Service → Logs
- Look for recent restarts
- Check timestamp of "Server started" message

**Fix:**
1. Manual restart from Render dashboard
2. Or trigger new deployment with empty commit:
```bash
git commit --allow-empty -m "Force redeploy"
git push origin ai-agents
```

---

## 🔧 QUICK FIXES TO TRY

### **Quick Fix 1: Force Redeploy**

```bash
cd /Users/hillmcm/momentumdiy-admin-deploy
git commit --allow-empty -m "Force redeploy with latest code"
git push origin ai-agents
```

---

### **Quick Fix 2: Manual Restart**

In Render dashboard:
1. Find the service
2. Click "Manual Deploy"
3. Select branch: `ai-agents`
4. Deploy latest commit

---

### **Quick Fix 3: Check API Health Endpoint**

Test this URL:
```
https://admin.momentumdiy.com/api/dashboard/status
```

**Expected Response:**
```json
{
  "system": "healthy",
  "agents": "all_operational",
  "database": "connected",
  "externalApis": "partial_available"
}
```

**If database shows "disconnected":**
- Supabase env vars missing or wrong
- Database tables don't exist

---

## 📋 IMMEDIATE ACTION PLAN

**Do These In Order:**

1. **Find correct Render service ID**
   - Go to https://dashboard.render.com/
   - Click on the service running admin.momentumdiy.com
   - Share the service ID with me

2. **Check deployed branch**
   - In service settings, verify branch = `ai-agents`
   - If it's `main`, change it to `ai-agents`

3. **Check environment variables**
   - Look for `SUPABASE_URL` and `SUPABASE_ANON_KEY`
   - If missing, add them

4. **Check deployment logs**
   - Look for "Server started successfully"
   - Check timestamp - is it recent?

5. **Force redeploy if needed**
   - If all settings correct, trigger manual deploy

---

## 🎯 EXPECTED RESULT AFTER FIX

Once the NEW code is deployed with Supabase, the API should return:

```json
{
  "todayJobs": 0,  // ← Today's actual jobs
  "activeAgents": 7,
  "resourcesUsed": "0.0000",
  "contentCreated": 0,  // ← Should be 0 (fresh start)
  "totalExecutions": 0,  // ← Should be 0 (fresh Supabase DB)
  "successRate": "0%",  // ← Or N/A
  "lastExecution": null  // ← Should be null or very recent
}
```

**Key Indicators:**
- `contentCreated` should be 0 (unless you ran workflows)
- `totalExecutions` should be 0 (fresh Supabase)
- `lastExecution` should be null or from today

---

**Once you share the correct service ID and check these settings, I can provide the exact fix!**

