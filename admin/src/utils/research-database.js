const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');

class ResearchDatabase {
  constructor() {
    this.dbPath = path.join(__dirname, '../data/research-database.json');
    this.researchData = {
      topics: [],
      trends: [],
      insights: [],
      opportunities: [],
      competitors: [],
      lastUpdated: null,
      metadata: {
        totalEntries: 0,
        lastResearchDate: null,
        researchFrequency: 'weekly'
      }
    };
    // Initialize database synchronously
    this.initializeDatabaseSync();
  }

  // Synchronous initialization for immediate access
  initializeDatabaseSync() {
    try {
      const fsSync = require('fs');
      const pathSync = require('path');
      
      // Ensure data directory exists
      const dataDir = path.dirname(this.dbPath);
      if (!fsSync.existsSync(dataDir)) {
        fsSync.mkdirSync(dataDir, { recursive: true });
      }

      // Load existing database or create new one
      if (fsSync.existsSync(this.dbPath)) {
        const existingData = fsSync.readFileSync(this.dbPath, 'utf8');
        this.researchData = JSON.parse(existingData);
        logger.info(`Research database loaded with ${this.researchData.metadata.totalEntries} entries`);
      } else {
        // Database doesn't exist, create new one
        this.saveDatabaseSync();
        logger.info('New research database created');
      }
    } catch (error) {
      logger.error('Error initializing research database:', error);
    }
  }

  async initializeDatabase() {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.dbPath);
      await fs.mkdir(dataDir, { recursive: true });

