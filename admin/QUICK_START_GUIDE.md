# Quick Start Guide - Smart Content Marketing System

## 🚀 Immediate Next Steps

### 1. Install Required Package (5 minutes)
```bash
cd /Users/hillmcm/n8n-business-automation
npm install @google/generative-ai
```

### 2. Add Environment Variable (2 minutes)
Add to your `.env` file:
```bash
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

Get your API key from: https://ai.google.dev/

### 3. What's Already Working ✅

**Brand Knowledge:**
- Your brand voice is documented in `src/utils/brand-knowledge.js`
- Casual, friendly, "neighborhood marketer" personality
- Simple language guidelines (no jargon!)
- Target audience details (cafes, salons, home services, etc.)

**Content Context:**
- Research focus areas in `data/research-focus.json`
- Content strategy in `data/content-strategy.json`
- Brand guidelines in `data/brand-context.json`

**Agent Definitions:**
- Clear job descriptions in `src/agents/agent-definitions.js`
- Each agent knows when to run and what to do
- Can work independently or in workflows

**Weekly Schedule:**
- Monday 8 AM: Market Research
- Tuesday 8 AM: Blog Creation (+ LinkedIn post 9 AM)
- Wednesday 8 AM: Social Content (+ X post 12 PM)
- Thursday 2 PM: Facebook post
- Friday 2 PM: Instagram post

**Fixed Bugs:**
- Social content agent now properly extracts blog posts
- Multiple fallback paths for content extraction
- Better error logging and debugging

**Image Generation:**
- Switched from DALL-E to Google Gemini
- Creates enhanced image prompts
- Tracks Gemini API usage in resource manager

---

## 🔧 What Still Needs Implementation

### Priority 1: Weekly Workflow Methods
Add these methods to `src/agents/agent-coordinator.js`:

```javascript
async executeWeeklyResearch() {
  const marketResearcher = this.agentManager.getAgent('market-researcher');
  const result = await marketResearcher.execute('find_brand_opportunities', {
    timeframe: '7d',
    focusAreas: [] // Uses defaults from research-focus.json
  });
  // Save to research database
  return result;
}

async executeWeeklyBlogCreation() {
  // Get latest research from database
  const research = await this.researchDatabase.getLatestResearch();
  
  const copywriter = this.agentManager.getAgent('copywriting-agent');
  const result = await copywriter.execute('create-blog-post', {
    topic: research.topTopics[0], // Use top trending topic
    research: research,
    length: 'long' // 800-1200 words
  });
  // Result automatically saves to Wix as draft
  return result;
}

async executeWeeklySocialContent() {
  // Get this week's blog post
  const copywritingResults = await this.getLatestBlogPost();
  
  const socialAgent = this.agentManager.getAgent('social-content-agent');
  const result = await socialAgent.execute('create-multi-platform-campaign', {
    blogContent: copywritingResults.content.content,
    blogTopic: copywritingResults.content.title,
    platforms: ['facebook', 'instagram', 'linkedin', 'x']
  });
  
  // Save to approval database with status='pending'
  await this.approvalDB.addOutput({
    agent: 'social-content-agent',
    type: 'social-posts',
    content: result,
    status: 'pending'
  });
  
  return result;
}

async executeScheduledPosting(platforms) {
  // Get approved posts for these platforms
  const approvedPosts = await this.approvalDB.getOutputs({
    status: 'approved',
    platforms: platforms
  });
  
  if (approvedPosts.length === 0) {
    logger.warn(`No approved posts found for ${platforms.join(', ')}`);
    return { status: 'skipped', reason: 'No approved posts' };
  }
  
  const socialPoster = this.agentManager.getAgent('social-posting-agent');
  const result = await socialPoster.execute('post-via-buffer', {
    posts: approvedPosts,
    platforms: platforms
  });
  
  return result;
}
```

### Priority 2: Update Agents with Brand Knowledge
In each agent file, add at the top:
```javascript
const { getFullBrandContext } = require('../utils/brand-knowledge');
```

In constructor:
```javascript
this.brandContext = getFullBrandContext();
```

Update these files:
- `src/agents/market-researcher.js`
- `src/agents/copywriting-agent.js`
- `src/agents/social-content-agent.js` (already has brandContext, update it)
- `src/agents/cmo-brain.js`
- `src/agents/data-analyst-agent.js`

### Priority 3: Update Prompt Templates
In `src/utils/prompt-templates.js`, replace formal language:
- "utilize" → "use"
- "implement" → "set up" or "do"
- "optimize" → "improve" or "make better"
- "leverage" → "use"
- "commence" → "start"

Make all prompts sound like Hillary talking to a friend.

---

## 📱 How to Use the System

### Automated Mode (Recommended):
Once steps 1-3 above are complete:
1. System runs automatically every week
2. Monday: Research happens in background
3. Tuesday: Blog post created and saved as draft in Wix
4. Wednesday: Social posts created and saved for approval
5. You approve posts in dashboard: `http://localhost:3000/dashboard/agent-outputs.html`
6. Thursday-Friday: Approved posts publish automatically via Buffer

