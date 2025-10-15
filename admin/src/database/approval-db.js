const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

class ApprovalDatabase {
    constructor() {
        this.dataDir = path.join(process.cwd(), 'data', 'approvals');
        this.outputsFile = path.join(this.dataDir, 'outputs.json');
        this.approvalsFile = path.join(this.dataDir, 'approvals.json');
        this.learningFile = path.join(this.dataDir, 'learning.json');
        this.init();
    }

    async init() {
        try {
            await fs.mkdir(this.dataDir, { recursive: true });
            
            // Initialize files if they don't exist
            await this.ensureFile(this.outputsFile, []);
            await this.ensureFile(this.approvalsFile, []);
            await this.ensureFile(this.learningFile, {
                feedback: [],
                patterns: {},
                improvements: []
            });
            
            logger.info('Approval database initialized');
        } catch (error) {
            logger.error('Error initializing approval database:', error);
        }
    }

    async ensureFile(filePath, defaultData) {
        try {
            await fs.access(filePath);
        } catch {
            await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
        }
    }

    async readFile(filePath) {
        try {
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            logger.error(`Error reading file ${filePath}:`, error);
            return null;
        }
    }

    async writeFile(filePath, data) {
        try {
            await fs.writeFile(filePath, JSON.stringify(data, null, 2));
            return true;
        } catch (error) {
            logger.error(`Error writing file ${filePath}:`, error);
            return false;
        }
    }

