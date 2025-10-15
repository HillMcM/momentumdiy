# Completion Checklist - Smart Content Marketing System

**Current Status:** 70% Complete  
**Time to Complete:** 3-4 hours  
**Priority:** Complete Phase 1 first for working system

---

## 🔴 PHASE 1: CRITICAL FIXES (Must Do - 1.5-2 hours)

### Task 1.1: Implement Weekly Workflow Methods ⏰ 45 min
**File:** `src/agents/agent-coordinator.js`  
**Add at end of file (before module.exports):**

```javascript
// ==================== WEEKLY CONTENT MARKETING WORKFLOW ====================

/**
 * Execute weekly market research (Monday 8 AM)
 */
async executeWeeklyResearch() {
  try {
    logger.info('📊 Executing weekly market research...');
    
    const marketResearcher = this.agentManager.getAgent('market-researcher');
    if (!marketResearcher) {
      throw new Error('Market Researcher agent not available');
    }
    
    const result = await marketResearcher.execute('find_brand_opportunities', {
      timeframe: '7d',
      focusAreas: [] // Uses defaults from research-focus.json
    });
    
    // Save to research database
    if (result && result.status === 'completed') {
      await this.researchDatabase.addResearch(result);
      logger.info('✅ Weekly research completed and saved to database');
    }
    
    return result;
  } catch (error) {
    logger.error('Error executing weekly research:', error);
    throw error;
  }
}

/**
 * Execute weekly blog creation (Tuesday 8 AM)
 */
async executeWeeklyBlogCreation() {
  try {
    logger.info('✍️ Executing weekly blog creation...');
    
    // Get latest research from database
    const research = await this.researchDatabase.getLatestResearch();
    if (!research || !research.trendingTopics || research.trendingTopics.length === 0) {
      throw new Error('No research data available for blog creation');
    }
    
    // Use top trending topic
    const topTopic = research.trendingTopics[0];
    
    const copywriter = this.agentManager.getAgent('copywriting-agent');
    if (!copywriter) {
      throw new Error('Copywriting Agent not available');
    }
    
    const result = await copywriter.execute('create-blog-post', {
      topic: topTopic.title || topTopic,
      research: research,
      length: 'long', // 800-1200 words
      includeResearch: true
    });
    
    // Blog automatically saves to Wix as draft
    logger.info('✅ Weekly blog post created and saved to Wix as draft');
    
    // Store result for social content agent
    this.lastBlogPost = result;
    
    return result;
  } catch (error) {
    logger.error('Error executing weekly blog creation:', error);
    throw error;
  }
}

/**
 * Execute weekly social content creation (Wednesday 8 AM)
 */
async executeWeeklySocialContent() {
  try {
    logger.info('📱 Executing weekly social content creation...');
    
    // Get latest blog post (from Tuesday's execution or from storage)
    let blogPost = this.lastBlogPost;
    
    if (!blogPost) {
      // Try to get from recent executions
      logger.warn('No blog post in memory, checking recent executions...');
      // Could fetch from database or Wix here
      throw new Error('No blog post available for social content creation');
    }
    
    // Extract blog content
    let blogContent = null;
    let blogTopic = null;
    
    if (blogPost.result && blogPost.result.content) {
      blogContent = blogPost.result.content.content || blogPost.result.content;
      blogTopic = blogPost.result.content.title || 'Marketing Clarity';
    }
    
    if (!blogContent) {
      throw new Error('Could not extract blog content');
    }
    
    const socialAgent = this.agentManager.getAgent('social-content-agent');
    if (!socialAgent) {
      throw new Error('Social Content Agent not available');
    }
    
    const result = await socialAgent.execute('create-multi-platform-campaign', {
      blogContent: blogContent,
      blogTopic: blogTopic,
      platforms: ['facebook', 'instagram', 'linkedin', 'x'],
      campaignName: 'Weekly Marketing Clarity Content',
      theme: 'Marketing Clarity and Focus'
    });
    
    // Save to approval database with status='pending'
    const approvalDB = require('../database/approval-db');
    await approvalDB.addOutput({
      agent: 'social-content-agent',
      type: 'social-posts',
      content: result,
      status: 'pending',
      timestamp: new Date().toISOString()
    });
    
    logger.info('✅ Weekly social content created and saved for approval');
    
    return result;
  } catch (error) {
    logger.error('Error executing weekly social content creation:', error);
    throw error;
  }
}

/**
 * Execute scheduled posting for approved content
 * @param {Array} platforms - Platforms to post to (e.g., ['facebook', 'instagram'])
 */
async executeScheduledPosting(platforms = []) {
  try {
    logger.info(`📤 Executing scheduled posting for: ${platforms.join(', ')}`);
    
    // Get approved posts for these platforms
    const approvalDB = require('../database/approval-db');
    const allApprovedPosts = await approvalDB.getOutputs({
      status: 'approved',
      agent: 'social-content-agent'
    });
    
    if (!allApprovedPosts || allApprovedPosts.length === 0) {
      logger.warn(`No approved posts found for ${platforms.join(', ')}`);
      return { 
        status: 'skipped', 
        reason: 'No approved posts available',
        platforms: platforms 
      };
    }
    
    // Filter posts for requested platforms
    const postsToPublish = allApprovedPosts.filter(post => {
      // Check if post is for one of the requested platforms
      if (post.content && post.content.platforms) {
        return platforms.some(p => post.content.platforms.includes(p));
      }
      return false;
    });
    
    if (postsToPublish.length === 0) {
      logger.warn(`No approved posts for platforms: ${platforms.join(', ')}`);
      return { 
        status: 'skipped', 
        reason: 'No posts for requested platforms',
        platforms: platforms 
      };
    }
    
    const socialPoster = this.agentManager.getAgent('social-posting-agent');
    if (!socialPoster) {
      throw new Error('Social Posting Agent not available');
    }
    
    const result = await socialPoster.execute('post-via-buffer', {
      posts: postsToPublish,
      platforms: platforms
    });
    
    // Mark posts as published
    for (const post of postsToPublish) {
      await approvalDB.updateOutputStatus(post.id, 'published', 'Posted via Buffer');
    }
    
    logger.info(`✅ Successfully posted to: ${platforms.join(', ')}`);
    
    return result;
  } catch (error) {
    logger.error('Error executing scheduled posting:', error);
    throw error;
  }
}

// Add property to store last blog post
this.lastBlogPost = null;
```

