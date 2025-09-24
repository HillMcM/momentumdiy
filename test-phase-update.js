// Simple test script to verify phase update functionality
const testPhaseUpdate = async () => {
  const testData = {
    slug: "test-local-foot-traffic",
    title: "Test Local Foot Traffic",
    description: "Test description for phase update",
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
    console.log('🧪 Testing phase update with data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:3001/api/admin/tracks/definitions/39e8bef9-f453-49a2-b33e-dfe0a82df0bd', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // You'll need to replace this with a real token
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('📊 Response status:', response.status);
    console.log('📊 Response data:', result);
    
    if (response.ok) {
      console.log('✅ Phase update test passed!');
    } else {
      console.log('❌ Phase update test failed:', result);
    }
  } catch (error) {
    console.error('❌ Test error:', error);
  }
};

// Run the test
testPhaseUpdate();
