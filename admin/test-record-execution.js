const AgentCoordinator = require('./src/agents/agent-coordinator');
const AgentManager = require('./src/agents/agent-manager');

async function testRecordExecution() {
  try {
    console.log('🧪 Testing recordExecution method...');
    
    // Create agent manager and coordinator
    const agentManager = new AgentManager();
    const coordinator = agentManager.getCoordinator();
    
    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create a simple test execution record
    const testExecution = {
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
    
    console.log('📝 Test execution record created:', testExecution.workflowId);
    
    // Try to record the execution
    console.log('💾 Recording execution...');
    await coordinator.recordExecution(testExecution);
    
    console.log('✅ recordExecution completed successfully');
    
    // Check if it was saved
    const history = coordinator.getExecutionHistory();
    console.log('📊 Execution history length:', history.length);
    
    if (history.length > 0) {
      const latest = history[0];
      console.log('📋 Latest execution:', {
        id: latest.id,
        workflowId: latest.workflowId,
        status: latest.status,
        timestamp: latest.timestamp
      });
    }
    
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Error testing recordExecution:', error);
    console.error('Stack:', error.stack);
  }
}

testRecordExecution(); 