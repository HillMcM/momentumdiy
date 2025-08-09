import { useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { MarketingGoal, MarketingModule, Task, Project, TaskStatus } from './types';
// TaskModal not used in this iteration
// Removed mockData usage to avoid placeholder content
import { apiService } from './services/api';

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
  const [expandedWeeks] = useState<Set<number>>(new Set());
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
  const [pillars, setPillars] = useState<string[]>(['', '', '', '']);
  const [pillarsSaved, setPillarsSaved] = useState<boolean>(false);
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

  const savePillars = async () => {
    const trimmed = pillars.map(p => p.trim()).filter(Boolean);
    const resp = await apiService.saveContentPillars(trimmed);
    if (resp.success) setPillarsSaved(true);
  };

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
          setPillarsSaved(cp.data.length > 0);
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
    const lines = text.split('\n');
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

  // Fallback: use mock generator content/tasks when backend modules are empty
  const withFallback = (_goal: MarketingGoal, module: MarketingModule): MarketingModule => module;

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {PLATFORM_KEYS.map(({ key, label }) => (
              <div key={key} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '0.9rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#FFF1E7' }}>{label}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                  <label style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                    Followers
                    <input value={baseline[key].followers} onChange={e => setBaseline(b => ({ ...b, [key]: { ...b[key], followers: e.target.value } }))} style={inputBaseStyle} />
                  </label>
                  <label style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                    Avg Likes
                    <input value={baseline[key].avgLikes} onChange={e => setBaseline(b => ({ ...b, [key]: { ...b[key], avgLikes: e.target.value } }))} style={inputBaseStyle} />
                  </label>
                  <label style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                    Avg Comments
                    <input value={baseline[key].avgComments} onChange={e => setBaseline(b => ({ ...b, [key]: { ...b[key], avgComments: e.target.value } }))} style={inputBaseStyle} />
                  </label>
                  <label style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                    Avg Story Views
                    <input value={baseline[key].avgStoryViews} onChange={e => setBaseline(b => ({ ...b, [key]: { ...b[key], avgStoryViews: e.target.value } }))} style={inputBaseStyle} />
                  </label>
                </div>
              </div>
            ))}
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
    if (lower.includes('content pillars') || lower.includes('choose your content pillars')) {
      return (
        <div>
          <h2 style={{ marginTop: 0 }}>{t.title}</h2>
          <p style={{ opacity: 0.85 }}>{t.description}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {pillars.map((p, idx) => (
              <label key={idx}>
                Pillar {idx + 1}
                <input value={p} onChange={e => setPillars(arr => { const next = [...arr]; next[idx] = e.target.value; return next; })} style={inputBaseStyle} />
              </label>
            ))}
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button onClick={savePillars} disabled={loadingInline} style={{ padding: '0.4rem 0.9rem' }}>Save</button>
            {pillarsSaved && <span style={{ color: '#5ECD7D' }}>Saved</span>}
            {inlineError && <span style={{ color: '#EF8E81' }}>{inlineError}</span>}
            <span style={{ marginLeft: 'auto' }} />
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
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 700, color: '#FFF1E7', marginBottom: '0.5rem' }}>
          Marketing Tracks
        </h1>
        <p style={{ margin: 0, color: '#FFF1E7', opacity: 0.7, fontSize: '1.1rem' }}>
          Strategic 12-week marketing programs designed for your industry
        </p>
      </div>

      {/* Active Track - Full Width Highlight */}
      {activeGoal && (
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.75rem', color: '#FFF1E7', marginBottom: '1.5rem' }}>
            Active Track
          </h2>
          <div style={{
            background: '#22202F',
            borderRadius: '16px',
            padding: '2rem',
            border: '2px solid rgba(239, 142, 129, 0.3)',
            boxShadow: '0 8px 32px rgba(239, 142, 129, 0.1)',
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
                <span style={{ 
                  color: '#EF8E81', 
                  fontSize: '0.875rem',
                  background: 'rgba(239, 142, 129, 0.1)',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  display: 'inline-block'
                }}>
                  {activeGoal.industry}
                </span>
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
            <div style={{ marginBottom: '2rem' }}>
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

            {/* Current Week Module */}
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
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
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
                            maxHeight: '300px',
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
                            <div style={{ padding: '0.25rem 0.75rem', background: '#EF8E81', color: '#FFF1E7', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Create Tasks</div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }} onClick={handleTaskListClick} data-module-id={module.id} data-goal-id={activeGoal.id}>
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
                    </div>
                  )}
                </div>
              );})}
            </div>

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
                      onClick={() => { /* collapsed weeks feature disabled in this iteration */ }}
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

                      {module.isUnlocked && (
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
                    {expandedWeeks.has(module.weekNumber) && module.isUnlocked && (
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '0 0 8px 8px',
                        border: `1px solid ${module.isCompleted ? 'rgba(94, 205, 125, 0.3)' : 'rgba(104, 109, 202, 0.3)'}`,
                        borderTop: 'none',
                        padding: '1rem',
                        animation: 'slideDown 0.3s ease-out'
                      }}>
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
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#FFF1E7', marginBottom: '0.5rem' }}>
                      {goal.title}
                    </h3>
                    <p style={{ margin: 0, color: '#FFF1E7', opacity: 0.7, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      {goal.description}
                    </p>
                    <span style={{ 
                      color: '#EF8E81', 
                      fontSize: '0.875rem',
                      background: 'rgba(239, 142, 129, 0.1)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      display: 'inline-block'
                    }}>
                      {goal.industry}
                    </span>
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