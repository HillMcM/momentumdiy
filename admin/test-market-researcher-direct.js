const MarketResearcher = require('./src/agents/market-researcher');

async function testMarketResearcherDirect() {
  try {
    console.log('🧪 Testing Market Researcher Direct Execution...');
    
    const marketResearcher = new MarketResearcher();
    
    // Test the main method directly
    console.log('📊 Testing findBrandOpportunitiesWithProgress...');
    
    const mockProgress = (update) => {
      console.log('Progress:', update.progress + '% - ' + update.step);
    };
    
    const result = await marketResearcher.findBrandOpportunitiesWithProgress(
      { timeframe: '7d', focusAreas: [] },
      mockProgress
    );
    
    console.log('✅ Market Researcher completed successfully!');
    console.log('Status:', result.status);
    console.log('Opportunities count:', result.opportunities ? result.opportunities.length : 'undefined');
    console.log('Market trends count:', result.marketTrends ? result.marketTrends.length : 'undefined');
    console.log('Competitor analysis count:', result.competitorAnalysis ? result.competitorAnalysis.length : 'undefined');
    
  } catch (error) {
    console.error('❌ Error testing Market Researcher:', error.message);
    console.error('Stack:', error.stack);
  }
}

testMarketResearcherDirect(); 