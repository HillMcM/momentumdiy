const logger = require('./logger');
const { AutomaticDataCollector } = require('../integrations/automatic-data-collectors');

class AutomaticScheduler {
  constructor() {
    this.dataCollector = new AutomaticDataCollector();
    this.schedules = {
      emailMarketing: '0 */6 * * *', // Every 6 hours
      socialMedia: '0 */4 * * *',    // Every 4 hours
      analytics: '0 */2 * * *',      // Every 2 hours
      crm: '0 */8 * * *',           // Every 8 hours
      apify: '0 */12 * * *',        // Every 12 hours
      fullSync: '0 2 * * *'          // Daily at 2 AM
    };
    this.activeJobs = new Map();
  }

  // Start all automatic data collection schedules
  async startAutomaticCollection() {
    logger.info('Starting automatic data collection scheduler...');
    
    try {
      // Schedule email marketing data collection
      this.scheduleJob('emailMarketing', this.schedules.emailMarketing, () => {
        this.dataCollector.collectEmailMarketingData();
      });

      // Schedule social media data collection
      this.scheduleJob('socialMedia', this.schedules.socialMedia, () => {
        this.dataCollector.collectSocialMediaData();
      });

      // Schedule analytics data collection
      this.scheduleJob('analytics', this.schedules.analytics, () => {
        this.dataCollector.collectAnalyticsData();
      });

      // Schedule CRM data collection
      this.scheduleJob('crm', this.schedules.crm, () => {
        this.dataCollector.collectCRMData();
      });

      // Schedule Apify data collection
      this.scheduleJob('apify', this.schedules.apify, () => {
        this.dataCollector.collectApifyData();
      });

      // Schedule full data sync
      this.scheduleJob('fullSync', this.schedules.fullSync, () => {
        this.dataCollector.collectAllData();
      });

      logger.info('Automatic data collection scheduler started successfully');
      return { success: true, message: 'Scheduler started' };
    } catch (error) {
      logger.error('Failed to start automatic scheduler:', error);
      return { success: false, error: error.message };
    }
  }

  // Schedule a specific job
  scheduleJob(name, cronExpression, task) {
    try {
      // Use node-cron for scheduling
      const cron = require('node-cron');
      
      const job = cron.schedule(cronExpression, async () => {
        logger.info(`Running scheduled job: ${name}`);
        try {
          await task();
          logger.info(`Scheduled job ${name} completed successfully`);
        } catch (error) {
          logger.error(`Scheduled job ${name} failed:`, error);
        }
      }, {
        scheduled: true,
        timezone: "America/New_York"
      });

      this.activeJobs.set(name, job);
      logger.info(`Scheduled job ${name} with cron: ${cronExpression}`);
    } catch (error) {
      logger.error(`Failed to schedule job ${name}:`, error);
    }
  }

  // Stop all scheduled jobs
  stopAllJobs() {
    logger.info('Stopping all scheduled jobs...');
    
    this.activeJobs.forEach((job, name) => {
      job.stop();
      logger.info(`Stopped job: ${name}`);
    });
    
    this.activeJobs.clear();
    logger.info('All scheduled jobs stopped');
  }

  // Get status of all jobs
  getJobStatus() {
    const status = {};
    
    this.activeJobs.forEach((job, name) => {
      status[name] = {
        active: job.getStatus() === 'scheduled',
        nextRun: job.nextDate().toDate(),
        cron: this.schedules[name]
      };
    });
    
    return status;
  }

  // Run data collection immediately (for testing)
  async runImmediateCollection() {
    logger.info('Running immediate data collection...');
    
    try {
      const results = await this.dataCollector.collectAllData();
      logger.info('Immediate data collection completed:', results);
      return results;
    } catch (error) {
      logger.error('Immediate data collection failed:', error);
      throw error;
    }
  }

  // Update schedule for a specific job
  updateSchedule(jobName, newCronExpression) {
    if (this.activeJobs.has(jobName)) {
      // Stop existing job
      this.activeJobs.get(jobName).stop();
      this.activeJobs.delete(jobName);
    }
    
    // Update schedule
    this.schedules[jobName] = newCronExpression;
    
    // Reschedule job
    this.scheduleJob(jobName, newCronExpression, () => {
      this.dataCollector[`collect${jobName.charAt(0).toUpperCase() + jobName.slice(1)}Data`]();
    });
    
    logger.info(`Updated schedule for ${jobName}: ${newCronExpression}`);
  }
}

// Create singleton instance
let scheduler = null;

function getAutomaticScheduler() {
  if (!scheduler) {
    scheduler = new AutomaticScheduler();
  }
  return scheduler;
}

module.exports = {
  AutomaticScheduler,
  getAutomaticScheduler
}; 