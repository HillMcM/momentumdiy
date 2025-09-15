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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #EF8E81, #D4AF37); padding: 30px; border-radius: 10px; margin-bottom: 20px;">
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
        </div>
      `;
            const result = await resend.emails.send({
                from: 'MomentumDIY <noreply@momentumdiy.com>',
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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #EF8E81, #D4AF37); padding: 30px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
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
                 style="background: linear-gradient(135deg, #EF8E81, #E67A6E); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Get Started Now
              </a>
            </div>
            
            <div style="font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 15px; text-align: center;">
              <p>Questions? Just reply to this email and we'll help you out!</p>
              <p>© 2024 MomentumDIY. All rights reserved.</p>
            </div>
          </div>
        </div>
      `;
            const result = await resend.emails.send({
                from: 'MomentumDIY <noreply@momentumdiy.com>',
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
                from: 'MomentumDIY <noreply@momentumdiy.com>',
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
}
exports.EmailService = EmailService;
//# sourceMappingURL=emailService.js.map