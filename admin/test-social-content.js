const SocialContentAgent = require('./src/agents/social-content-agent');

async function testSocialContentAgent() {
    try {
        console.log('🧪 Testing Social Content Agent...');
        
        const agent = new SocialContentAgent();
        
        // Test basic functionality
        console.log('\n📋 Agent Info:');
        console.log(agent.getInfo());
        
        console.log('\n🔧 Capabilities:');
        console.log(agent.getCapabilities());
        
        // Test multi-platform campaign creation
        console.log('\n🚀 Testing Multi-Platform Campaign...');
        
        const testInput = {
            campaignName: 'Marketing Clarity Test',
            content: 'What if marketing overwhelm was actually just one focused quarterly goal? Most marketing tools are built for marketers. Not for busy small business owners. MomentumDIY is different. It\'s a marketing clarity platform. Single quarterly goal system. Built to bring focus—not create more overwhelm.',
            platforms: ['facebook', 'instagram', 'linkedin', 'x'],
            hashtags: ['#MarketingClarity', '#SmallBusiness', '#Focus'],
            callToAction: 'Ready to get started?'
        };
        
        const result = await agent.createMultiPlatformCampaign(testInput);
        
        console.log('\n✅ Campaign Result:');
        console.log(JSON.stringify(result, null, 2));
        
        // Check each platform for image generation
        console.log('\n🖼️ Image Generation Status:');
        Object.keys(result.platforms).forEach(platform => {
            const platformData = result.platforms[platform];
            console.log(`${platform}: ${platformData.image ? '✅ Image generated' : '❌ No image'} (Status: ${platformData.imageGenerationStatus})`);
            
            if (platformData.image) {
                console.log(`  - URL: ${platformData.image.url}`);
                console.log(`  - Size: ${platformData.image.size}`);
            }
        });
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Run the test
testSocialContentAgent(); 