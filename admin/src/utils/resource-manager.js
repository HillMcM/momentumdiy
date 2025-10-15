const logger = require('./logger');
const fs = require('fs').promises;
const path = require('path');

class ResourceManager {
  constructor() {
    this.resourceFile = path.join(__dirname, '../../data/resource-usage.json');
    this.ensureDataDirectory();
    
    // OpenAI API limits (based on $20/month budget)
    this.openAILimits = {
      daily: 0.67, // $0.67 per day
      monthly: 20, // $20 per month
      // Current pricing per 1K tokens (as of July 2025) - Input/Output
      gpt4oMini: { input: 0.00015, output: 0.0006 }, // $0.15/$0.60 per 1M tokens
      gpt35Turbo: { input: 0.0005, output: 0.0015 }, // $0.50/$1.50 per 1M tokens
      gpt41Mini: { input: 0.0004, output: 0.0016 }, // $0.40/$1.60 per 1M tokens
      gpt4o: { input: 0.0025, output: 0.01 }, // $2.50/$10.00 per 1M tokens
      // With $20/month budget and gpt-4o-mini as primary model:
      // Average cost per token: ~$0.000375 (assuming 1:1 input/output ratio)
      // $20 / $0.000375 per token = ~53,333 tokens per month
      // Production limits - allows for multiple blog posts and campaigns per day
      maxTokensPerDay: 15000, // Allows for 2-3 blog posts + other tasks
      maxTokensPerMonth: 200000 // Allows for ~50-60 blog posts per month
    };
    
    // News API limits (1,000 requests/day, resets daily)
    this.newsAPILimits = {
      daily: 1000, // 1,000 requests per day
      monthly: 30000, // 30,000 requests per month (30 days * 1000)
      resetDay: null, // Resets daily
      currentMonth: 0,
      currentDay: 0
    };
    
    // SERP API limits (100 searches/month, resets on 16th)
    this.serpAPILimits = {
      daily: 3, // ~3 searches per day
      monthly: 100,
      resetDay: 16, // Resets on the 16th of each month
      currentMonth: 0,
      currentDay: 0
    };
    
    // Google Gemini API limits (using same budget allocation as OpenAI for now)
    this.geminiLimits = {
      daily: 0.67, // $0.67 per day (shared with OpenAI budget)
      monthly: 20, // $20 per month (shared budget)
      // Gemini Flash 2.5 pricing (as of Oct 2024)
      geminiFlash: { input: 0.000075, output: 0.0003 }, // $0.075/$0.30 per 1M tokens
      maxTokensPerDay: 15000,
      maxTokensPerMonth: 200000
    };
    
    // Task priority levels for resource allocation
    this.taskPriorities = {
      critical: 1, // High resource allocation
      high: 2,     // Medium resource allocation
      medium: 3,   // Low resource allocation
      low: 4       // Minimal resource allocation
    };
    
    this.usage = {
      openai: {
        daily: { tokens: 0, cost: 0, date: null },
        monthly: { tokens: 0, cost: 0, month: null },
        lastReset: null
      },
      gemini: {
        daily: { tokens: 0, cost: 0, date: null },
        monthly: { tokens: 0, cost: 0, month: null },
        lastReset: null
      },
      newsAPI: {
        daily: { requests: 0, date: null },
        monthly: { requests: 0, month: null },
        lastReset: null
      },
      serpAPI: {
        daily: { searches: 0, date: null },
        monthly: { searches: 0, month: null },
        lastReset: null
      }
    };
    
    this.loadUsage();
  }
  
  // Ensure data directory exists
  async ensureDataDirectory() {
    try {
      const dataDir = path.dirname(this.resourceFile);
      await fs.mkdir(dataDir, { recursive: true });
    } catch (error) {
      logger.error('Error creating data directory:', error);
    }
  }
  
  // Load usage data from file
  async loadUsage() {
    try {
      const data = await fs.readFile(this.resourceFile, 'utf8');
      this.usage = JSON.parse(data);
      this.checkAndResetCounters();
    } catch (error) {
      logger.info('No existing usage data found, starting fresh');
      this.initializeUsage();
    }
  }
  
