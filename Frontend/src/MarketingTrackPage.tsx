import { useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { MarketingGoal, MarketingModule, Task, Project, TaskStatus } from './types';
// TaskModal not used in this iteration
// Removed mockData usage to avoid placeholder content
import { apiService } from './services/api';
import { supabase } from './lib/supabase';

interface MarketingTrackPageProps {
  marketingGoals: MarketingGoal[];
  onMarketingGoalsChange: (goals: MarketingGoal[]) => void;
  onTasksChange: (tasks: Task[]) => void;
  tasks: Task[];
  projects: Project[];
  onProjectsChange: (projects: Project[]) => void;
}

export default function MarketingTrackPage({ marketingGoals, onMarketingGoalsChange, onTasksChange, tasks, projects, onProjectsChange }: MarketingTrackPageProps) {
  const [selectedGoal, setSelectedGoal] = useState<MarketingGoal | null>(null);
  const [selectedModule, setSelectedModule] = useState<MarketingModule | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCurrentWeekExpanded, setIsCurrentWeekExpanded] = useState(true);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());
  const [profile, setProfile] = useState<{ businessName?: string; fullName?: string; avatarUrl?: string } | null>(null);
  // Legacy modal state removed

  // Interactive task modal state
  const [interactiveOpen, setInteractiveOpen] = useState<boolean>(false);
  const [interactiveTask, setInteractiveTask] = useState<{ id: string; title: string; description: string } | null>(null);
  const [interactiveMeta, setInteractiveMeta] = useState<{ goalId: string; moduleId: string } | null>(null);

  // Inline form state (used inside interactive modal)
  type BaselineMetrics = { followers: string; avgLikes: string; avgComments: string; avgStoryViews: string; };
  const PLATFORM_KEYS = [
    { key: 'instagram', label: 'Instagram' },
    { key: 'facebook', label: 'Facebook' },
    { key: 'x', label: 'X (Twitter)' },
    { key: 'linkedin', label: 'LinkedIn' },
    { key: 'google_business_profile', label: 'Google Business Profile' },
    { key: 'tiktok', label: 'TikTok' },
  ] as const;
  type PlatformKey = typeof PLATFORM_KEYS[number]['key'];
  const emptyBaseline: Record<PlatformKey, BaselineMetrics> = Object.fromEntries(
    PLATFORM_KEYS.map(p => [p.key, { followers: '', avgLikes: '', avgComments: '', avgStoryViews: '' }])
  ) as Record<PlatformKey, BaselineMetrics>;
  type BaselineState = Record<PlatformKey, BaselineMetrics> & { saved?: boolean };
  const [baseline, setBaseline] = useState<BaselineState>(() => ({ ...(emptyBaseline as Record<PlatformKey, BaselineMetrics>) } as BaselineState));
  const [selectedPlatformTab, setSelectedPlatformTab] = useState<PlatformKey>('instagram');
  const [, setPillars] = useState<string[]>(['', '', '', '']);
  const [loadingInline] = useState<boolean>(false);
  const [inlineError] = useState<string | null>(null);

  // Save helpers
  const saveBaseline = async () => {
    const platforms: Record<PlatformKey, { followers: number; avgLikes: number; avgComments: number; avgStoryViews: number }> = {} as any;
    for (const { key } of PLATFORM_KEYS) {
      const v = baseline[key] || { followers: '', avgLikes: '', avgComments: '', avgStoryViews: '' };
      platforms[key] = {
        followers: Number(v.followers || 0),
        avgLikes: Number(v.avgLikes || 0),
        avgComments: Number(v.avgComments || 0),
        avgStoryViews: Number(v.avgStoryViews || 0),
      };
    }
    const resp = await apiService.saveBaselineMetrics({ platforms });
    if (resp.success) setBaseline(prev => ({ ...(prev as BaselineState), saved: true }));
  };

  // Removed pillars saver in favor of selecting pillars in the main section

  // Ref to track processed goals to prevent infinite loops
  const processedGoalsRef = useRef<Set<string>>(new Set());
  const filledModulesRef = useRef<boolean>(false);
  const createdModuleTasksRef = useRef<Set<string>>(new Set());

  const activeGoal = marketingGoals.find(goal => goal.isActive);
  const inactiveGoals = marketingGoals.filter(goal => !goal.isActive);

  // Determine if tracks should be disabled
  const shouldDisableTracks = activeGoal && activeGoal.currentWeek < activeGoal.duration;
  const isTrackCompleted = activeGoal && activeGoal.currentWeek >= activeGoal.duration;

  // Prefetch saved baseline and pillars
  useEffect(() => {
    (async () => {
      try {
        const [bm, cp] = await Promise.all([
          apiService.getBaselineMetrics(),
          apiService.getContentPillars(),
        ]);
        if (bm.success && bm.data) {
          const data = bm.data;
          if (data.platforms && typeof data.platforms === 'object') {
            const next: Record<PlatformKey, BaselineMetrics> = { ...(emptyBaseline as Record<PlatformKey, BaselineMetrics>) };
            for (const { key } of PLATFORM_KEYS) {
              const v = (data.platforms || {})[key] || {};
              next[key] = {
                followers: String(v.followers ?? ''),
                avgLikes: String(v.avgLikes ?? ''),
                avgComments: String(v.avgComments ?? ''),
                avgStoryViews: String(v.avgStoryViews ?? ''),
              };
            }
            setBaseline({ ...(next as Record<PlatformKey, BaselineMetrics>), saved: true });
          } else {
            // Back-compat single platform
            const next: Record<PlatformKey, BaselineMetrics> = { ...(emptyBaseline as Record<PlatformKey, BaselineMetrics>) };
            next.instagram = {
              followers: String(data.followers ?? ''),
              avgLikes: String(data.avgLikes ?? ''),
              avgComments: String(data.avgComments ?? ''),
              avgStoryViews: String(data.avgStoryViews ?? ''),
            };
            setBaseline({ ...(next as Record<PlatformKey, BaselineMetrics>), saved: true });
          }
        }
        if (cp.success && Array.isArray(cp.data)) {
          const vals = cp.data.concat(['', '', '', '']).slice(0, 4);
          setPillars(vals);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  // Shared input styling for modal forms
  const inputBaseStyle: React.CSSProperties = {
    width: '100%',
    marginTop: 6,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#FFF1E7',
    padding: '0.6rem 0.75rem',
    borderRadius: 8,
    height: '2.5rem',
    boxSizing: 'border-box',
    display: 'block'
  };

  // Kanban status accent colors (match Task Tracker)
  const statusAccentColors: Record<'todo' | 'in-progress' | 'completed', string> = {
    'todo': '#686DCA',
    'in-progress': '#CD845E',
    'completed': '#5ECD7D',
  };

  const actionButtonStyle = (bg: string): React.CSSProperties => ({
    padding: '0.5rem 0.9rem',
    background: bg,
    color: bg === '#5ECD7D' ? '#22202F' : '#FFF1E7',
    border: 'none',
    borderRadius: 8,
    fontWeight: 600,
    cursor: 'pointer'
  });

  // One-time fill for empty module content/tasks so lists always render
  useEffect(() => {
    if (filledModulesRef.current) return;
    if (!marketingGoals || marketingGoals.length === 0) return;
    const updated = marketingGoals.map(goal => {
      const mods = goal.modules.map(m => withFallback(goal, m));
      return { ...goal, modules: mods };
    });
    onMarketingGoalsChange(updated);
    filledModulesRef.current = true;
  }, [marketingGoals]);

  // Load profile for personalization
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        if (!userId) return;
        const { data } = await supabase
          .from('profiles')
          .select('business_name, full_name, avatar_url')
          .eq('id', userId)
          .maybeSingle();
        if (!mounted) return;
        setProfile({ businessName: data?.business_name || undefined, fullName: data?.full_name || undefined, avatarUrl: data?.avatar_url || undefined });
      } catch {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Ensure weekStartDates exists for active goals so "Next week in..." pill shows
  useEffect(() => {
    if (!activeGoal || !activeGoal.isActive) return;
    if (activeGoal.weekStartDates && activeGoal.weekStartDates[0]) return;
    const updated = marketingGoals.map(g => g.id === activeGoal.id ? { ...g, weekStartDates: [new Date()] } : g);
    onMarketingGoalsChange(updated);
  }, [activeGoal?.id]);

  // Rich content renderer for week content
  const renderRichContent = (text: string): ReactNode => {
    if (!text) return null;
    const displayName = profile?.fullName?.split(' ')[0] || profile?.businessName || 'there';
    const replaced = text.replace(/\[Client First Name\]/g, displayName);
    const lines = replaced.split('\n');
    const nodes: ReactNode[] = [];
    let currentList: string[] = [];

    const flushList = () => {
      if (currentList.length > 0) {
        nodes.push(
          <ul style={{ margin: '0.5rem 0 0.5rem 1.25rem' }}>
            {currentList.map((li, i) => <li key={`li-${i}`} style={{ marginBottom: '0.25rem' }}>{li}</li>)}
          </ul>
        );
        currentList = [];
      }
    };

    lines.forEach((raw, idx) => {
      const line = raw.trim();
      if (line.length === 0) {
        flushList();
        nodes.push(<div key={`p-${idx}`} style={{ height: 6 }} />);
        return;
      }
      if (line.startsWith('## ')) {
        flushList();
        nodes.push(<h4 key={`h2-${idx}`} style={{ margin: '0.5rem 0', color: '#FFF1E7' }}>{line.slice(3)}</h4>);
        return;
      }
      if (line.startsWith('### ')) {
        flushList();
        nodes.push(<h5 key={`h3-${idx}`} style={{ margin: '0.5rem 0', color: '#FFF1E7', opacity: 0.9 }}>{line.slice(4)}</h5>);
        return;
      }
      if (line.startsWith('•') || line.startsWith('- ') || line.startsWith('– ') || line.startsWith('* ')) {
        currentList.push(line.replace(/^[-•–*]\s?/, ''));
        return;
      }
      // Default paragraph
      flushList();
      nodes.push(<p key={`ptext-${idx}`} style={{ margin: '0.25rem 0', color: '#FFF1E7', opacity: 0.9 }}>{line}</p>);
    });
    flushList();
    return nodes;
  };

  // Fallback/customizer: tailor weeks of Improve Social Media Strategy & Engagement
  const withFallback = (goal: MarketingGoal, module: MarketingModule): MarketingModule => {
    const title = goal.title.toLowerCase();
    if (title.includes('improve social media')) {
      if (module.weekNumber === 1) {
      const conciseContent = [
        'This week: audit your profile, capture baseline numbers, and plan 3 posts you can actually ship.',
        '',
        'Profile checks:',
        '- Bio clearly says what you do',
        '- Profile photo is current',
        '- Link points to something useful (site/menu/booking)',
        '- Pin/highlight reflects your top offer',
        '',
        'Baseline: followers, avg likes, avg comments, story views (choose platform tabs).',
        '',
        'Posting rhythm: Beginner 3x (Mon/Wed/Fri) or Confident 5x (Mon–Fri).',
        '',
        'Example prompts to help draft your captions:',
        '- Monday (Behind the Scenes): Here’s what we’re working on this week… (show workspace/product prep/plan)',
        '- Tuesday (Tip or FAQ): Answer a common customer question or give a useful tip related to your work',
        '- Wednesday (Personal Story): Share why you started your business, or something you’re proud of',
        '- Thursday (Product/Service Feature): Highlight 1 offer you love—show it, describe it, and invite people in',
        '- Friday (Fun or Community): Shout out a local business, share a favorite spot, or post something light‑hearted'
      ].join('\n');
      const reducedTasks = [
        { id: `${module.id}-w1-baseline`, title: 'Save baseline metrics', description: 'Enter metrics for your main platform and save.', estimatedTime: '5m', isCompleted: false },
        { id: `${module.id}-w1-bio`, title: 'Fix bio + link (if needed)', description: 'Make your profile clear and actionable.', estimatedTime: '10m', isCompleted: false },
        { id: `${module.id}-w1-plan`, title: 'Plan this week’s 3 posts', description: 'Educate, Connect, Promote. Short and simple.', estimatedTime: '10m', isCompleted: false },
      ] as any;
      return { ...module, title: 'Social Audit & Baseline Tracking', description: 'Audit, baseline, and a simple 3‑post plan to start consistent.', content: conciseContent, tasks: reducedTasks };
      }
      if (module.weekNumber === 2) {
        const curatedContent = [
          'This week: Define your 3–4 Content Pillars and post with more intention using a refined 5‑day plan.',
          '',
          '## Why pillars?',
          'Pillars are the themes that represent your brand and audience needs. They make planning easier and more consistent.',
          '',
          '## Choose your pillars (3–4)',
          '- Your Products/Services',
          '- Behind‑the‑Scenes / Business Life',
          '- Customer Stories / Testimonials',
          '- Tips & Education',
          '- Promotions / Sales / Events',
          '- Personal Story / Values / Why You Started',
          '- Local Love / Community / Shoutouts',
          '- Visual Inspiration (Moodboards, Process, Design)',
          '',
          '## Refined 5‑Day Content Plan',
          '- Monday — Meet the Maker (Personal Story / BTS): Show yourself or your team and what this week looks like',
          '- Tuesday — Teach or Tip (Education / Products): Share a how‑to, misconception to fix, or product usage tip',
          '- Wednesday — Testimonial or Win (Customer Love): Share a client quote/review or a quick story',
          '- Thursday — Offer or Product Feature (Promotion / Service): Highlight one product/service and why it matters',
          '- Friday — Community Boost (Local / Fun): Shout out a local business or something light to close the week',
        ].join('\n');
        const curatedTasks = [
          { id: `${module.id}-w2-pillars`, title: 'Choose your 3–4 content pillars', description: 'Select brand‑aligned pillars and save them.', estimatedTime: '10m', isCompleted: false },
          { id: `${module.id}-w2-plan`, title: 'Create your refined 5‑day content plan', description: 'Draft 3–5 posts using the week’s plan and your pillars.', estimatedTime: '15m', isCompleted: false },
        ] as any;
        return { ...module, title: 'Content Pillars + Strategic Posting Flow', description: 'Lock your pillars and plan a refined 5‑day posting rhythm.', content: curatedContent, tasks: curatedTasks };
      }
      // For all other weeks, replace long email content with concise template summary + prompts
      const concise = [
        `This week: ${module.title}.`,
        '',
        'Keep momentum with a clear rhythm (Beginner 3x or Confident 5x). Draft captions in your Social Content Plan using these prompts:',
        '- Behind the Scenes: Here’s what we’re working on this week…',
        '- Tip or FAQ: Answer a common customer question or give a useful tip related to your work',
        '- Personal Story: Share why you started your business, or something you’re proud of',
        '- Product/Service Feature: Highlight 1 offer you love—show it, describe it, and invite people in',
        '- Fun or Community: Shout out a local business, share a favorite spot, or post something light‑hearted'
      ].join('\n');
      return { ...module, content: concise };
    }
    return module;
  };

  // Task helpers
  const getTaskIcon = (title: string): string => {
    const t = title.toLowerCase();
    if (t.includes('audit') || t.includes('review')) return '🔎';
    if (t.includes('design') || t.includes('template')) return '🎨';
    if (t.includes('write') || t.includes('caption') || t.includes('email')) return '✍️';
    if (t.includes('schedule') || t.includes('plan')) return '📅';
    if (t.includes('bio') || t.includes('profile')) return '👤';
    if (t.includes('post') || t.includes('content')) return '📣';
    return '🗒️';
  };

  // Pro Tip helper (simple seed tips based on common themes)
  const getProTip = (module: MarketingModule): string => {
    const t = `${module.title} ${module.description}`.toLowerCase();
    if (activeGoal && activeGoal.title.toLowerCase().includes('improve social media') && module.weekNumber === 2) {
      return 'You don’t need to be everywhere—you just need to be consistent in the right places.';
    }
    if (t.includes('loyalty') || t.includes('repeat')) return 'This week, try sending a thank-you email to your top 10 customers from last month.';
    if (t.includes('social') || t.includes('engagement')) return 'Batch-create 3 post variations and schedule them to reduce decision fatigue.';
    if (t.includes('brand') || t.includes('identity')) return 'Create a 3-line voice guide: tone, vocabulary, and “never say” words.';
    if (t.includes('foot traffic') || t.includes('local')) return 'Add a limited-time in-store bonus for customers who mention your latest post.';
    if (t.includes('visibility') || t.includes('online presence')) return 'Refresh your Google Business Profile with 3 new photos and an update post.';
    return 'Keep it simple. Ship one useful asset this week and announce it everywhere you show up.';
  };

  type Stage = 'early' | 'mid' | 'growth';
  const getStagesForGoal = (title: string): Stage[] => {
    const t = title.toLowerCase();
    if (t.includes('increase repeat visits') || t.includes('loyalty')) return ['mid', 'growth'];
    if (t.includes('grow online presence') || t.includes('visibility')) return ['early'];
    if (t.includes('clarify') || t.includes('brand identity')) return ['early', 'mid', 'growth'];
    if (t.includes('improve social media') || t.includes('engagement')) return ['early', 'mid'];
    if (t.includes('increase local foot traffic') || t.includes('foot traffic')) return ['early', 'mid'];
    return ['early', 'mid', 'growth'];
  };
  const renderStageChips = (stages: Stage[]) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
      {stages.includes('early') && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.18rem 0.5rem', borderRadius: 999, border: '1px solid #FFC857', background: 'rgba(255,200,87,0.12)', color: '#FFF1E7', fontSize: '0.78rem' }}>Early Stage</span>
      )}
      {stages.includes('mid') && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.18rem 0.5rem', borderRadius: 999, border: '1px solid #5ECD7D', background: 'rgba(94,205,125,0.12)', color: '#FFF1E7', fontSize: '0.78rem' }}>Mid-Stage</span>
      )}
      {stages.includes('growth') && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.18rem 0.5rem', borderRadius: 999, border: '1px solid #686DCA', background: 'rgba(104,109,202,0.12)', color: '#FFF1E7', fontSize: '0.78rem' }}>Growth Stage</span>
      )}
    </div>
  );

  // Simple confetti overlay for week completion
  const [confettiAt, setConfettiAt] = useState<number>(0);
  const triggerConfetti = () => {
    setConfettiAt(Date.now());
    setTimeout(() => setConfettiAt(0), 1500);
  };

  // Guided Week Planner (UI-only for now)
  type PostType = 'Educate' | 'Promote' | 'Connect';
  const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday'] as const;
  type PlannerRow = { day: string; type: PostType; pillar: string; caption: string };
  const defaultPlanner: PlannerRow[] = DAYS.map((d, idx) => ({
    day: d,
    type: (['Connect','Educate','Connect','Promote','Connect'] as PostType[])[idx],
    pillar: (
      [
        'Behind the Scenes',
        'Tip or FAQ',
        'Personal Story',
        'Product/Service Feature',
        'Fun or Community Post'
      ] as string[]
    )[idx],
    caption: ''
  }));
  const [planner, setPlanner] = useState<PlannerRow[]>(defaultPlanner);
  // When Week 1 of Social track is active, enforce the fixed plan mapping
  useEffect(() => {
    if (!activeGoal) return;
    const isSocial = activeGoal.title.toLowerCase().includes('improve social media');
    if (!isSocial) return;
    const currentWeek = activeGoal.currentWeek || 1;
    if (currentWeek === 1) {
      setPlanner(defaultPlanner);
      return;
    }
    if (currentWeek === 2) {
      const refinedWeek2: PlannerRow[] = [
        { day: 'Monday', type: 'Connect', pillar: 'Personal Story / Behind the Scenes', caption: '' },
        { day: 'Tuesday', type: 'Educate', pillar: 'Education / Products', caption: '' },
        { day: 'Wednesday', type: 'Connect', pillar: 'Customer Love / Testimonial', caption: '' },
        { day: 'Thursday', type: 'Promote', pillar: 'Offer or Product Feature', caption: '' },
        { day: 'Friday', type: 'Connect', pillar: 'Community / Local / Fun', caption: '' },
      ];
      setPlanner(refinedWeek2);
      return;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGoal?.id, activeGoal?.currentWeek]);
  const [plannerMode, setPlannerMode] = useState<'beginner' | 'confident'>('beginner');

  // Week 2: content pillars selection (persist locally per-goal)
  const [contentPillarsByGoal, setContentPillarsByGoal] = useState<Record<string, string[]>>({});
  const [newPillarDraft, setNewPillarDraft] = useState<string>('');
  const savePillarsLocalAndRemote = useCallback(async (goalId: string, pillars: string[]) => {
    setContentPillarsByGoal(prev => ({ ...prev, [goalId]: pillars }));
    try { localStorage.setItem(`pillars:${goalId}`, JSON.stringify(pillars)); } catch {}
    try { await apiService.saveContentPillars(pillars); } catch {}
  }, []);
  useEffect(() => {
    if (!activeGoal) return;
    try {
      const raw = localStorage.getItem(`pillars:${activeGoal.id}`);
      if (raw) {
        const saved = JSON.parse(raw);
        if (Array.isArray(saved)) {
          setContentPillarsByGoal(prev => ({ ...prev, [activeGoal.id]: saved as string[] }));
        }
      }
    } catch {}
  }, [activeGoal?.id]);
  // keep for backward compatibility in case referenced elsewhere (but unused path):
  const savePillarsLocal = (_goalId: string, _pillars: string[]) => {};

  // When active goal changes, hydrate pillars from API as a fallback
  useEffect(() => {
    if (!activeGoal) return;
    (async () => {
      try {
        const cp = await apiService.getContentPillars();
        if (cp && (cp as any).success && Array.isArray((cp as any).data)) {
          const list = (cp as any).data as string[];
          setContentPillarsByGoal(prev => ({ ...prev, [activeGoal.id]: list.slice(0, 4) }));
        }
      } catch {}
    })();
  }, [activeGoal?.id]);

  // Generator removed for now (button hidden until pillars are set)

  // Advance active track to next week (persists currentWeek via onMarketingGoalsChange)
  const advanceActiveTrackWeek = useCallback(() => {
    if (!activeGoal) return;
    const updated = marketingGoals.map(g => {
      if (g.id !== activeGoal.id) return g;
      const nextWeek = Math.min(g.currentWeek + 1, g.duration);
      const updatedModules = g.modules.map(module => ({
        ...module,
        isUnlocked: module.weekNumber <= nextWeek,
        isCompleted: module.weekNumber < nextWeek ? true : module.isCompleted
      }));
      const updatedWeekStartDates = [...(g.weekStartDates || [])];
      if (nextWeek !== g.currentWeek) {
        updatedWeekStartDates[nextWeek - 1] = new Date();
      }
      return { ...g, currentWeek: nextWeek, modules: updatedModules, weekStartDates: updatedWeekStartDates, lastWeekAdvancement: new Date() };
    });
    onMarketingGoalsChange(updated);
  }, [activeGoal, marketingGoals, onMarketingGoalsChange]);

  // Define createTasksFromMarketingModule before it's used in useEffect
  const createTasksFromMarketingModule = useCallback((goal: MarketingGoal, module: MarketingModule, projectId: string) => {
    console.log('Creating tasks from marketing module:', { goal: goal.title, module: module.weekNumber, projectId });
    // Calculate the next available task ID
    const maxExistingId = Math.max(...tasks.map(t => parseInt(t.id) || 0), 0);
    let nextTaskId = maxExistingId + 1;
    const createdTasks: Task[] = [];
    const updatedTasks: Task[] = [];
    module.tasks.forEach(marketingTask => {
      // 1) Already linked by marketingTrack → skip
      const existingLinked = tasks.find(t => t.marketingTrack && t.marketingTrack.goalId === goal.id && t.marketingTrack.moduleId === module.id && t.marketingTrack.marketingTaskId === marketingTask.id);
      if (existingLinked) return;

      // 2) Try to find by title/project and attach marketingTrack (pre-existing manual task)
      const matchByTitle = tasks.find(t => t.title.trim().toLowerCase() === marketingTask.title.trim().toLowerCase() && ((t.project && t.project === goal.title) || (t.projectId && t.projectId.toString() === projectId.toString())));
      if (matchByTitle) {
        if (!matchByTitle.marketingTrack) {
          updatedTasks.push({ ...matchByTitle, marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: marketingTask.id } });
        }
        return;
      }

      // 3) Create new task
      const taskId = nextTaskId++;
      createdTasks.push({
        id: taskId.toString(),
        title: marketingTask.title,
        description: marketingTask.description,
        responsible: 'Hillary',
        deadline: (marketingTask as any).dueDate || null,
        project: goal.title,
        timeSpent: '',
        notifications: false,
        status: 'todo' as const,
        marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: marketingTask.id },
        projectId: projectId
      });
    });

    if (createdTasks.length > 0 || updatedTasks.length > 0) {
      const merged = tasks.map(t => {
        const upd = updatedTasks.find(u => u.id === t.id);
        return upd ? upd : t;
      });
      onTasksChange([...merged, ...createdTasks]);
      if (createdTasks.length > 0) {
        const updatedProjects = projects.map(project => {
          if (project.id === projectId) {
            const updatedTimeline = project.timeline.map(phase => phase.id === module.id ? { ...phase, tasks: [...phase.tasks, ...createdTasks.map(t => t.id)] } : phase);
            return { ...project, tasks: [...project.tasks, ...createdTasks.map(t => t.id)], timeline: updatedTimeline };
          }
          return project;
        });
        onProjectsChange(updatedProjects);
      }
    }
  }, [tasks, projects, marketingGoals, onTasksChange, onProjectsChange, onMarketingGoalsChange]);

  // Helper: ensure a marketing project exists for the goal; return its id
  const getOrCreateProjectForGoal = useCallback((goal: MarketingGoal): string => {
    let project = projects.find(p => p.name === goal.title);
    if (project) return project.id.toString();
    const newId = (Math.max(0, ...projects.map(p => parseInt(p.id) || 0)) + 1).toString();
    const newProject: Project = {
      id: newId,
      name: goal.title,
      description: goal.description,
      deadline: new Date(Date.now() + (goal.duration * 7 * 24 * 60 * 60 * 1000)).toISOString(),
      tasks: [],
      progress: 0,
      status: 'active',
      timeline: goal.modules.map((m) => ({
        id: m.id,
        name: `Week ${m.weekNumber}: ${m.title}`,
        description: m.description,
        startDate: new Date(Date.now() + ((m.weekNumber - 1) * 7 * 24 * 60 * 60 * 1000)),
        endDate: new Date(Date.now() + (m.weekNumber * 7 * 24 * 60 * 60 * 1000)),
        status: m.weekNumber <= (goal.currentWeek || 1) ? 'in-progress' : 'not-started',
        tasks: [],
        order: m.weekNumber,
      }))
    };
    onProjectsChange([...projects, newProject]);
    return newId;
  }, [projects, onProjectsChange]);

  // Auto-sync: add unlocked week tasks to Kanban if missing
  useEffect(() => {
    if (!activeGoal) return;
    const projectId = getOrCreateProjectForGoal(activeGoal);
    const unlockedModules = activeGoal.modules.filter(m => m.isUnlocked || m.weekNumber <= (activeGoal.currentWeek || 1));
    unlockedModules.forEach(m0 => {
      const module = withFallback(activeGoal, m0);
      const key = `${activeGoal.id}:${module.id}`;
      // Check if all module tasks already exist
      const allExist = module.tasks.every(mt => tasks.some(t => t.marketingTrack && t.marketingTrack.goalId === activeGoal.id && t.marketingTrack.moduleId === module.id && t.marketingTrack.marketingTaskId === mt.id));
      if (!allExist && !createdModuleTasksRef.current.has(key)) {
        createTasksFromMarketingModule(activeGoal, module, projectId);
        createdModuleTasksRef.current.add(key);
      }
    });
  }, [activeGoal?.id, activeGoal?.currentWeek, marketingGoals, tasks, getOrCreateProjectForGoal, createTasksFromMarketingModule]);

  // Update current time every minute for accurate countdown
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Automatic week advancement effect
  useEffect(() => {
    if (!activeGoal || activeGoal.currentWeek >= activeGoal.duration) return;
    const checkWeekAdvancement = () => {
      const weekStartDates = activeGoal.weekStartDates || [];
      const currentWeekStartDate = weekStartDates[activeGoal.currentWeek - 1];
      if (currentWeekStartDate) {
        const daysSinceWeekStart = Math.floor((currentTime.getTime() - currentWeekStartDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceWeekStart >= 7) {
          const updatedGoals = marketingGoals.map(goal => {
            if (goal.id === activeGoal.id) {
              const nextWeek = goal.currentWeek + 1;
              const updatedModules = goal.modules.map(module => ({
                ...module,
                isUnlocked: module.weekNumber <= nextWeek,
                isCompleted: module.weekNumber < nextWeek
              }));
              const updatedWeekStartDates = [...(goal.weekStartDates || [])];
              if (nextWeek <= goal.duration) updatedWeekStartDates[nextWeek - 1] = new Date();
              return { ...goal, currentWeek: nextWeek, modules: updatedModules, weekStartDates: updatedWeekStartDates, lastWeekAdvancement: new Date() };
            }
            return goal;
          });
          onMarketingGoalsChange(updatedGoals);
          const updatedActiveGoal = updatedGoals.find(g => g.id === activeGoal.id);
          if (updatedActiveGoal) {
            if (updatedActiveGoal.currentWeek < updatedActiveGoal.duration) {
              const newModule = updatedActiveGoal.modules.find(m => m.weekNumber === updatedActiveGoal.currentWeek);
              if (newModule) {
                const marketingProject = projects.find(p => p.name === updatedActiveGoal.title);
                if (marketingProject) {
                  createTasksFromMarketingModule(updatedActiveGoal, newModule, marketingProject.id.toString());
                  createdModuleTasksRef.current.add(`${updatedActiveGoal.id}:${newModule.id}`);
                }
              }
            }
          }
        }
      }
    };
    checkWeekAdvancement();
    const interval = setInterval(checkWeekAdvancement, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [activeGoal, marketingGoals, onMarketingGoalsChange, projects, onProjectsChange, currentTime, createTasksFromMarketingModule]);

  const handleGoalSelect = (goal: MarketingGoal) => {
    if (selectedGoal?.id === goal.id) {
      setSelectedGoal(null);
      setSelectedModule(null);
    } else {
      setSelectedGoal(goal);
      setSelectedModule(null);
    }
  };

  const toggleTaskCompletion = (goalId: string, moduleId: string, taskId: string) => {
    const updatedGoals = marketingGoals.map(goal => {
      if (goal.id === goalId) {
        const updatedModules = goal.modules.map(module => {
          if (module.id === moduleId) {
            const updatedTasks = module.tasks.map(task => task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task);
            return { ...module, tasks: updatedTasks };
          }
          return module;
        });
        return { ...goal, modules: updatedModules };
      }
      return goal;
    });
    onMarketingGoalsChange(updatedGoals);

    // If week now completed, celebrate
    const g = updatedGoals.find(g => g.id === goalId);
    const m = g?.modules.find(m => m.id === moduleId);
    if (m && m.tasks.length > 0 && m.tasks.every(t => t.isCompleted)) {
      triggerConfetti();
    }
    const updatedTasks = tasks.map(task => {
      if (task.marketingTrack && task.marketingTrack.goalId === goalId && task.marketingTrack.moduleId === moduleId && task.marketingTrack.marketingTaskId === taskId) {
        return { ...task, status: task.status === 'completed' ? 'todo' as const : 'completed' as const };
      }
      return task;
    });
    onTasksChange(updatedTasks);
  };

  const startMarketingTrack = (goal: MarketingGoal) => {
    processedGoalsRef.current.clear();
    const updatedGoals = marketingGoals.map(g => {
      if (g.id === goal.id) {
        return { ...g, isActive: true, startDate: new Date(), currentWeek: 1, progress: 0, weekStartDates: [new Date()], lastWeekAdvancement: new Date() };
      } else {
        return { ...g, isActive: false, currentWeek: 0, progress: 0, modules: g.modules.map(module => ({ ...module, isUnlocked: false, isCompleted: false })) };
      }
    });
    onMarketingGoalsChange(updatedGoals);
    setSelectedGoal(goal);
    const projectId = Math.max(0, ...projects.map(p => parseInt(p.id) || 0)) + 1;
    const newProject: Project = {
      id: projectId.toString(),
      name: goal.title,
      description: goal.description,
      deadline: new Date(Date.now() + (goal.duration * 7 * 24 * 60 * 60 * 1000)).toISOString(),
      tasks: [],
      progress: 0,
      status: 'active',
      timeline: goal.modules.map((module) => ({
        id: module.id,
        name: `Week ${module.weekNumber}: ${module.title}`,
        description: module.description,
        startDate: new Date(Date.now() + ((module.weekNumber - 1) * 7 * 24 * 60 * 60 * 1000)),
        endDate: new Date(Date.now() + (module.weekNumber * 7 * 24 * 60 * 60 * 1000)),
        status: module.weekNumber === 1 ? 'in-progress' : 'not-started',
        tasks: [],
        order: module.weekNumber
      }))
    };
    onProjectsChange([...projects, newProject]);
    const firstModule = goal.modules.find(m => m.weekNumber === 1);
    if (firstModule) {
      createTasksFromMarketingModule(goal, firstModule, projectId.toString());
      createdModuleTasksRef.current.add(`${goal.id}:${firstModule.id}`);
    }
  };

  // Open interactive modal for a given task
  const openInteractiveTask = (goalId: string, moduleId: string, taskId: string, title: string, description: string) => {
    try { console.log('[MarketingTrackPage] openInteractiveTask:', title); } catch {}
    setInteractiveMeta({ goalId, moduleId });
    setInteractiveTask({ id: taskId, title, description });
    setInteractiveOpen(true);
  };

  const closeInteractiveTask = () => {
    setInteractiveOpen(false);
    setInteractiveTask(null);
    setInteractiveMeta(null);
  };

  // Interactive modal content
  const renderInteractiveContentForTask = (t: { id: string; title: string; description: string } | null): ReactNode => {
    if (!t) return null;
    const lower = t.title.toLowerCase();
    const goalId = interactiveMeta?.goalId || (selectedGoal?.id ?? '');
    const moduleId = interactiveMeta?.moduleId || (selectedModule?.id ?? '');
    const mainTask = tasks.find(task => task.marketingTrack && task.marketingTrack.goalId === goalId && task.marketingTrack.moduleId === moduleId && task.marketingTrack.marketingTaskId === t.id);

    const setMainStatus = (status: TaskStatus) => {
      if (!mainTask) return;
      const updated = tasks.map(task => task.id === mainTask.id ? { ...task, status } : task);
      onTasksChange(updated);
      if (status === 'completed' && selectedGoal) {
        const updatedGoals = marketingGoals.map(g => {
          if (g.id !== goalId) return g;
          return {
            ...g,
            modules: g.modules.map(m => m.id !== moduleId ? m : ({
              ...m,
              tasks: m.tasks.map(mt => mt.id === t.id ? { ...mt, isCompleted: true } : mt)
            }))
          };
        });
        onMarketingGoalsChange(updatedGoals);
      }
    };

    if (lower.includes('baseline metrics')) {
      return (
        <div>
          <h2 style={{ marginTop: 0 }}>{t.title}</h2>
          <p style={{ opacity: 0.85 }}>{t.description}</p>
          {/* Platform tabs */}
          <div style={{ display: 'flex', gap: '6px', margin: '8px 0 12px' }}>
            {PLATFORM_KEYS.map(({ key, label }) => (
              <button key={key} onClick={() => setSelectedPlatformTab(key)} style={{
                padding: '6px 10px',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.15)',
                background: selectedPlatformTab === key ? '#EF8E81' : 'transparent',
                color: selectedPlatformTab === key ? '#191628' : '#FFF1E7',
                cursor: 'pointer',
                fontWeight: 700
              }}>{label}</button>
            ))}
          </div>
          {/* Selected platform fields */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '0.9rem' }}>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#FFF1E7' }}>{PLATFORM_KEYS.find(p => p.key === selectedPlatformTab)?.label}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                  <label style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                    Followers
                <input value={baseline[selectedPlatformTab].followers} onChange={e => setBaseline(b => ({ ...b, [selectedPlatformTab]: { ...b[selectedPlatformTab], followers: e.target.value } }))} style={inputBaseStyle} />
                  </label>
                  <label style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                    Avg Likes
                <input value={baseline[selectedPlatformTab].avgLikes} onChange={e => setBaseline(b => ({ ...b, [selectedPlatformTab]: { ...b[selectedPlatformTab], avgLikes: e.target.value } }))} style={inputBaseStyle} />
                  </label>
                  <label style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                    Avg Comments
                <input value={baseline[selectedPlatformTab].avgComments} onChange={e => setBaseline(b => ({ ...b, [selectedPlatformTab]: { ...b[selectedPlatformTab], avgComments: e.target.value } }))} style={inputBaseStyle} />
                  </label>
                  <label style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                    Avg Story Views
                <input value={baseline[selectedPlatformTab].avgStoryViews} onChange={e => setBaseline(b => ({ ...b, [selectedPlatformTab]: { ...b[selectedPlatformTab], avgStoryViews: e.target.value } }))} style={inputBaseStyle} />
                  </label>
                </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button onClick={saveBaseline} disabled={loadingInline} style={{ padding: '0.4rem 0.9rem' }}>Save</button>
            {baseline.saved && <span style={{ color: '#5ECD7D' }}>Saved</span>}
            {inlineError && <span style={{ color: '#EF8E81' }}>{inlineError}</span>}
            <span style={{ marginLeft: 'auto' }} />
            <button onClick={() => setMainStatus('in-progress')} style={actionButtonStyle(statusAccentColors['in-progress'])}>Mark In Progress</button>
            <button onClick={() => setMainStatus('completed')} style={actionButtonStyle(statusAccentColors['completed'])}>Completed</button>
          </div>
        </div>
      );
    }
    if (lower.includes('fix bio') || lower.includes('bio + link')) {
      return (
        <div>
          <h2 style={{ marginTop: 0 }}>Fix bio + link (if needed)</h2>
          <p style={{ opacity: 0.85 }}>Tighten your profile so new visitors instantly know who you are, what you do, and the next step.</p>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '0.9rem', marginTop: '0.5rem' }}>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#FFF1E7' }}>Checklist</div>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.6 }}>
              <li>Bio clearly says what you do</li>
              <li>Profile pic is current and professional</li>
              <li>Link leads to something useful (website, menu, booking, etc.)</li>
              <li>Highlight covers or pinned posts reflect your top offers</li>
            </ul>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '0.9rem', marginTop: '0.75rem' }}>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#FFF1E7' }}>Good bio examples</div>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.6 }}>
              <li>“Neighborhood bakery • Fresh sourdough daily • 📍 Eastside • ⏰ M–Sat • ⬇️ Order online”</li>
              <li>“Independent salon • Cuts • Color • Bridal • 📍 Downtown • ⬇️ Book your appointment”</li>
              <li>“Brand design studio for local shops • Logos • Packaging • 📍 Denver • ⬇️ See our work”</li>
            </ul>
          </div>
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setMainStatus('in-progress')} style={actionButtonStyle(statusAccentColors['in-progress'])}>Mark In Progress</button>
            <button onClick={() => setMainStatus('completed')} style={actionButtonStyle(statusAccentColors['completed'])}>Completed</button>
          </div>
        </div>
      );
    }
    if (lower.includes('plan this week') || lower.includes('plan this week’s') || lower.includes('3 posts')) {
      return (
        <div>
          <h2 style={{ marginTop: 0 }}>Plan this week’s posts</h2>
          <p style={{ opacity: 0.85 }}>We’ll use three post types to keep things clear and consistent. Draft your captions below in the Social Content Plan.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '0.9rem' }}>
              <div style={{ fontWeight: 700, color: '#FFF1E7' }}>Educate</div>
              <p style={{ margin: '0.25rem 0', opacity: 0.85 }}>Teach something useful that relates to your product or service.</p>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Example: “Answer a common customer question or give a useful tip related to your work.”</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '0.9rem' }}>
              <div style={{ fontWeight: 700, color: '#FFF1E7' }}>Connect</div>
              <p style={{ margin: '0.25rem 0', opacity: 0.85 }}>Humanize your brand and build trust with small stories.</p>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Examples: “Here’s what we’re working on this week…”, “Share why you started your business, or something you’re proud of.”</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '0.9rem' }}>
              <div style={{ fontWeight: 700, color: '#FFF1E7' }}>Promote</div>
              <p style={{ margin: '0.25rem 0', opacity: 0.85 }}>Spotlight one offer and invite people to take the next step.</p>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Examples: “Highlight 1 offer you love—show it, describe it, and invite people in.” “Shout out a local business or share a light-hearted community post on Friday.”</div>
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setMainStatus('in-progress')} style={actionButtonStyle(statusAccentColors['in-progress'])}>Mark In Progress</button>
            <button onClick={() => setMainStatus('completed')} style={actionButtonStyle(statusAccentColors['completed'])}>Completed</button>
          </div>
        </div>
      );
    }
    if (lower.includes('content pillars') || lower.includes('choose your content pillars')) {
      const selected = (goalId && contentPillarsByGoal[goalId]) ? contentPillarsByGoal[goalId] : [];
      return (
        <div>
          <h2 style={{ marginTop: 0 }}>{t.title}</h2>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '0.9rem', marginBottom: '0.75rem' }}>
            <div style={{ fontWeight: 700, color: '#FFF1E7', marginBottom: '0.25rem' }}>Why create content pillars?</div>
            <p style={{ margin: 0, opacity: 0.85 }}>
              Content pillars are the repeatable themes that shape your message. They give you clarity, make planning faster,
              and help your audience understand what you stand for. Once you lock them, your weekly plan becomes plug‑and‑play.
            </p>
          </div>
          <div style={{ color: '#FFF1E7', opacity: 0.85, marginBottom: '0.5rem' }}>Your selected pillars</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {(selected && selected.length > 0) ? selected.map(p => (
              <span key={p} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '6px 10px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: '#FFF1E7', fontSize: '0.9rem' }}>{p}</span>
            )) : (
              <span style={{ opacity: 0.7 }}>No pillars selected yet. Use the section on this page to add up to 4 pillars.</span>
            )}
          </div>
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setMainStatus('in-progress')} style={actionButtonStyle(statusAccentColors['in-progress'])}>Mark In Progress</button>
            <button onClick={() => setMainStatus('completed')} style={actionButtonStyle(statusAccentColors['completed'])}>Completed</button>
          </div>
        </div>
      );
    }
    return (
      <div>
        <h2 style={{ marginTop: 0 }}>{t.title}</h2>
        <p style={{ opacity: 0.85 }}>{t.description}</p>
        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button onClick={() => setMainStatus('in-progress')} style={actionButtonStyle(statusAccentColors['in-progress'])}>Mark In Progress</button>
          <button onClick={() => setMainStatus('completed')} style={actionButtonStyle(statusAccentColors['completed'])}>Completed</button>
        </div>
      </div>
    );
  };

  // Event delegation to open modal when any task card is clicked
  const handleTaskListClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const target = e.target as HTMLElement;
    const host = target.closest('[data-task-title]') as HTMLElement | null;
    const wrapper = target.closest('[data-module-id]') as HTMLElement | null;
    if (host && host.dataset.taskTitle && host.dataset.taskId && wrapper && wrapper.dataset.moduleId && wrapper.dataset.goalId) {
      openInteractiveTask(wrapper.dataset.goalId, wrapper.dataset.moduleId, host.dataset.taskId, host.dataset.taskTitle, host.dataset.taskDesc || '');
    }
  };

  return (
    <div className="widget" style={{ padding: '2rem', minHeight: '100vh', color: '#FFF1E7' }}>
      {/* Personal header */}
      {profile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          {profile.avatarUrl && <img src={profile.avatarUrl} alt="avatar" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }} />}
          <div style={{ fontSize: '1.1rem', opacity: 0.9 }}>
            {`Hi${profile.fullName ? `, ${profile.fullName.split(' ')[0]}` : ''}! Ready to dig in?`}
          </div>
        </div>
      )}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 700, color: '#FFF1E7', marginBottom: '0.5rem' }}>
          Marketing Tracks
        </h1>
      </div>

      {/* Active Track - Full Width Highlight */}
      {activeGoal && (
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.75rem', color: '#FFF1E7', marginBottom: '1.5rem' }}>
            Active Track
          </h2>
          <div style={{
            background: 'linear-gradient(180deg, rgba(239,142,129,0.06), rgba(25,22,40,0.35))',
            borderRadius: '16px',
            padding: '2rem',
            border: '2px solid rgba(239, 142, 129, 0.25)',
            boxShadow: '0 10px 28px rgba(0,0,0,0.35)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Active Track Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1.75rem', color: '#FFF1E7', marginBottom: '0.5rem' }}>
                  {activeGoal.title}
                </h3>
                <p style={{ margin: 0, color: '#FFF1E7', opacity: 0.7, fontSize: '1rem', marginBottom: '0.5rem' }}>
                  {activeGoal.description}
                </p>
                {/* Stage legend will be conditionally shown above when choosing tracks */}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{
                  background: activeGoal.currentWeek >= activeGoal.duration ? '#5ECD7D' : '#5ECD7D',
                  color: '#22202F',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}>
                  {activeGoal.currentWeek >= activeGoal.duration ? 'Completed' : `Active • Week ${activeGoal.currentWeek} of ${activeGoal.duration}`}
                </span>
                <button type="button" onClick={() => advanceActiveTrackWeek()} style={{ padding: '0.5rem 0.9rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(239,142,129,0.22)', color: '#EF8E81', cursor: 'pointer' }}>Advance to Next Week</button>
                                  {activeGoal.currentWeek < activeGoal.duration && activeGoal.weekStartDates && activeGoal.weekStartDates[activeGoal.currentWeek - 1] && (
                    <span style={{
                      background: 'rgba(104, 109, 202, 0.2)',
                      color: '#686DCA',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      border: '1px solid rgba(104, 109, 202, 0.3)'
                    }}>
                      {(() => {
                        const currentWeekStart = activeGoal.weekStartDates[activeGoal.currentWeek - 1];
                        const daysSinceStart = Math.floor((currentTime.getTime() - currentWeekStart.getTime()) / (1000 * 60 * 60 * 24));
                        const daysRemaining = Math.max(0, 7 - daysSinceStart);
                        return daysRemaining > 0 ? `Next week in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}` : 'Advancing to next week...';
                      })()}
                    </span>
                  )}
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: '2rem', padding: '4px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ color: '#FFF1E7', fontSize: '0.875rem' }}>Overall Progress</span>
                <span style={{ color: '#EF8E81', fontSize: '0.875rem', fontWeight: 600 }}>{activeGoal.progress}%</span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '8px', 
                background: 'rgba(255, 255, 255, 0.1)', 
                borderRadius: '4px' 
              }}>
                <div style={{
                  width: `${activeGoal.progress}%`,
                  height: '100%',
                  background: '#EF8E81',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            {/* Current Week Module or Completion View */}
            {!isTrackCompleted ? (
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ margin: 0, fontSize: '1.25rem', color: '#FFF1E7', marginBottom: '1rem' }}>
                  Current Week: {activeGoal.currentWeek}
                </h4>
                {activeGoal.modules.filter(m => m.weekNumber === activeGoal.currentWeek).map(m0 => {
                  const module = withFallback(activeGoal, m0);
                  return (
                  <div key={module.id}>
                  {/* Current Week Card Header */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      border: '1px solid rgba(239, 142, 129, 0.2)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      borderBottomLeftRadius: isCurrentWeekExpanded ? '0' : '12px',
                      borderBottomRightRadius: isCurrentWeekExpanded ? '0' : '12px'
                    }}
                    onClick={() => setIsCurrentWeekExpanded(!isCurrentWeekExpanded)}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <h5 style={{ margin: 0, fontSize: '1.1rem', color: '#FFF1E7', marginBottom: '0.25rem' }}>
                          {module.title}
                        </h5>
                        <p style={{ margin: 0, color: '#FFF1E7', opacity: 0.7, fontSize: '0.9rem' }}>
                          {module.description}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                              <span style={{
                        background: '#FF9D57',
                        color: '#22202F',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}>
                        Current
                      </span>
                        <span style={{
                          color: '#FFF1E7',
                          fontSize: '1.2rem',
                          transition: 'transform 0.2s',
                          transform: isCurrentWeekExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}>
                          ▼
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ color: '#FFF1E7', fontSize: '0.875rem' }}>Tasks</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#686DCA', fontSize: '0.875rem' }}>
                          {module.tasks.filter(t => t.isCompleted).length}/{module.tasks.length}
                        </span>
                        <span style={{ color: '#FFF1E7', opacity: 0.5, fontSize: '0.75rem' }}>
                          Click to expand
                        </span>
                      </div>
                    </div>
                    <div style={{ 
                      width: '100%', 
                      height: '4px', 
                      background: 'rgba(255, 255, 255, 0.1)', 
                      borderRadius: '2px' 
                    }}>
                      <div style={{
                        width: `${module.tasks.length > 0 ? (module.tasks.filter(t => t.isCompleted).length / module.tasks.length) * 100 : 0}%`,
                        height: '100%',
                        background: '#686DCA',
                        borderRadius: '2px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>

                  {/* Current Week Dropdown Content */}
                  {isCurrentWeekExpanded && (
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '0 0 12px 12px',
                      border: '1px solid rgba(239, 142, 129, 0.2)',
                      borderTop: 'none',
                      padding: '1.5rem',
                      animation: 'slideDown 0.3s ease-out'
                    }}>
                      {/* Intro section for Social track (special copy for Week 1, concise for others) */}
                          {activeGoal.title.toLowerCase().includes('improve social media') && (
                        <div style={{
                          background: 'rgba(255,241,231,0.05)',
                          border: '1px solid rgba(239,142,129,0.25)',
                          borderRadius: 10,
                          padding: '1rem',
                          marginBottom: '1rem'
                        }}>
                          <div style={{ color: '#FFF1E7' }}>
                            {module.weekNumber === 1 ? (
                              <>
                                <div style={{ fontWeight: 700, marginBottom: 6 }}>
                                  {`Hi${profile?.fullName ? `, ${profile.fullName.split(' ')[0]}` : ''},`}
                                </div>
                                <p style={{ margin: '0.25rem 0' }}>Welcome to your new quarter of <span style={{ fontStyle: 'italic' }}>Momentum Marketing!</span> 🎉</p>
                                <p style={{ margin: '0.25rem 0', opacity: 0.9 }}>Over the next 12 weeks, we’ll strengthen your social media presence by focusing on smart strategy, easy systems, and engaging content that reflects the heart of your business.</p>
                                <p style={{ margin: '0.25rem 0', opacity: 0.9 }}>This week we’re kicking off with a full audit of where you are now, plus a simple week‑long content plan you can follow to build consistency without stress.</p>
                              </>
                            ) : module.weekNumber === 2 ? (
                              <>
                                <div style={{ fontWeight: 700, marginBottom: 6 }}>{`Hi${profile?.fullName ? `, ${profile.fullName.split(' ')[0]}` : ''},`}</div>
                                <p style={{ margin: '0.25rem 0', opacity: 0.95 }}>One of the hardest parts of showing up consistently on social media is knowing <strong>what to say</strong>.</p>
                                <p style={{ margin: '0.25rem 0', opacity: 0.9 }}>This week, we’re solving that by defining your <strong>Content Pillars</strong>—the 3–4 themes that represent your brand and connect with your audience. These become your “go‑to” buckets for content creation, making it easier to plan posts that feel intentional, not random.</p>
                                <p style={{ margin: '0.25rem 0', opacity: 0.9 }}>Once you’ve got your pillars, you’ll also try a more <strong>strategy‑driven weekly content plan</strong> that builds from last week.</p>
                              </>
                            ) : (
                              <>
                                <div style={{ fontWeight: 700, marginBottom: 6 }}>This week</div>
                                <p style={{ margin: '0.25rem 0', opacity: 0.9 }}>{module.description || 'Keep your rhythm: plan and ship 3–5 posts with clear intent.'}</p>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'stretch' }}>
                        {/* Week Content */}
                        <div>
                          <h6 style={{ margin: 0, fontSize: '1rem', color: '#FFF1E7', marginBottom: '1rem', fontWeight: 600 }}>
                            Week Content
                          </h6>
                          <div style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '8px',
                            padding: '1rem',
                            color: '#FFF1E7',
                            lineHeight: '1.6',
                            fontSize: '0.9rem',
                            height: '320px',
                            overflowY: 'auto'
                          }}>
                            {renderRichContent(module.content)}
                          </div>
                        </div>

                        {/* Week Tasks */}
                        <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h6 style={{ margin: 0, fontSize: '1rem', color: '#FFF1E7', fontWeight: 600 }}>
                                  Week Tasks
                                </h6>
                              </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '320px', overflowY: 'auto' }} onClick={handleTaskListClick} data-module-id={module.id} data-goal-id={activeGoal.id}>
                              {module.tasks.map(task => (
                              <div
                                key={task.id}
                                data-task-id={task.id}
                                data-task-title={task.title}
                                data-task-desc={task.description}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e)=>{ if(e.key==='Enter'||e.key===' ') openInteractiveTask(activeGoal.id, module.id, task.id, task.title, task.description); }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '0.75rem',
                                  padding: '0.75rem',
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  borderRadius: '6px',
                                  border: `1px solid ${task.isCompleted ? 'rgba(94, 205, 125, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                                  cursor: 'pointer'
                                }}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleTaskCompletion(activeGoal.id, module.id, task.id);
                                  }}
                                  style={{
                                    width: '26px',
                                    height: '26px',
                                    borderRadius: '50%',
                                    border: `2px solid ${task.isCompleted ? '#5ECD7D' : '#686DCA'}`,
                                    background: task.isCompleted ? '#5ECD7D' : 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                    marginTop: '2px',
                                    padding: 0,
                                    minWidth: '26px',
                                    minHeight: '26px',
                                    boxShadow: task.isCompleted ? '0 0 0 6px rgba(94,205,125,0.15)' : 'none',
                                    transition: 'box-shadow 0.2s ease'
                                  }}
                                >
                                  {task.isCompleted && (
                                    <span style={{ color: '#22202F', fontSize: '14px', fontWeight: 'bold' }}>✓</span>
                                  )}
                                </button>
                                  <div style={{ flex: 1 }}>
                                  <div style={{ 
                                    color: '#FFF1E7', 
                                    fontSize: '0.9rem', 
                                    fontWeight: 600,
                                    marginBottom: '0.25rem',
                                    textDecoration: task.isCompleted ? 'line-through' : 'none',
                                    opacity: task.isCompleted ? 0.7 : 1
                                  }}>
                                    <span style={{ marginRight: 6 }}>{getTaskIcon(task.title)}</span>
                                    {task.title}
                                  </div>
                                    {/* Remove rationale from preview; it will appear in the modal */}
                                    <div style={{ color: '#FFF1E7', opacity: 0.7, fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                                      {task.description}
                                    </div>
                                  <div style={{ color: '#EF8E81', fontSize: '0.75rem', fontWeight: 600 }}>⏱️ {task.estimatedTime || '—'}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Week 2: Content Pillars selector (replaces baseline section) */}
                        {activeGoal.title.toLowerCase().includes('improve social media') && module.weekNumber === 2 && (
                          <div style={{ gridColumn: '1 / -1' }}>
                            <div style={{ marginTop: '0.25rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '0.9rem' }}>
                              <div style={{ color: '#FFF1E7', marginBottom: '0.5rem', fontWeight: 700 }}>Choose your 3–4 content pillars</div>
                              {/* Removed rationale copy from section per request; shown inside task modal instead */}
                              {/* Custom pillar input */}
                              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <input value={newPillarDraft} onChange={e => setNewPillarDraft(e.target.value)} placeholder="Add a custom pillar…" style={{ ...inputBaseStyle, flex: 1 }} />
                                <button onClick={() => {
                                  const trimmed = newPillarDraft.trim();
                                  if (!trimmed) return;
                                  const current = contentPillarsByGoal[activeGoal.id] || [];
                                  if (current.includes(trimmed)) { setNewPillarDraft(''); return; }
                                  const next = [...current, trimmed].slice(0, 4);
                                  savePillarsLocalAndRemote(activeGoal.id, next);
                                  setNewPillarDraft('');
                                }} style={{ padding: '6px 10px' }}>Add</button>
                              </div>
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {['Your Products/Services','Behind-the-Scenes / Business Life','Customer Stories / Testimonials','Tips & Education','Promotions / Sales / Events','Personal Story / Values','Local Love / Community','Visual Inspiration'].map(p => {
                                  const selected = (contentPillarsByGoal[activeGoal.id] || []).includes(p);
                                  return (
                                    <button key={p} onClick={() => {
                                      const current = contentPillarsByGoal[activeGoal.id] || [];
                                      const next = selected ? current.filter(x => x !== p) : [...current, p].slice(0, 4);
                                      savePillarsLocalAndRemote(activeGoal.id, next);
                                    }} style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.15)', background: selected ? '#EF8E81' : 'transparent', color: selected ? '#191628' : '#FFF1E7', cursor: 'pointer', fontWeight: 700 }}>
                                      {p}
                                    </button>
                                  );
                                })}
                              </div>
                              <div style={{ marginTop: 8, color: '#FFF1E7', opacity: 0.8, fontSize: 12 }}>
                                Selected: {(contentPillarsByGoal[activeGoal.id] || []).join(', ') || 'None selected yet'}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Pro Tip spanning both columns */}
                        <div style={{ gridColumn: '1 / -1' }}>
                          <div style={{ marginTop: '0.25rem', background: 'rgba(104,109,202,0.12)', border: '1px dashed rgba(104,109,202,0.4)', color: '#FFF1E7', borderRadius: 8, padding: '0.9rem' }}>
                            <strong style={{ color: '#686DCA' }}>💡 Pro Tip:</strong> {getProTip(module)}
                          </div>
                        </div>
                        {/* Guided Week (Planner + Quick Wins) */}
                        <div style={{ gridColumn: '1 / -1' }}>
                          <div style={{ marginTop: '0.5rem', background: 'rgba(255,241,231,0.04)', border: '1px solid rgba(239,142,129,0.25)', borderRadius: 10, padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                              <h6 style={{ margin: 0, fontSize: '1rem', color: '#FFF1E7', fontWeight: 700 }}>Social Content Plan</h6>
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <span style={{ color: '#FFF1E7', opacity: 0.8, fontSize: 12 }}>Rhythm</span>
                                <button onClick={()=> setPlannerMode('beginner')} disabled={plannerMode==='beginner'} style={{ padding: '0.3rem 0.6rem', borderRadius: 999, border: '1px solid rgba(255,255,255,0.15)', background: plannerMode==='beginner' ? '#EF8E81' : 'transparent', color: plannerMode==='beginner' ? '#191628' : '#FFF1E7', cursor: 'pointer' }}>Beginner 3x</button>
                                <button onClick={()=> setPlannerMode('confident')} disabled={plannerMode==='confident'} style={{ padding: '0.3rem 0.6rem', borderRadius: 999, border: '1px solid rgba(255,255,255,0.15)', background: plannerMode==='confident' ? '#EF8E81' : 'transparent', color: plannerMode==='confident' ? '#191628' : '#FFF1E7', cursor: 'pointer' }}>Confident 5x</button>
                              </div>
                            </div>
                            {/* Quick Wins removed per request */}
                             {/* Planner Grid */}
                             <div style={{ overflowX: 'hidden' }}>
                               <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, tableLayout: 'fixed' }}>
                                <thead>
                                  <tr style={{ textAlign: 'left', color: '#FFF1E7', opacity: 0.8 }}>
                                    <th style={{ padding: '8px' }}>Day</th>
                                    <th style={{ padding: '8px' }}>Type</th>
                                    <th style={{ padding: '8px' }}>Pillar</th>
                                    <th style={{ padding: '8px' }}>Caption (draft)</th>
                                  </tr>
                                </thead>
                                <tbody>
                                    {(plannerMode==='beginner' ? planner.filter(r => ['Monday','Wednesday','Friday'].includes(r.day)) : planner).map((row, idx) => (
                                      <tr key={row.day} style={{ background: idx % 2 ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                                        <td style={{ padding: '8px', color: '#FFF1E7' }}>{row.day}</td>
                                        <td style={{ padding: '8px' }}>
                                          <select value={row.type} onChange={(e)=> setPlanner(pl => { const next=[...pl]; next[idx] = { ...next[idx], type: e.target.value as any }; return next; })} style={{ background: 'rgba(255,255,255,0.06)', color: '#FFF1E7', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '6px 8px', width: '100%' }}>
                                            <option value="Connect">Connect</option>
                                            <option value="Educate">Educate</option>
                                            <option value="Promote">Promote</option>
                                          </select>
                                        </td>
                                        <td style={{ padding: '8px' }}>
                                          <select value={row.pillar} onChange={(e)=> setPlanner(pl => { const next=[...pl]; next[idx] = { ...next[idx], pillar: e.target.value }; return next; })} style={{ background: 'rgba(255,255,255,0.06)', color: '#FFF1E7', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '6px 8px', width: '100%' }}>
                                            {(['Your Products/Services','Behind-the-Scenes / Business Life','Customer Stories / Testimonials','Tips & Education','Promotions / Sales / Events','Personal Story / Values','Local Love / Community','Visual Inspiration'] as string[]).map(opt => (
                                              <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                            {(contentPillarsByGoal[activeGoal.id] || []).filter(p => !['Your Products/Services','Behind-the-Scenes / Business Life','Customer Stories / Testimonials','Tips & Education','Promotions / Sales / Events','Personal Story / Values','Local Love / Community','Visual Inspiration'].includes(p)).map(opt => (
                                              <option key={`custom-${opt}`} value={opt}>{opt}</option>
                                            ))}
                                          </select>
                                        </td>
                                        <td style={{ padding: '8px' }}>
                                          <input value={row.caption} onChange={(e)=> setPlanner(pl => { const next=[...pl]; next[idx] = { ...next[idx], caption: e.target.value }; return next; })} placeholder="Draft caption…" style={{ background: 'rgba(255,255,255,0.06)', color: '#FFF1E7', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '6px 8px', width: '100%' }} />
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  </div>
                );})}
              </div>
            ) : (
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ margin: 0, fontSize: '1.25rem', color: '#FFF1E7', marginBottom: '1rem' }}>
                  Track Completed • Week {activeGoal.duration}
                </h4>
                {(() => {
                  const finalModuleRaw = activeGoal.modules.find(m => m.weekNumber === activeGoal.duration);
                  if (!finalModuleRaw) return null;
                  const finalModule = withFallback(activeGoal, finalModuleRaw);
                  return (
                    <div>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        border: '1px solid rgba(239, 142, 129, 0.2)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                          <div style={{ flex: 1 }}>
                            <h5 style={{ margin: 0, fontSize: '1.1rem', color: '#FFF1E7', marginBottom: '0.25rem' }}>
                              {finalModule.title}
                            </h5>
                            <p style={{ margin: 0, color: '#FFF1E7', opacity: 0.7, fontSize: '0.9rem' }}>
                              {finalModule.description}
                            </p>
                          </div>
                          <span style={{
                            background: '#5ECD7D',
                            color: '#22202F',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}>
                            ✓ Complete
                          </span>
                        </div>
                      </div>

                      {/* Completion Details Layout mirrors current-week dropdown */}
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '0 0 12px 12px',
                        border: '1px solid rgba(239, 142, 129, 0.2)',
                        borderTop: 'none',
                        padding: '1.5rem',
                        marginTop: '-1px'
                      }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'stretch' }}>
                          {/* Week Content */}
                          <div>
                            <h6 style={{ margin: 0, fontSize: '1rem', color: '#FFF1E7', marginBottom: '1rem', fontWeight: 600 }}>
                              Week Content
                            </h6>
                            <div style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              borderRadius: '8px',
                              padding: '1rem',
                              color: '#FFF1E7',
                              lineHeight: '1.6',
                              fontSize: '0.9rem',
                              maxHeight: '320px',
                              overflowY: 'auto'
                            }}>
                              {renderRichContent(finalModule.content)}
                            </div>
                          </div>

                          {/* Week Tasks (all completed) */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                              <h6 style={{ margin: 0, fontSize: '1rem', color: '#FFF1E7', fontWeight: 600 }}>
                                Week Tasks
                              </h6>
                              <div style={{ padding: '0.25rem 0.75rem', background: '#5ECD7D', color: '#22202F', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>Completed</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '320px', overflowY: 'auto' }}>
                              {finalModule.tasks.map(task => (
                                <div key={task.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', border: `1px solid ${task.isCompleted ? 'rgba(94, 205, 125, 0.3)' : 'rgba(255, 255, 255, 0.1)'}` }}>
                                  <div style={{
                                    width: '26px',
                                    height: '26px',
                                    borderRadius: '50%',
                                    border: '2px solid #5ECD7D',
                                    background: '#5ECD7D',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    marginTop: '2px',
                                    padding: 0,
                                    minWidth: '26px',
                                    minHeight: '26px',
                                    boxShadow: '0 0 0 6px rgba(94,205,125,0.15)'
                                  }}>
                                    <span style={{ color: '#22202F', fontSize: '14px', fontWeight: 'bold' }}>✓</span>
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ color: '#FFF1E7', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem', textDecoration: 'line-through', opacity: 0.7 }}>
                                      {task.title}
                                    </div>
                                    <div style={{ color: '#FFF1E7', opacity: 0.7, fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                                      {task.description}
                                    </div>
                                    <div style={{ color: '#EF8E81', fontSize: '0.75rem', fontWeight: 600 }}>⏱️ {task.estimatedTime || '—'}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* All Modules Grid */}
            <div>
              <h4 style={{ margin: 0, fontSize: '1.25rem', color: '#FFF1E7', marginBottom: '1rem' }}>
                All Weeks
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {activeGoal.modules.map(m0 => { const module = withFallback(activeGoal, m0); return (
                  <div key={module.id}>
                    {/* Week Card Header */}
                    <div
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        padding: '1rem',
                        border: `1px solid ${module.isCompleted ? 'rgba(94, 205, 125, 0.3)' : module.isUnlocked ? 'rgba(104, 109, 202, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                        cursor: module.isUnlocked ? 'pointer' : 'default',
                        transition: 'all 0.2s',
                        opacity: module.isUnlocked ? 1 : 0.6,
                        borderBottomLeftRadius: expandedWeeks.has(module.weekNumber) ? '0' : '8px',
                        borderBottomRightRadius: expandedWeeks.has(module.weekNumber) ? '0' : '8px'
                      }}
                      onClick={() => {
                        const next = new Set(expandedWeeks);
                        if (next.has(module.weekNumber)) {
                          next.delete(module.weekNumber);
                        } else {
                          next.add(module.weekNumber);
                        }
                        setExpandedWeeks(next);
                      }}
                      onMouseEnter={(e) => {
                        if (module.isUnlocked) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (module.isUnlocked) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div style={{ flex: 1 }}>
                          <h5 style={{ margin: 0, fontSize: '1rem', color: '#FFF1E7', marginBottom: '0.25rem' }}>
                            Week {module.weekNumber}
                          </h5>
                          <p style={{ margin: 0, color: '#FFF1E7', opacity: 0.7, fontSize: '0.85rem' }}>
                            {module.title}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          {module.isCompleted && (
                            <span style={{
                              background: '#5ECD7D',
                              color: '#22202F',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}>
                              ✓ Complete
                            </span>
                          )}
                          {!module.isUnlocked && (
                            <span style={{
                              background: '#686DCA',
                              color: '#FFF1E7',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}>
                              🔒 Locked
                            </span>
                          )}
                          {module.isUnlocked && (
                            <span style={{
                              color: '#FFF1E7',
                              fontSize: '1rem',
                              transition: 'transform 0.2s',
                              transform: expandedWeeks.has(module.weekNumber) ? 'rotate(180deg)' : 'rotate(0deg)',
                              cursor: 'pointer',
                              userSelect: 'none'
                            }}>
                              ▼
                            </span>
                          )}
                        </div>
                      </div>

                      <p style={{ margin: 0, color: '#FFF1E7', opacity: 0.8, fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                        {module.description}
                      </p>

                      {(module.isUnlocked || expandedWeeks.has(module.weekNumber)) && (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                            <span style={{ color: '#FFF1E7', fontSize: '0.75rem' }}>Tasks</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ color: '#686DCA', fontSize: '0.75rem' }}>
                                {module.tasks.filter(t => t.isCompleted).length}/{module.tasks.length}
                              </span>
                              <span style={{ color: '#FFF1E7', opacity: 0.5, fontSize: '0.7rem' }}>
                                Click to expand
                              </span>
                            </div>
                          </div>
                          <div style={{ 
                            width: '100%', 
                            height: '3px', 
                            background: 'rgba(255, 255, 255, 0.1)', 
                            borderRadius: '2px' 
                          }}>
                            <div style={{
                              width: `${module.tasks.length > 0 ? (module.tasks.filter(t => t.isCompleted).length / module.tasks.length) * 100 : 0}%`,
                              height: '100%',
                              background: '#686DCA',
                              borderRadius: '2px',
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Week Dropdown Content */}
                    {expandedWeeks.has(module.weekNumber) && (module.isUnlocked) && (
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '0 0 8px 8px',
                        border: `1px solid ${module.isCompleted ? 'rgba(94, 205, 125, 0.3)' : 'rgba(104, 109, 202, 0.3)'}`,
                        borderTop: 'none',
                        padding: '1rem',
                        animation: 'slideDown 0.3s ease-out'
                      }}>
                        {/* Intro (template) */}
                        {activeGoal.title.toLowerCase().includes('improve social media') && (
                          <div style={{
                            background: 'rgba(255,241,231,0.05)',
                            border: '1px solid rgba(239,142,129,0.25)',
                            borderRadius: 10,
                            padding: '0.9rem',
                            marginBottom: '0.75rem'
                          }}>
                            <div style={{ color: '#FFF1E7' }}>
                              {module.weekNumber === 1 ? (
                                <>
                                  <div style={{ fontWeight: 700, marginBottom: 6 }}>
                                    {`Hi${profile?.fullName ? `, ${profile.fullName.split(' ')[0]}` : ''},`}
                                  </div>
                                  <p style={{ margin: '0.25rem 0' }}>Welcome to your new quarter of <span style={{ fontStyle: 'italic' }}>Momentum Marketing!</span> 🎉</p>
                                  <p style={{ margin: '0.25rem 0', opacity: 0.9 }}>Over the next 12 weeks, we’ll strengthen your social media presence by focusing on smart strategy, easy systems, and engaging content that reflects the heart of your business.</p>
                                  <p style={{ margin: '0.25rem 0', opacity: 0.9 }}>This week we’re kicking off with a full audit of where you are now, plus a simple week‑long content plan you can follow to build consistency without stress.</p>
                                </>
                              ) : (
                                <>
                                  <div style={{ fontWeight: 700, marginBottom: 6 }}>This week</div>
                                  <p style={{ margin: '0.25rem 0', opacity: 0.9 }}>{module.description || 'Keep your rhythm: plan and ship 3–5 posts with clear intent.'}</p>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                          {/* Week Content */}
                          <div>
                            <h6 style={{ margin: 0, fontSize: '0.9rem', color: '#FFF1E7', marginBottom: '0.75rem', fontWeight: 600 }}>
                              Week Content
                            </h6>
                            <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '1rem', color: '#FFF1E7', lineHeight: '1.6', fontSize: '0.9rem', maxHeight: '300px', overflowY: 'auto' }}>{renderRichContent(module.content)}</div>
                          </div>

                          {/* Week Tasks */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                              <h6 style={{ margin: 0, fontSize: '0.9rem', color: '#FFF1E7', fontWeight: 600 }}>
                                Week Tasks
                              </h6>
                              <div style={{ padding: '0.25rem 0.75rem', background: '#EF8E81', color: '#FFF1E7', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Create Tasks</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }} onClick={handleTaskListClick} data-module-id={module.id} data-goal-id={activeGoal.id}>
                              {module.tasks.map(task => (
                                <div key={task.id} data-task-id={task.id} data-task-title={task.title} data-task-desc={task.description} role="button" tabIndex={0} onKeyDown={(e)=>{ if(e.key==='Enter'||e.key===' ') openInteractiveTask(activeGoal.id, module.id, task.id, task.title, task.description); }} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', border: `1px solid ${task.isCompleted ? 'rgba(94, 205, 125, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`, cursor: 'pointer' }}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleTaskCompletion(activeGoal.id, module.id, task.id);
                                    }}
                                    style={{
                                      width: '18px',
                                      height: '18px',
                                      borderRadius: '50%',
                                      border: `2px solid ${task.isCompleted ? '#5ECD7D' : '#686DCA'}`,
                                      background: task.isCompleted ? '#5ECD7D' : 'transparent',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: 'pointer',
                                      flexShrink: 0,
                                      marginTop: '2px',
                                      padding: 0,
                                      minWidth: '18px',
                                      minHeight: '18px'
                                    }}
                                  >
                                    {task.isCompleted && (
                                      <span style={{ color: '#22202F', fontSize: '10px', fontWeight: 'bold' }}>✓</span>
                                    )}
                                  </button>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ 
                                      color: '#FFF1E7', 
                                      fontSize: '0.9rem', 
                                      fontWeight: 600,
                                      marginBottom: '0.25rem',
                                      textDecoration: task.isCompleted ? 'line-through' : 'none',
                                      opacity: task.isCompleted ? 0.7 : 1
                                    }}>
                                      {task.title}
                                    </div>
                                    <div style={{ 
                                      color: '#FFF1E7', 
                                      opacity: 0.7, 
                                      fontSize: '0.8rem',
                                      marginBottom: '0.25rem'
                                    }}>
                                      {task.description}
                                    </div>
                                    <div style={{ color: '#EF8E81', fontSize: '0.75rem', fontWeight: 600 }}>⏱️ {task.estimatedTime}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Baseline tabs wide (full width) for Social track in All Weeks */}
                        {activeGoal.title.toLowerCase().includes('improve social media') && (
                          <div style={{ marginTop: '0.75rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '0.9rem' }}>
                              <div style={{ display: 'flex', gap: '6px', margin: '0 0 8px' }}>
                                {PLATFORM_KEYS.map(({ key, label }) => (
                                  <button key={key} onClick={() => setSelectedPlatformTab(key)} style={{
                                    padding: '6px 10px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.15)',
                                    background: selectedPlatformTab === key ? '#EF8E81' : 'transparent', color: selectedPlatformTab === key ? '#191628' : '#FFF1E7', cursor: 'pointer', fontWeight: 700
                                  }}>{label}</button>
                                ))}
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                                <label>Followers<input value={baseline[selectedPlatformTab].followers} onChange={e => setBaseline(b => ({ ...b, [selectedPlatformTab]: { ...b[selectedPlatformTab], followers: e.target.value } }))} style={inputBaseStyle} /></label>
                                <label>Avg Likes<input value={baseline[selectedPlatformTab].avgLikes} onChange={e => setBaseline(b => ({ ...b, [selectedPlatformTab]: { ...b[selectedPlatformTab], avgLikes: e.target.value } }))} style={inputBaseStyle} /></label>
                                <label>Avg Comments<input value={baseline[selectedPlatformTab].avgComments} onChange={e => setBaseline(b => ({ ...b, [selectedPlatformTab]: { ...b[selectedPlatformTab], avgComments: e.target.value } }))} style={inputBaseStyle} /></label>
                                <label>Avg Story Views<input value={baseline[selectedPlatformTab].avgStoryViews} onChange={e => setBaseline(b => ({ ...b, [selectedPlatformTab]: { ...b[selectedPlatformTab], avgStoryViews: e.target.value } }))} style={inputBaseStyle} /></label>
                              </div>
                              <div style={{ marginTop: 8 }}>
                                <button onClick={() => { saveBaseline(); }} style={{ padding: '6px 10px' }}>Save baseline</button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );})}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inactive Tracks - Minimized Stack View */}
      {inactiveGoals.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.75rem', color: '#FFF1E7', marginBottom: '1.5rem' }}>
            {shouldDisableTracks ? 'Locked Tracks' : 'Available Tracks'}
          </h2>
          {!shouldDisableTracks && (
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px dashed rgba(255,255,255,0.12)',
              borderRadius: 8,
              padding: '0.75rem 1rem',
              color: '#FFF1E7',
              fontSize: '0.9rem',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'grid', rowGap: '0.25rem' }}>
                <div><strong>🟡 Early Stage</strong>: Still figuring out core audience and message, low or inconsistent visibility.</div>
                <div><strong>🟢 Mid-Stage</strong>: Some traction and a growing customer base, but needs to scale marketing or get more strategic.</div>
                <div><strong>🔵 Growth Stage</strong>: Solid operations, now focused on optimization, expansion, or innovation.</div>
              </div>
            </div>
          )}
          {shouldDisableTracks && (
            <div style={{
              background: 'rgba(239, 142, 129, 0.1)',
              border: '1px solid rgba(239, 142, 129, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
              color: '#EF8E81',
              fontSize: '0.9rem'
            }}>
              🔒 Complete your current track before starting a new one. You're on week {activeGoal?.currentWeek} of {activeGoal?.duration}.
            </div>
          )}
          {isTrackCompleted && (
            <div style={{
              background: 'rgba(94, 205, 125, 0.1)',
              border: '1px solid rgba(94, 205, 125, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
              color: '#5ECD7D',
              fontSize: '0.9rem'
            }}>
              🎉 Congratulations! You've completed your marketing track. You can now start a new track.
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {inactiveGoals.map(goal => (
              <div
                key={goal.id}
                style={{
                  background: shouldDisableTracks ? '#1a1a2a' : '#22202F',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: shouldDisableTracks ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: shouldDisableTracks ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  opacity: shouldDisableTracks ? 0.6 : 1
                }}
                onClick={() => !shouldDisableTracks && handleGoalSelect(goal)}
                onMouseEnter={(e) => {
                  if (!shouldDisableTracks) {
                    e.currentTarget.style.background = '#2a2a3a';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!shouldDisableTracks) {
                    e.currentTarget.style.background = '#22202F';
                  }
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#FFF1E7', marginBottom: '0.25rem' }}>
                      {goal.title}
                    </h3>
                    <div style={{ marginBottom: '0.5rem' }}>
                      {renderStageChips(getStagesForGoal(goal.title))}
                    </div>
                    <p style={{ margin: 0, color: '#FFF1E7', opacity: 0.7, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      {goal.description}
                    </p>
                    {/* Stage legend inline hint could be added here if needed */}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Start Track button clicked for goal:', goal.title, 'shouldDisableTracks:', shouldDisableTracks);
                      console.log('Button click event:', e);
                      console.log('Goal details:', { id: goal.id, title: goal.title, isActive: goal.isActive });
                      if (!shouldDisableTracks) {
                        console.log('Calling startMarketingTrack...');
                        startMarketingTrack(goal);
                      } else {
                        console.log('Track start disabled because shouldDisableTracks is true');
                        console.log('Active goal causing disable:', activeGoal);
                      }
                    }}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: shouldDisableTracks ? 'rgba(255, 255, 255, 0.1)' : '#EF8E81',
                      color: '#FFF1E7',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: shouldDisableTracks ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      transition: 'all 0.2s',
                      opacity: shouldDisableTracks ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!shouldDisableTracks) {
                        e.currentTarget.style.background = '#ffb09e';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!shouldDisableTracks) {
                        e.currentTarget.style.background = '#EF8E81';
                      }
                    }}
                  >
                    {shouldDisableTracks ? '🔒 Locked' : 'Start Track'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Module Details */}
      {selectedModule && selectedModule.isUnlocked && (
        <div style={{
          background: '#191628',
          borderRadius: '12px',
          padding: '2rem',
          border: '1px solid rgba(239, 142, 129, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.75rem', color: '#FFF1E7', marginBottom: '0.5rem' }}>
                Week {selectedModule.weekNumber}: {selectedModule.title}
              </h2>
              <p style={{ margin: 0, color: '#FFF1E7', opacity: 0.7, fontSize: '1rem' }}>
                {selectedModule.description}
              </p>
            </div>
            <button
              onClick={() => setSelectedModule(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#FFF1E7',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '4px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              ×
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Module Content */}
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#FFF1E7', marginBottom: '1rem' }}>
                Week Content
              </h3>
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                padding: '1.5rem',
                color: '#FFF1E7',
                lineHeight: '1.6',
                fontSize: '0.95rem'
              }}>
                {renderRichContent(selectedModule.content)}
              </div>
            </div>

            {/* Module Tasks */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#FFF1E7' }}>
                  Week Tasks
                </h3>
                 {selectedGoal && (<div style={{ padding: '0.5rem 1rem', background: '#EF8E81', color: '#FFF1E7', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600 }}>Create Tasks</div>)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {selectedModule.tasks.map(task => (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      padding: '1rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      border: `1px solid ${task.isCompleted ? 'rgba(94, 205, 125, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`
                    }}
                  >
                    <button
                      onClick={() => selectedGoal && toggleTaskCompletion(selectedGoal.id, selectedModule.id, task.id)}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: `2px solid ${task.isCompleted ? '#5ECD7D' : '#686DCA'}`,
                        background: task.isCompleted ? '#5ECD7D' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}
                    >
                      {task.isCompleted && (
                        <span style={{ color: '#22202F', fontSize: '12px', fontWeight: 'bold' }}>✓</span>
                      )}
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        color: '#FFF1E7', 
                        fontSize: '1rem', 
                        fontWeight: 600,
                        marginBottom: '0.25rem',
                        textDecoration: task.isCompleted ? 'line-through' : 'none',
                        opacity: task.isCompleted ? 0.7 : 1
                      }}>
                        {task.title}
                      </div>
                      <div style={{ 
                        color: '#FFF1E7', 
                        opacity: 0.7, 
                        fontSize: '0.9rem',
                        marginBottom: '0.5rem'
                      }}>
                        {task.description}
                      </div>
                      <div style={{ 
                        color: '#EF8E81', 
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}>
                        ⏱️ {task.estimatedTime}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confetti */}
      {confettiAt > 0 && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99998 }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: 0,
              left: `${(i * 97) % 100}%`,
              width: 8,
              height: 8,
              background: ['#EF8E81','#686DCA','#5ECD7D','#FF9D57'][i % 4],
              borderRadius: 2,
              transform: `translateY(${(Date.now()-confettiAt)/2 + (i*10)}px) rotate(${i*30}deg)`,
              transition: 'transform 0.1s linear'
            }} />
          ))}
        </div>
      )}

      {/* Interactive Task Modal */}
      {interactiveOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '1rem' }} onClick={closeInteractiveTask}>
          <div style={{ width: 'min(860px, 96vw)', height: 'min(88vh, 720px)', background: '#22202F', color: '#FFF1E7', border: '1px solid rgba(239,142,129,0.3)', borderRadius: 12, padding: '1rem 1rem 0.75rem', boxShadow: '0 12px 40px rgba(0,0,0,0.45)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{interactiveTask?.title}</h2>
              <button onClick={closeInteractiveTask} style={{ background: 'transparent', color: '#FFF1E7', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.25rem' }}>
              {(() => { try { console.log('[MarketingTrackPage] render modal for:', interactiveTask?.title); } catch {} return renderInteractiveContentForTask(interactiveTask); })()}
            </div>
          </div>
        </div>
      )}

      {/* Interactive modal implemented above; legacy TaskModal removed */}


    </div>
  );
} 