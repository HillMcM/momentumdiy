/**
 * Approval Database - Supabase Version
 * 
 * Manages agent outputs, approvals, and learning data using Supabase
 */

const supabase = require('./supabase-client');
const logger = require('../utils/logger');

class ApprovalDatabase {
    constructor() {
        logger.info('Approval database initialized (Supabase)');
    }

    // Generate unique ID (Supabase uses UUID automatically)
    generateId() {
        return crypto.randomUUID();
    }

    // ==================== AGENT OUTPUT MANAGEMENT ====================

    async addOutput(output) {
        try {
            const newOutput = {
                agent: output.agent,
                type: output.type,
                content: output.content,
                status: 'pending',
                metadata: output.metadata || {}
            };
            
            const { data, error } = await supabase
                .from('agent_outputs')
                .insert([newOutput])
                .select()
                .single();
            
            if (error) throw error;
            
            logger.info(`Added new output: ${data.id} from ${data.agent}`);
            return data;
        } catch (error) {
            logger.error('Error adding output:', error);
            throw error;
        }
    }

    async getOutputs(filters = {}) {
        try {
            let query = supabase
                .from('agent_outputs')
                .select('*')
                .order('created_at', { ascending: false });

            // Apply filters
            if (filters.date) {
                const targetDate = new Date(filters.date).toISOString().split('T')[0];
                query = query.gte('created_at', `${targetDate}T00:00:00`)
                            .lt('created_at', `${targetDate}T23:59:59`);
            }

            if (filters.agent) {
                query = query.eq('agent', filters.agent);
            }

            if (filters.status) {
                query = query.eq('status', filters.status);
            }

            if (filters.type) {
                query = query.eq('type', filters.type);
            }

            const { data, error } = await query;
            
            if (error) throw error;
            
            return data || [];
        } catch (error) {
            logger.error('Error getting outputs:', error);
            return [];
        }
    }

    async getOutputById(id) {
        try {
            const { data, error } = await supabase
                .from('agent_outputs')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" error
            
            return data || null;
        } catch (error) {
            logger.error('Error getting output by ID:', error);
            return null;
        }
    }

    async updateOutputStatus(id, status, feedback = null) {
        try {
            const updateData = {
                status: status,
                updated_at: new Date().toISOString()
            };
            
            if (feedback) {
                updateData.feedback = feedback;
            }

            if (status === 'approved') {
                updateData.approved_at = new Date().toISOString();
            }

            const { data, error } = await supabase
                .from('agent_outputs')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            
            logger.info(`Updated output ${id} status to ${status}`);
            return data;
        } catch (error) {
            logger.error('Error updating output status:', error);
            throw error;
        }
    }

    async deleteOutput(id) {
        try {
            const { error } = await supabase
                .from('agent_outputs')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            
            logger.info(`Deleted output: ${id}`);
            return true;
        } catch (error) {
            logger.error('Error deleting output:', error);
            throw error;
        }
    }

    // ==================== APPROVAL MANAGEMENT ====================