  // Save usage data to file
  async saveUsage() {
    try {
      await fs.writeFile(this.resourceFile, JSON.stringify(this.usage, null, 2));
    } catch (error) {
      logger.error('Error saving usage data:', error);
    }
  }
  
  // Initialize usage counters
  initializeUsage() {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentMonth = now.toISOString().slice(0, 7);
    
    this.usage = {
      openai: {
        daily: { tokens: 0, cost: 0, date: currentDate },
        monthly: { tokens: 0, cost: 0, month: currentMonth },
        lastReset: now.toISOString()
      },
      gemini: {
        daily: { tokens: 0, cost: 0, date: currentDate },
        monthly: { tokens: 0, cost: 0, month: currentMonth },
        lastReset: now.toISOString()
      },
      newsAPI: {
        daily: { requests: 0, date: currentDate },
        monthly: { requests: 0, month: currentMonth },
        lastReset: now.toISOString()
      },
      serpAPI: {
        daily: { searches: 0, date: currentDate },
        monthly: { searches: 0, month: currentMonth },
        lastReset: now.toISOString()
      }
    };
    
    this.saveUsage();
  }
  
  // Check and reset counters if needed
  checkAndResetCounters() {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentMonth = now.toISOString().slice(0, 7);
    const currentDay = now.getDate();
    
    // Reset daily counters if it's a new day
    if (this.usage.openai.daily.date !== currentDate) {
      this.usage.openai.daily = { tokens: 0, cost: 0, date: currentDate };
      this.usage.gemini.daily = { tokens: 0, cost: 0, date: currentDate };
      this.usage.newsAPI.daily = { requests: 0, date: currentDate };
      this.usage.serpAPI.daily = { searches: 0, date: currentDate };
    }
    
    // Reset monthly counters if it's a new month
    if (this.usage.openai.monthly.month !== currentMonth) {
      this.usage.openai.monthly = { tokens: 0, cost: 0, month: currentMonth };
      this.usage.gemini.monthly = { tokens: 0, cost: 0, month: currentMonth };
      this.usage.newsAPI.monthly = { requests: 0, month: currentMonth };
      this.usage.serpAPI.monthly = { searches: 0, month: currentMonth };
    }
    
    // Reset News API monthly counter on the 23rd of each month
    if (currentDay === this.newsAPILimits.resetDay && this.usage.newsAPI.monthly.month !== currentMonth) {
      this.usage.newsAPI.monthly = { requests: 0, month: currentMonth };
      logger.info(`News API monthly counter reset on day ${currentDay}`);
    }
    
    // Reset SERP API monthly counter on the 16th of each month
    if (currentDay === this.serpAPILimits.resetDay && this.usage.serpAPI.monthly.month !== currentMonth) {
      this.usage.serpAPI.monthly = { searches: 0, month: currentMonth };
      logger.info(`SERP API monthly counter reset on day ${currentDay}`);
    }
    
    this.saveUsage();
  }
  
  // Check if OpenAI API usage is within limits
  canUseOpenAI(estimatedTokens = 1000, priority = 'medium') {
    this.checkAndResetCounters();
    
    // TEMPORARILY DISABLED: Always allow OpenAI usage for testing
    return true;
    
    // ORIGINAL CODE (commented out for testing):
    /*
    // Check if OpenAI API key is configured
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'sk-test-placeholder-key-for-testing' || apiKey === 'your_openai_api_key_here') {
      // Allow mock mode when API key is not configured
      logger.info('OpenAI API key not configured - allowing mock mode execution');
      return true;
    }
    
    const currentDailyTokens = this.usage.openai.daily.tokens;
    const currentMonthlyTokens = this.usage.openai.monthly.tokens;
    
    // Calculate priority multiplier (higher priority = more resources)
    const priorityMultiplier = this.getPriorityMultiplier(priority);
    const adjustedTokens = estimatedTokens * priorityMultiplier;
    
    // Check daily limit
    if (currentDailyTokens + adjustedTokens > this.openAILimits.maxTokensPerDay) {
      logger.warn(`OpenAI daily token limit exceeded: ${currentDailyTokens + adjustedTokens}/${this.openAILimits.maxTokensPerDay}`);
      return false;
    }
    
    // Check monthly limit
    if (currentMonthlyTokens + adjustedTokens > this.openAILimits.maxTokensPerMonth) {
      logger.warn(`OpenAI monthly token limit exceeded: ${currentMonthlyTokens + adjustedTokens}/${this.openAILimits.maxTokensPerMonth}`);
      return false;
    }
    
    return true;
    */
  }
  
