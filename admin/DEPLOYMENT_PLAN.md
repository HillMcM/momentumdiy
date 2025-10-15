# AI Agent System Deployment Plan

**Target:** Deploy as admin.momentumdiy.com without affecting existing momentumdiy.com  
**Architecture:** Separate subdomain with isolated backend and shared database  
**Date:** October 15, 2025

---

## 🎯 DEPLOYMENT ARCHITECTURE

### Current Setup:
```
momentumdiy.com (KEEP UNCHANGED)
├── Vercel: Frontend (Next.js/React)
├── Render: Backend API
└── Supabase: Database
```

### New AI System:
```
admin.momentumdiy.com (NEW)
├── Vercel: Admin Frontend (static dashboard)
├── Render: AI Agent Backend (new service)
└── Supabase: New Tables (isolated from customer data)
```

**Isolation:** Zero impact on existing momentumdiy.com code ✅

---

## 📦 DEPLOYMENT COMPONENTS

### 1. Supabase Database Setup

**New Tables to Create:**
```sql
-- AI Agent execution history
CREATE TABLE agent_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id TEXT NOT NULL,
    task TEXT NOT NULL,
    input JSONB,
    output JSONB,
    status TEXT NOT NULL,
    duration_ms INTEGER,
    tokens_used INTEGER,
    cost NUMERIC(10, 6),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Social media content for approval
CREATE TABLE social_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform TEXT NOT NULL,
    content TEXT NOT NULL,
    hashtags TEXT[],
    image_prompt TEXT,
    blog_post_id UUID,
    status TEXT DEFAULT 'pending', -- pending, approved, published, rejected
    approved_by TEXT,
    approved_at TIMESTAMP,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Market research data
CREATE TABLE market_research (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trending_topics JSONB,
    competitor_analysis JSONB,
    content_gaps JSONB,
    opportunities JSONB,
    data_sources JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Blog posts
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    research_id UUID REFERENCES market_research(id),
    wix_post_id TEXT,
    status TEXT DEFAULT 'draft',
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Resource usage tracking
CREATE TABLE resource_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service TEXT NOT NULL, -- 'openai', 'gemini', 'news_api', 'serp_api'
    usage_type TEXT NOT NULL, -- 'tokens', 'requests', 'calls'
    amount INTEGER NOT NULL,
    cost NUMERIC(10, 6),
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_agent_executions_agent_id ON agent_executions(agent_id);
CREATE INDEX idx_agent_executions_created_at ON agent_executions(created_at DESC);
CREATE INDEX idx_social_content_status ON social_content(status);
CREATE INDEX idx_social_content_platform ON social_content(platform);
CREATE INDEX idx_blog_posts_created_at ON blog_posts(created_at DESC);
CREATE INDEX idx_resource_usage_date ON resource_usage(date DESC);
```

**Benefits:**
- ✅ Proper relational database
- ✅ Automatic backups
- ✅ Query performance
- ✅ Scalable storage
- ✅ Separate from customer data

---

### 2. Render Backend Service

**Deploy As:** New Render Web Service  
**Name:** `momentumdiy-ai-agents`  
**Repository:** This codebase (`n8n-business-automation`)

**Configuration:**
```yaml
Name: momentumdiy-ai-agents
Environment: Node
Build Command: npm install
Start Command: node src/index.js
Instance Type: Starter (or Standard for 24/7)

Environment Variables:
- OPENAI_API_KEY
- GOOGLE_AI_API_KEY
- BUFFER_ACCESS_TOKEN
- META_ACCESS_TOKEN
- META_BUSINESS_ID
- NEWS_API_KEY
- SERP_API_KEY
- WIX_API_KEY
- WIX_SITE_ID
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_KEY (for backend operations)
- NODE_ENV=production
- PORT=3000
```

**Health Check Endpoint:**
- Path: `/health`
- Expected Response: `{"status": "healthy"}`

**Custom Domain:**
- Point `api-admin.momentumdiy.com` to Render service
- OR use Render's provided URL initially

---

### 3. Vercel Frontend Deployment

**Deploy As:** New Vercel Project  
**Name:** `momentumdiy-admin-dashboard`  
**Source:** `src/dashboard/` folder (static HTML/CSS/JS)

**Option A: Simple Static Deploy**
```
Source: src/dashboard/
Build: None (already static)
Output: ./ 
Domain: admin.momentumdiy.com
```