    // Agent Output Management
    async addOutput(output) {
        try {
            const outputs = await this.readFile(this.outputsFile) || [];
            
            const newOutput = {
                id: this.generateId(),
                ...output,
                status: 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            outputs.push(newOutput);
            await this.writeFile(this.outputsFile, outputs);
            
            logger.info(`Added new output: ${newOutput.id} from ${newOutput.agent}`);
            return newOutput;
        } catch (error) {
            logger.error('Error adding output:', error);
            throw error;
        }
    }

    async getOutputs(filters = {}) {
        try {
            const outputs = await this.readFile(this.outputsFile) || [];
            let filtered = outputs;

            // Apply filters
            if (filters.date) {
                const targetDate = new Date(filters.date);
                filtered = filtered.filter(output => {
                    const outputDate = new Date(output.createdAt);
                    return outputDate.toDateString() === targetDate.toDateString();
                });
            }

            if (filters.agent) {
                filtered = filtered.filter(output => output.agent === filters.agent);
            }

            if (filters.status) {
                filtered = filtered.filter(output => output.status === filters.status);
            }

            if (filters.type) {
                filtered = filtered.filter(output => output.type === filters.type);
            }

            // Sort by creation date (newest first)
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            return filtered;
        } catch (error) {
            logger.error('Error getting outputs:', error);
            return [];
        }
    }

    async getOutputById(id) {
        try {
            const outputs = await this.readFile(this.outputsFile) || [];
            return outputs.find(output => output.id === id);
        } catch (error) {
            logger.error('Error getting output by ID:', error);
            return null;
        }
    }

    async updateOutputStatus(id, status, feedback = null) {
        try {
            const outputs = await this.readFile(this.outputsFile) || [];
            const outputIndex = outputs.findIndex(output => output.id === id);
            
            if (outputIndex === -1) {
                throw new Error('Output not found');
            }

            outputs[outputIndex].status = status;
            outputs[outputIndex].updatedAt = new Date().toISOString();
            
            if (feedback) {
                outputs[outputIndex].feedback = feedback;
            }

            await this.writeFile(this.outputsFile, outputs);
            
            logger.info(`Updated output ${id} status to ${status}`);
            return outputs[outputIndex];
        } catch (error) {
            logger.error('Error updating output status:', error);
            throw error;
        }
    }

    // Approval Management
    async addApproval(outputId, approvalData) {
        try {
            const approvals = await this.readFile(this.approvalsFile) || [];
            
            const approval = {
                id: this.generateId(),
                outputId,
                ...approvalData,
                createdAt: new Date().toISOString()
            };
            
            approvals.push(approval);
            await this.writeFile(this.approvalsFile, approvals);
            
            // Update output status
            await this.updateOutputStatus(outputId, 'approved', approvalData.feedback);
            
            // Add to learning data if feedback provided
            if (approvalData.feedback) {
                await this.addLearningData('feedback', {
                    type: 'approval',
                    outputId,
                    agent: approvalData.agent,
                    feedback: approvalData.feedback,
                    outputType: approvalData.outputType
                });
            }
            
            logger.info(`Added approval for output ${outputId}`);
            return approval;
        } catch (error) {
            logger.error('Error adding approval:', error);
            throw error;
        }
    }

    async addRejection(outputId, rejectionData) {
        try {
            const approvals = await this.readFile(this.approvalsFile) || [];
            
            const rejection = {
                id: this.generateId(),
                outputId,
                ...rejectionData,
                createdAt: new Date().toISOString()
            };
            
            approvals.push(rejection);
            await this.writeFile(this.approvalsFile, approvals);
            
            // Update output status
            await this.updateOutputStatus(outputId, 'rejected', rejectionData.feedback);
            
            // Add to learning data
            await this.addLearningData('feedback', {
                type: 'rejection',
                outputId,
                agent: rejectionData.agent,
                reason: rejectionData.reason,
                feedback: rejectionData.feedback,
                outputType: rejectionData.outputType
            });
            
            logger.info(`Added rejection for output ${outputId}`);
            return rejection;
        } catch (error) {
            logger.error('Error adding rejection:', error);
            throw error;
        }
    }

    async getApprovalHistory(filters = {}) {
        try {
            const approvals = await this.readFile(this.approvalsFile) || [];
            let filtered = approvals;

            if (filters.agent) {
                filtered = filtered.filter(approval => approval.agent === filters.agent);
            }

            if (filters.type) {
                filtered = filtered.filter(approval => approval.type === filters.type);
            }

            // Sort by creation date (newest first)
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            return filtered;
        } catch (error) {
            logger.error('Error getting approval history:', error);
            return [];
        }
    }

    // Learning System
    async addLearningData(type, data) {
        try {
            const learning = await this.readFile(this.learningFile) || { feedback: [], patterns: {}, improvements: [] };
            
            switch (type) {
                case 'feedback':
                    learning.feedback.push({
                        id: this.generateId(),
                        ...data,
                        createdAt: new Date().toISOString()
                    });
                    break;
                    
                case 'pattern':
                    if (!learning.patterns[data.agent]) {
                        learning.patterns[data.agent] = [];
                    }
                    learning.patterns[data.agent].push({
                        id: this.generateId(),
                        ...data,
                        createdAt: new Date().toISOString()
                    });
                    break;
                    
                case 'improvement':
                    learning.improvements.push({
                        id: this.generateId(),
                        ...data,
                        createdAt: new Date().toISOString()
                    });
                    break;
            }
            
            await this.writeFile(this.learningFile, learning);
            logger.info(`Added learning data: ${type}`);
        } catch (error) {
            logger.error('Error adding learning data:', error);
        }
    }

    async getLearningData(agent = null) {
        try {
            const learning = await this.readFile(this.learningFile) || { feedback: [], patterns: {}, improvements: [] };
            
            if (agent) {
                return {
                    feedback: learning.feedback.filter(f => f.agent === agent),
                    patterns: learning.patterns[agent] || [],
                    improvements: learning.improvements.filter(i => i.agent === agent)
                };
            }
            
            return learning;
        } catch (error) {
            logger.error('Error getting learning data:', error);
            return { feedback: [], patterns: {}, improvements: [] };
        }
    }

    async getAgentImprovements(agent) {
        try {
            const learning = await this.getLearningData(agent);
            
            // Analyze feedback to generate improvements
            const improvements = [];
            const feedback = learning.feedback;
            
            // Group feedback by type
            const approvalFeedback = feedback.filter(f => f.type === 'approval');
            const rejectionFeedback = feedback.filter(f => f.type === 'rejection');
            
            // Analyze rejection patterns
            const rejectionReasons = rejectionFeedback.map(f => f.reason).filter(Boolean);
            const commonReasons = this.getCommonPatterns(rejectionReasons);
            
            // Generate improvement suggestions
            if (commonReasons.length > 0) {
                improvements.push({
                    type: 'rejection_pattern',
                    description: `Common rejection reasons: ${commonReasons.join(', ')}`,
                    suggestions: this.generateSuggestions(commonReasons)
                });
            }
            
            // Analyze approval patterns
            const positiveFeedback = approvalFeedback.map(f => f.feedback).filter(Boolean);
            if (positiveFeedback.length > 0) {
                improvements.push({
                    type: 'success_pattern',
                    description: 'Successful patterns identified',
                    suggestions: ['Continue using these successful approaches']
                });
            }
            
            return improvements;
        } catch (error) {
            logger.error('Error getting agent improvements:', error);
            return [];
        }
    }

    getCommonPatterns(items, threshold = 2) {
        const counts = {};
        items.forEach(item => {
            counts[item] = (counts[item] || 0) + 1;
        });
        
        return Object.entries(counts)
            .filter(([_, count]) => count >= threshold)
            .sort((a, b) => b[1] - a[1])
            .map(([item, _]) => item);
    }

    generateSuggestions(reasons) {
        const suggestions = [];
        
        reasons.forEach(reason => {
            const lowerReason = reason.toLowerCase();
            
            if (lowerReason.includes('tone') || lowerReason.includes('voice')) {
                suggestions.push('Review and adjust tone to match brand voice guidelines');
            }
            
            if (lowerReason.includes('length') || lowerReason.includes('too long') || lowerReason.includes('too short')) {
                suggestions.push('Adjust content length based on platform and audience requirements');
            }
            
            if (lowerReason.includes('specific') || lowerReason.includes('generic')) {
                suggestions.push('Make content more specific to the target audience and business context');
            }
            
            if (lowerReason.includes('call to action') || lowerReason.includes('cta')) {
                suggestions.push('Include clear, compelling calls to action');
            }
            
            if (lowerReason.includes('grammar') || lowerReason.includes('spelling')) {
                suggestions.push('Review grammar and spelling before submission');
            }
        });
        
        return suggestions.length > 0 ? suggestions : ['Review feedback carefully and adjust approach accordingly'];
    }

    // Utility methods
    generateId() {
        return 'output_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async getStats(filters = {}) {
        try {
            const outputs = await this.getOutputs(filters);
            
            const stats = {
                total: outputs.length,
                pending: outputs.filter(o => o.status === 'pending').length,
                approved: outputs.filter(o => o.status === 'approved').length,
                rejected: outputs.filter(o => o.status === 'rejected').length
            };
            
            return stats;
        } catch (error) {
            logger.error('Error getting stats:', error);
            return { total: 0, pending: 0, approved: 0, rejected: 0 };
        }
    }

    // Auto-discovery of agent outputs from files
    async discoverOutputs() {
        try {
            const projectRoot = process.cwd();
            const files = await this.scanForOutputFiles(projectRoot);
            
            for (const file of files) {
                await this.processOutputFile(file);
            }
            
            logger.info(`Discovered ${files.length} potential output files`);
        } catch (error) {
            logger.error('Error discovering outputs:', error);
        }
    }

    async scanForOutputFiles(dir, maxDepth = 3, currentDepth = 0) {
        if (currentDepth > maxDepth) return [];
        
        try {
            const items = await fs.readdir(dir);
            const files = [];
            
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = await fs.stat(fullPath);
                
                if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                    const subFiles = await this.scanForOutputFiles(fullPath, maxDepth, currentDepth + 1);
                    files.push(...subFiles);
                } else if (stat.isFile() && this.isOutputFile(item)) {
                    files.push(fullPath);
                }
            }
            
            return files;
        } catch (error) {
            logger.error(`Error scanning directory ${dir}:`, error);
            return [];
        }
    }

    isOutputFile(filename) {
        const outputPatterns = [
            /outreach-campaign.*\.json$/,
            /comprehensive-analysis.*\.json$/,
            /market-overview.*\.json$/,
            /lead-quality.*\.json$/,
            /geographic-analysis.*\.json$/,
            /business-type-analysis.*\.json$/,
            /cmo-executive-dashboard.*\.json$/,
            /seo-performance.*\.json$/,
            /trend-analysis.*\.json$/,
            /roi-analysis.*\.json$/,
            /competitive-landscape.*\.json$/
        ];
        
        return outputPatterns.some(pattern => pattern.test(filename));
    }

    async processOutputFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            const data = JSON.parse(content);
            
            // Determine agent and type from filename and content
            const filename = path.basename(filePath);
            const agent = this.determineAgent(filename, data);
            const type = this.determineType(filename, data);
            const title = this.generateTitle(filename, data);
            
            // Check if this output is already in our database
            const outputs = await this.readFile(this.outputsFile) || [];
            const existing = outputs.find(o => o.filePath === filePath);
            
            if (!existing) {
                await this.addOutput({
                    agent,
                    type,
                    title,
                    content: data,
                    filePath,
                    priority: this.determinePriority(type, agent)
                });
            }
        } catch (error) {
            logger.error(`Error processing output file ${filePath}:`, error);
        }
    }

    determineAgent(filename, data) {
        if (filename.includes('cmo-executive')) return 'cmo-brain';
        if (filename.includes('outreach-campaign')) return 'lead-sales-agent';
        if (filename.includes('comprehensive-analysis') || filename.includes('market-overview')) return 'data-analyst';
        if (filename.includes('seo-performance')) return 'market-researcher';
        if (filename.includes('trend-analysis') || filename.includes('competitive-landscape')) return 'market-researcher';
        if (filename.includes('roi-analysis')) return 'data-analyst';
        
        // Fallback based on content structure
        if (data.executiveSummary) return 'cmo-brain';
        if (data.campaigns || data.outreach) return 'lead-sales-agent';
        if (data.analysis || data.insights) return 'data-analyst';
        
        return 'unknown';
    }

    determineType(filename, data) {
        if (filename.includes('campaign')) return 'campaign';
        if (filename.includes('analysis') || filename.includes('report')) return 'analysis';
        if (filename.includes('dashboard')) return 'strategy';
        if (filename.includes('performance')) return 'report';
        
        // Fallback based on content structure
        if (data.campaigns) return 'campaign';
        if (data.analysis || data.insights) return 'analysis';
        if (data.strategy || data.recommendations) return 'strategy';
        
        return 'report';
    }

    generateTitle(filename, data) {
        // Try to extract title from data first
        if (data.title) return data.title;
        if (data.executiveSummary?.overview) return data.executiveSummary.overview;
        
        // Generate from filename
        const cleanName = filename.replace(/\.json$/, '').replace(/[-_]/g, ' ');
        return cleanName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    determinePriority(type, agent) {
        const priorityMap = {
            'campaign': 'high',
            'strategy': 'high',
            'analysis': 'medium',
            'report': 'medium',
            'content': 'low'
        };
        
        return priorityMap[type] || 'medium';
    }
}

module.exports = new ApprovalDatabase(); 