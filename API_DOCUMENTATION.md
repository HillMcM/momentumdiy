# Client Portal API Documentation

## Overview

This document provides comprehensive documentation for all API endpoints in the Client Portal application.

**Base URL (Development):** `http://localhost:3001/api`  
**Base URL (Production):** Your production backend URL

**Authentication:** Most endpoints require Bearer token authentication via the `Authorization` header.

```
Authorization: Bearer <your-jwt-token>
```

---

## Table of Contents

1. [Authentication](#authentication)
2. [User Profile](#user-profile)
3. [Marketing](#marketing)
4. [Tasks & Projects](#tasks--projects)
5. [AI Assistant](#ai-assistant)
6. [Stripe & Payments](#stripe--payments)
7. [Affiliate Program](#affiliate-program)
8. [Notifications](#notifications)
9. [Social Strategy](#social-strategy)
10. [Calendar](#calendar)
11. [Assets](#assets)

---

## Authentication

All authenticated endpoints require a valid Supabase JWT token obtained through the Supabase Auth API.

### Common Response Format

```typescript
{
  success: boolean;
  data?: any;           // Present on success
  error?: string;       // Present on failure
}
```

---

## User Profile

### GET /api/stripe/profile

Get the current user's profile with subscription information.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "business_name": "My Business",
    "subscription_status": "active",
    "subscription_plan": "growth",
    "trial_end_date": "2025-11-13T00:00:00Z",
    "email_preferences": {
      "weekly_progress": true,
      "task_reminders": true,
      "marketing_emails": true
    }
  }
}
```

### PUT /api/stripe/profile

Update user profile information.

**Authentication:** Required

**Request Body:**
```json
{
  "business_name": "Updated Business Name",
  "business_category": "cafe",
  "location": "New York, NY",
  "onboarding_completed": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "business_name": "Updated Business Name",
    ...
  }
}
```

---

## Marketing

### GET /api/marketing/goals

Get all marketing goals for the current user.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Build Social Media Presence",
      "description": "12-week program...",
      "is_active": true,
      "progress": 45,
      "created_at": "2025-10-01T00:00:00Z"
    }
  ]
}
```

### GET /api/marketing/goals/active

Get the currently active marketing goal for the user.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Build Social Media Presence",
    "modules": [...],
    "current_week": 3,
    "progress": 45
  }
}
```

### POST /api/marketing/goals

Create a new marketing goal.

**Authentication:** Required

**Request Body:**
```json
{
  "track_definition_id": "uuid",
  "start_date": "2025-10-13"
}
```

### GET /api/marketing/modules/:goalId

Get all modules for a specific marketing goal.

**Authentication:** Required

### GET /api/marketing/tasks/:moduleId

Get all tasks for a specific module.

**Authentication:** Required

### PATCH /api/marketing/tasks/:taskId

Update a task's status.

**Authentication:** Required

**Request Body:**
```json
{
  "status": "completed",
  "completed_at": "2025-10-13T14:30:00Z"
}
```

---

## Tasks & Projects

### GET /api/tasks

Get all tasks for the current user.

**Authentication:** Required

**Query Parameters:**
- `status` (optional): Filter by status (pending, in_progress, completed)
- `project_id` (optional): Filter by project ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Create content calendar",
      "status": "in_progress",
      "priority": "high",
      "due_date": "2025-10-20T00:00:00Z",
      "project_id": "uuid"
    }
  ]
}
```

### POST /api/tasks

Create a new task.

**Authentication:** Required

**Request Body:**
```json
{
  "title": "New task title",
  "description": "Task description",
  "status": "pending",
  "priority": "medium",
  "due_date": "2025-10-20"
}
```

### PATCH /api/tasks/:id

Update an existing task.

**Authentication:** Required

### DELETE /api/tasks/:id

Delete a task.

**Authentication:** Required

### GET /api/projects

Get all projects for the current user.

**Authentication:** Required

### POST /api/projects

Create a new project.

**Authentication:** Required

---

## AI Assistant

### POST /api/ai/chat

Send a message to the AI assistant.

**Authentication:** Optional (better personalization when authenticated)

**Rate Limit:** 30 requests per 15 minutes

**Request Body:**
```json
{
  "message": "How can I improve my social media engagement?",
  "conversationHistory": [],
  "userBusinessType": "cafe",
  "userIndustry": "food-service",
  "pagePath": "/app/marketing"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "Here are some strategies...",
    "context": {
      "hasActiveTrack": true,
      "currentWeek": 3,
      "tasksCount": 12
    }
  }
}
```

**Usage Limits:**
- Free tier: 50 messages per month
- Paid tiers: 200+ messages per month

---

## Stripe & Payments

### POST /api/stripe/create-subscription

Create a new subscription checkout session.

**Authentication:** Required

**Rate Limit:** 10 requests per 15 minutes

**Request Body:**
```json
{
  "plan": "growth",
  "interval": "monthly"
}
```

**Plans:** `spark`, `growth`, `lead`, `founder`  
**Intervals:** `monthly`, `yearly`

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "cs_test_...",
    "url": "https://checkout.stripe.com/pay/cs_test_..."
  }
}
```

### POST /api/stripe/cancel-subscription

Cancel the current subscription.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Subscription will be cancelled at period end"
}
```

### POST /api/stripe/webhook

Webhook endpoint for Stripe events. (Called by Stripe, not clients)

**Authentication:** Stripe signature verification

**Handles Events:**
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

---

## Affiliate Program

### GET /api/affiliate/status

Get current user's affiliate status and referral code.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "is_affiliate": true,
    "referral_code": "ABC123",
    "total_referrals": 5,
    "total_earnings": 125.00,
    "pending_payout": 75.00
  }
}
```

### POST /api/affiliate/join

Join the affiliate program.

**Authentication:** Required

**Request Body:**
```json
{
  "payment_email": "paypal@example.com",
  "payment_method": "paypal"
}
```

### GET /api/affiliate/referrals

Get all referrals for the current affiliate.

**Authentication:** Required

### GET /api/affiliate/payouts

Get payout history for the current affiliate.

**Authentication:** Required

---

## Notifications

### GET /api/notifications

Get all notifications for the current user.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "task_reminder",
      "title": "Task due soon",
      "message": "Your task 'Create content' is due tomorrow",
      "read": false,
      "created_at": "2025-10-13T10:00:00Z"
    }
  ]
}
```

### PATCH /api/notifications/:id/read

Mark a notification as read.

**Authentication:** Required

### GET /api/email-preferences

Get user's email notification preferences.

**Authentication:** Required

### PUT /api/email-preferences

Update email notification preferences.

**Authentication:** Required

**Request Body:**
```json
{
  "weekly_progress": true,
  "task_reminders": false,
  "marketing_emails": true,
  "trial_emails": true
}
```

---

## Social Strategy

### GET /api/social-strategy/hub

Get user's social strategy hub data (content pillars, schedule, templates).

**Authentication:** Required

### POST /api/social-strategy/pillars

Create or update content pillars.

**Authentication:** Required

**Request Body:**
```json
{
  "pillars": [
    {
      "name": "Behind the Scenes",
      "description": "Show daily operations",
      "color": "#FF6B6B"
    }
  ]
}
```

### POST /api/social-strategy/schedule

Create or update posting schedule.

**Authentication:** Required

### POST /api/social-strategy/templates

Upload a new template.

**Authentication:** Required

---

## Calendar

### GET /api/calendar/events

Get all calendar events for the current user.

**Authentication:** Required

**Query Parameters:**
- `start_date` (optional): Filter events starting from this date
- `end_date` (optional): Filter events up to this date

### POST /api/calendar/events

Create a new calendar event.

**Authentication:** Required

**Request Body:**
```json
{
  "title": "Social media planning session",
  "start_time": "2025-10-15T14:00:00Z",
  "end_time": "2025-10-15T15:00:00Z",
  "description": "Plan next week's content"
}
```

### PATCH /api/calendar/events/:id

Update a calendar event.

**Authentication:** Required

### DELETE /api/calendar/events/:id

Delete a calendar event.

**Authentication:** Required

---

## Assets

### GET /api/assets

Get all assets for the current user.

**Authentication:** Required

**Query Parameters:**
- `category` (optional): Filter by category (image, video, document)

### POST /api/assets

Upload a new asset.

**Authentication:** Required

**Request Body:** Multipart form data
- `file`: The file to upload
- `category`: Asset category
- `tags`: Array of tags

### DELETE /api/assets/:id

Delete an asset.

**Authentication:** Required

---

## Admin Routes

### GET /api/admin/tracks

Get all marketing track definitions (admin only).

**Authentication:** Required + Admin

### POST /api/admin/tracks

Create a new marketing track definition.

**Authentication:** Required + Admin

### PUT /api/admin/tracks/:id

Update a marketing track definition.

**Authentication:** Required + Admin

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required or invalid |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## Rate Limiting

Most endpoints are rate-limited to prevent abuse:

- **Default:** 100 requests per 15 minutes
- **AI Chat:** 30 requests per 15 minutes
- **Stripe operations:** 10 requests per 15 minutes
- **Admin routes:** No rate limiting

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1634140800
```

---

## Webhooks

### Stripe Webhooks

**Endpoint:** `/api/stripe/webhook`

Configure in Stripe Dashboard:
1. Go to Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select events: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET` environment variable

---

## SDK & Client Libraries

### JavaScript/TypeScript Example

```typescript
import { supabase } from './lib/supabase';

// Get API token
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

// Make API request
const response = await fetch('http://localhost:3001/api/tasks', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

---

## Support

For API support, contact: support@momentumdiy.com

For bug reports or feature requests, please create an issue in the repository.



