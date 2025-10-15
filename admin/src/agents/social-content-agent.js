const logger = require('../utils/logger');
const ResourceManager = require('../utils/resource-manager');
const ContentManager = require('../utils/content-manager');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const BaseAgent = require('./base-agent');
const { getFullBrandContext } = require('../utils/brand-knowledge');

class SocialContentAgent extends BaseAgent {
  constructor(resourceManager = null) {
    super(); // Call BaseAgent constructor
    
    this.name = 'Social Content Agent';
    this.description = 'AI-powered social media specialist that converts copywriting content into platform-optimized social posts with brand-consistent imagery';
    this.status = 'active';
    this.lastActivity = new Date().toISOString();
    
    // Use shared resource manager or create new one
    this.resourceManager = resourceManager || new ResourceManager();
    
    // Initialize Google Generative AI for Gemini Flash 2.5 image generation
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
    this.geminiModel = null; // Initialize on first use
    
    // Initialize Content Manager for user-uploaded content
    this.contentManager = new ContentManager();
    
    // Load comprehensive brand context from brand knowledge module
    const fullBrandContext = getFullBrandContext();
    this.brandContext = {
      ...fullBrandContext.business,
      ...fullBrandContext.visualIdentity,
      voice: fullBrandContext.voice,
      targetAudience: fullBrandContext.targetAudience,
      // Keep copywriting patterns for social content generation
      copywritingStyle: {
        hooks: 'Question-based openings that address marketing overwhelm and need for clarity',
        tone: 'Conversational, empathetic, empowering, anti-overwhelm',
        structure: 'Marketing Problem → Clarity Solution → Focused Benefit format',
        highlights: 'Key phrases and brand name highlighted in coral',
        patterns: [
          'What if [marketing overwhelm] was actually [single quarterly goal]?',
          'Most [marketing tools] are built for [marketers]. Not for [busy small business owners].',
          'They assume you have [time/resources you don\'t have].',
          '[MomentumDIY] is different.',
          'It\'s a [marketing clarity platform]. [Single quarterly goal system]. Built to [bring focus]—not [create more overwhelm].',
          'For the folks who say: "[I don\'t know where to start with marketing]"',
          '[MomentumDIY] doesn\'t just give you [marketing tools]. It helps you [achieve one focused goal].'
        ]
      }
    };
    
    // Platform configurations
    this.platforms = {
      x: {
        name: 'X (Twitter)',
        maxLength: 280,
        imageAspectRatio: '16:9',
        imageSize: '1024x1024',
        hashtagLimit: 2,
        tone: 'Conversational, trending, engaging',
        contentTypes: ['tweets', 'threads', 'polls', 'spaces'],
        bestPractices: [
          'Use trending hashtags sparingly',
          'Include clear call-to-action',
          'Engage with community',
          'Share behind-the-scenes content'
        ]
      },
      linkedin: {
        name: 'LinkedIn',
        maxLength: 3000,
        imageAspectRatio: '1.91:1',
        imageSize: '1024x1024',
        hashtagLimit: 5,
        tone: 'Professional, educational, thought leadership',
        contentTypes: ['posts', 'articles', 'carousels', 'polls'],
        bestPractices: [
          'Share industry insights',
          'Include professional context',
          'Use data and statistics',
          'Network and connect'
        ]
      },
      facebook: {
        name: 'Facebook',
        maxLength: 63206,
        imageAspectRatio: '1.91:1',
        imageSize: '1024x1024',
        hashtagLimit: 3,
        tone: 'Community-focused, personal, engaging',
        contentTypes: ['posts', 'stories', 'reels', 'groups'],
        bestPractices: [
          'Build community engagement',
          'Share personal stories',
          'Use Facebook groups',
          'Create shareable content'
        ]
      },
      instagram: {
        name: 'Instagram',
        maxLength: 2200,
        imageAspectRatio: '1:1',
        imageSize: '1024x1024',
        hashtagLimit: 30,
        tone: 'Visual, aspirational, lifestyle-focused',
        contentTypes: ['posts', 'stories', 'reels', 'carousels'],
        bestPractices: [
          'High-quality visuals',
          'Use relevant hashtags',
          'Engage with stories',
          'Show behind-the-scenes'
        ]
      },
      reddit: {
        name: 'Reddit',
        maxLength: 40000,
        imageAspectRatio: '16:9',
        imageSize: '1024x1024',
        hashtagLimit: 0,
        tone: 'Community-focused, authentic, helpful',
        contentTypes: ['posts', 'comments', 'guides', 'discussions'],
        bestPractices: [
          'Follow subreddit rules',
          'Be authentic and helpful',
          'Engage in discussions',
          'Share valuable content'
        ]
      }
    };
    
    // Content history tracking
    this.contentHistory = {
      posts: [],
      images: [],
      campaigns: [],
      performance: {
        engagement: {},
        reach: {},
        conversions: {}
      },
      lastUpdated: new Date().toISOString()
    };
    
    // Image generation preferences - Updated based on carousel posts
    this.imagePreferences = {
      style: 'Clean, graphic, minimalist cartoon style with bold outlines',
      colorPalette: 'Deep navy backgrounds (#191628) with coral accents (#ef8e81) and white text (#ffffff)',
      subjects: [
        'Marketing tools and platforms',
        'Small business scenarios',
        'Busy entrepreneurs',
        'Marketing challenges',
        'Solution-focused imagery',
        'Human-centered marketing',
        'Simple actionable steps',
        'Business transformation'
      ],
      composition: [
        'Grid-based layouts (3x3, 2x2, etc.)',
        'Strategic octopus placement in corners',
        'Dark navy backgrounds with subtle gradients',
        'White text with coral highlights',
        'Bold, simple shapes and outlines',
        'Professional yet approachable aesthetic'
      ],
      brandElements: [
        'Coral octopus with bright yellow eyes and black pupils',
        'Thick black outlines for octopus',
        'Poppins font family for all text',
        'Deep navy (#191628) backgrounds',
        'Coral (#ef8e81) highlights for key phrases',
        'White (#ffffff) main text for contrast',
        'Strategic octopus placement creating dynamic visual hierarchy'
      ],
      carouselStyle: {
        layout: 'Multiple square panels arranged in grid',
        background: 'Deep navy with subtle gradient to lighter shade',
        textStyle: 'White text with coral highlights for key phrases',
        octopusPlacement: 'Peeking from corners, creating playful interaction',
        visualFlow: 'Left to right, top to bottom reading pattern',
        emphasis: 'Key phrases and brand name highlighted in coral'
      }
    };
  }

  // Get agent info
  getInfo() {
    return {
      id: 'social-content-agent',
      name: this.name,
      description: this.description,
      status: this.status,
      capabilities: this.getCapabilities(),
      lastActivity: this.lastActivity,
      brandIdentity: this.brandIdentity,
      platforms: Object.keys(this.platforms)
    };
  }

  // Get capabilities
  getCapabilities() {
    return [
      'Platform-Optimized Content Creation',
      'Brand-Consistent Image Generation',
      'Multi-Platform Campaign Management',
      'Content Calendar Planning',
      'Hashtag Strategy Development',
      'Engagement Optimization',
      'Visual Brand Consistency',
      'Cross-Platform Content Adaptation',
      'Trend Integration',
      'Community Engagement',
      'Performance Analytics',
      'Content Repurposing'
    ];
  }

  // Update last activity
  updateActivity() {
    this.lastActivity = new Date().toISOString();
  }

