const express = require('express');
const router = express.Router();
const { googleAnalyticsClient, googleSearchConsoleClient, wixClient } = require('../utils/api-clients');
const logger = require('../utils/logger');

// Google Analytics endpoints
router.get('/google-analytics', async (req, res) => {
  try {
    const { startDate, endDate, metrics, dimensions } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'startDate and endDate are required parameters'
      });
    }

    const analyticsData = await googleAnalyticsClient().getAnalyticsData(
      startDate,
      endDate,
      metrics ? metrics.split(',') : ['sessions', 'users', 'pageviews'],
      dimensions ? dimensions.split(',') : ['date']
    );

    res.json({
      success: true,
      data: analyticsData
    });
  } catch (error) {
    logger.error('Google Analytics data fetch error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

router.get('/google-analytics/data', async (req, res) => {
  try {
    const { startDate, endDate, metrics, dimensions } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'startDate and endDate are required parameters'
      });
    }

    const analyticsData = await googleAnalyticsClient().getAnalyticsData(
      startDate,
      endDate,
      metrics ? metrics.split(',') : ['sessions', 'users', 'pageviews'],
      dimensions ? dimensions.split(',') : ['date']
    );

    res.json({
      success: true,
      data: analyticsData
    });
  } catch (error) {
    logger.error('Google Analytics data fetch error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

router.get('/google-analytics/realtime', async (req, res) => {
  try {
    const realtimeData = await googleAnalyticsClient().getRealTimeData();

    res.json({
      success: true,
      data: realtimeData
    });
  } catch (error) {
    logger.error('Google Analytics real-time data fetch error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// Google Search Console endpoints
router.get('/google-search-console', async (req, res) => {
  try {
    const { startDate, endDate, dimensions, rowLimit } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'startDate and endDate are required parameters'
      });
    }

    const searchData = await googleSearchConsoleClient().getSearchAnalytics(
      startDate,
      endDate,
      dimensions ? dimensions.split(',') : ['query', 'page'],
      rowLimit ? parseInt(rowLimit) : 1000
    );

    res.json({
      success: true,
      data: searchData
    });
  } catch (error) {
    logger.error('Google Search Console data fetch error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

router.get('/google-search-console/search-analytics', async (req, res) => {
  try {
    const { startDate, endDate, dimensions, rowLimit } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'startDate and endDate are required parameters'
      });
    }

    const searchData = await googleSearchConsoleClient().getSearchAnalytics(
      startDate,
      endDate,
      dimensions ? dimensions.split(',') : ['query', 'page'],
      rowLimit ? parseInt(rowLimit) : 1000
    );

    res.json({
      success: true,
      data: searchData
    });
  } catch (error) {
    logger.error('Google Search Console data fetch error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

router.get('/google-search-console/sitemaps', async (req, res) => {
  try {
    const sitemapsData = await googleSearchConsoleClient().getSitemaps();

    res.json({
      success: true,
      data: sitemapsData
    });
  } catch (error) {
    logger.error('Google Search Console sitemaps fetch error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// Wix endpoints
router.get('/wix/site-stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'startDate and endDate are required parameters'
      });
    }

    const siteStats = await wixClient().getSiteStats(startDate, endDate);

    res.json({
      success: true,
      data: siteStats
    });
  } catch (error) {
    logger.error('Wix site stats fetch error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

router.get('/wix/pages', async (req, res) => {
  try {
    const pagesData = await wixClient().getPages();

    res.json({
      success: true,
      data: pagesData
    });
  } catch (error) {
    logger.error('Wix pages fetch error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

router.get('/wix/blog-posts', async (req, res) => {
  try {
    const blogPostsData = await wixClient().getBlogPosts();

    res.json({
      success: true,
      data: blogPostsData
    });
  } catch (error) {
    logger.error('Wix blog posts fetch error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// Enhanced Wix blog analytics endpoint
router.get('/wix/blog-analytics', async (req, res) => {
  try {
    const blogAnalytics = await wixClient().getBlogAnalytics();

    res.json({
      success: true,
      data: blogAnalytics
    });
  } catch (error) {
    logger.error('Wix blog analytics fetch error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// Wix blog content insights endpoint
router.get('/wix/blog-insights', async (req, res) => {
  try {
    const blogInsights = await wixClient().getBlogContentInsights();

    res.json({
      success: true,
      data: blogInsights
    });
  } catch (error) {
    logger.error('Wix blog insights fetch error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// Wix forms data endpoint
router.get('/wix/forms', async (req, res) => {
  try {
    const formsData = await wixClient().getFormsData();

    res.json({
      success: true,
      data: formsData
    });
  } catch (error) {
    logger.error('Wix forms data fetch error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// Wix contacts data endpoint
router.get('/wix/contacts', async (req, res) => {
  try {
    const contactsData = await wixClient().getContactsData();

    res.json({
      success: true,
      data: contactsData
    });
  } catch (error) {
    logger.error('Wix contacts data fetch error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// Wix site data endpoint
router.get('/wix/site', async (req, res) => {
  try {
    const siteData = await wixClient().getSiteData();

    res.json({
      success: true,
      data: siteData
    });
  } catch (error) {
    logger.error('Wix site data fetch error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// Wix marketing data endpoint
router.get('/wix/marketing', async (req, res) => {
  try {
    const marketingData = await wixClient().getMarketingData();

    res.json({
      success: true,
      data: marketingData
    });
  } catch (error) {
    logger.error('Wix marketing data fetch error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// Comprehensive Wix data endpoint
router.get('/wix/comprehensive', async (req, res) => {
  try {
    const comprehensiveData = await wixClient().getComprehensiveWixData();

    res.json({
      success: true,
      data: comprehensiveData
    });
  } catch (error) {
    logger.error('Wix comprehensive data fetch error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// Wix pricing plans data endpoint
router.get('/wix/pricing-plans', async (req, res) => {
  try {
    const pricingPlansData = await wixClient().getPricingPlansData();

    res.json({
      success: true,
      data: pricingPlansData
    });
  } catch (error) {
    logger.error('Wix pricing plans data fetch error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// Combined analytics dashboard endpoint
router.get('/dashboard', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'startDate and endDate are required parameters'
      });
    }

    // Fetch data from all sources in parallel
    const [analyticsData, searchData, blogPosts, realtimeData, pricingPlans] = await Promise.allSettled([
      googleAnalyticsClient().getAnalyticsData(startDate, endDate),
      googleSearchConsoleClient().getSearchAnalytics(startDate, endDate),
      wixClient().getBlogPosts(), // Use blog posts instead of site stats
      googleAnalyticsClient().getRealTimeData(),
      wixClient().getPricingPlansData()
    ]);

    const dashboardData = {
      googleAnalytics: analyticsData.status === 'fulfilled' ? analyticsData.value : { error: analyticsData.reason?.message },
      googleSearchConsole: searchData.status === 'fulfilled' ? searchData.value : { error: searchData.reason?.message },
      wixBlogPosts: blogPosts.status === 'fulfilled' ? blogPosts.value : { error: blogPosts.reason?.message },
      realtimeAnalytics: realtimeData.status === 'fulfilled' ? realtimeData.value : { error: realtimeData.reason?.message },
      wixPricingPlans: pricingPlans.status === 'fulfilled' ? pricingPlans.value : { error: pricingPlans.reason?.message }
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    logger.error('Analytics dashboard fetch error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// API status endpoint
router.get('/status', async (req, res) => {
  try {
    const status = {
      googleAnalytics: {
        configured: !!(process.env.GOOGLE_ANALYTICS_CLIENT_ID && process.env.GOOGLE_ANALYTICS_PROPERTY_ID && process.env.GOOGLE_ANALYTICS_REFRESH_TOKEN),
        testable: false
      },
      googleSearchConsole: {
        configured: !!(process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID && process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL && process.env.GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN),
        testable: false
      },
      wix: {
        configured: !!(process.env.WIX_API_KEY && process.env.WIX_SITE_ID),
        testable: false
      }
    };

    // Test connections if configured
    if (status.googleAnalytics.configured) {
      try {
        await googleAnalyticsClient().getAccessToken();
        status.googleAnalytics.testable = true;
      } catch (error) {
        status.googleAnalytics.error = error.message;
      }
    }

    if (status.googleSearchConsole.configured) {
      try {
        await googleSearchConsoleClient().getAccessToken();
        status.googleSearchConsole.testable = true;
      } catch (error) {
        status.googleSearchConsole.error = error.message;
      }
    }

    if (status.wix.configured) {
      try {
        // Simple test - try to get blog posts (which we know works)
        await wixClient().getBlogPosts();
        status.wix.testable = true;
      } catch (error) {
        status.wix.error = error.message;
      }
    }

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Analytics status check error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// Enhanced business intelligence endpoint
router.get('/business-intelligence', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'startDate and endDate are required parameters'
      });
    }

    // Fetch comprehensive data for business intelligence
    const [
      analyticsData,
      searchData,
      blogPosts,
      realtimeData,
      wixData,
      formsData,
      contactsData
    ] = await Promise.allSettled([
      googleAnalyticsClient().getAnalyticsData(startDate, endDate),
      googleSearchConsoleClient().getSearchAnalytics(startDate, endDate),
      wixClient().getBlogPosts(),
      googleAnalyticsClient().getRealTimeData(),
      wixClient().getComprehensiveWixData(),
      wixClient().getFormsData(),
      wixClient().getContactsData()
    ]);

    // Calculate business intelligence metrics
    // Generate business intelligence with async functions
    const [keyInsights, predictions, competitiveAnalysis, actionableRecommendations] = await Promise.all([
      generateKeyInsights(analyticsData.value, searchData.value, blogPosts.value),
      generatePredictions(analyticsData.value, searchData.value),
      generateCompetitiveAnalysis(),
      generateActionableRecommendations()
    ]);
    
    const businessIntelligence = {
      performanceScores: {
        traffic: calculateTrafficScore(analyticsData.value),
        content: calculateContentScore(blogPosts.value),
        seo: calculateSEOScore(searchData.value),
        engagement: calculateEngagementScore(analyticsData.value),
        conversion: calculateConversionScore(formsData.value, contactsData.value)
      },
      keyInsights,
      predictions,
      competitiveAnalysis,
      actionableRecommendations
    };

    const enhancedData = {
      googleAnalytics: analyticsData.status === 'fulfilled' ? analyticsData.value : { error: analyticsData.reason?.message },
      googleSearchConsole: searchData.status === 'fulfilled' ? searchData.value : { error: searchData.reason?.message },
      wixBlogPosts: blogPosts.status === 'fulfilled' ? blogPosts.value : { error: blogPosts.reason?.message },
      realtimeAnalytics: realtimeData.status === 'fulfilled' ? realtimeData.value : { error: realtimeData.reason?.message },
      wixData: wixData.status === 'fulfilled' ? wixData.value : { error: wixData.reason?.message },
      formsData: formsData.status === 'fulfilled' ? formsData.value : { error: formsData.reason?.message },
      contactsData: contactsData.status === 'fulfilled' ? contactsData.value : { error: contactsData.reason?.message },
      businessIntelligence
    };

    res.json({
      success: true,
      data: enhancedData
    });
  } catch (error) {
    logger.error('Business intelligence fetch error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// Helper functions for business intelligence calculations
function calculateTrafficScore(analyticsData) {
  if (!analyticsData || !analyticsData.rows) return 75;
  
  const totalSessions = analyticsData.rows.reduce((sum, row) => 
    sum + parseInt(row.metricValues[0]?.value || 0), 0);
  
  // Score based on sessions (normalized for demo)
  return Math.min(100, Math.max(30, (totalSessions / 100) * 10 + 60));
}

function calculateContentScore(blogData) {
  if (!blogData || !blogData.items) return 85;
  
  const postCount = blogData.items.length;
  // Score based on content volume and recency
  return Math.min(100, Math.max(50, postCount * 8 + 50));
}

function calculateSEOScore(searchData) {
  if (!searchData || !searchData.rows) return 80;
  
  const avgPosition = searchData.rows.reduce((sum, row) => sum + row.position, 0) / searchData.rows.length;
  // Score based on average position (lower is better)
  return Math.min(100, Math.max(40, 100 - avgPosition * 3));
}

function calculateEngagementScore(analyticsData) {
  if (!analyticsData || !analyticsData.rows) return 70;
  
  const totalSessions = analyticsData.rows.reduce((sum, row) => 
    sum + parseInt(row.metricValues[0]?.value || 0), 0);
  const totalPageviews = analyticsData.rows.reduce((sum, row) => 
    sum + parseInt(row.metricValues[2]?.value || 0), 0);
  
  const avgPagesPerSession = totalSessions > 0 ? totalPageviews / totalSessions : 1;
  return Math.min(100, Math.max(40, avgPagesPerSession * 25 + 40));
}

function calculateConversionScore(formsData, contactsData) {
  const forms = formsData?.submissions?.length || 0;
  const contacts = contactsData?.contacts?.length || 0;
  const totalConversions = forms + contacts;
  
  return Math.min(100, Math.max(30, totalConversions * 5 + 50));
}

async function generateKeyInsights(analyticsData, searchData, blogData) {
  const supabase = require('../database/supabase-client');
  const insights = [];
  
  try {
    // Get published social posts from last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: socialPosts } = await supabase
      .from('social_content')
      .select('*')
      .eq('status', 'published')
      .gte('published_at', thirtyDaysAgo);
    
    // Get blog posts from last 30 days
    const { data: blogPosts } = await supabase
      .from('blog_posts')
      .select('*')
      .gte('created_at', thirtyDaysAgo);
    
    // Get latest market research
    const { data: research } = await supabase
      .from('market_research')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    
    // Generate REAL insights from data
    if (socialPosts && socialPosts.length > 0) {
      insights.push(`Created and published ${socialPosts.length} social media posts this month`);
    }
    
    if (blogPosts && blogPosts.length > 0) {
      const avgWordCount = blogPosts.reduce((sum, post) => 
        sum + (post.word_count || 1500), 0) / blogPosts.length;
      insights.push(`Published ${blogPosts.length} blog posts (avg ${Math.round(avgWordCount)} words)`);
    }
    
    if (research && research.length > 0) {
      const topics = research[0].trending_topics || [];
      if (topics.length > 0) {
        insights.push(`Identified ${topics.length} trending topics in your industry`);
      }
      
      const opportunities = research[0].opportunities || [];
      if (opportunities.length > 0) {
        insights.push(`Found ${opportunities.length} content opportunities`);
      }
    }
    
    // Add analytics-based insights if data available
    if (analyticsData && analyticsData.rows && analyticsData.rows.length > 0) {
      const totalSessions = analyticsData.rows.reduce((sum, row) => 
        sum + parseInt(row.metricValues?.[0]?.value || 0), 0);
      if (totalSessions > 0) {
        insights.push(`Website traffic: ${totalSessions.toLocaleString()} sessions this period`);
      }
    }
    
    // Fallback if no data yet
    if (insights.length === 0) {
      insights.push('AI agent system is collecting data - check back soon for insights');
    }
    
    return insights;
  } catch (error) {
    console.error('Error generating insights:', error);
    return ['AI agent system is active and collecting data'];
  }
}

async function generatePredictions(analyticsData, searchData) {
  const supabase = require('../database/supabase-client');
  
  try {
    // Get last 60 days of data for trend analysis
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    // Get content created in last 30 vs previous 30 days
    const { data: recentPosts } = await supabase
      .from('social_content')
      .select('*')
      .gte('created_at', thirtyDaysAgo);
    
    const { data: previousPosts } = await supabase
      .from('social_content')
      .select('*')
      .gte('created_at', sixtyDaysAgo)
      .lt('created_at', thirtyDaysAgo);
    
    // Calculate real growth rate
    const growthRate = previousPosts && previousPosts.length > 0 
      ? Math.round(((recentPosts.length - previousPosts.length) / previousPosts.length) * 100)
      : 0;
    
    // Get blog post stats
    const { data: recentBlogs } = await supabase
      .from('blog_posts')
      .select('*')
      .gte('created_at', thirtyDaysAgo);
    
    const { data: previousBlogs } = await supabase
      .from('blog_posts')
      .select('*')
      .gte('created_at', sixtyDaysAgo)
      .lt('created_at', thirtyDaysAgo);
    
    const blogGrowth = previousBlogs && previousBlogs.length > 0
      ? Math.round(((recentBlogs.length - previousBlogs.length) / previousBlogs.length) * 100)
      : 0;
    
    return {
      nextMonthContentCreation: recentPosts && recentPosts.length > 0 
        ? recentPosts.length + Math.round(recentPosts.length * (growthRate / 100))
        : 'N/A',
      contentGrowthRate: growthRate !== 0 ? `${growthRate > 0 ? '+' : ''}${growthRate}%` : 'N/A',
      postsScheduled: recentPosts ? recentPosts.filter(p => p.status === 'approved').length : 0,
      postsPublished: recentPosts ? recentPosts.filter(p => p.status === 'published').length : 0,
      blogGrowthRate: blogGrowth !== 0 ? `${blogGrowth > 0 ? '+' : ''}${blogGrowth}%` : 'N/A',
      blogsCreated: recentBlogs ? recentBlogs.length : 0
    };
  } catch (error) {
    console.error('Error generating predictions:', error);
    return {
      nextMonthContentCreation: 'N/A',
      contentGrowthRate: 'Collecting data',
      postsScheduled: 0,
      postsPublished: 0
    };
  }
}

async function generateCompetitiveAnalysis() {
  const supabase = require('../database/supabase-client');
  
  try {
    // Get latest market research with competitor data
    const { data: research } = await supabase
      .from('market_research')
      .select('competitor_analysis')
      .order('created_at', { ascending: false})
      .limit(1);
    
    if (research && research.length > 0 && research[0].competitor_analysis) {
      // Use REAL competitor data from market research
      const competitorData = research[0].competitor_analysis;
      
      // Return as array if it's an object
      if (typeof competitorData === 'object' && !Array.isArray(competitorData)) {
        return Object.values(competitorData);
      }
      
      return Array.isArray(competitorData) ? competitorData : [];
    }
    
    // Return empty array if no data yet (not hardcoded competitors)
    return [];
  } catch (error) {
    console.error('Error generating competitive analysis:', error);
    return [];
  }
}

async function generateActionableRecommendations() {
  const supabase = require('../database/supabase-client');
  const recommendations = [];
  
  try {
    // Get latest CMO Brain recommendations from agent outputs
    const { data: cmoOutputs } = await supabase
      .from('agent_outputs')
      .select('*')
      .eq('agent', 'cmo-brain')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (cmoOutputs && cmoOutputs.length > 0) {
      cmoOutputs.forEach(output => {
        if (output.content && output.content.recommendations) {
          const recs = Array.isArray(output.content.recommendations) 
            ? output.content.recommendations 
            : [output.content.recommendations];
          recommendations.push(...recs);
        } else if (output.content && output.content.priorities) {
          // Extract priorities as recommendations
          const priorities = Array.isArray(output.content.priorities)
            ? output.content.priorities
            : Object.values(output.content.priorities);
          priorities.slice(0, 2).forEach((priority, index) => {
            recommendations.push({
              priority: index === 0 ? 'high' : 'medium',
              action: typeof priority === 'string' ? priority : priority.action || priority.title,
              impact: 'high',
              source: 'CMO Brain'
            });
          });
        }
      });
    }
    
    // Add data-driven recommendations based on actual metrics
    const { data: pendingPosts } = await supabase
      .from('social_content')
      .select('*')
      .eq('status', 'pending');
    
    if (pendingPosts && pendingPosts.length > 3) {
      recommendations.push({
        priority: 'high',
        action: `Review and approve ${pendingPosts.length} pending social media posts`,
        impact: 'high',
        dataPoint: `${pendingPosts.length} posts awaiting approval`,
        source: 'Content Pipeline'
      });
    }
    
    // Check for blog posts needing approval
    const { data: pendingBlogs } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'draft');
    
    if (pendingBlogs && pendingBlogs.length > 0) {
      recommendations.push({
        priority: 'medium',
        action: `Review ${pendingBlogs.length} draft blog post${pendingBlogs.length > 1 ? 's' : ''}`,
        impact: 'high',
        source: 'Content Pipeline'
      });
    }
    
    // Check market research age
    const { data: latestResearch } = await supabase
      .from('market_research')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (latestResearch && latestResearch.length > 0) {
      const daysSinceResearch = Math.floor(
        (Date.now() - new Date(latestResearch[0].created_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceResearch > 7) {
        recommendations.push({
          priority: 'medium',
          action: 'Run new market research to identify fresh opportunities',
          impact: 'medium',
          dataPoint: `Last research: ${daysSinceResearch} days ago`,
          source: 'Market Intelligence'
        });
      }
    }
    
    // Return top 5 unique recommendations
    const uniqueRecommendations = recommendations
      .filter((rec, index, self) => 
        index === self.findIndex(r => r.action === rec.action)
      )
      .slice(0, 5);
    
    // Fallback if no recommendations
    if (uniqueRecommendations.length === 0) {
      return [
        {
          priority: 'medium',
          action: 'Continue running weekly content workflows',
          impact: 'high',
          source: 'System'
        }
      ];
    }
    
    return uniqueRecommendations;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [
      {
        priority: 'medium',
        action: 'AI agent system is analyzing your data',
        impact: 'high',
        source: 'System'
      }
    ];
  }
}

// Debug endpoint to check environment variables
router.get('/debug', (req, res) => {
  res.json({
    success: true,
    data: {
      googleAnalytics: {
        clientId: process.env.GOOGLE_ANALYTICS_CLIENT_ID ? 'Present' : 'Missing',
        propertyId: process.env.GOOGLE_ANALYTICS_PROPERTY_ID ? 'Present' : 'Missing',
        refreshToken: process.env.GOOGLE_ANALYTICS_REFRESH_TOKEN ? 'Present' : 'Missing',
        accessToken: process.env.GOOGLE_ANALYTICS_ACCESS_TOKEN ? 'Present' : 'Missing'
      },
      googleSearchConsole: {
        clientId: process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID ? 'Present' : 'Missing',
        siteUrl: process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL ? 'Present' : 'Missing',
        refreshToken: process.env.GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN ? 'Present' : 'Missing'
      },
      clientInstances: {
        gaClientId: googleAnalyticsClient().clientId ? 'Present' : 'Missing',
        gaRefreshToken: googleAnalyticsClient().refreshToken ? 'Present' : 'Missing',
        gscClientId: googleSearchConsoleClient().clientId ? 'Present' : 'Missing',
        gscRefreshToken: googleSearchConsoleClient().refreshToken ? 'Present' : 'Missing'
      }
    }
  });
});

module.exports = router; 