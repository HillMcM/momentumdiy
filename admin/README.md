# MomentumDIY AI Agent System

A comprehensive AI-powered marketing clarity platform that helps small business owners gain extreme clarity on what to focus their marketing on. The system provides quarterly marketing goal selection, weekly dripped guides, task tracking, email campaign management, Meta Business Suite integration, and 24/7 AI assistance.

## 🎯 **Business Model**

**MomentumDIY** is a marketing clarity platform that:
- Helps small business owners select a single quarterly marketing goal
- Provides weekly dripped guides on what to do, how to do it, why it works, and expected outcomes
- Includes Kanban task tracker, email campaign creation, and Meta Business Suite integration
- Offers 24/7 AI assistance trained on a decade of small business marketing experience

**Target Market:** Small business owners (cafes, home services, personal services, brick-and-mortar shops) who are overwhelmed by marketing options and need clarity.

## 🚀 **System Overview**

### **AI Agents:**
- **CMO Brain** - Orchestrates all workflows and strategic decision-making
- **Market Researcher** - Analyzes trends, competitors, and opportunities (used weekly for fresh insights)
- **Data Analyst** - Processes business data and generates insights
- **Copywriting Agent** - Creates compelling marketing clarity content
- **Social Content Agent** - Optimizes content for social media platforms
- **Social Posting Agent** - Posts via Buffer to all platforms
- **Lead & Sales Agent** - Optimizes conversions and lead generation

### **Key Integrations:**
- **Buffer** - Social media posting (LinkedIn, X, Facebook, Instagram, Google Business Profile)
- **OpenAI** - AI content generation (GPT-4o-mini with GPT-3.5-turbo fallback)
- **News API** - Market research and trend analysis
- **SERP API** - Search engine data and competitor analysis
- **Wix** - Waitlist management, email sequencing, subscription management
- **Meta Business Suite API** - Social media analytics and insights (Facebook, Instagram)
- **Notion** - Data storage and live updates

## 📊 **Production Status: FULLY OPERATIONAL** ✅

### **✅ Fully Working Integrations:**
1. **Google Analytics** - Real-time data collection, historical analytics, conversion tracking
2. **Google Search Console** - Search query analysis, SEO insights, performance tracking
3. **Lead & Sales Data** - 600+ businesses from Google Maps, 1,400+ from Google Search
4. **Meta Business Suite API** - Social media analytics, follower counts, engagement rates
5. **All AI Agents** - Fully functional with proper business context

### **⚠️ Partially Working:**
- **Apify Integration** - Requires payment/credits for Google Search Scraper (alternative: Google Search Console)

## 🛠️ **Quick Start**

### **1. Install Dependencies**
```bash
npm install
```

### **2. Environment Setup**
```bash
cp env.example .env
# Edit .env with your API keys
```

### **3. Test System**
```bash
# Test all integrations
node test-integration-status.js

# Test complete workflow
node test-lead-sales-integration.js

# Test Meta Business Suite API
node test-meta-business-suite.js
```

### **4. Start Production**
```bash
# Start production server
node start-production.js

# Or start automatic data collection
node start-automatic-collection.js
```

### **5. Access Dashboard**
- **Dashboard:** http://localhost:3000/dashboard
- **API:** http://localhost:3000/api

## 🔄 **Core Workflows**

### **Daily CMO Workflow (8 AM EST):**
1. **Data Analysis** - Gather comprehensive business data
2. **Priority Determination** - CMO Brain analyzes data and determines top 3 priorities
3. **Content Assessment** - Assess existing content and identify gaps
4. **Selective Delegation** - Delegate tasks only when needed
5. **Market Research** - If research is >7 days old, call Market Researcher
6. **Content Creation** - Copywriting Agent creates marketing clarity content
7. **Social Strategy** - Social Content Agent optimizes for platforms
8. **Lead Generation** - Lead & Sales Agent optimizes conversions
9. **Final Recommendations** - Compile comprehensive daily report

