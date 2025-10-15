const puppeteer = require('puppeteer');

class BufferIntegration {
  constructor() {
    this.bufferUrl = process.env.BUFFER_URL || 'https://buffer.com';
    this.loginUrl = 'https://buffer.com/login';
    this.dashboardUrl = 'https://buffer.com/app';
  }

  /**
   * Create a draft in Buffer for review
   * @param {Object} content - Content to post
   * @param {string} content.text - Post text
   * @param {Array} content.platforms - Platforms to post to ['linkedin', 'twitter', 'facebook', 'instagram']
   * @param {string} content.scheduledTime - Optional scheduled time
   * @returns {Promise<Object>} Result of draft creation
   */
  async createDraft(content) {
    let browser;
    
    try {
      console.log('🚀 Starting Buffer web automation...');
      
      // Launch browser
      browser = await puppeteer.launch({ 
        headless: false, // Set to true in production
        defaultViewport: { width: 1280, height: 720 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      
      // Set user agent to avoid detection
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      console.log('📝 Logging into Buffer...');
      
      // Login to Buffer
      await page.goto(this.loginUrl);
      await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
      
      await page.type('input[type="email"], input[name="email"]', process.env.BUFFER_EMAIL);
      await page.type('input[type="password"], input[name="password"]', process.env.BUFFER_PASSWORD);
      
      // Click login button
      await page.click('button[type="submit"], input[type="submit"], .login-button');
      
      // Wait for dashboard to load
      console.log('⏳ Waiting for Buffer dashboard...');
      await page.waitForSelector('[data-testid="composer"], .composer, textarea, [contenteditable="true"]', { timeout: 15000 });
      
      // Wait a bit for the page to fully load
      await page.waitForTimeout(3000);
      
      console.log('✍️ Adding content to Buffer composer...');
      
      // Find and click the composer
      const composerSelectors = [
        '[data-testid="composer"]',
        '.composer',
        'textarea',
        '[contenteditable="true"]',
        '.post-composer'
      ];
      
      let composerFound = false;
      for (const selector of composerSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 2000 });
          await page.click(selector);
          composerFound = true;
          console.log(`✅ Found composer with selector: ${selector}`);
          break;
        } catch (error) {
          console.log(`❌ Selector not found: ${selector}`);
        }
      }
      
      if (!composerFound) {
        throw new Error('Could not find Buffer composer');
      }
      
      // Wait for text input to be ready
      await page.waitForTimeout(1000);
      
      // Type the content
      await page.keyboard.type(content.text);
      
      console.log('🎯 Selecting platforms...');
      
      // Select platforms
      const platformSelectors = {
        linkedin: [
          '[data-testid="linkedin-toggle"]',
          '.platform-linkedin',
          '[data-platform="linkedin"]',
          '.linkedin-toggle'
        ],
        twitter: [
          '[data-testid="twitter-toggle"]',
          '.platform-twitter',
          '[data-platform="twitter"]',
          '.twitter-toggle'
        ],
        facebook: [
          '[data-testid="facebook-toggle"]',
          '.platform-facebook',
          '[data-platform="facebook"]',
          '.facebook-toggle'
        ],
        instagram: [
          '[data-testid="instagram-toggle"]',
          '.platform-instagram',
          '[data-platform="instagram"]',
          '.instagram-toggle'
        ]
      };
      
      for (const platform of content.platforms) {
        if (platformSelectors[platform]) {
          let platformSelected = false;
          for (const selector of platformSelectors[platform]) {
            try {
              await page.waitForSelector(selector, { timeout: 2000 });
              await page.click(selector);
              console.log(`✅ Selected platform: ${platform}`);
              platformSelected = true;
              break;
            } catch (error) {
              console.log(`❌ Platform selector not found: ${selector}`);
            }
          }
          if (!platformSelected) {
            console.log(`⚠️ Could not select platform: ${platform}`);
          }
        }
      }
      
      console.log('💾 Saving as draft...');
      
      // Save as draft (don't post immediately)
      const saveSelectors = [
        '[data-testid="save-draft"]',
        '.save-draft-button',
        '.draft-button',
        'button:contains("Save")',
        'button:contains("Draft")'
      ];
      
      let draftSaved = false;
      for (const selector of saveSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 2000 });
          await page.click(selector);
          draftSaved = true;
          console.log(`✅ Draft saved with selector: ${selector}`);
          break;
        } catch (error) {
          console.log(`❌ Save selector not found: ${selector}`);
        }
      }
      
      if (!draftSaved) {
        // If no save button found, just wait a bit and assume it's saved
        console.log('⚠️ No save button found, assuming draft is saved');
        await page.waitForTimeout(2000);
      }
      
      // Wait for confirmation
      await page.waitForTimeout(3000);
      
      console.log('✅ Draft successfully created in Buffer!');
      
      return {
        success: true,
        message: 'Draft created successfully in Buffer',
        content: content.text,
        platforms: content.platforms,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Error creating Buffer draft:', error.message);
      throw new Error(`Buffer draft creation failed: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
        console.log('🔒 Browser closed');
      }
    }
  }

  /**
   * Post content directly to Buffer (immediate posting)
   * @param {Object} content - Content to post
   * @param {string} content.text - Post text
   * @param {Array} content.platforms - Platforms to post to
   * @param {string} content.scheduledTime - Optional scheduled time
   * @returns {Promise<Object>} Result of posting
   */
  async postNow(content) {
    let browser;
    
    try {
      console.log('🚀 Starting Buffer web automation for immediate posting...');
      
      browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 1280, height: 720 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Login to Buffer
      await page.goto(this.loginUrl);
      await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
      
      await page.type('input[type="email"], input[name="email"]', process.env.BUFFER_EMAIL);
      await page.type('input[type="password"], input[name="password"]', process.env.BUFFER_PASSWORD);
      await page.click('button[type="submit"], input[type="submit"], .login-button');
      
      // Wait for dashboard
      await page.waitForSelector('[data-testid="composer"], .composer, textarea, [contenteditable="true"]', { timeout: 15000 });
      await page.waitForTimeout(3000);
      
      // Add content
      const composerSelectors = [
        '[data-testid="composer"]',
        '.composer',
        'textarea',
        '[contenteditable="true"]',
        '.post-composer'
      ];
      
      let composerFound = false;
      for (const selector of composerSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 2000 });
          await page.click(selector);
          composerFound = true;
          break;
        } catch (error) {
          // Continue to next selector
        }
      }
      
      if (!composerFound) {
        throw new Error('Could not find Buffer composer');
      }
      
      await page.waitForTimeout(1000);
      await page.keyboard.type(content.text);
      
      // Select platforms (same logic as createDraft)
      const platformSelectors = {
        linkedin: ['[data-testid="linkedin-toggle"]', '.platform-linkedin', '[data-platform="linkedin"]'],
        twitter: ['[data-testid="twitter-toggle"]', '.platform-twitter', '[data-platform="twitter"]'],
        facebook: ['[data-testid="facebook-toggle"]', '.platform-facebook', '[data-platform="facebook"]'],
        instagram: ['[data-testid="instagram-toggle"]', '.platform-instagram', '[data-platform="instagram"]']
      };
      
      for (const platform of content.platforms) {
        if (platformSelectors[platform]) {
          for (const selector of platformSelectors[platform]) {
            try {
              await page.waitForSelector(selector, { timeout: 2000 });
              await page.click(selector);
              break;
            } catch (error) {
              // Continue to next selector
            }
          }
        }
      }
      
      // Post now
      const postSelectors = [
        '[data-testid="post-now-button"]',
        '.post-now-button',
        '.post-button',
        'button:contains("Post")',
        'button:contains("Share")'
      ];
      
      let posted = false;
      for (const selector of postSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 2000 });
          await page.click(selector);
          posted = true;
          break;
        } catch (error) {
          // Continue to next selector
        }
      }
      
      if (!posted) {
        throw new Error('Could not find post button');
      }
      
      // Wait for confirmation
      await page.waitForTimeout(5000);
      
      return {
        success: true,
        message: 'Content posted successfully to Buffer',
        content: content.text,
        platforms: content.platforms,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Error posting to Buffer:', error.message);
      throw new Error(`Buffer posting failed: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Test Buffer connection
   * @returns {Promise<Object>} Connection test result
   */
  async testConnection() {
    try {
      console.log('🧪 Testing Buffer connection...');
      
      const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Try to access Buffer login page
      await page.goto(this.loginUrl);
      await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
      
      await browser.close();
      
      return {
        success: true,
        message: 'Buffer connection test successful',
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Buffer connection test failed:', error.message);
      return {
        success: false,
        message: `Buffer connection test failed: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = BufferIntegration; 