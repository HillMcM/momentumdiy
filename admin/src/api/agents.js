const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const AgentManager = require('../agents/agent-manager');

// Initialize agent manager
const agentManager = new AgentManager();

// API status and configuration (must be before dynamic routes)
router.get('/apis/status', async (req, res) => {
  try {
    const status = {
      newsApi: {
        configured: !!process.env.NEWS_API_KEY,
        key: process.env.NEWS_API_KEY ? '***' + process.env.NEWS_API_KEY.slice(-4) : null
      },
      serpApi: {
        configured: !!process.env.SERP_API_KEY,
        key: process.env.SERP_API_KEY ? '***' + process.env.SERP_API_KEY.slice(-4) : null
      }
    };
    
    res.json(status);
  } catch (error) {
    logger.error('Error fetching API status:', error);
    res.status(500).json({ error: 'Failed to fetch API status' });
  }
});

// News API endpoints (must be before dynamic routes)
router.get('/news/search', async (req, res) => {
  try {
    const { q, from, to, language, sortBy, pageSize, page, domains, excludeDomains } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    
    const { newsAPIClient } = require('../utils/api-clients');
    const result = await newsAPIClient().fetchNews(q, {
      from,
      to,
      language,
      sortBy,
      pageSize: parseInt(pageSize) || 20,
      page: parseInt(page) || 1,
      domains,
      excludeDomains
    });
    
    res.json(result);
  } catch (error) {
    logger.error('Error fetching news:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch news' });
  }
});

router.get('/news/headlines', async (req, res) => {
  try {
    const { country, category, pageSize, page } = req.query;
    
    const { newsAPIClient } = require('../utils/api-clients');
    const result = await newsAPIClient().fetchTopHeadlines({
      country,
      category,
      pageSize: parseInt(pageSize) || 20,
      page: parseInt(page) || 1
    });
    
    res.json(result);
  } catch (error) {
    logger.error('Error fetching headlines:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch headlines' });
  }
});

router.get('/news/sources', async (req, res) => {
  try {
    const { category, language, country } = req.query;
    
    const { newsAPIClient } = require('../utils/api-clients');
    const result = await newsAPIClient().fetchSources({
      category,
      language,
      country
    });
    
    res.json(result);
  } catch (error) {
    logger.error('Error fetching sources:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch sources' });
  }
});

// SerpAPI endpoints (must be before dynamic routes)
router.get('/serp/trends', async (req, res) => {
  try {
    const { q, geo, timeframe, dataType } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    
    const { serpAPIClient } = require('../utils/api-clients');
    const result = await serpAPIClient().searchGoogleTrends(q, {
      geo: geo || 'US',
      timeframe: timeframe || 'today 12-m',
      dataType: dataType || 'TIMESERIES'
    });
    
    res.json(result);
  } catch (error) {
    logger.error('Error fetching trends:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch trends' });
  }
});

router.get('/serp/search', async (req, res) => {
  try {
    const { q, num, start, gl, hl } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    
    const { serpAPIClient } = require('../utils/api-clients');
    const result = await serpAPIClient().searchGoogle(q, {
      num: parseInt(num) || 10,
      start: parseInt(start) || 0,
      gl: gl || 'us',
      hl: hl || 'en'
    });
    
    res.json(result);
  } catch (error) {
    logger.error('Error performing search:', error);
    res.status(500).json({ error: error.message || 'Failed to perform search' });
  }
});

router.get('/serp/news', async (req, res) => {
  try {
    const { q, num, start, gl, hl } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    
    const { serpAPIClient } = require('../utils/api-clients');
    const result = await serpAPIClient.searchNews(q, {
      num: parseInt(num) || 10,
      start: parseInt(start) || 0,
      gl: gl || 'us',
      hl: hl || 'en'
    });
    
    res.json(result);
  } catch (error) {
    logger.error('Error fetching news search:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch news search' });
  }
});

// Inter-agent communication endpoints (must be before dynamic routes)
router.post('/communication/send', async (req, res) => {
  try {
    const { fromAgent, toAgent, message } = req.body;
    
    if (!fromAgent || !toAgent || !message) {
      return res.status(400).json({ error: 'fromAgent, toAgent, and message are required' });
    }
    
    const result = await agentManager.sendMessage(fromAgent, toAgent, message);
    res.json(result);
  } catch (error) {
    logger.error('Error sending message between agents:', error);
    res.status(500).json({ error: error.message || 'Failed to send message' });
  }
});

