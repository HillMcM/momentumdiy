/**
 * Meta Business Suite Posting Integration
 * 
 * Direct API posting to Facebook and Instagram
 * Uses Meta Business Suite API (Graph API)
 */

const logger = require('../utils/logger');

class MetaPostingIntegration {
  constructor() {
    this.accessToken = process.env.META_ACCESS_TOKEN;
    this.businessId = process.env.META_BUSINESS_ID;
    this.baseUrl = 'https://graph.facebook.com/v18.0';
    
    if (!this.accessToken || !this.businessId) {
      logger.warn('Meta Business Suite credentials not configured for posting');
    }
  }

  /**
   * Make API request to Meta Graph API
   */
  async makeRequest(endpoint, method = 'GET', data = {}) {
    if (!this.accessToken) {
      throw new Error('Meta access token not configured');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Add access token to data
    const requestData = {
      ...data,
      access_token: this.accessToken,
    };

    if (method === 'GET') {
      const params = new URLSearchParams(requestData);
      const response = await fetch(`${url}?${params}`);
      return response.json();
    } else {
      options.body = JSON.stringify(requestData);
      const response = await fetch(url, options);
      return response.json();
    }
  }

  /**
   * Get Facebook pages owned by the business
   */
  async getFacebookPages() {
    try {
      const result = await this.makeRequest(`/${this.businessId}/owned_pages`, 'GET', {
        fields: 'id,name,username,access_token,followers_count,fan_count'
      });
      
      return result.data || [];
    } catch (error) {
      logger.error('Error getting Facebook pages:', error);
      throw error;
    }
  }

  /**
   * Get Instagram accounts connected to business
   */
  async getInstagramAccounts() {
    try {
      const pages = await this.getFacebookPages();
      const instagramAccounts = [];

      for (const page of pages) {
        try {
          const result = await this.makeRequest(`/${page.id}`, 'GET', {
            fields: 'instagram_business_account',
            access_token: page.access_token
          });

          if (result.instagram_business_account) {
            instagramAccounts.push({
              ...result.instagram_business_account,
              pageId: page.id,
              pageName: page.name,
              pageAccessToken: page.access_token
            });
          }
        } catch (error) {
          logger.warn(`No Instagram account for page ${page.name}`);
        }
      }

      return instagramAccounts;
    } catch (error) {
      logger.error('Error getting Instagram accounts:', error);
      throw error;
    }
  }

  /**
   * Post to Facebook Page
   * @param {string} pageId - Facebook Page ID
   * @param {Object} content - Post content
   */
  async postToFacebook(pageId, content) {
    try {
      // Get page access token
      const pages = await this.getFacebookPages();
      const page = pages.find(p => p.id === pageId);
      
      if (!page) {
        throw new Error(`Page ${pageId} not found`);
      }

      logger.info(`Posting to Facebook page: ${page.name}`);

      const postData = {
        message: content.message || content.text || content.content,
        published: content.published !== false, // Default to published
        access_token: page.access_token
      };

      // Add link if provided
      if (content.link) {
        postData.link = content.link;
      }

      const result = await this.makeRequest(`/${pageId}/feed`, 'POST', postData);

      if (result.error) {
        throw new Error(result.error.message);
      }

      logger.info(`✅ Posted to Facebook: ${result.id}`);

      return {
        success: true,
        postId: result.id,
        platform: 'facebook',
        pageId: pageId,
        pageName: page.name,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error posting to Facebook:', error);
      return {
        success: false,
        error: error.message,
        platform: 'facebook',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Post to Instagram (via Facebook Page)
   * @param {string} instagramAccountId - Instagram Business Account ID
   * @param {Object} content - Post content
   */
  async postToInstagram(instagramAccountId, content) {
    try {
      const instagramAccounts = await this.getInstagramAccounts();
      const account = instagramAccounts.find(a => a.id === instagramAccountId);

      if (!account) {
        throw new Error(`Instagram account ${instagramAccountId} not found`);
      }

      logger.info(`Posting to Instagram account: ${account.id}`);

      // Instagram requires image URL or carousel
      // For now, create a container for a text post (Note: Instagram requires media)
      const containerData = {
        caption: content.message || content.text || content.content,
        access_token: account.pageAccessToken
      };

      // If image URL provided
      if (content.imageUrl) {
        containerData.image_url = content.imageUrl;
      }

      // Create media container
      const containerResult = await this.makeRequest(
        `/${instagramAccountId}/media`,
        'POST',
        containerData
      );

      if (containerResult.error) {
        throw new Error(containerResult.error.message);
      }

      // Publish the container
      const publishResult = await this.makeRequest(
        `/${instagramAccountId}/media_publish`,
        'POST',
        {
          creation_id: containerResult.id,
          access_token: account.pageAccessToken
        }
      );

      if (publishResult.error) {
        throw new Error(publishResult.error.message);
      }

      logger.info(`✅ Posted to Instagram: ${publishResult.id}`);

      return {
        success: true,
        postId: publishResult.id,
        platform: 'instagram',
        accountId: instagramAccountId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error posting to Instagram:', error);
      return {
        success: false,
        error: error.message,
        platform: 'instagram',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Post to all configured platforms
   * @param {Object} content - Content with platform-specific posts
   */
  async postToAllPlatforms(content) {
    const results = [];

    try {
      // Get pages and accounts
      const facebookPages = await this.getFacebookPages();
      const instagramAccounts = await this.getInstagramAccounts();

      // Post to Facebook (first page)
      if (facebookPages.length > 0 && content.facebook) {
        const fbResult = await this.postToFacebook(facebookPages[0].id, {
          message: content.facebook.content || content.facebook.message,
          link: content.facebook.link
        });
        results.push(fbResult);
      }

      // Post to Instagram (first account)
      if (instagramAccounts.length > 0 && content.instagram) {
        const igResult = await this.postToInstagram(instagramAccounts[0].id, {
          message: content.instagram.content || content.instagram.message,
          imageUrl: content.instagram.imageUrl
        });
        results.push(igResult);
      }

      const successCount = results.filter(r => r.success).length;
      logger.info(`Posted to ${successCount}/${results.length} platforms successfully`);

      return {
        success: successCount > 0,
        results,
        summary: `${successCount}/${results.length} posts successful`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error posting to platforms:', error);
      return {
        success: false,
        error: error.message,
        results,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Create draft post (unpublished)
   * @param {string} pageId - Facebook Page ID
   * @param {Object} content - Post content
   */
  async createDraft(pageId, content) {
    return this.postToFacebook(pageId, {
      ...content,
      published: false // Save as draft
    });
  }
}

module.exports = MetaPostingIntegration;

