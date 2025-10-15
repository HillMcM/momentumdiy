const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function investigateWorkflow() {
    console.log('🔍 Investigating Workflow Execution Issues...\n');

    try {
        // Step 1: Check current execution history
        console.log('📋 Step 1: Checking current execution history...');
        const historyResponse = await axios.get(`${BASE_URL}/dashboard/workflow/execution-history`);
        const history = historyResponse.data;
        console.log(`✅ Current executions: ${history.length}`);
        
        if (history.length > 0) {
            const latest = history[0];
            console.log(`   Latest execution ID: ${latest.id}`);
            console.log(`   Latest execution time: ${latest.timestamp}`);
            console.log(`   Latest execution status: ${latest.status}`);
            console.log(`   Agent Results: ${latest.agentResults ? 'Present' : 'Null'}`);
            console.log(`   Resource Usage: ${latest.resourceUsage ? 'Present' : 'Null'}`);
        }
        console.log('');

        // Step 2: Check if workflow is currently running
        console.log('🔄 Step 2: Checking if workflow is currently running...');
        try {
            const workflowResponse = await axios.post(`${BASE_URL}/dashboard/workflow/execute-daily`, {});
            console.log('✅ Workflow started successfully');
            console.log(`   Workflow ID: ${workflowResponse.data.workflowId}`);
            console.log('');
        } catch (error) {
            if (error.response && error.response.status === 429) {
                console.log('⚠️ Workflow already running');
                console.log(`   Message: ${error.response.data.message}`);
                console.log('');
            } else {
                console.log('❌ Error starting workflow:', error.message);
                return;
            }
        }

        // Step 3: Monitor execution history for changes
        console.log('⏳ Step 3: Monitoring execution history for changes...');
        let initialCount = history.length;
        let attempts = 0;
        const maxAttempts = 30; // 5 minutes (30 * 10 seconds)
        
        while (attempts < maxAttempts) {
            attempts++;
            console.log(`   Attempt ${attempts}/${maxAttempts}: Checking for new executions...`);
            
            try {
                const newHistoryResponse = await axios.get(`${BASE_URL}/dashboard/workflow/execution-history`);
                const newHistory = newHistoryResponse.data;
                
                if (newHistory.length > initialCount) {
                    console.log('✅ New execution detected!');
                    const newExecution = newHistory[0];
                    console.log(`   New execution ID: ${newExecution.id}`);
                    console.log(`   New execution status: ${newExecution.status}`);
                    console.log(`   New execution time: ${newExecution.timestamp}`);
                    console.log(`   Agent Results: ${newExecution.agentResults ? 'Present' : 'Null'}`);
                    console.log(`   Resource Usage: ${newExecution.resourceUsage ? 'Present' : 'Null'}`);
                    
                    if (newExecution.agentResults) {
                        console.log('   Agent Results Keys:', Object.keys(newExecution.agentResults));
                    }
                    
                    if (newExecution.resourceUsage) {
                        console.log('   Resource Usage Keys:', Object.keys(newExecution.resourceUsage));
                    }
                    
                    console.log('');
                    console.log('🔍 Full new execution record:');
                    console.log(JSON.stringify(newExecution, null, 2));
                    return;
                } else {
                    console.log(`   No new executions yet (${newHistory.length} total)`);
                }
            } catch (error) {
                console.log(`   Error checking history: ${error.message}`);
            }
            
            // Wait 10 seconds before next check
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
        
        console.log('❌ No new execution detected after 5 minutes');
        console.log('   This suggests the workflow is hanging or failing silently');
        console.log('');

        // Step 4: Check system status after timeout
        console.log('📊 Step 4: Checking system status after timeout...');
        try {
            const statusResponse = await axios.get(`${BASE_URL}/dashboard/status`);
            const status = statusResponse.data;
            console.log(`   System: ${status.system}`);
            console.log(`   Agents: ${status.agents}`);
            console.log(`   External APIs: ${status.externalApis}`);
            console.log(`   Agent Count: ${status.agentCount}`);
        } catch (error) {
            console.log(`   Error checking status: ${error.message}`);
        }

    } catch (error) {
        console.log('❌ Investigation failed:', error.message);
    }
}

// Run the investigation
investigateWorkflow().catch(console.error); 