**Option B: Convert to Next.js (Better)**
```
Create new Next.js project
Move dashboard pages to Next.js
Add proper routing
Use existing auth system
Domain: admin.momentumdiy.com
```

**Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://api-admin.momentumdiy.com
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## 🔧 CODE CHANGES NEEDED

### 1. Replace JSON File Storage with Supabase

**Create:** `src/database/supabase-client.js`
```javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;
```

**Update:** `src/database/approval-db.js`
- Replace file-based storage with Supabase queries
- Use `social_content` table instead of JSON files

**Update:** `src/utils/research-database.js`
- Replace file storage with Supabase
- Use `market_research` table

**Update:** `src/agents/agent-coordinator.js`
- Replace execution history JSON with Supabase
- Use `agent_executions` table

**Update:** `src/utils/resource-manager.js`
- Replace usage JSON files with Supabase
- Use `resource_usage` table

---

### 2. Add Supabase Package

**Update:** `package.json`
```json
"dependencies": {
  "@supabase/supabase-js": "^2.39.0",
  // ... existing dependencies
}
```

---

### 3. Update API Endpoints for CORS

**Update:** `src/index.js`
```javascript
// Update CORS to allow admin subdomain
app.use(cors({
  origin: [
    'https://admin.momentumdiy.com',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true
}));
```

---

### 4. Add Authentication (Optional but Recommended)

**Option A: Use Supabase Auth**
```javascript
// Middleware to verify Supabase JWT
const verifyAuth = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  req.user = user;
  next();
};

// Protect admin routes
app.use('/api/agents', verifyAuth);
app.use('/api/approval', verifyAuth);
```

**Option B: Share auth with existing system**
- Use same JWT verification as momentumdiy.com
- Check for admin role in user metadata

---

## 📋 DEPLOYMENT STEPS

### Phase 1: Database Setup (30 minutes)

**Step 1.1: Create Supabase Tables**
1. Go to Supabase dashboard
2. Run SQL editor with table creation script above
3. Verify tables created successfully
4. Test with sample data

**Step 1.2: Update Code for Supabase**
1. Add `@supabase/supabase-js` to package.json
2. Create `src/database/supabase-client.js`
3. Update `approval-db.js` to use Supabase
4. Update `research-database.js` to use Supabase
5. Update `resource-manager.js` to use Supabase
6. Test locally with Supabase connection

---

### Phase 2: Backend Deployment (20 minutes)

**Step 2.1: Prepare for Render**
1. Create `.renderignore` file (ignore node_modules, logs, etc.)
2. Ensure all env vars documented in env.example
3. Test build locally: `npm install && node src/index.js`

**Step 2.2: Deploy to Render**
1. Create new Render Web Service
2. Connect GitHub repo
3. Configure build & start commands
4. Add all environment variables
5. Deploy and verify health endpoint

**Step 2.3: Configure Domain**
1. Add custom domain: `api-admin.momentumdiy.com`
2. Configure DNS CNAME record
3. Enable HTTPS (automatic with Render)
4. Test API endpoints

---

### Phase 3: Frontend Deployment (30 minutes)

**Step 3.1: Prepare Admin Dashboard**

**Option A: Quick Deploy (Static Files)**
1. Update API URLs in dashboard HTML files
2. Replace `localhost:3000` with `api-admin.momentumdiy.com`
3. Deploy to Vercel as static site

**Option B: Proper Next.js (Recommended)**
1. Create new Next.js project: `npx create-next-app@latest admin-dashboard`
2. Convert dashboard HTML to React components
3. Add proper routing (`/dashboard`, `/approvals`, `/content`)
4. Integrate with existing auth system
5. Deploy to Vercel

**Step 3.2: Deploy to Vercel**
1. Connect GitHub repo (or new repo for admin)
2. Configure domain: `admin.momentumdiy.com`
3. Add environment variables
4. Deploy
5. Test access

**Step 3.3: Configure DNS**
1. Add CNAME: `admin.momentumdiy.com` → Vercel
2. Add CNAME: `api-admin.momentumdiy.com` → Render
3. Verify SSL certificates

---

### Phase 4: Testing & Verification (20 minutes)

