/**
 * Email Template System - Refactored for maintainability and reusability
 * 
 * This module provides a modular approach to email templates with:
 * - Reusable components (header, footer, buttons, etc.)
 * - Consistent styling and branding
 * - Easy template creation and maintenance
 * - Type-safe template data interfaces
 */

import { BRANDING } from '../config/branding';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface BaseTemplateData {
  name: string;
  email: string;
}

export interface WelcomeTemplateData extends BaseTemplateData {}

export interface OnboardingCompleteTemplateData extends BaseTemplateData {
  selectedTrack?: string; // Track title or slug from database
}

export interface TrialEndingTemplateData extends BaseTemplateData {
  daysRemaining?: number;
  trialEndDate?: string;
}

export interface SubscriptionActiveTemplateData extends BaseTemplateData {
  planName?: string;
  nextBillingDate?: string;
}

export interface SubscriptionCancelledTemplateData extends BaseTemplateData {
  cancellationDate?: string;
  feedback?: string;
}

export interface WeeklyProgressTemplateData extends BaseTemplateData {
  weekNumber?: number;
  completedTasks?: number;
  totalTasks?: number;
  nextWeekTasks?: string[];
}

export interface TaskReminderTemplateData extends BaseTemplateData {
  taskTitle?: string;
  dueDate?: string;
  trackName?: string;
}

export interface FeedbackTemplateData extends BaseTemplateData {
  subject: string;
  message: string;
  rating: number;
  category: string;
}

export interface PartnerApprovalTemplateData extends BaseTemplateData {
  dashboardUrl: string;
  referralCode: string;
}

export interface PartnerRejectionTemplateData extends BaseTemplateData {
  rejectionReason?: string;
}

// ============================================================================
// STYLE CONSTANTS
// ============================================================================

export const EmailStyles = {
  // Colors
  colors: {
    primary: '#EF8E81',
    secondary: '#686DCA',
    dark: '#2A2438',
    gray: '#666',
    lightGray: '#f8f9fa',
    white: '#ffffff',
  },
  
  // Typography
  typography: {
    fontFamily: 'Arial, sans-serif',
    headingSize: '28px',
    subheadingSize: '16px',
    bodySize: '14px',
    smallSize: '12px',
  },
  
  // Layout
  layout: {
    maxWidth: '600px',
    padding: '20px',
    borderRadius: '10px',
    contentPadding: '30px',
    contentBorderRadius: '10px',
  },
  
  // Spacing
  spacing: {
    small: '10px',
    medium: '20px',
    large: '30px',
  },
} as const;

// ============================================================================
// BASE TEMPLATE COMPONENTS
// ============================================================================

