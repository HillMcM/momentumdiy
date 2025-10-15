const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');

class ContentManager {
  constructor() {
    this.contentDir = path.join(process.cwd(), 'uploads');
    this.contentIndex = new Map();
    this.contentMetadata = new Map();
    this.initializeContentDirectory();
  }

  async initializeContentDirectory() {
    try {
      await fs.mkdir(this.contentDir, { recursive: true });
      await fs.mkdir(path.join(this.contentDir, 'images'), { recursive: true });
      await fs.mkdir(path.join(this.contentDir, 'videos'), { recursive: true });
      await fs.mkdir(path.join(this.contentDir, 'documents'), { recursive: true });
      await fs.mkdir(path.join(this.contentDir, 'audio'), { recursive: true });
      
      // Load existing content metadata
      await this.loadContentMetadata();
      
      logger.info('Content Manager initialized with upload directories');
    } catch (error) {
      logger.error('Error initializing content directory:', error);
    }
  }

  async loadContentMetadata() {
    try {
      const metadataPath = path.join(this.contentDir, 'metadata.json');
      const metadataExists = await fs.access(metadataPath).then(() => true).catch(() => false);
      
      if (metadataExists) {
        const metadataContent = await fs.readFile(metadataPath, 'utf8');
        const metadata = JSON.parse(metadataContent);
        
        this.contentMetadata = new Map(Object.entries(metadata));
        logger.info(`Loaded ${this.contentMetadata.size} content items from metadata`);
      }
    } catch (error) {
      logger.error('Error loading content metadata:', error);
    }
  }

  async saveContentMetadata() {
    try {
      const metadataPath = path.join(this.contentDir, 'metadata.json');
      const metadataObject = Object.fromEntries(this.contentMetadata);
      await fs.writeFile(metadataPath, JSON.stringify(metadataObject, null, 2));
    } catch (error) {
      logger.error('Error saving content metadata:', error);
    }
  }

