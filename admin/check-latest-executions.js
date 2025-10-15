const fs = require('fs');

try {
  const data = JSON.parse(fs.readFileSync('data/coordinator-execution-history.json', 'utf8'));
  console.log('Total executions:', data.length);
  
  const recent = data.slice(-3);
  recent.forEach((exec, i) => {
    const index = data.length - 2 + i;
    console.log(`Execution ${index}:`);
    console.log(`- Timestamp: ${exec.timestamp}`);
    console.log(`- Status: ${exec.status}`);
    console.log(`- Has agentResults: ${!!exec.agentResults}`);
    if (exec.agentResults) {
      console.log(`- Agent results keys: ${Object.keys(exec.agentResults).join(', ')}`);
    }
    console.log('');
  });
  
  // Check if there are any recent executions (last hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentExecutions = data.filter(exec => {
    const execTime = new Date(exec.timestamp);
    return execTime > oneHourAgo;
  });
  
  console.log(`Executions in the last hour: ${recentExecutions.length}`);
  if (recentExecutions.length > 0) {
    recentExecutions.forEach((exec, i) => {
      console.log(`${i + 1}. ${exec.timestamp} - ${exec.status}`);
    });
  }
  
} catch (error) {
  console.error('Error reading execution history:', error.message);
} 