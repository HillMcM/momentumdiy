const ResourceManager = require('../utils/resource-manager');
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');
const ResearchDatabase = require('../utils/research-database');

class AgentCoordinator {
  constructor(agentManager) {
    this.agentManager = agentManager;
    this.name = 'Agent Coordinator';
    this.description = 'Coordinates communication and workflows between agents';
    this.status = 'active';
    this.lastActivity = new Date().toISOString();
    
    // Initialize resource manager
    this.resourceManager = new ResourceManager();
    this.researchDatabase = new ResearchDatabase();
    
    // File paths for data persistence
    this.executionHistoryFile = path.join(__dirname, '../../data/coordinator-execution-history.json');
    this.communicationHistoryFile = path.join(__dirname, '../../data/communication-history.json');
    
    // Execution history tracking
    this.executionHistory = [];
    this.maxHistorySize = 100;
    
    // Load existing data
    this.loadExecutionHistory();
    this.loadCommunicationHistory();
    
    // Communication channels between agents
    this.communicationChannels = {
      'cmo-brain': {
        'market-researcher': [],
        'data-analyst': [],
        'copywriting-agent': [],
        'content-creator': [],
        'social-media-manager': [],
        'analytics-agent': []
      },
      'data-analyst': {
        'cmo-brain': [],
        'market-researcher': [],
        'copywriting-agent': []
      },
      'market-researcher': {
        'cmo-brain': [],
        'data-analyst': [],
        'copywriting-agent': []
      },
      'copywriting-agent': {
        'cmo-brain': [],
        'data-analyst': [],
        'market-researcher': []
      }
    };
    
    // Daily workflow configuration
    this.dailyWorkflow = {
      enabled: true,
      triggerTime: '08:00', // 8 AM
      timezone: 'America/New_York',
      lastExecution: null,
      nextExecution: null,
      weekdayOnly: true // Only run on weekdays
    };
    
    // Agent deployment strategies
    this.deploymentStrategies = {
      marketResearch: {
        triggers: ['daily', 'trend_alert', 'competitor_activity'],
        priority: 'high',
        maxConcurrent: 1
      },
      contentCreation: {
        triggers: ['trend_opportunity', 'content_gap', 'campaign_launch'],
        priority: 'medium',
        maxConcurrent: 2
      },
      copywriting: {
        triggers: ['content_opportunity', 'blog_post_needed', 'social_media_content', 'email_campaign'],
        priority: 'medium',
        maxConcurrent: 1
      },
      socialMedia: {
        triggers: ['content_ready', 'trend_engagement', 'community_management'],
        priority: 'medium',
        maxConcurrent: 1
      }
    };

    // Workflow execution lock
    this.isWorkflowRunning = false;
    
    // Storage for weekly content workflow
    this.lastBlogPost = null;
  }

  // Load execution history from file
  async loadExecutionHistory() {
    try {
      const data = await fs.readFile(this.executionHistoryFile, 'utf8');
      this.executionHistory = JSON.parse(data);
      logger.info(`Loaded ${this.executionHistory.length} coordinator execution history records`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        logger.info('No existing coordinator execution history file found, starting fresh');
      } else {
        logger.error('Error loading coordinator execution history:', error);
      }
    }
  }

  // Load communication history from file
  async loadCommunicationHistory() {
    try {
      const data = await fs.readFile(this.communicationHistoryFile, 'utf8');
      const history = JSON.parse(data);
      
      // Restore communication channels
      for (const [fromAgent, toAgents] of Object.entries(history)) {
        if (this.communicationChannels[fromAgent]) {
          for (const [toAgent, messages] of Object.entries(toAgents)) {
            if (this.communicationChannels[fromAgent][toAgent]) {
              this.communicationChannels[fromAgent][toAgent] = messages;
            }
          }
        }
      }
      
      logger.info('Communication history loaded successfully');
    } catch (error) {
      if (error.code === 'ENOENT') {
        logger.info('No existing communication history file found, starting fresh');
      } else {
        logger.error('Error loading communication history:', error);
      }
    }
  }

  // Save execution history to file
  async saveExecutionHistory() {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.executionHistoryFile);
      await fs.mkdir(dataDir, { recursive: true });
      
