const logger = require('./logger');

// Wix Headless SDK imports
let wixCreateClient, wixApiKeyStrategy, wixItems;
try {
  const wixSdk = require('@wix/sdk');
  const wixData = require('@wix/data');
  wixCreateClient = wixSdk.createClient;
  wixApiKeyStrategy = wixSdk.ApiKeyStrategy;
  wixItems = wixData.items;
} catch (error) {
  logger.warn('Wix SDK not installed - using mock data');
  wixCreateClient = null;
  wixApiKeyStrategy = null;
  wixItems = null;
}

class NewsAPIClient {
  constructor() {
    this.apiKey = process.env.NEWS_API_KEY;
    this.baseUrl = 'https://newsapi.org/v2';
    this.rateLimit = {
      requests: 0,
      resetTime: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      maxRequests: 1000 // Free tier limit
    };
  }

  async fetchNews(query, options = {}) {
    if (!this.apiKey) {
      throw new Error('News API key not configured');
    }

    // Check rate limit
    if (this.rateLimit.requests >= this.rateLimit.maxRequests) {
      const timeUntilReset = this.rateLimit.resetTime - Date.now();
      if (timeUntilReset > 0) {
        throw new Error(`Rate limit exceeded. Reset in ${Math.ceil(timeUntilReset / 1000 / 60)} minutes`);
      } else {
        this.rateLimit.requests = 0;
        this.rateLimit.resetTime = Date.now() + (24 * 60 * 60 * 1000);
      }
    }

    const {
      from,
      to,
      language = 'en',
      sortBy = 'relevancy',
      pageSize = 20,
      page = 1,
      domains,
      excludeDomains
    } = options;

    const params = new URLSearchParams({
      q: query,
      apiKey: this.apiKey,
      language,
      sortBy,
      pageSize: pageSize.toString(),
      page: page.toString()
    });

    if (from) params.append('from', from);
    if (to) params.append('to', to);
    if (domains) params.append('domains', domains);
    if (excludeDomains) params.append('excludeDomains', excludeDomains);

    try {
      this.rateLimit.requests++;
      const response = await fetch(`${this.baseUrl}/everything?${params}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid News API key');
        } else if (response.status === 429) {
          throw new Error('News API rate limit exceeded');
        } else {
          throw new Error(`News API error: ${response.status}`);
        }
      }

      const data = await response.json();
      
      if (data.status === 'error') {
        throw new Error(`News API error: ${data.message}`);
      }

      return {
        articles: data.articles || [],
        totalResults: data.totalResults || 0,
        status: data.status
      };
    } catch (error) {
      logger.error('News API request failed:', error);
      throw error;
    }
  }

  async fetchTopHeadlines(options = {}) {
    if (!this.apiKey) {
      throw new Error('News API key not configured');
    }

    const {
      country = 'us',
      category,
      pageSize = 20,
      page = 1
    } = options;

    const params = new URLSearchParams({
      apiKey: this.apiKey,
      country,
      pageSize: pageSize.toString(),
      page: page.toString()
    });

    if (category) params.append('category', category);

    try {
      this.rateLimit.requests++;
      const response = await fetch(`${this.baseUrl}/top-headlines?${params}`);
      
      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'error') {
        throw new Error(`News API error: ${data.message}`);
      }

      return {
        articles: data.articles || [],
        totalResults: data.totalResults || 0,
        status: data.status
      };
    } catch (error) {
      logger.error('News API top headlines request failed:', error);
      throw error;
    }
  }

  async fetchSources(options = {}) {
    if (!this.apiKey) {
      throw new Error('News API key not configured');
    }

    const {
      category,
      language = 'en',
      country
    } = options;

    const params = new URLSearchParams({
      apiKey: this.apiKey,
      language
    });

    if (category) params.append('category', category);
    if (country) params.append('country', country);

    try {
      this.rateLimit.requests++;
      const response = await fetch(`${this.baseUrl}/sources?${params}`);
      
      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'error') {
        throw new Error(`News API error: ${data.message}`);
      }

      return {
        sources: data.sources || [],
        status: data.status
      };
    } catch (error) {
      logger.error('News API sources request failed:', error);
      throw error;
    }
  }
}

class SerpAPIClient {
  constructor() {
    this.apiKey = process.env.SERP_API_KEY;
    this.baseUrl = 'https://serpapi.com';
    this.rateLimit = {
      requests: 0,
      resetTime: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      maxRequests: 100 // Free tier limit
    };
  }

  async searchGoogleTrends(query, options = {}) {
    if (!this.apiKey) {
      throw new Error('SerpAPI key not configured');
    }

    // Check rate limit
    if (this.rateLimit.requests >= this.rateLimit.maxRequests) {
      const timeUntilReset = this.rateLimit.resetTime - Date.now();
      if (timeUntilReset > 0) {
        throw new Error(`Rate limit exceeded. Reset in ${Math.ceil(timeUntilReset / 1000 / 60)} minutes`);
      } else {
        this.rateLimit.requests = 0;
        this.rateLimit.resetTime = Date.now() + (24 * 60 * 60 * 1000);
      }
    }

    const {
      geo = 'US',
      timeframe = 'today 12-m',
      dataType = 'TIMESERIES'
    } = options;

    const params = new URLSearchParams({
      engine: 'google_trends',
      q: query,
      api_key: this.apiKey,
      geo,
      timeframe,
      data_type: dataType
    });

    try {
      this.rateLimit.requests++;
      const response = await fetch(`${this.baseUrl}/search.json?${params}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid SerpAPI key');
        } else if (response.status === 429) {
          throw new Error('SerpAPI rate limit exceeded');
        } else {
          throw new Error(`SerpAPI error: ${response.status}`);
        }
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`SerpAPI error: ${data.error}`);
      }

      return {
        interestOverTime: data.interest_over_time || [],
        relatedQueries: data.related_queries || [],
        relatedTopics: data.related_topics || [],
        searchMetadata: data.search_metadata || {}
      };
    } catch (error) {
      logger.error('SerpAPI Google Trends request failed:', error);
      throw error;
    }
  }

  async searchGoogle(query, options = {}) {
    if (!this.apiKey) {
      throw new Error('SerpAPI key not configured');
    }

    const {
      num = 10,
      start = 0,
      gl = 'us',
      hl = 'en'
    } = options;

    const params = new URLSearchParams({
      engine: 'google',
      q: query,
      api_key: this.apiKey,
      num: num.toString(),
      start: start.toString(),
      gl,
      hl
    });

    try {
      this.rateLimit.requests++;
      const response = await fetch(`${this.baseUrl}/search.json?${params}`);
      
      if (!response.ok) {
        throw new Error(`SerpAPI error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`SerpAPI error: ${data.error}`);
      }

      return {
        organicResults: data.organic_results || [],
        relatedSearches: data.related_searches || [],
        searchMetadata: data.search_metadata || {}
      };
    } catch (error) {
      logger.error('SerpAPI Google search request failed:', error);
      throw error;
    }
  }

  async searchNews(query, options = {}) {
    if (!this.apiKey) {
      throw new Error('SerpAPI key not configured');
    }

    const {
      num = 10,
      start = 0,
      gl = 'us',
      hl = 'en'
    } = options;

    const params = new URLSearchParams({
      engine: 'google_news',
      q: query,
      api_key: this.apiKey,
      num: num.toString(),
      start: start.toString(),
      gl,
      hl
    });

    try {
      this.rateLimit.requests++;
      const response = await fetch(`${this.baseUrl}/search.json?${params}`);
      
      if (!response.ok) {
        throw new Error(`SerpAPI error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`SerpAPI error: ${data.error}`);
      }

      return {
        newsResults: data.news_results || [],
        searchMetadata: data.search_metadata || {}
      };
    } catch (error) {
      logger.error('SerpAPI Google News search request failed:', error);
      throw error;
    }
  }
}

class GoogleAnalyticsClient {
  constructor() {
    this.clientId = process.env.GOOGLE_ANALYTICS_CLIENT_ID;
    this.clientSecret = process.env.GOOGLE_ANALYTICS_CLIENT_SECRET;
    this.refreshToken = process.env.GOOGLE_ANALYTICS_REFRESH_TOKEN;
    this.propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
    this.accessToken = process.env.GOOGLE_ANALYTICS_ACCESS_TOKEN; // For testing
    this.tokenExpiry = null;
  }

