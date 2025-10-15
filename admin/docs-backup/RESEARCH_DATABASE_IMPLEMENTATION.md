# Research Database Implementation: 7-Day Freshness Rule

## 🎯 **Problem Solved**

The user identified that the Market Researcher was being skipped too often, leading to:
- **Stale content topics** - Copywriter working with old insights
- **Missed opportunities** - No fresh industry trends or topics
- **Reduced content quality** - No timely, relevant content ideas

## 🔧 **Solution Implemented**

### **1. Research Database System (`src/utils/research-database.js`)**

**Features:**
- **Persistent Storage**: JSON-based database storing all research data
- **Freshness Tracking**: 7-day freshness rule with automatic detection
- **Content Inspiration**: Provides relevant topics and opportunities to copywriter
- **Data Categorization**: Opportunities, trends, insights, competitor data
- **Automatic Cleanup**: Removes data older than 90 days

**Key Methods:**
- `isResearchFresh()` - Checks if research is within 7 days
- `getContentInspiration()` - Provides relevant topics for copywriter
- `addResearchData()` - Stores new research results
- `getDatabaseStats()` - Provides usage statistics

### **2. 7-Day Freshness Rule Implementation**

**Logic:**
```javascript
// Force Market Researcher if research is stale (older than 7 days)
if (!isResearchFresh) {
  assessment.agentNeeds.marketResearcher = true;
  assessment.agentNeeds.reasons.push(`Research is stale (${daysSinceResearch} days old) - Market Researcher needed for fresh insights`);
}
```

**Benefits:**
- **Automatic Freshness Check**: Every workflow checks research age
- **Forced Research**: Market Researcher called when data is stale
- **Transparent Logging**: Clear reasons for Market Researcher usage

### **3. Enhanced Content Assessment**

**Updated Logic:**
1. **Check Research Freshness** - Is data older than 7 days?
2. **Force Market Researcher** - If stale, always call Market Researcher
3. **Content Creation Needs** - Always need Market Researcher for fresh topics
4. **Database Integration** - Store all research results for future use

### **4. Copywriter Content Inspiration**

**Enhanced Input:**
```javascript
// Get content inspiration from research database
const contentInspiration = this.researchDatabase.getContentInspiration(priorityTitle, 5);

// Combine fresh research with database inspiration
const allTopics = [
  ...contentTopics,           // Fresh research results
  ...trendingTopics,          // Fresh trending topics
  ...contentInspiration.trendingTopics,    // Database trends
  ...contentInspiration.opportunities.map(opp => opp.title)  // Database opportunities
];
```

## 🎯 **New Workflow Behavior**

### **Before (Problematic):**
```
CMO: "Market Researcher not needed - using existing research"
Copywriter: Creates content with stale topics
Result: Irrelevant, outdated content
```

### **After (Improved):**
```
CMO: "Research is stale (12 days old) - Market Researcher needed for fresh insights"
Market Researcher: "Identifying content topics based on business priorities"
Database: "Storing 15 new opportunities and 8 trending topics"
Copywriter: "Content inspiration: 23 topics available from research database"
Result: Fresh, relevant, timely content
```

## 🔧 **Database Structure**

```json
{
  "opportunities": [
    {
      "title": "5 Landing Page Mistakes Killing Your Conversions",
      "type": "content",
      "source": "market_researcher",
      "timestamp": "2025-07-29T13:32:25.322Z",
      "task": "find_brand_opportunities"
    }
  ],
  "trends": [
    {
      "topic": "Small Business Marketing Automation Trends",
      "source": "market_researcher",
      "timestamp": "2025-07-29T13:32:25.322Z",
      "task": "analyze_market_trends"
    }
  ],
  "insights": [...],
  "competitors": [...],
  "lastUpdated": "2025-07-29T13:32:25.322Z",
  "metadata": {
    "totalEntries": 45,
    "lastResearchDate": "2025-07-29T13:32:25.322Z",
    "researchFrequency": "weekly"
  }
}
```

## 🎯 **Expected Results**

### **1. Weekly Fresh Research**
- Market Researcher called at least once per week
- Fresh industry insights and trends
- New content opportunities identified

### **2. Rich Content Inspiration**
- Copywriter gets 20+ topic options per priority
- Mix of fresh research and historical insights
- Relevant, timely content topics

### **3. Improved Content Quality**
- Content based on current industry trends
- Fresh, engaging topics for audience
- Better alignment with business priorities

### **4. Data Accumulation**
- Growing database of insights over time
- Historical trend analysis
- Content opportunity patterns

## 🔧 **Logging Examples**

**Freshness Check:**
```
Research freshness check: Stale (12 days since last research)
Forcing Market Researcher due to stale research (12 days old)
```

**Database Update:**
```
Research database updated: 45 total entries, 23 opportunities, 12 trends
```

**Content Inspiration:**
```
Content inspiration for "Enhance Website Conversion": 23 topics available
Primary topic: 5 Landing Page Mistakes Killing Your Conversions
Research database: 8 opportunities, 5 trending topics
```

## 🎯 **Verification Steps**

1. **Run workflow** - Execute daily CMO workflow
2. **Check freshness** - Verify 7-day rule is enforced
3. **Monitor database** - Check research database growth
4. **Review content** - Ensure copywriter gets fresh topics
5. **Validate logging** - Confirm proper freshness messaging

The system now ensures the Market Researcher is used at least weekly to provide fresh insights, while building a valuable database of content opportunities for future use. 