**Step 4.1: Test Backend**
```bash
# Health check
curl https://api-admin.momentumdiy.com/health

# Test workflow endpoints
curl -X POST https://api-admin.momentumdiy.com/api/agents/workflow/weekly-research

# Test agent execution
curl -X POST https://api-admin.momentumdiy.com/api/agents/market-researcher/execute \
  -H "Content-Type: application/json" \
  -d '{"task": "find_brand_opportunities", "input": {}}'
```

**Step 4.2: Test Frontend**
1. Visit https://admin.momentumdiy.com
2. Verify dashboard loads
3. Test approval workflow
4. Check API connections

**Step 4.3: Test Automation**
1. Verify cron jobs run on schedule
2. Check logs in Render dashboard
3. Verify data saves to Supabase
4. Test approval → posting flow

---

## 💰 COST ESTIMATE

### Render:
- **Starter Plan:** $7/month (suspends after inactivity)
- **Standard Plan:** $25/month (always on - recommended for cron jobs)

### Vercel:
- **Hobby Plan:** Free (sufficient for admin dashboard)
- **Pro Plan:** $20/month (if you need more)

### Supabase:
- **Free Plan:** Likely sufficient (500MB database, 2GB storage)
- **Pro Plan:** $25/month (if you need more)

**Estimated Total:** $7-25/month (Render) + $0 (Vercel) + $0 (Supabase) = **$7-25/month**

Plus existing API costs (~$0.25/month for OpenAI/Gemini)

---

## 🚀 RECOMMENDED APPROACH

### Best Option: "Hybrid Deployment"

**Backend Only on Render** (Simpler, Faster)
```
admin.momentumdiy.com → Render Web Service (serves backend + static dashboard)
```

**Benefits:**
- ✅ Single deployment
- ✅ No CORS issues
- ✅ Simpler setup
- ✅ Lower cost ($7-25/month only)
- ✅ Dashboard served by Express

**How It Works:**
1. Deploy entire system to Render
2. Point admin.momentumdiy.com to Render service
3. Static dashboard served from Express (`src/dashboard/`)
4. API routes at `admin.momentumdiy.com/api/`
5. Dashboard at `admin.momentumdiy.com/dashboard/`

**Changes Needed:**
- Replace JSON files with Supabase tables
- Update environment variables
- Deploy to Render
- Configure DNS

**Time:** 1-2 hours total

---

## 📝 IMPLEMENTATION CHECKLIST

### Pre-Deployment (Local Changes):
- [ ] Install Supabase client: `npm install @supabase/supabase-js`
- [ ] Create Supabase tables (SQL script above)
- [ ] Create `src/database/supabase-client.js`
- [ ] Update `approval-db.js` to use Supabase
- [ ] Update `research-database.js` to use Supabase
- [ ] Update `resource-manager.js` to use Supabase
- [ ] Update agent-coordinator execution history to use Supabase
- [ ] Test locally with Supabase connection
- [ ] Verify all workflows still work

### Render Deployment:
- [ ] Create new Render Web Service
- [ ] Connect this GitHub repo
- [ ] Configure build command: `npm install`
- [ ] Configure start command: `node src/index.js`
- [ ] Add all environment variables (including Supabase)
- [ ] Deploy and verify health check
- [ ] Test API endpoints

### DNS Configuration:
- [ ] Add CNAME record: `admin.momentumdiy.com` → Render URL
- [ ] Wait for DNS propagation (5-60 minutes)
- [ ] Verify HTTPS certificate (automatic)
- [ ] Test access from browser

### Final Testing:
- [ ] Visit https://admin.momentumdiy.com/dashboard
- [ ] Test workflow execution
- [ ] Approve a social post
- [ ] Verify posting to Buffer
- [ ] Check Supabase data storage
- [ ] Monitor logs in Render

---

## 🔐 SECURITY CONSIDERATIONS

### Add Authentication:
**Recommended:** Protect admin panel with auth

**Option 1: Simple Password Protection**
```javascript
// Middleware in src/index.js
const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const validToken = process.env.ADMIN_TOKEN;
  
  if (authHeader === `Bearer ${validToken}`) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

app.use('/dashboard', adminAuth);
app.use('/api/agents', adminAuth);
app.use('/api/approval', adminAuth);
```

**Option 2: Supabase Auth Integration**
- Use same auth as momentumdiy.com
- Check for admin role in JWT
- Share session across subdomains

**Option 3: IP Whitelist**
- Restrict access to your IP only
- Configure in Render dashboard

