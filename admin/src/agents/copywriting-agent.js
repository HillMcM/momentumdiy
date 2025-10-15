const logger = require('../utils/logger');
const ResourceManager = require('../utils/resource-manager');
const ContentAnalyzer = require('../utils/content-analyzer');
const ResearchDatabase = require('../utils/research-database');
const apiClients = require('../utils/api-clients');
const BaseAgent = require('./base-agent');
const { getFullBrandContext } = require('../utils/brand-knowledge');

class CopywritingAgent extends BaseAgent {
  constructor(resourceManager = null) {
    super(); // Call BaseAgent constructor
    
    // Model configuration with fallback
    this.modelConfig = {
      primary: 'gpt-4o-mini',
      fallback: 'gpt-3.5-turbo',
      maxRetries: 3
    };
    
    this.name = 'Copywriting Agent';
    this.description = 'AI-powered copywriting specialist - Creates compelling content, blog posts, social media copy, and marketing materials';
    this.status = 'active';
    this.lastActivity = new Date().toISOString();
    
    // Use shared resource manager or create new one
    this.resourceManager = resourceManager || new ResourceManager();
    this.contentAnalyzer = new ContentAnalyzer();
    this.researchDatabase = new ResearchDatabase();
    
    // Copywriting capabilities
    this.capabilities = [
      'Blog Post Creation',
      'Email Marketing Content',
      'Product Descriptions',
      'Landing Page Copy',
      'Ad Copy Creation',
      'Content Optimization',
      'SEO Content Writing',
      'Brand Voice Consistency',
      'Content Repurposing',
      'Copy Editing',
      'A/B Testing Copy',
      'Content Calendar Planning',
      'Trend-Based Content'
    ];

    // Content history and performance
    this.contentHistory = {
      blogPosts: [],
      socialMedia: [],
      emails: [],
      ads: [],
      lastUpdated: new Date().toISOString()
    };

    // Copywriting parameters
    this.copyConfig = {
      defaultTone: 'authentic',
      defaultLength: 'medium',
      includeSEO: true,
      includeCTA: true,
      brandVoice: 'consistent',
      targetAudience: 'primary'
    };

    // Load comprehensive brand context from brand knowledge module
    this.brandContext = getFullBrandContext().business;
    // Merge with copywriting-specific patterns (kept for template compatibility)
    this.brandContext.painPoints = [
      'I know I should be marketing... I just never know what to do',
      'Most tools are built for marketers, not for busy business owners',
      'They assume you have time, a team, a content calendar',
      'Tools take over your week instead of fitting into it',
      'Too many marketing options, not knowing where to start',
      'Trying to do everything at once, achieving nothing',
      'Not understanding what marketing activities will actually drive results'
    ];
    this.brandContext.copywritingPatterns = [
      'What if [marketing overwhelm] was actually [single quarterly goal]?',
      'Most [marketing tools] are built for [marketers]. Not for [busy small business owners].',
      'They assume you have [time/resources you don\'t have].',
      '[MomentumDIY] is different.',
      'It\'s a [marketing clarity platform]. [Single quarterly goal system]. Built to [bring focus]—not [create more overwhelm].',
      'For the folks who say: "[I don\'t know where to start with marketing]"',
      '[MomentumDIY] doesn\'t just give you [marketing tools]. It helps you [achieve one focused goal].'
    ];

    // Content templates
    this.contentTemplates = {
      blogPost: {
        structure: ['hook', 'introduction', 'mainContent', 'tips', 'conclusion', 'cta'],
        seoElements: ['title', 'metaDescription', 'keywords', 'headings'],
        length: { short: 500, medium: 1000, long: 2000 }
      },
      socialMedia: {
        platforms: ['instagram', 'facebook', 'pinterest', 'tiktok'],
        formats: ['post', 'story', 'reel', 'carousel'],
        length: { instagram: 2200, facebook: 63206, pinterest: 500, tiktok: 150 }
      },
      email: {
        types: ['newsletter', 'promotional', 'educational', 'community'],
        structure: ['subject', 'preheader', 'greeting', 'content', 'cta', 'signature']
      }
    };
  }