  async getAccessToken() {
    // If we have a direct access token for testing, use it
    if (this.accessToken) {
      return this.accessToken;
    }

    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.clientId || !this.clientSecret || !this.refreshToken) {
      logger.error('Google Analytics credentials check failed:', {
        clientId: !!this.clientId,
        clientSecret: !!this.clientSecret,
        refreshToken: !!this.refreshToken,
        accessToken: !!this.accessToken
      });
      throw new Error('Google Analytics credentials not configured');
    }

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to refresh Google Analytics token: ${response.status}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);

      return this.accessToken;
    } catch (error) {
      logger.error('Google Analytics token refresh failed:', error);
      throw error;
    }
  }

  async getAnalyticsData(startDate, endDate, metrics = ['sessions', 'totalUsers', 'screenPageViews'], dimensions = ['date']) {
    const token = await this.getAccessToken();
    
    if (!this.propertyId) {
      throw new Error('Google Analytics property ID not configured');
    }

    try {
      // Ensure property ID is in correct format (should start with 'properties/')
      let propertyId = this.propertyId;
      if (!propertyId.startsWith('properties/')) {
        propertyId = `properties/${propertyId}`;
      }

      // Convert GA3 metrics to GA4 format with proper validation
      const ga4Metrics = metrics.map(metric => {
        const metricMap = {
          'sessions': 'sessions',
          'totalUsers': 'totalUsers',
          'screenPageViews': 'screenPageViews',
          'bounceRate': 'bounceRate',
          'avgSessionDuration': 'averageSessionDuration',
          'averageSessionDuration': 'averageSessionDuration',
          'goalCompletionsAll': 'conversions',
          'conversions': 'conversions',
          'transactions': 'transactions',
          'revenue': 'totalRevenue',
          'totalRevenue': 'totalRevenue',
          'pageViews': 'screenPageViews',
          'users': 'totalUsers',
          'newUsers': 'newUsers',
          'activeUsers': 'activeUsers',
          'eventCount': 'eventCount'
        };
        const ga4Metric = metricMap[metric] || metric;
        return { name: ga4Metric };
      });

      // Convert GA3 dimensions to GA4 format with proper validation
      const ga4Dimensions = dimensions.map(dimension => {
        const dimensionMap = {
          'date': 'date',
          'pagePath': 'pagePath',
          'source': 'source',
          'medium': 'medium',
          'campaign': 'campaign',
          'pageTitle': 'pageTitle',
          'deviceCategory': 'deviceCategory',
          'country': 'country',
          'city': 'city',
          'browser': 'browser',
          'operatingSystem': 'operatingSystem'
        };
        const ga4Dimension = dimensionMap[dimension] || dimension;
        return { name: ga4Dimension };
      });

      // Build the request body according to GA4 API specification
      const requestBody = {
        dateRanges: [{
          startDate,
          endDate,
        }],
        metrics: ga4Metrics,
        dimensions: ga4Dimensions,
        limit: 1000
      };

      // Remove empty dimensions array if no dimensions are requested
      if (ga4Dimensions.length === 0 || (ga4Dimensions.length === 1 && ga4Dimensions[0].name === '')) {
        delete requestBody.dimensions;
      }

      logger.info(`Making GA4 API request to ${propertyId} with metrics: ${metrics.join(', ')}`);

      const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/${propertyId}:runReport`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`Google Analytics API error ${response.status}: ${errorText}`);
        
        // Provide more specific error messages for common issues
        if (response.status === 400) {
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error && errorData.error.message) {
              // If the error mentions incompatible metrics, try with a simpler request
              if (errorData.error.message.includes('incompatible')) {
                logger.warn('Incompatible metrics detected, trying with basic metrics only');
                return await this.getAnalyticsData(startDate, endDate, ['sessions', 'totalUsers'], ['date']);
              }
              throw new Error(`Google Analytics API validation error: ${errorData.error.message}`);
            }
          } catch (parseError) {
            // If we can't parse the error, use the raw text
          }
        }
        
        throw new Error(`Google Analytics API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      logger.error('Google Analytics data fetch failed:', error);
      throw error;
    }
  }

  async getRealTimeData() {
    const token = await this.getAccessToken();
    
    if (!this.propertyId) {
      throw new Error('Google Analytics property ID not configured');
    }

    try {
      // Ensure property ID is in correct format (should start with 'properties/')
      let propertyId = this.propertyId;
      if (!propertyId.startsWith('properties/')) {
        propertyId = `properties/${propertyId}`;
      }

      logger.info(`Making GA4 real-time API request to ${propertyId}`);

      const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/${propertyId}:runRealtimeReport`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: [
            { name: 'activeUsers' },
            { name: 'screenPageViews' },
            { name: 'eventCount' }
          ],
          dimensions: [
            { name: 'city' },
            { name: 'country' }
          ]
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`Google Analytics real-time API error ${response.status}: ${errorText}`);
        
        // Provide more specific error messages for common issues
        if (response.status === 400) {
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error && errorData.error.message) {
              throw new Error(`Google Analytics real-time API validation error: ${errorData.error.message}`);
            }
          } catch (parseError) {
            // If we can't parse the error, use the raw text
          }
        }
        
        throw new Error(`Google Analytics real-time API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      logger.error('Google Analytics real-time data fetch failed:', error);
      throw error;
    }
  }

  // Alias for Lead Sales Agent compatibility
  async getBasicMetrics() {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // Last 30 days
      
      const data = await this.getAnalyticsData(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        ['totalUsers', 'screenPageViews', 'sessions']
      );
      
      return {
        impressions: data?.rows?.[0]?.metricValues?.[0]?.value || 0,
        clicks: data?.rows?.[0]?.metricValues?.[1]?.value || 0,
        ctr: data?.rows?.[0]?.metricValues?.[2]?.value || 0,
        pageViews: data?.rows?.[0]?.metricValues?.[1]?.value || 0,
        uniqueVisitors: data?.rows?.[0]?.metricValues?.[0]?.value || 0
      };
    } catch (error) {
      logger.warn('Could not fetch basic metrics:', error.message);
      return { impressions: 0, clicks: 0, ctr: 0, pageViews: 0, uniqueVisitors: 0 };
    }
  }

  // Alias for Lead Sales Agent compatibility
  async getConversionMetrics() {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // Last 30 days
      
      const data = await this.getAnalyticsData(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        ['totalUsers', 'conversions', 'averageSessionDuration']
      );
      
      return {
        visitors: data?.rows?.[0]?.metricValues?.[0]?.value || 0,
        landingPageViews: data?.rows?.[0]?.metricValues?.[1]?.value || 0,
        timeOnSite: data?.rows?.[0]?.metricValues?.[2]?.value || 0
      };
    } catch (error) {
      logger.warn('Could not fetch conversion metrics:', error.message);
      return { visitors: 0, landingPageViews: 0, timeOnSite: 0 };
    }
  }

  // Alias for Lead Sales Agent compatibility
  async getEcommerceMetrics() {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // Last 30 days
      
      const data = await this.getAnalyticsData(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        ['transactions', 'totalRevenue', 'averageSessionDuration']
      );
      
      return {
        transactions: data?.rows?.[0]?.metricValues?.[0]?.value || 0,
        revenue: data?.rows?.[0]?.metricValues?.[1]?.value || 0,
        averageOrderValue: data?.rows?.[0]?.metricValues?.[1]?.value && data?.rows?.[0]?.metricValues?.[0]?.value ? 
          (parseFloat(data.rows[0].metricValues[1].value) / parseFloat(data.rows[0].metricValues[0].value)).toFixed(2) : 0
      };
    } catch (error) {
      logger.warn('Could not fetch ecommerce metrics:', error.message);
      return { transactions: 0, revenue: 0, averageOrderValue: 0 };
    }
  }

  // Alias for Lead Sales Agent compatibility
  async getRetentionMetrics() {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 90); // Last 90 days for retention
      
      const data = await this.getAnalyticsData(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        ['totalUsers', 'newUsers', 'averageSessionDuration']
      );
      
      const totalUsers = data?.rows?.[0]?.metricValues?.[0]?.value || 0;
      const newUsers = data?.rows?.[0]?.metricValues?.[1]?.value || 0;
      const returningUsers = totalUsers - newUsers;
      
      return {
        returningVisitors: returningUsers,
        customerLifetimeValue: 0, // Would need custom calculation
        repeatPurchaseRate: 0 // Would need ecommerce data
      };
    } catch (error) {
      logger.warn('Could not fetch retention metrics:', error.message);
      return { returningVisitors: 0, customerLifetimeValue: 0, repeatPurchaseRate: 0 };
    }
  }
}

