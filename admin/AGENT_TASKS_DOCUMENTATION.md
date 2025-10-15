# Agent Tasks Documentation & Standards

This document defines the standardized tasks, inputs, outputs, and prompts for all agents in the MomentumDIY AI Agent System.

## Table of Contents
1. [CMO Brain Agent](#cmo-brain-agent)
2. [Market Researcher Agent](#market-researcher-agent)
3. [Data Analyst Agent](#data-analyst-agent)
4. [Task Standards](#task-standards)
5. [Output Format Standards](#output-format-standards)
6. [Prompt Templates](#prompt-templates)

---

## CMO Brain Agent

### Core Capabilities
- Marketing Strategy Development
- Campaign Planning & Optimization
- Performance Analysis & Reporting
- Competitive Analysis
- Budget Allocation
- Customer Journey Mapping
- ROI Analysis
- Market Research
- Strategic Thinking & Reasoning
- Memory & Learning
- Pattern Recognition
- Predictive Analysis

### Available Tasks

#### 1. Strategic Thinking & Analysis (`think`)
**Purpose:** Deep strategic thinking with memory, insights, and recommendations

**Input Format:**
```json
{
  "data": "string or object - The data to analyze",
  "context": {
    "business_goals": "array of strings",
    "current_situation": "string",
    "constraints": "array of strings",
    "timeline": "string"
  }
}
```

**Output Format:**
```json
{
  "task": "think",
  "status": "completed",
  "thought_process": {
    "analysis": "string - Detailed analysis",
    "insights": ["array of insight objects"],
    "decisions": ["array of decision objects"],
    "recommendations": ["array of recommendation objects"]
  },
  "memory_update": {
    "new_insights": ["array of strings"],
    "patterns_identified": ["array of strings"],
    "strategic_learnings": ["array of strings"]
  },
  "timestamp": "ISO string"
}
```

#### 2. Analyze Marketing Performance (`analyze_performance`)
**Purpose:** Analyze marketing data and provide performance insights

**Input Format:**
```json
{
  "performance_data": {
    "channels": {
      "channel_name": {
        "spend": "number",
        "revenue": "number",
        "clicks": "number",
        "impressions": "number",
        "conversions": "number"
      }
    },
    "total_spend": "number",
    "total_revenue": "number",
    "timeframe": "string",
    "goals": {
      "roas_target": "number",
      "cpa_target": "number"
    }
  }
}
```

**Output Format:**
```json
{
  "task": "analyze_performance",
  "status": "completed",
  "analysis": {
    "overall_performance": {
      "roas": "number",
      "cpa": "number",
      "conversion_rate": "number",
      "efficiency_score": "number"
    },
    "channel_analysis": [
      {
        "channel": "string",
        "performance": "excellent|good|fair|poor",
        "roas": "number",
        "cpa": "number",
        "insights": ["array of strings"],
        "recommendations": ["array of strings"]
      }
    ],
    "trends": ["array of trend objects"],
    "anomalies": ["array of anomaly objects"]
  },
  "recommendations": [
    {
      "priority": "high|medium|low",
      "action": "string",
      "expected_impact": "string",
      "implementation": "string"
    }
  ],
  "timestamp": "ISO string"
}
```

#### 3. Create Marketing Strategy (`create_strategy`)
**Purpose:** Develop comprehensive marketing strategy

**Input Format:**
```json
{
  "business_goals": ["array of strings"],
  "target_audience": {
    "demographics": "object",
    "psychographics": "object",
    "behaviors": "object"
  },
  "budget": {
    "total": "number",
    "allocation_preferences": "object"
  },
  "industry": "string",
  "competitive_landscape": "object",
  "timeline": "string"
}
```

**Output Format:**
```json
{
  "task": "create_strategy",
  "status": "completed",
  "strategy": {
    "executive_summary": "string",
    "objectives": ["array of objective objects"],
    "target_audience": {
      "primary": "object",
      "secondary": "object"
    },
    "positioning": "string",
    "channels": [
      {
        "channel": "string",
        "purpose": "string",
        "budget_allocation": "number",
        "key_messages": ["array of strings"],
        "success_metrics": ["array of strings"]
      }
    ],
    "timeline": {
      "phases": ["array of phase objects"],
      "milestones": ["array of milestone objects"]
    },
    "risk_mitigation": ["array of risk objects"],
    "success_metrics": ["array of metric objects"]
  },
  "timestamp": "ISO string"
}
```

#### 4. Plan Marketing Campaign (`plan_campaign`)
**Purpose:** Create detailed campaign plan

**Input Format:**
```json
{
  "campaign_objectives": ["array of strings"],
  "target_audience": "object",
  "budget": "number",
  "timeline": {
    "start_date": "ISO string",
    "end_date": "ISO string"
  },
  "channels": ["array of strings"],
  "key_messages": ["array of strings"]
}
```

**Output Format:**
```json
{
  "task": "plan_campaign",
  "status": "completed",
  "campaign_plan": {
    "campaign_name": "string",
    "objectives": ["array of objective objects"],
    "target_audience": "object",
    "budget_breakdown": {
      "total": "number",
      "by_channel": "object"
    },
    "timeline": {
      "phases": ["array of phase objects"],
      "key_dates": ["array of date objects"]
    },
    "creative_strategy": {
      "messaging": ["array of message objects"],
      "visual_elements": ["array of string"],
      "tone": "string"
    },
    "channel_strategy": [
      {
        "channel": "string",
        "approach": "string",
        "budget": "number",
        "timeline": "object",
        "success_metrics": ["array of strings"]
      }
    ],
    "measurement_plan": {
      "kpis": ["array of kpi objects"],
      "tracking_methods": ["array of string"],
      "reporting_schedule": "string"
    }
  },
  "timestamp": "ISO string"
}
```

#### 5. Optimize Marketing Budget (`optimize_budget`)
**Purpose:** Analyze and optimize budget allocation

**Input Format:**
```json
{
  "budget_data": {
    "current_allocation": {
      "channel_name": "number"
    },
    "total_budget": "number"
  },
  "performance_data": {
    "channel_name": {
      "roas": "number",
      "cpa": "number",
      "conversion_rate": "number"
    }
  },
  "goals": {
    "target_roas": "number",
    "growth_targets": "object"
  }
}
```

**Output Format:**
```json
{
  "task": "optimize_budget",
  "status": "completed",
  "optimization": {
    "current_performance": {
      "overall_roas": "number",
      "efficiency_score": "number",
      "channel_performance": ["array of channel objects"]
    },
    "recommended_allocation": {
      "by_channel": "object",
      "total_budget": "number",
      "expected_roas": "number"
    },
    "optimization_rationale": ["array of rationale objects"],
    "implementation_plan": {
      "phases": ["array of phase objects"],
      "risks": ["array of risk objects"],
      "monitoring": ["array of monitoring objects"]
    }
  },
  "timestamp": "ISO string"
}
```

#### 6. Competitive Analysis (`competitive_analysis`)
**Purpose:** Analyze competitors and market positioning

**Input Format:**
```json
{
  "competitor_list": ["array of competitor names"],
  "market_data": {
    "industry": "string",
    "market_size": "number",
    "growth_rate": "number"
  },
  "analysis_focus": ["array of focus areas"]
}
```

**Output Format:**
```json
{
  "task": "competitive_analysis",
  "status": "completed",
  "analysis": {
    "market_overview": {
      "size": "number",
      "growth": "number",
      "key_drivers": ["array of strings"]
    },
    "competitor_analysis": [
      {
        "competitor": "string",
        "strengths": ["array of strings"],
        "weaknesses": ["array of strings"],
        "market_share": "number",
        "positioning": "string",
        "key_differentiators": ["array of strings"]
      }
    ],
    "positioning_opportunities": ["array of opportunity objects"],
    "threats": ["array of threat objects"],
    "recommendations": ["array of recommendation objects"]
  },
  "timestamp": "ISO string"
}
```

#### 7. Map Customer Journey (`customer_journey`)
**Purpose:** Create customer journey map

**Input Format:**
```json
{
  "customer_data": {
    "personas": ["array of persona objects"],
    "touchpoints": ["array of touchpoint objects"]
  },
  "touchpoints": ["array of touchpoint names"]
}
```

**Output Format:**
```json
{
  "task": "customer_journey",
  "status": "completed",
  "journey_map": {
    "stages": [
      {
        "stage": "string",
        "customer_goals": ["array of strings"],
        "touchpoints": ["array of touchpoint objects"],
        "pain_points": ["array of strings"],
        "opportunities": ["array of strings"]
      }
    ],
    "personas": ["array of persona objects"],
    "optimization_opportunities": ["array of opportunity objects"],
    "implementation_priorities": ["array of priority objects"]
  },
  "timestamp": "ISO string"
}
```

#### 8. ROI Analysis (`roi_analysis`)
**Purpose:** Analyze marketing ROI and performance

**Input Format:**
```json
{
  "investment_data": {
    "campaigns": [
      {
        "name": "string",
        "spend": "number",
        "duration": "string"
      }
    ]
  },
  "revenue_data": {
    "attributed_revenue": "number",
    "timeframe": "string"
  },
  "timeframe": "string"
}
```

**Output Format:**
```json
{
  "task": "roi_analysis",
  "status": "completed",
  "roi_analysis": {
    "overall_roi": {
      "roas": "number",
      "roi_percentage": "number",
      "payback_period": "string"
    },
    "campaign_breakdown": [
      {
        "campaign": "string",
        "roas": "number",
        "roi_percentage": "number",
        "performance": "excellent|good|fair|poor"
      }
    ],
    "insights": ["array of insight objects"],
    "recommendations": ["array of recommendation objects"],
    "forecasting": {
      "projected_roi": "number",
      "optimization_potential": "number"
    }
  },
  "timestamp": "ISO string"
}
```

#### 9. Pattern Recognition (`recognize_patterns`)
**Purpose:** Identify patterns, trends, and correlations in data

**Input Format:**
```json
{
  "data": "object or array - The data to analyze for patterns"
}
```

**Output Format:**
```json
{
  "task": "recognize_patterns",
  "status": "completed",
  "patterns": {
    "trends": ["array of trend objects"],
    "correlations": ["array of correlation objects"],
    "seasonality": ["array of seasonality objects"],
    "anomalies": ["array of anomaly objects"],
    "predictive_insights": ["array of insight objects"]
  },
  "timestamp": "ISO string"
}
```

---

## Market Researcher Agent

### Core Capabilities
- Real-time News Monitoring
- Competitor Analysis
- Market Trend Analysis
- Industry Research
- Keyword Research
- Social Media Monitoring
- Product Launch Tracking
- Market Sentiment Analysis
- Geographic Market Analysis
- Demographic Research
- Technology Trend Monitoring
- Regulatory Change Tracking

### Available Tasks

#### 1. Research Competitors (`research_competitors`)
**Purpose:** Analyze competitor activities, news, and market positioning

**Input Format:**
```json
{
  "competitors": ["array of competitor names"],
  "industry": "string",
  "timeframe": "string (default: 7d)"
}
```

**Output Format:**
```json
{
  "task": "research_competitors",
  "status": "completed",
  "competitor_analysis": [
    {
      "competitor": "string",
      "recent_activities": ["array of activity objects"],
      "news_coverage": ["array of news objects"],
      "search_trends": "object",
      "market_positioning": "string",
      "key_insights": ["array of strings"],
      "opportunities": ["array of opportunity objects"]
    }
  ],
  "market_context": {
    "industry_trends": ["array of trend objects"],
    "competitive_landscape": "string"
  },
  "timestamp": "ISO string"
}
```

#### 2. Analyze Market Trends (`analyze_market_trends`)
**Purpose:** Identify and analyze current market trends and patterns

**Input Format:**
```json
{
  "industry": "string",
  "timeframe": "string (default: 7d)",
  "focus_areas": ["array of focus areas"]
}
```

**Output Format:**
```json
{
  "task": "analyze_market_trends",
  "status": "completed",
  "trend_analysis": {
    "emerging_trends": ["array of trend objects"],
    "declining_trends": ["array of trend objects"],
    "stable_trends": ["array of trend objects"],
    "trend_impact": {
      "short_term": ["array of impact objects"],
      "long_term": ["array of impact objects"]
    },
    "recommendations": ["array of recommendation objects"]
  },
  "timestamp": "ISO string"
}
```

#### 3. Monitor News (`monitor_news`)
**Purpose:** Track relevant news and developments in your industry

**Input Format:**
```json
{
  "keywords": ["array of keywords"],
  "timeframe": "string (default: 7d)",
  "sources": ["array of news sources (optional)"]
}
```

**Output Format:**
```json
{
  "task": "monitor_news",
  "status": "completed",
  "news_analysis": {
    "relevant_articles": ["array of article objects"],
    "key_themes": ["array of theme objects"],
    "sentiment_analysis": {
      "overall_sentiment": "positive|neutral|negative",
      "sentiment_breakdown": "object"
    },
    "impact_assessment": ["array of impact objects"],
    "action_items": ["array of action objects"]
  },
  "timestamp": "ISO string"
}
```

#### 4. Keyword Research (`keyword_research`)
**Purpose:** Research trending keywords and search patterns

**Input Format:**
```json
{
  "industry": "string",
  "keywords": ["array of seed keywords"],
  "timeframe": "string (default: 12m)"
}
```

**Output Format:**
```json
{
  "task": "keyword_research",
  "status": "completed",
  "keyword_analysis": {
    "trending_keywords": ["array of keyword objects"],
    "search_volume_trends": ["array of trend objects"],
    "keyword_opportunities": ["array of opportunity objects"],
    "competitive_keywords": ["array of keyword objects"],
    "content_opportunities": ["array of opportunity objects"]
  },
  "timestamp": "ISO string"
}
```

#### 5. Industry Analysis (`industry_analysis`)
**Purpose:** Comprehensive analysis of industry landscape and dynamics

**Input Format:**
```json
{
  "industry": "string",
  "scope": "string (market_size|players|trends|regulations)",
  "depth": "string (overview|detailed|comprehensive)"
}
```

**Output Format:**
```json
{
  "task": "industry_analysis",
  "status": "completed",
  "industry_analysis": {
    "market_overview": {
      "size": "number",
      "growth_rate": "number",
      "key_segments": ["array of segment objects"]
    },
    "competitive_landscape": {
      "major_players": ["array of player objects"],
      "market_share": "object",
      "competitive_dynamics": "string"
    },
    "trends_and_drivers": ["array of trend objects"],
    "regulatory_environment": ["array of regulation objects"],
    "opportunities_and_threats": {
      "opportunities": ["array of opportunity objects"],
      "threats": ["array of threat objects"]
    }
  },
  "timestamp": "ISO string"
}
```

#### 6. Sentiment Analysis (`sentiment_analysis`)
**Purpose:** Analyze market sentiment and public opinion

**Input Format:**
```json
{
  "topics": ["array of topics to analyze"],
  "timeframe": "string (default: 7d)",
  "sources": ["array of sources (optional)"]
}
```

**Output Format:**
```json
{
  "task": "sentiment_analysis",
  "status": "completed",
  "sentiment_analysis": {
    "overall_sentiment": {
      "score": "number (-1 to 1)",
      "label": "positive|neutral|negative",
      "confidence": "number"
    },
    "topic_breakdown": [
      {
        "topic": "string",
        "sentiment": "object",
        "volume": "number",
        "trend": "string"
      }
    ],
    "key_insights": ["array of insight objects"],
    "recommendations": ["array of recommendation objects"]
  },
  "timestamp": "ISO string"
}
```

#### 7. Find Brand Opportunities (`find_brand_opportunities`)
**Purpose:** Identify opportunities aligned with MomentumDIY brand voice

**Input Format:**
```json
{
  "timeframe": "string (default: 7d)",
  "focusAreas": ["array of focus areas (optional)"]
}
```

**Output Format:**
```json
{
  "task": "find_brand_opportunities",
  "status": "completed",
  "brand_opportunities": {
    "content_opportunities": ["array of opportunity objects"],
    "market_gaps": ["array of gap objects"],
    "trending_topics": ["array of topic objects"],
    "competitor_gaps": ["array of gap objects"],
    "prioritized_opportunities": ["array of priority objects"]
  },
  "brand_context": {
    "voice": "string",
    "values": ["array of values"],
    "target_audience": "string"
  },
  "timestamp": "ISO string"
}
```

---

## Data Analyst Agent

### Core Capabilities
- Data Cleaning & Validation
- Analytics Processing
- Performance Metrics Analysis
- Trend Identification
- Data Visualization
- Statistical Analysis
- KPI Calculation
- Anomaly Detection
- Data Quality Assessment
- Insight Generation
- Report Creation
- Predictive Analytics

### Available Tasks

#### 1. Process Business Data (`process_business_data`)
**Purpose:** Full data processing pipeline for business metrics

**Input Format:**
```json
{
  "data": "object - Raw business data",
  "context": {
    "data_source": "string",
    "business_context": "string",
    "processing_requirements": "object"
  }
}
```

**Output Format:**
```json
{
  "task": "process_business_data",
  "status": "completed",
  "processed_data": {
    "clean_metrics": ["array of metric objects"],
    "insights": ["array of insight objects"],
    "trends": ["array of trend objects"],
    "anomalies": ["array of anomaly objects"],
    "recommendations": ["array of recommendation objects"]
  },
  "data_quality": {
    "completeness": "number",
    "accuracy": "number",
    "consistency": "number",
    "issues": ["array of issue objects"]
  },
  "timestamp": "ISO string"
}
```

#### 2. Clean and Validate Data (`clean_data`)
**Purpose:** Clean and validate raw business data

**Input Format:**
```json
{
  "data": "object - Raw data to clean",
  "validation_rules": "object (optional)"
}
```

**Output Format:**
```json
{
  "task": "clean_data",
  "status": "completed",
  "cleaned_data": "object",
  "validation_results": {
    "passed_validation": "boolean",
    "issues_found": ["array of issue objects"],
    "data_quality_score": "number",
    "recommendations": ["array of recommendation objects"]
  },
  "timestamp": "ISO string"
}
```

#### 3. Analyze Trends (`analyze_trends`)
**Purpose:** Identify trends and patterns in business data

**Input Format:**
```json
{
  "data": "object - Data to analyze for trends",
  "timeframe": "string (optional)"
}
```

**Output Format:**
```json
{
  "task": "analyze_trends",
  "status": "completed",
  "trend_analysis": {
    "trends": ["array of trend objects"],
    "patterns": ["array of pattern objects"],
    "seasonality": ["array of seasonality objects"],
    "forecasts": ["array of forecast objects"],
    "insights": ["array of insight objects"]
  },
  "timestamp": "ISO string"
}
```

#### 4. Detect Anomalies (`detect_anomalies`)
**Purpose:** Detect anomalies and outliers in data

**Input Format:**
```json
{
  "data": "object - Data to analyze for anomalies",
  "threshold": "number (optional)"
}
```

**Output Format:**
```json
{
  "task": "detect_anomalies",
  "status": "completed",
  "anomaly_analysis": {
    "anomalies": ["array of anomaly objects"],
    "outliers": ["array of outlier objects"],
    "severity_assessment": ["array of severity objects"],
    "recommendations": ["array of recommendation objects"]
  },
  "timestamp": "ISO string"
}
```

#### 5. Generate Insights (`generate_insights`)
**Purpose:** Generate actionable insights from processed data

**Input Format:**
```json
{
  "processed_data": "object - Previously processed data",
  "business_context": "string (optional)"
}
```

**Output Format:**
```json
{
  "task": "generate_insights",
  "status": "completed",
  "insights": {
    "key_findings": ["array of finding objects"],
    "actionable_insights": ["array of insight objects"],
    "business_impact": ["array of impact objects"],
    "recommendations": ["array of recommendation objects"],
    "priority_actions": ["array of action objects"]
  },
  "timestamp": "ISO string"
}
```

#### 6. Create CMO Summary (`create_cmo_summary`)
**Purpose:** Create executive summary for CMO decision-making

**Input Format:**
```json
{
  "insights": "object - Insights to summarize",
  "context": {
    "business_goals": ["array of strings"],
    "timeframe": "string"
  }
}
```

**Output Format:**
```json
{
  "task": "create_cmo_summary",
  "status": "completed",
  "cmo_summary": {
    "executive_summary": "string",
    "key_metrics": ["array of metric objects"],
    "performance_highlights": ["array of highlight objects"],
    "critical_insights": ["array of insight objects"],
    "strategic_recommendations": ["array of recommendation objects"],
    "action_items": ["array of action objects"],
    "risk_alerts": ["array of risk objects"]
  },
  "timestamp": "ISO string"
}
```

#### 7. Assess Data Quality (`assess_data_quality`)
**Purpose:** Assess the quality and reliability of data

**Input Format:**
```json
{
  "data": "object - Data to assess",
  "quality_standards": "object (optional)"
}
```

**Output Format:**
```json
{
  "task": "assess_data_quality",
  "status": "completed",
  "quality_assessment": {
    "overall_score": "number",
    "dimensions": {
      "completeness": "number",
      "accuracy": "number",
      "consistency": "number",
      "timeliness": "number",
      "validity": "number"
    },
    "issues": ["array of issue objects"],
    "recommendations": ["array of recommendation objects"],
    "reliability_score": "number"
  },
  "timestamp": "ISO string"
}
```

---

## Task Standards

### Input Validation
All tasks must validate their inputs according to these standards:

1. **Required Fields:** All required fields must be present and non-empty
2. **Data Types:** Inputs must match expected data types
3. **Value Ranges:** Numeric values must be within acceptable ranges
4. **Format Validation:** Dates, URLs, and other formatted data must be valid

### Error Handling
All tasks must handle errors gracefully:

1. **Input Validation Errors:** Return clear error messages for invalid inputs
2. **API Errors:** Handle external API failures with fallback responses
3. **Processing Errors:** Log errors and return partial results when possible
4. **Timeout Handling:** Implement appropriate timeouts for long-running tasks

### Performance Standards
1. **Response Time:** Tasks should complete within 30 seconds for standard operations
2. **Memory Usage:** Efficient memory usage for large datasets
3. **Concurrent Execution:** Support for multiple concurrent task executions
4. **Caching:** Implement caching for frequently accessed data

---

## Output Format Standards

### Standard Response Structure
All task responses must follow this structure:

```json
{
  "task": "string - Task identifier",
  "status": "completed|failed|partial",
  "data": "object - Task-specific data",
  "metadata": {
    "execution_time": "number - milliseconds",
    "timestamp": "ISO string",
    "version": "string - API version"
  },
  "errors": ["array of error objects - if any"],
  "warnings": ["array of warning objects - if any"]
}
```

### Data Quality Indicators
All outputs must include data quality indicators:

```json
{
  "data_quality": {
    "confidence_score": "number - 0 to 1",
    "data_source": "string",
    "last_updated": "ISO string",
    "completeness": "number - 0 to 1"
  }
}
```

---

## Prompt Templates

### CMO Brain Prompts

#### Strategic Thinking Prompt
```
You are a Chief Marketing Officer AI agent for MomentumDIY, a DIY and home improvement brand. 

Context:
- Brand Voice: Authentic, encouraging, practical, and approachable
- Target Audience: DIY enthusiasts, home improvement beginners, creative individuals
- Values: Sustainability, creativity, accessibility, community

Task: Analyze the provided data and context to provide strategic marketing insights.

Input Data: {input_data}
Business Context: {business_context}

Please provide:
1. Strategic Analysis: Deep analysis of the situation
2. Key Insights: 3-5 actionable insights
3. Strategic Decisions: Clear decisions with rationale
4. Recommendations: Prioritized recommendations with expected impact

Format your response as structured JSON with clear sections for analysis, insights, decisions, and recommendations.
```

#### Performance Analysis Prompt
```
You are a CMO analyzing marketing performance data for MomentumDIY.

Data: {performance_data}

Please analyze this performance data and provide:
1. Overall Performance Assessment (ROAS, CPA, efficiency)
2. Channel-by-Channel Analysis with performance ratings
3. Key Trends and Patterns
4. Anomalies or Concerns
5. Prioritized Recommendations for improvement

Focus on actionable insights that align with our DIY/home improvement brand positioning.
```

### Market Researcher Prompts

#### Competitor Research Prompt
```
You are a market research specialist analyzing competitors for MomentumDIY.

Competitors: {competitors}
Industry: {industry}
Timeframe: {timeframe}

Please research and analyze:
1. Recent competitor activities and news
2. Market positioning and strategies
3. Search trends and online presence
4. Key insights and opportunities
5. Recommendations for competitive advantage

Focus on the DIY/home improvement space and identify opportunities for MomentumDIY.
```

#### Market Trends Analysis Prompt
```
You are analyzing market trends for the DIY/home improvement industry.

Industry: {industry}
Timeframe: {timeframe}
Focus Areas: {focus_areas}

Please identify and analyze:
1. Emerging trends in the DIY space
2. Declining or stable trends
3. Impact assessment (short and long-term)
4. Opportunities for MomentumDIY
5. Strategic recommendations

Consider sustainability, creativity, and accessibility trends relevant to our brand.
```

### Data Analyst Prompts

#### Data Processing Prompt
```
You are a data analyst processing business metrics for MomentumDIY.

Data: {data}
Context: {context}

Please process this data and provide:
1. Clean, validated metrics
2. Key insights and patterns
3. Trend analysis
4. Anomaly detection
5. Actionable recommendations

Ensure all insights are relevant to marketing and business strategy for a DIY/home improvement brand.
```

#### CMO Summary Prompt
```
You are creating an executive summary for the CMO of MomentumDIY.

Insights: {insights}
Business Goals: {business_goals}
Timeframe: {timeframe}

Please create a concise executive summary including:
1. Key performance highlights
2. Critical insights for decision-making
3. Strategic recommendations
4. Priority action items
5. Risk alerts or concerns

Keep it high-level and actionable for executive decision-making.
```

---

## Implementation Guidelines

### Consistency Requirements
1. **Naming Conventions:** Use consistent naming for all fields and properties
2. **Data Types:** Maintain consistent data types across all responses
3. **Error Messages:** Use standardized error message formats
4. **Status Codes:** Use consistent status indicators

### Documentation Updates
1. **API Changes:** Update this document when adding new tasks or modifying existing ones
2. **Version Control:** Maintain version history for all changes
3. **Examples:** Include real-world examples for each task
4. **Testing:** Document test cases and expected outputs

### Quality Assurance
1. **Input Validation:** Test all input validation scenarios
2. **Output Consistency:** Verify output format consistency
3. **Performance Testing:** Ensure tasks meet performance standards
4. **Error Handling:** Test error scenarios and fallback mechanisms 