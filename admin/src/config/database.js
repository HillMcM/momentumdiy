const mongoose = require('mongoose');
const Redis = require('redis');
const logger = require('../utils/logger');

// MongoDB connection
const connectMongoDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/momentumdiy_agents';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info('✅ MongoDB connected successfully');
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Redis connection
let redisClient = null;
const connectRedis = async () => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    redisClient = Redis.createClient({ url: redisUrl });
    
    redisClient.on('error', (err) => {
      logger.error('❌ Redis connection error:', err);
    });
    
    redisClient.on('connect', () => {
      logger.info('✅ Redis connected successfully');
    });
    
    await redisClient.connect();
  } catch (error) {
    logger.error('❌ Redis connection failed:', error);
    // Don't exit process for Redis - it's optional for caching
  }
};

// Get Redis client
const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};

// Disconnect databases
const disconnectDatabases = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      logger.info('✅ MongoDB disconnected');
    }
    
    if (redisClient && redisClient.isReady) {
      await redisClient.quit();
      logger.info('✅ Redis disconnected');
    }
  } catch (error) {
    logger.error('❌ Error disconnecting databases:', error);
  }
};

module.exports = {
  connectMongoDB,
  connectRedis,
  getRedisClient,
  disconnectDatabases
}; 