**Checklist:**
- [ ] Copy code above into agent-coordinator.js
- [ ] Test each method individually
- [ ] Verify database connections work

---

### Task 1.2: Update Agents with Brand Knowledge ⏰ 15 min

#### File: `src/agents/market-researcher.js`
**Line 1 - Add import:**
```javascript
const { getFullBrandContext } = require('../utils/brand-knowledge');
```

**Line 54 - Replace brandContext:**
```javascript
// OLD (DELETE):
this.brandContext = {
  brand: 'MomentumDIY',
  voice: 'Authentic, encouraging, practical, and approachable',
  // ...
};

// NEW (REPLACE WITH):
this.brandContext = getFullBrandContext();
```

#### File: `src/agents/copywriting-agent.js`
**Line 1 - Add import:**
```javascript
const { getFullBrandContext } = require('../utils/brand-knowledge');
```

**Line 66 - Replace brandContext:**
```javascript
this.brandContext = getFullBrandContext();
```

#### File: `src/agents/social-content-agent.js`
**Line 1 - Add import:**
```javascript
const { getFullBrandContext } = require('../utils/brand-knowledge');
```

**Line 28 - Replace brandIdentity:**
```javascript
// Rename brandIdentity to brandContext for consistency
this.brandContext = getFullBrandContext();
```

**Find/Replace in file:**
- Replace all `this.brandIdentity` with `this.brandContext`

#### File: `src/agents/cmo-brain.js`
**Line 1 - Add import:**
```javascript
const { getFullBrandContext } = require('../utils/brand-knowledge');
```

**In constructor - Add:**
```javascript
this.brandContext = getFullBrandContext();
```

#### File: `src/agents/data-analyst-agent.js`
**Line 1 - Add import:**
```javascript
const { getFullBrandContext } = require('../utils/brand-knowledge');
```

**In constructor - Add:**
```javascript
this.brandContext = getFullBrandContext();
```

**Checklist:**
- [ ] Update market-researcher.js
- [ ] Update copywriting-agent.js
- [ ] Update social-content-agent.js (rename brandIdentity)
- [ ] Update cmo-brain.js
- [ ] Update data-analyst-agent.js
- [ ] Test agent initialization

---

### Task 1.3: Fix Prompt Templates ⏰ 30 min

**File:** `src/utils/prompt-templates.js`

**Find and Replace (Global):**
```javascript
// Replace these phrases:
"implementation" → "how to do this" or "steps to take"
"implement" → "set up" or "do"
"optimize" → "improve" or "make better"
"leverage" → "use"
"utilize" → "use"
"commence" → "start"
"strategic frameworks" → "simple strategies"
"comprehensive solutions" → "what works"
"Prioritized recommendations" → "Clear next steps"
"Optimized budget distribution" → "Better budget breakdown"
```

**Specific Line Changes:**

**Line 41:**
```javascript
// OLD:
"implementation": "How to implement this recommendation",

// NEW:
"implementation": "How to do this",
```

