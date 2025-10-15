const AgentCoordinator = require('./src/agents/agent-coordinator');
const AgentManager = require('./src/agents/agent-manager');
const fs = require('fs').promises;
const path = require('path');

async function testSaveExecution() {
  try {
    console.log('🧪 Testing saveExecutionHistory method...');
    
    // Create agent manager and coordinator
    const agentManager = new AgentManager();
    const coordinator = agentManager.getCoordinator();
    
    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check the file path
    console.log('📁 Execution history file path:', coordinator.executionHistoryFile);
    
    // Check if file exists
    try {
      const stats = await fs.stat(coordinator.executionHistoryFile);
      console.log('📄 File exists, size:', stats.size, 'bytes');
    } catch (error) {
      console.log('❌ File does not exist:', error.message);
    }
    
    // Check current execution history length
    console.log('📊 Current execution history length:', coordinator.executionHistory.length);
    
    // Add a test execution
    const testExecution = {
      id: 'exec-test-' + Date.now(),
      workflowId: 'test-workflow-' + Date.now(),
      type: 'Test Workflow',
      status: 'completed',
      timestamp: new Date().toISOString(),
      duration: 5000,
      dataAnalysis: { test: 'data' },
      cmoPriorities: ['test priority'],
      agentResults: {
        dataAnalyst: { status: 'completed' },
        copywritingAgent: { status: 'completed' }
      },
      openaiTokens: 1000,
      newsApiCalls: 0,
      serpApiCalls: 0
    };
    
    // Add to execution history
    coordinator.executionHistory.unshift(testExecution);
    console.log('📝 Added test execution to history');
    console.log('📊 New execution history length:', coordinator.executionHistory.length);
    
    // Try to save
    console.log('💾 Calling saveExecutionHistory...');
    await coordinator.saveExecutionHistory();
    console.log('✅ saveExecutionHistory completed');
    
    // Check if file was updated
    try {
      const stats = await fs.stat(coordinator.executionHistoryFile);
      console.log('📄 File updated, new size:', stats.size, 'bytes');
      
      // Read the file to verify content
      const data = await fs.readFile(coordinator.executionHistoryFile, 'utf8');
      const parsed = JSON.parse(data);
      console.log('📋 File contains', parsed.length, 'executions');
      
      if (parsed.length > 0) {
        const latest = parsed[0];
        console.log('📋 Latest execution in file:', {
          id: latest.id,
          workflowId: latest.workflowId,
          status: latest.status,
          timestamp: latest.timestamp
        });
      }
    } catch (error) {
      console.log('❌ Error reading file:', error.message);
    }
    
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Error testing saveExecutionHistory:', error);
    console.error('Stack:', error.stack);
  }
}

testSaveExecution(); 