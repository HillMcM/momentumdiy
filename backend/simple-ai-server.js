const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3001;

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
      const isHttp = url.protocol === 'http:' || url.protocol === 'https:';
      if (isLocalHost && isHttp) {
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
  const allowed = ['title', 'description', 'industry', 'duration', 'isActive', 'currentWeek', 'progress', 'modules'];
  const updates = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body || {}, key)) updates[key] = req.body[key];
  }
  // If currentWeek changes, unlock/completion flags can be adjusted simply
  let updated = { ...importedMarketingGoals[idx], ...updates };
  if (typeof updates.currentWeek === 'number' && Array.isArray(updated.modules)) {
    const next = updates.currentWeek;
    updated.modules = updated.modules.map((m) => ({
      ...m,
      isUnlocked: m.weekNumber <= next,
      isCompleted: m.weekNumber < next,
    }));
  }
  importedMarketingGoals[idx] = updated;
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
app.listen(PORT, () => {
  console.log(`🚀 Simple AI Server running on port ${PORT}`);
  console.log(`📊 Environment: development`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 AI Chat: http://localhost:${PORT}/api/ai/chat`);
});
