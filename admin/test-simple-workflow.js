const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testSimpleWorkflow() {
    console.log('🧪 Simple Workflow Test...\n');

    try {
        // Check current execution history
        console.log('📋 Current execution history...');
        const historyResponse = await axios.get(`${BASE_URL}/dashboard/workflow/execution-history`);
        const history = historyResponse.data;
        console.log(`Total executions: ${history.length}`);
        
        if (history.length > 0) {
            const latest = history[0];
            console.log('Latest execution:');
            console.log(`- ID: ${latest.id}`);
            console.log(`- Status: ${latest.status}`);
            console.log(`- Timestamp: ${latest.timestamp}`);
            console.log(`- Agent Results: ${latest.agentResults ? 'Present' : 'Null'}`);
            console.log(`- Resource Usage: ${latest.resourceUsage ? 'Present' : 'Null'}`);
        }
        console.log('');

        // Try to start a workflow
        console.log('🚀 Starting workflow...');
        try {
            const workflowResponse = await axios.post(`${BASE_URL}/dashboard/workflow/execute-daily`, {});
            console.log('✅ Workflow started:', workflowResponse.data);
        } catch (error) {
            if (error.response && error.response.status === 429) {
                console.log('⚠️ Workflow already running:', error.response.data.message);
            } else {
                console.log('❌ Error starting workflow:', error.message);
            }
        }

    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

testSimpleWorkflow().catch(console.error); 