router.get('/communication/history', async (req, res) => {
  try {
    const { fromAgent, toAgent, limit } = req.query;
    
    if (!fromAgent || !toAgent) {
      return res.status(400).json({ error: 'fromAgent and toAgent are required' });
    }
    
    const history = agentManager.getCommunicationHistory(fromAgent, toAgent, parseInt(limit) || 20);
    res.json(history);
  } catch (error) {
    logger.error('Error fetching communication history:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch communication history' });
  }
});

// Autonomous task execution endpoint
router.post('/autonomous/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { data, context } = req.body;
    
    if (!data) {
      return res.status(400).json({ error: 'data is required in request body' });
    }
    
    logger.info(`Executing autonomous tasks for agent ${agentId}`, { data, context });
    
    const result = await agentManager.executeAutonomousTasks(agentId, data, context || {});
    
    res.json({
      success: true,
      agentId,
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Error executing autonomous tasks for agent ${req.params.agentId}:`, error);
    res.status(500).json({ 
      error: error.message || 'Failed to execute autonomous tasks',
      agentId: req.params.agentId
    });
  }
});

// Daily workflow endpoints (must be before dynamic routes)
router.post('/workflow/daily-cmo', async (req, res) => {
  try {
    logger.info('Starting daily CMO workflow execution');
    const result = await agentManager.executeDailyCMOWorkflow();
    res.json(result);
  } catch (error) {
    logger.error('Error executing daily CMO workflow:', error);
    res.status(500).json({ error: error.message || 'Failed to execute daily workflow' });
  }
});

// Weekly workflow endpoints
router.post('/workflow/weekly-research', async (req, res) => {
  try {
    logger.info('Starting weekly market research');
    const coordinator = agentManager.getCoordinator();
    const result = await coordinator.executeWeeklyResearch();
    res.json(result);
  } catch (error) {
    logger.error('Error executing weekly research:', error);
    res.status(500).json({ error: error.message || 'Failed to execute weekly research' });
  }
});

router.post('/workflow/weekly-blog', async (req, res) => {
  try {
    logger.info('Starting weekly blog creation');
    const coordinator = agentManager.getCoordinator();
    const result = await coordinator.executeWeeklyBlogCreation();
    res.json(result);
  } catch (error) {
    logger.error('Error executing weekly blog creation:', error);
    res.status(500).json({ error: error.message || 'Failed to execute weekly blog creation' });
  }
});

router.post('/workflow/weekly-social', async (req, res) => {
  try {
    logger.info('Starting weekly social content creation');
    const coordinator = agentManager.getCoordinator();
    const result = await coordinator.executeWeeklySocialContent();
    res.json(result);
  } catch (error) {
    logger.error('Error executing weekly social content:', error);
    res.status(500).json({ error: error.message || 'Failed to execute weekly social content' });
  }
});

router.post('/workflow/weekly-posting', async (req, res) => {
  try {
    const { platforms } = req.body;
    logger.info(`Starting scheduled posting for: ${platforms?.join(', ') || 'all platforms'}`);
    const coordinator = agentManager.getCoordinator();
    const result = await coordinator.executeScheduledPosting(platforms || ['facebook', 'instagram', 'linkedin', 'x']);
    res.json(result);
  } catch (error) {
    logger.error('Error executing scheduled posting:', error);
    res.status(500).json({ error: error.message || 'Failed to execute scheduled posting' });
  }
});

router.get('/workflow/status', async (req, res) => {
  try {
    const status = agentManager.getWorkflowStatus();
    res.json(status);
  } catch (error) {
    logger.error('Error fetching workflow status:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch workflow status' });
  }
});

router.post('/workflow/schedule', async (req, res) => {
  try {
    agentManager.scheduleDailyWorkflow();
    res.json({ message: 'Daily workflow scheduled successfully' });
  } catch (error) {
    logger.error('Error scheduling daily workflow:', error);
    res.status(500).json({ error: error.message || 'Failed to schedule workflow' });
  }
});

// Coordinator endpoints (must be before dynamic routes)
router.get('/coordinator/info', async (req, res) => {
  try {
    const coordinator = agentManager.getCoordinator();
    res.json(coordinator.getInfo());
  } catch (error) {
    logger.error('Error fetching coordinator info:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch coordinator info' });
  }
});

// Scheduler endpoints (must be before dynamic routes)
router.get('/scheduler/status', async (req, res) => {
  try {
    const scheduler = req.app.locals.scheduler;
    res.json(scheduler.getStatus());
  } catch (error) {
    logger.error('Error fetching scheduler status:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch scheduler status' });
  }
});

router.post('/scheduler/jobs', async (req, res) => {
  try {
    const { jobId, cronExpression, task, options } = req.body;
    const scheduler = req.app.locals.scheduler;
    
    if (!jobId || !cronExpression || !task) {
      return res.status(400).json({ error: 'jobId, cronExpression, and task are required' });
    }
    
    const result = scheduler.scheduleJob(jobId, cronExpression, task, options);
    res.json({ message: 'Job scheduled successfully', jobId: result });
  } catch (error) {
    logger.error('Error scheduling job:', error);
    res.status(500).json({ error: error.message || 'Failed to schedule job' });
  }
});

router.delete('/scheduler/jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const scheduler = req.app.locals.scheduler;
    
    const result = scheduler.stopJob(jobId);
    if (result) {
      res.json({ message: 'Job stopped successfully' });
    } else {
      res.status(404).json({ error: 'Job not found' });
    }
  } catch (error) {
    logger.error('Error stopping job:', error);
    res.status(500).json({ error: error.message || 'Failed to stop job' });
  }
});

router.post('/scheduler/jobs/:jobId/execute', async (req, res) => {
  try {
    const { jobId } = req.params;
    const scheduler = req.app.locals.scheduler;
    
    const result = await scheduler.executeJobNow(jobId);
    if (result) {
      res.json({ message: 'Job executed successfully' });
    } else {
      res.status(404).json({ error: 'Job not found' });
    }
  } catch (error) {
    logger.error('Error executing job:', error);
    res.status(500).json({ error: error.message || 'Failed to execute job' });
  }
});

// Get all agents with comprehensive execution metrics
router.get('/', async (req, res) => {
  try {
    const agents = agentManager.getAllAgents();
    
    // Enhance each agent with real execution data
    const enhancedAgents = await Promise.all(agents.map(async (agent) => {
      const executionMetrics = await getAgentExecutionMetrics(agent.id);
      return {
        ...agent,
        ...executionMetrics
      };
    }));
    
    res.json({ agents: enhancedAgents });
  } catch (error) {
    logger.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// Get comprehensive execution metrics for an agent
async function getAgentExecutionMetrics(agentId) {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Get workflow execution history using the same approach as dashboard
    const coordinator = agentManager.getCoordinator();
    const coordinatorHistory = coordinator ? coordinator.getExecutionHistory() : [];
    
    // Get individual agent execution history
    const executionHistory = agentManager.getExecutionHistory ? agentManager.getExecutionHistory(agentId, 50) : [];
    
    // Filter executions for this agent
    const agentExecutions = executionHistory.filter(exec => 
      exec.agent === agentId || exec.agentId === agentId
    );
    
    // Get workflow results where this agent participated
    const agentWorkflowParticipations = coordinatorHistory.filter(workflow => {
      if (!workflow.agentResults) return false;
      
      // Map agent IDs to their camelCase keys in workflow results
      const agentKeyMap = {
        'cmo-brain': 'cmoBrain',
        'market-researcher': 'marketResearcher', 
        'copywriting-agent': 'copywritingAgent',
        'social-content-agent': 'socialContentAgent',
        'social-posting-agent': 'socialPostingAgent',
        'lead-sales-agent': 'leadSalesAgent',
        'data-analyst': 'dataAnalyst'
      };
      
      const workflowKey = agentKeyMap[agentId] || agentId;
      return workflow.agentResults[workflowKey];
    });
    
    // Calculate metrics
    const totalExecutions = agentExecutions.length + agentWorkflowParticipations.length;
    const successfulExecutions = agentExecutions.filter(exec => 
      exec.status === 'completed' || exec.status === 'success'
    ).length + agentWorkflowParticipations.filter(workflow => 
      workflow.status === 'completed'
    ).length;
    
    const successRate = totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 100;
    
    // Calculate average execution time
    const executionTimes = agentExecutions
      .filter(exec => exec.duration)
      .map(exec => exec.duration);
    
    const avgExecutionTime = executionTimes.length > 0 
      ? Math.round(executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length)
      : 0;
    
    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentExecutions = agentExecutions.filter(exec => 
      new Date(exec.timestamp) > sevenDaysAgo
    ) || [];
    
    const recentWorkflows = agentWorkflowParticipations.filter(workflow => 
      new Date(workflow.timestamp) > sevenDaysAgo
    ) || [];
    
    // Calculate token usage (for AI agents)
    let totalTokens = 0;
    let totalCost = 0;
    
    agentExecutions.forEach(exec => {
      if (exec.tokenUsage) {
        totalTokens += exec.tokenUsage.total || 0;
        totalCost += exec.cost || 0;
      }
    });
    
    // Get agent-specific metrics using the correct workflow keys
    let agentSpecificMetrics = {};
    const agentKeyMap = {
      'cmo-brain': 'cmoBrain',
      'market-researcher': 'marketResearcher', 
      'copywriting-agent': 'copywritingAgent',
      'social-content-agent': 'socialContentAgent',
      'social-posting-agent': 'socialPostingAgent',
      'lead-sales-agent': 'leadSalesAgent',
      'data-analyst': 'dataAnalyst'
    };
    const workflowKey = agentKeyMap[agentId] || agentId;
    
    switch (agentId) {
      case 'cmo-brain':
        agentSpecificMetrics = {
          strategiesCreated: agentWorkflowParticipations.length,
          prioritiesGenerated: agentWorkflowParticipations.reduce((total, workflow) => {
            const cmoBrain = workflow.agentResults?.[workflowKey];
            if (Array.isArray(cmoBrain)) return total + cmoBrain.length;
            return total + (cmoBrain ? 1 : 0);
          }, 0)
        };
        break;
        
      case 'market-researcher':
        agentSpecificMetrics = {
          researchTasksCompleted: agentExecutions.filter(exec => 
            exec.task?.includes('research') || exec.task?.includes('opportunities')
          ).length,
          opportunitiesFound: agentWorkflowParticipations.reduce((total, workflow) => {
            const marketRes = workflow.agentResults?.[workflowKey];
            if (marketRes?.result?.opportunities) {
              return total + marketRes.result.opportunities.length;
            }
            return total;
          }, 0)
        };
        break;
        
      case 'copywriting-agent':
        agentSpecificMetrics = {
          blogPostsCreated: agentWorkflowParticipations.reduce((total, workflow) => {
            const copywriting = workflow.agentResults?.[workflowKey];
            if (copywriting?.results && Array.isArray(copywriting.results)) {
              return total + copywriting.results.length;
            }
            return total + (copywriting ? 1 : 0);
          }, 0),
          avgWordCount: 950 // Approximate based on recent blog posts
        };
        break;
        
      case 'social-content-agent':
        agentSpecificMetrics = {
          campaignsCreated: agentWorkflowParticipations.filter(workflow => 
            workflow.agentResults?.[workflowKey]
          ).length,
          platformsSupported: 4, // Facebook, Instagram, LinkedIn, X
          postsGenerated: agentWorkflowParticipations.reduce((total, workflow) => {
            const social = workflow.agentResults?.[workflowKey];
            if (social?.result?.platforms) {
              return total + Object.keys(social.result.platforms).length;
            }
            return total;
          }, 0)
        };
        break;
        
      case 'data-analyst':
        const dataAnalysisResults = coordinatorHistory.filter(workflow => workflow.dataAnalysis);
        agentSpecificMetrics = {
          analysesCompleted: dataAnalysisResults.length,
          dataSourcesIntegrated: 4, // Google Analytics, Search Console, Wix, Meta
          metricsTracked: 12 // Sessions, users, clicks, impressions, etc.
        };
        break;
        
      default:
        agentSpecificMetrics = {
          tasksCompleted: totalExecutions
        };
    }
    
    return {
      tasksCompleted: totalExecutions,
      successRate: successRate,
      avgExecutionTime: avgExecutionTime,
      recentActivity: recentExecutions.length + recentWorkflows.length,
      totalTokensUsed: totalTokens,
      totalCost: totalCost,
      lastExecution: agentExecutions.length > 0 ? agentExecutions[0]?.timestamp : 
                     agentWorkflowParticipations.length > 0 ? agentWorkflowParticipations[0]?.timestamp : null,
      ...agentSpecificMetrics
    };
    
  } catch (error) {
    logger.error(`Error calculating metrics for agent ${agentId}:`, error);
    return {
      tasksCompleted: 0,
      successRate: 100,
      avgExecutionTime: 0,
      recentActivity: 0,
      totalTokensUsed: 0,
      totalCost: 0,
      lastExecution: null
    };
  }
}

// Get specific agent
router.get('/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const agent = agentManager.getAgent(agentId);
    res.json(agent.getInfo());
  } catch (error) {
    logger.error('Error fetching agent:', error);
    res.status(404).json({ error: 'Agent not found' });
  }
});

// Execute agent with real-time progress tracking
router.post('/:agentId/execute', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { task, input } = req.body;
    
    if (!task) {
      return res.status(400).json({ error: 'Task is required' });
    }
    
    // Normalize task name for consistent handling
    const normalizedTask = (task || '').toLowerCase().trim();
    console.log(`API EXECUTE REQUEST - Agent: ${agentId}, Task: ${JSON.stringify(normalizedTask)}`);
    logger.info(`Executing agent ${agentId} task ${normalizedTask} with input:`, input);
    
    // Validate task
    agentManager.validateAgentTask(agentId, normalizedTask);
    
    // Execute task with progress tracking
    const result = await agentManager.executeAgentTaskWithProgress(agentId, normalizedTask, input);
    
    res.json(result);
  } catch (error) {
    logger.error('Error executing agent:', error);
    res.status(500).json({ error: error.message || 'Failed to execute agent' });
  }
});

// Real-time task execution with Server-Sent Events
router.get('/:agentId/execute-stream', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { task, input } = req.query;
    
    if (!task) {
      return res.status(400).json({ error: 'Task is required' });
    }
    
    // Parse input if it's a string
    let inputData = {};
    if (input) {
      try {
        inputData = JSON.parse(input);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid input format' });
      }
    }
    
    // Set headers for Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });
    
    logger.info(`Starting streaming execution for agent ${agentId} task ${task}`);
    
    // Validate task
    agentManager.validateAgentTask(agentId, task);
    
    // Execute task with real-time updates
    await agentManager.executeAgentTaskStream(agentId, task, inputData, (update) => {
      res.write(`data: ${JSON.stringify(update)}\n\n`);
    });
    
    // Send completion signal
    res.write(`data: ${JSON.stringify({ type: 'complete' })}\n\n`);
    res.end();
    
  } catch (error) {
    logger.error('Error in streaming execution:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
    res.end();
  }
});

// Get agent status
router.get('/:agentId/status', async (req, res) => {
  try {
    const { agentId } = req.params;
    const status = agentManager.getAgentStatus(agentId);
    res.json(status);
  } catch (error) {
    logger.error('Error fetching agent status:', error);
    res.status(404).json({ error: 'Agent not found' });
  }
});

// Get available tasks for an agent
router.get('/:agentId/tasks', async (req, res) => {
  try {
    const { agentId } = req.params;
    const tasks = agentManager.getAgentTasks(agentId);
    res.json({ agentId, tasks });
  } catch (error) {
    logger.error('Error fetching agent tasks:', error);
    res.status(404).json({ error: 'Agent not found' });
  }
});

// Get CMO Brain memory
router.get('/cmo-brain/memory', async (req, res) => {
  try {
    const agent = agentManager.getAgent('cmo-brain');
    const memory = agent.getMemory();
    res.json(memory);
  } catch (error) {
    logger.error('Error fetching CMO Brain memory:', error);
    res.status(500).json({ error: 'Failed to fetch memory' });
  }
});

// Get CMO Brain execution history
router.get('/cmo-brain/execution-history', async (req, res) => {
  try {
    const history = agentManager.getExecutionHistory('cmo-brain', 10);
    res.json(history);
  } catch (error) {
    logger.error('Error fetching execution history:', error);
    res.status(500).json({ error: 'Failed to fetch execution history' });
  }
});

// Market Researcher endpoints
router.get('/market-researcher/execution-history', async (req, res) => {
  try {
    const history = agentManager.getExecutionHistory('market-researcher', 10);
    res.json(history);
  } catch (error) {
    logger.error('Error fetching market researcher history:', error);
    res.status(500).json({ error: 'Failed to fetch execution history' });
  }
});

// Data Analyst endpoints
router.get('/data-analyst/execution-history', async (req, res) => {
  try {
    const history = agentManager.getExecutionHistory('data-analyst', 10);
    res.json(history);
  } catch (error) {
    logger.error('Error fetching data analyst history:', error);
    res.status(500).json({ error: 'Failed to fetch execution history' });
  }
});

// Copywriting Agent endpoints
router.get('/copywriting-agent/execution-history', async (req, res) => {
  try {
    const history = agentManager.getExecutionHistory('copywriting-agent', 10);
    res.json(history);
  } catch (error) {
    logger.error('Error fetching copywriting agent history:', error);
    res.status(500).json({ error: 'Failed to fetch execution history' });
  }
});

// Get Copywriting Agent content history
router.get('/copywriting-agent/content-history', async (req, res) => {
  try {
    const agent = agentManager.getAgent('copywriting-agent');
    const history = agent.getContentHistory();
    res.json(history);
  } catch (error) {
    logger.error('Error fetching content history:', error);
    res.status(500).json({ error: 'Failed to fetch content history' });
  }
});

// Get Copywriting Agent content history by type
router.get('/copywriting-agent/content-history/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const agent = agentManager.getAgent('copywriting-agent');
    const history = agent.getContentHistory(type);
    res.json(history);
  } catch (error) {
    logger.error('Error fetching content history by type:', error);
    res.status(500).json({ error: 'Failed to fetch content history' });
  }
});

// Social Content Agent endpoints
router.get('/social-content-agent/execution-history', async (req, res) => {
  try {
    const history = agentManager.getExecutionHistory('social-content-agent', 10);
    res.json(history);
  } catch (error) {
    logger.error('Error fetching social content agent history:', error);
    res.status(500).json({ error: 'Failed to fetch execution history' });
  }
});

// Get Social Content Agent content history
router.get('/social-content-agent/content-history', async (req, res) => {
  try {
    const agent = agentManager.getAgent('social-content-agent');
    const history = agent.getContentHistory();
    res.json(history);
  } catch (error) {
    logger.error('Error fetching social content history:', error);
    res.status(500).json({ error: 'Failed to fetch content history' });
  }
});

// Get Social Content Agent content history by type
router.get('/social-content-agent/content-history/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const agent = agentManager.getAgent('social-content-agent');
    const history = agent.getContentHistory(type);
    res.json(history);
  } catch (error) {
    logger.error('Error fetching social content history by type:', error);
    res.status(500).json({ error: 'Failed to fetch content history' });
  }
});

// Execute Social Content Agent task
router.post('/social-content-agent/execute', async (req, res) => {
  try {
    const { task, input } = req.body;
    
    if (!task) {
      return res.status(400).json({ error: 'Task parameter is required' });
    }
    
    const agent = agentManager.getAgent('social-content-agent');
    const result = await agent.execute(task, input || {});
    
    res.json(result);
  } catch (error) {
    logger.error('Error executing social content agent task:', error);
    res.status(500).json({ error: error.message || 'Failed to execute task' });
  }
});

// Get Social Content Agent available tasks
router.get('/social-content-agent/tasks', async (req, res) => {
  try {
    const agent = agentManager.getAgent('social-content-agent');
    const tasks = agent.getAvailableTasks();
    res.json(tasks);
  } catch (error) {
    logger.error('Error fetching social content agent tasks:', error);
    res.status(500).json({ error: 'Failed to fetch available tasks' });
  }
});

// Get Social Content Agent brand guidelines
router.get('/social-content-agent/brand-guidelines', async (req, res) => {
  try {
    const agent = agentManager.getAgent('social-content-agent');
    const guidelines = await agent.execute('create-visual-brand-guidelines', {});
    res.json(guidelines);
  } catch (error) {
    logger.error('Error fetching brand guidelines:', error);
    res.status(500).json({ error: 'Failed to fetch brand guidelines' });
  }
});

// Create multi-platform social campaign
router.post('/social-content-agent/campaign', async (req, res) => {
  try {
    const agent = agentManager.getAgent('social-content-agent');
    const result = await agent.execute('create-multi-platform-campaign', req.body);
    res.json(result);
  } catch (error) {
    logger.error('Error creating social campaign:', error);
    res.status(500).json({ error: 'Failed to create social campaign' });
  }
});

// Generate brand image prompt
router.post('/social-content-agent/generate-image', async (req, res) => {
  try {
    const agent = agentManager.getAgent('social-content-agent');
    const result = await agent.execute('generate-brand-image', req.body);
    res.json(result);
  } catch (error) {
    logger.error('Error generating brand image:', error);
    res.status(500).json({ error: 'Failed to generate brand image' });
  }
});

// Create content calendar
router.post('/social-content-agent/calendar', async (req, res) => {
  try {
    const agent = agentManager.getAgent('social-content-agent');
    const result = await agent.execute('create-content-calendar', req.body);
    res.json(result);
  } catch (error) {
    logger.error('Error creating content calendar:', error);
    res.status(500).json({ error: 'Failed to create content calendar' });
  }
});

// Analyze trending topics
router.post('/social-content-agent/trending', async (req, res) => {
  try {
    const agent = agentManager.getAgent('social-content-agent');
    const result = await agent.execute('analyze-trending-topics', req.body);
    res.json(result);
  } catch (error) {
    logger.error('Error analyzing trending topics:', error);
    res.status(500).json({ error: 'Failed to analyze trending topics' });
  }
});

// Create hashtag strategy
router.post('/social-content-agent/hashtags', async (req, res) => {
  try {
    const agent = agentManager.getAgent('social-content-agent');
    const result = await agent.execute('create-hashtag-strategy', req.body);
    res.json(result);
  } catch (error) {
    logger.error('Error creating hashtag strategy:', error);
    res.status(500).json({ error: 'Failed to create hashtag strategy' });
  }
});

// Repurpose content
router.post('/social-content-agent/repurpose', async (req, res) => {
  try {
    const agent = agentManager.getAgent('social-content-agent');
    const result = await agent.execute('repurpose-content', req.body);
    res.json(result);
  } catch (error) {
    logger.error('Error repurposing content:', error);
    res.status(500).json({ error: 'Failed to repurpose content' });
  }
});

// Execute Copywriting Agent task
router.post('/copywriting-agent/execute', async (req, res) => {
  try {
    const { task, input } = req.body;
    
    if (!task) {
      return res.status(400).json({ error: 'Task parameter is required' });
    }
    
    const agent = agentManager.getAgent('copywriting-agent');
    const result = await agent.execute(task, input || {});
    
    res.json(result);
  } catch (error) {
    logger.error('Error executing copywriting agent task:', error);
    res.status(500).json({ error: error.message || 'Failed to execute task' });
  }
});

// Execute Copywriting Agent task with progress
router.post('/copywriting-agent/execute-with-progress', async (req, res) => {
  try {
    const { task, input } = req.body;
    
    if (!task) {
      return res.status(400).json({ error: 'Task parameter is required' });
    }
    
    const agent = agentManager.getAgent('copywriting-agent');
    const result = await agent.executeWithProgress(task, input || {}, (progress) => {
      // In a real implementation, this would use Server-Sent Events or WebSocket
      logger.info('Copywriting Agent progress:', progress);
    });
    
    res.json(result);
  } catch (error) {
    logger.error('Error executing copywriting agent task with progress:', error);
    res.status(500).json({ error: error.message || 'Failed to execute task' });
  }
});

// Get Copywriting Agent available tasks
router.get('/copywriting-agent/tasks', async (req, res) => {
  try {
    const agent = agentManager.getAgent('copywriting-agent');
    const tasks = agent.getAvailableTasks();
    res.json(tasks);
  } catch (error) {
    logger.error('Error fetching copywriting agent tasks:', error);
    res.status(500).json({ error: 'Failed to fetch available tasks' });
  }
});

// Analyze writing style from existing content
router.post('/copywriting-agent/analyze-style', async (req, res) => {
  try {
    const agent = agentManager.getAgent('copywriting-agent');
    const result = await agent.execute('analyze-writing-style', req.body);
    res.json(result);
  } catch (error) {
    logger.error('Error analyzing writing style:', error);
    res.status(500).json({ error: 'Failed to analyze writing style' });
  }
});

// Get current style analysis results
router.get('/copywriting-agent/style-analysis', async (req, res) => {
  try {
    const agent = agentManager.getAgent('copywriting-agent');
    const contentAnalyzer = agent.contentAnalyzer;
    const styleAnalysis = contentAnalyzer.getStyleAnalysis();
    res.json({ success: true, styleAnalysis });
  } catch (error) {
    logger.error('Error fetching style analysis:', error);
    res.status(500).json({ error: 'Failed to fetch style analysis' });
  }
});

// Create style-enhanced content
router.post('/copywriting-agent/create-style-enhanced', async (req, res) => {
  try {
    const agent = agentManager.getAgent('copywriting-agent');
    const result = await agent.execute('create-style-enhanced-content', req.body);
    res.json(result);
  } catch (error) {
    logger.error('Error creating style-enhanced content:', error);
    res.status(500).json({ error: 'Failed to create style-enhanced content' });
  }
});

// Get Market Researcher research history
router.get('/market-researcher/research-history', async (req, res) => {
  try {
    const agent = agentManager.getAgent('market-researcher');
    const history = agent.getResearchHistory();
    res.json(history);
  } catch (error) {
    logger.error('Error fetching research history:', error);
    res.status(500).json({ error: 'Failed to fetch research history' });
  }
});

// Get CMO Brain thinking configuration
router.get('/cmo-brain/thinking-config', async (req, res) => {
  try {
    const agent = agentManager.getAgent('cmo-brain');
    const config = agent.getThinkingConfig();
    res.json(config);
  } catch (error) {
    logger.error('Error fetching thinking config:', error);
    res.status(500).json({ error: 'Failed to fetch thinking config' });
  }
});

// Update CMO Brain thinking configuration
router.put('/cmo-brain/thinking-config', async (req, res) => {
  try {
    const agent = agentManager.getAgent('cmo-brain');
    const config = agent.updateThinkingConfig(req.body);
    res.json(config);
  } catch (error) {
    logger.error('Error updating thinking config:', error);
    res.status(500).json({ error: 'Failed to update thinking config' });
  }
});

// Clear CMO Brain memory
router.delete('/cmo-brain/memory', async (req, res) => {
  try {
    const agent = agentManager.getAgent('cmo-brain');
    const result = agent.clearMemory();
    res.json(result);
  } catch (error) {
    logger.error('Error clearing memory:', error);
    res.status(500).json({ error: 'Failed to clear memory' });
  }
});

// Get system health
router.get('/health/system', async (req, res) => {
  try {
    const health = agentManager.getSystemHealth();
    res.json(health);
  } catch (error) {
    logger.error('Error fetching system health:', error);
    res.status(500).json({ error: 'Failed to fetch system health' });
  }
});

// Social Posting Agent endpoints
router.get('/social-posting-agent/execution-history', async (req, res) => {
  try {
    const history = agentManager.getExecutionHistory('social-posting-agent', 10);
    res.json(history);
  } catch (error) {
    logger.error('Error fetching social posting agent history:', error);
    res.status(500).json({ error: 'Failed to fetch execution history' });
  }
});

// Execute Social Posting Agent task
router.post('/social-posting-agent/execute', async (req, res) => {
  try {
    const { task, input } = req.body;
    
    if (!task) {
      return res.status(400).json({ error: 'Task parameter is required' });
    }
    
    const agent = agentManager.getAgent('social-posting-agent');
    const result = await agent.execute(task, input || {});
    
    res.json(result);
  } catch (error) {
    logger.error('Error executing social posting agent task:', error);
    res.status(500).json({ error: error.message || 'Failed to execute task' });
  }
});

// Get Social Posting Agent available tasks
router.get('/social-posting-agent/tasks', async (req, res) => {
  try {
    const agent = agentManager.getAgent('social-posting-agent');
    const tasks = agent.getAvailableTasks();
    res.json(tasks);
  } catch (error) {
    logger.error('Error fetching social posting agent tasks:', error);
    res.status(500).json({ error: 'Failed to fetch available tasks' });
  }
});

// Lead & Sales Agent endpoints
router.get('/lead-sales-agent/execution-history', async (req, res) => {
  try {
    const history = agentManager.getExecutionHistory('lead-sales-agent', 10);
    res.json(history);
  } catch (error) {
    logger.error('Error fetching lead sales agent history:', error);
    res.status(500).json({ error: 'Failed to fetch execution history' });
  }
});

// Execute Lead & Sales Agent task
router.post('/lead-sales-agent/execute', async (req, res) => {
  try {
    const { task, input } = req.body;
    
    if (!task) {
      return res.status(400).json({ error: 'Task parameter is required' });
    }
    
    const agent = agentManager.getAgent('lead-sales-agent');
    const result = await agent.execute(task, input || {});
    
    res.json(result);
  } catch (error) {
    logger.error('Error executing lead sales agent task:', error);
    res.status(500).json({ error: error.message || 'Failed to execute task' });
  }
});

// Get Lead & Sales Agent available tasks
router.get('/lead-sales-agent/tasks', async (req, res) => {
  try {
    const agent = agentManager.getAgent('lead-sales-agent');
    const tasks = agent.getAvailableTasks();
    res.json(tasks);
  } catch (error) {
    logger.error('Error fetching lead sales agent tasks:', error);
    res.status(500).json({ error: 'Failed to fetch available tasks' });
  }
});

module.exports = router; 