  // Record OpenAI API usage
  recordOpenAIUsage(inputTokens, outputTokens, model = 'gpt-4o-mini') {
    this.checkAndResetCounters();
    
    const totalTokens = inputTokens + outputTokens;
    
    // Current pricing per 1K tokens (as of July 2025) - Input/Output
    let costPer1KInput, costPer1KOutput;
    switch (model) {
      case 'gpt-4o-mini':
        costPer1KInput = 0.00015; // $0.15 per 1M tokens
        costPer1KOutput = 0.0006; // $0.60 per 1M tokens
        break;
      case 'gpt-3.5-turbo':
        costPer1KInput = 0.0005; // $0.50 per 1M tokens
        costPer1KOutput = 0.0015; // $1.50 per 1M tokens
        break;
      case 'gpt-4.1-mini':
        costPer1KInput = 0.0004; // $0.40 per 1M tokens
        costPer1KOutput = 0.0016; // $1.60 per 1M tokens
        break;
      case 'gpt-4o':
        costPer1KInput = 0.0025; // $2.50 per 1M tokens
        costPer1KOutput = 0.01; // $10.00 per 1M tokens
        break;
      default:
        costPer1KInput = 0.00015; // Default to gpt-4o-mini pricing
        costPer1KOutput = 0.0006;
    }
    
    const inputCost = (inputTokens / 1000) * costPer1KInput;
    const outputCost = (outputTokens / 1000) * costPer1KOutput;
    const totalCost = inputCost + outputCost;
    
    this.usage.openai.daily.tokens += totalTokens;
    this.usage.openai.daily.cost += totalCost;
    this.usage.openai.monthly.tokens += totalTokens;
    this.usage.openai.monthly.cost += totalCost;
    
    logger.info(`OpenAI usage recorded: ${inputTokens} input + ${outputTokens} output = ${totalTokens} total tokens, $${totalCost.toFixed(4)} cost (${model})`);
    this.saveUsage();
  }
  
  // Record Google Gemini API usage
  recordGeminiUsage(model = 'gemini-2.0-flash-exp', callCount = 1) {
    this.checkAndResetCounters();
    
    // Estimate tokens (roughly 1 call = ~500-1000 tokens for prompt enhancement)
    const estimatedTokens = callCount * 750; // Conservative estimate
    
    // Gemini Flash pricing (as of Oct 2024)
    const costPer1KInput = 0.000075; // $0.075 per 1M tokens
    const costPer1KOutput = 0.0003; // $0.30 per 1M tokens
    
    // Assume 40% input, 60% output ratio for image prompt enhancement
    const inputTokens = Math.floor(estimatedTokens * 0.4);
    const outputTokens = Math.ceil(estimatedTokens * 0.6);
    
    const inputCost = (inputTokens / 1000) * costPer1KInput;
    const outputCost = (outputTokens / 1000) * costPer1KOutput;
    const totalCost = inputCost + outputCost;
    
    this.usage.gemini.daily.tokens += estimatedTokens;
    this.usage.gemini.daily.cost += totalCost;
    this.usage.gemini.monthly.tokens += estimatedTokens;
    this.usage.gemini.monthly.cost += totalCost;
    
    logger.info(`Gemini usage recorded: ~${estimatedTokens} tokens, $${totalCost.toFixed(6)} cost (${model})`);
    this.saveUsage();
  }
  
