// Test script to verify phase update on production backend
const testProductionPhaseUpdate = async () => {
  const testData = {
    slug: "local-foot-traffic",
    title: "Increase Local Foot Traffic",
    description: "Ready to boost your local foot traffic? This 12-week plan will guide you through practical steps to get more people through your door.",
    industry_tags: [],
    duration_weeks: 12,
    phases: [
      {
        id: "1",
        title: "Phase 1: Foundation",
        description: "Building your strategy foundation",
        startWeek: 1,
        endWeek: 3,
        color: "#EF8E81"
      },
      {
        id: "2", 
        title: "Phase 2: Implementation",
        description: "Putting strategies into action",
        startWeek: 4,
        endWeek: 6,
        color: "#D4AF37"
      },
      {
        id: "3",
        title: "Phase 3: Growth", 
        description: "Scaling and expanding your reach",
        startWeek: 7,
        endWeek: 9,
        color: "#8B5CF6"
      },
      {
        id: "4",
        title: "Phase 4: Optimization",
        description: "Refining and optimizing performance", 
        startWeek: 10,
        endWeek: 12,
        color: "#10B981"
      }
    ]
  };

  try {
    console.log('🧪 Testing production phase update...');
    console.log('📊 Test data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('https://momentumdiy-backend.onrender.com/api/admin/tracks/definitions/39e8bef9-f453-49a2-b33e-dfe0a82df0bd', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
        // Note: No auth token for this test - will likely fail with auth error
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('📊 Response status:', response.status);
    console.log('📊 Response data:', result);
    
    if (response.ok) {
      console.log('✅ Production phase update test passed!');
    } else {
      console.log('❌ Production phase update test failed:', result);
      
      // Check if it's an auth error vs other error
      if (result.error && result.error.includes('auth')) {
        console.log('🔐 This is expected - auth token required for production');
      } else {
        console.log('🚨 This is a real error that needs investigation');
      }
    }
  } catch (error) {
    console.error('❌ Test error:', error);
  }
};

// Run the test
testProductionPhaseUpdate();
