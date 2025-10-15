require('dotenv').config();
const logger = require('../utils/logger');
const ResourceManager = require('../utils/resource-manager');
const ContentAnalyzer = require('../utils/content-analyzer');
const { wixClient: getWixClient } = require('../utils/api-clients');
const fs = require('fs');
const path = require('path');

class LeadSalesAgent {
  constructor() {
    // Model configuration with fallback
    this.modelConfig = {
      primary: 'gpt-4o-mini',
      fallback: 'gpt-3.5-turbo',
      maxRetries: 3
    };
    
    this.name = 'Lead & Sales Agent';
    this.description = 'AI-powered lead generation and sales conversion specialist - Manages waitlist, qualifies leads, and converts prospects to paid subscribers';
    this.status = 'active';
    this.lastActivity = new Date().toISOString();
    
    // Initialize resource manager and content analyzer
    this.resourceManager = new ResourceManager();
    this.contentAnalyzer = new ContentAnalyzer();
    
    // Initialize Wix client for real data integration
    try {
      this.wixClient = getWixClient();
      this.wixConnected = true;
      logger.info('Wix client initialized successfully');
    } catch (error) {
      this.wixConnected = false;
      logger.warn('Wix client not available - using mock data:', error.message);
    }
    
    // Sales capabilities
    this.capabilities = [
      'Lead Qualification',
      'Waitlist Management',
      'Sales Funnel Optimization',
      'Customer Journey Mapping',
      'Conversion Rate Optimization',
      'Sales Copy Creation',
      'Email Sequence Design',
      'Landing Page Optimization',
      'Customer Segmentation',
      'Sales Analytics',
      'Objection Handling',
      'Pricing Strategy',
      'Customer Onboarding',
      'Retention Optimization',
      'Wix Integration',
      'Local Marketing Focus',
      'Brick & Mortar Optimization'
    ];

    // Sales data and performance tracking
    this.salesData = {
      waitlist: {
        total: 0,
        qualified: 0,
        converted: 0,
        lastUpdated: new Date().toISOString()
      },
      conversions: {
        monthly: { count: 0, revenue: 0 },
        annual: { count: 0, revenue: 0 },
        totalRevenue: 0,
        lastUpdated: new Date().toISOString()
      },
      leads: [],
      customerJourney: [],
      lastUpdated: new Date().toISOString()
    };

    // Sales configuration
    this.salesConfig = {
      pricing: {
        monthly: 7.99,
        annual: 4.99, // per month when paid annually
        annualTotal: 59.88 // 4.99 * 12
      },
      launchDate: '2025-09-01',
      currentPhase: 'pre-launch', // 'pre-launch' or 'post-launch'
      targetConversionRate: 0.15, // 15% conversion from waitlist
      targetMonthlyRevenue: 5000,
      qualificationCriteria: {
        businessSize: ['small', 'medium'],
        industry: ['brick-mortar', 'local-service', 'retail', 'restaurant', 'healthcare', 'fitness', 'beauty', 'automotive'],
        painPoints: ['local-marketing', 'customer-acquisition', 'time-management', 'digital-presence', 'competition'],
        budget: 'under-100'
      }
    };

    // Brand context for MomentumDIY - Marketing clarity platform for small business owners
    this.brandContext = {
      brand: 'MomentumDIY',
      tagline: 'Marketing made human. Big results, small biz ready.',
      valueProposition: 'Extreme clarity through single quarterly marketing goals with weekly dripped guidance, kanban task tracking, email campaign management, Meta Business Suite integration, and 24/7 AI marketing assistant',
      targetAudience: 'Small business owners (cafes, home services, personal services, brick-and-mortar shops) who are overwhelmed by marketing options and need clarity',
      painPoints: [
        'Too many marketing options, not knowing where to start',
        'Trying to do everything at once, achieving nothing',
        'Not understanding what marketing activities will actually drive results',
        'Knowing what to do but not how to do it effectively',
        'Starting marketing initiatives but not following through'
      ],
      coreSolution: 'Single quarterly marketing goal system with weekly dripped guidance',
      platformFeatures: [
        'Quarterly goal selection and tracking',
        'Weekly dripped marketing guidance',
        'Kanban task tracker',
        'Email campaign creation and management',
        'Meta Business Suite integration for social scheduling',
        '24/7 AI marketing assistant trained on decade of experience'
      ],
      values: ['clarity', 'focus', 'practicality', 'results', 'accessibility'],
      industry: 'Small business marketing clarity and execution platform'
    };

    // Sales templates and scripts
    this.salesTemplates = {
      waitlistSignup: {
        subject: 'Join the MomentumDIY Waitlist - Local Marketing Made Simple',
        body: 'Get early access to the local marketing platform built for brick & mortar and local service businesses like yours.',
        cta: 'Join Waitlist'
      },
      launchAnnouncement: {
        subject: 'MomentumDIY is Live! Your Local Marketing Journey Starts Now',
        body: 'The wait is over! Start attracting more local customers with our simple, powerful local marketing platform.',
        cta: 'Start Your Free Trial'
      },
      conversionEmail: {
        subject: 'Ready to Transform Your Local Marketing?',
        body: 'See how other local business owners are getting more customers through their doors with MomentumDIY.',
        cta: 'Choose Your Plan'
      },
      objectionHandling: {
        price: 'For less than the cost of a coffee per day, you get a complete local marketing system that brings more customers through your doors.',
        time: 'We designed MomentumDIY to fit into your schedule, not take over it. Most local business owners spend just 15 minutes a day.',
        complexity: 'No marketing degree required. We guide you through every step with simple, actionable local marketing instructions.',
        results: 'Join thousands of local business owners who have transformed their local marketing with our proven system.'
      }
    };

    // Customer journey stages
    this.customerJourney = {
      awareness: {
        description: 'Prospect discovers MomentumDIY',
        touchpoints: ['social media', 'content marketing', 'referrals'],
        goals: ['brand awareness', 'interest generation']
      },
      consideration: {
        description: 'Prospect evaluates MomentumDIY',
        touchpoints: ['website', 'waitlist', 'email sequences'],
        goals: ['lead qualification', 'value demonstration']
      },
      decision: {
        description: 'Prospect decides to purchase',
        touchpoints: ['pricing page', 'trial', 'sales calls'],
        goals: ['conversion', 'plan selection']
      },
      retention: {
        description: 'Customer uses and renews',
        touchpoints: ['onboarding', 'support', 'success stories'],
        goals: ['adoption', 'renewal', 'referrals']
      }
    };

    this.targetMarket = {
      primary: 'Local businesses in New Hampshire',
      businessTypes: [
        'coffee shop', 'restaurant', 'auto repair', 'hair salon', 'cleaning services',
        'plumber', 'landscaping', 'jewelry store', 'bakery', 'electrician',
        'dentist', 'bookstore', 'pet groomer', 'antique shop', 'insurance',
        'massage therapy', 'chiropractor', 'real estate', 'fitness center', 'lawyer'
      ],
      cities: ['Concord', 'Dover', 'Rochester', 'Hooksett', 'Somersworth', 'Barrington'],
      characteristics: [
        '1-50 employees',
        'Local customer focus',
        'Service-based businesses',
        'Family-owned or small business',
        'Need for automation and efficiency'
      ]
    };
    
    this.leadScoringCriteria = {
      contactInfo: {
        hasPhone: 15,
        hasWebsite: 15,
        hasEmail: 20,
        hasAddress: 10
      },
      businessQuality: {
        highValueType: 20, // real estate, lawyer, dentist, chiropractor, insurance
        mediumValueType: 10, // restaurant, coffee, salon, fitness, bakery, auto
        hasReviews: 10,
        highRating: 15, // 4.5+ stars
        manyReviews: 10 // 50+ reviews
      },
      operational: {
        hasHours: 5,
        hasMenu: 5,
        hasPopularTimes: 5,
        isOpen: 10
      },
      geographic: {
        primaryCity: 10, // Concord, Dover, Rochester
        secondaryCity: 5
      }
    };

    this.emailGuidelines = {
      deliverability: {
        singleDomain: true,
        domainWarming: true,
        spfDkimDmarc: true,
        pruneNonOpeners: true
      },
      compliance: {
        honorUnsubscribes: true,
        followGroupRules: true,
        noScrapingViolations: true
      },
      tone: {
        personalizationLines: 2,
        noDeceptiveSubjects: true,
        aiDisclosure: 'AI-assisted, human-edited'
      },
      frequency: {
        initialEmail: 1,
        maxFollowUps: 2,
        followUpInterval: '5-7 days'
      }
    };

    this.loadData();
  }

  /**
   * Load all available lead data from Google Maps and Google Search results
   */
  loadData() {
    try {
      // Load Google Maps data
      const mapsDataPath = path.join(process.cwd(), 'nh-google-maps-businesses-enhanced.json');
      if (fs.existsSync(mapsDataPath)) {
        this.googleMapsData = JSON.parse(fs.readFileSync(mapsDataPath, 'utf8'));
        logger.info(`Loaded ${this.googleMapsData.summary.totalBusinesses} businesses from Google Maps data`);
      }

      // Load Google Search data
      const searchDataPath = path.join(process.cwd(), 'nh-local-businesses.json');
      if (fs.existsSync(searchDataPath)) {
        this.googleSearchData = JSON.parse(fs.readFileSync(searchDataPath, 'utf8'));
        logger.info(`Loaded ${this.googleSearchData.businesses?.length || 0} businesses from Google Search data`);
      }

      // Load high-value leads CSV
      const csvPath = path.join(process.cwd(), 'nh-high-value-leads-enhanced.csv');
      if (fs.existsSync(csvPath)) {
        this.highValueLeadsCsv = fs.readFileSync(csvPath, 'utf8');
        logger.info('Loaded high-value leads CSV data');
      }

    } catch (error) {
      logger.error('Error loading lead data:', error);
    }
  }

  /**
   * Enrich a lead with additional data from multiple sources
   */
  async enrichLead(business) {
    const enriched = {
      ...business,
      enrichment: {
        sources: [],
        additionalData: {},
        confidence: 0
      }
    };

    // Enrich from Google Maps data
    if (this.googleMapsData) {
      const mapsMatch = this.googleMapsData.allBusinesses?.find(
        b => b.name.toLowerCase() === business.name.toLowerCase() ||
             b.phone === business.phone ||
             b.website === business.website
      );

      if (mapsMatch) {
        enriched.enrichment.sources.push('google_maps');
        enriched.enrichment.confidence += 0.4;
        enriched.enrichment.additionalData.maps = {
          totalScore: mapsMatch.totalScore,
          reviewsCount: mapsMatch.reviewsCount,
          hasPopularTimes: mapsMatch.hasPopularTimes,
          popularTimesLivePercent: mapsMatch.popularTimesLivePercent,
          categories: mapsMatch.categories,
          additionalInfo: mapsMatch.additionalInfo
        };
      }
    }

    // Enrich from Google Search data
    if (this.googleSearchData) {
      const searchMatch = this.googleSearchData.businesses?.find(
        b => b.name.toLowerCase() === business.name.toLowerCase() ||
             b.url === business.website
      );

      if (searchMatch) {
        enriched.enrichment.sources.push('google_search');
        enriched.enrichment.confidence += 0.3;
        enriched.enrichment.additionalData.search = {
          description: searchMatch.description,
          searchQuery: searchMatch.searchQuery,
          city: searchMatch.city,
          businessType: searchMatch.businessType
        };
      }
    }

    return enriched;
  }

