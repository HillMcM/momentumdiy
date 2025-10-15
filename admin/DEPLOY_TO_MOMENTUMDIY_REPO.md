# Deploy AI Agent System to MomentumDIY Repo

**Target Repo:** https://github.com/HillMcM/momentumdiy  
**Branch:** `ai-agents` (new)  
**Structure:** `/admin` folder  
**Date:** October 15, 2025

---

## 📋 STEP-BY-STEP DEPLOYMENT

### Step 1: Prepare Code for Deployment (YOU DO THIS)

**1.1: Create Supabase Tables**

Go to Supabase Dashboard → SQL Editor → Run this:

```sql
-- Copy entire contents of supabase-schema.sql and run
```

Or use the file: `/Users/hillmcm/n8n-business-automation/supabase-schema.sql`

**Verify:** Check that these tables exist:
- agent_executions
- social_content
- market_research
- blog_posts
- resource_usage
- agent_outputs

---

### Step 2: Update Supabase Package

**File to modify:** `package.json`

Already added! Just need to install:
```bash
npm install @supabase/supabase-js
```

---

### Step 3: Switch Database Implementation

**Update these files to use Supabase versions:**

**File:** `src/utils/research-database.js`
```javascript
// OLD: module.exports = ResearchDatabase;
// NEW: module.exports = require('../database/research-db-supabase');
```

**File:** `src/database/approval-db.js`
You have two options:
a) Rename current file to `approval-db-old.js` and rename `approval-db-supabase.js` to `approval-db.js`
b) OR replace the exports at the bottom to use Supabase version

---

### Step 4: Push to GitHub (IN TERMINAL)

```bash
cd /Users/hillmcm/n8n-business-automation

# Create new branch
git checkout -b ai-agents

# Stage all files
git add .

# Commit
git commit -m "Add AI agent system for admin.momentumdiy.com"

# Add remote if not already (check with: git remote -v)
git remote add origin https://github.com/HillMcM/momentumdiy.git
# If already exists, skip above

# Push new branch
git push -u origin ai-agents
```

**Note:** If you want it in an `/admin` folder in the repo:
```bash
# Create admin folder structure
mkdir -p ../momentumdiy/admin
cp -r . ../momentumdiy/admin/
cd ../momentumdiy
git checkout -b ai-agents
git add admin/
git commit -m "Add AI agent admin system"
git push -u origin ai-agents
```

---

## 🚀 WHAT I'LL DO WITH RENDER MCP

Once code is in GitHub, I'll:

1. **Create Render Web Service:**
   - Name: `momentumdiy-ai-agents`
   - Repo: `https://github.com/HillMcM/momentumdiy`
   - Branch: `ai-agents`
   - Root Directory: `/admin` (or `/` if not in folder)
   - Build: `npm install`
   - Start: `node src/index.js`

2. **Configure Environment Variables:**
   - All the credentials you provided
   - Plus system vars (NODE_ENV, PORT)

3. **Deploy Automatically**

4. **Get URL:**
   - Will be something like: `https://momentumdiy-ai-agents.onrender.com`
   - You point `admin.momentumdiy.com` to this

---

## ⚡ QUICK APPROACH (RECOMMENDED)

Since you want it in the momentumdiy repo:

**Option A: Separate Admin Folder** (Cleaner)
```
momentumdiy/
├── backend/          (your existing Next.js backend)
├── frontend/         (your existing frontend)  
├── admin/            (NEW - AI agent system)
│   ├── src/
│   ├── data/
│   ├── package.json
│   └── ...all AI agent files
```

**Option B: Root Level in New Branch** (Simpler)
```
momentumdiy/ (ai-agents branch)
├── All AI agent files here (current structure)
```

**Which do you prefer?**
- **A)** Admin folder (cleaner, better organization)
- **B)** Root level (simpler, faster to deploy)

Once you confirm, I'll give you the exact commands to run!
