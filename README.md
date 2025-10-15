# MomentumDIY - Client Portal Application

> **A comprehensive marketing automation platform for DIY business owners** featuring AI-powered assistance, marketing tracks, social media generation, and affiliate management.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.20-green)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.x-00C853)](https://supabase.com/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Development](#development)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Documentation](#documentation)
- [Contributing](#contributing)

---

## 🎯 Overview

MomentumDIY is a full-stack SaaS application that helps business owners manage their marketing efforts through:
- **Marketing Tracks**: Structured, week-by-week marketing plans
- **AI-Powered Tools**: Marketing assistant and social media generator
- **Task Management**: Track and manage marketing activities
- **Affiliate Program**: Built-in referral system with automatic payouts
- **Analytics**: Vercel Analytics and Speed Insights integration
- **White-Label Ready**: Customizable branding and configuration

---

## ✨ Features

### Core Features
- 🎯 **Marketing Tracks** - Structured marketing plans with weekly modules
- 🤖 **AI Marketing Assistant** - Claude-powered marketing consultant
- 🎨 **Social Media Generator** - Gemini 2.5 Flash AI for creating social posts
- 📅 **Task Management** - Track and manage marketing tasks
- 📊 **Dashboard** - Personalized dashboard with real-time insights
- 💰 **Affiliate Program** - Automated referral tracking and payouts
- 🔒 **Authentication** - Supabase Auth with subscription management
- 💳 **Payments** - Stripe integration with multiple pricing tiers
- 📧 **Email Automation** - Resend for transactional emails
- 📈 **Analytics** - Vercel Analytics and Speed Insights

### Advanced Features
- 🎭 **Social Strategy Hub** - Collaborative content planning
- 📚 **Asset Library** - Brand asset management
- 🔔 **Notifications** - Real-time in-app notifications
- 🎨 **White-Label** - Customizable branding configuration
- 🔐 **Admin Panel** - Marketing track management
- 📱 **Mobile Responsive** - Works on all devices

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18.3 with TypeScript
- **Build Tool**: Vite 7.0
- **Styling**: Tailwind CSS 3.4
- **State Management**: React Context API
- **Routing**: React Router v6
- **UI Components**: Radix UI, FullCalendar, DnD Kit
- **Analytics**: Vercel Analytics & Speed Insights
- **Hosting**: Vercel

### Backend
- **Runtime**: Node.js 22.20
- **Framework**: Express.js
- **Language**: TypeScript 5.3
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Email**: Resend
- **AI**: Anthropic Claude 3.5 Sonnet, Google Gemini 2.5 Flash
- **Monitoring**: Sentry
- **Hosting**: Render

### Infrastructure
- **Database**: Supabase (PostgreSQL with RLS)
- **File Storage**: Supabase Storage
- **CDN**: Vercel Edge Network
- **Cron Jobs**: Render Cron
- **Version Control**: Git/GitHub

---

## 🚀 Quick Start

### Prerequisites
- Node.js 22+ (using NVM recommended)
- npm 10+
- Supabase account
- Stripe account
- Anthropic API key
- Resend API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ClientPortalApp
   ```

2. **Install NVM (if not already installed)**
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
   nvm install 22
   nvm use 22
   ```

3. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../Frontend
   npm install
   ```

4. **Set up environment variables**
   ```bash
   # Backend
   cp backend/env.example backend/.env
   # Edit backend/.env with your credentials

   # Frontend
   cp Frontend/.env.example Frontend/.env
   # Edit Frontend/.env with your credentials
   ```

5. **Start Supabase (local development)**
   ```bash
   supabase start
   ```

6. **Run migrations**
   ```bash
   supabase db push
   ```

7. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd Frontend
   npm run dev
   ```

8. **Access the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001
   - Health Check: http://localhost:3001/health

---

## 📁 Project Structure

```
ClientPortalApp/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── index.ts        # Entry point
│   ├── env.example         # Environment template
│   └── package.json
│
├── Frontend/               # React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   └── App.tsx        # Root component
│   ├── public/            # Static assets
│   └── package.json
│
├── supabase/              # Database configuration
│   ├── migrations/        # SQL migrations
│   └── config.toml        # Supabase config
│
├── docs/                  # Documentation
│   ├── API.md            # API documentation
│   ├── DEPLOYMENT.md     # Deployment guide
│   ├── ENVIRONMENT.md    # Environment setup
│   └── WHITE_LABEL.md    # White-label guide
│
└── README.md             # This file
```

---

## 💻 Development

### Development Workflow

1. **Start local services**
   ```bash
   # Terminal 1: Supabase
   supabase start
   
   # Terminal 2: Backend
   cd backend && npm run dev
   
   # Terminal 3: Frontend
   cd Frontend && npm run dev
   ```

2. **Make changes**
   - Backend changes auto-reload with `tsx watch`
   - Frontend changes hot-reload with Vite HMR

3. **Test changes**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

4. **Check code quality**
   ```bash
   # Backend linting
   cd backend && npm run lint

   # Frontend linting
   cd Frontend && npm run lint
   ```

### Running Scripts

**Backend**
```bash
npm run dev                 # Start development server
npm run build               # Build for production
npm start                   # Start production server
npm run lint                # Run ESLint
npm test                    # Run tests
```

**Frontend**
```bash
npm run dev                 # Start development server
npm run build               # Build for production
npm run preview             # Preview production build
npm run lint                # Run ESLint
```

### Database Migrations

```bash
# Create new migration
supabase migration new <migration_name>

# Apply migrations locally
supabase db push

# Apply migrations to production
# (done automatically via Supabase CLI or dashboard)
```

---

## 🚢 Deployment

### Production Deployment

**Frontend (Vercel)**
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Push to main branch - auto-deploys

**Backend (Render)**
1. Connect GitHub repository to Render
2. Set environment variables in Render dashboard  
3. Push to main branch - auto-deploys

**Database (Supabase)**
1. Migrations apply automatically from Git integration
2. Or run migrations manually via Supabase CLI

### Build Commands

```bash
# Frontend (Vercel)
npm run build

# Backend (Render)
npm run build && npm start
```

### Environment Variables

See `docs/ENVIRONMENT.md` for comprehensive environment variable documentation.

**Quick Reference:**
- Backend: See `backend/env.example`
- Frontend: See `Frontend/.env.example`

---

## 🔧 Environment Variables

### Backend Required
```bash
# Core
NODE_ENV=production
PORT=3001

# Supabase
SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<your-service-key>

# Stripe
STRIPE_SECRET_KEY=<your-stripe-key>
STRIPE_WEBHOOK_SECRET=<your-webhook-secret>

# AI Services
ANTHROPIC_API_KEY=<your-anthropic-key>

# Email
RESEND_API_KEY=<your-resend-key>

# Monitoring
SENTRY_DSN=<your-sentry-dsn>
```

### Frontend Required
```bash
# API
VITE_API_BASE_URL=<your-backend-url>/api
VITE_BACKEND_URL=<your-backend-url>

# Supabase
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-anon-key>

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=<your-stripe-key>
```

---

## 📚 Documentation

Detailed documentation is available in the `/docs` directory:

- **[API Documentation](docs/API.md)** - Complete API endpoint reference
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Step-by-step deployment instructions
- **[Environment Setup](docs/ENVIRONMENT.md)** - Comprehensive environment variable guide
- **[White-Label Guide](docs/WHITE_LABEL.md)** - Branding customization
- **[Email System](docs/EMAIL.md)** - Email templates and automation
- **[Admin Guide](docs/ADMIN.md)** - Admin panel usage

---

## 🎨 White-Label Configuration

The application supports full white-label customization:

```bash
# Backend branding
BRAND_NAME=YourBrand
BRAND_EMAIL=hello@yourbrand.com
BRAND_PRIMARY_COLOR=#your-color
AI_ASSISTANT_NAME=YourAssistant

# Frontend branding
VITE_BRAND_NAME=YourBrand
VITE_BRAND_LOGO_URL=https://your-logo-url
```

See `docs/WHITE_LABEL.md` for complete customization options.

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Run with coverage
npm run test:coverage
```

---

## 📊 Monitoring & Analytics

### Vercel Analytics
- Page views and user interactions
- Performance metrics (Core Web Vitals)
- Device and browser analytics

### Sentry Error Tracking
- Real-time error monitoring
- Performance monitoring
- Release tracking

### Application Health
- Health check endpoint: `/health`
- Structured logging with context
- Error tracking with Sentry

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run linting: `npm run lint`
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature/your-feature`
6. Open a Pull Request

### Code Standards
- TypeScript strict mode enabled
- ESLint for code quality
- Follow existing code patterns
- Add comments for complex logic
- Update documentation as needed

---

## 🔒 Security

- Row Level Security (RLS) on all database tables
- JWT authentication via Supabase
- Rate limiting on API endpoints
- Input validation on all endpoints
- Helmet.js for security headers
- CORS properly configured
- Secrets managed via environment variables
- Sentry for error tracking

---

## 📝 License

MIT License - see LICENSE file for details

---

## 🆘 Support

For issues or questions:
1. Check the documentation in `/docs`
2. Review the API documentation
3. Check Sentry for error logs
4. Review Supabase logs
5. Check Render deployment logs

---

## 🎉 Acknowledgments

- Built with React, Express, Supabase, and Stripe
- AI powered by Anthropic Claude and Google Gemini
- UI components from Radix UI and Tailwind CSS
- Analytics by Vercel
- Monitoring by Sentry

---

**Last Updated:** October 15, 2025  
**Version:** 1.0.3  
**Status:** ✅ Production Ready
