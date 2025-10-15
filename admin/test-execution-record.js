const AgentCoordinator = require('./src/agents/agent-coordinator');
const AgentManager = require('./src/agents/agent-manager');

async function testExecutionRecord() {
  try {
    console.log('🧪 Testing execution record serialization...');
    
    // Create agent manager and coordinator
    const agentManager = new AgentManager();
    const coordinator = agentManager.getCoordinator();
    
    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create a mock execution record similar to what the workflow creates
    const mockExecutionRecord = {
      workflowId: 'test-workflow-' + Date.now(),
      type: 'Daily CMO Workflow',
      status: 'completed',
      timestamp: new Date().toISOString(),
      duration: 5000,
      dataAnalysis: {
        status: 'success',
        summary: 'Test data analysis',
        data: {
          currentMetrics: { sessions: 100, users: 50 },
          searchMetrics: { queries: 10, pages: 5 }
        }
      },
      cmoPriorities: [
        { title: 'Test Priority 1', priority: 'high' },
        { title: 'Test Priority 2', priority: 'medium' }
      ],
      agentResults: {
        dataAnalyst: {
          status: 'completed',
          results: [{ task: 'analyze_performance', status: 'success' }]
        },
        copywritingAgent: {
          status: 'completed',
          results: [{ task: 'create-blog-post', status: 'success' }]
        },
        socialContentAgent: {
          status: 'completed',
          results: [{ task: 'create-multi-platform-campaign', status: 'success' }]
        },
        leadSalesAgent: {
          status: 'completed',
          results: [{ task: 'optimize-sales-funnel', status: 'success' }]
        },
        cmoBrain: {
          status: 'completed',
          priorities: ['Test Priority 1', 'Test Priority 2'],
          analysis: { insights: ['Test insight 1', 'Test insight 2'] }
        }
      },
      marketResearch: null,
      copywritingContent: null,
      openaiTokens: 1000,
      newsApiCalls: 0,
      serpApiCalls: 0
    };
    
    console.log('📝 Mock execution record created');
    console.log('📊 Execution record size:', JSON.stringify(mockExecutionRecord).length, 'characters');
    
    // Test if it can be serialized
    console.log('🔄 Testing JSON serialization...');
    try {
      const serialized = JSON.stringify(mockExecutionRecord, null, 2);
      console.log('✅ JSON serialization successful');
      console.log('📄 Serialized size:', serialized.length, 'characters');
      
      // Test if it can be deserialized
      const deserialized = JSON.parse(serialized);
      console.log('✅ JSON deserialization successful');
      
    } catch (error) {
      console.error('❌ JSON serialization failed:', error.message);
      return;
    }
    
    // Test if it can be recorded
    console.log('💾 Testing recordExecution...');
    try {
      await coordinator.recordExecution(mockExecutionRecord);
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
      
    } catch (error) {
      console.error('❌ recordExecution failed:', error.message);
      console.error('Stack:', error.stack);
    }
    
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Error testing execution record:', error);
    console.error('Stack:', error.stack);
  }
}

testExecutionRecord(); 