### Manual Mode (On-Demand):
Call agents individually when needed:

**Research a topic:**
```bash
curl -X POST http://localhost:3000/api/agents/market-researcher/execute \
  -H "Content-Type: application/json" \
  -d '{
    "task": "find_brand_opportunities",
    "input": {"focusAreas": ["local seo", "social media marketing"]}
  }'
```

**Create a blog post:**
```bash
curl -X POST http://localhost:3000/api/agents/copywriting-agent/execute \
  -H "Content-Type: application/json" \
  -d '{
    "task": "create-blog-post",
    "input": {"topic": "How to Pick Your First Quarterly Marketing Goal"}
  }'
```

**Generate social content:**
```bash
curl -X POST http://localhost:3000/api/agents/social-content-agent/execute \
  -H "Content-Type: application/json" \
  -d '{
    "task": "create-multi-platform-campaign",
    "input": {
      "blogContent": "Your blog post content here...",
      "platforms": ["facebook", "instagram", "linkedin", "x"]
    }
  }'
```

---

## ✅ Approval Workflow

1. **Social content is created** (Wednesday mornings)
2. **Posts save to approval database** with status='pending'
3. **View in dashboard:** http://localhost:3000/dashboard/agent-outputs.html
4. **Review each post:**
   - Check caption and hashtags
   - Verify tone and messaging
   - Ensure accuracy
5. **Click "Approve"** for each post you want to publish
6. **Approved posts** (status='approved') automatically post at scheduled times:
   - LinkedIn: Tuesday 9 AM
   - X: Wednesday 12 PM
   - Facebook: Thursday 2 PM
   - Instagram: Friday 2 PM

---

## 🐛 Troubleshooting

**"Gemini not working"**
- Check GOOGLE_AI_API_KEY is set in .env
- Verify you've installed @google/generative-ai package
- Check logs for Gemini API errors

**"Social content not being created"**
- Check if blog post was created successfully
- Look for "🔍 DEBUG" messages in logs
- Verify blog content extraction succeeded

**"Posts not going to Buffer"**
- Verify posts are approved (status='approved')
- Check Buffer API token is valid
- Ensure Buffer integration is working

**"Weekly workflow not running"**
- Check scheduler status: http://localhost:3000/api/dashboard/status
- Verify agent-coordinator methods exist
- Check logs for scheduled job execution

---

## 📊 Monitoring

**Dashboard:** http://localhost:3000/dashboard
**Agent Outputs:** http://localhost:3000/dashboard/agent-outputs.html
**Analytics:** http://localhost:3000/dashboard/analytics.html

**Logs:** 
- All logs: `logs/all.log`
- Errors only: `logs/error.log`

**Scheduled Jobs:**
```bash
curl http://localhost:3000/api/dashboard/scheduler-status
```

---

## 💡 Tips

1. **Start Small:** Test with manual agent calls first before relying on automation
2. **Check Approvals:** Review your approval dashboard daily to approve content
3. **Monitor Performance:** Check analytics weekly to see what's working
4. **Adjust Timing:** You can change posting times in scheduler.js
5. **Add Platforms:** Easy to add more platforms to the workflow

---

## 🎯 Success Metrics

**Week 1:**
- ✅ One blog post created
- ✅ 4+ social posts generated
- ✅ Posts approved and published
- ✅ All posts in your authentic voice

**Month 1:**
- 4 blog posts published
- 16+ social posts across all platforms
- Consistent weekly posting schedule
- Growing audience engagement

**Quarter 1:**
- 12 blog posts (valuable content library)
- 50+ social posts
- Established authority and expertise
- Time saved: 60-120 hours

---

**Ready to get started?** Install the package, add your API key, and implement the workflow methods!

Need help? Check `SMART_CONTENT_MARKETING_IMPLEMENTATION.md` for detailed technical information.


