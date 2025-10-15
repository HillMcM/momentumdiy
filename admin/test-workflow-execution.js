const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testWorkflowExecution() {
    console.log('🧪 Testing Workflow Execution and Agent Results...\n');

    try {
        // Get initial execution history
        console.log('📋 Getting initial execution history...');
        const initialHistoryResponse = await axios.get(`${BASE_URL}/dashboard/workflow/execution-history`);
        const initialHistory = initialHistoryResponse.data;
        console.log(`Initial history count: ${initialHistory.length}`);
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
            await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 60 seconds

            // Get final execution history
            console.log('📋 Getting final execution history...');
            const finalHistoryResponse = await axios.get(`${BASE_URL}/dashboard/workflow/execution-history`);
            const finalHistory = finalHistoryResponse.data;
            console.log(`Final history count: ${finalHistory.length}`);
            console.log('');

            // Compare the latest execution
            if (finalHistory.length > initialHistory.length) {
                const latestExecution = finalHistory[0];
                console.log('📊 Latest Workflow Execution Analysis:');
                console.log(`ID: ${latestExecution.id}`);
                console.log(`Status: ${latestExecution.status}`);
                console.log(`Timestamp: ${latestExecution.timestamp}`);
                console.log(`Duration: ${latestExecution.duration}ms`);
                console.log('');

                // Check agentResults
                console.log('🤖 Agent Results Analysis:');
                if (latestExecution.agentResults) {
                    console.log('✅ agentResults is present');
                    console.log('Agent Results Keys:', Object.keys(latestExecution.agentResults));
                    
                    if (latestExecution.agentResults.marketResearcher) {
                        console.log('✅ Market Researcher: Present');
                    } else {
                        console.log('❌ Market Researcher: Missing');
                    }
                    
                    if (latestExecution.agentResults.copywritingAgent) {
                        console.log('✅ Copywriting Agent: Present');
                    } else {
                        console.log('❌ Copywriting Agent: Missing');
                    }
                    
                    if (latestExecution.agentResults.socialContentAgent) {
                        console.log('✅ Social Content Agent: Present');
                    } else {
                        console.log('❌ Social Content Agent: Missing');
                    }
                    
                    if (latestExecution.agentResults.leadSalesAgent) {
                        console.log('✅ Lead & Sales Agent: Present');
                    } else {
                        console.log('❌ Lead & Sales Agent: Missing');
                    }
                } else {
                    console.log('❌ agentResults is null or missing');
                }
                console.log('');

                // Check resource usage
                console.log('💾 Resource Usage Analysis:');
                console.log(`OpenAI Tokens: ${latestExecution.openaiTokens || 0}`);
                console.log(`News API Calls: ${latestExecution.newsApiCalls || 0}`);
                console.log(`SERP API Calls: ${latestExecution.serpApiCalls || 0}`);
                
                if (latestExecution.resourceUsage) {
                    console.log('✅ resourceUsage object is present');
                    console.log('Resource Usage Keys:', Object.keys(latestExecution.resourceUsage));
                } else {
                    console.log('❌ resourceUsage object is missing');
                }
                console.log('');

                // Check other fields
                console.log('📋 Other Fields Analysis:');
                console.log(`Data Analysis: ${latestExecution.dataAnalysis ? 'Present' : 'Missing'}`);
                console.log(`CMO Priorities: ${latestExecution.cmoPriorities ? 'Present' : 'Missing'}`);
                console.log(`Content Assessment: ${latestExecution.contentAssessment ? 'Present' : 'Missing'}`);
                console.log(`Final Recommendations: ${latestExecution.finalRecommendations ? 'Present' : 'Missing'}`);
                console.log('');

                // Show the full execution record for debugging
                console.log('🔍 Full Execution Record:');
                console.log(JSON.stringify(latestExecution, null, 2));

            } else {
                console.log('❌ No new execution found in history');
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
testWorkflowExecution().catch(console.error); 