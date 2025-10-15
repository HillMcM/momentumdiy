const approvalDB = require('../database/approval-db');
const logger = require('./logger');

class LearningSystem {
    constructor() {
        this.improvementPatterns = new Map();
        this.feedbackHistory = [];
    }

    // Get learning context for an agent
    async getLearningContext(agentName) {
        try {
            const learningData = await approvalDB.getLearningData(agentName);
            const improvements = await approvalDB.getAgentImprovements(agentName);
            
            return {
                feedback: learningData.feedback || [],
                improvements: improvements || [],
                patterns: learningData.patterns || {},
                context: this.generateLearningContext(agentName, learningData, improvements)
            };
        } catch (error) {
            logger.error(`Error getting learning context for ${agentName}:`, error);
            return {
                feedback: [],
                improvements: [],
                patterns: {},
                context: ''
            };
        }
    }

    // Generate learning context for agents
    generateLearningContext(agentName, learningData, improvements) {
        let context = `\n\nLEARNING CONTEXT FOR ${agentName.toUpperCase()}:\n`;
        
        // Add recent feedback
        const recentFeedback = learningData.feedback?.slice(-5) || [];
        if (recentFeedback.length > 0) {
            context += '\nRECENT FEEDBACK:\n';
            recentFeedback.forEach(feedback => {
                if (feedback.type === 'rejection') {
                    context += `❌ REJECTED: ${feedback.reason}\n`;
                    if (feedback.feedback) {
                        context += `   Feedback: ${feedback.feedback}\n`;
                    }
                } else if (feedback.type === 'approval') {
                    context += `✅ APPROVED`;
                    if (feedback.feedback) {
                        context += `: ${feedback.feedback}\n`;
                    } else {
                        context += '\n';
                    }
                }
            });
        }

        // Add improvement suggestions
        if (improvements.length > 0) {
            context += '\nIMPROVEMENT SUGGESTIONS:\n';
            improvements.forEach(improvement => {
                context += `• ${improvement.description}\n`;
                if (improvement.suggestions) {
                    improvement.suggestions.forEach(suggestion => {
                        context += `  - ${suggestion}\n`;
                    });
                }
            });
        }

        // Add specific instructions based on agent type
        context += this.getAgentSpecificInstructions(agentName, learningData);
        
        return context;
    }

    // Get agent-specific learning instructions
    getAgentSpecificInstructions(agentName, learningData) {
        let instructions = '\nAGENT-SPECIFIC INSTRUCTIONS:\n';
        
        switch (agentName) {
            case 'copywriting-agent':
                instructions += this.getCopywritingInstructions(learningData);
                break;
            case 'lead-sales-agent':
                instructions += this.getSalesInstructions(learningData);
                break;
            case 'data-analyst':
                instructions += this.getDataAnalystInstructions(learningData);
                break;
            case 'cmo-brain':
                instructions += this.getCMOInstructions(learningData);
                break;
            case 'market-researcher':
                instructions += this.getMarketResearcherInstructions(learningData);
                break;
            case 'social-content-agent':
                instructions += this.getSocialContentInstructions(learningData);
                break;
            default:
                instructions += '• Focus on quality and relevance\n';
                instructions += '• Ensure all outputs meet business objectives\n';
        }
        
        return instructions;
    }

    getCopywritingInstructions(learningData) {
        let instructions = '';
        
        // Analyze feedback for common patterns
        const feedback = learningData.feedback || [];
        const rejections = feedback.filter(f => f.type === 'rejection');
        const approvals = feedback.filter(f => f.type === 'approval');
        
        if (rejections.length > 0) {
            const reasons = rejections.map(r => r.reason?.toLowerCase() || '');
            
            if (reasons.some(r => r.includes('tone'))) {
                instructions += '• Maintain professional yet approachable tone\n';
            }
            if (reasons.some(r => r.includes('length'))) {
                instructions += '• Keep content concise and focused\n';
            }
            if (reasons.some(r => r.includes('specific'))) {
                instructions += '• Make content specific to local business context\n';
            }
            if (reasons.some(r => r.includes('call to action'))) {
                instructions += '• Include clear, compelling calls to action\n';
            }
        }
        
        if (approvals.length > 0) {
            instructions += '• Continue using successful approaches from approved content\n';
        }
        
        instructions += '• Focus on local business pain points and solutions\n';
        instructions += '• Use conversational, benefit-focused language\n';
        instructions += '• Include specific examples relevant to target industries\n';
        
        return instructions;
    }

