# Deployment Steps for Security Updates

**Date:** October 13, 2025  
**Commit:** dcac4d7f  
**Status:** Code Pushed ✅ | Database Migration Pending

---

## ✅ Step 1: Code Deployment - COMPLETE

**Git Push:**
```bash
✅ Committed 44 files with 2669 insertions
✅ Pushed to origin/main
✅ Commit: dcac4d7f
```

**What Was Deployed:**
- Security improvements (0 vulnerabilities)
- Authentication middleware
- Admin configuration
- Input validation & sanitization
- Improved RLS policies (SQL file)
- Test files
- Complete documentation

---

## 🔄 Step 2: Automatic Deployments

Your CI/CD should automatically deploy:

### Frontend (Vercel)
- ✅ Will auto-deploy from main branch
- Check: https://vercel.com/hillarys-projects-[...]/momentumdiy
- Verify: Build logs show successful deployment

### Backend (Render)
- ✅ Will auto-deploy from main branch
- Check: https://dashboard.render.com
- Verify: Build logs show successful deployment

**Wait 3-5 minutes for automatic deployments to complete.**

---

## 📊 Step 3: Database Migration - ACTION REQUIRED

You need to apply the new RLS policies to your production database.

### Option A: Via Supabase Dashboard (Recommended)

1. Go to: https://supabase.com/dashboard/project/[your-project-id]
2. Navigate to: **SQL Editor**
3. Click: **New Query**
4. Copy the contents of: `supabase/migrations/20251013000000_improve_rls_policies.sql`
5. Paste into the SQL Editor
6. Click: **Run**
7. Verify: "Success. No rows returned"

### Option B: Via Supabase CLI

```bash
# Make sure you're logged in
supabase login

# Link to your production project
supabase link --project-ref [your-project-ref]

# Apply the migration
supabase db push

# Verify the migration
supabase db remote commit pull
```

### What This Migration Does:
- ✅ Strengthens user data isolation
- ✅ Fixes overly permissive RLS policies
- ✅ Adds RLS to new tables
- ✅ Improves security for projects, tasks, calendar, assets
- ✅ Safe to run (idempotent - won't break existing data)

---

## 🔐 Step 4: Environment Variables - ACTION REQUIRED

Add the new environment variable to your production backends:

### Backend Environment (Render)

1. Go to: https://dashboard.render.com
2. Select your backend service
3. Navigate to: **Environment**
4. Add new variable:
   ```
   Key: ADMIN_EMAILS
   Value: info@hillaryedenmcmullen.com,hillary@momentumdiy.com,admin@momentumdiy.com
   ```
5. Click: **Save Changes**
6. Backend will auto-redeploy

### Optional: Sentry (Recommended)

If you want error monitoring:
```
Key: SENTRY_DSN
Value: [your-sentry-dsn-from-sentry.io]

Key: SENTRY_TRACES_SAMPLE_RATE
Value: 0.1
```

---

## ✅ Step 5: Verification Checklist

After deployments complete (5-10 minutes), verify:

### Frontend Verification
```bash
# Check the deployed site
curl https://[your-frontend-url]

# Should return 200 OK with HTML
```

### Backend Verification
```bash
# Health check
curl https://[your-backend-url]/health

# Should return:
# {"success":true,"message":"Server is running","timestamp":"...","environment":"production"}
```

### Database Verification (via Supabase Dashboard)

1. Go to: **Database** → **Tables** → **profiles**
2. Click: **Policies**
3. Verify you see:
   - ✅ "Users can view own profile"
   - ✅ "Users can update own profile"
   - ✅ "Users can insert own profile"

4. Check **tasks** table:
   - ✅ Should have "Users can view own tasks" (not "Authenticated users can access tasks")

### Authentication Verification

Test login:
1. Go to your app
2. Sign in with your account
3. Verify you can see your data
4. Open browser console (F12)
5. Should see no errors

### RLS Verification (Important!)

Test with two different user accounts:

**User A Test:**
1. Login as User A
2. Create a task
3. Note the task ID

**User B Test:**
1. Login as User B
2. Try to directly access User A's task (via API or database)
3. ✅ **Should be blocked** - User B should NOT see User A's data

If you can only see your own data, RLS is working! ✅

---

## 🎯 Step 6: Monitor for Issues

### First 24 Hours

Watch for:
- [ ] Sentry errors (if configured)
- [ ] User authentication issues
- [ ] Data access problems
- [ ] Performance issues

### Sentry Dashboard (if configured)
- Check: https://sentry.io/[your-org]/[your-project]
- Look for: New errors after deployment

### Backend Logs (Render)
- Go to: Service → **Logs**
- Look for: Errors or warnings
- Verify: "Server is running" messages

---

## 🚨 Rollback Plan (If Needed)

If you encounter critical issues:

### Quick Rollback

```bash
# Revert the commit
git revert dcac4d7f

# Push to trigger redeployment
git push origin main
```

### Database Rollback (RLS Policies)

If RLS causes issues:

1. Go to Supabase SQL Editor
2. Run:
```sql
-- Temporarily disable RLS on a specific table if needed
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;

-- Re-enable after fixing
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
```

**Note:** Only disable RLS as a temporary emergency measure!

---

## 📞 Support

### If You Encounter Issues:

1. **Check Logs First:**
   - Render backend logs
   - Vercel build logs
   - Browser console (F12)

2. **Common Issues:**

   **Issue:** Users can't see their data
   - **Cause:** RLS policy too restrictive
   - **Fix:** Check user_id matches auth.uid()

   **Issue:** Admin emails not working
   - **Cause:** ADMIN_EMAILS not set
   - **Fix:** Add environment variable in Render

   **Issue:** Build failed
   - **Cause:** TypeScript errors
   - **Fix:** Check build logs, verify types

3. **Get Help:**
   - Review: `SECURITY_AUDIT_COMPLETE.md`
   - Review: `API_DOCUMENTATION.md`
   - Check: Recent commits for changes

---

## 🎉 Success Criteria

Deployment is complete when:

- ✅ Frontend deployed and accessible
- ✅ Backend deployed and health check passes
- ✅ Database migration applied
- ✅ ADMIN_EMAILS environment variable set
- ✅ Users can login and access their data
- ✅ RLS policies preventing cross-user data access
- ✅ No critical errors in logs
- ✅ All features working as expected

---

## 📊 Deployment Status

Update this checklist as you complete each step:

- [x] Git commit created
- [x] Code pushed to GitHub
- [ ] Frontend auto-deployment verified
- [ ] Backend auto-deployment verified  
- [ ] Database migration applied
- [ ] ADMIN_EMAILS environment variable added
- [ ] Health checks passing
- [ ] Authentication tested
- [ ] RLS policies verified
- [ ] No critical errors in logs

---

## Next Steps After Deployment

1. **Monitor** for 24-48 hours
2. **Test** all critical user flows
3. **Verify** RLS with multiple user accounts
4. **Check** Sentry for any new errors (if configured)
5. **Review** `AUDIT_ACCOMPLISHMENTS.md` for what changed

---

**Deployment initiated:** October 13, 2025  
**Expected completion:** 15-20 minutes (after manual steps)  
**Documentation:** See SECURITY_AUDIT_COMPLETE.md for details