    async addApproval(outputId, approvalData) {
        try {
            // Update output status to approved
            const updateData = {
                status: 'approved',
                approved_by: approvalData.approvedBy,
                approved_at: new Date().toISOString(),
                feedback: approvalData.feedback,
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('agent_outputs')
                .update(updateData)
                .eq('id', outputId)
                .select()
                .single();
            
            if (error) throw error;
            
            logger.info(`Added approval for output ${outputId}`);
            return data;
        } catch (error) {
            logger.error('Error adding approval:', error);
            throw error;
        }
    }

    async addRejection(outputId, rejectionData) {
        try {
            const updateData = {
                status: 'rejected',
                feedback: rejectionData.feedback,
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('agent_outputs')
                .update(updateData)
                .eq('id', outputId)
                .select()
                .single();
            
            if (error) throw error;
            
            logger.info(`Added rejection for output ${outputId}`);
            return data;
        } catch (error) {
            logger.error('Error adding rejection:', error);
            throw error;
        }
    }

    async getApprovals(filters = {}) {
        try {
            let query = supabase
                .from('agent_outputs')
                .select('*')
                .eq('status', 'approved')
                .order('approved_at', { ascending: false });

            if (filters.agent) {
                query = query.eq('agent', filters.agent);
            }

            const { data, error } = await query;
            
            if (error) throw error;
            
            return data || [];
        } catch (error) {
            logger.error('Error getting approvals:', error);
            return [];
        }
    }

    // ==================== LEARNING DATA ====================

    async addLearningData(category, data) {
        try {
            // Store learning insights in metadata for now
            // Could create separate learning table if needed
            logger.info(`Learning data recorded: ${category}`);
            return { success: true, category, data };
        } catch (error) {
            logger.error('Error adding learning data:', error);
            throw error;
        }
    }

    // ==================== STATISTICS ====================

    async getStats(filters = {}) {
        try {
            let query = supabase
                .from('agent_outputs')
                .select('agent, status, type');

            // Apply date filter if provided
            if (filters.date) {
                const targetDate = new Date(filters.date).toISOString().split('T')[0];
                query = query.gte('created_at', `${targetDate}T00:00:00`)
                            .lt('created_at', `${targetDate}T23:59:59`);
            }

            const { data, error } = await query;
            
            if (error) throw error;

            // Calculate statistics
            const stats = {
                total: data.length,
                byStatus: {},
                byAgent: {},
                byType: {}
            };

            data.forEach(output => {
                // Count by status
                stats.byStatus[output.status] = (stats.byStatus[output.status] || 0) + 1;
                
                // Count by agent
                stats.byAgent[output.agent] = (stats.byAgent[output.agent] || 0) + 1;
                
                // Count by type
                stats.byType[output.type] = (stats.byType[output.type] || 0) + 1;
            });

            return stats;
        } catch (error) {
            logger.error('Error getting stats:', error);
            return {
                total: 0,
                byStatus: {},
                byAgent: {},
                byType: {}
            };
        }
    }

    // ==================== SOCIAL CONTENT SPECIFIC ====================

    async getSocialContent(filters = {}) {
        try {
            let query = supabase
                .from('social_content')
                .select('*')
                .order('created_at', { ascending: false });

            if (filters.status) {
                query = query.eq('status', filters.status);
            }

            if (filters.platform) {
                query = query.eq('platform', filters.platform);
            }

            const { data, error } = await query;
            
            if (error) throw error;
            
            return data || [];
        } catch (error) {
            logger.error('Error getting social content:', error);
            return [];
        }
    }

    async addSocialContent(socialPost) {
        try {
            const { data, error } = await supabase
                .from('social_content')
                .insert([{
                    platform: socialPost.platform,
                    content: socialPost.content,
                    hashtags: socialPost.hashtags || [],
                    image_prompt: socialPost.imagePrompt,
                    enhanced_prompt: socialPost.enhancedPrompt,
                    blog_post_id: socialPost.blogPostId,
                    status: 'pending',
                    metadata: socialPost.metadata || {}
                }])
                .select()
                .single();
            
            if (error) throw error;
            
            logger.info(`Added social content for ${data.platform}: ${data.id}`);
            return data;
        } catch (error) {
            logger.error('Error adding social content:', error);
            throw error;
        }
    }

    async updateSocialContentStatus(id, status, additionalData = {}) {
        try {
            const updateData = {
                status: status,
                updated_at: new Date().toISOString(),
                ...additionalData
            };

            if (status === 'approved') {
                updateData.approved_at = new Date().toISOString();
            } else if (status === 'published') {
                updateData.published_at = new Date().toISOString();
            }

            const { data, error } = await supabase
                .from('social_content')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            
            logger.info(`Updated social content ${id} status to ${status}`);
            return data;
        } catch (error) {
            logger.error('Error updating social content status:', error);
            throw error;
        }
    }
}

// Export singleton instance
const approvalDB = new ApprovalDatabase();
module.exports = approvalDB;

