/**
 * Agent Definitions - Clear job descriptions and triggers for all agents
 * 
 * This module defines what each agent does, when it should be called,
 * and how it can be used independently or as part of workflows.
 */

const AGENT_DEFINITIONS = {
  'market-researcher': {
    id: 'market-researcher',
    name: 'Market Researcher',
    job: 'Research marketing trends, topics, and opportunities relevant to small local businesses',
    
    purpose: [
      'Identify trending topics in small business marketing',
      'Discover what local business owners are struggling with',
      'Find content opportunities and gaps in existing advice',
      'Provide fresh research data for content creation',
      'Keep content relevant and timely'
    ],
    
    triggers: {
      scheduled: {
        frequency: 'Weekly (every Monday at 8 AM EST)',
        reason: 'Keep research fresh and identify weekly content opportunities'
      },
      onDemand: {
        when: [
          'Need new content ideas',
          'Want to explore a specific topic',
          'Research is older than 7 days',
          'Looking for trending topics'
        ]
      }
    },
    
    input: {
      required: [],
      optional: [
        'timeframe (default: 7d)',
        'focusAreas (specific topics to research)',
        'targetIndustry (cafe, salon, etc.)'
      ]
    },
    
    output: {
      type: 'Research report',
      includes: [
        'Trending topics (3-5 ideas)',
        'Competitor insights',
        'Market opportunities',
        'Content gaps',
        'Recommended focus areas'
      ],
      savedTo: 'Research database for future reference'
    },
    
    canRunIndependently: true,
    estimatedTime: '2-3 minutes',
    resourceUsage: 'Moderate (News API, SERP API, OpenAI)'
  },

  'copywriting-agent': {
    id: 'copywriting-agent',
    name: 'Copywriting Agent',
    job: 'Create high-quality blog posts, emails, and marketing copy in Hillary\'s friendly, casual voice',
    
    purpose: [
      'Write comprehensive blog posts (1200-2000 words)',
      'Create email campaigns and sequences',
      'Generate landing page copy',
      'Produce educational content',
      'Maintain consistent brand voice across all content'
    ],
    
    triggers: {
      scheduled: {
        frequency: 'Weekly (every Tuesday after Market Research)',
        reason: 'Create one focused blog post per week based on research'
      },
      onDemand: {
        when: [
          'Need a blog post on a specific topic',
          'Creating an email campaign',
          'Writing landing page copy',
          'Repurposing old content'
        ]
      }
    },
    
    input: {
      required: [
        'Content type (blog-post, email, landing-page)',
        'Topic or subject'
      ],
      optional: [
        'Research data from Market Researcher',
        'Target audience specifics',
        'Desired length',
        'Specific angle or perspective'
      ]
    },
    
    output: {
      type: 'Written content',
      includes: [
        'Blog post (1200-2000 words) OR',
        'Email content OR',
        'Landing page copy',
        'SEO-optimized title and meta description',
        'Suggested hashtags or keywords'
      ],
      savedTo: 'Wix blog as draft (for blog posts)'
    },
    
    canRunIndependently: true,
    estimatedTime: '3-5 minutes',
    resourceUsage: 'High (OpenAI tokens for long-form content)'
  },

  'social-content-agent': {
    id: 'social-content-agent',
    name: 'Social Content Agent',
    job: 'Repurpose blog content into platform-specific social media posts',
    
    purpose: [
      'Convert blog posts into social media content',
      'Create platform-specific posts (Facebook, Instagram, LinkedIn, X)',
      'Generate appropriate hashtags for each platform',
      'Create captions that match platform best practices',
      'Generate enhanced image prompts using Gemini'
    ],
    
    triggers: {
      scheduled: {
        frequency: 'Weekly (every Wednesday after blog post creation)',
        reason: 'Repurpose the week\'s blog post into 4+ social posts'
      },
      onDemand: {
        when: [
          'Have blog content to repurpose',
          'Need social posts for a campaign',
          'Creating platform-specific content',
          'Batch creating social content'
        ]
      }
    },
    
    input: {
      required: [
        'Blog post content OR topic'
      ],
      optional: [
        'Specific platforms (default: all)',
        'Campaign theme',
        'Additional context',
        'Specific angle for each platform'
      ]
    },
    
    output: {
      type: 'Social media posts',
      includes: [
        'Facebook post (50-150 words, 2-3 hashtags)',
        'Instagram post (100-200 words, 10-15 hashtags)',
        'LinkedIn post (150-250 words, 3-5 hashtags)',
        'X post (100-280 chars, 1-2 hashtags)',
        'Enhanced image prompts for each platform',
        'Platform-specific captions and CTAs'
      ],
      savedTo: 'Approval database with status: pending'
    },
    
    canRunIndependently: true,
    dependsOn: ['copywriting-agent (for best results)'],
    estimatedTime: '2-4 minutes',
    resourceUsage: 'Moderate (OpenAI + Gemini for image prompts)'
  },

  'social-posting-agent': {
    id: 'social-posting-agent',
    name: 'Social Posting Agent',
    job: 'Post approved social content to platforms via Buffer at optimal times',
    
    purpose: [
      'Schedule approved posts to Buffer',
      'Post at platform-specific optimal times',
      'Manage posting across all platforms',
      'Track what\'s been posted',
      'Ensure consistent posting schedule'
    ],
    
    triggers: {
      scheduled: {
        frequency: 'Thursday-Sunday (after content approval)',
        reason: 'Post approved content at optimal times throughout the week'
      },
      onDemand: {
        when: [
          'Have approved social posts ready',
          'Need to schedule specific content',
          'Batch scheduling posts',
          'Urgent post needed'
        ]
      }
    },
    
    input: {
      required: [
        'Approved social posts (status: approved)'
      ],
      optional: [
        'Specific posting times',
        'Platform priority',
        'Immediate vs scheduled'
      ]
    },
    
    output: {
      type: 'Posted content',
      includes: [
        'Confirmation of Buffer scheduling',
        'Post IDs and timestamps',
        'Scheduled times for each platform',
        'Posting status'
      ],
      savedTo: 'Post history log'
    },
    
    canRunIndependently: true,
    dependsOn: ['social-content-agent', 'Manual approval'],
    estimatedTime: '1-2 minutes',
    resourceUsage: 'Low (Buffer API calls only)',
    requiresApproval: true
  },

  'cmo-brain': {
    id: 'cmo-brain',
    name: 'CMO Brain',
    job: 'Strategic thinking, priority setting, and workflow orchestration',
    
    purpose: [
      'Analyze business data and determine priorities',
      'Make strategic marketing decisions',
      'Orchestrate multi-agent workflows',
      'Provide comprehensive recommendations',
      'Learn from past decisions and outcomes'
    ],
    
    triggers: {
      scheduled: {
        frequency: 'As needed for strategic planning',
        reason: 'Coordinate major workflows and strategic decisions'
      },
      onDemand: {
        when: [
          'Need strategic analysis',
          'Planning quarterly goals',
          'Determining priorities',
          'Coordinating multiple agents',
          'Making complex marketing decisions'
        ]
      }
    },
    
    input: {
      required: [
        'Business data and context'
      ],
      optional: [
        'Specific strategic question',
        'Historical data',
        'Current priorities',
        'Constraints or goals'
      ]
    },
    
    output: {
      type: 'Strategic analysis and recommendations',
      includes: [
        'Top 3 priorities',
        'Strategic insights',
        'Recommendations with implementation steps',
        'Risk assessment',
        'Expected outcomes'
      ]
    },
    
    canRunIndependently: true,
    estimatedTime: '3-5 minutes',
    resourceUsage: 'High (OpenAI for strategic analysis)'
  },

  'data-analyst-agent': {
    id: 'data-analyst-agent',
    name: 'Data Analyst',
    job: 'Analyze business metrics and provide actionable insights',
    
    purpose: [
      'Gather data from Google Analytics, Search Console, Meta Business Suite',
      'Analyze website traffic and user behavior',
      'Track social media performance',
      'Identify trends and patterns',
      'Provide data-driven recommendations'
    ],
    
    triggers: {
      scheduled: {
        frequency: 'As needed by other agents',
        reason: 'Provide current business data for decision-making'
      },
      onDemand: {
        when: [
          'Need current business metrics',
          'Analyzing performance',
          'Creating reports',
          'Making data-driven decisions'
        ]
      }
    },
    
    input: {
      required: [],
      optional: [
        'Specific metrics to analyze',
        'Date range',
        'Comparison periods'
      ]
    },
    
    output: {
      type: 'Data analysis report',
      includes: [
        'Current metrics (traffic, engagement, conversions)',
        'Trends and patterns',
        'Insights and observations',
        'Recommendations based on data'
      ]
    },
    
    canRunIndependently: true,
    estimatedTime: '2-3 minutes',
    resourceUsage: 'Low (API calls to analytics platforms)'
  },

  'lead-sales-agent': {
    id: 'lead-sales-agent',
    name: 'Lead & Sales Agent',
    job: 'Lead generation, scoring, and sales optimization',
    
    purpose: [
      'Score and qualify leads',
      'Generate personalized outreach emails',
      'Optimize conversion funnels',
      'Track sales performance',
      'Provide sales insights'
    ],
    
    triggers: {
      scheduled: {
        frequency: 'As needed',
        reason: 'Process new leads and optimize sales funnel'
      },
      onDemand: {
        when: [
          'New leads to process',
          'Creating outreach campaigns',
          'Optimizing sales funnel',
          'Analyzing conversion rates'
        ]
      }
    },
    
    input: {
      required: [
        'Lead data OR sales funnel data'
      ],
      optional: [
        'Specific criteria for lead scoring',
        'Campaign parameters',
        'Historical conversion data'
      ]
    },
    
    output: {
      type: 'Lead analysis and outreach',
      includes: [
        'Lead scores (0-100)',
        'Personalized email templates',
        'Sales funnel insights',
        'Conversion recommendations'
      ]
    },
    
    canRunIndependently: true,
    estimatedTime: '2-4 minutes',
    resourceUsage: 'Moderate (OpenAI for email generation)'
  }
};

// Helper functions
const getAgentDefinition = (agentId) => {
  return AGENT_DEFINITIONS[agentId] || null;
};

const getAllAgentDefinitions = () => {
  return AGENT_DEFINITIONS;
};

const getIndependentAgents = () => {
  return Object.values(AGENT_DEFINITIONS).filter(agent => agent.canRunIndependently);
};

const getAgentsByTrigger = (triggerType) => {
  return Object.values(AGENT_DEFINITIONS).filter(agent => 
    agent.triggers[triggerType] !== undefined
  );
};

const getWeeklyWorkflowAgents = () => {
  return [
    'market-researcher',    // Monday
    'copywriting-agent',    // Tuesday
    'social-content-agent', // Wednesday
    'social-posting-agent'  // Thursday-Sunday
  ];
};

module.exports = {
  AGENT_DEFINITIONS,
  getAgentDefinition,
  getAllAgentDefinitions,
  getIndependentAgents,
  getAgentsByTrigger,
  getWeeklyWorkflowAgents
};


