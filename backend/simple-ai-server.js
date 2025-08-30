const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3002;

// In-memory stores
let importedMarketingGoals = [];
let projectsStore = [];
let tasksStore = [];

// In-memory store for simple profile data
const profileStore = {
  baselineMetrics: null,
  contentPillars: [],
};

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    try {
      const url = new URL(origin);
      const isLocalHost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
      const isLocalNetwork = url.hostname === '10.0.0.53';
      const isHttp = url.protocol === 'http:' || url.protocol === 'https:';
      if ((isLocalHost || isLocalNetwork) && isHttp) {
        return callback(null, true);
      }
    } catch (e) {}
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.options('*', cors());

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: 'development'
  });
});

// ===== Tasks API =====
app.get('/api/tasks', (req, res) => {
  res.json({ success: true, data: tasksStore, message: 'Tasks loaded successfully' });
});

app.post('/api/tasks', (req, res) => {
  const { title, description = '', responsible = 'Owner', deadline = null, project = 'General', status = 'todo', projectId } = req.body || {};
  if (!title || !status) return res.status(400).json({ success: false, error: 'title and status are required' });
  const newId = (tasksStore.length ? Math.max(...tasksStore.map(t => parseInt(t.id) || 0)) + 1 : 1).toString();
  const task = {
    id: newId,
    title,
    description,
    responsible,
    deadline,
    project,
    timeSpent: '0h',
    notifications: false,
    status,
    projectId,
  };
  tasksStore.push(task);
  res.json({ success: true, data: task, message: 'Task created' });
});

app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const idx = tasksStore.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Task not found' });
  tasksStore[idx] = { ...tasksStore[idx], ...req.body };
  res.json({ success: true, data: tasksStore[idx], message: 'Task updated' });
});

app.patch('/api/tasks/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  const idx = tasksStore.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Task not found' });
  tasksStore[idx].status = status || tasksStore[idx].status;
  res.json({ success: true, data: tasksStore[idx], message: 'Status updated' });
});

app.patch('/api/tasks/:id/time-spent', (req, res) => {
  const { id } = req.params;
  const { timeSpent } = req.body || {};
  const idx = tasksStore.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Task not found' });
  tasksStore[idx].timeSpent = timeSpent || tasksStore[idx].timeSpent;
  res.json({ success: true, data: tasksStore[idx], message: 'Time spent updated' });
});

app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  tasksStore = tasksStore.filter(t => t.id !== id);
  res.json({ success: true, message: 'Task deleted' });
});

// ===== Projects API =====
app.get('/api/projects', (req, res) => {
  res.json({ success: true, data: projectsStore, message: 'Projects loaded successfully' });
});

app.post('/api/projects', (req, res) => {
  const { name, description = '', deadline = null, status = 'active' } = req.body || {};
  if (!name || !status) return res.status(400).json({ success: false, error: 'name and status are required' });
  const newId = (projectsStore.length ? Math.max(...projectsStore.map(p => parseInt(p.id) || 0)) + 1 : 1).toString();
  const project = {
    id: newId,
    name,
    description,
    deadline,
    tasks: [],
    progress: 0,
    status,
    timeline: [],
  };
  projectsStore.push(project);
  res.json({ success: true, data: project, message: 'Project created' });
});

app.get('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const project = projectsStore.find(p => p.id === id);
  if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
  res.json({ success: true, data: project });
});

app.put('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const idx = projectsStore.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Project not found' });
  projectsStore[idx] = { ...projectsStore[idx], ...req.body };
  res.json({ success: true, data: projectsStore[idx], message: 'Project updated' });
});

app.patch('/api/projects/:id/progress', (req, res) => {
  const { id } = req.params;
  const idx = projectsStore.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Project not found' });
  const { progress } = req.body || {};
  projectsStore[idx].progress = typeof progress === 'number' ? progress : projectsStore[idx].progress;
  res.json({ success: true, data: projectsStore[idx], message: 'Project progress updated' });
});

app.delete('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  projectsStore = projectsStore.filter(p => p.id !== id);
  res.json({ success: true, message: 'Project deleted' });
});

// Marketing goals endpoints now use in-memory store
app.get('/api/marketing/goals', async (req, res) => {
  // Auto-import once if empty and Notion key is available
  try {
    if (importedMarketingGoals.length === 0) {
      const apiKey = process.env.NOTION_API_KEY || process.env.NOTION_TOKEN;
      if (apiKey) {
        // Try to find the quarterly marketing goals database and import
        const results = await notionSearchDatabase({ apiKey, query: 'quarterly marketing goals' });
        const match = results.find(r => (r.title && Array.isArray(r.title) && r.title.map(t => t.plain_text || '').join('').toLowerCase().includes('quarterly marketing goals')) || (r.object === 'database' && r.id));
        if (match && match.id) {
          const pages = await notionQueryDatabase({ apiKey, databaseId: match.id });
          const mapped = pages.map(toMarketingGoalFromNotion);
          const filtered = mapped.filter(g => DESIRED_TRACK_TITLES.has(g.title));
          const finalGoals = filtered.length ? filtered : mapped;
          importedMarketingGoals = finalGoals;
        }
      }
    }
  } catch (err) {
    // Non-fatal: if Notion import fails, just return current (possibly empty) state
    console.error('Auto-import on GET /api/marketing/goals failed:', err);
  }
  res.json({ success: true, data: importedMarketingGoals, message: 'Marketing goals loaded successfully' });
});

app.get('/api/marketing/goals/active', (req, res) => {
  const active = importedMarketingGoals.find(g => g.isActive);
  if (active) {
    console.log(`📡 GET /api/marketing/goals/active: currentWeek=${active.currentWeek}, modules=${active.modules.length}`);
    console.log(`🔓 Module unlock status:`, active.modules.map(m => `Week ${m.weekNumber}: unlocked=${m.isUnlocked}`));
  }
  res.json({ success: true, data: active || null, message: active ? 'Active marketing goal' : 'No active marketing goal' });
});

// Get marketing goal by id
app.get('/api/marketing/goals/:id', (req, res) => {
  const { id } = req.params;
  const goal = importedMarketingGoals.find(g => g.id === id);
  if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });
  res.json({ success: true, data: goal });
});

// Update marketing goal by id
app.put('/api/marketing/goals/:id', (req, res) => {
  const { id } = req.params;
  const idx = importedMarketingGoals.findIndex(g => g.id === id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Goal not found' });
  
  console.log(`🔧 PUT /api/marketing/goals/${id}`);
  console.log(`📥 Request body:`, req.body);
  console.log(`📥 Request body keys:`, Object.keys(req.body || {}));
  
  const allowed = ['title', 'description', 'industry', 'duration', 'isActive', 'currentWeek', 'progress', 'modules'];
  const updates = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body || {}, key)) {
      updates[key] = req.body[key];
      console.log(`✅ Allowed field ${key}:`, req.body[key]);
    }
  }
  
  console.log(`🔧 Final updates object:`, updates);
  // If currentWeek changes, unlock/completion flags can be adjusted simply
  let updated = { ...importedMarketingGoals[idx], ...updates };
  if (typeof updates.currentWeek === 'number' && Array.isArray(updated.modules)) {
    const next = updates.currentWeek;
    console.log(`🔓 Updating modules: currentWeek=${next}, total modules=${updated.modules.length}`);
    updated.modules = updated.modules.map((m) => {
      const newUnlocked = m.weekNumber <= next;
      const newCompleted = m.weekNumber < next;
      console.log(`  Week ${m.weekNumber}: isUnlocked=${m.isUnlocked} → ${newUnlocked}, isCompleted=${m.isCompleted} → ${newCompleted}`);
      return {
        ...m,
        isUnlocked: newUnlocked,
        isCompleted: newCompleted,
      };
    });
  }
  importedMarketingGoals[idx] = updated;
  console.log(`✅ Goal updated: currentWeek=${updated.currentWeek}, progress=${updated.progress}`);
  res.json({ success: true, data: updated, message: 'Marketing goal updated' });
});

// Activate a marketing goal
app.patch('/api/marketing/goals/:id/activate', (req, res) => {
  const { id } = req.params;
  let found = false;
  importedMarketingGoals = importedMarketingGoals.map(g => {
    if (g.id === id) {
      found = true;
      return { ...g, isActive: true, currentWeek: g.currentWeek || 1, progress: g.progress || 0 };
    }
    return { ...g, isActive: false };
  });
  if (!found) return res.status(404).json({ success: false, error: 'Goal not found' });
  const active = importedMarketingGoals.find(g => g.id === id);
  res.json({ success: true, data: active, message: 'Marketing goal activated' });
});

// Calendar
app.get('/api/calendar/events', (req, res) => {
  res.json({ success: true, data: [], message: 'Calendar events loaded successfully' });
});

// ===== Profile: Baseline Metrics & Content Pillars =====
app.get('/api/profile/baseline-metrics', (req, res) => {
  res.json({ success: true, data: profileStore.baselineMetrics || null });
});

app.post('/api/profile/baseline-metrics', (req, res) => {
  const body = req.body || {};
  // New format: { platforms: { instagram: {...}, facebook: {...} } }
  if (body && typeof body === 'object' && body.platforms && typeof body.platforms === 'object') {
    const out = { platforms: {}, recordedAt: new Date().toISOString() };
    const platforms = body.platforms || {};
    for (const [key, val] of Object.entries(platforms)) {
      const v = val || {};
      out.platforms[key] = {
        followers: Number(v.followers || 0),
        avgLikes: Number(v.avgLikes || 0),
        avgComments: Number(v.avgComments || 0),
        avgStoryViews: Number(v.avgStoryViews || 0)
      };
    }
    profileStore.baselineMetrics = out;
    return res.json({ success: true, data: profileStore.baselineMetrics, message: 'Baseline metrics saved' });
  }

  // Backward-compatible single-platform format
  const { platform = 'instagram', followers, avgLikes, avgComments, avgStoryViews } = body;
  if (
    followers === undefined || avgLikes === undefined || avgComments === undefined || avgStoryViews === undefined
  ) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  profileStore.baselineMetrics = {
    platform,
    followers: Number(followers),
    avgLikes: Number(avgLikes),
    avgComments: Number(avgComments),
    avgStoryViews: Number(avgStoryViews),
    recordedAt: new Date().toISOString(),
  };
  res.json({ success: true, data: profileStore.baselineMetrics, message: 'Baseline metrics saved' });
});

app.get('/api/profile/content-pillars', (req, res) => {
  res.json({ success: true, data: profileStore.contentPillars || [] });
});

app.post('/api/profile/content-pillars', (req, res) => {
  const { pillars } = req.body || {};
  if (!Array.isArray(pillars) || pillars.length === 0) {
    return res.status(400).json({ success: false, error: 'pillars must be a non-empty array of strings' });
  }
  profileStore.contentPillars = pillars.map(p => String(p)).slice(0, 8);
  res.json({ success: true, data: profileStore.contentPillars, message: 'Content pillars saved' });
});

// ===== Anthropic AI =====
function buildSystemPrompt() {
  return `You are Hillary, a marketing consultant who specializes in helping local, small business owners who have started their businesses based on expertise and need, but with little knowledge of marketing.

Your audience: local service businesses and brick-and-mortar shops. You avoid ads and focus on holistic, sustainable marketing.

Principles:
- Focus on ONE marketing track for 90 days to build momentum and avoid burnout
- Tailor suggestions to the business's needs, capacity, and preferences
- Use common language with relatable analogies; avoid jargon
- Be friendly, encouraging, and practical
- Get a bird's eye view to identify highest-ROI focus areas

Framework:
- Set a single 90-day marketing goal (quarter focus)
- Break into weekly learning + action items
- Suggest tools pragmatically; do not overwhelm
- Guide away from big-budget tactics that don't fit small businesses

Response guidance:
- Ask 1-3 clarifying questions if needed before prescribing a plan
- When giving steps, make them small, specific, and time-bound
- Offer alternative options for different capacity levels (e.g., 15-minute vs 60-minute version)
- If a concept may be unfamiliar, explain it simply with an analogy
- If user has an active track, align suggestions to that track and week; otherwise recommend the best starter track
- Keep the tone friendly, professional, and confidence-building`;
}

function composeUserMessage(message, context) {
  const lines = [];
  if (context) {
    const { userBusinessType, userIndustry, userExperienceLevel, marketingGoals, currentTasks, activeTrack } = context;
    if (userBusinessType || userIndustry || userExperienceLevel) {
      lines.push(`User Profile: ${[
        userBusinessType && `businessType=${userBusinessType}`,
        userIndustry && `industry=${userIndustry}`,
        userExperienceLevel && `experience=${userExperienceLevel}`,
      ].filter(Boolean).join(', ')}`);
    }
    if (activeTrack) {
      lines.push(`Active Track: ${JSON.stringify(activeTrack)}`);
    }
    if (Array.isArray(marketingGoals) && marketingGoals.length) {
      lines.push(`Marketing Goals: ${marketingGoals.map(g => `${g.title}${g.isActive ? ' (active)' : ''}`).join(' | ')}`);
    }
    if (Array.isArray(currentTasks) && currentTasks.length) {
      lines.push(`Current Tasks (top 5): ${currentTasks.slice(0,5).map(t => t.title || t.name || t.id).join(' | ')}`);
    }
  }
  lines.push(`User Message: ${message}`);
  return lines.join('\n');
}