  // Check if Gemini API usage is within limits
  canUseGemini(priority = 'medium') {
    this.checkAndResetCounters();
    
    const currentDaily = this.usage.gemini.daily.cost;
    const currentMonthly = this.usage.gemini.monthly.cost;
    
    // Calculate priority multiplier for cost consideration
    const priorityMultiplier = this.getPriorityMultiplier(priority);
    const estimatedCallCost = 0.0002; // ~$0.0002 per call estimate
    const adjustedCost = estimatedCallCost * priorityMultiplier;
    
    // Check daily limit
    if (currentDaily + adjustedCost > this.geminiLimits.daily) {
      logger.warn(`Gemini API daily cost limit would be exceeded: $${(currentDaily + adjustedCost).toFixed(4)}/$${this.geminiLimits.daily}`);
      return false;
    }
    
    // Check monthly limit
    if (currentMonthly + adjustedCost > this.geminiLimits.monthly) {
      logger.warn(`Gemini API monthly cost limit would be exceeded: $${(currentMonthly + adjustedCost).toFixed(2)}/$${this.geminiLimits.monthly}`);
      return false;
    }
    
    return true;
  }
  
  // Check if News API usage is within limits
  canUseNewsAPI(priority = 'medium') {
    this.checkAndResetCounters();
    
    // TEMPORARILY DISABLED: Always allow News API usage for testing
    return true;
    
    // ORIGINAL CODE (commented out for testing):
    /*
    const currentDaily = this.usage.newsAPI.daily.requests;
    const currentMonthly = this.usage.newsAPI.monthly.requests;
    
    // Calculate priority multiplier
    const priorityMultiplier = this.getPriorityMultiplier(priority);
    const adjustedRequests = 1 * priorityMultiplier;
    
    // Check daily limit
    if (currentDaily + adjustedRequests > this.newsAPILimits.daily) {
      logger.warn(`News API daily limit exceeded: ${currentDaily + adjustedRequests}/${this.newsAPILimits.daily}`);
      return false;
    }
    
    // Check monthly limit
    if (currentMonthly + adjustedRequests > this.newsAPILimits.monthly) {
      logger.warn(`News API monthly limit exceeded: ${currentMonthly + adjustedRequests}/${this.newsAPILimits.monthly}`);
      return false;
    }
    
    return true;
    */
  }
  
  // Record News API usage
  recordNewsAPIUsage() {
    this.checkAndResetCounters();
    
    this.usage.newsAPI.daily.requests += 1;
    this.usage.newsAPI.monthly.requests += 1;
    
    logger.info(`News API usage recorded: ${this.usage.newsAPI.daily.requests}/${this.newsAPILimits.daily} daily, ${this.usage.newsAPI.monthly.requests}/${this.newsAPILimits.monthly} monthly`);
    this.saveUsage();
  }
  
  // Check if SERP API usage is within limits
  canUseSerpAPI(priority = 'medium') {
    this.checkAndResetCounters();
    
    // TEMPORARILY DISABLED: Always allow SERP API usage for testing
    return true;
    
    // ORIGINAL CODE (commented out for testing):
    /*
    const currentDaily = this.usage.serpAPI.daily.searches;
    const currentMonthly = this.usage.serpAPI.monthly.searches;
    
    // Calculate priority multiplier
    const priorityMultiplier = this.getPriorityMultiplier(priority);
    const adjustedSearches = 1 * priorityMultiplier;
    
    // Check daily limit
    if (currentDaily + adjustedSearches > this.serpAPILimits.daily) {
      logger.warn(`SERP API daily limit exceeded: ${currentDaily + adjustedSearches}/${this.serpAPILimits.daily}`);
      return false;
    }
    
    // Check monthly limit
    if (currentMonthly + adjustedSearches > this.serpAPILimits.monthly) {
      logger.warn(`SERP API monthly limit exceeded: ${currentMonthly + adjustedSearches}/${this.serpAPILimits.monthly}`);
      return false;
    }
    
    return true;
    */
  }
  
  // Record SERP API usage
  recordSerpAPIUsage() {
    this.checkAndResetCounters();
    
    this.usage.serpAPI.daily.searches += 1;
    this.usage.serpAPI.monthly.searches += 1;
    
    logger.info(`SERP API usage recorded: ${this.usage.serpAPI.daily.searches}/${this.serpAPILimits.daily} daily, ${this.usage.serpAPI.monthly.searches}/${this.serpAPILimits.monthly} monthly`);
    this.saveUsage();
  }
  