  // Main execution method
  async execute(task, input) {
    try {
      this.updateActivity();
      const normalizedTask = (task || '').toLowerCase().trim();
      logger.info(`Social Content Agent executing task: ${normalizedTask}`, { input });

      // Map of task handlers
      const taskHandlers = {
        'create-social-post': async () => await this.createSocialPost(input),
        'create-multi-platform-campaign': async () => await this.createMultiPlatformCampaign(input),
        'generate-brand-image': async () => await this.generateBrandImage(input),
        'optimize-content-for-platform': async () => await this.optimizeContentForPlatform(input),
        'create-content-calendar': async () => await this.createContentCalendar(input),
        'analyze-trending-topics': async () => await this.analyzeTrendingTopics(input),
        'create-hashtag-strategy': async () => await this.createHashtagStrategy(input),
        'repurpose-content': async () => await this.repurposeContent(input),
        'generate-engagement-copy': async () => await this.generateEngagementCopy(input),
        'create-visual-brand-guidelines': async () => await this.createVisualBrandGuidelines(input),
        'generate-image-with-gemini': async () => await this.generateImageWithGemini(input.prompt, input.size),
        'generate-brand-image-with-gemini': async () => await this.generateBrandImageWithGemini(input.imagePrompt, input.platform),
        'generate-carousel-images': async () => await this.generateCarouselImages(input.carouselContent, input.platform),
        'create-social-post-with-content': async () => await this.createSocialPostWithContent(input),
        'create-content-aware-campaign': async () => await this.createContentAwareCampaign(input),
        'analyze-content-usage': async () => await this.analyzeContentUsage(),
        'get-relevant-content': async () => await this.getRelevantUploadedContent(input.platform, input.content),
      };

      if (taskHandlers[normalizedTask]) {
        return await taskHandlers[normalizedTask]();
      } else {
        // Print available tasks for debugging
        console.log('SOCIAL CONTENT AGENT AVAILABLE TASKS:', Object.keys(taskHandlers));
        throw new Error(`Unknown task: ${normalizedTask}`);
      }
    } catch (error) {
      logger.error('Social Content Agent execution error:', error);
      throw error;
    }
  }

  // Create social post for specific platform
  async createSocialPost(input) {
    const { platform, content, imagePrompt, hashtags, callToAction } = input;
    
    if (!this.platforms[platform]) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    const platformConfig = this.platforms[platform];
    
    // Optimize content for platform
    const optimizedContent = this.optimizeContentForPlatformSpecific(content, platform);
    
    // Generate platform-specific hashtags
    const optimizedHashtags = this.generatePlatformHashtags(hashtags, platform);
    
    // Create call-to-action
    const optimizedCTA = this.createPlatformCTA(callToAction, platform);
    
    // Generate image prompt
    const brandImagePrompt = this.createBrandImagePrompt(imagePrompt);
    
    const result = {
      platform,
      content: optimizedContent,
      hashtags: optimizedHashtags,
      callToAction: optimizedCTA,
      imagePrompt: brandImagePrompt,
      characterCount: optimizedContent.length,
      maxCharacters: platformConfig.maxLength,
      imageSpecs: {
        aspectRatio: platformConfig.imageAspectRatio,
        size: platformConfig.imageSize
      },
      bestPractices: platformConfig.bestPractices,
      timestamp: new Date().toISOString()
    };

    // Store in history
    this.storeContent(result);
    
    return result;
  }

