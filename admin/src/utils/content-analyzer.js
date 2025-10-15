const logger = require('./logger');
const axios = require('axios');
const cheerio = require('cheerio');

class ContentAnalyzer {
  constructor() {
    this.name = 'Content Style Analyzer';
    this.description = 'Analyzes writing style from existing content to improve AI-generated content';
    
    // Content sources
    this.contentSources = {
      blog: 'https://www.hillaryedenmcmullen.com/blog',
      instagram: 'https://www.instagram.com/hillaryedenmcmullen',
      linkedin: 'https://www.linkedin.com/in/hillarymcmullen'
    };
    
    // Style analysis results
    this.styleAnalysis = {
      lastUpdated: null,
      blogPosts: [],
      socialMedia: [],
      writingPatterns: {},
      brandVoice: {},
      contentThemes: [],
      commonPhrases: [],
      toneAnalysis: {},
      vocabularyProfile: {},
      sentenceStructure: {},
      callToActions: []
    };
  }

  // Extract content from Hillary's blog
  async extractBlogContent() {
    try {
      logger.info('Extracting content from Hillary\'s blog');
      
      const response = await axios.get(this.contentSources.blog);
      const $ = cheerio.load(response.data);
      
      const blogPosts = [];
      
      // Extract blog post content
      $('article, .post, .blog-post, [class*="post"], [class*="blog"]').each((index, element) => {
        const $element = $(element);
        
        const post = {
          title: $element.find('h1, h2, h3, .title, [class*="title"]').first().text().trim(),
          content: $element.find('p, .content, [class*="content"]').text().trim(),
          excerpt: $element.find('.excerpt, .summary, [class*="excerpt"]').text().trim(),
          tags: $element.find('.tags, .categories, [class*="tag"]').text().trim(),
          date: $element.find('.date, .published, [class*="date"]').text().trim(),
          readingTime: $element.find('.reading-time, [class*="read"]').text().trim()
        };
        
        if (post.title || post.content) {
          blogPosts.push(post);
        }
      });
      
      // If no structured posts found, try alternative selectors
      if (blogPosts.length === 0) {
        $('div, section').each((index, element) => {
          const $element = $(element);
          const text = $element.text().trim();
          
          if (text.length > 200 && text.includes(' ')) {
            const title = $element.find('h1, h2, h3').first().text().trim();
            blogPosts.push({
              title: title || `Blog Post ${index + 1}`,
              content: text,
              excerpt: text.substring(0, 200) + '...',
              tags: '',
              date: '',
              readingTime: ''
            });
          }
        });
      }
      
      logger.info(`Extracted ${blogPosts.length} blog posts`);
      return blogPosts;
      
    } catch (error) {
      logger.error('Error extracting blog content:', error);
      return [];
    }
  }

  // Extract content from Instagram (public posts)
  async extractInstagramContent() {
    try {
      logger.info('Extracting content from Instagram');
      
      // Note: Instagram requires authentication for API access
      // For now, we'll create a manual extraction method
      // In production, you'd need Instagram Basic Display API or Graph API
      
      const instagramPosts = [
        // These would be populated from actual Instagram API calls
        // For now, we'll use sample data based on typical Instagram content
        {
          caption: "✨ Ready to transform your marketing? This marketing clarity approach is easier than you think! Whether you're a pro or just starting out, this guide will help you focus on what matters most. Plus, it's perfect for small business owners who want results without the overwhelm. The best part? You can start with just one quarterly goal! 🎯 What's your next marketing focus going to be? Share your ideas below! 👇 #MarketingClarity #SmallBusiness #MomentumDIY #Focus #Results #QuarterlyGoals",
          hashtags: ['#MarketingClarity', '#SmallBusiness', '#MomentumDIY', '#Focus', '#Results', '#QuarterlyGoals'],
          likes: 0,
          comments: [],
          date: new Date().toISOString()
        }
      ];
      
      logger.info(`Extracted ${instagramPosts.length} Instagram posts`);
      return instagramPosts;
      
    } catch (error) {
      logger.error('Error extracting Instagram content:', error);
      return [];
    }
  }

  // Extract content from LinkedIn
  async extractLinkedInContent() {
    try {
      logger.info('Extracting content from LinkedIn');
      
      // Note: LinkedIn requires authentication for API access
      // For now, we'll create a manual extraction method
      
      const linkedinPosts = [
        // These would be populated from actual LinkedIn API calls
        {
          content: "Home service pros are no strangers to hard work—but when it comes to marketing, many are wasting time and money on tactics that don't move the needle. In this guide, I break down what's actually working in today's market, what to stop doing, and how to build a simple, modern strategy that attracts quality local clients.",
          engagement: 0,
          comments: [],
          date: new Date().toISOString()
        }
      ];
      
      logger.info(`Extracted ${linkedinPosts.length} LinkedIn posts`);
      return linkedinPosts;
      
    } catch (error) {
      logger.error('Error extracting LinkedIn content:', error);
      return [];
    }
  }