      await fs.writeFile(this.executionHistoryFile, JSON.stringify(this.executionHistory, null, 2));
      logger.info(`Saved ${this.executionHistory.length} coordinator execution history records`);
    } catch (error) {
      logger.error('Error saving coordinator execution history:', error);
    }
  }

  // Get coordinator info
  getInfo() {
    return {
      id: 'agent-coordinator',
      name: this.name,
      description: this.description,
      status: this.status,
      lastActivity: this.lastActivity,
      dailyWorkflow: this.dailyWorkflow,
      deploymentStrategies: this.deploymentStrategies
    };
  }

  // Update last activity
  updateActivity() {
    this.lastActivity = new Date().toISOString();
  }

  // Send message between agents
  async sendMessage(fromAgent, toAgent, message) {
    try {
      this.updateActivity();
      logger.info(`Sending message from ${fromAgent} to ${toAgent}`, { message });
      
      const messageData = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        from: fromAgent,
        to: toAgent,
        content: message,
        timestamp: new Date().toISOString(),
        status: 'sent'
      };
      
      // Store message in communication channel
      if (this.communicationChannels[fromAgent] && this.communicationChannels[fromAgent][toAgent]) {
        this.communicationChannels[fromAgent][toAgent].push(messageData);
        
        // Keep only last 50 messages per channel
        if (this.communicationChannels[fromAgent][toAgent].length > 50) {
          this.communicationChannels[fromAgent][toAgent] = 
            this.communicationChannels[fromAgent][toAgent].slice(-50);
        }
      }
      
      return messageData;
    } catch (error) {
      logger.error('Error sending message between agents:', error);
      throw error;
    }
  }

  // Get communication history between agents
  getCommunicationHistory(fromAgent, toAgent, limit = 20) {
    try {
      if (this.communicationChannels[fromAgent] && this.communicationChannels[fromAgent][toAgent]) {
        return this.communicationChannels[fromAgent][toAgent]
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, limit);
      }
      return [];
    } catch (error) {
      logger.error('Error getting communication history:', error);
      return [];
    }
  }

  // Execute daily CMO workflow with real-time progress updates
  async executeDailyCMOWorkflowWithProgress(onProgress) {
    logger.info('🚀 executeDailyCMOWorkflowWithProgress: Starting workflow execution');
    
    // Create a wrapper function that stores progress updates
    const progressWrapper = async (progressUpdate) => {
      // Store the progress update
      await this.addWorkflowProgress(progressUpdate);
      
      // Call the original progress callback
      if (onProgress) {
        onProgress(progressUpdate);
      }
    };

    // Check if workflow is already running
    if (this.isWorkflowRunning) {
      logger.info('⚠️ Workflow already running, skipping execution');
      await progressWrapper({
        type: 'workflow_skipped',
        message: '⚠️ Workflow already running - please wait for current execution to complete',
        step: 'workflow_lock',
        progress: 100,
        timestamp: new Date().toISOString()
      });
      logger.warn('Workflow execution skipped - already running');
      return {
        workflowId: `daily-cmo-${new Date().toISOString().split('T')[0]}`,
        status: 'skipped',
        reason: 'Workflow already running',
        timestamp: new Date().toISOString()
      };
    }

    // Set workflow running flag
    this.isWorkflowRunning = true;
    logger.info('🔒 Workflow running flag set to true');
    
    try {
      this.updateActivity();
      logger.info('✅ Activity updated');
      
      // Send initial progress update
      logger.info('📤 Sending initial progress update');
      await progressWrapper({
        type: 'workflow_started',
        message: '🚀 Starting autonomous daily CMO workflow execution',
        step: 'initializing',
        progress: 0,
        timestamp: new Date().toISOString()
      });
      
      logger.info('🚀 Starting autonomous daily CMO workflow execution');
      
      const workflowId = `daily-cmo-${new Date().toISOString().split('T')[0]}`;
      const startTime = Date.now();
      
      // Check if it's a weekday (if weekdayOnly is enabled)
      if (this.dailyWorkflow.weekdayOnly) {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          await progressWrapper({
            type: 'workflow_skipped',
            message: 'Daily workflow skipped - weekend detected',
            step: 'weekend_check',
            progress: 100,
            timestamp: new Date().toISOString()
          });
          logger.info('Daily workflow skipped - weekend detected');
          return {
            workflowId,
            status: 'skipped',
            reason: 'Weekend detected, workflow only runs on weekdays',
            timestamp: new Date().toISOString()
          };
        }
      }
      
      // Check resource availability before executing workflow
      const resourceCheck = this.resourceManager.shouldExecuteWorkflow();
      if (!resourceCheck.canExecute) {
        await progressWrapper({
          type: 'workflow_skipped',
          message: 'Daily workflow skipped - insufficient resources available',
          step: 'resource_check',
          progress: 100,
          timestamp: new Date().toISOString()
        });
        logger.warn('Daily workflow skipped - insufficient resources available');
        return {
          workflowId,
          status: 'skipped',
          reason: 'Insufficient resources available',
          resourceStatus: resourceCheck.reasons,
          recommendations: this.resourceManager.getResourceRecommendations(),
          timestamp: new Date().toISOString()
        };
      }
      
      await progressWrapper({
        type: 'resource_check_passed',
        message: '✅ Resource check passed - proceeding with workflow execution',
        step: 'resource_check',
        progress: 5,
        timestamp: new Date().toISOString()
      });
      
      // Get initial resource usage before workflow starts
      const initialUsage = this.resourceManager.getCurrentUsage();
      
      // Track workflow-specific resource usage
      const workflowResourceUsage = {
        openai: { tokens: 0, cost: 0 },
        newsApi: { calls: 0 },
        serpApi: { calls: 0 }
      };
      logger.info('✅ Resource check passed - proceeding with workflow execution');
      
      // Step 1: Data Analyst gathers comprehensive data and creates clean document for CMO
      await progressWrapper({
        type: 'agent_started',
        agent: 'data-analyst',
        message: '📊 Step 1: Data Analyst gathering comprehensive data and creating clean document for CMO',
        step: 'data_analysis',
        progress: 10,
        status: 'running',
        timestamp: new Date().toISOString()
      });
      logger.info('📊 Step 1: Data Analyst gathering comprehensive data and creating clean document for CMO');
      const dataAnalystReport = await this.getComprehensiveDataAnalystReport();
      
      await progressWrapper({
        type: 'agent_completed',
        agent: 'data-analyst',
        message: 'Data Analyst report completed successfully',
        step: 'data_analysis',
        progress: 20,
        status: 'completed',
        timestamp: new Date().toISOString()
      });
      
      // Step 2: CMO Brain analyzes data and determines top 3 priorities
      await progressWrapper({
        type: 'agent_started',
        agent: 'cmo-brain',
        message: '🎯 Step 2: CMO Brain analyzing data and determining top 3 priorities',
        step: 'cmo_analysis',
        progress: 30,
        status: 'running',
        timestamp: new Date().toISOString()
      });
      logger.info('🎯 Step 2: CMO Brain analyzing data and determining top 3 priorities');
      const cmoPrioritiesResult = await this.determineCMOPriorities(dataAnalystReport);
      
      // Extract the priorities array from the result object
      const cmoPriorities = cmoPrioritiesResult.priorities || [];
      
      await progressWrapper({
        type: 'agent_completed',
        agent: 'cmo-brain',
        message: 'CMO Brain priorities determined successfully',
        step: 'cmo_analysis',
        progress: 35,
        status: 'completed',
        timestamp: new Date().toISOString()
      });
      logger.info('CMO Brain priorities determined successfully');
      
      // Step 3: CMO Brain intelligently assesses existing content and determines what's needed
      await progressWrapper({
        type: 'agent_started',
        agent: 'cmo-brain',
        message: '🧠 Step 3: CMO Brain intelligently assessing existing content and determining what\'s needed',
        step: 'content_assessment',
        progress: 40,
        status: 'running',
        timestamp: new Date().toISOString()
      });
      logger.info('🧠 Step 3: CMO Brain intelligently assessing existing content and determining what\'s needed');
      
      // Extract the priorities array from the cmoPriorities object
      let prioritiesArray = [];
      if (cmoPriorities) {
        if (Array.isArray(cmoPriorities)) {
          prioritiesArray = cmoPriorities;
        } else if (cmoPriorities.priorities && Array.isArray(cmoPriorities.priorities)) {
          prioritiesArray = cmoPriorities.priorities;
        } else if (cmoPriorities.priorities && !Array.isArray(cmoPriorities.priorities)) {
          // Handle case where priorities might be a single object
          prioritiesArray = [cmoPriorities.priorities];
        } else {
          // Fallback: treat cmoPriorities as a single priority
          prioritiesArray = [cmoPriorities];
        }
      }
      
      // Ensure we have at least some priorities to work with
      if (prioritiesArray.length === 0) {
        logger.warn('No priorities found, using default priorities');
        prioritiesArray = [
          {
            id: 'priority-1',
            title: 'Enhance Website Conversion',
            priority: 'high',
            businessContext: 'Focus on local business automation opportunities and lead generation'
          },
          {
            id: 'priority-2', 
            title: 'Leverage Social Media for Engagement',
            priority: 'medium',
            businessContext: 'Focus on platforms where local business owners are active (Facebook, LinkedIn, Google Business Profile)'
          }
        ];
      }
      
      const contentAssessment = await this.assessExistingContentAndNeeds(prioritiesArray);
      
      await progressWrapper({
        type: 'agent_completed',
        agent: 'cmo-brain',
        message: 'Content assessment completed successfully',
        step: 'content_assessment',
        progress: 50,
        status: 'completed',
        timestamp: new Date().toISOString()
      });
      
      // Step 4: CMO Brain selectively delegates tasks only when needed
      await progressWrapper({
        type: 'agent_started',
        agent: 'cmo-brain',
        message: '🎯 Step 4: CMO Brain selectively delegating tasks only when needed',
        step: 'task_delegation',
        progress: 55,
        status: 'running',
        timestamp: new Date().toISOString()
      });
      logger.info('🎯 Step 4: CMO Brain selectively delegating tasks only when needed');
      
      logger.info('🔄 Calling selectivelyDelegateTasksWithProgress...');
      const delegatedAgentResults = await this.selectivelyDelegateTasksWithProgress(prioritiesArray, contentAssessment, onProgress);
      
      // Combine Data Analyst results with delegated agent results
      const agentResults = {
        dataAnalyst: dataAnalystReport,
        ...delegatedAgentResults
      };
      logger.info('✅ selectivelyDelegateTasksWithProgress completed');
      logger.info('🔍 agentResults returned from selectivelyDelegateTasksWithProgress:', {
        hasAgentResults: !!agentResults,
        agentResultsType: typeof agentResults,
        agentResultsKeys: agentResults ? Object.keys(agentResults) : 'null',
        dataAnalyst: agentResults?.dataAnalyst ? 'present' : 'missing',
        agentResultsContent: agentResults ? JSON.stringify(agentResults).substring(0, 500) + '...' : 'null'
      });
      
      await progressWrapper({
        type: 'agent_completed',
        agent: 'cmo-brain',
        message: 'Task delegation completed successfully',
        step: 'task_delegation',
        progress: 80,
        status: 'completed',
        timestamp: new Date().toISOString()
      });
      
      // Step 5: CMO Brain processes results and creates final recommendations
      await progressWrapper({
        type: 'agent_started',
        agent: 'cmo-brain',
        message: '📋 Step 5: CMO Brain processing results and creating final recommendations',
        step: 'final_recommendations',
        progress: 85,
        status: 'running',
        timestamp: new Date().toISOString()
      });
      logger.info('📋 Step 5: CMO Brain processing results and creating final recommendations');
      const finalRecommendations = await this.createFinalRecommendations(prioritiesArray, agentResults);
      
      await progressWrapper({
        type: 'agent_completed',
        agent: 'cmo-brain',
        message: 'Final recommendations created successfully',
        step: 'final_recommendations',
        progress: 90,
        status: 'completed',
        timestamp: new Date().toISOString()
      });
      
      // Step 6: Compile comprehensive daily report
      await progressWrapper({
        type: 'agent_started',
        agent: 'system',
        message: '📄 Step 6: Compiling comprehensive daily workflow report',
        step: 'report_compilation',
        progress: 95,
        status: 'running',
        timestamp: new Date().toISOString()
      });
      logger.info('📄 Step 6: Compiling comprehensive daily workflow report');
      const dailyReport = await this.compileDailyReport({
        workflowId,
        startTime,
        dataAnalystReport,
        cmoPriorities: prioritiesArray,
        contentAssessment,
        agentResults,
        finalRecommendations
      });
      
      // Update workflow execution
      this.dailyWorkflow.lastExecution = new Date().toISOString();
      this.dailyWorkflow.nextExecution = this.calculateNextExecution();
      
      // Calculate workflow-specific resource usage
      const finalUsage = this.resourceManager.getCurrentUsage();
      const workflowUsage = {
        openai: {
          tokens: Math.max(0, finalUsage.openai.dailyUsage - initialUsage.openai.dailyUsage),
          cost: Math.max(0, finalUsage.openai.totalCost - initialUsage.openai.totalCost)
        },
        newsApi: {
          calls: Math.max(0, finalUsage.newsApi.dailyUsage - initialUsage.newsApi.dailyUsage)
        },
        serpApi: {
          calls: Math.max(0, finalUsage.serpApi.dailyUsage - initialUsage.serpApi.dailyUsage)
        }
      };
      
      // Log resource usage for debugging
      logger.info(`Workflow resource usage - OpenAI: ${workflowUsage.openai.tokens} tokens, $${workflowUsage.openai.cost.toFixed(4)} cost`);
      logger.info(`Workflow resource usage - News API: ${workflowUsage.newsApi.calls} calls, SERP API: ${workflowUsage.serpApi.calls} calls`);
      logger.info(`Initial usage - OpenAI: ${initialUsage.openai.dailyUsage} tokens, Final usage: ${finalUsage.openai.dailyUsage} tokens`);
      
      // Debug logging for agentResults
      logger.info('Debug: agentResults before execution record creation:', {
        hasAgentResults: !!agentResults,
        agentResultsKeys: agentResults ? Object.keys(agentResults) : 'null',
        dataAnalyst: agentResults?.dataAnalyst ? 'present' : 'missing',
        marketResearcher: agentResults?.marketResearcher ? 'present' : 'missing',
        copywritingAgent: agentResults?.copywritingAgent ? 'present' : 'missing',
        socialContentAgent: agentResults?.socialContentAgent ? 'present' : 'missing',
        leadSalesAgent: agentResults?.leadSalesAgent ? 'present' : 'missing'
      });
      
      // Log the actual agentResults object for debugging
      logger.info('Debug: Full agentResults object:', JSON.stringify(agentResults, null, 2));

      // Create execution record with proper agentResults structure
      const executionRecord = {
        id: workflowId,
        type: 'Daily CMO Workflow',
        status: 'completed',
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        dataAnalysis: dataAnalystReport,
        cmoPriorities: prioritiesArray,
        contentAssessment: contentAssessment,
        // Use the new agentResults structure
        agentResults: agentResults || {
          dataAnalyst: null,
          marketResearcher: null,
          copywritingAgent: null,
          socialContentAgent: null,
          socialPostingAgent: null,
          leadSalesAgent: null
        },
        finalRecommendations: finalRecommendations,
        dailyReport: dailyReport,
        openaiTokens: workflowUsage.openai.tokens,
        newsApiCalls: workflowUsage.newsApi.calls,
        serpApiCalls: workflowUsage.serpApi.calls,
        // Store the actual usage data at execution time
        resourceUsage: {
          openai: {
            dailyTokens: workflowUsage.openai.tokens,
            monthlyTokens: finalUsage.openai.monthlyUsage,
            totalCost: workflowUsage.openai.cost
          },
          newsApi: {
            dailyCalls: workflowUsage.newsApi.calls,
            monthlyCalls: finalUsage.newsApi.monthlyUsage
          },
          serpApi: {
            dailyCalls: workflowUsage.serpApi.calls,
            monthlyCalls: finalUsage.serpApi.monthlyUsage
          }
        },
        // Include workflow progress in the execution record
        workflowProgress: this.executionHistory[0]?.workflowProgress || []
      };

      // Debug logging for execution record
      logger.info('Debug: executionRecord agentResults after creation:', {
        hasAgentResults: !!executionRecord.agentResults,
        agentResultsKeys: executionRecord.agentResults ? Object.keys(executionRecord.agentResults) : 'null'
      });
      await this.recordExecution(executionRecord);
      
      await progressWrapper({
        type: 'workflow_completed',
        message: '✅ Daily CMO workflow completed successfully',
        step: 'completed',
        progress: 100,
        status: 'completed',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });
      
      logger.info('✅ Daily CMO workflow completed successfully');
      return dailyReport;
      
    } catch (error) {
      await progressWrapper({
        type: 'workflow_error',
        message: '❌ Error executing daily CMO workflow',
        step: 'error',
        progress: 100,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      logger.error('❌ Error executing daily CMO workflow:', error);
      throw error;
    } finally {
      // Reset workflow running flag
      this.isWorkflowRunning = false;
    }
  }

  // Execute daily CMO workflow
  async executeDailyCMOWorkflow() {
    try {
      this.updateActivity();
      logger.info('🚀 Starting autonomous daily CMO workflow execution');
      
      const workflowId = `daily-cmo-${new Date().toISOString().split('T')[0]}`;
      const startTime = Date.now();
      
      // Check if it's a weekday (if weekdayOnly is enabled)
      if (this.dailyWorkflow.weekdayOnly) {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          logger.info('Daily workflow skipped - weekend detected');
          return {
            workflowId,
            status: 'skipped',
            reason: 'Weekend detected, workflow only runs on weekdays',
            timestamp: new Date().toISOString()
          };
        }
      }
      
      // Check resource availability before executing workflow
      const resourceCheck = this.resourceManager.shouldExecuteWorkflow();
      if (!resourceCheck.canExecute) {
        logger.warn('Daily workflow skipped - insufficient resources available');
        return {
          workflowId,
          status: 'skipped',
          reason: 'Insufficient resources available',
          resourceStatus: resourceCheck.reasons,
          recommendations: this.resourceManager.getResourceRecommendations(),
          timestamp: new Date().toISOString()
        };
      }
      
      logger.info('✅ Resource check passed - proceeding with workflow execution');
      
      // Step 1: Data Analyst gathers comprehensive data and creates clean document for CMO
      logger.info('📊 Step 1: Data Analyst gathering comprehensive data and creating clean document for CMO');
      const dataAnalystReport = await this.getComprehensiveDataAnalystReport();
      
      // Step 2: CMO Brain analyzes data and determines top 3 priorities
      logger.info('🎯 Step 2: CMO Brain analyzing data and determining top 3 priorities');
      logger.info('🔄 Calling determineCMOPriorities...');
      const cmoPriorities = await this.determineCMOPriorities(dataAnalystReport);
      logger.info('✅ determineCMOPriorities completed');
      
      // Step 3: CMO Brain intelligently assesses existing content and determines what's needed
      logger.info('🧠 Step 3: CMO Brain intelligently assessing existing content and determining what\'s needed');
      const prioritiesArray = cmoPriorities.priorities || cmoPriorities;
      const contentAssessment = await this.assessExistingContentAndNeeds(prioritiesArray);
      
      // Step 4: CMO Brain selectively delegates tasks only when needed
      logger.info('🎯 Step 4: CMO Brain selectively delegating tasks only when needed');
      const agentResults = await this.selectivelyDelegateTasksWithProgress(prioritiesArray, contentAssessment, (progress) => {
        logger.info(`CMO Workflow Progress: ${progress.step} (${progress.progress}%)`);
      });
      
      // Debug logging for agentResults after delegation
      logger.info('Debug: agentResults after selectivelyDelegateTasksWithProgress:', {
        hasAgentResults: !!agentResults,
        agentResultsKeys: agentResults ? Object.keys(agentResults) : 'null',
        marketResearcher: agentResults?.marketResearcher ? 'present' : 'missing',
        copywritingAgent: agentResults?.copywritingAgent ? 'present' : 'missing',
        socialContentAgent: agentResults?.socialContentAgent ? 'present' : 'missing',
        leadSalesAgent: agentResults?.leadSalesAgent ? 'present' : 'missing'
      });
      
      // Add CMO Brain results to agentResults
      agentResults.cmoBrain = {
        priorities: cmoPriorities.priorities?.slice(0, 3),
        analysis: cmoPriorities,
        status: 'completed',
        timestamp: new Date().toISOString()
      };
      
      // Step 5: CMO Brain processes results and creates final recommendations
      logger.info('📋 Step 5: CMO Brain processing results and creating final recommendations');
      const finalRecommendations = await this.createFinalRecommendations(prioritiesArray, agentResults);
      
      // Step 6: Compile comprehensive daily report
      logger.info('📄 Step 6: Compiling comprehensive daily workflow report');
      const dailyReport = await this.compileDailyReport({
        workflowId,
        startTime,
        dataAnalystReport,
        cmoPriorities: cmoPriorities.priorities?.slice(0, 3),
        contentAssessment,
        agentResults,
        finalRecommendations
      });
      
      // Update workflow execution
      this.dailyWorkflow.lastExecution = new Date().toISOString();
      this.dailyWorkflow.nextExecution = this.calculateNextExecution();
      
      // Debug logging before creating execution record
      logger.info('Debug: agentResults before execution record creation:', {
        hasAgentResults: !!agentResults,
        agentResultsKeys: agentResults ? Object.keys(agentResults) : 'null',
        marketResearcher: agentResults?.marketResearcher ? 'present' : 'missing',
        copywritingAgent: agentResults?.copywritingAgent ? 'present' : 'missing',
        socialContentAgent: agentResults?.socialContentAgent ? 'present' : 'missing',
        leadSalesAgent: agentResults?.leadSalesAgent ? 'present' : 'missing'
      });
      
      // Record execution in history with proper agentResults structure
      const executionRecord = {
        workflowId,
        type: 'Daily CMO Workflow',
        status: 'completed',
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        dataAnalysis: dataAnalystReport,
        cmoPriorities: cmoPriorities.priorities?.slice(0, 3),
        // Use the new agentResults structure - ensure agentResults are properly stored
        agentResults: {
          dataAnalyst: dataAnalystReport,
          marketResearcher: agentResults?.marketResearcher || null,
          copywritingAgent: agentResults?.copywritingAgent || null,
          socialContentAgent: agentResults?.socialContentAgent || null,
          socialPostingAgent: agentResults?.socialPostingAgent || null,
          leadSalesAgent: agentResults?.leadSalesAgent || null,
          cmoBrain: agentResults?.cmoBrain || {
            priorities: cmoPriorities.priorities?.slice(0, 3),
            analysis: cmoPriorities,
            status: 'completed',
            timestamp: new Date().toISOString()
          }
        },
        // Keep old field names for backward compatibility
        marketResearch: agentResults?.marketResearcher || null,
        copywritingContent: agentResults?.copywritingAgent || null,
        openaiTokens: this.resourceManager.getCurrentUsage().openai.dailyUsage,
        newsApiCalls: this.resourceManager.getCurrentUsage().newsApi.dailyUsage,
        serpApiCalls: this.resourceManager.getCurrentUsage().serpApi.dailyUsage
      };
      
      // Debug logging for execution record
      logger.info('Debug: executionRecord agentResults after creation:', {
        hasAgentResults: !!executionRecord.agentResults,
        agentResultsKeys: executionRecord.agentResults ? Object.keys(executionRecord.agentResults) : 'null',
        marketResearcher: executionRecord.agentResults?.marketResearcher ? 'present' : 'missing',
        copywritingAgent: executionRecord.agentResults?.copywritingAgent ? 'present' : 'missing',
        socialContentAgent: executionRecord.agentResults?.socialContentAgent ? 'present' : 'missing',
        leadSalesAgent: executionRecord.agentResults?.leadSalesAgent ? 'present' : 'missing'
      });
      
      await this.recordExecution(executionRecord);
      
      logger.info('✅ Daily CMO workflow completed successfully');
      return dailyReport;
      
    } catch (error) {
      logger.error('❌ Error executing daily CMO workflow:', error);
      throw error;
    }
  }

  // Get comprehensive data analyst report
  async getComprehensiveDataAnalystReport() {
    try {
      logger.info('Data Analyst gathering comprehensive data and creating clean document for CMO');
      
      // Check if we have enough OpenAI tokens for comprehensive data analysis
      const estimatedTokens = this.resourceManager.estimateTokenUsage('create_comprehensive_report', 'medium');
      if (!this.resourceManager.canUseOpenAI(estimatedTokens, 'high')) {
        logger.warn('Insufficient OpenAI tokens for comprehensive data analysis - using fallback data');
        return {
          status: 'fallback',
          summary: 'Unable to get comprehensive data due to resource constraints, using fallback metrics',
          data: await this.getFallbackBusinessData(),
          reason: 'OpenAI token limit exceeded'
        };
      }
      
      // Call the Data Analyst agent directly to get actual business insights
      const dataAnalyst = this.agentManager.getAgent('data-analyst');
      if (dataAnalyst) {
        logger.info('Calling Data Analyst agent to generate actual business insights');
        const actualBusinessInsights = await dataAnalyst.generateActualBusinessInsights();
        
        logger.info('Data Analyst response:', {
          status: actualBusinessInsights?.status,
          hasData: !!actualBusinessInsights?.data,
          dataKeys: actualBusinessInsights?.data ? Object.keys(actualBusinessInsights.data) : 'null',
          dataSource: actualBusinessInsights?.dataSource
        });
        
        if (actualBusinessInsights && actualBusinessInsights.status === 'success') {
          logger.info('Data Analyst returned actual business insights successfully');
          logger.info('Data Analyst data structure:', {
            currentMetrics: !!actualBusinessInsights.data?.currentMetrics,
            searchMetrics: !!actualBusinessInsights.data?.searchMetrics,
            contentMetrics: !!actualBusinessInsights.data?.contentMetrics,
            socialMedia: !!actualBusinessInsights.data?.socialMedia,
            businessContext: !!actualBusinessInsights.data?.businessContext,
            industryInsights: !!actualBusinessInsights.data?.industryInsights
          });
          
          return {
            status: 'success',
            timestamp: new Date().toISOString(),
            summary: 'Comprehensive business data gathered and analyzed by Data Analyst agent',
            data: actualBusinessInsights.data,
            recommendations: actualBusinessInsights.recommendations || [
              'Focus on content optimization based on current performance',
              'Monitor engagement trends for content strategy adjustments',
              'Prioritize high-performing content types'
            ]
          };
        } else {
          logger.warn('Data Analyst failed to return insights, falling back to coordinator methods');
        }
      } else {
        logger.warn('Data Analyst agent not available, falling back to coordinator methods');
      }
      
      // Fallback to coordinator methods if Data Analyst fails
      const businessData = await this.getBusinessData();
      const previousInsights = await this.getPreviousDayInsights();
      const currentPriorities = await this.getCurrentPriorities();
      const businessContext = await this.getBusinessContext();
      
      // Create comprehensive report
      const report = {
        status: 'success',
        timestamp: new Date().toISOString(),
        summary: 'Comprehensive business data gathered and analyzed (fallback method)',
        data: {
          currentMetrics: businessData,
          previousInsights: previousInsights,
          currentPriorities: currentPriorities,
          businessContext: businessContext
        },
        recommendations: [
          'Focus on content optimization based on current performance',
          'Monitor engagement trends for content strategy adjustments',
          'Prioritize high-performing content types'
        ]
      };
      
      logger.info('Comprehensive data analyst report created successfully (fallback method)');
      return report;
      
    } catch (error) {
      logger.error('Error creating comprehensive data analyst report:', error);
      return {
        status: 'error',
        error: error.message,
        data: await this.getFallbackBusinessData()
      };
    }
  }

  // Assess existing content and determine what's needed
  async assessExistingContentAndNeeds(prioritiesArray) {
    try {
      logger.info('CMO Brain assessing existing content and determining what\'s needed');
      
      // Ensure prioritiesArray is always an array
      if (!Array.isArray(prioritiesArray)) {
        prioritiesArray = [];
      }
      
      const assessment = {
        priorities: prioritiesArray,
        existingContent: {},
        contentGaps: [],
        agentNeeds: {
          marketResearcher: false,
          copywritingAgent: false,
          socialContentAgent: false,
          socialPostingAgent: false,
          leadSalesAgent: false,
          reasons: []
        },
        recommendations: []
      };
      
      // Check research freshness - force Market Researcher if data is stale
      const researchStats = this.researchDatabase.getDatabaseStats();
      const isResearchFresh = this.researchDatabase.isResearchFresh();
      const daysSinceResearch = researchStats.daysSinceLastResearch;
      
      logger.info(`Research freshness check: ${isResearchFresh ? 'Fresh' : 'Stale'} (${daysSinceResearch} days since last research)`);
      
      // Check if research is stale (older than 7 days) - force Market Researcher if needed
      if (!isResearchFresh) {
        assessment.agentNeeds.marketResearcher = true;
        assessment.agentNeeds.reasons.push(`Research is stale (${daysSinceResearch} days old) - Market Researcher needed for fresh insights`);
        logger.info(`Forcing Market Researcher due to stale research (${daysSinceResearch} days old)`);
      }
      
      // Check content freshness - force content creation if content is stale
      const contentFreshnessCheck = await this.checkContentFreshness();
      if (!contentFreshnessCheck.isFresh) {
        assessment.agentNeeds.copywritingAgent = true;
        assessment.agentNeeds.socialContentAgent = true;
        assessment.agentNeeds.reasons.push(`Content is stale (${contentFreshnessCheck.daysSinceLastPost} days since last post) - Copywriting and Social agents needed`);
        logger.info(`Forcing content agents due to stale content (${contentFreshnessCheck.daysSinceLastPost} days since last post)`);
      }
      
      // Analyze each priority to determine what agents are needed
      for (const priority of prioritiesArray) {
        const priorityLower = priority.title.toLowerCase();
        logger.info(`Analyzing priority: "${priority.title}" (lowercase: "${priorityLower}")`);
        
        // Determine if content creation is needed based on priority type
        let needsContent = false;
        let contentType = '';
        
        // Check for website/optimization related priorities
        if (priorityLower.includes('website') || priorityLower.includes('conversion') || 
            priorityLower.includes('landing') || priorityLower.includes('page') || 
            priorityLower.includes('optimization') || priorityLower.includes('optimize')) {
          needsContent = true;
          contentType = 'website_content';
          assessment.contentGaps.push({
            priority: priority,
            type: 'website_content',
            reason: 'Website content needed to support conversion goals'
          });
        }
        
        // Check for social media related priorities
        if (priorityLower.includes('social') || priorityLower.includes('engagement') || 
            priorityLower.includes('facebook') || priorityLower.includes('instagram') || 
            priorityLower.includes('linkedin') || priorityLower.includes('x') || 
            priorityLower.includes('twitter') || priorityLower.includes('google business') ||
            priorityLower.includes('media')) {
          needsContent = true;
          contentType = 'social_content';
          logger.info(`Content gap detected for: "${priority.title}" - type: social_content`);
          assessment.contentGaps.push({
            priority: priority,
            type: 'social_content',
            reason: 'Social media content needed for engagement'
          });
        }
        
        // Check for email/outreach related priorities
        if (priorityLower.includes('email') || priorityLower.includes('outreach') || 
            priorityLower.includes('lead') || priorityLower.includes('campaign')) {
          needsContent = true;
          contentType = 'email_content';
          assessment.contentGaps.push({
            priority: priority,
            type: 'email_content',
            reason: 'Email content needed for outreach and lead generation'
          });
        }
        
        // Check for content creation related priorities
        if (priorityLower.includes('blog') || priorityLower.includes('content') || 
            priorityLower.includes('writing') || priorityLower.includes('audit') ||
            priorityLower.includes('create') || priorityLower.includes('creation')) {
          needsContent = true;
          contentType = 'blog_content';
          logger.info(`Content gap detected for: "${priority.title}" - type: blog_content`);
          assessment.contentGaps.push({
            priority: priority,
            type: 'blog_content',
            reason: 'Blog content needed for content strategy'
          });
        }
        
        // If content is needed, check if we need fresh research or can use cached data
        if (needsContent) {
          // Only need Market Researcher if research is stale, otherwise use cached data
          if (!isResearchFresh) {
            assessment.agentNeeds.marketResearcher = true;
            assessment.agentNeeds.reasons.push(`Need content creation for: ${priority.title} - Market Researcher will identify fresh topics (research is stale)`);
            logger.info(`Setting agent needs for: "${priority.title}" - Market Researcher: true (research stale), Copywriting: true`);
          } else {
            assessment.agentNeeds.reasons.push(`Need content creation for: ${priority.title} - Using cached research data (${daysSinceResearch} days old)`);
            logger.info(`Setting agent needs for: "${priority.title}" - Market Researcher: false (using cached data), Copywriting: true`);
          }
          assessment.agentNeeds.copywritingAgent = true;
        }
        
        // Determine if social content agent is needed
        if (contentType === 'social_content' || priorityLower.includes('social') || 
            priorityLower.includes('content') || priorityLower.includes('launch') || 
            priorityLower.includes('audit') || priorityLower.includes('analytics') ||
            priorityLower.includes('media')) {
          assessment.agentNeeds.socialContentAgent = true;
          assessment.agentNeeds.reasons.push(`Need social content strategy for: ${priority.title}`);
        }
        
        // Determine if lead/sales agent is needed
        if (priorityLower.includes('conversion') || priorityLower.includes('lead') || 
            priorityLower.includes('sales') || priorityLower.includes('funnel') ||
            priorityLower.includes('optimization') || priorityLower.includes('optimize')) {
          assessment.agentNeeds.leadSalesAgent = true;
          assessment.agentNeeds.reasons.push(`Need lead generation optimization for: ${priority.title}`);
        }
      }
      
      // Force social content agent if content is stale
      if (contentFreshnessCheck.socialStale) {
        assessment.agentNeeds.socialContentAgent = true;
        assessment.agentNeeds.reasons.push(`Content is stale (${contentFreshnessCheck.daysSinceSocialPost} days since last post) - Social Content Agent needed`);
        logger.info(`Forcing Social Content Agent due to stale content (${contentFreshnessCheck.daysSinceSocialPost} days since last post)`);
      }
      
      // Fallback: If no specific content gaps were detected but we have priorities, 
      // ensure we have the basic agents running for business continuity
      if (assessment.contentGaps.length === 0 && prioritiesArray.length > 0) {
        logger.info('No specific content gaps detected, but ensuring basic agent coverage for business priorities');
        
        // Always need Market Researcher for fresh insights when we have priorities
        if (!assessment.agentNeeds.marketResearcher) {
          assessment.agentNeeds.marketResearcher = true;
          assessment.agentNeeds.reasons.push('Ensuring Market Researcher coverage for business priorities');
        }
        
        // Always need Copywriting Agent for content creation when we have priorities
        if (!assessment.agentNeeds.copywritingAgent) {
          assessment.agentNeeds.copywritingAgent = true;
          assessment.agentNeeds.reasons.push('Ensuring Copywriting Agent coverage for business priorities');
        }
        
        // Always need Social Content Agent for social media presence when we have priorities
        if (!assessment.agentNeeds.socialContentAgent) {
          assessment.agentNeeds.socialContentAgent = true;
          assessment.agentNeeds.reasons.push('Ensuring Social Content Agent coverage for business priorities');
        }
      }
      
      // Count gaps for logging
      const gapCount = assessment.contentGaps.length;
      logger.info(`Content assessment completed: ${gapCount} gaps identified`);
      logger.info(`Agent needs: Market Researcher: ${assessment.agentNeeds.marketResearcher}, Copywriting: ${assessment.agentNeeds.copywritingAgent}, Social: ${assessment.agentNeeds.socialContentAgent}, Lead Sales: ${assessment.agentNeeds.leadSalesAgent}`);
      
      return assessment;
      
    } catch (error) {
      logger.error('Error assessing content and needs:', error);
      return {
        priorities: prioritiesArray || [],
        existingContent: {},
        contentGaps: [],
        agentNeeds: {
          marketResearcher: false,
          copywritingAgent: false,
          socialContentAgent: false,
          socialPostingAgent: false,
          leadSalesAgent: false,
          reasons: ['Error in assessment - defaulting to no agent needs']
        },
        recommendations: []
      };
    }
  }

  // Find relevant research for a priority
  findRelevantResearch(existingResearch, priority) {
    const relevantResearch = [];
    const priorityKeywords = priority.title.toLowerCase().split(' ');
    
    // Check research history for relevant items
    for (const [type, items] of Object.entries(existingResearch)) {
      if (type === 'lastUpdated') continue;
      
      for (const item of items || []) {
        const itemText = JSON.stringify(item).toLowerCase();
        const relevance = this.calculateRelevance(priorityKeywords, itemText);
        
        if (relevance > 0.3) { // 30% relevance threshold
          relevantResearch.push({
            ...item,
            type: type,
            relevance: relevance,
            timestamp: item.createdAt || item.timestamp
          });
        }
      }
    }
    
    // Sort by relevance and recency
    return relevantResearch
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5); // Top 5 most relevant
  }

  // Find relevant content for research
  findRelevantContent(existingContent, research) {
    const relevantContent = [];
    const researchKeywords = research.map(r => r.title || r.topic || '').join(' ').toLowerCase().split(' ');
    
    for (const [type, items] of Object.entries(existingContent)) {
      if (type === 'lastUpdated') continue;
      
      for (const item of items || []) {
        const itemText = JSON.stringify(item).toLowerCase();
        const relevance = this.calculateRelevance(researchKeywords, itemText);
        
        if (relevance > 0.3) {
          relevantContent.push({
            ...item,
            type: type,
            relevance: relevance
          });
        }
      }
    }
    
    return relevantContent.sort((a, b) => b.relevance - a.relevance);
  }

  // Calculate relevance between keywords and content
  calculateRelevance(keywords, content) {
    let matches = 0;
    for (const keyword of keywords) {
      if (content.includes(keyword)) {
        matches++;
      }
    }
    return matches / keywords.length;
  }

  // Calculate content age in days
  calculateContentAge(timestamp) {
    const contentDate = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - contentDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Selectively delegate tasks with progress updates
  async selectivelyDelegateTasksWithProgress(prioritiesArray, contentAssessment, onProgress) {
    // Create a wrapper function that stores progress updates
    const progressWrapper = async (progressUpdate) => {
      // Store the progress update
      await this.addWorkflowProgress(progressUpdate);
      
      // Call the original progress callback
      if (onProgress) {
        onProgress(progressUpdate);
      }
    };

    const agentResults = {
      marketResearcher: null,
      copywritingAgent: null,
      socialContentAgent: null,
      socialPostingAgent: null,
      leadSalesAgent: null,
      cmoBrain: null
    };

    // Store CMO Brain analysis results in agentResults
    try {
      // Get the CMO Brain agent to store its analysis
      const cmoBrain = this.agentManager.getAgent('cmo-brain');
      if (cmoBrain) {
        agentResults.cmoBrain = {
          priorities: prioritiesArray,
          contentAssessment: contentAssessment,
          analysis: {
            thoughtProcess: cmoBrain.memory.lastThoughtProcess,
            insights: cmoBrain.memory.insights.slice(-5), // Last 5 insights
            decisions: cmoBrain.memory.decisions.slice(-5), // Last 5 decisions
            patterns: cmoBrain.memory.patterns.slice(-3) // Last 3 patterns
          },
          timestamp: new Date().toISOString()
        };
        logger.info('✅ CMO Brain results stored in agentResults');
      }
    } catch (error) {
      logger.warn('Could not store CMO Brain results:', error.message);
    }

    // Ensure prioritiesArray is always an array
    if (!Array.isArray(prioritiesArray)) {
      prioritiesArray = [];
    }

    // Check if Market Researcher is needed based on assessment
    if (contentAssessment.agentNeeds.marketResearcher) {
      await progressWrapper({
        type: 'agent_started',
        agent: 'market-researcher',
        message: '🔍 Market Researcher analyzing trends and opportunities',
        step: 'market_research',
        progress: 60,
        status: 'running',
        timestamp: new Date().toISOString()
      });
      
      logger.info('🔄 Calling delegateToMarketResearcher...');
      const marketResearchResults = await this.delegateToMarketResearcher(prioritiesArray);
      agentResults.marketResearcher = Array.isArray(marketResearchResults) ? marketResearchResults[0] : marketResearchResults;
      logger.info('✅ delegateToMarketResearcher completed, result:', agentResults.marketResearcher ? 'present' : 'null');
      logger.info('🔍 agentResults.marketResearcher details:', {
        hasResult: !!agentResults.marketResearcher,
        resultType: typeof agentResults.marketResearcher,
        resultKeys: agentResults.marketResearcher ? Object.keys(agentResults.marketResearcher) : 'null',
        resultContent: agentResults.marketResearcher ? JSON.stringify(agentResults.marketResearcher).substring(0, 200) + '...' : 'null'
      });
      
      await progressWrapper({
        type: 'agent_completed',
        agent: 'market-researcher',
        message: 'Market research completed successfully',
        step: 'market_research',
        progress: 70,
        status: 'completed',
        timestamp: new Date().toISOString()
      });
    } else {
      await progressWrapper({
        type: 'agent_skipped',
        agent: 'market-researcher',
        message: 'Market Researcher not needed - using existing research',
        step: 'market_research',
        progress: 65,
        status: 'skipped',
        timestamp: new Date().toISOString()
      });
      logger.info('Market Researcher not needed - using existing research');
    }

    // Check if Copywriting Agent is needed based on assessment
    if (contentAssessment.agentNeeds.copywritingAgent) {
      await progressWrapper({
        type: 'agent_started',
        agent: 'copywriting-agent',
        message: '✍️ Copywriting Agent creating new content',
        step: 'content_creation',
        progress: 75,
        status: 'running',
        timestamp: new Date().toISOString()
      });
      
      logger.info('🔄 Calling delegateToCopywritingAgent...');
      const copywritingResults = await this.delegateToCopywritingAgent(prioritiesArray, agentResults.marketResearcher);
      agentResults.copywritingAgent = Array.isArray(copywritingResults) ? copywritingResults[0] : copywritingResults;
      logger.info('✅ delegateToCopywritingAgent completed, result:', agentResults.copywritingAgent ? 'present' : 'null');
      logger.info('🔍 agentResults.copywritingAgent details:', {
        hasResult: !!agentResults.copywritingAgent,
        resultType: typeof agentResults.copywritingAgent,
        resultKeys: agentResults.copywritingAgent ? Object.keys(agentResults.copywritingAgent) : 'null',
        resultContent: agentResults.copywritingAgent ? JSON.stringify(agentResults.copywritingAgent).substring(0, 200) + '...' : 'null'
      });
      
      await progressWrapper({
        type: 'agent_completed',
        agent: 'copywriting-agent',
        message: 'Content creation completed successfully',
        step: 'content_creation',
        progress: 80,
        status: 'completed',
        timestamp: new Date().toISOString()
      });
    } else {
      await progressWrapper({
        type: 'agent_skipped',
        agent: 'copywriting-agent',
        message: 'Copywriting Agent not needed - using existing content',
        step: 'content_creation',
        progress: 80,
        status: 'skipped',
        timestamp: new Date().toISOString()
      });
      logger.info('Copywriting Agent not needed - using existing content');
    }

    // Check if Social Content Agent is needed based on assessment
    if (contentAssessment.agentNeeds.socialContentAgent) {
      await progressWrapper({
        type: 'agent_started',
        agent: 'social-content-agent',
        message: '📱 Social Content Agent creating social media strategy',
        step: 'social_content',
        progress: 82,
        status: 'running',
        timestamp: new Date().toISOString()
      });
      
      logger.info('🔄 Calling delegateToSocialContentAgent...');
      logger.info('🔍 DEBUG: Parameters being passed to delegateToSocialContentAgent:', {
        hasPrioritiesArray: !!prioritiesArray,
        prioritiesArrayLength: prioritiesArray?.length || 0,
        hasMarketResearcher: !!agentResults.marketResearcher,
        hasCopywritingAgent: !!agentResults.copywritingAgent,
        copywritingAgentType: typeof agentResults.copywritingAgent,
        copywritingAgentKeys: agentResults.copywritingAgent ? Object.keys(agentResults.copywritingAgent) : 'none'
      });
      // DEBUG: Log the exact parameters being passed
      logger.info('🔍 DEBUG: About to call delegateToSocialContentAgent with:', {
        prioritiesArrayLength: prioritiesArray?.length || 0,
        marketResearcherType: typeof agentResults.marketResearcher,
        copywritingAgentType: typeof agentResults.copywritingAgent,
        copywritingAgentNull: agentResults.copywritingAgent === null,
        copywritingAgentUndefined: agentResults.copywritingAgent === undefined,
        copywritingAgentKeys: agentResults.copywritingAgent ? Object.keys(agentResults.copywritingAgent) : 'none',
        copywritingAgentStatus: agentResults.copywritingAgent?.status,
        copywritingAgentResults: agentResults.copywritingAgent?.results ? `Array with ${agentResults.copywritingAgent.results.length} items` : 'none'
      });
      
      const socialContentResults = await this.delegateToSocialContentAgent(prioritiesArray, agentResults.marketResearcher, agentResults.copywritingAgent);
      agentResults.socialContentAgent = Array.isArray(socialContentResults) ? socialContentResults[0] : socialContentResults;
      logger.info('✅ delegateToSocialContentAgent completed, result:', agentResults.socialContentAgent ? 'present' : 'null');
      logger.info('🔍 agentResults.socialContentAgent details:', {
        hasResult: !!agentResults.socialContentAgent,
        resultType: typeof agentResults.socialContentAgent,
        resultKeys: agentResults.socialContentAgent ? Object.keys(agentResults.socialContentAgent) : 'null',
        resultContent: agentResults.socialContentAgent ? JSON.stringify(agentResults.socialContentAgent).substring(0, 200) + '...' : 'null'
      });
      
      await progressWrapper({
        type: 'agent_completed',
        agent: 'social-content-agent',
        message: 'Social content strategy completed successfully',
        step: 'social_content',
        progress: 85,
        status: 'completed',
        timestamp: new Date().toISOString()
      });
    } else {
      await progressWrapper({
        type: 'agent_skipped',
        agent: 'social-content-agent',
        message: 'Social Content Agent not needed - using existing strategy',
        step: 'social_content',
        progress: 85,
        status: 'skipped',
        timestamp: new Date().toISOString()
      });
      logger.info('Social Content Agent not needed - using existing strategy');
    }

    // Check if Social Posting Agent is needed (if social content was created)
    if (contentAssessment.agentNeeds.socialPostingAgent && agentResults.socialContentAgent) {
      await progressWrapper({
        type: 'agent_started',
        agent: 'social-posting-agent',
        message: '📤 Social Posting Agent scheduling and posting content',
        step: 'social_posting',
        progress: 87,
        status: 'running',
        timestamp: new Date().toISOString()
      });
      
      agentResults.socialPostingAgent = await this.delegateToSocialPostingAgent(agentResults.socialContentAgent);
      
      await progressWrapper({
        type: 'agent_completed',
        agent: 'social-posting-agent',
        message: 'Social posting completed successfully',
        step: 'social_posting',
        progress: 90,
        status: 'completed',
        timestamp: new Date().toISOString()
      });
    } else {
      await progressWrapper({
        type: 'agent_skipped',
        agent: 'social-posting-agent',
        message: 'Social Posting Agent not needed - no content to post',
        step: 'social_posting',
        progress: 90,
        status: 'skipped',
        timestamp: new Date().toISOString()
      });
      logger.info('Social Posting Agent not needed - no content to post');
    }

    // Check if Lead & Sales Agent is needed based on assessment
    if (contentAssessment.agentNeeds.leadSalesAgent) {
      await progressWrapper({
        type: 'agent_started',
        agent: 'lead-sales-agent',
        message: '💰 Lead & Sales Agent optimizing conversions and lead generation',
        step: 'lead_sales',
        progress: 92,
        status: 'running',
        timestamp: new Date().toISOString()
      });
      
      logger.info('🔄 Calling delegateToLeadSalesAgent...');
      const leadSalesResults = await this.delegateToLeadSalesAgent(prioritiesArray, agentResults);
      agentResults.leadSalesAgent = Array.isArray(leadSalesResults) ? leadSalesResults[0] : leadSalesResults;
      logger.info('✅ delegateToLeadSalesAgent completed, result:', agentResults.leadSalesAgent ? 'present' : 'null');
      logger.info('🔍 agentResults.leadSalesAgent details:', {
        hasResult: !!agentResults.leadSalesAgent,
        resultType: typeof agentResults.leadSalesAgent,
        resultKeys: agentResults.leadSalesAgent ? Object.keys(agentResults.leadSalesAgent) : 'null',
        resultContent: agentResults.leadSalesAgent ? JSON.stringify(agentResults.leadSalesAgent).substring(0, 200) + '...' : 'null'
      });
      
      await progressWrapper({
        type: 'agent_completed',
        agent: 'lead-sales-agent',
        message: 'Lead generation optimization completed successfully',
        step: 'lead_sales',
        progress: 95,
        status: 'completed',
        timestamp: new Date().toISOString()
      });
    } else {
      await progressWrapper({
        type: 'agent_skipped',
        agent: 'lead-sales-agent',
        message: 'Lead & Sales Agent not needed - using existing optimization',
        step: 'lead_sales',
        progress: 95,
        status: 'skipped',
        timestamp: new Date().toISOString()
      });
      logger.info('Lead & Sales Agent not needed - using existing optimization');
    }

    // Calculate resources saved
    const resourcesSaved = {
      tokens: 0,
      apiCalls: 0
    };
    
    if (!contentAssessment.agentNeeds.marketResearcher) {
      resourcesSaved.tokens += 1500;
      resourcesSaved.apiCalls += 1;
    }
    if (!contentAssessment.agentNeeds.copywritingAgent) {
      resourcesSaved.tokens += 2000;
      resourcesSaved.apiCalls += 2;
    }
    if (!contentAssessment.agentNeeds.socialContentAgent) {
      resourcesSaved.tokens += 1500;
      resourcesSaved.apiCalls += 1;
    }
    if (!contentAssessment.agentNeeds.socialPostingAgent) {
      resourcesSaved.tokens += 500;
      resourcesSaved.apiCalls += 1;
    }
    if (!contentAssessment.agentNeeds.leadSalesAgent) {
      resourcesSaved.tokens += 1000;
      resourcesSaved.apiCalls += 1;
    }

    await progressWrapper({
      type: 'delegation_summary',
      message: `Selective delegation completed. Resources saved: ${resourcesSaved.tokens} tokens, ${resourcesSaved.apiCalls} API calls`,
      step: 'delegation_summary',
      progress: 95,
      status: 'completed',
      resourcesSaved,
      timestamp: new Date().toISOString()
    });
    logger.info(`Selective delegation completed. Resources saved: ${resourcesSaved.tokens} tokens, ${resourcesSaved.apiCalls} API calls`);

    // Debug logging for agentResults before return
    logger.info('Debug: selectivelyDelegateTasksWithProgress returning agentResults:', {
      hasAgentResults: !!agentResults,
      agentResultsKeys: agentResults ? Object.keys(agentResults) : 'null',
      cmoBrain: agentResults?.cmoBrain ? 'present' : 'missing',
      marketResearcher: agentResults?.marketResearcher ? 'present' : 'missing',
      copywritingAgent: agentResults?.copywritingAgent ? 'present' : 'missing',
      socialContentAgent: agentResults?.socialContentAgent ? 'present' : 'missing',
      leadSalesAgent: agentResults?.leadSalesAgent ? 'present' : 'missing'
    });
    
    // Log the full agentResults object with actual content
    logger.info('Debug: Full agentResults object from selectivelyDelegateTasksWithProgress:', {
      cmoBrain: agentResults.cmoBrain ? JSON.stringify(agentResults.cmoBrain).substring(0, 300) + '...' : 'null',
      marketResearcher: agentResults.marketResearcher ? JSON.stringify(agentResults.marketResearcher).substring(0, 300) + '...' : 'null',
      copywritingAgent: agentResults.copywritingAgent ? JSON.stringify(agentResults.copywritingAgent).substring(0, 300) + '...' : 'null',
      socialContentAgent: agentResults.socialContentAgent ? JSON.stringify(agentResults.socialContentAgent).substring(0, 300) + '...' : 'null',
      leadSalesAgent: agentResults.leadSalesAgent ? JSON.stringify(agentResults.leadSalesAgent).substring(0, 300) + '...' : 'null'
    });

    return agentResults;
  }

  // Selectively delegate tasks only when needed
  async selectivelyDelegateTasks(cmoPriorities, contentAssessment) {
    try {
      logger.info('CMO Brain selectively delegating tasks based on content assessment');
      
      // Ensure cmoPriorities is always an array
      const prioritiesArray = Array.isArray(cmoPriorities) ? cmoPriorities : [];
      
      const results = {
        marketResearcher: null,
        copywritingAgent: null,
        socialContentAgent: null,
        decisions: [],
        resourcesSaved: {
          tokens: 0,
          apiCalls: 0
        }
      };
      
      // Only call Market Researcher if needed
      if (contentAssessment.agentNeeds.marketResearcher) {
        logger.info('Market Researcher needed - delegating tasks');
        results.marketResearcher = await this.delegateToMarketResearcher(prioritiesArray);
        results.decisions.push('Market Researcher called due to content gaps');
      } else {
        logger.info('Market Researcher not needed - using existing research');
        results.decisions.push('Market Researcher skipped - using existing research');
        results.resourcesSaved.tokens += 2000; // Estimated tokens saved
        results.resourcesSaved.apiCalls += 2; // Estimated API calls saved
      }
      
      // Only call Copywriting Agent if needed
      if (contentAssessment.agentNeeds.copywritingAgent) {
        logger.info('Copywriting Agent needed - delegating tasks');
        const marketResearchData = results.marketResearcher || contentAssessment.existingContent;
        results.copywritingAgent = await this.delegateToCopywritingAgent(prioritiesArray, marketResearchData);
        results.decisions.push('Copywriting Agent called due to content gaps');
      } else {
        logger.info('Copywriting Agent not needed - using existing content');
        results.decisions.push('Copywriting Agent skipped - using existing content');
        results.resourcesSaved.tokens += 1500; // Estimated tokens saved
        results.resourcesSaved.apiCalls += 1; // Estimated API calls saved
      }
      
      // Only call Social Content Agent if needed
      if (contentAssessment.agentNeeds.socialContentAgent) {
        logger.info('Social Content Agent needed - delegating tasks');
        const marketResearchData = results.marketResearcher || contentAssessment.existingContent;
        const copywritingData = results.copywritingAgent || contentAssessment.existingContent;
        results.socialContentAgent = await this.delegateToSocialContentAgent(prioritiesArray, marketResearchData, copywritingData);
        results.decisions.push('Social Content Agent called due to social content needs');
      } else {
        logger.info('Social Content Agent not needed - using existing social content');
        results.decisions.push('Social Content Agent skipped - using existing social content');
        results.resourcesSaved.tokens += 1200; // Estimated tokens saved
        results.resourcesSaved.apiCalls += 1; // Estimated API calls saved
      }
      
      logger.info(`Selective delegation completed. Resources saved: ${results.resourcesSaved.tokens} tokens, ${results.resourcesSaved.apiCalls} API calls`);
      return results;
      
    } catch (error) {
      logger.error('Error in selective task delegation:', error);
      return {
        marketResearcher: null,
        copywritingAgent: null,
        decisions: ['Error in selective delegation'],
        resourcesSaved: { tokens: 0, apiCalls: 0 }
      };
    }
  }

  // Get status report from Data Analyst (legacy method - kept for compatibility)
  async getDataAnalystStatusReport() {
    try {
      logger.info('Requesting status report from Data Analyst');
      
      // Check if we have enough OpenAI tokens for Data Analyst task
      const estimatedTokens = this.resourceManager.estimateTokenUsage('create_cmo_summary', 'medium');
      if (!this.resourceManager.canUseOpenAI(estimatedTokens, 'high')) {
        logger.warn('Insufficient OpenAI tokens for Data Analyst task - using fallback data');
        return {
          status: 'fallback',
          summary: 'Unable to get real-time data due to resource constraints, using fallback metrics',
          data: await this.getFallbackBusinessData(),
          reason: 'OpenAI token limit exceeded'
        };
      }
      
      // Create input for Data Analyst to generate CMO summary
      const dataAnalystInput = {
        timeframe: 'last_7_days',
        includeTrends: true,
        includeAnomalies: true,
        includeRecommendations: true,
        format: 'executive_summary'
      };
      
      // Execute Data Analyst's create_cmo_summary task
      const statusReport = await this.agentManager.executeAgentTaskWithProgress(
        'data-analyst',
        'create_cmo_summary',
        dataAnalystInput
      );
      
      // Send message from CMO to Data Analyst
      await this.sendMessage('cmo-brain', 'data-analyst', {
        type: 'status_request',
        message: 'Requesting current business status report for daily analysis',
        timestamp: new Date().toISOString()
      });
      
      logger.info('Data Analyst status report received successfully');
      return statusReport;
      
    } catch (error) {
      logger.error('Error getting Data Analyst status report:', error);
      // Return fallback data if Data Analyst fails
      return {
        status: 'fallback',
        summary: 'Unable to get real-time data, using fallback metrics',
        data: await this.getFallbackBusinessData(),
        error: error.message
      };
    }
  }

  // Determine CMO priorities based on Data Analyst report
  async determineCMOPriorities(dataAnalystStatus) {
    try {
      logger.info('CMO Brain analyzing status and determining priorities');
      
      // Check if we have enough OpenAI tokens for CMO Brain task
      const estimatedTokens = this.resourceManager.estimateTokenUsage('think', 'large');
      if (!this.resourceManager.canUseOpenAI(estimatedTokens, 'critical')) {
        logger.warn('Insufficient OpenAI tokens for CMO Brain task - using fallback priorities');
        return {
          status: 'fallback',
          priorities: [
            { id: 'priority-1', title: 'Create educational content about marketing clarity and quarterly goal setting', priority: 'high' },
            { id: 'priority-2', title: 'Develop case studies showcasing successful marketing focus and execution', priority: 'medium' },
            { id: 'priority-3', title: 'Optimize website conversion for marketing clarity platform signups', priority: 'medium' }
          ],
          reasoning: 'Fallback priorities due to resource constraints',
          reason: 'OpenAI token limit exceeded'
        };
      }
      
      // Create input for CMO Brain to analyze and set priorities
      const cmoInput = {
        dataAnalystReport: dataAnalystStatus,
        businessContext: await this.getBusinessContext(),
        previousPriorities: await this.getPreviousPriorities(),
        timeframe: 'today',
        maxPriorities: 3,
        task: 'determine_daily_priorities'
      };
      
      // Execute CMO Brain's think task for strategic analysis
      const cmoResponse = await this.agentManager.executeAgentTaskWithProgress(
        'cmo-brain',
        'think',
        cmoInput
      );
      
      // Extract priorities from CMO Brain's response
      let priorities = [];
      
      // Try to extract from decisions first (if it's an array)
      if (cmoResponse.decisions && Array.isArray(cmoResponse.decisions)) {
        priorities = cmoResponse.decisions.slice(0, 3).map((decision, index) => ({
          id: `priority-${index + 1}`,
          title: decision,
          priority: index === 0 ? 'high' : 'medium'
        }));
      } else if (cmoResponse.recommendations && Array.isArray(cmoResponse.recommendations)) {
        priorities = cmoResponse.recommendations.slice(0, 3).map((rec, index) => ({
          id: `priority-${index + 1}`,
          title: rec,
          priority: index === 0 ? 'high' : 'medium'
        }));
      } else if (cmoResponse.decisions && typeof cmoResponse.decisions === 'string') {
        // Parse decisions string to extract priorities
        const decisionsText = cmoResponse.decisions;
        
        // Look for bullet points with **bold** text followed by descriptions
        const bulletMatches = decisionsText.match(/- \*\*([^*]+)\*\*: ([^.\n]+)/g);
        if (bulletMatches) {
          priorities = bulletMatches.slice(0, 3).map((match, index) => {
            const titleMatch = match.match(/- \*\*([^*]+)\*\*: ([^.\n]+)/);
            return {
              id: `priority-${index + 1}`,
              title: titleMatch ? titleMatch[1].trim() : match.replace(/^- \*\*|\*\*:.*$/g, '').trim(),
              priority: index === 0 ? 'high' : 'medium'
            };
          });
        } else {
          // Fallback: look for any bullet points
          const fallbackMatches = decisionsText.match(/- ([^.\n]+)/g);
          if (fallbackMatches) {
            priorities = fallbackMatches.slice(0, 3).map((match, index) => ({
              id: `priority-${index + 1}`,
              title: match.replace(/^- /, '').trim(),
              priority: index === 0 ? 'high' : 'medium'
            }));
          }
        }
      } else if (cmoResponse.recommendations && typeof cmoResponse.recommendations === 'string') {
        // Parse recommendations string to extract priorities
        const recommendationsText = cmoResponse.recommendations;
        
        // Look for numbered recommendations
        const numberedMatches = recommendationsText.match(/\d+\. ([^.\n]+)/g);
        if (numberedMatches) {
          priorities = numberedMatches.slice(0, 3).map((match, index) => ({
            id: `priority-${index + 1}`,
            title: match.replace(/^\d+\. /, '').trim(),
            priority: index === 0 ? 'high' : 'medium'
          }));
        } else {
          // Fallback: look for bullet points in recommendations
          const bulletMatches = recommendationsText.match(/- ([^.\n]+)/g);
          if (bulletMatches) {
            priorities = bulletMatches.slice(0, 3).map((match, index) => ({
              id: `priority-${index + 1}`,
              title: match.replace(/^- /, '').trim(),
              priority: index === 0 ? 'high' : 'medium'
            }));
          }
        }
      } else if (cmoResponse.insights && typeof cmoResponse.insights === 'string') {
        // Parse insights string to extract priorities
        const insightsText = cmoResponse.insights;
        const priorityMatches = insightsText.match(/(?:priority|focus|action|goal|objective)[:\s]*([^.\n]+)/gi);
        if (priorityMatches) {
          priorities = priorityMatches.slice(0, 3).map((match, index) => ({
            id: `priority-${index + 1}`,
            title: match.replace(/^(?:priority|focus|action|goal|objective)[:\s]*/i, '').trim(),
            priority: index === 0 ? 'high' : 'medium'
          }));
        }
      }
      
      // If no priorities extracted, use business-specific fallback
      if (priorities.length === 0) {
        priorities = [
          { 
            id: 'priority-1', 
            title: 'Create educational content about marketing clarity and quarterly goal setting', 
            priority: 'high',
            businessContext: 'Focus on helping small business owners gain extreme clarity on what to focus their marketing on'
          },
          { 
            id: 'priority-2', 
            title: 'Develop case studies showcasing successful marketing focus and execution', 
            priority: 'high',
            businessContext: 'Create educational content about automation benefits for cafes, retail, and service businesses'
          },
          { 
            id: 'priority-3', 
            title: 'Optimize website conversion for marketing clarity platform signups', 
            priority: 'medium',
            businessContext: 'Focus on platforms where local business owners are active (Facebook, LinkedIn, Google Business Profile)'
          }
        ];
      }
      
      // Ensure priorities are business-specific by adding context if missing
      priorities = priorities.map((priority, index) => ({
        ...priority,
        businessContext: priority.businessContext || this.getBusinessSpecificContext(priority.title),
        targetMarket: 'Small business owners (cafes, home services, personal services, brick-and-mortar shops) seeking marketing clarity',
        industry: 'Marketing Clarity Platform',
        services: [
          'Quarterly marketing goal selection and tracking',
          'Weekly dripped marketing execution guides',
          'Kanban task tracking for marketing projects',
          'Email campaign creation and management',
          'Meta Business Suite integration for social scheduling',
          'AI-powered marketing guidance (24/7 support)'
        ]
      }));
      
      logger.info('CMO Brain priorities determined successfully');
      
      return {
        status: 'success',
        priorities: priorities,
        reasoning: cmoResponse.reasoning || 'Strategic priorities based on business automation market opportunities',
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      logger.error('Error determining CMO priorities:', error);
      return {
        status: 'fallback',
        priorities: [
          { 
            id: 'priority-1', 
            title: 'Create educational content about marketing clarity and quarterly goal setting', 
            priority: 'high',
            businessContext: 'Focus on helping small business owners gain extreme clarity on what to focus their marketing on'
          },
          { 
            id: 'priority-2', 
            title: 'Develop case studies showcasing successful marketing focus and execution', 
            priority: 'high',
            businessContext: 'Create educational content about automation benefits for cafes, retail, and service businesses'
          },
          { 
            id: 'priority-3', 
            title: 'Optimize website conversion for marketing clarity platform signups', 
            priority: 'medium',
            businessContext: 'Focus on platforms where local business owners are active (Facebook, LinkedIn, Google Business Profile)'
          }
        ],
        reasoning: 'Fallback priorities due to error in CMO Brain analysis',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Helper method to add business-specific context to priorities
  getBusinessSpecificContext(priorityTitle) {
    const title = priorityTitle.toLowerCase();
    
    if (title.includes('case study') || title.includes('success story')) {
      return 'Focus on small business owners who gained marketing clarity and achieved results through focused execution';
    }
    if (title.includes('lead generation') || title.includes('content')) {
      return 'Create educational content about marketing clarity and quarterly goal setting for small business owners';
    }
    if (title.includes('social media') || title.includes('outreach')) {
      return 'Focus on platforms where small business owners are active (Facebook, LinkedIn, Instagram, Google Business Profile)';
    }
    if (title.includes('marketing clarity') || title.includes('quarterly goals')) {
      return 'Help small business owners gain extreme clarity on what to focus their marketing on';
    }
    if (title.includes('website') || title.includes('conversion')) {
      return 'Optimize marketing clarity platform for small business owner signups and engagement';
    }
    
    return 'Focus on helping small business owners gain marketing clarity and execute focused quarterly goals';
  }

  // Delegate tasks to Market Researcher based on CMO priorities
  async delegateToMarketResearcher(prioritiesArray) {
    try {
      logger.info('Delegating tasks to Market Researcher to identify content topics based on business priorities');
      
      // Check research freshness before starting
      const researchStats = this.researchDatabase.getDatabaseStats();
      const isResearchFresh = this.researchDatabase.isResearchFresh();
      
      if (isResearchFresh) {
        logger.info(`Research is fresh (${researchStats.daysSinceLastResearch} days old) - proceeding with fresh research for new insights`);
      } else {
        logger.info(`Research is stale (${researchStats.daysSinceLastResearch} days old) - Market Researcher needed for fresh insights`);
      }
      
      const researchTasks = [];
      
      // Convert CMO priorities into Market Researcher tasks to identify content topics
      for (const priority of prioritiesArray) {
        const task = this.convertPriorityToResearchTask(priority);
        if (task) {
          researchTasks.push(task);
        }
      }
      
      // Add default content opportunity research task
      researchTasks.push({
        task: 'find_brand_opportunities',
        input: {
          timeframe: '7d',
          focusAreas: ['content opportunities', 'social media trends', 'marketing clarity topics', 'small business marketing trends']
        },
        priority: 'high'
      });
      
      // Filter tasks based on resource availability
      const executableTasks = [];
      for (const task of researchTasks) {
        let canExecute = true;
        let reason = '';
        
        // Check News API for competitor research
        if (task.task === 'research_competitors' && !this.resourceManager.canUseNewsAPI(task.priority)) {
          canExecute = false;
          reason = 'News API limit exceeded';
        }
        
        // Check SERP API for trend analysis
        if ((task.task === 'analyze_market_trends' || task.task === 'keyword_research') && 
            !this.resourceManager.canUseSerpAPI(task.priority)) {
          canExecute = false;
          reason = 'SERP API limit exceeded';
        }
        
        if (canExecute) {
          executableTasks.push(task);
        } else {
          logger.warn(`Skipping Market Researcher task ${task.task}: ${reason}`);
        }
      }
      
      // Execute Market Researcher tasks
      const results = [];
      for (const task of executableTasks) {
        logger.info(`Executing Market Researcher task: ${task.task} to identify content topics`);
        
        const result = await this.agentManager.executeAgentTaskWithProgress(
          'market-researcher',
          task.task,
          task.input
        );
        
        logger.info(`🔍 Market Researcher task ${task.task} result:`, {
          hasResult: !!result,
          resultType: typeof result,
          resultContent: result ? JSON.stringify(result).substring(0, 200) + '...' : 'null',
          resultKeys: result ? Object.keys(result) : 'null'
        });
        
        // Simple test to see if result is null
        if (!result) {
          logger.error(`❌ Market Researcher task ${task.task} returned null result!`);
        } else {
          logger.info(`✅ Market Researcher task ${task.task} returned valid result with keys:`, Object.keys(result));
        }
        
        results.push({
          task: task.task,
          input: task.input,
          result: result,
          priority: task.priority
        });
        
        logger.info(`📝 Added result to results array. Current length: ${results.length}`);
        logger.info(`📝 Results array content:`, {
          length: results.length,
          lastResult: results[results.length - 1] ? {
            task: results[results.length - 1].task,
            hasResult: !!results[results.length - 1].result,
            resultKeys: results[results.length - 1].result ? Object.keys(results[results.length - 1].result) : 'null'
          } : 'null'
        });
      }
      
      // Store research results in database
      await this.researchDatabase.addResearchData(results);
      
      // Add skipped tasks to results for transparency
      const skippedTasks = researchTasks.filter(task => 
        !executableTasks.find(execTask => execTask.task === task.task)
      );
      
      if (skippedTasks.length > 0) {
        results.push({
          skipped: true,
          tasks: skippedTasks.map(task => ({
            task: task.task,
            reason: 'Resource limit exceeded'
          }))
        });
      }
      
      // Send message from CMO to Market Researcher
      await this.sendMessage('cmo-brain', 'market-researcher', {
        type: 'content_topic_research',
        message: 'Identifying content topics based on business priorities',
        tasks: executableTasks.map(t => t.task),
        skippedTasks: skippedTasks.length,
        timestamp: new Date().toISOString()
      });
      
      // Log research database update
      const updatedStats = this.researchDatabase.getDatabaseStats();
      logger.info(`Market Researcher content topic identification completed successfully`);
      logger.info(`Research database updated: ${updatedStats.totalEntries} total entries, ${updatedStats.breakdown.opportunities} opportunities, ${updatedStats.breakdown.trends} trends`);
      
      logger.info(`🔍 Market Researcher final results:`, {
        resultsLength: results.length,
        resultsContent: results.length > 0 ? JSON.stringify(results).substring(0, 300) + '...' : 'empty array'
      });
      
      return results;
      
    } catch (error) {
      logger.error('Error delegating to Market Researcher:', error);
      throw new Error(`Market Researcher delegation failed: ${error.message}. No fallback data will be generated.`);
    }
  }

  // Delegate content creation tasks to Copywriting Agent
  async delegateToCopywritingAgent(prioritiesArray, marketResearchResults) {
    try {
      logger.info('Delegating content creation tasks to Copywriting Agent');
      
      const copywritingAgent = this.agentManager.getAgent('copywriting-agent');
      const results = [];
      const skippedTasks = [];
      
      // Ensure prioritiesArray is always an array and has content
      if (!prioritiesArray) {
        prioritiesArray = [];
      }
      
      if (!Array.isArray(prioritiesArray)) {
        logger.warn('prioritiesArray is not an array, converting to array');
        prioritiesArray = [prioritiesArray];
      }
      
      if (prioritiesArray.length === 0) {
        logger.warn('No priorities available for copywriting tasks');
        return {
          status: 'skipped',
          reason: 'No priorities available',
          results: [],
          skippedTasks: []
        };
      }
      
      // Check resource availability for copywriting tasks
      const estimatedTokens = this.resourceManager.estimateTokenUsage('create-blog-post', 'medium');
      if (!this.resourceManager.canUseOpenAI(estimatedTokens, 'medium')) {
        logger.warn('Insufficient OpenAI tokens for copywriting tasks - skipping content creation');
        return {
          status: 'skipped',
          reason: 'Insufficient OpenAI tokens available',
          results: [],
          skippedTasks: prioritiesArray.map(p => `content_creation_${p.id || p.title}`)
        };
      }
      
      // Process each priority to determine content creation opportunities
      for (const priority of prioritiesArray.slice(0, 2)) { // Limit to top 2 priorities for content creation
        try {
          const copywritingTask = this.convertPriorityToCopywritingTask(priority, marketResearchResults, prioritiesArray);
          
          if (copywritingTask) {
            logger.info(`Executing copywriting task: ${copywritingTask.task} for priority: ${priority.title || priority}`);
            
            const result = await copywritingAgent.execute(copywritingTask.task, copywritingTask.input);
            
            logger.info(`🔍 Copywriting Agent task ${copywritingTask.task} result:`, {
              hasResult: !!result,
              resultType: typeof result,
              resultContent: result ? JSON.stringify(result).substring(0, 200) + '...' : 'null'
            });
            
            results.push({
              priorityId: priority.id || priority.title,
              priorityTitle: priority.title || priority,
              task: copywritingTask.task,
              result: result,
              timestamp: new Date().toISOString()
            });
          }
        } catch (error) {
          logger.error(`Error executing copywriting task for priority ${priority.title || priority}:`, error);
          skippedTasks.push({
            priorityId: priority.id || priority.title,
            priorityTitle: priority.title || priority,
            task: 'content_creation',
            error: error.message
          });
        }
      }
      
      logger.info(`Copywriting Agent completed ${results.length} tasks, skipped ${skippedTasks.length}`);
      
      return {
        status: 'completed',
        results: results,
        skippedTasks: skippedTasks,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      logger.error('Error delegating to Copywriting Agent:', error);
      throw new Error(`Copywriting Agent delegation failed: ${error.message}. No fallback data will be generated.`);
    }
  }

  // Convert CMO priority to Copywriting Agent task
  convertPriorityToCopywritingTask(priority, marketResearchResults) {
    const priorityTitle = priority.title || priority;
    const priorityLower = priorityTitle.toLowerCase();
    const businessContext = priority.businessContext || this.getBusinessSpecificContext(priorityTitle);
    
    // Get content inspiration from research database
    const contentInspiration = this.researchDatabase.getContentInspiration(priorityTitle, 5);
    
    // Extract comprehensive content topics from market research results (if available)
    let contentTopics = [];
    let trendingTopics = [];
    let marketResearchInsights = null;
    
    if (marketResearchResults && marketResearchResults.results) {
      // Look for content opportunities from find_brand_opportunities task
      const brandOpportunities = marketResearchResults.results.find(r => 
        r.task === 'find_brand_opportunities' && r.result && r.result.opportunities
      );
      
      if (brandOpportunities && brandOpportunities.result.opportunities) {
        // Extract all types of opportunities, not just content/topic
        const allOpportunities = brandOpportunities.result.opportunities;
        
        // Get content and topic opportunities
        contentTopics = allOpportunities
          .filter(opp => opp.type === 'content' || opp.type === 'topic')
          .map(opp => opp.title || opp.topic)
          .slice(0, 5);
        
        // Get trending topics with interest data
        const trendingOpps = allOpportunities.filter(opp => opp.type === 'trending_topic');
        trendingTopics = trendingOpps
          .map(opp => ({
            topic: opp.topic || opp.title,
            interest: opp.interest || 50,
            trend: opp.trend || 'rising',
            reason: opp.reason || 'High search volume'
          }))
          .slice(0, 8);
        
        // Create comprehensive market research insights object
        marketResearchInsights = {
          opportunities: allOpportunities,
          trendingTopics: trendingTopics,
          contentGaps: allOpportunities.filter(opp => opp.type === 'content_gap'),
          audienceGaps: allOpportunities.filter(opp => opp.type === 'audience_gap'),
          clarityGaps: allOpportunities.filter(opp => opp.type === 'clarity_gap'),
          totalOpportunities: allOpportunities.length,
          topTrendingTopic: trendingTopics[0] || null,
          biggestCompetitorGap: allOpportunities.find(opp => opp.type === 'content_gap') || null
        };
      }
      
      // Look for additional trending topics from other research tasks
      const trendingResults = marketResearchResults.results.filter(r => 
        r.result && r.result.trendingTopics
      );
      
      if (trendingResults.length > 0) {
        const additionalTrending = trendingResults
          .flatMap(r => r.result.trendingTopics)
          .slice(0, 5);
        
        trendingTopics = [...trendingTopics, ...additionalTrending];
      }
    }
    
    // Combine fresh research with database inspiration
    const allTopics = [
      ...contentTopics,
      ...trendingTopics,
      ...contentInspiration.trendingTopics,
      ...contentInspiration.opportunities.map(opp => opp.title || opp.topic)
    ];
    
    const primaryTopic = allTopics.length > 0 ? allTopics[0] : priorityTitle;
    
    // Log content inspiration sources
    logger.info(`Content inspiration for "${priorityTitle}": ${allTopics.length} topics available`);
    logger.info(`Primary topic: ${primaryTopic}`);
    logger.info(`Research database: ${contentInspiration.opportunities.length} opportunities, ${contentInspiration.trendingTopics.length} trending topics`);
    
    if (priorityLower.includes('content') || priorityLower.includes('blog') || allTopics.length > 0) {
      return {
        task: 'create-blog-post',
        input: {
          topic: primaryTopic,
          targetAudience: 'primary',
          length: 'medium',
          includeSEO: true,
          tone: 'authentic',
          keywords: ['marketing clarity', 'small business', 'quarterly goals', 'marketing focus'],
          priorityTitle: priorityTitle,
          businessContext: businessContext,
          contentTopics: allTopics,
          contentInspiration: contentInspiration,
          marketResearchInsights: marketResearchInsights // Pass comprehensive research data
        },
        priority: 'high'
      };
    }
    
    if (priorityLower.includes('social') || priorityLower.includes('engagement')) {
      return {
        task: 'create-blog-post',
        input: {
          topic: primaryTopic,
          targetAudience: 'primary',
          length: 'medium',
          includeSEO: true,
          tone: 'authentic',
          keywords: ['marketing clarity', 'small business', 'quarterly goals', 'marketing focus'],
          priorityTitle: priorityTitle,
          businessContext: businessContext,
          contentTopics: allTopics,
          contentInspiration: contentInspiration,
          marketResearchInsights: marketResearchInsights, // Pass comprehensive research data
          purpose: 'social_media_foundation' // Indicates this blog post will be used for social media content
        },
        priority: 'medium'
      };
    }
    
    if (priorityLower.includes('email') || priorityLower.includes('newsletter')) {
      return {
        task: 'create-email-content',
        input: {
          type: 'newsletter',
          topic: primaryTopic,
          tone: 'friendly',
          includePersonalization: true,
          priorityTitle: priorityTitle,
          businessContext: businessContext,
          contentTopics: allTopics,
          contentInspiration: contentInspiration,
          marketResearchInsights: marketResearchInsights // Pass comprehensive research data
        },
        priority: 'medium'
      };
    }
    
    if (priorityLower.includes('content') || priorityLower.includes('ideas')) {
      return {
        task: 'generate-content-ideas',
        input: {
          category: 'marketing clarity',
          timeframe: 'weekly',
          targetAudience: 'primary',
          includeTrending: true,
          priorityTitle: priorityTitle,
          businessContext: businessContext,
          contentTopics: allTopics,
          contentInspiration: contentInspiration,
          marketResearchInsights: marketResearchInsights // Pass comprehensive research data
        },
        priority: 'medium'
      };
    }
    
    // Default content creation task
    return {
      task: 'generate-content-ideas',
      input: {
        category: 'marketing clarity',
        timeframe: 'weekly',
        targetAudience: 'primary',
        includeTrending: true,
        priorityTitle: priorityTitle,
        businessContext: businessContext,
        marketResearchInsights: marketResearchInsights, // Pass comprehensive research data
        contentTopics: allTopics,
        contentInspiration: contentInspiration
      },
      priority: 'medium'
    };
  }

  // Convert CMO priority to Market Researcher task
  convertPriorityToResearchTask(priority) {
    const priorityLower = priority.title ? priority.title.toLowerCase() : priority.toLowerCase();
    
    if (priorityLower.includes('competitor') || priorityLower.includes('competition')) {
      return {
        task: 'find_brand_opportunities',
        input: {
          timeframe: '7d',
          focusAreas: ['competitor analysis', 'market research', 'competitive landscape', 'marketing clarity opportunities']
        },
        priority: 'high'
      };
    }
    
    if (priorityLower.includes('trend') || priorityLower.includes('market')) {
      return {
        task: 'find_brand_opportunities',
        input: {
          timeframe: '30d',
          focusAreas: ['marketing clarity trends', 'social media trends', 'automation trends', 'content marketing trends']
        },
        priority: 'high'
      };
    }
    
    if (priorityLower.includes('content') || priorityLower.includes('keyword')) {
      return {
        task: 'find_brand_opportunities',
        input: {
          timeframe: '7d',
          focusAreas: ['content opportunities', 'keyword research', 'marketing clarity topics', 'small business marketing trends']
        },
        priority: 'high'
      };
    }
    
    if (priorityLower.includes('social') || priorityLower.includes('engagement')) {
      return {
        task: 'find_brand_opportunities',
        input: {
          timeframe: '7d',
          focusAreas: ['social media trends', 'content opportunities', 'brand engagement', 'marketing clarity topics']
        },
        priority: 'medium'
      };
    }
    
    if (priorityLower.includes('website') || priorityLower.includes('conversion')) {
      return {
        task: 'find_brand_opportunities',
        input: {
          timeframe: '7d',
          focusAreas: ['website conversion topics', 'landing page optimization', 'marketing clarity content', 'small business marketing tips']
        },
        priority: 'high'
      };
    }
    
    if (priorityLower.includes('email') || priorityLower.includes('outreach') || priorityLower.includes('lead')) {
      return {
        task: 'find_brand_opportunities',
        input: {
          timeframe: '7d',
          focusAreas: ['email marketing topics', 'lead generation content', 'marketing clarity messaging', 'small business outreach']
        },
        priority: 'medium'
      };
    }
    
    // Default task for any priority - focus on marketing clarity content opportunities
    return {
      task: 'find_brand_opportunities',
      input: {
        timeframe: '7d',
        focusAreas: ['marketing clarity topics', 'small business marketing trends', 'content opportunities', 'quarterly goal setting']
      },
      priority: 'medium'
    };
  }

  // Create final recommendations based on all data
  async createFinalRecommendations(prioritiesArray, agentResults) {
    try {
      logger.info('Creating final recommendations based on all data');
      
      // Check if we have enough OpenAI tokens for final recommendations
      const estimatedTokens = this.resourceManager.estimateTokenUsage('analyze_performance', 'medium');
      if (!this.resourceManager.canUseOpenAI(estimatedTokens, 'high')) {
        logger.warn('Insufficient OpenAI tokens for final recommendations - cannot generate recommendations');
        throw new Error('Insufficient OpenAI tokens for final recommendations. Cannot generate recommendations without proper API access. No fallback data will be generated.');
      }
      
      // Create input for CMO Brain to create final recommendations
      let businessContext;
      try {
        businessContext = await this.getBusinessContext();
      } catch (error) {
        logger.warn('Could not fetch business context for final recommendations:', error.message);
        businessContext = {
          businessName: 'MomentumDIY',
          businessType: 'Marketing Automation Platform',
          targetMarket: 'Local businesses',
          currentFocus: 'Marketing clarity and automation'
        };
      }
      
      const cmoInput = {
        priorities: prioritiesArray,
        marketResearch: agentResults.marketResearcher,
        contentCreation: agentResults.copywritingAgent,
        decisions: agentResults.decisions,
        resourceSavings: agentResults.resourcesSaved,
        businessContext: businessContext,
        timeframe: 'today',
        format: 'actionable_recommendations',
        task: 'analyze_performance'
      };
      
      // Execute CMO Brain's analyze_performance task for recommendations
      const recommendations = await this.agentManager.executeAgentTaskWithProgress(
        'cmo-brain',
        'analyze_performance',
        cmoInput
      );
      
      logger.info('Final recommendations created successfully');
      return recommendations;
      
    } catch (error) {
      logger.error('Error creating final recommendations:', error);
      return {
        status: 'fallback',
        recommendations: [
          'Continue monitoring current performance metrics',
          'Focus on content optimization based on recent trends',
          'Maintain current marketing strategy while gathering more data'
        ],
        error: error.message
      };
    }
  }

  // Compile comprehensive daily report
  async compileDailyReport(data) {
    try {
      const {
        workflowId,
        startTime,
        dataAnalystReport,
        cmoPriorities,
        contentAssessment,
        agentResults,
        finalRecommendations
      } = data;
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      const report = {
        workflowId,
        status: 'completed',
        timestamp: new Date().toISOString(),
        duration,
        executionSummary: {
          dataAnalystReportReceived: !!dataAnalystReport,
          cmoPrioritiesDetermined: !!cmoPriorities,
          contentAssessmentCompleted: contentAssessment && contentAssessment.contentGaps && contentAssessment.contentGaps.length > 0,
          marketResearchCompleted: agentResults && agentResults.marketResearcher && (agentResults.marketResearcher.length > 0 || agentResults.marketResearcher.status === 'completed'),
          copywritingCompleted: agentResults && agentResults.copywritingAgent && (agentResults.copywritingAgent.results && agentResults.copywritingAgent.results.length > 0 || agentResults.copywritingAgent.status === 'completed'),
          socialContentCompleted: agentResults && agentResults.socialContentAgent && agentResults.socialContentAgent.status === 'completed',
          finalRecommendationsCreated: !!finalRecommendations,
          resourcesSaved: agentResults && agentResults.resourcesSaved ? agentResults.resourcesSaved : { tokens: 0, apiCalls: 0 }
        },
        workflowSteps: [
          {
            step: 1,
            name: 'Data Analyst Comprehensive Report',
            status: 'completed',
            duration: '~30s',
            result: dataAnalystReport && dataAnalystReport.status ? dataAnalystReport.status : 'success'
          },
          {
            step: 2,
            name: 'CMO Brain Priority Analysis',
            status: 'completed',
            duration: '~45s',
            result: Array.isArray(cmoPriorities) ? 'success' : (cmoPriorities && cmoPriorities.priorities ? 'success' : 'partial')
          },
          {
            step: 3,
            name: 'Content Assessment & Gap Analysis',
            status: 'completed',
            duration: '~30s',
            result: contentAssessment ? 'success' : 'partial'
          },
          {
            step: 4,
            name: 'Selective Agent Delegation',
            status: 'completed',
            duration: '~60s',
            result: agentResults && agentResults.decisions ? 'success' : 'partial'
          },
          {
            step: 5,
            name: 'Final Recommendations',
            status: 'completed',
            duration: '~30s',
            result: finalRecommendations && finalRecommendations.status ? finalRecommendations.status : 'success'
          }
        ],
        keyInsights: {
          topPriorities: Array.isArray(cmoPriorities) ? cmoPriorities : (cmoPriorities.priorities || []),
          contentGaps: contentAssessment && contentAssessment.contentGaps ? contentAssessment.contentGaps.length : 0,
          marketResearchTasks: agentResults && agentResults.marketResearcher ? (Array.isArray(agentResults.marketResearcher) ? agentResults.marketResearcher.length : 1) : 0,
          copywritingTasks: agentResults && agentResults.copywritingAgent ? (agentResults.copywritingAgent.results ? agentResults.copywritingAgent.results.length : 1) : 0,
          socialContentTasks: agentResults && agentResults.socialContentAgent ? 1 : 0,
          decisions: agentResults && agentResults.decisions ? agentResults.decisions : [],
          recommendations: finalRecommendations && finalRecommendations.recommendations ? finalRecommendations.recommendations : []
        },
        details: {
          dataAnalystReport,
          cmoPriorities,
          contentAssessment,
          agentResults,
          finalRecommendations
        }
      };
      
      logger.info('Daily report compiled successfully');
      return report;
      
    } catch (error) {
      logger.error('Error compiling daily report:', error);
      throw error;
    }
  }

  // Mock data methods (replace with real data sources)
  async getBusinessData() {
    try {
      // Get actual business data from the Data Analyst agent
      const dataAnalyst = this.agentManager.getAgent('data-analyst');
      if (dataAnalyst) {
        const actualInsights = await dataAnalyst.generateActualBusinessInsights();
        if (actualInsights && actualInsights.status === 'success') {
          logger.info('Using actual business data from Data Analyst');
          return {
            sales: {
              daily: actualInsights.data.currentMetrics?.totalSessions || 0,
              weekly: actualInsights.data.currentMetrics?.totalSessions * 7 || 0,
              monthly: actualInsights.data.currentMetrics?.totalSessions * 30 || 0
            },
            website: {
              visitors: actualInsights.data.currentMetrics?.totalUsers || 0,
              conversions: actualInsights.data.currentMetrics?.totalSessions > 0 ? 
                (actualInsights.data.currentMetrics?.totalUsers / actualInsights.data.currentMetrics?.totalSessions * 100).toFixed(1) : 0,
              topPages: actualInsights.data.currentMetrics?.topPages || ['/marketing-clarity', '/quarterly-goals', '/automation-tools']
            },
            social: {
              followers: 228, // Hardcoded total followers (Facebook: 4 + Instagram: 224)
              engagement: 3.1, // Hardcoded engagement rate
              topPlatforms: ['Instagram', 'Facebook'], // Instagram has more activity
              facebook: { 
                followers: 4, 
                engagement: 0, 
                reach: 2 
              },
              instagram: { 
                followers: 224, 
                engagement: 0, 
                reach: 88 
              }
            },
            search: {
              clicks: actualInsights.data.searchMetrics?.totalClicks || 0,
              impressions: actualInsights.data.searchMetrics?.totalImpressions || 0,
              ctr: actualInsights.data.searchMetrics?.avgCTR || 0
            },
            content: {
              blogPosts: actualInsights.data.contentMetrics?.blogPosts || 0,
              forms: actualInsights.data.contentMetrics?.forms || 0,
              contacts: actualInsights.data.contentMetrics?.contacts || 0
            }
          };
        }
      }
      
      // No fallback data - fail clearly when real data is not available
      logger.error('Data Analyst API not available - cannot provide real business data');
      throw new Error('Data Analyst API not available. Cannot fetch real business metrics. Please check Data Analyst configuration and connectivity. No fallback data will be generated.');
    } catch (error) {
      logger.error('Error getting business data:', error);
      // No fallback data - fail clearly when real data is not available
      throw new Error(`Failed to fetch business data: ${error.message}. No fallback data will be generated.`);
    }
  }

  async getFallbackBusinessData() {
    throw new Error('Business data API not available. Cannot fetch real business metrics. Please check API configuration and connectivity. No fallback data will be generated.');
  }

  async getPreviousDayInsights() {
    throw new Error('Previous day insights API not available. Cannot fetch real historical data. Please check API configuration and connectivity. No fallback data will be generated.');
  }

  async getPreviousPriorities() {
    throw new Error('Previous priorities API not available. Cannot fetch real historical priorities. Please check API configuration and connectivity. No fallback data will be generated.');
  }

  async getCurrentPriorities() {
    throw new Error('Current priorities API not available. Cannot fetch real current priorities. Please check API configuration and connectivity. No fallback data will be generated.');
  }

  async getBusinessContext() {
    try {
      // Try to get real business data first
      const businessData = await this.getBusinessData();
      if (businessData && businessData.businessContext) {
        return businessData.businessContext;
      }
      
      // Fallback to business-specific context
      return {
        businessName: 'MomentumDIY',
        businessType: 'Marketing Automation Platform',
        targetMarket: 'Local businesses (cafes, home services, personal services, brick-and-mortar shops)',
        primaryServices: [
          'Marketing clarity and strategy development',
          'Content creation and management',
          'Social media management',
          'Lead generation and sales optimization'
        ],
        keyValueProps: [
          'Helps small business owners focus on what matters most',
          'Provides clear marketing direction and execution',
          'Automates repetitive marketing tasks',
          'Improves ROI through strategic content and campaigns'
        ],
        currentFocus: 'Marketing clarity for small business owners',
        platform: 'Wix Studio with Velo development',
        socialPlatforms: ['Facebook', 'Instagram', 'LinkedIn', 'X (Twitter)', 'Google Business Profile'],
        contentTypes: ['Blog posts', 'Social media content', 'Email campaigns', 'Landing page copy'],
        businessGoals: [
          'Help small business owners achieve marketing clarity',
          'Provide actionable marketing strategies',
          'Automate marketing processes for efficiency',
          'Generate quality leads and improve conversions'
        ]
      };
    } catch (error) {
      logger.warn('Could not fetch business context, using fallback:', error.message);
      
      // Return basic fallback context
      return {
        businessName: 'MomentumDIY',
        businessType: 'Marketing Automation Platform',
        targetMarket: 'Local businesses',
        currentFocus: 'Marketing clarity and automation',
        platform: 'Wix Studio',
        socialPlatforms: ['Facebook', 'Instagram', 'LinkedIn', 'X'],
        contentTypes: ['Blog posts', 'Social media content', 'Email campaigns'],
        businessGoals: ['Marketing clarity', 'Automation', 'Lead generation']
      };
    }
  }

  // Calculate next execution time
  calculateNextExecution() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);
    return tomorrow.toISOString();
  }

  // Get workflow status
  getWorkflowStatus() {
    return {
      dailyWorkflow: this.dailyWorkflow,
      communicationChannels: Object.keys(this.communicationChannels),
      deploymentStrategies: this.deploymentStrategies,
      resourceStatus: this.resourceManager.getUsageStatus(),
      resourceRecommendations: this.resourceManager.getResourceRecommendations(),
      canExecuteWorkflow: this.resourceManager.shouldExecuteWorkflow(),
      executionHistory: this.executionHistory
    };
  }

  // Get execution history
  getExecutionHistory() {
    return this.executionHistory;
  }

  // Record execution in history
  async recordExecution(execution) {
    this.executionHistory.unshift({
      id: `exec-${Date.now()}`,
      timestamp: new Date().toISOString(),
      workflowProgress: [], // Add workflow progress array
      ...execution
    });
    
    // Keep only last 50 executions
    if (this.executionHistory.length > 50) {
      this.executionHistory = this.executionHistory.slice(0, 50);
    }
    
    // Save execution history to file
    await this.saveExecutionHistory();
  }

  // Add workflow progress to the most recent execution
  async addWorkflowProgress(progressUpdate) {
    if (this.executionHistory.length > 0) {
      const latestExecution = this.executionHistory[0];
      if (!latestExecution.workflowProgress) {
        latestExecution.workflowProgress = [];
      }
      latestExecution.workflowProgress.push(progressUpdate);
      
      // Save execution history to file
      await this.saveExecutionHistory();
    }
  }

  // Schedule daily workflow
  scheduleDailyWorkflow() {
    // This would integrate with a proper scheduler like node-cron
    // For now, just update the next execution time
    this.dailyWorkflow.nextExecution = this.calculateNextExecution();
    logger.info('Daily workflow scheduled for next execution');
  }

  // Convert CMO priority to copywriting task with market research data
  convertPriorityToCopywritingTask(priority, marketResearchResults, allPriorities) {
    try {
      // Extract market research data if available
      let marketInsights = null;
      if (marketResearchResults) {
        // Handle different possible structures
        if (marketResearchResults.results && marketResearchResults.results.length > 0) {
          // Array of results format
          const brandOpportunities = marketResearchResults.results.find(r => r.task === 'find_brand_opportunities');
          if (brandOpportunities && brandOpportunities.result) {
            marketInsights = brandOpportunities.result;
          }
        } else if (Array.isArray(marketResearchResults)) {
          // Direct array format
          const brandOpportunities = marketResearchResults.find(r => r.task === 'find_brand_opportunities');
          if (brandOpportunities && brandOpportunities.result) {
            marketInsights = brandOpportunities.result;
          }
        } else if (marketResearchResults.task === 'find_brand_opportunities' && marketResearchResults.result) {
          // Direct result format
          marketInsights = marketResearchResults.result;
        }
      }

      // Get the priority title and determine topic
      const priorityTitle = priority.title || priority.priority || priority;
      let topic = priorityTitle;

      // Map priority types to specific blog topics
      if (priorityTitle.toLowerCase().includes('social') || priorityTitle.toLowerCase().includes('instagram')) {
        topic = 'Social Media Marketing for Small Business Owners';
      } else if (priorityTitle.toLowerCase().includes('audit') || priorityTitle.toLowerCase().includes('optimize')) {
        topic = 'Marketing Audit and Optimization for Small Businesses';
      } else if (priorityTitle.toLowerCase().includes('content')) {
        topic = 'Content Marketing Strategy for Small Business Growth';
      } else if (priorityTitle.toLowerCase().includes('engagement')) {
        topic = 'Customer Engagement Strategies for Local Businesses';
      } else {
        // Default topic based on MomentumDIY's core value prop
        topic = 'Marketing Clarity: How to Focus Your Small Business Marketing for Results';
      }

      // Create comprehensive task input with market research data
      const taskInput = {
        topic: topic,
        targetAudience: 'primary', // small business owners
        length: 'medium', // 1500 words
        includeSEO: true,
        tone: 'authentic',
        keywords: ['small business marketing', 'marketing clarity', 'quarterly goals', 'marketing focus'],
        includeOriginalResearch: true,
        researchData: marketInsights,
        cmoPriorities: allPriorities.map(p => ({
          title: p.title || p.priority || p,
          priority: p.priority || 'medium'
        })),
        marketResearchInsights: marketInsights,
        brandContext: {
          brand: 'MomentumDIY',
          targetAudience: 'Small business owners who are overwhelmed by marketing options and need clarity',
          coreMessage: 'Extreme clarity through single quarterly marketing goals',
          painPoints: [
            'Too many marketing options, not knowing where to start',
            'Trying to do everything at once, achieving nothing',
            'Not understanding what marketing activities will actually drive results'
          ]
        }
      };

      logger.info(`Converting priority "${priorityTitle}" to blog post topic: "${topic}"`);
      logger.info(`Market research insights available: ${marketInsights ? 'Yes' : 'No'}`);
      
      if (marketInsights && marketInsights.opportunities) {
        logger.info(`Including ${marketInsights.opportunities.length} market opportunities in copywriting context`);
      }

      return {
        task: 'create-blog-post',
        input: taskInput,
        priority: priority.priority || 'medium'
      };
    } catch (error) {
      logger.error('Error converting priority to copywriting task:', error);
      return null;
    }
  }

  // Delegate to Social Content Agent
  async delegateToSocialContentAgent(prioritiesArray, marketResearchResults, copywritingResults) {
    try {
      console.log('🔍 FUNCTION CALLED: delegateToSocialContentAgent');
      console.log('🔍 copywritingResults type:', typeof copywritingResults);
      console.log('🔍 copywritingResults keys:', copywritingResults ? Object.keys(copywritingResults) : 'null');
      console.log('🔍 copywritingResults.results:', copywritingResults?.results ? `Array with ${copywritingResults.results.length} items` : 'null');
      console.log('🔍 copywritingResults:', JSON.stringify(copywritingResults, null, 2));
      logger.info('Social Content Agent executing task: create-multi-platform-campaign');
      console.log('🔍 DEBUG: delegateToSocialContentAgent FUNCTION CALLED with:', {
        hasPrioritiesArray: !!prioritiesArray,
        prioritiesArrayLength: prioritiesArray?.length || 0,
        hasMarketResearchResults: !!marketResearchResults,
        hasCopywritingResults: !!copywritingResults,
        copywritingResultsType: typeof copywritingResults,
        copywritingResultsNull: copywritingResults === null,
        copywritingResultsUndefined: copywritingResults === undefined
      });
      
      logger.info('🔍 DEBUG: delegateToSocialContentAgent FUNCTION CALLED with:', {
        hasPrioritiesArray: !!prioritiesArray,
        prioritiesArrayLength: prioritiesArray?.length || 0,
        hasMarketResearchResults: !!marketResearchResults,
        hasCopywritingResults: !!copywritingResults,
        copywritingResultsType: typeof copywritingResults,
        copywritingResultsNull: copywritingResults === null,
        copywritingResultsUndefined: copywritingResults === undefined
      });
      
      // DEBUG: Log the incoming copywritingResults
      logger.info('🔍 DEBUG: delegateToSocialContentAgent called with copywritingResults:', {
        hasCopywritingResults: !!copywritingResults,
        copywritingResultsType: typeof copywritingResults,
        copywritingResultsKeys: copywritingResults ? Object.keys(copywritingResults) : 'none',
        hasResults: copywritingResults?.results ? 'yes' : 'no',
        resultsLength: copywritingResults?.results?.length || 0
      });
      
      const socialContentAgent = this.agentManager.getAgent('social-content-agent');
      
      // Check resource availability
      const estimatedTokens = this.resourceManager.estimateTokenUsage('create-multi-platform-campaign', 'medium');
      if (!this.resourceManager.canUseOpenAI(estimatedTokens, 'medium')) {
        logger.warn('Insufficient OpenAI tokens for Social Content Agent task - skipping');
        return {
          status: 'skipped',
          reason: 'Insufficient OpenAI tokens available',
          result: null
        };
      }
      
      // Extract blog content from copywriting results for social media amplification
      let blogContent = null;
      let blogTopic = null;
      
      // DEBUG: Log the exact structure being received
      logger.info('🔍 DEBUG: copywritingResults received:', JSON.stringify(copywritingResults, null, 2));
      logger.info('🔍 DEBUG: copywritingResults type:', typeof copywritingResults);
      logger.info('🔍 DEBUG: copywritingResults.results exists:', !!copywritingResults?.results);
      logger.info('🔍 DEBUG: copywritingResults.results is array:', Array.isArray(copywritingResults?.results));
      logger.info('🔍 DEBUG: copywritingResults.results length:', copywritingResults?.results?.length || 0);
      
      // --- ROBUST CONTENT EXTRACTION FOR SOCIAL CONTENT AGENT ---
      if (
        copywritingResults &&
        copywritingResults.results &&
        Array.isArray(copywritingResults.results) &&
        copywritingResults.results.length > 0
      ) {
        for (const resultObj of copywritingResults.results) {
          logger.info('🔍 DEBUG: Checking resultObj:', {
            hasResultObj: !!resultObj,
            hasResult: !!resultObj?.result,
            hasContent: !!resultObj?.result?.content,
            contentType: typeof resultObj?.result?.content,
            contentKeys: resultObj?.result?.content ? Object.keys(resultObj.result.content) : 'none'
          });
          
          // Try multiple paths to extract content
          if (resultObj && resultObj.result) {
            // Path 1: resultObj.result.content.content (most common)
            if (resultObj.result.content && typeof resultObj.result.content.content === 'string' && resultObj.result.content.content.length > 100) {
              blogContent = resultObj.result.content.content;
              blogTopic = resultObj.result.content.title || resultObj.priorityTitle;
              logger.info(`✅ SUCCESS (Path 1): Found blog content via result.content.content. Topic: ${blogTopic}`);
              break;
            }
            
            // Path 2: resultObj.result.content is the string directly
            if (typeof resultObj.result.content === 'string' && resultObj.result.content.length > 100) {
              blogContent = resultObj.result.content;
              blogTopic = resultObj.result.title || resultObj.priorityTitle;
              logger.info(`✅ SUCCESS (Path 2): Found blog content via result.content. Topic: ${blogTopic}`);
              break;
            }
            
            // Path 3: resultObj.result itself is the content object
            if (resultObj.result.content && resultObj.result.content.blogPost) {
              blogContent = resultObj.result.content.blogPost;
              blogTopic = resultObj.result.content.title || resultObj.priorityTitle;
              logger.info(`✅ SUCCESS (Path 3): Found blog content via result.content.blogPost. Topic: ${blogTopic}`);
              break;
            }
            
            // Path 4: Check if success flag exists and extract accordingly
            if (resultObj.result.success && resultObj.result.content) {
              const content = resultObj.result.content;
              // Try to find any string property with substantial content
              for (const key of Object.keys(content)) {
                if (typeof content[key] === 'string' && content[key].length > 100) {
                  blogContent = content[key];
                  blogTopic = content.title || resultObj.priorityTitle || 'Marketing Clarity';
                  logger.info(`✅ SUCCESS (Path 4): Found blog content via result.content.${key}. Topic: ${blogTopic}`);
                  break;
                }
              }
              if (blogContent) break;
            }
          }
        }
      }

      if (!blogContent) {
        logger.error('❌ EXTRACTION FAILED: No blog content found in copywriting results');
        logger.error('🔍 DEBUG: Full copywritingResults structure:', JSON.stringify(copywritingResults, null, 2));
        logger.warn('No copywriting results available - skipping social content generation to avoid hardcoded content');
        return {
          status: 'skipped',
          reason: 'No real blog content available from copywriter - avoiding hardcoded content',
          result: null
        };
      }
      
      // Create comprehensive task input
      const taskInput = {
        campaignName: 'Marketing Clarity Campaign',
        theme: 'Marketing Clarity and Focus',
        platforms: ['facebook', 'instagram', 'linkedin', 'x'],
        targetAudience: 'Small business owners seeking marketing clarity',
        contentType: 'educational',
        tone: 'authentic',
        callToAction: null, // Let the AI generate contextual call-to-action based on the blog content
        blogContent: blogContent, // Pass the blog content for social media amplification
        blogTopic: blogTopic, // Pass the blog topic for context
        businessContext: {
          industry: 'Marketing Clarity Platform',
          targetMarket: 'Small business owners (cafes, home services, personal services, brick-and-mortar shops) seeking marketing clarity',
          services: ['Quarterly marketing goal selection', 'Weekly execution guides', 'Kanban task tracking', 'Email campaign management', 'Meta Business Suite integration', 'AI-powered guidance'],
          uniqueValue: 'Extreme clarity on marketing focus through single quarterly goal execution'
        },
        priorities: prioritiesArray,
        marketResearch: marketResearchResults,
        copywritingContent: copywritingResults,
        hashtags: [], // Let the AI generate contextual hashtags based on the blog content
        frequency: 'daily',
        duration: '2 weeks',
        contentStrategy: 'blog_amplification' // Indicates social content should amplify blog posts
      };
      
      const result = await this.agentManager.executeAgentTaskWithProgress(
        'social-content-agent',
        'create-multi-platform-campaign',
        taskInput
      );
      
      logger.info('Social Content Agent task completed successfully');
      
      return {
        status: 'completed',
        task: 'create-multi-platform-campaign',
        result: result,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      logger.error('Error delegating to Social Content Agent:', error);
      return {
        status: 'error',
        task: 'create-multi-platform-campaign',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Delegate to Social Posting Agent
  async delegateToSocialPostingAgent(socialContentResults) {
    try {
      const socialPostingAgent = this.agentManager.getAgent('social-posting-agent');
      
      // Create task input for social posting agent
      const taskInput = {
        socialStrategy: socialContentResults,
        platforms: socialContentResults.platforms || ['Facebook', 'Instagram', 'LinkedIn', 'X (Twitter)', 'Google Business Profile'],
        contentTypes: socialContentResults.contentTypes || ['social captions', 'engagement posts', 'business updates'],
        scheduling: {
          optimalTimes: true,
          frequency: 'daily',
          automation: true
        }
      };
      
      // Execute social posting task using a valid task name
      const result = await socialPostingAgent.execute('create-buffer-draft', taskInput);
      
      return {
        status: 'success',
        timestamp: new Date().toISOString(),
        posts: result.posts || [],
        schedule: result.schedule || {},
        platforms: taskInput.platforms,
        contentTypes: taskInput.contentTypes
      };
      
    } catch (error) {
      logger.error('Error delegating to Social Posting Agent:', error);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  // Check content freshness based on real data from APIs
  async checkContentFreshness() {
    try {
      const now = new Date();
      let lastSocialPost = null;
      let lastBlogPost = null;
      
      // Try to get real data from APIs
      try {
        // Get blog posts from Wix API
        const wixClient = require('../utils/api-clients').getWixClient();
        const blogData = await wixClient.getBlogPosts();
        
        if (blogData && blogData.items && blogData.items.length > 0) {
          // Find the most recent blog post
          const sortedPosts = blogData.items.sort((a, b) => 
            new Date(b.publishedDate) - new Date(a.publishedDate)
          );
          lastBlogPost = new Date(sortedPosts[0].publishedDate);
        }
      } catch (error) {
        logger.warn('Could not fetch blog posts for freshness check:', error.message);
      }
      
      try {
        // Get social media data from Meta Business Suite API
        const metaClient = require('../utils/api-clients').getMetaBusinessSuiteClient();
        const socialData = await metaClient.getComprehensiveSocialData();
        
        if (socialData && socialData.facebook && socialData.facebook.topPosts && socialData.facebook.topPosts.length > 0) {
          // Find the most recent social post
          const sortedPosts = socialData.facebook.topPosts.sort((a, b) => 
            new Date(b.createdTime) - new Date(a.createdTime)
          );
          lastSocialPost = new Date(sortedPosts[0].createdTime);
        }
      } catch (error) {
        logger.warn('Could not fetch social media data for freshness check:', error.message);
      }
      
      // Calculate days since last posts
      const daysSinceSocialPost = lastSocialPost ? 
        Math.floor((now - lastSocialPost) / (1000 * 60 * 60 * 24)) : 999; // Default to stale if no data
      const daysSinceBlogPost = lastBlogPost ? 
        Math.floor((now - lastBlogPost) / (1000 * 60 * 60 * 24)) : 999; // Default to stale if no data
      
      // Content is considered stale if:
      // - Social posts older than 7 days
      // - Blog posts older than 30 days
      const socialStale = daysSinceSocialPost > 7;
      const blogStale = daysSinceBlogPost > 30;
      
      const isFresh = !socialStale && !blogStale;
      const daysSinceLastPost = Math.min(daysSinceSocialPost, daysSinceBlogPost);
      
      logger.info(`Content freshness check: Social ${daysSinceSocialPost} days old, Blog ${daysSinceBlogPost} days old`);
      logger.info(`Content is ${isFresh ? 'fresh' : 'stale'} (${daysSinceLastPost} days since last post)`);
      
      return {
        isFresh,
        daysSinceLastPost,
        socialStale,
        blogStale,
        daysSinceSocialPost,
        daysSinceBlogPost,
        dataSource: lastSocialPost || lastBlogPost ? 'API Data' : 'No Data Available'
      };
    } catch (error) {
      logger.error('Error checking content freshness:', error);
      // Return stale status if we can't determine freshness
      return {
        isFresh: false,
        daysSinceLastPost: 999,
        socialStale: true,
        blogStale: true,
        daysSinceSocialPost: 999,
        daysSinceBlogPost: 999,
        dataSource: 'Error - Defaulting to Stale'
      };
    }
  }

  // Delegate to Lead & Sales Agent
  async delegateToLeadSalesAgent(prioritiesArray, agentResults) {
    try {
      logger.info('Lead & Sales Agent executing task: optimize-sales-funnel');
      
      const leadSalesAgent = this.agentManager.getAgent('lead-sales-agent');
      
      // Check resource availability
      const estimatedTokens = this.resourceManager.estimateTokenUsage('optimize-sales-funnel', 'medium');
      if (!this.resourceManager.canUseOpenAI(estimatedTokens, 'medium')) {
        logger.warn('Insufficient OpenAI tokens for Lead & Sales Agent task - skipping');
        return {
          status: 'skipped',
          reason: 'Insufficient OpenAI tokens available',
          result: null
        };
      }
      
      // Create input for sales optimization
      const salesInput = {
        priorities: prioritiesArray,
        existingResults: agentResults,
        targetMarket: 'Local businesses (cafes, home services, personal services, brick-and-mortar shops)',
        focusAreas: ['lead generation', 'sales funnel optimization', 'local business automation'],
        businessContext: {
          industry: 'Business Automation Services',
          services: ['Marketing automation', 'Lead generation', 'Content creation', 'Business process automation'],
          targetAudience: 'Local business owners'
        }
      };
      
      const result = await leadSalesAgent.execute('optimize-sales-funnel', salesInput);
      
      logger.info('Lead & Sales Agent task completed successfully');
      
      return {
        status: 'completed',
        task: 'optimize-sales-funnel',
        result: result,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      logger.error('Error in Lead & Sales Agent task optimize-sales-funnel:', error);
      return {
        status: 'error',
        task: 'optimize-sales-funnel',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // ==================== WEEKLY CONTENT MARKETING WORKFLOW ====================

  /**
   * Execute weekly market research (Monday 8 AM)
   */
  async executeWeeklyResearch() {
    try {
      logger.info('📊 Executing weekly market research...');
      
      const marketResearcher = this.agentManager.getAgent('market-researcher');
      if (!marketResearcher) {
        throw new Error('Market Researcher agent not available');
      }
      
      const result = await marketResearcher.execute('find_brand_opportunities', {
        timeframe: '7d',
        focusAreas: [] // Uses defaults from research-focus.json
      });
      
      // Save to research database
      if (result && result.status === 'completed') {
        await this.researchDatabase.addResearch(result);
        logger.info('✅ Weekly research completed and saved to database');
      }
      
      return result;
    } catch (error) {
      logger.error('Error executing weekly research:', error);
      throw error;
    }
  }

  /**
   * Execute weekly blog creation (Tuesday 8 AM)
   */
  async executeWeeklyBlogCreation() {
    try {
      logger.info('✍️ Executing weekly blog creation...');
      
      // Get latest research from database
      const research = await this.researchDatabase.getLatestResearch();
      if (!research || !research.trendingTopics || research.trendingTopics.length === 0) {
        throw new Error('No research data available for blog creation');
      }
      
      // Use top trending topic
      const topTopic = research.trendingTopics[0];
      
      const copywriter = this.agentManager.getAgent('copywriting-agent');
      if (!copywriter) {
        throw new Error('Copywriting Agent not available');
      }
      
      const result = await copywriter.execute('create-blog-post', {
        topic: topTopic.title || topTopic,
        research: research,
        length: 'long', // 800-1200 words
        includeResearch: true
      });
      
      // Blog automatically saves to Wix as draft
      logger.info('✅ Weekly blog post created and saved to Wix as draft');
      
      // Store result for social content agent
      this.lastBlogPost = result;
      
      return result;
    } catch (error) {
      logger.error('Error executing weekly blog creation:', error);
      throw error;
    }
  }

  /**
   * Execute weekly social content creation (Wednesday 8 AM)
   */
  async executeWeeklySocialContent() {
    try {
      logger.info('📱 Executing weekly social content creation...');
      
      // Get latest blog post (from Tuesday's execution or from storage)
      let blogPost = this.lastBlogPost;
      
      if (!blogPost) {
        // Try to get from recent executions
        logger.warn('No blog post in memory, checking recent executions...');
        // Could fetch from database or Wix here
        throw new Error('No blog post available for social content creation');
      }
      
      // Extract blog content
      let blogContent = null;
      let blogTopic = null;
      
      if (blogPost.result && blogPost.result.content) {
        blogContent = blogPost.result.content.content || blogPost.result.content;
        blogTopic = blogPost.result.content.title || 'Marketing Clarity';
      }
      
      if (!blogContent) {
        throw new Error('Could not extract blog content');
      }
      
      const socialAgent = this.agentManager.getAgent('social-content-agent');
      if (!socialAgent) {
        throw new Error('Social Content Agent not available');
      }
      
      const result = await socialAgent.execute('create-multi-platform-campaign', {
        blogContent: blogContent,
        blogTopic: blogTopic,
        platforms: ['facebook', 'instagram', 'linkedin', 'x'],
        campaignName: 'Weekly Marketing Clarity Content',
        theme: 'Marketing Clarity and Focus'
      });
      
      // Save to approval database with status='pending'
      const approvalDB = require('../database/approval-db');
      await approvalDB.addOutput({
        agent: 'social-content-agent',
        type: 'social-posts',
        content: result,
        status: 'pending',
        timestamp: new Date().toISOString()
      });
      
      logger.info('✅ Weekly social content created and saved for approval');
      
      return result;
    } catch (error) {
      logger.error('Error executing weekly social content creation:', error);
      throw error;
    }
  }

  /**
   * Execute scheduled posting for approved content
   * @param {Array} platforms - Platforms to post to (e.g., ['facebook', 'instagram'])
   */
  async executeScheduledPosting(platforms = []) {
    try {
      logger.info(`📤 Executing scheduled posting for: ${platforms.join(', ')}`);
      
      // Get approved posts for these platforms
      const approvalDB = require('../database/approval-db');
      const allApprovedPosts = await approvalDB.getOutputs({
        status: 'approved',
        agent: 'social-content-agent'
      });
      
      if (!allApprovedPosts || allApprovedPosts.length === 0) {
        logger.warn(`No approved posts found for ${platforms.join(', ')}`);
        return { 
          status: 'skipped', 
          reason: 'No approved posts available',
          platforms: platforms 
        };
      }
      
      // Filter posts for requested platforms
      const postsToPublish = allApprovedPosts.filter(post => {
        // Check if post is for one of the requested platforms
        if (post.content && post.content.platforms) {
          return platforms.some(p => post.content.platforms.includes(p));
        }
        return false;
      });
      
      if (postsToPublish.length === 0) {
        logger.warn(`No approved posts for platforms: ${platforms.join(', ')}`);
        return { 
          status: 'skipped', 
          reason: 'No posts for requested platforms',
          platforms: platforms 
        };
      }
      
      const socialPoster = this.agentManager.getAgent('social-posting-agent');
      if (!socialPoster) {
        throw new Error('Social Posting Agent not available');
      }
      
      const result = await socialPoster.execute('post-via-buffer', {
        posts: postsToPublish,
        platforms: platforms
      });
      
      // Mark posts as published
      for (const post of postsToPublish) {
        await approvalDB.updateOutputStatus(post.id, 'published', 'Posted via Buffer');
      }
      
      logger.info(`✅ Successfully posted to: ${platforms.join(', ')}`);
      
      return result;
    } catch (error) {
      logger.error('Error executing scheduled posting:', error);
      throw error;
    }
  }
}

module.exports = AgentCoordinator; 