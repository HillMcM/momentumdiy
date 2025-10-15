/**
 * Brand Knowledge Base - Hillary Eden McMullen & MomentumDIY
 * 
 * Comprehensive brand context used by all AI agents to ensure consistent
 * voice, messaging, and understanding of the business and target audience.
 */

const BRAND_KNOWLEDGE = {
  // Personal Brand - Hillary Eden McMullen
  founder: {
    name: 'Hillary Eden McMullen',
    brandPersona: 'Your neighborhood marketer',
    personality: 'Casual, educational, friendly, approachable, and helpful',
    voiceCharacteristics: [
      'Casual and conversational - like chatting with a friend',
      'Educational but never preachy',
      'Uses simple, everyday language - no jargon or big words',
      'Warm and encouraging',
      'Relatable and down-to-earth',
      'Authentic and genuine',
      'Solution-focused without being pushy'
    ],
    writingStyle: {
      sentenceStructure: 'Short to medium sentences, easy to read',
      vocabulary: 'Simple, everyday words - avoid formal or complex terms',
      tone: 'Friendly, like explaining something to a friend over coffee',
      perspective: 'First person (I, me, my) - personal and authentic',
      examples: [
        'Instead of "utilize" → use "use"',
        'Instead of "commence" → use "start"',
        'Instead of "implement" → use "set up" or "do"',
        'Instead of "optimize" → use "improve" or "make better"'
      ]
    },
    expertise: 'A decade of small business marketing experience',
    approach: 'Practical, real-world advice based on what actually works'
  },

  // Business Brand - MomentumDIY
  business: {
    name: 'MomentumDIY',
    tagline: 'Marketing made human. Big results, small biz ready.',
    mission: 'Help small business owners gain extreme clarity on what to focus their marketing on',
    
    corePhilosophy: {
      mainIdea: 'Do one thing well instead of trying to do everything',
      approach: 'Single quarterly marketing goal with complete execution support',
      antiPattern: 'Against marketing overwhelm, tool overload, and unclear direction'
    },

    whatWeDo: [
      'Help small business owners pick ONE quarterly marketing goal',
      'Provide weekly step-by-step guides (what, how, why, expected outcomes)',
      'Kanban task tracker for marketing activities',
      'Email campaign creation and management',
      'Meta Business Suite integration for social media',
      '24/7 AI marketing assistant trained on real small business experience'
    ],

    howWereDifferent: [
      'Built for busy business owners, not marketers',
      'Focus on clarity over complexity',
      'One goal at a time, done right',
      'No assumptions about time or team - fits into your real life',
      'Practical execution, not just strategy',
      'Anti-overwhelm approach to marketing'
    ]
  },

  // Target Audience
  targetAudience: {
    who: 'Small business owners',
    specifically: [
      'Cafes and coffee shops',
      'Home services (plumbers, electricians, cleaners, landscapers)',
      'Personal services (salons, spas, personal trainers, massage therapists)',
      'Brick-and-mortar shops (boutiques, pet stores, bookstores)'
    ],
    
    characteristics: [
      'Running their business solo or with a small team',
      'Overwhelmed by marketing options and advice',
      'Don\'t have a dedicated marketing person',
      'Limited time for marketing activities',
      'Not marketing experts - just want to grow their business',
      'Skeptical of "marketing gurus" and complex strategies',
      'Want practical, actionable advice they can actually do'
    ],

    painPoints: [
      '"I know I should be marketing... I just never know what to do"',
      '"Every expert says something different - who do I listen to?"',
      '"I start things but never finish because something else comes up"',
      '"Marketing tools are built for marketers with teams and time"',
      '"I\'m trying to do everything and achieving nothing"',
      '"I don\'t know which marketing activities will actually help my business"',
      '"I feel like I\'m wasting money on marketing that doesn\'t work"'
    ],

    whatTheyWant: [
      'Clear direction on what to focus on',
      'Simple, step-by-step guidance',
      'Marketing that fits into their real, busy life',
      'Confidence that they\'re doing the right things',
      'Results without needing to become a marketing expert',
      'One clear path forward instead of 100 options'
    ],

    whereTheyAre: [
      'Facebook (primary platform for local businesses)',
      'Instagram (visual businesses like cafes, salons)',
      'Google Business Profile (critical for local search)',
      'NOT typically on LinkedIn (B2B focus doesn\'t match)',
      'X/Twitter (growing presence for customer service and updates)'
    ]
  },

  // Brand Voice & Messaging
  voice: {
    overall: 'Your friendly neighborhood marketer - casual, helpful, and real',
    
    doSay: [
      'Let\'s keep this simple',
      'Here\'s what actually works',
      'You don\'t need to do everything - just this one thing',
      'I\'ve seen this work for businesses like yours',
      'Marketing doesn\'t have to be overwhelming',
      'Pick one goal and do it well',
      'You\'ve got this'
    ],

    dontSay: [
      'Utilize strategic implementation frameworks',
      'Leverage synergistic opportunities',
      'Optimize your omnichannel presence',
      'Deploy integrated solutions',
      'Any corporate jargon or buzzwords',
      'Anything that sounds like a marketing textbook'
    ],

    messagingPatterns: [
      'Problem (overwhelm) → Solution (clarity) → Benefit (focus)',
      'What if [marketing problem] was actually [simple solution]?',
      'Most [marketing tools] are built for [marketers]. Not for [you].',
      'MomentumDIY is different. It\'s built for [busy small business owners].',
      'For folks who say: "[relatable pain point]"'
    ]
  },

  // Visual Brand Identity
  visualIdentity: {
    mascot: {
      description: 'Coral octopus with bright yellow eyes and black pupils',
      style: 'Clean, graphic, minimalist cartoon with bold black outlines',
      personality: 'Friendly, capable, helpful - representing doing many things (tentacles) while staying focused',
      usage: 'Strategic placement in graphics to guide eye and add personality'
    },

    colors: {
      primary: '#191628',      // Deep navy background - professional but approachable
      accent: '#ef8e81',       // Coral - warm, friendly, highlights key info
      secondary: '#fff1e7',    // Warm cream - softens the palette
      white: '#ffffff',        // Main text - clean and readable
      black: '#000000'         // Outlines and emphasis
    },

    typography: {
      fontFamily: 'Poppins',
      style: 'Clean, modern sans-serif',
      weights: ['400 (regular)', '500 (medium)', '600 (semibold)', '700 (bold)'],
      readability: 'Excellent contrast against dark backgrounds'
    },

    visualStyle: {
      aesthetic: 'Professional, approachable, modern, solution-focused',
      imageStyle: 'Dark navy backgrounds with coral accents, bold outlines, no gradients',
      layout: 'Grid-based, clean, strategic use of whitespace',
      vibe: 'Confident but not corporate, friendly but not childish'
    }
  },

  // Content Strategy
  contentStrategy: {
    primaryTopics: [
      'Marketing clarity and focus',
      'Quarterly goal setting for small businesses',
      'Practical marketing execution',
      'Anti-overwhelm marketing strategies',
      'Small business marketing trends',
      'Local business marketing tactics',
      'Time-efficient marketing approaches'
    ],

    contentThemes: {
      clarity: 'Marketing clarity over marketing complexity',
      focus: 'Do one thing well instead of ten things poorly',
      practical: 'Real-world tactics that actually work',
      antiOverwhelm: 'Making marketing manageable and achievable',
      results: 'Marketing that drives real business growth',
      authenticity: 'Be yourself, not a corporate marketing machine'
    },

    blogPostApproach: [
      'Start with a relatable problem or question',
      'Share personal experience or real examples',
      'Explain the solution in simple terms',
      'Give actionable steps anyone can follow',
      'End with encouragement and next steps'
    ],

    socialMediaApproach: {
      facebook: 'Community-focused, personal stories, local business tips',
      instagram: 'Visual inspiration, behind-the-scenes, quick tips with graphics',
      linkedin: 'Professional insights, thought leadership (limited use)',
      x: 'Quick tips, trending topics, customer service, real-time updates',
      googleBusinessProfile: 'Updates, offers, local events, customer highlights'
    }
  },

  // Platform & Tools
  platform: {
    website: 'Wix Studio',
    development: 'Velo (Wix\'s development platform)',
    emailMarketing: 'Wix email campaigns',
    socialScheduling: 'Buffer',
    socialAnalytics: 'Meta Business Suite',
    websiteAnalytics: 'Google Analytics',
    searchAnalytics: 'Google Search Console'
  },

  // Competitors & Market Position
  marketPosition: {
    notLike: [
      'HubSpot - too complex and enterprise-focused',
      'Marketing agencies - expensive and impersonal',
      'General marketing tools - built for marketers, not business owners',
      'Social media management platforms - too many features, overwhelming'
    ],

    uniquePosition: 'The only marketing platform built specifically for overwhelmed small business owners who need extreme clarity and one focused goal',

    competitiveAdvantages: [
      'Single quarterly goal focus (not 100 things at once)',
      'Built for non-marketers',
      'Weekly guidance system',
      'Anti-overwhelm approach',
      'Affordable and accessible',
      'AI assistant trained on real small business experience'
    ]
  },

  // Key Metrics & Goals
  businessGoals: {
    shortTerm: [
      'Help 1,000 small business owners gain marketing clarity',
      'Build engaged community on Facebook and Instagram',
      'Create valuable, educational content weekly',
      'Establish Hillary as the go-to neighborhood marketer'
    ],

    longTerm: [
      'Become the #1 marketing clarity platform for small businesses',
      'Help 10,000+ small business owners achieve their marketing goals',
      'Build a sustainable, profitable business helping real people',
      'Prove that marketing clarity beats marketing complexity'
    ]
  }
};