---

## 📊 MIGRATION STRATEGY

### Zero Downtime Approach:

**Week 1: Preparation**
- Set up Supabase tables
- Update code for database
- Test locally with Supabase

**Week 2: Deployment**
- Deploy to Render (test mode)
- Keep local system running
- Verify Render deployment works
- Run both in parallel

**Week 3: Switch Over**
- Point DNS to Render
- Monitor for issues
- Keep local as backup
- Decommission local after 1 week

**Week 4: Optimization**
- Fine-tune performance
- Adjust resource limits
- Monitor costs
- Optimize queries

---

## 🎯 BENEFITS OF DEPLOYMENT

### Reliability:
✅ Runs 24/7 even when computer is off  
✅ Workflows execute on schedule reliably  
✅ No missed content creation  
✅ Automatic restarts if crashes  

### Accessibility:
✅ Access from anywhere (laptop, phone, tablet)  
✅ Approve posts on the go  
✅ Monitor system remotely  
✅ Share access with team (if needed)  

### Data Safety:
✅ Database backups automatic  
✅ Not dependent on local machine  
✅ Version control in Git  
✅ Easy to restore if issues  

### Scalability:
✅ Can increase resources as needed  
✅ Add more agents easily  
✅ Handle higher traffic  
✅ Professional infrastructure  

---

## ⚠️ POTENTIAL ISSUES & SOLUTIONS

### Issue 1: Cron Jobs on Render Starter Plan
**Problem:** Starter plan suspends after inactivity  
**Solution:** 
- Use Standard plan ($25/month) for always-on
- OR set up external cron service to ping health endpoint
- OR use Render Cron Jobs (separate service)

### Issue 2: File Uploads (images, etc.)
**Problem:** Render ephemeral storage, files disappear  
**Solution:**
- Use Supabase Storage for images
- Store image URLs in database
- OR use Cloudinary/S3 for images

### Issue 3: Environment Variable Management
**Problem:** Many API keys to manage  
**Solution:**
- Use Render's environment groups
- Document all required vars
- Keep .env.example updated

### Issue 4: Logs and Monitoring
**Problem:** Need to monitor system health  
**Solution:**
- Use Render's built-in logs
- Set up alerts in Render
- Create health check dashboard
- Monitor Supabase usage

---

## 📈 RECOMMENDED DEPLOYMENT ORDER

### Priority 1: Get It Working (Simple)
1. Create Supabase tables
2. Update code for Supabase
3. Deploy backend to Render
4. Test with Render URL
5. Point admin.momentumdiy.com to Render

**Time:** 2-3 hours  
**Result:** Functional admin system accessible from anywhere

### Priority 2: Polish (Better UX)
1. Convert dashboard to Next.js
2. Deploy frontend to Vercel
3. Add proper authentication
4. Improve UI/UX
5. Add monitoring

**Time:** 4-6 hours  
**Result:** Professional admin panel

### Priority 3: Optimize (Production-Grade)
1. Add error monitoring (Sentry)
2. Set up alerting
3. Optimize database queries
4. Add caching layer
5. Performance tuning

**Time:** 2-3 hours  
**Result:** Enterprise-grade system

---

## 🎯 WHAT I RECOMMEND

**Start with Priority 1** (Simple deployment):
- Fastest path to deployment (2-3 hours)
- Zero impact on existing momentumdiy.com
- Admin system accessible from anywhere
- Can polish later

**Next Steps:**
1. Create Supabase tables
2. Update 4 files for Supabase integration
3. Deploy to Render
4. Configure DNS
5. Done!

---

## 💡 ALTERNATIVE: Keep Local + Add Remote Access

**Simpler Option:** Use Tailscale or ngrok
- Keep system running on local machine
- Use VPN or tunnel for remote access
- No deployment needed
- Access from anywhere via secure tunnel

**Pros:**
- ✅ Zero deployment work
- ✅ Keep JSON file storage
- ✅ No hosting costs

**Cons:**
- ❌ Computer must stay on
- ❌ Not as reliable
- ❌ Can't scale easily

---

Would you like me to:
- **A)** Create the Supabase integration code (2-3 hours to implement)
- **B)** Deploy to Render using MCP tools (I can do this for you!)
- **C)** Show you how to do local + remote access (simpler)
- **D)** Something else?

What's your preference?