### **Weekly Market Research Workflow:**
- **Trigger:** CMO checks if research is >7 days old
- **Action:** Market Researcher conducts fresh research
- **Storage:** All research stored in database for future inspiration
- **Output:** Fresh topics, trends, and insights for content creation

## 📱 **Social Media Strategy**

### **Platforms Supported:**
- ✅ **LinkedIn** - Professional insights, thought leadership
- ✅ **X (Twitter)** - Quick tips, trending topics
- ✅ **Facebook** - Community building, behind-the-scenes
- ✅ **Instagram** - Visual content, stories
- ✅ **Google Business Profile** - Local business optimization

### **Content Focus:**
- Marketing clarity and focus
- Quarterly goal setting
- Small business marketing insights
- Practical execution tips
- Success stories and case studies

### **Posting Schedule:**
- **LinkedIn:** Tuesday-Thursday, 8-10 AM or 5-6 PM
- **X (Twitter):** Daily, multiple times per day
- **Facebook:** Tuesday-Thursday, 1-4 PM
- **Instagram:** Daily, 2-3 PM or 7-9 PM
- **Google Business Profile:** Weekly updates

## 🤖 **Agent Capabilities**

### **CMO Brain Agent:**
- **Strategic Thinking** - Deep analysis with memory and learning
- **Performance Analysis** - Marketing ROI and optimization
- **Priority Management** - Determines top 3 business priorities
- **Content Assessment** - Identifies content gaps and needs
- **Selective Delegation** - Delegates tasks only when needed

### **Market Researcher Agent:**
- **Trend Analysis** - Identifies emerging trends and opportunities
- **Competitor Research** - Analyzes competitor strategies and gaps
- **Industry Monitoring** - Tracks industry developments
- **Content Topic Generation** - Provides fresh content ideas
- **Market Intelligence** - Gathers actionable market insights

### **Data Analyst Agent:**
- **Business Data Processing** - Analyzes comprehensive business metrics
- **Performance Insights** - Generates actionable business insights
- **Trend Detection** - Identifies patterns and anomalies
- **ROI Analysis** - Calculates return on investment
- **Data Quality Assessment** - Ensures data accuracy and reliability

### **Copywriting Agent:**
- **Content Ideas Generation** - Creates marketing clarity content ideas
- **Blog Post Creation** - Writes comprehensive blog posts
- **Social Media Copy** - Creates platform-specific content
- **Email Campaigns** - Generates email sequences
- **Landing Page Copy** - Creates conversion-optimized copy

### **Social Content Agent:**
- **Multi-Platform Campaigns** - Creates cross-platform strategies
- **Content Optimization** - Adapts content for each platform
- **Hashtag Strategy** - Develops platform-specific hashtag strategies
- **Visual Brand Guidelines** - Creates consistent brand visuals
- **Engagement Copy** - Generates high-engagement content

### **Lead & Sales Agent:**
- **Lead Scoring** - Intelligent lead scoring (0-100 scale)
- **Email Generation** - Personalized outreach emails
- **Sales Funnel Optimization** - Optimizes conversion funnels
- **Campaign Management** - Manages outreach campaigns
- **ROI Tracking** - Tracks sales performance and ROI

## 📊 **API Usage**

### **Execute Agent Tasks:**
```bash
# Execute CMO Brain workflow
curl -X POST http://localhost:3000/api/agents/cmo-brain/execute \
  -H "Content-Type: application/json" \
  -d '{
    "task": "think",
    "input": {
      "data": "business_data",
      "context": {
        "business_goals": ["increase_website_conversions"],
        "current_situation": "current_marketing_performance",
        "timeline": "quarterly"
      }
    }
  }'

# Generate content ideas
curl -X POST http://localhost:3000/api/agents/copywriting-agent/execute \
  -H "Content-Type: application/json" \
  -d '{
    "task": "generate-content-ideas",
    "input": {
      "priority": "marketing_clarity",
      "target_audience": "small_business_owners"
    }
  }'

# Create social media content
curl -X POST http://localhost:3000/api/agents/social-content-agent/execute \
  -H "Content-Type: application/json" \
  -d '{
    "task": "create-multi-platform-campaign",
    "input": {
      "topic": "quarterly_marketing_goals",
      "platforms": ["linkedin", "facebook", "instagram"]
    }
  }'
```