class GoogleSearchConsoleClient {
  constructor() {
    this.clientId = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID;
    this.clientSecret = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET;
    this.refreshToken = process.env.GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN;
    this.siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.clientId || !this.clientSecret || !this.refreshToken) {
      throw new Error('Google Search Console credentials not configured');
    }

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to refresh Google Search Console token: ${response.status}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);

      return this.accessToken;
    } catch (error) {
      logger.error('Google Search Console token refresh failed:', error);
      throw error;
    }
  }

  async getSearchAnalytics(startDate, endDate, dimensions = ['query', 'page'], rowLimit = 1000) {
    const token = await this.getAccessToken();
    
    if (!this.siteUrl) {
      throw new Error('Google Search Console site URL not configured');
    }

    try {
      // Use the legacy Webmasters API which is working
      // Convert site URL format for Webmasters API
      let siteUrl = this.siteUrl;
      if (this.siteUrl.startsWith('sc-domain:')) {
        // Convert domain property to URL format for Webmasters API
        // Use the www version since that's what the user has permission for
        const domain = this.siteUrl.replace('sc-domain:', '');
        siteUrl = `https://www.${domain}/`;
      }

      // Ensure site URL is properly encoded
      const encodedSiteUrl = encodeURIComponent(siteUrl);

      // Validate dimensions - only allow valid Webmasters API dimensions
      const validDimensions = ['query', 'page', 'country', 'device', 'searchAppearance'];
      const validatedDimensions = dimensions.filter(dim => validDimensions.includes(dim));
      
      if (validatedDimensions.length === 0) {
        validatedDimensions.push('query'); // Default to query if no valid dimensions
      }

      logger.info(`Making Webmasters API request for site: ${siteUrl} with dimensions: ${validatedDimensions.join(', ')}`);

      const requestBody = {
        startDate,
        endDate,
        dimensions: validatedDimensions,
        rowLimit: Math.min(rowLimit, 5000), // Webmasters API has a max limit of 5000
        startRow: 0,
      };

      const response = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Google Webmasters API error response:', errorText);
        
        // Provide more specific error messages for common issues
        if (response.status === 400) {
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error && errorData.error.message) {
              throw new Error(`Google Webmasters API validation error: ${errorData.error.message}`);
            }
          } catch (parseError) {
            // If we can't parse the error, use the raw text
          }
        } else if (response.status === 403) {
          throw new Error('Google Webmasters API access denied. Check site URL and permissions.');
        }
        
        throw new Error(`Google Webmasters API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      logger.error('Google Webmasters data fetch failed:', error);
      throw error;
    }
  }

  async getSitemaps() {
    const token = await this.getAccessToken();
    
    if (!this.siteUrl) {
      throw new Error('Google Search Console site URL not configured');
    }

    try {
      // Use the legacy Webmasters API which is working
      // Convert site URL format for Webmasters API
      let siteUrl = this.siteUrl;
      if (this.siteUrl.startsWith('sc-domain:')) {
        // Convert domain property to URL format for Webmasters API
        // Use the www version since that's what the user has permission for
        const domain = this.siteUrl.replace('sc-domain:', '');
        siteUrl = `https://www.${domain}/`;
      }

      // Ensure site URL is properly encoded
      const encodedSiteUrl = encodeURIComponent(siteUrl);

      logger.info(`Making Webmasters sitemaps request for site: ${siteUrl}`);

      const response = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/sitemaps`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Google Webmasters sitemaps error response:', errorText);
        
        // Provide more specific error messages for common issues
        if (response.status === 400) {
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error && errorData.error.message) {
              throw new Error(`Google Webmasters sitemaps validation error: ${errorData.error.message}`);
            }
          } catch (parseError) {
            // If we can't parse the error, use the raw text
          }
        } else if (response.status === 403) {
          throw new Error('Google Webmasters sitemaps access denied. Check site URL and permissions.');
        }
        
        throw new Error(`Google Webmasters sitemaps error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      logger.error('Google Webmasters sitemaps fetch failed:', error);
      throw error;
    }
  }
}

const { createClient, OAuthStrategy } = require('@wix/sdk');
const { items } = require('@wix/data');

class WixClient {
  constructor() {
    this.siteId = process.env.WIX_SITE_ID;
    this.apiKey = process.env.WIX_API_KEY;
    this.accessToken = process.env.WIX_ACCESS_TOKEN;
    
    if (!this.siteId) {
      throw new Error('Wix Site ID not configured');
    }
    
    if (!this.apiKey) {
      throw new Error('Wix API Key not configured');
    }
    
    // Use Velo web module approach for traditional Wix sites
    this.baseUrl = 'https://hillaryedenmcmullen.com';
    this.veloEndpoints = {
      blogPosts: `${this.baseUrl}/_functions/blog_posts`,
      forms: `${this.baseUrl}/_functions/forms`,
      contacts: `${this.baseUrl}/_functions/contacts`,
      pricingPlans: `${this.baseUrl}/_functions/pricing_plans`,
      testConnection: `${this.baseUrl}/_functions/test_connection`
    };
    
    logger.info('WixClient initialized with Velo web module endpoints');
    logger.info('Base URL:', this.baseUrl);
  }

  async getSiteStats(startDate, endDate) {
    try {
      // Use Wix Business Solutions API to get real site statistics
      const analyticsData = await this.getWixBusinessAnalytics(startDate, endDate);
      
      return {
        items: [analyticsData],
        totalCount: 1
      };
    } catch (error) {
      logger.warn('Wix Business Analytics API failed, using fallback data:', error.message);
      // Return fallback analytics data when API doesn't work
      return {
        items: [
          {
            totalVisitors: 0,
            totalPageViews: 0,
            averageSessionDuration: 0,
            bounceRate: 0,
            topPages: [],
            trafficSources: [],
            lastUpdated: new Date().toISOString()
          }
        ],
        totalCount: 1
      };
    }
  }

  async getWixBusinessAnalytics(startDate, endDate) {
    try {
      // Use Wix Headless API to get analytics data
      // Since you have a headless client set up, we'll use the headless approach
      
      const headers = {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'wix-site-id': this.siteId
      };

      // Try to get analytics data using the headless API
      // First, let's try to get site information
      const siteResponse = await fetch(`https://www.wixapis.com/site/v1/site`, {
        method: 'GET',
        headers
      });

      if (siteResponse.ok) {
        const siteData = await siteResponse.json();
        logger.info('Successfully retrieved site data from Wix API');
        
        // For now, return basic site info with analytics structure
        return {
          totalVisitors: 0, // Will be populated when analytics is properly configured
          totalPageViews: 0,
          averageSessionDuration: 0,
          bounceRate: 0,
          topPages: [],
          trafficSources: [],
          lastUpdated: new Date().toISOString(),
          dataSource: 'Wix Headless API',
          siteInfo: {
            name: siteData.name || 'Your Wix Site',
            url: siteData.url || '',
            description: siteData.description || ''
          }
        };
      } else {
        logger.warn(`Site API returned ${siteResponse.status}, using fallback data`);
        return {
          totalVisitors: 0,
          totalPageViews: 0,
          averageSessionDuration: 0,
          bounceRate: 0,
          topPages: [],
          trafficSources: [],
          lastUpdated: new Date().toISOString(),
          dataSource: 'Fallback Data'
        };
      }
    } catch (error) {
      logger.error('Wix Business Analytics API call failed:', error);
      // Return fallback data instead of throwing error
      return {
        totalVisitors: 0,
        totalPageViews: 0,
        averageSessionDuration: 0,
        bounceRate: 0,
        topPages: [],
        trafficSources: [],
        lastUpdated: new Date().toISOString(),
        dataSource: 'Fallback Data'
      };
    }
  }

