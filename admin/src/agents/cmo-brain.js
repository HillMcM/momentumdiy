require('dotenv').config();
const OpenAI = require('openai');
const logger = require('../utils/logger');
const PromptTemplates = require('../utils/prompt-templates');
const ResourceManager = require('../utils/resource-manager');
const ContentManager = require('../utils/content-manager');
const BaseAgent = require('./base-agent');
const { getFullBrandContext } = require('../utils/brand-knowledge');

class CMOBrain extends BaseAgent {
  constructor(resourceManager = null) {
    super(); // Call BaseAgent constructor
    
    // Initialize OpenAI client with proper error handling
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'sk-test-placeholder-key-for-testing' || apiKey === 'your_openai_api_key_here') {
      logger.error('OpenAI API key not configured. CMO Brain cannot function without proper API configuration.');
      throw new Error('OpenAI API key not configured. Please check your .env file and ensure OPENAI_API_KEY is set correctly.');
    }
    
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
    
    // Initialize prompt templates and resource manager
    this.promptTemplates = new PromptTemplates();
    this.resourceManager = resourceManager || new ResourceManager();
    this.contentManager = new ContentManager();
    
    // Model configuration with fallback
    this.modelConfig = {
      primary: 'gpt-4o-mini', // Primary model - most cost-effective
      fallback: 'gpt-3.5-turbo', // Fallback model
      maxRetries: 3,
      // Model priority order for cost optimization
      models: [
        'gpt-4o-mini',        // $0.15/$0.60 per 1M tokens - most cost-effective
        'gpt-4.1-mini',       // $0.40/$1.60 per 1M tokens - newer alternative
        'gpt-3.5-turbo',      // $0.50/$1.50 per 1M tokens - reliable fallback
        'gpt-4o'              // $2.50/$10.00 per 1M tokens - high quality if needed
      ]
    };
    
    this.name = 'CMO Brain';
    this.description = 'Chief Marketing Officer AI Agent - Handles marketing strategy, campaign planning, and performance analysis';
    this.status = 'active';
    this.lastActivity = new Date().toISOString();
    
    // CMO Brain capabilities
    this.capabilities = [
      'Marketing Strategy Development',
      'Campaign Planning & Optimization',
      'Performance Analysis & Reporting',
      'Competitive Analysis',
      'Budget Allocation',
      'Customer Journey Mapping',
      'ROI Analysis',
      'Market Research',
      'Strategic Thinking & Reasoning',
      'Memory & Learning',
      'Pattern Recognition',
      'Predictive Analysis',
      'Content Strategy & Management',
      'Content-Aware Campaign Planning'
    ];

    // Load comprehensive brand context from brand knowledge module
    this.brandContext = getFullBrandContext();

    // Thinking and memory system
    this.memory = {
      insights: [],
      decisions: [],
      patterns: [],
      strategies: [],
      performanceHistory: [],
      lastThoughtProcess: null
    };

