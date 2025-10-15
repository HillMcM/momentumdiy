const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testDashboardEndpoints() {
    console.log('🧪 Testing Dashboard Endpoints for Real Data...\n');

    const endpoints = [
        { name: 'Dashboard Overview', path: '/dashboard/overview' },
        { name: 'Agent Activity', path: '/dashboard/activity' },
        { name: 'Performance Metrics', path: '/dashboard/metrics' },
        { name: 'System Status', path: '/dashboard/status' },
        { name: 'Workflow History', path: '/dashboard/workflow/execution-history' },
        { name: 'Resource Usage', path: '/dashboard/resources/usage' }
    ];

    for (const endpoint of endpoints) {
        try {
            console.log(`📊 Testing ${endpoint.name}...`);
            const response = await axios.get(`${BASE_URL}${endpoint.path}`);
            
            if (response.status === 200) {
                const data = response.data;
                
                // Check if data looks real (not mock data)
                const isRealData = checkIfRealData(data, endpoint.name);
                
                console.log(`✅ ${endpoint.name}: ${isRealData ? 'REAL DATA' : 'MOCK/FALLBACK DATA'}`);
                
                // Show key data points
                if (endpoint.name === 'Dashboard Overview') {
                    console.log(`   - Today's Jobs: ${data.todayJobs || 0}`);
                    console.log(`   - Active Agents: ${data.activeAgents || 0}`);
                    console.log(`   - Total Executions: ${data.totalExecutions || 0}`);
                    console.log(`   - Content Created: ${data.contentCreated || 0}`);
                } else if (endpoint.name === 'Workflow History') {
                    console.log(`   - Total Workflows: ${Array.isArray(data) ? data.length : 0}`);
                    if (Array.isArray(data) && data.length > 0) {
                        console.log(`   - Latest Workflow: ${data[0].type || 'Unknown'} (${data[0].status || 'Unknown'})`);
                        console.log(`   - Latest Timestamp: ${data[0].timestamp || 'Unknown'}`);
                    }
                } else if (endpoint.name === 'Resource Usage') {
                    console.log(`   - OpenAI Cost: $${data.openaiCost || 0}`);
                    console.log(`   - News API Calls: ${data.newsApiCalls || 0}`);
                    console.log(`   - SERP API Calls: ${data.serpApiCalls || 0}`);
                }
            } else {
                console.log(`❌ ${endpoint.name}: HTTP ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ ${endpoint.name}: ${error.message}`);
        }
        console.log('');
    }

    console.log('🎯 Dashboard Test Summary:');
    console.log('- If you see "REAL DATA" for most endpoints, the dashboard is working correctly');
    console.log('- If you see "MOCK/FALLBACK DATA", the system may need workflow execution');
    console.log('- Run a workflow using the dashboard to generate real data');
}

function checkIfRealData(data, endpointName) {
    // Check for indicators of real vs mock data
    if (endpointName === 'Dashboard Overview') {
        // Real data should have actual execution counts and timestamps
        return data.totalExecutions > 0 || 
               (data.lastExecution && data.lastExecution !== 'null') ||
               data.todayJobs > 0;
    } else if (endpointName === 'Workflow History') {
        // Real data should have actual workflow records
        return Array.isArray(data) && data.length > 0 && 
               data.some(workflow => workflow.id && workflow.timestamp);
    } else if (endpointName === 'Resource Usage') {
        // Real data should have actual usage numbers
        return data.openaiCost > 0 || data.newsApiCalls > 0 || data.serpApiCalls > 0;
    } else if (endpointName === 'System Status') {
        // Real data should have actual agent counts and status
        return data.agentCount > 0 && data.system !== 'error';
    }
    
    // Default: assume it's real data if it has meaningful content
    return data && Object.keys(data).length > 0 && 
           !data.hasOwnProperty('TODO') && 
           !data.hasOwnProperty('mock');
}

// Test workflow execution
async function testWorkflowExecution() {
    console.log('\n🚀 Testing Workflow Execution...\n');
    
    try {
        console.log('📡 Starting workflow execution...');
        const response = await axios.post(`${BASE_URL}/dashboard/workflow/execute-daily`, {});
        
        if (response.status === 200) {
            const result = response.data;
            console.log('✅ Workflow execution started successfully');
            console.log(`   - Workflow ID: ${result.workflowId || 'Unknown'}`);
            console.log(`   - Message: ${result.message || 'No message'}`);
            console.log(`   - Success: ${result.success}`);
            
            if (result.success) {
                console.log('\n⏳ Workflow is now running...');
                console.log('   - Check the dashboard for real-time progress');
                console.log('   - Wait for completion to see real data');
            }
        } else {
            console.log(`❌ Workflow execution failed: HTTP ${response.status}`);
        }
    } catch (error) {
        if (error.response) {
            console.log(`❌ Workflow execution failed: ${error.response.status} - ${error.response.data.error || error.message}`);
        } else {
            console.log(`❌ Workflow execution failed: ${error.message}`);
        }
    }
}

// Main test function
async function runTests() {
    console.log('🎯 Dashboard Real Data Test Suite');
    console.log('=====================================\n');
    
    await testDashboardEndpoints();
    
    // Ask if user wants to test workflow execution
    console.log('Would you like to test workflow execution? (y/n)');
    console.log('Note: This will start a real workflow execution');
    
    // For automated testing, we'll skip the workflow execution test
    // Uncomment the line below to enable workflow testing
    // await testWorkflowExecution();
    
    console.log('\n✅ Test completed!');
    console.log('📊 Check the dashboard at http://localhost:3000/dashboard/ to see the results');
}

// Run the tests
runTests().catch(console.error); 