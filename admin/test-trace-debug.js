const AgentManager = require('./src/agents/agent-manager');

async function testTraceDebug() {
    console.log('🔍 Testing trace data flow...\n');
    
    try {
        const agentManager = new AgentManager();
        
        // Wait for agents to initialize
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('📋 Testing Market Researcher trace data...');
        const marketResult = await agentManager.executeAgentTaskWithProgress(
            'market-researcher',
            'find_brand_opportunities',
            {
                timeframe: '7d',
                focusAreas: ['marketing clarity topics']
            }
        );
        
        console.log('✅ Market Researcher result received');
        console.log('Result keys:', Object.keys(marketResult));
        console.log('Has trace:', !!marketResult.trace);
        console.log('Trace entries:', marketResult.trace?.entries?.length || 0);
        
        if (marketResult.trace) {
            console.log('Sample trace entries:');
            marketResult.trace.entries.slice(0, 3).forEach((entry, index) => {
                console.log(`  ${index + 1}. [${entry.step}] ${entry.detail}`);
            });
        }
        
        console.log('\n📋 Testing Copywriting Agent trace data...');
        const copywritingResult = await agentManager.executeAgentTaskWithProgress(
            'copywriting-agent',
            'create-blog-post',
            {
                topic: 'Marketing Clarity for Small Business Owners',
                targetAudience: 'primary',
                length: 'medium',
                includeSEO: true,
                tone: 'authentic'
            }
        );
        
        console.log('✅ Copywriting Agent result received');
        console.log('Result keys:', Object.keys(copywritingResult));
        console.log('Has trace:', !!copywritingResult.trace);
        console.log('Trace entries:', copywritingResult.trace?.entries?.length || 0);
        
        if (copywritingResult.trace) {
            console.log('Sample trace entries:');
            copywritingResult.trace.entries.slice(0, 3).forEach((entry, index) => {
                console.log(`  ${index + 1}. [${entry.step}] ${entry.detail}`);
            });
        }
        
        console.log('\n📊 SUMMARY:');
        console.log('Market Researcher trace:', marketResult.trace ? '✅ PRESENT' : '❌ MISSING');
        console.log('Copywriting Agent trace:', copywritingResult.trace ? '✅ PRESENT' : '❌ MISSING');
        
    } catch (error) {
        console.error('❌ Error testing trace data:', error);
    }
}

testTraceDebug(); 