    // Thinking parameters
    this.thinkingConfig = {
      maxMemoryItems: 100,
      reasoningDepth: 'strategic', // 'quick', 'strategic', 'deep'
      learningEnabled: true,
      patternRecognitionEnabled: true
    };
  }

  // Get agent info
  getInfo() {
    return {
      id: 'cmo-brain',
      name: this.name,
      description: this.description,
      status: this.status,
      capabilities: this.capabilities,
      lastActivity: this.lastActivity
    };
  }

  // Update last activity
  updateActivity() {
    this.lastActivity = new Date().toISOString();
  }

  // Thinking and reasoning methods
  async think(input, context = {}) {
    try {
      logger.info('CMO Brain is thinking...', { input, context });
      
      const thoughtProcess = await this.generateThoughtProcess(input, context);
      const insights = await this.extractInsights(thoughtProcess, input);
      const decisions = await this.makeDecisions(insights, context);
      
      // Store in memory
      this.storeInMemory({
        type: 'thought',
        input,
        context,
        thoughtProcess,
        insights,
        decisions,
        timestamp: new Date().toISOString()
      });

      return {
        thoughtProcess,
        insights,
        decisions,
        recommendations: await this.generateRecommendations(insights, decisions)
      };
    } catch (error) {
      logger.error('Error in thinking process:', error);
      throw error;
    }
  }

  async generateThoughtProcess(input, context) {

    const prompt = `
You are a Chief Marketing Officer with deep strategic thinking capabilities. 
Analyze the following information and walk through your thought process step by step.

Input Data:
${JSON.stringify(input, null, 2)}

Context:
${JSON.stringify(context, null, 2)}

Previous Insights (if any):
${JSON.stringify(this.memory.insights.slice(-3), null, 2)}

Please think through this step by step:

1. **Data Analysis**: What patterns do you see in the data?
2. **Context Understanding**: How does this fit into the broader business context?
3. **Strategic Implications**: What are the strategic implications of these findings?
4. **Risk Assessment**: What risks or opportunities do you identify?
5. **Future Considerations**: How might this evolve over time?
6. **Cross-Connections**: How does this connect to other marketing activities?

Provide your thought process in clear, logical steps. Think like a strategic CMO would.
`;

    const response = await this.callOpenAIWithFallback(prompt, 0.4, 1500);

    return response;
  }

  async extractInsights(thoughtProcess, input) {

    const prompt = `
Based on the following thought process, extract key insights and patterns:

Thought Process:
${thoughtProcess}

Original Input:
${JSON.stringify(input, null, 2)}

Extract and organize insights into these categories:
1. **Performance Insights**: What's working well or poorly?
2. **Strategic Insights**: What strategic implications emerge?
3. **Pattern Insights**: What patterns or trends do you see?
4. **Opportunity Insights**: What opportunities are revealed?
5. **Risk Insights**: What risks or threats are identified?

Format as a clear, structured list of insights.
`;

    const response = await this.callOpenAIWithFallback(prompt, 0.3, 1000);

    return response;
  }

  async makeDecisions(insights, context) {

    const prompt = `
Based on these insights, what strategic decisions should be made?

Insights:
${insights}

Context:
${JSON.stringify(context, null, 2)}

Previous Decisions (if any):
${JSON.stringify(this.memory.decisions.slice(-3), null, 2)}

Make strategic decisions in these areas:
1. **Immediate Actions**: What should be done right now?
2. **Short-term Strategy**: What should be planned for the next 30-90 days?
3. **Long-term Strategy**: What should be planned for the next 6-12 months?
4. **Resource Allocation**: How should resources be reallocated?
5. **Risk Mitigation**: What actions should be taken to mitigate risks?

Provide clear, actionable decisions with reasoning.
`;

    const response = await this.callOpenAIWithFallback(prompt, 0.4, 1200);

    return response;
  }

  async generateRecommendations(insights, decisions) {

    const prompt = `
Based on these insights and decisions, provide specific, actionable recommendations:

Insights:
${insights}

Decisions:
${decisions}

Provide recommendations in these categories:
1. **Immediate Actions** (Next 7 days)
2. **Short-term Initiatives** (Next 30 days)
3. **Medium-term Projects** (Next 90 days)
4. **Long-term Strategy** (Next 6-12 months)
5. **Success Metrics** to track progress

Make recommendations specific, measurable, and actionable.
`;

    const response = await this.callOpenAIWithFallback(prompt, 0.3, 1000);

    return response;
  }

  // Memory management
  storeInMemory(item) {
    this.memory.insights.push(item);
    
    // Keep memory within limits
    if (this.memory.insights.length > this.thinkingConfig.maxMemoryItems) {
      this.memory.insights = this.memory.insights.slice(-this.thinkingConfig.maxMemoryItems);
    }

    // Update last thought process
    this.memory.lastThoughtProcess = item;
    
    logger.info('Stored item in CMO Brain memory', { type: item.type, timestamp: item.timestamp });
  }



  // Memory and thinking access methods
  getMemory() {
    return {
      insights: this.memory.insights.slice(-10), // Last 10 insights
      decisions: this.memory.decisions.slice(-10), // Last 10 decisions
      patterns: this.memory.patterns.slice(-10), // Last 10 patterns
      strategies: this.memory.strategies.slice(-10), // Last 10 strategies
      performanceHistory: this.memory.performanceHistory.slice(-10), // Last 10 performance records
      lastThoughtProcess: this.memory.lastThoughtProcess,
      memorySize: this.memory.insights.length,
      maxMemory: this.thinkingConfig.maxMemoryItems
    };
  }

  getThinkingConfig() {
    return this.thinkingConfig;
  }

  updateThinkingConfig(newConfig) {
    this.thinkingConfig = { ...this.thinkingConfig, ...newConfig };
    logger.info('Updated CMO Brain thinking configuration', this.thinkingConfig);
    return this.thinkingConfig;
  }

  clearMemory() {
    this.memory = {
      insights: [],
      decisions: [],
      patterns: [],
      strategies: [],
      performanceHistory: [],
      lastThoughtProcess: null
    };
    logger.info('Cleared CMO Brain memory');
    return { message: 'Memory cleared successfully' };
  }

  // Pattern recognition
  async recognizePatterns(data) {

    const prompt = `
Analyze the following data and identify patterns, trends, and correlations:

Data:
${JSON.stringify(data, null, 2)}

Previous Patterns (if any):
${JSON.stringify(this.memory.patterns.slice(-3), null, 2)}

Identify:
1. **Performance Patterns**: Recurring performance trends
2. **Behavioral Patterns**: Customer or market behavior patterns
3. **Seasonal Patterns**: Time-based patterns
4. **Correlation Patterns**: Relationships between different metrics
5. **Anomaly Patterns**: Unusual or unexpected patterns

Provide clear, actionable pattern insights.
`;

    const patterns = await this.callOpenAIWithFallback(prompt, 0.3, 1000);
    
    // Store patterns in memory
    this.memory.patterns.push({
      type: 'pattern',
      data,
      patterns,
      timestamp: new Date().toISOString()
    });

    return patterns;
  }



  // Main execution method
  async execute(task, input) {
    try {
      this.updateActivity();
      const normalizedTask = (task || '').toLowerCase().trim();
      console.log('CMO BRAIN TASK RECEIVED:', JSON.stringify(normalizedTask));
      logger.info(`CMO Brain executing task: ${normalizedTask}`, { input });

      // Map of task handlers
      const taskHandlers = {
        'think': async () => await this.think(input),
        'analyze_performance': async () => await this.analyzePerformanceWithProgress(input, () => {}, {}),
        'create_strategy': async () => await this.createStrategyWithProgress(input, () => {}, {}),
        'plan_campaign': async () => await this.planCampaign(input),
        'optimize_budget': async () => await this.optimizeBudget(input),
        'competitive_analysis': async () => await this.competitiveAnalysis(input),
        'customer_journey': async () => await this.mapCustomerJourney(input),
        'roi_analysis': async () => await this.analyzeROI(input),
        'recognize_patterns': async () => await this.recognizePatternsWithProgress(input, () => {}, {}),
      };

      if (taskHandlers[normalizedTask]) {
        return await taskHandlers[normalizedTask]();
      } else {
        // Print available tasks for debugging
        console.log('CMO BRAIN AVAILABLE TASKS:', Object.keys(taskHandlers));
        throw new Error(`Unknown task: ${normalizedTask}`);
      }
    } catch (error) {
      logger.error('CMO Brain execution error:', error);
      throw error;
    }
  }

  // Execute task with progress tracking
  async executeWithProgress(task, input, onProgress) {
    // Initialize trace for this execution
    this.initializeTrace(task, input);
    
    const startTime = Date.now();
    let totalTokens = { input: 0, output: 0, total: 0 };
    
    try {
      this.updateActivity();
      this.logWorkflowStep('Initialization', 0, 'Starting CMO Brain task execution');
      logger.info(`CMO Brain executing task: ${task}`, { input });

      this.logTrace('CMO_TASK_START', 'CMO Brain task execution started', {
        task,
        inputType: typeof input,
        hasInput: !!input
      });

      // Initialize progress
      onProgress({
        progress: 0,
        step: 'Initializing task...',
        steps: ['Initializing', 'Processing', 'Analyzing', 'Generating results', 'Completing']
      });

      let result;
      
      this.logWorkflowStep('Task Execution', 20, `Executing ${task} task`);
      
      switch (task) {
        case 'think':
          onProgress({ progress: 10, step: 'Starting thinking process...' });
          result = await this.thinkWithProgress(input, onProgress, totalTokens);
          break;
        case 'analyze_performance':
          onProgress({ progress: 10, step: 'Starting performance analysis...' });
          result = await this.analyzePerformanceWithProgress(input, onProgress, totalTokens);
          break;
        case 'create_strategy':
          onProgress({ progress: 10, step: 'Starting strategy creation...' });
          result = await this.createStrategyWithProgress(input, onProgress, totalTokens);
          break;
        case 'plan_campaign':
          onProgress({ progress: 10, step: 'Starting campaign planning...' });
          result = await this.planCampaignWithProgress(input, onProgress, totalTokens);
          break;
        case 'optimize_budget':
          onProgress({ progress: 10, step: 'Starting budget optimization...' });
          result = await this.optimizeBudgetWithProgress(input, onProgress, totalTokens);
          break;
        case 'competitive_analysis':
          onProgress({ progress: 10, step: 'Starting competitive analysis...' });
          result = await this.competitiveAnalysisWithProgress(input, onProgress, totalTokens);
          break;
        case 'customer_journey':
          onProgress({ progress: 10, step: 'Starting customer journey mapping...' });
          result = await this.mapCustomerJourneyWithProgress(input, onProgress, totalTokens);
          break;
        case 'roi_analysis':
          onProgress({ progress: 10, step: 'Starting ROI analysis...' });
          result = await this.analyzeROIWithProgress(input, onProgress, totalTokens);
          break;
        case 'recognize_patterns':
          onProgress({ progress: 10, step: 'Starting pattern recognition...' });
          result = await this.recognizePatternsWithProgress(input, onProgress, totalTokens);
          break;
        default:
          this.logError(new Error(`Unknown task: ${task}`), 'Unknown task type');
          throw new Error(`Unknown task: ${task}`);
      }

      this.logWorkflowStep('Completion', 100, 'CMO Brain task completed successfully');
      onProgress({ 
        progress: 100, 
        step: 'Task completed successfully',
        tokenUsage: totalTokens
      });

      // Log final summary
      this.logTrace(
        'EXECUTION_COMPLETE',
        `CMO Brain task ${task} completed successfully`,
        {
          task,
          duration: Date.now() - startTime,
          totalTokens,
          resultType: typeof result,
          hasResult: !!result
        }
      );

      return {
        ...result,
        trace: this.getTrace()
      };
    } catch (error) {
      this.logError(error, 'executeWithProgress');
      logger.error('CMO Brain execution error:', error);
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
        step: 'Initializing task...',
        message: `Starting ${task} task...`
      });

      let result;
      
      switch (task) {
        case 'think':
          result = await this.thinkWithStreaming(input, onUpdate, totalTokens);
          break;
        case 'analyze_performance':
          result = await this.analyzePerformanceWithStreaming(input, onUpdate, totalTokens);
          break;
        case 'create_strategy':
          result = await this.createStrategyWithStreaming(input, onUpdate, totalTokens);
          break;
        case 'plan_campaign':
          result = await this.planCampaignWithStreaming(input, onUpdate, totalTokens);
          break;
        case 'optimize_budget':
          result = await this.optimizeBudgetWithStreaming(input, onUpdate, totalTokens);
          break;
        case 'competitive_analysis':
          result = await this.competitiveAnalysisWithStreaming(input, onUpdate, totalTokens);
          break;
        case 'customer_journey':
          result = await this.mapCustomerJourneyWithStreaming(input, onUpdate, totalTokens);
          break;
        case 'roi_analysis':
          result = await this.analyzeROIWithStreaming(input, onUpdate, totalTokens);
          break;
        case 'recognize_patterns':
          result = await this.recognizePatternsWithStreaming(input, onUpdate, totalTokens);
          break;
        default:
          throw new Error(`Unknown task: ${task}`);
      }

      const duration = Date.now() - startTime;
      onUpdate({
        progress: 100,
        step: 'Task completed',
        message: `Task completed in ${duration}ms`,
        tokenUsage: totalTokens,
        duration
      });

      return result;
    } catch (error) {
      logger.error('CMO Brain streaming execution error:', error);
      throw error;
    }
  }

  // Estimate token usage for a prompt
  estimateTokenUsage(prompt) {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(prompt.length / 4);
  }

  // Helper method to track token usage from OpenAI response
  trackTokenUsage(response, totalTokens) {
    if (response && response.usage) {
      totalTokens.input += response.usage.prompt_tokens || 0;
      totalTokens.output += response.usage.completion_tokens || 0;
      totalTokens.total += response.usage.total_tokens || 0;
    }
    return totalTokens;
  }

  // Thinking with progress tracking
  async thinkWithProgress(input, onProgress, totalTokens) {
    try {
      onProgress({ progress: 20, step: 'Generating thought process...' });
      
      const thoughtProcess = await this.generateThoughtProcessWithTracking(input, {}, totalTokens);
      
      onProgress({ progress: 40, step: 'Extracting insights...' });
      const insights = await this.extractInsightsWithTracking(thoughtProcess, input, totalTokens);
      
      onProgress({ progress: 60, step: 'Making decisions...' });
      const decisions = await this.makeDecisionsWithTracking(insights, {}, totalTokens);
      
      onProgress({ progress: 80, step: 'Generating recommendations...' });
      const recommendations = await this.generateRecommendationsWithTracking(insights, decisions, totalTokens);
      
      // Store in memory
      this.storeInMemory({
        type: 'thought',
        input,
        context: {},
        thoughtProcess,
        insights,
        decisions,
        timestamp: new Date().toISOString()
      });

      return {
        thoughtProcess,
        insights,
        decisions,
        recommendations
      };
    } catch (error) {
      logger.error('Error in thinking process:', error);
      throw error;
    }
  }

  // Thinking with streaming updates
  async thinkWithStreaming(input, onUpdate, totalTokens) {
    try {
      onUpdate({
        progress: 20,
        step: 'Generating thought process...',
        message: 'Analyzing input data and generating strategic thoughts...'
      });
      
      const thoughtProcess = await this.generateThoughtProcessWithTracking(input, {}, totalTokens);
      
      onUpdate({
        progress: 40,
        step: 'Extracting insights...',
        message: 'Extracting key insights from analysis...'
      });
      
      const insights = await this.extractInsightsWithTracking(thoughtProcess, input, totalTokens);
      
      onUpdate({
        progress: 60,
        step: 'Making decisions...',
        message: 'Making strategic decisions based on insights...'
      });
      
      const decisions = await this.makeDecisionsWithTracking(insights, {}, totalTokens);
      
      onUpdate({
        progress: 80,
        step: 'Generating recommendations...',
        message: 'Creating actionable recommendations...'
      });
      
      const recommendations = await this.generateRecommendationsWithTracking(insights, decisions, totalTokens);
      
      // Store in memory
      this.storeInMemory({
        type: 'thought',
        input,
        context: {},
        thoughtProcess,
        insights,
        decisions,
        timestamp: new Date().toISOString()
      });

      return {
        thoughtProcess,
        insights,
        decisions,
        recommendations
      };
    } catch (error) {
      logger.error('Error in thinking process:', error);
      throw error;
    }
  }

  async generateThoughtProcessWithTracking(input, context, totalTokens) {
    if (!this.openai) {
      return this.generateMockThoughtProcess(input, context);
    }

    const prompt = `
You are a Chief Marketing Officer with deep strategic thinking capabilities. 
Analyze the following information and walk through your thought process step by step.

Input Data:
${JSON.stringify(input, null, 2)}

Context:
${JSON.stringify(context, null, 2)}

Previous Insights (if any):
${JSON.stringify(this.memory.insights.slice(-3), null, 2)}

Please think through this step by step:

1. **Data Analysis**: What patterns do you see in the data?
2. **Context Understanding**: How does this fit into the broader business context?
3. **Strategic Implications**: What are the strategic implications of these findings?
4. **Risk Assessment**: What risks or opportunities do you identify?
5. **Future Considerations**: How might this evolve over time?
6. **Cross-Connections**: How does this connect to other marketing activities?

Provide your thought process in clear, logical steps. Think like a strategic CMO would.
`;

    const response = await this.callOpenAIWithFallback(prompt, 0.4, 1500);

    // Track token usage (response is now a string, not an OpenAI response object)
    // this.trackTokenUsage(response, totalTokens);

    return response;
  }

  async extractInsightsWithTracking(thoughtProcess, input, totalTokens) {
    if (!this.openai) {
      return this.generateMockInsights(thoughtProcess, input);
    }

    const prompt = `
Based on the following thought process, extract key insights and patterns:

Thought Process:
${thoughtProcess}

Original Input:
${JSON.stringify(input, null, 2)}

Extract and organize insights into these categories:
1. **Performance Insights**: What's working well or poorly?
2. **Strategic Insights**: What strategic implications emerge?
3. **Pattern Insights**: What patterns or trends do you see?
4. **Opportunity Insights**: What opportunities are revealed?
5. **Risk Insights**: What risks or threats are identified?

Format as a clear, structured list of insights.
`;

    const response = await this.callOpenAIWithFallback(prompt, 0.3, 1000);

    // Track token usage (response is now a string, not an OpenAI response object)
    // this.trackTokenUsage(response, totalTokens);

    return response;
  }

  async makeDecisionsWithTracking(insights, context, totalTokens) {
    if (!this.openai) {
      return this.generateMockDecisions(insights, context);
    }

    const prompt = `
Based on these insights, what strategic decisions should be made?

Insights:
${insights}

Context:
${JSON.stringify(context, null, 2)}

Previous Decisions (if any):
${JSON.stringify(this.memory.decisions.slice(-3), null, 2)}

Make strategic decisions in these areas:
1. **Immediate Actions**: What should be done right now?
2. **Short-term Strategy**: What should be planned for the next 30-90 days?
3. **Long-term Strategy**: What should be planned for the next 6-12 months?
4. **Resource Allocation**: How should resources be reallocated?
5. **Risk Mitigation**: What actions should be taken to mitigate risks?

Provide clear, actionable decisions with reasoning.
`;

    const response = await this.callOpenAIWithFallback(prompt, 0.4, 1200);

    // Track token usage (response is now a string, not an OpenAI response object)
    // this.trackTokenUsage(response, totalTokens);

    return response;
  }

  async generateRecommendationsWithTracking(insights, decisions, totalTokens) {
    if (!this.openai) {
      return this.generateMockRecommendations(insights, decisions);
    }

    const prompt = `
Based on these insights and decisions, provide specific, actionable recommendations:

Insights:
${insights}

Decisions:
${decisions}

Provide recommendations in these categories:
1. **Immediate Actions** (Next 7 days)
2. **Short-term Initiatives** (Next 30 days)
3. **Medium-term Projects** (Next 90 days)
4. **Long-term Strategy** (Next 6-12 months)
5. **Success Metrics** to track progress

Make recommendations specific, measurable, and actionable.
`;

    const response = await this.callOpenAIWithFallback(prompt, 0.3, 1000);

    // Track token usage (response is now a string, not an OpenAI response object)
    // this.trackTokenUsage(response, totalTokens);

    return response;
  }

  // Performance analysis with progress tracking
  async analyzePerformanceWithProgress(data, onProgress, totalTokens) {

    onProgress({ progress: 30, step: 'Analyzing performance data...' });

    const prompt = `
You are a Chief Marketing Officer analyzing marketing performance data. 
Please provide a clear, simple analysis in plain English.

Data to analyze:
${JSON.stringify(data, null, 2)}

Please provide:
1. Key performance insights (what's working well)
2. Areas of concern (what needs improvement)
3. Specific recommendations for next steps
4. Expected impact of your recommendations

Keep your analysis simple and actionable. Focus on practical next steps.
`;

    onProgress({ progress: 60, step: 'Generating analysis...' });

    const response = await this.callOpenAIWithFallback(prompt, 0.3, 1000);

    // Track token usage (response is now a string, not an OpenAI response object)
    // this.trackTokenUsage(response, totalTokens);

    onProgress({ progress: 90, step: 'Finalizing results...' });

    return {
      task: 'analyze_performance',
      status: 'completed',
      result: response,
      timestamp: new Date().toISOString()
    };
  }

  // Performance analysis with streaming updates
  async analyzePerformanceWithStreaming(data, onUpdate, totalTokens) {

    onUpdate({
      progress: 30,
      step: 'Analyzing performance data...',
      message: 'Processing marketing performance metrics...'
    });

    const prompt = `
You are a Chief Marketing Officer analyzing marketing performance data. 
Please provide a clear, simple analysis in plain English.

Data to analyze:
${JSON.stringify(data, null, 2)}

Please provide:
1. Key performance insights (what's working well)
2. Areas of concern (what needs improvement)
3. Specific recommendations for next steps
4. Expected impact of your recommendations

Keep your analysis simple and actionable. Focus on practical next steps.
`;

    onUpdate({
      progress: 60,
      step: 'Generating analysis...',
      message: 'Creating performance insights and recommendations...'
    });

    const response = await this.callOpenAIWithFallback(prompt, 0.3, 1000);

    // Track token usage (response is now a string, not an OpenAI response object)
    // this.trackTokenUsage(response, totalTokens);

    onUpdate({
      progress: 90,
      step: 'Finalizing results...',
      message: 'Preparing final analysis report...'
    });

    return {
      task: 'analyze_performance',
      status: 'completed',
      result: response,
      timestamp: new Date().toISOString()
    };
  }

  // Create strategy with progress tracking
  async createStrategyWithProgress(requirements, onProgress, totalTokens) {

    onProgress({ progress: 25, step: 'Analyzing requirements...' });

    const prompt = `
You are a Chief Marketing Officer creating a marketing strategy. 
Please develop a comprehensive but simple marketing strategy based on these requirements:

${JSON.stringify(requirements, null, 2)}

Your strategy should include:
1. Target audience definition
2. Key messaging strategy
3. Channel recommendations
4. Timeline and milestones
5. Success metrics
6. Budget considerations

Make this strategy practical and easy to implement. Use simple language.
`;

    onProgress({ progress: 50, step: 'Creating strategy...' });

    const response = await this.callOpenAIWithFallback(prompt, 0.4, 1500);

    // Track token usage (response is now a string, not an OpenAI response object)
    // this.trackTokenUsage(response, totalTokens);

    onProgress({ progress: 90, step: 'Finalizing strategy...' });

    return {
      task: 'create_strategy',
      status: 'completed',
      result: response,
      timestamp: new Date().toISOString()
    };
  }

  // Create strategy with streaming updates
  async createStrategyWithStreaming(requirements, onUpdate, totalTokens) {

    onUpdate({
      progress: 25,
      step: 'Analyzing requirements...',
      message: 'Understanding business requirements and goals...'
    });

    const prompt = `
You are a Chief Marketing Officer creating a marketing strategy. 
Please develop a comprehensive but simple marketing strategy based on these requirements:

${JSON.stringify(requirements, null, 2)}

Your strategy should include:
1. Target audience definition
2. Key messaging strategy
3. Channel recommendations
4. Timeline and milestones
5. Success metrics
6. Budget considerations

Make this strategy practical and easy to implement. Use simple language.
`;

    onUpdate({
      progress: 50,
      step: 'Creating strategy...',
      message: 'Developing comprehensive marketing strategy...'
    });

    const response = await this.callOpenAIWithFallback(prompt, 0.4, 1500);

    // Track token usage (response is now a string, not an OpenAI response object)
    // this.trackTokenUsage(response, totalTokens);

    onUpdate({
      progress: 90,
      step: 'Finalizing strategy...',
      message: 'Finalizing marketing strategy document...'
    });

    return {
      task: 'create_strategy',
      status: 'completed',
      result: response,
      timestamp: new Date().toISOString()
    };
  }

  // Plan marketing campaign
  async planCampaign(campaignData) {
    const prompt = this.promptTemplates.getCampaignPlanningPrompt(campaignData);
    const response = await this.callOpenAIWithFallback(prompt, 0.4, 1500);

    return {
      task: 'plan_campaign',
      status: 'completed',
      result: response,
      timestamp: new Date().toISOString()
    };
  }

  // Optimize marketing budget
  async optimizeBudget(budgetData) {
    // Extract performance data and goals from budgetData if available
    const performanceData = budgetData.performance_data || {};
    const goals = budgetData.goals || {};
    
    const prompt = this.promptTemplates.getBudgetOptimizationPrompt(budgetData, performanceData, goals);
    const response = await this.callOpenAIWithFallback(prompt, 0.3, 1200);

    return {
      task: 'optimize_budget',
      status: 'completed',
      result: response,
      timestamp: new Date().toISOString()
    };
  }

  // Competitive analysis
  async competitiveAnalysis(competitorData) {
    const prompt = this.promptTemplates.getCompetitiveAnalysisPrompt(competitorData);
    const response = await this.callOpenAIWithFallback(prompt, 0.4, 1200);

    return {
      task: 'competitive_analysis',
      status: 'completed',
      result: response,
      timestamp: new Date().toISOString()
    };
  }

  // Map customer journey
  async mapCustomerJourney(customerData) {
    const prompt = this.promptTemplates.getCustomerJourneyPrompt(customerData);
    const response = await this.callOpenAIWithFallback(prompt, 0.4, 1200);

    return {
      task: 'customer_journey',
      status: 'completed',
      result: response,
      timestamp: new Date().toISOString()
    };
  }

  // Analyze ROI
  async analyzeROI(roiData) {
    const prompt = this.promptTemplates.getROIAnalysisPrompt(roiData);
    const response = await this.callOpenAIWithFallback(prompt, 0.3, 1200);

    return {
      task: 'roi_analysis',
      status: 'completed',
      result: response,
      timestamp: new Date().toISOString()
    };
  }

  // Pattern recognition with progress tracking
  async recognizePatternsWithProgress(data, onProgress, totalTokens) {

    onProgress({ progress: 20, step: 'Analyzing data patterns...' });

    const prompt = this.promptTemplates.getPatternRecognitionPrompt(data);

    onProgress({ progress: 60, step: 'Identifying patterns...' });

    const response = await this.callOpenAIWithFallback(prompt, 0.3, 1200);

    // Track token usage (response is now a string, not an OpenAI response object)
    // this.trackTokenUsage(response, totalTokens);

    onProgress({ progress: 90, step: 'Finalizing pattern analysis...' });

    return {
      task: 'recognize_patterns',
      status: 'completed',
      result: response,
      timestamp: new Date().toISOString()
    };
  }

  // Pattern recognition with streaming updates
  async recognizePatternsWithStreaming(data, onUpdate, totalTokens) {

    onUpdate({
      progress: 20,
      step: 'Analyzing data patterns...',
      message: 'Processing data to identify patterns and trends...'
    });

    const prompt = `
You are a Chief Marketing Officer analyzing patterns in marketing data.
Please identify key patterns and trends in the following data:

${JSON.stringify(data, null, 2)}

Focus on:
1. **Temporal Patterns**: Daily, weekly, monthly trends
2. **Performance Patterns**: What drives success/failure
3. **Correlation Patterns**: Relationships between different metrics
4. **Seasonal Patterns**: Time-based variations
5. **Behavioral Patterns**: Customer behavior insights

Provide clear, actionable insights about the patterns you discover.
`;

    onUpdate({
      progress: 60,
      step: 'Identifying patterns...',
      message: 'Discovering key patterns and correlations...'
    });

    const response = await this.callOpenAIWithFallback(prompt, 0.3, 1200);

    // Track token usage (response is now a string, not an OpenAI response object)
    // this.trackTokenUsage(response, totalTokens);

    onUpdate({
      progress: 90,
      step: 'Finalizing pattern analysis...',
      message: 'Preparing pattern analysis report...'
    });

    return {
      task: 'recognize_patterns',
      status: 'completed',
      result: response,
      timestamp: new Date().toISOString()
    };
  }

  // Add placeholder methods for other tasks
  async planCampaignWithProgress(campaignData, onProgress, totalTokens) {
    onProgress({ progress: 50, step: 'Planning campaign...' });
    return await this.planCampaign(campaignData);
  }

  async planCampaignWithStreaming(campaignData, onUpdate, totalTokens) {
    onUpdate({
      progress: 50,
      step: 'Planning campaign...',
      message: 'Creating campaign plan...'
    });
    return await this.planCampaign(campaignData);
  }

  async optimizeBudgetWithProgress(budgetData, onProgress, totalTokens) {
    onProgress({ progress: 50, step: 'Optimizing budget...' });
    return await this.optimizeBudget(budgetData);
  }

  async optimizeBudgetWithStreaming(budgetData, onUpdate, totalTokens) {
    onUpdate({
      progress: 50,
      step: 'Optimizing budget...',
      message: 'Optimizing budget allocation...'
    });
    return await this.optimizeBudget(budgetData);
  }

  async competitiveAnalysisWithProgress(competitorData, onProgress, totalTokens) {
    onProgress({ progress: 50, step: 'Analyzing competitors...' });
    return await this.competitiveAnalysis(competitorData);
  }

  async competitiveAnalysisWithStreaming(competitorData, onUpdate, totalTokens) {
    onUpdate({
      progress: 50,
      step: 'Analyzing competitors...',
      message: 'Analyzing competitive landscape...'
    });
    return await this.competitiveAnalysis(competitorData);
  }

  async mapCustomerJourneyWithProgress(customerData, onProgress, totalTokens) {
    onProgress({ progress: 50, step: 'Mapping customer journey...' });
    return await this.mapCustomerJourney(customerData);
  }

  async mapCustomerJourneyWithStreaming(customerData, onUpdate, totalTokens) {
    onUpdate({
      progress: 50,
      step: 'Mapping customer journey...',
      message: 'Creating customer journey map...'
    });
    return await this.mapCustomerJourney(customerData);
  }

  async analyzeROIWithProgress(roiData, onProgress, totalTokens) {
    onProgress({ progress: 50, step: 'Analyzing ROI...' });
    return await this.analyzeROI(roiData);
  }

  async analyzeROIWithStreaming(roiData, onUpdate, totalTokens) {
    onUpdate({
      progress: 50,
      step: 'Analyzing ROI...',
      message: 'Calculating ROI and performance metrics...'
    });
    return await this.analyzeROI(roiData);
  }

  // Autonomous task selection based on incoming data
  async selectAutonomousTask(data, context = {}) {
    try {

      const prompt = `
You are a Chief Marketing Officer AI agent. Based on the incoming data and context, determine which task(s) should be executed autonomously.

Available Tasks:
${JSON.stringify(this.getAvailableTasks(), null, 2)}

Incoming Data:
${JSON.stringify(data, null, 2)}

Context:
${JSON.stringify(context, null, 2)}

Previous Memory (last 3 items):
${JSON.stringify(this.memory.insights.slice(-3), null, 2)}

Analyze the data and context to determine:
1. What type of data is this?
2. What business situation does it represent?
3. Which task(s) are most appropriate to execute?
4. What is the priority level?

Return a JSON response with this structure:
{
  "selectedTasks": [
    {
      "taskId": "task_id",
      "priority": "high|medium|low",
      "reasoning": "Why this task should be executed",
      "input": "What input data to pass to the task"
    }
  ],
  "reasoning": "Overall reasoning for task selection",
  "confidence": 0.95
}

Only select tasks that are clearly needed based on the data. Be conservative and strategic.
`;

      const response = await this.callOpenAIWithFallback(prompt, 0.3, 800);
      const result = JSON.parse(response);
      
      logger.info('CMO Brain autonomous task selection:', result);
      return result;
    } catch (error) {
      logger.error('Error in autonomous task selection:', error);
      throw new Error(`Autonomous task selection failed: ${error.message}`);
    }
  }



  // Execute autonomous tasks based on data
  async executeAutonomousTasks(data, context = {}) {
    try {
      logger.info('CMO Brain executing autonomous tasks based on data');
      
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
          
          // Store in memory
          this.storeInMemory({
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

  // OpenAI API call
  async callOpenAIWithFallback(prompt, temperature = 0.3, maxTokens = 1000) {

    // Estimate token usage and check if we can proceed
    const estimatedTokens = this.estimateTokenUsage(prompt) + maxTokens;
    if (!this.resourceManager.canUseOpenAI(estimatedTokens, 'medium')) {
      logger.warn('OpenAI token limit exceeded, using mock response');
      return '{"mock": "response", "status": "Token limit exceeded"}';
    }

    let lastError;
    // Try models in priority order for cost optimization
    for (let attempt = 1; attempt <= this.modelConfig.maxRetries; attempt++) {
      try {
        const model = this.modelConfig.models[attempt - 1] || this.modelConfig.fallback;
        
        const response = await this.openai.chat.completions.create({
          model: model,
          messages: [{ role: 'user', content: prompt }],
          temperature: temperature,
          max_tokens: maxTokens
        });

        const result = response.choices[0].message.content;
        
        // Record usage with the resource manager
        const inputTokens = response.usage.prompt_tokens;
        const outputTokens = response.usage.completion_tokens;
        this.resourceManager.recordOpenAIUsage(inputTokens, outputTokens, model);
        
        return result;
      } catch (error) {
        lastError = error;
        const model = this.modelConfig.models[attempt - 1] || this.modelConfig.fallback;
        logger.warn(`OpenAI API call failed with model ${model}, attempt ${attempt}:`, error.message);
        
        if (attempt === this.modelConfig.maxRetries) {
          throw new Error(`All OpenAI API attempts failed. Last error: ${lastError.message}`);
        }
      }
    }
  }

  async analyzeContentStrategy(context = {}) {
    try {
      const contentStats = await this.contentManager.getContentStats();
      const availableContent = await this.contentManager.getAllContent();
      
      const analysis = {
        contentInventory: {
          total: contentStats.total,
          byType: contentStats.byType,
          byCategory: contentStats.byCategory,
          byBrandRelevance: contentStats.byBrandRelevance
        },
        contentGaps: [],
        recommendations: [],
        strategicDecisions: []
      };
      
      // Analyze content gaps
      if (contentStats.byType.images < 10) {
        analysis.contentGaps.push('Need more brand-relevant images for social media campaigns');
      }
      
      if (contentStats.byType.videos < 3) {
        analysis.contentGaps.push('Video content is limited - consider creating more video assets');
      }
      
      if (contentStats.unused > contentStats.total * 0.6) {
        analysis.contentGaps.push('High percentage of unused content - need better content utilization strategy');
      }
      
      // Generate strategic recommendations
      if (contentStats.byBrandRelevance.high < 5) {
        analysis.recommendations.push('Prioritize creating high-brand-relevance content for better campaign performance');
      }
      
      if (contentStats.byCategory.general > contentStats.total * 0.7) {
        analysis.recommendations.push('Diversify content categories for better audience engagement');
      }
      
      // Make strategic decisions
      if (contentStats.total < 20) {
        analysis.strategicDecisions.push('Content library is small - focus on content creation before major campaigns');
      } else if (contentStats.unused > contentStats.total * 0.5) {
        analysis.strategicDecisions.push('Optimize existing content usage before creating new content');
      } else {
        analysis.strategicDecisions.push('Content library is well-balanced - proceed with planned campaigns');
      }
      
      return analysis;
      
    } catch (error) {
      logger.error('Content strategy analysis failed:', error);
      return {
        error: error.message,
        contentInventory: { total: 0 },
        contentGaps: ['Unable to analyze content strategy'],
        recommendations: ['Check content management system'],
        strategicDecisions: ['Review content availability']
      };
    }
  }

  async planContentAwareCampaign(campaignData) {
    try {
      const { campaignName, targetAudience, platforms, budget, timeline } = campaignData;
      
      // Analyze available content
      const contentAnalysis = await this.analyzeContentStrategy();
      const relevantContent = await this.contentManager.getContentRecommendations({
        campaign: campaignName,
        contentType: 'images'
      });
      
      const campaign = {
        name: campaignName,
        targetAudience,
        platforms,
        budget,
        timeline,
        contentStrategy: {
          availableContent: relevantContent.length,
          contentGaps: contentAnalysis.contentGaps,
          recommendations: contentAnalysis.recommendations
        },
        phases: []
      };
      
      // Plan campaign phases based on content availability
      if (relevantContent.length >= 5) {
        campaign.phases.push({
          phase: 'Launch',
          duration: '1 week',
          contentNeeds: 'High',
          strategy: 'Use existing high-quality content for initial launch',
          contentSources: ['uploaded', 'generated']
        });
        
        campaign.phases.push({
          phase: 'Sustain',
          duration: '2-3 weeks',
          contentNeeds: 'Medium',
          strategy: 'Mix of existing and new content',
          contentSources: ['uploaded', 'generated', 'new']
        });
      } else {
        campaign.phases.push({
          phase: 'Preparation',
          duration: '1-2 weeks',
          contentNeeds: 'High',
          strategy: 'Create new content before campaign launch',
          contentSources: ['generated', 'new']
        });
        
        campaign.phases.push({
          phase: 'Launch',
          duration: '1 week',
          contentNeeds: 'Medium',
          strategy: 'Launch with newly created content',
          contentSources: ['generated', 'new']
        });
      }
      
      return campaign;
      
    } catch (error) {
      logger.error('Content-aware campaign planning failed:', error);
      return {
        error: error.message,
        name: campaignData.campaignName,
        contentStrategy: {
          availableContent: 0,
          contentGaps: ['Unable to analyze content'],
          recommendations: ['Check content management system']
        }
      };
    }
  }

  async makeContentDecisions(context = {}) {
    try {
      const { campaign, platform, targetAudience, budget } = context;
      
      const decisions = {
        useUploadedContent: true,
        generateNewContent: false,
        contentMix: '70% uploaded, 30% generated',
        priority: 'brand-relevance',
        recommendations: []
      };
      
      // Analyze available content
      const availableContent = await this.contentManager.getContentRecommendations({
        campaign: campaign,
        contentType: 'images',
        platform: platform
      });
      
      if (availableContent.length >= 3) {
        decisions.useUploadedContent = true;
        decisions.generateNewContent = false;
        decisions.recommendations.push('Sufficient uploaded content available - prioritize user-generated content');
      } else if (availableContent.length >= 1) {
        decisions.useUploadedContent = true;
        decisions.generateNewContent = true;
        decisions.contentMix = '50% uploaded, 50% generated';
        decisions.recommendations.push('Mix uploaded and generated content for optimal variety');
      } else {
        decisions.useUploadedContent = false;
        decisions.generateNewContent = true;
        decisions.contentMix = '100% generated';
        decisions.recommendations.push('No relevant uploaded content - generate new brand-aligned content');
      }
      
      // Consider budget constraints
      if (budget && budget < 100) {
        decisions.generateNewContent = false;
        decisions.contentMix = '100% uploaded';
        decisions.recommendations.push('Budget constraints - use only uploaded content');
      }
      
      return decisions;
      
    } catch (error) {
      logger.error('Content decision making failed:', error);
      return {
        useUploadedContent: true,
        generateNewContent: true,
        contentMix: '50% uploaded, 50% generated',
        priority: 'brand-relevance',
        recommendations: ['Error analyzing content - using default strategy']
      };
    }
  }

  // Get available tasks
  getAvailableTasks() {
    return [
      {
        id: 'think',
        name: 'Strategic Thinking & Analysis',
        description: 'Deep strategic thinking with memory, insights, and recommendations',
        requiredInput: ['data', 'context'],
        triggers: ['data_received', 'daily_analysis', 'strategy_needed'],
        priority: 'high'
      },
      {
        id: 'analyze_performance',
        name: 'Analyze Marketing Performance',
        description: 'Analyze marketing data and provide performance insights',
        requiredInput: ['performance_data'],
        triggers: ['performance_data_received', 'metrics_update', 'campaign_end'],
        priority: 'high'
      },
      {
        id: 'create_strategy',
        name: 'Create Marketing Strategy',
        description: 'Develop comprehensive marketing strategy',
        requiredInput: ['business_goals', 'target_audience', 'budget'],
        triggers: ['new_quarter', 'strategy_review', 'business_goals_update'],
        priority: 'high'
      },
      {
        id: 'plan_campaign',
        name: 'Plan Marketing Campaign',
        description: 'Create detailed campaign plan',
        requiredInput: ['campaign_objectives', 'target_audience', 'budget', 'timeline'],
        triggers: ['campaign_request', 'opportunity_identified', 'seasonal_planning'],
        priority: 'medium'
      },
      {
        id: 'optimize_budget',
        name: 'Optimize Marketing Budget',
        description: 'Analyze and optimize budget allocation',
        requiredInput: ['budget_data', 'performance_data', 'goals'],
        triggers: ['budget_review', 'performance_issues', 'quarterly_planning'],
        priority: 'medium'
      },
      {
        id: 'competitive_analysis',
        name: 'Competitive Analysis',
        description: 'Analyze competitors and market positioning',
        requiredInput: ['competitor_list', 'market_data'],
        triggers: ['competitor_activity', 'market_changes', 'positioning_review'],
        priority: 'medium'
      },
      {
        id: 'customer_journey',
        name: 'Map Customer Journey',
        description: 'Create customer journey map',
        requiredInput: ['customer_data', 'touchpoints'],
        triggers: ['customer_feedback', 'journey_optimization', 'new_product'],
        priority: 'low'
      },
      {
        id: 'roi_analysis',
        name: 'ROI Analysis',
        description: 'Analyze marketing ROI and performance',
        requiredInput: ['investment_data', 'revenue_data', 'timeframe'],
        triggers: ['campaign_end', 'quarterly_review', 'budget_justification'],
        priority: 'high'
      },
      {
        id: 'recognize_patterns',
        name: 'Pattern Recognition',
        description: 'Identify patterns, trends, and correlations in data',
        requiredInput: ['data'],
        triggers: ['data_accumulation', 'trend_analysis', 'performance_review'],
        priority: 'medium'
      }
    ];
  }
}

module.exports = CMOBrain; 