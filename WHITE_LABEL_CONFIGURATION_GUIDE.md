# White-Label Configuration Guide

## Quick Start

This guide explains how to configure the application for enterprise white-label deployments.

## Configuration Files

### Backend Configuration

**Location:** `backend/src/config/branding.ts`

Provides centralized branding configuration with environment variable support:
- Company name, email, domain
- Logo URL
- Brand colors (primary, secondary)
- Support email
- Legal company name
- AI assistant configuration

### Frontend Configuration

**Location:** `Frontend/src/config/branding.ts`

Mirrors backend configuration for frontend components with `VITE_` prefix for environment variables.

## Environment Variables

### Backend (.env)

```bash
# White-Label Branding
BRAND_NAME=MomentumDIY
BRAND_EMAIL=hello@momentumdiy.com
BRAND_DOMAIN=momentumdiy.com
BRAND_LOGO_URL=https://momentumdiy.com/assets/logo.png
BRAND_PRIMARY_COLOR=#EF8E81
BRAND_SECONDARY_COLOR=#D4AF37
BRAND_SUPPORT_EMAIL=support@momentumdiy.com
BRAND_LEGAL_NAME=MomentumDIY

# AI Assistant
AI_ASSISTANT_NAME=Hillary
AI_ASSISTANT_PERSONA=marketing-consultant
AI_ASSISTANT_TITLE=Marketing Consultant
```

### Frontend (.env)

```bash
# White-Label Branding (VITE_ prefix required)
VITE_BRAND_NAME=MomentumDIY
VITE_BRAND_EMAIL=hello@momentumdiy.com
VITE_BRAND_DOMAIN=momentumdiy.com
VITE_BRAND_LOGO_URL=https://momentumdiy.com/assets/logo.png
VITE_BRAND_PRIMARY_COLOR=#EF8E81
VITE_BRAND_SECONDARY_COLOR=#D4AF37
VITE_BRAND_SUPPORT_EMAIL=support@momentumdiy.com
VITE_BRAND_LEGAL_NAME=MomentumDIY

# AI Assistant
VITE_AI_ASSISTANT_NAME=Hillary
```

## Usage Examples

### Backend

```typescript
import { BRANDING, AI_ASSISTANT } from '../config/branding';

// Email templates
const fromEmail = `${BRANDING.name} <${BRANDING.email}>`;
const supportEmail = BRANDING.supportEmail;

// Email content
const welcomeMessage = `Welcome to ${BRANDING.name}!`;
const copyrightNotice = `© ${new Date().getFullYear()} ${BRANDING.legalName}`;

// AI assistant
const assistantGreeting = `Hi! I'm ${AI_ASSISTANT.name}, your ${AI_ASSISTANT.title}.`;
```

### Frontend

```typescript
import { BRANDING, AI_ASSISTANT } from './config/branding';

// Component rendering
function Header() {
  return (
    <header>
      <h1>{BRANDING.name}</h1>
      <img src={BRANDING.logoUrl} alt={BRANDING.name} />
    </header>
  );
}

// Styled with brand colors
function Button() {
  return (
    <button style={{ backgroundColor: BRANDING.primaryColor }}>
      Click me
    </button>
  );
}

// Contact information
function Footer() {
  return (
    <footer>
      <a href={`mailto:${BRANDING.supportEmail}`}>
        {BRANDING.supportEmail}
      </a>
      <p>© {new Date().getFullYear()} {BRANDING.legalName}</p>
    </footer>
  );
}
```

## White-Label Deployment Checklist

### 1. Prepare Brand Assets

- [ ] Company logo (60x60px recommended for emails)
- [ ] Brand color palette (hex codes)
- [ ] Legal company name
- [ ] Domain name
- [ ] Support email address

### 2. Configure Environment Variables

- [ ] Set all `BRAND_*` variables in backend `.env`
- [ ] Set all `VITE_BRAND_*` variables in frontend `.env`
- [ ] Configure `AI_ASSISTANT_*` variables if customizing

### 3. Test Configuration

- [ ] Start backend: `cd backend && npm run dev`
- [ ] Start frontend: `cd Frontend && npm run dev`
- [ ] Check landing page displays correct brand name
- [ ] Send test email and verify branding
- [ ] Check email footer has correct support email
- [ ] Verify copyright notice shows correct legal name

### 4. Build and Deploy

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd Frontend
npm run build
# Deploy dist/ folder to your CDN/hosting
```