      // Load existing database or create new one
      try {
        const existingData = await fs.readFile(this.dbPath, 'utf8');
        this.researchData = JSON.parse(existingData);
        logger.info(`Research database loaded with ${this.researchData.metadata.totalEntries} entries`);
      } catch (error) {
        // Database doesn't exist, create new one
        await this.saveDatabase();
        logger.info('New research database created');
      }
    } catch (error) {
      logger.error('Error initializing research database:', error);
    }
  }

  saveDatabaseSync() {
    try {
      const fsSync = require('fs');
      fsSync.writeFileSync(this.dbPath, JSON.stringify(this.researchData, null, 2));
    } catch (error) {
      logger.error('Error saving research database:', error);
    }
  }

  async saveDatabase() {
    try {
      await fs.writeFile(this.dbPath, JSON.stringify(this.researchData, null, 2));
    } catch (error) {
      logger.error('Error saving research database:', error);
    }
  }

  // Check if research is fresh (within 7 days)
  isResearchFresh() {
    if (!this.researchData.lastUpdated) {
      return false;
    }

    const lastUpdate = new Date(this.researchData.lastUpdated);
    const now = new Date();
    const daysSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60 * 24);

    return daysSinceUpdate <= 7;
  }

  // Get days since last research
  getDaysSinceLastResearch() {
    if (!this.researchData.lastUpdated) {
      return Infinity;
    }

    const lastUpdate = new Date(this.researchData.lastUpdated);
    const now = new Date();
    return Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));
  }

  // Add new research data
  async addResearchData(researchResults) {
    const timestamp = new Date().toISOString();
    
    if (researchResults && Array.isArray(researchResults)) {
      for (const result of researchResults) {
        if (result.task === 'find_brand_opportunities' && result.result && result.result.opportunities) {
          // Add content opportunities
          for (const opportunity of result.result.opportunities) {
            this.researchData.opportunities.push({
              ...opportunity,
              source: 'market_researcher',
              timestamp: timestamp,
              task: result.task
            });
          }
        }

        if (result.result && result.result.trendingTopics) {
          // Add trending topics - handle both array and object structures
          let topics = [];
          if (Array.isArray(result.result.trendingTopics)) {
            topics = result.result.trendingTopics;
          } else if (result.result.trendingTopics.timeline_data && Array.isArray(result.result.trendingTopics.timeline_data)) {
            // Extract topics from timeline_data structure
            result.result.trendingTopics.timeline_data.forEach(timelineItem => {
              if (timelineItem.values && Array.isArray(timelineItem.values)) {
                timelineItem.values.forEach(value => {
                  if (value.query && value.extracted_value > 50) {
                    topics.push({
                      query: value.query,
                      interest: value.extracted_value,
                      date: timelineItem.date
                    });
                  }
                });
              }
            });
          }
          
          // Add extracted topics to database
          for (const topic of topics) {
            this.researchData.trends.push({
              topic: typeof topic === 'string' ? topic : topic.query,
              interest: topic.interest || 'unknown',
              date: topic.date || 'recent',
              source: 'market_researcher',
              timestamp: timestamp,
              task: result.task
            });
          }
        }

        if (result.result && result.result.insights) {
          // Add insights
          for (const insight of result.result.insights) {
            this.researchData.insights.push({
              ...insight,
              source: 'market_researcher',
              timestamp: timestamp,
              task: result.task
            });
          }
        }

        if (result.task === 'research_competitors' && result.result) {
          // Add competitor data
          this.researchData.competitors.push({
            ...result.result,
            source: 'market_researcher',
            timestamp: timestamp,
            task: result.task
          });
        }
      }
    }

    // Update metadata
    this.researchData.lastUpdated = timestamp;
    this.researchData.metadata.lastResearchDate = timestamp;
    this.researchData.metadata.totalEntries = this.getTotalEntries();

    await this.saveDatabase();
    logger.info(`Research database updated with ${researchResults?.length || 0} new entries`);
  }

  // Get total entries count
  getTotalEntries() {
    return (
      this.researchData.topics.length +
      this.researchData.trends.length +
      this.researchData.insights.length +
      this.researchData.opportunities.length +
      this.researchData.competitors.length
    );
  }

  // Get fresh content opportunities (last 30 days)
  getFreshContentOpportunities(limit = 10) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    return this.researchData.opportunities
      .filter(opp => new Date(opp.timestamp) >= thirtyDaysAgo)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  // Get trending topics (last 14 days)
  getTrendingTopics(limit = 10) {
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    
    return this.researchData.trends
      .filter(trend => new Date(trend.timestamp) >= fourteenDaysAgo)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  // Get recent insights (last 30 days)
  getRecentInsights(limit = 10) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    return this.researchData.insights
      .filter(insight => new Date(insight.timestamp) >= thirtyDaysAgo)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  // Get content inspiration for copywriter
  getContentInspiration(priorityTitle, limit = 5) {
    const relevantOpportunities = this.researchData.opportunities
      .filter(opp => {
        const title = priorityTitle.toLowerCase();
        const oppTitle = (opp.title || '').toLowerCase();
        const oppType = (opp.type || '').toLowerCase();
        
        return title.includes(oppType) || oppTitle.includes(title) || oppType.includes(title);
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);

    const trendingTopics = this.getTrendingTopics(limit);
    const recentInsights = this.getRecentInsights(limit);

    return {
      opportunities: relevantOpportunities,
      trendingTopics: trendingTopics.map(t => t.topic),
      insights: recentInsights,
      lastUpdated: this.researchData.lastUpdated,
      daysSinceLastResearch: this.getDaysSinceLastResearch()
    };
  }

  // Get all data from the research database
  getAllData() {
    return {
      opportunities: this.researchData.opportunities,
      marketTrends: this.researchData.trends,
      insights: this.researchData.insights,
      competitorAnalysis: this.researchData.competitors,
      lastUpdated: this.researchData.lastUpdated,
      daysSinceLastResearch: this.getDaysSinceLastResearch(),
      isFresh: this.isResearchFresh()
    };
  }

  // Get database statistics
  getDatabaseStats() {
    return {
      totalEntries: this.researchData.metadata.totalEntries,
      lastUpdated: this.researchData.lastUpdated,
      daysSinceLastResearch: this.getDaysSinceLastResearch(),
      isFresh: this.isResearchFresh(),
      breakdown: {
        opportunities: this.researchData.opportunities.length,
        trends: this.researchData.trends.length,
        insights: this.researchData.insights.length,
        competitors: this.researchData.competitors.length
      }
    };
  }

  // Clean old data (older than 90 days)
  async cleanOldData() {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    
    this.researchData.opportunities = this.researchData.opportunities
      .filter(opp => new Date(opp.timestamp) >= ninetyDaysAgo);
    
    this.researchData.trends = this.researchData.trends
      .filter(trend => new Date(trend.timestamp) >= ninetyDaysAgo);
    
    this.researchData.insights = this.researchData.insights
      .filter(insight => new Date(insight.timestamp) >= ninetyDaysAgo);
    
    this.researchData.competitors = this.researchData.competitors
      .filter(comp => new Date(comp.timestamp) >= ninetyDaysAgo);

    this.researchData.metadata.totalEntries = this.getTotalEntries();
    await this.saveDatabase();
    
    logger.info('Research database cleaned of old data');
  }
}

module.exports = ResearchDatabase; 