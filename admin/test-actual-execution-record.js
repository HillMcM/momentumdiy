const AgentCoordinator = require('./src/agents/agent-coordinator');
const AgentManager = require('./src/agents/agent-manager');

async function testActualExecutionRecord() {
  try {
    console.log('🧪 Testing actual execution record from workflow...');
    
    // Create agent manager and coordinator
    const agentManager = new AgentManager();
    const coordinator = agentManager.getCoordinator();
    
    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start a workflow to capture the actual execution record
    console.log('🚀 Starting workflow to capture execution record...');
    
    // Override the recordExecution method to capture the execution record
    const originalRecordExecution = coordinator.recordExecution.bind(coordinator);
    let capturedExecutionRecord = null;
    
    coordinator.recordExecution = async function(execution) {
      console.log('📸 Capturing execution record...');
      capturedExecutionRecord = JSON.parse(JSON.stringify(execution)); // Deep copy
      
      // Call the original method
      return originalRecordExecution(execution);
    };
    
    // Start the workflow
    const workflowPromise = coordinator.executeDailyCMOWorkflow();
    
    // Wait for the workflow to complete
    try {
      await workflowPromise;
      console.log('✅ Workflow completed');
    } catch (error) {
      console.log('⚠️ Workflow failed, but we captured the execution record:', error.message);
    }
    
    // Analyze the captured execution record
    if (capturedExecutionRecord) {
      console.log('📊 Analyzing captured execution record...');
      console.log('📄 Execution record size:', JSON.stringify(capturedExecutionRecord).length, 'characters');
      
      // Test if it can be serialized
      console.log('🔄 Testing JSON serialization of actual execution record...');
      try {
        const serialized = JSON.stringify(capturedExecutionRecord, null, 2);
        console.log('✅ JSON serialization successful');
        console.log('📄 Serialized size:', serialized.length, 'characters');
        
        // Test if it can be deserialized
        const deserialized = JSON.parse(serialized);
        console.log('✅ JSON deserialization successful');
        
      } catch (error) {
        console.error('❌ JSON serialization failed:', error.message);
        
        // Try to identify the problematic field
        console.log('🔍 Trying to identify problematic field...');
        const fields = Object.keys(capturedExecutionRecord);
        for (const field of fields) {
          try {
            JSON.stringify(capturedExecutionRecord[field]);
            console.log(`✅ Field '${field}' serializes successfully`);
          } catch (fieldError) {
            console.error(`❌ Field '${field}' fails to serialize:`, fieldError.message);
          }
        }
      }
      
      // Show the structure of the execution record
      console.log('📋 Execution record structure:');
      console.log('- workflowId:', capturedExecutionRecord.workflowId);
      console.log('- type:', capturedExecutionRecord.type);
      console.log('- status:', capturedExecutionRecord.status);
      console.log('- timestamp:', capturedExecutionRecord.timestamp);
      console.log('- duration:', capturedExecutionRecord.duration);
      console.log('- has dataAnalysis:', !!capturedExecutionRecord.dataAnalysis);
      console.log('- has cmoPriorities:', !!capturedExecutionRecord.cmoPriorities);
      console.log('- has agentResults:', !!capturedExecutionRecord.agentResults);
      console.log('- agentResults keys:', capturedExecutionRecord.agentResults ? Object.keys(capturedExecutionRecord.agentResults) : 'null');
      
    } else {
      console.log('❌ No execution record was captured');
    }
    
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Error testing actual execution record:', error);
    console.error('Stack:', error.stack);
  }
}

testActualExecutionRecord(); 