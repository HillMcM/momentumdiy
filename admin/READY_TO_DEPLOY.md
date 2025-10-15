# Ready to Deploy - Action Items

**Status:** Code is ready for deployment  
**Next:** You push to GitHub, I deploy to Render  
**Time:** 15-20 minutes total

---

## 🎯 WHAT I NEED YOU TO DO (10 minutes)

### Step 1: Run Supabase SQL Script (5 min)

1. Open Supabase Dashboard: https://mnjczhlwcnwipdbajwkj.supabase.co
2. Go to SQL Editor
3. Copy the entire contents of `/Users/hillmcm/n8n-business-automation/supabase-schema.sql`
4. Paste and click "Run"
5. Verify you see these tables in Table Editor:
   - agent_executions
   - social_content
   - market_research
   - blog_posts
   - resource_usage
   - agent_outputs

---

### Step 2: Push to GitHub (5 min)

**Choose your approach:**

**OPTION A: Put in /admin folder (Recommended)**
```bash
cd /Users/hillmcm/n8n-business-automation

# If you don't have momentumdiy cloned locally:
cd ..
git clone https://github.com/HillMcM/momentumdiy.git
cd momentumdiy

# Create new branch
git checkout -b ai-agents

# Create admin folder and copy AI system
mkdir -p admin
cp -r ../n8n-business-automation/* admin/
cd admin
rm -rf node_modules  # Don't copy node_modules

# Commit
cd ..
git add admin/
git commit -m "Add AI agent admin system"
git push -u origin ai-agents
```

**OPTION B: Separate repo (Even Simpler)**
```bash
cd /Users/hillmcm/n8n-business-automation

# Initialize if not already
git init

# Add all files
git add .

# Commit
git commit -m "AI agent system ready for deployment"

# Create new GitHub repo: momentumdiy-ai-agents
# Then:
git remote add origin https://github.com/HillMcM/momentumdiy-ai-agents.git
git branch -M main
git push -u origin main
```

**Tell me which option you chose and the repo/branch details!**

---

## 🚀 WHAT I'LL DO WITH RENDER MCP (5-10 min)

Once you tell me:
- GitHub repo URL
- Branch name
- Root directory (if using Option A: `admin`, if Option B: `/`)

I'll execute:

```javascript
// 1. Create Render Web Service
mcp_render_create_web_service({
  name: "momentumdiy-ai-agents",
  repo: "https://github.com/HillMcM/momentumdiy",
  branch: "ai-agents",
  runtime: "node",
  buildCommand: "npm install",
  startCommand: "node src/index.js",
  envVars: [
    { key: "OPENAI_API_KEY", value: "sk-proj-8-7MhB..." },
    { key: "GOOGLE_AI_API_KEY", value: "AIzaSyCMq..." },
    { key: "SUPABASE_URL", value: "https://mnjczhlwcnwipdbajwkj.supabase.co" },
    { key: "SUPABASE_ANON_KEY", value: "eyJhbGci..." },
    { key: "SUPABASE_SERVICE_KEY", value: "eyJhbGci..." },
    { key: "WIX_SITE_ID", value: "e49e5bbc..." },
    { key: "WIX_API_KEY", value: "IST.eyJraWQ..." },
    { key: "META_ACCESS_TOKEN", value: "EAAdJflC..." },
    { key: "META_BUSINESS_ID", value: "179556813870674" },
    { key: "NODE_ENV", value: "production" },
    { key: "PORT", value: "10000" },
    { key: "LOG_LEVEL", value: "info" }
    // Will add BUFFER_ACCESS_TOKEN and WIX_ACCESS_TOKEN when you have them
  ]
})

// 2. Monitor deployment
// 3. Give you the URL
```

---

## 📋 QUICK CHECKLIST

**Before you start:**
- [ ] Decided: Option A (admin folder) or Option B (separate repo)?
- [ ] Have access to: GitHub, Supabase dashboard
- [ ] Terminal ready

**You'll do:**
- [ ] Run SQL in Supabase (5 min)
- [ ] Push code to GitHub (5 min)
- [ ] Tell me: repo URL, branch, root directory

**I'll do:**
- [ ] Create Render service (via MCP)
- [ ] Configure environment variables
- [ ] Deploy and verify
- [ ] Give you live URL (10 min)

---

## 🎯 AFTER DEPLOYMENT

### Step 3: Configure DNS (YOU)
```
DNS Record Type: CNAME
Name: admin
Value: momentumdiy-ai-agents.onrender.com
TTL: 3600
```

### Step 4: Test System (WE'LL DO TOGETHER)
```bash
# Test health
curl https://momentumdiy-ai-agents.onrender.com/health

# Test workflow
curl -X POST https://momentumdiy-ai-agents.onrender.com/api/agents/workflow/weekly-research
```

### Step 5: Rotate API Keys (YOU - IMPORTANT!)
Since API keys were shared in chat:
- Rotate OpenAI key
- Rotate Supabase service key
- Rotate Google AI key
- Update in Render environment

---

## 🎉 RESULT

You'll have:
- ✅ Live AI agent system at admin.momentumdiy.com
- ✅ Runs 24/7 automatically
- ✅ Weekly content creation
- ✅ Approval workflow
- ✅ Accessible from anywhere

---

## ⏰ TIMELINE

**Now:** You run SQL + push to GitHub (10 min)  
**Then:** I deploy to Render via MCP (10 min)  
**Finally:** You configure DNS (5 min)  
**Total:** 25 minutes to live system!

---

**Ready?** Tell me which option (A or B) and let's do this! 🚀