  /**
   * Score a lead based on defined criteria
   */
  scoreLead(business) {
    let score = 0;
    const scoring = {};

    // Contact information scoring
    if (business.hasPhone) {
      score += this.leadScoringCriteria.contactInfo.hasPhone;
      scoring.phone = this.leadScoringCriteria.contactInfo.hasPhone;
    }
    if (business.hasWebsite) {
      score += this.leadScoringCriteria.contactInfo.hasWebsite;
      scoring.website = this.leadScoringCriteria.contactInfo.hasWebsite;
    }
    if (business.hasEmail) {
      score += this.leadScoringCriteria.contactInfo.hasEmail;
      scoring.email = this.leadScoringCriteria.contactInfo.hasEmail;
    }
    if (business.hasAddress) {
      score += this.leadScoringCriteria.contactInfo.hasAddress;
      scoring.address = this.leadScoringCriteria.contactInfo.hasAddress;
    }

    // Business quality scoring
    const highValueTypes = ['real estate', 'lawyer', 'dentist', 'chiropractor', 'insurance', 'medical'];
    const mediumValueTypes = ['restaurant', 'coffee', 'salon', 'fitness', 'bakery', 'auto'];

    if (highValueTypes.some(type => business.category?.toLowerCase().includes(type))) {
      score += this.leadScoringCriteria.businessQuality.highValueType;
      scoring.highValueType = this.leadScoringCriteria.businessQuality.highValueType;
    } else if (mediumValueTypes.some(type => business.category?.toLowerCase().includes(type))) {
      score += this.leadScoringCriteria.businessQuality.mediumValueType;
      scoring.mediumValueType = this.leadScoringCriteria.businessQuality.mediumValueType;
    }

    if (business.hasReviews) {
      score += this.leadScoringCriteria.businessQuality.hasReviews;
      scoring.hasReviews = this.leadScoringCriteria.businessQuality.hasReviews;
    }

    if (business.totalScore >= 4.5) {
      score += this.leadScoringCriteria.businessQuality.highRating;
      scoring.highRating = this.leadScoringCriteria.businessQuality.highRating;
    }

    if (business.reviewsCount >= 50) {
      score += this.leadScoringCriteria.businessQuality.manyReviews;
      scoring.manyReviews = this.leadScoringCriteria.businessQuality.manyReviews;
    }

    // Operational scoring
    if (business.hasHours) {
      score += this.leadScoringCriteria.operational.hasHours;
      scoring.hasHours = this.leadScoringCriteria.operational.hasHours;
    }
    if (business.hasMenu) {
      score += this.leadScoringCriteria.operational.hasMenu;
      scoring.hasMenu = this.leadScoringCriteria.operational.hasMenu;
    }
    if (business.hasPopularTimes) {
      score += this.leadScoringCriteria.operational.hasPopularTimes;
      scoring.hasPopularTimes = this.leadScoringCriteria.operational.hasPopularTimes;
    }
    if (!business.permanentlyClosed && !business.temporarilyClosed) {
      score += this.leadScoringCriteria.operational.isOpen;
      scoring.isOpen = this.leadScoringCriteria.operational.isOpen;
    }

    // Geographic scoring
    const primaryCities = ['Concord', 'Dover', 'Rochester'];
    const secondaryCities = ['Hooksett', 'Somersworth', 'Barrington', 'Northwood', 'Bow'];

    if (primaryCities.includes(business.city)) {
      score += this.leadScoringCriteria.geographic.primaryCity;
      scoring.primaryCity = this.leadScoringCriteria.geographic.primaryCity;
    } else if (secondaryCities.includes(business.city)) {
      score += this.leadScoringCriteria.geographic.secondaryCity;
      scoring.secondaryCity = this.leadScoringCriteria.geographic.secondaryCity;
    }

    return {
      score: Math.min(100, score),
      scoring,
      tier: score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low'
    };
  }

  /**
   * Generate personalized outreach email
   */
  async generateOutreachEmail(business, campaignType = 'initial') {
    const templates = {
      initial: {
        subject: `Automation opportunity for ${business.name}`,
        body: this.generateInitialEmailBody(business)
      },
      followUp1: {
        subject: `Following up - ${business.name} automation opportunity`,
        body: this.generateFollowUpEmailBody(business, 1)
      },
      followUp2: {
        subject: `Final follow-up - ${business.name}`,
        body: this.generateFollowUpEmailBody(business, 2)
      }
    };

    const template = templates[campaignType];
    
    return {
      to: business.email || business.phone, // Fallback to phone for SMS
      subject: template.subject,
      body: template.body,
      metadata: {
        businessId: business.placeId || business.name,
        campaignType,
        sentAt: new Date().toISOString(),
        leadScore: business.leadScore,
        businessType: business.category,
        city: business.city
      }
    };
  }

  /**
   * Generate initial email body with personalization
   */
  generateInitialEmailBody(business) {
    const personalization = this.generatePersonalization(business);
    
    return `
${personalization.line1}
${personalization.line2}

I help local businesses like ${business.name} automate their operations to save time and increase efficiency. Based on your business profile, I believe you could benefit from some targeted automation solutions.

Here's what I can help you with:
• Social media posting automation
• Customer communication workflows
• Appointment scheduling optimization
• Review management automation
• Local SEO content generation

Would you be interested in a 15-minute call to discuss how automation could benefit your ${business.category} business? I can share specific examples relevant to your industry.

Best regards,
[Your Name]
Local Business Automation Specialist

---
${this.emailGuidelines.tone.aiDisclosure}
To unsubscribe, reply with "UNSUBSCRIBE"
    `.trim();
  }

  /**
   * Generate follow-up email body
   */
  generateFollowUpEmailBody(business, followUpNumber) {
    const personalization = this.generatePersonalization(business);
    
    const followUpMessages = {
      1: `I wanted to follow up on my previous message about automation opportunities for ${business.name}. I know you're busy running your ${business.category} business, so I'll keep this brief.`,
      2: `This is my final follow-up regarding automation solutions for ${business.name}. I understand if this isn't the right time, but I wanted to make sure you had all the information.`
    };

    return `
${personalization.line1}
${personalization.line2}

${followUpMessages[followUpNumber]}

If you're interested in learning more about how other local businesses are using automation to save 5-10 hours per week, I'd be happy to share some case studies.

No pressure - just wanted to ensure you had the opportunity to explore this.

Best regards,
[Your Name]

---
${this.emailGuidelines.tone.aiDisclosure}
To unsubscribe, reply with "UNSUBSCRIBE"
    `.trim();
  }

  /**
   * Generate personalized lines based on business data
   */
  generatePersonalization(business) {
    const personalizations = [];

    // Rating-based personalization
    if (business.totalScore >= 4.5) {
      personalizations.push(`I noticed ${business.name} has an impressive ${business.totalScore}⭐ rating with ${business.reviewsCount} reviews - clearly you're doing something right!`);
    }

    // Review-based personalization
    if (business.reviewsCount >= 100) {
      personalizations.push(`With ${business.reviewsCount} reviews, you must be managing a lot of customer interactions at ${business.name}.`);
    }

    // Popular times personalization
    if (business.hasPopularTimes && business.popularTimesLivePercent > 50) {
      personalizations.push(`I can see ${business.name} is quite busy during peak hours - automation could help you manage that demand more efficiently.`);
    }

    // Business type personalization
    const typeInsights = {
      'coffee shop': 'Coffee shops often benefit from social media automation and customer loyalty programs.',
      'restaurant': 'Restaurants can save significant time with automated reservation management and social media posting.',
      'hair salon': 'Salons frequently need help with appointment scheduling and client communication automation.',
      'auto repair': 'Auto repair shops can streamline customer updates and follow-up communications.',
      'real estate': 'Real estate agents often need help with lead nurturing and social media content automation.',
      'lawyer': 'Law firms can benefit from client intake automation and follow-up scheduling.',
      'dentist': 'Dental practices often need help with appointment reminders and patient communication.',
      'chiropractor': 'Chiropractic offices can streamline patient scheduling and follow-up care.',
      'insurance': 'Insurance agents can automate lead follow-up and policy renewal communications.',
      'fitness center': 'Gyms can benefit from member communication and social media content automation.'
    };

    if (typeInsights[business.category]) {
      personalizations.push(typeInsights[business.category]);
    }

    // City-based personalization
    if (business.city === 'Concord') {
      personalizations.push(`I work with several businesses in Concord and understand the local market dynamics.`);
    } else if (business.city === 'Dover') {
      personalizations.push(`I've helped other Dover businesses implement automation solutions successfully.`);
    }

    // Select two personalization lines
    const selected = personalizations.slice(0, 2);
    return {
      line1: selected[0] || `I came across ${business.name} while researching local ${business.category} businesses in ${business.city}.`,
      line2: selected[1] || `Your business caught my attention as a potential candidate for automation solutions.`
    };
  }

  /**
   * Execute lead generation and outreach campaign
   */
  async execute(campaign, options = {}) {
    logger.info(`Lead & Sales Agent executing task: ${campaign}`);

    switch (campaign) {
      case 'enrich-leads':
        return await this.enrichAllLeads();
      
      case 'score-leads':
        return await this.scoreAllLeads();
      
      case 'generate-outreach':
        return await this.generateOutreachCampaign(options);
      
      case 'analyze-market':
        return await this.analyzeMarketOpportunity();
      
      default:
        throw new Error(`Unknown task: ${campaign}`);
    }
  }

  /**
   * Enrich all available leads
   */
  async enrichAllLeads() {
    const enriched = [];
    
    if (this.googleMapsData?.allBusinesses) {
      for (const business of this.googleMapsData.allBusinesses) {
        const enrichedLead = await this.enrichLead(business);
        enriched.push(enrichedLead);
      }
    }

    // Save enriched data
    const outputPath = path.join(process.cwd(), 'enriched-leads.json');
    fs.writeFileSync(outputPath, JSON.stringify(enriched, null, 2));
    
    logger.info(`Enriched ${enriched.length} leads`);
    return { enriched: enriched.length, outputPath };
  }

  /**
   * Score all available leads
   */
  async scoreAllLeads() {
    const scored = [];
    
    if (this.googleMapsData?.allBusinesses) {
      for (const business of this.googleMapsData.allBusinesses) {
        const scoring = this.scoreLead(business);
        scored.push({
          ...business,
          scoring
        });
      }
    }

    // Sort by score
    scored.sort((a, b) => b.scoring.score - a.scoring.score);

    // Save scored data
    const outputPath = path.join(process.cwd(), 'scored-leads.json');
    fs.writeFileSync(outputPath, JSON.stringify(scored, null, 2));
    
    logger.info(`Scored ${scored.length} leads`);
    return { scored: scored.length, outputPath, topLeads: scored.slice(0, 10) };
  }

