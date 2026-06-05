/**
 * Contextual prompts and examples for the AI assistant based on current page
 */

export interface PagePrompts {
  quickPrompts: string[];
  examples: string[];
  description: string;
}

export const pagePrompts: Record<string, PagePrompts> = {
  '/app': {
    description: 'Get help with your dashboard and overall marketing strategy',
    quickPrompts: [
      'What should I focus on first today?',
      'Summarize what\'s most behind schedule',
      'Help me prioritize my tasks'
    ],
    examples: [
      'What\'s the most important thing I should work on right now?',
      'Give me a quick overview of my marketing progress',
      'Help me understand what tasks are overdue'
    ]
  },
  '/app/marketing-track': {
    description: 'Get help understanding and completing your marketing track',
    quickPrompts: [
      'Explain this week\'s concept in simple terms',
      'What\'s the next step to make progress today?',
      'Help me understand this week\'s tasks'
    ],
    examples: [
      'Break down this week\'s marketing concept for me',
      'How should I approach this week\'s action items?',
      'What does this week\'s content mean for my business?',
      'I\'m stuck on a task - can you help me get unstuck?'
    ]
  },
  '/app/task-tracker': {
    description: 'Get help organizing and prioritizing your tasks',
    quickPrompts: [
      'Help me break this task into smaller steps',
      'Which tasks should I prioritize today?',
      'How should I organize my tasks?'
    ],
    examples: [
      'How can I make this task more manageable?',
      'What\'s the best way to prioritize my task list?',
      'Help me estimate how long this task will take',
      'Suggest ways to improve my task workflow'
    ]
  },
  '/app/profile': {
    description: 'Get help setting up and optimizing your business profile',
    quickPrompts: [
      'How can I improve my business profile?',
      'What metrics should I track?',
      'Help me set realistic goals'
    ],
    examples: [
      'What baseline metrics are most important for my business?',
      'How do I determine my target market?',
      'Help me define my marketing goals'
    ]
  },
  '/app/social-generator': {
    description: 'Get help creating and refining your social media content',
    quickPrompts: [
      'Help me write a better social media post',
      'What should I post about this week?',
      'How can I improve my brand voice?'
    ],
    examples: [
      'Generate ideas for social media posts this week',
      'Help me refine my brand voice and messaging',
      'What type of content works best for my industry?'
    ]
  },
  '/app/ai-marketing-assistant': {
    description: 'Get comprehensive marketing strategy advice',
    quickPrompts: [
      'Help me create a marketing strategy',
      'What marketing channels should I focus on?',
      'How can I improve my marketing ROI?'
    ],
    examples: [
      'Create a 90-day marketing plan for my business',
      'Help me choose the right marketing channels',
      'What\'s the best marketing approach for my industry?',
      'Help me understand which marketing tactics work best for local businesses'
    ]
  }
};

/**
 * Get contextual prompts for the current page
 */
export function getPagePrompts(pathname: string): PagePrompts {
  // Try exact match first
  if (pagePrompts[pathname]) {
    return pagePrompts[pathname];
  }

  // Try partial matches
  for (const [path, prompts] of Object.entries(pagePrompts)) {
    if (pathname.startsWith(path)) {
      return prompts;
    }
  }

  // Default prompts
  return {
    description: 'Get help with MomentumDIY',
    quickPrompts: [
      'What can I do on this page?',
      'How can I be more productive?'
    ],
    examples: [
      'Help me understand how to use this feature',
      'What\'s the best way to get started?'
    ]
  };
}

/**
 * Common marketing prompts that work across all pages
 */
export const commonPrompts = [
  'How can I grow my local business?',
  'What marketing tactics work best for small businesses?',
  'Help me create a marketing calendar',
  'How do I improve my social media engagement?',
  'What should I focus on this quarter?',
  'Help me understand my target audience better',
  'How can I track my marketing ROI?',
  'What marketing mistakes should I avoid?'
];

