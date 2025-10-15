# 🚀 Deployment Guide

Complete guide for deploying MomentumDIY to production.

---

## 📋 Pre-Deployment Checklist

### Code Quality
- [ ] All linter errors resolved
- [ ] TypeScript compiles without errors
- [ ] No console errors in browser
- [ ] All tests passing

### Environment Variables
- [ ] Backend environment variables configured
- [ ] Frontend environment variables configured
- [ ] Database connection strings updated
- [ ] API keys validated

### Database
- [ ] Migrations reviewed
- [ ] Backup created
- [ ] RLS policies tested
- [ ] Indexes optimized

### Services
- [ ] Stripe webhooks configured
- [ ] Email templates tested
- [ ] Sentry DSN configured
- [ ] Cron jobs scheduled

---

## 🏗 Infrastructure Setup

### 1. Supabase (Database)

**Setup:**
1. Create project at [supabase.com](https://supabase.com)
2. Get connection credentials
3. Enable RLS on all tables
4. Run migrations

**Migrations:**
```bash
# Connect to production
supabase link --project-ref <your-project-ref>

# Push migrations
supabase db push
```

**Environment Variables:**
```bash
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

---

### 2. Render (Backend)

**Setup:**
1. Create new Web Service
2. Connect GitHub repository
3. Configure build settings:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Branch**: `main`
   - **Root Directory**: `backend`

**Environment Variables:**
Add all variables from `backend/env.example`:
- `NODE_ENV=production`
- `PORT=3001`
- Supabase credentials
- Stripe keys
- Anthropic API key
- Resend API key
- Sentry DSN

**Health Check:**
- Path: `/health`
- Expected: 200 OK

**Cron Jobs (if using Render Cron):**
```yaml
# In render.yaml
jobs:
  - type: cron
    name: affiliate-payouts
    schedule: "0 0 1 * *"  # First of month
    buildCommand: npm install
    startCommand: npm run process-affiliate-payouts
```

---

### 3. Vercel (Frontend)

**Setup:**
1. Import project from GitHub
2. Configure build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
   - **Root Directory**: `Frontend`

**Environment Variables:**
Add all variables from `Frontend/.env.example`:
- `VITE_API_BASE_URL`
- `VITE_BACKEND_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- Branding variables (optional)

**Domains:**
- Add custom domain in Vercel dashboard
- Configure DNS records
- Enable HTTPS (automatic)

**Analytics:**
- Vercel Analytics enabled automatically
- Speed Insights enabled automatically

---

### 4. Stripe (Payments)

**Setup:**
1. Create products and prices in Stripe Dashboard
2. Configure webhook endpoint: `https://your-backend.onrender.com/api/stripe/webhook`
3. Copy webhook secret
4. Test webhook delivery

**Webhook Events:**
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

**Environment Variables:**
```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_ANNUAL=price_...
```

---

### 5. Resend (Email)

**Setup:**
1. Create account at [resend.com](https://resend.com)
2. Verify your domain
3. Get API key
4. Test email delivery

**Environment Variables:**
```bash
RESEND_API_KEY=re_...
BRAND_EMAIL=hello@yourdomain.com
```

---

### 6. Sentry (Monitoring)

**Setup:**
1. Create project at [sentry.io](https://sentry.io)
2. Get DSN
3. Configure source maps (optional)

**Environment Variables:**
```bash
SENTRY_DSN=https://...@sentry.io/...
```

---

## 🔄 Deployment Process

### Step 1: Commit and Push

```bash
# Check status
git status

# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: your feature description"

# Push to main
git push origin main
```

### Step 2: Monitor Deployments

**Backend (Render):**
1. Go to Render dashboard
2. Watch build logs
3. Wait for "Deploy succeeded"
4. Check health endpoint

**Frontend (Vercel):**
1. Go to Vercel dashboard
2. Watch build logs
3. Wait for "Build completed"
4. Check production URL

### Step 3: Verify Deployment

**Backend Health Check:**
```bash
curl https://your-backend.onrender.com/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-10-15T...",
  "environment": "production"
}
```

**Frontend Check:**
1. Visit production URL
2. Check for console errors
3. Test authentication
4. Verify brand name displays
5. Test core features

**Database Check:**
```bash
# Via Supabase dashboard
# Check active connections
# Verify RLS policies
# Check recent queries
```

### Step 4: Smoke Tests

Run these tests on production:

1. **Authentication**
   - [ ] Sign up works
   - [ ] Login works
   - [ ] Logout works
   - [ ] Password reset works

2. **Core Features**
   - [ ] Dashboard loads
   - [ ] Create task works
   - [ ] Marketing track loads
   - [ ] AI assistant responds

3. **Payments**
   - [ ] Checkout loads
   - [ ] Test payment succeeds
   - [ ] Subscription activates
   - [ ] Webhook received

4. **Emails**
   - [ ] Welcome email sends
   - [ ] Notification emails work
   - [ ] Email templates render correctly

5. **Analytics**
   - [ ] Vercel Analytics tracking
   - [ ] Speed Insights working
   - [ ] Sentry receiving events

---

## 🔧 Configuration

### CORS Setup

**Backend:**
```typescript
// backend/src/index.ts
const corsOrigins = process.env.CORS_ORIGIN?.split(',') || [];
app.use(cors({ origin: corsOrigins }));
```

**Environment Variable:**
```bash
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

### Rate Limiting

```bash
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

### SSL/HTTPS

- Vercel: Automatic HTTPS
- Render: Automatic HTTPS
- Custom domains: Configure DNS properly

---

## 🐛 Troubleshooting

### Backend Won't Start

**Check:**
1. Environment variables set correctly
2. Build succeeded without errors
3. Database connection working
4. Port not conflicting

**Logs:**
```bash
# Render dashboard → Logs tab
# Check for startup errors
```

### Frontend Build Fails

**Check:**
1. TypeScript errors
2. Missing environment variables
3. Import errors
4. Build configuration

**Debug:**
```bash
# Run build locally
cd Frontend
npm run build
```

### Database Connection Issues

**Check:**
1. Supabase URL correct
2. Service role key correct
3. Database not paused (free tier)
4. IP allowlist configured

**Test Connection:**
```bash
# Backend
npm run test-supabase-connection
```

### Stripe Webhook Issues

**Check:**
1. Webhook URL correct
2. Webhook secret matches
3. Events configured
4. SSL certificate valid

**Test:**
```bash
# Use Stripe CLI
stripe listen --forward-to localhost:3001/api/stripe/webhook
stripe trigger checkout.session.completed
```

### Email Not Sending

**Check:**
1. Resend API key correct
2. Domain verified
3. From address verified
4. Rate limits not exceeded

**Test:**
```bash
# Send test email via API
curl -X POST https://your-backend.onrender.com/api/test/email
```

---

## 📊 Monitoring

### Application Health

**Endpoints:**
- Backend: `https://your-backend.onrender.com/health`
- Supabase: `https://<project>.supabase.co/rest/v1/`

**Set up monitoring:**
1. Use Render health checks
2. Configure Sentry alerts
3. Set up Vercel monitoring
4. Monitor Stripe webhooks

### Logs

**Backend (Render):**
```bash
# Dashboard → Logs
# Real-time log streaming
```

**Frontend (Vercel):**
```bash
# Dashboard → Functions → Logs
# Edge function logs if using
```

**Database (Supabase):**
```bash
# Dashboard → Logs → Postgres Logs
# Query performance insights
```

**Errors (Sentry):**
```bash
# Dashboard → Issues
# Real-time error tracking
```

---

## 🔄 Rollback Plan

### If Deployment Fails

**Quick Rollback:**
```bash
# Render: Click "Rollback" in dashboard
# Vercel: Click "Redeploy" on previous deployment
```

**Git Rollback:**
```bash
# Revert last commit
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard <commit-hash>
git push origin main --force
```

**Database Rollback:**
```bash
# Restore from backup in Supabase dashboard
# Or run reverse migration
```

---

## 🚨 Emergency Procedures

### Production Down

1. Check Render/Vercel status
2. Check Supabase status
3. Review recent deployments
4. Check error logs in Sentry
5. Rollback if needed

### Database Issues

1. Check Supabase dashboard
2. Review recent migrations
3. Check connection limits
4. Verify RLS policies
5. Restore from backup if needed

### Payment Issues

1. Check Stripe dashboard
2. Verify webhook delivery
3. Check API key validity
4. Review error logs
5. Contact Stripe support

---

## 📝 Post-Deployment

### Documentation

- [ ] Update changelog
- [ ] Document any issues encountered
- [ ] Note configuration changes
- [ ] Update environment variable docs

### Team Notification

- [ ] Inform team of deployment
- [ ] Share monitoring links
- [ ] Provide rollback instructions
- [ ] Schedule follow-up check

### Monitoring Schedule

**First 24 hours:**
- Check Sentry every 2 hours
- Monitor server logs
- Verify email delivery
- Check Stripe webhooks
- Monitor API response times

**First week:**
- Daily Sentry check
- Daily metrics review
- User feedback collection
- Performance monitoring

---

## 📞 Support Contacts

- **Render Support**: help@render.com
- **Vercel Support**: support@vercel.com
- **Supabase Support**: support@supabase.io
- **Stripe Support**: support@stripe.com

---

## 🎯 Success Criteria

Deployment is successful when:

- [ ] Backend health check returns 200
- [ ] Frontend loads without errors
- [ ] Authentication flow works
- [ ] Database queries succeed
- [ ] Payments process successfully
- [ ] Emails send successfully
- [ ] Analytics tracking works
- [ ] No critical errors in Sentry
- [ ] Performance metrics acceptable

---

**Last Updated:** October 15, 2025  
**Deployment Version:** 1.0.3

