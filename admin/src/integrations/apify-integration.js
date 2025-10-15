const logger = require('../utils/logger');

class ApifyIntegration {
  constructor() {
    this.apiToken = process.env.APIFY_API_TOKEN;
    this.baseUrl = 'https://api.apify.com/v2';
    this.actorIds = {
      // Web scraping actors
      googleSearch: 'nFJndFXA5zjCTuudP', // Google Search Results Scraper
      googleMaps: 'nwua9Gu5YrADL7ZDj', // Google Maps Scraper
      
      // Note: Other actors are placeholders - update with actual actor IDs when needed
      linkedinScraper: 'apify/linkedin-scraper',
      facebookScraper: 'apify/facebook-scraper',
      instagramScraper: 'apify/instagram-scraper',
      twitterScraper: 'apify/twitter-scraper',
      
      // E-commerce scraping
      amazonScraper: 'apify/amazon-scraper',
      shopifyScraper: 'apify/shopify-scraper',
      
      // Business data
      companyScraper: 'apify/company-scraper',
      emailFinder: 'apify/email-finder',
      phoneNumberFinder: 'apify/phone-number-finder',
      
      // SEO and analytics
      seoAnalyzer: 'apify/seo-analyzer',
      backlinkChecker: 'apify/backlink-checker',
      keywordAnalyzer: 'apify/keyword-analyzer',
      
      // Social media monitoring
      socialMediaMonitor: 'apify/social-media-monitor',
      hashtagAnalyzer: 'apify/hashtag-analyzer',
      
      // Lead generation
      leadGenerator: 'apify/lead-generator',
      contactFinder: 'apify/contact-finder',
      
      // Competitor analysis
      competitorAnalyzer: 'apify/competitor-analyzer',
      marketResearch: 'apify/market-research'
    };
  }

  /**
   * Run an Apify actor and get results
   * @param {string} actorId - The actor ID to run
   * @param {Object} input - Input parameters for the actor
   * @returns {Promise<Object>} Actor run results
   */
  async runActor(actorId, input = {}) {
    try {
      if (!this.apiToken) {
        throw new Error('Apify API token not configured');
      }

      logger.info(`Starting Apify actor: ${actorId}`);

      // Start the actor run
      const startResponse = await fetch(`${this.baseUrl}/acts/${actorId}/runs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: input
        })
      });

      if (!startResponse.ok) {
        if (startResponse.status === 402) {
          throw new Error(`Apify actor requires payment or insufficient credits. Status: ${startResponse.status}`);
        } else {
          throw new Error(`Failed to start Apify actor: ${startResponse.status}`);
        }
      }

      const runData = await startResponse.json();
      const runId = runData.data.id;

      logger.info(`Apify actor started with run ID: ${runId}`);

      // Wait for completion and get results
      const results = await this.waitForCompletion(runId);
      return results;

    } catch (error) {
      logger.error('Apify actor run failed:', error);
      throw error;
    }
  }

  /**
   * Wait for actor completion and get results
   * @param {string} runId - The run ID to monitor
   * @returns {Promise<Object>} Run results
   */
  async waitForCompletion(runId) {
    const maxWaitTime = 300000; // 5 minutes
    const checkInterval = 10000; // 10 seconds
    let elapsed = 0;

    while (elapsed < maxWaitTime) {
      try {
        const statusResponse = await fetch(`${this.baseUrl}/acts/runs/${runId}`, {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`
          }
        });

        if (!statusResponse.ok) {
          throw new Error(`Failed to check run status: ${statusResponse.status}`);
        }

        const statusData = await statusResponse.json();
        const status = statusData.data.status;

        if (status === 'SUCCEEDED') {
          logger.info(`Apify actor completed successfully: ${runId}`);
          return await this.getRunResults(runId);
        } else if (status === 'FAILED') {
          throw new Error(`Apify actor failed: ${statusData.data.meta?.errorMessage || 'Unknown error'}`);
        } else if (status === 'ABORTED') {
          throw new Error('Apify actor was aborted');
        }