    getSalesInstructions(learningData) {
        let instructions = '';
        
        const feedback = learningData.feedback || [];
        const rejections = feedback.filter(f => f.type === 'rejection');
        
        if (rejections.length > 0) {
            const reasons = rejections.map(r => r.reason?.toLowerCase() || '');
            
            if (reasons.some(r => r.includes('generic'))) {
                instructions += '• Personalize outreach based on business type and location\n';
            }
            if (reasons.some(r => r.includes('aggressive'))) {
                instructions += '• Use consultative, helpful approach rather than salesy\n';
            }
            if (reasons.some(r => r.includes('value'))) {
                instructions += '• Clearly articulate specific value propositions\n';
            }
        }
        
        instructions += '• Research each business before creating outreach\n';
        instructions += '• Focus on marketing clarity benefits relevant to their industry\n';
        instructions += '• Include social proof and specific ROI examples\n';
        instructions += '• Make calls-to-action specific and time-sensitive\n';
        
        return instructions;
    }

    getDataAnalystInstructions(learningData) {
        let instructions = '';
        
        const feedback = learningData.feedback || [];
        const rejections = feedback.filter(f => f.type === 'rejection');
        
        if (rejections.length > 0) {
            const reasons = rejections.map(r => r.reason?.toLowerCase() || '');
            
            if (reasons.some(r => r.includes('insight'))) {
                instructions += '• Provide actionable insights, not just data\n';
            }
            if (reasons.some(r => r.includes('context'))) {
                instructions += '• Add business context to all findings\n';
            }
            if (reasons.some(r => r.includes('recommendation'))) {
                instructions += '• Include specific recommendations based on data\n';
            }
        }
        
        instructions += '• Focus on insights that drive business decisions\n';
        instructions += '• Present data in clear, visual formats when possible\n';
        instructions += '• Connect findings to specific business opportunities\n';
        instructions += '• Prioritize quality over quantity in analysis\n';
        
        return instructions;
    }

    getCMOInstructions(learningData) {
        let instructions = '';
        
        instructions += '• Focus on strategic, high-level insights\n';
        instructions += '• Connect all recommendations to business growth\n';
        instructions += '• Prioritize initiatives by potential ROI\n';
        instructions += '• Consider market trends and competitive landscape\n';
        instructions += '• Ensure all strategies align with business objectives\n';
        
        return instructions;
    }

    getMarketResearcherInstructions(learningData) {
        let instructions = '';
        
        instructions += '• Focus on actionable market intelligence\n';
        instructions += '• Identify specific opportunities for local businesses\n';
        instructions += '• Provide competitive analysis with clear insights\n';
        instructions += '• Connect trends to business applications\n';
        instructions += '• Prioritize local market dynamics\n';
        
        return instructions;
    }

    getSocialContentInstructions(learningData) {
        let instructions = '';
        
        const feedback = learningData.feedback || [];
        const rejections = feedback.filter(f => f.type === 'rejection');
        
        if (rejections.length > 0) {
            const reasons = rejections.map(r => r.reason?.toLowerCase() || '');
            
            if (reasons.some(r => r.includes('platform'))) {
                instructions += '• Tailor content to specific platform requirements\n';
            }
            if (reasons.some(r => r.includes('engagement'))) {
                instructions += '• Focus on content that drives engagement\n';
            }
            if (reasons.some(r => r.includes('brand'))) {
                instructions += '• Maintain consistent brand voice across platforms\n';
            }
        }
        
        instructions += '• Create platform-specific content strategies\n';
        instructions += '• Focus on visual and interactive elements\n';
        instructions += '• Include relevant hashtags and mentions\n';
        instructions += '• Optimize for each platform\'s algorithm\n';
        
        return instructions;
    }

    // Add feedback to learning system
    async addFeedback(feedback) {
        try {
            await approvalDB.addLearningData('feedback', feedback);
            this.feedbackHistory.push(feedback);
            
            // Update improvement patterns
            this.updateImprovementPatterns(feedback);
            
            logger.info(`Added feedback for ${feedback.agent}: ${feedback.type}`);
        } catch (error) {
            logger.error('Error adding feedback to learning system:', error);
        }
    }

    // Update improvement patterns based on feedback
    updateImprovementPatterns(feedback) {
        const agent = feedback.agent;
        
        if (!this.improvementPatterns.has(agent)) {
            this.improvementPatterns.set(agent, {
                rejections: [],
                approvals: [],
                commonIssues: new Map()
            });
        }
        
        const patterns = this.improvementPatterns.get(agent);
        
        if (feedback.type === 'rejection') {
            patterns.rejections.push(feedback);
            
            // Track common rejection reasons
            if (feedback.reason) {
                const reason = feedback.reason.toLowerCase();
                patterns.commonIssues.set(reason, (patterns.commonIssues.get(reason) || 0) + 1);
            }
        } else if (feedback.type === 'approval') {
            patterns.approvals.push(feedback);
        }
    }

