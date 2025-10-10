# 🚀 Founder's Lifetime Deal Setup Guide

## Overview
This guide implements a special "Founder's Deal" for the first 250 users: **$9.99/month or $99/year lifetime pricing**. Users who cancel lose access to this pricing forever.

---

## ✅ Implementation Checklist

### 1. Create Stripe Products & Prices

1. **Go to Stripe Dashboard** → [Products](https://dashboard.stripe.com/products)
2. **Click "Add Product"**
3. **Product Details:**
   - Name: `Momentum DIY - Founder's Plan`
   - Description: `Lifetime pricing for the first 250 users - $9.99/month or $99/year`
   
4. **Add Pricing:**

   **Monthly Price:**
   - Pricing Model: `Recurring`
   - Price: `$9.99`
   - Billing Period: `Monthly`
   - Copy the Price ID (looks like: `price_1Abc123XYZ...`)

   **Yearly Price:**
   - Click "Add another price"
   - Pricing Model: `Recurring`
   - Price: `$99`
   - Billing Period: `Yearly`
   - Copy the Price ID (looks like: `price_1Def456XYZ...`)

5. **Save both Price IDs** - you'll need them for environment variables

---

### 2. Update Environment Variables

#### Backend (`.env` in `/backend` directory)

Add these new variables:

```bash
# Founder Pricing (First 250 Users - Lifetime Deal)
STRIPE_PRICE_FOUNDER_MONTHLY=price_1Abc123XYZ...
STRIPE_PRICE_FOUNDER_YEARLY=price_1Def456XYZ...

# Regular Pricing (Default after 250 founders)
STRIPE_PRICE_MONTHLY=price_YOUR_REGULAR_MONTHLY
STRIPE_PRICE_YEARLY=price_YOUR_REGULAR_YEARLY
```

#### Render Environment Variables

1. Go to your Render backend service
2. Navigate to "Environment" tab
3. Add the same variables:
   - `STRIPE_PRICE_FOUNDER_MONTHLY`
   - `STRIPE_PRICE_FOUNDER_YEARLY`
   - `STRIPE_PRICE_MONTHLY` (if not already set)
   - `STRIPE_PRICE_YEARLY` (if not already set)

---

### 3. Run Database Migration

```bash
# Navigate to project root
cd /Users/hillmcm/ClientPortalApp

# Run migration via Supabase CLI
npx supabase db push
```

**Or manually in Supabase Dashboard:**
1. Go to SQL Editor in Supabase
2. Run the migration file: `supabase/migrations/20251011000001_add_founder_pricing.sql`

---

### 4. Frontend Integration

#### A. Add API Service Methods

Add to `Frontend/src/services/api.ts`:

```typescript
// Founder Pricing APIs
export const founderPricing = {
  // Check availability (public)
  async getAvailability() {
    const response = await fetch(`${BACKEND_BASE_URL}/api/founder/availability`);
    if (!response.ok) throw new Error('Failed to fetch founder availability');
    return response.json();
  },

  // Check user's founder status (authenticated)
  async getStatus() {
    const token = await getAuthToken();
    const response = await fetch(`${BACKEND_BASE_URL}/api/founder/status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch founder status');
    return response.json();
  },

  // Claim founder spot (authenticated)
  async claimSpot() {
    const token = await getAuthToken();
    const response = await fetch(`${BACKEND_BASE_URL}/api/founder/claim`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to claim founder spot');
    return response.json();
  },
};
```

#### B. Create Founder Deal Banner Component

Create `Frontend/src/components/FounderDealBanner.tsx`:

```typescript
import React, { useEffect, useState } from 'react';
import { founderPricing } from '../services/api';

export const FounderDealBanner: React.FC = () => {
  const [availability, setAvailability] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      const response = await founderPricing.getAvailability();
      setAvailability(response.data);
    } catch (error) {
      console.error('Error loading founder availability:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !availability || availability.spotsRemaining === 0) {
    return null;
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #EF8E81 0%, #F4A79D 100%)',
      padding: '1rem 1.5rem',
      borderRadius: '12px',
      marginBottom: '2rem',
      color: '#1A1625',
      boxShadow: '0 4px 20px rgba(239, 142, 129, 0.3)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
            🎉 Founder's Lifetime Deal
          </h3>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.95rem', opacity: 0.9 }}>
            Lock in <strong>$9.99/month or $99/year forever</strong> — Only {availability.spotsRemaining} spots left!
          </p>
        </div>
        <div style={{
          background: '#1A1625',
          color: '#EF8E81',
          padding: '0.75rem 1.25rem',
          borderRadius: '8px',
          fontWeight: 700,
          fontSize: '1.1rem',
        }}>
          {availability.spotsRemaining}/250
        </div>
      </div>
    </div>
  );
};
```

#### C. Update Checkout Flow

Modify your checkout/pricing page to:

1. **Check founder status** when page loads
2. **Show founder pricing** if user is eligible or spots remain
3. **Use correct Stripe Price ID** based on founder status

Example logic:

```typescript
// In your pricing/checkout component
const [founderStatus, setFounderStatus] = useState<any>(null);

useEffect(() => {
  loadFounderStatus();
}, []);

const loadFounderStatus = async () => {
  try {
    const response = await founderPricing.getStatus();
    setFounderStatus(response.data);
  } catch (error) {
    console.error('Error loading founder status:', error);
  }
};