**Line 98:**
```javascript
// OLD:
"4. Recommendations: Prioritized recommendations with implementation guidance for marketing clarity and focus"

// NEW:
"4. Recommendations: Clear next steps with simple guidance for marketing clarity and focus"
```

**Line 491:**
```javascript
// OLD:
"Focus on insights that help optimize marketing spend for maximum return in the marketing clarity platform space."

// NEW:
"Focus on insights that help improve marketing spend for better results in the marketing clarity platform space."
```

**Add at top of file (after line 50):**
```javascript
const CASUAL_VOICE_RULES = `
VOICE GUIDELINES (CRITICAL):
- Use simple, everyday words (no jargon!)
- Write like you're talking to a friend over coffee
- Be encouraging without being preachy
- Use "you" and "your" to make it personal
- Keep sentences short and readable
- Examples: "use" not "utilize", "start" not "commence", "improve" not "optimize"
`;
```

**Checklist:**
- [ ] Global find/replace for formal words
- [ ] Manual review of all prompts
- [ ] Add casual voice rules
- [ ] Test generated content
- [ ] Verify blog posts sound like Hillary

---

## 🟡 PHASE 2: HIGH PRIORITY (Do After Phase 1 - 30-45 min)

### Task 2.1: Update Console Message ⏰ 2 min

**File:** `src/index.js`

**Line 133:**
```javascript
// OLD:
console.log(`⏰ Scheduler started - Daily CMO workflow scheduled for 8 AM EST`);

// NEW:
console.log(`⏰ Scheduler started - Weekly content marketing workflow active`);
console.log(`   📊 Monday 8 AM: Market Research`);
console.log(`   ✍️ Tuesday 8 AM: Blog Creation`);
console.log(`   📱 Wednesday 8 AM: Social Content`);
console.log(`   📤 Thu-Fri 2 PM: Social Posting`);
```

**Checklist:**
- [ ] Update console message
- [ ] Test server startup

---

### Task 2.2: Add New API Endpoints ⏰ 15 min

**File:** `src/api/agents.js`

**Add after line 236:**
```javascript
// Weekly workflow endpoints
router.post('/workflow/weekly-research', async (req, res) => {
  try {
    logger.info('Starting weekly market research');
    const coordinator = agentManager.getCoordinator();
    const result = await coordinator.executeWeeklyResearch();
    res.json(result);
  } catch (error) {
    logger.error('Error executing weekly research:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/workflow/weekly-blog', async (req, res) => {
  try {
    logger.info('Starting weekly blog creation');
    const coordinator = agentManager.getCoordinator();
    const result = await coordinator.executeWeeklyBlogCreation();
    res.json(result);
  } catch (error) {
    logger.error('Error executing weekly blog creation:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/workflow/weekly-social', async (req, res) => {
  try {
    logger.info('Starting weekly social content creation');
    const coordinator = agentManager.getCoordinator();
    const result = await coordinator.executeWeeklySocialContent();
    res.json(result);
  } catch (error) {
    logger.error('Error executing weekly social content:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/workflow/weekly-posting', async (req, res) => {
  try {
    const { platforms } = req.body;
    logger.info(`Starting scheduled posting for: ${platforms?.join(', ')}`);
    const coordinator = agentManager.getCoordinator();
    const result = await coordinator.executeScheduledPosting(platforms || ['facebook', 'instagram', 'linkedin', 'x']);
    res.json(result);
  } catch (error) {
    logger.error('Error executing scheduled posting:', error);
    res.status(500).json({ error: error.message });
  }
});
```

**Checklist:**
- [ ] Add 4 new endpoints
- [ ] Test each endpoint with curl
- [ ] Document in README

---

### Task 2.3: Update Agent Manager ⏰ 10 min

**File:** `src/agents/agent-manager.js`

**Line 1 - Add import:**
```javascript
const { getAgentDefinition, getAllAgentDefinitions } = require('./agent-definitions');
```

**Add method after line 160:**
```javascript
/**
 * Get agent capabilities and definition
 */
getAgentCapabilities(agentId) {
  return getAgentDefinition(agentId);
}

/**
 * Get all agent definitions
 */
getAllAgentCapabilities() {
  return getAllAgentDefinitions();
}
```

**Checklist:**
- [ ] Add import
- [ ] Add methods
- [ ] Test API calls

---

## 🟢 PHASE 3: POLISH (Optional - 1-1.5 hours)

### Task 3.1: Add Gemini Usage Checking ⏰ 15 min

**File:** `src/utils/resource-manager.js`