  // Analyze writing patterns and style
  analyzeWritingStyle(content) {
    const analysis = {
      tone: this.analyzeTone(content),
      vocabulary: this.analyzeVocabulary(content),
      sentenceStructure: this.analyzeSentenceStructure(content),
      commonPhrases: this.extractCommonPhrases(content),
      callToActions: this.extractCallToActions(content),
      contentThemes: this.identifyContentThemes(content),
      brandVoice: this.analyzeBrandVoice(content)
    };
    
    return analysis;
  }

  // Analyze tone of writing
  analyzeTone(content) {
    const tone = {
      friendly: 0,
      professional: 0,
      encouraging: 0,
      educational: 0,
      conversational: 0,
      authoritative: 0
    };
    
    const text = content.toLowerCase();
    
    // Friendly indicators
    if (text.includes('you') || text.includes('your') || text.includes('we')) tone.friendly += 1;
    if (text.includes('hope') || text.includes('wonderful') || text.includes('exciting')) tone.friendly += 1;
    
    // Professional indicators
    if (text.includes('strategy') || text.includes('approach') || text.includes('method')) tone.professional += 1;
    if (text.includes('results') || text.includes('outcomes') || text.includes('performance')) tone.professional += 1;
    
    // Encouraging indicators
    if (text.includes('can') || text.includes('will') || text.includes('going to')) tone.encouraging += 1;
    if (text.includes('easy') || text.includes('simple') || text.includes('straightforward')) tone.encouraging += 1;
    
    // Educational indicators
    if (text.includes('guide') || text.includes('tutorial') || text.includes('how to')) tone.educational += 1;
    if (text.includes('step') || text.includes('process') || text.includes('method')) tone.educational += 1;
    
    // Conversational indicators
    if (text.includes('you know') || text.includes('right') || text.includes('well')) tone.conversational += 1;
    if (text.includes('actually') || text.includes('really') || text.includes('just')) tone.conversational += 1;
    
    // Authoritative indicators
    if (text.includes('proven') || text.includes('tested') || text.includes('expert')) tone.authoritative += 1;
    if (text.includes('research') || text.includes('data') || text.includes('analysis')) tone.authoritative += 1;
    
    return tone;
  }

  // Analyze vocabulary patterns
  analyzeVocabulary(content) {
    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
    const wordCount = words.length;
    const uniqueWords = [...new Set(words)];
    const vocabulary = {
      totalWords: wordCount,
      uniqueWords: uniqueWords.length,
      vocabularyDiversity: uniqueWords.length / wordCount,
      commonWords: this.getMostFrequentWords(words, 20),
      wordLength: {
        short: words.filter(w => w.length <= 4).length,
        medium: words.filter(w => w.length > 4 && w.length <= 8).length,
        long: words.filter(w => w.length > 8).length
      }
    };
    
    return vocabulary;
  }

  // Analyze sentence structure
  analyzeSentenceStructure(content) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const structure = {
      totalSentences: sentences.length,
      averageLength: sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length,
      shortSentences: sentences.filter(s => s.split(' ').length <= 10).length,
      mediumSentences: sentences.filter(s => s.split(' ').length > 10 && s.split(' ').length <= 20).length,
      longSentences: sentences.filter(s => s.split(' ').length > 20).length,
      questions: sentences.filter(s => s.includes('?')).length,
      exclamations: sentences.filter(s => s.includes('!')).length
    };
    