        // Wait before next check
        await new Promise(resolve => setTimeout(resolve, checkInterval));
        elapsed += checkInterval;

      } catch (error) {
        logger.error('Error checking Apify run status:', error);
        throw error;
      }
    }

    throw new Error('Apify actor timed out');
  }

  /**
   * Get results from a completed run
   * @param {string} runId - The run ID
   * @returns {Promise<Object>} Run results
   */
  async getRunResults(runId) {
    try {
      const resultsResponse = await fetch(`${this.baseUrl}/acts/runs/${runId}/dataset/items`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`
        }
      });

      if (!resultsResponse.ok) {
        throw new Error(`Failed to get run results: ${resultsResponse.status}`);
      }

      const results = await resultsResponse.json();
      logger.info(`Retrieved ${results.length} results from Apify run: ${runId}`);
      return results;

    } catch (error) {
      logger.error('Failed to get Apify run results:', error);
      throw error;
    }
  }

  // ===== WEB SCRAPING METHODS =====

  /**
   * Scrape Google search results
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  async scrapeGoogleSearch(query, options = {}) {
    const input = {
      queries: query,
      maxRequestRetries: 3,
      maxConcurrency: 1,
      ...options
    };

    const results = await this.runActor(this.actorIds.googleSearch, input);
    return this.processGoogleSearchResults(results);
  }

  /**
   * Scrape LinkedIn profiles
   * @param {Array} profiles - Array of LinkedIn profile URLs
   * @param {Object} options - Scraping options
   * @returns {Promise<Array>} Profile data
   */
  async scrapeLinkedInProfiles(profiles, options = {}) {
    const input = {
      profileUrls: profiles,
      session: options.session || null,
      maxRequestRetries: 3,
      ...options
    };

    const results = await this.runActor(this.actorIds.linkedinScraper, input);
    return this.processLinkedInResults(results);
  }

  /**
   * Scrape Facebook pages/posts
   * @param {Array} urls - Array of Facebook URLs
   * @param {Object} options - Scraping options
   * @returns {Promise<Array>} Facebook data
   */
  async scrapeFacebook(urls, options = {}) {
    const input = {
      urls: urls,
      maxRequestRetries: 3,
      maxConcurrency: 1,
      ...options
    };

    const results = await this.runActor(this.actorIds.facebookScraper, input);
    return this.processFacebookResults(results);
  }

  /**
   * Scrape Instagram posts/profiles
   * @param {Array} urls - Array of Instagram URLs
   * @param {Object} options - Scraping options
   * @returns {Promise<Array>} Instagram data
   */
  async scrapeInstagram(urls, options = {}) {
    const input = {
      urls: urls,
      maxRequestRetries: 3,
      maxConcurrency: 1,
      ...options
    };

    const results = await this.runActor(this.actorIds.instagramScraper, input);
    return this.processInstagramResults(results);
  }

  // ===== BUSINESS DATA METHODS =====

  /**
   * Find company information
   * @param {Array} companies - Array of company names or domains
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Company data
   */
  async findCompanyData(companies, options = {}) {
    const input = {
      queries: companies,
      maxRequestRetries: 3,
      ...options
    };

    const results = await this.runActor(this.actorIds.companyScraper, input);
    return this.processCompanyResults(results);
  }

  /**
   * Find email addresses
   * @param {Array} domains - Array of domains to search
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Email data
   */
  async findEmails(domains, options = {}) {
    const input = {
      domains: domains,
      maxRequestRetries: 3,
      ...options
    };

    const results = await this.runActor(this.actorIds.emailFinder, input);
    return this.processEmailResults(results);
  }

  /**
   * Find phone numbers
   * @param {Array} companies - Array of company names
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Phone number data
   */
  async findPhoneNumbers(companies, options = {}) {
    const input = {
      queries: companies,
      maxRequestRetries: 3,
      ...options
    };

    const results = await this.runActor(this.actorIds.phoneNumberFinder, input);
    return this.processPhoneResults(results);
  }

  // ===== SEO & ANALYTICS METHODS =====

  /**
   * Analyze SEO for websites
   * @param {Array} urls - Array of URLs to analyze
   * @param {Object} options - Analysis options
   * @returns {Promise<Array>} SEO analysis data
   */
  async analyzeSEO(urls, options = {}) {
    const input = {
      urls: urls,
      maxRequestRetries: 3,
      ...options
    };

    const results = await this.runActor(this.actorIds.seoAnalyzer, input);
    return this.processSEOResults(results);
  }

  /**
   * Check backlinks for websites
   * @param {Array} urls - Array of URLs to check
   * @param {Object} options - Check options
   * @returns {Promise<Array>} Backlink data
   */
  async checkBacklinks(urls, options = {}) {
    const input = {
      urls: urls,
      maxRequestRetries: 3,
      ...options
    };

    const results = await this.runActor(this.actorIds.backlinkChecker, input);
    return this.processBacklinkResults(results);
  }

  /**
   * Analyze keywords
   * @param {Array} keywords - Array of keywords to analyze
   * @param {Object} options - Analysis options
   * @returns {Promise<Array>} Keyword analysis data
   */
  async analyzeKeywords(keywords, options = {}) {
    const input = {
      keywords: keywords,
      maxRequestRetries: 3,
      ...options
    };

    const results = await this.runActor(this.actorIds.keywordAnalyzer, input);
    return this.processKeywordResults(results);
  }

  // ===== LEAD GENERATION METHODS =====

  /**
   * Generate leads for specific criteria
   * @param {Object} criteria - Lead generation criteria
   * @param {Object} options - Generation options
   * @returns {Promise<Array>} Lead data
   */
  async generateLeads(criteria, options = {}) {
    const input = {
      ...criteria,
      maxRequestRetries: 3,
      ...options
    };

    const results = await this.runActor(this.actorIds.leadGenerator, input);
    return this.processLeadResults(results);
  }

  /**
   * Find contacts for companies
   * @param {Array} companies - Array of company names
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Contact data
   */
  async findContacts(companies, options = {}) {
    const input = {
      companies: companies,
      maxRequestRetries: 3,
      ...options
    };

    const results = await this.runActor(this.actorIds.contactFinder, input);
    return this.processContactResults(results);
  }

  // ===== COMPETITOR ANALYSIS METHODS =====

  /**
   * Analyze competitors
   * @param {Array} competitors - Array of competitor domains
   * @param {Object} options - Analysis options
   * @returns {Promise<Array>} Competitor analysis data
   */
  async analyzeCompetitors(competitors, options = {}) {
    const input = {
      competitors: competitors,
      maxRequestRetries: 3,
      ...options
    };

    const results = await this.runActor(this.actorIds.competitorAnalyzer, input);
    return this.processCompetitorResults(results);
  }

  /**
   * Conduct market research
   * @param {Object} researchParams - Research parameters
   * @param {Object} options - Research options
   * @returns {Promise<Array>} Market research data
   */
  async conductMarketResearch(researchParams, options = {}) {
    const input = {
      ...researchParams,
      maxRequestRetries: 3,
      ...options
    };

    const results = await this.runActor(this.actorIds.marketResearch, input);
    return this.processMarketResearchResults(results);
  }

  // ===== DATA PROCESSING METHODS =====

  processGoogleSearchResults(results) {
    return results.map(result => ({
      title: result.title,
      url: result.url,
      snippet: result.snippet,
      position: result.position,
      domain: new URL(result.url).hostname,
      timestamp: new Date().toISOString()
    }));
  }

  processLinkedInResults(results) {
    return results.map(result => ({
      name: result.name,
      headline: result.headline,
      company: result.company,
      location: result.location,
      profileUrl: result.profileUrl,
      connections: result.connections,
      timestamp: new Date().toISOString()
    }));
  }

  processFacebookResults(results) {
    return results.map(result => ({
      title: result.title,
      content: result.content,
      likes: result.likes,
      comments: result.comments,
      shares: result.shares,
      url: result.url,
      timestamp: new Date().toISOString()
    }));
  }

  processInstagramResults(results) {
    return results.map(result => ({
      username: result.username,
      caption: result.caption,
      likes: result.likes,
      comments: result.comments,
      imageUrl: result.imageUrl,
      timestamp: new Date().toISOString()
    }));
  }

  processCompanyResults(results) {
    return results.map(result => ({
      name: result.name,
      domain: result.domain,
      industry: result.industry,
      size: result.size,
      location: result.location,
      description: result.description,
      timestamp: new Date().toISOString()
    }));
  }

  processEmailResults(results) {
    return results.map(result => ({
      email: result.email,
      domain: result.domain,
      confidence: result.confidence,
      source: result.source,
      timestamp: new Date().toISOString()
    }));
  }

  processPhoneResults(results) {
    return results.map(result => ({
      phone: result.phone,
      company: result.company,
      confidence: result.confidence,
      source: result.source,
      timestamp: new Date().toISOString()
    }));
  }

  processSEOResults(results) {
    return results.map(result => ({
      url: result.url,
      title: result.title,
      metaDescription: result.metaDescription,
      h1Tags: result.h1Tags,
      h2Tags: result.h2Tags,
      images: result.images,
      links: result.links,
      seoScore: result.seoScore,
      timestamp: new Date().toISOString()
    }));
  }

  processBacklinkResults(results) {
    return results.map(result => ({
      url: result.url,
      backlinks: result.backlinks,
      domainAuthority: result.domainAuthority,
      spamScore: result.spamScore,
      timestamp: new Date().toISOString()
    }));
  }

  processKeywordResults(results) {
    return results.map(result => ({
      keyword: result.keyword,
      searchVolume: result.searchVolume,
      difficulty: result.difficulty,
      cpc: result.cpc,
      competition: result.competition,
      timestamp: new Date().toISOString()
    }));
  }

  processLeadResults(results) {
    return results.map(result => ({
      name: result.name,
      email: result.email,
      company: result.company,
      title: result.title,
      phone: result.phone,
      linkedin: result.linkedin,
      confidence: result.confidence,
      timestamp: new Date().toISOString()
    }));
  }

  processContactResults(results) {
    return results.map(result => ({
      name: result.name,
      email: result.email,
      phone: result.phone,
      company: result.company,
      title: result.title,
      source: result.source,
      timestamp: new Date().toISOString()
    }));
  }

  processCompetitorResults(results) {
    return results.map(result => ({
      domain: result.domain,
      traffic: result.traffic,
      keywords: result.keywords,
      backlinks: result.backlinks,
      socialMedia: result.socialMedia,
      content: result.content,
      timestamp: new Date().toISOString()
    }));
  }

  processMarketResearchResults(results) {
    return results.map(result => ({
      topic: result.topic,
      insights: result.insights,
      trends: result.trends,
      opportunities: result.opportunities,
      threats: result.threats,
      timestamp: new Date().toISOString()
    }));
  }

  // ===== UTILITY METHODS =====

  /**
   * Test Apify connection
   * @returns {Promise<Object>} Connection test result
   */
  async testConnection() {
    try {
      if (!this.apiToken) {
        return { success: false, error: 'Apify API token not configured' };
      }

      // Test with a simple actor
      const testResults = await this.scrapeGoogleSearch('test query', { maxRequestRetries: 1 });
      
      return {
        success: true,
        message: 'Apify connection successful',
        resultsCount: testResults.length
      };
    } catch (error) {
      if (error.message.includes('402') || error.message.includes('payment') || error.message.includes('credits')) {
        return {
          success: false,
          error: 'Apify actor requires payment or insufficient credits. This is a paid service.',
          details: 'The Google Search Scraper actor requires credits to run. You can add credits to your Apify account or use alternative data sources.',
          alternative: 'Consider using Google Search Console API or other free alternatives for search data.'
        };
      }
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get available actors
   * @returns {Object} Available actor IDs
   */
  getAvailableActors() {
    return this.actorIds;
  }
}

module.exports = ApifyIntegration; 