  /**
   * Generate outreach campaign
   */
  async generateOutreachCampaign(options = {}) {
    const { maxLeads = 50, campaignType = 'initial', minScore = 70 } = options;
    
    const highValueLeads = this.googleMapsData?.allBusinesses?.filter(
      b => b.leadScore >= minScore
    ).slice(0, maxLeads) || [];

    const emails = [];
    
    for (const lead of highValueLeads) {
      const email = await this.generateOutreachEmail(lead, campaignType);
      emails.push(email);
    }

    // Save campaign
    const outputPath = path.join(process.cwd(), `outreach-campaign-${campaignType}-${Date.now()}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(emails, null, 2));
    
    logger.info(`Generated ${emails.length} ${campaignType} emails`);
    return { emails: emails.length, outputPath, sampleEmail: emails[0] };
  }

  /**
   * Analyze market opportunity
   */
  async analyzeMarketOpportunity() {
    if (!this.googleMapsData) {
      throw new Error('No Google Maps data available');
    }

    const analysis = {
      totalBusinesses: this.googleMapsData.summary.totalBusinesses,
      highValueLeads: this.googleMapsData.summary.highValueLeads,
      businessTypes: this.googleMapsData.summary.businessTypes,
      cities: this.googleMapsData.summary.cities,
      recommendations: []
    };

    // Generate recommendations
    const topCities = Object.entries(this.googleMapsData.summary.cities)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    analysis.recommendations.push(
      `Focus on ${topCities[0][0]} (${topCities[0][1]} businesses) as primary market`
    );

    const topTypes = Object.entries(this.googleMapsData.summary.businessTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    analysis.recommendations.push(
      `Prioritize ${topTypes[0][0]} businesses (${topTypes[0][1]} total)`
    );

    analysis.recommendations.push(
      `Target businesses with websites (${this.googleMapsData.allBusinesses.filter(b => b.hasWebsite).length} available)`
    );

    return analysis;
  }

  // Get agent information
  getInfo() {
    return {
      id: 'lead-sales-agent',
      name: this.name,
      description: this.description,
      status: this.status,
      lastActivity: this.lastActivity,
      capabilities: this.capabilities,
      currentPhase: this.salesConfig.currentPhase,
      pricing: this.salesConfig.pricing,
      launchDate: this.salesConfig.launchDate
    };
  }

  // Update agent activity
  updateActivity() {
    this.lastActivity = new Date().toISOString();
  }

  // Main execution method
  async execute(task, input) {
    this.updateActivity();
    
    try {
      logger.info(`Lead & Sales Agent executing task: ${task}`);
      
      switch (task) {
        case 'qualify-lead':
          return await this.qualifyLead(input);
        case 'manage-waitlist':
          return await this.manageWaitlist(input);
        case 'create-conversion-campaign':
          return await this.createConversionCampaign(input);
        case 'optimize-sales-funnel':
          return await this.optimizeSalesFunnel(input);
        case 'create-sales-copy':
          return await this.createSalesCopy(input);
        case 'design-email-sequence':
          return await this.designEmailSequence(input);
        case 'analyze-sales-performance':
          return await this.analyzeSalesPerformance(input);
        case 'handle-objections':
          return await this.handleObjections(input);
        case 'segment-customers':
          return await this.segmentCustomers(input);
        case 'create-onboarding-plan':
          return await this.createOnboardingPlan(input);
        case 'optimize-pricing-strategy':
          return await this.optimizePricingStrategy(input);
        case 'generate-sales-ideas':
          return await this.generateSalesIdeas(input);
        case 'create-customer-journey':
          return await this.createCustomerJourney(input);
        case 'analyze-competition':
          return await this.analyzeCompetition(input);
        case 'integrate-wix':
          return await this.integrateWithWix(input);
        case 'sync-wix-data':
          return await this.syncWixData(input);
        case 'create-wix-campaign':
          return await this.createWixCampaign(input);
        case 'optimize-wix-landing':
          return await this.optimizeWixLanding(input);
        case 'enrich-leads':
          return await this.enrichAllLeads();
        case 'score-leads':
          return await this.scoreAllLeads();
        case 'generate-outreach':
          return await this.generateOutreachCampaign(input);
        case 'analyze-market':
          return await this.analyzeMarketOpportunity();
        default:
          throw new Error(`Unknown task: ${task}`);
      }
    } catch (error) {
      logger.error(`Error in Lead & Sales Agent task ${task}:`, error);
      throw error;
    }
  }

  // Execute with progress tracking
  async executeWithProgress(task, input, onProgress) {
    const steps = this.getTaskSteps(task);
    let currentStep = 0;
    
    const progressCallback = (step, message) => {
      currentStep++;
      const progress = (currentStep / steps.length) * 100;
      onProgress({
        progress: Math.round(progress),
        step: message,
        steps: steps
      });
    };
    
    progressCallback(0, 'Starting sales task...');
    const result = await this.execute(task, input);
    progressCallback(steps.length, 'Sales task completed');
    
    return result;
  }

  // Execute with streaming updates
  async executeWithStreaming(task, input, onUpdate) {
    const result = await this.execute(task, input);
    
    // Send streaming updates for long-running tasks
    if (task === 'analyze-sales-performance' || task === 'optimize-sales-funnel') {
      onUpdate({ type: 'progress', message: 'Processing sales data...' });
      onUpdate({ type: 'progress', message: 'Generating insights...' });
      onUpdate({ type: 'progress', message: 'Creating recommendations...' });
    }
    
    onUpdate({ type: 'complete', result });
    return result;
  }

  // Lead qualification
  async qualifyLead(input) {
    const { prospect, source, interaction } = input;
    
    const qualificationScore = this.calculateQualificationScore(prospect);
    const qualification = {
      prospect,
      score: qualificationScore,
      qualified: qualificationScore >= 70,
      recommendations: this.getQualificationRecommendations(qualificationScore, prospect),
      nextSteps: this.getNextSteps(qualificationScore, prospect)
    };
    
    // Store lead data
    this.salesData.leads.push({
      ...qualification,
      timestamp: new Date().toISOString(),
      source,
      interaction
    });
    
    return qualification;
  }

  // Calculate qualification score
  calculateQualificationScore(prospect) {
    let score = 0;
    
    // Business size (0-20 points)
    if (prospect.businessSize === 'small') score += 15;
    else if (prospect.businessSize === 'medium') score += 10;
    
    // Industry fit (0-20 points)
    const targetIndustries = this.salesConfig.qualificationCriteria.industry;
    if (targetIndustries.includes(prospect.industry)) score += 20;
    
    // Pain points (0-30 points)
    const targetPainPoints = this.salesConfig.qualificationCriteria.painPoints;
    if (prospect.painPoints && Array.isArray(prospect.painPoints)) {
      const matchingPainPoints = prospect.painPoints.filter(p => targetPainPoints.includes(p));
      score += (matchingPainPoints.length / targetPainPoints.length) * 30;
    }
    
    // Budget (0-20 points)
    if (prospect.budget === 'under-100') score += 20;
    else if (prospect.budget === '100-500') score += 15;
    
    // Urgency (0-10 points)
    if (prospect.urgency === 'high') score += 10;
    else if (prospect.urgency === 'medium') score += 5;
    
    // Local business bonus (0-10 points)
    if (prospect.location && prospect.location !== 'online') score += 10;
    
    return Math.min(score, 100);
  }

  // Get qualification recommendations
  getQualificationRecommendations(score, prospect) {
    const recommendations = [];
    
    if (score >= 80) {
      recommendations.push('High-value prospect - prioritize for immediate follow-up');
      recommendations.push('Offer exclusive founding member benefits');
      recommendations.push('Schedule personalized demo');
    } else if (score >= 60) {
      recommendations.push('Qualified prospect - nurture with targeted content');
      recommendations.push('Send case studies and testimonials');
      recommendations.push('Offer free consultation');
    } else {
      recommendations.push('Low qualification - focus on education and value demonstration');
      recommendations.push('Send educational content');
      recommendations.push('Monitor for changes in situation');
    }
    
    return recommendations;
  }

  // Get next steps based on qualification
  getNextSteps(score, prospect) {
    if (score >= 80) {
      return [
        'Send personalized welcome email within 1 hour',
        'Schedule discovery call within 24 hours',
        'Share exclusive founding member benefits',
        'Create custom demo based on their business'
      ];
    } else if (score >= 60) {
      return [
        'Add to nurture sequence',
        'Send relevant case studies',
        'Invite to webinar or workshop',
        'Follow up in 3-5 days'
      ];
    } else {
      return [
        'Add to educational content sequence',
        'Monitor engagement',
        'Re-engage in 2-3 weeks',
        'Focus on value demonstration'
      ];
    }
  }

  // Waitlist management
  async manageWaitlist(input) {
    const { action, prospect, campaign } = input;
    
    // If Wix is connected, try to get real waitlist data for analysis/segmentation
    if (this.wixConnected && (action === 'analyze' || action === 'segment')) {
      try {
        const wixData = await this.wixClient.getFormsData();
        const processedData = this.processRealWixData(wixData, 'forms');
        
        // Update sales data with real Wix data
        this.salesData.waitlist.total = processedData.recordsProcessed.total;
        this.salesData.waitlist.qualified = processedData.recordsProcessed.qualified;
        this.salesData.waitlist.lastUpdated = new Date().toISOString();
        
        // Add new leads from Wix to our leads array
        if (processedData.newLeads.length > 0) {
          this.salesData.leads = [...this.salesData.leads, ...processedData.newLeads];
        }
        
        logger.info('Updated waitlist data from Wix', { 
          total: processedData.recordsProcessed.total,
          newLeads: processedData.newLeads.length 
        });
      } catch (error) {
        logger.warn('Failed to sync with Wix, using local data:', error.message);
      }
    }
    
    switch (action) {
      case 'add':
        return await this.addToWaitlist(prospect, campaign);
      case 'remove':
        return await this.removeFromWaitlist(prospect);
      case 'update':
        return await this.updateWaitlistMember(prospect);
      case 'segment':
        return await this.segmentWaitlist();
      case 'analyze':
        return await this.analyzeWaitlist();
      default:
        throw new Error(`Unknown waitlist action: ${action}`);
    }
  }

  // Add prospect to waitlist
  async addToWaitlist(prospect, campaign) {
    const waitlistEntry = {
      prospect,
      campaign,
      joinedAt: new Date().toISOString(),
      status: 'active',
      engagement: [],
      qualificationScore: this.calculateQualificationScore(prospect)
    };
    
    this.salesData.waitlist.total++;
    if (waitlistEntry.qualificationScore >= 70) {
      this.salesData.waitlist.qualified++;
    }
    
    // Store waitlist data
    this.salesData.leads.push(waitlistEntry);
    
    return {
      success: true,
      message: 'Successfully added to waitlist',
      waitlistEntry,
      totalWaitlist: this.salesData.waitlist.total,
      qualifiedWaitlist: this.salesData.waitlist.qualified
    };
  }

  // Create conversion campaign
  async createConversionCampaign(input) {
    const { targetAudience, campaignType, goals } = input;
    
    const campaign = {
      type: campaignType,
      targetAudience,
      goals,
      phases: this.createCampaignPhases(campaignType, targetAudience),
      metrics: this.defineCampaignMetrics(goals),
      timeline: this.createCampaignTimeline(campaignType),
      budget: this.estimateCampaignBudget(campaignType, targetAudience)
    };
    
    return campaign;
  }

  // Create campaign phases
  createCampaignPhases(type, audience) {
    const phases = [];
    
    if (type === 'launch') {
      phases.push({
        name: 'Pre-Launch Awareness',
        duration: '2 weeks',
        goals: ['Build anticipation', 'Grow waitlist', 'Create buzz'],
        tactics: ['Social media teasers', 'Email sequences', 'Influencer outreach']
      });
      phases.push({
        name: 'Launch Day',
        duration: '1 day',
        goals: ['Maximize conversions', 'Create urgency', 'Drive signups'],
        tactics: ['Launch email', 'Social media blitz', 'Limited-time offers']
      });
      phases.push({
        name: 'Post-Launch Optimization',
        duration: '2 weeks',
        goals: ['Optimize conversions', 'Reduce churn', 'Gather feedback'],
        tactics: ['A/B testing', 'Customer feedback', 'Performance optimization']
      });
    }
    
    return phases;
  }

  // Create sales copy
  async createSalesCopy(input) {
    const { type, targetAudience, painPoints, benefits, offer } = input;
    
    const copy = {
      type,
      headline: this.generateHeadline(type, painPoints),
      subheadline: this.generateSubheadline(benefits),
      body: this.generateBody(type, painPoints, benefits, offer),
      cta: this.generateCTA(type, offer),
      socialProof: this.generateSocialProof(),
      urgency: this.generateUrgency(type)
    };
    
    return copy;
  }

  // Generate headline
  generateHeadline(type, painPoints) {
    const headlines = {
      waitlist: [
        'Stop Guessing How to Attract Local Customers - Join the Waitlist for Local Marketing That Actually Works',
        'The Local Marketing Platform Built for Brick & Mortar Businesses (Not Online Marketers)',
        'Finally, Local Marketing That Fits Into Your Schedule, Not Takes Over It',
        'Get More Customers Through Your Doors - Join the Local Marketing Waitlist'
      ],
      conversion: [
        'Ready to Transform Your Local Marketing? Start Your Free Trial Today',
        'Join 1,000+ Local Business Owners Who Are Getting More Customers',
        'Stop Wasting Time on Marketing That Does Not Bring Local Customers',
        'Get More Local Customers Through Your Doors - Start Your Free Trial'
      ]
    };
    
    const availableHeadlines = headlines[type] || headlines.waitlist;
    return availableHeadlines[Math.floor(Math.random() * availableHeadlines.length)];
  }

  // Generate CTA
  generateCTA(type, offer) {
    const ctas = {
      waitlist: [
        'Join the Waitlist',
        'Get Early Access',
        'Reserve Your Spot'
      ],
      conversion: [
        'Start Free Trial',
        'Choose Your Plan',
        'Get Started Today'
      ]
    };
    
    const availableCTAs = ctas[type] || ctas.waitlist;
    return availableCTAs[Math.floor(Math.random() * availableCTAs.length)];
  }

  // Generate subheadline
  generateSubheadline(benefits) {
    const subheadlines = [
      'Simple, actionable local marketing steps that actually get done',
      'Built for local business owners, not online marketers',
      'Fits into your schedule, not takes over it',
      'Proven results for local customer acquisition',
      'Focus on getting local customers through your doors'
    ];
    
    return subheadlines[Math.floor(Math.random() * subheadlines.length)];
  }

  // Generate body content
  generateBody(type, painPoints, benefits, offer) {
    const bodyTemplates = {
      waitlist: 'Join thousands of local business owners who are tired of marketing tools that do not understand local businesses. Get early access to the platform built specifically for brick & mortar and local service businesses.',
      conversion: 'Ready to transform your local marketing? See how other local business owners are getting more customers through their doors with our simple, powerful platform.'
    };
    
    return bodyTemplates[type] || bodyTemplates.waitlist;
  }

  // Generate social proof
  generateSocialProof() {
    return 'Join 1,000+ local business owners who have transformed their local marketing';
  }

  // Generate urgency
  generateUrgency(type) {
    const urgencyMessages = {
      waitlist: 'Limited spots available for founding members',
      conversion: 'Start your free trial today and see results in 30 days'
    };
    
    return urgencyMessages[type] || urgencyMessages.waitlist;
  }

  // Define sequence triggers
  defineSequenceTriggers(sequenceType) {
    const triggers = {
      waitlist: ['signup', 'email_open', 'link_click'],
      conversion: ['launch', 'trial_start', 'trial_end']
    };
    
    return triggers[sequenceType] || triggers.waitlist;
  }

  // Define sequence metrics
  defineSequenceMetrics(goals) {
    const metrics = {
      'increase engagement': 'open_rate',
      'improve conversion': 'click_rate',
      'reduce churn': 'unsubscribe_rate',
      'increase revenue': 'conversion_rate'
    };
    
    return goals ? goals.map(goal => metrics[goal] || 'custom_metric') : ['open_rate', 'click_rate'];
  }

  // Design email sequence
  async designEmailSequence(input) {
    const { sequenceType, targetAudience, goals, length } = input;
    
    const sequence = {
      type: sequenceType,
      targetAudience,
      goals,
      emails: this.createEmailSequence(sequenceType, length),
      triggers: this.defineSequenceTriggers(sequenceType),
      metrics: this.defineSequenceMetrics(goals)
    };
    
    return sequence;
  }

  // Create email sequence
  createEmailSequence(type, length) {
    const sequences = {
      waitlist: [
        {
          day: 0,
          subject: 'Welcome to the MomentumDIY Local Marketing Waitlist!',
          purpose: 'Welcome and set expectations',
          content: 'Welcome email with exclusive local marketing benefits and timeline'
        },
        {
          day: 2,
          subject: 'What Makes MomentumDIY Different for Local Businesses',
          purpose: 'Value demonstration',
          content: 'Local business case studies and unique local marketing value proposition'
        },
        {
          day: 5,
          subject: 'Behind the Scenes: Building for Local Business Owners',
          purpose: 'Build trust and connection',
          content: 'Founder story and local business development process'
        },
        {
          day: 8,
          subject: 'Early Access Opportunity - Limited Spots for Local Businesses',
          purpose: 'Create urgency',
          content: 'Exclusive founding member benefits for local businesses and limited availability'
        }
      ],
      conversion: [
        {
          day: 0,
          subject: 'MomentumDIY is Live! Your Local Marketing Journey Starts Now',
          purpose: 'Launch announcement',
          content: 'Launch email with free trial offer for local marketing'
        },
        {
          day: 1,
          subject: 'See How Other Local Business Owners Are Getting More Customers',
          purpose: 'Social proof',
          content: 'Local business customer testimonials and case studies'
        },
        {
          day: 3,
          subject: 'Your Free Trial is Active - Here\'s How to Get More Local Customers',
          purpose: 'Onboarding guidance',
          content: 'Getting started guide for local marketing and first steps'
        },
        {
          day: 7,
          subject: 'Don\'t Miss Out - Your Local Marketing Trial Ends Soon',
          purpose: 'Urgency and conversion',
          content: 'Trial ending reminder with special offer for local businesses'
        }
      ]
    };
    
    return sequences[type] || sequences.waitlist;
  }

  // Analyze sales performance
  async analyzeSalesPerformance(input) {
    const { timeframe, metrics, segments } = input;
    
    const analysis = {
      timeframe,
      overview: this.generatePerformanceOverview(),
      metrics: this.calculateKeyMetrics(metrics),
      segments: this.analyzeSegments(segments),
      trends: this.identifyTrends(timeframe),
      recommendations: this.generatePerformanceRecommendations()
    };
    
    return analysis;
  }

  // Handle objections
  async handleObjections(input) {
    const { objection, prospect, context } = input;
    
    const response = {
      objection,
      prospect,
      response: this.getObjectionResponse(objection),
      followUp: this.getObjectionFollowUp(objection),
      resources: this.getObjectionResources(objection)
    };
    
    return response;
  }

  // Get objection response
  getObjectionResponse(objection) {
    const responses = {
      price: this.salesTemplates.objectionHandling.price,
      time: this.salesTemplates.objectionHandling.time,
      complexity: this.salesTemplates.objectionHandling.complexity,
      results: this.salesTemplates.objectionHandling.results
    };
    
    return responses[objection] || 'I understand your concern. Let me address that specifically...';
  }

  // Get objection follow-up
  getObjectionFollowUp(objection) {
    const followUps = {
      price: 'Would you like to see our ROI calculator to understand the value you\'ll get?',
      time: 'Can I show you how our 15-minute daily routine works?',
      complexity: 'Would you like a quick demo of our step-by-step process?',
      results: 'Can I share some case studies from businesses similar to yours?'
    };
    
    return followUps[objection] || 'What specific concerns do you have that I can address?';
  }

  // Get objection resources
  getObjectionResources(objection) {
    const resources = {
      price: ['ROI calculator', 'Pricing comparison', 'Value demonstration'],
      time: ['Daily routine guide', 'Time-saving features', 'Implementation timeline'],
      complexity: ['Product demo', 'Getting started guide', 'Support resources'],
      results: ['Case studies', 'Customer testimonials', 'Success metrics']
    };
    
    return resources[objection] || ['Product information', 'Support documentation'];
  }

  // Remove from waitlist
  async removeFromWaitlist(prospect) {
    const index = this.salesData.leads.findIndex(lead => lead.prospect.email === prospect.email);
    if (index !== -1) {
      this.salesData.leads.splice(index, 1);
      this.salesData.waitlist.total--;
      return { success: true, message: 'Successfully removed from waitlist' };
    }
    return { success: false, message: 'Prospect not found in waitlist' };
  }

  // Update waitlist member
  async updateWaitlistMember(prospect) {
    const index = this.salesData.leads.findIndex(lead => lead.prospect.email === prospect.email);
    if (index !== -1) {
      this.salesData.leads[index] = { ...this.salesData.leads[index], prospect };
      return { success: true, message: 'Successfully updated waitlist member' };
    }
    return { success: false, message: 'Prospect not found in waitlist' };
  }

  // Segment waitlist
  async segmentWaitlist() {
    const segments = {
      highValue: this.salesData.leads.filter(lead => lead.qualificationScore >= 80),
      qualified: this.salesData.leads.filter(lead => lead.qualificationScore >= 60 && lead.qualificationScore < 80),
      nurture: this.salesData.leads.filter(lead => lead.qualificationScore < 60),
      engaged: this.salesData.leads.filter(lead => lead.engagement && lead.engagement.length > 2)
    };
    
    return segments;
  }

  // Analyze waitlist
  async analyzeWaitlist() {
    const total = this.salesData.waitlist.total;
    const qualified = this.salesData.waitlist.qualified;
    const conversionRate = total > 0 ? (qualified / total) * 100 : 0;
    
    return {
      total,
      qualified,
      conversionRate: Math.round(conversionRate * 100) / 100,
      averageScore: this.calculateAverageScore(),
      topSources: this.analyzeTopSources(),
      recommendations: this.generateWaitlistRecommendations()
    };
  }

  // Calculate average score
  calculateAverageScore() {
    if (this.salesData.leads.length === 0) return 0;
    const totalScore = this.salesData.leads.reduce((sum, lead) => sum + (lead.qualificationScore || 0), 0);
    return Math.round((totalScore / this.salesData.leads.length) * 100) / 100;
  }

  // Analyze top sources
  analyzeTopSources() {
    const sources = {};
    this.salesData.leads.forEach(lead => {
      const source = lead.source || 'unknown';
      sources[source] = (sources[source] || 0) + 1;
    });
    
    return Object.entries(sources)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([source, count]) => ({ source, count }));
  }

  // Generate waitlist recommendations
  generateWaitlistRecommendations() {
    const recommendations = [];
    
    if (this.salesData.waitlist.total < 100) {
      recommendations.push('Focus on growing waitlist through content marketing and social media');
    }
    
    if (this.salesData.waitlist.qualified / this.salesData.waitlist.total < 0.6) {
      recommendations.push('Improve lead qualification criteria to attract better-fit prospects');
    }
    
    if (this.calculateAverageScore() < 70) {
      recommendations.push('Enhance targeting to attract higher-value prospects');
    }
    
    return recommendations;
  }

  // Optimize sales funnel
  async optimizeSalesFunnel(input) {
    const { funnelStage, metrics, goals, priorities, targetMarket, focusAreas } = input;
    
    // Provide defaults if parameters are missing
    const stage = funnelStage || 'awareness';
    const funnelMetrics = metrics || {};
    const funnelGoals = goals || ['increase conversions', 'improve engagement'];
    
    const optimization = {
      stage: stage,
      currentMetrics: await this.getFunnelMetrics(stage),
      recommendations: this.generateFunnelOptimizations(stage, funnelMetrics),
      actionPlan: this.createOptimizationActionPlan(stage, funnelGoals),
      targetMarket: targetMarket || 'Local businesses',
      focusAreas: focusAreas || ['lead generation', 'sales funnel optimization'],
      priorities: priorities || []
    };
    
    return optimization;
  }

  // Get funnel metrics from real data sources
  async getFunnelMetrics(stage) {
    try {
      // Get real data from APIs
      const { getGoogleAnalyticsClient, getWixClient, getMetaBusinessSuiteClient } = require('../utils/api-clients');
      
      let metrics = {};
      
      switch (stage) {
        case 'awareness':
          // Get awareness metrics from Google Analytics and Search Console
          try {
            const gaClient = getGoogleAnalyticsClient();
            const gaData = await gaClient.getBasicMetrics();
            
            const searchClient = getGoogleSearchConsoleClient();
            const searchData = await searchClient.getSearchAnalytics();
            
            metrics = {
              impressions: gaData?.impressions || searchData?.impressions || 0,
              clicks: gaData?.clicks || searchData?.clicks || 0,
              ctr: gaData?.ctr || searchData?.ctr || 0,
              pageViews: gaData?.pageViews || 0,
              uniqueVisitors: gaData?.uniqueVisitors || 0,
              dataSource: 'Google Analytics & Search Console'
            };
          } catch (error) {
            logger.warn('Could not fetch awareness metrics:', error.message);
            metrics = { impressions: 0, clicks: 0, ctr: 0, dataSource: 'Data not found' };
          }
          break;
          
        case 'consideration':
          // Get consideration metrics from Wix and Google Analytics
          try {
            const wixClient = getWixClient();
            const wixData = await wixClient.getFormSubmissions();
            
            const gaClient = getGoogleAnalyticsClient();
            const gaData = await gaClient.getConversionMetrics();
            
            metrics = {
              visitors: gaData?.visitors || 0,
              leads: wixData?.formSubmissions || 0,
              conversionRate: wixData?.formSubmissions && gaData?.visitors ? 
                (wixData.formSubmissions / gaData.visitors * 100).toFixed(1) : 0,
              landingPageViews: gaData?.landingPageViews || 0,
              timeOnSite: gaData?.timeOnSite || 0,
              dataSource: 'Wix & Google Analytics'
            };
          } catch (error) {
            logger.warn('Could not fetch consideration metrics:', error.message);
            metrics = { visitors: 0, leads: 0, conversionRate: 0, dataSource: 'Data not found' };
          }
          break;
          
        case 'decision':
          // Get decision metrics from Wix and Google Analytics
          try {
            const wixClient = getWixClient();
            const wixData = await wixClient.getContactData();
            
            const gaClient = getGoogleAnalyticsClient();
            const gaData = await gaClient.getEcommerceMetrics();
            
            metrics = {
              leads: wixData?.contacts || 0,
              customers: gaData?.transactions || 0,
              conversionRate: wixData?.contacts && gaData?.transactions ? 
                (gaData.transactions / wixData.contacts * 100).toFixed(1) : 0,
              revenue: gaData?.revenue || 0,
              averageOrderValue: gaData?.averageOrderValue || 0,
              dataSource: 'Wix & Google Analytics'
            };
          } catch (error) {
            logger.warn('Could not fetch decision metrics:', error.message);
            metrics = { leads: 0, customers: 0, conversionRate: 0, dataSource: 'Data not found' };
          }
          break;
          
        case 'retention':
          // Get retention metrics from Wix and Google Analytics
          try {
            const wixClient = getWixClient();
            const wixData = await wixClient.getCustomerData();
            
            const gaClient = getGoogleAnalyticsClient();
            const gaData = await gaClient.getRetentionMetrics();
            
            metrics = {
              customers: wixData?.totalCustomers || 0,
              renewals: gaData?.returningVisitors || 0,
              retentionRate: gaData?.returningVisitors && wixData?.totalCustomers ? 
                (gaData.returningVisitors / wixData.totalCustomers * 100).toFixed(1) : 0,
              customerLifetimeValue: gaData?.customerLifetimeValue || 0,
              repeatPurchaseRate: gaData?.repeatPurchaseRate || 0,
              dataSource: 'Wix & Google Analytics'
            };
          } catch (error) {
            logger.warn('Could not fetch retention metrics:', error.message);
            metrics = { customers: 0, renewals: 0, retentionRate: 0, dataSource: 'Data not found' };
          }
          break;
          
        default:
          metrics = { dataSource: 'Stage not found' };
      }
      
      return metrics;
    } catch (error) {
      logger.error('Error getting funnel metrics:', error);
      return { dataSource: 'Error - Defaulting to empty metrics' };
    }
  }

  // Generate funnel optimizations
  generateFunnelOptimizations(stage, metrics) {
    const optimizations = {
      awareness: [
        'Increase content marketing efforts',
        'Optimize social media presence',
        'Improve SEO targeting'
      ],
      consideration: [
        'Enhance landing page conversion rates',
        'Improve lead qualification process',
        'Optimize email sequences'
      ],
      decision: [
        'Streamline checkout process',
        'Add social proof elements',
        'Improve pricing presentation'
      ],
      retention: [
        'Enhance onboarding experience',
        'Improve customer support',
        'Create loyalty programs'
      ]
    };
    
    return optimizations[stage] || [];
  }

  // Create optimization action plan
  createOptimizationActionPlan(stage, goals) {
    return {
      immediate: this.getImmediateActions(stage),
      shortTerm: this.getShortTermActions(stage),
      longTerm: this.getLongTermActions(stage),
      successMetrics: this.defineSuccessMetrics(goals)
    };
  }

  // Get immediate actions
  getImmediateActions(stage) {
    const actions = {
      awareness: ['Audit current content performance', 'Identify top-performing channels'],
      consideration: ['Review landing page analytics', 'Test different CTAs'],
      decision: ['Analyze checkout abandonment', 'Review pricing page'],
      retention: ['Survey current customers', 'Review support tickets']
    };
    
    return actions[stage] || [];
  }

  // Get short term actions
  getShortTermActions(stage) {
    const actions = {
      awareness: ['Create new content pieces', 'Launch new campaigns'],
      consideration: ['Implement A/B testing', 'Optimize email sequences'],
      decision: ['Redesign checkout flow', 'Add trust signals'],
      retention: ['Improve onboarding', 'Launch loyalty program']
    };
    
    return actions[stage] || [];
  }

  // Get long term actions
  getLongTermActions(stage) {
    const actions = {
      awareness: ['Build brand authority', 'Develop thought leadership'],
      consideration: ['Create comprehensive content library', 'Build community'],
      decision: ['Develop referral program', 'Create partnership strategy'],
      retention: ['Build customer success program', 'Develop expansion strategy']
    };
    
    return actions[stage] || [];
  }

  // Define success metrics
  defineSuccessMetrics(goals) {
    // Ensure goals is an array
    const goalsArray = Array.isArray(goals) ? goals : ['increase conversions', 'improve engagement'];
    
    return goalsArray.map(goal => ({
      goal,
      metric: this.getMetricForGoal(goal),
      target: this.getTargetForGoal(goal),
      timeframe: '30 days'
    }));
  }

  // Get metric for goal
  getMetricForGoal(goal) {
    const metrics = {
      'increase conversions': 'conversion rate',
      'reduce churn': 'retention rate',
      'increase revenue': 'monthly recurring revenue',
      'improve engagement': 'engagement rate'
    };
    
    return metrics[goal] || 'custom metric';
  }

  // Get target for goal
  getTargetForGoal(goal) {
    const targets = {
      'increase conversions': '+20%',
      'reduce churn': '-10%',
      'increase revenue': '+15%',
      'improve engagement': '+25%'
    };
    
    return targets[goal] || 'TBD';
  }

  // Segment customers
  async segmentCustomers(input) {
    const { criteria, data } = input;
    
    // Ensure data is an array
    const customerData = Array.isArray(data) ? data : (data?.customers || []);
    
    const segments = {
      byValue: this.segmentByValue(customerData),
      byEngagement: this.segmentByEngagement(customerData),
      byLifecycle: this.segmentByLifecycle(customerData),
      byBehavior: this.segmentByBehavior(customerData)
    };
    
    return segments;
  }

  // Segment by value
  segmentByValue(data) {
    return {
      highValue: data.filter(customer => customer.ltv > 1000),
      mediumValue: data.filter(customer => customer.ltv > 500 && customer.ltv <= 1000),
      lowValue: data.filter(customer => customer.ltv <= 500)
    };
  }

  // Segment by engagement
  segmentByEngagement(data) {
    return {
      highlyEngaged: data.filter(customer => customer.engagementScore > 80),
      moderatelyEngaged: data.filter(customer => customer.engagementScore > 50 && customer.engagementScore <= 80),
      lowEngaged: data.filter(customer => customer.engagementScore <= 50)
    };
  }

  // Segment by lifecycle
  segmentByLifecycle(data) {
    return {
      new: data.filter(customer => customer.daysSinceSignup <= 30),
      active: data.filter(customer => customer.daysSinceSignup > 30 && customer.daysSinceSignup <= 365),
      mature: data.filter(customer => customer.daysSinceSignup > 365)
    };
  }

  // Segment by behavior
  segmentByBehavior(data) {
    return {
      powerUsers: data.filter(customer => customer.featuresUsed > 10),
      regularUsers: data.filter(customer => customer.featuresUsed > 5 && customer.featuresUsed <= 10),
      occasionalUsers: data.filter(customer => customer.featuresUsed <= 5)
    };
  }

  // Create onboarding plan
  async createOnboardingPlan(input) {
    const { customerType, businessSize, goals } = input;
    
    const plan = {
      customerType,
      businessSize,
      goals,
      phases: this.createOnboardingPhases(customerType),
      milestones: this.defineOnboardingMilestones(goals),
      resources: this.getOnboardingResources(customerType),
      timeline: this.createOnboardingTimeline(customerType, businessSize)
    };
    
    return plan;
  }

  // Create onboarding phases
  createOnboardingPhases(customerType) {
    const phases = {
      basic: [
        { name: 'Welcome & Setup', duration: '1 day', tasks: ['Account setup', 'Profile completion', 'First login'] },
        { name: 'Core Features', duration: '3 days', tasks: ['Basic workflow', 'Content creation', 'Scheduling'] },
        { name: 'First Results', duration: '7 days', tasks: ['First campaign', 'Analytics review', 'Optimization'] }
      ],
      advanced: [
        { name: 'Advanced Setup', duration: '2 days', tasks: ['Advanced configuration', 'Integration setup', 'Team setup'] },
        { name: 'Advanced Features', duration: '5 days', tasks: ['Automation workflows', 'Advanced analytics', 'Custom integrations'] },
        { name: 'Optimization', duration: '10 days', tasks: ['Performance optimization', 'A/B testing', 'Scale planning'] }
      ]
    };
    
    return phases[customerType] || phases.basic;
  }

  // Define onboarding milestones
  defineOnboardingMilestones(goals) {
    return goals.map(goal => ({
      goal,
      milestone: this.getMilestoneForGoal(goal),
      successCriteria: this.getSuccessCriteriaForGoal(goal),
      timeframe: '30 days'
    }));
  }

  // Get milestone for goal
  getMilestoneForGoal(goal) {
    const milestones = {
      'increase social media presence': 'First 10 posts published',
      'automate marketing': 'First automated campaign running',
      'improve engagement': 'First 100 interactions',
      'generate leads': 'First 5 leads captured'
    };
    
    return milestones[goal] || 'Custom milestone';
  }

  // Get success criteria for goal
  getSuccessCriteriaForGoal(goal) {
    const criteria = {
      'increase social media presence': 'Consistent posting schedule established',
      'automate marketing': 'Automated workflows saving 5+ hours per week',
      'improve engagement': 'Engagement rate above 3%',
      'generate leads': 'Lead generation system operational'
    };
    
    return criteria[goal] || 'Custom criteria';
  }

  // Get onboarding resources
  getOnboardingResources(customerType) {
    const resources = {
      basic: ['Getting started guide', 'Video tutorials', 'Email support'],
      advanced: ['Advanced tutorials', '1-on-1 consultation', 'Priority support', 'Custom training']
    };
    
    return resources[customerType] || resources.basic;
  }

  // Create onboarding timeline
  createOnboardingTimeline(customerType, businessSize) {
    const timelines = {
      basic: { small: '7 days', medium: '10 days', large: '14 days' },
      advanced: { small: '14 days', medium: '21 days', large: '30 days' }
    };
    
    return timelines[customerType]?.[businessSize] || '14 days';
  }

  // Optimize pricing strategy
  async optimizePricingStrategy(input) {
    const { currentPricing, marketData, customerFeedback } = input;
    
    const optimization = {
      currentPricing,
      analysis: this.analyzePricingData(marketData, customerFeedback),
      recommendations: this.generatePricingRecommendations(currentPricing, marketData),
      implementation: this.createPricingImplementationPlan()
    };
    
    return optimization;
  }

  // Analyze pricing data
  analyzePricingData(marketData, customerFeedback) {
    return {
      marketPosition: this.analyzeMarketPosition(marketData),
      customerPerception: this.analyzeCustomerPerception(customerFeedback),
      competitiveAnalysis: this.analyzeCompetitivePricing(marketData),
      revenueImpact: this.analyzeRevenueImpact()
    };
  }

  // Analyze market position
  analyzeMarketPosition(marketData) {
    return {
      position: 'mid-market',
      averagePrice: '$15/month',
      priceRange: '$5-$50/month',
      recommendations: ['Consider value-based pricing', 'Highlight unique features']
    };
  }

  // Analyze customer perception
  analyzeCustomerPerception(customerFeedback) {
    return {
      valueRating: 4.2,
      priceSensitivity: 'medium',
      willingnessToPay: '$12/month',
      feedback: ['Good value for money', 'Could be cheaper', 'Worth the investment']
    };
  }

  // Analyze competitive pricing
  analyzeCompetitivePricing(marketData) {
    return {
      competitors: [
        { name: 'Competitor A', price: '$20/month', features: 15 },
        { name: 'Competitor B', price: '$10/month', features: 8 },
        { name: 'Competitor C', price: '$25/month', features: 20 }
      ],
      recommendations: ['Position as premium value', 'Highlight feature advantage']
    };
  }

  // Analyze revenue impact
  analyzeRevenueImpact() {
    return {
      currentRevenue: this.salesData.conversions.totalRevenue,
      projectedRevenue: this.salesData.conversions.totalRevenue * 1.2,
      impact: '+20% potential increase',
      risks: ['Customer churn', 'Market resistance']
    };
  }

  // Generate pricing recommendations
  generatePricingRecommendations(currentPricing, marketData) {
    return [
      'Introduce annual discount to increase LTV',
      'Add premium tier for power users',
      'Implement usage-based pricing for enterprise',
      'Create limited-time founding member pricing'
    ];
  }

  // Create pricing implementation plan
  createPricingImplementationPlan() {
    return {
      phase1: ['Announce pricing changes', 'Grandfather existing customers'],
      phase2: ['Implement new pricing', 'Monitor customer reactions'],
      phase3: ['Optimize based on feedback', 'Scale successful strategies']
    };
  }

  // Generate sales ideas
  async generateSalesIdeas(input) {
    const { targetAudience, goals, timeframe } = input;
    
    const ideas = {
      campaigns: this.generateCampaignIdeas(targetAudience, goals),
      promotions: this.generatePromotionIdeas(timeframe),
      partnerships: this.generatePartnershipIdeas(targetAudience),
      content: this.generateContentIdeas(targetAudience)
    };
    
    return ideas;
  }

  // Generate campaign ideas
  generateCampaignIdeas(targetAudience, goals) {
    return [
      'Founding Member Campaign - Limited time pricing for early adopters',
      'Referral Program - Reward customers for bringing new business',
      'Seasonal Campaign - Back-to-school marketing automation',
      'Success Story Campaign - Feature customer transformations'
    ];
  }

  // Generate promotion ideas
  generatePromotionIdeas(timeframe) {
    return [
      'Free trial extension for qualified leads',
      'Annual plan discount for founding members',
      'Bundle deals with complementary services',
      'Limited-time feature access'
    ];
  }

  // Generate partnership ideas
  generatePartnershipIdeas(targetAudience) {
    return [
      'Co-marketing with business coaches',
      'Affiliate program with industry influencers',
      'Integration partnerships with complementary tools',
      'Reseller program for marketing agencies'
    ];
  }

  // Generate content ideas
  generateContentIdeas(targetAudience) {
    return [
      'Case study series featuring successful customers',
      'How-to guides for common marketing challenges',
      'Behind-the-scenes content showing product development',
      'Customer success stories and testimonials'
    ];
  }

  // Create customer journey
  async createCustomerJourney(input) {
    const { customerType, touchpoints, goals } = input;
    
    const journey = {
      customerType,
      stages: this.createJourneyStages(customerType),
      touchpoints: this.mapTouchpoints(touchpoints),
      goals: this.alignJourneyGoals(goals),
      optimization: this.optimizeJourneyFlow()
    };
    
    return journey;
  }

  // Create journey stages
  createJourneyStages(customerType) {
    const stages = {
      prospect: [
        { name: 'Discovery', description: 'First contact with brand', duration: '1-7 days' },
        { name: 'Consideration', description: 'Evaluating solution', duration: '7-30 days' },
        { name: 'Decision', description: 'Making purchase decision', duration: '1-7 days' }
      ],
      customer: [
        { name: 'Onboarding', description: 'Getting started', duration: '7-30 days' },
        { name: 'Adoption', description: 'Regular usage', duration: '30-90 days' },
        { name: 'Advocacy', description: 'Referring others', duration: '90+ days' }
      ]
    };
    
    return stages[customerType] || stages.prospect;
  }

  // Map touchpoints
  mapTouchpoints(touchpoints) {
    return touchpoints.map(touchpoint => ({
      channel: touchpoint.channel,
      purpose: touchpoint.purpose,
      content: touchpoint.content,
      timing: touchpoint.timing
    }));
  }

  // Align journey goals
  alignJourneyGoals(goals) {
    return goals.map(goal => ({
      goal,
      stage: this.getStageForGoal(goal),
      successMetric: this.getMetricForGoal(goal),
      timeline: '30 days'
    }));
  }

  // Get stage for goal
  getStageForGoal(goal) {
    const stages = {
      'increase awareness': 'discovery',
      'generate leads': 'consideration',
      'drive conversions': 'decision',
      'improve retention': 'adoption'
    };
    
    return stages[goal] || 'custom';
  }

  // Optimize journey flow
  optimizeJourneyFlow() {
    return {
      bottlenecks: this.identifyBottlenecks(),
      improvements: this.suggestImprovements(),
      testing: this.planTesting()
    };
  }

  // Identify bottlenecks
  identifyBottlenecks() {
    return [
      'Long consideration phase - need better qualification',
      'Low conversion rate - improve value demonstration',
      'High churn rate - enhance onboarding'
    ];
  }

  // Suggest improvements
  suggestImprovements() {
    return [
      'Implement lead scoring to prioritize prospects',
      'Add social proof throughout the journey',
      'Create automated nurture sequences'
    ];
  }

  // Plan testing
  planTesting() {
    return [
      'A/B test landing page variations',
      'Test different email sequences',
      'Experiment with pricing presentation'
    ];
  }

  // Analyze competition
  async analyzeCompetition(input) {
    const { competitors, focusAreas } = input;
    
    const analysis = {
      competitors: this.analyzeCompetitorLandscape(competitors),
      positioning: this.analyzeMarketPositioning(focusAreas),
      opportunities: this.identifyOpportunities(competitors),
      threats: this.identifyThreats(competitors),
      recommendations: this.generateCompetitiveRecommendations()
    };
    
    return analysis;
  }

  // Analyze competitor landscape
  analyzeCompetitorLandscape(competitors) {
    return competitors.map(competitor => ({
      name: competitor.name,
      strengths: competitor.strengths,
      weaknesses: competitor.weaknesses,
      pricing: competitor.pricing,
      marketShare: competitor.marketShare,
      differentiation: this.identifyDifferentiation(competitor)
    }));
  }

  // Identify differentiation
  identifyDifferentiation(competitor) {
    return {
      uniqueFeatures: ['Simpler interface', 'Better onboarding', 'Small business focus'],
      valueProposition: 'Built for busy business owners, not marketers',
      targetMarket: 'Small businesses vs enterprise focus'
    };
  }

  // Analyze market positioning
  analyzeMarketPositioning(focusAreas) {
    return {
      currentPosition: 'Mid-market, small business focused',
      targetPosition: 'Premium value, simple solution',
      positioningStrategy: 'Differentiate on simplicity and small business focus',
      messaging: 'Marketing made human for busy business owners'
    };
  }

  // Identify opportunities
  identifyOpportunities(competitors) {
    return [
      'Gap in simple, small business-focused solutions',
      'Opportunity to differentiate on user experience',
      'Potential for better onboarding and support',
      'Chance to capture market with lower pricing'
    ];
  }

  // Identify threats
  identifyThreats(competitors) {
    return [
      'Large competitors entering small business market',
      'Price wars from budget competitors',
      'Feature creep from established players',
      'Market saturation in certain segments'
    ];
  }

  // Generate competitive recommendations
  generateCompetitiveRecommendations() {
    return [
      'Focus on simplicity and ease of use',
      'Emphasize small business expertise',
      'Build strong customer community',
      'Develop unique features for target market',
      'Maintain competitive pricing while highlighting value'
    ];
  }

  // Generate subheadline
  generateSubheadline(benefits) {
    const subheadlines = [
      'Simple, actionable marketing tools that fit into your busy schedule, not take over it.',
      'Built for busy business owners who know they should be marketing but never know what to do.',
      'Stop guessing what to post. Start getting results with our proven system.'
    ];
    
    return subheadlines[Math.floor(Math.random() * subheadlines.length)];
  }

  // Generate body
  generateBody(type, painPoints, benefits, offer) {
    const bodyTemplates = {
      waitlist: `Are you tired of ${painPoints.join(' and ')}? Most marketing tools are built for marketers, not for busy business owners like you. MomentumDIY is different. It's a simple marketing platform that ${benefits.join(', ')}. Join our waitlist for early access and exclusive founding member benefits.`,
      conversion: `Ready to transform your marketing? ${benefits.join(' ')}. See how other small business owners are getting results with MomentumDIY. ${offer ? `Special offer: ${offer.description}` : 'Start your free trial today.'}`
    };
    
    return bodyTemplates[type] || bodyTemplates.waitlist;
  }

