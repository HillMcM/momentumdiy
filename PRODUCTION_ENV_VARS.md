# 🚀 Production Environment Variables Setup

## 📋 **Required Environment Variables**

### **Backend Environment Variables**

#### **Core Configuration**
```bash
NODE_ENV=production
PORT=3001
```

#### **Supabase Configuration**
```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

#### **JWT Configuration**
```bash
JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters-long
JWT_EXPIRES_IN=7d
```

#### **Rate Limiting**
```bash
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

#### **CORS Configuration**
```bash
CORS_ORIGIN=https://your-frontend-domain.com,https://your-backend-domain.com
```

#### **Stripe Configuration**
```bash
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

#### **Stripe Price IDs**
```bash
STRIPE_PRICE_MONTHLY=price_your_monthly_price_id
STRIPE_PRICE_ANNUAL=price_your_annual_price_id
STRIPE_PRICE_SPARK_MONTHLY=price_your_spark_monthly_id
STRIPE_PRICE_GROWTH_MONTHLY=price_your_growth_monthly_id
STRIPE_PRICE_LEAD_MONTHLY=price_your_lead_monthly_id
```

#### **Email Configuration**
```bash
RESEND_API_KEY=re_your_resend_api_key_here
```

#### **AI Services**
```bash
ANTHROPIC_API_KEY=sk-ant-your_anthropic_api_key_here
```

#### **Optional Services**
```bash
NOTION_API_KEY=your_notion_api_key_here
```

### **Frontend Environment Variables**

#### **API Configuration**
```bash
VITE_API_URL=https://your-backend-domain.com
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_BACKEND_URL=https://your-backend-domain.com
```

#### **Supabase Configuration**
```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

#### **Stripe Configuration**
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key_here
VITE_STRIPE_PRICE_MONTHLY=price_your_monthly_price_id
VITE_STRIPE_PRICE_ANNUAL=price_your_annual_price_id
VITE_STRIPE_PRICE_SPARK_MONTHLY=price_your_spark_monthly_id
VITE_STRIPE_PRICE_GROWTH_MONTHLY=price_your_growth_monthly_id
VITE_STRIPE_PRICE_LEAD_MONTHLY=price_your_lead_monthly_id
```

#### **AI Services**
```bash
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

#### **Branding Configuration**
```bash
VITE_BRAND_NAME=MomentumDIY
VITE_BRAND_EMAIL=info@yourdomain.com
VITE_BRAND_DOMAIN=yourdomain.com
VITE_BRAND_LOGO_URL=https://yourdomain.com/logo.png
VITE_BRAND_PRIMARY_COLOR=#EF8E81
VITE_BRAND_SECONDARY_COLOR=#D4AF37
VITE_BRAND_SUPPORT_EMAIL=support@yourdomain.com
VITE_BRAND_LEGAL_NAME=Your Company Name
```

#### **AI Assistant Configuration**
```bash
VITE_AI_ASSISTANT_NAME=Hillary
VITE_AI_ASSISTANT_PERSONA=marketing-consultant
VITE_AI_ASSISTANT_TITLE=Marketing Consultant
```

#### **Affiliate Configuration**
```bash
VITE_AFFILIATE_COOKIE_DOMAIN=.yourdomain.com
```

## 🔧 **Setup Instructions**

### **Step 1: Backend Environment Variables**

1. **In your Render dashboard**, go to your backend service settings
2. **Add environment variables** under the "Environment" tab
3. **Set the following variables**:

#### **Required Variables**
```bash
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters-long
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
RESEND_API_KEY=re_your_resend_api_key_here
```

#### **Optional Variables** (if using these services)
```bash
ANTHROPIC_API_KEY=sk-ant-your_anthropic_api_key_here
NOTION_API_KEY=your_notion_api_key_here
```

### **Step 2: Frontend Environment Variables**

1. **In your Vercel dashboard**, go to your frontend project settings
2. **Add environment variables** under "Environment Variables"
3. **Set the following variables**:

#### **Required Variables**
```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

#### **Branding Variables** (customize for your brand)
```bash
VITE_BRAND_NAME=Your Brand Name
VITE_BRAND_EMAIL=info@yourdomain.com
VITE_BRAND_DOMAIN=yourdomain.com
VITE_BRAND_LOGO_URL=https://yourdomain.com/logo.png
VITE_BRAND_PRIMARY_COLOR=#your-primary-color
VITE_BRAND_SECONDARY_COLOR=#your-secondary-color
VITE_BRAND_SUPPORT_EMAIL=support@yourdomain.com
VITE_BRAND_LEGAL_NAME=Your Legal Company Name
```

## 🔐 **Security Notes**

### **Never commit these to version control:**
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `RESEND_API_KEY`
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`

### **For local development:**
- Use `.env` files for sensitive variables
- Add `.env*` to your `.gitignore`

### **For production:**
- Use your hosting platform's environment variable system
- Ensure variables are marked as "secret" where possible

## ✅ **Verification Checklist**

- [ ] Backend environment variables configured in Render
- [ ] Frontend environment variables configured in Vercel
- [ ] Supabase credentials are production values
- [ ] Stripe keys are live (not test) keys
- [ ] Email service API key is configured
- [ ] AI service API keys are configured (if using)
- [ ] All sensitive variables are marked as secrets
- [ ] No development/test values remain in production

## 🚨 **Important Reminders**

1. **Stripe webhook secrets** must be configured for production Stripe webhooks to work
2. **Gemini API key** is required for the social media generator feature
3. **Email service** is required for notifications and onboarding emails
4. **CORS origins** should include your production frontend domain
5. **JWT secret** should be a strong, unique value for production

## 🆘 **Troubleshooting**

### **If environment variables aren't working:**
1. Check that variables are set in the correct service (backend vs frontend)
2. Verify variable names match exactly (case-sensitive)
3. Ensure variables are marked as "secret" where required
4. Restart your services after adding variables
5. Check application logs for missing environment variable errors
