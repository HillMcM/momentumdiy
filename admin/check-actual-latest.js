const fs = require('fs');

try {
  const data = JSON.parse(fs.readFileSync('data/coordinator-execution-history.json', 'utf8'));
  
  // Find the execution with the latest timestamp
  const latest = data.reduce((latest, current) => {
    const latestTime = new Date(latest.timestamp);
    const currentTime = new Date(current.timestamp);
    return currentTime > latestTime ? current : latest;
  });
  
  console.log('Actual latest workflow execution:');
  console.log('=====================================');
  console.log(`Timestamp: ${latest.timestamp}`);
  console.log(`Status: ${latest.status}`);
  console.log(`Duration: ${latest.duration}ms`);
  console.log(`Has agentResults: ${!!latest.agentResults}`);
  console.log(`Has dataAnalysis: ${!!latest.dataAnalysis}`);
  console.log(`Has cmoPriorities: ${!!latest.cmoPriorities}`);
  
  if (latest.agentResults) {
    console.log('\nAgent Results:');
    Object.keys(latest.agentResults).forEach(agent => {
      const result = latest.agentResults[agent];
      console.log(`- ${agent}: ${result ? 'present' : 'missing'}`);
    });
  }
  
  if (latest.workflowProgress) {
    console.log('\nWorkflow Progress (last 10 steps):');
    const recentSteps = latest.workflowProgress.slice(-10);
    recentSteps.forEach(step => {
      console.log(`- ${step.type}: ${step.agent || step.step || 'N/A'}`);
    });
  }
  
  console.log('\nResource Usage:');
  console.log(`- OpenAI tokens: ${latest.openaiTokens || 0}`);
  console.log(`- News API calls: ${latest.newsApiCalls || 0}`);
  console.log(`- SERP API calls: ${latest.serpApiCalls || 0}`);
  
} catch (error) {
  console.error('Error reading execution history:', error.message);
} 