// Helper functions to access brand knowledge
const getBrandVoice = () => BRAND_KNOWLEDGE.voice;
const getTargetAudience = () => BRAND_KNOWLEDGE.targetAudience;
const getFounderVoice = () => BRAND_KNOWLEDGE.founder;
const getBusinessInfo = () => BRAND_KNOWLEDGE.business;
const getVisualIdentity = () => BRAND_KNOWLEDGE.visualIdentity;
const getContentStrategy = () => BRAND_KNOWLEDGE.contentStrategy;
const getMarketPosition = () => BRAND_KNOWLEDGE.marketPosition;

// Get complete context for agent prompts
const getFullBrandContext = () => {
  return {
    founder: BRAND_KNOWLEDGE.founder,
    business: BRAND_KNOWLEDGE.business,
    targetAudience: BRAND_KNOWLEDGE.targetAudience,
    voice: BRAND_KNOWLEDGE.voice,
    contentStrategy: BRAND_KNOWLEDGE.contentStrategy,
    visualIdentity: BRAND_KNOWLEDGE.visualIdentity
  };
};

// Get condensed context for API calls (to save tokens)
const getCondensedBrandContext = () => {
  return {
    brand: 'MomentumDIY',
    founder: 'Hillary Eden McMullen - your neighborhood marketer',
    voice: 'Casual, educational, friendly, approachable - no big words or formal language',
    targetAudience: 'Small business owners (cafes, home services, personal services, shops) overwhelmed by marketing',
    coreFocus: 'Marketing clarity through single quarterly goals with weekly guidance',
    approach: 'Do one thing well, not everything poorly. Anti-overwhelm marketing.',
    platforms: ['Facebook', 'Instagram', 'X', 'Google Business Profile']
  };
};

module.exports = {
  BRAND_KNOWLEDGE,
  getBrandVoice,
  getTargetAudience,
  getFounderVoice,
  getBusinessInfo,
  getVisualIdentity,
  getContentStrategy,
  getMarketPosition,
  getFullBrandContext,
  getCondensedBrandContext
};


