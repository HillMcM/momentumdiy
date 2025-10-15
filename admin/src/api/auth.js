const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Google OAuth callback route
router.get('/google/callback', (req, res) => {
  try {
    const { code, error } = req.query;
    
    if (error) {
      logger.error('Google OAuth error:', error);
      return res.status(400).json({ 
        error: 'OAuth authorization failed', 
        details: error 
      });
    }
    
    if (!code) {
      return res.status(400).json({ 
        error: 'No authorization code received' 
      });
    }
    
    logger.info('Google OAuth callback received', { code: code.substring(0, 20) + '...' });
    
    // Return the authorization code to the user
    res.json({
      success: true,
      message: 'Authorization successful!',
      authorization_code: code,
      instructions: [
        'Copy the authorization_code above',
        'Use it in the curl command to get your refresh token',
        'Example: curl -X POST https://oauth2.googleapis.com/token -d "client_id=YOUR_CLIENT_ID" -d "client_secret=YOUR_CLIENT_SECRET" -d "code=AUTHORIZATION_CODE" -d "grant_type=authorization_code" -d "redirect_uri=http://localhost:3000/auth/google/callback"'
      ]
    });
    
  } catch (error) {
    logger.error('Error in Google OAuth callback:', error);
    res.status(500).json({ 
      error: 'Internal server error during OAuth callback' 
    });
  }
});

// Facebook OAuth callback route
router.get('/facebook/callback', (req, res) => {
  try {
    const { code, error } = req.query;
    
    if (error) {
      logger.error('Facebook OAuth error:', error);
      return res.status(400).json({ 
        error: 'OAuth authorization failed', 
        details: error 
      });
    }
    
    if (!code) {
      return res.status(400).json({ 
        error: 'No authorization code received' 
      });
    }
    
    logger.info('Facebook OAuth callback received', { code: code.substring(0, 20) + '...' });
    
    res.json({
      success: true,
      message: 'Facebook authorization successful!',
      authorization_code: code,
      instructions: [
        'Copy the authorization_code above',
        'Use it to get your Facebook access token'
      ]
    });
    
  } catch (error) {
    logger.error('Error in Facebook OAuth callback:', error);
    res.status(500).json({ 
      error: 'Internal server error during OAuth callback' 
    });
  }
});

// LinkedIn OAuth callback route
router.get('/linkedin/callback', (req, res) => {
  try {
    const { code, error } = req.query;
    
    if (error) {
      logger.error('LinkedIn OAuth error:', error);
      return res.status(400).json({ 
        error: 'OAuth authorization failed', 
        details: error 
      });
    }
    
    if (!code) {
      return res.status(400).json({ 
        error: 'No authorization code received' 
      });
    }
    
    logger.info('LinkedIn OAuth callback received', { code: code.substring(0, 20) + '...' });
    
    res.json({
      success: true,
      message: 'LinkedIn authorization successful!',
      authorization_code: code,
      instructions: [
        'Copy the authorization_code above',
        'Use it to get your LinkedIn access token'
      ]
    });
    
  } catch (error) {
    logger.error('Error in LinkedIn OAuth callback:', error);
    res.status(500).json({ 
      error: 'Internal server error during OAuth callback' 
    });
  }
});

module.exports = router; 