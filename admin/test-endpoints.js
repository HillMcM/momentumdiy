// Test script for Wix API endpoints
// Based on previous working patterns from api-clients.js

const WIX_SITE_URL = 'https://hillaryedenmcmullen.com'; // Use the non-www version as in previous code

async function testEndpoint(endpoint, name, urlPattern) {
  try {
    console.log(`\n🧪 Testing ${name}...`);
    console.log(`URL: ${urlPattern}`);
    
    const response = await fetch(urlPattern, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ ${name} Response:`, JSON.stringify(data, null, 2));
    
    // If we get data, let's examine the structure
    if (data.success && data.data && data.data.length > 0) {
      console.log(`📊 ${name} Sample Data Structure:`, JSON.stringify(data.data[0], null, 2));
    }
    
    return data;
  } catch (error) {
    console.error(`❌ ${name} Error:`, error.message);
    return null;
  }
}

async function testAllEndpoints() {
  console.log('🚀 Testing All Wix API Endpoints\n');
  console.log('=' .repeat(50));
  
  // Based on our previous working patterns, these should be the correct endpoints
           const endpoints = [
           { endpoint: 'blog_posts', name: 'Blog Posts' },
           { endpoint: 'forms', name: 'Forms' },
           { endpoint: 'contacts', name: 'Contacts' },
           { endpoint: 'pricing_plans', name: 'Pricing Plans' },
           { endpoint: 'test_connection', name: 'Connection Test' }
         ];
  
  const results = {};
  
  // Use the correct URL pattern from our previous working code
  const baseUrl = `${WIX_SITE_URL}/_functions/`;
  
  for (const { endpoint, name } of endpoints) {
    console.log(`\n🔍 Testing ${name}...`);
    
    const url = `${baseUrl}${endpoint}`;
    const result = await testEndpoint(endpoint, name, url);
    
    if (result && result.success) {
      console.log(`🎉 Found working URL for ${name}: ${url}`);
      results[name] = result;
    } else {
      console.log(`❌ No working URL found for ${name}`);
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('📋 SUMMARY:');
  console.log('=' .repeat(50));
  
  for (const [name, result] of Object.entries(results)) {
    if (result && result.success) {
      console.log(`✅ ${name}: SUCCESS (${result.totalCount || 0} items)`);
    } else {
      console.log(`❌ ${name}: FAILED`);
    }
  }
  
  return results;
}

// Run the tests
testAllEndpoints().then(results => {
  console.log('\n🎉 Testing complete!');
  console.log('\n💡 Next Steps:');
  console.log('1. Check the data structures above');
  console.log('2. Update the TypeScript types based on real data');
  console.log('3. Fix any remaining property access issues');
}); 