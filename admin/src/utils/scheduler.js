const cron = require('node-cron');
const logger = require('./logger');

class Scheduler {
  constructor(agentManager) {
    this.agentManager = agentManager;
    this.jobs = new Map();
    this.isRunning = false;
  }

  // Start the scheduler
  start() {
    if (this.isRunning) {
      logger.warn('Scheduler is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Scheduler started');

    // Schedule weekly content marketing workflow
    this.scheduleWeeklyContentWorkflow();
  }

  // Stop the scheduler
  stop() {
    if (!this.isRunning) {
      logger.warn('Scheduler is not running');
      return;
    }

    // Stop all jobs
    for (const [jobId, job] of this.jobs) {
      job.stop();
      logger.info(`Stopped job: ${jobId}`);
    }

    this.jobs.clear();
    this.isRunning = false;
    logger.info('Scheduler stopped');
  }

  // Schedule weekly content marketing workflow
  scheduleWeeklyContentWorkflow() {
    // Monday 8 AM EST: Market Research
    this.scheduleJob('weekly-market-research', '0 13 * * 1', async () => {
      logger.info('📊 Starting weekly market research...');
      const agentCoordinator = this.agentManager.agentCoordinator;
      if (agentCoordinator) {
        await agentCoordinator.executeWeeklyResearch();
      }
    }, { timezone: 'America/New_York' });

    // Tuesday 8 AM EST: Blog Post Creation
    this.scheduleJob('weekly-blog-creation', '0 13 * * 2', async () => {
      logger.info('✍️ Starting weekly blog post creation...');
      const agentCoordinator = this.agentManager.agentCoordinator;
      if (agentCoordinator) {
        await agentCoordinator.executeWeeklyBlogCreation();
      }
    }, { timezone: 'America/New_York' });

    // Wednesday 8 AM EST: Social Content Creation
    this.scheduleJob('weekly-social-content', '0 13 * * 3', async () => {
      logger.info('📱 Starting weekly social content creation...');
      const agentCoordinator = this.agentManager.agentCoordinator;
      if (agentCoordinator) {
        await agentCoordinator.executeWeeklySocialContent();
      }
    }, { timezone: 'America/New_York' });

    // Thursday-Sunday: Social Posting (optimal times per platform)
    // Facebook: Thursday 2 PM EST
    this.scheduleJob('weekly-facebook-post', '0 19 * * 4', async () => {
      logger.info('📘 Posting to Facebook...');
      const agentCoordinator = this.agentManager.agentCoordinator;
      if (agentCoordinator) {
        await agentCoordinator.executeScheduledPosting(['facebook']);
      }
    }, { timezone: 'America/New_York' });

    // Instagram: Friday 2 PM EST
    this.scheduleJob('weekly-instagram-post', '0 19 * * 5', async () => {
      logger.info('📷 Posting to Instagram...');
      const agentCoordinator = this.agentManager.agentCoordinator;
      if (agentCoordinator) {
        await agentCoordinator.executeScheduledPosting(['instagram']);
      }
    }, { timezone: 'America/New_York' });

    // LinkedIn: Tuesday 9 AM EST (professional audience)
    this.scheduleJob('weekly-linkedin-post', '0 14 * * 2', async () => {
      logger.info('💼 Posting to LinkedIn...');
      const agentCoordinator = this.agentManager.agentCoordinator;
      if (agentCoordinator) {
        await agentCoordinator.executeScheduledPosting(['linkedin']);
      }
    }, { timezone: 'America/New_York' });

    // X (Twitter): Wednesday 12 PM EST (lunch time engagement)
    this.scheduleJob('weekly-x-post', '0 17 * * 3', async () => {
      logger.info('𝕏 Posting to X...');
      const agentCoordinator = this.agentManager.agentCoordinator;
      if (agentCoordinator) {
        await agentCoordinator.executeScheduledPosting(['x']);
      }
    }, { timezone: 'America/New_York' });

    logger.info('✅ Weekly content marketing workflow scheduled');
    logger.info('   - Monday 8 AM: Market Research');
    logger.info('   - Tuesday 8 AM: Blog Post Creation');
    logger.info('   - Tuesday 9 AM: LinkedIn Posting');
    logger.info('   - Wednesday 8 AM: Social Content Creation');
    logger.info('   - Wednesday 12 PM: X Posting');
    logger.info('   - Thursday 2 PM: Facebook Posting');
    logger.info('   - Friday 2 PM: Instagram Posting');
  }

  // Schedule daily CMO workflow (legacy - kept for compatibility)
  scheduleDailyCMOWorkflow() {
    const jobId = 'daily-cmo-workflow';
    
    // Schedule for 8 AM EST (13:00 UTC)
    const job = cron.schedule('0 13 * * *', async () => {
      try {
        logger.info('Executing scheduled daily CMO workflow');
        await this.agentManager.executeDailyCMOWorkflow();
        logger.info('Daily CMO workflow completed successfully');
      } catch (error) {
        logger.error('Error executing scheduled daily CMO workflow:', error);
      }
    }, {
      scheduled: true,
      timezone: 'America/New_York'
    });

    this.jobs.set(jobId, job);
    logger.info(`Scheduled daily CMO workflow for 8 AM EST`);
  }

  // Schedule custom job
  scheduleJob(jobId, cronExpression, task, options = {}) {
    if (this.jobs.has(jobId)) {
      logger.warn(`Job ${jobId} already exists, stopping previous job`);
      this.jobs.get(jobId).stop();
    }

    const job = cron.schedule(cronExpression, async () => {
      try {
        logger.info(`Executing scheduled job: ${jobId}`);
        await task();
        logger.info(`Scheduled job ${jobId} completed successfully`);
      } catch (error) {
        logger.error(`Error executing scheduled job ${jobId}:`, error);
      }
    }, {
      scheduled: true,
      timezone: options.timezone || 'America/New_York',
      ...options
    });

    this.jobs.set(jobId, job);
    logger.info(`Scheduled job ${jobId} with expression: ${cronExpression}`);
    
    return jobId;
  }

  // Stop specific job
  stopJob(jobId) {
    const job = this.jobs.get(jobId);
    if (job) {
      job.stop();
      this.jobs.delete(jobId);
      logger.info(`Stopped job: ${jobId}`);
      return true;
    } else {
      logger.warn(`Job ${jobId} not found`);
      return false;
    }
  }

  // Get all scheduled jobs
  getJobs() {
    const jobList = [];
    for (const [jobId, job] of this.jobs) {
      try {
        jobList.push({
          id: jobId,
          running: job.running,
          nextDate: job.nextDate ? job.nextDate() : null,
          lastDate: job.lastDate ? job.lastDate() : null
        });
      } catch (error) {
        logger.error(`Error getting job info for ${jobId}:`, error);
        jobList.push({
          id: jobId,
          running: job.running,
          nextDate: null,
          lastDate: null,
          error: error.message
        });
      }
    }
    return jobList;
  }

  // Get scheduler status
  getStatus() {
    return {
      isRunning: this.isRunning,
      totalJobs: this.jobs.size,
      jobs: this.getJobs()
    };
  }

  // Execute job immediately (for testing)
  async executeJobNow(jobId) {
    const job = this.jobs.get(jobId);
    if (job) {
      logger.info(`Executing job ${jobId} immediately`);
      await job.fireOnTick();
      return true;
    } else {
      logger.warn(`Job ${jobId} not found`);
      return false;
    }
  }

  // Validate cron expression
  validateCronExpression(expression) {
    try {
      cron.validate(expression);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get next execution time for a cron expression
  getNextExecution(expression, timezone = 'America/New_York') {
    try {
      const job = cron.schedule(expression, () => {}, {
        scheduled: false,
        timezone: timezone
      });
      const nextDate = job.nextDate();
      job.stop();
      return nextDate;
    } catch (error) {
      logger.error('Error getting next execution time:', error);
      return null;
    }
  }
}

module.exports = Scheduler; 