**Add after recordGeminiUsage() method:**
```javascript
// Check if Gemini API usage is within limits
canUseGemini(priority = 'medium') {
  this.checkAndResetCounters();
  
  const currentDaily = this.usage.gemini.daily.cost;
  const currentMonthly = this.usage.gemini.monthly.cost;
  
  // Check daily limit
  if (currentDaily >= this.geminiLimits.daily) {
    logger.warn(`Gemini API daily cost limit reached: $${currentDaily.toFixed(4)}`);
    return false;
  }
  
  // Check monthly limit
  if (currentMonthly >= this.geminiLimits.monthly) {
    logger.warn(`Gemini API monthly cost limit reached: $${currentMonthly.toFixed(2)}`);
    return false;
  }
  
  return true;
}
```

**File:** `src/agents/social-content-agent.js`

**In generateImageWithGemini(), add before API call:**
```javascript
// Check if we can use Gemini
if (!this.resourceManager.canUseGemini()) {
  logger.warn('Gemini API usage limit reached');
  return {
    success: false,
    error: 'Gemini API usage limit reached',
    timestamp: new Date().toISOString()
  };
}
```

**Checklist:**
- [ ] Add canUseGemini() method
- [ ] Add checks in social-content-agent
- [ ] Test limit enforcement

---

### Task 3.2: Update Environment Example ⏰ 2 min

**File:** `env.example`

**Add:**
```bash
# Google Gemini AI (for enhanced image prompts)
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

**Checklist:**
- [ ] Add to env.example
- [ ] Update README.md with setup instructions

---

### Task 3.3: Clean Up Old Files ⏰ 5 min

**Files to Delete:**
```bash
rm src/agents/market-researcher-old.js
```

**Or move to archive:**
```bash
mkdir -p archive/old-agents
mv src/agents/market-researcher-old.js archive/old-agents/
```

**Checklist:**
- [ ] Delete or archive old files
- [ ] Verify no imports reference deleted files

---

### Task 3.4: Update Documentation ⏰ 30 min

**Files to Update:**
- `README.md` - Weekly workflow section
- Add Gemini setup instructions
- Update quick start guide
- Document new API endpoints

**Checklist:**
- [ ] Update README.md
- [ ] Update setup instructions
- [ ] Document weekly schedule
- [ ] Add API examples

---

## 🧪 TESTING AFTER COMPLETION

### Unit Tests:
```bash
# Test weekly research
curl -X POST http://localhost:3000/api/agents/workflow/weekly-research

# Test blog creation
curl -X POST http://localhost:3000/api/agents/workflow/weekly-blog

# Test social content
curl -X POST http://localhost:3000/api/agents/workflow/weekly-social

# Test posting
curl -X POST http://localhost:3000/api/agents/workflow/weekly-posting \
  -H "Content-Type: application/json" \
  -d '{"platforms": ["facebook"]}'
```

### Integration Test:
```bash
# Run full weekly workflow manually (Tuesday to test all)
node -e "
const AgentManager = require('./src/agents/agent-manager');
const manager = new AgentManager();
setTimeout(async () => {
  const coord = manager.getCoordinator();
  const research = await coord.executeWeeklyResearch();
  const blog = await coord.executeWeeklyBlogCreation();
  const social = await coord.executeWeeklySocialContent();
  console.log('Full workflow test complete');
  process.exit(0);
}, 2000);
"
```

### Voice Test:
1. Generate a blog post
2. Read it out loud
3. Does it sound like Hillary?
4. Check for formal words
5. Verify simple vocabulary

---

## 📊 PROGRESS TRACKING

### Phase 1 Progress:
- [ ] Task 1.1: Weekly workflow methods (45 min)
- [ ] Task 1.2: Brand knowledge imports (15 min)
- [ ] Task 1.3: Prompt templates (30 min)

**Estimated:** 1.5-2 hours  
**When Complete:** System will work end-to-end

### Phase 2 Progress:
- [ ] Task 2.1: Console message (2 min)
- [ ] Task 2.2: API endpoints (15 min)
- [ ] Task 2.3: Agent manager (10 min)

**Estimated:** 30-45 minutes  
**When Complete:** Full API coverage

### Phase 3 Progress:
- [ ] Task 3.1: Gemini checking (15 min)
- [ ] Task 3.2: Environment docs (2 min)
- [ ] Task 3.3: File cleanup (5 min)
- [ ] Task 3.4: Documentation (30 min)

**Estimated:** 1-1.5 hours  
**When Complete:** Professional, polished system

---

## 🎯 COMPLETION CRITERIA

System is **100% complete** when:

✅ All Phase 1 tasks done  
✅ Weekly workflow runs without errors  
✅ All agents use consistent brand voice  
✅ Generated content sounds like Hillary  
✅ Approval workflow functions  
✅ Social posts publish to Buffer  
✅ Documentation is accurate  
✅ Tests pass  

**Minimum Viable:** Complete Phase 1 only (70% → 90%)  
**Full Production:** Complete all phases (70% → 100%)

---

**Start Here:** Task 1.1 - Implement weekly workflow methods. Everything else builds on that.


