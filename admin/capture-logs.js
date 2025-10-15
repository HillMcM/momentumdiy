const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function captureLogs() {
    console.log('📝 Capturing Server Logs...\n');

    try {
        // Start a workflow and capture the response
        console.log('🚀 Starting workflow execution...');
        const startTime = Date.now();
        
        const workflowResponse = await axios.post(`${BASE_URL}/dashboard/workflow/execute-daily`, {});
        console.log('✅ Workflow started:', workflowResponse.data);
        console.log('');

        // Monitor execution history for changes
        console.log('⏳ Monitoring execution history...');
        let attempts = 0;
        const maxAttempts = 20; // 3 minutes (20 * 9 seconds)
        
        while (attempts < maxAttempts) {
            attempts++;
            
            try {
                const historyResponse = await axios.get(`${BASE_URL}/dashboard/workflow/execution-history`);
                const history = historyResponse.data;
                const latest = history[0];
                
                console.log(`   Attempt ${attempts}/${maxAttempts}: ${latest.id} - ${latest.status} - ${latest.timestamp}`);
                
                if (latest.timestamp && new Date(latest.timestamp).getTime() > startTime) {
                    console.log('✅ New execution detected!');
                    console.log(`   ID: ${latest.id}`);
                    console.log(`   Status: ${latest.status}`);
                    console.log(`   Agent Results: ${latest.agentResults ? 'Present' : 'Null'}`);
                    console.log(`   Resource Usage: ${latest.resourceUsage ? 'Present' : 'Null'}`);
                    
                    if (latest.agentResults) {
                        console.log('   Agent Results Keys:', Object.keys(latest.agentResults));
                    }
                    
                    if (latest.resourceUsage) {
                        console.log('   Resource Usage Keys:', Object.keys(latest.resourceUsage));
                    }
                    
                    // Show the full execution record
                    console.log('\n🔍 Full Execution Record:');
                    console.log(JSON.stringify(latest, null, 2));
                    return;
                }
                
            } catch (error) {
                console.log(`   Error checking history: ${error.message}`);
            }
            
            // Wait 9 seconds before next check
            await new Promise(resolve => setTimeout(resolve, 9000));
        }
        
        console.log('❌ No new execution detected after 3 minutes');
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

// Run the log capture
captureLogs().catch(console.error); 