app.post('/api/ai/chat', async (req, res) => {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.antropic_api_key || process.env.ANTHROPIC_API_TOKEN;
    if (!apiKey) {
      return res.status(500).json({ success: false, error: 'Missing Anthropic API key in backend environment' });
    }

    const { message, context } = req.body || {};
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const system = buildSystemPrompt();
    const userContent = composeUserMessage(message, context);

    const payload = {
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 800,
      temperature: 0.3,
      system,
      messages: [ { role: 'user', content: userContent } ]
    };

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      console.error('Anthropic API error:', resp.status, errText);
      return res.status(502).json({ success: false, error: `Anthropic API error ${resp.status}` });
    }

    const data = await resp.json();
    const contentBlocks = Array.isArray(data.content) ? data.content : [];
    const firstText = contentBlocks.find(b => b && b.type === 'text');
    const aiText = firstText && firstText.text ? firstText.text : '[No content returned]';

    return res.json({
      success: true,
      data: {
        response: aiText,
        context: {
          marketingGoals: (context && context.marketingGoals) || [],
          currentTasks: (context && context.currentTasks) || [],
          activeTrack: (context && context.activeTrack) || null
        }
      },
      message: 'AI response generated successfully'
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate AI response' });
  }
});

// ===== Notion Import =====
async function notionSearchDatabase({ apiKey, query }) {
  const resp = await fetch('https://api.notion.com/v1/search', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: query || '',
      filter: { property: 'object', value: 'database' },
      sort: { direction: 'ascending', timestamp: 'last_edited_time' }
    })
  });
  if (!resp.ok) {
    const text = await resp.text().catch(()=> '');
    throw new Error(`Notion search failed ${resp.status}: ${text}`);
  }
  const data = await resp.json();
  return data.results || [];
}

async function notionQueryDatabase({ apiKey, databaseId }) {
  const resp = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ page_size: 100 })
  });
  if (!resp.ok) {
    const text = await resp.text().catch(()=> '');
    throw new Error(`Notion query failed ${resp.status}: ${text}`);
  }
  const data = await resp.json();
  return data.results || [];
}

function extractTitleFromPage(page) {
  const props = page && page.properties ? page.properties : {};
  const titlePropEntry = Object.entries(props).find(([, v]) => v && v.type === 'title');
  if (!titlePropEntry) return 'Untitled';
  const titleProp = titlePropEntry[1];
  const arr = titleProp && Array.isArray(titleProp.title) ? titleProp.title : [];
  const text = arr.map(t => t.plain_text || '').join('').trim();
  return text || 'Untitled';
}

function toMarketingGoalFromNotion(page) {
  const id = page.id;
  const title = extractTitleFromPage(page);
  const description = '';
  const industry = 'General';
  const duration = 12;
  const modules = Array.from({ length: duration }, (_, i) => ({
    id: `${id}-w${i+1}`,
    weekNumber: i + 1,
    title: `Week ${i + 1}`,
    description: '',
    content: '',
    tasks: [],
    isUnlocked: i === 0,
    isCompleted: false,
  }));
  return {
    id,
    title,
    description,
    industry,
    duration,
    modules,
    isActive: false,
    currentWeek: 1,
    progress: 0,
  };
}

const DESIRED_TRACK_TITLES = new Set([
  'Increase Local Foot Traffic',
  'Improve Social Media Strategy & Engagement',
  'Clarify and Elevate Brand Identity',
  'Grow Online Presence & Visibility',
  'Increase Repeat Visits or Loyalty'
]);

