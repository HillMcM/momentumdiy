require('dotenv').config();
const apiClients = require('./src/utils/api-clients');

async function testWixBlogAPI() {
  console.log('🧪 Testing Wix Blog Analytics API...\n');
  
  // Check environment variables
  console.log('🔍 Checking environment variables:');
  console.log('WIX_SITE_ID:', process.env.WIX_SITE_ID);
  console.log('WIX_API_KEY:', process.env.WIX_API_KEY ? 'Set' : 'Not set');
  console.log('WIX_ACCESS_TOKEN:', process.env.WIX_ACCESS_TOKEN ? 'Set' : 'Not set');
  console.log('');
  
  try {
    // Test Wix client initialization
    console.log('1. Initializing Wix client...');
    const wixClient = apiClients.wixClient();
    console.log('✅ Wix client initialized successfully\n');
    
    // Test blog analytics
    console.log('2. Fetching blog analytics...');
    const blogAnalytics = await wixClient.getBlogAnalytics();
    console.log('✅ Blog analytics fetched successfully');
    console.log('📊 Blog Analytics Data:');
    console.log(JSON.stringify(blogAnalytics, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing Wix blog API:', error.message);
    console.error('Full error:', error);
  }
}

testWixBlogAPI(); 