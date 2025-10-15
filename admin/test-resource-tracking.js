const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testResourceTracking() {
    console.log('🧪 Testing Resource Usage Tracking...\n');

    try {
        // Get initial resource usage
        console.log('📊 Getting initial resource usage...');
        const initialResponse = await axios.get(`${BASE_URL}/dashboard/resources/usage`);
        const initialUsage = initialResponse.data;
        console.log(`Initial OpenAI tokens: ${initialUsage.openaiTokens || 0}`);
        console.log(`Initial News API calls: ${initialUsage.newsApiCalls || 0}`);
        console.log(`Initial SERP API calls: ${initialUsage.serpApiCalls || 0}`);
        console.log('');

        // Run a workflow
        console.log('🚀 Starting workflow execution...');
        const workflowResponse = await axios.post(`${BASE_URL}/dashboard/workflow/execute-daily`, {});
        
        if (workflowResponse.status === 200) {
            console.log('✅ Workflow execution started successfully');
            console.log(`Workflow ID: ${workflowResponse.data.workflowId || 'Unknown'}`);
            console.log('');

            // Wait for workflow to complete (give it some time)
            console.log('⏳ Waiting for workflow to complete...');
            await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds

            // Get final resource usage
            console.log('📊 Getting final resource usage...');
            const finalResponse = await axios.get(`${BASE_URL}/dashboard/resources/usage`);
            const finalUsage = finalResponse.data;
            console.log(`Final OpenAI tokens: ${finalUsage.openaiTokens || 0}`);
            console.log(`Final News API calls: ${finalUsage.newsApiCalls || 0}`);
            console.log(`Final SERP API calls: ${finalUsage.serpApiCalls || 0}`);
            console.log('');

            // Calculate difference
            const tokenDiff = (finalUsage.openaiTokens || 0) - (initialUsage.openaiTokens || 0);
            const newsDiff = (finalUsage.newsApiCalls || 0) - (initialUsage.newsApiCalls || 0);
            const serpDiff = (finalUsage.serpApiCalls || 0) - (initialUsage.serpApiCalls || 0);

            console.log('📈 Resource Usage Difference:');
            console.log(`OpenAI tokens used: ${tokenDiff}`);
            console.log(`News API calls used: ${newsDiff}`);
            console.log(`SERP API calls used: ${serpDiff}`);
            console.log('');

            // Get the latest workflow execution
            console.log('📋 Getting latest workflow execution...');
            const historyResponse = await axios.get(`${BASE_URL}/dashboard/workflow/execution-history`);
            const latestWorkflow = historyResponse.data[0];

            if (latestWorkflow) {
                console.log('📊 Latest Workflow Resource Usage:');
                console.log(`Workflow ID: ${latestWorkflow.id}`);
                console.log(`OpenAI tokens: ${latestWorkflow.openaiTokens || 0}`);
                console.log(`News API calls: ${latestWorkflow.newsApiCalls || 0}`);
                console.log(`SERP API calls: ${latestWorkflow.serpApiCalls || 0}`);
                
                if (latestWorkflow.resourceUsage) {
                    console.log('📦 Resource Usage Object:');
                    console.log(JSON.stringify(latestWorkflow.resourceUsage, null, 2));
                } else {
                    console.log('❌ No resourceUsage object found');
                }
            } else {
                console.log('❌ No workflow history found');
            }

        } else {
            console.log(`❌ Workflow execution failed: HTTP ${workflowResponse.status}`);
        }

    } catch (error) {
        if (error.response) {
            console.log(`❌ Error: ${error.response.status} - ${error.response.data.error || error.message}`);
        } else {
            console.log(`❌ Error: ${error.message}`);
        }
    }
}

// Run the test
testResourceTracking().catch(console.error); 