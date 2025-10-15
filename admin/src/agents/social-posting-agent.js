const logger = require('../utils/logger');
const ResourceManager = require('../utils/resource-manager');
const MetaPostingIntegration = require('../integrations/meta-posting-integration');
const axios = require('axios');

class SocialPostingAgent {
  constructor() {
    this.name = 'Social Posting Agent';
    this.description = 'Automatically posts content to social media platforms via Meta Business Suite API';
    this.lastActivity = new Date();
    this.resourceManager = new ResourceManager();
    
    // Meta Business Suite Integration for Facebook & Instagram
    this.meta = new MetaPostingIntegration();
    
    // Legacy platform APIs (kept for fallback)
    this.platforms = {
      linkedin: new LinkedInAPI(),
      twitter: new TwitterAPI(),
      facebook: new FacebookAPI(),
      instagram: new InstagramAPI()
    };
    
    this.scheduler = new PostScheduler();
    this.contentAdapter = new ContentAdapter();
  }

  // Get agent information
  getInfo() {
    return {
      id: 'social-posting-agent',
      name: this.name,
      description: this.description,
      status: 'active',
      lastActivity: this.lastActivity,
      capabilities: [
        'Post content to LinkedIn, X (Twitter), Facebook, Instagram',
        'Schedule posts for optimal times',
        'Adapt content for each platform',
        'Monitor posting success and engagement',
        'Multi-platform campaign management'
      ],
      platforms: Object.keys(this.platforms)
    };
  }

  // Get available tasks
  getAvailableTasks() {
    return [
      {
        id: 'create-buffer-draft',
        name: 'Create Buffer Draft',
        description: 'Create a draft in Buffer for review before posting',
        parameters: ['content', 'platforms'],
        requiredInput: ['content']
      },
      {
        id: 'post-via-buffer',
        name: 'Post via Buffer',
        description: 'Post content directly to Buffer (immediate posting)',
        parameters: ['content', 'platforms'],
        requiredInput: ['content']
      },
      {
        id: 'test-buffer-connection',
        name: 'Test Buffer Connection',
        description: 'Test Buffer notification system',
        parameters: [],
        requiredInput: []
      },
      {
        id: 'get-recent-content',
        name: 'Get Recent Content',
        description: 'Get recent content saved for Buffer',
        parameters: [],
        requiredInput: []
      },
      {
        id: 'get-optimal-times',
        name: 'Get Optimal Posting Times',
        description: 'Get optimal posting times for platforms',
        parameters: ['platforms'],
        requiredInput: []
      },
      {
        id: 'post-content',
        name: 'Post Content to Platform (Legacy)',
        description: 'Post content to a specific social media platform (legacy method)',
        parameters: ['platform', 'content'],
        requiredInput: ['platform', 'content']
      },
      {
        id: 'post-to-all-platforms',
        name: 'Post to All Platforms (Legacy)',
        description: 'Post content to all connected social media platforms (legacy method)',
        parameters: ['content'],
        requiredInput: ['content']
      },
      {
        id: 'schedule-post',
        name: 'Schedule Post (Legacy)',
        description: 'Schedule a post for a specific time (legacy method)',
        parameters: ['platform', 'content', 'scheduledTime'],
        requiredInput: ['platform', 'content', 'scheduledTime']
      },
      {
        id: 'monitor-posts',
        name: 'Monitor Posts (Legacy)',
        description: 'Monitor engagement and performance of posts (legacy method)',
        parameters: ['platform', 'postId', 'timeframe'],
        requiredInput: ['platform']
      },
      {
        id: 'post-to-linkedin',
        name: 'Post to LinkedIn (Legacy)',
        description: 'Post content specifically to LinkedIn (legacy method)',
        parameters: ['content'],
        requiredInput: ['content']
      },
      {
        id: 'post-to-twitter',
        name: 'Post to X (Twitter) (Legacy)',
        description: 'Post content specifically to X (Twitter) (legacy method)',
        parameters: ['content'],
        requiredInput: ['content']
      },
      {
        id: 'post-to-facebook',
        name: 'Post to Facebook (Legacy)',
        description: 'Post content specifically to Facebook (legacy method)',
        parameters: ['content'],
        requiredInput: ['content']
      },
      {
        id: 'post-to-instagram',
        name: 'Post to Instagram',
        description: 'Post content specifically to Instagram',
        parameters: ['content'],
        requiredInput: ['content']
      }
    ];
  }

