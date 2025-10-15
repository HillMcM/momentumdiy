const CMOBrain = require('./cmo-brain');
const MarketResearcher = require('./market-researcher');
const DataAnalyst = require('./data-analyst-agent');
const CopywritingAgent = require('./copywriting-agent');
const SocialContentAgent = require('./social-content-agent');
const SocialPostingAgent = require('./social-posting-agent');
const LeadSalesAgent = require('./lead-sales-agent');
const AgentCoordinator = require('./agent-coordinator');
const { getAgentDefinition, getAllAgentDefinitions } = require('./agent-definitions');
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

class AgentManager {
  constructor() {
    this.agents = new Map();
    this.executionHistory = new Map(); // Track execution history
    this.executionHistoryFile = path.join(__dirname, '../../data/agent-execution-history.json');
    this.coordinator = new AgentCoordinator(this);
    
    // Get the shared ResourceManager from the coordinator
    this.sharedResourceManager = this.coordinator.resourceManager;
    
    // Initialize agents asynchronously
    this.initializeAgents().catch(error => {
      logger.error('Error initializing agents:', error);
    });
    
    // Load execution history asynchronously
    this.loadExecutionHistory().catch(error => {
      logger.error('Error loading execution history:', error);
    });
  }

  // Load execution history from file
  async loadExecutionHistory() {
    try {
      const data = await fs.readFile(this.executionHistoryFile, 'utf8');
      const history = JSON.parse(data);
      
      // Convert array back to Map
      for (const execution of history) {
        this.executionHistory.set(execution.id, execution);
      }
      
      logger.info(`Loaded ${history.length} execution history records`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        logger.info('No existing execution history file found, starting fresh');
      } else {
        logger.error('Error loading execution history:', error);
      }
    }
  }

  // Save execution history to file
  async saveExecutionHistory() {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.executionHistoryFile);
      await fs.mkdir(dataDir, { recursive: true });
      
      // Convert Map to array and save
      const historyArray = Array.from(this.executionHistory.values());
      await fs.writeFile(this.executionHistoryFile, JSON.stringify(historyArray, null, 2));
      
