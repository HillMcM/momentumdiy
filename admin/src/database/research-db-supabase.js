/**
 * Research Database - Supabase Version
 * 
 * Manages market research data using Supabase
 */

const supabase = require('./supabase-client');
const logger = require('../utils/logger');

class ResearchDatabase {
    constructor() {
        this.tableName = 'market_research';
        logger.info('Research database initialized (Supabase)');
    }

    /**
     * Add research data to database
     */
    async addResearch(researchData) {
        try {
            const { data, error } = await supabase
                .from(this.tableName)
                .insert([{
                    trending_topics: researchData.trendingTopics || researchData.trending_topics || [],
                    competitor_analysis: researchData.competitorAnalysis || researchData.competitor_analysis || {},
                    content_gaps: researchData.contentGaps || researchData.content_gaps || [],
                    opportunities: researchData.opportunities || [],
                    data_sources: researchData.dataSources || researchData.data_sources || {},
                    metadata: {
                        status: researchData.status,
                        timeframe: researchData.timeframe,
                        focusAreas: researchData.focusAreas
                    }
                }])
                .select()
                .single();
            
            if (error) throw error;
            
            logger.info(`Research data added: ${data.id}`);
            return data;
        } catch (error) {
            logger.error('Error adding research:', error);
            throw error;
        }
    }

    /**
     * Get latest research data
     */
    async getLatestResearch() {
        try {
            const { data, error } = await supabase
                .from(this.tableName)
                .select('*')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
            
            if (error && error.code !== 'PGRST116') throw error; // Ignore "not found"
            
            if (!data) {
                logger.warn('No research data found in database');
                return null;
            }
            
            return {
                id: data.id,
                trendingTopics: data.trending_topics || [],
                competitorAnalysis: data.competitor_analysis || {},
                contentGaps: data.content_gaps || [],
                opportunities: data.opportunities || [],
                dataSources: data.data_sources || {},
                createdAt: data.created_at,
                ...data.metadata
            };
        } catch (error) {
            logger.error('Error getting latest research:', error);
            return null;
        }
    }

    /**
     * Get research by ID
     */
    async getResearchById(id) {
        try {
            const { data, error } = await supabase
                .from(this.tableName)
                .select('*')
                .eq('id', id)
                .single();
            
            if (error && error.code !== 'PGRST116') throw error;
            
            return data ? {
                id: data.id,
                trendingTopics: data.trending_topics || [],
                competitorAnalysis: data.competitor_analysis || {},
                contentGaps: data.content_gaps || [],
                opportunities: data.opportunities || [],
                dataSources: data.data_sources || {},
                createdAt: data.created_at
            } : null;
        } catch (error) {
            logger.error('Error getting research by ID:', error);
            return null;
        }
    }

    /**
     * Get all research within timeframe
     */
    async getResearchByTimeframe(days = 7) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const { data, error } = await supabase
                .from(this.tableName)
                .select('*')
                .gte('created_at', startDate.toISOString())
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            return data || [];
        } catch (error) {
            logger.error('Error getting research by timeframe:', error);
            return [];
        }
    }

    /**
     * Get database statistics
     */
    async getDatabaseStats() {
        try {
            // Get total count
            const { count: totalCount, error: countError } = await supabase
                .from(this.tableName)
                .select('*', { count: 'exact', head: true });
            
            if (countError) throw countError;

            // Get latest research to calculate days since
            const latest = await this.getLatestResearch();
            
            let daysSinceLastResearch = 999;
            if (latest && latest.createdAt) {
                const lastDate = new Date(latest.createdAt);
                const now = new Date();
                daysSinceLastResearch = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
            }

            return {
                totalEntries: totalCount || 0,
                daysSinceLastResearch: daysSinceLastResearch,
                hasRecentResearch: daysSinceLastResearch <= 7,
                lastResearchDate: latest?.createdAt || null
            };
        } catch (error) {
            logger.error('Error getting database stats:', error);
            return {
                totalEntries: 0,
                daysSinceLastResearch: 999,
                hasRecentResearch: false,
                lastResearchDate: null
            };
        }
    }

    /**
     * Search research by keywords
     */
    async searchResearch(keywords) {
        try {
            // Supabase full-text search on trending_topics
            const { data, error } = await supabase
                .from(this.tableName)
                .select('*')
                .textSearch('trending_topics', keywords, {
                    type: 'websearch',
                    config: 'english'
                })
                .order('created_at', { ascending: false })
                .limit(10);
            
            if (error) throw error;
            
            return data || [];
        } catch (error) {
            logger.error('Error searching research:', error);
            return [];
        }
    }

    /**
     * Get trending topics from recent research
     */
    async getTrendingTopics(limit = 10) {
        try {
            const recentResearch = await this.getResearchByTimeframe(30);
            
            if (!recentResearch || recentResearch.length === 0) {
                return [];
            }

            // Collect all trending topics
            const allTopics = [];
            recentResearch.forEach(research => {
                if (research.trending_topics && Array.isArray(research.trending_topics)) {
                    allTopics.push(...research.trending_topics);
                }
            });

            // Return most recent unique topics
            const uniqueTopics = [...new Set(allTopics.map(t => typeof t === 'string' ? t : t.title))];
            return uniqueTopics.slice(0, limit);
        } catch (error) {
            logger.error('Error getting trending topics:', error);
            return [];
        }
    }

    /**
     * Clean old research data (keep last 90 days)
     */
    async cleanOldResearch(daysToKeep = 90) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

            const { data, error } = await supabase
                .from(this.tableName)
                .delete()
                .lt('created_at', cutoffDate.toISOString())
                .select();
            
            if (error) throw error;
            
            const deletedCount = data?.length || 0;
            logger.info(`Cleaned ${deletedCount} old research entries (older than ${daysToKeep} days)`);
            
            return deletedCount;
        } catch (error) {
            logger.error('Error cleaning old research:', error);
            return 0;
        }
    }
}

module.exports = ResearchDatabase;

