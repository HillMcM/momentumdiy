const logger = require('../utils/logger');

class BufferNotificationIntegration {
  constructor() {
    this.name = 'Buffer Notification Integration';
    this.description = 'Sends notifications when content is ready for Buffer posting';
  }

  /**
   * Send notification that content is ready for Buffer
   * @param {Object} content - Content to post
   * @param {string} content.text - Post text
   * @param {Array} content.platforms - Platforms to post to
   * @param {string} content.scheduledTime - Optional scheduled time
   * @returns {Promise<Object>} Result of notification
   */
  async notifyContentReady(content) {
    try {
      logger.info('Sending Buffer content notification', { content });
      
      // Create notification message
      const notification = {
        title: '🤖 AI Content Ready for Buffer',
        message: this.formatContentForNotification(content),
        platforms: content.platforms || ['linkedin', 'twitter'],
        timestamp: new Date().toISOString(),
        actionUrl: 'https://buffer.com/app',
        priority: 'high'
      };

      // Log the notification (in production, this could send to Slack, email, etc.)
      console.log('\n' + '='.repeat(60));
      console.log('🚀 BUFFER CONTENT READY');
      console.log('='.repeat(60));
      console.log(`📝 Content: ${content.text}`);
      console.log(`🎯 Platforms: ${content.platforms?.join(', ') || 'All platforms'}`);
      console.log(`⏰ Time: ${new Date().toLocaleString()}`);
      console.log(`🔗 Action: Copy content and paste into Buffer at ${notification.actionUrl}`);
      console.log('='.repeat(60) + '\n');

      // Save to a file for easy access
      await this.saveContentToFile(content);

      return {
        success: true,
        message: 'Content notification sent successfully',
        data: notification,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error sending Buffer notification', { error: error.message, content });
      throw error;
    }
  }

  /**
   * Format content for notification display
   * @param {Object} content - Content object
   * @returns {string} Formatted message
   */
  formatContentForNotification(content) {
    const platforms = content.platforms?.join(', ') || 'All platforms';
    const text = content.text || 'No content provided';
    
    return `Content ready for ${platforms}:\n\n"${text}"\n\nCopy this content and paste it into Buffer for posting.`;
  }

  /**
   * Save content to a file for easy access
   * @param {Object} content - Content to save
   */
  async saveContentToFile(content) {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      
      const contentDir = path.join(process.cwd(), 'buffer-content');
      
      // Create directory if it doesn't exist
      try {
        await fs.mkdir(contentDir, { recursive: true });
      } catch (error) {
        // Directory might already exist
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `buffer-content-${timestamp}.json`;
      const filepath = path.join(contentDir, filename);

      const contentData = {
        text: content.text,
        platforms: content.platforms || ['linkedin', 'twitter'],
        scheduledTime: content.scheduledTime,
        createdAt: new Date().toISOString(),
        actionUrl: 'https://buffer.com/app'
      };

      await fs.writeFile(filepath, JSON.stringify(contentData, null, 2));
      
      console.log(`💾 Content saved to: ${filepath}`);
      
    } catch (error) {
      logger.error('Error saving content to file', { error: error.message });
    }
  }

  /**
   * Get recent content files
   * @returns {Promise<Array>} List of recent content files
   */
  async getRecentContent() {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      
      const contentDir = path.join(process.cwd(), 'buffer-content');
      
      try {
        const files = await fs.readdir(contentDir);
        const jsonFiles = files.filter(file => file.endsWith('.json'));
        
        const contentFiles = [];
        for (const file of jsonFiles.slice(-5)) { // Get last 5 files
          const filepath = path.join(contentDir, file);
          const content = await fs.readFile(filepath, 'utf8');
          contentFiles.push({
            filename: file,
            content: JSON.parse(content)
          });
        }
        
        return contentFiles;
        
      } catch (error) {
        return [];
      }
      
    } catch (error) {
      logger.error('Error getting recent content', { error: error.message });
      return [];
    }
  }

  /**
   * Test the notification system
   * @returns {Promise<Object>} Test result
   */
  async testNotification() {
    try {
      const testContent = {
        text: 'This is a test notification from your AI agent system! 🤖',
        platforms: ['linkedin', 'twitter'],
        scheduledTime: null
      };

      const result = await this.notifyContentReady(testContent);
      
      return {
        success: true,
        message: 'Notification system test successful',
        data: result,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Notification system test failed', { error: error.message });
      return {
        success: false,
        message: `Notification system test failed: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = BufferNotificationIntegration; 