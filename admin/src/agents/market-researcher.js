require('dotenv').config();
const logger = require('../utils/logger');
const { newsAPIClient, serpAPIClient } = require('../utils/api-clients');
const ResourceManager = require('../utils/resource-manager');
const ResearchDatabase = require('../utils/research-database');
const BaseAgent = require('./base-agent');
const { getFullBrandContext } = require('../utils/brand-knowledge');

class MarketResearcher extends BaseAgent {
  constructor(resourceManager = null) {
    super();
    
    this.modelConfig = {
      primary: 'gpt-4o-mini',
      fallback: 'gpt-3.5-turbo',
      maxRetries: 3
    };
    
    this.name = 'Market Researcher';
    this.description = 'AI-powered market research agent - Gathers real-time market intelligence, competitor analysis, and industry trends';
    this.status = 'active';
    this.lastActivity = new Date().toISOString();
    
    this.resourceManager = resourceManager || new ResourceManager();
    this.researchDatabase = new ResearchDatabase();
    this.newsAPI = newsAPIClient();
    this.serpAPI = serpAPIClient();
    
    // Real competitor analysis targets
    this.competitorTargets = [
      'HubSpot',
      'Mailchimp', 
      'Constant Contact',
      'ConvertKit',
      'ActiveCampaign',
      'Klaviyo',
      'Drip',
      'GetResponse',
      'AWeber',
      'SendinBlue'
    ];
    
    // Real market research focus areas
    this.researchFocusAreas = [
      'email marketing automation',
      'small business marketing tools',
      'marketing automation platforms',
      'lead generation software',
      'customer relationship management',
      'social media management',
      'content marketing platforms',
      'analytics and reporting tools'
    ];
    
    // Load comprehensive brand context from brand knowledge module
    this.brandContext = getFullBrandContext();
  }

  getInfo() {
    return {
      id: 'market-researcher',
      name: this.name,
      description: this.description,
      status: this.status,
      capabilities: [
        'Real-time Market Intelligence',
        'Competitor Analysis',
        'Trend Analysis',
        'Content Gap Identification',
        'Opportunity Assessment'
      ],
      lastActivity: this.lastActivity,
      apis: {
        newsApi: !!process.env.NEWS_API_KEY,
        serpApi: !!process.env.SERP_API_KEY
      }
    };
  }

  updateActivity() {
    this.lastActivity = new Date().toISOString();
  }

  async executeWithProgress(task, input, onProgress) {
    const startTime = Date.now();
    let totalTokens = { input: 0, output: 0, total: 0 };
    
    try {
      this.updateActivity();
      this.initializeTrace(task, input);
      
      logger.info(`Market Researcher executing task: ${task}`, { input });

      onProgress({
        progress: 0,
        step: 'Initializing market research...',
        steps: ['Initializing', 'Data Collection', 'Analysis', 'Insights', 'Completing']
      });

      let result;
      
      switch (task) {
        case 'find_brand_opportunities':
          onProgress({ progress: 10, step: 'Starting comprehensive market analysis...' });
          result = await this.findBrandOpportunitiesWithProgress(input, onProgress, totalTokens);
          break;
        default:
          throw new Error(`Unknown task: ${task}`);
      }

      onProgress({ 
        progress: 100, 
        step: 'Research completed successfully',
        tokenUsage: totalTokens
      });

      return result;
    } catch (error) {
      this.logError(error, 'executeWithProgress');
      logger.error('Market Researcher execution error:', error);
      throw error;
    }
  }

