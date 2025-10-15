const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function checkWorkflowStatus() {
    console.log('🔍 Checking Workflow Status...\n');

    try {
        // Check if workflow is running
        console.log('📋 Checking if workflow is currently running...');
        try {
            const workflowResponse = await axios.post(`${BASE_URL}/dashboard/workflow/execute-daily`, {});
            console.log('✅ Workflow started successfully');
            console.log(`   Workflow ID: ${workflowResponse.data.workflowId}`);
        } catch (error) {
            if (error.response && error.response.status === 429) {
                console.log('⚠️ Workflow already running');
                console.log(`   Message: ${error.response.data.message}`);
            } else {
                console.log('❌ Error starting workflow:', error.message);
            }
        }
        console.log('');

        // Check agent manager status
        console.log('🤖 Checking agent manager status...');
        try {
            const agentsResponse = await axios.get(`${BASE_URL}/agents/status`);
            const agents = agentsResponse.data;
            console.log(`   Active Agents: ${agents.activeAgents}`);
            console.log(`   Total Agents: ${agents.totalAgents}`);
            console.log('   Agent Details:');
            agents.agents.forEach(agent => {
                console.log(`     - ${agent.name}: ${agent.status} (Last Activity: ${agent.lastActivity || 'Unknown'})`);
            });
        } catch (error) {
            console.log('❌ Error checking agents:', error.message);
        }
        console.log('');

        // Check resource usage
        console.log('💾 Checking resource usage...');
        try {
            const resourcesResponse = await axios.get(`${BASE_URL}/resources/usage`);
            const resources = resourcesResponse.data;
            console.log(`   OpenAI Cost: $${resources.openaiCost}`);
            console.log(`   News API Calls: ${resources.newsApiCalls}`);
            console.log(`   SERP API Calls: ${resources.serpApiCalls}`);
            console.log(`   Monthly Budget: $${resources.monthlyBudget}`);
            console.log(`   Budget Remaining: $${resources.budgetRemaining}`);
        } catch (error) {
            console.log('❌ Error checking resources:', error.message);
        }
        console.log('');

        // Check system health
        console.log('🏥 Checking system health...');
        try {
            const healthResponse = await axios.get(`${BASE_URL}/dashboard/status`);
            const health = healthResponse.data;
            console.log(`   System: ${health.system}`);
            console.log(`   Agents: ${health.agents}`);
            console.log(`   Database: ${health.database}`);
            console.log(`   External APIs: ${health.externalApis}`);
            console.log(`   Agent Count: ${health.agentCount}`);
            
            if (health.agentStatuses) {
                console.log('   Agent Statuses:');
                Object.entries(health.agentStatuses).forEach(([agentId, status]) => {
                    console.log(`     - ${agentId}: ${status.status || 'unknown'}`);
                });
            }
        } catch (error) {
            console.log('❌ Error checking health:', error.message);
        }

    } catch (error) {
        console.log('❌ Status check failed:', error.message);
    }
}

// Run the status check
checkWorkflowStatus().catch(console.error); 