export class EmailTemplateComponents {
  /**
   * Generate the complete HTML document structure
   */
  static createDocument(title: string, content: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="font-family: ${EmailStyles.typography.fontFamily}; max-width: ${EmailStyles.layout.maxWidth}; margin: 0 auto; padding: ${EmailStyles.layout.padding}; background-color: ${EmailStyles.colors.lightGray};">
        ${content}
      </body>
      </html>
    `;
  }

  /**
   * Generate the email header with logo and title
   */
  static createHeader(title: string, subtitle: string): string {
    return `
      <div style="background: linear-gradient(135deg, ${EmailStyles.colors.primary}, ${EmailStyles.colors.secondary}); padding: ${EmailStyles.spacing.large}; border-radius: ${EmailStyles.layout.borderRadius}; margin-bottom: ${EmailStyles.spacing.medium}; text-align: center;">
        <img src="${BRANDING.logoUrl}" alt="${BRANDING.name}" style="width: 60px; height: 60px; margin-bottom: 15px;">
        <h1 style="color: ${EmailStyles.colors.white}; margin: 0; font-size: ${EmailStyles.typography.headingSize};">${title}</h1>
        <p style="color: ${EmailStyles.colors.white}; margin: ${EmailStyles.spacing.small} 0 0 0; font-size: ${EmailStyles.typography.subheadingSize};">${subtitle}</p>
      </div>
    `;
  }

  /**
   * Generate the main content container
   */
  static createContentContainer(content: string): string {
    return `
      <div style="background: ${EmailStyles.colors.white}; padding: ${EmailStyles.spacing.large}; border-radius: ${EmailStyles.layout.contentBorderRadius}; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        ${content}
      </div>
    `;
  }

  /**
   * Generate a styled greeting
   */
  static createGreeting(name: string): string {
    return `<h2 style="color: ${EmailStyles.colors.dark}; margin-top: 0;">Hi ${name}!</h2>`;
  }

  /**
   * Generate a styled paragraph
   */
  static createParagraph(text: string, style?: string): string {
    const defaultStyle = `color: ${EmailStyles.colors.gray}; line-height: 1.6; margin-bottom: ${EmailStyles.spacing.medium};`;
    return `<p style="${defaultStyle}${style ? ' ' + style : ''}">${text}</p>`;
  }

  /**
   * Generate a styled info box
   */
  static createInfoBox(title: string, content: string): string {
    return `
      <div style="background: ${EmailStyles.colors.lightGray}; padding: ${EmailStyles.spacing.medium}; border-radius: 8px; margin: ${EmailStyles.spacing.medium} 0;">
        <h3 style="color: ${EmailStyles.colors.primary}; margin-top: 0;">${title}</h3>
        ${content}
      </div>
    `;
  }

  /**
   * Generate a styled list
   */
  static createList(items: string[]): string {
    return `
      <ul style="color: ${EmailStyles.colors.gray}; line-height: 1.8;">
        ${items.map(item => `<li>${item}</li>`).join('')}
      </ul>
    `;
  }

  /**
   * Generate a call-to-action button
   */
  static createButton(text: string, url: string, style?: string): string {
    const defaultStyle = `background: linear-gradient(135deg, ${EmailStyles.colors.primary}, ${EmailStyles.colors.secondary}); color: ${EmailStyles.colors.white}; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;`;
    return `
      <div style="text-align: center; margin: ${EmailStyles.spacing.large} 0;">
        <a href="${url}" style="${defaultStyle}${style ? ' ' + style : ''}">${text}</a>
      </div>
    `;
  }

  /**
   * Generate the email footer
   */
  static createFooter(): string {
    return `
      <div style="font-size: ${EmailStyles.typography.smallSize}; color: ${EmailStyles.colors.gray}; border-top: 1px solid #eee; padding-top: 15px; text-align: center; margin-top: ${EmailStyles.spacing.medium};">
        <p><strong>Please do not reply to this email address, it is not attached to an inbox.</strong></p>
        <p>For questions please email <a href="mailto:${BRANDING.supportEmail}" style="color: ${EmailStyles.colors.primary};">${BRANDING.supportEmail}</a></p>
        <p>© ${new Date().getFullYear()} ${BRANDING.legalName}. All rights reserved.</p>
      </div>
    `;
  }
}

// ============================================================================
// TEMPLATE FACTORY
// ============================================================================

export class EmailTemplateFactory {
  /**
   * Generate welcome email template
   */
  static createWelcomeTemplate(data: WelcomeTemplateData): string {
    const header = EmailTemplateComponents.createHeader(
      `Welcome to ${BRANDING.name}!`,
      'Your marketing success journey starts now'
    );

    const content = `
      ${EmailTemplateComponents.createGreeting(data.name)}
      
      ${EmailTemplateComponents.createParagraph(
        `Welcome to ${BRANDING.name}! We're excited to help you grow your business with our proven marketing strategies.`
      )}
      
      ${EmailTemplateComponents.createInfoBox(
        'What\'s Next?',
        EmailTemplateComponents.createList([
          'Complete your onboarding to get personalized recommendations',
          'Start your first 12-week marketing track',
          'Use our AI assistant whenever you need help',
          'Track your progress with our task management system'
        ])
      )}
      
      ${EmailTemplateComponents.createButton('Get Started Now', 'https://momentumdiy.com/app')}
      
      ${EmailTemplateComponents.createFooter()}
    `;

    return EmailTemplateComponents.createDocument(
      `Welcome to ${BRANDING.name}`,
      header + EmailTemplateComponents.createContentContainer(content)
    );
  }

  /**
   * Generate onboarding complete email template
   */
  static createOnboardingCompleteTemplate(data: OnboardingCompleteTemplateData): string {
    // Use the track name provided from the database
    const trackName = data.selectedTrack || 'Your Selected Marketing Track';

    const header = EmailTemplateComponents.createHeader(
      '🎉 Onboarding Complete!',
      'Your personalized marketing plan is ready'
    );

    const content = `
      ${EmailTemplateComponents.createGreeting(data.name)}
      
      ${EmailTemplateComponents.createParagraph(
        'Congratulations! You\'ve completed your onboarding and we\'ve created a personalized marketing plan just for you.'
      )}
      
      ${EmailTemplateComponents.createInfoBox(
        `Your Marketing Track: ${trackName}`,
        `
          <p style="color: ${EmailStyles.colors.gray}; margin-bottom: 15px;">Based on your business goals and challenges, we've selected the perfect 12-week program for you.</p>
          ${EmailTemplateComponents.createList([
            'Week-by-week action plan tailored to your business',
            'AI-powered marketing assistant for guidance',
            'Task tracking to keep you on track',
            'Progress monitoring to celebrate wins'
          ])}
        `
      )}
      
      ${EmailTemplateComponents.createButton('Start Your Marketing Track', 'https://momentumdiy.com/app/marketing-track')}
      
      ${EmailTemplateComponents.createFooter()}
    `;

    return EmailTemplateComponents.createDocument(
      'Onboarding Complete - ${BRANDING.name}',
      header + EmailTemplateComponents.createContentContainer(content)
    );
  }

  /**
   * Generate trial ending email template
   */
  static createTrialEndingTemplate(data: TrialEndingTemplateData): string {
    const daysRemaining = data.daysRemaining || 3;
    const header = EmailTemplateComponents.createHeader(
      '⏰ Your Free Trial Ends Soon!',
      'Don\'t miss out on growing your business'
    );

    const content = `
      ${EmailTemplateComponents.createGreeting(data.name)}
      
      ${EmailTemplateComponents.createParagraph(
        `Your free trial ends in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}. Don't let your marketing momentum stop here!`
      )}
      
      ${EmailTemplateComponents.createInfoBox(
        'What You\'ll Lose:',
        EmailTemplateComponents.createList([
          'Access to your personalized marketing track',
          'AI-powered marketing assistant',
          'Task tracking and progress monitoring',
          'Weekly progress reports and insights'
        ])
      )}
      
      ${EmailTemplateComponents.createInfoBox(
        'What You\'ll Keep:',
        EmailTemplateComponents.createList([
          'All your completed tasks and progress',
          'Access to our community and resources',
          'Priority support from our team',
          'Continued growth and success'
        ])
      )}
      
      ${EmailTemplateComponents.createButton('Continue Your Journey', 'https://momentumdiy.com/pricing')}
      
      ${EmailTemplateComponents.createFooter()}
    `;

    return EmailTemplateComponents.createDocument(
      'Trial Ending - ${BRANDING.name}',
      header + EmailTemplateComponents.createContentContainer(content)
    );
  }

  /**
   * Generate subscription active email template
   */
  static createSubscriptionActiveTemplate(data: SubscriptionActiveTemplateData): string {
    const header = EmailTemplateComponents.createHeader(
      '✅ Subscription Activated!',
      'Welcome to ${BRANDING.name}!'
    );

    const content = `
      ${EmailTemplateComponents.createGreeting(data.name)}
      
      ${EmailTemplateComponents.createParagraph(
        'Thank you for subscribing! Your account is now active and you have full access to all ${BRANDING.name} features.'
      )}
      
      ${EmailTemplateComponents.createInfoBox(
        'What\'s Included:',
        EmailTemplateComponents.createList([
          'Unlimited access to all marketing tracks',
          'AI-powered marketing assistant',
          'Advanced task tracking and analytics',
          'Priority customer support',
          'Weekly progress reports',
          'Community access and networking'
        ])
      )}
      
      ${EmailTemplateComponents.createButton('Access Your Dashboard', 'https://momentumdiy.com/app')}
      
      ${EmailTemplateComponents.createFooter()}
    `;

    return EmailTemplateComponents.createDocument(
      'Subscription Activated - ${BRANDING.name}',
      header + EmailTemplateComponents.createContentContainer(content)
    );
  }

  /**
   * Generate subscription cancelled email template
   */
  static createSubscriptionCancelledTemplate(data: SubscriptionCancelledTemplateData): string {
    const header = EmailTemplateComponents.createHeader(
      'We\'re Sorry to See You Go',
      'Here\'s what you\'ll miss'
    );

    const content = `
      ${EmailTemplateComponents.createGreeting(data.name)}
      
      ${EmailTemplateComponents.createParagraph(
        'We\'re sorry to see you go! Your subscription has been cancelled, but we hope you\'ll consider coming back to continue your marketing journey.'
      )}
      
      ${EmailTemplateComponents.createInfoBox(
        'What You\'ll Miss:',
        EmailTemplateComponents.createList([
          'Continued access to your marketing track',
          'AI-powered marketing assistant',
          'Task tracking and progress monitoring',
          'Weekly progress reports and insights',
          'Community support and networking'
        ])
      )}
      
      ${EmailTemplateComponents.createInfoBox(
        'Your Data is Safe:',
        EmailTemplateComponents.createList([
          'All your completed tasks are saved',
          'Your progress history is preserved',
          'You can reactivate anytime',
          'No data will be deleted'
        ])
      )}
      
      ${EmailTemplateComponents.createButton('Reactivate Subscription', 'https://momentumdiy.com/pricing')}
      
      ${EmailTemplateComponents.createFooter()}
    `;

    return EmailTemplateComponents.createDocument(
      'Subscription Cancelled - ${BRANDING.name}',
      header + EmailTemplateComponents.createContentContainer(content)
    );
  }

  /**
   * Generate weekly progress email template
   */
  static createWeeklyProgressTemplate(data: WeeklyProgressTemplateData): string {
    const weekNumber = data.weekNumber || 1;
    const completedTasks = data.completedTasks || 0;
    const totalTasks = data.totalTasks || 0;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const header = EmailTemplateComponents.createHeader(
      '📊 Your Weekly Marketing Progress',
      `Week ${weekNumber} Summary`
    );

    const content = `
      ${EmailTemplateComponents.createGreeting(data.name)}
      
      ${EmailTemplateComponents.createParagraph(
        `Here's your progress update for Week ${weekNumber} of your marketing track. Keep up the great work!`
      )}
      
      ${EmailTemplateComponents.createInfoBox(
        'This Week\'s Progress:',
        `
          <div style="background: ${EmailStyles.colors.white}; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: ${EmailStyles.colors.gray};">Tasks Completed:</span>
              <span style="color: ${EmailStyles.colors.primary}; font-weight: bold;">${completedTasks}/${totalTasks}</span>
            </div>
            <div style="background: ${EmailStyles.colors.lightGray}; height: 20px; border-radius: 10px; overflow: hidden;">
              <div style="background: linear-gradient(135deg, ${EmailStyles.colors.primary}, ${EmailStyles.colors.secondary}); height: 100%; width: ${progressPercentage}%; transition: width 0.3s ease;"></div>
            </div>
            <div style="text-align: center; margin-top: 5px; color: ${EmailStyles.colors.gray}; font-size: 12px;">${progressPercentage}% Complete</div>
          </div>
        `
      )}
      
      ${data.nextWeekTasks && data.nextWeekTasks.length > 0 ? EmailTemplateComponents.createInfoBox(
        'Next Week\'s Focus:',
        EmailTemplateComponents.createList(data.nextWeekTasks)
      ) : ''}
      
      ${EmailTemplateComponents.createButton('View Full Progress', 'https://momentumdiy.com/app/marketing-track')}
      
      ${EmailTemplateComponents.createFooter()}
    `;

    return EmailTemplateComponents.createDocument(
      'Weekly Progress Report - ${BRANDING.name}',
      header + EmailTemplateComponents.createContentContainer(content)
    );
  }

  /**
   * Generate task reminder email template
   */
  static createTaskReminderTemplate(data: TaskReminderTemplateData): string {
    const header = EmailTemplateComponents.createHeader(
      '⏰ Task Reminder',
      'Keep your marketing momentum going!'
    );

    const content = `
      ${EmailTemplateComponents.createGreeting(data.name)}
      
      ${EmailTemplateComponents.createParagraph(
        `This is a friendly reminder about your upcoming task: <strong>${data.taskTitle || 'Marketing Task'}</strong>`
      )}
      
      ${data.dueDate ? EmailTemplateComponents.createInfoBox(
        'Due Date:',
        `<p style="color: ${EmailStyles.colors.gray}; margin: 0;">${data.dueDate}</p>`
      ) : ''}
      
      ${data.trackName ? EmailTemplateComponents.createInfoBox(
        'From Your Track:',
        `<p style="color: ${EmailStyles.colors.gray}; margin: 0;">${data.trackName}</p>`
      ) : ''}
      
      ${EmailTemplateComponents.createButton('Complete Task Now', 'https://momentumdiy.com/app/tasks')}
      
      ${EmailTemplateComponents.createFooter()}
    `;

    return EmailTemplateComponents.createDocument(
      'Task Reminder - ${BRANDING.name}',
      header + EmailTemplateComponents.createContentContainer(content)
    );
  }

  /**
   * Generate feedback email template (for admin)
   */
  static createFeedbackTemplate(data: FeedbackTemplateData): string {
    const header = EmailTemplateComponents.createHeader(
      'New Feedback Received',
      'Customer feedback from ${BRANDING.name}'
    );

    const content = `
      <h2 style="color: ${EmailStyles.colors.dark}; margin-top: 0;">New Customer Feedback</h2>
      
      ${EmailTemplateComponents.createInfoBox(
        'Customer Details:',
        `
          <p style="color: ${EmailStyles.colors.gray}; margin: 5px 0;"><strong>Name:</strong> ${data.name}</p>
          <p style="color: ${EmailStyles.colors.gray}; margin: 5px 0;"><strong>Email:</strong> ${data.email}</p>
          <p style="color: ${EmailStyles.colors.gray}; margin: 5px 0;"><strong>Rating:</strong> ${data.rating}/5 ⭐</p>
          <p style="color: ${EmailStyles.colors.gray}; margin: 5px 0;"><strong>Category:</strong> ${data.category}</p>
        `
      )}
      
      ${EmailTemplateComponents.createInfoBox(
        'Subject:',
        `<p style="color: ${EmailStyles.colors.gray}; margin: 0;">${data.subject}</p>`
      )}
      
      ${EmailTemplateComponents.createInfoBox(
        'Message:',
        `<p style="color: ${EmailStyles.colors.gray}; margin: 0; white-space: pre-wrap;">${data.message}</p>`
      )}
      
      ${EmailTemplateComponents.createButton('View in Dashboard', 'https://momentumdiy.com/admin/feedback')}
      
      ${EmailTemplateComponents.createFooter()}
    `;

    return EmailTemplateComponents.createDocument(
      'New Feedback - ${BRANDING.name}',
      header + EmailTemplateComponents.createContentContainer(content)
    );
  }

  /**
   * Generate partner approval email template
   */
  static createPartnerApprovalTemplate(data: PartnerApprovalTemplateData): string {
    const header = EmailTemplateComponents.createHeader(
      'Welcome to the Affiliate Partner Program!',
      'Your application has been approved'
    );

    const content = `
      <h2 style="color: ${EmailStyles.colors.dark}; margin-top: 0;">Congratulations, ${data.name}!</h2>
      
      ${EmailTemplateComponents.createParagraph(
        'We\'re excited to let you know that your application to become an affiliate partner has been approved!'
      )}
      
      ${EmailTemplateComponents.createInfoBox(
        'Your Referral Code:',
        `<p style="color: ${EmailStyles.colors.dark}; margin: 0; font-size: 24px; font-weight: bold; font-family: monospace;">${data.referralCode}</p>`
      )}
      
      ${EmailTemplateComponents.createParagraph(
        'You can now start earning 20% recurring commissions for 12 months on every referral that signs up and makes their first payment.'
      )}
      
      ${EmailTemplateComponents.createParagraph(
        '<strong>Next Steps:</strong>'
      )}
      
      <ul style="color: ${EmailStyles.colors.gray}; line-height: 1.8;">
        <li>Access your affiliate dashboard using the link below</li>
        <li>Share your referral link with your clients and network</li>
        <li>Track your referrals and earnings in real-time</li>
        <li>Set up your bank account for payouts (minimum $10)</li>
      </ul>
      
      ${EmailTemplateComponents.createButton('Access Your Dashboard', data.dashboardUrl)}
      
      ${EmailTemplateComponents.createParagraph(
        `<strong>Important:</strong> You'll need to sign in to access your dashboard. If you don't have an account yet, you can use the "Forgot Password" option on the sign-in page to set up your password.`
      )}
      
      ${EmailTemplateComponents.createParagraph(
        'If you have any questions, feel free to reach out to us at <a href="mailto:info@hillaryedenmcmullen.com" style="color: ${EmailStyles.colors.primary};">info@hillaryedenmcmullen.com</a>.'
      )}
      
      ${EmailTemplateComponents.createFooter()}
    `;

    return EmailTemplateComponents.createDocument(
      'Welcome to the Affiliate Partner Program - ${BRANDING.name}',
      header + EmailTemplateComponents.createContentContainer(content)
    );
  }

  /**
   * Generate partner rejection email template
   */
  static createPartnerRejectionTemplate(data: PartnerRejectionTemplateData): string {
    const header = EmailTemplateComponents.createHeader(
      'Affiliate Partner Application Update',
      'Thank you for your interest'
    );

    const content = `
      <h2 style="color: ${EmailStyles.colors.dark}; margin-top: 0;">Hello ${data.name},</h2>
      
      ${EmailTemplateComponents.createParagraph(
        'Thank you for your interest in becoming an affiliate partner with ${BRANDING.name}. We appreciate the time you took to submit your application.'
      )}
      
      ${EmailTemplateComponents.createParagraph(
        'After careful review, we\'re unable to approve your application at this time. This decision is based on our current program requirements and capacity.'
      )}
      
      ${data.rejectionReason ? EmailTemplateComponents.createInfoBox(
        'Additional Information:',
        `<p style="color: ${EmailStyles.colors.gray}; margin: 0;">${data.rejectionReason}</p>`
      ) : ''}
      
      ${EmailTemplateComponents.createParagraph(
        'We encourage you to reapply in the future as our program evolves. If you have any questions or would like feedback on your application, please don\'t hesitate to reach out to us at <a href="mailto:info@hillaryedenmcmullen.com" style="color: ${EmailStyles.colors.primary};">info@hillaryedenmcmullen.com</a>.'
      )}
      
      ${EmailTemplateComponents.createParagraph(
        'Thank you again for your interest in ${BRANDING.name}.'
      )}
      
      ${EmailTemplateComponents.createFooter()}
    `;

    return EmailTemplateComponents.createDocument(
      'Affiliate Partner Application Update - ${BRANDING.name}',
      header + EmailTemplateComponents.createContentContainer(content)
    );
  }
}