  async findBrandOpportunitiesWithProgress(input, onProgress, totalTokens) {
    try {
      const { timeframe = '7d', focusAreas = [] } = input;
      
      this.logWorkflowStep('Initialization', 0, 'Starting comprehensive market analysis');
      onProgress({ progress: 10, step: 'Analyzing market landscape...' });
      
      // Check if we have fresh cached data (less than 5 days old)
      const researchStats = this.researchDatabase.getDatabaseStats();
      const daysSinceResearch = researchStats.daysSinceLastResearch;
      const isResearchFresh = daysSinceResearch <= 5;
      
      this.logTrace(
        'CACHE_CHECK',
        `Research database check: ${daysSinceResearch} days old, fresh: ${isResearchFresh}`,
        { daysSinceResearch, isResearchFresh, totalEntries: researchStats.totalEntries }
      );
      
      let competitorAnalysis, marketTrends, contentGaps, opportunities;
      
      if (isResearchFresh && researchStats.totalEntries > 0) {
        // Use cached data if it's fresh
        this.logWorkflowStep('Cache Retrieval', 20, 'Using cached research data');
        onProgress({ progress: 20, step: 'Retrieving cached research data...' });
        
        const cachedData = this.researchDatabase.getAllData();
        competitorAnalysis = cachedData.competitorAnalysis || [];
        marketTrends = cachedData.marketTrends || [];
        contentGaps = cachedData.contentGaps || [];
        opportunities = cachedData.opportunities || [];
        
        this.logTrace(
          'CACHE_USED',
          `Using cached data: ${opportunities.length} opportunities, ${marketTrends.length} trends`,
          { opportunitiesCount: opportunities.length, trendsCount: marketTrends.length }
        );
      } else {
        // Perform fresh analysis if data is stale or empty
        this.logWorkflowStep('Fresh Analysis', 20, 'Performing fresh market analysis');
        onProgress({ progress: 20, step: 'Researching competitor strategies...' });
        
        // Step 1: Real competitor analysis
        competitorAnalysis = await this.analyzeRealCompetitors();
        
        // Step 2: Market trend analysis
        this.logWorkflowStep('Market Trends', 40, 'Analyzing market trends');
        onProgress({ progress: 40, step: 'Analyzing market trends and opportunities...' });
        
        marketTrends = await this.analyzeMarketTrends();
        
        // Step 3: Content gap analysis
        this.logWorkflowStep('Content Gaps', 60, 'Identifying content gaps');
        onProgress({ progress: 60, step: 'Identifying content gaps and opportunities...' });
        
        contentGaps = await this.identifyContentGaps(competitorAnalysis, marketTrends);
        
        // Step 4: Opportunity prioritization
        this.logWorkflowStep('Opportunity Assessment', 80, 'Assessing opportunities');
        onProgress({ progress: 80, step: 'Assessing and prioritizing opportunities...' });
        
        opportunities = await this.assessOpportunities(contentGaps, marketTrends);
        
        // Step 5: Final analysis
        this.logWorkflowStep('Final Analysis', 90, 'Finalizing analysis');
        onProgress({ progress: 90, step: 'Finalizing market analysis...' });
        
        // Note: finalAnalysis will be created outside the if-else block
      }
      
      // Create final analysis (same for both cached and fresh data)
      const finalAnalysis = await this.createFinalAnalysis(opportunities, competitorAnalysis, marketTrends);
      
      this.logWorkflowStep('Completion', 100, 'Analysis completed');
      onProgress({ progress: 100, step: 'Market analysis completed' });
      
      this.logTrace(
        'EXECUTION_COMPLETE',
        `Comprehensive market analysis completed with ${opportunities.length} opportunities`,
        {
          totalOpportunities: opportunities.length,
          competitorsAnalyzed: competitorAnalysis.length,
          marketTrendsFound: marketTrends.length,
          contentGapsIdentified: contentGaps.length,
          traceSummary: this.getTraceSummary()
        }
      );
      
      return {
        task: 'find_brand_opportunities',
        status: 'completed',
        opportunities: opportunities,
        competitorAnalysis: competitorAnalysis,
        marketTrends: marketTrends,
        contentGaps: contentGaps,
        finalAnalysis: finalAnalysis,
        brandContext: this.brandContext,
        trace: this.getTrace(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logError(error, 'findBrandOpportunitiesWithProgress');
      logger.error('Error finding brand opportunities:', error);
      throw error;
    }
  }

  async analyzeRealCompetitors() {
    try {
      this.logTrace(
        'COMPETITOR_ANALYSIS_START',
        `Starting real competitor analysis for ${this.competitorTargets.length} competitors`,
        { competitors: this.competitorTargets }
      );
      
      const competitorData = [];
      
      for (let i = 0; i < this.competitorTargets.length; i++) {
        const competitor = this.competitorTargets[i];
        
        this.logTrace(
          'COMPETITOR_ANALYSIS',
          `Analyzing competitor ${i + 1}/${this.competitorTargets.length}: ${competitor}`,
          { competitor, index: i + 1 }
        );
        
        try {
          // Get real news about the competitor
          const news = await this.getCompetitorNews(competitor);
          
          // Analyze competitor's market position
          const analysis = await this.analyzeCompetitorPosition(competitor, news);
          
          competitorData.push({
            name: competitor,
            news: news,
            analysis: analysis,
            timestamp: new Date().toISOString()
          });
          
          this.logTrace(
            'COMPETITOR_ANALYSIS_COMPLETE',
            `Completed analysis for ${competitor}`,
            { 
              competitor, 
              newsCount: news.length,
              analysisComplete: true
            }
          );
          
        } catch (error) {
          this.logTrace(
            'COMPETITOR_ANALYSIS_ERROR',
            `Error analyzing ${competitor}: ${error.message}`,
            { competitor, error: error.message }
          );
          
          // Re-throw the error instead of using fallback data
          throw new Error(`Failed to analyze competitor ${competitor}: ${error.message}. No fallback data will be generated.`);
        }
        
        // Rate limiting
        if (i < this.competitorTargets.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      this.logTrace(
        'COMPETITOR_ANALYSIS_COMPLETE',
        `Completed competitor analysis for all ${this.competitorTargets.length} competitors`,
        {
          totalCompetitors: this.competitorTargets.length,
          successfulAnalyses: competitorData.filter(c => !c.error).length,
          failedAnalyses: competitorData.filter(c => c.error).length
        }
      );
      
      return competitorData;
    } catch (error) {
      this.logError(error, 'analyzeRealCompetitors');
      throw new Error(`Failed to analyze real competitors: ${error.message}. No fallback data will be generated.`);
    }
  }

  async getCompetitorNews(competitor) {
    try {
      this.logTrace(
        'NEWS_API_REQUEST',
        `Fetching news for competitor: ${competitor}`,
        { competitor }
      );
      
      if (!process.env.NEWS_API_KEY) {
        throw new Error(`News API key not configured. Cannot fetch real news data for ${competitor}. Please configure NEWS_API_KEY environment variable.`);
      }
      
      const news = await this.newsAPI.fetchNews(`${competitor} marketing automation`, {
        language: 'en',
        sortBy: 'relevancy',
        pageSize: 10
      });
      
      this.logTrace(
        'NEWS_API_SUCCESS',
        `Retrieved ${news.articles.length} articles for ${competitor}`,
        { 
          competitor, 
          articleCount: news.articles.length,
          sampleTitles: news.articles.slice(0, 3).map(a => a.title)
        }
      );
      
      return news.articles;
    } catch (error) {
      this.logTrace(
        'NEWS_API_ERROR',
        `Error fetching news for ${competitor}: ${error.message}`,
        { competitor, error: error.message }
      );
      throw new Error(`Failed to fetch real news data for ${competitor}: ${error.message}. No fallback data will be generated.`);
    }
  }

  async analyzeCompetitorPosition(competitor, news) {
    try {
      this.logTrace(
        'COMPETITOR_POSITION_ANALYSIS',
        `Analyzing market position for ${competitor}`,
        { competitor, newsCount: news.length }
      );
      
      // Extract key insights from news
      const insights = {
        strengths: [],
        weaknesses: [],
        marketPosition: '',
        targetAudience: '',
        keyFeatures: [],
        pricing: '',
        recentDevelopments: []
      };
      
      // Analyze news content for insights
      news.forEach(article => {
        const title = article.title.toLowerCase();
        const content = article.description?.toLowerCase() || '';
        
        // Extract strengths
        if (title.includes('launch') || title.includes('new') || title.includes('feature')) {
          insights.recentDevelopments.push(article.title);
        }
        
        if (title.includes('growth') || title.includes('success') || title.includes('increase')) {
          insights.strengths.push(article.title);
        }
        
        if (title.includes('small business') || title.includes('entrepreneur')) {
          insights.targetAudience = 'Small businesses';
        }
      });
      
      // Determine market position based on news sentiment
      const positiveNews = insights.strengths.length + insights.recentDevelopments.length;
      const totalNews = news.length;
      
      if (positiveNews > totalNews * 0.6) {
        insights.marketPosition = 'Strong market position';
      } else if (positiveNews > totalNews * 0.3) {
        insights.marketPosition = 'Moderate market position';
      } else {
        insights.marketPosition = 'Challenged market position';
      }
      
      this.logTrace(
        'COMPETITOR_POSITION_COMPLETE',
        `Completed position analysis for ${competitor}`,
        { 
          competitor, 
          marketPosition: insights.marketPosition,
          strengthsCount: insights.strengths.length,
          developmentsCount: insights.recentDevelopments.length
        }
      );
      
      return insights;
    } catch (error) {
      this.logError(error, 'analyzeCompetitorPosition');
      throw new Error(`Failed to analyze competitor position for ${competitor}: ${error.message}. No fallback data will be generated.`);
    }
  }

  async analyzeMarketTrends() {
    try {
      this.logTrace(
        'MARKET_TRENDS_ANALYSIS',
        'Starting market trends analysis',
        { focusAreas: this.researchFocusAreas }
      );
      
      const trends = [];
      
      for (const focusArea of this.researchFocusAreas.slice(0, 5)) { // Limit to 5 for rate limiting
        try {
          this.logTrace(
            'TREND_ANALYSIS',
            `Analyzing trends for: ${focusArea}`,
            { focusArea }
          );
          
          const trendData = await this.analyzeTrendForArea(focusArea);
          trends.push({
            area: focusArea,
            trends: trendData,
            timestamp: new Date().toISOString()
          });
          
        } catch (error) {
          this.logTrace(
            'TREND_ANALYSIS_ERROR',
            `Error analyzing trends for ${focusArea}: ${error.message}`,
            { focusArea, error: error.message }
          );
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      this.logTrace(
        'MARKET_TRENDS_COMPLETE',
        `Completed market trends analysis`,
        { 
          totalAreas: this.researchFocusAreas.length,
          analyzedAreas: trends.length,
          successfulAnalyses: trends.filter(t => t.trends.length > 0).length
        }
      );
      
      return trends;
    } catch (error) {
      this.logError(error, 'analyzeMarketTrends');
      throw new Error(`Failed to analyze market trends: ${error.message}. No fallback data will be generated.`);
    }
  }

  async analyzeTrendForArea(focusArea) {
    try {
      // Try to get real trend data from SERP API
      if (process.env.SERP_API_KEY) {
        try {
          const result = await this.serpAPI.searchGoogleTrends(focusArea, {
            timeframe: 'today 12-m',
            geo: 'US'
          });
          
          if (result && result.interestOverTime && result.interestOverTime.length > 0) {
            this.logTrace(
              'SERP_TREND_SUCCESS',
              `Retrieved trend data for ${focusArea}`,
              { focusArea, dataPoints: result.interestOverTime.length }
            );
            return result.interestOverTime;
          }
        } catch (error) {
          this.logTrace(
            'SERP_TREND_ERROR',
            `SERP API failed for ${focusArea}: ${error.message}`,
            { focusArea, error: error.message }
          );
        }
      }
      
      // No fallback data - fail clearly when real data is not available
      throw new Error(`SERP API data not available for ${focusArea}. No fallback data will be generated. Please check SERP API configuration and connectivity.`);
    } catch (error) {
      this.logError(error, 'analyzeTrendForArea');
      throw new Error(`Failed to analyze trends for ${focusArea}: ${error.message}. No fallback data will be generated.`);
    }
  }

  async identifyContentGaps(competitorAnalysis, marketTrends) {
    try {
      this.logTrace(
        'CONTENT_GAPS_ANALYSIS',
        'Starting content gap identification',
        { 
          competitorsCount: competitorAnalysis.length,
          trendsCount: marketTrends.length
        }
      );
      
      const gaps = [];
      
      // Analyze competitor content gaps
      competitorAnalysis.forEach(competitor => {
        if (competitor.analysis) {
          const gapsForCompetitor = this.identifyCompetitorGaps(competitor);
          gaps.push(...gapsForCompetitor);
        }
      });
      
      // Analyze market trend gaps
      marketTrends.forEach(trend => {
        const gapsForTrend = this.identifyTrendGaps(trend);
        gaps.push(...gapsForTrend);
      });
      
      // Remove duplicates and prioritize
      const uniqueGaps = this.deduplicateAndPrioritizeGaps(gaps);
      
      this.logTrace(
        'CONTENT_GAPS_COMPLETE',
        `Identified ${uniqueGaps.length} content gaps`,
        { 
          totalGaps: gaps.length,
          uniqueGaps: uniqueGaps.length,
          sampleGaps: uniqueGaps.slice(0, 5).map(g => g.title)
        }
      );
      
      return uniqueGaps;
    } catch (error) {
      this.logError(error, 'identifyContentGaps');
      throw new Error(`Failed to identify content gaps: ${error.message}. No fallback data will be generated.`);
    }
  }

  identifyCompetitorGaps(competitor) {
    const gaps = [];
    
    // Identify gaps based on competitor analysis
    if (competitor.analysis.targetAudience !== 'Small businesses') {
      gaps.push({
        title: `Small Business Focus for ${competitor.name}`,
        description: `${competitor.name} doesn't specifically target small businesses`,
        type: 'audience_gap',
        competitor: competitor.name,
        priority: 'high'
      });
    }
    
    if (competitor.analysis.strengths.length === 0) {
      gaps.push({
        title: `Clarity Gap in ${competitor.name}`,
        description: `${competitor.name} lacks clear value proposition for small businesses`,
        type: 'clarity_gap',
        competitor: competitor.name,
        priority: 'medium'
      });
    }
    
    return gaps;
  }

  identifyTrendGaps(trend) {
    const gaps = [];
    
    // Identify gaps based on market trends
    gaps.push({
      title: `${trend.area} Simplification`,
      description: `Market needs simplified ${trend.area} solutions for small businesses`,
      type: 'simplification_gap',
      area: trend.area,
      priority: 'high'
    });
    
    return gaps;
  }

  deduplicateAndPrioritizeGaps(gaps) {
    // Remove duplicates based on title
    const uniqueGaps = [];
    const seenTitles = new Set();
    
    gaps.forEach(gap => {
      if (!seenTitles.has(gap.title)) {
        seenTitles.add(gap.title);
        uniqueGaps.push(gap);
      }
    });
    
    // Sort by priority
    return uniqueGaps.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  async assessOpportunities(contentGaps, marketTrends) {
    try {
      this.logTrace(
        'OPPORTUNITY_ASSESSMENT',
        'Starting opportunity assessment',
        { 
          gapsCount: contentGaps.length,
          trendsCount: marketTrends.length
        }
      );
      
      const opportunities = [];
      
      // Convert gaps to opportunities
      contentGaps.forEach(gap => {
        const opportunity = this.convertGapToOpportunity(gap, marketTrends);
        if (opportunity) {
          opportunities.push(opportunity);
        }
      });
      
      // Add market-driven opportunities
      const marketOpportunities = this.createMarketOpportunities(marketTrends);
      opportunities.push(...marketOpportunities);
      
      // Prioritize opportunities
      const prioritizedOpportunities = this.prioritizeOpportunities(opportunities);
      
      this.logTrace(
        'OPPORTUNITY_ASSESSMENT_COMPLETE',
        `Assessed ${prioritizedOpportunities.length} opportunities`,
        { 
          totalOpportunities: opportunities.length,
          prioritizedOpportunities: prioritizedOpportunities.length,
          sampleOpportunities: prioritizedOpportunities.slice(0, 3).map(o => o.title)
        }
      );
      
      return prioritizedOpportunities;
    } catch (error) {
      this.logError(error, 'assessOpportunities');
      throw new Error(`Failed to assess opportunities: ${error.message}. No fallback data will be generated.`);
    }
  }

  convertGapToOpportunity(gap, marketTrends) {
    return {
      title: gap.title,
      description: gap.description,
      type: gap.type,
      priority: gap.priority,
      marketRelevance: this.calculateMarketRelevance(gap, marketTrends),
      implementationDifficulty: this.calculateImplementationDifficulty(gap),
      potentialImpact: this.calculatePotentialImpact(gap),
      timestamp: new Date().toISOString()
    };
  }

  createMarketOpportunities(marketTrends) {
    const opportunities = [];
    
    marketTrends.forEach(trend => {
      opportunities.push({
        title: `Simplified ${trend.area} Platform`,
        description: `Create a simplified ${trend.area} solution specifically for small businesses`,
        type: 'market_opportunity',
        priority: 'high',
        marketRelevance: 0.9,
        implementationDifficulty: 'medium',
        potentialImpact: 'high',
        area: trend.area,
        timestamp: new Date().toISOString()
      });
    });
    
    return opportunities;
  }

  calculateMarketRelevance(gap, marketTrends) {
    // Simple calculation based on gap type and market trends
    if (gap.type === 'audience_gap') return 0.8;
    if (gap.type === 'clarity_gap') return 0.9;
    if (gap.type === 'simplification_gap') return 0.85;
    return 0.7;
  }

  calculateImplementationDifficulty(gap) {
    if (gap.type === 'clarity_gap') return 'low';
    if (gap.type === 'audience_gap') return 'medium';
    return 'medium';
  }

  calculatePotentialImpact(gap) {
    if (gap.priority === 'high') return 'high';
    if (gap.priority === 'medium') return 'medium';
    return 'low';
  }

  prioritizeOpportunities(opportunities) {
    return opportunities.sort((a, b) => {
      // Sort by priority first, then by market relevance
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      return b.marketRelevance - a.marketRelevance;
    });
  }

  async createFinalAnalysis(opportunities, competitorAnalysis, marketTrends) {
    try {
      this.logTrace(
        'FINAL_ANALYSIS',
        'Creating final market analysis',
        { 
          opportunitiesCount: opportunities.length,
          competitorsCount: competitorAnalysis.length,
          trendsCount: marketTrends.length
        }
      );
      
      const analysis = {
        summary: `Identified ${opportunities.length} market opportunities based on analysis of ${competitorAnalysis.length} competitors and ${marketTrends.length} market trends`,
        keyInsights: this.extractKeyInsights(opportunities, competitorAnalysis, marketTrends),
        recommendations: this.generateRecommendations(opportunities),
        marketPosition: this.assessMarketPosition(competitorAnalysis),
        nextSteps: this.suggestNextSteps(opportunities),
        timestamp: new Date().toISOString()
      };
      
      this.logTrace(
        'FINAL_ANALYSIS_COMPLETE',
        'Completed final market analysis',
        { 
          insightsCount: analysis.keyInsights.length,
          recommendationsCount: analysis.recommendations.length,
          nextStepsCount: analysis.nextSteps.length
        }
      );
      
      return analysis;
    } catch (error) {
      this.logError(error, 'createFinalAnalysis');
      throw new Error(`Failed to create final analysis: ${error.message}. No fallback data will be generated.`);
    }
  }

  extractKeyInsights(opportunities, competitorAnalysis, marketTrends) {
    const insights = [];
    
    // Extract insights from opportunities
    const highPriorityOpportunities = opportunities.filter(o => o.priority === 'high');
    if (highPriorityOpportunities.length > 0) {
      insights.push(`Found ${highPriorityOpportunities.length} high-priority market opportunities`);
    }
    
    // Extract insights from competitor analysis
    const strongCompetitors = competitorAnalysis.filter(c => c.analysis?.marketPosition === 'Strong market position');
    if (strongCompetitors.length > 0) {
      insights.push(`${strongCompetitors.length} competitors have strong market positions`);
    }
    
    // Extract insights from market trends
    if (marketTrends.length > 0) {
      insights.push(`Analyzed ${marketTrends.length} key market trends`);
    }
    
    return insights;
  }

  generateRecommendations(opportunities) {
    return opportunities.slice(0, 5).map(opportunity => ({
      title: opportunity.title,
      description: opportunity.description,
      priority: opportunity.priority,
      impact: opportunity.potentialImpact
    }));
  }

  assessMarketPosition(competitorAnalysis) {
    const strongCompetitors = competitorAnalysis.filter(c => c.analysis?.marketPosition === 'Strong market position');
    const totalCompetitors = competitorAnalysis.length;
    
    if (strongCompetitors.length > totalCompetitors * 0.5) {
      return 'Highly competitive market';
    } else if (strongCompetitors.length > totalCompetitors * 0.3) {
      return 'Moderately competitive market';
    } else {
      return 'Emerging market opportunity';
    }
  }

  suggestNextSteps(opportunities) {
    const nextSteps = [];
    
    const highPriorityOpportunities = opportunities.filter(o => o.priority === 'high');
    if (highPriorityOpportunities.length > 0) {
      nextSteps.push(`Focus on ${highPriorityOpportunities.length} high-priority opportunities`);
    }
    
    nextSteps.push('Conduct detailed competitor analysis for top opportunities');
    nextSteps.push('Develop content strategy for identified gaps');
    nextSteps.push('Create implementation roadmap for selected opportunities');
    
    return nextSteps;
  }

  // No fallback methods - system will fail clearly when real data is not available

  getAvailableTasks() {
    return [
      {
        id: 'find_brand_opportunities',
        name: 'Find Brand Opportunities',
        description: 'Comprehensive market analysis to identify brand opportunities',
        parameters: {
          timeframe: { type: 'string', default: '7d', description: 'Timeframe for analysis' },
          focusAreas: { type: 'array', default: [], description: 'Specific areas to focus on' }
        }
      }
    ];
  }
}

module.exports = MarketResearcher; 