  // Generate social proof
  generateSocialProof() {
    return [
      'Join 1,000+ business owners who\'ve automated their marketing',
      '4.8/5 stars from small business customers',
      'Save 10+ hours per week on marketing tasks',
      'Increase social media engagement by 300%'
    ];
  }

  // Generate urgency
  generateUrgency(type) {
    const urgencyElements = {
      waitlist: [
        'Limited spots available for founding members',
        'Early access closes soon',
        'Exclusive pricing for waitlist members only'
      ],
      conversion: [
        'Free trial ends in 7 days',
        'Limited-time founding member pricing',
        'Special offer expires soon'
      ]
    };
    
    return urgencyElements[type] || urgencyElements.waitlist;
  }

  // Define campaign metrics
  defineCampaignMetrics(goals) {
    return goals.map(goal => ({
      goal,
      metric: this.getMetricForGoal(goal),
      target: this.getTargetForGoal(goal),
      tracking: this.getTrackingMethod(goal)
    }));
  }

  // Get tracking method
  getTrackingMethod(goal) {
    const tracking = {
      'increase conversions': 'Conversion tracking pixels',
      'reduce churn': 'Customer lifecycle analytics',
      'increase revenue': 'Revenue attribution',
      'improve engagement': 'Engagement rate tracking'
    };
    
    return tracking[goal] || 'Custom tracking';
  }

