const SocialContentAgent = require('./src/agents/social-content-agent');

async function testDashboardSocial() {
    try {
        console.log('🧪 Testing Social Content for Dashboard...\n');
        
        const agent = new SocialContentAgent();
        
        // Test multi-platform campaign creation
        console.log('📋 Creating Multi-Platform Campaign...');
        
        const testInput = {
            campaignName: 'Dashboard Test Campaign',
            content: 'What if marketing overwhelm was actually just one focused quarterly goal? Most small business owners feel overwhelmed by marketing because they try to do everything at once. But what if you could transform that overwhelm into clarity with just one focused goal per quarter?',
            platforms: ['facebook', 'instagram']
        };
        
        const campaignResult = await agent.createMultiPlatformCampaign(testInput);
        
        console.log('✅ Campaign Result:');
        console.log('Platforms:', Object.keys(campaignResult.platforms || {}));
        
        // Check each platform for images
        for (const [platform, data] of Object.entries(campaignResult.platforms || {})) {
            console.log(`\n📱 ${platform.toUpperCase()}:`);
            console.log('Has image:', !!data.image);
            if (data.image) {
                console.log('Image URL:', data.image.url);
                console.log('Image size:', data.image.size);
                console.log('Image generated at:', data.image.generatedAt);
            }
            console.log('Image generation status:', data.imageGenerationStatus);
        }
        
        // Now let's check the dashboard API
        console.log('\n🌐 Checking Dashboard API...');
        
        // Wait a moment for the data to be saved
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const dashboardResponse = await fetch('http://localhost:3000/api/dashboard/activity');
        const dashboardData = await dashboardResponse.json();
        
        console.log('Dashboard activities count:', dashboardData.activities?.length || 0);
        
        // Look for social content agent activities
        const socialActivities = dashboardData.activities?.filter(activity => 
            activity.agentId === 'social-content-agent'
        ) || [];
        
        console.log('Social content agent activities:', socialActivities.length);
        
        if (socialActivities.length > 0) {
            const latestActivity = socialActivities[0];
            console.log('Latest social activity:', {
                agentId: latestActivity.agentId,
                description: latestActivity.description,
                timestamp: latestActivity.timestamp
            });
            
            if (latestActivity.result?.platforms) {
                console.log('\n📊 Platform data in dashboard:');
                for (const [platform, data] of Object.entries(latestActivity.result.platforms)) {
                    console.log(`\n📱 ${platform.toUpperCase()}:`);
                    console.log('Has image:', !!data.image);
                    if (data.image) {
                        console.log('Image URL:', data.image.url);
                        console.log('Image structure:', Object.keys(data.image));
                    }
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Test error:', error);
    }
}

// Run the test
testDashboardSocial().then(() => {
    console.log('\n🏁 Dashboard Social Test completed');
    process.exit(0);
}).catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
}); 