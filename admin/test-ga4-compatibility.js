require('dotenv').config();
const apiClients = require('./src/utils/api-clients');

async function testGA4Compatibility() {
  console.log('🧪 Testing GA4 Metric/Dimension Compatibility...\n');
  
  try {
    const gaClient = apiClients.googleAnalyticsClient();
    console.log('✅ GA Client initialized\n');
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    // Test 1: Basic metrics only (no dimensions)
    console.log('1. Testing basic metrics only...');
    try {
      const basicData = await gaClient.getAnalyticsData(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        ['sessions', 'totalUsers', 'screenPageViews'],
        []
      );
      console.log('✅ Basic metrics successful');
      console.log('📊 Data:', JSON.stringify(basicData, null, 2));
    } catch (error) {
      console.log('❌ Basic metrics failed:', error.message);
    }
    
    // Test 2: Add bounceRate
    console.log('\n2. Testing with bounceRate...');
    try {
      const bounceData = await gaClient.getAnalyticsData(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        ['sessions', 'totalUsers', 'screenPageViews', 'bounceRate'],
        []
      );
      console.log('✅ BounceRate successful');
    } catch (error) {
      console.log('❌ BounceRate failed:', error.message);
    }
    
    // Test 3: Add averageSessionDuration
    console.log('\n3. Testing with averageSessionDuration...');
    try {
      const durationData = await gaClient.getAnalyticsData(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        ['sessions', 'totalUsers', 'screenPageViews', 'bounceRate', 'averageSessionDuration'],
        []
      );
      console.log('✅ AverageSessionDuration successful');
    } catch (error) {
      console.log('❌ AverageSessionDuration failed:', error.message);
    }
    
    // Test 4: Add date dimension
    console.log('\n4. Testing with date dimension...');
    try {
      const dateData = await gaClient.getAnalyticsData(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        ['sessions', 'totalUsers', 'screenPageViews', 'bounceRate', 'averageSessionDuration'],
        ['date']
      );
      console.log('✅ Date dimension successful');
    } catch (error) {
      console.log('❌ Date dimension failed:', error.message);
    }
    
    // Test 5: Add pagePath dimension
    console.log('\n5. Testing with pagePath dimension...');
    try {
      const pageData = await gaClient.getAnalyticsData(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        ['sessions', 'totalUsers', 'screenPageViews', 'bounceRate', 'averageSessionDuration'],
        ['date', 'pagePath']
      );
      console.log('✅ PagePath dimension successful');
    } catch (error) {
      console.log('❌ PagePath dimension failed:', error.message);
    }
    
    // Test 6: Add source dimension
    console.log('\n6. Testing with source dimension...');
    try {
      const sourceData = await gaClient.getAnalyticsData(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        ['sessions', 'totalUsers', 'screenPageViews', 'bounceRate', 'averageSessionDuration'],
        ['date', 'pagePath', 'source']
      );
      console.log('✅ Source dimension successful');
    } catch (error) {
      console.log('❌ Source dimension failed:', error.message);
    }
    
    // Test 7: Add deviceCategory dimension
    console.log('\n7. Testing with deviceCategory dimension...');
    try {
      const deviceData = await gaClient.getAnalyticsData(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        ['sessions', 'totalUsers', 'screenPageViews', 'bounceRate', 'averageSessionDuration'],
        ['date', 'pagePath', 'source', 'deviceCategory']
      );
      console.log('✅ DeviceCategory dimension successful');
    } catch (error) {
      console.log('❌ DeviceCategory dimension failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing GA4 compatibility:', error.message);
  }
}

testGA4Compatibility(); 