    // Get improvement suggestions for an agent
    async getImprovementSuggestions(agentName) {
        try {
            const improvements = await approvalDB.getAgentImprovements(agentName);
            const patterns = this.improvementPatterns.get(agentName);
            
            let suggestions = [];
            
            // Add database-generated improvements
            suggestions.push(...improvements);
            
            // Add pattern-based suggestions
            if (patterns) {
                const commonIssues = Array.from(patterns.commonIssues.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3);
                
                if (commonIssues.length > 0) {
                    suggestions.push({
                        type: 'pattern_analysis',
                        description: 'Common issues identified',
                        suggestions: commonIssues.map(([issue, count]) => 
                            `Address "${issue}" (occurred ${count} times)`
                        )
                    });
                }
            }
            
            return suggestions;
        } catch (error) {
            logger.error(`Error getting improvement suggestions for ${agentName}:`, error);
            return [];
        }
    }

    // Generate a learning prompt for agents
    async generateLearningPrompt(agentName, taskType) {
        try {
            const context = await this.getLearningContext(agentName);
            const suggestions = await this.getImprovementSuggestions(agentName);
            
            let prompt = `\n\nIMPORTANT: Use the following learning context to improve your output:\n`;
            prompt += context.context;
            
            if (suggestions.length > 0) {
                prompt += '\nSPECIFIC IMPROVEMENTS TO APPLY:\n';
                suggestions.forEach(suggestion => {
                    prompt += `• ${suggestion.description}\n`;
                    if (suggestion.suggestions) {
                        suggestion.suggestions.forEach(s => {
                            prompt += `  - ${s}\n`;
                        });
                    }
                });
            }
            
            prompt += `\nTASK TYPE: ${taskType}\n`;
            prompt += 'Remember to apply these learnings to create better, more effective outputs.\n';
            
            return prompt;
        } catch (error) {
            logger.error(`Error generating learning prompt for ${agentName}:`, error);
            return '';
        }
    }

    // Get performance metrics for an agent
    async getAgentPerformance(agentName, timeframe = '30d') {
        try {
            const learningData = await approvalDB.getLearningData(agentName);
            const feedback = learningData.feedback || [];
            
            const now = new Date();
            const cutoff = new Date(now.getTime() - (this.getTimeframeDays(timeframe) * 24 * 60 * 60 * 1000));
            
            const recentFeedback = feedback.filter(f => new Date(f.createdAt) > cutoff);
            
            const approvals = recentFeedback.filter(f => f.type === 'approval').length;
            const rejections = recentFeedback.filter(f => f.type === 'rejection').length;
            const total = recentFeedback.length;
            
            return {
                agent: agentName,
                timeframe,
                totalOutputs: total,
                approvals,
                rejections,
                approvalRate: total > 0 ? (approvals / total * 100).toFixed(1) : 0,
                commonRejectionReasons: this.getCommonRejectionReasons(recentFeedback),
                improvementTrend: this.calculateImprovementTrend(feedback)
            };
        } catch (error) {
            logger.error(`Error getting performance for ${agentName}:`, error);
            return {
                agent: agentName,
                timeframe,
                totalOutputs: 0,
                approvals: 0,
                rejections: 0,
                approvalRate: 0,
                commonRejectionReasons: [],
                improvementTrend: 'stable'
            };
        }
    }

    getTimeframeDays(timeframe) {
        const timeframes = {
            '7d': 7,
            '30d': 30,
            '90d': 90,
            '180d': 180
        };
        return timeframes[timeframe] || 30;
    }

    getCommonRejectionReasons(feedback) {
        const reasons = feedback
            .filter(f => f.type === 'rejection' && f.reason)
            .map(f => f.reason);
        
        const counts = {};
        reasons.forEach(reason => {
            counts[reason] = (counts[reason] || 0) + 1;
        });
        
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([reason, count]) => ({ reason, count }));
    }

    calculateImprovementTrend(feedback) {
        if (feedback.length < 10) return 'insufficient_data';
        
        // Split feedback into two halves and compare approval rates
        const midPoint = Math.floor(feedback.length / 2);
        const firstHalf = feedback.slice(0, midPoint);
        const secondHalf = feedback.slice(midPoint);
        
        const firstRate = firstHalf.filter(f => f.type === 'approval').length / firstHalf.length;
        const secondRate = secondHalf.filter(f => f.type === 'approval').length / secondHalf.length;
        
        if (secondRate > firstRate + 0.1) return 'improving';
        if (secondRate < firstRate - 0.1) return 'declining';
        return 'stable';
    }
}

module.exports = new LearningSystem(); 