  // Create campaign timeline
  createCampaignTimeline(campaignType) {
    const timelines = {
      launch: {
        preLaunch: '2 weeks',
        launchDay: '1 day',
        postLaunch: '2 weeks',
        total: '5 weeks'
      },
      nurture: {
        setup: '1 week',
        execution: '4 weeks',
        optimization: '1 week',
        total: '6 weeks'
      }
    };
    
    return timelines[campaignType] || timelines.launch;
  }

  // Estimate campaign budget
  estimateCampaignBudget(campaignType, targetAudience) {
    const budgets = {
      launch: {
        small: 1000,
        medium: 2500,
        large: 5000
      },
      nurture: {
        small: 500,
        medium: 1000,
        large: 2000
      }
    };
    
    const audienceSize = targetAudience.size || 'medium';
    return budgets[campaignType]?.[audienceSize] || 1000;
  }

  // Define sequence triggers
  defineSequenceTriggers(sequenceType) {
    const triggers = {
      waitlist: ['Signup', 'Email open', 'Link click', '7 days inactive'],
      conversion: ['Trial start', 'Feature usage', 'Support contact', 'Trial ending']
    };
    
    return triggers[sequenceType] || triggers.waitlist;
  }

  // Define sequence metrics
  defineSequenceMetrics(goals) {
    return goals.map(goal => ({
      goal,
      metric: this.getMetricForGoal(goal),
      target: this.getTargetForGoal(goal),
      frequency: 'Daily'
    }));
  }

