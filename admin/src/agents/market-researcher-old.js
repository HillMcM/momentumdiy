require('dotenv').config();
const logger = require('../utils/logger');
const { newsAPIClient, serpAPIClient } = require('../utils/api-clients');
const ResourceManager = require('../utils/resource-manager');
const BaseAgent = require('./base-agent');

class MarketResearcher extends BaseAgent {
  constructor() {
    super(); // Initialize BaseAgent
    
    // Model configuration with fallback
    this.modelConfig = {
      primary: 'gpt-4o-mini',
      fallback: 'gpt-3.5-turbo',
      maxRetries: 3
    };
    
    this.name = 'Market Researcher';
    this.description = 'AI-powered market research agent - Gathers real-time market intelligence, competitor analysis, and industry trends';
    this.status = 'active';
    this.lastActivity = new Date().toISOString();
    
    // Initialize resource manager
    this.resourceManager = new ResourceManager();
    
    // Market Researcher capabilities
    this.capabilities = [
      'Real-time News Monitoring',
      'Competitor Analysis',
      'Market Trend Analysis',
      'Industry Research',
      'Keyword Research',
      'Social Media Monitoring',
      'Product Launch Tracking',
      'Market Sentiment Analysis',
      'Geographic Market Analysis',
      'Demographic Research',
      'Technology Trend Monitoring',
      'Regulatory Change Tracking'
    ];

    // API clients
    this.newsAPI = newsAPIClient();
    this.serpAPI = serpAPIClient();
    
    // Research history and insights
    this.researchHistory = {
      searches: [],
      insights: [],
      trends: [],
      competitors: [],
      lastUpdated: new Date().toISOString()
    };

    // Research parameters
    this.researchConfig = {
      defaultTimeframe: '7d', // 7 days
      maxResults: 20,
      language: 'en',
      sortBy: 'relevancy',
      includeSentiment: true,
      trackCompetitors: true
    };

    // Brand context for MomentumDIY - Marketing clarity platform for small business owners
    this.brandContext = {
      brand: 'MomentumDIY',
      voice: 'Authentic, encouraging, practical, and approachable',
      targetAudience: 'Small business owners (cafes, home services, personal services, brick-and-mortar shops) who are overwhelmed by marketing options and need clarity',
      values: ['clarity', 'focus', 'practicality', 'results', 'accessibility'],
      contentStyle: 'Educational, step-by-step guidance, anti-overwhelm messaging',
      industry: 'Small business marketing clarity and execution platform',
      competitors: ['Marketing agencies', 'General marketing tools', 'Social media management platforms'],
      focusAreas: ['quarterly goal setting', 'weekly marketing guidance', 'task tracking', 'email campaigns', 'social media scheduling', 'AI marketing assistance'],
      coreValueProposition: 'Extreme clarity through single quarterly marketing goals with weekly dripped guidance, kanban task tracking, email campaign management, Meta Business Suite integration, and 24/7 AI marketing assistant'
    };
  }

  // Get agent info
  getInfo() {
    return {
      id: 'market-researcher',
      name: this.name,
      description: this.description,
      status: this.status,
      capabilities: this.capabilities,
      lastActivity: this.lastActivity,
      apis: {
        newsApi: !!process.env.NEWS_API_KEY,
        serpApi: !!process.env.SERP_API_KEY
      }
    };
  }

  // Update last activity
  updateActivity() {
    this.lastActivity = new Date().toISOString();
  }

  // Main execution method
  async execute(task, input) {
    try {
      this.updateActivity();
      const normalizedTask = (task || '').toLowerCase().trim();
      console.log('MARKET RESEARCHER TASK RECEIVED:', JSON.stringify(normalizedTask));
      logger.info(`Market Researcher executing task: ${normalizedTask}`, { input });

      // Map of task handlers
      const taskHandlers = {
        'research_competitors': async () => await this.researchCompetitorsWithProgress(input, () => {}, { input: 0, output: 0, total: 0 }),
        'analyze_market_trends': async () => await this.analyzeMarketTrendsWithProgress(input, () => {}, { input: 0, output: 0, total: 0 }),
        'monitor_news': async () => await this.monitorNewsWithProgress(input, () => {}, { input: 0, output: 0, total: 0 }),
        'keyword_research': async () => await this.researchKeywordsWithProgress(input, () => {}, { input: 0, output: 0, total: 0 }),
        'industry_analysis': async () => await this.analyzeIndustryWithProgress(input, () => {}, { input: 0, output: 0, total: 0 }),
        'sentiment_analysis': async () => await this.analyzeSentimentWithProgress(input, () => {}, { input: 0, output: 0, total: 0 }),
        'find_brand_opportunities': async () => await this.findBrandOpportunitiesWithProgress(input, () => {}, { input: 0, output: 0, total: 0 }),
      };

      if (taskHandlers[normalizedTask]) {
        return await taskHandlers[normalizedTask]();
      } else {
        // Print available tasks for debugging
        console.log('MARKET RESEARCHER AVAILABLE TASKS:', Object.keys(taskHandlers));
        throw new Error(`Unknown task: ${normalizedTask}`);
      }
    } catch (error) {
      logger.error('Market Researcher execution error:', error);
      throw error;
    }
  }