## 📁 **Project Structure**

```
├── src/                    # Source code
│   ├── agents/            # AI agents (8 files)
│   │   ├── cmo-brain.js           # Strategic orchestration
│   │   ├── agent-coordinator.js   # Workflow management
│   │   ├── data-analyst-agent.js  # Data analysis
│   │   ├── copywriting-agent.js   # Content creation
│   │   ├── social-content-agent.js # Social optimization
│   │   ├── lead-sales-agent.js    # Lead generation
│   │   ├── market-researcher.js   # Market research
│   │   └── social-posting-agent.js # Buffer posting
│   ├── integrations/      # External service integrations (4 files)
│   ├── utils/             # Utility functions (8 files)
│   ├── api/               # REST API endpoints (5 files)
│   ├── dashboard/         # Frontend dashboard (8 files)
│   ├── config/            # Configuration files (1 file)
│   └── index.js           # Application entry point
├── data/                  # Data storage and reports
├── logs/                  # System execution logs
├── test-*.js              # Integration tests
├── start-*.js             # Production scripts
└── *.json                 # Data files and reports
```

## 📋 **Environment Variables**

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
OPENAI_FALLBACK_MODEL=gpt-3.5-turbo

# Buffer Integration
BUFFER_ACCESS_TOKEN=your_buffer_access_token

# API Services
NEWS_API_KEY=your_news_api_key
SERP_API_KEY=your_serp_api_key

# Wix Integration
WIX_API_KEY=your_wix_api_key
WIX_SITE_ID=your_site_id

# Notion Integration
NOTION_API_KEY=your_notion_api_key
NOTION_DATABASE_ID=your_database_id

# System Configuration
PORT=3000
NODE_ENV=production
LOG_LEVEL=info
```

## 🎯 **Business Use Cases**

### **Marketing Clarity Platform:**
- **Quarterly Goal Setting** - Help small business owners select focused marketing goals
- **Weekly Guidance** - Provide step-by-step marketing execution guides
- **Task Management** - Kanban-style task tracking for marketing activities
- **Email Campaigns** - Automated email sequence creation and management
- **Social Media Management** - Cross-platform social media posting and optimization
- **24/7 AI Assistance** - Round-the-clock marketing guidance and support

### **Content Marketing:**
- **Blog Post Creation** - Automated marketing clarity content generation
- **Social Media Content** - Platform-optimized social media posts
- **Email Newsletters** - Automated email sequence creation
- **Content Calendar** - Automated content planning and scheduling

### **Market Research:**
- **Competitor Analysis** - Automated competitor monitoring and analysis
- **Trend Monitoring** - Real-time trend identification and analysis
- **Opportunity Identification** - Market gap and opportunity analysis
- **Industry Insights** - Automated industry research and reporting

## 📈 **Success Metrics**

### **Short-term (1-3 months):**
- Consistent daily posting across platforms
- Increased social media engagement
- Automated content generation working
- Buffer integration fully operational
- Weekly market research providing fresh insights

### **Long-term (3-12 months):**
- Significant follower growth
- Established thought leadership in marketing clarity
- Automated workflows running smoothly
- Measurable business impact for clients
- Database of market research insights growing

## 🔧 **Recent Fixes & Improvements**

### **✅ Business Model Alignment:**
- Fixed all hardcoded references to old business model
- Updated all agents to focus on marketing clarity platform
- Corrected target market references throughout system
- Aligned all content generation with marketing clarity goals

### **✅ Workflow Optimization:**
- Implemented 7-day research freshness check
- Added research database for trend analysis
- Enhanced CMO Brain priority determination
- Improved selective delegation logic

### **✅ Error Handling:**
- Fixed data quality assessment functions
- Added comprehensive null/undefined checks
- Implemented graceful degradation
- Enhanced error messages and logging

## 🚀 **Production Deployment**

```bash
# Start production server
npm run start:prod