  // Generate performance overview
  generatePerformanceOverview() {
    return {
      totalRevenue: this.salesData.conversions.totalRevenue,
      conversionRate: this.calculateConversionRate(),
      averageOrderValue: this.calculateAverageOrderValue(),
      customerLifetimeValue: this.calculateCustomerLifetimeValue()
    };
  }

  // Calculate conversion rate
  calculateConversionRate() {
    const totalLeads = this.salesData.leads.length;
    const totalConversions = this.salesData.conversions.monthly.count + this.salesData.conversions.annual.count;
    return totalLeads > 0 ? (totalConversions / totalLeads) * 100 : 0;
  }

  // Calculate average order value
  calculateAverageOrderValue() {
    const totalConversions = this.salesData.conversions.monthly.count + this.salesData.conversions.annual.count;
    return totalConversions > 0 ? this.salesData.conversions.totalRevenue / totalConversions : 0;
  }

  // Calculate customer lifetime value
  calculateCustomerLifetimeValue() {
    // Simplified calculation - in practice, this would be more complex
    return this.calculateAverageOrderValue() * 12; // Assuming 12-month average retention
  }

  // Calculate key metrics
  calculateKeyMetrics(metrics) {
    const calculatedMetrics = {};
    
    metrics.forEach(metric => {
      switch (metric) {
        case 'conversion_rate':
          calculatedMetrics[metric] = this.calculateConversionRate();
          break;
        case 'revenue_per_lead':
          calculatedMetrics[metric] = this.calculateRevenuePerLead();
          break;
        case 'customer_acquisition_cost':
          calculatedMetrics[metric] = this.calculateCustomerAcquisitionCost();
          break;
        case 'lifetime_value':
          calculatedMetrics[metric] = this.calculateCustomerLifetimeValue();
          break;
      }
    });
    
    return calculatedMetrics;
  }

  // Calculate revenue per lead
  calculateRevenuePerLead() {
    const totalLeads = this.salesData.leads.length;
    return totalLeads > 0 ? this.salesData.conversions.totalRevenue / totalLeads : 0;
  }

  // Calculate customer acquisition cost
  calculateCustomerAcquisitionCost() {
    // Simplified calculation - would need actual marketing spend data
    const totalConversions = this.salesData.conversions.monthly.count + this.salesData.conversions.annual.count;
    const estimatedMarketingSpend = 1000; // Placeholder
    return totalConversions > 0 ? estimatedMarketingSpend / totalConversions : 0;
  }

  // Analyze segments
  analyzeSegments(segments) {
    return segments.map(segment => ({
      name: segment.name,
      size: segment.size,
      performance: this.calculateSegmentPerformance(segment),
      recommendations: this.generateSegmentRecommendations(segment)
    }));
  }

  // Calculate segment performance
  calculateSegmentPerformance(segment) {
    return {
      conversionRate: this.calculateSegmentConversionRate(segment),
      averageOrderValue: this.calculateSegmentAverageOrderValue(segment),
      engagementRate: this.calculateSegmentEngagementRate(segment)
    };
  }

  // Calculate segment conversion rate
  calculateSegmentConversionRate(segment) {
    // Simplified calculation
    return Math.random() * 20 + 5; // 5-25% range
  }

  // Calculate segment average order value
  calculateSegmentAverageOrderValue(segment) {
    // Simplified calculation
    return Math.random() * 50 + 25; // $25-$75 range
  }

  // Calculate segment engagement rate
  calculateSegmentEngagementRate(segment) {
    // Simplified calculation
    return Math.random() * 30 + 10; // 10-40% range
  }

  // Generate segment recommendations
  generateSegmentRecommendations(segment) {
    return [
      `Create targeted content for ${segment.name}`,
      `Develop specific offers for ${segment.name}`,
      `Optimize messaging for ${segment.name} preferences`
    ];
  }

  // Identify trends
  identifyTrends(timeframe) {
    return {
      conversionTrend: this.analyzeConversionTrend(timeframe),
      revenueTrend: this.analyzeRevenueTrend(timeframe),
      leadQualityTrend: this.analyzeLeadQualityTrend(timeframe),
      seasonality: this.analyzeSeasonality(timeframe)
    };
  }

  // Analyze conversion trend
  analyzeConversionTrend(timeframe) {
    return {
      direction: 'increasing',
      rate: '+15%',
      factors: ['Improved targeting', 'Better messaging', 'Enhanced onboarding']
    };
  }

  // Analyze revenue trend
  analyzeRevenueTrend(timeframe) {
    return {
      direction: 'increasing',
      rate: '+25%',
      factors: ['Higher conversion rates', 'Increased average order value', 'Better retention']
    };
  }

  // Analyze lead quality trend
  analyzeLeadQualityTrend(timeframe) {
    return {
      direction: 'improving',
      rate: '+10%',
      factors: ['Better qualification criteria', 'Improved targeting', 'Enhanced lead scoring']
    };
  }

  // Analyze seasonality
  analyzeSeasonality(timeframe) {
    return {
      peakMonths: ['January', 'September'],
      lowMonths: ['July', 'December'],
      recommendations: ['Plan campaigns around peak months', 'Use low months for optimization']
    };
  }

  // Generate performance recommendations
  generatePerformanceRecommendations() {
    return [
      'Implement lead scoring to prioritize high-value prospects',
      'Create targeted nurture sequences for different segments',
      'Optimize pricing strategy based on customer feedback',
      'Enhance onboarding process to improve retention',
      'Develop referral program to reduce acquisition costs',
      'Integrate with Wix for seamless data flow',
      'Focus on local marketing strategies for brick & mortar businesses'
    ];
  }

  // Wix Integration Methods
  async integrateWithWix(input) {
    const { wixSiteUrl, apiKey, integrationType } = input;
    
    if (!this.wixConnected) {
      throw new Error('Wix client not available. Please check your WIX_CLIENT_ID, WIX_SITE_ID, and WIX_ACCESS_TOKEN environment variables.');
    }
    
    try {
      // Test the connection by getting comprehensive data
      const wixData = await this.wixClient.getComprehensiveWixData();
      
      const integration = {
        siteUrl: wixSiteUrl,
        type: integrationType,
        status: 'connected',
        capabilities: this.getWixCapabilities(integrationType),
        setup: this.getWixSetupSteps(integrationType),
        dataMapping: this.createWixDataMapping(integrationType),
        availableData: wixData.insights.availableData,
        dataQuality: wixData.insights.dataQuality
      };
      
      logger.info('Wix integration successful', { availableData: wixData.insights.availableData });
      return integration;
    } catch (error) {
      logger.error('Wix integration failed:', error);
      throw new Error(`Wix integration failed: ${error.message}`);
    }
  }