  async uploadContent(file, metadata = {}) {
    try {
      const fileId = this.generateFileId();
      const fileExtension = path.extname(file.originalname);
      const fileName = `${fileId}${fileExtension}`;
      
      // Determine content type and directory
      const contentType = this.determineContentType(file.mimetype, fileExtension);
      const uploadDir = path.join(this.contentDir, contentType);
      const filePath = path.join(uploadDir, fileName);
      
      // Save file
      await fs.writeFile(filePath, file.buffer);
      
      // Create metadata
      const contentMetadata = {
        id: fileId,
        originalName: file.originalname,
        fileName: fileName,
        filePath: filePath,
        contentType: contentType,
        mimeType: file.mimetype,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        tags: metadata.tags || [],
        description: metadata.description || '',
        category: metadata.category || 'general',
        brandRelevance: metadata.brandRelevance || 'medium',
        usageCount: 0,
        lastUsed: null,
        ...metadata
      };
      
      // Store metadata
      this.contentMetadata.set(fileId, contentMetadata);
      await this.saveContentMetadata();
      
      logger.info(`Content uploaded: ${fileId} (${contentType})`);
      
      return {
        success: true,
        fileId: fileId,
        metadata: contentMetadata
      };
      
    } catch (error) {
      logger.error('Error uploading content:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  determineContentType(mimeType, extension) {
    if (mimeType.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(extension.toLowerCase())) {
      return 'images';
    } else if (mimeType.startsWith('video/') || ['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(extension.toLowerCase())) {
      return 'videos';
    } else if (mimeType.startsWith('audio/') || ['.mp3', '.wav', '.m4a', '.aac'].includes(extension.toLowerCase())) {
      return 'audio';
    } else if (['.pdf', '.doc', '.docx', '.txt', '.md'].includes(extension.toLowerCase())) {
      return 'documents';
    } else {
      return 'documents';
    }
  }

  generateFileId() {
    return `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getContentById(fileId) {
    return this.contentMetadata.get(fileId);
  }

  async getAllContent(filters = {}) {
    let content = Array.from(this.contentMetadata.values());
    
    // Apply filters
    if (filters.contentType) {
      content = content.filter(item => item.contentType === filters.contentType);
    }
    
    if (filters.category) {
      content = content.filter(item => item.category === filters.category);
    }
    
    if (filters.tags && filters.tags.length > 0) {
      content = content.filter(item => 
        filters.tags.some(tag => item.tags.includes(tag))
      );
    }
    
    if (filters.brandRelevance) {
      content = content.filter(item => item.brandRelevance === filters.brandRelevance);
    }
    
    return content;
  }

  async searchContent(query, filters = {}) {
    const allContent = await this.getAllContent(filters);
    
    const searchTerms = query.toLowerCase().split(' ');
    
    return allContent.filter(item => {
      const searchableText = [
        item.originalName,
        item.description,
        item.category,
        ...item.tags
      ].join(' ').toLowerCase();
      
      return searchTerms.some(term => searchableText.includes(term));
    });
  }

  async getContentForSocialMedia(platform, contentType = 'images', limit = 5) {
    const filters = {
      contentType: contentType,
      brandRelevance: 'high'
    };
    
    let content = await this.getAllContent(filters);
    
    // Sort by relevance and recency
    content.sort((a, b) => {
      // Prioritize unused content
      if (a.usageCount === 0 && b.usageCount > 0) return -1;
      if (b.usageCount === 0 && a.usageCount > 0) return 1;
      
      // Then by upload date (newer first)
      return new Date(b.uploadedAt) - new Date(a.uploadedAt);
    });
    
    return content.slice(0, limit);
  }

  async markContentAsUsed(fileId, usage = {}) {
    const content = this.contentMetadata.get(fileId);
    if (content) {
      content.usageCount += 1;
      content.lastUsed = new Date().toISOString();
      content.lastUsage = usage;
      
      await this.saveContentMetadata();
      
      logger.info(`Content marked as used: ${fileId} (usage count: ${content.usageCount})`);
    }
  }

  async deleteContent(fileId) {
    try {
      const content = this.contentMetadata.get(fileId);
      if (content) {
        // Delete file
        await fs.unlink(content.filePath);
        
        // Remove from metadata
        this.contentMetadata.delete(fileId);
        await this.saveContentMetadata();
        
        logger.info(`Content deleted: ${fileId}`);
        
        return { success: true };
      } else {
        return { success: false, error: 'Content not found' };
      }
    } catch (error) {
      logger.error('Error deleting content:', error);
      return { success: false, error: error.message };
    }
  }

  async updateContentMetadata(fileId, updates) {
    const content = this.contentMetadata.get(fileId);
    if (content) {
      Object.assign(content, updates);
      await this.saveContentMetadata();
      
      logger.info(`Content metadata updated: ${fileId}`);
      return { success: true, metadata: content };
    } else {
      return { success: false, error: 'Content not found' };
    }
  }

  async getContentStats() {
    const allContent = Array.from(this.contentMetadata.values());
    
    const stats = {
      total: allContent.length,
      byType: {},
      byCategory: {},
      byBrandRelevance: {},
      recentlyUsed: 0,
      unused: 0
    };
    
    allContent.forEach(item => {
      // Count by type
      stats.byType[item.contentType] = (stats.byType[item.contentType] || 0) + 1;
      
      // Count by category
      stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
      
      // Count by brand relevance
      stats.byBrandRelevance[item.brandRelevance] = (stats.byBrandRelevance[item.brandRelevance] || 0) + 1;
      
      // Count usage
      if (item.usageCount === 0) {
        stats.unused += 1;
      } else if (item.lastUsed && new Date(item.lastUsed) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        stats.recentlyUsed += 1;
      }
    });
    
    return stats;
  }

  async getContentRecommendations(context = {}) {
    const { platform, campaign, contentType, tags } = context;
    
    let recommendations = await this.getAllContent({
      contentType: contentType || 'images',
      brandRelevance: 'high'
    });
    
    // Filter by tags if provided
    if (tags && tags.length > 0) {
      recommendations = recommendations.filter(item => 
        tags.some(tag => item.tags.includes(tag))
      );
    }
    
    // Sort by relevance
    recommendations.sort((a, b) => {
      // Prioritize unused content
      if (a.usageCount === 0 && b.usageCount > 0) return -1;
      if (b.usageCount === 0 && a.usageCount > 0) return 1;
      
      // Then by brand relevance
      const relevanceOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      const aRelevance = relevanceOrder[a.brandRelevance] || 1;
      const bRelevance = relevanceOrder[b.brandRelevance] || 1;
      
      if (aRelevance !== bRelevance) {
        return bRelevance - aRelevance;
      }
      
      // Finally by upload date
      return new Date(b.uploadedAt) - new Date(a.uploadedAt);
    });
    
    return recommendations.slice(0, 10);
  }
}

module.exports = ContentManager; 