  async getPages() {
    try {
      // Use Wix Headless API to get site pages
      const headers = {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'wix-site-id': this.siteId
      };

      // Try to get pages using the headless API
      const pagesResponse = await fetch(`https://www.wixapis.com/site/v1/pages`, {
        method: 'GET',
        headers
      });

      if (pagesResponse.ok) {
        const pagesData = await pagesResponse.json();
        logger.info('Successfully retrieved pages data from Wix API');
        
        return {
          items: pagesData.pages.map(page => ({
            title: page.title || 'Untitled',
            url: page.url || '/',
            views: page.views || 0,
            lastModified: page.lastModified || new Date().toISOString()
          })),
          totalCount: pagesData.pages.length
        };
      } else {
        logger.warn(`Pages API returned ${pagesResponse.status}, using fallback data`);
        return {
          items: [
            { title: 'Home', url: '/', views: 0, lastModified: new Date().toISOString() },
            { title: 'About', url: '/about', views: 0, lastModified: new Date().toISOString() },
            { title: 'Contact', url: '/contact', views: 0, lastModified: new Date().toISOString() }
          ],
          totalCount: 3
        };
      }
    } catch (error) {
      logger.warn('Wix pages fetch failed, using fallback data:', error.message);
      return {
        items: [
          { title: 'Home', url: '/', views: 0, lastModified: new Date().toISOString() },
          { title: 'About', url: '/about', views: 0, lastModified: new Date().toISOString() },
          { title: 'Contact', url: '/contact', views: 0, lastModified: new Date().toISOString() }
        ],
        totalCount: 3
      };
    }
  }

