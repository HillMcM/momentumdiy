const DataAnalystAgent = require('./src/agents/data-analyst-agent');
const SocialPostingAgent = require('./src/agents/social-posting-agent');

async function testAgentInfo() {
    console.log('🧪 Testing Agent Info Methods...\n');

    try {
        // Test Data Analyst Agent
        console.log('📊 Testing Data Analyst Agent...');
        const dataAnalyst = new DataAnalystAgent();
        
        // Wait a moment for async initialization
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const dataAnalystInfo = dataAnalyst.getInfo();
        console.log('Data Analyst Info:', JSON.stringify(dataAnalystInfo, null, 2));
        console.log('');

        // Test Social Posting Agent
        console.log('📱 Testing Social Posting Agent...');
        const socialPosting = new SocialPostingAgent();
        const socialPostingInfo = socialPosting.getInfo();
        console.log('Social Posting Info:', JSON.stringify(socialPostingInfo, null, 2));
        console.log('');

        // Test if status is present
        console.log('✅ Status Check:');
        console.log(`Data Analyst status: ${dataAnalystInfo.status || 'MISSING'}`);
        console.log(`Social Posting status: ${socialPostingInfo.status || 'MISSING'}`);

    } catch (error) {
        console.error('❌ Error testing agent info:', error);
    }
}

testAgentInfo().catch(console.error); 