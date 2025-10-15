# 📚 Documentation Index

Comprehensive documentation for the MomentumDIY Client Portal Application.

---

## 🗂 Documentation Structure

### Getting Started
1. **[Main README](../README.md)** - Project overview, quick start, and features
2. **[Environment Setup](ENVIRONMENT.md)** - Complete environment variable guide
3. **[Deployment Guide](DEPLOYMENT.md)** - Step-by-step deployment instructions

### Technical Documentation
4. **[API Documentation](API.md)** - Complete API endpoint reference
5. **[Email System](EMAIL.md)** - Email templates and automation architecture
6. **[Admin Guide](ADMIN.md)** - Admin panel and content management

### Configuration
7. **[White-Label Guide](WHITE_LABEL.md)** - Brand customization and configuration

---

## 📖 Quick Links

### For Developers

**Getting Started:**
- [Quick Start Guide](../README.md#-quick-start)
- [Project Structure](../README.md#-project-structure)
- [Development Workflow](../README.md#-development)

**API & Backend:**
- [API Endpoints](API.md)
- [Backend README](../backend/README.md)
- [Authentication](API.md#authentication)

**Frontend:**
- [Frontend README](../Frontend/README.md)
- [Component Structure](../README.md#-project-structure)

**Database:**
- [Migrations](../supabase/migrations/)
- [RLS Policies](DEPLOYMENT.md#database)

### For Operations

**Deployment:**
- [Deployment Checklist](DEPLOYMENT.md#-pre-deployment-checklist)
- [Infrastructure Setup](DEPLOYMENT.md#-infrastructure-setup)
- [Troubleshooting](DEPLOYMENT.md#-troubleshooting)

**Configuration:**
- [Environment Variables](ENVIRONMENT.md)
- [White-Label Setup](WHITE_LABEL.md)
- [Email Configuration](EMAIL.md)

**Monitoring:**
- [Health Checks](DEPLOYMENT.md#monitoring)
- [Error Tracking](DEPLOYMENT.md#monitoring)
- [Analytics Setup](../README.md#-monitoring--analytics)

### For Content Managers

**Admin Panel:**
- [Admin Access](ADMIN.md)
- [Marketing Track Management](ADMIN.md)
- [Content Updates](ADMIN.md)

---

## 🎯 Common Tasks

### Local Development Setup
```bash
# See: README.md#quick-start
1. Install NVM and Node.js 22
2. Install dependencies (backend + frontend)
3. Set up environment variables
4. Start Supabase locally
5. Run migrations
6. Start dev servers
```

### Deploying to Production
```bash
# See: DEPLOYMENT.md
1. Review pre-deployment checklist
2. Commit and push to main
3. Monitor deployments (Render + Vercel)
4. Verify deployment
5. Run smoke tests
```

### Adding Environment Variables
```bash
# See: ENVIRONMENT.md
1. Add to backend/env.example or Frontend/.env.example
2. Update production environment (Render/Vercel dashboard)
3. Restart services if needed
4. Document in ENVIRONMENT.md
```

### Customizing Branding
```bash
# See: WHITE_LABEL.md
1. Set BRAND_* environment variables
2. Upload logo to storage
3. Update colors in config
4. Rebuild and deploy
```

### Running Database Migrations
```bash
# See: DEPLOYMENT.md#database-migrations
1. Create migration: supabase migration new <name>
2. Write SQL in new migration file
3. Test locally: supabase db push
4. Push to Git - auto-applies to production
```

---

## 🔧 Technical Reference

### Architecture

**Frontend (React + Vite):**
- `/Frontend/src/components` - Reusable UI components
- `/Frontend/src/pages` - Page components
- `/Frontend/src/contexts` - React Context providers
- `/Frontend/src/services` - API client services
- `/Frontend/src/hooks` - Custom React hooks

**Backend (Express + TypeScript):**
- `/backend/src/routes` - API route handlers
- `/backend/src/services` - Business logic
- `/backend/src/middleware` - Express middleware
- `/backend/src/config` - Configuration files
- `/backend/src/utils` - Utility functions

**Database (Supabase):**
- `/supabase/migrations` - Database migrations
- Row Level Security (RLS) enabled on all tables
- Real-time subscriptions available

### Tech Stack

**Frontend:**
- React 18.3, TypeScript 5.3, Vite 7.0
- Tailwind CSS, Radix UI
- React Router, React Context
- Vercel Analytics & Speed Insights

**Backend:**
- Node.js 22.20, Express, TypeScript 5.3
- Supabase (PostgreSQL)
- Stripe, Resend, Anthropic, Gemini
- Sentry monitoring

**Infrastructure:**
- Frontend: Vercel (auto-deploy on push)
- Backend: Render (auto-deploy on push)
- Database: Supabase (managed PostgreSQL)
- Storage: Supabase Storage
- CDN: Vercel Edge Network

---

## 📝 Documentation Guidelines

When updating documentation:

1. **Keep it current** - Update docs when code changes
2. **Be specific** - Include examples and code snippets
3. **Be comprehensive** - Cover edge cases and troubleshooting
4. **Use formatting** - Make it easy to scan and read
5. **Link related docs** - Cross-reference when helpful

### Documentation Files

**Main Files (keep updated):**
- `README.md` - Project overview
- `docs/API.md` - API reference
- `docs/DEPLOYMENT.md` - Deployment guide
- `docs/ENVIRONMENT.md` - Environment variables

**Generated Files:**
- Don't commit build output
- Don't commit sensitive data
- Don't commit temporary notes

---

## 🆘 Getting Help

### Resources

1. **Documentation**: Start here!
2. **Code Comments**: Check inline documentation
3. **Git History**: Review commit messages
4. **Error Logs**: Check Sentry, Render, Vercel logs

### Troubleshooting

**Development Issues:**
- Check environment variables
- Verify dependencies installed
- Check Supabase is running
- Review terminal errors

**Deployment Issues:**
- Check deployment logs
- Verify environment variables
- Test health endpoints
- Review Sentry errors

**Database Issues:**
- Check Supabase dashboard
- Review migration files
- Verify RLS policies
- Check connection limits

---

## 🎓 Learning Resources

### Official Documentation
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Express](https://expressjs.com/)
- [Supabase](https://supabase.com/docs)
- [Stripe](https://stripe.com/docs)
- [Vercel](https://vercel.com/docs)

### Helpful Guides
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Stripe Subscription Guide](https://stripe.com/docs/billing/subscriptions/overview)
- [React Query Guide](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 📞 Support

For questions or issues:

1. **Check documentation** - Start with these docs
2. **Review logs** - Sentry, Render, Vercel
3. **Check GitHub issues** - See if already reported
4. **Contact team** - Reach out for help

---

**Last Updated:** October 15, 2025  
**Documentation Version:** 1.0.0  
**Status:** ✅ Complete and Current