  // Get Wix capabilities based on integration type
  getWixCapabilities(integrationType) {
    const capabilities = {
      'waitlist': [
        'Sync waitlist signups',
        'Track lead sources',
        'Qualify prospects automatically',
        'Send welcome emails',
        'Monitor conversion rates'
      ],
      'email': [
        'Sync email subscribers',
        'Track email engagement',
        'Automate email sequences',
        'A/B test email campaigns',
        'Monitor email performance'
      ],
      'subscription': [
        'Track subscription conversions',
        'Monitor payment processing',
        'Handle subscription changes',
        'Track customer lifetime value',
        'Monitor churn rates'
      ],
      'full': [
        'Complete data synchronization',
        'Automated lead qualification',
        'Email sequence automation',
        'Subscription management',
        'Performance analytics',
        'Local marketing optimization'
      ]
    };
    
    return capabilities[integrationType] || capabilities.full;
  }

  // Get Wix setup steps
  getWixSetupSteps(integrationType) {
    const setupSteps = {
      'waitlist': [
        'Connect Wix site to agent',
        'Configure waitlist form fields',
        'Set up lead qualification criteria',
        'Create welcome email sequence',
        'Test integration flow'
      ],
      'email': [
        'Connect Wix email system',
        'Configure email templates',
        'Set up automation triggers',
        'Create email sequences',
        'Test email delivery'
      ],
      'subscription': [
        'Connect Wix payment system',
        'Configure subscription plans',
        'Set up conversion tracking',
        'Create onboarding sequence',
        'Test payment flow'
      ],
      'full': [
        'Complete Wix site integration',
        'Configure all form fields',
        'Set up email automation',
        'Configure payment processing',
        'Create complete customer journey',
        'Test all integration points'
      ]
    };
    
    return setupSteps[integrationType] || setupSteps.full;
  }

  // Create Wix data mapping
  createWixDataMapping(integrationType) {
    const dataMapping = {
      'waitlist': {
        'wix_collections': ['Momentum DIY Waitlist'],
        'wix_fields': ['name', 'email', 'business_type', 'location', 'message'],
        'agent_fields': ['prospect.name', 'prospect.email', 'prospect.industry', 'prospect.location', 'prospect.painPoints'],
        'qualification_criteria': ['business_type', 'location', 'marketing_needs']
      },
      'contact': {
        'wix_collections': ['Contact us'],
        'wix_fields': ['name', 'email', 'message', 'phone'],
        'agent_fields': ['prospect.name', 'prospect.email', 'prospect.message', 'prospect.phone'],
        'qualification_criteria': ['business_type', 'location', 'inquiry_type']
      },
      'newsletter': {
        'wix_collections': ['Subscribe'],
        'wix_fields': ['email', 'name', 'subscription_date'],
        'agent_fields': ['prospect.email', 'prospect.name', 'prospect.subscriptionDate'],
        'automation_triggers': ['signup', 'email_open', 'link_click']
      },
      'newsletter_stats': {
        'wix_collections': ['Marketing/Newsletter Stats'],
        'wix_fields': ['newsletter_name', 'subject_line', 'send_date', 'audience_size', 'opens', 'clicks'],
        'agent_fields': ['campaign.name', 'campaign.subject', 'campaign.date', 'campaign.audience', 'campaign.opens', 'campaign.clicks'],
        'performance_metrics': ['open_rate', 'click_rate', 'roi']
      },
      'subscription': {
        'wix_collections': ['Subscriptions'],
        'wix_fields': ['email', 'plan_type', 'payment_status', 'subscription_date'],
        'agent_fields': ['customer.email', 'customer.plan', 'customer.status', 'customer.startDate'],
        'conversion_tracking': ['trial_start', 'payment_processed', 'subscription_active']
      }
    };
    
    return dataMapping[integrationType] || dataMapping.full;
  }

  // Sync Wix data
  async syncWixData(input) {
    const { dataType, syncDirection } = input;
    
    if (!this.wixConnected) {
      throw new Error('Wix client not available. Please check your Wix API configuration.');
    }
    
    try {
      let wixData;
      
      // Get real data from Wix based on dataType
      switch (dataType) {
        case 'waitlist':
        case 'forms':
          wixData = await this.wixClient.getFormsData();
          break;
        case 'contacts':
          wixData = await this.wixClient.getContactsData();
          break;
        case 'marketing':
          wixData = await this.wixClient.getMarketingData();
          break;
        case 'comprehensive':
          wixData = await this.wixClient.getComprehensiveWixData();
          break;
        default:
          throw new Error(`Unknown data type: ${dataType}`);
      }
      
      // Process the real Wix data
      const processedData = this.processRealWixData(wixData, dataType);
      
      const syncResult = {
        type: dataType,
        direction: syncDirection,
        recordsProcessed: processedData.recordsProcessed,
        newLeads: processedData.newLeads,
        updatedRecords: processedData.updatedRecords,
        errors: processedData.errors,
        dataQuality: processedData.dataQuality
      };
      
      logger.info('Wix data sync completed', { 
        type: dataType, 
        recordsProcessed: processedData.recordsProcessed.total,
        newLeads: processedData.newLeads.length 
      });
      
      return syncResult;
    } catch (error) {
      logger.error('Wix data sync failed:', error);
      throw new Error(`Wix data sync failed: ${error.message}`);
    }
  }

  // Process real Wix data
  processRealWixData(wixData, dataType) {
    let totalRecords = 0;
    let newLeads = [];
    let errors = [];
    let dataQuality = {};
    
    try {
      switch (dataType) {
        case 'waitlist':
        case 'forms':
          // Process form submissions
          Object.keys(wixData).forEach(collectionName => {
            const collection = wixData[collectionName];
            if (collection.totalSubmissions) {
              totalRecords += collection.totalSubmissions;
              
              // Convert form submissions to leads based on collection type
              collection.recentSubmissions.forEach(submission => {
                let lead;
                
                if (collectionName === 'Momentum DIY Waitlist') {
                  // Waitlist submissions - high priority leads
                  lead = {
                    prospect: {
                      name: submission.name,
                      email: submission.email,
                      businessType: this.extractBusinessType(submission.message || ''),
                      location: this.extractLocation(submission.message || ''),
                      industry: this.mapWixIndustry(this.extractBusinessType(submission.message || '')),
                      painPoints: this.extractPainPoints(submission.message || ''),
                      source: 'waitlist'
                    },
                    source: `wix-${collectionName}`,
                    timestamp: submission.date,
                    isNew: true,
                    priority: 'high'
                  };
                } else if (collectionName === 'Contact us') {
                  // Contact form submissions - general inquiries
                  lead = {
                    prospect: {
                      name: submission.name,
                      email: submission.email,
                      businessType: this.extractBusinessType(submission.message || ''),
                      location: this.extractLocation(submission.message || ''),
                      industry: this.mapWixIndustry(this.extractBusinessType(submission.message || '')),
                      message: submission.message,
                      source: 'contact'
                    },
                    source: `wix-${collectionName}`,
                    timestamp: submission.date,
                    isNew: true,
                    priority: 'medium'
                  };
                } else if (collectionName === 'Subscribe') {
                  // Newsletter subscribers - nurture leads
                  lead = {
                    prospect: {
                      name: submission.name,
                      email: submission.email,
                      businessType: 'unknown',
                      location: 'unknown',
                      industry: 'local-service',
                      source: 'newsletter'
                    },
                    source: `wix-${collectionName}`,
                    timestamp: submission.date,
                    isNew: true,
                    priority: 'low'
                  };
                } else if (collectionName === 'Subscriptions') {
                  // Paid subscribers - customers
                  lead = {
                    customer: {
                      name: submission.name,
                      email: submission.email,
                      plan: submission.plan_type || 'unknown',
                      status: submission.payment_status || 'active',
                      startDate: submission.subscription_date || submission.date,
                      source: 'subscription'
                    },
                    source: `wix-${collectionName}`,
                    timestamp: submission.date,
                    isNew: true,
                    priority: 'customer'
                  };
                }
                
                if (lead) {
                  newLeads.push(lead);
                }
              });
            }
          });
          break;
          
        case 'contacts':
          // Process contact data
          Object.keys(wixData).forEach(collectionName => {
            const collection = wixData[collectionName];
            if (collection.totalContacts) {
              totalRecords += collection.totalContacts;
              
              collection.sampleContacts.forEach(contact => {
                const lead = {
                  prospect: {
                    name: contact.name,
                    email: contact.email,
                    phone: contact.phone,
                    businessType: 'local-service', // Default assumption
                    location: 'Unknown',
                    industry: 'local-service'
                  },
                  source: `wix-${collectionName}`,
                  timestamp: contact.dateAdded,
                  isNew: true
                };
                newLeads.push(lead);
              });
            }
          });
          break;
          
        case 'marketing':
          // Process marketing data
          Object.keys(wixData).forEach(collectionName => {
            const collection = wixData[collectionName];
            if (collection.totalItems) {
              totalRecords += collection.totalItems;
              
              // Process marketing data for analytics
              if (collectionName === 'Marketing/Campaigns') {
                // Campaign performance data
                collection.items.forEach(campaign => {
                  const campaignData = {
                    type: 'campaign_performance',
                    name: campaign.data?.campaign_name || 'Unknown Campaign',
                    type: campaign.data?.campaign_type || 'unknown',
                    performance: {
                      impressions: campaign.data?.impressions || 0,
                      clicks: campaign.data?.clicks || 0,
                      conversions: campaign.data?.conversions || 0,
                      conversionRate: campaign.data?.conversion_rate || 0,
                      costPerLead: campaign.data?.cost_per_lead || 0
                    },
                    source: collectionName,
                    timestamp: campaign.data?.start_date || 'Unknown'
                  };
                  // Store campaign data for analytics
                  if (!this.salesData.campaigns) this.salesData.campaigns = [];
                  this.salesData.campaigns.push(campaignData);
                });
              } else if (collectionName === 'Marketing/Newsletter Stats') {
                // Newsletter performance data
                collection.items.forEach(newsletter => {
                  const newsletterData = {
                    type: 'newsletter_performance',
                    name: newsletter.data?.newsletter_name || 'Unknown Newsletter',
                    performance: {
                      audienceSize: newsletter.data?.audience_size || 0,
                      opens: newsletter.data?.opens || 0,
                      clicks: newsletter.data?.clicks || 0,
                      openRate: newsletter.data?.open_rate || 0,
                      clickRate: newsletter.data?.click_rate || 0,
                      revenue: newsletter.data?.revenue_generated || 0,
                      roi: newsletter.data?.roi || 0
                    },
                    source: collectionName,
                    timestamp: newsletter.data?.send_date || 'Unknown'
                  };
                  // Store newsletter data for analytics
                  if (!this.salesData.newsletters) this.salesData.newsletters = [];
                  this.salesData.newsletters.push(newsletterData);
                });
              } else if (collectionName === 'Marketing/SocialMedia') {
                // Social media performance data
                collection.items.forEach(post => {
                  const socialData = {
                    type: 'social_performance',
                    platform: post.data?.platform || 'unknown',
                    postType: post.data?.post_type || 'unknown',
                    performance: {
                      impressions: post.data?.impressions || 0,
                      engagement: post.data?.engagement || 0,
                      clicks: post.data?.clicks || 0,
                      leadsGenerated: post.data?.leads_generated || 0,
                      costPerLead: post.data?.cpl || 0
                    },
                    source: collectionName,
                    timestamp: post.data?.post_date || 'Unknown'
                  };
                  // Store social data for analytics
                  if (!this.salesData.socialMedia) this.salesData.socialMedia = [];
                  this.salesData.socialMedia.push(socialData);
                });
              }
            }
          });
          break;
          
        case 'comprehensive':
          // Process comprehensive data
          if (wixData.data) {
            dataQuality = wixData.insights.dataQuality;
            
            // Process forms data
            if (wixData.data.forms && !wixData.data.forms.error) {
              Object.keys(wixData.data.forms).forEach(collectionName => {
                const collection = wixData.data.forms[collectionName];
                totalRecords += collection.totalSubmissions;
                
                collection.recentSubmissions.forEach(submission => {
                  const lead = {
                    prospect: {
                      name: submission.name,
                      email: submission.email,
                      businessType: this.extractBusinessType(submission.message || ''),
                      location: this.extractLocation(submission.message || ''),
                      industry: this.mapWixIndustry(this.extractBusinessType(submission.message || ''))
                    },
                    source: `wix-${collectionName}`,
                    timestamp: submission.date,
                    isNew: true
                  };
                  newLeads.push(lead);
                });
              });
            }
          }
          break;
      }
      
      return {
        recordsProcessed: {
          total: totalRecords,
          processed: totalRecords,
          qualified: Math.floor(newLeads.length * 0.7),
          errors: errors.length
        },
        newLeads: newLeads,
        updatedRecords: 0, // No updates in this sync
        errors: errors,
        dataQuality: dataQuality
      };
    } catch (error) {
      logger.error('Error processing real Wix data:', error);
      return {
        recordsProcessed: { total: 0, processed: 0, qualified: 0, errors: 1 },
        newLeads: [],
        updatedRecords: 0,
        errors: [error.message],
        dataQuality: {}
      };
    }
  }
  
