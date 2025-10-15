# Wix Business Solutions API Setup Guide

## Overview
This guide shows you how to set up the **Wix Business Solutions API** to access your own Wix site's data programmatically. This is the correct approach for accessing your site's analytics, forms, and content without building a marketplace app.

## 🎯 **Why Business Solutions API is the Right Choice**

- ✅ **Access your own site's data** - No marketplace app required
- ✅ **Fully automated** - No manual data entry needed
- ✅ **Direct API access** - Real-time data from your Wix site
- ✅ **Comprehensive data** - Analytics, forms, blog posts, pages
- ✅ **No webhooks needed** - Direct API calls for data collection

## 🔧 **Setup Steps**

### **Step 1: Enable Developer Tools in Your Wix Site**

1. **Go to your Wix Dashboard**
2. **Navigate to Settings** > **Developer Tools**
3. **Enable Developer Mode** for your site
4. **This gives you direct API access to your own site's data**

### **Step 2: Get Your API Credentials**

In the Developer Tools section, you'll find:

1. **Site ID** - Your site's unique identifier
2. **API Key** - For accessing your site's data
3. **Access Token** - For authenticated API requests

### **Step 3: Update Your Environment Variables**

Add these to your `.env` file:

```bash
# Wix Business Solutions API Configuration
WIX_SITE_ID=your_wix_site_id
WIX_API_KEY=your_wix_api_key
WIX_ACCESS_TOKEN=your_wix_access_token
```

## 📊 **Available API Endpoints**

The Business Solutions API provides these endpoints for your site:

### **Analytics Data**
```javascript
// Get site statistics
GET https://www.wixapis.com/analytics/v1/statistics

// Get page views
GET https://www.wixapis.com/analytics/v1/page-views

// Get traffic sources
GET https://www.wixapis.com/analytics/v1/traffic-sources
```

### **Content Data**
```javascript
// Get site pages
GET https://www.wixapis.com/site/v1/pages

// Get blog posts
GET https://www.wixapis.com/blog/v1/posts

// Get form submissions
GET https://www.wixapis.com/forms/v1/submissions
```

### **Business Data**
```javascript
// Get email subscribers
GET https://www.wixapis.com/email-marketing/v1/subscribers

// Get e-commerce data (if applicable)
GET https://www.wixapis.com/ecommerce/v1/orders
```

## 🚀 **Implementation**

### **Updated Wix Client**

The Wix client has been updated to use the Business Solutions API:

```javascript
class WixClient {
  constructor() {
    this.siteId = process.env.WIX_SITE_ID;
    this.apiKey = process.env.WIX_API_KEY;
    this.accessToken = process.env.WIX_ACCESS_TOKEN;
  }

  async getWixBusinessAnalytics(startDate, endDate) {
    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      'wix-site-id': this.siteId
    };

    const response = await fetch(`https://www.wixapis.com/analytics/v1/statistics`, {
      method: 'GET',
      headers,
      body: JSON.stringify({
        startDate,
        endDate,
        metrics: ['visitors', 'pageViews', 'sessions', 'bounceRate']
      })
    });

    return response.json();
  }
}
```

## 📋 **Setup Checklist**

- [ ] Enable Developer Tools in your Wix Dashboard
- [ ] Get your Site ID, API Key, and Access Token
- [ ] Update your `.env` file with the credentials
- [ ] Test the API connection
- [ ] Set up automated data collection
- [ ] Integrate with your AI agents

## 🧪 **Testing**

Test your Business Solutions API setup:

```bash
# Test the updated Wix integration
node test-integration-status.js

# Test Wix analytics specifically
node test-wix-analytics.js

# Test complete system
node test-lead-sales-integration.js
```

## 📈 **Expected Results**

Once set up, you'll have:

### **✅ Automated Analytics Collection**
- Real-time visitor data
- Page view statistics
- Session duration and bounce rate
- Traffic source analysis

### **✅ Form Data Automation**
- Contact form submissions
- Newsletter signups
- Lead capture data
- No manual data entry required

### **✅ Content Analytics**
- Blog post performance
- Page popularity
- Content engagement metrics
- SEO performance data

### **✅ Business Intelligence**
- Email marketing analytics
- E-commerce data (if applicable)
- Customer behavior insights
- Conversion tracking

## 🔄 **Automated Data Collection**

### **Option 1: Scheduled Collection**
```javascript
const cron = require('node-cron');

// Collect data every hour
cron.schedule('0 * * * *', async () => {
  const wixClient = getWixClient();
  const analytics = await wixClient.getWixBusinessAnalytics();
  // Process with AI agents
});
```

### **Option 2: Real-time Integration**
```javascript
// In your data analyst agent
async loadWixData() {
  const wixClient = getWixClient();
  const analytics = await wixClient.getWixBusinessAnalytics();
  const forms = await wixClient.getForms();
  const blogPosts = await wixClient.getBlogPosts();
  
  return { analytics, forms, blogPosts };
}
```

## 🎯 **Benefits**

- **No Manual Work**: Data collection is fully automated
- **Real-time Data**: Access to live analytics from your site
- **Comprehensive Insights**: All your site data in one place
- **AI Integration**: Seamless integration with your AI agents
- **Performance Monitoring**: Track site performance automatically
- **Lead Generation**: Automated form submission tracking

## 🔗 **Useful Resources**

- [Wix Developer Documentation](https://dev.wix.com/)
- [Wix Business Solutions API](https://dev.wix.com/docs/business-solutions)
- [Wix Analytics API Reference](https://dev.wix.com/api/rest/analytics)
- [Wix Forms API Reference](https://dev.wix.com/api/rest/forms)

## 🎯 **Next Steps**

1. **Immediate**: Enable Developer Tools in your Wix Dashboard
2. **Short-term**: Get API credentials and update environment variables
3. **Medium-term**: Test the API integration
4. **Long-term**: Set up automated data collection and AI agent integration

This approach will give you **fully automated data collection** from your Wix site using the Business Solutions API, with no manual work required! 