// Seed the marketing goals with the 12-week "Increase Local Foot Traffic" track
function seedMarketingData() {
  if (importedMarketingGoals.length === 0) {
    const increaseLocalFootTraffic = {
      id: 'increase-local-foot-traffic',
      title: 'Increase Local Foot Traffic',
                      description: 'Build a comprehensive marketing strategy to drive more local customers to your business through targeted campaigns, community engagement, and digital presence optimization. Phase 1 (Weeks 1-3): Foundation & Immediate Impact - Establish your marketing foundation and see your first measurable results. Phase 2 (Weeks 4-6): Grow Visibility - Expand reach beyond your street to make more people in your surrounding area aware of your business. Phase 3 (Weeks 7-9): Create Buzz - Generate excitement that spreads by enhancing customer experience and creating share-worthy moments. Phase 4 (Weeks 10-12): Cement Loyalty - Turn increased traffic into repeatable systems and loyal relationships through strategic partnerships, customer insights, and celebration of success.',
      industry: 'Local Business',
      duration: 12,
      isActive: true,
      startDate: new Date(),
      currentWeek: 1,
      progress: 8,
      modules: Array.from({ length: 12 }, (_, i) => {
        const week = i + 1;
        let isUnlocked = week === 1; // Only week 1 is unlocked initially
        let isCompleted = false;
        
        let module = {
          id: `week-${week}`,
          weekNumber: week,
          title: `Week ${week}`,
          description: `Week ${week} content`,
          content: `<h2>Week ${week}</h2><p>Content for week ${week} will be displayed here.</p>`,
          isUnlocked,
          isCompleted,
          tasks: [
            {
              id: `task-${week}-1`,
              taskId: `week-${week}`,
              title: `Week ${week} Task 1`,
              shortDescription: `Complete the first task for week ${week}`,
              description: `This is a detailed description for the first task of week ${week}. Complete this task to progress through your marketing track.`,
              estimatedTime: '30min',
              isCompleted: false,
              dueDate: new Date(Date.now() + (week - 1) * 7 * 24 * 60 * 60 * 1000)
            },
            {
              id: `task-${week}-2`,
              taskId: `week-${week}`,
              title: `Week ${week} Task 2`,
              shortDescription: `Complete the second task for week ${week}`,
              description: `This is a detailed description for the second task of week ${week}. This task builds upon the first task and helps you achieve your weekly goals.`,
              estimatedTime: '45min',
              isCompleted: false,
              dueDate: new Date(Date.now() + (week - 1) * 7 * 24 * 60 * 60 * 1000)
            },
            {
              id: `task-${week}-3`,
              taskId: `week-${week}`,
              title: `Week ${week} Task 3`,
              shortDescription: `Complete the third task for week ${week}`,
              description: `This is a detailed description for the third task of week ${week}. This final task for the week consolidates your progress and prepares you for the next week.`,
              estimatedTime: '20min',
              isCompleted: false,
              dueDate: new Date(Date.now() + (week - 1) * 7 * 24 * 60 * 60 * 1000)
            }
          ]
        };

        // Add specific content for Week 1 (the detailed content you provided earlier)
        if (week === 1) {
          module = {
            ...module,
            title: 'Launch a Simple In-Store Offer + Signage',
            description: 'Kickstart traffic with an irresistible offer and clear signage. This sets the stage for immediate ROI.',
            content: `<h2>Week 1: Launch a Simple In-Store Offer + Signage</h2>
<p>Before you begin, jot down some baseline metrics – for example, how many walk-ins you get in an average week right now. These numbers will help you see how far you've come by Week 12. Remember to keep the tone fun and stay encouraged: you got this!</p>

<p><strong>Theme:</strong> Kickstart traffic with an irresistible offer and clear signage. This sets the stage for immediate ROI (Return on Investment – basically, seeing a quick payoff for your efforts). By the end of this week, you want to see new faces walking in because of your promotion.</p>

<p><strong>Why this matters:</strong> A limited-time in-store offer (like a special discount or freebie) creates urgency and gives people a reason to visit now, not later. Coupled with eye-catching signage (signs in your window, door, or sidewalk), you'll grab the attention of anyone passing by. Signage is often the first impression of your business – make it count! (Fun fact: a study found about 76% of consumers have entered a store they'd never visited before just because a sign caught their eye. That means a good sign can literally pull new customers in off the street.)</p>

<h4>What to do this week:</h4>
<p>This week focuses on creating and promoting a compelling in-store offer that will immediately attract new customers. You'll measure your current baseline, design an irresistible promotion, create eye-catching signage, and actively promote it both in-store and to passersby. The goal is to see a measurable increase in foot traffic by week's end.</p>

<h4>Pro Tip:</h4>
<p>Keep the vibe positive and fun. When promoting the offer, be excited! For example, "We're doing something special: this week all coffee comes with a free cookie! Hope you enjoy it!" Enthusiasm is contagious and makes customers feel like they're part of something exciting. Also, make sure your team (if you have one) is on the same page and equally informed about the offer details. Lastly, plan for a slight increase in traffic – have enough stock of the item on sale or ingredients for that free cookie, etc. Nothing's worse than drawing people in and then disappointing them by running out.</p>`,
            tasks: [
              {
                id: 'task-1-1',
                taskId: 'week-1',
                title: 'Measure your starting point',
                shortDescription: 'Record your current foot traffic and sales metrics as a baseline for comparison.',
                description: 'Before anything else, record your current foot traffic. For example, count how many people come in this week normally. This is your baseline to compare later. Also note any daily sales or other metrics you care about.',
                estimatedTime: '15min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 0 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-1-2',
                taskId: 'week-1',
                title: 'Create a simple, juicy offer',
                shortDescription: 'Design a promotion that will entice people immediately with discounts, freebies, or special deals.',
                description: 'Think of a promotion that will entice folks immediately. It could be "Buy one, get one 50% off," "Free dessert with any meal," or "10% off for first-time customers." Make it easy to understand and valuable enough that people feel they shouldn\'t miss it. (Keep your costs in mind, but often a small perk can go a long way.) If you\'re unsure what offer would appeal, brainstorm a few ideas – maybe even ask a couple of regulars what would excite them, or use an AI assistant to suggest popular promotions in your industry.',
                estimatedTime: '30min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 0 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-1-3',
                taskId: 'week-1',
                title: 'Prepare your signage',
                shortDescription: 'Create bold, clear signs advertising your offer for both outside and inside placement.',
                description: 'Once your offer is decided, advertise it with a bold sign. For example, a chalkboard on the sidewalk or a bright poster in your window that says "This Week Only: [Your Offer]!" Use big, clear letters. Someone walking or driving by should grasp it in seconds. Include a call to action like "Come in today" or an arrow pointing inside. If designing signs isn\'t your forte, you could ask a crafty friend for help or even get a quick design idea from an AI tool – but a hand-written enthusiastic message works fine too!',
                estimatedTime: '45min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 0 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-1-4',
                taskId: 'week-1',
                title: 'Promote in-store',
                shortDescription: 'Tell every customer about the offer and ensure signs are visible to passersby.',
                description: 'Tell every customer who comes in about the offer. If they buy something, make sure they know about the deal (maybe they\'ll purchase more or tell a friend). You can say, "By the way, we have a special this week…" Also, place the sign where even people just walking by or driving slowly can see it. Consider both outside and inside placement (window, near the entrance, at the register). The goal is that no one in the vicinity misses your special deal.',
                estimatedTime: '20min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 0 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-1-5',
                taskId: 'week-1',
                title: 'Run the offer for a limited time',
                shortDescription: 'Set a deadline (1-2 weeks) and communicate urgency to encourage immediate action.',
                description: 'A short timeframe (like one week or two weeks maximum) adds urgency. Let customers know it\'s "for a limited time." This encourages immediate action. At the end of the promo period, you\'ll also be able to clearly see the bump it gave you. (Pro Tip: If the offer is doing really well and you\'re able, you might extend it a bit — but generally, stick to the deadline so customers learn to jump on your deals.)',
                estimatedTime: '10min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 0 * 7 * 24 * 60 * 60 * 1000)
              }
            ]
          };
        }

        // Add specific content for Week 2 (the detailed content you provided)
        if (week === 2) {
          module = {
            ...module,
            title: 'Optimize Google & Local Online Posts',
            description: 'Capture nearby searchers while your in-store offer is running. This week is about your online presence – especially your Google listing – to ensure people searching locally find your business and see a reason to visit.',
            content: `<h2>Week 2: Optimize Google & Local Online Posts</h2>
<p><strong>Theme:</strong> Capture nearby searchers while your in-store offer is running.</p>

<p>This week is about your online presence – especially your Google listing – to ensure people searching locally find your business and see a reason to visit. We'll also do a bit of social posting. Essentially, we're translating your physical offer into the digital realm to reach those who aren't walking by (yet).</p>

<p><strong>Why this matters:</strong> Nowadays, when people need something – a cup of coffee, a gift shop, a haircut – they often search online (think "best coffee near me"). If your business info is up-to-date and appealing, you'll show up in those local searches. And guess what: 88% of consumers who do a local search on their smartphone visit or call a store within a day. We want your business to be the one they find and choose. Optimizing your Google Business Profile (formerly Google My Business) is key for this. Plus, posting on local social media or community pages will spread the word to people who might not pass directly by your storefront.</p>

<h4>What to do this week:</h4>
<p>This week focuses on optimizing your online presence to capture local searchers. You'll update your Google Business Profile, refresh your business photos, leverage social media channels, engage with local searchers, and optimize your content for local search keywords. The goal is to ensure anyone searching for your type of business in your area finds you and sees a compelling reason to visit.</p>

<h4>Pro Tip:</h4>
<p>Think like a customer searching on their phone. What would catch your eye in the search results? Probably a business with good reviews, a clear description, and maybe a note about a special deal. So make sure your online description is compelling. If you're not sure how to word it, you can ask a friend for their opinion or even use an AI assistant to draft a friendly blurb ("What's a catchy way to announce a buy-one-get-one offer for my bakery on Google?"). Also, consistency counts: double-check that your info is correct across platforms (Google, Yelp, Facebook, etc.), so no one gets confused with old hours or wrong addresses. By the end of this week, you want someone sitting a mile away on their couch to see your post or listing and say, "Hey, let's go check this place out!"</p>`,
            tasks: [
              {
                id: 'task-2-1',
                taskId: 'week-2',
                title: 'Claim or update Google Business Profile',
                shortDescription: 'Ensure your Google listing is claimed and all information is accurate and up-to-date.',
                description: 'If you haven\'t claimed your Google listing, do that first. Make sure all info is accurate: correct address, phone, hours of operation, and website link. Add your logo or a profile image if not there. This week, add a post on your Google profile about your special offer.',
                estimatedTime: '45min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-2-2',
                taskId: 'week-2',
                title: 'Refresh business photos',
                shortDescription: 'Upload recent, appealing photos of your storefront and products.',
                description: 'Upload a couple of nice, recent photos. People love visuals – maybe a picture of your storefront (so they recognize it when they come), or a best-selling product beautifully displayed. If your in-store offer item is photogenic, include that! Good photos make your place look inviting online.',
                estimatedTime: '30min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-2-3',
                taskId: 'week-2',
                title: 'Post on local social media channels',
                shortDescription: 'Share your offer on social media and local community platforms.',
                description: 'Make a quick social media post about your offer. Use whatever platform your community follows you on. Keep it simple and local-focused. If there\'s a Facebook group for your town or a community bulletin board site, and they allow local business postings, share it there too.',
                estimatedTime: '20min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-2-4',
                taskId: 'week-2',
                title: 'Engage with local searchers',
                shortDescription: 'Respond to notifications, questions, and reviews on your Google listing.',
                description: 'Pay attention to any incoming notifications. This week, you might get more Google Maps views or even questions via your Google listing. Respond promptly and helpfully. Also, if you receive any new Google reviews this week, reply with a thank you. Active engagement on your profile can improve your visibility.',
                estimatedTime: '15min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-2-5',
                taskId: 'week-2',
                title: 'Optimize for local search keywords',
                shortDescription: 'Use location-specific language and keywords in your posts and updates.',
                description: 'In your posts and Google update, mention your location and the product/service, so it catches those "near me" searches. For example: "Downtown Springfield\'s bakery is offering half-off croissants this week." This isn\'t about magic SEO tricks, just plain language that matches what people look for.',
                estimatedTime: '15min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              }
            ]
          };
        }
        
        if (week === 3) {
          module = {
            ...module,
            title: 'Referral / Bring-a-Friend Boost',
            description: 'Turn your first wave of customers into ambassadors. This week focuses on referrals – encouraging customers to bring a friend or spread the word, effectively multiplying your foot traffic without much extra cost.',
            content: `<h2>Week 3: Referral / Bring-a-Friend Boost</h2>
<p><strong>Theme:</strong> Turn your first wave of customers into ambassadors.</p>

<p>This week focuses on referrals – encouraging customers to bring a friend or spread the word, effectively multiplying your foot traffic without much extra cost. You lit the spark with an offer, caught some eyeballs online, now let's fan the flame by leveraging word-of-mouth (the oldest, most powerful marketing channel).</p>

<p><strong>Why this matters:</strong> People trust recommendations from people they know. In fact, about 92% of consumers trust recommendations from friends and family more than any form of advertising. That's huge! When a happy customer tells a friend, it's like gold. So if you give your current customers a little nudge or reward to refer others, you can get a lot of new visitors at a low cost. Plus, a "bring-a-friend" deal has the bonus of getting your existing customer and their friend in the door together – double traffic!</p>

<h4>What to do this week:</h4>
<p>This week focuses on leveraging word-of-mouth marketing through referrals. You'll design a simple referral offer that rewards both the referrer and new customer, spread the word to all your customers, leverage social proof in-store, track referral activity, and show appreciation to those who bring in referrals. The goal is to turn your satisfied customers into brand ambassadors who actively bring new visitors to your business.</p>

<h4>Pro Tip:</h4>
<p>Word-of-mouth can feel "out of your control," but you can gently steer it. The best way is simply to provide great service (you're working on that!) and to ask for the referral at the right time. For example, after a customer says "I love this place!" you might reply, "Thank you so much! Please tell your friends – we'd love to treat them too." It's casual, friendly, and plants the idea. If you're a bit shy about asking directly, no worries – that's what the referral cards and signs are for. They'll do the talking for you. Finally, keep the barriers low: no complicated signup or forms, just "bring a pal, get reward." The easier and more fun you make it, the more people will participate. And don't forget to enjoy the process – it's actually really rewarding to see your customers become your advocates.</p>

<h4>Milestone Win:</h4>
<p><strong>First measurable bump in walk-ins.</strong> By the end of Week 3, look at the numbers you tracked. You should see an uptick – maybe it's modest, maybe it's big, but it's a visible bump in foot traffic compared to your baseline. That's a huge first win! Pat yourself on the back, because you've successfully sparked some new traffic. Keep that momentum going!</p>`,
            tasks: [
              {
                id: 'task-3-1',
                taskId: 'week-3',
                title: 'Design a simple referral offer',
                shortDescription: 'Create an incentive program that rewards both the referrer and the new customer.',
                description: 'Decide how you want to incentivize referrals. A popular approach is "Bring a friend, and you BOTH get something." For example: "Bring a friend and you each get 10% off your purchase," or "Refer a friend to our salon, and you both get a free upgrade (you a deep conditioning, they get a free product)." The key is that the existing customer feels good about referring (they get a perk), and the new customer has a built-in reason to choose you (the perk or discount).',
                estimatedTime: '30min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-3-2',
                taskId: 'week-3',
                title: 'Spread the word to customers',
                shortDescription: 'Inform all customers about your referral program through cards, verbal communication, and email.',
                description: 'Now let every customer know about it! You can print little referral cards (even on basic cardstock or business cards) that say something like "Friend Referral Card: Bring this with a friend who\'s new here, and you both get [reward]." Hand one to each customer this week and explain the deal briefly. Or, simply tell them verbally: "If you loved your visit, bring a friend next time – we\'ll give you both 15% off as a thank you!" If you have an email list of customers, shoot them a friendly email announcing this "friends get rewards" week.',
                estimatedTime: '45min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-3-3',
                taskId: 'week-3',
                title: 'Leverage social proof in-store',
                shortDescription: 'Create visible evidence of referrals happening to encourage more participation.',
                description: 'A subtle trick: when someone does bring a friend, make a little positive fuss. "Oh, you brought a friend – that\'s awesome! Don\'t forget, you both get your free gift today." This shows other customers (within earshot) that referrals are happening and appreciated. You could even put up a small sign by the counter: "Love [Your Business]? Tell a friend! We\'ll treat them (and you) to something special." It plants the seed in everyone\'s mind.',
                estimatedTime: '20min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-3-4',
                taskId: 'week-3',
                title: 'Track referrals (lightly)',
                shortDescription: 'Keep a simple tally of referral activity to measure success and ensure proper execution.',
                description: 'Keep a simple tally of how many people take advantage of this bring-a-friend offer. It can be as easy as a notebook by the register: "X referred Y" got discount. This will not only make sure you honor the deal correctly but also give you a sense of how well it\'s catching on. At week\'s end, you might see "Wow, 10 new customers came with friends." Celebrate that!',
                estimatedTime: '15min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-3-5',
                taskId: 'week-3',
                title: 'Thank the referrers',
                shortDescription: 'Show appreciation to customers who bring in referrals to encourage continued advocacy.',
                description: 'If you can identify who referred whom (like if a customer Jane brought her friend and we know it), consider thanking Jane next time or even a bonus perk later. For now, a genuine "Thank you so much for spreading the word!" is great. People love feeling appreciated, and it will encourage them to keep championing your business.',
                estimatedTime: '10min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              }
            ]
          };
        }
        
        if (week === 4) {
          module = {
            ...module,
            title: 'Eye-Catching Sidewalk/Window Campaign',
            description: 'Get creative with your curb appeal! This week focuses on making your storefront truly stand out to attract people who might normally walk past.',
            content: `<h2>Week 4: Eye-Catching Sidewalk/Window Campaign</h2>
<p><strong>Theme:</strong> Get creative with your curb appeal!</p>

<p>This week, you'll run a small "campaign" using your sidewalk or window to draw attention. Think of it as taking your signage to the next level – using humor, art, or a catchy message to turn heads and make people stop in their tracks. The goal is to make anyone passing by curious enough to come take a closer look (and then walk in!).</p>

<p><strong>Why this matters:</strong> You've already seen the value of basic signage in Week 1. Now, by making your storefront truly stand out, you can attract people who might normally walk past. A clever sidewalk sign or an attractive window display can become a local talking point. It not only draws foot traffic but can also end up on social media if it's really clever or cute (free advertising!). Plus, it's fun! When you unleash a bit of creativity, you engage your community in a memorable way. Remember that statistic: about 76% of consumers have entered a store for the first time because of a sign. This is our chance to be that sign that lures them in.</p>

<p>One example of a creative sidewalk chalkboard sign reads: "Come in and try the worst meatball sandwich that one guy on Yelp ever had in his life." This humorous approach took a negative review and turned it into a positive marketing tool – it made passersby laugh and piqued their curiosity enough to step inside. Using wit or a playful message on your sign can make your business more approachable and even shareable online, all while drawing in curious new customers.</p>

<h4>What to do this week:</h4>
<p>This week focuses on creative curb appeal that goes beyond basic signage. You'll brainstorm catchy messages or concepts, spruce up your sidewalk signs or window displays, tie content to timely events, observe and adjust based on reactions, and share your creative displays online. The goal is to make your business a local talking point that draws curious new visitors.</p>

<h4>Pro Tip:</h4>
<p>Consistency and personality make a difference. If people start associating your business as "that place with the funny signs" or "the shop that always has the cool window," you're carving out a little niche in their minds. That's branding! Keep the tone consistent with your brand – if you're a playful, quirky store, go wild with humor; if you're a spa or serious business, maybe a calming quote or beautiful imagery fits better. And don't stress about being a professional artist or writer. Authentic, even slightly imperfect, messages can be very endearing. In fact, a hand-drawn cartoon that's a bit silly can make people smile precisely because it's human. Finally, have fun with it! This is one of those marketing tasks where you get to play. Enjoy the creativity – your customers (and future customers) will feel that positive energy and be drawn to it.</p>`,
            tasks: [
              {
                id: 'task-4-1',
                taskId: 'week-4',
                title: 'Brainstorm a catchy message or concept',
                shortDescription: 'Create a fun phrase, pun, joke, or quirky statement for your sidewalk sign or window.',
                description: 'Set aside a little time to think of a fun phrase or theme for your sidewalk sign or window. It could be a pun, a joke related to your business, an inspiring quote, or a quirky statement. For instance, a coffee shop might write "Life happens, coffee helps." A bookstore might have a sign saying "Feeling shelf-conscious? Come get a new book!" Don\'t worry if you\'re "not a creative person" – you can get ideas from the internet (search "funny sidewalk signs" for inspiration) or ask friends or colleagues for suggestions. You could even ask an AI assistant to generate a few witty lines related to your business. The key is the message should be short, readable, and engaging. If humor isn\'t your style, you can go for intriguing: "Did you know? We have a secret menu. Ask us!" – something that prompts questions.',
                estimatedTime: '30min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-4-2',
                taskId: 'week-4',
                title: 'Spruce up your sidewalk sign or window display',
                shortDescription: 'Create a visually striking display that turns heads and makes people stop.',
                description: 'If you have a sidewalk A-frame or chalkboard, use it every day this week with your message. Make it legible – use bold chalk or markers, add a little drawing if you\'re artsy (even simple smiley faces or doodles help). If you don\'t have a physical sidewalk sign, focus on your window: create a display that turns heads. This could mean arranging your best products in a cool way, putting up some decorations or props, or even painting the window (window paint markers can be fun). For example, a bakery could stack bread in a pyramid with a sign "Built on good carbs – climb on in!" Whatever you do, ensure it\'s visually striking. Bright colors, big letters, and at eye-level are good practices.',
                estimatedTime: '45min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-4-3',
                taskId: 'week-4',
                title: 'Tie it to something timely (optional)',
                shortDescription: 'Connect your message to current holidays, events, or local happenings.',
                description: 'People pay attention to what\'s current. Is there a holiday or local event coming up? Can you riff on that? E.g., if it\'s nearing Halloween: "Our coffee is SCARY good – try our pumpkin spice!" Or if a local sports team has a big game: "Show your team spirit here – wear [team] colors, get 5% off." Timely messages show you\'re a part of the community conversation. (Just be sure to stay lighthearted and non-controversial.)',
                estimatedTime: '20min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-4-4',
                taskId: 'week-4',
                title: 'Observe and adjust',
                shortDescription: 'Watch reactions and tweak your message based on what resonates with passersby.',
                description: 'All week, watch how people react. Do they stop and chuckle at your sign? Do new faces wander in saying "I love your sign!"? This feedback is golden. If something isn\'t getting any looks, try a new message mid-week. The beauty of a chalkboard or window marker is you can tweak on the fly. By the end of the week, you might discover that a certain style of message (humor, trivia, bold art) resonates most with your crowd.',
                estimatedTime: '15min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-4-5',
                taskId: 'week-4',
                title: 'Share it online too',
                shortDescription: 'Post photos of your creative displays on social media to extend reach.',
                description: 'Take a nice photo of your clever sidewalk or window display and share it on your social media. Caption it with something like "Decided to have some fun with our sign – what do you all think?" This can get engagement from people who haven\'t seen it in person and might encourage them to come visit. It also gives your existing followers something to smile about and share with friends, potentially drawing their friends to your store. You can even make it a recurring thing (e.g., "Witty Sign Wednesday" where you post a new sign each week).',
                estimatedTime: '20min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              }
            ]
          };
                }
        
        if (week === 5) {
          module = {
            ...module,
            title: 'Hyper-Local Digital Presence',
            description: 'Engage with your neighborhood online. This week focuses on tapping into hyper-local digital platforms to show up where your neighbors are talking and looking for recommendations.',
            content: `<h2>Week 5: Hyper-Local Digital Presence</h2>
<p><strong>Theme:</strong> Engage with your neighborhood online.</p>

<p>This week, you'll extend your visibility by tapping into hyper-local digital platforms – think Nextdoor, local Facebook groups, community forums, and the Chamber of Commerce or local bulletin boards. The idea is to show up where your neighbors are talking and looking for recommendations online, so more locals discover you even if they haven't encountered your store yet.</p>

<p><strong>Why this matters:</strong> Modern word-of-mouth often happens on keyboards and phone screens. Neighbors ask "Do you know a good [your business type] around here?" on Nextdoor or community Facebook groups all the time. You want to make sure when those conversations happen, your name pops up – or even better, you're proactively sharing helpful info so people get to know you. Nextdoor in particular is huge for local discovery – about 1 in 3 households in the US are on Nextdoor, and 76% of Nextdoor users have been influenced by a neighbor's business recommendation. That's powerful! Similarly, many towns have Facebook or Reddit communities where locals discuss what's new or where to go. By having a presence in these digital neighborhood spots, you'll reach people who might live or work nearby but don't walk past your door daily. It's essentially expanding your "word-of-mouth radius."</p>

<h4>What to do this week:</h4>
<p>This week focuses on establishing a presence in your digital neighborhood. You'll join or update your Nextdoor business profile, engage in local Facebook/community groups, leverage local Chamber of Commerce and community boards, start your own neighborhood conversations, and maintain responsive, neighborly communication. The goal is to become a trusted local voice in online community spaces.</p>

<h4>Pro Tip:</h4>
<p>Authenticity wins in local forums. When using Nextdoor or Facebook groups, avoid coming off like a pushy salesperson. You're a neighbor first, business owner second in these spaces. Share pictures, tell little stories (e.g., "Look at this cool cake we just made today!" with a pic, in a local foodie group), celebrate community events (congratulate the local high school on their big win, etc. if it feels right to post). By building a genuine rapport, you'll be on people's radar. Then, when you drop a clear call-to-action (like announcing a special event or sale), people are much more receptive because they know you as a friendly neighbor business who provides value. Also, these efforts often have a cumulative effect – the more consistently you engage locally online, the more trust and word-of-mouth you build. You might not see a flood from one post, but over weeks and months, you'll notice more people saying "Oh I saw your post on Nextdoor!" or "My friend mentioned you on Facebook." That's growth you can't easily buy. Keep at it!</p>`,
            tasks: [
              {
                id: 'task-5-1',
                taskId: 'week-5',
                title: 'Join Nextdoor (or update your Business Page)',
                shortDescription: 'Create or claim your business profile on Nextdoor to reach local neighbors.',
                description: 'If you haven\'t already, get on Nextdoor. Nextdoor has a feature for businesses – you can create a business profile where you list your services, hours, and can post updates. If you prefer, you can also participate as an individual (some neighborhoods prefer recommendations coming from community members rather than self-promotion). First, see if you can claim your business on Nextdoor: search for your business name on Nextdoor\'s business section. If it exists, claim it; if not, create a new profile. Fill out the basics (description, contact info, a nice cover photo). Post a friendly introduction to the neighborhood: e.g., "Hi neighbors! We\'re [Your Business Name], a [type of business] located on Main St. We just wanted to introduce ourselves here. We love being a part of the community and hope you\'ll stop by sometime – we\'re the green storefront next to the post office. Feel free to reach out if you have any questions about [your product/service], we\'re always happy to help!" Keep it neighborly, not salesy. This is about making your name familiar.',
                estimatedTime: '45min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-5-2',
                taskId: 'week-5',
                title: 'Engage in a local Facebook/Community Group',
                shortDescription: 'Find and participate in popular local online groups to build community presence.',
                description: 'Find one or two popular local groups online. Common ones: "You Know You\'re From [Town] If… (community chat)", "[Town] Community Board", or interest-based ones like "[Town] Foodies" if you\'re a restaurant. Request to join (if closed group) and observe the vibe. Many groups have specific days or threads for business postings – check the rules. This week, make a contribution. It could be: sharing a local tip or event (not directly about your business, to build goodwill), or if allowed, a soft promotion. For instance, in a local parenting group, a kids\' bookstore owner might share "10 Favorite Bedtime Stories – as recommended by our little customers!" with a note like "(Compiled by [Bookstore Name] in town – happy to help if you\'re looking for book ideas!)". The point is to provide value or genuine engagement, rather than just "ad, ad, ad." By doing so, you become known and trusted. Then when someone asks "Any good bookstores around?", group members might tag you or recall your helpful post.',
                estimatedTime: '60min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-5-3',
                taskId: 'week-5',
                title: 'Leverage the local Chamber or community boards',
                shortDescription: 'Connect with local business organizations and community bulletin boards.',
                description: 'If your town has a Chamber of Commerce, a downtown alliance, or even a local newspaper with an events calendar or local business spotlight – use it. This could mean submitting your business info to a local directory, or asking the Chamber if they\'ll mention your ongoing promotion or event (from last week or upcoming) in their newsletter. Some Chambers have "member news" or will do a shout-out if you\'re a member (if you\'re not a member, consider if joining makes sense – they often help promote local businesses). Also, check physical community boards (library, community center, coffee shops) – do they allow flyers? Pin up a nice flyer about your business or current deal there. It\'s low-tech, but still part of hyper-local presence!',
                estimatedTime: '30min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-5-4',
                taskId: 'week-5',
                title: 'Start your own neighborhood conversation',
                shortDescription: 'Create helpful posts that showcase your expertise without being overly promotional.',
                description: 'Consider making a helpful post on Nextdoor or other platforms that isn\'t a direct ad but highlights your expertise. For example, a garden supply store could post "5 Tips to Prep Your Garden for Winter (from a local gardener)" and sign off with your name/business. Or a bakery might post in "Recipes" section with a simple recipe, mentioning people can find the ingredients at your shop. Think of it as content marketing but hyper-local. It builds your reputation as the local expert in your field. When people realize "Oh, that\'s the bakery that shared that recipe, nice!" they feel more inclined to visit.',
                estimatedTime: '40min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-5-5',
                taskId: 'week-5',
                title: 'Be responsive and neighborly',
                shortDescription: 'Maintain active, helpful presence in local online communities.',
                description: 'All week (and beyond), keep an eye on these channels. If someone asks for a recommendation that fits your business, chime in (politely, not over-eager). Example: "Hi! Since you asked for coffee shops in the area, I wanted to mention my cafe, [Name], on 3rd Street. We\'d love to host you – we\'re known for our lattes. But I also agree with others, [Other Café] is great for pastries!" (Being honest and not dismissing other businesses shows you\'re community-minded, not just self-serving.) If someone replies to your posts or asks a question ("What time do you open?"), answer promptly. Show that you\'re present and listening.',
                estimatedTime: '20min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              }
            ]
          };
        }
        
        if (week === 6) {
          module = {
            ...module,
            title: 'Simple Neighbor Collab',
            description: 'Team up with a nearby business for mutual benefit. This week focuses on collaboration and cross-promotion to expand your reach through partnerships.',
            content: `<h2>Week 6: Simple Neighbor Collab</h2>
<p><strong>Theme:</strong> Team up with a nearby business for mutual benefit.</p>

<p>This week is about collaboration – specifically, a cross-promotion or small partnership with one other local business. By combining forces, you can introduce your business to your neighbor's customers and vice versa, effectively swapping audiences and boosting visibility for both of you. It's win-win and doesn't have to cost a dime.</p>

<p><strong>Why this matters:</strong> Local businesses aren't just in a community; together, they are the community. When businesses support each other, everyone benefits. If a customer loves visiting Business A and sees Business B is a friend of A, they're more likely to trust and try Business B (that's you!). For example, a gym and a smoothie bar might collaborate – gym-goers get a smoothie discount and smoothie customers get a free gym day pass. Each business gains exposure to the other's loyal patrons. These neighbor collaborations not only increase foot traffic in the short term (people bouncing between the two shops to redeem offers) but also build goodwill. It shows you're community-minded, not just out for yourself. Plus, it's just nice to make friends with fellow business owners – you can share insights and maybe cookies.</p>

<h4>What to do this week:</h4>
<p>This week focuses on building business partnerships that expand your reach. You'll identify a complementary business partner, propose a simple cross-promotion, execute the plan together, promote the collaboration, and evaluate the results. The goal is to reach new customers through mutual business relationships and strengthen your position in the local business community.</p>

<h4>Pro Tip:</h4>
<p>Keep collaborations simple and genuine. The goal here isn't to create a complex business partnership contract – it's to build community spirit and swap some traffic. Even if your collab only brings a handful of new faces, those are people who may become regulars once they know you exist. Also, by being a connector in the business community, you enhance your reputation. Other business owners might notice and want to work with you too. Over time, you could become known as an active, supportive member of the local business scene, which can lead to referrals. Lastly, have fun with it! Snap a photo together with the other owner, post it saying "Meet our neighbor!" People love to see local businesses supporting each other. It gives them the warm-fuzzies and another reason to choose Main Street over a big-box or online giant.</p>

<h4>Milestone Win:</h4>
<p><strong>New locals discovering you for the first time.</strong> By the end of Week 6, you should have reached people outside your usual bubble. Maybe you saw some customers from that Facebook group stop by, or folks came in saying "I heard about you from [Neighbor Business]!" That's awesome. It means your visibility in the community is growing. Celebrate the fact that your reach is now beyond just random foot traffic – you're actively drawing in new local fans.</p>`,
            tasks: [
              {
                id: 'task-6-1',
                taskId: 'week-6',
                title: 'Identify a good partner',
                shortDescription: 'Find a complementary business nearby that shares a similar customer base.',
                description: 'Look around your immediate vicinity or think of businesses in your town that complement yours. Ideally, pick one that isn\'t a direct competitor but shares a similar customer base or vibe. For instance, if you run a boutique clothing store, a neighboring salon or jewelry store could be great – customers interested in fashion might be into beauty services or accessories. If you have a cafe, maybe team up with the bookstore or flower shop down the street. Even businesses that seem unrelated can partner if the owners are game (e.g., a pet store and a bakery might both attract families). The key is the other business has its own loyal customers who may not know about you yet, and your customers may not know them – so you can each introduce one another. Jot down one or two candidates and then simply reach out.',
                estimatedTime: '30min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-6-2',
                taskId: 'week-6',
                title: 'Propose a simple cross-promotion',
                shortDescription: 'Create a mutually beneficial promotion that encourages customers to visit both businesses.',
                description: 'Keep it easy and mutually beneficial. You could do something like: "Show a receipt/business card/flyer from [Neighbor Business] and get 10% off your purchase at our store this week – and they\'ll do the same for our customers." This way, if someone visits one shop, they have a reason to pop into the other. Another idea: a combined event or discount day – e.g., "This Saturday, visit the Block Party: 10% off at both [Your Store] and [Neighbor Store]!" If you both have email lists or socials, you can announce to your respective audiences. Or even simpler: flyer swap – each of you display the other\'s flyers or coupons at your counter. For example, you give out a coupon "10% off at Jenny\'s Salon" and they hand out "10% off at Your Shop." It can be as low-tech as that. Discuss with the business owner what they\'re comfortable with and excited about. Most small business owners will happily cooperate when it\'s clearly fair and small-scale.',
                estimatedTime: '45min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-6-3',
                taskId: 'week-6',
                title: 'Execute the plan together',
                shortDescription: 'Coordinate with your partner to implement the cross-promotion.',
                description: 'Once you agree on the idea, coordinate the details. Set the timeframe (maybe one week, or a particular day). Create a simple flyer or coupon (if doing that) – it could literally be printed text or an email graphic, doesn\'t need to be fancy. Make sure both of you have the materials to give out or display. If it\'s an event/day, ensure both mention it to customers: "By the way, Saturday we\'re teaming up with [Neighbor]! Shop at both places and get a deal." Enthusiasm helps – if you and your staff are excited and mention the collab, customers will get curious.',
                estimatedTime: '60min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-6-4',
                taskId: 'week-6',
                title: 'Promote the collaboration',
                shortDescription: 'Use social media and signage to announce and promote your partnership.',
                description: 'Use your social media or window signs to announce it: "We ❤ our neighbor [Business]! This week, bring your receipt from them and get 15% off here." Tag the neighbor on social if you can, and have them do the same. This cross-tags can attract some of their followers to check you out and vice versa. If the other business has a newsletter or social, coordinate a shout-out there too. Essentially, you\'re vouching for each other in front of your audiences. It\'s like a friend introducing you to one of their friends – a warm introduction, which new customers will appreciate.',
                estimatedTime: '30min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-6-5',
                taskId: 'week-6',
                title: 'Evaluate and thank each other',
                shortDescription: 'Review results with your partner and strengthen the business relationship.',
                description: 'At the end of the week, touch base with your collaborator. How did it go? Did customers mention it or redeem coupons? Swap notes on what you observed. Even if the turnout was small, don\'t be discouraged – sometimes just the public show of unity has marketing value in itself. Make sure to sincerely thank the other business for teaming up. Perhaps stop by with a small treat (maybe from your business) or a thank-you card. Keeping that relationship sweet might lead to future collaborations. Who knows, you might even find a long-term referral partner (e.g., the salon always recommends your boutique for outfits, and you always recommend the salon – beautiful!).',
                estimatedTime: '20min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              }
            ]
          };
        }
        
        if (week === 7) {
          module = {
            ...module,
            title: 'Upgrade In-Store Experience',
            description: 'Make your in-store experience so delightful that people can\'t wait to return (and bring friends). This week focuses on elevating what customers see, hear, and feel when they visit.',
            content: `<h2>Week 7: Upgrade In-Store Experience</h2>
<p><strong>Theme:</strong> Make your in-store experience so delightful that people can't wait to return (and bring friends).</p>

<p>This week, you'll find simple ways to elevate what customers see, hear, and feel when they walk into your business. By creating a memorable and positive customer experience, you increase the chances that first time visitors become regulars and that they'll rave about you to others.</p>

<p><strong>Why this matters:</strong> We've brought new people in; now let's keep them coming. A great product or service gets them in once, but a great experience is what makes them loyal. Think about places you love to visit – maybe a shop where the owner knows your name or a cafe with such a cozy atmosphere you never want to leave. Those factors are part of customer experience. It's proven that customers value experience highly – about 80% of customers say the experience a company provides is as important as its products or services. That's huge! A happy experience means people stay longer, spend more, and come back. Plus, they're likely to tell friends, "You've got to check this place out, it's so nice!" So investing a bit of effort here pays off in both loyalty and word-of-mouth.</p>

<h4>What to do this week:</h4>
<p>This week focuses on creating memorable customer experiences that encourage repeat visits and positive word-of-mouth. You'll conduct a critical walkthrough of your space, engage all the senses, personalize your service, add surprise and delight elements, and ensure consistency and cleanliness. The goal is to make customers feel so good about their visit that they can't wait to return and tell others.</p>

<h4>Pro Tip:</h4>
<p>Be a customer of your own business. One trick: sometime this week, step outside and then walk back in and pretend you've never been there. Or have a friend do it and report back. The first 5 seconds are critical. Did someone greet them? Did the place feel welcoming or confusing? Use that feedback. Also, read your recent reviews (if you have any) for clues on experience: people often mention "The staff was so friendly!" or unfortunately, "cashier was rude" – learn from that. Another angle: think of low-cost experiential extras that align with your brand. If you're a toy store, maybe have a small play area for kids. A clothing boutique could offer a mirror with nice lighting and maybe a phone charging station nearby. A pet store might have a water bowl at the entrance for dogs and free treats. These touches make people comfortable, and comfortable people stick around longer (which often means they buy more) and they tell others. Lastly, encourage feedback: put a little sign "How was your visit? Let us know!" with a chalkboard or a quick QR code to a feedback form. Customers appreciate that you care, and you might get great ideas directly from them. All in all, by supercharging your in-store experience, you're laying the groundwork for loyalty and positive buzz. When customers say, "I love going there, it just feels good", you've succeeded!</p>`,
            tasks: [
              {
                id: 'task-7-1',
                taskId: 'week-7',
                title: 'Take a critical walkthrough',
                shortDescription: 'Experience your store through fresh eyes and identify areas for improvement.',
                description: 'Start by experiencing your store through fresh eyes. Walk in as if you\'re a new customer – what\'s your first impression? Is the entrance inviting? Does the space look and smell clean? Are products easily accessible? Note down anything that feels off or could be improved. Maybe the lighting in one corner is dim, or the signage for sections is unclear, or there\'s a cluttered area that could be tidier. Pick one or two of these and fix them this week. For example, if lighting is an issue, change a bulb or add a lamp for warmth. If layout is confusing, add a cute sign ("Chocolates this way ->") or rearrange slightly. Small tweaks can significantly improve comfort and clarity for customers.',
                estimatedTime: '45min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-7-2',
                taskId: 'week-7',
                title: 'Engage all the senses',
                shortDescription: 'Create a multi-sensory experience through music, scent, and tactile elements.',
                description: 'Great experiences are multi-sensory. Consider music – do you have appropriate background music playing? The right music can create a mood (calming in a spa, upbeat in a store on a Saturday, etc.). Consider scent – a pleasant smell can uplift (a clothing boutique might use a light vanilla scent; a bakery, well it already smells amazing!). Even tactile elements – are the shopping baskets comfy to carry, are chairs (if any) cozy? This week, implement at least one sensory upgrade. Examples: curate a playlist and have it softly playing. Light a mild-scented candle (if safe and allowed) or use an essential oil diffuser (nothing too overpowering). These touches make your place feel good to be in.',
                estimatedTime: '60min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-7-3',
                taskId: 'week-7',
                title: 'Personalize your service',
                shortDescription: 'Make every customer feel genuinely welcome and remembered.',
                description: 'A huge part of experience is how customers are treated. Aim to make every person who walks in feel genuinely welcome. If you have employees, have a quick huddle to emphasize friendliness: warm greetings, eye contact, a smile. It might sound basic, but a cheerful "Hi there! Let us know if you need anything" can set a positive tone. Throughout this week, make an effort to remember or ask names – "What was your name? Hope to see you again, [Name]!" If someone mentions something (like they\'re shopping for a birthday), make a note and next time you can ask, "How was your friend\'s birthday?" These little things blow people away because it\'s increasingly rare. If remembering details is hard, consider keeping a small notebook behind the counter to jot quick notes (e.g., "Customer in red coat – name John, likes vanilla lattes"). It might feel silly, but it helps build real relationships.',
                estimatedTime: '30min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-7-4',
                taskId: 'week-7',
                title: 'Add a surprise & delight element',
                shortDescription: 'Create memorable moments that spark joy and encourage sharing.',
                description: 'Think of a small treat you can give customers this week to make their visit memorable. It could be literal – like a piece of candy at checkout, free samples of a new product, or complimentary gift wrapping. Or experiential – a comfy seating area they didn\'t expect, or a Polaroid photo wall where you snap customers\' pictures (with permission) and pin it up as "Customer of the Week." Even a fun chalkboard where customers can write one word describing their day. The idea is to create a spark of joy. For example, some cafes give a little chocolate with your coffee – costs them pennies, but people remember it. Decide on one "wow" touch and do it all week. Monitor reactions – are people smiling, commenting? Those smiles are what you\'re after.',
                estimatedTime: '40min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-7-5',
                taskId: 'week-7',
                title: 'Ensure consistency and cleanliness',
                shortDescription: 'Maintain high standards and fix any issues that could create negative impressions.',
                description: 'A big part of good experience is simply nothing goes wrong – no bad impressions. So double-check the basics: Is the store clean (floors, counters, restrooms if applicable)? Are all lights working? No weird smells or too much dust? Is staff dressed appropriately and looking neat? Fix any glaring issues. Also consider speed and convenience: if there\'s often a wait, maybe this week prepare a small distraction (like "while you wait, enjoy a free sample" or have a little bowl of mints). By the end of the week, aim for a customer to leave thinking, "That was a really nice visit."',
                estimatedTime: '30min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              }
            ]
          };
        }
        
        if (week === 8) {
          module = {
            ...module,
            title: 'Flash Sale or Mini Event',
            description: 'Create a burst of excitement and urgency with a special one-time event or flash sale. This week focuses on generating buzz through limited-time promotions.',
            content: `<h2>Week 8: Flash Sale or Mini Event</h2>
<p><strong>Theme:</strong> Create a burst of excitement and urgency with a special one-time event or flash sale.</p>

<p>This week, you'll plan and execute a short, limited-time promotion or event that gets people talking and through the door in a hurry. The idea is to do something a little out of the ordinary that grabs attention – something your customers (and their friends) don't want to miss.</p>

<p><strong>Why this matters:</strong> Scarcity and novelty are powerful motivators. When people feel "This is happening NOW and I don't want to miss out," they're more likely to act. A flash sale (a big discount that only lasts for a very short period) or a mini event (like an in-store happening) creates that FOMO – Fear Of Missing Out. It also gives your existing customers a reason to come back sooner than they might have, and ideally bring others along ("Hey, there's a sale/event at my favorite shop, let's go!"). Moreover, events and sales generate buzz – people might mention it on social media or to friends ("I'm going to this cool thing at X store, want to join?"). Even on a small scale, these are "talking points" that keep your business in conversations. It's not just about the one-day boost; it's about energizing your customer base and attracting new folks who are drawn by the excitement. Think of it as lighting a firecracker in the middle of our 12-week plan – a quick bang that gets everyone's attention.</p>

<h4>What to do this week:</h4>
<p>This week focuses on creating excitement and urgency through limited-time promotions and events. You'll choose between a flash sale or mini event concept, plan the logistics quickly, promote aggressively in a short burst, execute with enthusiasm, and leverage the aftermath for continued buzz. The goal is to create a memorable experience that gets people talking and generates FOMO.</p>

<h4>Pro Tip:</h4>
<p>When doing a special event or sale, highlight what makes it special. If it's a sale, 50% off may speak for itself, but if it's an event, maybe it's "first 20 attendees get a swag bag" or "featuring a local artist live painting in store!" Little hooks like that drive interest. Also, collaboration can extend here: you could invite your Week 6 neighbor partner to be part of it (e.g., the bakery's special event has coffee provided by the cafe next door, etc.). One more thing: consider tying the event to a cause if appropriate – like a portion of flash sale proceeds go to a local charity, or you're collecting canned goods at the event for the food pantry. People love to support businesses that give back, and it gives extra PR material ("Local Shop Hosts Charity Sale"). Only do this if it's genuine and manageable for you, of course. Lastly, prepare for a bit of chaos – if 5pm hits and a rush comes in, stay cool and positive. Embrace the hustle. It can actually be a lot of fun when you see your store buzzing. Even if not as many people show up as you hoped, treat whoever does come like they're part of an exclusive VIP experience. They'll remember that, and maybe more will come next time. You're learning what events work for your audience, so it's all useful feedback. Keep notes for next time (what time worked, what promo channels were effective, etc.). Good job on adding some sizzle to the routine this week!</p>`,
            tasks: [
              {
                id: 'task-8-1',
                taskId: 'week-8',
                title: 'Choose your flash sale or event concept',
                shortDescription: 'Decide between a flash sale or mini event that fits your business and resources.',
                description: 'Decide whether you want to do a flash sale or a mini event (or a combo). A flash sale is typically a steep discount on certain items or services for a very limited time (could be a single day or even a 2-hour window). For example, "Friday 5–7pm: All shoes 30% off, in-store only!" Or "Saturday: Fill a bag with books for $10." It should feel like a big deal. A mini event could be something like a workshop, demonstration, themed party, or customer appreciation gathering. For instance, a hardware store might host a free "DIY workshop" for an hour, a boutique could have a "Styling event" with a local stylist giving tips, a cafe might have a live musician one afternoon, or a simple "Customer Appreciation Day – free coffee and cookies while you shop, this Saturday 10–2." It doesn\'t need to be elaborate – just something special. Pick whatever fits your business and resources. If time is short, lean toward a sale (easier to prep). If you have a cool idea for an event and the means to do it, go for it!',
                estimatedTime: '30min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-8-2',
                taskId: 'week-8',
                title: 'Plan the logistics quickly',
                shortDescription: 'Keep planning straightforward and focus on essential elements for your event or sale.',
                description: 'Since this is a short-term plan, keep it straightforward. Once you have the idea, list what\'s needed. For a sale: which items/discounts, signage for the discount, maybe extra staff if you expect a rush, and inventory check (ensure you have enough of the sale items). For an event: what\'s the timeline, do you need any setup like chairs, a table, music, refreshments? Do you need an extra hand or a friend to help that day? Check any permissions if it\'s something like music (probably fine if it\'s in-store and not too loud). Don\'t overthink it – the key is doing it, not making it perfect. This is a mini event, not a gala.',
                estimatedTime: '45min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-8-3',
                taskId: 'week-8',
                title: 'Promote, promote, promote (in a short burst)',
                shortDescription: 'Use all available channels to announce your event or sale with urgency and excitement.',
                description: 'The advantage of a flash sale/event is it\'s newsworthy, but you have to get the word out on short notice. Use all channels you have to announce it a few days before and leading up to it: In-store: Put up posters or signs about it. If it\'s Monday and you plan something for Friday/Saturday, that\'s perfect – tell every customer all week "We\'re having a big sale on Friday 5–7pm, just so you know!" or "This Saturday we\'re doing a little spring celebration event, drop by for snacks and sales!" Social media: Make a catchy post: "This Saturday ONLY: [Your Event/Sale]! Here\'s what\'s happening... [brief details]. Don\'t miss it – bring a friend!" Use an image if possible (even if it\'s just a graphic with text "SALE" or a photo from your shop). Post it on all platforms you use. Maybe post once mid-week and once the day before/day of. Email/newsletter: If you have a customer email list, send a short email blast: "One-Day Sale Alert!" or "Join us for [Event] this Saturday." Keep it enthusiastic and highlight the benefit (discount or fun experience). Personal reach-outs: For something like a workshop or event, personally invite some regular customers ("Hey Sarah, we\'re doing a cupcake-decorating demo on Saturday, thought you might enjoy it!"). People love being personally invited – it makes them feel valued. If you have a VIP customer list or even phone numbers, you might text a few (if appropriate) with a friendly note about it.',
                estimatedTime: '60min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-8-4',
                taskId: 'week-8',
                title: 'Execute with enthusiasm',
                shortDescription: 'Create a fun, lively atmosphere and engage with all visitors during your event or sale.',
                description: 'On the day of the sale/event, create a fun, lively atmosphere. If it\'s a sale, you can play upbeat music, have all staff pumped and ready to help, maybe have a bowl of candy or some small freebie to thank people for coming during the special hours. If it\'s an event, make it welcoming: maybe name tags if it\'s a workshop, or a sign that says "Welcome friends!" at the door. Take some pictures (these are great for later social proof). Most importantly, engage with visitors – especially new faces. If a bunch of new customers come because of the sale, take a moment to say hi and welcome, maybe slip them a business card or tell them "We\'re here to help anytime, hope to see you again!" If it\'s an event, mingle and make sure everyone\'s having a good time.',
                estimatedTime: '120min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-8-5',
                taskId: 'week-8',
                title: 'Leverage the aftermath',
                shortDescription: 'Share results and photos on social media to extend buzz and build anticipation for future events.',
                description: 'After it\'s over, hop on social media to post a thank you: "Wow, thanks to everyone who came to our flash sale today – it was a blast! We loved seeing so many new and familiar faces." Or if it was an event, share a couple of photos: "We had so much fun at our workshop today – huge thanks to all who joined!" This not only shows appreciation (which customers notice) but also lets those who missed out see that something cool happened (and maybe they\'ll make sure to catch the next one). You might even get comments like "Let me know next time!" – building anticipation for future events.',
                estimatedTime: '30min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              }
            ]
          };
        }
        
        if (week === 9) {
          module = {
            ...module,
            title: 'Customer Social Proof & Referrals',
            description: 'Let your customers become your marketers. Focus on social proof, customer-generated content, and reinforcing referrals to create a self-sustaining buzz.',
            content: `<h2>Week 9: Customer Social Proof & Referrals</h2>
<p><strong>Theme:</strong> Let your customers become your marketers.</p>

<p>This week, you'll focus on social proof – things like customer reviews, testimonials, and content generated by your customers – as well as reinforcing referrals and encouraging repeat visits. You want to actively encourage happy customers to share their experiences, because their voice often carries more weight than your own advertising. Essentially, it's about amplifying the positive buzz that's building around your business.</p>

<p><strong>Why this matters:</strong> People trust other people's opinions and actions. If someone sees that others are visiting and loving your business, they're more likely to check it out. That's social proof. It comes in many forms: online reviews, star ratings, customer photos on Instagram, testimonials on your website, or even just a lively store that looks popular. We already tapped into referrals (Week 3) and improved experience (Week 7) – now let's close the loop by making sure those happy experiences turn into public praise or recommendations. Consider that 88% of people trust online reviews written by other consumers as much as personal recommendations. Wow! That means a stranger's review on Google or Yelp can be nearly as influential as a friend telling someone about you. So we definitely want to boost our positive reviews. Also, a person who comes back with a friend (referral) or posts about you on their social media is giving you free exposure. By encouraging and facilitating these actions, you essentially have customers doing marketing for you – the holy grail for a small business with limited budget.</p>

<h4>What to do this week:</h4>
<p>This week focuses on leveraging customer advocacy to create a self-sustaining marketing engine. You'll encourage online reviews strategically, foster user-generated content, double-down on referrals and loyalty programs, showcase testimonials publicly, and thank your brand advocates. The goal is to create a virtuous cycle where great experiences lead to customer recommendations that bring in new customers.</p>

<h4>Pro Tip:</h4>
<p>Building social proof is like rolling a snowball. It might start slow (one review here, one tag there), but over time it can grow into a big ball of buzz. The hardest part is often getting those first few reviews or posts – after that, many customers will follow the crowd. To maintain momentum, make asking for reviews or shares a part of your routine (but always at appropriate moments; for example, don't ask a first-time customer for a review before you know if they loved you – ask after they express happiness). Also, consider diversifying where you get reviews: Google is a must for search visibility, but if you're a restaurant, focus on Yelp or Tripadvisor too; if a boutique, Facebook recommendations might matter; if a service business, maybe Nextdoor recommendations. You know where your audience looks. And remember: respond to reviews, both good and bad. Thank people for good reviews (it shows you're attentive), and address bad ones professionally (others will see that you care to make things right). As for user-generated content, one of the best things you can do is engage with it – comment on posts you're tagged in, share customer stories. This two-way interaction turns customers into loyal fans because they feel seen. By the end of Week 9, you should have strengthened the virtuous cycle: great experience → customer raves about it → their rave brings in new customers → repeat. Your marketing workload starts to lighten as customers carry it forward – congrats, that's a big deal!</p>

<h4>Milestone Win:</h4>
<p>Customers start doing your marketing for you. This is perhaps the most satisfying win: when you notice that new people are coming in saying, "My friend told me about this place" or "I saw your reviews and had to try it," you've achieved a self-sustaining buzz. You might also see your social media tagged with customer posts, or your follower count rising thanks to shout-outs. It means the fire you've stoked is burning on its own now. Of course, you'll keep fueling it, but you've created a community of fans who help spread the word. Give yourself a high-five – that's huge!</p>`,
            tasks: [
              {
                id: 'task-9-1',
                taskId: 'week-9',
                title: 'Encourage online reviews (gently and wisely)',
                shortDescription: 'Ask satisfied customers for reviews when their happiness is fresh, using QR codes or follow-up emails.',
                description: 'Take a look at your profiles on Google, Yelp, Facebook, or any platform relevant to your business. If you have only a few reviews or an okay rating, now\'s the time to pump that up. This week, make it a point to ask satisfied customers for a review. The key is to ask when their happiness is fresh – e.g., a customer just said "This was amazing," or a regular who you know loves you. You can say something like, "I\'m so glad you enjoyed! It would mean a lot to us if you could leave a quick review online when you have a moment. It really helps small businesses like ours. Here, you can just scan this QR code to go to our Google review page." Yep – consider printing a simple card or sign with a QR code or short URL to your Google/Yelp page to make it super easy. Keep the ask short and sincere. Not everyone will do it, but some will, especially if you\'ve built a connection. Another method: send a follow-up email (if you collect emails) thanking them for their visit and politely asking for a review with the link provided. Important: never pressure or incentivize (like "I\'ll give you a discount if you review") as that goes against most review site policies. Just genuinely ask and express why it matters to you. Even a handful of new 5-star reviews will boost your average and look impressive to someone Googling you.',
                estimatedTime: '45min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-9-2',
                taskId: 'week-9',
                title: 'Foster user-generated content (UGC)',
                shortDescription: 'Create Instagrammable moments and encourage customers to share photos with contests or hashtags.',
                description: 'This is about getting customers to post about you on their social media or share content that you can in turn share (with permission). How? You can encourage them subtly: create Instagrammable moments in your store - e.g., a cute mural or decorated corner where people will want to take a selfie. Then put a little sign "Tag us @YourBusiness on Instagram!" If you run the flash sale or event in Week 8, hopefully some people took pics - ask if you can repost their photos on your accounts. Maybe even start a hashtag like #[YourBusiness]Fans or #[YourBusiness][YourTown]. This week, you could run a small social media contest: for example, "Share a photo of your purchase or visit on Instagram/Facebook and tag us for a chance to win a $25 gift card!" Make it a short contest (just for this week). This gives an incentive for people to post about you. At the end of the week, randomly pick a winner (even if only 5 people participated, that\'s 5 people advertising you to all their friends, and you reward one - worth it). If a contest is too much, at least actively invite social sharing: "We love seeing your experiences - tag us if you snap a pic!" When people do tag you or mention you, respond with thanks and enthusiasm, maybe repost it in your Stories. This not only provides content for your social, it makes those customers feel appreciated and more likely to talk you up.',
                estimatedTime: '60min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-9-3',
                taskId: 'week-9',
                title: 'Double-down on referrals and loyalty',
                shortDescription: 'Reinforce referral programs and consider creating a simple loyalty system to encourage repeat business.',
                description: 'We introduced referrals in Week 3, but it\'s good to re-emphasize and perhaps formalize it now that you have more momentum. Consider creating a simple loyalty program if you don\'t have one: e.g., a punch card ("10th visit free" or similar), or a digital check-in via your point-of sale if available. This encourages repeat business (social proof\'s quieter cousin is a store that\'s frequently busy - loyalty helps with that). Also, see if any of the Week 3 referrals bore fruit. If so, you might publicly acknowledge it: "Shout out to our customer Maria, who referred 3 new customers to us this month - thank you! Enjoy your free [reward]." (With her permission or in a general way.) This signals to others that referrals are appreciated and happening. If you collected customer emails, you could send a friendly "Refer-a-Friend" reminder: "Bring a buddy, get 20% off for both - our referral offer continues!" Keep the train rolling.',
                estimatedTime: '45min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-9-4',
                taskId: 'week-9',
                title: 'Show off testimonials and positive feedback',
                shortDescription: 'Display customer reviews and testimonials publicly on your website, social media, or in-store.',
                description: 'Do you have some glowing reviews or comments from customers (maybe from those feedback cards in Week 7 or a nice email someone sent)? With their okay, showcase them. Add a quote or two to your website\'s front page or your social media: "Customer Jane: \'This is hands down the best coffee in town, and the friendliest staff!\' ". You can even create a simple "wall of love" in your store: print out or write snippets of great feedback and pin them on a bulletin board where customers can see. It might feel awkward to "toot your own horn," but displaying real customer happiness is not bragging - it\'s reassuring potential customers that others have had a great experience, which reduces their fear of trying a new place. It\'s also encouraging for you and your team to see!',
                estimatedTime: '30min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-9-5',
                taskId: 'week-9',
                title: 'Thank and reward your advocates',
                shortDescription: 'Recognize and reward customers who actively promote your business through reviews or social media.',
                description: 'When you notice a customer has gone out of their way to promote you - maybe they wrote a lengthy positive review or they keep tagging you on Instagram - find a way to thank them. This could be a personal thank-you note or email, a small discount on their next purchase ("I saw your kind review, next coffee\'s on us - thank you for supporting our small business!"), or even a spotlight if they\'re okay with it ("Meet our customer of the month!"). People love to be appreciated, and those who already love you will love you even more. They\'ll likely continue to spread positive vibes about you.',
                estimatedTime: '30min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              }
            ]
          };
        }
        
        if (week === 10) {
          module = {
            ...module,
            title: 'Influencer / Local Figure Collaboration',
            description: 'Tap into the reach of a local influencer or community figure to gain trust and exposure through strategic partnerships.',
            content: `<h2>Week 10: Influencer / Local Figure Collaboration</h2>
<p><strong>Theme:</strong> Tap into the reach of a local influencer or community figure to gain trust and exposure.</p>

<p>This week, you'll identify someone in your community who has an audience – it could be a social media influencer, a popular blogger, or even an offline personality like a local radio host or community leader – and collaborate with them to promote your business. The goal is to "borrow" their influence to reach new potential customers in a credible way.</p>

<p><strong>Why this matters:</strong> An influencer collaboration can dramatically boost your visibility. When an influencer or respected local figure talks about your business, it comes with an inherent trust and curiosity from their followers. It's like a word-of-mouth recommendation amplified to hundreds or thousands of people. People who follow that influencer likely live in the area and trust their opinions. For example, if there's a local Instagrammer known for highlighting cool spots in town, and they feature your shop, their followers might flock in to check you out. It's effectively targeted marketing because you're reaching local folks through someone they pay attention to. Also, influencers can create engaging content (like photos, videos, or stories) about your business that you can reuse. With over 80% of marketers saying influencer marketing is effective, it's proven – and at the local level, it's often easier and more affordable to do than big national influencer campaigns. Local influencers are often excited to work with hometown businesses, sometimes just for free goodies or the content opportunity.</p>

<h4>What to do this week:</h4>
<p>This week focuses on strategic influencer partnerships to amplify your local reach. You'll identify the right local figures, warm up and reach out authentically, plan collaborative campaigns, execute and support the partnership, and monitor the impact on your business. The goal is to leverage local influence to reach new customers through trusted recommendations.</p>

<h4>Pro Tip:</h4>
<p>Choose authenticity over follower count. A local mom with 1,000 true-fan followers in your town who trust her recommendations is far more valuable than a "macro" influencer with 20k followers mostly in other cities or countries who may not care about your local shop. So do a bit of homework: see who frequently engages (comments/likes) – that indicates an active community. Additionally, when collaborating, give the influencer creative freedom. They know their audience best, so avoid dictating exactly what they must say (and definitely no "scripted" reviews – it should feel real). You can highlight certain features you hope they'll mention, but let them put it in their own voice. Also, be prepared for an influx: an effective shout-out might bring a surge, so have inventory and staff ready if needed. If you get a big response, capture it – for example, if lots of new customers come in due to the collab, consider offering them an incentive to come back (like "Thanks for visiting! Here's 10% off your next visit, valid next month"). That way the one-time bump becomes repeat business. Finally, remember that influencers are people too – building a genuine relationship (not just a one-time transaction) can lead to ongoing support. Some might become loyal customers or even friends of your business. Support them back when you can (like donating something to a charity drive they do, etc.). It's all about community at the end of the day.</p>`,
            tasks: [
              {
                id: 'task-10-1',
                taskId: 'week-10',
                title: 'Identify the right person',
                shortDescription: 'Find local influencers or community figures who align with your business and have engaged local followers.',
                description: 'Look for someone who has a following in your city/town and aligns with your niche. They don\'t need millions of followers – even a few thousand highly engaged local followers is great (these are sometimes called "micro-influencers"). Examples: a local food blogger if you\'re a restaurant or bakery, a fashion Instagrammer if you have a boutique, a mommy blogger if you run a kids\' play cafe, or maybe the local news anchor who has a big Twitter presence. Also consider community leaders: maybe the head of a big community Facebook group, or the organizer of local events, or a well-known teacher/coach who is active online. These folks have clout. Make a short list (maybe 2-3 names). It can even be a loyal customer of yours who happens to have a following – if they love you already, that\'s a bonus.',
                estimatedTime: '45min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-10-2',
                taskId: 'week-10',
                title: 'Warm up and reach out',
                shortDescription: 'Engage with their content first, then send a personalized collaboration proposal.',
                description: 'If you\'re not already connected to them, start by engaging a bit with their content. Like their recent posts, leave a nice comment or two (meaningful ones, not spammy). This gets your name on their radar in a friendly way. Then, send them a polite, personalized message or email. Keep it short and genuine. For example: "Hi [Name]! I love your [blog/Instagram/posts] about [topic]. I\'m the owner of [Your Business] in town. We\'ve been doing a lot to grow and engage the community, and I think our shop might be something your followers would enjoy. I\'d love to invite you to come by and check us out – maybe try [product/service] on the house. If you\'re interested, perhaps we could even collaborate, like you doing a review or a giveaway for your followers. Totally up to you – I just thought it could be fun and mutually beneficial. Let me know what you think, and thanks for all you do for local [food/fashion/etc.]!" Adjust the tone to fit the person. The key points: compliment them sincerely, introduce your business briefly, and offer a collaboration idea (free product, event, or giveaway) that provides value to their audience. Influencers always think "what\'s interesting for my followers?" so frame it that way.',
                estimatedTime: '60min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-10-3',
                taskId: 'week-10',
                title: 'Plan the collaboration',
                shortDescription: 'Discuss collaboration types and compensation to create a mutually beneficial partnership.',
                description: 'If they say yes or seem interested, awesome! Discuss what type of collab makes sense. Common ones: Invite for a visit/review: They come in, you maybe give a free sample or tour, and they share their honest experience in a post or story. (Ensure you put your best foot forward when they visit – basically Week 7\'s work on experience will shine here.) Giveaway or contest: You provide a prize (like a gift card or product bundle), and they host a giveaway on their social (followers usually like "follow both accounts and tag a friend" to enter – which boosts your follower count as well). This can get you a lot of local followers quickly, and one of their followers gets a prize, win-win. Event collaboration: Perhaps they do a "meet-up" at your store (e.g., a local fitness influencer hosts a popup class or a demo using your space/products). Their fans get to meet them and see your business. Or a live social media session from your location (Instagram Live, etc., where they showcase your shop). Content piece: Maybe they feature you in a blog ("5 Hidden Gems in [Town]" including you) or a video. You might provide them some talking points, history, or behind-the-scenes access. Takeover or shout-out: They could do a day where they "take over" your Instagram stories (or you takeover theirs) showing off products. But that\'s more advanced; simpler is usually better. Discuss and align on what both of you are comfortable with. Also, be clear on any compensation – many local influencers will do it just for free products or just to support local, but some might have a fee. Decide what you\'re okay with. For a first collab, ideally keep costs low – offer product/trade. For example, "I\'ll gift you a $50 store credit to enjoy, and maybe another $50 gift card to give away to your followers." That $100 worth could reach hundreds of locals via their platform.',
                estimatedTime: '60min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-10-4',
                taskId: 'week-10',
                title: 'Execute and support',
                shortDescription: 'Make the collaboration smooth by treating them like VIPs and amplifying each other\'s content.',
                description: 'When the collaboration happens, do your part to make it smooth. If they\'re visiting, treat them like a VIP (though honestly, that should be how you treat all customers – and you do now! – but maybe give a little goodie bag or spend extra time talking about what makes your business unique). Provide any info they might need for their content (facts about your business, your social handles to tag, etc.). If it\'s a giveaway, you both should promote it – share their post to your followers too. Basically, amplify each other. After they post, be sure to engage: reply to comments that people leave on their post about you (if appropriate), welcome new followers that come your way (maybe a quick "Hi new friends from [Influencer]\'s page, thanks for following!" on your social). If the collab is an event or meet-up, promote it to your customers as well ("Join us and [Influencer] this Saturday for..."). And of course, after it\'s done, say thank you. A handwritten note or a small gift to the influencer showing appreciation can go a long way to forging a lasting relationship.',
                estimatedTime: '90min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-10-5',
                taskId: 'week-10',
                title: 'Monitor impact',
                shortDescription: 'Track results and maintain relationships for ongoing collaboration opportunities.',
                description: 'Over the week, watch for the results. Are you getting more social media followers? Any uptick in foot traffic or people mentioning the influencer? Track whatever makes sense (redemption of giveaway prize, etc.). Sometimes the impact is immediate (a bunch of new faces that week), sometimes it\'s more of a slow burn (people save the post and visit later). Even if it\'s not huge, you\'ve now created a connection that can continue to benefit you. Keep that influencer in your network – maybe they can become a long-term ambassador.',
                estimatedTime: '30min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              }
            ]
          };
        }
        
        if (week === 11) {
          module = {
            ...module,
            title: 'Gather Feedback + Testimonials',
            description: 'Reflect, learn, and capture your success stories. Collect customer feedback and testimonials to improve your business and build trust.',
            content: `<h2>Week 11: Gather Feedback + Testimonials</h2>
<p><strong>Theme:</strong> Reflect, learn, and capture your success stories.</p>

<p>This week, you'll actively seek feedback from your customers about their experience over the past weeks, and collect testimonials (positive statements) that you can use in marketing. Think of it as both a quality improvement exercise and a victory lap: you want to know what's working and what could be better (so you can continue to improve), and you also want to document the great things people are saying about you (to encourage even more customers).</p>

<p><strong>Why this matters:</strong> Two reasons: improvement and proof. First, you've implemented a lot of new strategies in the last couple of months. Getting feedback helps you understand the impact: Did customers notice the new signage? How did they hear about you (was it Google, the event, their friend)? Do they have suggestions for further improvement? You might uncover small issues to fix or great ideas for the future. Businesses that listen to their customers tend to thrive – it makes customers feel valued and often reveals opportunities. Second, testimonials (basically happy-customer quotes) are marketing gold. They provide credible evidence to future customers that you deliver on your promises. A glowing testimonial on your website or social media can be the deciding factor for someone on the fence. By explicitly asking for and curating testimonials, you'll have ready-to-go content that builds trust (plus it boosts your morale to hear nice things!). This step also sets a tone that you care about customer satisfaction beyond just the sale.</p>

<h4>What to do this week:</h4>
<p>This week focuses on gathering customer insights and success stories to improve your business and strengthen your marketing. You'll create feedback systems, conduct customer interviews for testimonials, extract review site gems, compile and display positive feedback, and act on constructive suggestions. The goal is to create a feedback loop that drives continuous improvement while building trust through customer proof.</p>

<h4>Pro Tip:</h4>
<p>Consider making "feedback loops" a regular part of your business. For example, some shops have a tablet at checkout with a quick "How was your visit? 😐 ☹" that logs feedback, or send a follow-up text asking for a 1-10 rating. You don't want to nag customers, but periodic check-ins are healthy. Also, when you do implement a customer's suggestion, highlight it: "New cushioned chairs in the fitting room, thanks to feedback from customers like you!" – maybe a little sign or a social post thanking the customer who suggested it (with their permission). That will really make people feel a part of your business's story. Regarding testimonials, make sure to keep them up-to-date over time – fresh ones show you're consistently great. And always be truthful: never fabricate a testimonial. Luckily, by now you likely don't need to – you have plenty of real praise to pull from! By Week 11's end, you not only have great material to bolster your marketing, but you also have a clear idea of how customers perceive all the changes. It's like a report card for your 12-week efforts, direct from the source. Use it to finish strong and carry forward improvements beyond this program.</p>`,
            tasks: [
              {
                id: 'task-11-1',
                taskId: 'week-11',
                title: 'Ask for feedback (directly)',
                shortDescription: 'Create simple surveys or questions to gather customer insights about their experience.',
                description: 'Prepare a short survey or a few key questions you can ask customers. Keep it super simple - you can do this in-person or via email/online. Example questions: "How was your experience with us? (What did you enjoy, and what could we improve?)", "What prompted you to visit us the first time?" (this could be multiple choice: saw signage, social media, friend referral, etc.), "On a scale of 1-10, how likely are you to recommend us to a friend?" (this is essentially the classic Net Promoter Score question). If you prefer digital, use free tools like Google Forms or SurveyMonkey to create 3-5 questions and share the link. You can email it to customers (if you have an email list) with a note like "We value your opinion! Please let us know how we\'re doing - this 1-minute survey helps us a lot." If you don\'t have emails, do it old-school: print a few questions on a card and have a drop-box in-store, or just verbally chat with customers. This week, try to get at least 10 customers to give some feedback. Incentivize it if needed: "Fill out our short feedback form and get $5 off your next purchase" can boost participation (but if offering that, make sure to follow through!). The goal is to hear from a variety of folks.',
                estimatedTime: '60min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-11-2',
                taskId: 'week-11',
                title: 'Conduct a few brief interviews (for testimonials)',
                shortDescription: 'Personally reach out to happy customers to collect detailed testimonials for marketing use.',
                description: 'Identify a handful of customers who you know are really happy - maybe those regulars who have been praising you, or someone who just had a visibly great experience at last week\'s event. Reach out to them personally (in person or via message) and say something like, "We\'re gathering testimonials from our customers, and I immediately thought of you because you\'ve been such a wonderful patron. Would you mind sharing a sentence or two about your experience with [Your Business]? It could be how we\'ve helped you, or what you enjoy most. We\'d love to feature your comment on our website/social media. It would mean a lot!" Many will be flattered and willing. If they say yes, you can either have a quick chat and write down what they say (then get their approval on the wording), or have them write an email reply. Guide them if needed: "For example, you might start with \'I love [Your Business] because…\'" but encourage them to use their own words. Collect a few of these. Aim for variety: different points highlighting your strengths (e.g., one about customer service, one about quality, one about atmosphere, etc.). Also get their permission to use their name and maybe a photo. First name and last initial is usually fine if they\'re shy. If someone\'s particularly enthusiastic, you could even do a short video testimonial (maybe them speaking for 20 seconds about you). Video is super engaging - but that\'s bonus, not required.',
                estimatedTime: '90min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-11-3',
                taskId: 'week-11',
                title: 'Check review sites and extract nuggets',
                shortDescription: 'Mine existing reviews for positive quotes and feedback that can be used in marketing.',
                description: 'Since you\'ve been pushing reviews in Week 9, take a look at new reviews on Google, Yelp, etc. There might be some great lines in there. It\'s generally okay to quote small excerpts from public reviews in your marketing (like "5 stars on Yelp: \'Best in town, hands down!\' - Alice Q."). Just be sure not to alter the meaning. Pull a few positive snippets that really make you smile. You can later compile these as a collage of "What people are saying." This can complement the testimonials you got directly.',
                estimatedTime: '30min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-11-4',
                taskId: 'week-11',
                title: 'Compile and display testimonials',
                shortDescription: 'Create marketing materials showcasing customer feedback on your website, social media, and in-store.',
                description: 'Now that you have this positive feedback, put it to use! Add a Testimonials section on your website or Facebook page. It can be as simple as text quotes, or if you got photos, include a photo of the customer (people love seeing real faces). For example: "⭐⭐⭐⭐⭐ \'Absolutely wonderful experience - the staff went above and beyond to make sure I found exactly what I needed. I\'m a customer for life!\' - Sarah G." You can list a few like that. Also consider making a few social media posts over the coming weeks that highlight one testimonial at a time (maybe with a graphic or just text in a nice format). Sprinkle them in so it\'s not bragging all at once, but it\'s powerful content indeed. In-store, you could print and frame a couple of the best quotes and hang them, or put a poster "Our customers say the nicest things!" with quotes. It shows new visitors that others love you - reassuring them they\'re in the right place.',
                estimatedTime: '60min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-11-5',
                taskId: 'week-11',
                title: 'Act on constructive feedback',
                shortDescription: 'Implement customer suggestions and create action plans for continuous improvement.',
                description: 'Inevitably, you might receive some suggestions or even critiques in the feedback. Don\'t be discouraged - this is good. Take it as free consulting. Maybe someone says "Wish you had more vegan options" or "Music was a bit loud" or "It\'d be great if you opened an hour earlier on weekends." You may not implement everything, but consider which ones are feasible and aligned with your goals. If a particular issue comes up multiple times, definitely address it. Make a short action plan: e.g., "Customers find the store a bit warm - let\'s get a fan" or "A lot of people are asking for XYZ product - let\'s stock a small selection of it as a trial." This shows you listen and evolve. Even if you don\'t change something, you could respond (especially in digital survey, if not anonymous) personally: "Thanks for the suggestion about hours - we\'ll keep that in mind for the future!" People appreciate that their voice was heard. It builds loyalty even if you can\'t do exactly what they asked.',
                estimatedTime: '45min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              }
            ]
          };
        }
        
        if (week === 12) {
          module = {
            ...module,
            title: 'Celebrate + Plan Next Goal',
            description: 'Reflect on your achievements, celebrate success with customers and team, and plan your next growth cycle.',
            content: `<h2>Week 12: Celebrate + Plan Next Goal</h2>
<p><strong>Theme:</strong> Reflect on how far you've come, celebrate your successes, and set the stage for your next growth cycle.</p>

<p>You made it to week 12 – congratulations! This week is about two things: celebration (you and your team deserve it, and even your customers deserve to share in the success) and evaluation/planning (cementing the lessons learned, measuring the before-and-after, and deciding where to focus next). Essentially, we'll wrap up this 12-week track with a satisfying bow and ensure you're ready to keep the momentum going.</p>

<p><strong>Why this matters:</strong> In the hustle of running a business, we often move from one thing to the next without pause. But taking time to celebrate wins is important – it boosts morale, reinforces what worked, and builds loyalty (customers feel appreciated when you celebrate with them, and employees feel valued when you acknowledge achievements). Plus, a little celebration is just fun and motivating! Equally important is to measure your results. Remember those metrics from Week 1? Now we check them. This not only proves to yourself that your efforts paid off (which can be very encouraging), but it also gives you a clearer picture of your business growth. You can create a "before and after" story – great for personal satisfaction and even marketing ("We doubled our foot traffic in 3 months!" is a nice PR snippet if true). Finally, planning the next goal keeps you from stagnating. Marketing is an ongoing journey. You'll use what you learned to tackle a new objective (maybe something like improving sales per customer, launching an online store, etc.). Think of this week as a pit stop: you're refueling, checking the map, and hyping up the crew (that's you and anyone involved) for the next race.</p>

<h4>What to do this week:</h4>
<p>This week focuses on celebrating your achievements, measuring your results, and planning your next growth cycle. You'll review your metrics to see the impact of your 12-week journey, share success with your team and supporters, celebrate with customers, reflect on what worked and what didn't, set your next goal, and organize your marketing assets for future use. The goal is to end this track with a clear understanding of your growth and a roadmap for continued success.</p>

<h4>Pro Tip:</h4>
<p>Storytelling time – your journey through this 12-week program is itself a great story. Don't hesitate to share parts of it in your marketing. People root for small businesses and love to see authenticity. A before-and-after photo of your store (busy vs empty) with a caption about how you did it, or a quick recap of "We set out to increase foot traffic and here's what happened…" could even get local media attention if pitched (free press!). Consider doing a little press release or blog post about your successful initiative to boost local foot traffic – local newspapers or bloggers might pick it up as a feel-good story or a case study. It positions you as an active, innovative business owner. Also, as you plan ahead, keep engaging with the supportive network you built: those neighbor businesses, that influencer, the loyal customers – they will continue to be your allies. Maybe even ask a few of them, "Hey, I'm thinking of focusing on X next, any ideas or would you be interested in collaborating on that?" Keep the collaborative spirit alive. Lastly, truly celebrate your hard work. Maybe throw a small team party or dinner with family/friends who supported you. Burnout is real, but celebration recharges you. You've not only increased local foot traffic – you've grown as a marketer and community builder. That's a huge accomplishment. Congratulations!</p>

<h4>Milestone Win:</h4>
<p>Clear before/after growth story + foundation for the next cycle. At the end of Week 12, you can proudly say, "Look where we were, and look where we are now." You have tangible results to show for your efforts – a story of growth that you can share with stakeholders (be it your team, investors, or just your own conscience). More importantly, you've built a foundation of knowledge, skills, and community goodwill for whatever goal you pursue next. You're not starting from scratch anymore; you have momentum. Give yourself and everyone involved a big round of applause – and maybe slice of cake – and onward to the next adventure!</p>`,
            tasks: [
              {
                id: 'task-12-1',
                taskId: 'week-12',
                title: 'Review your metrics',
                shortDescription: 'Compare your baseline numbers from Week 1 to current results to measure your growth.',
                description: 'Pull out those baseline numbers you recorded in the beginning. Compare them to now. For example: Foot traffic: How many walk-ins per day or week were you getting in Week 1 vs Week 12? You might use your own counts, or proxies like sales receipts or visitor log if you have one. Did the average increase? By roughly what percentage or absolute number? Sales: If boosting foot traffic also increased sales (usually does), note the change. Perhaps weekly revenue went from $X to $Y, etc. Online metrics: Check your Google Business insights (they show how many searches led to your listing, etc.) - likely up. Social media followers or engagement - likely up too if you did those tasks. Customer base: How many new customers did you gain? (You might estimate from new faces, new sign-ups for emails, etc.) Other measures: Number of reviews (before vs after), average rating, etc. Summarize this into a little "before vs after" report for yourself. Write it down. For example: "In 3 months, daily foot traffic increased from ~20 people to ~30 people on average, a 50% jump. We added 40 new customers to our loyalty program. Instagram followers grew from 500 to 800. We collected 15 new 5-star reviews, raising our Google rating from 4.2 to 4.5. Revenue this quarter is up 20% over last quarter." If some numbers are not as high as you hoped, that\'s okay - focus on the positive trends. And if some are higher than expected, do a little happy dance! Documenting this is not bragging; it\'s evidence of your hard work paying off and gives you insight into what strategies had impact.',
                estimatedTime: '60min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-12-2',
                taskId: 'week-12',
                title: 'Share the success with your team (if any) and supporters',
                shortDescription: 'Celebrate achievements with your team and share your success story publicly.',
                description: 'If you have employees or anyone who helped, gather them and go through the highlights. Say "Look what we accomplished together!" It\'s motivating and helps them buy into future initiatives. If it\'s just you, still, take a moment to self-congratulate. Maybe treat yourself to something nice - you\'ve been grinding for 12 weeks, after all. You could even share a bit of your success story with the world: e.g., a candid social media post or blog: "When we started this 12-week challenge, we were getting only a few people a day. Now our store is buzzing, and it\'s all thanks to our amazing customers and community. We\'re so grateful!" People love authentic stories, and it subtly markets your growth ("hey, that place is popular now"). It also publicly thanks your customers for helping you get there.',
                estimatedTime: '45min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-12-3',
                taskId: 'week-12',
                title: 'Celebrate with customers',
                shortDescription: 'Show appreciation to customers through special events, offers, or thank-you messages.',
                description: 'Show appreciation to the people who made this possible - your customers. You can do something small but heartfelt: maybe an in-store "Customer Appreciation Day" (even if it\'s just for a couple hours one day this week) where you put out some cookies or run a tiny "thank you" sale (like double loyalty points day or a free gift with purchase). Or simply a sign that says "We hit our goal of increasing foot traffic! Thank you, everyone - we couldn\'t do it without you." Possibly accompanied by some balloons or festive decor for a day. If you have a mailing list or social followers, a thank-you message there too: "We want to share some good news: we\'ve grown so much these past weeks, and it\'s because of you! To celebrate, please enjoy [small offer] as our thanks." Even if you don\'t give anything tangible, customers will feel good knowing they were part of your success. It strengthens their loyalty because they see you value them.',
                estimatedTime: '60min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-12-4',
                taskId: 'week-12',
                title: 'Reflect on what worked (and what didn\'t)',
                shortDescription: 'Analyze your strategies to identify the most effective tactics for future planning.',
                description: 'Take a bit of time to analyze the strategies. Which weeks\' actions seemed most effective for your business? Maybe you noticed the Google optimization and reviews (Week 2 & 9) brought in a ton of new folks. Or the events (Week 8) created a big surge. Perhaps the signage (Week 4) is consistently drawing attention. Also note things that didn\'t seem as impactful, or were too cumbersome. This reflection is crucial to planning your next steps - you want to continue the winners and rethink the less effective parts. Write down a "Lessons Learned" list for yourself. For example: "Bringing a friend offer was modestly successful, but maybe needs a bigger incentive next time. Hyper-local social posting really raised awareness, we should keep doing it monthly," etc. This essentially becomes your personalized marketing playbook.',
                estimatedTime: '45min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'task-12-5',
                taskId: 'week-12',
                title: 'Set the next goal and make a light plan',
                shortDescription: 'Choose your next focus area and sketch out a plan for continued growth.',
                description: 'Now, choose a focus for the next 12 weeks. It could be: Maintaining and building loyalty (e.g., if foot traffic is good now, maybe aim to increase repeat visit rate or average purchase value). Expanding to new markets (maybe you want to attract tourists, or launch an online shop to complement foot traffic). Improving conversion (turning more foot traffic into actual sales, if you noticed a lot of browsers but not buyers). Or something like "Grow social media presence to drive even more traffic," etc. Pick something that aligns with your business growth stage. It might even be "Increase foot traffic further by X%" if you feel you can push more - though often the next track could shift to converting traffic to revenue or improving margins, etc. Once you have a goal, jot down a few ideas or steps (maybe some things from this track will carry over, plus new tactics). Essentially, you\'re sketching out a new marketing track for yourself. You\'ve done it once, you can do it again! If you\'re not sure what goal to pick, think about your business pain points or ask customers/staff for input. Also, reviewing that feedback from Week 11 might highlight something ("lots of people ask for online ordering - maybe focus on that next").',
                estimatedTime: '60min',
                isCompleted: false,
                dueDate: new Date(Date.now() + 1 * 7 * 24 * 60 * 60 * 1000)
              }
            ]
          };
        }
        
        return module;
      })
    };

    importedMarketingGoals.push(increaseLocalFootTraffic);
    console.log(`✅ Seeded marketing data: ${increaseLocalFootTraffic.title} with ${increaseLocalFootTraffic.modules.length} weeks`);
    console.log(`🔓 Initial unlock status:`, increaseLocalFootTraffic.modules.map(m => `Week ${m.weekNumber}: unlocked=${m.isUnlocked}`));
  }
}

app.post('/api/marketing/import-notion', async (req, res) => {
  try {
    const apiKey = process.env.NOTION_API_KEY || process.env.NOTION_TOKEN;
    if (!apiKey) {
      return res.status(500).json({ success: false, error: 'Missing NOTION_API_KEY in backend environment' });
    }
    const { databaseId, query } = req.body || {};

    let dbId = databaseId;
    if (!dbId && query) {
      const results = await notionSearchDatabase({ apiKey, query });
      const match = results.find(r => (r.title && Array.isArray(r.title) && r.title.map(t => t.plain_text || '').join('').toLowerCase().includes(query.toLowerCase())) || (r.object === 'database' && r.id));
      if (match) dbId = match.id;
    }

    if (!dbId) {
      return res.status(400).json({ success: false, error: 'Provide Notion databaseId or a query to find it (e.g., "quarterly marketing goals")' });
    }

    const pages = await notionQueryDatabase({ apiKey, databaseId: dbId });
    const mapped = pages.map(toMarketingGoalFromNotion);

    // Filter by desired titles if they exist; else include all
    const filtered = mapped.filter(g => DESIRED_TRACK_TITLES.has(g.title));
    const finalGoals = filtered.length ? filtered : mapped;

    // Merge into memory (replace by title uniqueness)
    const existingByTitle = new Map(importedMarketingGoals.map(g => [g.title, g]));
    for (const g of finalGoals) {
      existingByTitle.set(g.title, g);
    }
    importedMarketingGoals = Array.from(existingByTitle.values());

    return res.json({ success: true, data: importedMarketingGoals, message: `Imported ${finalGoals.length} tracks from Notion` });
  } catch (error) {
    console.error('Notion import error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Import failed' });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Simple AI Server running on port ${PORT}`);
  console.log(`📊 Environment: development`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Network accessible: http://10.0.0.53:${PORT}/health`);
  console.log(`🤖 AI Chat: http://localhost:${PORT}/api/ai/chat`);
  
  // Seed marketing data on startup
  seedMarketingData();
});
