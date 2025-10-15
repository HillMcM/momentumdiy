const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const approvalDB = require('../database/approval-db-supabase');

// Get agent outputs with filters
router.get('/outputs', async (req, res) => {
  try {
    const { date, agent, status, type } = req.query;
    const filters = {};
    
    if (date) filters.date = date;
    if (agent) filters.agent = agent;
    if (status) filters.status = status;
    if (type) filters.type = type;
    
    const outputs = await approvalDB.getOutputs(filters);
    const stats = await approvalDB.getStats(filters);
    
    res.json({
      success: true,
      outputs,
      stats
    });
  } catch (error) {
    logger.error('Error fetching outputs:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch outputs' 
    });
  }
});

// Get specific output by ID
router.get('/outputs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const output = await approvalDB.getOutputById(id);
    
    if (!output) {
      return res.status(404).json({ 
        success: false,
        error: 'Output not found' 
      });
    }
    
    res.json({
      success: true,
      output
    });
  } catch (error) {
    logger.error('Error fetching output:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch output' 
    });
  }
});

// Approve output
router.post('/:outputId/approve', async (req, res) => {
  try {
    const { outputId } = req.params;
    const { approvedBy, feedback, outputType } = req.body;
    
    // Get the output to get agent information
    const output = await approvalDB.getOutputById(outputId);
    if (!output) {
      return res.status(404).json({ 
        success: false,
        error: 'Output not found' 
      });
    }
    
    const approvalData = {
      approvedBy,
      feedback,
      outputType,
      agent: output.agent,
      type: 'approval'
    };
    
    const approval = await approvalDB.addApproval(outputId, approvalData);
    
    res.json({
      success: true,
      approval,
      message: 'Output approved successfully'
    });
  } catch (error) {
    logger.error('Error approving output:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to approve output' 
    });
  }
});

// Reject output
router.post('/:outputId/reject', async (req, res) => {
  try {
    const { outputId } = req.params;
    const { rejectedBy, reason, feedback, outputType } = req.body;
    
    if (!reason || !reason.trim()) {
      return res.status(400).json({ 
        success: false,
        error: 'Reason for rejection is required' 
      });
    }
    
    // Get the output to get agent information
    const output = await approvalDB.getOutputById(outputId);
    if (!output) {
      return res.status(404).json({ 
        success: false,
        error: 'Output not found' 
      });
    }
    
    const rejectionData = {
      rejectedBy,
      reason,
      feedback,
      outputType,
      agent: output.agent,
      type: 'rejection'
    };
    
    const rejection = await approvalDB.addRejection(outputId, rejectionData);
    
    res.json({
      success: true,
      rejection,
      message: 'Output rejected and feedback recorded for learning'
    });
  } catch (error) {
    logger.error('Error rejecting output:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to reject output' 
    });
  }
});

// Get approval history
router.get('/history', async (req, res) => {
  try {
    const { agent, type } = req.query;
    const filters = {};
    
    if (agent) filters.agent = agent;
    if (type) filters.type = type;
    
    const history = await approvalDB.getApprovalHistory(filters);
    
    res.json({
      success: true,
      history
    });
  } catch (error) {
    logger.error('Error fetching approval history:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch approval history' 
    });
  }
});

// Get learning data for agents
router.get('/learning/:agent?', async (req, res) => {
  try {
    const { agent } = req.params;
    const learningData = await approvalDB.getLearningData(agent);
    const improvements = agent ? await approvalDB.getAgentImprovements(agent) : [];
    
    res.json({
      success: true,
      learningData,
      improvements
    });
  } catch (error) {
    logger.error('Error fetching learning data:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch learning data' 
    });
  }
});

// Discover and import existing outputs
router.post('/discover', async (req, res) => {
  try {
    await approvalDB.discoverOutputs();
    
    res.json({
      success: true,
      message: 'Output discovery completed'
    });
  } catch (error) {
    logger.error('Error discovering outputs:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to discover outputs' 
    });
  }
});

// Get approval queue (for backward compatibility)
router.get('/queue', async (req, res) => {
  try {
    const outputs = await approvalDB.getOutputs({ status: 'pending' });
    
    const queue = outputs.map(output => ({
      id: output.id,
      type: output.type,
      title: output.title,
      agent: output.agent,
      status: output.status,
      createdAt: output.createdAt,
      priority: output.priority
    }));
    
    res.json({
      success: true,
      queue
    });
  } catch (error) {
    logger.error('Error fetching approval queue:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch approval queue' 
    });
  }
});

module.exports = router; 