      logger.info(`Saved ${historyArray.length} execution history records`);
    } catch (error) {
      logger.error('Error saving execution history:', error);
    }
  }

  // Initialize all available agents
  async initializeAgents() {
    try {
      // Initialize CMO Brain with shared ResourceManager
      const cmoBrain = new CMOBrain(this.sharedResourceManager);
      this.agents.set('cmo-brain', cmoBrain);
      
      // Initialize Market Researcher with shared ResourceManager
      const marketResearcher = new MarketResearcher(this.sharedResourceManager);
      this.agents.set('market-researcher', marketResearcher);
      
      // Initialize Data Analyst (has async initialization)
      const dataAnalyst = new DataAnalyst();
      this.agents.set('data-analyst', dataAnalyst);
      
      // Initialize Copywriting Agent with shared ResourceManager
      const copywritingAgent = new CopywritingAgent(this.sharedResourceManager);
      this.agents.set('copywriting-agent', copywritingAgent);
      
      // Initialize Social Content Agent with shared ResourceManager
      const socialContentAgent = new SocialContentAgent(this.sharedResourceManager);
      this.agents.set('social-content-agent', socialContentAgent);
      
      // Initialize Social Posting Agent
      const socialPostingAgent = new SocialPostingAgent();
      this.agents.set('social-posting-agent', socialPostingAgent);
      
      // Initialize Lead & Sales Agent
      const leadSalesAgent = new LeadSalesAgent();
      this.agents.set('lead-sales-agent', leadSalesAgent);
      
      logger.info('Agent Manager initialized with CMO Brain, Market Researcher, Data Analyst, Copywriting Agent, Social Content Agent, Social Posting Agent, and Lead & Sales Agent');
    } catch (error) {
      logger.error('Error initializing agents:', error);
      throw error;
    }
  }

  // Get all available agents
  getAllAgents() {
    const agentsList = [];
    for (const [id, agent] of this.agents) {
      agentsList.push(agent.getInfo());
    }
    return agentsList;
  }

  // Get specific agent
  getAgent(agentId) {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    return agent;
  }

  // Execute agent task with progress tracking
  async executeAgentTaskWithProgress(agentId, task, input) {
    const startTime = Date.now();
    const executionId = `${agentId}-${task}-${Date.now()}`;
    
    try {
      const agent = this.getAgent(agentId);
      logger.info(`Executing task ${task} on agent ${agentId}`);
      
      // Initialize execution tracking
      const executionData = {
        id: executionId,
        agentId,
        task,
        startTime,
        status: 'running',
        progress: 0,
        steps: [],
        tokenUsage: { input: 0, output: 0, total: 0 },
        currentStep: 'Initializing...'
      };
      
      this.executionHistory.set(executionId, executionData);
      
      // Execute task with progress updates
      const result = await agent.executeWithProgress(task, input, (progress) => {
        executionData.progress = progress.progress;
        executionData.currentStep = progress.step;
        executionData.steps = progress.steps || executionData.steps;
        if (progress.tokenUsage) {
          executionData.tokenUsage = { ...executionData.tokenUsage, ...progress.tokenUsage };
        }
      });
      
      // Update execution data
      executionData.status = 'completed';
      executionData.endTime = Date.now();
      executionData.duration = executionData.endTime - executionData.startTime;
      executionData.result = result;
      
      // Save execution history to file
      await this.saveExecutionHistory();
      
      logger.info(`Task ${task} completed successfully on agent ${agentId} in ${executionData.duration}ms`);
      return {
        ...result,
        execution: {
          id: executionId,
          duration: executionData.duration,
          tokenUsage: executionData.tokenUsage,
          steps: executionData.steps
        }
      };
    } catch (error) {
      // Update execution data on error
      const executionData = this.executionHistory.get(executionId);
      if (executionData) {
        executionData.status = 'failed';
        executionData.endTime = Date.now();
        executionData.duration = executionData.endTime - executionData.startTime;
        executionData.error = error.message;
        
        // Save execution history to file
        await this.saveExecutionHistory();
      }
      
      logger.error(`Error executing task ${task} on agent ${agentId}:`, error);
      throw error;
    }
  }

  // Execute agent task with streaming updates
  async executeAgentTaskStream(agentId, task, input, onUpdate) {
    const startTime = Date.now();
    const executionId = `${agentId}-${task}-${Date.now()}`;
    
    try {
      const agent = this.getAgent(agentId);
      
      // Send initial update
      onUpdate({
        type: 'start',
        executionId,
        agentId,
        task,
        startTime,
        message: 'Starting task execution...'
      });
      
      // Execute task with streaming updates
      const result = await agent.executeWithStreaming(task, input, (update) => {
        onUpdate({
          type: 'progress',
          executionId,
          ...update,
          timestamp: Date.now()
        });
      });
      
      // Send completion update
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      onUpdate({
        type: 'complete',
        executionId,
        result,
        duration,
        message: 'Task completed successfully'
      });
      
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      onUpdate({
        type: 'error',
        executionId,
        error: error.message,
        duration,
        message: 'Task failed'
      });
      
      throw error;
    }
  }

  // Get execution history
  getExecutionHistory(agentId = null, limit = 10) {
    let history = Array.from(this.executionHistory.values());
    
    if (agentId) {
      history = history.filter(exec => exec.agentId === agentId);
    }
    
    return history
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, limit);
  }

  // Get specific execution details
  getExecutionDetails(executionId) {
    return this.executionHistory.get(executionId);
  }

  // Get available tasks for an agent
  getAgentTasks(agentId) {
    const agent = this.getAgent(agentId);
    if (agent.getAvailableTasks) {
      return agent.getAvailableTasks();
    }
    return [];
  }

  // Get agent status
  getAgentStatus(agentId) {
    const agent = this.getAgent(agentId);
    return {
      agentId,
      status: agent.status,
      lastActivity: agent.lastActivity,
      capabilities: agent.capabilities || []
    };
  }

  // Validate agent and task
  validateAgentTask(agentId, task) {
    const agent = this.getAgent(agentId);
    const availableTasks = this.getAgentTasks(agentId);
    
    const taskExists = availableTasks.find(t => t.id === task);
    if (!taskExists) {
      throw new Error(`Task ${task} not available for agent ${agentId}`);
    }
    
    return taskExists;
  }

  // Get system health
  getSystemHealth() {
    const health = {
      status: 'healthy',
      agents: this.agents.size,
      timestamp: new Date().toISOString(),
      agentStatuses: [],
      coordinatorStatus: this.coordinator.getInfo()
    };

    for (const [id, agent] of this.agents) {
      // Get agent info which includes status and lastActivity
      let agentInfo;
      try {
        agentInfo = agent.getInfo ? agent.getInfo() : {
          id,
          status: agent.status || 'unknown',
          lastActivity: agent.lastActivity || new Date().toISOString()
        };
        
        // Debug logging
        logger.info(`Agent ${id} info:`, JSON.stringify(agentInfo, null, 2));
      } catch (error) {
        logger.error(`Error getting info for agent ${id}:`, error);
        agentInfo = {
          id,
          status: 'error',
          lastActivity: new Date().toISOString()
        };
      }
      
      health.agentStatuses.push({
        id: agentInfo.id || id,
        status: agentInfo.status || 'active', // Default to active if status is missing
        lastActivity: agentInfo.lastActivity || new Date().toISOString()
      });
    }

    return health;
  }

  // Inter-agent communication methods
  async sendMessage(fromAgent, toAgent, message) {
    return await this.coordinator.sendMessage(fromAgent, toAgent, message);
  }

  getCommunicationHistory(fromAgent, toAgent, limit = 20) {
    return this.coordinator.getCommunicationHistory(fromAgent, toAgent, limit);
  }

  // Daily workflow methods
  async executeDailyCMOWorkflow() {
    return await this.coordinator.executeDailyCMOWorkflow();
  }

  // Execute daily workflow with real-time progress updates
  async executeDailyCMOWorkflowWithProgress(onProgress) {
    return await this.coordinator.executeDailyCMOWorkflowWithProgress(onProgress);
  }

  getWorkflowStatus() {
    return this.coordinator.getWorkflowStatus();
  }

  scheduleDailyWorkflow() {
    return this.coordinator.scheduleDailyWorkflow();
  }

  // Execute autonomous tasks for an agent based on incoming data
  async executeAutonomousTasks(agentId, data, context = {}) {
    const startTime = Date.now();
    const executionId = `autonomous-${agentId}-${Date.now()}`;
    
    try {
      const agent = this.getAgent(agentId);
      logger.info(`Executing autonomous tasks for agent ${agentId}`, { data, context });
      
      // Initialize execution tracking
      const executionData = {
        id: executionId,
        agentId,
        type: 'autonomous',
        startTime,
        status: 'running',
        progress: 0,
        steps: [],
        tokenUsage: { input: 0, output: 0, total: 0 },
        currentStep: 'Analyzing data for autonomous task selection...'
      };
      
      this.executionHistory.set(executionId, executionData);
      
      // Execute autonomous tasks
      const result = await agent.executeAutonomousTasks(data, context);
      
      // Update execution data
      executionData.status = 'completed';
      executionData.endTime = Date.now();
      executionData.duration = executionData.endTime - executionData.startTime;
      executionData.result = result;
      
      logger.info(`Autonomous tasks completed successfully for agent ${agentId} in ${executionData.duration}ms`);
      return {
        ...result,
        execution: {
          id: executionId,
          duration: executionData.duration,
          tokenUsage: executionData.tokenUsage,
          steps: executionData.steps
        }
      };
    } catch (error) {
      // Update execution data on error
      const executionData = this.executionHistory.get(executionId);
      if (executionData) {
        executionData.status = 'failed';
        executionData.endTime = Date.now();
        executionData.duration = executionData.endTime - executionData.startTime;
        executionData.error = error.message;
      }
      
      logger.error(`Error executing autonomous tasks for agent ${agentId}:`, error);
      throw error;
    }
  }

  // Get coordinator
  getCoordinator() {
    return this.coordinator;
  }

  /**
   * Get agent capabilities and definition
   * @param {string} agentId - The agent ID (e.g., 'market-researcher')
   * @returns {Object} Agent definition with job description, triggers, inputs/outputs
   */
  getAgentCapabilities(agentId) {
    return getAgentDefinition(agentId);
  }

  /**
   * Get all agent definitions
   * @returns {Object} All agent definitions
   */
  getAllAgentCapabilities() {
    return getAllAgentDefinitions();
  }
}

module.exports = AgentManager; 