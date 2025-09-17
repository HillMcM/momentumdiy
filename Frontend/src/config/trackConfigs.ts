import type { Task } from '../types';

export interface TrackConfig {
  slug: string;
  title: string;
  description: string;
  buttonText: string;
  journeyName: string;
  generateTasks: (module: any, goal: any) => Task[];
}

// Local Foot Traffic Track Configuration
const localFootTrafficConfig: TrackConfig = {
  slug: 'local-foot-traffic',
  title: 'Increase Local Foot Traffic',
  description: 'Boost your local business visibility and drive more customers through your doors with our proven 12-week Local Foot Traffic strategy.',
  buttonText: 'Start Local Foot Traffic Track',
  journeyName: 'Local Foot Traffic',
  generateTasks: (module: any, goal: any) => {
    const weekNumber = module.weekNumber;
    const moduleId = module.id;
    
    switch (weekNumber) {
      case 1: // Audit Visibility - 3 tasks
        return [
          {
            id: `${moduleId}-w1-online`,
            title: 'Online Presence Audit',
            description: 'Review and assess your current online presence across all platforms',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w1-online` }
          },
          {
            id: `${moduleId}-w1-baseline`,
            title: 'Baseline Metrics',
            description: 'Establish current performance metrics and benchmarks',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w1-baseline` }
          },
          {
            id: `${moduleId}-w1-photos`,
            title: 'Storefront & Signage Photos',
            description: 'Document current storefront appearance and signage',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w1-photos` }
          }
        ];
      case 2: // Content Strategy - 3 tasks
        return [
          {
            id: `${moduleId}-w2-content`,
            title: 'Content Pillars',
            description: 'Define your core content themes and messaging',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w2-content` }
          },
          {
            id: `${moduleId}-w2-calendar`,
            title: 'Content Calendar',
            description: 'Create your posting schedule and content plan',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w2-calendar` }
          },
          {
            id: `${moduleId}-w2-templates`,
            title: 'Content Templates',
            description: 'Develop reusable templates for consistent posting',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w2-templates` }
          }
        ];
      // Add remaining weeks as needed...
      default:
        return [];
    }
  }
};

// Social Media Strategy Track Configuration
const socialMediaConfig: TrackConfig = {
  slug: 'social-media-strategy',
  title: '🟡🟢 Improve Social Media Strategy & Engagement',
  description: 'Build a consistent social presence that reflects your brand and grows community—through quick wins that stack week over week.',
  buttonText: 'Start Social Media Strategy Track',
  journeyName: 'Social Media Strategy',
  generateTasks: (module: any, goal: any) => {
    const weekNumber = module.weekNumber;
    const moduleId = module.id;
    
    switch (weekNumber) {
      case 1: // Social Audit & Baseline Tracking - 3 tasks
        return [
          {
            id: `${moduleId}-w1-audit`,
            title: 'Run a profile audit',
            description: 'Check your bio, links, and visuals for clarity',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w1-audit` }
          },
          {
            id: `${moduleId}-w1-baseline`,
            title: 'Record baseline metrics',
            description: 'Write down current followers, likes, and story views',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w1-baseline` }
          },
          {
            id: `${moduleId}-w1-posts`,
            title: 'Publish 3 quick-win posts',
            description: 'Share your story, a tip, and a behind-the-scenes look',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w1-posts` }
          }
        ];
      case 2: // Define Your Content Pillars - 3 tasks
        return [
          {
            id: `${moduleId}-w2-pillars`,
            title: 'Select 3–4 content pillars',
            description: 'Choose themes that represent your business',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w2-pillars` }
          },
          {
            id: `${moduleId}-w2-ideas`,
            title: 'Brainstorm 15 content ideas',
            description: 'Write at least 5 ideas per pillar',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w2-ideas` }
          },
          {
            id: `${moduleId}-w2-captions`,
            title: 'Draft 2 sample captions',
            description: 'Put your pillars into practice immediately',
            responsible: 'Hillary',
            deadline: null,
            project: goal.title,
            timeSpent: '',
            notifications: false,
            status: 'todo' as const,
            projectId: undefined,
            marketingTrack: { goalId: goal.id, moduleId: module.id, marketingTaskId: `${moduleId}-w2-captions` }
          }
        ];
      // Add remaining weeks as needed...
      default:
        return [];
    }
  }
};

// Registry of all track configurations
export const trackConfigs: Record<string, TrackConfig> = {
  'local-foot-traffic': localFootTrafficConfig,
  'social-media-strategy': socialMediaConfig,
};

// Helper function to get track config by slug
export function getTrackConfig(slug: string): TrackConfig | undefined {
  return trackConfigs[slug];
}

// Helper function to get track config by goal title
export function getTrackConfigByTitle(title: string): TrackConfig | undefined {
  const lowerTitle = title.toLowerCase();
  
  // Check for specific track patterns
  if (lowerTitle.includes('foot traffic') || lowerTitle.includes('local foot traffic')) {
    return trackConfigs['local-foot-traffic'];
  }
  
  if (lowerTitle.includes('social media') || lowerTitle.includes('improve social media')) {
    return trackConfigs['social-media-strategy'];
  }
  
  // Fallback to original logic
  const slug = Object.keys(trackConfigs).find(key => {
    const config = trackConfigs[key];
    return lowerTitle.includes(key.replace('-', ' ')) || 
           title === config.title;
  });
  return slug ? trackConfigs[slug] : undefined;
}