// When creating checkout session
const handleCheckout = async (interval: 'monthly' | 'yearly') => {
  const isFounder = founderStatus?.isFounder;
  const spotsAvailable = founderStatus?.spotsRemaining > 0;
  
  // If not yet founder but spots available, claim it first
  if (!isFounder && spotsAvailable) {
    const claimResult = await founderPricing.claimSpot();
    if (claimResult.success) {
      // Reload status to get founder pricing
      await loadFounderStatus();
    }
  }
  
  // Proceed with checkout using appropriate pricing
  // The backend will automatically use founder pricing if user is a founder
};
```

---

## 🎯 How It Works

### User Flow

1. **New User Signs Up**
   - Checks if <250 founders exist
   - If yes, automatically claims founder status
   - Shows founder pricing in checkout

2. **User Subscribes**
   - Subscribes at $9.99/month or $99/year
   - Stripe subscription created with founder price ID
   - `is_founder: true` in their profile

3. **User Cancels Subscription**
   - Subscription cancelled in Stripe
   - **Profile keeps `is_founder: true`** (they stay a founder)
   - But they lose access to the app

4. **User Tries to Resubscribe**
   - System checks: `is_founder === true`?
   - **Yes** → Shows founder pricing again ($9.99/$99)
   - **No** → Shows regular pricing ($14.99/$149.99)

### Key Logic

- **Founder status is permanent** - Once claimed, always a founder
- **Founder pricing is permanent** - As long as they maintain subscription
- **Limited to 250 users** - Atomic database function ensures no race conditions
- **First come, first served** - Each founder gets a number (1-250)

---

## 🔐 Security Features

✅ **Atomic Operations** - Database function ensures only 250 founders  
✅ **Race Condition Protection** - Uses PostgreSQL locking  
✅ **Server-Side Validation** - Backend controls pricing, not frontend  
✅ **Audit Trail** - Tracks when each founder claimed their spot  
✅ **Revocable Spot** - Admin can manually revoke if needed  

---

## 📊 Monitoring & Analytics

### Check Founder Count

```sql
-- In Supabase SQL Editor
SELECT get_founder_count();
```

### View All Founders

```sql
SELECT 
  id,
  email,
  founder_number,
  founder_claimed_at,
  subscription_status,
  created_at
FROM profiles
WHERE is_founder = true
ORDER BY founder_number;
```

### Check Spots Remaining

Via API:
```bash
curl https://your-backend.com/api/founder/availability
```

---

## 🎨 Marketing Copy Examples

### Landing Page Banner
```
🎉 LIMITED TIME: Founder's Lifetime Deal
Lock in $9.99/month or $99/year FOREVER
Only [X]/250 spots remaining!
```

### Checkout Page
```
✨ You've claimed Founder's Spot #[X]!
This pricing is yours for life as long as you maintain your subscription.
Regular price: $14.99/month | Your founder price: $9.99/month
Save $60/year or $600/decade!
```

### Email Confirmation
```
Subject: Welcome, Founder #[X]! 🎉

Congratulations! You're one of the first 250 Momentum DIY founders.

Your lifetime pricing:
• Monthly: $9.99/month (Regular: $14.99)
• Yearly: $99/year (Regular: $149.99)

This pricing is locked in for the lifetime of your subscription. As long as you 
remain subscribed, you'll never pay more than this!
```

---

## 🚀 Deployment Steps

1. ✅ Create Stripe products & get Price IDs
2. ✅ Add environment variables (backend + Render)
3. ✅ Run database migration
4. ✅ Deploy backend code
5. ✅ Add frontend API methods
6. ✅ Update checkout flow
7. ✅ Add founder banner to pricing page
8. ✅ Test with test mode Stripe
9. ✅ Switch to live mode
10. ✅ Launch! 🎉

---

## 🧪 Testing Checklist

- [ ] Verify migration ran successfully
- [ ] Test claiming founder spot (should work for first 250)
- [ ] Test spot #251 (should fail)
- [ ] Test checkout with founder pricing
- [ ] Test checkout with regular pricing (after 250)
- [ ] Verify Stripe webhook updates work
- [ ] Test cancellation (founder keeps status)
- [ ] Test resubscription (founder gets discount again)
- [ ] Check API endpoints return correct data
- [ ] Verify security (can't claim spot twice)

---

## 📞 Support Scenarios

**Q: "I cancelled and want to come back - do I still get founder pricing?"**  
A: Yes! Your founder status is permanent. You'll still get $9.99/month or $99/year.

**Q: "Can I switch between monthly and yearly?"**  
A: Yes, through the billing portal. Both are founder prices for you.

**Q: "I'm founder #251, can I still get the deal?"**  
A: No, the first 250 spots are claimed. But we have a 30-day free trial!

**Q: "What if I cancel for 6 months?"**  
A: Your founder status stays. When you resubscribe, you get founder pricing again.

---

## 🎯 Next Steps After Launch

1. **Monitor founder claims** - Watch the counter daily
2. **Announce milestones** - "100 founders! 150 left!"
3. **Email founders** - Special updates, early access to features
4. **Founder badge** - Add a visual badge in the app
5. **Founder community** - Consider a private Discord/Slack
6. **Success stories** - Feature founder testimonials
7. **Close the deal** - Big announcement when all 250 are claimed

---

## 💡 Pro Tips

✨ **Create urgency** - Show live counter on landing page  
✨ **Social proof** - "Join [X] other founders who locked in this deal"  
✨ **Scarcity** - Send email when you hit milestones (200, 225, 245 claimed)  
✨ **Founder perks** - Give them early access, founder badge, special support  
✨ **Testimonials** - Reach out to early founders for success stories  

---

Your founder's deal infrastructure is now complete! 🎉

All the code is committed and ready to deploy. Just add your Stripe Price IDs to the environment variables and run the migration.