  // Get priority multiplier for resource allocation
  getPriorityMultiplier(priority) {
    switch (priority) {
      case 'critical': return 1.0;  // Full allocation
      case 'high': return 0.75;     // 75% allocation
      case 'medium': return 0.5;    // 50% allocation
      case 'low': return 0.25;      // 25% allocation
      default: return 0.5;
    }
  }
  
  // Get current usage status
  getUsageStatus() {
    this.checkAndResetCounters();
    
    return {
      openai: {
        daily: {
          tokens: this.usage.openai.daily.tokens,
          cost: this.usage.openai.daily.cost,
          limit: this.openAILimits.maxTokensPerDay,
          percentage: (this.usage.openai.daily.tokens / this.openAILimits.maxTokensPerDay) * 100
        },
        monthly: {
          tokens: this.usage.openai.monthly.tokens,
          cost: this.usage.openai.monthly.cost,
          limit: this.openAILimits.maxTokensPerMonth,
          percentage: (this.usage.openai.monthly.tokens / this.openAILimits.maxTokensPerMonth) * 100
        }
      },
      newsAPI: {
        daily: {
          requests: this.usage.newsAPI.daily.requests,
          limit: this.newsAPILimits.daily,
          percentage: (this.usage.newsAPI.daily.requests / this.newsAPILimits.daily) * 100
        },
        monthly: {
          requests: this.usage.newsAPI.monthly.requests,
          limit: this.newsAPILimits.monthly,
          percentage: (this.usage.newsAPI.monthly.requests / this.newsAPILimits.monthly) * 100
        }
      },
      serpAPI: {
        daily: {
          searches: this.usage.serpAPI.daily.searches,
          limit: this.serpAPILimits.daily,
          percentage: (this.usage.serpAPI.daily.searches / this.serpAPILimits.daily) * 100
        },
        monthly: {
          searches: this.usage.serpAPI.monthly.searches,
          limit: this.serpAPILimits.monthly,
          percentage: (this.usage.serpAPI.monthly.searches / this.serpAPILimits.monthly) * 100
        }
      }
    };
  }

  // Get current usage (backward compatibility method)
  getCurrentUsage() {
    const status = this.getUsageStatus();
    return {
      openai: {
        totalCost: status.openai.monthly.cost,
        dailyUsage: status.openai.daily.tokens,
        monthlyUsage: status.openai.monthly.tokens
      },
      newsApi: {
        dailyUsage: status.newsAPI.daily.requests,
        monthlyUsage: status.newsAPI.monthly.requests
      },
      serpApi: {
        dailyUsage: status.serpAPI.daily.searches,
        monthlyUsage: status.serpAPI.monthly.searches
      }
    };
  }
  
  // Get resource recommendations for task scheduling
  getResourceRecommendations() {
    const status = this.getUsageStatus();
    const recommendations = [];
    
    // OpenAI recommendations
    if (status.openai.daily.percentage > 80) {
      recommendations.push('OpenAI daily usage high - consider deferring non-critical tasks');
    }
    if (status.openai.monthly.percentage > 80) {
      recommendations.push('OpenAI monthly usage high - reduce token usage for remaining days');
    }
    
    // News API recommendations
    if (status.newsAPI.daily.percentage > 80) {
      recommendations.push('News API daily limit approaching - limit competitor research');
    }
    if (status.newsAPI.monthly.percentage > 80) {
      recommendations.push('News API monthly limit approaching - defer news monitoring');
    }
    
    // SERP API recommendations
    if (status.serpAPI.daily.percentage > 80) {
      recommendations.push('SERP API daily limit approaching - limit search trend analysis');
    }
    if (status.serpAPI.monthly.percentage > 80) {
      recommendations.push('SERP API monthly limit approaching - defer keyword research');
    }
    
    return recommendations;
  }
  
