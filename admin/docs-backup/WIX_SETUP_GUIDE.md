# Wix Collections Setup Guide

## Overview
This guide will help you set up Wix collections for automatic data collection with your AI agent system.

## Quick Start

### 1. Create Collections
Go to your Wix Dashboard > Content Manager > Collections and create the following:


#### 1. Site Analytics
- **Description**: Site traffic and performance data
- **Fields**: totalVisitors (Number), totalPageViews (Number), averageSessionDuration (Number), bounceRate (Number), topPages (Text), trafficSources (Text), date (Date), lastUpdated (Date)
- **Sample Data**: See `wix-collection-site-analytics.json`

#### 2. Form Submissions
- **Description**: Contact form and waitlist submissions
- **Fields**: formName (Text), email (Text), name (Text), message (Text), phone (Text), date (Date), source (Text), status (Text)
- **Sample Data**: See `wix-collection-form-submissions.json`

#### 3. Newsletter Subscribers
- **Description**: Email newsletter subscribers
- **Fields**: email (Text), name (Text), dateSubscribed (Date), status (Text), source (Text), lastEmailSent (Date)
- **Sample Data**: See `wix-collection-newsletter-subscribers.json`

#### 4. Contact Leads
- **Description**: Contact form leads and inquiries
- **Fields**: name (Text), email (Text), phone (Text), message (Text), date (Date), status (Text), source (Text), priority (Text)
- **Sample Data**: See `wix-collection-contact-leads.json`


### 2. Set Up Automatic Data Collection

#### Form Submissions
1. Go to your form settings
2. Enable "Save to Database"
3. Select the "Form Submissions" collection
4. Map form fields to collection fields

#### Newsletter Subscriptions
1. Go to Email Marketing settings
2. Enable "Save subscribers to collection"
3. Select the "Newsletter Subscribers" collection

#### Analytics Data
1. Create a scheduled task to update analytics
2. Use Wix's Analytics API or manual updates
3. Save data to the "Site Analytics" collection

### 3. Test the Integration
```bash
node test-integration-status.js
```

## Collection Details


### Site Analytics
- **Collection ID**: site-analytics
- **Purpose**: Site traffic and performance data

**Fields:**
- `totalVisitors` (Number) - Required
- `totalPageViews` (Number) - Required
- `averageSessionDuration` (Number) - Required
- `bounceRate` (Number) - Required
- `topPages` (Text)
- `trafficSources` (Text)
- `date` (Date) - Required
- `lastUpdated` (Date) - Required

**Sample Data:**
```json
{
  "totalVisitors": 150,
  "totalPageViews": 750,
  "averageSessionDuration": 180,
  "bounceRate": 42,
  "topPages": "Home, About, Contact, Blog",
  "trafficSources": "Direct, Google, Social Media",
  "date": "2025-07-28",
  "lastUpdated": "2025-07-28T18:46:05.614Z"
}
```


### Form Submissions
- **Collection ID**: form-submissions
- **Purpose**: Contact form and waitlist submissions

**Fields:**
- `formName` (Text) - Required
- `email` (Text) - Required
- `name` (Text)
- `message` (Text)
- `phone` (Text)
- `date` (Date) - Required
- `source` (Text)
- `status` (Text)

**Sample Data:**
```json
{
  "formName": "Contact Form",
  "email": "john@example.com",
  "name": "John Doe",
  "message": "Interested in your services",
  "phone": "+1234567890",
  "date": "2025-07-28T18:46:05.614Z",
  "source": "Website",
  "status": "New"
}
```


### Newsletter Subscribers
- **Collection ID**: newsletter-subscribers
- **Purpose**: Email newsletter subscribers

**Fields:**
- `email` (Text) - Required
- `name` (Text)
- `dateSubscribed` (Date) - Required
- `status` (Text) - Required
- `source` (Text)
- `lastEmailSent` (Date)

**Sample Data:**
```json
{
  "email": "jane@example.com",
  "name": "Jane Smith",
  "dateSubscribed": "2025-07-28T18:46:05.614Z",
  "status": "Active",
  "source": "Website Popup",
  "lastEmailSent": null
}
```


### Contact Leads
- **Collection ID**: contact-leads
- **Purpose**: Contact form leads and inquiries

**Fields:**
- `name` (Text) - Required
- `email` (Text) - Required
- `phone` (Text)
- `message` (Text)
- `date` (Date) - Required
- `status` (Text) - Required
- `source` (Text)
- `priority` (Text)

**Sample Data:**
```json
{
  "name": "Bob Johnson",
  "email": "bob@example.com",
  "phone": "+1987654321",
  "message": "Looking for automation services",
  "date": "2025-07-28T18:46:05.614Z",
  "status": "New",
  "source": "Contact Form",
  "priority": "High"
}
```


## Webhooks Setup


### Form Submission Webhook
- **Trigger**: Form submission
- **Action**: Create record in Form Submissions collection
- **Setup**: Use Wix's built-in form handling with database integration


### Newsletter Subscription Webhook
- **Trigger**: Newsletter signup
- **Action**: Create record in Newsletter Subscribers collection
- **Setup**: Use Wix's email marketing integration


## Troubleshooting

### Common Issues
1. **Collection not found**: Make sure collection names match exactly
2. **Permission denied**: Check collection permissions
3. **Data not saving**: Verify webhook configuration

### Testing
1. Run the setup script: `node setup-wix-analytics.js`
2. Check integration status: `node test-integration-status.js`
3. Test data analyst: `node test-lead-sales-integration.js`

## Next Steps
1. Set up the collections as described above
2. Add sample data to test the integration
3. Configure webhooks for automatic data collection
4. Test the complete system
5. Monitor data collection and adjust as needed

For more help, see the Wix documentation or run the setup scripts.