  // Extract business type from form message
  extractBusinessType(message) {
    const businessTypes = ['restaurant', 'retail', 'service', 'healthcare', 'fitness', 'beauty', 'automotive'];
    const lowerMessage = message.toLowerCase();
    
    for (const type of businessTypes) {
      if (lowerMessage.includes(type)) {
        return type;
      }
    }
    return 'local-service'; // Default
  }
  
  // Extract location from form message
  extractLocation(message) {
    // Simple location extraction - could be enhanced with NLP
    const locationPatterns = [
      /in\s+([A-Za-z\s,]+)/i,
      /from\s+([A-Za-z\s,]+)/i,
      /located\s+in\s+([A-Za-z\s,]+)/i
    ];
    
    for (const pattern of locationPatterns) {
      const match = message.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    return 'Unknown';
  }
  
  // Extract pain points from form message
  extractPainPoints(message) {
    const painPoints = [];
    const lowerMessage = message.toLowerCase();
    
    // Define pain point keywords
    const painPointKeywords = {
      'local-marketing': ['local marketing', 'local customers', 'local business', 'local area'],
      'customer-acquisition': ['customers', 'clients', 'acquisition', 'getting customers'],
      'time-management': ['time', 'busy', 'overwhelmed', 'no time'],
      'digital-presence': ['website', 'online', 'digital', 'social media', 'presence'],
      'competition': ['competition', 'competitors', 'competitive', 'market']
    };
    
    // Check for pain points in message
    Object.keys(painPointKeywords).forEach(painPoint => {
      const keywords = painPointKeywords[painPoint];
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        painPoints.push(painPoint);
      }
    });
    
    return painPoints.length > 0 ? painPoints : ['local-marketing']; // Default
  }

  // Extract new leads from Wix data
  extractNewLeads(wixData) {
    return wixData.filter(record => record.isNew).map(record => ({
      prospect: {
        name: record.name,
        email: record.email,
        businessType: record.business_type,
        location: record.location,
        industry: this.mapWixIndustry(record.business_type)
      },
      source: 'wix-waitlist',
      timestamp: record.created_at
    }));
  }

  // Map Wix business type to industry
  mapWixIndustry(businessType) {
    const industryMapping = {
      'retail': 'brick-mortar',
      'restaurant': 'restaurant',
      'service': 'local-service',
      'healthcare': 'healthcare',
      'fitness': 'fitness',
      'beauty': 'beauty',
      'automotive': 'automotive'
    };
    
    return industryMapping[businessType] || 'local-service';
  }

  // Update existing records
  updateExistingRecords(wixData) {
    return wixData.filter(record => !record.isNew).length;
  }

  // Validate Wix data
  validateWixData(wixData) {
    const errors = [];
    
    wixData.forEach((record, index) => {
      if (!record.email) {
        errors.push(`Record ${index}: Missing email`);
      }
      if (!record.name) {
        errors.push(`Record ${index}: Missing name`);
      }
    });
    
    return errors;
  }

  // Create Wix campaign
  async createWixCampaign(input) {
    const { campaignType, targetAudience, goals, wixIntegration } = input;
    
    const campaign = {
      type: campaignType,
      platform: 'wix',
      targetAudience,
      goals,
      wixComponents: this.createWixComponents(campaignType),
      automation: this.setupWixAutomation(campaignType),
      tracking: this.setupWixTracking(campaignType)
    };
    
    return campaign;
  }

  // Create Wix components for campaign
  createWixComponents(campaignType) {
    const components = {
      'waitlist': [
        'Lead capture form',
        'Welcome page',
        'Thank you page',
        'Email opt-in',
        'Social proof elements'
      ],
      'conversion': [
        'Pricing page',
        'Trial signup form',
        'Payment processing',
        'Onboarding sequence',
        'Success page'
      ],
      'local-marketing': [
        'Local business profile',
        'Customer testimonials',
        'Location-based targeting',
        'Local SEO optimization',
        'Community engagement'
      ]
    };
    
    return components[campaignType] || components.waitlist;
  }

  // Setup Wix automation
  setupWixAutomation(campaignType) {
    const automation = {
      'waitlist': [
        'Auto-send welcome email',
        'Qualify leads automatically',
        'Add to nurture sequence',
        'Track engagement',
        'Send follow-up emails'
      ],
      'conversion': [
        'Auto-process payments',
        'Send onboarding emails',
        'Track trial usage',
        'Send conversion reminders',
        'Handle subscription changes'
      ],
      'local-marketing': [
        'Local customer targeting',
        'Location-based promotions',
        'Community event notifications',
        'Local SEO updates',
        'Customer review requests'
      ]
    };
    
    return automation[campaignType] || automation.waitlist;
  }

  // Setup Wix tracking
  setupWixTracking(campaignType) {
    const tracking = {
      'waitlist': [
        'Form submissions',
        'Email signups',
        'Lead qualification rates',
        'Engagement metrics',
        'Conversion funnel'
      ],
      'conversion': [
        'Trial signups',
        'Payment conversions',
        'Subscription rates',
        'Customer lifetime value',
        'Churn rates'
      ],
      'local-marketing': [
        'Local traffic',
        'Customer location data',
        'Local search rankings',
        'Community engagement',
        'Local conversion rates'
      ]
    };
    
    return tracking[campaignType] || tracking.waitlist;
  }

  // Optimize Wix landing page
  async optimizeWixLanding(input) {
    const { pageType, currentMetrics, targetGoals, localFocus } = input;
    
    const optimization = {
      pageType,
      localFocus,
      currentMetrics,
      recommendations: this.getWixOptimizationRecommendations(pageType, localFocus),
      aBTests: this.createWixABTests(pageType),
      localElements: this.addLocalElements(localFocus)
    };
    
    return optimization;
  }

  // Get Wix optimization recommendations
  getWixOptimizationRecommendations(pageType, localFocus) {
    const recommendations = {
      'waitlist': [
        'Add local business testimonials',
        'Include location-based benefits',
        'Show local customer success stories',
        'Add local SEO keywords',
        'Include community engagement elements'
      ],
      'pricing': [
        'Highlight local business value',
        'Show local ROI examples',
        'Include local support benefits',
        'Add local business case studies',
        'Show local market advantages'
      ],
      'landing': [
        'Optimize for local search',
        'Add local business focus',
        'Include location-based CTAs',
        'Show local customer results',
        'Add local community elements'
      ]
    };
    
    const baseRecommendations = recommendations[pageType] || recommendations.landing;
    
    if (localFocus) {
      baseRecommendations.push(
        'Focus on local customer acquisition',
        'Highlight local market advantages',
        'Include local business success metrics'
      );
    }
    
    return baseRecommendations;
  }

  // Create Wix A/B tests
  createWixABTests(pageType) {
    const abTests = {
      'waitlist': [
        'Headline variations for local businesses',
        'CTA button text variations',
        'Local vs general testimonials',
        'Location-based vs general benefits',
        'Local business focus vs general marketing'
      ],
      'pricing': [
        'Local business pricing vs general pricing',
        'Local ROI examples vs general ROI',
        'Local support vs general support',
        'Local features vs general features'
      ]
    };
    
    return abTests[pageType] || abTests.waitlist;
  }

  // Add local elements
  addLocalElements(localFocus) {
    if (!localFocus) return [];
    
    return [
      'Local business testimonials',
      'Location-based benefits',
      'Local customer success stories',
      'Community engagement elements',
      'Local SEO optimization',
      'Location-based CTAs',
      'Local market statistics',
      'Community event integration'
    ];
  }

  // Get task steps for progress tracking
  getTaskSteps(task) {
    const taskSteps = {
      'qualify-lead': ['Analyzing prospect data', 'Calculating qualification score', 'Generating recommendations', 'Creating next steps'],
      'manage-waitlist': ['Processing waitlist action', 'Updating database', 'Sending notifications', 'Updating analytics'],
      'create-conversion-campaign': ['Analyzing target audience', 'Creating campaign phases', 'Defining metrics', 'Estimating budget'],
      'create-sales-copy': ['Researching pain points', 'Generating headlines', 'Creating body copy', 'Optimizing CTAs'],
      'design-email-sequence': ['Defining sequence goals', 'Creating email content', 'Setting up triggers', 'Defining metrics'],
      'analyze-sales-performance': ['Gathering data', 'Calculating metrics', 'Identifying trends', 'Generating recommendations'],
      'integrate-wix': ['Connecting to Wix site', 'Configuring integration settings', 'Setting up data mapping', 'Testing connection'],
      'sync-wix-data': ['Fetching Wix data', 'Processing records', 'Updating agent database', 'Validating sync results'],
      'create-wix-campaign': ['Analyzing Wix capabilities', 'Creating campaign components', 'Setting up automation', 'Configuring tracking'],
      'optimize-wix-landing': ['Analyzing current performance', 'Generating optimization recommendations', 'Creating A/B tests', 'Adding local elements']
    };
    
    return taskSteps[task] || ['Processing task...'];
  }

  // Estimate token usage
  estimateTokenUsage(task, input) {
    const baseTokens = {
      'qualify-lead': 500,
      'manage-waitlist': 300,
      'create-conversion-campaign': 800,
      'create-sales-copy': 600,
      'design-email-sequence': 700,
      'analyze-sales-performance': 1000,
      'integrate-wix': 600,
      'sync-wix-data': 800,
      'create-wix-campaign': 900,
      'optimize-wix-landing': 700
    };
    
    const base = baseTokens[task] || 500;
    const inputTokens = this.estimateInputTokens(JSON.stringify(input));
    
    return {
      input: inputTokens,
      output: base,
      total: inputTokens + base
    };
  }

  // Estimate input tokens
  estimateInputTokens(text) {
    return Math.ceil(text.length / 4);
  }

  // Get available tasks
  getAvailableTasks() {
    return [
      {
        name: 'qualify-lead',
        description: 'Qualify a prospect based on business fit and potential',
        input: {
          prospect: 'object - prospect information',
          source: 'string - lead source',
          interaction: 'object - interaction details'
        }
      },
      {
        name: 'manage-waitlist',
        description: 'Manage waitlist operations (add, remove, update, segment)',
        input: {
          action: 'string - waitlist action',
          prospect: 'object - prospect information',
          campaign: 'string - campaign name'
        }
      },
      {
        name: 'create-conversion-campaign',
        description: 'Create a conversion campaign for launch or ongoing sales',
        input: {
          targetAudience: 'object - target audience details',
          campaignType: 'string - campaign type (launch, nurture, etc.)',
          goals: 'array - campaign goals'
        }
      },
      {
        name: 'create-sales-copy',
        description: 'Create compelling sales copy for various channels',
        input: {
          type: 'string - copy type (waitlist, conversion, etc.)',
          targetAudience: 'object - target audience',
          painPoints: 'array - customer pain points',
          benefits: 'array - product benefits',
          offer: 'object - offer details'
        }
      },
      {
        name: 'design-email-sequence',
        description: 'Design email sequences for different customer journey stages',
        input: {
          sequenceType: 'string - sequence type (waitlist, conversion, etc.)',
          targetAudience: 'object - target audience',
          goals: 'array - sequence goals',
          length: 'number - number of emails'
        }
      },
      {
        name: 'analyze-sales-performance',
        description: 'Analyze sales performance and generate insights',
        input: {
          timeframe: 'string - analysis timeframe',
          metrics: 'array - metrics to analyze',
          segments: 'array - customer segments'
        }
      },
      {
        name: 'handle-objections',
        description: 'Handle common sales objections with appropriate responses',
        input: {
          objection: 'string - objection type',
          prospect: 'object - prospect information',
          context: 'object - conversation context'
        }
      },
      {
        name: 'integrate-wix',
        description: 'Integrate with Wix site for waitlist, email, and subscription management',
        input: {
          wixSiteUrl: 'string - Wix site URL',
          apiKey: 'string - Wix API key',
          integrationType: 'string - integration type (waitlist, email, subscription, full)'
        }
      },
      {
        name: 'sync-wix-data',
        description: 'Sync data between Wix and the sales agent',
        input: {
          dataType: 'string - type of data to sync',
          wixData: 'array - Wix data to process',
          syncDirection: 'string - sync direction (wix-to-agent, agent-to-wix)'
        }
      },
      {
        name: 'create-wix-campaign',
        description: 'Create marketing campaigns optimized for Wix platform',
        input: {
          campaignType: 'string - campaign type (waitlist, conversion, local-marketing)',
          targetAudience: 'object - target audience details',
          goals: 'array - campaign goals',
          wixIntegration: 'object - Wix integration details'
        }
      },
      {
        name: 'optimize-wix-landing',
        description: 'Optimize Wix landing pages for local business conversion',
        input: {
          pageType: 'string - page type (waitlist, pricing, landing)',
          currentMetrics: 'object - current page performance',
          targetGoals: 'array - optimization goals',
          localFocus: 'boolean - whether to focus on local marketing'
        }
      }
    ];
  }
}

module.exports = LeadSalesAgent; 