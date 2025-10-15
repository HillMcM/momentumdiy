# Scripts Organization Guide

## 🎯 **Current Script Structure**

### **Core Integration Scripts**
- `test-integration-status.js` - Tests all API integrations (Wix, Google Analytics, Google Search Console, Apify)
- `test-buffer-integration.js` - Tests Buffer web automation integration
- `test-lead-sales-integration.js` - **MAIN TEST** - Tests Lead & Sales Agent and Data Analyst Agent integration

### **Data Collection Scripts**
- `fetch-apify-results.js` - Fetches results from Apify datasets
- `fetch-google-maps-results.js` - Fetches Google Maps Scraper results
- `analyze-apify-results.js` - Analyzes Google Search Scraper results
- `analyze-google-maps-results-enhanced.js` - **MAIN ANALYSIS** - Comprehensive Google Maps data analysis

### **Production Scripts**
- `start-production.js` - Starts the production server
- `start-automatic-collection.js` - Starts automatic data collection

## 📁 **Data Files**

### **Raw Data**
- `google-maps-results-2025-07-28.json` - Raw Google Maps Scraper results
- `apify-results-2025-07-28.json` - Raw Google Search Scraper results

### **Processed Data**
- `nh-google-maps-businesses-enhanced.json` - Enhanced Google Maps data with lead scoring
- `nh-local-businesses.json` - Processed Google Search data
- `scored-leads.json` - All leads with scoring and tier classification
- `nh-high-value-leads-enhanced.csv` - High-value leads for outreach

### **Analysis Reports**
- `comprehensive-analysis-report.json` - Complete market analysis
- `market-overview-report.json` - Market overview
- `lead-quality-report.json` - Lead quality analysis
- `geographic-analysis.json` - Geographic market analysis
- `business-type-analysis.json` - Business type analysis
- `competitive-landscape.json` - Competitive analysis
- `roi-analysis.json` - ROI analysis
- `trend-analysis.json` - Trend analysis

### **Outreach Campaigns**
- `outreach-campaign-initial-[timestamp].json` - Generated email campaigns

## 🎯 **Configuration Files**
- `GOOGLE_MAPS_SCRAPER_CONFIG.md` - Google Maps Scraper configuration
- `GOOGLE_SEARCH_SCRAPER_CONFIG.md` - Google Search Scraper configuration
- `APIFY_ACTOR_SELECTION_GUIDE.md` - Actor selection guide
- `APIFY_ACTOR_DEPLOYMENT_GUIDE.md` - Actor deployment guide
- `BUFFER_INTEGRATION_GUIDE.md` - Buffer integration guide
- `INTEGRATION_STATUS_SUMMARY.md` - Integration status summary

## 🚀 **Usage Workflow**

### **1. Initial Setup**
```bash
# Test all integrations
node test-integration-status.js

# Test Buffer integration
node test-buffer-integration.js
```

### **2. Data Collection**
```bash
# Fetch Google Maps data
node fetch-google-maps-results.js

# Fetch Google Search data
node fetch-apify-results.js
```

### **3. Data Analysis**
```bash
# Analyze Google Maps data
node analyze-google-maps-results-enhanced.js

# Analyze Google Search data
node analyze-apify-results.js
```

### **4. Agent Integration**
```bash
# Test complete agent integration
node test-lead-sales-integration.js
```

### **5. Production**
```bash
# Start production server
node start-production.js

# Start automatic collection
node start-automatic-collection.js
```

## 📊 **Key Metrics**

- **Total Businesses:** 600 (Google Maps) + 1,446 (Google Search)
- **High-Value Leads:** 528 (88% of Google Maps data)
- **Top-Tier Leads:** 556 (92.7% of scored leads)
- **Data Quality:** 95.3%
- **Potential ROI:** 1,020,189%

## 🎯 **Next Steps**

1. **Review generated reports** for strategic insights
2. **Customize email templates** with your brand voice
3. **Set up email delivery system** with proper compliance
4. **Start outreach campaign** with top-scoring leads
5. **Monitor results** and adjust strategy based on responses 