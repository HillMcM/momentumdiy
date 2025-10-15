const logger = require('../utils/logger');

class BaseAgent {
  constructor() {
    this.trace = [];          // Holds the full transparent log
    this.traceId = null;      // Unique identifier for this execution
  }

  // Initialize trace for a new execution
  initializeTrace(taskName, input) {
    this.traceId = `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.trace = [];
    
    this.logTrace(
      'EXECUTION_START',
      `Starting ${taskName} task`,
      { 
        taskName, 
        input: this.sanitizeInput(input),
        traceId: this.traceId,
        timestamp: new Date().toISOString()
      }
    );
  }

  // Log a trace entry with step, detail, and optional data
  logTrace(step, detail, data = {}) {
    const traceEntry = {
      timestamp: new Date().toISOString(),
      step,            // Short label e.g. 'SERP_QUERY', 'FILTER_RULE', 'TRANSFORM'
      detail,          // Human friendly description
      data: this.sanitizeData(data),  // Raw/truncated payload
      traceId: this.traceId
    };
    
    this.trace.push(traceEntry);
    
    // Also log to console for debugging
    logger.info(`[TRACE] ${step}: ${detail}`);
  }

  // Sanitize input data to prevent sensitive info in traces
  sanitizeInput(input) {
    if (!input) return input;
    
    const sanitized = { ...input };
    
    // Remove sensitive fields
    const sensitiveFields = ['apiKey', 'password', 'token', 'secret', 'key'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  // Sanitize and truncate data for trace logging
  sanitizeData(data) {
    if (!data) return data;
    
    try {
      // Convert to string and truncate if too long
      const dataStr = JSON.stringify(data);
      if (dataStr.length > 1000) {
        return {
          truncated: true,
          originalLength: dataStr.length,
          preview: dataStr.substring(0, 1000) + '...',
          message: 'Data truncated for trace readability'
        };
      }
      
      return data;
    } catch (error) {
      return {
        error: 'Could not serialize data for trace',
        message: error.message
      };
    }
  }

  // Log API request
  logApiRequest(apiName, endpoint, params) {
    this.logTrace(
      `${apiName.toUpperCase()}_REQUEST`,
      `Making ${apiName} API request to ${endpoint}`,
      { endpoint, params: this.sanitizeInput(params) }
    );
  }

  // Log API response
  logApiResponse(apiName, response, success = true) {
    const step = success ? `${apiName.toUpperCase()}_RESPONSE` : `${apiName.toUpperCase()}_ERROR`;
    const detail = success 
      ? `Received ${apiName} response` 
      : `Error in ${apiName} request`;
    
    this.logTrace(step, detail, {
      success,
      response: this.sanitizeData(response),
      timestamp: new Date().toISOString()
    });
  }

  // Log filtering decisions
  logFilterDecision(filterName, item, result, reason) {
    this.logTrace(
      'FILTER_DECISION',
      `${filterName}: ${result ? 'KEPT' : 'FILTERED_OUT'} - ${reason}`,
      {
        filterName,
        item: this.sanitizeData(item),
        result,
        reason
      }
    );
  }

  // Log transformation steps
  logTransformation(transformName, input, output, details = '') {
    this.logTrace(
      'TRANSFORM',
      `${transformName}: ${details}`,
      {
        transformName,
        input: this.sanitizeData(input),
        output: this.sanitizeData(output),
        details
      }
    );
  }

  // Log calculation steps
  logCalculation(calcName, inputs, result, formula = '') {
    this.logTrace(
      'CALCULATION',
      `${calcName}: ${formula || 'computed value'}`,
      {
        calculationName: calcName,
        inputs: this.sanitizeData(inputs),
        result,
        formula
      }
    );
  }

  // Log decision points
  logDecision(decisionName, options, selected, reasoning) {
    this.logTrace(
      'DECISION',
      `${decisionName}: Selected "${selected}"`,
      {
        decisionName,
        options: this.sanitizeData(options),
        selected,
        reasoning
      }
    );
  }

  // Log workflow steps
  logWorkflowStep(stepName, progress, detail) {
    this.logTrace(
      'WORKFLOW_STEP',
      `${stepName} (${progress}%)`,
      {
        stepName,
        progress,
        detail,
        timestamp: new Date().toISOString()
      }
    );
  }

  // Log error with context
  logError(error, context = '') {
    this.logTrace(
      'ERROR',
      `Error occurred: ${error.message}`,
      {
        error: {
          message: error.message,
          stack: error.stack,
          context
        },
        timestamp: new Date().toISOString()
      }
    );
  }

  // Get trace summary
  getTraceSummary() {
    const steps = this.trace.map(t => t.step);
    const uniqueSteps = [...new Set(steps)];
    const stepCounts = uniqueSteps.map(step => ({
      step,
      count: steps.filter(s => s === step).length
    }));

    return {
      totalEntries: this.trace.length,
      uniqueSteps: uniqueSteps.length,
      stepBreakdown: stepCounts,
      duration: this.trace.length > 0 ? 
        new Date(this.trace[this.trace.length - 1].timestamp) - new Date(this.trace[0].timestamp) : 0,
      traceId: this.traceId
    };
  }

  // Get trace for export
  getTrace() {
    return {
      traceId: this.traceId,
      entries: this.trace,
      summary: this.getTraceSummary(),
      exportTimestamp: new Date().toISOString()
    };
  }

  // Clear trace (useful for memory management)
  clearTrace() {
    this.trace = [];
    this.traceId = null;
  }
}

module.exports = BaseAgent; 