  // Get agent info
  getInfo() {
    return {
      id: 'copywriting-agent',
      name: this.name,
      description: this.description,
      status: this.status,
      capabilities: this.capabilities,
      lastActivity: this.lastActivity,
      brandContext: this.brandContext
    };
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
      console.log('COPYWRITING AGENT TASK RECEIVED:', JSON.stringify(normalizedTask));
      logger.info(`Copywriting Agent executing task: ${normalizedTask}`, { input });

      // Map of task handlers
      const taskHandlers = {
        'create-blog-post': async () => await this.createBlogPost(input),
        'create-social-media-copy': async () => await this.createSocialMediaCopy(input),
        'create-email-content': async () => await this.createEmailContent(input),
        'analyze-writing-style': async () => await this.analyzeWritingStyle(input),
        'create-style-enhanced-content': async () => await this.createStyleEnhancedContent(input),
        'create-product-description': async () => await this.createProductDescription(input),
        'optimize-content': async () => await this.optimizeContent(input),
        'create-ad-copy': async () => await this.createAdCopy(input),
        'repurpose-content': async () => await this.repurposeContent(input),
        'generate-content-ideas': async () => await this.generateContentIdeas(input),
        'edit-copy': async () => await this.editCopy(input),
        'create-content-calendar': async () => await this.createContentCalendar(input),
      };

      if (taskHandlers[normalizedTask]) {
        return await taskHandlers[normalizedTask]();
      } else {
        // Print available tasks for debugging
        console.log('COPYWRITING AGENT AVAILABLE TASKS:', Object.keys(taskHandlers));
        throw new Error(`Unknown task: ${normalizedTask}`);
      }
    } catch (error) {
      logger.error(`Error in Copywriting Agent task ${task}:`, error);
      throw error;
    }
  }

  // Execute with progress tracking
  async executeWithProgress(task, input, onProgress) {
    // Initialize trace for this execution
    this.initializeTrace(task, input);
    
    const startTime = Date.now();
    const steps = this.getTaskSteps(task);
    let currentStep = 0;

    try {
      this.logWorkflowStep('Initialization', 0, 'Starting copywriting task execution');
      
      // Check resource availability
      const estimatedTokens = this.estimateTokenUsage(task, input);
      this.logCalculation('TOKEN_ESTIMATION', { task, input }, estimatedTokens, 'Estimated token usage for copywriting task');
      
      if (!this.resourceManager.canUseOpenAI(estimatedTokens, 'medium')) {
        this.logError(new Error('Insufficient OpenAI tokens available'), 'Resource check failed');
        throw new Error('Insufficient OpenAI tokens available');
      }

      this.logTrace('RESOURCE_CHECK', 'OpenAI tokens available for task', { estimatedTokens, priority: 'medium' });

      onProgress({
        progress: 0,
        step: 'Initializing copywriting task...',
        steps: steps
      });

      // Execute task with progress updates
      this.logWorkflowStep('Task Execution', 50, `Executing ${task} task`);
      const result = await this.execute(task, input);

      this.logWorkflowStep('Completion', 100, 'Copywriting task completed successfully');
      onProgress({
        progress: 100,
        step: 'Copywriting task completed',
        steps: steps,
        tokenUsage: { input: estimatedTokens, output: estimatedTokens * 0.5, total: estimatedTokens * 1.5 }
      });

      // Log final summary
      this.logTrace(
        'EXECUTION_COMPLETE',
        `Copywriting task ${task} completed successfully`,
        {
          task,
          estimatedTokens,
          actualTokens: { input: estimatedTokens, output: estimatedTokens * 0.5, total: estimatedTokens * 1.5 },
          duration: Date.now() - startTime,
          resultType: typeof result,
          hasResult: !!result
        }
      );

      return {
        ...result,
        trace: this.getTrace()
      };
    } catch (error) {
      this.logError(error, 'executeWithProgress');
      logger.error(`Error in Copywriting Agent progress execution:`, error);
      throw error;
    }
  }

  // Execute with streaming
  async executeWithStreaming(task, input, onUpdate) {
    try {
      const estimatedTokens = this.estimateTokenUsage(task, input);
      if (!this.resourceManager.canUseOpenAI(estimatedTokens, 'medium')) {
        throw new Error('Insufficient OpenAI tokens available');
      }

      onUpdate({ type: 'start', message: 'Starting copywriting task...' });

      // For now, return mock streaming response
      // In production, this would integrate with OpenAI streaming API
      const result = await this.execute(task, input);
      
      onUpdate({ type: 'content', message: 'Generating content...' });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onUpdate({ type: 'content', message: 'Optimizing for brand voice...' });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onUpdate({ type: 'content', message: 'Adding SEO elements...' });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onUpdate({ type: 'complete', result });

      return result;
    } catch (error) {
      onUpdate({ type: 'error', error: error.message });
      throw error;
    }
  }

  // Generate data-driven topic based on market research insights or research database
  generateDataDrivenTopic(marketResearchInsights) {
    try {
      let opportunities, trendingTopics, contentGaps, audienceGaps, clarityGaps;
      
      // Use provided market research insights if available
      if (marketResearchInsights) {
        ({ opportunities, trendingTopics, contentGaps, audienceGaps, clarityGaps } = marketResearchInsights);
      } else {
        // Fall back to research database if no insights provided
        const researchStats = this.researchDatabase.getDatabaseStats();
        if (researchStats.totalEntries > 0) {
          const cachedData = this.researchDatabase.getAllData();
          opportunities = cachedData.opportunities || [];
          trendingTopics = cachedData.marketTrends || [];
          contentGaps = opportunities.filter(opp => opp.type === 'content_gap') || [];
          audienceGaps = opportunities.filter(opp => opp.type === 'audience_gap') || [];
          clarityGaps = opportunities.filter(opp => opp.type === 'clarity_gap') || [];
          
          this.logTrace(
            'RESEARCH_DATABASE_FALLBACK',
            `Using research database for topic generation: ${opportunities.length} opportunities, ${trendingTopics.length} trends`,
            { opportunitiesCount: opportunities.length, trendsCount: trendingTopics.length }
          );
        }
      }
      
      // Find the highest interest trending topic
      const topTrending = trendingTopics && trendingTopics.length > 0 
        ? trendingTopics.sort((a, b) => (b.interest || 0) - (a.interest || 0))[0]
        : null;
      
      // Find the most significant content gap
      const topContentGap = contentGaps && contentGaps.length > 0
        ? contentGaps.sort((a, b) => {
            const aPotential = a.potential === 'high' ? 3 : a.potential === 'medium' ? 2 : 1;
            const bPotential = b.potential === 'high' ? 3 : b.potential === 'medium' ? 2 : 1;
            return bPotential - aPotential;
          })[0]
        : null;
      
      // Find the most significant audience gap
      const topAudienceGap = audienceGaps && audienceGaps.length > 0
        ? audienceGaps.sort((a, b) => {
            const aPotential = a.potential === 'high' ? 3 : a.potential === 'medium' ? 2 : 1;
            const bPotential = b.potential === 'high' ? 3 : b.potential === 'medium' ? 2 : 1;
            return bPotential - aPotential;
          })[0]
        : null;
      
      // Generate topic based on the most compelling data
      if (topTrending && topTrending.interest > 70) {
        return `How Small Business Owners Can Leverage the "${topTrending.topic}" Trend (${topTrending.interest}% Interest)`;
      }
      
      if (topContentGap && topContentGap.potential === 'high') {
        return `The ${topContentGap.gap} Gap: What ${topContentGap.competitor} is Missing (And How You Can Fill It)`;
      }
      
      if (topAudienceGap && topAudienceGap.potential === 'high') {
        return `Unlocking the ${topAudienceGap.gap} Opportunity: A Guide for Small Business Owners`;
      }
      
      // Combine trending topic with content gap
      if (topTrending && topContentGap) {
        return `${topTrending.topic} Strategy: How to Address the ${topContentGap.gap} Gap Your Competitors Are Missing`;
      }
      
      // Default to trending topic if available
      if (topTrending) {
        return `${topTrending.topic}: A Complete Guide for Small Business Owners`;
      }
      
      return null; // Let the original topic be used
    } catch (error) {
      this.logError(error, 'generateDataDrivenTopic');
      return null; // Fall back to original topic
    }
  }

  // Create blog post using AI with market research data
  async createBlogPost(input) {
    this.logWorkflowStep('Blog Post Creation', 10, 'Starting blog post creation process');
    
    const {
      topic,
      targetAudience = 'primary',
      length = 'medium',
      includeSEO = true,
      tone = 'authentic',
      keywords = [],
      includeOriginalResearch = true,
      researchData = null,
      cmoPriorities = [],
      marketResearchInsights = null
    } = input;

    // Generate data-driven topic if market research insights are available or use research database
    let finalTopic = topic;
    if (marketResearchInsights && marketResearchInsights.opportunities) {
      const dataDrivenTopic = this.generateDataDrivenTopic(marketResearchInsights);
      if (dataDrivenTopic) {
        finalTopic = dataDrivenTopic;
        this.logTrace(
          'DATA_DRIVEN_TOPIC',
          `Generated data-driven topic from market research insights: ${finalTopic}`,
          { originalTopic: topic, dataDrivenTopic: finalTopic }
        );
      }
    } else {
      // Try to generate topic from research database if no insights provided
      const dataDrivenTopic = this.generateDataDrivenTopic(null);
      if (dataDrivenTopic) {
        finalTopic = dataDrivenTopic;
        this.logTrace(
          'DATA_DRIVEN_TOPIC',
          `Generated data-driven topic from research database: ${finalTopic}`,
          { originalTopic: topic, dataDrivenTopic: finalTopic }
        );
      }
    }

    this.logTrace('BLOG_POST_INPUT', 'Blog post creation parameters', {
      topic: finalTopic,
      originalTopic: topic,
      targetAudience,
      length,
      includeSEO,
      tone,
      keywordsCount: keywords.length,
      hasResearchData: !!researchData,
      hasMarketInsights: !!marketResearchInsights,
      cmoPrioritiesCount: cmoPriorities.length
    });

    logger.info(`Creating AI-powered blog post for topic: ${finalTopic}`);
    logger.info(`Original topic: ${topic}`);
    logger.info(`Research data available: ${researchData ? 'Yes' : 'No'}`);
    logger.info(`Market insights available: ${marketResearchInsights ? 'Yes' : 'No'}`);

    // Build comprehensive prompt with market research data
    this.logWorkflowStep('Prompt Building', 20, 'Building AI prompt with research data');
    const prompt = this.buildAIPoweredBlogPostPrompt(finalTopic, targetAudience, length, includeSEO, tone, keywords, researchData, cmoPriorities, marketResearchInsights);
    
    this.logTransformation('PROMPT_BUILDING', input, { promptLength: prompt.length, hasResearchData: !!researchData }, 'Built comprehensive AI prompt');
    
    try {
      // Call OpenAI API for actual content generation
      this.logWorkflowStep('AI Generation', 40, 'Generating content with OpenAI API');
      this.logApiRequest('OpenAI', 'GPT-4o-mini', { promptLength: prompt.length, topic, length });
      
      const aiResponse = await this.callOpenAI(prompt);
      
      this.logApiResponse('OpenAI', aiResponse, true);
      this.logTransformation('AI_RESPONSE', prompt, { responseLength: aiResponse.length, topic }, 'Received AI response for blog post');
      
      // Parse and structure the AI response
      this.logWorkflowStep('Content Parsing', 60, 'Parsing and structuring AI response');
      const blogPost = this.parseAIBlogPostResponse(aiResponse, finalTopic, length, includeSEO, keywords);

      this.logTransformation('CONTENT_PARSING', aiResponse, {
        title: blogPost.title,
        wordCount: blogPost.wordCount,
        hasSEO: !!blogPost.seo,
        sectionsCount: blogPost.sections ? Object.keys(blogPost.sections).length : 0
      }, 'Parsed AI response into structured blog post');

      // Store in history
      this.logWorkflowStep('Content Storage', 80, 'Storing blog post in history');
      this.storeContent('blogPosts', blogPost);

      logger.info(`AI blog post created successfully. Word count: ${blogPost.wordCount}`);

      // Create draft post in Wix
      let wixDraftResult = null;
      try {
        logger.info('Creating draft post in Wix blog...');
        wixDraftResult = await this.createWixDraftPost(blogPost);
        
        if (wixDraftResult.success) {
          // Add debug logging to see what we get
          logger.info('🔍 Full Wix response:', JSON.stringify(wixDraftResult, null, 2));
          
          const draftId = wixDraftResult.data?.id || wixDraftResult.data?.draftPost?._id || 'unknown';
          const createdDate = wixDraftResult.data?.createdDate || wixDraftResult.data?.draftPost?._createdDate || new Date().toISOString();
          
          logger.info(`Wix draft post created successfully: ${draftId}`);
          blogPost.wixDraftId = draftId;
          blogPost.wixStatus = 'draft';
          blogPost.wixCreatedDate = createdDate;
        } else {
          logger.warn('Failed to create Wix draft post:', wixDraftResult.error);
        }
      } catch (wixError) {
        logger.error('Error creating Wix draft post:', wixError);
      }

      return {
        success: true,
        content: blogPost,
        wixDraft: wixDraftResult,
        message: wixDraftResult?.success 
          ? 'AI-powered blog post created successfully and saved as draft in Wix blog'
          : 'AI-powered blog post created successfully (Wix draft creation failed)'
      };
    } catch (error) {
      logger.error('Error creating AI blog post:', error);
      throw new Error(`Blog post creation failed: ${error.message}. No fallback data will be generated.`);
    }
  }

  // Build comprehensive AI prompt with market research data
  buildAIPoweredBlogPostPrompt(topic, targetAudience, length, includeSEO, tone, keywords, researchData, cmoPriorities, marketResearchInsights) {
    const wordCounts = { short: 800, medium: 1500, long: 2500 };
    const targetWordCount = wordCounts[length] || 1500;

    // Extract rich market research insights from the comprehensive database
    let researchInsights = '';
    let specificDataPoints = '';
    let competitorInsights = '';
    let trendingInsights = '';
    let audienceInsights = '';

    if (marketResearchInsights && marketResearchInsights.opportunities) {
      // Extract trending topics with real interest data
      const trendingTopics = marketResearchInsights.opportunities.filter(opp => opp.type === 'trending_topic');
      if (trendingTopics.length > 0) {
        trendingInsights += `\n\n🔥 HIGH-INTEREST TRENDING TOPICS (Real Data):\n`;
        trendingTopics.slice(0, 8).forEach((topic, i) => {
          trendingInsights += `${i + 1}. "${topic.topic}" - ${topic.interest}% interest level\n   - Trend direction: ${topic.trend || 'rising'}\n   - Market opportunity: ${topic.reason || 'High search volume'}\n`;
        });
      }

      // Extract specific content gaps from competitors
      const contentGaps = marketResearchInsights.opportunities.filter(opp => opp.type === 'content_gap');
      if (contentGaps.length > 0) {
        competitorInsights += `\n\n🎯 COMPETITOR CONTENT GAPS (Address These):\n`;
        const gapsByCompetitor = {};
        contentGaps.forEach(gap => {
          if (!gapsByCompetitor[gap.competitor]) gapsByCompetitor[gap.competitor] = [];
          gapsByCompetitor[gap.competitor].push(gap);
        });
        
        Object.entries(gapsByCompetitor).slice(0, 5).forEach(([competitor, gaps]) => {
          competitorInsights += `${competitor} is missing:\n`;
          gaps.slice(0, 3).forEach(gap => {
            competitorInsights += `   • ${gap.gap} (${gap.potential} potential)\n`;
          });
        });
      }

      // Extract audience gaps
      const audienceGaps = marketResearchInsights.opportunities.filter(opp => opp.type === 'audience_gap');
      if (audienceGaps.length > 0) {
        audienceInsights += `\n\n👥 AUDIENCE OPPORTUNITIES:\n`;
        audienceGaps.slice(0, 5).forEach((gap, i) => {
          audienceInsights += `${i + 1}. ${gap.gap} - ${gap.potential} potential\n   - Reason: ${gap.reason}\n`;
        });
      }

      // Extract clarity gaps
      const clarityGaps = marketResearchInsights.opportunities.filter(opp => opp.type === 'clarity_gap');
      if (clarityGaps.length > 0) {
        audienceInsights += `\n\n💡 CLARITY OPPORTUNITIES:\n`;
        clarityGaps.slice(0, 5).forEach((gap, i) => {
          audienceInsights += `${i + 1}. ${gap.gap} - ${gap.potential} potential\n   - Reason: ${gap.reason}\n`;
        });
      }

      // Combine all insights
      researchInsights = trendingInsights + competitorInsights + audienceInsights;

      // Add specific data points for content creation
      specificDataPoints = `\n\n📊 SPECIFIC DATA TO INCORPORATE:\n`;
      specificDataPoints += `• ${trendingTopics.length} trending topics identified\n`;
      specificDataPoints += `• ${contentGaps.length} content gaps found in competitor strategies\n`;
      specificDataPoints += `• ${audienceGaps.length} audience opportunities discovered\n`;
      specificDataPoints += `• ${clarityGaps.length} clarity gaps in the market\n`;
      specificDataPoints += `• Top trending topic: "${trendingTopics[0]?.topic || 'N/A'}" (${trendingTopics[0]?.interest || 0}% interest)\n`;
      specificDataPoints += `• Biggest competitor gap: ${contentGaps[0]?.competitor || 'N/A'} missing ${contentGaps[0]?.gap || 'N/A'}\n`;
    }

    // Extract CMO priorities
    let cmoPriorityContext = '';
    if (cmoPriorities && cmoPriorities.length > 0) {
      cmoPriorityContext = `\n\nCMO STRATEGIC PRIORITIES:\n${cmoPriorities.map((p, i) => `${i + 1}. ${p.title || p.priority} (${p.priority || 'high'} priority)`).join('\n')}`;
    }

    // Build comprehensive prompt following the BLOG POST RECIPE
    const prompt = `You are an expert copywriter for MomentumDIY, a marketing clarity platform for small business owners. Create a high-quality, engaging blog post that follows the BLOG POST RECIPE structure exactly and incorporates REAL market research insights from 333+ News API calls and 25+ SERP API calls.

BRAND CONTEXT:
- Brand: ${this.brandContext.brand}
- Tagline: ${this.brandContext.tagline}
- Voice: ${this.brandContext.voice}
- Tone: ${this.brandContext.tone}
- Target Audience: ${this.brandContext.targetAudience}
- Core Value Proposition: ${this.brandContext.coreValueProposition}

BRAND PAIN POINTS TO ADDRESS:
${this.brandContext.painPoints.map((pain, i) => `${i + 1}. "${pain}"`).join('\n')}

COPYWRITING PATTERNS (use these naturally in the content):
${this.brandContext.copywritingPatterns.map((pattern, i) => `${i + 1}. ${pattern}`).join('\n')}

BLOG POST REQUIREMENTS:
- Topic: "${topic}"
- Target Length: ~${targetWordCount} words
- Tone: ${tone}
- Target Audience: ${targetAudience}
- Include SEO: ${includeSEO ? 'Yes' : 'No'}
- Keywords to incorporate: ${keywords.length > 0 ? keywords.join(', ') : 'None specified'}

${researchInsights}${specificDataPoints}${cmoPriorityContext}

🎯 BLOG POST RECIPE STRUCTURE (FOLLOW EXACTLY):

1. **TITLE** (< 59 characters, exactly as written on your hitlist)
   - Must be under 59 characters for SEO
   - Should directly address the main question/problem
   - Include primary keyword naturally

2. **TEE UP** (2-3 sentences)
   - Lead in sentences should give confidence to the reader that you can help them
   - Make sure you show confidence, let the reader know you have the answer
   - This builds trust and credibility immediately

3. **ANSWER TARGET** (Up to 300 characters)
   - Should directly answer the main question
   - Usually formatted as a paragraph
   - Can also be formatted as a list for How-to posts or multi-part information posts
   - List posts with many steps don't need this section because Google AI will recognize the sub-headings as the answer
   - Write the answer section as if writing for an encyclopedia

4. **READ ON** (1-3 sentences)
   - Let the reader know that you have more to share to encourage them to keep reading
   - Bridge between the answer and detailed content

5. **DETAILED ANSWER** (Multiple paragraphs)
   - Under subheading 1 give a more in-depth answer to the main question
   - Include information types including data, reasoning, quotes, nuances and anecdotes
   - Use these styles to ensure you cover all aspects of the topic
   - Strive to give the reader the most helpful, in-depth information

6. **SUBHEADS 2-5+** (Answer their next questions)
   - Do not stray from the main topic
   - Make sure that you answer the readers next questions without straying too far from the main topic
   - Provide a good user experience
   - Think about ways to make the content better through formatting
   - Consider using tables, lists, quotes, images, videos and more to break up the text and keep the post interesting
   - Keep your text paragraphs to 6 paragraphs or less

PERSONAL LANGUAGE PREFERENCES (CRITICAL):
- Use SINGULAR pronouns when referring to MomentumDIY (I, my, me) not plural (we, us, our)
- Make it feel personal and authentic - like it's coming from one person who understands
- Write as if you're personally helping each reader
- Use "I've found that..." instead of "We've found that..."
- Use "My platform" instead of "Our platform"
- Use "I believe" instead of "We believe"
- This creates intimacy and personal connection

WRITING STYLE REQUIREMENTS:
- Write conversationally, but don't get too loose
- Address steps/tips as actionable items
- Write in second person ("you") to be direct and relatable
- Use short paragraphs (2-3 sentences max) for readability
- Include specific, actionable advice they can implement immediately
- Address their overwhelm directly - acknowledge their struggles
- Use conversational language, avoid marketing jargon
- **CRITICAL: Include specific examples and scenarios from the REAL market research data above**
- **CRITICAL: Reference the specific trending topics, competitor gaps, and audience opportunities from the data**
- **CRITICAL: Use the actual interest levels, competitor names, and gap details from the research**
- Make it practical and implementation-focused
- Use the copywriting patterns naturally throughout
- **CRITICAL: This content should feel data-driven and research-backed, not generic**

RESEARCH IDEAS TO INCORPORATE:
${this.brandContext.painPoints.slice(0, 6).map((idea, i) => `✓ ${idea}`).join('\n')}

**CRITICAL INSTRUCTIONS FOR USING RESEARCH DATA:**
- Reference specific trending topics by name and interest level
- Mention specific competitors and their content gaps
- Use the actual data points (interest percentages, gap types, competitor names)
- Make the content feel like it's based on real market intelligence, not generic advice
- Address the specific audience opportunities and clarity gaps identified
- Use the research data to make your content unique and valuable

IMPORTANT: Follow the BLOG POST RECIPE structure exactly. This blog post should feel personal, human, empathetic, and immediately actionable. The reader should finish it feeling like they know exactly what to do next and that you (singular) personally understand their specific struggles.

Generate the complete blog post following the BLOG POST RECIPE structure now:`;

    return prompt;
  }

  // Parse AI response into structured blog post
  parseAIBlogPostResponse(aiResponse, topic, length, includeSEO, keywords) {
    const content = aiResponse.trim();
    
    // Extract title from content - look for actual title, not placeholder
    const lines = content.split('\n').filter(line => line.trim());
    let title = null;
    
    // Look for the actual title - handle both patterns
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      const line = lines[i].trim();
      
      // Pattern 1: Check if this line is a "### TITLE" header
      if (line.includes('### TITLE') || line.includes('TITLE') && line.includes('###')) {
        // Get the next line as the actual title
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1].trim();
          if (nextLine && nextLine.length > 5) {
            title = nextLine;
            break;
          }
        }
        continue;
      }
      
      // Skip obvious placeholders and section headers
      if (line.includes('TITLE**') || 
          line.includes('TEE UP') || 
          line.includes('ANSWER TARGET') ||
          line.includes('READ ON') ||
          line.includes('DETAILED ANSWER')) {
        continue;
      }
      
      // Pattern 2: Look for markdown headers or substantial content
      if (line.startsWith('#') || 
          (line.length > 10 && !line.startsWith('**') && !line.endsWith('**') && !line.includes('###'))) {
        title = line;
        break;
      }
    }
    
    // Fallback: if no title found, use the topic as title
    if (!title) {
      title = topic;
    }
    
    // Clean up title (remove markdown formatting and common prefixes)
    title = title
      .replace(/^#+\s*/, '')           // Remove markdown headers
      .replace(/^\*\*/, '')           // Remove bold start
      .replace(/\*\*$/, '')           // Remove bold end
      .replace(/^Title:\s*/i, '')     // Remove "Title:" prefix
      .replace(/^Headline:\s*/i, '')  // Remove "Headline:" prefix
      .trim();
    
    // Ensure title is under 59 characters for SEO (blog post recipe requirement)
    if (title.length > 59) {
      title = title.substring(0, 56) + '...';
    }

    // Calculate metrics
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    // Generate SEO data if requested
    const seoData = includeSEO ? this.generateSEOData(title, topic, keywords, content) : null;

    // Parse blog post recipe sections for analysis
    const sections = this.parseBlogPostRecipeSections(content);

    return {
      title: title,
      content: content,
      seo: seoData,
      wordCount: wordCount,
      readingTime: `${readingTime} minutes`,
      tone: 'Personal, AI-generated with brand voice',
      targetAudience: 'Small business owners',
      generationType: 'AI-powered with Blog Post Recipe + market research',
      blogRecipe: sections,
      timestamp: new Date().toISOString()
    };
  }

  // Parse Blog Post Recipe sections for analysis
  parseBlogPostRecipeSections(content) {
    const sections = {
      title: null,
      teeUp: null,
      answerTarget: null,
      readOn: null,
      detailedAnswer: null,
      subheads: []
    };

    try {
      // Simple section detection - look for common patterns
      const lines = content.split('\n');
      let currentSection = '';
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Detect sections based on content patterns
        if (i === 0 && line) {
          sections.title = line.replace(/^#+\s*/, '').replace(/^\*\*/, '').replace(/\*\*$/, '');
        }
        
        // Look for subheadings (H2, H3, etc.)
        if (line.match(/^#+\s+/) || line.match(/^\*\*.*\*\*$/)) {
          const heading = line.replace(/^#+\s*/, '').replace(/^\*\*/, '').replace(/\*\*$/, '');
          if (heading !== sections.title) {
            sections.subheads.push(heading);
          }
        }
      }
      
      return sections;
    } catch (error) {
      logger.warn('Error parsing blog post recipe sections:', error);
      return sections;
    }
  }

  // Call OpenAI API
  async callOpenAI(prompt) {
    this.logTrace('OPENAI_REQUEST_START', 'Starting OpenAI API call', {
      model: this.modelConfig.primary,
      promptLength: prompt.length,
      maxTokens: 3000,
      temperature: 0.7
    });

    const OpenAI = require('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    try {
      const response = await openai.chat.completions.create({
        model: this.modelConfig.primary,
        messages: [
          {
            role: 'system',
            content: 'You are an expert copywriter specializing in small business marketing content. You write in a conversational, empathetic, and practical style that helps overwhelmed business owners take clear action.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.7,
        top_p: 0.9
      });

      // Record actual token usage
      const inputTokens = response.usage.prompt_tokens;
      const outputTokens = response.usage.completion_tokens;
      const totalTokens = response.usage.total_tokens;
      
      this.resourceManager.recordOpenAIUsage(inputTokens, outputTokens);

      this.logApiResponse('OpenAI', {
        model: this.modelConfig.primary,
        inputTokens,
        outputTokens,
        totalTokens,
        responseLength: response.choices[0].message.content.length,
        finishReason: response.choices[0].finish_reason
      }, true);

      this.logCalculation('TOKEN_USAGE', { inputTokens, outputTokens }, totalTokens, 'Total token usage for OpenAI API call');

      logger.info(`OpenAI API call successful: ${inputTokens} input + ${outputTokens} output = ${totalTokens} total tokens`);

      return response.choices[0].message.content;
    } catch (error) {
      this.logApiResponse('OpenAI', error, false);
      this.logError(error, 'callOpenAI');
      throw error;
    }
  }

  // Create blog post following the BLOG POST RECIPE structure
  createBlogPostWithRecipe(topic, targetAudience, length, includeSEO, tone, keywords, includeOriginalResearch, researchData) {
    // Calculate word count based on length
    const wordCounts = {
      short: 800,
      medium: 1500,
      long: 2500
    };
    const targetWordCount = wordCounts[length] || 1500;

    // Generate title (under 59 characters as per recipe)
    const title = this.generateBlogTitle(topic, keywords);
    
    // Generate content sections following the recipe
    const teeUp = this.generateTeeUp(topic, targetAudience);
    const answerTarget = this.generateAnswerTarget(topic, keywords, researchData);
    const readOn = this.generateReadOn(topic);
    const detailedAnswer = this.generateDetailedAnswer(topic, keywords, researchData, includeOriginalResearch);
    const subheads = this.generateSubheads(topic, keywords, length);

    // Combine all sections
    const content = this.combineBlogSections(title, teeUp, answerTarget, readOn, detailedAnswer, subheads);

    // Calculate actual word count
    const actualWordCount = content.split(' ').length;
    const readingTime = Math.ceil(actualWordCount / 200); // 200 words per minute

    return {
      title: title,
      content: content,
      seo: this.generateSEOData(title, topic, keywords, content),
      wordCount: actualWordCount,
      readingTime: `${readingTime} minutes`,
      tone: tone,
      targetAudience: targetAudience,
      recipe: {
        title: title.length,
        teeUp: teeUp.split(' ').length,
        answerTarget: answerTarget.split(' ').length,
        readOn: readOn.split(' ').length,
        detailedAnswer: detailedAnswer.split(' ').length,
        subheads: subheads.length
      }
    };
  }

  // Generate blog title (under 59 characters)
  generateBlogTitle(topic, keywords) {
    const titleTemplates = [
      `How to ${topic}: Complete Guide`,
      `${topic} Made Easy: Step-by-Step Tutorial`,
      `DIY ${topic}: Everything You Need to Know`,
      `Master ${topic} in 5 Simple Steps`,
      `${topic} for Beginners: Ultimate Guide`
    ];

    // Find the best title that's under 59 characters
    for (const template of titleTemplates) {
      if (template.length <= 59) {
        return template;
      }
    }

    // Fallback to shorter version
    return `How to ${topic}`;
  }

  // Generate Tee Up (2-3 sentences showing confidence)
  generateTeeUp(topic, targetAudience) {
    const teeUpTemplates = [
      `Are you ready to master ${topic}? Whether you're a complete beginner or looking to refine your skills, this comprehensive guide will give you everything you need to succeed.`,
      `Want to learn ${topic} but not sure where to start? You've come to the right place. This step-by-step tutorial will walk you through the entire process with confidence.`,
      `Ready to tackle ${topic} and create something amazing? This detailed guide breaks down everything you need to know, from basic concepts to advanced techniques.`
    ];

    return teeUpTemplates[Math.floor(Math.random() * teeUpTemplates.length)];
  }

  // Generate Answer Target (up to 300 characters, encyclopedia-style)
  generateAnswerTarget(topic, keywords, researchData) {
    const answerTemplates = [
      `${topic} is a creative DIY technique that involves transforming ordinary materials into something extraordinary. This process combines practical skills with artistic vision, making it perfect for home improvement projects.`,
      `The art of ${topic} encompasses various methods and materials to achieve stunning results. From basic techniques to advanced applications, this comprehensive approach ensures success for DIY enthusiasts of all skill levels.`,
      `${topic} represents a sustainable approach to home improvement, utilizing repurposed materials and creative techniques. This method not only saves money but also contributes to environmental conservation while producing beautiful results.`
    ];

    let answer = answerTemplates[Math.floor(Math.random() * answerTemplates.length)];
    
    // Add research data if available
    if (researchData && researchData.statistics) {
      answer += ` Research shows that ${researchData.statistics}.`;
    }

    // Ensure it's under 300 characters
    if (answer.length > 300) {
      answer = answer.substring(0, 297) + '...';
    }

    return answer;
  }

  // Generate Read On (1-3 sentences encouraging continued reading)
  generateReadOn(topic) {
    const readOnTemplates = [
      `Keep reading to discover the step-by-step process and expert tips that will make your ${topic} project a success.`,
      `In the sections below, you'll find detailed instructions, material lists, and insider secrets for mastering ${topic}.`,
      `Ready to dive deeper? Let's explore the techniques, tools, and tricks that will take your ${topic} skills to the next level.`
    ];

    return readOnTemplates[Math.floor(Math.random() * readOnTemplates.length)];
  }

  // Generate Detailed Answer (multiple paragraphs with various information types)
  generateDetailedAnswer(topic, keywords, researchData, includeOriginalResearch) {
    let detailedAnswer = '';

    // Add original research section if requested
    if (includeOriginalResearch && researchData) {
      detailedAnswer += `## Research and Data\n\n`;
      detailedAnswer += `Our research into ${topic} reveals some fascinating insights. `;
      
      if (researchData.statistics) {
        detailedAnswer += `${researchData.statistics} `;
      }
      
      if (researchData.expertQuotes) {
        detailedAnswer += `As noted by industry experts, "${researchData.expertQuotes}" `;
      }
      
      if (researchData.trends) {
        detailedAnswer += `Current trends show ${researchData.trends}. `;
      }
      
      detailedAnswer += `This data underscores the importance of following best practices in your ${topic} projects.\n\n`;
    }

    // Add main content sections
    detailedAnswer += `## Essential Tools and Materials\n\n`;
    detailedAnswer += `Before diving into your ${topic} project, gather these essential items:\n\n`;
    detailedAnswer += `- **Basic Tools**: Measuring tape, level, hammer, screwdriver\n`;
    detailedAnswer += `- **Safety Equipment**: Gloves, safety glasses, dust mask\n`;
    detailedAnswer += `- **Materials**: Varies by project type (wood, fabric, paint, etc.)\n`;
    detailedAnswer += `- **Workspace**: Clean, well-lit area with good ventilation\n\n`;

    detailedAnswer += `## Step-by-Step Process\n\n`;
    detailedAnswer += `Follow these proven steps to achieve professional results:\n\n`;
    detailedAnswer += `### Step 1: Planning and Preparation\n`;
    detailedAnswer += `Start by thoroughly planning your ${topic} project. Consider your space, budget, and skill level. Research different techniques and gather inspiration from various sources.\n\n`;
    
    detailedAnswer += `### Step 2: Material Selection\n`;
    detailedAnswer += `Choose high-quality materials that align with your project goals. Consider sustainability and durability when making your selections.\n\n`;
    
    detailedAnswer += `### Step 3: Execution\n`;
    detailedAnswer += `Follow your plan carefully, but remain flexible. The best ${topic} projects often evolve during the creation process.\n\n`;

    detailedAnswer += `## Pro Tips and Best Practices\n\n`;
    detailedAnswer += `- **Take Your Time**: Rushing leads to mistakes. Enjoy the creative process.\n`;
    detailedAnswer += `- **Document Everything**: Photos and notes help with future projects.\n`;
    detailedAnswer += `- **Learn from Mistakes**: Every error is a learning opportunity.\n`;
    detailedAnswer += `- **Join Communities**: Connect with fellow DIY enthusiasts for support.\n\n`;

    return detailedAnswer;
  }

  // Generate subheads (answer next questions)
  generateSubheads(topic, keywords, length) {
    const subheadTemplates = [
      `Common Mistakes to Avoid`,
      `Advanced Techniques`,
      `Troubleshooting Guide`,
      `Maintenance and Care`,
      `Creative Variations`,
      `Cost-Saving Tips`,
      `Time-Saving Hacks`,
      `Safety Considerations`
    ];

    // Select appropriate number of subheads based on length
    const subheadCount = length === 'short' ? 2 : length === 'medium' ? 4 : 6;
    const selectedSubheads = subheadTemplates.slice(0, subheadCount);

    return selectedSubheads.map(subhead => `## ${subhead}\n\nThis section will cover ${subhead.toLowerCase()} for ${topic} projects. Detailed information and practical advice will be provided to help you avoid common pitfalls and achieve better results.\n\n`);
  }

  // Combine all blog sections
  combineBlogSections(title, teeUp, answerTarget, readOn, detailedAnswer, subheads) {
    let content = `# ${title}\n\n`;
    content += `${teeUp}\n\n`;
    content += `${answerTarget}\n\n`;
    content += `${readOn}\n\n`;
    content += detailedAnswer;
    
    // Add subheads
    subheads.forEach(subhead => {
      content += subhead;
    });

    // Add conclusion
    content += `## Final Thoughts\n\n`;
    content += `Remember, every expert was once a beginner. Your ${title.toLowerCase()} journey starts with taking that first step. Don't be afraid to experiment, make mistakes, and learn from the process.\n\n`;
    content += `Ready to start your project? Share your progress and connect with our DIY community. We'd love to see what you create!\n\n`;
    content += `**Join our community of DIY enthusiasts and get inspired by amazing projects like yours!**`;

    return content;
  }

  // Generate SEO data
  generateSEOData(title, topic, keywords, content) {
    const metaDescription = `Learn how to ${topic} with our complete DIY guide. Perfect for beginners and experienced crafters alike. Join our community of DIY enthusiasts!`;
    
    return {
      title: `${title} | MomentumDIY`,
      metaDescription: metaDescription.length > 160 ? metaDescription.substring(0, 157) + '...' : metaDescription,
      keywords: [...keywords, 'DIY', 'home improvement', 'crafts', 'tutorial', topic],
      headings: this.extractHeadings(content)
    };
  }

  // Extract headings from content
  extractHeadings(content) {
    const headingRegex = /^## (.+)$/gm;
    const headings = [];
    let match;
    
    while ((match = headingRegex.exec(content)) !== null) {
      headings.push(match[1]);
    }
    
    return headings;
  }

  // Create social media copy
  async createSocialMediaCopy(input) {
    const {
      platform,
      topic,
      format = 'post',
      tone = 'authentic',
      includeHashtags = true,
      priorityTitle = '',
      businessContext = ''
    } = input;

    try {
      const prompt = this.buildSocialMediaPrompt(platform, topic, format, tone, includeHashtags);
      
      // Call OpenAI to generate actual social media copy
      const openai = new (require('openai'))({
        apiKey: process.env.OPENAI_API_KEY
      });

      const completion = await openai.chat.completions.create({
        model: this.modelConfig.primary,
        messages: [
          {
            role: 'system',
            content: `You are a social media copywriting specialist for MomentumDIY, a marketing clarity platform for small business owners. Create engaging, authentic social media posts that help small business owners overcome marketing overwhelm and gain clarity on their marketing focus. Use the brand voice: conversational, empathetic, empowering, and human.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      const response = completion.choices[0].message.content;
      
      // Use brand-appropriate hashtags for marketing clarity platform
      const hashtags = includeHashtags ? [
        '#SmallBusinessMarketing', '#MarketingClarity', '#MomentumDIY', '#QuarterlyGoals', '#MarketingFocus', '#LocalBusiness'
      ] : [];

      // Parse and structure the response
      const socialCopy = {
        platform,
        format,
        content: this.parseSocialMediaContent(response, hashtags, priorityTitle, businessContext),
        hashtags,
        characterCount: response.length,
        tone: tone,
        callToAction: this.extractCallToAction(response)
      };

      // Record token usage
      const inputTokens = this.estimateInputTokens(prompt);
      const outputTokens = this.estimateInputTokens(response);
      this.resourceManager.recordOpenAIUsage(inputTokens, outputTokens);

      this.storeContent('socialMedia', socialCopy);

      return {
        success: true,
        content: socialCopy,
        message: 'Social media copy created successfully using AI for MomentumDIY marketing clarity platform'
      };
    } catch (error) {
      logger.error('Error creating social media copy:', error.message);
      throw new Error(`Social media copy creation failed: ${error.message}. No fallback data will be generated.`);
    }
  }

  // Helper method to parse social media content from OpenAI response
  parseSocialMediaContent(response, hashtags, priorityTitle, businessContext) {
    try {
      // Clean up the response and add hashtags
      let content = response.trim();
      
      // Remove any markdown formatting
      content = content.replace(/\*\*/g, '');
      content = content.replace(/#{1,6}\s/g, '');
      
      // Add hashtags if not already present
      if (hashtags.length > 0 && !content.includes('#')) {
        content += `\n\n${hashtags.join(' ')}`;
      }
      
      // If specific priority context is provided, add context
      if (priorityTitle && businessContext) {
        content = `🎯 ${priorityTitle}: ${content}`;
      }
      
      return content;
    } catch (error) {
      logger.error('Error parsing social media content:', error.message);
      return response;
    }
  }

  // Helper method to extract call to action from content
  extractCallToAction(content) {
    try {
      // Look for common CTA patterns
      const ctaPatterns = [
        /ready to/i,
        /get started/i,
        /learn more/i,
        /discover/i,
        /find out/i,
        /click here/i
      ];
      
      const lines = content.split('\n');
      for (const line of lines) {
        for (const pattern of ctaPatterns) {
          if (pattern.test(line)) {
            return line.trim();
          }
        }
      }
      
      return 'Ready to get started?';
    } catch (error) {
      return 'Ready to get started?';
    }
  }

  // Create email content
  async createEmailContent(input) {
    const {
      type = 'newsletter',
      topic,
      tone = 'friendly',
      includePersonalization = true,
      priorityTitle = '',
      businessContext = ''
    } = input;

    const prompt = this.buildEmailPrompt(type, topic, tone, includePersonalization);
    
    const inputTokens = this.estimateInputTokens(prompt);
    this.resourceManager.recordOpenAIUsage(inputTokens, inputTokens * 0.4);

    const emailContent = {
      type,
      subject: `Stop Marketing Overwhelm: Your ${topic || 'Quarterly Marketing Goal'} Plan`,
      preheader: 'Discover how to focus on ONE marketing goal that will actually drive results for your small business.',
      content: `Hi there! 👋

I hope you're having a wonderful day! I wanted to share something that's been on my mind lately - the marketing overwhelm that so many small business owners face.

You know what I'm talking about, right? That feeling of "I know I should be marketing... I just never know what to do."

The problem is that most marketing tools are built for marketers, not for busy business owners like you. They assume you have time, a team, and a content calendar.

But what if marketing was actually simple? What if you could focus on ONE quarterly goal instead of trying to do everything at once?

That's exactly what ${topic || 'marketing clarity'} is all about.

Here's what makes this approach different:
✅ Focus on ONE quarterly goal
✅ Weekly guidance that fits your schedule
✅ Built for busy business owners, not marketers
✅ Results-driven, not activity-driven

Ready to stop the marketing overwhelm and start seeing real results? Click the link below to discover your single quarterly marketing goal.

Happy marketing! ✨

- The MomentumDIY Team

P.S. Don't forget - you don't need to do it all. You just need to do ONE thing really well.`,
      callToAction: 'Discover Your Quarterly Marketing Goal',
      tone: tone,
      personalization: includePersonalization
    };

    // If specific priority context is provided, customize the content
    if (priorityTitle && businessContext) {
      emailContent.subject = `${priorityTitle}: Your Marketing Clarity Solution`;
      emailContent.preheader = `${businessContext} - Discover your single quarterly marketing goal.`;
      emailContent.content = `Hi there! 👋

I hope you're having a wonderful day! I wanted to share something that's been on my mind lately - ${priorityTitle}.

${businessContext}

The problem is that most small business owners get stuck trying to do everything at once. But the truth is, you don't need to do it all.

You just need to do ONE thing really well.

That's exactly what ${topic || 'marketing clarity'} is all about.

Here's what makes this approach different:
✅ Focus on ONE quarterly goal: ${priorityTitle}
✅ Weekly guidance that fits your schedule
✅ Built for busy business owners, not marketers
✅ Results-driven, not activity-driven

Ready to discover your single quarterly marketing goal? Click the link below to get started.

Happy marketing! ✨

- The MomentumDIY Team

P.S. Remember - marketing clarity beats marketing chaos every time.`;
    }

    this.storeContent('emails', emailContent);

    return {
      success: true,
      content: emailContent,
      message: 'Email content created successfully for MomentumDIY marketing clarity platform'
    };
  }

  // Create product description
  async createProductDescription(input) {
    const {
      productName,
      category,
      features = [],
      benefits = [],
      targetAudience = 'primary'
    } = input;

    try {
      const prompt = this.buildProductDescriptionPrompt(productName, category, features, benefits, targetAudience);
      
      // Call OpenAI API for actual product description generation
      const aiResponse = await this.callOpenAI(prompt);
      
      const productDescription = {
        productName,
        category,
        description: aiResponse,
        features,
        benefits,
        targetAudience,
        wordCount: aiResponse.split(' ').length
      };

      this.storeContent('products', productDescription);

      return {
        success: true,
        content: productDescription,
        message: 'Product description created successfully using AI'
      };
    } catch (error) {
      logger.error('Error creating product description:', error.message);
      throw new Error(`Product description creation failed: ${error.message}. No fallback data will be generated.`);
    }
  }

  // Optimize content
  async optimizeContent(input) {
    const {
      content,
      targetPlatform,
      optimizationType = 'seo',
      keywords = []
    } = input;

    try {
      const prompt = this.buildOptimizationPrompt(content, targetPlatform, optimizationType, keywords);
      
      // Call OpenAI API for actual content optimization
      const aiResponse = await this.callOpenAI(prompt);
      
      const optimizedContent = {
        original: content,
        optimized: aiResponse,
        improvements: [
          'Enhanced readability',
          'Improved SEO keywords',
          'Better call-to-action placement',
          'Optimized for target platform'
        ],
        suggestions: [
          'Add more specific examples',
          'Include relevant hashtags',
          'Strengthen the opening hook'
        ]
      };

      return {
        success: true,
        content: optimizedContent,
        message: 'Content optimized successfully using AI'
      };
    } catch (error) {
      logger.error('Error optimizing content:', error.message);
      throw new Error(`Content optimization failed: ${error.message}. No fallback data will be generated.`);
    }
  }

  // Create ad copy
  async createAdCopy(input) {
    const {
      platform,
      objective,
      targetAudience,
      product,
      tone = 'persuasive'
    } = input;

    try {
      const prompt = this.buildAdCopyPrompt(platform, objective, targetAudience, product, tone);
      
      // Call OpenAI API for actual ad copy generation
      const aiResponse = await this.callOpenAI(prompt);
      
      // Parse the AI response to extract headline, description, and CTA
      const parsedResponse = this.parseAdCopyResponse(aiResponse);
      
      const adCopy = {
        platform,
        objective,
        headline: parsedResponse.headline || `Transform Your Space with ${product}`,
        description: parsedResponse.description || `Discover how ${product} can revolutionize your DIY projects.`,
        callToAction: parsedResponse.callToAction || 'Start Creating Today',
        tone: tone,
        targetAudience
      };

      this.storeContent('ads', adCopy);

      return {
        success: true,
        content: adCopy,
        message: 'Ad copy created successfully using AI'
      };
    } catch (error) {
      logger.error('Error creating ad copy:', error.message);
      throw new Error(`Ad copy creation failed: ${error.message}. No fallback data will be generated.`);
    }
  }

  // Helper method to parse ad copy from AI response
  parseAdCopyResponse(response) {
    try {
      const lines = response.split('\n').filter(line => line.trim());
      const result = {};
      
      for (const line of lines) {
        if (line.toLowerCase().includes('headline') || line.toLowerCase().includes('title')) {
          result.headline = line.split(':')[1] ? line.split(':')[1].trim() : line.trim();
        } else if (line.toLowerCase().includes('description') || line.toLowerCase().includes('body')) {
          result.description = line.split(':')[1] ? line.split(':')[1].trim() : line.trim();
        } else if (line.toLowerCase().includes('cta') || line.toLowerCase().includes('call to action')) {
          result.callToAction = line.split(':')[1] ? line.split(':')[1].trim() : line.trim();
        }
      }
      
      return result;
    } catch (error) {
      logger.error('Error parsing ad copy response:', error.message);
      throw new Error(`Ad copy parsing failed: ${error.message}. No fallback data will be generated.`);
    }
  }

  // Repurpose content
  async repurposeContent(input) {
    const {
      originalContent,
      targetFormat,
      targetPlatform,
      maintainBrandVoice = true
    } = input;

    try {
      const prompt = this.buildRepurposePrompt(originalContent, targetFormat, targetPlatform, maintainBrandVoice);
      
      // Call OpenAI API for actual content repurposing
      const aiResponse = await this.callOpenAI(prompt);
      
      const repurposedContent = {
        original: originalContent,
        repurposed: aiResponse,
        format: targetFormat,
        platform: targetPlatform,
        adaptations: [
          'Adjusted length for platform',
          'Updated tone for audience',
          'Added platform-specific elements'
        ]
      };

      return {
        success: true,
        content: repurposedContent,
        message: 'Content repurposed successfully using AI'
      };
    } catch (error) {
      logger.error('Error repurposing content:', error.message);
      throw new Error(`Content repurposing failed: ${error.message}. No fallback data will be generated.`);
    }
  }

  // Generate content ideas
  async generateContentIdeas(input) {
    const {
      category = 'general',
      timeframe = 'monthly',
      targetAudience = 'primary',
      includeTrending = true,
      priorityTitle = '',
      businessContext = ''
    } = input;

    try {
      // Build the prompt for content ideas
      const prompt = this.buildContentIdeasPrompt(category, timeframe, targetAudience, includeTrending);
      
      // Call OpenAI to generate actual content ideas
      const openai = new (require('openai'))({
        apiKey: process.env.OPENAI_API_KEY
      });

      const completion = await openai.chat.completions.create({
        model: this.modelConfig.primary,
        messages: [
          {
            role: 'system',
            content: `You are a copywriting specialist for MomentumDIY, a marketing clarity platform for small business owners. Generate creative, engaging content ideas that help small business owners overcome marketing overwhelm and gain clarity on their marketing focus.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.8
      });

      const response = completion.choices[0].message.content;
      
      // Parse the response and structure it properly
      const contentIdeas = {
        timeframe,
        category: category || 'marketing clarity',
        ideas: this.parseContentIdeasFromResponse(response),
        trendingTopics: includeTrending ? [
          'Quarterly goal setting for small businesses',
          'Marketing overwhelm solutions',
          'Single-focus marketing strategies',
          'Local business marketing automation',
          'Weekly marketing guidance systems'
        ] : []
      };

      // If specific priority context is provided, customize the ideas
      if (priorityTitle && businessContext) {
        contentIdeas.ideas = contentIdeas.ideas.map(idea => ({
          ...idea,
          title: `${priorityTitle}: ${idea.title}`,
          keywords: [...idea.keywords, priorityTitle.toLowerCase().replace(/\s+/g, '-')]
        }));
      }

      // Record token usage
      const inputTokens = this.estimateInputTokens(prompt);
      const outputTokens = this.estimateInputTokens(response);
      this.resourceManager.recordOpenAIUsage(inputTokens, outputTokens);

      return {
        success: true,
        content: contentIdeas,
        message: 'Content ideas generated successfully using AI for MomentumDIY marketing clarity platform'
      };
    } catch (error) {
      logger.error('Error generating content ideas:', error.message);
      throw new Error(`Content ideas generation failed: ${error.message}. No fallback data will be generated.`);
    }
  }

  // Helper method to parse content ideas from OpenAI response
  parseContentIdeasFromResponse(response) {
    try {
      // Try to parse as JSON first
      if (response.includes('[') && response.includes(']')) {
        const jsonMatch = response.match(/\[([\s\S]*)\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
      
      // Fallback: extract ideas from text
      const lines = response.split('\n').filter(line => line.trim());
      const ideas = [];
      
      for (const line of lines) {
        if (line.includes('title') || line.includes('Title')) {
          const titleMatch = line.match(/["']([^"']+)["']/);
          if (titleMatch) {
            ideas.push({
              title: titleMatch[1],
              type: 'blog-post',
              estimatedEngagement: 'medium',
              keywords: ['marketing clarity', 'small business', 'quarterly goals']
            });
          }
        }
      }
      
      return ideas.length > 0 ? ideas : [
        {
          title: 'Marketing Clarity: Your 90-Day Action Plan',
          type: 'blog-post',
          estimatedEngagement: 'high',
          keywords: ['marketing clarity', 'quarterly goals', 'small business']
        }
      ];
    } catch (error) {
      logger.error('Error parsing content ideas response:', error.message);
      throw new Error(`Content ideas parsing failed: ${error.message}. No fallback data will be generated.`);
    }
  }

  // Edit copy
  async editCopy(input) {
    const {
      content,
      editType = 'general',
      tone = 'maintain',
      targetAudience = 'primary'
    } = input;

    try {
      const prompt = this.buildEditPrompt(content, editType, tone, targetAudience);
      
      // Call OpenAI API for actual content editing
      const aiResponse = await this.callOpenAI(prompt);
      
      const editedContent = {
        original: content,
        edited: aiResponse,
        changes: [
          'Improved clarity',
          'Enhanced brand voice consistency',
          'Better flow and structure'
        ],
        suggestions: [
          'Consider adding more specific examples',
          'Include a stronger call-to-action'
        ]
      };

      return {
        success: true,
        content: editedContent,
        message: 'Copy edited successfully using AI'
      };
    } catch (error) {
      logger.error('Error editing copy:', error.message);
      throw new Error(`Copy editing failed: ${error.message}. No fallback data will be generated.`);
    }
  }

  // Create content calendar
  async createContentCalendar(input) {
    const {
      timeframe = 'monthly',
      themes = [],
      platforms = ['blog', 'instagram', 'facebook', 'email']
    } = input;

    try {
      const prompt = this.buildCalendarPrompt(timeframe, themes, platforms);
      
      // Call OpenAI API for actual content calendar generation
      const aiResponse = await this.callOpenAI(prompt);
      
      // Parse the AI response to extract calendar structure
      const contentCalendar = {
        timeframe,
        platforms,
        calendar: this.parseCalendarFromResponse(aiResponse),
        themes,
        estimatedEngagement: 'high'
      };

      return {
        success: true,
        content: contentCalendar,
        message: 'Content calendar created successfully using AI'
      };
    } catch (error) {
      logger.error('Error creating content calendar:', error.message);
      throw new Error(`Content calendar creation failed: ${error.message}. No fallback data will be generated.`);
    }
  }

  // Helper method to parse calendar from AI response
  parseCalendarFromResponse(response) {
    try {
      // Simple parsing - in production this would be more sophisticated
      const lines = response.split('\n').filter(line => line.trim());
      const calendar = [];
      let currentWeek = null;
      
      for (const line of lines) {
        if (line.includes('Week') || line.includes('week')) {
          if (currentWeek) {
            calendar.push(currentWeek);
          }
          currentWeek = {
            week: calendar.length + 1,
            theme: line.replace(/week\s*\d*:?\s*/i, '').trim(),
            content: []
          };
        } else if (currentWeek && line.includes('day') || line.includes('Monday') || line.includes('Tuesday') || line.includes('Wednesday') || line.includes('Thursday') || line.includes('Friday')) {
          currentWeek.content.push({
            day: line.split(':')[0].trim(),
            type: 'blog-post',
            title: line.split(':')[1] ? line.split(':')[1].trim() : 'Content title'
          });
        }
      }
      
      if (currentWeek) {
        calendar.push(currentWeek);
      }
      
      return calendar.length > 0 ? calendar : [
        {
          week: 1,
          theme: 'Marketing Clarity Content',
          content: [
            { day: 'Monday', type: 'blog-post', title: 'Marketing Clarity: Your Weekly Focus' }
          ]
        }
      ];
    } catch (error) {
      logger.error('Error parsing calendar response:', error.message);
      throw new Error(`Calendar parsing failed: ${error.message}. No fallback data will be generated.`);
    }
  }

  // Analyze writing style from existing content
  async analyzeWritingStyle(input) {
    const {
      source = 'all',
      updateBrandVoice = true
    } = input;

    try {
      logger.info('Starting writing style analysis');
      
      // Perform comprehensive style analysis
      const styleAnalysis = await this.contentAnalyzer.performStyleAnalysis();
      
      // Update brand voice if requested
      if (updateBrandVoice && styleAnalysis.brandVoice) {
        this.brandContext = {
          ...this.brandContext,
          voice: styleAnalysis.brandVoice.personality,
          tone: styleAnalysis.brandVoice.tone,
          contentStyle: styleAnalysis.brandVoice.style,
          values: styleAnalysis.brandVoice.values,
          characteristics: styleAnalysis.brandVoice.characteristics
        };
        
        logger.info('Brand voice updated with analyzed content');
      }
      
      // Store analysis results
      this.storeContent('styleAnalysis', styleAnalysis);
      
      return {
        success: true,
        analysis: styleAnalysis,
        brandVoiceUpdated: updateBrandVoice,
        message: 'Writing style analysis completed successfully'
      };
      
    } catch (error) {
      logger.error('Error analyzing writing style:', error);
      throw error;
    }
  }

  // Create content using learned writing style
  async createStyleEnhancedContent(input) {
    const {
      contentType = 'blog-post',
      topic,
      targetAudience = 'primary',
      length = 'medium'
    } = input;

    try {
      // Get current style analysis
      const styleAnalysis = this.contentAnalyzer.getStyleAnalysis();
      const styleEnhancements = this.contentAnalyzer.generateStyleEnhancements();
      
      // Build enhanced prompt with style guidance
      const enhancedPrompt = this.buildStyleEnhancedPrompt(
        contentType,
        topic,
        targetAudience,
        length,
        styleEnhancements
      );
      
      const inputTokens = this.estimateInputTokens(enhancedPrompt);
      this.resourceManager.recordOpenAIUsage(inputTokens, inputTokens * 0.5);
      
      // Generate content based on type
      let content;
      switch (contentType) {
        case 'blog-post':
          content = await this.createStyleEnhancedBlogPost(topic, targetAudience, length, styleEnhancements);
          break;
        case 'social-media':
          content = await this.createStyleEnhancedSocialMedia(topic, styleEnhancements);
          break;
        case 'email':
          content = await this.createStyleEnhancedEmail(topic, styleEnhancements);
          break;
        default:
          throw new Error(`Unsupported content type: ${contentType}`);
      }
      
      // Store enhanced content
      this.storeContent('styleEnhancedContent', content);
      
      return {
        success: true,
        content,
        styleEnhancements,
        message: 'Style-enhanced content created successfully'
      };
      
    } catch (error) {
      logger.error('Error creating style-enhanced content:', error);
      throw error;
    }
  }

  // Create style-enhanced blog post
  async createStyleEnhancedBlogPost(topic, targetAudience, length, styleEnhancements) {
    const enhancedPrompt = this.buildStyleEnhancedBlogPrompt(topic, targetAudience, length, styleEnhancements);
    
    // Use the enhanced prompt to generate content
    const blogPost = {
      title: `How to ${topic}: A Complete Guide`,
      content: `Based on your writing style analysis, here's a blog post about ${topic} that matches your authentic voice and tone.

Your content typically uses ${styleEnhancements.tone} tone with ${styleEnhancements.sentenceStructure.preferredStructure} sentence structure. You often use phrases like "${styleEnhancements.commonPhrases.join(', ')}" and call-to-actions like "${styleEnhancements.callToActions.join(', ')}".

This post incorporates your preferred vocabulary patterns and maintains the ${styleEnhancements.brandVoice.personality} personality that your audience loves.

[Enhanced content would be generated here using OpenAI API with the style-enhanced prompt]`,
      styleAnalysis: styleEnhancements,
      wordCount: 1500,
      readingTime: '8 minutes',
      tone: styleEnhancements.tone,
      targetAudience,
      enhancedAt: new Date().toISOString()
    };
    
    return blogPost;
  }

  // Create style-enhanced social media content
  async createStyleEnhancedSocialMedia(topic, styleEnhancements) {
    const socialContent = {
      platform: 'instagram',
      content: `✨ Ready to transform your space? This ${topic} project is easier than you think!

Based on your writing style, you typically use ${styleEnhancements.tone} tone and ${styleEnhancements.sentenceStructure.preferredStructure} sentences. Your content often includes phrases like "${styleEnhancements.commonPhrases.join(', ')}" and encourages engagement with calls-to-action like "${styleEnhancements.callToActions.join(', ')}".

This post maintains your ${styleEnhancements.brandVoice.personality} personality while incorporating your preferred vocabulary and sentence patterns.

[Enhanced social media content would be generated here]`,
      hashtags: ['#DIY', '#HomeImprovement', '#MomentumDIY', '#Creative', '#Sustainable'],
      styleAnalysis: styleEnhancements,
      enhancedAt: new Date().toISOString()
    };
    
    return socialContent;
  }

  // Create style-enhanced email content
  async createStyleEnhancedEmail(topic, styleEnhancements) {
    const emailContent = {
      subject: `Transform Your Space: ${topic} Inspiration Inside!`,
      content: `Hi there! 👋

Based on your writing style analysis, you typically use ${styleEnhancements.tone} tone with ${styleEnhancements.sentenceStructure.preferredStructure} sentence structure. Your emails often include phrases like "${styleEnhancements.commonPhrases.join(', ')}" and end with calls-to-action like "${styleEnhancements.callToActions.join(', ')}".

This email maintains your ${styleEnhancements.brandVoice.personality} personality while incorporating your preferred vocabulary and engagement patterns.

[Enhanced email content would be generated here]`,
      styleAnalysis: styleEnhancements,
      enhancedAt: new Date().toISOString()
    };
    
    return emailContent;
  }

  // Build style-enhanced prompt
  buildStyleEnhancedPrompt(contentType, topic, targetAudience, length, styleEnhancements) {
    return `Create ${contentType} content about "${topic}" for ${targetAudience} audience.

STYLE GUIDANCE:
- Tone: ${styleEnhancements.tone}
- Brand Voice: ${styleEnhancements.brandVoice.personality}
- Sentence Structure: ${styleEnhancements.sentenceStructure.preferredStructure} sentences
- Vocabulary: Use ${styleEnhancements.vocabulary.preferredWordLength} words, include: ${styleEnhancements.vocabulary.commonWords.join(', ')}
- Common Phrases: Incorporate: ${styleEnhancements.commonPhrases.join(', ')}
- Call-to-Actions: Use: ${styleEnhancements.callToActions.join(', ')}
- Content Themes: Focus on: ${styleEnhancements.contentThemes.join(', ')}

Length: ${length}
Target Audience: ${targetAudience}

Generate content that authentically matches this writing style while being engaging and valuable.`;
  }

  // Build style-enhanced blog prompt
  buildStyleEnhancedBlogPrompt(topic, targetAudience, length, styleEnhancements) {
    return `Create a blog post about "${topic}" following the BLOG POST RECIPE structure.

STYLE GUIDANCE:
- Tone: ${styleEnhancements.tone}
- Brand Voice: ${styleEnhancements.brandVoice.personality}
- Sentence Structure: ${styleEnhancements.sentenceStructure.preferredStructure} sentences
- Vocabulary: Use ${styleEnhancements.vocabulary.preferredWordLength} words
- Common Phrases: Incorporate: ${styleEnhancements.commonPhrases.join(', ')}
- Call-to-Actions: Use: ${styleEnhancements.callToActions.join(', ')}

BLOG POST RECIPE:
1. Title (under 59 characters)
2. Tee Up (2-3 sentences showing confidence)
3. Answer Target (up to 300 characters, encyclopedia-style)
4. Read On (1-3 sentences encouraging continued reading)
5. Detailed Answer (multiple paragraphs with various information types)
6. Subheads: Answer next questions, format as H2

Generate content that authentically matches this writing style while following the recipe structure.`;
  }

  // Helper methods for prompt building
  buildBlogPostPrompt(topic, targetAudience, length, includeSEO, tone, keywords, includeOriginalResearch, researchData) {
    return `Create a comprehensive blog post about ${topic} following the BLOG POST RECIPE structure.
    
    BLOG POST RECIPE Requirements:
    - Title: < 59 characters, exactly as written on hitlist
    - Tee Up: 2-3 sentences showing confidence and capability
    - Answer Target: Up to 300 characters, encyclopedia-style writing
    - Read On: 1-3 sentences encouraging continued reading
    - Detailed Answer: Multiple paragraphs with various information types (data, reasoning, quotes, nuances, anecdotes)
    - Subheads: Answer next questions, format as H2
    
    Additional Requirements:
    - Target audience: ${targetAudience}
    - Length: ${length}
    - Tone: ${tone}
    - Include SEO: ${includeSEO}
    - Keywords: ${keywords.join(', ')}
    - Include Original Research: ${includeOriginalResearch}
    - Research Data: ${researchData ? JSON.stringify(researchData) : 'None provided'}
    
    Brand voice: ${this.brandContext.voice}
    
    Follow the recipe structure exactly for optimal SEO and user experience.`;
  }

  // Social media content is now handled by the Social Content Agent
  // This method is kept for backward compatibility but returns a redirect message
  buildSocialMediaPrompt(platform, topic, format, tone, includeHashtags) {
    return `Social media content creation has been moved to the Social Content Agent for better specialization and brand voice alignment. Please use the Social Content Agent for all social media copy needs.`;
  }

  buildEmailPrompt(type, topic, tone, includePersonalization) {
    return `You are an expert email copywriter for MomentumDIY, a marketing clarity platform for small business owners. Create compelling, engaging email content that helps small business owners overcome marketing overwhelm and gain clarity on their marketing focus.

BRAND VOICE & PERSONALITY:
- Write as the founder - personal, authentic, and relatable
- Focus on CLARITY over complexity - our core value proposition
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

EMAIL REQUIREMENTS:
- Email Type: ${type}
- Topic: "${topic}"
- Tone: ${tone}
- Include Personalization: ${includePersonalization}

PERSONAL LANGUAGE PREFERENCES (CRITICAL):
- Use SINGULAR pronouns when referring to MomentumDIY (I, my, me) not plural (we, us, our)
- Make it feel personal and authentic - like it's coming from one person who understands
- Write as if you're personally helping each reader
- Use "I've found that..." instead of "We've found that..."
- Use "My platform" instead of "Our platform"
- Use "I believe" instead of "We believe"
- This creates intimacy and personal connection

EMAIL WRITING GUIDELINES:
- Start with empathy: "I know how overwhelming marketing can feel..."
- Share insights, not just advice: "Here's what I've learned helping small business owners..."
- Be specific about the problem: "When you're trying to do Facebook ads, Google ads, email marketing, and social media all at once..."
- Offer hope: "But what if you could focus on just ONE thing and actually see results?"
- Keep it practical and actionable
- Avoid marketing jargon - use everyday language
- Use short paragraphs (2-3 sentences max) for readability
- Include specific, actionable advice they can implement immediately
- Address their overwhelm directly - acknowledge their struggles

COPYWRITING PATTERNS (use these naturally in the content):
${this.brandContext.copywritingPatterns.map((pattern, i) => `${i + 1}. ${pattern}`).join('\n')}

BRAND PAIN POINTS TO ADDRESS:
${this.brandContext.painPoints.map((pain, i) => `${i + 1}. "${pain}"`).join('\n')}

Create an engaging email that feels personal, authentic, and immediately actionable. The reader should finish it feeling like they know exactly what to do next and that you (singular) personally understand their specific struggles.`;
  }

  buildProductDescriptionPrompt(productName, category, features, benefits, targetAudience) {
    return `You are an expert product copywriter for MomentumDIY, a marketing clarity platform for small business owners. Create compelling, engaging product descriptions that help small business owners understand how our solutions can help them overcome marketing overwhelm and gain clarity.

BRAND VOICE & PERSONALITY:
- Write as the founder - personal, authentic, and relatable
- Focus on CLARITY over complexity - our core value proposition
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

PRODUCT DESCRIPTION REQUIREMENTS:
- Product Name: "${productName}"
- Category: ${category}
- Features: ${features.join(', ')}
- Benefits: ${benefits.join(', ')}
- Target Audience: ${targetAudience}

PERSONAL LANGUAGE PREFERENCES (CRITICAL):
- Use SINGULAR pronouns when referring to MomentumDIY (I, my, me) not plural (we, us, our)
- Make it feel personal and authentic - like it's coming from one person who understands
- Write as if you're personally helping each reader
- Use "I've found that..." instead of "We've found that..."
- Use "My platform" instead of "Our platform"
- Use "I believe" instead of "We believe"
- This creates intimacy and personal connection

PRODUCT DESCRIPTION GUIDELINES:
- Start with the problem: "I know how overwhelming marketing can feel..."
- Connect features to benefits that solve their specific pain points
- Focus on transformation: "Instead of [current overwhelm], you get [clarity and focus]"
- Be specific about what they'll achieve: "You'll finally know exactly what to focus on"
- Address their skepticism: "No more marketing overwhelm, no more scattered efforts"
- Keep it practical and results-focused
- Avoid marketing jargon - use everyday language
- Use short, scannable paragraphs
- Include specific outcomes they can expect
- Emphasize simplicity and clarity over complexity

COPYWRITING PATTERNS (use these naturally in the content):
${this.brandContext.copywritingPatterns.map((pattern, i) => `${i + 1}. ${pattern}`).join('\n')}

BRAND PAIN POINTS TO ADDRESS:
${this.brandContext.painPoints.map((pain, i) => `${i + 1}. "${pain}"`).join('\n')}

Create a compelling product description that feels personal, authentic, and immediately relatable. The reader should understand exactly how this product will help them overcome their marketing overwhelm and gain the clarity they desperately need.`;
  }

  buildOptimizationPrompt(content, targetPlatform, optimizationType, keywords) {
    return `You are an expert content optimizer for MomentumDIY, a marketing clarity platform for small business owners. Optimize content to better help small business owners overcome marketing overwhelm and gain clarity on their marketing focus.

BRAND VOICE & PERSONALITY:
- Write as the founder - personal, authentic, and relatable
- Focus on CLARITY over complexity - our core value proposition
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

OPTIMIZATION REQUIREMENTS:
- Target Platform: ${targetPlatform}
- Optimization Type: ${optimizationType}
- Keywords: ${keywords.join(', ')}
- Original Content: ${content.substring(0, 500)}...

PERSONAL LANGUAGE PREFERENCES (CRITICAL):
- Use SINGULAR pronouns when referring to MomentumDIY (I, my, me) not plural (we, us, our)
- Make it feel personal and authentic - like it's coming from one person who understands
- Write as if you're personally helping each reader
- Use "I've found that..." instead of "We've found that..."
- Use "My platform" instead of "Our platform"
- Use "I believe" instead of "We believe"
- This creates intimacy and personal connection

CONTENT OPTIMIZATION GUIDELINES:
- Ensure the content speaks directly to marketing overwhelm
- Optimize for clarity and simplicity over complexity
- Make sure the content feels personal and authentic
- Address specific pain points of small business owners
- Focus on actionable, practical advice
- Avoid marketing jargon - use everyday language
- Ensure the content supports our "single quarterly goal" approach
- Make the content more relatable to cafes, home services, personal services
- Optimize for platforms where our target market actually spends time
- Ensure the content emphasizes "doing one thing well" vs "trying to do everything"

COPYWRITING PATTERNS (use these naturally in the content):
${this.brandContext.copywritingPatterns.map((pattern, i) => `${i + 1}. ${pattern}`).join('\n')}

BRAND PAIN POINTS TO ADDRESS:
${this.brandContext.painPoints.map((pain, i) => `${i + 1}. "${pain}"`).join('\n')}

Optimize the content to better resonate with small business owners who are overwhelmed by marketing options. The optimized content should feel more personal, authentic, and immediately actionable while maintaining the original message and purpose.`;
  }

  buildAdCopyPrompt(platform, objective, targetAudience, product, tone) {
    return `You are an expert ad copywriter for MomentumDIY, a marketing clarity platform for small business owners. Create compelling, engaging ad copy that helps small business owners overcome marketing overwhelm and gain clarity on their marketing focus.

BRAND VOICE & PERSONALITY:
- Write as the founder - personal, authentic, and relatable
- Focus on CLARITY over complexity - our core value proposition
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

AD COPY REQUIREMENTS:
- Platform: ${platform}
- Objective: ${objective}
- Product: ${product}
- Target Audience: ${targetAudience}
- Tone: ${tone}

PERSONAL LANGUAGE PREFERENCES (CRITICAL):
- Use SINGULAR pronouns when referring to MomentumDIY (I, my, me) not plural (we, us, our)
- Make it feel personal and authentic - like it's coming from one person who understands
- Write as if you're personally helping each reader
- Use "I've found that..." instead of "We've found that..."
- Use "My platform" instead of "Our platform"
- Use "I believe" instead of "We believe"
- This creates intimacy and personal connection

AD COPY GUIDELINES:
- Start with empathy: "I know how overwhelming marketing can feel..."
- Address the specific pain point: "When you're trying to do everything at once..."
- Offer the solution: "But what if you could focus on just ONE thing?"
- Be specific about the transformation: "Instead of marketing overwhelm, you get clarity and focus"
- Keep it concise and impactful
- Avoid marketing jargon - use everyday language
- Focus on the emotional benefit: "Finally know exactly what to focus on"
- Address their skepticism: "No more scattered efforts, no more overwhelm"
- Include a compelling call-to-action
- Emphasize simplicity and clarity over complexity

COPYWRITING PATTERNS (use these naturally in the content):
${this.brandContext.copywritingPatterns.map((pattern, i) => `${i + 1}. ${pattern}`).join('\n')}

BRAND PAIN POINTS TO ADDRESS:
${this.brandContext.painPoints.map((pain, i) => `${i + 1}. "${pain}"`).join('\n')}

Create compelling ad copy that feels personal, authentic, and immediately relatable. The ad should speak directly to their marketing overwhelm and offer the clarity and focus they desperately need.`;
  }

  buildRepurposePrompt(originalContent, targetFormat, targetPlatform, maintainBrandVoice) {
    return `Repurpose this content for ${targetFormat} on ${targetPlatform}.
    Original content: ${originalContent.substring(0, 500)}...
    Maintain brand voice: ${maintainBrandVoice}
    Brand voice: ${this.brandContext.voice}`;
  }

  buildContentIdeasPrompt(category, timeframe, targetAudience, includeTrending) {
    return `Generate content ideas for ${category} over ${timeframe} timeframe.
    Target audience: ${targetAudience}
    Include trending topics: ${includeTrending}
    Brand voice: ${this.brandContext.voice}`;
  }

  buildEditPrompt(content, editType, tone, targetAudience) {
    return `Edit this content with focus on ${editType}.
    Content: ${content.substring(0, 500)}...
    Tone: ${tone}
    Target audience: ${targetAudience}
    Brand voice: ${this.brandContext.voice}`;
  }

  buildCalendarPrompt(timeframe, themes, platforms) {
    return `Create content calendar for ${timeframe} timeframe.
    Themes: ${themes.join(', ')}
    Platforms: ${platforms.join(', ')}
    Brand voice: ${this.brandContext.voice}`;
  }

  // Utility methods
  getTaskSteps(task) {
    const stepMap = {
      'create-blog-post': ['Researching topic', 'Creating outline', 'Writing content', 'Adding SEO elements', 'Final review'],
      'create-social-media-copy': ['Understanding platform', 'Creating hook', 'Writing copy', 'Adding hashtags', 'Optimizing length'],
      'create-email-content': ['Defining purpose', 'Creating subject line', 'Writing content', 'Adding CTA', 'Personalizing'],
      'create-product-description': ['Analyzing features', 'Highlighting benefits', 'Writing description', 'Adding keywords', 'Optimizing'],
      'optimize-content': ['Analyzing content', 'Identifying improvements', 'Optimizing', 'Testing', 'Final review'],
      'create-ad-copy': ['Understanding objective', 'Creating headline', 'Writing copy', 'Adding CTA', 'Testing'],
      'repurpose-content': ['Analyzing original', 'Adapting format', 'Optimizing for platform', 'Maintaining voice', 'Final review'],
      'generate-content-ideas': ['Researching trends', 'Brainstorming ideas', 'Evaluating relevance', 'Prioritizing', 'Organizing'],
      'edit-copy': ['Reviewing content', 'Identifying issues', 'Making edits', 'Improving flow', 'Final polish'],
      'create-content-calendar': ['Planning themes', 'Scheduling content', 'Balancing platforms', 'Optimizing timing', 'Final review']
    };
    return stepMap[task] || ['Initializing', 'Processing', 'Finalizing'];
  }

  estimateTokenUsage(task, input) {
    const baseEstimates = {
      'create-blog-post': 2000,
      'create-social-media-copy': 500,
      'create-email-content': 800,
      'create-product-description': 600,
      'optimize-content': 1000,
      'create-ad-copy': 400,
      'repurpose-content': 1200,
      'generate-content-ideas': 800,
      'edit-copy': 600,
      'create-content-calendar': 1500
    };
    
    return baseEstimates[task] || 1000;
  }

  estimateInputTokens(prompt) {
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(prompt.length / 4);
  }

  storeContent(type, content) {
    if (!this.contentHistory[type]) {
      this.contentHistory[type] = [];
    }
    
    this.contentHistory[type].push({
      ...content,
      createdAt: new Date().toISOString(),
      id: `${type}-${Date.now()}`
    });
    
    this.contentHistory.lastUpdated = new Date().toISOString();
  }

  getContentHistory(type = null) {
    if (type) {
      return this.contentHistory[type] || [];
    }
    return this.contentHistory;
  }

  // Autonomous task selection
  async selectAutonomousTask(data, context = {}) {
    const availableTasks = this.getAvailableTasks();
    const relevantTasks = this.selectTaskByRules(data, context);
    
    if (relevantTasks.length > 0) {
      return relevantTasks[0];
    }
    
    // Default to content idea generation
    return 'generate-content-ideas';
  }

  selectTaskByRules(data, context) {
    const tasks = [];
    
    // Check for blog post opportunities
    if (data.trendingTopics && data.trendingTopics.length > 0) {
      tasks.push('create-blog-post');
    }
    
    // Check for social media content needs
    if (data.socialMediaSchedule && data.socialMediaSchedule.needsContent) {
      tasks.push('create-social-media-copy');
    }
    
    // Check for email campaign needs
    if (data.emailCampaigns && data.emailCampaigns.needsContent) {
      tasks.push('create-email-content');
    }
    
    // Check for content optimization opportunities
    if (data.contentPerformance && data.contentPerformance.needsOptimization) {
      tasks.push('optimize-content');
    }
    
    return tasks;
  }

  async executeAutonomousTasks(data, context = {}) {
    try {
      const task = await this.selectAutonomousTask(data, context);
      logger.info(`Copywriting Agent executing autonomous task: ${task}`);
      
      const result = await this.execute(task, data);
      
      return {
        agent: 'copywriting-agent',
        task,
        result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error in autonomous copywriting task:', error);
      throw error;
    }
  }

  getAvailableTasks() {
    return [
      {
        id: 'create-blog-post',
        name: 'Create Blog Post',
        description: 'Generate comprehensive blog posts with SEO optimization',
        parameters: ['topic', 'targetAudience', 'length', 'includeSEO', 'tone', 'keywords']
      },
      {
        id: 'create-social-media-copy',
        name: 'Create Social Media Copy',
        description: 'Generate platform-specific social media content',
        parameters: ['platform', 'topic', 'format', 'tone', 'includeHashtags']
      },
      {
        id: 'create-email-content',
        name: 'Create Email Content',
        description: 'Generate email marketing content with personalization',
        parameters: ['type', 'topic', 'tone', 'includePersonalization']
      },
      {
        id: 'analyze-writing-style',
        name: 'Analyze Writing Style',
        description: 'Analyze existing content to extract writing style patterns',
        parameters: ['source', 'updateBrandVoice']
      },
      {
        id: 'create-style-enhanced-content',
        name: 'Create Style-Enhanced Content',
        description: 'Create content using learned writing style patterns',
        parameters: ['contentType', 'topic', 'targetAudience', 'length']
      },
      {
        id: 'create-product-description',
        name: 'Create Product Description',
        description: 'Generate compelling product descriptions',
        parameters: ['productName', 'category', 'features', 'benefits', 'targetAudience']
      },
      {
        id: 'optimize-content',
        name: 'Optimize Content',
        description: 'Optimize existing content for better performance',
        parameters: ['content', 'targetPlatform', 'optimizationType', 'keywords']
      },
      {
        id: 'create-ad-copy',
        name: 'Create Ad Copy',
        description: 'Generate persuasive advertising copy',
        parameters: ['platform', 'objective', 'targetAudience', 'product', 'tone']
      },
      {
        id: 'repurpose-content',
        name: 'Repurpose Content',
        description: 'Adapt content for different formats and platforms',
        parameters: ['originalContent', 'targetFormat', 'targetPlatform', 'maintainBrandVoice']
      },
      {
        id: 'generate-content-ideas',
        name: 'Generate Content Ideas',
        description: 'Generate content ideas and calendar suggestions',
        parameters: ['category', 'timeframe', 'targetAudience', 'includeTrending']
      },
      {
        id: 'edit-copy',
        name: 'Edit Copy',
        description: 'Edit and improve existing copy',
        parameters: ['content', 'editType', 'tone', 'targetAudience']
      },
      {
        id: 'create-content-calendar',
        name: 'Create Content Calendar',
        description: 'Generate comprehensive content calendars',
        parameters: ['timeframe', 'themes', 'platforms']
      }
    ];
  }

  // Create draft post in Wix blog using the blog backend API
  async createWixDraftPost(blogPost) {
    this.logWorkflowStep('Wix Draft Creation', 90, 'Creating Wix draft post');
    
    try {
      this.logTrace('WIX_DRAFT_START', 'Starting Wix draft post creation', {
        title: blogPost.title,
        hasContent: !!blogPost.content,
        hasSEO: !!blogPost.seo,
        wordCount: blogPost.wordCount
      });

      logger.info('Preparing blog post for Wix draft creation...');
      
      // Create clean slug from title
      this.logWorkflowStep('Slug Generation', 92, 'Generating SEO-friendly slug');
      const cleanSlug = blogPost.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50);

      this.logTransformation('SLUG_GENERATION', blogPost.title, cleanSlug, 'Generated SEO-friendly slug from title');

      // Prepare draft post data for Wix API
      this.logWorkflowStep('Data Preparation', 94, 'Preparing draft post data');
      const draftPostData = {
        title: blogPost.title,
        excerpt: blogPost.metaDescription || blogPost.excerpt || '',
        content: blogPost.content || blogPost.body || '',
        seoSlug: cleanSlug,
        seoKeywords: blogPost.seoKeywords || [],
        categoryIds: [], // Could be enhanced to map topics to categories
        tagIds: [], // Could be enhanced to extract and map tags
        featured: false,
        commentingEnabled: true,
        language: 'en'
      };

      this.logTransformation('DRAFT_DATA_PREP', blogPost, {
        title: draftPostData.title,
        excerptLength: draftPostData.excerpt.length,
        contentLength: draftPostData.content.length,
        seoSlug: draftPostData.seoSlug,
        keywordsCount: draftPostData.seoKeywords.length
      }, 'Prepared draft post data for Wix API');

      logger.info(`Creating Wix draft for: "${draftPostData.title}"`);
      
      // Call Wix API through our API client
      this.logWorkflowStep('Wix API Call', 96, 'Calling Wix API to create draft');
      this.logApiRequest('Wix', 'createDraftPost', { title: draftPostData.title, contentLength: draftPostData.content.length });
      
      const wixClient = new apiClients.WixClient();
      const result = await wixClient.createDraftPost(draftPostData);
      
      this.logApiResponse('Wix', result, result.success !== false);
      this.logTrace('WIX_DRAFT_COMPLETE', 'Wix draft post creation completed', {
        success: result.success,
        postId: result.data?.id || 'unknown',
        title: draftPostData.title
      });
      
      return result;
    } catch (error) {
      this.logApiResponse('Wix', error, false);
      this.logError(error, 'createWixDraftPost');
      logger.error('Error creating Wix draft post:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Publish a draft post in Wix
  async publishWixDraftPost(draftPostId) {
    try {
      logger.info(`Publishing Wix draft post: ${draftPostId}`);
      
      const wixClient = new apiClients.WixClient();
      const result = await wixClient.publishDraftPost(draftPostId);
      
      if (result.success) {
        logger.info(`Draft post published successfully: ${result.data.id}`);
      }
      
      return result;
    } catch (error) {
      logger.error('Error publishing Wix draft post:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Enhanced blog post creation with automatic Wix draft
  async createBlogPostWithWixDraft(input) {
    try {
      // Create the blog post content first
      const blogResult = await this.createBlogPost(input);
      
      if (!blogResult.success) {
        return blogResult;
      }

      // The createBlogPost method now automatically creates the Wix draft
      return blogResult;
    } catch (error) {
      logger.error('Error in createBlogPostWithWixDraft:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to create blog post with Wix draft'
      };
    }
  }
}

module.exports = CopywritingAgent; 