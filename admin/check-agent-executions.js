const fs = require('fs');

try {
  const data = JSON.parse(fs.readFileSync('data/agent-execution-history.json', 'utf8'));
  const latest = data.slice(-10);
  
  console.log('Latest 10 agent executions:');
  latest.forEach((exec, i) => {
    console.log(`${i + 1}. Agent: ${exec.agentName}, Task: ${exec.task}, Status: ${exec.status}, Duration: ${exec.duration}ms`);
    if (exec.error) {
      console.log(`   Error: ${exec.error}`);
    }
  });
  
  // Check for any errors
  const errors = data.filter(exec => exec.error);
  console.log(`\nTotal executions with errors: ${errors.length}`);
  if (errors.length > 0) {
    console.log('Recent errors:');
    errors.slice(-5).forEach((exec, i) => {
      console.log(`${i + 1}. ${exec.agentName}: ${exec.error}`);
    });
  }
  
} catch (error) {
  console.error('Error reading agent execution history:', error.message);
} 