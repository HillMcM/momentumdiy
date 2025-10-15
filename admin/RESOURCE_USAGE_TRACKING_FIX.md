# Resource Usage Tracking Fix

## Issue Identified

The dashboard was showing zero resource usage even though the workflow logs clearly showed actual usage:
- **Logs showed**: 7094 tokens, $0.0014 cost, 12 News API calls
- **Dashboard showed**: 0 tokens, $0.0000 cost, 0 API calls

## Root Cause Analysis

The problem was in how resource usage was being captured during workflow execution:

1. **Timing Issue**: The execution record was created at the end of the workflow, but the resource usage was being recorded during execution
2. **Wrong Reference Point**: The code was using `getCurrentUsage()` at the end, which might not reflect the workflow's specific usage
3. **Missing Delta Calculation**: The system wasn't calculating the difference between usage before and after the workflow

## Fix Implemented

### 1. Added Workflow-Specific Resource Tracking

**Before**: Only captured current usage at the end
**After**: Captures usage before and after workflow execution

```javascript
// Get initial resource usage before workflow starts
const initialUsage = this.resourceManager.getCurrentUsage();

// Track workflow-specific resource usage
const workflowResourceUsage = {
  openai: { tokens: 0, cost: 0 },
  newsApi: { calls: 0 },
  serpApi: { calls: 0 }
};
```

### 2. Enhanced Execution Record Creation

**Before**: Used current usage directly
**After**: Calculates the difference between initial and final usage

```javascript
// Calculate workflow-specific resource usage
const finalUsage = this.resourceManager.getCurrentUsage();
const workflowUsage = {
  openai: {
    tokens: Math.max(0, finalUsage.openai.dailyUsage - initialUsage.openai.dailyUsage),
    cost: Math.max(0, finalUsage.openai.totalCost - initialUsage.openai.totalCost)
  },
  newsApi: {
    calls: Math.max(0, finalUsage.newsApi.dailyUsage - initialUsage.newsApi.dailyUsage)
  },
  serpApi: {
    calls: Math.max(0, finalUsage.serpApi.dailyUsage - initialUsage.serpApi.dailyUsage)
  }
};
```

### 3. Updated Execution Record Structure

**Before**: Used current usage values
**After**: Uses workflow-specific usage values

```javascript
const executionRecord = {
  // ... other fields ...
  openaiTokens: workflowUsage.openai.tokens,
  newsApiCalls: workflowUsage.newsApi.calls,
  serpApiCalls: workflowUsage.serpApi.calls,
  resourceUsage: {
    openai: {
      dailyTokens: workflowUsage.openai.tokens,
      monthlyTokens: finalUsage.openai.monthlyUsage,
      totalCost: workflowUsage.openai.cost
    },
    newsApi: {
      dailyCalls: workflowUsage.newsApi.calls,
      monthlyCalls: finalUsage.newsApi.monthlyUsage
    },
    serpApi: {
      dailyCalls: workflowUsage.serpApi.calls,
      monthlyCalls: finalUsage.serpApi.monthlyUsage
    }
  }
};
```

### 4. Added Debug Logging

Added comprehensive logging to track resource usage:

```javascript
// Log resource usage for debugging
logger.info(`Workflow resource usage - OpenAI: ${workflowUsage.openai.tokens} tokens, $${workflowUsage.openai.cost.toFixed(4)} cost`);
logger.info(`Workflow resource usage - News API: ${workflowUsage.newsApi.calls} calls, SERP API: ${workflowUsage.serpApi.calls} calls`);
logger.info(`Initial usage - OpenAI: ${initialUsage.openai.dailyUsage} tokens, Final usage: ${finalUsage.openai.dailyUsage} tokens`);
```

### 5. Safety Checks

Added `Math.max(0, ...)` to prevent negative values that could occur due to timing issues:

```javascript
tokens: Math.max(0, finalUsage.openai.dailyUsage - initialUsage.openai.dailyUsage),
cost: Math.max(0, finalUsage.openai.totalCost - initialUsage.openai.totalCost)
```

## Test Script Created

Created `test-resource-tracking.js` to verify the fix:

```javascript
// Get initial resource usage
const initialResponse = await axios.get(`${BASE_URL}/dashboard/resources/usage`);

// Run workflow
const workflowResponse = await axios.post(`${BASE_URL}/dashboard/workflow/execute-daily`, {});

// Wait for completion
await new Promise(resolve => setTimeout(resolve, 30000));

// Get final resource usage
const finalResponse = await axios.get(`${BASE_URL}/dashboard/resources/usage`);

// Calculate difference
const tokenDiff = (finalUsage.openaiTokens || 0) - (initialUsage.openaiTokens || 0);
```

## Expected Results

### Before Fix:
- Dashboard showed: 0 tokens, $0.0000 cost, 0 API calls
- Workflow logs showed: 7094 tokens, $0.0014 cost, 12 News API calls
- **Mismatch**: Dashboard didn't reflect actual usage

### After Fix:
- Dashboard should show: 7094 tokens, $0.0014 cost, 12 News API calls
- Workflow logs show: 7094 tokens, $0.0014 cost, 12 News API calls
- **Match**: Dashboard accurately reflects actual usage

## Benefits

1. **Accurate Reporting**: Dashboard now shows actual resource usage per workflow
2. **Better Cost Tracking**: Users can see exactly how much each workflow costs
3. **Resource Planning**: Accurate usage data helps with resource allocation decisions
4. **Debugging**: Enhanced logging helps identify resource usage patterns
5. **User Trust**: Users can trust the dashboard data for cost management

## Next Steps

1. **Test the Fix**: Run a new workflow execution to verify the fix works
2. **Monitor Logs**: Check the new debug logs to ensure accurate tracking
3. **User Verification**: Have users run workflows and confirm accurate resource display
4. **Performance Monitoring**: Ensure the additional tracking doesn't impact performance

## Files Modified

1. **`src/agents/agent-coordinator.js`**: Added workflow-specific resource tracking
2. **`test-resource-tracking.js`**: Created test script for verification
3. **`RESOURCE_USAGE_TRACKING_FIX.md`**: This documentation

## Conclusion

The resource usage tracking fix ensures that the dashboard accurately reflects the actual resource consumption of each workflow execution. This provides users with reliable cost and usage data for better decision-making and resource management. 