const MarketResearcher = require('./src/agents/market-researcher');

async function testMarketResearcherCache() {
  try {
    console.log('🧪 Testing Market Researcher Cache Access...');
    
    const marketResearcher = new MarketResearcher();
    
    // Test research database access
    console.log('📊 Checking research database...');
    const researchStats = marketResearcher.researchDatabase.getDatabaseStats();
    console.log('Research stats:', researchStats);
    
    // Test if research is fresh
    const isFresh = marketResearcher.researchDatabase.isResearchFresh();
    console.log('Is research fresh:', isFresh);
    
    // Test getting all data
    console.log('📋 Getting all data...');
    const allData = marketResearcher.researchDatabase.getAllData();
    console.log('All data keys:', Object.keys(allData));
    console.log('Opportunities count:', allData.opportunities ? allData.opportunities.length : 'undefined');
    console.log('Market trends count:', allData.marketTrends ? allData.marketTrends.length : 'undefined');
    
    // Test the generateDataDrivenTopic method
    console.log('🎯 Testing generateDataDrivenTopic...');
    const topic = marketResearcher.generateDataDrivenTopic(null);
    console.log('Generated topic:', topic);
    
    console.log('✅ Market Researcher cache test completed successfully');
    
  } catch (error) {
    console.error('❌ Error testing Market Researcher cache:', error);
  }
}

testMarketResearcherCache(); 