const AgentManager = require('./src/agents/agent-manager');

async function testSocialDashboardProper() {
    try {
        console.log('🧪 Testing Social Content Agent via Agent Manager...\n');
        
        // Initialize agent manager
        const agentManager = new AgentManager();
        
        // Wait for initialization
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('📋 Agent Manager initialized');
        
        // Test social content agent via agent manager
        console.log('🚀 Executing Social Content Agent via Agent Manager...');
        
        const testInput = {
            campaignName: 'Dashboard Test Campaign',
            content: 'What if marketing overwhelm was actually just one focused quarterly goal? Most small business owners feel overwhelmed by marketing because they try to do everything at once. But what if you could transform that overwhelm into clarity with just one focused goal per quarter?',
            platforms: ['facebook', 'instagram']
        };
        
        // Execute via agent manager (this will save to execution history)
        const result = await agentManager.executeAgentTaskWithProgress(
            'social-content-agent',
            'create-multi-platform-campaign',
            testInput
        );
        
        console.log('✅ Social Content Agent executed via Agent Manager');
        console.log('Execution ID:', result.execution.id);
        console.log('Duration:', result.execution.duration + 'ms');
        
        // Check the result
        if (result.platforms) {
            console.log('\n📊 Platform Results:');
            for (const [platform, data] of Object.entries(result.platforms)) {
                console.log(`\n📱 ${platform.toUpperCase()}:`);
                console.log('Has image:', !!data.image);
                if (data.image) {
                    console.log('Image URL:', data.image.url ? 'Generated' : 'Not generated');
                    console.log('Image size:', data.image.size);
                    console.log('Image generated at:', data.image.generatedAt);
                }
                console.log('Image generation status:', data.imageGenerationStatus);
            }
        }
        
        // Wait a moment for the data to be saved
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check execution history
        console.log('\n📋 Checking Execution History...');
        const history = agentManager.getExecutionHistory('social-content-agent', 5);
        console.log('Social content agent executions in history:', history.length);
        
        if (history.length > 0) {
            const latestExecution = history[0];
            console.log('Latest execution:', {
                id: latestExecution.id,
                agentId: latestExecution.agentId,
                task: latestExecution.task,
                status: latestExecution.status,
                timestamp: latestExecution.timestamp
            });
            
            if (latestExecution.result && latestExecution.result.platforms) {
                console.log('\n📊 Platform data in execution history:');
                for (const [platform, data] of Object.entries(latestExecution.result.platforms)) {
                    console.log(`\n📱 ${platform.toUpperCase()}:`);
                    console.log('Has image:', !!data.image);
                    if (data.image) {
                        console.log('Image URL:', data.image.url ? 'Generated' : 'Not generated');
                        console.log('Image structure:', Object.keys(data.image));
                    }
                }
            }
        }
        
        // Now check the dashboard API
        console.log('\n🌐 Checking Dashboard API...');
        
        const dashboardResponse = await fetch('http://localhost:3000/api/dashboard/activity');
        const dashboardData = await dashboardResponse.json();
        
        console.log('Dashboard activities count:', dashboardData.activities?.length || 0);
        
        // Look for social content agent activities
        const socialActivities = dashboardData.activities?.filter(activity => 
            activity.agent === 'social-content-agent'
        ) || [];
        
        console.log('Social content agent activities in dashboard:', socialActivities.length);
        
        if (socialActivities.length > 0) {
            const latestActivity = socialActivities[0];
            console.log('Latest social activity in dashboard:', {
                id: latestActivity.id,
                agent: latestActivity.agent,
                action: latestActivity.action,
                description: latestActivity.description,
                timestamp: latestActivity.timestamp
            });
        }
        
        // Check if the execution history is properly formatted for dashboard
        console.log('\n🔍 Checking Dashboard Compatibility...');
        const coordinator = agentManager.getCoordinator();
        const coordinatorHistory = coordinator.getExecutionHistory();
        
        console.log('Coordinator execution history count:', coordinatorHistory.length);
        
        if (coordinatorHistory.length > 0) {
            const latestCoordinatorExecution = coordinatorHistory[0];
            console.log('Latest coordinator execution:', {
                id: latestCoordinatorExecution.id,
                type: latestCoordinatorExecution.type,
                status: latestCoordinatorExecution.status,
                timestamp: latestCoordinatorExecution.timestamp
            });
            
            // Check if social content data is in the expected format
            if (latestCoordinatorExecution.socialContent) {
                console.log('✅ Social content data found in coordinator execution');
                console.log('Platforms:', Object.keys(latestCoordinatorExecution.socialContent.platforms || {}));
            } else {
                console.log('❌ No social content data in coordinator execution');
            }
        }
        
    } catch (error) {
        console.error('❌ Test error:', error);
    }
}

// Run the test
testSocialDashboardProper().then(() => {
    console.log('\n🏁 Social Dashboard Test completed');
    process.exit(0);
}).catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
}); 