  // Update activity timestamp
  updateActivity() {
    this.lastActivity = new Date();
  }

  // Buffer Notification Integration Methods
  async createBufferDraft(input) {
    try {
      logger.info('Creating Buffer draft notification', { input });
      
      const { content, platforms = ['linkedin', 'twitter'] } = input;
      
      if (!content || !content.text) {
        throw new Error('Content text is required');
      }

      // Prepare content for Buffer
      const bufferContent = {
        text: content.text,
        platforms: platforms,
        scheduledTime: content.scheduledTime
      };

      // Send notification for Buffer draft
      const result = await this.buffer.notifyContentReady(bufferContent);
      
      logger.info('Buffer draft notification sent successfully', { result });
      
      return {
        success: true,
        message: 'Draft notification sent - copy content to Buffer',
        data: result,
        task: 'create-buffer-draft',
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      logger.error('Error creating Buffer draft notification', { error: error.message, input });
      throw error;
    }
  }

  // ==================== META API METHODS ====================
  
  /**
   * Post to all platforms via Meta API (Facebook & Instagram)
   */
  async postViaMeta(input) {
    try {
      logger.info('Posting via Meta Business Suite API', { input });
      
      const { posts, content } = input;
      
      // If posts provided (from approval database)
      if (posts && posts.content) {
        return await this.meta.postToAllPlatforms(posts.content);
      }
      
      // If direct content provided
      if (content) {
        return await this.meta.postToAllPlatforms(content);
      }
      
      throw new Error('No content provided for Meta posting');
    } catch (error) {
      logger.error('Error posting via Meta:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Post to Facebook via Meta API
   */
  async postToFacebookMeta(input) {
    try {
      logger.info('Posting to Facebook via Meta API', { input });
      
      const { content, pageId } = input;
      
      if (!content) {
        throw new Error('Content is required for Facebook posting');
      }

      // Get Facebook pages and use first one if pageId not specified
      const pages = await this.meta.getFacebookPages();
      const targetPageId = pageId || (pages[0]?.id);
      
      if (!targetPageId) {
        throw new Error('No Facebook page found');
      }

      return await this.meta.postToFacebook(targetPageId, content);
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
   * Post to Instagram via Meta API
   */
  async postToInstagramMeta(input) {
    try {
      logger.info('Posting to Instagram via Meta API', { input });
      
      const { content, accountId } = input;
      
      if (!content) {
        throw new Error('Content is required for Instagram posting');
      }

      // Get Instagram accounts and use first one if accountId not specified
      const accounts = await this.meta.getInstagramAccounts();
      const targetAccountId = accountId || (accounts[0]?.id);
      
      if (!targetAccountId) {
        throw new Error('No Instagram account found');
      }

      return await this.meta.postToInstagram(targetAccountId, content);
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
   * Create draft post on Facebook via Meta API
   */
  async createMetaDraft(input) {
    try {
      logger.info('Creating Meta draft post', { input });
      
      const { content, pageId } = input;
      
      if (!content) {
        throw new Error('Content is required for draft creation');
      }

      // Get Facebook pages and use first one if pageId not specified
      const pages = await this.meta.getFacebookPages();
      const targetPageId = pageId || (pages[0]?.id);
      
      if (!targetPageId) {
        throw new Error('No Facebook page found');
      }

      return await this.meta.createDraft(targetPageId, content);
    } catch (error) {
      logger.error('Error creating Meta draft:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // ==================== BUFFER METHODS (For LinkedIn & X) ====================

  async postViaBuffer(input) {
    try {
      logger.info('Sending Buffer posting notification', { input });
      
      const { content, platforms = ['linkedin', 'twitter'] } = input;
      
      if (!content || !content.text) {
        throw new Error('Content text is required');
      }

      // Prepare content for Buffer
      const bufferContent = {
        text: content.text,
        platforms: platforms,
        scheduledTime: content.scheduledTime
      };

      // Send notification for immediate posting
      const result = await this.buffer.notifyContentReady(bufferContent);
      
      logger.info('Buffer posting notification sent successfully', { result });
      
      return {
        success: true,
        message: 'Posting notification sent - copy content to Buffer',
        data: result,
        task: 'post-via-buffer',
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      logger.error('Error sending Buffer posting notification', { error: error.message, input });
      throw error;
    }
  }

  async testBufferConnection(input) {
    try {
      logger.info('Testing Buffer notification system');
      
      const result = await this.buffer.testNotification();
      
      logger.info('Buffer notification test completed', { result });
      
      return {
        success: true,
        message: 'Buffer notification system test completed',
        data: result,
        task: 'test-buffer-connection',
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      logger.error('Error testing Buffer notification system', { error: error.message });
      throw error;
    }
  }

  async getRecentContent(input) {
    try {
      logger.info('Getting recent Buffer content');
      
      const result = await this.buffer.getRecentContent();
      
      logger.info('Recent Buffer content retrieved', { count: result.length });
      
      return {
        success: true,
        message: 'Recent content retrieved successfully',
        data: result,
        task: 'get-recent-content',
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      logger.error('Error getting recent Buffer content', { error: error.message });
      throw error;
    }
  }

  // Main execute method
  async execute(task, input) {
    try {
      this.updateActivity();
      const normalizedTask = (task || '').toLowerCase().trim();
      console.log('SOCIAL POSTING AGENT TASK RECEIVED:', JSON.stringify(normalizedTask));
      logger.info(`Social Posting Agent executing task: ${normalizedTask}`, { input });

      // Map of task handlers
      const taskHandlers = {
        // Meta API Integration (Primary for Facebook & Instagram)
        'post-via-meta': async () => await this.postViaMeta(input),
        'post-to-facebook': async () => await this.postToFacebookMeta(input),
        'post-to-instagram': async () => await this.postToInstagramMeta(input),
        'create-meta-draft': async () => await this.createMetaDraft(input),
        
        // Legacy Buffer/Platform Methods (Fallback for LinkedIn & X)
        'post-via-buffer': async () => await this.postViaBuffer(input),
        'post-content': async () => await this.postContent(input),
        'post-to-all-platforms': async () => await this.postToAllPlatforms(input),
        'schedule-post': async () => await this.schedulePost(input),
        'get-optimal-times': async () => await this.getOptimalTimes(input),
        'monitor-posts': async () => await this.monitorPosts(input),
        'post-to-linkedin': async () => await this.postToLinkedIn(input),
        'post-to-twitter': async () => await this.postToTwitter(input)
      };

      if (taskHandlers[normalizedTask]) {
        return await taskHandlers[normalizedTask]();
      } else {
        console.log('SOCIAL POSTING AGENT AVAILABLE TASKS:', Object.keys(taskHandlers));
        throw new Error(`Unknown task: ${normalizedTask}`);
      }
    } catch (error) {
      logger.error(`Social Posting Agent error: ${error.message}`, { task, input, error });
      return {
        success: false,
        error: error.message,
        task: task,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Execute with progress tracking
  async executeWithProgress(task, input, onProgress) {
    try {
      this.updateActivity();
      const normalizedTask = (task || '').toLowerCase().trim();
      
      // Report initial progress
      if (onProgress) {
        onProgress({
          progress: 10,
          step: 'Initializing social posting task',
          steps: ['Initializing', 'Validating input', 'Executing task', 'Completing']
        });
      }

      // Validate input
      if (onProgress) {
        onProgress({
          progress: 30,
          step: 'Validating input parameters',
          steps: ['Initializing', 'Validating input', 'Executing task', 'Completing']
        });
      }

      // Execute task
      if (onProgress) {
        onProgress({
          progress: 60,
          step: 'Executing social posting task',
          steps: ['Initializing', 'Validating input', 'Executing task', 'Completing']
        });
      }

      const result = await this.execute(normalizedTask, input);

      // Report completion
      if (onProgress) {
        onProgress({
          progress: 100,
          step: 'Task completed successfully',
          steps: ['Initializing', 'Validating input', 'Executing task', 'Completing']
        });
      }

      return result;
    } catch (error) {
      logger.error(`Social Posting Agent executeWithProgress error: ${error.message}`, { task, input, error });
      return {
        success: false,
        error: error.message,
        task: task,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Post content to specific platform
  async postContent(input) {
    const { platform, content } = input;
    
    if (!platform || !content) {
      throw new Error('Platform and content are required');
    }

    if (!this.platforms[platform]) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    // Adapt content for platform
    const adaptedContent = this.contentAdapter.adaptForPlatform(content, platform);
    
    // Post to platform
    const result = await this.platforms[platform].post(adaptedContent);
    
    return {
      success: true,
      platform: platform,
      result: result,
      message: `Posted to ${platform} successfully`,
      timestamp: new Date().toISOString()
    };
  }

  // Post to all platforms
  async postToAllPlatforms(input) {
    const { content } = input;
    const results = {};
    
    for (const [platform, api] of Object.entries(this.platforms)) {
      try {
        const adaptedContent = this.contentAdapter.adaptForPlatform(content, platform);
        results[platform] = await api.post(adaptedContent);
      } catch (error) {
        results[platform] = { success: false, error: error.message };
      }
    }
    
    return {
      success: true,
      results: results,
      message: 'Posted to all platforms',
      timestamp: new Date().toISOString()
    };
  }

  // Platform-specific posting methods
  async postToLinkedIn(input) {
    return await this.postContent({ platform: 'linkedin', content: input.content });
  }

  async postToTwitter(input) {
    return await this.postContent({ platform: 'twitter', content: input.content });
  }

  async postToFacebook(input) {
    return await this.postContent({ platform: 'facebook', content: input.content });
  }

  async postToInstagram(input) {
    return await this.postContent({ platform: 'instagram', content: input.content });
  }

  // Schedule post
  async schedulePost(input) {
    const { platform, content, scheduledTime } = input;
    
    const scheduledPost = {
      platform,
      content,
      scheduledTime: new Date(scheduledTime),
      status: 'scheduled'
    };
    
    // Add to scheduler
    await this.scheduler.schedulePost(scheduledPost);
    
    return {
      success: true,
      scheduledPost: scheduledPost,
      message: `Post scheduled for ${platform} at ${scheduledTime}`,
      timestamp: new Date().toISOString()
    };
  }

  // Get optimal posting times
  async getOptimalTimes(input) {
    const { platform, audienceType = 'general' } = input;
    
    const optimalTimes = this.scheduler.getOptimalTimes(platform, audienceType);
    
    return {
      success: true,
      platform: platform,
      audienceType: audienceType,
      optimalTimes: optimalTimes,
      message: `Optimal posting times for ${platform}`,
      timestamp: new Date().toISOString()
    };
  }

  // Monitor posts
  async monitorPosts(input) {
    const { platform, postId, timeframe = '24h' } = input;
    
    if (!this.platforms[platform]) {
      throw new Error(`Unsupported platform: ${platform}`);
    }
    
    const insights = await this.platforms[platform].getInsights(postId, timeframe);
    
    return {
      success: true,
      platform: platform,
      postId: postId,
      timeframe: timeframe,
      insights: insights,
      message: `Post insights for ${platform}`,
      timestamp: new Date().toISOString()
    };
  }
}

// LinkedIn API Implementation
class LinkedInAPI {
  constructor() {
    this.baseURL = 'https://api.linkedin.com/v2';
    this.accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  }

  async post(content) {
    if (!this.accessToken) {
      return { success: false, error: 'LinkedIn access token not configured' };
    }

    try {
      const { text, hashtags, imageUrl } = content;
      
      // LinkedIn post payload
      const postData = {
        author: `urn:li:person:${process.env.LINKEDIN_PERSON_ID}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: text
            },
            shareMediaCategory: imageUrl ? 'IMAGE' : 'NONE',
            media: imageUrl ? [{
              status: 'READY',
              description: {
                text: text
              },
              media: imageUrl,
              title: {
                text: 'Post Image'
              }
            }] : []
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };

      const response = await axios.post(`${this.baseURL}/ugcPosts`, postData, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });

      return {
        success: true,
        postId: response.data.id,
        message: 'Posted to LinkedIn successfully'
      };
    } catch (error) {
      console.error('LinkedIn posting error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  async getInsights(postId, timeframe) {
    // LinkedIn insights implementation
    return {
      impressions: 0,
      engagement: 0,
      clicks: 0
    };
  }
}

// X (Twitter) API Implementation
class TwitterAPI {
  constructor() {
    this.baseURL = 'https://api.twitter.com/2';
    this.bearerToken = process.env.TWITTER_BEARER_TOKEN;
    this.apiKey = process.env.TWITTER_API_KEY;
    this.apiSecret = process.env.TWITTER_API_SECRET;
    this.accessToken = process.env.TWITTER_ACCESS_TOKEN;
    this.accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;
  }

  async post(content) {
    if (!this.bearerToken || !this.apiKey || !this.apiSecret) {
      return { success: false, error: 'Twitter API credentials not configured' };
    }

    try {
      const { text, hashtags, imageUrl } = content;
      
      // Twitter v2 API post
      const tweetData = {
        text: text
      };

      const response = await axios.post(`${this.baseURL}/tweets`, tweetData, {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        postId: response.data.data.id,
        message: 'Posted to Twitter successfully'
      };
    } catch (error) {
      console.error('Twitter posting error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  async getInsights(postId, timeframe) {
    // Twitter insights implementation
    return {
      impressions: 0,
      engagement: 0,
      retweets: 0
    };
  }
}

// Facebook API Implementation
class FacebookAPI {
  constructor() {
    this.baseURL = 'https://graph.facebook.com/v18.0';
    this.accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    this.pageId = process.env.FACEBOOK_PAGE_ID;
  }

  async post(content) {
    if (!this.accessToken || !this.pageId) {
      return { success: false, error: 'Facebook API credentials not configured' };
    }

    try {
      const { text, hashtags, imageUrl } = content;
      
      const postData = {
        message: text,
        access_token: this.accessToken
      };

      if (imageUrl) {
        postData.link = imageUrl;
      }

      const response = await axios.post(`${this.baseURL}/${this.pageId}/feed`, postData);

      return {
        success: true,
        postId: response.data.id,
        message: 'Posted to Facebook successfully'
      };
    } catch (error) {
      console.error('Facebook posting error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  async getInsights(postId, timeframe) {
    // Facebook insights implementation
    return {
      impressions: 0,
      reach: 0,
      engagement: 0
    };
  }
}

// Instagram API Implementation
class InstagramAPI {
  constructor() {
    this.baseURL = 'https://graph.facebook.com/v18.0';
    this.accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    this.businessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  }

  async post(content) {
    if (!this.accessToken || !this.businessAccountId) {
      return { success: false, error: 'Instagram API credentials not configured' };
    }

    try {
      const { text, hashtags, imageUrl } = content;
      
      if (!imageUrl) {
        return { success: false, error: 'Instagram requires an image URL' };
      }

      // Step 1: Create media container
      const mediaResponse = await axios.post(`${this.baseURL}/${this.businessAccountId}/media`, {
        image_url: imageUrl,
        caption: text,
        access_token: this.accessToken
      });

      const mediaId = mediaResponse.data.id;

      // Step 2: Publish the media
      const publishResponse = await axios.post(`${this.baseURL}/${this.businessAccountId}/media_publish`, {
        creation_id: mediaId,
        access_token: this.accessToken
      });

      return {
        success: true,
        postId: publishResponse.data.id,
        mediaId: mediaId,
        message: 'Posted to Instagram successfully'
      };
    } catch (error) {
      console.error('Instagram posting error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  async getInsights(postId, timeframe) {
    // Instagram insights implementation
    return {
      impressions: 0,
      reach: 0,
      engagement: 0
    };
  }
}

// Content Adapter
class ContentAdapter {
  adaptForPlatform(content, platform) {
    switch (platform) {
      case 'linkedin':
        return this.adaptForLinkedIn(content);
      case 'twitter':
        return this.adaptForTwitter(content);
      case 'facebook':
        return this.adaptForFacebook(content);
      case 'instagram':
        return this.adaptForInstagram(content);
      default:
        return content;
    }
  }

  adaptForLinkedIn(content) {
    // LinkedIn: Professional tone, longer posts, hashtags
    const { text, hashtags, imageUrl } = content;
    
    let adaptedText = text;
    
    // Add hashtags
    if (hashtags && hashtags.length > 0) {
      const hashtagString = hashtags
        .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
        .join(' ');
      adaptedText += `\n\n${hashtagString}`;
    }
    
    return {
      text: adaptedText,
      hashtags: hashtags,
      imageUrl: imageUrl
    };
  }

  adaptForTwitter(content) {
    // Twitter: Concise, engaging, hashtags, mentions
    const { text, hashtags, imageUrl } = content;
    
    let adaptedText = this.truncateTo280(text);
    
    // Add hashtags
    if (hashtags && hashtags.length > 0) {
      const hashtagString = hashtags
        .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
        .join(' ');
      
      // Check if we can add hashtags without exceeding limit
      if ((adaptedText + '\n\n' + hashtagString).length <= 280) {
        adaptedText += `\n\n${hashtagString}`;
      }
    }
    
    return {
      text: adaptedText,
      hashtags: hashtags,
      imageUrl: imageUrl
    };
  }

  adaptForFacebook(content) {
    // Facebook: Conversational, engaging, hashtags
    const { text, hashtags, imageUrl } = content;
    
    let adaptedText = text;
    
    // Add hashtags
    if (hashtags && hashtags.length > 0) {
      const hashtagString = hashtags
        .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
        .join(' ');
      adaptedText += `\n\n${hashtagString}`;
    }
    
    return {
      text: adaptedText,
      hashtags: hashtags,
      imageUrl: imageUrl
    };
  }

  adaptForInstagram(content) {
    // Instagram: Visual focus, hashtags, mentions, emojis
    const { text, hashtags, imageUrl } = content;
    
    let adaptedText = text;
    
    // Add hashtags (Instagram allows up to 30)
    if (hashtags && hashtags.length > 0) {
      const hashtagString = hashtags
        .slice(0, 30) // Instagram limit
        .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
        .join(' ');
      
      adaptedText += `\n\n${hashtagString}`;
    }
    
    // Instagram caption limit: 2,200 characters
    if (adaptedText.length > 2200) {
      adaptedText = adaptedText.substring(0, 2197) + '...';
    }
    
    return {
      text: adaptedText,
      hashtags: hashtags,
      imageUrl: imageUrl
    };
  }

  truncateTo280(text) {
    if (text.length <= 280) return text;
    return text.substring(0, 277) + '...';
  }
}

// Post Scheduler
class PostScheduler {
  constructor() {
    this.scheduledPosts = [];
  }

  getOptimalTimes(platform, audienceType = 'general') {
    const times = {
      linkedin: {
        general: ['9:00 AM', '12:00 PM', '5:00 PM'],
        business: ['8:00 AM', '11:00 AM', '4:00 PM'],
        creative: ['10:00 AM', '2:00 PM', '6:00 PM']
      },
      twitter: {
        general: ['8:00 AM', '12:00 PM', '3:00 PM', '7:00 PM'],
        business: ['7:00 AM', '11:00 AM', '2:00 PM', '6:00 PM'],
        creative: ['9:00 AM', '1:00 PM', '4:00 PM', '8:00 PM']
      },
      facebook: {
        general: ['9:00 AM', '1:00 PM', '3:00 PM'],
        business: ['8:00 AM', '12:00 PM', '2:00 PM'],
        creative: ['10:00 AM', '2:00 PM', '4:00 PM']
      },
      instagram: {
        general: ['8:00 AM', '1:00 PM', '5:00 PM'],
        business: ['7:00 AM', '12:00 PM', '4:00 PM'],
        creative: ['9:00 AM', '2:00 PM', '6:00 PM']
      }
    };

    return times[platform]?.[audienceType] || times[platform]?.general || times.linkedin.general;
  }

  async schedulePost(scheduledPost) {
    this.scheduledPosts.push(scheduledPost);
    
    // Schedule the post
    const delay = scheduledPost.scheduledTime.getTime() - Date.now();
    
    if (delay > 0) {
      setTimeout(async () => {
        // Execute the post
        console.log(`Executing scheduled post for ${scheduledPost.platform}`);
        // Implementation would go here
      }, delay);
    }
    
    return true;
  }
}

module.exports = SocialPostingAgent; 