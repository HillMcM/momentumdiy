const SocialContentAgent = require('./src/agents/social-content-agent');

async function testDalle3() {
    try {
        console.log('🧪 Testing DALL-E 3 Image Generation...\n');
        
        const agent = new SocialContentAgent();
        
        // Test 1: Check if OpenAI is properly configured
        console.log('📋 Test 1: Checking OpenAI Configuration...');
        console.log('OpenAI API Key exists:', !!process.env.OPENAI_API_KEY);
        console.log('OpenAI API Key starts with:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'NOT SET');
        
        // Test 2: Test the generateBrandImageWithDalle method directly
        console.log('\n📋 Test 2: Testing generateBrandImageWithDalle method...');
        
        const testPrompt = 'Create a social media image for Facebook about marketing clarity for small business owners. The image should feature a coral octopus with bright yellow eyes on a deep navy background, representing MomentumDIY brand. Style: clean, graphic, minimalist cartoon style with bold outlines.';
        
        console.log('Prompt:', testPrompt);
        console.log('Attempting DALL-E 3 generation...');
        
        try {
            const result = await agent.generateBrandImageWithDalle(testPrompt, 'facebook');
            console.log('✅ DALL-E 3 Result:', JSON.stringify(result, null, 2));
        } catch (error) {
            console.log('❌ DALL-E 3 Error Details:');
            console.log('Error name:', error.name);
            console.log('Error message:', error.message);
            console.log('Error stack:', error.stack);
            
            if (error.response) {
                console.log('Response status:', error.response.status);
                console.log('Response data:', JSON.stringify(error.response.data, null, 2));
            }
        }
        
        // Test 3: Test the createFallbackImage method
        console.log('\n📋 Test 3: Testing Fallback Image Generation...');
        try {
            const fallbackResult = await agent.createFallbackImage('facebook', 'Marketing Clarity Test');
            console.log('✅ Fallback Image Result:', JSON.stringify(fallbackResult, null, 2));
        } catch (error) {
            console.log('❌ Fallback Image Error:', error.message);
        }
        
        // Test 4: Test the full multi-platform campaign with image generation
        console.log('\n📋 Test 4: Testing Full Multi-Platform Campaign...');
        
        const testInput = {
            campaignName: 'DALL-E 3 Test Campaign',
            content: 'What if marketing overwhelm was actually just one focused quarterly goal? Most small business owners feel overwhelmed by marketing because they try to do everything at once. But what if you could transform that overwhelm into clarity with just one focused goal per quarter?',
            platforms: ['facebook', 'instagram']
        };
        
        try {
            const campaignResult = await agent.createMultiPlatformCampaign(testInput);
            console.log('✅ Campaign Result Structure:');
            console.log('Platforms:', Object.keys(campaignResult.platforms || {}));
            
            // Check each platform for images
            for (const [platform, data] of Object.entries(campaignResult.platforms || {})) {
                console.log(`\n📱 ${platform.toUpperCase()}:`);
                console.log('Has image:', !!data.image);
                if (data.image) {
                    console.log('Image URL:', data.image.url || data.image);
                    console.log('Image type:', typeof data.image);
                }
            }
        } catch (error) {
            console.log('❌ Campaign Error:', error.message);
            console.log('Error stack:', error.stack);
        }
        
    } catch (error) {
        console.error('❌ Test script error:', error);
        console.error('Error stack:', error.stack);
    }
}

// Run the test
testDalle3().then(() => {
    console.log('\n🏁 DALL-E 3 Test completed');
    process.exit(0);
}).catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
}); 