"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const resend_1 = require("resend");
const resend = new resend_1.Resend(process.env['RESEND_API_KEY'] || 're_HAwFtwhA_E1nrZGWHUWiA5E3Pbd4kHN2M');
class EmailService {
    static async sendFeedbackEmail(data) {
        try {
            const { name, email, subject, message, rating, category } = data;
            const emailContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Feedback from MomentumDIY</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background: #EF8E81; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Feedback from MomentumDIY</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #2A2438; margin-top: 0;">Feedback Details</h2>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #EF8E81;">Name:</strong> ${name}<br>
              <strong style="color: #EF8E81;">Email:</strong> ${email}<br>
              <strong style="color: #EF8E81;">Category:</strong> ${category}<br>
              <strong style="color: #EF8E81;">Rating:</strong> ${rating}/5 stars<br>
              <strong style="color: #EF8E81;">Subject:</strong> ${subject}
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #EF8E81;">Message:</strong>
              <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 10px; border-left: 4px solid #EF8E81;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <div style="font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 15px;">
              <p>Submitted at: ${new Date().toLocaleString()}</p>
              <p>This feedback was sent from the MomentumDIY app feedback form.</p>
            </div>
          </div>
        </body>
        </html>
      `;
            const result = await resend.emails.send({
                from: 'MomentumDIY <onboarding@resend.dev>',
                to: 'info@hillaryedenmcmullen.com',
                subject: `[MomentumDIY Feedback] ${subject}`,
                html: emailContent,
            });
            console.log('📧 Feedback email sent successfully:', result);
            return { success: true };
        }
        catch (error) {
            console.error('❌ Error sending feedback email:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async sendWelcomeEmail(data) {
        try {
            const { name, email } = data;
            const emailContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to MomentumDIY</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background: #EF8E81; padding: 30px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to MomentumDIY!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your marketing success journey starts now</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #2A2438; margin-top: 0;">Hi ${name}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Welcome to MomentumDIY! We're excited to help you grow your business with our proven marketing strategies.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #EF8E81; margin-top: 0;">What's Next?</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li>Complete your onboarding to get personalized recommendations</li>
                <li>Start your first 12-week marketing track</li>
                <li>Use our AI assistant whenever you need help</li>
                <li>Track your progress with our task management system</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://momentumdiy.com/app" 
                 style="background: #EF8E81; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Get Started Now
              </a>
            </div>
            
            <div style="font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 15px; text-align: center;">
              <p>Questions? Just reply to this email and we'll help you out!</p>
              <p>© 2024 MomentumDIY. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
            const result = await resend.emails.send({
                from: 'MomentumDIY <onboarding@resend.dev>',
                to: email,
                subject: 'Welcome to MomentumDIY - Let\'s Grow Your Business!',
                html: emailContent,
            });
            console.log('📧 Welcome email sent successfully:', result);
            return { success: true };
        }
        catch (error) {
            console.error('❌ Error sending welcome email:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async sendTestEmail() {
        try {
            const result = await resend.emails.send({
                from: 'MomentumDIY <onboarding@resend.dev>',
                to: 'info@hillaryedenmcmullen.com',
                subject: 'MomentumDIY Email Test',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #EF8E81, #D4AF37); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
              <h1 style="color: white; margin: 0;">🎉 Email Test Successful!</h1>
            </div>
            <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <p>Congratulations! Your Resend email integration is working perfectly.</p>
              <p><strong>Test Details:</strong></p>
              <ul>
                <li>Service: Resend</li>
                <li>Timestamp: ${new Date().toLocaleString()}</li>
                <li>Status: ✅ Working</li>
              </ul>
            </div>
          </div>
        `,
            });
            console.log('📧 Test email sent successfully:', result);
            return { success: true };
        }
        catch (error) {
            console.error('❌ Error sending test email:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async sendNotificationEmail(data) {
        try {
            const { name, email, type, data: notificationData } = data;
            let emailContent = '';
            let subject = '';
            switch (type) {
                case 'welcome':
                    subject = 'Welcome to MomentumDIY - Let\'s Grow Your Business!';
                    emailContent = this.getWelcomeEmailTemplate(name);
                    break;
                case 'onboarding_complete':
                    subject = '🎉 Onboarding Complete - Your Marketing Journey Starts Now!';
                    emailContent = this.getOnboardingCompleteTemplate(name, notificationData);
                    break;
                case 'trial_ending':
                    subject = '⏰ Your Free Trial Ends Soon - Don\'t Miss Out!';
                    emailContent = this.getTrialEndingTemplate(name, notificationData);
                    break;
                case 'subscription_active':
                    subject = '✅ Subscription Activated - Welcome to MomentumDIY!';
                    emailContent = this.getSubscriptionActiveTemplate(name, notificationData);
                    break;
                case 'subscription_cancelled':
                    subject = 'We\'re Sorry to See You Go - Here\'s What You\'ll Miss';
                    emailContent = this.getSubscriptionCancelledTemplate(name, notificationData);
                    break;
                case 'weekly_progress':
                    subject = '📊 Your Weekly Marketing Progress Report';
                    emailContent = this.getWeeklyProgressTemplate(name, notificationData);
                    break;
                case 'task_reminder':
                    subject = '⏰ Task Reminder - Keep Your Marketing Momentum Going!';
                    emailContent = this.getTaskReminderTemplate(name, notificationData);
                    break;
                default:
                    throw new Error(`Unknown notification type: ${type}`);
            }
            const result = await resend.emails.send({
                from: 'MomentumDIY <onboarding@resend.dev>',
                to: email,
                subject: subject,
                html: emailContent,
            });
            console.log(`📧 ${type} notification sent successfully:`, result);
            return { success: true };
        }
        catch (error) {
            console.error(`❌ Error sending ${data.type} notification:`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static getWelcomeEmailTemplate(name) {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to MomentumDIY</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background: #EF8E81; padding: 30px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to MomentumDIY!</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your marketing success journey starts now</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2A2438; margin-top: 0;">Hi ${name}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Welcome to MomentumDIY! We're excited to help you grow your business with our proven marketing strategies.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #EF8E81; margin-top: 0;">What's Next?</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>Complete your onboarding to get personalized recommendations</li>
              <li>Start your first 12-week marketing track</li>
              <li>Use our AI assistant whenever you need help</li>
              <li>Track your progress with our task management system</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://momentumdiy.com/app" 
               style="background: #EF8E81; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Get Started Now
            </a>
          </div>
          
          <div style="font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 15px; text-align: center;">
            <p>Questions? Just reply to this email and we'll help you out!</p>
            <p>© 2024 MomentumDIY. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    }
    static getOnboardingCompleteTemplate(name, data) {
        const trackName = data?.selectedTrack === 'local-foot-traffic'
            ? 'Increase Local Foot Traffic'
            : 'Improve Social Media Strategy & Engagement';
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Onboarding Complete - MomentumDIY</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background: #EF8E81; padding: 30px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Onboarding Complete!</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your personalized marketing plan is ready</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2A2438; margin-top: 0;">Hi ${name}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Congratulations! You've completed your onboarding and we've created a personalized marketing plan just for you.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #EF8E81; margin-top: 0;">Your Marketing Track: ${trackName}</h3>
            <p style="color: #666; margin-bottom: 15px;">Based on your business goals and challenges, we've selected the perfect 12-week program for you.</p>
            <ul style="color: #666; line-height: 1.8;">
              <li>Week-by-week action plan tailored to your business</li>
              <li>AI-powered marketing assistant for guidance</li>
              <li>Task tracking to keep you on track</li>
              <li>Progress monitoring to celebrate wins</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://momentumdiy.com/app/marketing-track" 
               style="background: #EF8E81; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Start Your Marketing Track
            </a>
          </div>
        </div>
      </body>
      </html>
    `;
    }
    static getTrialEndingTemplate(name, data) {
        const daysLeft = data?.daysLeft || 3;
        return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #EF8E81, #D4AF37); padding: 30px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Your Trial Ends in ${daysLeft} Days</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Don't lose access to your marketing tools!</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2A2438; margin-top: 0;">Hi ${name}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Your free trial is ending soon, but your marketing journey doesn't have to! Continue growing your business with our proven strategies.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #EF8E81; margin-top: 0;">What You'll Keep Access To:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>Complete 12-week marketing tracks</li>
              <li>AI marketing assistant</li>
              <li>Task tracking and progress monitoring</li>
              <li>All your saved data and progress</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://momentumdiy.com/pricing" 
               style="background: linear-gradient(135deg, #EF8E81, #E67A6E); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Continue Your Journey - $14.99/month
            </a>
          </div>
        </div>
      </div>
    `;
    }
    static getSubscriptionActiveTemplate(name, _data) {
        return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #EF8E81, #D4AF37); padding: 30px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">✅ Subscription Activated!</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Welcome to MomentumDIY Premium</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2A2438; margin-top: 0;">Hi ${name}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Thank you for subscribing! You now have full access to all MomentumDIY features and can continue growing your business.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #EF8E81; margin-top: 0;">What's Included:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>Unlimited access to all marketing tracks</li>
              <li>AI marketing assistant</li>
              <li>Task tracking and project management</li>
              <li>Progress monitoring and analytics</li>
              <li>Priority customer support</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://momentumdiy.com/app" 
               style="background: linear-gradient(135deg, #EF8E81, #E67A6E); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Access Your Dashboard
            </a>
          </div>
        </div>
      </div>
    `;
    }
    static getSubscriptionCancelledTemplate(name, _data) {
        return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #EF8E81, #D4AF37); padding: 30px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">We're Sorry to See You Go</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">But we hope you'll come back soon!</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2A2438; margin-top: 0;">Hi ${name}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            We're sorry to see you cancel your subscription. We hope you found value in MomentumDIY and that we can welcome you back soon.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #EF8E81; margin-top: 0;">What You'll Miss:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>Access to your marketing tracks and progress</li>
              <li>AI marketing assistant</li>
              <li>Task tracking and project management</li>
              <li>Weekly progress reports</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://momentumdiy.com/pricing" 
               style="background: linear-gradient(135deg, #EF8E81, #E67A6E); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Reactivate Your Subscription
            </a>
          </div>
        </div>
      </div>
    `;
    }
    static getWeeklyProgressTemplate(name, data) {
        const completedTasks = data?.completedTasks || 0;
        const totalTasks = data?.totalTasks || 0;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #EF8E81, #D4AF37); padding: 30px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">📊 Weekly Progress Report</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Keep up the great work!</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2A2438; margin-top: 0;">Hi ${name}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Here's your weekly progress update. You're doing great!
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #EF8E81; margin-top: 0;">This Week's Progress:</h3>
            <div style="margin: 15px 0;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #666;">Tasks Completed:</span>
                <span style="color: #EF8E81; font-weight: bold;">${completedTasks} / ${totalTasks}</span>
              </div>
              <div style="background: #e0e0e0; border-radius: 10px; height: 20px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #EF8E81, #E67A6E); height: 100%; width: ${progress}%; transition: width 0.3s ease;"></div>
              </div>
              <div style="text-align: center; margin-top: 10px; color: #666; font-size: 14px;">${progress}% Complete</div>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://momentumdiy.com/app" 
               style="background: linear-gradient(135deg, #EF8E81, #E67A6E); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              View Full Progress
            </a>
          </div>
        </div>
      </div>
    `;
    }
    static getTaskReminderTemplate(name, data) {
        const taskName = data?.taskName || 'your marketing task';
        return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #EF8E81, #D4AF37); padding: 30px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Task Reminder</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Don't forget to complete your marketing task!</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2A2438; margin-top: 0;">Hi ${name}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            This is a friendly reminder that you have a pending task: <strong>${taskName}</strong>
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #EF8E81; margin-top: 0;">Why This Task Matters:</h3>
            <p style="color: #666; margin-bottom: 0;">
              Completing this task will help you stay on track with your marketing goals and build momentum for your business growth.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://momentumdiy.com/app/task-tracker" 
               style="background: linear-gradient(135deg, #EF8E81, #E67A6E); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Complete Task Now
            </a>
          </div>
        </div>
      </div>
    `;
    }
}
exports.EmailService = EmailService;
//# sourceMappingURL=emailService.js.map