    return structure;
  }

  // Extract common phrases
  extractCommonPhrases(content) {
    const phrases = [];
    const text = content.toLowerCase();
    
    // Common marketing phrases
    const marketingPhrases = [
      'move the needle',
      'cut through the noise',
      'drive results',
      'quality clients',
      'strategic approach',
      'proven methods',
      'step-by-step',
      'everything you need',
      'complete guide',
      'ultimate guide'
    ];
    
    marketingPhrases.forEach(phrase => {
      if (text.includes(phrase)) {
        phrases.push(phrase);
      }
    });
    
    return phrases;
  }

  // Extract call to actions
  extractCallToActions(content) {
    const ctas = [];
    const text = content.toLowerCase();
    
    const ctaPatterns = [
      'click here',
      'get started',
      'learn more',
      'find out',
      'discover',
      'join us',
      'share your',
      'let me know',
      'reach out',
      'contact me'
    ];
    
    ctaPatterns.forEach(cta => {
      if (text.includes(cta)) {
        ctas.push(cta);
      }
    });
    
    return ctas;
  }

  // Identify content themes
  identifyContentThemes(content) {
    const themes = [];
    const text = content.toLowerCase();
    
    const themeKeywords = {
      'marketing strategy': ['marketing', 'strategy', 'campaign', 'approach'],
      'business growth': ['business', 'growth', 'success', 'results'],
      'client acquisition': ['clients', 'customers', 'acquisition', 'attract'],
      'brand building': ['brand', 'branding', 'identity', 'voice'],
      'content creation': ['content', 'creation', 'writing', 'copy'],
      'social media': ['social', 'media', 'instagram', 'facebook', 'linkedin'],
      'Marketing clarity': ['marketing', 'clarity', 'quarterly goals', 'focus'],
      'sustainability': ['sustainable', 'eco-friendly', 'environmental', 'green']
    };
    
    Object.entries(themeKeywords).forEach(([theme, keywords]) => {
      const matchCount = keywords.filter(keyword => text.includes(keyword)).length;
      if (matchCount >= 2) {
        themes.push(theme);
      }
    });
    
    return themes;
  }

  // Analyze brand voice
  analyzeBrandVoice(content) {
    const voice = {
      personality: 'professional yet approachable',
      tone: 'encouraging and educational',
      style: 'conversational and practical',
      values: ['authenticity', 'practicality', 'encouragement', 'expertise'],
      characteristics: []
    };
    
    const text = content.toLowerCase();
    
    if (text.includes('you') && text.includes('your')) voice.characteristics.push('personal');
    if (text.includes('we') && text.includes('our')) voice.characteristics.push('inclusive');
    if (text.includes('can') && text.includes('will')) voice.characteristics.push('encouraging');
    if (text.includes('guide') && text.includes('help')) voice.characteristics.push('helpful');
    if (text.includes('proven') && text.includes('tested')) voice.characteristics.push('authoritative');
    
    return voice;
  }

  // Get most frequent words
  getMostFrequentWords(words, limit = 20) {
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([word, count]) => ({ word, count }));
  }

  // Perform comprehensive style analysis
  async performStyleAnalysis() {
    try {
      logger.info('Starting comprehensive style analysis');
      
      // Extract content from all sources
      const [blogPosts, instagramPosts, linkedinPosts] = await Promise.all([
        this.extractBlogContent(),
        this.extractInstagramContent(),
        this.extractLinkedInContent()
      ]);
      
      // Combine all content for analysis
      const allContent = [
        ...blogPosts.map(post => post.content || post.excerpt || ''),
        ...instagramPosts.map(post => post.caption || ''),
        ...linkedinPosts.map(post => post.content || '')
      ].filter(content => content.length > 0);
      
      const combinedContent = allContent.join(' ');
      
      // Perform style analysis
      const styleAnalysis = this.analyzeWritingStyle(combinedContent);
      
      // Update analysis results
      this.styleAnalysis = {
        lastUpdated: new Date().toISOString(),
        blogPosts,
        socialMedia: [...instagramPosts, ...linkedinPosts],
        writingPatterns: styleAnalysis,
        brandVoice: styleAnalysis.brandVoice,
        contentThemes: styleAnalysis.contentThemes,
        commonPhrases: styleAnalysis.commonPhrases,
        toneAnalysis: styleAnalysis.tone,
        vocabularyProfile: styleAnalysis.vocabulary,
        sentenceStructure: styleAnalysis.sentenceStructure,
        callToActions: styleAnalysis.callToActions
      };
      
      logger.info('Style analysis completed successfully');
      return this.styleAnalysis;
      
    } catch (error) {
      logger.error('Error performing style analysis:', error);
      throw error;
    }
  }

  // Get style analysis results
  getStyleAnalysis() {
    return this.styleAnalysis;
  }

  // Generate style-based prompt enhancements
  generateStyleEnhancements() {
    const analysis = this.styleAnalysis;
    
    const enhancements = {
      tone: this.getPrimaryTone(analysis.toneAnalysis),
      vocabulary: this.getVocabularyGuidance(analysis.vocabularyProfile),
      sentenceStructure: this.getSentenceGuidance(analysis.sentenceStructure),
      commonPhrases: analysis.commonPhrases,
      callToActions: analysis.callToActions,
      brandVoice: analysis.brandVoice,
      contentThemes: analysis.contentThemes
    };
    
    return enhancements;
  }

  // Get primary tone from analysis
  getPrimaryTone(toneAnalysis) {
    const tones = Object.entries(toneAnalysis);
    const primaryTone = tones.reduce((max, [tone, score]) => 
      score > max.score ? { tone, score } : max, { tone: 'friendly', score: 0 }
    );
    
    return primaryTone.tone;
  }

  // Get vocabulary guidance
  getVocabularyGuidance(vocabulary) {
    return {
      targetDiversity: vocabulary.vocabularyDiversity,
      preferredWordLength: this.getPreferredWordLength(vocabulary.wordLength),
      commonWords: vocabulary.commonWords.slice(0, 10).map(w => w.word)
    };
  }

  // Get preferred word length
  getPreferredWordLength(wordLength) {
    const { short, medium, long } = wordLength;
    if (medium > short && medium > long) return 'medium';
    if (short > medium && short > long) return 'short';
    return 'long';
  }

  // Get sentence structure guidance
  getSentenceGuidance(sentenceStructure) {
    return {
      targetAverageLength: sentenceStructure.averageLength,
      preferredStructure: this.getPreferredSentenceStructure(sentenceStructure),
      useQuestions: sentenceStructure.questions > 0,
      useExclamations: sentenceStructure.exclamations > 0
    };
  }

  // Get preferred sentence structure
  getPreferredSentenceStructure(structure) {
    const { shortSentences, mediumSentences, longSentences } = structure;
    if (mediumSentences > shortSentences && mediumSentences > longSentences) return 'medium';
    if (shortSentences > mediumSentences && shortSentences > longSentences) return 'short';
    return 'long';
  }
}

module.exports = ContentAnalyzer; 