  // Estimate token usage for a task
  estimateTokenUsage(taskType, inputSize = 'medium') {
    const baseTokens = {
      // CMO Brain tasks
      'think': 2000,
      'analyze_performance': 1500,
      'create_strategy': 3000,
      'plan_campaign': 2500,
      'competitive_analysis': 2000,
      'create_cmo_summary': 1000,
      
      // Market Researcher tasks
      'research_competitors': 1500,
      'analyze_market_trends': 1200,
      'keyword_research': 800,
      'find_brand_opportunities': 1800,
      
      // Copywriting Agent tasks
      'create-blog-post': 4000,        // 1,100-2,000 words
      'create-social-media-copy': 800,
      'create-email-content': 1200,
      'create-product-description': 600,
      'optimize-content': 1000,
      'create-ad-copy': 800,
      'repurpose-content': 1500,
      'generate-content-ideas': 1000,
      'edit-copy': 800,
      'create-content-calendar': 2000,
      'analyze-writing-style': 1000,
      'create-style-enhanced-content': 3000,
      
      // Social Content Agent tasks
      'create-social-post': 600,
      'create-multi-platform-campaign': 2000,
      'generate-brand-image': 400,
      'optimize-content-for-platform': 800,
      'create-content-calendar': 2000,
      'analyze-trending-topics': 1000,
      'create-hashtag-strategy': 800,
      'repurpose-content': 1200,
      'generate-engagement-copy': 600,
      'create-visual-brand-guidelines': 1500,
      'generate-image-with-dalle': 100,  // DALL·E 3 uses minimal tokens
      'generate-brand-image-with-dalle': 100,
      'generate-carousel-images': 300,
      'create-social-post-with-content': 800,
      'create-content-aware-campaign': 2000,
      'analyze-content-usage': 500,
      'get-relevant-content': 400,
      
      // Data Analyst tasks
      'test_data_sources': 500,
      'process_business_data': 1000,
      'generate_insights': 1500,
      'create_cmo_summary': 1000,
      'clean_and_validate_data': 800,
      'process_analytics_data': 1200,
      'analyze_trends': 1000,
      'detect_anomalies': 1000
    };
    
    const sizeMultiplier = {
      'small': 0.5,
      'medium': 1.0,
      'large': 2.0
    };
    
    const baseTokenCount = baseTokens[taskType] || 1000;
    return Math.round(baseTokenCount * sizeMultiplier[inputSize]);
  }
  
  // Check if workflow should be executed based on resource availability
  shouldExecuteWorkflow() {
    // TEMPORARILY DISABLED: Always allow workflow execution for testing
    return {
      canExecute: true,
      reasons: {
        openai: 'Available (limits disabled for testing)',
        newsAPI: 'Available (limits disabled for testing)',
        serpAPI: 'Available (limits disabled for testing)'
      }
    };
    
    // ORIGINAL CODE (commented out for testing):
    /*
    const status = this.getUsageStatus();
    
    // Check if we have enough resources for a typical workflow
    // More conservative estimates for daily workflow
    const workflowTokens = this.estimateTokenUsage('think', 'medium') + 
                          this.estimateTokenUsage('create_cmo_summary', 'medium') +
                          this.estimateTokenUsage('analyze_performance', 'medium');
    
    const hasOpenAI = status.openai.daily.tokens + workflowTokens <= this.openAILimits.maxTokensPerDay;
    const hasNewsAPI = status.newsAPI.daily.requests + 2 <= this.newsAPILimits.daily; // 2 requests for competitor research
    const hasSerpAPI = status.serpAPI.daily.searches + 1 <= this.serpAPILimits.daily; // 1 search for trends
    
    return {
      canExecute: hasOpenAI && hasNewsAPI && hasSerpAPI,
      reasons: {
        openai: hasOpenAI ? 'Available' : 'Daily token limit would be exceeded',
        newsAPI: hasNewsAPI ? 'Available' : 'Daily request limit would be exceeded',
        serpAPI: hasSerpAPI ? 'Available' : 'Daily search limit would be exceeded'
      }
    };
    */
  }
  
  // Reset usage counters (for testing or manual reset)
  async resetUsage() {
    this.initializeUsage();
    logger.info('Usage counters reset');
  }
}

module.exports = ResourceManager; 