require('dotenv').config();
const DataAnalystAgent = require('./src/agents/data-analyst-agent');

async function testDataAnalyst() {
  console.log('🧪 Testing Data Analyst Agent directly...\n');
  
  try {
    // Create Data Analyst instance
    console.log('1. Creating Data Analyst instance...');
    const dataAnalyst = new DataAnalystAgent();
    console.log('✅ Data Analyst created successfully\n');
    
    // Wait a bit for API data to load
    console.log('2. Waiting for API data to load...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('✅ Waited for API data loading\n');
    
    // Check if Wix blog analytics were loaded
    console.log('3. Checking Wix blog analytics...');
    if (dataAnalyst.dataSources.wixBlogAnalytics) {
      console.log('✅ Wix blog analytics found in data sources');
      console.log('📊 Wix Blog Analytics Data:');
      console.log(JSON.stringify(dataAnalyst.dataSources.wixBlogAnalytics, null, 2));
    } else {
      console.log('❌ Wix blog analytics not found in data sources');
    }
    
    // Test generateActualBusinessInsights
    console.log('\n4. Testing generateActualBusinessInsights...');
    const insights = await dataAnalyst.generateActualBusinessInsights();
    console.log('✅ Insights generated successfully');
    
    // Check website analytics in insights
    if (insights.data && insights.data.currentMetrics) {
      console.log('📊 Website Analytics in Insights:');
      console.log(JSON.stringify(insights.data.currentMetrics, null, 2));
    } else {
      console.log('❌ Website analytics not found in insights');
    }
    
    // Check blog analytics in insights
    if (insights.data && insights.data.contentMetrics && insights.data.contentMetrics.blogAnalytics) {
      console.log('📊 Blog Analytics in Insights:');
      console.log(JSON.stringify(insights.data.contentMetrics.blogAnalytics, null, 2));
    } else {
      console.log('❌ Blog analytics not found in insights');
    }
    
  } catch (error) {
    console.error('❌ Error testing Data Analyst:', error.message);
    console.error('Full error:', error);
  }
}

testDataAnalyst(); 