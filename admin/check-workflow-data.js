const fs = require('fs');

try {
  const data = JSON.parse(fs.readFileSync('data/coordinator-execution-history.json', 'utf8'));
  const latest = data[data.length - 1];
  
  console.log('Latest workflow execution:');
  console.log('ID:', latest.workflowId);
  console.log('Status:', latest.status);
  console.log('Top level keys:', Object.keys(latest));
  console.log('Has agentResults:', !!latest.agentResults);
  console.log('Has dataAnalysis:', !!latest.dataAnalysis);
  console.log('Has cmoPriorities:', !!latest.cmoPriorities);
  
  if (latest.agentResults) {
    console.log('Agent results keys:', Object.keys(latest.agentResults));
    console.log('Market Researcher:', latest.agentResults.marketResearcher ? 'present' : 'missing');
    console.log('Copywriting Agent:', latest.agentResults.copywritingAgent ? 'present' : 'missing');
    console.log('Social Content Agent:', latest.agentResults.socialContentAgent ? 'present' : 'missing');
    console.log('Lead Sales Agent:', latest.agentResults.leadSalesAgent ? 'present' : 'missing');
    console.log('Data Analyst:', latest.agentResults.dataAnalyst ? 'present' : 'missing');
    console.log('CMO Brain:', latest.agentResults.cmoBrain ? 'present' : 'missing');
  }
  
  // Check if agents were executed in workflow progress
  if (latest.workflowProgress) {
    const completedAgents = latest.workflowProgress
      .filter(p => p.type === 'agent_completed')
      .map(p => p.agent);
    console.log('Agents completed in workflow progress:', completedAgents);
  }
  
} catch (error) {
  console.error('Error reading workflow data:', error.message);
} 