# Or use PM2
pm2 start start-production.js

# Monitor logs
pm2 logs

# Monitor system status
pm2 status
```

## 📊 **Monitoring & Analytics**

- **Dashboard:** Real-time system monitoring at http://localhost:3000/dashboard
- **Logs:** Detailed execution logs in `/logs` directory
- **Buffer Analytics:** Social media performance tracking
- **Meta Business Suite Analytics:** Facebook and Instagram performance tracking
- **API Status:** System health monitoring via API endpoints
- **Resource Usage:** Token usage and cost tracking

## 🔗 **Meta Business Suite API Setup**

### **Prerequisites:**
- Meta Business Suite account with admin access
- Facebook Page and/or Instagram Business Account connected
- System User permissions in Meta Business Suite

### **Setup Steps:**
1. **Access Meta Business Suite:**
   - Go to [Meta Business Suite](https://business.facebook.com/)
   - Navigate to Settings > System Users

2. **Create System User (if needed):**
   - Click "Add" to create a new System User
   - Give it a descriptive name (e.g., "MomentumDIY API Integration")
   - Assign appropriate permissions (Pages, Instagram, Insights)

3. **Generate Access Token:**
   - Select your System User
   - Click "Generate Token"
   - Choose permissions: `pages_read_engagement`, `instagram_basic`, `instagram_manage_insights`
   - Copy the generated token

4. **Get Business ID:**
   - In Meta Business Suite, go to Settings > Business Settings
   - Copy your Business ID

5. **Configure Environment:**
   ```bash
   # Add to your .env file
   META_ACCESS_TOKEN=your_generated_access_token
   META_BUSINESS_ID=your_business_id
   ```

6. **Test Integration:**
   ```bash
   node test-meta-business-suite.js
   ```

### **Data Available:**
- **Facebook:** Followers, engagement rates, reach, top posts
- **Instagram:** Followers, engagement rates, reach, media count, top content
- **Overview:** Total followers, total engagement, top platforms
- **Real-time:** Live social media performance metrics

## 💡 **Pro Tips**

1. **Start with Buffer Professional** - Best value for API access
2. **Connect all platforms** - Maximize your reach across social media
3. **Monitor analytics** - Use Buffer's insights to optimize performance
4. **Be consistent** - Regular posting builds audience and credibility
5. **Engage authentically** - Respond to comments and messages
6. **Use weekly research** - Fresh insights keep content relevant
7. **Focus on clarity** - All content should emphasize marketing clarity and focus

## 🆘 **Support & Troubleshooting**

- **Buffer API:** [Buffer API Documentation](https://buffer.com/developers/api)
- **OpenAI API:** [OpenAI API Documentation](https://platform.openai.com/docs)
- **System Logs:** Check `/logs` directory for detailed execution logs
- **Dashboard:** Monitor system status at http://localhost:3000/dashboard
- **API Health:** Check system health at http://localhost:3000/api/health

## 📚 **Documentation Files**

This README consolidates information from 30+ documentation files. Key files referenced:
- `AGENT_TASKS_DOCUMENTATION.md` - Complete agent task specifications
- `FINAL_PRODUCTION_STATUS.md` - Production readiness status
- `COMPREHENSIVE_BUSINESS_MODEL_AUDIT.md` - Business model alignment audit
- `BUFFER_INTEGRATION_GUIDE.md` - Buffer integration details

---

**Your complete AI-powered marketing clarity platform - helping small business owners gain extreme clarity on what to focus their marketing on!** 🚀 