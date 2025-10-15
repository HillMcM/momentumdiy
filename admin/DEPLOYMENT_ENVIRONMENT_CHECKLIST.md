# Deployment Environment Variables Checklist

**For Render Deployment:** admin.momentumdiy.com AI Agent System  
**Date:** October 15, 2025

---

## 📋 REQUIRED ENVIRONMENT VARIABLES

### 🔴 CRITICAL (System Won't Work Without These)

#### 1. OpenAI API Key
```bash
OPENAI_API_KEY=sk-proj-...
```
**Where to get:** https://platform.openai.com/api-keys  
**Used for:** All AI agent operations (blog posts, research analysis, etc.)  
**Cost:** ~$0.25/month  
**Status:** [ ] Have it [ ] Need to get

---

#### 2. Google Gemini AI API Key
```bash
GOOGLE_AI_API_KEY=AI...
```
**Where to get:** https://ai.google.dev/  
**Used for:** Enhanced image prompt generation  
**Cost:** ~$0.01/month  
**Status:** [ ] Have it [ ] Need to get

---

#### 3. Supabase Credentials
```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
```
**Where to get:** Supabase Dashboard > Settings > API  
**Used for:** Storing all AI system data (research, posts, approvals)  
**Cost:** Free tier  
**Status:** [ ] Have it [ ] Need to get

---

### 🟡 IMPORTANT (Needed for Full Functionality)

#### 4. Buffer Access Token
```bash
BUFFER_ACCESS_TOKEN=1/...
```
**Where to get:** https://buffer.com/developers/api  
**Used for:** Publishing social media posts  
**Requirement:** Buffer Professional plan ($12/month)  
**Status:** [ ] Have it [ ] Need to get [ ] Skip for now

---

#### 5. Meta Business Suite API
```bash
META_ACCESS_TOKEN=EAAb...
META_BUSINESS_ID=123456789...
```
**Where to get:** Meta Business Suite > Settings > System Users  
**Used for:** Social media analytics (Facebook & Instagram)  
**Cost:** Free  
**Status:** [ ] Have it [ ] Need to get [ ] Skip for now

---

#### 6. Wix API Credentials
```bash
WIX_SITE_ID=xxxxx
WIX_API_KEY=xxxxx
WIX_ACCESS_TOKEN=xxxxx
```
**Where to get:** Wix Dashboard > Settings > Developer Tools  
**Used for:** Saving blog posts as drafts  
**Cost:** Free (part of Wix plan)  
**Status:** [ ] Have it [ ] Need to get [ ] Skip for now

---

### 🟢 OPTIONAL (Nice to Have)

#### 7. News API Key
```bash
NEWS_API_KEY=xxxxx
```
**Where to get:** https://newsapi.org/  
**Used for:** Market research and trend analysis  
**Cost:** Free tier (100 requests/day)  
**Status:** [ ] Have it [ ] Need to get [ ] Skip for now

---

#### 8. SERP API Key
```bash
SERP_API_KEY=xxxxx
```
**Where to get:** https://serpapi.com/  
**Used for:** Search engine data and competitor analysis  
**Cost:** Free tier (100 searches/month)  
**Status:** [ ] Have it [ ] Need to get [ ] Skip for now

---

## 🎯 DEPLOYMENT TIERS

### Tier 1: Minimum Viable (2 Required)
**Can create content but can't publish or research:**
- ✅ OPENAI_API_KEY (AI content generation)
- ✅ SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY (database)

**What Works:**
- ✅ All AI agents
- ✅ Content generation
- ✅ Approval workflow
- ❌ Can't publish to Buffer
- ❌ Limited research capabilities

---

### Tier 2: Functional System (5 Required)
**Full content creation + publishing:**
- ✅ OPENAI_API_KEY
- ✅ GOOGLE_AI_API_KEY
- ✅ SUPABASE credentials (3 keys)
- ✅ BUFFER_ACCESS_TOKEN
- ✅ WIX_API_KEY, WIX_SITE_ID, WIX_ACCESS_TOKEN

**What Works:**
- ✅ Weekly content automation
- ✅ Blog post creation → Wix
- ✅ Social content generation
- ✅ Publishing to Buffer
- ✅ Full approval workflow
- ⚠️ Limited market research

---

### Tier 3: Complete System (8 Required)
**Everything including research:**
- ✅ All Tier 2 variables
- ✅ NEWS_API_KEY
- ✅ SERP_API_KEY
- ✅ META_ACCESS_TOKEN, META_BUSINESS_ID

**What Works:**
- ✅ Everything in Tier 2
- ✅ Full market research
- ✅ Social media analytics
- ✅ Trend analysis
- ✅ Competitor monitoring

---

## 📝 ENVIRONMENT VARIABLE TEMPLATE

Copy this for Render deployment:

```bash
# === CRITICAL (Tier 1) ===
OPENAI_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# === IMPORTANT (Tier 2) ===
GOOGLE_AI_API_KEY=
BUFFER_ACCESS_TOKEN=
WIX_SITE_ID=
WIX_API_KEY=
WIX_ACCESS_TOKEN=

# === OPTIONAL (Tier 3) ===
NEWS_API_KEY=
SERP_API_KEY=
META_ACCESS_TOKEN=
META_BUSINESS_ID=

# === SYSTEM ===
NODE_ENV=production
PORT=10000
LOG_LEVEL=info
```

---

## ⚡ QUICK START DEPLOYMENT

### If you have Tier 2 variables ready:
I can deploy RIGHT NOW using MCP tools!

### If you need to gather variables:
1. **Supabase:** Copy from your existing project
2. **OpenAI:** Should already have (using in system)
3. **Google Gemini:** Get from https://ai.google.dev/ (5 min)
4. **Buffer:** Already have or skip for testing
5. **Wix:** Already have (you use Wix Studio)

---

## 🚀 WHAT I'LL DO ONCE YOU PROVIDE VARIABLES

1. **Create Supabase tables** (I'll give you the SQL)
2. **Update code** for Supabase integration
3. **Create Render Web Service** using MCP
4. **Configure all environment variables**
5. **Deploy automatically**
6. **Verify it's working**
7. **Give you the URL** to access

---

## 🔑 WHAT I NEED FROM YOU NOW

**To Deploy Immediately:**

### Priority 1 (Critical):
1. ✅ **OPENAI_API_KEY** - Do you already have this?
2. ✅ **SUPABASE_URL** - From your existing Supabase project
3. ✅ **SUPABASE_ANON_KEY** - From your existing Supabase project
4. ✅ **SUPABASE_SERVICE_KEY** - From your existing Supabase project

### Priority 2 (Important):
5. ⚠️ **GOOGLE_AI_API_KEY** - Need to get from https://ai.google.dev/
6. ⚠️ **BUFFER_ACCESS_TOKEN** - If you want publishing to work
7. ⚠️ **WIX credentials** - For blog posting

### GitHub:
8. **GitHub repo URL** for this code - Do you have this in GitHub already?

---

**Reply with what you have ready, and I'll start deploying!** 🚀

If you give me the Tier 1 variables (OpenAI + Supabase), I can deploy a working system in the next 10-15 minutes.