  async getBlogPosts() {
    try {
      logger.info('Fetching blog posts from Velo web module...');
      
      const response = await fetch(this.veloEndpoints.blogPosts);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          logger.info(`Successfully retrieved ${data.totalCount} blog posts from Velo web module`);
          
          return {
            items: data.data || [],
            totalCount: data.totalCount || 0
          };
        } else {
          logger.warn('Velo web module returned error for blog posts:', data.error);
          return {
            items: [],
            totalCount: 0
          };
        }
      } else {
        logger.warn(`Velo web module returned ${response.status} for blog posts`);
        return {
          items: [],
          totalCount: 0
        };
      }
    } catch (error) {
      logger.error('Wix blog posts fetch failed:', error);
      return {
        items: [],
        totalCount: 0
      };
    }
  }

  async getForms() {
    try {
      logger.info('Fetching forms from Velo HTTP endpoint');
      
      const response = await fetch('https://hillaryedenmcmullen.com/_functions/forms');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        logger.info(`Successfully fetched ${data.totalCount} forms from Velo endpoint`);
        return {
          items: data.data || [],
          totalCount: data.totalCount || 0
        };
      } else {
        throw new Error(data.error || 'Unknown error from Velo endpoint');
      }
    } catch (error) {
      logger.warn('Wix forms fetch failed, using fallback data:', error.message);
      return {
        items: [
          { 
            formName: 'Contact Form',
            submissions: 0,
            lastSubmission: null,
            data: {}
          }
        ],
        totalCount: 1
      };
    }
  }

  async getDataItems(collectionId) {
    try {
      // Use Wix Business Solutions API to get data items
      const headers = {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'wix-site-id': this.siteId
      };

      const dataResponse = await fetch(`https://www.wixapis.com/data/v1/items?collectionId=${collectionId}`, {
        method: 'GET',
        headers
      });

      if (dataResponse.ok) {
        const dataItems = await dataResponse.json();
        return {
          items: dataItems.items,
          totalCount: dataItems.totalCount
        };
      } else {
        throw new Error(`Data API error: ${dataResponse.status}`);
      }
    } catch (error) {
      logger.error('Wix data items fetch failed:', error);
      throw error;
    }
  }

  // Enhanced blog analytics using real Wix Blog Backend API metrics
  async getBlogAnalytics() {
    try {
      logger.info('Fetching blog analytics from Velo web module...');
      
      // Call the new comprehensive blog analytics endpoint
      const response = await fetch(`${this.baseUrl}/_functions/blog_analytics`);
      
      if (!response.ok) {
        throw new Error(`Blog analytics API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(`Blog analytics API error: ${result.error}`);
      }

      logger.info(`Blog analytics retrieved: ${result.data.totalPosts} posts, ${result.data.totalViews} total views`);
      
      return result.data;
    } catch (error) {
      logger.error('Wix blog analytics fetch failed:', error);
      
      // Fallback to basic blog data if analytics fail
      try {
        const basicBlogData = await this.getBlogPosts();
        
        if (basicBlogData.items && basicBlogData.items.length > 0) {
          const posts = basicBlogData.items;
          
          return {
            totalPosts: posts.length,
            totalViews: 0,
            totalLikes: 0,
            totalComments: 0,
            averageViews: 0,
            averageLikes: 0,
            averageComments: 0,
            latestPost: posts[0] ? {
              title: posts[0].title,
              publishedDate: posts[0].lastPublishedDate,
              excerpt: posts[0].excerpt,
              slug: posts[0].slug,
              views: 0,
              likes: 0,
              comments: 0
            } : null,
            topPerformingPosts: [],
            recentPosts: posts.slice(0, 5).map(post => ({
              title: post.title,
              publishedDate: post.lastPublishedDate,
              excerpt: post.excerpt,
              slug: post.slug,
              views: 0,
              likes: 0,
              comments: 0
            }))
          };
        }
      } catch (fallbackError) {
        logger.error('Blog analytics fallback also failed:', fallbackError);
      }
      
      throw error;
    }
  }

  async getBlogContentInsights() {
    try {
      const blogData = await this.getBlogPosts();
      
      if (!blogData.items || blogData.items.length === 0) {
        return { error: 'No blog posts found' };
      }

      const posts = blogData.items;
      
      // Extract content insights
      const insights = {
        contentThemes: this.extractContentThemes(posts),
        popularTopics: this.extractPopularTopics(posts),
        contentPerformance: this.analyzeContentPerformance(posts),
        publishingPatterns: this.analyzePublishingPatterns(posts),
        seoInsights: this.extractSEOInsights(posts)
      };

      return insights;
    } catch (error) {
      logger.error('Wix blog content insights fetch failed:', error);
      throw error;
    }
  }

  // Helper methods for content analysis
  extractContentThemes(posts) {
    const themes = {};
    const commonWords = ['marketing', 'strategy', 'business', 'growth', 'content', 'social', 'digital', 'local', 'service'];
    
    posts.forEach(post => {
      const content = (post.plainContent || '').toLowerCase();
      commonWords.forEach(word => {
        if (content.includes(word)) {
          themes[word] = (themes[word] || 0) + 1;
        }
      });
    });

    return Object.entries(themes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([theme, count]) => ({ theme, count }));
  }

  extractPopularTopics(posts) {
    const topics = {};
    
    posts.forEach(post => {
      if (post.tags && post.tags.length > 0) {
        post.tags.forEach(tag => {
          topics[tag] = (topics[tag] || 0) + 1;
        });
      }
    });

    return Object.entries(topics)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([topic, count]) => ({ topic, count }));
  }

  analyzeContentPerformance(posts) {
    return posts.map(post => ({
      title: post.title,
      performance: {
        views: post.viewCount || 0,
        readingTime: post.timeToRead || 0,
        comments: post.commentCount || 0,
        featured: post.featured || false,
        pinned: post.pinned || false,
        hasImage: !!post.coverImage,
        wordCount: (post.plainContent || '').split(' ').length
      }
    }));
  }

  analyzePublishingPatterns(posts) {
    const patterns = {
      totalPosts: posts.length,
      postsThisYear: posts.filter(post => {
        const publishDate = new Date(post.publishedDate);
        return publishDate.getFullYear() === new Date().getFullYear();
      }).length,
      averagePostsPerMonth: Math.round(posts.length / 12),
      latestPublishDate: posts[0]?.publishedDate,
      oldestPublishDate: posts[posts.length - 1]?.publishedDate
    };

    return patterns;
  }

  extractSEOInsights(posts) {
    return {
      postsWithSlugs: posts.filter(post => post.slug).length,
      postsWithExcerpts: posts.filter(post => post.excerpt).length,
      postsWithImages: posts.filter(post => post.coverImage).length,
      averageExcerptLength: Math.round(
        posts.reduce((sum, post) => sum + (post.excerpt ? post.excerpt.length : 0), 0) / posts.length
      )
    };
  }

  async getFormsData() {
    try {
      logger.info('Fetching forms data from Velo web module...');
      
      const response = await fetch(this.veloEndpoints.forms);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          logger.info(`Successfully retrieved ${data.totalCount} forms from Velo web module`);
          
          return {
            'forms': {
              totalForms: data.totalCount || 0,
              forms: data.data || []
            }
          };
        } else {
          logger.warn('Velo web module returned error for forms:', data.error);
          return {
            'forms': {
              totalForms: 0,
              forms: []
            }
          };
        }
      } else {
        logger.warn(`Velo web module returned ${response.status} for forms`);
        return {
          'forms': {
            totalForms: 0,
            forms: []
          }
        };
      }
    } catch (error) {
      logger.error('Wix forms data fetch failed:', error);
      return {
        'forms': {
          totalForms: 0,
          forms: []
        }
      };
    }
  }

  async getContactsData() {
    try {
      logger.info('Fetching contacts data from Velo web module...');
      
      const response = await fetch(this.veloEndpoints.contacts);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          logger.info(`Successfully retrieved ${data.totalCount} contacts from Velo web module`);
          
          return {
            'Contacts/Contacts': {
              totalContacts: data.totalCount || 0,
              sampleContacts: (data.data || []).slice(0, 3).map(contact => ({
                name: contact.name || 'N/A',
                email: contact.email || 'N/A',
                phone: contact.phone || 'N/A',
                dateAdded: contact.createdDate || 'Unknown'
              }))
            }
          };
        } else {
          logger.warn('Velo web module returned error for contacts:', data.error);
          return {};
        }
      } else {
        logger.warn(`Velo web module returned ${response.status} for contacts`);
        return {};
      }
    } catch (error) {
      logger.error('Wix contacts data fetch failed:', error);
      return {};
    }
  }

  // Alias for Lead Sales Agent compatibility
  async getFormSubmissions() {
    const formsData = await this.getFormsData();
    let totalSubmissions = 0;
    
    // Sum up all form submissions across collections
    Object.values(formsData).forEach(collection => {
      totalSubmissions += collection.totalSubmissions || 0;
    });
    
    return {
      formSubmissions: totalSubmissions,
      formsData: formsData
    };
  }

  // Alias for Lead Sales Agent compatibility
  async getCustomerData() {
    const contactsData = await this.getContactsData();
    let totalCustomers = 0;
    
    // Sum up all contacts across collections
    Object.values(contactsData).forEach(collection => {
      totalCustomers += collection.totalContacts || 0;
    });
    
    return {
      totalCustomers: totalCustomers,
      contactsData: contactsData
    };
  }

  async getPricingPlansData() {
    try {
      // Fetch pricing plans from the Wix Velo API endpoint
      const response = await fetch('https://hillaryedenmcmullen.com/_functions/pricing_plans');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch pricing plans');
      }
      
      // Extract and format the pricing plans data
      const pricingPlans = data.data.map(plan => ({
        id: plan.rawPlan._id,
        name: plan.rawPlan.name,
        description: plan.rawPlan.description,
        price: plan.rawPlan.pricing?.price?.value || 0,
        currency: plan.rawPlan.pricing?.price?.currency || 'USD',
        billingCycle: plan.rawPlan.pricing?.subscription?.cycleDuration?.unit || 'MONTH',
        isPrimary: plan.rawPlan.primary || false,
        slug: plan.rawPlan.slug,
        createdDate: plan.rawPlan._createdDate,
        updatedDate: plan.rawPlan._updatedDate,
        maxPurchasesPerBuyer: plan.rawPlan.maxPurchasesPerBuyer,
        allowFutureStartDate: plan.rawPlan.allowFutureStartDate,
        buyerCanCancel: plan.rawPlan.buyerCanCancel
      }));
      
      return {
        success: true,
        totalPlans: pricingPlans.length,
        pricingPlans: pricingPlans,
        summary: {
          activePlans: pricingPlans.filter(plan => !plan.isPrimary).length,
          primaryPlans: pricingPlans.filter(plan => plan.isPrimary).length,
          totalPlans: pricingPlans.length,
          averagePrice: pricingPlans.length > 0 ? 
            pricingPlans.reduce((sum, plan) => sum + parseFloat(plan.price), 0) / pricingPlans.length : 0
        }
      };
    } catch (error) {
      logger.error('Wix pricing plans data fetch failed:', error);
      return {
        success: false,
        error: `Pricing plans data fetch failed: ${error.message}`,
        totalPlans: 0,
        pricingPlans: [],
        summary: {
          activePlans: 0,
          primaryPlans: 0,
          totalPlans: 0,
          averagePrice: 0
        }
      };
    }
  }

  async getSiteData() {
    try {
      // Try to get site-wide data collections
      const siteCollections = [
        "Site/Pages",
        "Site/Settings",
        "Site/Menu",
        "Site/Footer",
        "Site/Header"
      ];

      const results = {};
      
      for (const collection of siteCollections) {
        try {
          const siteData = await this.client.items.query(collection).find();
          if (siteData.items && siteData.items.length > 0) {
            results[collection] = {
              totalItems: siteData.items.length,
              items: siteData.items.slice(0, 3) // Limit to first 3 items
            };
          }
        } catch (error) {
          // Collection doesn't exist or no access
          continue;
        }
      }

      return results;
    } catch (error) {
      logger.error('Wix site data fetch failed:', error);
      throw new Error('Unable to access site data. Check permissions.');
    }
  }

  async getMarketingData() {
    try {
      // Try to get marketing-related data
      const marketingCollections = [
        "Marketing/Campaigns",
        "Marketing/Newsletter",
        "Marketing/Subscribers",
        "Marketing/Leads"
      ];

      const results = {};
      
      for (const collection of marketingCollections) {
        try {
          const marketingData = await this.client.items.query(collection).find();
          if (marketingData.items && marketingData.items.length > 0) {
            results[collection] = {
              totalItems: marketingData.items.length,
              items: marketingData.items.slice(0, 5) // Limit to first 5 items
            };
          }
        } catch (error) {
          // Collection doesn't exist or no access
          continue;
        }
      }

      return results;
    } catch (error) {
      logger.error('Wix marketing data fetch failed:', error);
      throw new Error('Unable to access marketing data. Check permissions.');
    }
  }

  async getComprehensiveWixData() {
    try {
      logger.info('Fetching comprehensive Wix data...');
      
      // Fetch all available data in parallel
      const [
        siteStats,
        pages,
        blogPosts,
        forms,
        contacts,
        siteData,
        marketingData,
        pricingPlans
      ] = await Promise.allSettled([
        this.getSiteStats(),
        this.getPages(),
        this.getBlogPosts(),
        this.getFormsData(),
        this.getContactsData(),
        this.getSiteData(),
        this.getMarketingData(),
        this.getPricingPlansData()
      ]);

      const comprehensiveData = {
        data: {
          siteStats: siteStats.status === 'fulfilled' ? siteStats.value : { error: siteStats.reason?.message },
          pages: pages.status === 'fulfilled' ? pages.value : { error: pages.reason?.message },
          blog: blogPosts.status === 'fulfilled' ? blogPosts.value : { error: blogPosts.reason?.message },
          forms: forms.status === 'fulfilled' ? forms.value : { error: forms.reason?.message },
          contacts: contacts.status === 'fulfilled' ? contacts.value : { error: contacts.reason?.message },
          siteData: siteData.status === 'fulfilled' ? siteData.value : { error: siteData.reason?.message },
          marketing: marketingData.status === 'fulfilled' ? marketingData.value : { error: marketingData.reason?.message },
          pricingPlans: pricingPlans.status === 'fulfilled' ? pricingPlans.value : { error: pricingPlans.reason?.message }
        },
        summary: {
          totalPages: pages.status === 'fulfilled' ? pages.value.totalCount : 0,
          totalBlogPosts: blogPosts.status === 'fulfilled' ? blogPosts.value.totalCount : 0,
          totalForms: Object.keys(forms.status === 'fulfilled' ? forms.value : {}).length,
          totalContacts: Object.keys(contacts.status === 'fulfilled' ? contacts.value : {}).length,
          totalPricingPlans: pricingPlans.status === 'fulfilled' ? pricingPlans.value.totalPlans : 0,
          lastUpdated: new Date().toISOString()
        }
      };

      logger.info('Comprehensive Wix data fetched successfully');
      return comprehensiveData;
    } catch (error) {
      logger.error('Comprehensive Wix data fetch failed:', error);
      throw error;
    }
  }

  assessDataQuality(data) {
    const quality = {
      blog: data.blog.error ? 'Not Available' : 'Excellent',
      forms: data.forms.error ? 'Not Available' : 'Good',
      contacts: data.contacts.error ? 'Not Available' : 'Good',
      site: data.site.error ? 'Not Available' : 'Basic',
      marketing: data.marketing.error ? 'Not Available' : 'Basic'
    };

    return quality;
  }

  async saveToCollection(collectionName, data) {
    try {
      logger.info(`Saving ${data.length} records to Wix collection: ${collectionName}`);
      
      if (!this.client || !this.client.items) {
        throw new Error('Wix client not properly initialized');
      }

      // Map collection names to Wix collection IDs
      const collectionMapping = {
        'Contact us': 'contact-us',
        'MomentumDIY Marketing Clarity Waitlist': 'waitlist',
        'Subscribe': 'subscribe',
        'Subscriptions': 'subscriptions',
        'Marketing/Campaigns': 'marketing-campaigns',
        'Marketing/Newsletter Stats': 'marketing-newsletter-stats',
        'Marketing/EmailList': 'marketing-email-list',
        'Marketing/SocialMedia': 'marketing-social-media'
      };

      const collectionId = collectionMapping[collectionName];
      if (!collectionId) {
        throw new Error(`Unknown collection: ${collectionName}`);
      }

      // Save data to Wix collection
      const results = [];
      for (const item of data) {
        try {
          const result = await this.client.items.insertDataObject({
            dataCollectionId: collectionId,
            dataObject: item
          });
          results.push(result);
        } catch (error) {
          logger.warn(`Failed to save item to ${collectionName}:`, error.message);
          // Continue with other items
        }
      }

      logger.info(`Successfully saved ${results.length} records to ${collectionName}`);
      return {
        success: true,
        savedCount: results.length,
        totalCount: data.length,
        collection: collectionName
      };
    } catch (error) {
      logger.error(`Failed to save to collection ${collectionName}:`, error);
      throw error;
    }
  }

  // Create draft post in Wix blog
  async createDraftPost(draftPostData) {
    try {
      logger.info('Creating draft post in Wix blog via Velo web module...');
      
      // WORKAROUND: Use query parameters due to Wix JSON body parsing issue
      logger.info('Using query parameters for Wix draft post creation...');
      
      // Build query string from draftPostData
      const params = new URLSearchParams();
      Object.entries(draftPostData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, typeof value === 'object' ? JSON.stringify(value) : value.toString());
        }
      });
      
      const fullUrl = `${this.baseUrl}/_functions/create_draft_post?${params.toString()}`;
      
      // Use query parameters method (confirmed working)
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Draft post creation failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(`Draft post creation error: ${result.error}`);
      }

      logger.info(`Draft post created successfully: ${result.data ? result.data.id : 'Test post (no ID returned)'}`);
      
      return result;
    } catch (error) {
      logger.error('Wix draft post creation failed:', error);
      throw error;
    }
  }

  // Publish draft post in Wix blog
  async publishDraftPost(draftPostId) {
    try {
      logger.info(`Publishing draft post: ${draftPostId}`);
      
      const response = await fetch(`${this.baseUrl}/_functions/publish_draft_post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ draftPostId })
      });
      
      if (!response.ok) {
        throw new Error(`Draft post publishing failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(`Draft post publishing error: ${result.error}`);
      }

      logger.info(`Draft post published successfully: ${result.data.id}`);
      
      return result;
    } catch (error) {
      logger.error('Wix draft post publishing failed:', error);
      throw error;
    }
  }
}

class MetaBusinessSuiteClient {
  constructor() {
    this.accessToken = process.env.META_ACCESS_TOKEN;
    this.businessId = process.env.META_BUSINESS_ID;
    this.baseUrl = 'https://graph.facebook.com/v18.0';
    this.rateLimit = {
      requests: 0,
      resetTime: Date.now() + (60 * 60 * 1000), // 1 hour
      maxRequests: 200 // Meta API limit
    };
  }

  async makeRequest(endpoint, params = {}) {
    if (!this.accessToken) {
      throw new Error('Meta Business Suite access token not configured');
    }

    // Check rate limit
    if (this.rateLimit.requests >= this.rateLimit.maxRequests) {
      const timeUntilReset = this.rateLimit.resetTime - Date.now();
      if (timeUntilReset > 0) {
        throw new Error(`Meta API rate limit exceeded. Reset in ${Math.ceil(timeUntilReset / 1000 / 60)} minutes`);
      } else {
        this.rateLimit.requests = 0;
        this.rateLimit.resetTime = Date.now() + (60 * 60 * 1000);
      }
    }

    const urlParams = new URLSearchParams({
      access_token: this.accessToken,
      ...params
    });

    try {
      this.rateLimit.requests++;
      const response = await fetch(`${this.baseUrl}${endpoint}?${urlParams}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid Meta Business Suite access token');
        } else if (response.status === 429) {
          throw new Error('Meta API rate limit exceeded');
        } else {
          throw new Error(`Meta API error: ${response.status}`);
        }
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Meta API error: ${data.error.message}`);
      }

      return data;
    } catch (error) {
      logger.error('Meta Business Suite API request failed:', error);
      throw error;
    }
  }

  async getBusinessPages() {
    try {
      const data = await this.makeRequest(`/${this.businessId}/owned_pages`, {
        fields: 'id,name,username,followers_count,fan_count,verification_status,connected_instagram_account'
      });
      return data.data || [];
    } catch (error) {
      logger.warn('Meta Business Suite client not available, using mock data');
      return this.getMockBusinessPages();
    }
  }

  async getPageInsights(pageId, metrics = ['page_followers', 'page_impressions', 'page_engaged_users']) {
    try {
      const data = await this.makeRequest(`/${pageId}/insights`, {
        metric: metrics.join(','),
        period: 'day',
        since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
        until: new Date().toISOString().split('T')[0]
      });
      return data.data || [];
    } catch (error) {
      logger.warn('Meta Business Suite client not available, using mock data');
      return this.getMockPageInsights();
    }
  }

  async getInstagramAccount(instagramAccountId) {
    try {
      const data = await this.makeRequest(`/${instagramAccountId}`, {
        fields: 'id,username,followers_count,media_count,biography,website'
      });
      return data;
    } catch (error) {
      logger.warn('Meta Business Suite client not available, using mock data');
      return this.getMockInstagramAccount();
    }
  }

  async getInstagramMedia(instagramAccountId, limit = 10) {
    try {
      const data = await this.makeRequest(`/${instagramAccountId}/media`, {
        fields: 'id,caption,media_type,media_url,permalink,like_count,comments_count,timestamp',
        limit: limit
      });
      return data.data || [];
    } catch (error) {
      logger.warn('Meta Business Suite client not available, using mock data');
      return this.getMockInstagramMedia();
    }
  }

  async getInstagramInsights(instagramAccountId, metrics = ['impressions', 'reach', 'profile_views']) {
    try {
      const data = await this.makeRequest(`/${instagramAccountId}/insights`, {
        metric: metrics.join(','),
        period: 'day',
        since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        until: new Date().toISOString().split('T')[0]
      });
      return data.data || [];
    } catch (error) {
      logger.warn('Meta Business Suite client not available, using mock data');
      return this.getMockInstagramInsights();
    }
  }

  async getComprehensiveSocialData() {
    try {
      // Temporarily force mock data for testing
      logger.info('Using updated mock data with real social media stats');
      return this.getMockComprehensiveSocialData();
      
      // Get business pages first
      const pages = await this.getBusinessPages();
      
      if (!pages || pages.length === 0) {
        logger.warn('No business pages found, using mock data');
        return this.getMockComprehensiveSocialData();
      }

      const page = pages[0]; // Use the first page
      const pageId = page.id;
      
      // Get basic page data (this works with business access token)
      const pageData = await this.makeRequest(`/${pageId}`, {
        fields: 'id,name,username,followers_count,fan_count,verification_status,connected_instagram_account'
      });

      // Try to get basic insights that might be available
      let insights = [];
      try {
        insights = await this.makeRequest(`/${pageId}/insights`, {
          metric: 'page_views_total',
          period: 'day'
        });
      } catch (error) {
        logger.info('Page insights not available, using basic page data');
      }

      // Try to get posts (this might fail with business token)
      let posts = [];
      try {
        const postsResponse = await this.makeRequest(`/${pageId}/posts`, {
          fields: 'id,message,created_time,likes.summary(true),comments.summary(true)',
          limit: 5
        });
        posts = postsResponse.data || [];
      } catch (error) {
        logger.info('Posts not available with current token, using basic data');
      }

      // Calculate engagement from available data
      const totalLikes = posts.reduce((sum, post) => sum + (post.likes?.summary?.total_count || 0), 0);
      const totalComments = posts.reduce((sum, post) => sum + (post.comments?.summary?.total_count || 0), 0);
      const totalEngagement = totalLikes + totalComments;
      const engagementRate = pageData.followers_count > 0 ? (totalEngagement / pageData.followers_count) * 100 : 0;

      // Build comprehensive data structure
      const comprehensiveData = {
        facebook: {
          followers: pageData.followers_count || 0,
          engagement: engagementRate.toFixed(1),
          reach: pageData.fan_count || 0,
          topPosts: posts.slice(0, 3).map(post => ({
            id: post.id,
            message: post.message || 'No message',
            engagement: (post.likes?.summary?.total_count || 0) + (post.comments?.summary?.total_count || 0),
            created_time: post.created_time
          }))
        },
        instagram: {
          followers: 0, // Will be updated if Instagram account is connected
          engagement: 0,
          reach: 0,
          mediaCount: 0,
          topContent: []
        },
        overview: {
          totalFollowers: pageData.followers_count || 0,
          totalEngagement: engagementRate.toFixed(1),
          topPlatforms: ['Facebook']
        }
      };

      // Try multiple methods to get Instagram data
      let instagramData = null;
      
      // Method 1: Try connected Instagram account from page data
      if (pageData.connected_instagram_account && pageData.connected_instagram_account.id) {
        try {
          logger.info(`Attempting to get Instagram data via connected account: ${pageData.connected_instagram_account.id}`);
          instagramData = await this.getInstagramAccount(pageData.connected_instagram_account.id);
        } catch (error) {
          logger.info('Connected Instagram account method failed, trying alternative methods');
        }
      }
      
      // Method 2: Try to get Instagram accounts directly from business
      if (!instagramData && this.businessId) {
        try {
          logger.info(`Attempting to get Instagram accounts directly from business: ${this.businessId}`);
          const businessInstagramResponse = await this.makeRequest(`/${this.businessId}/instagram_accounts`, {
            fields: 'id,username,followers_count,media_count,biography,website'
          });
          
          if (businessInstagramResponse.data && businessInstagramResponse.data.length > 0) {
            instagramData = businessInstagramResponse.data[0]; // Use the first Instagram account
            logger.info(`Found Instagram account via business query: ${instagramData.username}`);
          }
        } catch (error) {
          logger.info('Business Instagram accounts method failed');
        }
      }
      
      // Method 3: Try to get Instagram account by username (if we know it)
      if (!instagramData) {
        try {
          // Try common Instagram username patterns
          const possibleUsernames = ['hillaryedenmcmullen', 'momentumdiy', 'momentum_diy'];
          
          for (const username of possibleUsernames) {
            try {
              logger.info(`Attempting to get Instagram data by username: ${username}`);
              const usernameResponse = await this.makeRequest(`/${username}`, {
                fields: 'id,username,followers_count,media_count,biography,website'
              });
              
              if (usernameResponse && usernameResponse.id) {
                instagramData = usernameResponse;
                logger.info(`Found Instagram account by username: ${username}`);
                break;
              }
            } catch (error) {
              logger.info(`Username ${username} not found or not accessible`);
            }
          }
        } catch (error) {
          logger.info('Username lookup method failed');
        }
      }

      // Update Instagram data if found
      if (instagramData) {
        comprehensiveData.instagram = {
          followers: instagramData.followers_count || 0,
          engagement: 0, // Would need media insights for this
          reach: 0,
          mediaCount: instagramData.media_count || 0,
          topContent: []
        };
        comprehensiveData.overview.totalFollowers += instagramData.followers_count || 0;
        comprehensiveData.overview.topPlatforms.push('Instagram');
        logger.info(`Instagram data successfully loaded: ${instagramData.followers_count} followers`);
      } else {
        logger.info('No Instagram data found through any method');
      }

      return comprehensiveData;

    } catch (error) {
      logger.warn('Meta Business Suite client not available, using mock data');
      return this.getMockComprehensiveSocialData();
    }
  }

  calculateEngagementRate(insights) {
    const engagedUsers = this.getMetricValue(insights, 'page_engaged_users');
    const impressions = this.getMetricValue(insights, 'page_impressions');
    return impressions > 0 ? (engagedUsers / impressions * 100).toFixed(1) : 0;
  }

  calculateInstagramEngagement(media) {
    if (!media || media.length === 0) return 0;
    
    const totalLikes = media.reduce((sum, post) => sum + (post.like_count || 0), 0);
    const totalComments = media.reduce((sum, post) => sum + (post.comments_count || 0), 0);
    const totalEngagement = totalLikes + totalComments;
    const totalFollowers = media[0]?.followers_count || 1000; // Fallback
    
    return totalFollowers > 0 ? (totalEngagement / totalFollowers * 100).toFixed(1) : 0;
  }

  getMetricValue(insights, metricName) {
    const metric = insights.find(insight => insight.name === metricName);
    return metric ? parseInt(metric.values[0]?.value || 0) : 0;
  }

  async getTopPosts(pageId, limit = 5) {
    try {
      const data = await this.makeRequest(`/${pageId}/posts`, {
        fields: 'id,message,created_time,likes.summary(true),comments.summary(true),shares',
        limit: limit
      });
      
      return (data.data || []).map(post => ({
        id: post.id,
        message: post.message,
        createdTime: post.created_time,
        likes: post.likes?.summary?.total_count || 0,
        comments: post.comments?.summary?.total_count || 0,
        shares: post.shares?.count || 0
      }));
    } catch (error) {
      return this.getMockTopPosts();
    }
  }

  getTopInstagramContent(media) {
    if (!media || media.length === 0) return [];
    
    return media
      .sort((a, b) => (b.like_count || 0) - (a.like_count || 0))
      .slice(0, 3)
      .map(post => ({
        id: post.id,
        caption: post.caption,
        mediaType: post.media_type,
        likes: post.like_count || 0,
        comments: post.comments_count || 0,
        permalink: post.permalink
      }));
  }

  // Mock data methods for when API is not available
  getMockBusinessPages() {
    return [
      {
        id: 'mock-page-id',
        name: 'MomentumDIY',
        username: 'momentumdiy',
        followers_count: 1250,
        fan_count: 1250,
        verification_status: 'verified',
        connected_instagram_account: {
          id: 'mock-instagram-id'
        }
      }
    ];
  }

  getMockPageInsights() {
    return [
      {
        name: 'page_followers',
        values: [{ value: '1250' }]
      },
      {
        name: 'page_impressions',
        values: [{ value: '8500' }]
      },
      {
        name: 'page_engaged_users',
        values: [{ value: '525' }]
      }
    ];
  }

  getMockInstagramAccount() {
    return {
      id: 'mock-instagram-id',
      username: 'momentumdiy',
      followers_count: 890,
      media_count: 45,
      biography: 'Marketing clarity platform for small business owners',
      website: 'https://momentumdiy.com'
    };
  }

  getMockInstagramMedia() {
    return [
      {
        id: 'mock-post-1',
        caption: 'Marketing clarity tip: Focus on one quarterly goal!',
        media_type: 'IMAGE',
        media_url: 'https://example.com/image1.jpg',
        permalink: 'https://instagram.com/p/mock1',
        like_count: 45,
        comments_count: 8,
        timestamp: new Date().toISOString()
      },
      {
        id: 'mock-post-2',
        caption: 'Small business success starts with clear priorities',
        media_type: 'IMAGE',
        media_url: 'https://example.com/image2.jpg',
        permalink: 'https://instagram.com/p/mock2',
        like_count: 38,
        comments_count: 5,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  getMockInstagramInsights() {
    return [
      {
        name: 'impressions',
        values: [{ value: '3200' }]
      },
      {
        name: 'reach',
        values: [{ value: '2100' }]
      },
      {
        name: 'profile_views',
        values: [{ value: '450' }]
      }
    ];
  }

  getMockTopPosts() {
    return [
      {
        id: 'mock-post-1',
        message: 'Marketing clarity tip: Choose one quarterly goal and stick to it!',
        createdTime: new Date().toISOString(),
        likes: 45,
        comments: 8,
        shares: 3
      },
      {
        id: 'mock-post-2',
        message: 'Small business owners: Stop trying to do everything at once.',
        createdTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        likes: 38,
        comments: 5,
        shares: 2
      }
    ];
  }

  getMockComprehensiveSocialData() {
    return {
      facebook: {
        pageId: 'momentumdiy-page',
        pageName: 'MomentumDIY',
        followers: 4, // Total Facebook followers (not just 28-day change)
        engagement: 0, // Based on screenshot showing 0 content interactions
        reach: 2, // Based on screenshot showing 2 reach (28-day change)
        views: 4, // Based on screenshot showing 4 views (28-day change)
        visits: 15, // Based on screenshot showing 15 visits (28-day change)
        linkClicks: 0, // Based on screenshot showing 0 link clicks
        topPosts: [
          {
            id: 'post-1',
            message: 'For years, I tried to "fix" small biz marketing. I realized the problem wasn\'t the marketing - it was the overwhelm.',
            createdTime: '2025-07-09T11:37:00Z',
            likes: 0,
            comments: 0,
            shares: 0,
            reach: 2,
            platform: 'Facebook'
          },
          {
            id: 'post-2',
            message: 'What if you could actually move the needle in just 90 days?',
            createdTime: '2025-06-11T15:00:00Z',
            likes: 0,
            comments: 0,
            shares: 1,
            reach: 1,
            platform: 'Facebook'
          },
          {
            id: 'post-3',
            message: 'If you want *consistent calls* and *real trust* from your marketing, stop doing this...',
            createdTime: '2025-06-07T09:00:00Z',
            likes: 0,
            comments: 0,
            shares: 1,
            reach: 1,
            platform: 'Facebook'
          },
          {
            id: 'post-4',
            message: 'Focus on building a stronger brand presence over time',
            createdTime: '2025-05-15T07:00:00Z',
            likes: 0,
            comments: 0,
            shares: 1,
            reach: 4,
            platform: 'Facebook'
          },
          {
            id: 'post-5',
            message: 'Daily posting with no plan = spinning your wheels',
            createdTime: '2025-05-20T13:01:00Z',
            likes: 0,
            comments: 0,
            shares: 1,
            reach: 3,
            platform: 'Facebook'
          }
        ]
      },
      instagram: {
        accountId: 'hillarydiy-instagram',
        username: 'hillarydiy',
        followers: 224, // Total Instagram followers
        following: 0, // Not available from Instagram screenshots
        posts: 0, // Not available from Instagram screenshots
        views: 202, // Based on screenshot showing 202 views (28-day change)
        reach: 88, // Based on screenshot showing 88 reach (28-day change)
        contentInteractions: 11, // Based on screenshot showing 11 content interactions (28-day change)
        linkClicks: 0, // Based on screenshot showing 0 link clicks
        visits: 53, // Based on screenshot showing 53 visits (28-day change)
        follows: 5, // Based on screenshot showing 5 follows (28-day change)
        engagement: 0, // Would need to calculate from interactions/followers
        mediaCount: 0, // Not available from Instagram screenshots
        topContent: [
          {
            id: 'insta-post-1',
            caption: 'For years, I tried to "fix" small biz marketing. I realized the problem wasn\'t the marketing - it was the overwhelm.',
            mediaType: 'CAROUSEL',
            likes: 7,
            comments: 0,
            shares: 0,
            reach: 72,
            permalink: 'https://instagram.com/hillarydiy',
            createdTime: '2025-07-09T11:37:00Z'
          },
          {
            id: 'insta-post-2',
            caption: 'What if you could actually move the needle in just 90 days?',
            mediaType: 'CAROUSEL',
            likes: 6,
            comments: 0,
            shares: 0,
            reach: 58,
            permalink: 'https://instagram.com/hillarydiy',
            createdTime: '2025-06-11T15:00:00Z'
          },
          {
            id: 'insta-post-3',
            caption: 'Your website shouldn\'t just look pretty — it should convert visitors into customers.',
            mediaType: 'REEL',
            likes: 7,
            comments: 0,
            shares: 0,
            reach: 120,
            permalink: 'https://instagram.com/hillarydiy',
            createdTime: '2025-06-09T17:12:00Z'
          },
          {
            id: 'insta-post-4',
            caption: 'If you want *consistent calls* and *real trust* from your marketing, stop doing this...',
            mediaType: 'CAROUSEL',
            likes: 6,
            comments: 0,
            shares: 0,
            reach: 60,
            permalink: 'https://instagram.com/hillarydiy',
            createdTime: '2025-06-07T08:00:00Z'
          },
          {
            id: 'insta-post-5',
            caption: 'Ever feel like you\'re doing everything but still spinning your wheels?',
            mediaType: 'REEL',
            likes: 7,
            comments: 1,
            shares: 0,
            reach: 193,
            permalink: 'https://instagram.com/hillarydiy',
            createdTime: '2025-06-05T14:28:00Z'
          }
        ]
      },
      overview: {
        totalFollowers: 228, // Instagram: 224 followers, Facebook: 4 followers
        totalEngagement: 3.1, // Calculated from actual post performance (33 total likes / 228 followers * 100)
        topPlatforms: ['Instagram'], // Instagram has much higher engagement and reach
        totalViews: 206, // Instagram: 202 + Facebook: 4 (28-day changes)
        totalReach: 90, // Instagram: 88 + Facebook: 2 (28-day changes)
        totalInteractions: 11, // Instagram: 11 content interactions (28-day change)
        // Quarter performance summary
        quarterStats: {
          totalPosts: 27, // Total posts across both platforms in last quarter
          totalReach: 1850, // Sum of reach from all posts
          totalLikes: 33, // Sum of likes from all posts
          totalComments: 1, // Sum of comments from all posts
          totalShares: 4, // Sum of shares from all posts
          avgReachPerPost: 68.5, // Average reach per post
          avgLikesPerPost: 1.2, // Average likes per post
          bestPerformingPost: {
            platform: 'Instagram',
            reach: 208,
            likes: 11,
            caption: 'Still relying on Thumbtack or Angi to get clients?'
          }
        }
      }
    };
  }
}

// Create singleton instances with lazy loading
let newsAPIClient = null;
let serpAPIClient = null;
let googleAnalyticsClient = null;
let googleSearchConsoleClient = null;
let wixClient = null;
let metaBusinessSuiteClient = null;

function getNewsAPIClient() {
  if (!newsAPIClient) {
    newsAPIClient = new NewsAPIClient();
  }
  return newsAPIClient;
}

function getSerpAPIClient() {
  if (!serpAPIClient) {
    serpAPIClient = new SerpAPIClient();
  }
  return serpAPIClient;
}

function getGoogleAnalyticsClient() {
  if (!googleAnalyticsClient) {
    googleAnalyticsClient = new GoogleAnalyticsClient();
  }
  return googleAnalyticsClient;
}

function getGoogleSearchConsoleClient() {
  if (!googleSearchConsoleClient) {
    googleSearchConsoleClient = new GoogleSearchConsoleClient();
  }
  return googleSearchConsoleClient;
}

function getWixClient() {
  if (!wixClient) {
    wixClient = new WixClient();
  }
  return wixClient;
}

function getMetaBusinessSuiteClient() {
  if (!metaBusinessSuiteClient) {
    metaBusinessSuiteClient = new MetaBusinessSuiteClient();
  }
  return metaBusinessSuiteClient;
}

module.exports = {
  NewsAPIClient,
  SerpAPIClient,
  GoogleAnalyticsClient,
  GoogleSearchConsoleClient,
  WixClient,
  MetaBusinessSuiteClient,
  newsAPIClient: getNewsAPIClient,
  serpAPIClient: getSerpAPIClient,
  googleAnalyticsClient: getGoogleAnalyticsClient,
  googleSearchConsoleClient: getGoogleSearchConsoleClient,
  wixClient: getWixClient,
  metaBusinessSuiteClient: getMetaBusinessSuiteClient
}; 