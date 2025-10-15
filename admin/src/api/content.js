const express = require('express');
const multer = require('multer');
const path = require('path');
const ContentManager = require('../utils/content-manager');
const logger = require('../utils/logger');

const router = express.Router();
const contentManager = new ContentManager();

// Simple rate limiting
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // 30 requests per minute

const rateLimitMiddleware = (req, res, next) => {
  const clientId = req.ip || 'unknown';
  const now = Date.now();
  
  if (!requestCounts.has(clientId)) {
    requestCounts.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
  } else {
    const clientData = requestCounts.get(clientId);
    if (now > clientData.resetTime) {
      clientData.count = 1;
      clientData.resetTime = now + RATE_LIMIT_WINDOW;
    } else {
      clientData.count++;
    }
    
    if (clientData.count > MAX_REQUESTS_PER_WINDOW) {
      return res.status(429).json({ 
        error: 'Too many requests',
        message: 'Please wait before making more requests'
      });
    }
  }
  
  next();
};

// Apply rate limiting to all routes
router.use(rateLimitMiddleware);

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = [
      // Images
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      // Videos
      'video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm',
      // Audio
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac',
      // Documents
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'text/markdown'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported'), false);
    }
  }
});

// Upload content
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const metadata = {
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
      description: req.body.description || '',
      category: req.body.category || 'general',
      brandRelevance: req.body.brandRelevance || 'medium',
      platform: req.body.platform || 'all',
      campaign: req.body.campaign || null
    };

    const result = await contentManager.uploadContent(req.file, metadata);
    
    if (result.success) {
      logger.info(`Content uploaded successfully: ${result.fileId}`);
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    logger.error('Content upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all content with optional filters
router.get('/', async (req, res) => {
  try {
    const filters = {
      contentType: req.query.contentType,
      category: req.query.category,
      tags: req.query.tags ? req.query.tags.split(',') : undefined,
      brandRelevance: req.query.brandRelevance
    };

    const content = await contentManager.getAllContent(filters);
    res.json({ content, total: content.length });
  } catch (error) {
    logger.error('Error getting content:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search content
router.get('/search', async (req, res) => {
  try {
    const { q: query, ...filters } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const results = await contentManager.searchContent(query, filters);
    res.json({ results, total: results.length, query });
  } catch (error) {
    logger.error('Content search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get content by ID
router.get('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const content = await contentManager.getContentById(fileId);
    
    if (content) {
      res.json({ content });
    } else {
      res.status(404).json({ error: 'Content not found' });
    }
  } catch (error) {
    logger.error('Error getting content by ID:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get content recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const context = {
      platform: req.query.platform,
      campaign: req.query.campaign,
      contentType: req.query.contentType,
      tags: req.query.tags ? req.query.tags.split(',') : undefined
    };

    const recommendations = await contentManager.getContentRecommendations(context);
    res.json({ recommendations });
  } catch (error) {
    logger.error('Error getting content recommendations:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get content for social media
router.get('/social-media/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    const { contentType, limit } = req.query;
    
    const content = await contentManager.getContentForSocialMedia(
      platform, 
      contentType || 'images', 
      parseInt(limit) || 5
    );
    
    res.json({ content, platform, total: content.length });
  } catch (error) {
    logger.error('Error getting social media content:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update content metadata
router.put('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const updates = req.body;
    
    const result = await contentManager.updateContentMetadata(fileId, updates);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    logger.error('Error updating content metadata:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark content as used
router.post('/:fileId/use', async (req, res) => {
  try {
    const { fileId } = req.params;
    const usage = req.body;
    
    await contentManager.markContentAsUsed(fileId, usage);
    res.json({ success: true, message: 'Content marked as used' });
  } catch (error) {
    logger.error('Error marking content as used:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete content
router.delete('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const result = await contentManager.deleteContent(fileId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    logger.error('Error deleting content:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get content statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await contentManager.getContentStats();
    res.json({ stats });
  } catch (error) {
    logger.error('Error getting content stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve uploaded files
router.get('/file/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const content = await contentManager.getContentById(fileId);
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(content.filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', content.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${content.originalName}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(content.filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    logger.error('Error serving file:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 