### 5. Post-Deployment Verification

- [ ] Landing page shows correct branding
- [ ] Emails sent with correct from/support addresses
- [ ] Email templates display correct logo and colors
- [ ] AI assistant uses correct name (if customized)
- [ ] Footer copyright is correct
- [ ] All links use correct domain

## Default Values

If environment variables are not set, the system defaults to MomentumDIY branding:

| Variable | Default Value |
|----------|---------------|
| BRAND_NAME | MomentumDIY |
| BRAND_EMAIL | info@hillaryedenmcmullen.com |
| BRAND_DOMAIN | momentumdiy.com |
| BRAND_LOGO_URL | https://momentumdiy.com/logo.png |
| BRAND_PRIMARY_COLOR | #EF8E81 |
| BRAND_SECONDARY_COLOR | #D4AF37 |
| BRAND_SUPPORT_EMAIL | info@hillaryedenmcmullen.com |
| BRAND_LEGAL_NAME | MomentumDIY |
| AI_ASSISTANT_NAME | Hillary |
| AI_ASSISTANT_PERSONA | marketing-consultant |
| AI_ASSISTANT_TITLE | Marketing Consultant |

## Files Updated for White-Label Support

### Completed
- ✅ `backend/src/services/emailService.ts`
- ✅ `backend/src/services/emailTemplates.ts`
- ✅ `Frontend/src/LandingPage.tsx`
- ✅ `Frontend/src/services/api.ts`

### To Be Updated
- `Frontend/src/App.tsx`
- `Frontend/src/components/OnboardingWizard.tsx`
- `Frontend/src/TermsPage.tsx`
- `Frontend/src/config/trackConfigs.ts`
- ~20 additional component files

## Troubleshooting

### Branding Not Appearing

1. **Check environment variables are set:**
   ```bash
   # Backend
   echo $BRAND_NAME
   
   # Frontend (must include VITE_ prefix)
   echo $VITE_BRAND_NAME
   ```

2. **Restart servers after changing .env:**
   - Environment variables are loaded at startup
   - Changes require server restart

3. **Verify import statements:**
   ```typescript
   // Correct
   import { BRANDING } from './config/branding';
   
   // Incorrect
   import BRANDING from './config/branding'; // ❌
   ```

### Emails Show Default Branding

1. **Check backend .env has BRAND_* variables** (without VITE_ prefix)
2. **Verify Resend API key is set:** `RESEND_API_KEY`
3. **Send test email to verify:**
   ```bash
   curl -X POST http://localhost:3001/api/email/test
   ```

### Frontend Shows "Undefined"

1. **Ensure VITE_ prefix** on all frontend environment variables
2. **Rebuild frontend** after changing .env:
   ```bash
   cd Frontend
   npm run build
   ```

### Development vs Production

- **Development:** Console logs show configuration loading
- **Production:** Environment validation enforces required variables

## Best Practices

1. **Keep branding consistent** - Use same values in backend and frontend .env files
2. **Test email branding early** - Email templates are critical for white-label
3. **Document custom configurations** - Create `.env.example` for each deployment
4. **Use environment-specific files** - `.env.production`, `.env.staging`
5. **Never commit .env files** - Keep credentials and configuration secure

## Advanced Configuration

### Multiple Brand Deployments

For managing multiple white-label deployments:

1. **Create brand-specific .env files:**
   - `.env.acmecorp`
   - `.env.techstartup`
   - `.env.consulting`

2. **Load appropriate config on deployment:**
   ```bash
   cp .env.acmecorp .env
   npm run build
   npm start
   ```

3. **Use deployment scripts to automate**

### Dynamic Brand Loading (Future Enhancement)

For multi-tenant deployments where brands are stored in database:

1. Add `tenant_id` to requests
2. Load branding from database based on tenant
3. Cache branding configuration
4. Override default BRANDING with tenant-specific values

## Support

For issues with white-label configuration:

1. Check this guide first
2. Review `CODEBASE_AUDIT_SUMMARY.md`
3. Verify environment variables are set correctly
4. Contact development team if issues persist

---

**Last Updated:** October 8, 2025