  // Create multi-platform campaign
  async createMultiPlatformCampaign(input) {
    this.logWorkflowStep('Multi-Platform Campaign', 10, 'Starting multi-platform campaign creation');
    
    try {
      const { campaignName, content, blogContent, blogTopic, contentStrategy, platforms, imagePrompts, hashtags, callToAction } = input;
      
      this.logTrace('CAMPAIGN_INPUT', 'Multi-platform campaign input parameters', {
        campaignName,
        hasContent: !!content,
        hasBlogContent: !!blogContent,
        blogTopic,
        contentStrategy,
        platformsCount: platforms?.length || 0,
        platforms: platforms || [],
        hasImagePrompts: !!imagePrompts,
        hashtagsCount: hashtags?.length || 0,
        hasCallToAction: !!callToAction
      });
      
      // Ensure required fields are present
      if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
        this.logError(new Error('Platforms array is required and must contain at least one platform'), 'Input validation failed');
        throw new Error('Platforms array is required and must contain at least one platform');
      }
      
      // Use blog content if available and strategy is blog amplification
      let baseContent = content;
      if (blogContent && contentStrategy === 'blog_amplification') {
        baseContent = blogContent;
        this.logTrace('CONTENT_SELECTION', 'Using blog content for amplification', { blogTopic, contentLength: blogContent.length });
        logger.info(`Using blog content for social media amplification. Blog topic: ${blogTopic}`);
      } else if (!content && !blogContent) {
        this.logError(new Error('Content or blogContent is required for campaign creation'), 'Input validation failed');
        throw new Error('Content or blogContent is required for campaign creation');
      }
      
      this.logTrace('CAMPAIGN_SETUP', 'Setting up multi-platform campaign', {
        platformsCount: platforms.length,
        platforms: platforms.join(', '),
        baseContentLength: baseContent.length,
        contentStrategy
      });
      
      logger.info(`Creating multi-platform campaign for ${platforms.length} platforms: ${platforms.join(', ')}`);
      
      const campaign = {
        name: campaignName || 'Marketing Clarity Campaign',
        platforms: {},
        sharedHashtags: this.generateSharedHashtags(hashtags || []),
        campaignHashtag: this.generateCampaignHashtag(campaignName || 'Marketing Clarity'),
        timestamp: new Date().toISOString()
      };

      // Create platform-specific versions with actual AI-generated content and images
      this.logWorkflowStep('Platform Content Generation', 30, `Generating content for ${platforms.length} platforms`);
      
      for (const platform of platforms) {
        if (this.platforms[platform]) {
          this.logWorkflowStep(`Platform: ${platform}`, 40 + (platforms.indexOf(platform) * 10), `Generating content for ${platform}`);
          
          try {
            this.logTrace('PLATFORM_CONTENT_START', `Starting content generation for ${platform}`, {
              platform,
              baseContentLength: baseContent.length,
              hasCallToAction: !!callToAction,
              blogTopic
            });
            
            logger.info(`Generating AI content for platform: ${platform}`);
            
            // Generate platform-specific content using AI
            const platformContent = await this.generatePlatformSpecificContent(platform, baseContent, campaign.sharedHashtags, callToAction, blogTopic);
            
            this.logTransformation('PLATFORM_CONTENT_GENERATED', baseContent, {
              platform,
              contentLength: platformContent.length,
              maxLength: this.platforms[platform].maxLength,
              isOptimized: platformContent.length <= this.platforms[platform].maxLength
            }, `Generated platform-specific content for ${platform}`);
            
            // DALL-E 3 IMAGE GENERATION COMPLETELY DISABLED
            // let imageResult = null;
            // logger.info(`Image generation for ${platform}: Skipped (disabled)`);
            
            campaign.platforms[platform] = {
              platform,
              content: platformContent,
              hashtags: campaign.sharedHashtags,
              callToAction: callToAction || this.createPlatformCTA(callToAction, platform),
              characterCount: platformContent.length,
              maxCharacters: this.platforms[platform].maxLength,
              optimized: true,
              image: null, // Image generation disabled
              imageGenerationStatus: 'disabled',
              timestamp: new Date().toISOString()
            };
            
            this.logTrace('PLATFORM_CONTENT_COMPLETE', `Content generation completed for ${platform}`, {
              platform,
              characterCount: platformContent.length,
              maxCharacters: this.platforms[platform].maxLength,
              optimized: true
            });
            
          } catch (error) {
            this.logError(error, `Platform content generation for ${platform}`);
            logger.error(`Error creating content for platform ${platform}:`, error.message);
            
            // Fallback to basic content
            campaign.platforms[platform] = {
              platform,
              content: content,
              hashtags: campaign.sharedHashtags,
              callToAction: callToAction || 'Ready to get started?',
              characterCount: content.length,
              maxCharacters: this.platforms[platform].maxLength,
              optimized: false,
              image: null,
              imageGenerationStatus: 'skipped',
              timestamp: new Date().toISOString()
            };
            
            this.logTrace('PLATFORM_CONTENT_FALLBACK', `Using fallback content for ${platform}`, {
              platform,
              fallbackReason: error.message,
              characterCount: content.length
            });
          }
        }
      }

      // Store campaign
      this.logWorkflowStep('Campaign Storage', 90, 'Storing campaign data');
      this.storeCampaign(campaign);
      
      this.logTrace('CAMPAIGN_COMPLETE', 'Multi-platform campaign creation completed', {
        campaignName: campaign.name,
        platformsCount: Object.keys(campaign.platforms).length,
        platforms: Object.keys(campaign.platforms),
        totalContent: Object.keys(campaign.platforms).length,
        sharedHashtagsCount: campaign.sharedHashtags.length
      });
      
      return campaign;
    } catch (error) {
      this.logError(error, 'createMultiPlatformCampaign');
      logger.error('Error in createMultiPlatformCampaign:', error.message);
      throw error;
    }
  }

  // Generate platform-specific content using AI
  async generatePlatformSpecificContent(platform, baseContent, hashtags, callToAction, blogTopic = null) {
    this.logTrace('PLATFORM_AI_START', `Starting AI content generation for ${platform}`, {
      platform,
      baseContentLength: baseContent.length,
      hashtagsCount: hashtags?.length || 0,
      hasCallToAction: !!callToAction,
      blogTopic
    });
    
    try {
      const openai = new (require('openai'))({
        apiKey: process.env.OPENAI_API_KEY
      });

      const platformConfig = this.platforms[platform];
      
      // Determine if this is blog content amplification
      const isBlogAmplification = blogTopic && baseContent.length > 500; // Blog content is typically longer
      
      this.logTrace('CONTENT_ANALYSIS', 'Analyzing content type and platform requirements', {
        platform,
        isBlogAmplification,
        baseContentLength: baseContent.length,
        maxLength: platformConfig.maxLength,
        tone: platformConfig.tone
      });
      
      let prompt;
      if (isBlogAmplification) {
        prompt = `You are a creative social media specialist for MomentumDIY, a marketing clarity platform for small business owners.

BRAND VOICE & PERSONALITY:
- Write as ME (the founder) - personal, authentic, and relatable
- Use SINGULAR pronouns (I, my, me) not plural (we, our, us)
- Sound like a friend who's been there and understands the struggle
- Be encouraging but not preachy - more "I've been there" than "You should do this"
- Use conversational, warm language - like you're chatting with a friend
- Show empathy for the marketing overwhelm that small business owners feel
- Be solution-focused but not pushy

TARGET MARKET INSIGHTS:
- Primary: Small business owners who are overwhelmed by marketing options
- Specifically: Cafes, home services (plumbers, electricians, cleaners), personal services (salons, spas, trainers), brick-and-mortar shops
- These people are NOT typically on LinkedIn - they're on Facebook, Instagram, and Google Business Profile
- They're busy running their business and don't have time for complex marketing strategies
- They want simple, clear direction on what to focus on
- They're skeptical of "marketing gurus" and want practical, real-world advice

MOMENTUMDIY UNIQUE VALUE:
- We help them pick ONE quarterly marketing goal (not 10 things at once)
- We provide a complete execution track with weekly guidance
- We integrate with their existing tools (Meta Business Suite, email)
- We use AI to help them create content and stay on track
- We focus on CLARITY over complexity
- We're about "doing one thing well" vs "trying to do everything"

Platform: ${platformConfig.name}
Max length: ${platformConfig.maxLength} characters (STRICT LIMIT - do not exceed)
Tone: ${platformConfig.tone}

Blog Topic: "${blogTopic}"
Blog Content: "${baseContent}"

Please create a unique, engaging social media post that amplifies this blog content for ${platformConfig.name} by:
1. Extracting the most compelling insight from the blog post
2. Creating an emotional connection with the reader's marketing struggles
3. Adapting the tone to be ${platformConfig.tone} while staying personal and authentic
4. ENSURING it fits within ${platformConfig.maxLength} characters (check character count)
5. Making it highly engaging for ${platformConfig.name} audience
6. Using personal voice: "I've found that..." not "We've found that..."
7. Including a compelling call-to-action that drives curiosity
8. Mentioning how MomentumDIY (my platform) specifically solves this problem

CONTENT GUIDELINES:
- Start with empathy: "I know how overwhelming marketing can feel..."
- Share insights, not just advice: "Here's what I've learned helping small business owners..."
- Be specific about the problem: "When you're trying to do Facebook ads, Google ads, email marketing, and social media all at once..."
- Offer hope: "But what if you could focus on just ONE thing and actually see results?"
- Keep it practical and actionable
- Avoid marketing jargon - use everyday language

${hashtags && hashtags.length > 0 ? `Hashtags to include: ${hashtags.join(' ')}` : 'Generate 3-5 relevant hashtags based on the blog content and platform.'}
${callToAction ? `Call to action: ${callToAction}` : 'Generate a compelling call-to-action based on the blog content and platform.'}

Be creative, authentic, and engaging. Avoid generic marketing language. Return only the optimized social media content, no explanations. Stay under ${platformConfig.maxLength} characters.`;
      } else {
        prompt = `You are a creative social media specialist for MomentumDIY, a marketing clarity platform for small business owners.

BRAND VOICE & PERSONALITY:
- Write as ME (the founder) - personal, authentic, and relatable
- Use SINGULAR pronouns (I, my, me) not plural (we, our, us)
- Sound like a friend who's been there and understands the struggle
- Be encouraging but not preachy - more "I've been there" than "You should do this"
- Use conversational, warm language - like you're chatting with a friend
- Show empathy for the marketing overwhelm that small business owners feel
- Be solution-focused but not pushy

TARGET MARKET INSIGHTS:
- Primary: Small business owners who are overwhelmed by marketing options
- Specifically: Cafes, home services (plumbers, electricians, cleaners), personal services (salons, spas, trainers), brick-and-mortar shops
- These people are NOT typically on LinkedIn - they're on Facebook, Instagram, and Google Business Profile
- They're busy running their business and don't have time for complex marketing strategies
- They want simple, clear direction on what to focus on
- They're skeptical of "marketing gurus" and want practical, real-world advice

MOMENTUMDIY UNIQUE VALUE:
- We help them pick ONE quarterly marketing goal (not 10 things at once)
- We provide a complete execution track with weekly guidance
- We integrate with their existing tools (Meta Business Suite, email)
- We use AI to help them create content and stay on track
- We focus on CLARITY over complexity
- We're about "doing one thing well" vs "trying to do everything"

Platform: ${platformConfig.name}
Max length: ${platformConfig.maxLength} characters (STRICT LIMIT - do not exceed)
Tone: ${platformConfig.tone}

Base content: "${baseContent}"

Please create a unique, engaging social media post by:
1. Adapting the tone to be ${platformConfig.tone} while staying personal and authentic
2. ENSURING it fits within ${platformConfig.maxLength} characters (check character count)
3. Making it highly engaging for ${platformConfig.name} audience
4. Using personal voice: "I help you..." not "We help you..."
5. Addressing marketing overwhelm (MomentumDIY's core focus) in a creative way
6. Positioning MomentumDIY as "my platform" that brings marketing clarity

CONTENT GUIDELINES:
- Start with empathy: "I know how overwhelming marketing can feel..."
- Share insights, not just advice: "Here's what I've learned helping small business owners..."
- Be specific about the problem: "When you're trying to do Facebook ads, Google ads, email marketing, and social media all at once..."
- Offer hope: "But what if you could focus on just ONE thing and actually see results?"
- Keep it practical and actionable
- Avoid marketing jargon - use everyday language

${hashtags && hashtags.length > 0 ? `Hashtags to include: ${hashtags.join(' ')}` : 'Generate 3-5 relevant hashtags based on the content and platform.'}
${callToAction ? `Call to action: ${callToAction}` : 'Generate a compelling call-to-action based on the content and platform.'}

Be creative, authentic, and engaging. Avoid generic marketing language. Return only the optimized social media content, no explanations. Stay under ${platformConfig.maxLength} characters.`;
      }

      this.logTrace('OPENAI_REQUEST_START', `Starting OpenAI API call for ${platform} content`, {
        platform,
        model: 'gpt-4o-mini',
        promptLength: prompt.length,
        maxTokens: 400,
        temperature: 0.7
      });

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a creative social media specialist for MomentumDIY. Write as the founder - personal, authentic, and relatable. Use SINGULAR pronouns (I, my, me) not plural (we, our, us). Sound like a friend who understands the marketing overwhelm that small business owners feel. Be encouraging but not preachy. Use conversational, warm language. Focus on CLARITY over complexity. Show empathy and offer practical solutions. Avoid marketing jargon - use everyday language. Provide only the optimized content, no explanations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.7
      });

      const generatedContent = completion.choices[0].message.content.trim();
      
      // Record actual token usage
      const inputTokens = completion.usage.prompt_tokens;
      const outputTokens = completion.usage.completion_tokens;
      const totalTokens = completion.usage.total_tokens;
      this.resourceManager.recordOpenAIUsage(inputTokens, outputTokens);
      
      this.logApiResponse('OpenAI', {
        model: 'gpt-4o-mini',
        platform,
        inputTokens,
        outputTokens,
        totalTokens,
        contentLength: generatedContent.length,
        finishReason: completion.choices[0].finish_reason
      }, true);

      this.logCalculation('TOKEN_USAGE', { inputTokens, outputTokens }, totalTokens, 'Total token usage for platform content generation');
      
      logger.info(`Social Content Agent OpenAI API call successful: ${inputTokens} input + ${outputTokens} output = ${totalTokens} total tokens`);
      
      // Ensure content fits within platform limits
      if (generatedContent.length > platformConfig.maxLength) {
        this.logTrace('CONTENT_TRUNCATION', `Content exceeds platform limit, truncating`, {
          platform,
          originalLength: generatedContent.length,
          maxLength: platformConfig.maxLength,
          truncatedLength: platformConfig.maxLength - 10
        });
        logger.warn(`Generated content (${generatedContent.length} chars) exceeds ${platform} limit (${platformConfig.maxLength} chars). Truncating...`);
        return generatedContent.substring(0, platformConfig.maxLength - 10) + '...';
      }

      this.logTrace('PLATFORM_CONTENT_SUCCESS', `Successfully generated content for ${platform}`, {
        platform,
        contentLength: generatedContent.length,
        maxLength: platformConfig.maxLength,
        isOptimized: true
      });

      return generatedContent;
    } catch (error) {
      this.logApiResponse('OpenAI', error, false);
      this.logError(error, 'generatePlatformSpecificContent');
      logger.error('Error generating platform-specific content:', error.message);
      return baseContent; // Fallback to original content
    }
  }

  // Generate brand-consistent image prompt
  async generateBrandImage(input) {
    const { subject, style, mood, platform, generateImage = false } = input;
    
    const imagePrompt = this.createBrandImagePrompt(subject);

    const result = {
      prompt: imagePrompt,
      brandGuidelines: {
        colors: this.brandIdentity.colors,
        style: this.imagePreferences.style,
        composition: this.imagePreferences.composition
      },
      platformOptimization: platform ? this.platforms[platform]?.imageSize : null,
      imageGenerated: generateImage,
      timestamp: new Date().toISOString()
    };

    // Generate actual image if requested
    if (generateImage) {
      const imageResult = await this.generateBrandImageWithGemini(subject, platform);
      result.imageResult = imageResult;
    }

    // Store image generation
    this.storeImage(result);
    
    return result;
  }

  // Optimize content for specific platform
  async optimizeContentForPlatform(input) {
    const { content, platform, contentType } = input;
    
    if (!this.platforms[platform]) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    const platformConfig = this.platforms[platform];
    
    const optimized = {
      original: content,
      platform,
      optimized: this.optimizeContentForPlatformSpecific(content, platform),
      characterCount: content.length,
      maxCharacters: platformConfig.maxLength,
      recommendations: this.generateOptimizationRecommendations(content, platform),
      timestamp: new Date().toISOString()
    };

    return optimized;
  }

  // Create content calendar
  async createContentCalendar(input) {
    const { timeframe, themes, platforms, frequency } = input;
    
    try {
      const calendar = {
        timeframe,
        themes,
        platforms,
        frequency,
        posts: this.generateCalendarPosts(timeframe, themes, platforms, frequency),
        hashtagStrategy: this.createHashtagStrategy({ themes, platforms }),
        visualGuidelines: this.createVisualBrandGuidelines({}),
        timestamp: new Date().toISOString()
      };

      return calendar;
    } catch (error) {
      logger.error('Error creating content calendar:', error.message);
      throw new Error(`Content calendar creation failed: ${error.message}. No fallback data will be generated.`);
    }
  }

  // Analyze trending topics
  async analyzeTrendingTopics(input) {
    const { platform, category, timeframe } = input;
    
    try {
      // Try to get real trending topics
      const trendingTopics = this.generateMockTrendingTopics(platform, category);
      
      const analysis = {
        platform,
        category,
        timeframe,
        trendingTopics,
        brandRelevance: this.assessBrandRelevance(trendingTopics),
        contentOpportunities: this.identifyContentOpportunities(trendingTopics),
        timestamp: new Date().toISOString()
      };

      return analysis;
    } catch (error) {
      logger.error('Error analyzing trending topics:', error.message);
      throw new Error(`Trending topics analysis failed: ${error.message}. No fallback data will be generated.`);
    }
  }

  // Create hashtag strategy
  async createHashtagStrategy(input) {
    const { themes, platforms, campaign } = input;
    
    try {
      const strategy = {
        brand: this.generateBrandHashtags(),
        campaign: campaign ? this.generateCampaignHashtag(campaign) : null,
        themes: this.generateThemeHashtags(themes),
        platforms: this.generatePlatformSpecificHashtags(platforms),
        trending: this.generateTrendingHashtags(),
        recommendations: this.generateHashtagRecommendations(),
        timestamp: new Date().toISOString()
      };

      return strategy;
    } catch (error) {
      logger.error('Error creating hashtag strategy:', error.message);
      throw new Error(`Hashtag strategy creation failed: ${error.message}. No fallback data will be generated.`);
    }
  }

  // Repurpose content for different platforms
  async repurposeContent(input) {
    const { originalContent, targetPlatforms, targetPlatform, contentType } = input;
    
    // Handle both singular and plural platform parameters
    const platforms = targetPlatforms || (targetPlatform ? [targetPlatform] : ['instagram']);
    
    const repurposed = {
      original: originalContent,
      repurposed: {}
    };

    for (const platform of platforms) {
      repurposed.repurposed[platform] = await this.createSocialPost({
        platform,
        content: originalContent,
        imagePrompt: originalContent.imagePrompt,
        hashtags: originalContent.hashtags,
        callToAction: originalContent.callToAction
      });
    }

    return repurposed;
  }

  // Generate engagement copy
  async generateEngagementCopy(input) {
    const { platform, content, engagementType } = input;
    
    const engagementCopy = {
      platform,
      type: engagementType,
      copy: this.generatePlatformEngagementCopy(platform, content, engagementType),
      bestPractices: this.platforms[platform]?.bestPractices || [],
      timestamp: new Date().toISOString()
    };

    return engagementCopy;
  }

  // Create visual brand guidelines
  async createVisualBrandGuidelines(input) {
    const guidelines = {
      brandIdentity: this.brandIdentity,
      imagePreferences: this.imagePreferences,
      platformSpecs: Object.fromEntries(
        Object.entries(this.platforms).map(([platform, config]) => [
          platform,
          {
            imageSize: config.imageSize,
            aspectRatio: config.imageAspectRatio,
            bestPractices: config.bestPractices
          }
        ])
      ),
      colorPalette: this.brandIdentity.colors,
      typography: this.brandIdentity.typography,
      visualStyle: this.brandIdentity.visualStyle,
      timestamp: new Date().toISOString()
    };

    return guidelines;
  }

  // Helper methods
  optimizeContentForPlatformSpecific(content, platform) {
    const config = this.platforms[platform];
    let optimized = content;

    // Truncate if too long
    if (optimized.length > config.maxLength) {
      optimized = optimized.substring(0, config.maxLength - 3) + '...';
    }

    // Apply platform-specific optimizations
    switch (platform) {
      case 'x':
        optimized = this.optimizeForX(optimized);
        break;
      case 'linkedin':
        optimized = this.optimizeForLinkedIn(optimized);
        break;
      case 'facebook':
        optimized = this.optimizeForFacebook(optimized);
        break;
      case 'instagram':
        optimized = this.optimizeForInstagram(optimized);
        break;
      case 'reddit':
        optimized = this.optimizeForReddit(optimized);
        break;
    }

    return optimized;
  }

  optimizeForX(content) {
    // X optimization: conversational, trending, engaging
    return content
      .replace(/\./g, '!') // Make more engaging
      .replace(/\bmarketing\b/gi, 'marketing')
      .replace(/\bsmall business\b/gi, 'small business')
      .replace(/\bMomentumDIY\b/g, 'MomentumDIY')
      .replace(/\bbusy business owners\b/gi, 'busy business owners');
  }

  optimizeForLinkedIn(content) {
    // LinkedIn optimization: professional, educational
    return content
      .replace(/\bmarketing\b/gi, 'marketing')
      .replace(/\bsmall business\b/gi, 'small business')
      .replace(/\bMomentumDIY\b/g, 'MomentumDIY')
      .replace(/!/g, '.') // More professional tone
      + '\n\n#SmallBusiness #Marketing #MomentumDIY';
  }

  optimizeForFacebook(content) {
    // Facebook optimization: community-focused, personal
    return content
      .replace(/\bmarketing\b/gi, 'marketing')
      .replace(/\bsmall business\b/gi, 'small business')
      .replace(/\bMomentumDIY\b/g, 'MomentumDIY')
      + '\n\nWhat\'s your biggest marketing challenge? Share in the comments! 👇';
  }

  optimizeForInstagram(content) {
    // Instagram optimization: visual, aspirational
    return content
      .replace(/\bmarketing\b/gi, 'marketing ✨')
      .replace(/\bsmall business\b/gi, 'small business')
      .replace(/\bMomentumDIY\b/g, 'MomentumDIY')
      .replace(/!/g, ' ✨')
      + '\n\n#SmallBusiness #Marketing #MomentumDIY #MarketingMadeHuman';
  }

  optimizeForReddit(content) {
    // Reddit optimization: authentic, helpful, community-focused
    return content
      .replace(/\bmarketing\b/gi, 'marketing')
      .replace(/\bsmall business\b/gi, 'small business')
      .replace(/\bMomentumDIY\b/g, 'MomentumDIY')
      .replace(/!/g, '.') // More authentic tone
      + '\n\nWhat do you think? Any marketing tips to share?';
  }

  generatePlatformHashtags(hashtags, platform) {
    const config = this.platforms[platform];
    const platformHashtags = hashtags || [];
    
    // Add platform-specific hashtags
    switch (platform) {
      case 'x':
        platformHashtags.push('#SmallBusiness', '#Marketing');
        break;
      case 'linkedin':
        platformHashtags.push('#SmallBusiness', '#Marketing', '#Entrepreneurship', '#Innovation');
        break;
      case 'facebook':
        platformHashtags.push('#SmallBusiness', '#Marketing', '#Community');
        break;
      case 'instagram':
        platformHashtags.push('#SmallBusiness', '#Marketing', '#MomentumDIY', '#MarketingMadeHuman', '#Entrepreneurship');
        break;
      case 'reddit':
        // Reddit doesn't use hashtags
        break;
    }

    // Limit hashtags based on platform
    return platformHashtags.slice(0, config.hashtagLimit);
  }

  createPlatformCTA(callToAction, platform) {
    const baseCTA = callToAction || 'Get inspired and start creating!';
    
    switch (platform) {
      case 'x':
        return `${baseCTA} 🚀`;
      case 'linkedin':
        return `${baseCTA}\n\nWhat\'s your experience with DIY projects?`;
      case 'facebook':
        return `${baseCTA}\n\nShare your DIY journey with us!`;
      case 'instagram':
        return `${baseCTA} ✨\n\nTag us in your DIY projects!`;
      case 'reddit':
        return `${baseCTA}\n\nWhat\'s your take on this?`;
      default:
        return baseCTA;
    }
  }

  createBrandImagePrompt(imagePrompt) {
    const basePrompt = imagePrompt || 'marketing solution for small businesses';
    
    return `Create a clean, graphic, minimalist cartoon illustration in the style of MomentumDIY carousel posts.
    
    Subject: ${basePrompt}
    
    Style: Clean, graphic, minimalist cartoon style with bold outlines
    Colors: Deep navy background (#191628) with coral accents (#ef8e81) and white text (#ffffff)
    Typography: Poppins font family, clean sans-serif
    
    Brand Elements:
    - Coral octopus with bright yellow eyes and black pupils
    - Thick black outlines for octopus
    - Strategic octopus placement (peeking from corners)
    - White text with coral highlights for key phrases
    
    Composition: Grid-based layout, professional yet approachable aesthetic
    Mood: Conversational, empathetic, empowering, solution-focused
    
    Follow the exact visual style of MomentumDIY carousel posts with dark navy backgrounds, coral highlights, and the signature octopus icon.`;
  }

  async generateImageWithGemini(prompt, size = '1024x1024') {
    try {
      logger.info(`Generating image with Google Gemini: ${prompt.substring(0, 100)}...`);
      
      // Check if we can use Gemini API
      if (!this.resourceManager.canUseGemini()) {
        logger.warn('Gemini API usage limit reached');
        return {
          success: false,
          error: 'Gemini API usage limit reached for today',
          prompt: prompt,
          timestamp: new Date().toISOString()
        };
      }
      
      // Note: Gemini Flash 2.5 is used to enhance the prompt, actual image generation 
      // would require Google's Imagen API or another image generation service.
      // For now, we'll use Gemini to create an enhanced prompt and note that
      // image generation needs to be connected to an actual image generation service.
      
      if (!this.geminiModel) {
        this.geminiModel = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      }

      // Use Gemini to enhance the image prompt for better results
      const enhancementPrompt = `You are an expert at creating detailed image generation prompts.
Enhance this image prompt to be more specific and visually descriptive while maintaining the brand identity:

Original prompt: ${prompt}

Brand style: Dark navy backgrounds (#191628), coral accents (#ef8e81), clean minimalist graphics, bold black outlines, friendly approachable aesthetic.

Provide an enhanced prompt that would generate a compelling social media image. Be specific about composition, colors, and style. Respond with just the enhanced prompt, nothing else.`;

      const result = await this.geminiModel.generateContent(enhancementPrompt);
      const enhancedPrompt = result.response.text().trim();
      
      logger.info(`Enhanced prompt created: ${enhancedPrompt.substring(0, 100)}...`);
      
      // Record usage (Gemini API calls are tracked separately from image generation)
      await this.resourceManager.recordGeminiUsage('gemini-2.0-flash-exp', 1);
      
      // NOTE: Actual image generation would happen here with Imagen or another service
      // For now, return the enhanced prompt that can be used with any image generation service
      
      return {
        success: true,
        enhancedPrompt: enhancedPrompt,
        originalPrompt: prompt,
        size: size,
        note: 'Enhanced prompt created. Connect to Google Imagen or image generation service for actual image creation.',
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      logger.error(`Gemini image prompt enhancement failed: ${error.message}`);
      
      return {
        success: false,
        error: error.message,
        prompt: prompt,
        timestamp: new Date().toISOString()
      };
    }
  }

  async generateBrandImageWithGemini(imagePrompt, platform = 'instagram') {
    try {
      // Create brand-aligned prompt
      const brandPrompt = this.createBrandImagePrompt(imagePrompt);
      
      // Determine image size based on platform
      const platformConfig = this.platforms[platform] || this.platforms.instagram;
      const imageSize = platformConfig.imageSize || '1024x1024';
      
      // Generate enhanced prompt with Gemini
      const result = await this.generateImageWithGemini(brandPrompt, imageSize);
      
      if (result.success) {
        // Store image metadata
        await this.storeImage({
          enhancedPrompt: result.enhancedPrompt,
          originalPrompt: brandPrompt,
          platform: platform,
          size: imageSize,
          generatedAt: result.timestamp,
          note: result.note
        });
      }
      
      return result;
      
    } catch (error) {
      logger.error(`Brand image prompt generation failed: ${error.message}`);
      
      return {
        success: false,
        error: error.message,
        imagePrompt: imagePrompt,
        platform: platform,
        timestamp: new Date().toISOString()
      };
    }
  }

  async generateCarouselImages(carouselContent, platform = 'instagram') {
    try {
      const images = [];
      const platformConfig = this.platforms[platform] || this.platforms.instagram;
      
      // Generate multiple images for carousel
      for (let i = 0; i < Math.min(carouselContent.length, 10); i++) {
        const content = carouselContent[i];
        const imagePrompt = content.imagePrompt || content.content || 'MomentumDIY brand content';
        
        const result = await this.generateBrandImageWithGemini(imagePrompt, platform);
        
        if (result.success) {
          images.push({
            slide: i + 1,
            imageUrl: result.imageUrl,
            prompt: result.prompt,
            content: content.content || content
          });
        }
        
        // Add small delay between generations to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      return {
        success: true,
        images: images,
        platform: platform,
        totalImages: images.length,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      logger.error(`Carousel image generation failed: ${error.message}`);
      
      return {
        success: false,
        error: error.message,
        carouselContent: carouselContent,
        platform: platform,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Create fallback placeholder image when Gemini prompt generation fails
  createFallbackImage(platform, content) {
    throw new Error(`Gemini image prompt generation not available for ${platform}. Cannot create enhanced image prompts. Please check Google AI API configuration and connectivity. No fallback prompts will be generated.`);
  }

  async createSocialPostWithContent(input) {
    try {
      const { platform, content, hashtags, callToAction, useUploadedContent = true, generateImage = true } = input;
      
      if (!this.platforms[platform]) {
        throw new Error(`Unsupported platform: ${platform}`);
      }

      const platformConfig = this.platforms[platform];
      
      // Optimize content for platform
      const optimizedContent = this.optimizeContentForPlatformSpecific(content, platform);
      
      // Generate platform-specific hashtags
      const optimizedHashtags = this.generatePlatformHashtags(hashtags, platform);
      
      // Create call-to-action
      const optimizedCTA = this.createPlatformCTA(callToAction, platform);
      
      let imageResult = null;
      let uploadedContent = null;
      
      // Try to use uploaded content first if requested
      if (useUploadedContent) {
        uploadedContent = await this.getRelevantUploadedContent(platform, content);
      }
      
      // Generate image if no uploaded content or if explicitly requested
      if (!uploadedContent && generateImage) {
        const imagePrompt = this.createBrandImagePrompt(content);
        imageResult = await this.generateBrandImageWithGemini(imagePrompt, platform);
      }
      
      const result = {
        platform,
        content: optimizedContent,
        hashtags: optimizedHashtags,
        callToAction: optimizedCTA,
        characterCount: optimizedContent.length,
        maxCharacters: platformConfig.maxLength,
        imageSpecs: {
          aspectRatio: platformConfig.imageAspectRatio,
          size: platformConfig.imageSize
        },
        bestPractices: platformConfig.bestPractices,
        uploadedContent: uploadedContent,
        generatedImage: imageResult,
        timestamp: new Date().toISOString()
      };

      // Mark uploaded content as used if it was used
      if (uploadedContent) {
        await this.contentManager.markContentAsUsed(uploadedContent.id, {
          platform: platform,
          postContent: optimizedContent,
          timestamp: new Date().toISOString()
        });
      }

      // Store in history
      this.storeContent(result);
      
      return result;
      
    } catch (error) {
      logger.error(`Social post creation with content failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        input: input
      };
    }
  }

  async getRelevantUploadedContent(platform, content) {
    try {
      // Extract keywords from content for better matching
      const keywords = this.extractKeywords(content);
      
      // Search for relevant content
      const searchResults = await this.contentManager.searchContent(
        keywords.join(' '),
        { contentType: 'images', brandRelevance: 'high' }
      );
      
      if (searchResults.length > 0) {
        // Return the most relevant content
        return searchResults[0];
      }
      
      // If no specific matches, get general brand-relevant content
      const generalContent = await this.contentManager.getContentForSocialMedia(platform, 'images', 1);
      
      return generalContent.length > 0 ? generalContent[0] : null;
      
    } catch (error) {
      logger.error(`Error getting relevant uploaded content: ${error.message}`);
      return null;
    }
  }

  extractKeywords(text) {
    // Simple keyword extraction - can be enhanced with NLP
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    // Remove common words
    const commonWords = ['the', 'and', 'for', 'with', 'that', 'this', 'have', 'will', 'your', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'just', 'into', 'than', 'more', 'other', 'about', 'many', 'then', 'them', 'these', 'so', 'people', 'out', 'now', 'over', 'think', 'also', 'around', 'another', 'down', 'way', 'even', 'want', 'look', 'through', 'back', 'after', 'well', 'work', 'first', 'new', 'because', 'day', 'get', 'make', 'go', 'see', 'number', 'no', 'man', 'my', 'take', 'up', 'find', 'long', 'down', 'day', 'did', 'get', 'come', 'made', 'may', 'part'];
    
    return words.filter(word => !commonWords.includes(word)).slice(0, 10);
  }

  async createContentAwareCampaign(input) {
    try {
      const { campaignName, content, platforms, hashtags, callToAction, useUploadedContent = true } = input;
      
      const campaign = {
        name: campaignName,
        platforms: {},
        sharedHashtags: this.generateSharedHashtags(hashtags),
        campaignHashtag: this.generateCampaignHashtag(campaignName),
        uploadedContent: [],
        generatedImages: [],
        timestamp: new Date().toISOString()
      };

      // Get relevant uploaded content for the campaign
      if (useUploadedContent) {
        const campaignContent = await this.contentManager.getContentRecommendations({
          campaign: campaignName,
          contentType: 'images',
          tags: hashtags
        });
        
        campaign.uploadedContent = campaignContent;
      }

      // Create platform-specific versions
      for (const platform of platforms) {
        if (this.platforms[platform]) {
          campaign.platforms[platform] = await this.createSocialPostWithContent({
            platform,
            content,
            hashtags: campaign.sharedHashtags,
            callToAction,
            useUploadedContent,
            generateImage: true
          });
        }
      }

      // Store campaign
      this.storeCampaign(campaign);
      
      return campaign;
      
    } catch (error) {
      logger.error(`Content-aware campaign creation failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        input: input
      };
    }
  }

  async analyzeContentUsage() {
    try {
      const stats = await this.contentManager.getContentStats();
      
      const analysis = {
        totalContent: stats.total,
        contentByType: stats.byType,
        contentByCategory: stats.byCategory,
        brandRelevance: stats.byBrandRelevance,
        usageMetrics: {
          recentlyUsed: stats.recentlyUsed,
          unused: stats.unused,
          usageRate: stats.total > 0 ? ((stats.total - stats.unused) / stats.total * 100).toFixed(1) : 0
        },
        recommendations: []
      };
      
      // Generate recommendations
      if (stats.unused > stats.total * 0.5) {
        analysis.recommendations.push('Consider using more of your uploaded content in social posts');
      }
      
      if (stats.byType.images < 5) {
        analysis.recommendations.push('Upload more brand-relevant images for better content variety');
      }
      
      if (stats.byBrandRelevance.high < 3) {
        analysis.recommendations.push('Add more high-brand-relevance content for better campaign performance');
      }
      
      return analysis;
      
    } catch (error) {
      logger.error(`Content usage analysis failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  generateSharedHashtags(hashtags) {
    return [
      '#MomentumDIY',
      '#SmallBusiness',
      '#Marketing',
      '#MarketingMadeHuman',
      ...(hashtags || [])
    ];
  }

  generateCampaignHashtag(campaignName) {
    if (!campaignName) {
      return '#MomentumDIY';
    }
    return `#${campaignName.replace(/\s+/g, '')}`;
  }

  generateCalendarPosts(timeframe, themes, platforms, frequency) {
    throw new Error(`Content calendar API not available. Cannot generate real calendar posts. Please check API configuration and connectivity. No fallback calendar posts will be generated.`);
  }

  generateMockTrendingTopics(platform, category) {
    throw new Error(`Trending topics API not available for ${platform}. Cannot fetch real trending data. Please check API configuration and connectivity. No fallback trending topics will be generated.`);
  }

  assessBrandRelevance(topics) {
    throw new Error(`Brand relevance analysis API not available. Cannot assess real brand relevance. Please check API configuration and connectivity. No fallback relevance data will be generated.`);
  }

  identifyContentOpportunities(topics) {
    throw new Error(`Content opportunity analysis API not available. Cannot identify real content opportunities. Please check API configuration and connectivity. No fallback opportunity data will be generated.`);
  }

  generateBrandHashtags() {
    return ['#MomentumDIY', '#MarketingMadeHuman', '#SmallBusinessMarketing'];
  }

  generateThemeHashtags(themes) {
    return themes?.map(theme => {
      if (!theme) return '#MomentumDIY';
      return `#${theme.replace(/\s+/g, '')}`;
    }) || [];
  }

  generatePlatformSpecificHashtags(platforms) {
    throw new Error(`Platform-specific hashtags API not available. Cannot fetch real platform hashtags. Please check API configuration and connectivity. No fallback hashtags will be generated.`);
  }

  generateTrendingHashtags() {
    throw new Error(`Trending hashtags API not available. Cannot fetch real trending hashtags. Please check API configuration and connectivity. No fallback hashtags will be generated.`);
  }

  generateHashtagRecommendations() {
    return [
      'Use 3-5 hashtags per post for optimal engagement',
      'Mix popular and niche hashtags',
      'Include brand hashtag in every post',
      'Research trending hashtags weekly'
    ];
  }

  generatePlatformEngagementCopy(platform, content, engagementType) {
    const engagementTemplates = {
      question: {
        x: `What's your take on this? 🤔`,
        linkedin: `What's your experience with this approach?`,
        facebook: `What do you think? Share your thoughts!`,
        instagram: `What's your favorite part? ✨`,
        reddit: `What's your opinion on this?`
      },
      callToAction: {
        x: `Try this and let us know how it goes! 🚀`,
        linkedin: `Share your results and insights.`,
        facebook: `Give this a try and share your experience!`,
        instagram: `Try this and tag us! ✨`,
        reddit: `Give this a shot and share your results.`
      }
    };

    return engagementTemplates[engagementType]?.[platform] || 'Engage with this content!';
  }

  generateOptimizationRecommendations(content, platform) {
    const recommendations = [];
    
    if (content.length > this.platforms[platform].maxLength) {
      recommendations.push(`Content is too long for ${platform}. Consider shortening.`);
    }
    
    if (!content.includes('DIY')) {
      recommendations.push('Consider adding DIY-related keywords for better discoverability.');
    }
    
    if (!content.includes('!') && platform === 'x') {
      recommendations.push('Consider adding exclamation marks for more engagement on X.');
    }
    
    return recommendations;
  }

  // Storage methods
  storeContent(content) {
    this.contentHistory.posts.push(content);
    this.contentHistory.lastUpdated = new Date().toISOString();
  }

  storeCampaign(campaign) {
    this.contentHistory.campaigns.push(campaign);
    this.contentHistory.lastUpdated = new Date().toISOString();
  }

  storeImage(image) {
    this.contentHistory.images.push(image);
    this.contentHistory.lastUpdated = new Date().toISOString();
  }

  // Get content history
  getContentHistory(type = null) {
    if (type === 'posts') return this.contentHistory.posts;
    if (type === 'campaigns') return this.contentHistory.campaigns;
    if (type === 'images') return this.contentHistory.images;
    return this.contentHistory;
  }

  // Execute task with progress tracking
  async executeWithProgress(task, input, onProgress) {
    // Initialize trace for this execution
    this.initializeTrace(task, input);
    
    const startTime = Date.now();
    
    try {
      this.updateActivity();
      this.logWorkflowStep('Initialization', 0, 'Starting social content task execution');
      logger.info(`Social Content Agent executing task: ${task}`, { input });

      this.logTrace('SOCIAL_CONTENT_TASK_START', 'Social content task execution started', {
        task,
        inputType: typeof input,
        hasInput: !!input
      });

      // Initialize progress
      onProgress({
        progress: 0,
        step: 'Initializing task...',
        steps: ['Initializing', 'Processing', 'Optimizing', 'Generating', 'Completing']
      });

      let result;
      
      this.logWorkflowStep('Task Execution', 20, `Executing ${task} task`);
      
      switch (task) {
        case 'create-social-post':
          onProgress({ progress: 20, step: 'Creating social post...' });
          result = await this.createSocialPost(input);
          break;
        case 'create-multi-platform-campaign':
          onProgress({ progress: 20, step: 'Creating multi-platform campaign...' });
          onProgress({ progress: 40, step: 'Generating platform-specific content...' });
          result = await this.createMultiPlatformCampaign(input);
          onProgress({ progress: 80, step: 'Optimizing content for each platform...' });
          break;
        case 'create_multi_platform_campaign':
          onProgress({ progress: 20, step: 'Creating multi-platform campaign...' });
          onProgress({ progress: 40, step: 'Generating platform-specific content...' });
          result = await this.createMultiPlatformCampaign(input);
          onProgress({ progress: 80, step: 'Optimizing content for each platform...' });
          break;
        case 'generate-brand-image':
          onProgress({ progress: 20, step: 'Generating brand image...' });
          result = await this.generateBrandImage(input);
          break;
        case 'optimize-content-for-platform':
          onProgress({ progress: 20, step: 'Optimizing content...' });
          result = await this.optimizeContentForPlatform(input);
          break;
        case 'create-content-calendar':
          onProgress({ progress: 20, step: 'Creating content calendar...' });
          result = await this.createContentCalendar(input);
          break;
        case 'analyze-trending-topics':
          onProgress({ progress: 20, step: 'Analyzing trending topics...' });
          result = await this.analyzeTrendingTopics(input);
          break;
        case 'create-hashtag-strategy':
          onProgress({ progress: 20, step: 'Creating hashtag strategy...' });
          result = await this.createHashtagStrategy(input);
          break;
        case 'repurpose-content':
          onProgress({ progress: 20, step: 'Repurposing content...' });
          result = await this.repurposeContent(input);
          break;
        case 'generate-engagement-copy':
          onProgress({ progress: 20, step: 'Generating engagement copy...' });
          result = await this.generateEngagementCopy(input);
          break;
        case 'create-visual-brand-guidelines':
          onProgress({ progress: 20, step: 'Creating brand guidelines...' });
          result = await this.createVisualBrandGuidelines(input);
          break;
        default:
          this.logError(new Error(`Unknown task: ${task}`), 'Unknown task type');
          throw new Error(`Unknown task: ${task}`);
      }

      this.logWorkflowStep('Completion', 100, 'Social content task completed successfully');
      onProgress({ 
        progress: 100, 
        step: 'Task completed successfully'
      });

      // Log final summary
      this.logTrace(
        'EXECUTION_COMPLETE',
        `Social content task ${task} completed successfully`,
        {
          task,
          duration: Date.now() - startTime,
          resultType: typeof result,
          hasResult: !!result,
          platforms: result?.platforms || [],
          contentCount: result?.content ? Object.keys(result.content).length : 0
        }
      );

      return {
        ...result,
        trace: this.getTrace()
      };
    } catch (error) {
      this.logError(error, 'executeWithProgress');
      logger.error('Social Content Agent execution error:', error);
      throw error;
    }
  }

  // Execute task with streaming updates
  async executeWithStreaming(task, input, onUpdate) {
    try {
      this.updateActivity();
      logger.info(`Social Content Agent streaming execution: ${task}`, { input });

      // Send initial update
      onUpdate({
        type: 'start',
        task,
        startTime: new Date().toISOString()
      });

      let result;
      
      switch (task) {
        case 'create-social-post':
          onUpdate({ type: 'progress', step: 'Creating social post...', progress: 20 });
          result = await this.createSocialPost(input);
          break;
        case 'create-multi-platform-campaign':
          onUpdate({ type: 'progress', step: 'Creating multi-platform campaign...', progress: 20 });
          result = await this.createMultiPlatformCampaign(input);
          break;
        case 'generate-brand-image':
          onUpdate({ type: 'progress', step: 'Generating brand image...', progress: 20 });
          result = await this.generateBrandImage(input);
          break;
        case 'optimize-content-for-platform':
          onUpdate({ type: 'progress', step: 'Optimizing content...', progress: 20 });
          result = await this.optimizeContentForPlatform(input);
          break;
        case 'create-content-calendar':
          onUpdate({ type: 'progress', step: 'Creating content calendar...', progress: 20 });
          result = await this.createContentCalendar(input);
          break;
        case 'analyze-trending-topics':
          onUpdate({ type: 'progress', step: 'Analyzing trending topics...', progress: 20 });
          result = await this.analyzeTrendingTopics(input);
          break;
        case 'create-hashtag-strategy':
          onUpdate({ type: 'progress', step: 'Creating hashtag strategy...', progress: 20 });
          result = await this.createHashtagStrategy(input);
          break;
        case 'repurpose-content':
          onUpdate({ type: 'progress', step: 'Repurposing content...', progress: 20 });
          result = await this.repurposeContent(input);
          break;
        case 'generate-engagement-copy':
          onUpdate({ type: 'progress', step: 'Generating engagement copy...', progress: 20 });
          result = await this.generateEngagementCopy(input);
          break;
        case 'create-visual-brand-guidelines':
          onUpdate({ type: 'progress', step: 'Creating brand guidelines...', progress: 20 });
          result = await this.createVisualBrandGuidelines(input);
          break;
        default:
          throw new Error(`Unknown task: ${task}`);
      }

      // Send completion update
      onUpdate({
        type: 'complete',
        result,
        endTime: new Date().toISOString()
      });

      return result;
    } catch (error) {
      onUpdate({
        type: 'error',
        error: error.message,
        endTime: new Date().toISOString()
      });
      
      logger.error('Social Content Agent streaming execution error:', error);
      throw error;
    }
  }

  // Get available tasks
  getAvailableTasks() {
    return [
      {
        id: 'create-social-post',
        name: 'Create Social Post',
        description: 'Create platform-optimized social media post with brand-consistent imagery',
        parameters: ['platform', 'content', 'imagePrompt', 'hashtags', 'callToAction'],
        requiredInput: ['platform', 'content']
      },
      {
        id: 'create-multi-platform-campaign',
        name: 'Create Multi-Platform Campaign',
        description: 'Create coordinated social media campaign across multiple platforms',
        parameters: ['campaignName', 'content', 'platforms', 'imagePrompts', 'hashtags', 'callToAction'],
        requiredInput: ['campaignName', 'content', 'platforms']
      },
      {
        id: 'generate-brand-image',
        name: 'Generate Brand Image',
        description: 'Generate brand-consistent image prompt for social media',
        parameters: ['subject', 'style', 'mood', 'platform'],
        requiredInput: ['subject']
      },
      {
        id: 'optimize-content-for-platform',
        name: 'Optimize Content for Platform',
        description: 'Optimize existing content for specific social media platform',
        parameters: ['content', 'platform', 'contentType'],
        requiredInput: ['content', 'platform']
      },
      {
        id: 'create-content-calendar',
        name: 'Create Content Calendar',
        description: 'Generate comprehensive content calendar with themes and scheduling',
        parameters: ['timeframe', 'themes', 'platforms', 'frequency'],
        requiredInput: ['timeframe', 'themes', 'platforms']
      },
      {
        id: 'analyze-trending-topics',
        name: 'Analyze Trending Topics',
        description: 'Analyze trending topics for content opportunities',
        parameters: ['platform', 'category', 'timeframe'],
        requiredInput: ['platform']
      },
      {
        id: 'create-hashtag-strategy',
        name: 'Create Hashtag Strategy',
        description: 'Develop comprehensive hashtag strategy for campaigns',
        parameters: ['themes', 'platforms', 'campaign'],
        requiredInput: ['themes', 'platforms']
      },
      {
        id: 'repurpose-content',
        name: 'Repurpose Content',
        description: 'Repurpose existing content for different platforms',
        parameters: ['originalContent', 'targetPlatforms', 'contentType'],
        requiredInput: ['originalContent', 'targetPlatforms']
      },
      {
        id: 'generate-engagement-copy',
        name: 'Generate Engagement Copy',
        description: 'Create engagement-focused copy for community interaction',
        parameters: ['platform', 'content', 'engagementType'],
        requiredInput: ['platform', 'content', 'engagementType']
      },
      {
        id: 'create-visual-brand-guidelines',
        name: 'Create Visual Brand Guidelines',
        description: 'Generate comprehensive visual brand guidelines',
        parameters: [],
        requiredInput: []
      },
      {
        id: 'generate-image-with-gemini',
        name: 'Generate Image Prompt with Gemini Flash 2.5',
        description: 'Create enhanced image generation prompt using Google Gemini Flash 2.5',
        parameters: ['prompt', 'size'],
        requiredInput: ['prompt']
      },
      {
        id: 'generate-brand-image-with-gemini',
        name: 'Generate Brand Image Prompt with Gemini',
        description: 'Generate brand-consistent image prompt using Google Gemini Flash 2.5',
        parameters: ['imagePrompt', 'platform'],
        requiredInput: ['imagePrompt']
      },
      {
        id: 'generate-carousel-images',
        name: 'Generate Carousel Images',
        description: 'Generate multiple images for social media carousel posts',
        parameters: ['carouselContent', 'platform'],
        requiredInput: ['carouselContent']
      },
      {
        id: 'create-social-post-with-content',
        name: 'Create Social Post with Content',
        description: 'Create social post using uploaded content or generate new images',
        parameters: ['platform', 'content', 'useUploadedContent', 'generateImage'],
        requiredInput: ['platform', 'content']
      },
      {
        id: 'create-content-aware-campaign',
        name: 'Create Content-Aware Campaign',
        description: 'Plan multi-platform campaign leveraging uploaded content',
        parameters: ['campaignName', 'platforms', 'useUploadedContent'],
        requiredInput: ['campaignName', 'platforms']
      },
      {
        id: 'analyze-content-usage',
        name: 'Analyze Content Usage',
        description: 'Analyze content inventory and usage statistics',
        parameters: [],
        requiredInput: []
      },
      {
        id: 'get-relevant-content',
        name: 'Get Relevant Content',
        description: 'Find relevant uploaded content for specific platform and content',
        parameters: ['platform', 'content'],
        requiredInput: ['platform', 'content']
      }
    ];
  }
}

module.exports = SocialContentAgent; 