  // Execute task with progress tracking
  async executeWithProgress(task, input, onProgress) {
    const startTime = Date.now();
    let totalTokens = { input: 0, output: 0, total: 0 };
    
    try {
      this.updateActivity();
      logger.info(`Market Researcher executing task: ${task}`, { input });

      // Initialize progress
      onProgress({
        progress: 0,
        step: 'Initializing market research...',
        steps: ['Initializing', 'Gathering Data', 'Analyzing', 'Generating Insights', 'Completing']
      });

      let result;
      
      switch (task) {
        case 'research_competitors':
          onProgress({ progress: 10, step: 'Starting competitor research...' });
          result = await this.researchCompetitorsWithProgress(input, onProgress, totalTokens);
          break;
        case 'analyze_market_trends':
          onProgress({ progress: 10, step: 'Starting market trend analysis...' });
          result = await this.analyzeMarketTrendsWithProgress(input, onProgress, totalTokens);
          break;
        case 'monitor_news':
          onProgress({ progress: 10, step: 'Starting news monitoring...' });
          result = await this.monitorNewsWithProgress(input, onProgress, totalTokens);
          break;
        case 'keyword_research':
          onProgress({ progress: 10, step: 'Starting keyword research...' });
          result = await this.researchKeywordsWithProgress(input, onProgress, totalTokens);
          break;
        case 'industry_analysis':
          onProgress({ progress: 10, step: 'Starting industry analysis...' });
          result = await this.analyzeIndustryWithProgress(input, onProgress, totalTokens);
          break;
        case 'sentiment_analysis':
          onProgress({ progress: 10, step: 'Starting sentiment analysis...' });
          result = await this.analyzeSentimentWithProgress(input, onProgress, totalTokens);
          break;
        case 'find_brand_opportunities':
          onProgress({ progress: 10, step: 'Starting brand opportunity analysis...' });
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
      logger.error('Market Researcher execution error:', error);
      throw error;
    }
  }

  // Execute task with streaming updates
  async executeWithStreaming(task, input, onUpdate) {
    const startTime = Date.now();
    let totalTokens = { input: 0, output: 0, total: 0 };
    
    try {
      this.updateActivity();
      
      onUpdate({
        progress: 0,
        step: 'Initializing market research...',
        message: `Starting ${task} research...`
      });

      let result;
      
      switch (task) {
        case 'research_competitors':
          result = await this.researchCompetitorsWithStreaming(input, onUpdate, totalTokens);
          break;
        case 'analyze_market_trends':
          result = await this.analyzeMarketTrendsWithStreaming(input, onUpdate, totalTokens);
          break;
        case 'monitor_news':
          result = await this.monitorNewsWithStreaming(input, onUpdate, totalTokens);
          break;
        case 'keyword_research':
          result = await this.researchKeywordsWithStreaming(input, onUpdate, totalTokens);
          break;
        case 'industry_analysis':
          result = await this.analyzeIndustryWithStreaming(input, onUpdate, totalTokens);
          break;
        case 'sentiment_analysis':
          result = await this.analyzeSentimentWithStreaming(input, onUpdate, totalTokens);
          break;
        case 'find_brand_opportunities':
          result = await this.findBrandOpportunitiesWithStreaming(input, onUpdate, totalTokens);
          break;
        default:
          throw new Error(`Unknown task: ${task}`);
      }

      const duration = Date.now() - startTime;
      onUpdate({
        progress: 100,
        step: 'Research completed',
        message: `Research completed in ${duration}ms`,
        tokenUsage: totalTokens,
        duration
      });

      return result;
    } catch (error) {
      logger.error('Market Researcher streaming execution error:', error);
      throw error;
    }
  }

  // Research competitors with progress tracking
  async researchCompetitorsWithProgress(input, onProgress, totalTokens) {
    try {
      const { competitors, industry, timeframe = '7d' } = input;
      
      onProgress({ progress: 20, step: 'Gathering competitor data...' });
      
      const competitorData = [];
      
      for (const competitor of competitors) {
        onProgress({ 
          progress: 30 + (competitorData.length * 10), 
          step: `Researching ${competitor}...` 
        });
        
        // Get news about competitor
        const news = await this.getCompetitorNews(competitor, timeframe);
        
        // Get search trends for competitor
        const trends = await this.getSearchTrends(competitor);
        
        competitorData.push({
          name: competitor,
          news: news,
          searchTrends: trends,
          analysis: await this.analyzeCompetitorData(competitor, news, trends)
        });
      }
      
      onProgress({ progress: 80, step: 'Generating competitor insights...' });
      
      const insights = await this.generateCompetitorInsights(competitorData);
      
      // Store in research history
      this.storeResearch({
        type: 'competitor_research',
        input,
        results: competitorData,
        insights,
        timestamp: new Date().toISOString()
      });

      return {
        task: 'research_competitors',
        status: 'completed',
        competitors: competitorData,
        insights,
        summary: await this.generateCompetitorSummary(competitorData),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error in competitor research:', error);
      throw error;
    }
  }

  // Research competitors with streaming updates
  async researchCompetitorsWithStreaming(input, onUpdate, totalTokens) {
    try {
      const { competitors, industry, timeframe = '7d' } = input;
      
      onUpdate({
        progress: 20,
        step: 'Gathering competitor data...',
        message: `Starting research on ${competitors.length} competitors...`
      });
      
      const competitorData = [];
      
      for (let i = 0; i < competitors.length; i++) {
        const competitor = competitors[i];
        
        onUpdate({
          progress: 30 + (i * 15),
          step: `Researching ${competitor}...`,
          message: `Analyzing ${competitor} (${i + 1}/${competitors.length})`
        });
        
        // Get news about competitor
        const news = await this.getCompetitorNews(competitor, timeframe);
        
        // Get search trends for competitor
        const trends = await this.getSearchTrends(competitor);
        
        competitorData.push({
          name: competitor,
          news: news,
          searchTrends: trends,
          analysis: await this.analyzeCompetitorData(competitor, news, trends)
        });
      }
      
      onUpdate({
        progress: 80,
        step: 'Generating competitor insights...',
        message: 'Creating comprehensive competitor analysis...'
      });
      
      const insights = await this.generateCompetitorInsights(competitorData);
      
      // Store in research history
      this.storeResearch({
        type: 'competitor_research',
        input,
        results: competitorData,
        insights,
        timestamp: new Date().toISOString()
      });

      return {
        task: 'research_competitors',
        status: 'completed',
        competitors: competitorData,
        insights,
        summary: await this.generateCompetitorSummary(competitorData),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error in competitor research:', error);
      throw error;
    }
  }

  // Get competitor news
  async getCompetitorNews(competitor, timeframe) {
    try {
      // Check if News API key is configured
      if (!process.env.NEWS_API_KEY || process.env.NEWS_API_KEY === 'your_news_api_key_here') {
        logger.warn('News API key not configured, using mock data');
        return this.generateMockNews(competitor);
      }
      
      // Check if we can use News API
      if (!this.resourceManager.canUseNewsAPI('medium')) {
        logger.warn(`News API limit exceeded for competitor ${competitor}, using mock data`);
        return this.generateMockNews(competitor);
      }
      
      // Record News API usage
      this.resourceManager.recordNewsAPIUsage();
      
      if (this.newsAPI && this.newsAPI.fetchNews) {
        const news = await this.newsAPI.fetchNews(competitor, {
          from: this.getDateFromTimeframe(timeframe),
          sortBy: 'publishedAt',
          language: 'en'
        });
        return news;
      } else {
        logger.warn('News API client not available, using mock data');
        return this.generateMockNews(competitor);
      }
    } catch (error) {
      logger.error(`Error fetching competitor news for ${competitor}:`, error);
      return this.generateMockNews(competitor);
    }
  }

  // Get search trends from SERP API
  async getSearchTrends(competitor) {
    try {
      // Check if SERP API key is configured
      if (!process.env.SERP_API_KEY || process.env.SERP_API_KEY === 'your_serp_api_key_here') {
        logger.warn('SERP API key not configured, using mock data');
        return this.generateMockSearchTrends(competitor);
      }
      
      // Check if we can use SERP API
      if (!this.resourceManager.canUseSerpAPI('medium')) {
        logger.warn(`SERP API limit exceeded for competitor ${competitor}, using mock data`);
        return this.generateMockSearchTrends(competitor);
      }
      
      // Record SERP API usage
      this.resourceManager.recordSerpAPIUsage();
      
      if (this.serpAPI && this.serpAPI.searchGoogleTrends) {
        const trends = await this.serpAPI.searchGoogleTrends(competitor);
        return trends;
      } else {
        logger.warn('SERP API client not available, using mock data');
        return this.generateMockSearchTrends(competitor);
      }
    } catch (error) {
      logger.error(`Error fetching search trends for ${competitor}:`, error);
      return this.generateMockSearchTrends(competitor);
    }
  }

  // Analyze competitor data
  async analyzeCompetitorData(competitor, news, trends) {
    // Simple analysis - in a real implementation, you might use AI to analyze this data
    const analysis = {
      newsCount: news.length,
      recentActivity: news.length > 0 ? 'High' : 'Low',
      searchTrend: this.analyzeSearchTrend(trends),
      keyTopics: this.extractKeyTopics(news),
      sentiment: this.analyzeNewsSentiment(news)
    };
    
    return analysis;
  }

  // Generate competitor insights
  async generateCompetitorInsights(competitorData) {
    const insights = [];
    
    for (const competitor of competitorData) {
      insights.push({
        competitor: competitor.name,
        keyInsights: [
          `${competitor.name} has ${competitor.analysis.newsCount} recent news mentions`,
          `Search trend: ${competitor.analysis.searchTrend}`,
          `Key topics: ${competitor.analysis.keyTopics.join(', ')}`,
          `Overall sentiment: ${competitor.analysis.sentiment}`
        ]
      });
    }
    
    return insights;
  }

  // Generate competitor summary
  async generateCompetitorSummary(competitorData) {
    const totalNews = competitorData.reduce((sum, comp) => sum + comp.analysis.newsCount, 0);
    const avgSentiment = competitorData.reduce((sum, comp) => sum + (comp.analysis.sentiment === 'Positive' ? 1 : -1), 0) / competitorData.length;
    
    return {
      totalCompetitors: competitorData.length,
      totalNewsMentions: totalNews,
      averageSentiment: avgSentiment > 0 ? 'Positive' : 'Negative',
      mostActiveCompetitor: competitorData.reduce((max, comp) => comp.analysis.newsCount > max.analysis.newsCount ? comp : max).name
    };
  }

  // Helper methods
  getDateFromTimeframe(timeframe) {
    const now = new Date();
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 7;
    const pastDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    return pastDate.toISOString().split('T')[0];
  }

  analyzeSearchTrend(trends) {
    if (!trends || trends.length === 0) return 'Stable';
    // Simple trend analysis
    return 'Growing';
  }

  extractKeyTopics(news) {
    const topics = new Set();
    news.forEach(article => {
      if (article.title) {
        const words = article.title.toLowerCase().split(' ');
        words.forEach(word => {
          if (word.length > 4 && !['this', 'that', 'with', 'from', 'they', 'have', 'been', 'will'].includes(word)) {
            topics.add(word);
          }
        });
      }
    });
    return Array.from(topics).slice(0, 5);
  }

  analyzeNewsSentiment(news) {
    const positiveWords = ['launch', 'growth', 'success', 'profit', 'increase', 'positive'];
    const negativeWords = ['loss', 'decline', 'failure', 'problem', 'negative', 'down'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    news.forEach(article => {
      const text = (article.title + ' ' + (article.description || '')).toLowerCase();
      positiveWords.forEach(word => {
        if (text.includes(word)) positiveCount++;
      });
      negativeWords.forEach(word => {
        if (text.includes(word)) negativeCount++;
      });
    });
    
    if (positiveCount > negativeCount) return 'Positive';
    if (negativeCount > positiveCount) return 'Negative';
    return 'Neutral';
  }

  // Store research in history
  storeResearch(research) {
    this.researchHistory.searches.push(research);
    this.researchHistory.lastUpdated = new Date().toISOString();
    
    // Keep only last 50 searches
    if (this.researchHistory.searches.length > 50) {
      this.researchHistory.searches = this.researchHistory.searches.slice(-50);
    }
  }

  // Get research history
  getResearchHistory() {
    return this.researchHistory;
  }

  // Mock data generators for testing
  generateMockNews(competitor) {
    return [
      {
        title: `${competitor} Launches New Product Line`,
        description: `${competitor} has announced the launch of their latest product line, targeting the growing market demand.`,
        url: 'https://example.com/news1',
        publishedAt: new Date().toISOString()
      },
      {
        title: `${competitor} Reports Strong Q3 Earnings`,
        description: `${competitor} has reported strong third-quarter earnings, exceeding analyst expectations.`,
        url: 'https://example.com/news2',
        publishedAt: new Date().toISOString()
      }
    ];
  }

  generateMockSearchTrends(competitor) {
    return [
      { date: '2024-01-01', value: 50 },
      { date: '2024-01-02', value: 55 },
      { date: '2024-01-03', value: 60 },
      { date: '2024-01-04', value: 65 },
      { date: '2024-01-05', value: 70 }
    ];
  }

  // Placeholder methods for other research tasks
  async analyzeMarketTrendsWithProgress(input, onProgress, totalTokens) {
    onProgress({ progress: 50, step: 'Analyzing market trends...' });
    return {
      task: 'analyze_market_trends',
      status: 'completed',
      result: 'Market trends analysis completed',
      timestamp: new Date().toISOString()
    };
  }

  async analyzeMarketTrendsWithStreaming(input, onUpdate, totalTokens) {
    onUpdate({
      progress: 50,
      step: 'Analyzing market trends...',
      message: 'Processing market trend data...'
    });
    return {
      task: 'analyze_market_trends',
      status: 'completed',
      result: 'Market trends analysis completed',
      timestamp: new Date().toISOString()
    };
  }

  async monitorNewsWithProgress(input, onProgress, totalTokens) {
    onProgress({ progress: 50, step: 'Monitoring news...' });
    return {
      task: 'monitor_news',
      status: 'completed',
      result: 'News monitoring completed',
      timestamp: new Date().toISOString()
    };
  }

  async monitorNewsWithStreaming(input, onUpdate, totalTokens) {
    onUpdate({
      progress: 50,
      step: 'Monitoring news...',
      message: 'Gathering latest news...'
    });
    return {
      task: 'monitor_news',
      status: 'completed',
      result: 'News monitoring completed',
      timestamp: new Date().toISOString()
    };
  }

  async researchKeywordsWithProgress(input, onProgress, totalTokens) {
    try {
      const { keywords = [], timeframe = '30d' } = input;
      
      onProgress({ progress: 10, step: 'Analyzing keyword trends...' });
      
      // Get trending topics using SERP API
      const trendingTopics = await this.getTrendingTopics(timeframe);
      
      onProgress({ progress: 30, step: 'Researching competitor keyword strategies...' });
      
      // Analyze competitor content for keyword insights
      const competitorAnalysis = await this.analyzeCompetitorContent();
      
      onProgress({ progress: 50, step: 'Identifying keyword opportunities...' });
      
      // Find keyword opportunities
      const opportunities = await this.identifyContentOpportunities(trendingTopics, competitorAnalysis);
      
      onProgress({ progress: 70, step: 'Filtering opportunities by brand voice...' });
      
      // Filter opportunities based on brand voice and values
      const brandAlignedOpportunities = this.filterByBrandVoice(opportunities);
      
      onProgress({ progress: 90, step: 'Prioritizing keyword opportunities...' });
      
      // Prioritize opportunities
      const prioritizedOpportunities = this.prioritizeOpportunities(brandAlignedOpportunities);
      
      onProgress({ progress: 100, step: 'Keyword research completed' });
      
      return {
        task: 'keyword_research',
        status: 'completed',
        opportunities: prioritizedOpportunities,
        brandContext: this.brandContext,
        keywords: keywords,
        trendingTopics: trendingTopics,
        competitorAnalysis: competitorAnalysis,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error in keyword research:', error);
      return {
        task: 'keyword_research',
        status: 'completed',
        result: 'Keyword research completed',
        timestamp: new Date().toISOString()
      };
    }
  }

  async researchKeywordsWithStreaming(input, onUpdate, totalTokens) {
    onUpdate({
      progress: 50,
      step: 'Researching keywords...',
      message: 'Analyzing keyword data...'
    });
    return {
      task: 'keyword_research',
      status: 'completed',
      result: 'Keyword research completed',
      timestamp: new Date().toISOString()
    };
  }

  async analyzeIndustryWithProgress(input, onProgress, totalTokens) {
    onProgress({ progress: 50, step: 'Analyzing industry...' });
    return {
      task: 'industry_analysis',
      status: 'completed',
      result: 'Industry analysis completed',
      timestamp: new Date().toISOString()
    };
  }

  async analyzeIndustryWithStreaming(input, onUpdate, totalTokens) {
    onUpdate({
      progress: 50,
      step: 'Analyzing industry...',
      message: 'Processing industry data...'
    });
    return {
      task: 'industry_analysis',
      status: 'completed',
      result: 'Industry analysis completed',
      timestamp: new Date().toISOString()
    };
  }

  async analyzeSentimentWithProgress(input, onProgress, totalTokens) {
    onProgress({ progress: 50, step: 'Analyzing sentiment...' });
    return {
      task: 'sentiment_analysis',
      status: 'completed',
      result: 'Sentiment analysis completed',
      timestamp: new Date().toISOString()
    };
  }

  async analyzeSentimentWithStreaming(input, onUpdate, totalTokens) {
    onUpdate({
      progress: 50,
      step: 'Analyzing sentiment...',
      message: 'Processing sentiment data...'
    });
    return {
      task: 'sentiment_analysis',
      status: 'completed',
      result: 'Sentiment analysis completed',
      timestamp: new Date().toISOString()
    };
  }

  // Autonomous task selection based on incoming data
  async selectAutonomousTask(data, context = {}) {
    try {
      // Since Market Researcher doesn't use OpenAI directly, we'll use a rule-based approach
      const taskSelection = this.selectTaskByRules(data, context);
      
      logger.info('Market Researcher autonomous task selection:', taskSelection);
      return taskSelection;
    } catch (error) {
      logger.error('Error in autonomous task selection:', error);
      return this.selectMockAutonomousTask(data, context);
    }
  }

  // Rule-based task selection for Market Researcher
  selectTaskByRules(data, context) {
    const tasks = [];
    
    // Analyze data type and context to determine appropriate tasks
    if (data.competitors || data.competitor_activity) {
      tasks.push({
        taskId: 'research_competitors',
        priority: 'high',
        reasoning: 'Competitor data detected - need to research competitor activities',
        input: { competitors: data.competitors || this.brandContext.competitors, industry: 'DIY and home improvement' }
      });
    }
    
    if (data.market_trends || data.industry_changes) {
      tasks.push({
        taskId: 'analyze_market_trends',
        priority: 'high',
        reasoning: 'Market trend data detected - need to analyze current trends',
        input: { industry: 'DIY and home improvement', timeframe: '7d' }
      });
    }
    
    if (data.news_keywords || data.breaking_news) {
      tasks.push({
        taskId: 'monitor_news',
        priority: 'medium',
        reasoning: 'News-related data detected - need to monitor relevant news',
        input: { keywords: data.news_keywords || ['DIY', 'home improvement', 'crafts'], timeframe: '7d' }
      });
    }
    
    if (data.search_trends || data.keywords) {
      tasks.push({
        taskId: 'keyword_research',
        priority: 'medium',
        reasoning: 'Search/keyword data detected - need to research trending keywords',
        input: { industry: 'DIY and home improvement', keywords: data.keywords || ['DIY', 'home improvement'] }
      });
    }
    
    if (data.industry_analysis || data.market_changes) {
      tasks.push({
        taskId: 'industry_analysis',
        priority: 'medium',
        reasoning: 'Industry analysis data detected - need comprehensive industry analysis',
        input: { industry: 'DIY and home improvement', scope: 'comprehensive' }
      });
    }
    
    if (data.sentiment_data || data.public_opinion) {
      tasks.push({
        taskId: 'sentiment_analysis',
        priority: 'low',
        reasoning: 'Sentiment data detected - need to analyze market sentiment',
        input: { topics: data.sentiment_data || ['DIY', 'home improvement'], timeframe: '7d' }
      });
    }
    
    // Default to brand opportunity analysis if no specific triggers
    if (tasks.length === 0) {
      tasks.push({
        taskId: 'find_brand_opportunities',
        priority: 'medium',
        reasoning: 'No specific triggers detected - performing general brand opportunity analysis',
        input: { timeframe: '7d', focusAreas: this.brandContext.focusAreas }
      });
    }
    
    return {
      selectedTasks: tasks,
      reasoning: `Selected ${tasks.length} tasks based on data analysis`,
      confidence: 0.85
    };
  }

  // Mock autonomous task selection for testing
  selectMockAutonomousTask(data, context) {
    return {
      selectedTasks: [
        {
          taskId: 'find_brand_opportunities',
          priority: 'medium',
          reasoning: 'Mock task selection for testing environment',
          input: { timeframe: '7d', focusAreas: this.brandContext.focusAreas }
        }
      ],
      reasoning: 'Mock task selection for testing environment',
      confidence: 0.8
    };
  }

  // Execute autonomous tasks based on data
  async executeAutonomousTasks(data, context = {}) {
    try {
      logger.info('Market Researcher executing autonomous tasks based on data');
      
      // Select appropriate tasks
      const taskSelection = await this.selectAutonomousTask(data, context);
      
      const results = [];
      
      // Execute selected tasks in priority order
      const sortedTasks = taskSelection.selectedTasks.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
      
      for (const taskInfo of sortedTasks) {
        try {
          logger.info(`Executing autonomous task: ${taskInfo.taskId}`);
          
          const result = await this.execute(taskInfo.taskId, taskInfo.input);
          
          results.push({
            taskId: taskInfo.taskId,
            priority: taskInfo.priority,
            reasoning: taskInfo.reasoning,
            result: result,
            status: 'completed'
          });
          
          // Store in research history
          this.storeResearch({
            type: 'autonomous_execution',
            taskId: taskInfo.taskId,
            reasoning: taskInfo.reasoning,
            result: result,
            timestamp: new Date().toISOString()
          });
          
        } catch (error) {
          logger.error(`Error executing autonomous task ${taskInfo.taskId}:`, error);
          results.push({
            taskId: taskInfo.taskId,
            priority: taskInfo.priority,
            reasoning: taskInfo.reasoning,
            error: error.message,
            status: 'failed'
          });
        }
      }
      
      return {
        taskSelection: taskSelection,
        results: results,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error executing autonomous tasks:', error);
      throw error;
    }
  }

  // Get available tasks
  getAvailableTasks() {
    return [
      {
        id: 'research_competitors',
        name: 'Research Competitors',
        description: 'Analyze competitor activities, news, and market positioning',
        requiredInput: ['competitors', 'industry'],
        triggers: ['competitor_activity', 'market_changes', 'competitive_alert'],
        priority: 'high'
      },
      {
        id: 'analyze_market_trends',
        name: 'Analyze Market Trends',
        description: 'Identify and analyze current market trends and patterns',
        requiredInput: ['industry', 'timeframe'],
        triggers: ['trend_data', 'market_changes', 'industry_updates'],
        priority: 'high'
      },
      {
        id: 'monitor_news',
        name: 'Monitor News',
        description: 'Track relevant news and developments in your industry',
        requiredInput: ['keywords', 'timeframe'],
        triggers: ['breaking_news', 'industry_news', 'competitor_news'],
        priority: 'medium'
      },
      {
        id: 'keyword_research',
        name: 'Keyword Research',
        description: 'Research trending keywords and search patterns',
        requiredInput: ['industry', 'keywords'],
        triggers: ['search_trends', 'keyword_opportunities', 'content_planning'],
        priority: 'medium'
      },
      {
        id: 'industry_analysis',
        name: 'Industry Analysis',
        description: 'Comprehensive analysis of industry landscape and dynamics',
        requiredInput: ['industry', 'scope'],
        triggers: ['industry_changes', 'market_analysis', 'strategic_planning'],
        priority: 'medium'
      },
      {
        id: 'sentiment_analysis',
        name: 'Sentiment Analysis',
        description: 'Analyze market sentiment and public opinion',
        requiredInput: ['topics', 'timeframe'],
        triggers: ['sentiment_data', 'public_opinion', 'brand_monitoring'],
        priority: 'low'
      },
      {
        id: 'find_brand_opportunities',
        name: 'Find Brand Opportunities',
        description: 'Identify opportunities aligned with MomentumDIY brand voice',
        requiredInput: ['timeframe', 'focusAreas'],
        triggers: ['content_opportunities', 'brand_alignment', 'market_gaps'],
        priority: 'medium'
      }
    ];
  }

  // Find opportunities aligned with brand voice
  async findBrandOpportunitiesWithProgress(input, onProgress, totalTokens) {
    try {
      // Initialize trace for this execution
      this.initializeTrace('find_brand_opportunities', input);
      
      const { timeframe = '7d', focusAreas = [] } = input;
      
      this.logWorkflowStep('Initialization', 0, 'Starting brand opportunity analysis');
      onProgress({ progress: 10, step: 'Analyzing market trends for brand opportunities...' });
      
      // Get trending topics in the DIY/home improvement space
      this.logWorkflowStep('Trending Topics Research', 20, 'Researching trending topics');
      const trendingTopics = await this.getTrendingTopics(timeframe);
      
      this.logWorkflowStep('Competitor Analysis', 40, 'Analyzing competitor strategies');
      onProgress({ progress: 30, step: 'Researching competitor content strategies...' });
      
      // Analyze competitor content and strategies
      const competitorAnalysis = await this.analyzeCompetitorContent();
      
      this.logWorkflowStep('Opportunity Identification', 60, 'Identifying content opportunities');
      onProgress({ progress: 50, step: 'Identifying content gaps and opportunities...' });
      
      // Find content gaps and opportunities
      const opportunities = await this.identifyContentOpportunities(trendingTopics, competitorAnalysis);
      
      this.logWorkflowStep('Brand Alignment', 80, 'Evaluating brand alignment');
      onProgress({ progress: 70, step: 'Evaluating opportunities against brand voice...' });
      
      // Filter opportunities based on brand voice and values
      const brandAlignedOpportunities = this.filterByBrandVoice(opportunities);
      
      this.logWorkflowStep('Prioritization', 90, 'Prioritizing opportunities');
      onProgress({ progress: 90, step: 'Prioritizing keyword opportunities...' });
      
      // Prioritize opportunities
      const prioritizedOpportunities = this.prioritizeOpportunities(brandAlignedOpportunities);
      
      // Enhanced trending topics analysis
      this.logWorkflowStep('Data Enhancement', 95, 'Enhancing trending topics analysis');
      const enhancedTrendingData = this.analyzeTrendingTopicsData(trendingTopics);
      
      // Enhanced competitor analysis with detailed article breakdown
      this.logWorkflowStep('Competitor Enhancement', 97, 'Enhancing competitor analysis');
      const enhancedCompetitorData = this.enhanceCompetitorAnalysis(competitorAnalysis);
      
      this.logWorkflowStep('Completion', 100, 'Analysis completed');
      onProgress({ progress: 100, step: 'Brand opportunity analysis completed' });
      
      // Log final summary
      this.logTrace(
        'EXECUTION_COMPLETE',
        `Brand opportunity analysis completed with ${prioritizedOpportunities.length} opportunities`,
        {
          totalOpportunities: prioritizedOpportunities.length,
          trendingTopicsFound: enhancedTrendingData?.highInterestTopics?.length || 0,
          competitorsAnalyzed: enhancedCompetitorData?.totalCompetitors || 0,
          articlesAnalyzed: enhancedCompetitorData?.totalArticles || 0,
          traceSummary: this.getTraceSummary()
        }
      );
      
      return {
        task: 'find_brand_opportunities',
        status: 'completed',
        opportunities: prioritizedOpportunities,
        brandContext: this.brandContext,
        trendingTopics: trendingTopics,
        enhancedTrendingData: enhancedTrendingData,
        competitorAnalysis: competitorAnalysis,
        enhancedCompetitorData: enhancedCompetitorData,
        trace: this.getTrace(), // Include the complete trace
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logError(error, 'findBrandOpportunitiesWithProgress');
      logger.error('Error finding brand opportunities:', error);
      throw error;
    }
  }

  async findBrandOpportunitiesWithStreaming(input, onUpdate, totalTokens) {
    try {
      // Initialize trace for this execution
      this.initializeTrace('find_brand_opportunities', input);
      
      const { timeframe = '7d', focusAreas = [] } = input;
      
      this.logWorkflowStep('Initialization', 0, 'Starting brand opportunity analysis');
      onUpdate({
        progress: 0,
        step: 'Starting brand opportunity analysis...',
        message: 'Analyzing market for MomentumDIY opportunities'
      });
      
      // Get trending topics
      this.logWorkflowStep('Trending Topics Research', 20, 'Researching trending topics');
      onUpdate({ progress: 20, step: 'Researching trending topics...' });
      const trendingTopics = await this.getTrendingTopics(timeframe);
      
      // Analyze competitors
      this.logWorkflowStep('Competitor Analysis', 40, 'Analyzing competitor strategies');
      onUpdate({ progress: 40, step: 'Analyzing competitor strategies...' });
      const competitorAnalysis = await this.analyzeCompetitorContent();
      
      // Find opportunities
      this.logWorkflowStep('Opportunity Identification', 60, 'Identifying content opportunities');
      onUpdate({ progress: 60, step: 'Identifying content opportunities...' });
      const opportunities = await this.identifyContentOpportunities(trendingTopics, competitorAnalysis);
      
      // Filter by brand voice
      this.logWorkflowStep('Brand Alignment', 80, 'Evaluating brand alignment');
      onUpdate({ progress: 80, step: 'Evaluating brand alignment...' });
      const brandAlignedOpportunities = this.filterByBrandVoice(opportunities);
      
      // Prioritize
      this.logWorkflowStep('Prioritization', 90, 'Prioritizing opportunities');
      onUpdate({ progress: 90, step: 'Prioritizing opportunities...' });
      const prioritizedOpportunities = this.prioritizeOpportunities(brandAlignedOpportunities);
      
      // Enhanced trending topics analysis
      this.logWorkflowStep('Data Enhancement', 95, 'Enhancing trending topics analysis');
      const enhancedTrendingData = this.analyzeTrendingTopicsData(trendingTopics);
      
      // Enhanced competitor analysis with detailed article breakdown
      this.logWorkflowStep('Competitor Enhancement', 97, 'Enhancing competitor analysis');
      const enhancedCompetitorData = this.enhanceCompetitorAnalysis(competitorAnalysis);
      
      this.logWorkflowStep('Completion', 100, 'Analysis completed');
      onUpdate({
        progress: 100,
        step: 'Analysis completed',
        message: `Found ${prioritizedOpportunities.length} brand-aligned opportunities`,
        opportunities: prioritizedOpportunities
      });
      
      // Log final summary
      this.logTrace(
        'EXECUTION_COMPLETE',
        `Brand opportunity analysis completed with ${prioritizedOpportunities.length} opportunities`,
        {
          totalOpportunities: prioritizedOpportunities.length,
          trendingTopicsFound: enhancedTrendingData?.highInterestTopics?.length || 0,
          competitorsAnalyzed: enhancedCompetitorData?.totalCompetitors || 0,
          articlesAnalyzed: enhancedCompetitorData?.totalArticles || 0,
          traceSummary: this.getTraceSummary()
        }
      );
      
      return {
        task: 'find_brand_opportunities',
        status: 'completed',
        opportunities: prioritizedOpportunities,
        brandContext: this.brandContext,
        trendingTopics: trendingTopics,
        enhancedTrendingData: enhancedTrendingData,
        competitorAnalysis: competitorAnalysis,
        enhancedCompetitorData: enhancedCompetitorData,
        trace: this.getTrace(), // Include the complete trace
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logError(error, 'findBrandOpportunitiesWithStreaming');
      logger.error('Error in streaming brand opportunity analysis:', error);
      throw error;
    }
  }

  // Enhanced trending topics analysis
  analyzeTrendingTopicsData(trendingTopics) {
    try {
      const analysis = {
        totalDataPoints: 0,
        highInterestTopics: [],
        interestTrends: [],
        topQueries: [],
        dateRange: {},
        serpApiStats: {},
        specificTopics: []
      };

      if (trendingTopics && Array.isArray(trendingTopics)) {
        analysis.totalDataPoints = trendingTopics.length;
        
        // Extract high-interest topics (>50 interest) with specific topic names
        trendingTopics.forEach(timelineItem => {
          if (timelineItem.values && Array.isArray(timelineItem.values)) {
            timelineItem.values.forEach(value => {
              if (value.query && value.extracted_value > 50) {
                // Create a more specific topic name based on the search query and context
                const searchQuery = timelineItem.searchQuery || value.searchQuery || 'marketing';
                const specificTopic = this.generateSpecificTopicName(searchQuery, value.query, value.extracted_value);
                
                analysis.highInterestTopics.push({
                  query: value.query,
                  searchQuery: searchQuery,
                  specificTopic: specificTopic,
                  interest: value.extracted_value,
                  date: timelineItem.date,
                  timeframe: timelineItem.timeframe || 'weekly',
                  isRelated: timelineItem.isRelated || value.isRelated || false
                });
              }
            });
          }
        });

        // Sort by interest level
        analysis.highInterestTopics.sort((a, b) => b.interest - a.interest);
        
        // Get unique specific topics (not just queries)
        analysis.specificTopics = [...new Set(analysis.highInterestTopics.map(t => t.specificTopic))];
        
        // Get top 10 queries
        analysis.topQueries = [...new Set(analysis.highInterestTopics.map(t => t.query))].slice(0, 10);
        
        // Calculate interest trends over time
        const interestByDate = {};
        analysis.highInterestTopics.forEach(topic => {
          if (!interestByDate[topic.date]) {
            interestByDate[topic.date] = [];
          }
          interestByDate[topic.date].push(topic.interest);
        });
        
        Object.keys(interestByDate).forEach(date => {
          const avgInterest = interestByDate[date].reduce((sum, val) => sum + val, 0) / interestByDate[date].length;
          analysis.interestTrends.push({
            date: date,
            averageInterest: Math.round(avgInterest),
            dataPoints: interestByDate[date].length
          });
        });
        
        // Sort trends by date
        analysis.interestTrends.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Set date range
        if (analysis.interestTrends.length > 0) {
          analysis.dateRange = {
            start: analysis.interestTrends[0].date,
            end: analysis.interestTrends[analysis.interestTrends.length - 1].date
          };
        }
        
        // SERP API statistics
        analysis.serpApiStats = {
          totalQueries: analysis.highInterestTopics.length,
          uniqueTopics: analysis.specificTopics.length,
          averageInterest: analysis.highInterestTopics.length > 0 ? 
            Math.round(analysis.highInterestTopics.reduce((sum, t) => sum + t.interest, 0) / analysis.highInterestTopics.length) : 0,
          maxInterest: analysis.highInterestTopics.length > 0 ? Math.max(...analysis.highInterestTopics.map(t => t.interest)) : 0,
          minInterest: analysis.highInterestTopics.length > 0 ? Math.min(...analysis.highInterestTopics.map(t => t.interest)) : 0
        };
      }
      
      return analysis;
    } catch (error) {
      logger.error('Error analyzing trending topics data:', error);
      return {
        totalDataPoints: 0,
        highInterestTopics: [],
        interestTrends: [],
        topQueries: [],
        dateRange: {},
        serpApiStats: {},
        specificTopics: []
      };
    }
  }

  // Generate specific topic names based on search query and context
  generateSpecificTopicName(searchQuery, query, interest) {
    try {
      // Extract key terms from the search query
      const searchTerms = searchQuery.toLowerCase().split(' ');
      
      // Create more specific topic names based on the search context
      if (searchQuery.includes('social media')) {
        if (searchQuery.includes('tips')) {
          return 'Social Media Marketing Best Practices';
        } else if (searchQuery.includes('business')) {
          return 'Business Social Media Strategy';
        } else {
          return 'Social Media Marketing Trends';
        }
      } else if (searchQuery.includes('email marketing')) {
        if (searchQuery.includes('strategies')) {
          return 'Email Marketing Campaign Strategies';
        } else {
          return 'Email Marketing Automation';
        }
      } else if (searchQuery.includes('content marketing')) {
        return 'Content Marketing for Small Business';
      } else if (searchQuery.includes('local business')) {
        return 'Local Business Marketing Strategies';
      } else if (searchQuery.includes('marketing automation')) {
        return 'Marketing Automation Tools & Platforms';
      } else if (searchQuery.includes('lead generation')) {
        return 'Lead Generation & Customer Acquisition';
      } else if (searchQuery.includes('brand awareness')) {
        return 'Brand Awareness & Recognition Marketing';
      } else if (searchQuery.includes('SEO')) {
        return 'SEO Strategies for Small Business';
      } else if (searchQuery.includes('Google Ads')) {
        return 'Google Ads & PPC Marketing';
      } else if (searchQuery.includes('Facebook')) {
        return 'Facebook Business Marketing';
      } else if (searchQuery.includes('Instagram')) {
        return 'Instagram Business Marketing';
      } else if (searchQuery.includes('LinkedIn')) {
        return 'LinkedIn Marketing for Small Business';
      } else if (searchQuery.includes('marketing budget')) {
        return 'Marketing Budget Planning & ROI';
      } else if (searchQuery.includes('customer retention')) {
        return 'Customer Retention & Loyalty Marketing';
      } else if (searchQuery.includes('referral marketing')) {
        return 'Referral Marketing Programs';
      } else if (searchQuery.includes('influencer marketing')) {
        return 'Influencer Marketing for Small Business';
      } else if (searchQuery.includes('digital marketing')) {
        return 'Digital Marketing for Small Business';
      } else {
        // Default: create a more descriptive name from the search query
        const words = searchQuery.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1));
        return words.join(' ') + ' Trends';
      }
    } catch (error) {
      logger.error('Error generating specific topic name:', error);
      return searchQuery || 'Marketing Trends';
    }
  }

  // Enhanced competitor analysis with detailed article breakdown
  enhanceCompetitorAnalysis(competitorAnalysis) {
    try {
      const enhanced = {
        totalCompetitors: competitorAnalysis.length,
        totalArticles: 0,
        competitorsWithContent: 0,
        articleBreakdown: [],
        contentThemes: {},
        topSources: {},
        sentimentAnalysis: {},
        publicationFrequency: {}
      };

      competitorAnalysis.forEach(competitor => {
        const articles = competitor.content || [];
        const articleCount = articles.length;
        
        enhanced.totalArticles += articleCount;
        if (articleCount > 0) {
          enhanced.competitorsWithContent++;
        }
        
        // Article breakdown by competitor
        enhanced.articleBreakdown.push({
          competitor: competitor.competitor,
          articleCount: articleCount,
          themes: competitor.themes || [],
          recentArticles: articles.slice(0, 5).map(article => ({
            title: article.title || 'Untitled',
            source: article.source?.name || 'Unknown',
            publishedAt: article.publishedAt || 'Unknown date',
            url: article.url || '#',
            description: article.description || ''
          }))
        });
        
        // Aggregate content themes
        if (competitor.themes && Array.isArray(competitor.themes)) {
          competitor.themes.forEach(theme => {
            enhanced.contentThemes[theme] = (enhanced.contentThemes[theme] || 0) + 1;
          });
        }
        
        // Track top sources
        articles.forEach(article => {
          const source = article.source?.name || 'Unknown';
          enhanced.topSources[source] = (enhanced.topSources[source] || 0) + 1;
        });
        
        // Basic sentiment analysis (if available)
        if (articles.length > 0) {
          const positiveArticles = articles.filter(article => 
            article.title && (article.title.toLowerCase().includes('success') || 
                            article.title.toLowerCase().includes('growth') ||
                            article.title.toLowerCase().includes('positive'))
          ).length;
          
          enhanced.sentimentAnalysis[competitor.competitor] = {
            total: articles.length,
            positive: positiveArticles,
            neutral: articles.length - positiveArticles,
            positivePercentage: Math.round((positiveArticles / articles.length) * 100)
          };
        }
        
        // Publication frequency (if dates available)
        const articlesWithDates = articles.filter(article => article.publishedAt);
        if (articlesWithDates.length > 0) {
          const dates = articlesWithDates.map(article => new Date(article.publishedAt)).sort();
          const timeSpan = dates.length > 1 ? 
            Math.ceil((dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24)) : 1;
          
          enhanced.publicationFrequency[competitor.competitor] = {
            articles: articlesWithDates.length,
            timeSpan: timeSpan,
            frequency: timeSpan > 0 ? Math.round(articlesWithDates.length / timeSpan * 7) : 0 // articles per week
          };
        }
      });
      
      // Sort themes by frequency
      enhanced.contentThemes = Object.fromEntries(
        Object.entries(enhanced.contentThemes).sort(([,a], [,b]) => b - a)
      );
      
      // Sort sources by frequency
      enhanced.topSources = Object.fromEntries(
        Object.entries(enhanced.topSources).sort(([,a], [,b]) => b - a)
      );
      
      return enhanced;
    } catch (error) {
      logger.error('Error enhancing competitor analysis:', error);
      return {
        totalCompetitors: 0,
        totalArticles: 0,
        competitorsWithContent: 0,
        articleBreakdown: [],
        contentThemes: {},
        topSources: {},
        sentimentAnalysis: {},
        publicationFrequency: {}
      };
    }
  }

  // Helper methods for brand opportunity analysis
  async getTrendingTopics(timeframe) {
    try {
      this.logTrace(
        'TRENDING_TOPICS_START',
        `Starting trending topics research for timeframe: ${timeframe}`,
        { timeframe }
      );
      
      // Check if SERP API key is configured
      if (!process.env.SERP_API_KEY || process.env.SERP_API_KEY === 'your_serp_api_key_here') {
        this.logTrace(
          'SERP_API_CONFIG_ERROR',
          'SERP API key not configured, returning empty trending topics',
          { hasKey: !!process.env.SERP_API_KEY, isDefault: process.env.SERP_API_KEY === 'your_serp_api_key_here' }
        );
        logger.warn('SERP API key not configured, returning empty trending topics');
        return [];
      }
      
      // Define multiple specific trending topics to search for
      const trendingQueries = [
        'small business marketing',
        'digital marketing for small business',
        'social media marketing tips',
        'email marketing strategies',
        'content marketing for small business',
        'local business marketing',
        'marketing automation tools',
        'lead generation strategies',
        'customer acquisition marketing',
        'brand awareness marketing',
        'SEO for small business',
        'Google Ads for small business',
        'Facebook marketing for business',
        'Instagram business marketing',
        'LinkedIn marketing for small business',
        'marketing budget planning',
        'ROI marketing strategies',
        'customer retention marketing',
        'referral marketing programs',
        'influencer marketing for small business'
      ];
      
      this.logTrace(
        'TRENDING_QUERIES_DEFINED',
        `Defined ${trendingQueries.length} trending queries to search`,
        { 
          totalQueries: trendingQueries.length,
          queries: trendingQueries.slice(0, 5), // Show first 5 for trace
          willSearch: trendingQueries.slice(0, 10) // Limit to 10 for rate limiting
        }
      );
      
      logger.info(`Calling SERP API for ${trendingQueries.length} trending topics`);
      
      const allTrendingData = [];
      
      // Search for each trending topic
      for (let i = 0; i < trendingQueries.slice(0, 10).length; i++) {
        const query = trendingQueries[i];
        try {
          this.logTrace(
            'SERP_QUERY_START',
            `Searching for trending topic ${i + 1}/10: "${query}"`,
            { queryIndex: i + 1, query, totalQueries: 10 }
          );
          
          logger.info(`Searching for trending topic: ${query}`);
          
          // Log API request
          this.logApiRequest('SERP', 'Google Trends', { query, timeframe, geo: 'US' });
          
          const result = await this.serpAPI.searchGoogleTrends(query, {
            timeframe: timeframe,
            geo: 'US'
          });

          // Log API response
          this.logApiResponse('SERP', result, true);

          if (result && result.timeline_data && Array.isArray(result.timeline_data)) {
            this.logTrace(
              'SERP_DATA_PROCESSING',
              `Processing ${result.timeline_data.length} timeline data points for "${query}"`,
              { 
                query, 
                dataPoints: result.timeline_data.length,
                sampleData: result.timeline_data.slice(0, 2) // Show sample for trace
              }
            );
            
            // Add the query name to each timeline item for identification
            result.timeline_data.forEach(timelineItem => {
              timelineItem.searchQuery = query;
              timelineItem.values = timelineItem.values || [];
              timelineItem.values.forEach(value => {
                value.searchQuery = query;
              });
            });
            
            allTrendingData.push(...result.timeline_data);
            
            this.logTrace(
              'SERP_QUERY_SUCCESS',
              `Successfully processed "${query}" - added ${result.timeline_data.length} data points`,
              { 
                query, 
                addedDataPoints: result.timeline_data.length,
                totalDataPoints: allTrendingData.length
              }
            );
          } else {
            this.logTrace(
              'SERP_QUERY_NO_DATA',
              `No timeline data found for "${query}"`,
              { query, result: result ? 'has result but no timeline_data' : 'no result' }
            );
          }
          
          // Small delay to avoid rate limiting
          if (i < 9) { // Don't delay after the last query
            this.logTrace(
              'RATE_LIMIT_DELAY',
              `Waiting 100ms before next SERP API call to avoid rate limiting`,
              { delayMs: 100 }
            );
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
        } catch (error) {
          this.logError(error, `SERP query for "${query}"`);
          logger.error(`Error searching for trending topic "${query}":`, error);
          // Continue with other queries
        }
      }

      // API call successful - logging for tracking
      logger.info('SERP API calls completed');
      
      this.logTrace(
        'SERP_ALL_QUERIES_COMPLETE',
        `Completed all SERP API calls`,
        {
          totalQueriesAttempted: 10,
          successfulQueries: allTrendingData.length > 0 ? 'at least 1' : 0,
          totalDataPoints: allTrendingData.length,
          uniqueQueries: [...new Set(allTrendingData.map(item => item.searchQuery))].length
        }
      );
      
      logger.info('SERP API response summary:', {
        totalTimelineItems: allTrendingData.length,
        uniqueQueries: [...new Set(allTrendingData.map(item => item.searchQuery))].length
      });
      
      this.logTrace(
        'TRENDING_TOPICS_COMPLETE',
        `Trending topics research completed successfully`,
        {
          totalDataPoints: allTrendingData.length,
          uniqueQueries: [...new Set(allTrendingData.map(item => item.searchQuery))].length,
          sampleQueries: [...new Set(allTrendingData.map(item => item.searchQuery))].slice(0, 5)
        }
      );
      
      return allTrendingData;
      
    } catch (error) {
      this.logError(error, 'getTrendingTopics');
      logger.error('Error getting trending topics:', error);
      return [];
    }
  }

  // Get related trending topics for more diverse results
  async getRelatedTrendingTopics(baseQuery, timeframe) {
    try {
      if (!process.env.SERP_API_KEY || process.env.SERP_API_KEY === 'your_serp_api_key_here') {
        return [];
      }
      
      // Get related topics using SERP API's related topics feature
      const relatedQueries = [
        `${baseQuery} automation`,
        `${baseQuery} tools`,
        `${baseQuery} strategies`,
        `${baseQuery} tips`,
        `${baseQuery} best practices`,
        `${baseQuery} trends`,
        `${baseQuery} examples`,
        `${baseQuery} case studies`,
        `${baseQuery} software`,
        `${baseQuery} platforms`
      ];
      
      const relatedData = [];
      
      for (const query of relatedQueries.slice(0, 5)) { // Limit to 5 related queries
        try {
          const result = await this.serpAPI.searchGoogleTrends(query, {
            timeframe: timeframe,
            geo: 'US'
          });

          if (result && result.timeline_data && Array.isArray(result.timeline_data)) {
            result.timeline_data.forEach(timelineItem => {
              timelineItem.searchQuery = query;
              timelineItem.isRelated = true;
              timelineItem.values = timelineItem.values || [];
              timelineItem.values.forEach(value => {
                value.searchQuery = query;
                value.isRelated = true;
              });
            });
            
            relatedData.push(...result.timeline_data);
          }
          
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          logger.error(`Error searching for related topic "${query}":`, error);
        }
      }
      
      return relatedData;
      
    } catch (error) {
      logger.error('Error getting related trending topics:', error);
      return [];
    }
  }

  async getCompetitorNews(competitor, timeframe = '7d') {
    try {
      // Check if News API key is configured
      if (!process.env.NEWS_API_KEY || process.env.NEWS_API_KEY === 'your_news_api_key_here') {
        logger.warn('News API key not configured, returning empty news');
        return { articles: [] };
      }

      // Calculate date range
      const days = parseInt(timeframe.replace('d', ''));
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);
      const toDate = new Date();

      // Create search query for competitor
      const searchQuery = `"${competitor}" marketing strategy OR content OR campaigns`;
      
      logger.info(`Searching News API for: ${searchQuery}`);

      const response = await this.newsAPI.fetchNews(searchQuery, {
        from: fromDate.toISOString().split('T')[0],
        to: toDate.toISOString().split('T')[0],
        sortBy: 'relevancy',
        pageSize: 20,
        language: 'en'
      });

      // API call successful - logging for tracking
      logger.info(`News API call successful for ${competitor}, got ${response.articles ? response.articles.length : 0} articles`);
      
      return response;
    } catch (error) {
      logger.error(`Error fetching news for ${competitor}:`, error);
      return { articles: [] };
    }
  }

  async analyzeCompetitorContent() {
    try {
      this.logTrace(
        'COMPETITOR_ANALYSIS_START',
        `Starting competitor content analysis for ${this.brandContext.competitors.length} competitors`,
        { 
          competitors: this.brandContext.competitors,
          totalCompetitors: this.brandContext.competitors.length
        }
      );
      
      const competitorContent = [];
      
      for (let i = 0; i < this.brandContext.competitors.length; i++) {
        const competitor = this.brandContext.competitors[i];
        
        this.logTrace(
          'COMPETITOR_ANALYSIS_START',
          `Analyzing competitor ${i + 1}/${this.brandContext.competitors.length}: "${competitor}"`,
          { 
            competitorIndex: i + 1, 
            competitor, 
            totalCompetitors: this.brandContext.competitors.length 
          }
        );
        
        const newsResponse = await this.getCompetitorNews(competitor, '7d');
        
        // Handle News API response structure
        let news = [];
        if (newsResponse && newsResponse.articles && Array.isArray(newsResponse.articles)) {
          news = newsResponse.articles;
          this.logTrace(
            'NEWS_RESPONSE_PROCESSING',
            `Processing ${news.length} articles for "${competitor}" from newsResponse.articles`,
            { competitor, articleCount: news.length, responseType: 'newsResponse.articles' }
          );
        } else if (Array.isArray(newsResponse)) {
          news = newsResponse;
          this.logTrace(
            'NEWS_RESPONSE_PROCESSING',
            `Processing ${news.length} articles for "${competitor}" from direct array response`,
            { competitor, articleCount: news.length, responseType: 'direct array' }
          );
        } else {
          this.logTrace(
            'NEWS_RESPONSE_UNEXPECTED',
            `Unexpected news response structure for "${competitor}"`,
            { 
              competitor, 
              responseType: typeof newsResponse,
              hasArticles: !!(newsResponse && newsResponse.articles),
              isArray: Array.isArray(newsResponse)
            }
          );
          logger.warn(`Unexpected news response structure for ${competitor}:`, typeof newsResponse);
          news = [];
        }
        
        // Extract content themes
        const themes = this.extractContentThemes(news);
        this.logTrace(
          'CONTENT_THEMES_EXTRACTED',
          `Extracted ${themes.length} content themes for "${competitor}"`,
          { 
            competitor, 
            themeCount: themes.length, 
            themes: themes.slice(0, 5) // Show first 5 themes for trace
          }
        );
        
        competitorContent.push({
          competitor,
          content: news,
          themes: themes
        });
        
        this.logTrace(
          'COMPETITOR_ANALYSIS_COMPLETE',
          `Completed analysis for "${competitor}"`,
          { 
            competitor, 
            articlesAnalyzed: news.length,
            themesFound: themes.length,
            totalCompetitorsProcessed: i + 1
          }
        );
      }
      
      this.logTrace(
        'COMPETITOR_ANALYSIS_COMPLETE',
        `Completed competitor content analysis for all competitors`,
        {
          totalCompetitors: this.brandContext.competitors.length,
          totalArticles: competitorContent.reduce((sum, comp) => sum + comp.content.length, 0),
          totalThemes: competitorContent.reduce((sum, comp) => sum + comp.themes.length, 0),
          competitorsWithContent: competitorContent.filter(comp => comp.content.length > 0).length
        }
      );
      
      return competitorContent;
    } catch (error) {
      this.logError(error, 'analyzeCompetitorContent');
      logger.error('Error analyzing competitor content:', error);
      return [];
    }
  }

  async identifyContentOpportunities(trendingTopics, competitorAnalysis) {
    try {
      this.logTrace(
        'OPPORTUNITY_IDENTIFICATION_START',
        `Starting content opportunity identification`,
        {
          trendingTopicsCount: Array.isArray(trendingTopics) ? trendingTopics.length : 'not array',
          competitorAnalysisCount: Array.isArray(competitorAnalysis) ? competitorAnalysis.length : 0
        }
      );
      
      const opportunities = [];
      
      // Handle enhanced trending topics data with specific topic names
      let topics = [];
      if (Array.isArray(trendingTopics)) {
        this.logTrace(
          'TRENDING_TOPICS_PROCESSING',
          `Processing ${trendingTopics.length} trending topics from array format`,
          { totalTrendingTopics: trendingTopics.length }
        );
        
        // Extract trending data from the enhanced structure
        trendingTopics.forEach((timelineItem, index) => {
          if (timelineItem.values && Array.isArray(timelineItem.values)) {
            timelineItem.values.forEach((value, valueIndex) => {
              if (value.query && value.extracted_value > 50) { // Only include trending topics with >50 interest
                const searchQuery = timelineItem.searchQuery || value.searchQuery || 'marketing';
                const specificTopic = this.generateSpecificTopicName(searchQuery, value.query, value.extracted_value);
                
                this.logTrace(
                  'TRENDING_TOPIC_EXTRACTED',
                  `Extracted trending topic: "${specificTopic}" (${value.extracted_value}% interest)`,
                  {
                    topicIndex: `${index}-${valueIndex}`,
                    originalQuery: value.query,
                    searchQuery,
                    specificTopic,
                    interest: value.extracted_value,
                    date: timelineItem.date
                  }
                );
                
                topics.push({
                  query: value.query,
                  searchQuery: searchQuery,
                  specificTopic: specificTopic,
                  interest: value.extracted_value,
                  date: timelineItem.date,
                  isRelated: timelineItem.isRelated || value.isRelated || false
                });
              } else {
                this.logFilterDecision(
                  'INTEREST_THRESHOLD',
                  value,
                  false,
                  `Interest level ${value.extracted_value} is below 50% threshold`
                );
              }
            });
          }
        });
      } else if (trendingTopics && trendingTopics.timeline_data && Array.isArray(trendingTopics.timeline_data)) {
        this.logTrace(
          'TRENDING_TOPICS_FALLBACK',
          `Using fallback timeline_data structure for trending topics`,
          { hasTimelineData: true, timelineDataLength: trendingTopics.timeline_data.length }
        );
        
        // Fallback: Extract trending data from timeline_data structure
        trendingTopics.timeline_data.forEach(timelineItem => {
          if (timelineItem.values && Array.isArray(timelineItem.values)) {
            timelineItem.values.forEach(value => {
              if (value.query && value.extracted_value > 50) {
                const searchQuery = timelineItem.searchQuery || value.searchQuery || 'marketing';
                const specificTopic = this.generateSpecificTopicName(searchQuery, value.query, value.extracted_value);
                
                topics.push({
                  query: value.query,
                  searchQuery: searchQuery,
                  specificTopic: specificTopic,
                  interest: value.extracted_value,
                  date: timelineItem.date,
                  isRelated: timelineItem.isRelated || value.isRelated || false
                });
              }
            });
          }
        });
      } else {
        this.logTrace(
          'TRENDING_TOPICS_UNEXPECTED',
          `Unexpected trending topics structure`,
          { 
            type: typeof trendingTopics,
            hasTimelineData: !!(trendingTopics && trendingTopics.timeline_data),
            isArray: Array.isArray(trendingTopics)
          }
        );
        logger.warn('Unexpected trending topics structure:', typeof trendingTopics);
        topics = [];
      }
      
      this.logTrace(
        'TRENDING_TOPICS_PROCESSING_COMPLETE',
        `Processed ${topics.length} trending topics for opportunity analysis`,
        { 
          totalTopics: topics.length,
          highInterestTopics: topics.filter(t => t.interest >= 80).length,
          mediumInterestTopics: topics.filter(t => t.interest >= 60 && t.interest < 80).length
        }
      );
      
      // Analyze trending topics for content opportunities
      topics.forEach((topic, index) => {
        const topicText = topic.specificTopic || topic.query || (typeof topic === 'string' ? topic : 'Unknown Topic');
        
        this.logTrace(
          'TOPIC_RELEVANCE_CHECK',
          `Checking relevance for topic: "${topicText}"`,
          { 
            topicIndex: index,
            topicText,
            interest: topic.interest,
            searchQuery: topic.searchQuery
          }
        );
        
        if (this.isRelevantToBrand(topicText)) {
          this.logFilterDecision(
            'BRAND_RELEVANCE',
            topic,
            true,
            `Topic "${topicText}" is relevant to brand focus areas`
          );
          
          const potential = this.calculatePotential(topic.interest);
          this.logCalculation(
            'POTENTIAL_CALCULATION',
            { interest: topic.interest },
            potential,
            `Interest ${topic.interest}% → ${potential} potential`
          );
          
          opportunities.push({
            type: 'trending_topic',
            topic: topicText,
            query: topic.query || topicText,
            searchQuery: topic.searchQuery || 'marketing',
            interest: topic.interest || 'unknown',
            date: topic.date || 'recent',
            potential: potential,
            reason: `Trending topic (${topic.interest || 'high'} interest) relevant to marketing clarity and small business`,
            isRelated: topic.isRelated || false
          });
          
          this.logTrace(
            'OPPORTUNITY_CREATED',
            `Created trending topic opportunity: "${topicText}"`,
            {
              opportunityType: 'trending_topic',
              topic: topicText,
              interest: topic.interest,
              potential,
              totalOpportunities: opportunities.length
            }
          );
        } else {
          this.logFilterDecision(
            'BRAND_RELEVANCE',
            topic,
            false,
            `Topic "${topicText}" is not relevant to brand focus areas`
          );
        }
      });
      
      // Analyze competitor content gaps
      if (Array.isArray(competitorAnalysis)) {
        this.logTrace(
          'COMPETITOR_GAPS_ANALYSIS_START',
          `Starting competitor content gaps analysis for ${competitorAnalysis.length} competitors`,
          { totalCompetitors: competitorAnalysis.length }
        );
        
        competitorAnalysis.forEach((competitor, index) => {
          this.logTrace(
            'COMPETITOR_GAPS_PROCESSING',
            `Processing content gaps for competitor: "${competitor.competitor}"`,
            { 
              competitorIndex: index + 1,
              competitor: competitor.competitor,
              articlesCount: competitor.content ? competitor.content.length : 0
            }
          );
          
          const gaps = this.identifyContentGaps(competitor);
          
          if (Array.isArray(gaps)) {
            this.logTrace(
              'CONTENT_GAPS_FOUND',
              `Found ${gaps.length} content gaps for "${competitor.competitor}"`,
              { 
                competitor: competitor.competitor,
                gapsCount: gaps.length,
                gaps: gaps.slice(0, 3) // Show first 3 gaps for trace
              }
            );
            
            gaps.forEach((gap, gapIndex) => {
              opportunities.push({
                type: 'content_gap',
                gap: gap,
                competitor: competitor.competitor,
                potential: 'medium',
                reason: 'Content gap in competitor strategy'
              });
              
              this.logTrace(
                'CONTENT_GAP_OPPORTUNITY_CREATED',
                `Created content gap opportunity: "${gap}" for "${competitor.competitor}"`,
                {
                  opportunityType: 'content_gap',
                  gap,
                  competitor: competitor.competitor,
                  gapIndex: gapIndex + 1,
                  totalOpportunities: opportunities.length
                }
              );
            });
          } else {
            this.logTrace(
              'NO_CONTENT_GAPS',
              `No content gaps found for "${competitor.competitor}"`,
              { competitor: competitor.competitor, gapsType: typeof gaps }
            );
          }
        });
      }
      
      this.logTrace(
        'OPPORTUNITY_IDENTIFICATION_COMPLETE',
        `Completed content opportunity identification`,
        {
          totalOpportunities: opportunities.length,
          trendingTopicOpportunities: opportunities.filter(opp => opp.type === 'trending_topic').length,
          contentGapOpportunities: opportunities.filter(opp => opp.type === 'content_gap').length,
          highPotentialOpportunities: opportunities.filter(opp => opp.potential === 'high').length
        }
      );
      
      return opportunities;
    } catch (error) {
      this.logError(error, 'identifyContentOpportunities');
      logger.error('Error identifying content opportunities:', error);
      return [];
    }
  }

  // Calculate potential based on interest level
  calculatePotential(interest) {
    if (typeof interest === 'number') {
      if (interest >= 80) return 'high';
      if (interest >= 60) return 'medium';
      return 'low';
    }
    return 'medium';
  }

  isRelevantToBrand(topicText) {
    if (!topicText || typeof topicText !== 'string') {
      return false;
    }

    const topic = topicText.toLowerCase();
    
    // Check if topic matches brand industry keywords
    const industryKeywords = ['marketing', 'business', 'small business', 'entrepreneur', 'startup'];
    const hasIndustryMatch = industryKeywords.some(keyword => topic.includes(keyword));
    
    // Check if topic matches brand focus areas
    const focusKeywords = ['clarity', 'focus', 'goal', 'strategy', 'guidance', 'automation', 'social media', 'email', 'campaign'];
    const hasFocusMatch = focusKeywords.some(keyword => topic.includes(keyword));
    
    // Check if topic relates to target audience
    const audienceKeywords = ['cafe', 'restaurant', 'service', 'local', 'shop', 'store', 'brick', 'mortar'];
    const hasAudienceMatch = audienceKeywords.some(keyword => topic.includes(keyword));
    
    return hasIndustryMatch || hasFocusMatch || hasAudienceMatch;
  }

  filterByBrandVoice(opportunities) {
    return opportunities.filter(opportunity => {
      // Check if opportunity aligns with brand values
      const alignsWithValues = this.brandContext.values.some(value => 
        opportunity.reason.toLowerCase().includes(value) ||
        (opportunity.topic && opportunity.topic.toLowerCase().includes(value))
      );
      
      // Check if opportunity fits content style
      const fitsContentStyle = this.brandContext.contentStyle.toLowerCase().includes('educational') ||
                              this.brandContext.contentStyle.toLowerCase().includes('tutorial');
      
      return alignsWithValues || fitsContentStyle;
    });
  }

  prioritizeOpportunities(opportunities) {
    return opportunities.sort((a, b) => {
      // Prioritize by potential impact
      const priorityMap = { 'high': 3, 'medium': 2, 'low': 1 };
      return priorityMap[b.potential] - priorityMap[a.potential];
    });
  }

  extractContentThemes(news) {
    const themes = [];
    const themeKeywords = {
      'marketing_strategy': ['strategy', 'planning', 'campaign', 'approach'],
      'content_marketing': ['content', 'blog', 'article', 'social media'],
      'lead_generation': ['lead', 'conversion', 'funnel', 'sales'],
      'automation': ['automation', 'ai', 'technology', 'tools'],
      'small_business': ['small business', 'entrepreneur', 'startup', 'local'],
      'clarity_focus': ['clarity', 'focus', 'goal', 'strategy', 'guidance', 'automation', 'social media', 'email', 'campaign']
    };
    
    if (!Array.isArray(news)) {
      logger.warn('News is not an array in extractContentThemes:', typeof news);
      return themes;
    }
    
    news.forEach(item => {
      if (item && (item.title || item.description)) {
        const text = ((item.title || '') + ' ' + (item.description || '')).toLowerCase();
        Object.entries(themeKeywords).forEach(([theme, keywords]) => {
          if (keywords.some(keyword => text.includes(keyword))) {
            themes.push(theme);
          }
        });
      }
    });
    
    return [...new Set(themes)];
  }

  identifyContentGaps(competitor) {
    const gaps = [];
    const competitorThemes = competitor.themes;
    const brandThemes = this.brandContext.values;
    
    // Find themes that competitors aren't covering well
    brandThemes.forEach(theme => {
      if (!competitorThemes.includes(theme)) {
        gaps.push(theme);
      }
    });
    
    return gaps;
  }
}

module.exports = MarketResearcher; 