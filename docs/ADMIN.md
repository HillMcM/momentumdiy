# 🔐 Admin Console Access Guide

## Admin Email Configuration

The admin console is restricted to specific email addresses configured in:
`Frontend/src/components/AdminGuard.tsx`

**Current Admin Email:**
- `info@hillaryedenmcmullen.com`

## How to Access the Admin Console

### Method 1: Logo Clicks
1. **Sign in** to the app at `https://www.momentumdiy.com/auth`
2. Navigate to `/app` (the main dashboard)
3. **Click the logo in the header 5 times** (quickly)
4. A modal will appear with "Open Admin Panel" button
5. Click to navigate to `/app/admin/marketing-tracks`

### Method 2: Keyboard Shortcut
1. **Sign in** to the app
2. Navigate to `/app`
3. Press **Ctrl + Shift + A** (or **Cmd + Shift + A** on Mac)
4. A modal will appear with "Open Admin Panel" button

### Method 3: Direct URL
1. **Sign in** to the app
2. Navigate directly to: `https://www.momentumdiy.com/app/admin/marketing-tracks`
3. If you're logged in with an admin email, you'll see the admin panel
4. Otherwise, you'll be redirected to `/app`

## Admin Routes Available

- `/app/admin/marketing-tracks` - Visual Marketing Tracks Admin (recommended)
- `/app/admin/marketing-tracks-old` - Legacy admin interface
- `/app/admin/affiliate` - Affiliate program management

## Troubleshooting

### Issue: "Minified React error #310"

**Cause:** Browser cache is serving old JavaScript files

**Solution:**
1. **Hard refresh the page:**
   - **Windows/Linux:** Ctrl + Shift + R or Ctrl + F5
   - **Mac:** Cmd + Shift + R
2. **Clear browser cache:**
   - Open DevTools (F12)
   - Right-click on the refresh button
   - Select "Empty Cache and Hard Reload"
3. **Try incognito/private mode** to bypass cache
4. **Clear site data:**
   - Chrome: Settings > Privacy > Site Settings > View permissions and data > momentumdiy.com > Clear data
   - Firefox: Settings > Privacy > Cookies and Site Data > Manage Data > momentumdiy.com > Remove

### Issue: CORS errors

**Cause:** Backend not allowing requests from www subdomain

**Solution:**
- ✅ Already fixed in latest deployment
- Backend now accepts both `momentumdiy.com` and `www.momentumdiy.com`
- Wait 2-5 minutes for Render deployment to complete

### Issue: Redirected to /app instead of admin panel

**Possible causes:**
1. **Not logged in with admin email** - Check you're signed in as `info@hillaryedenmcmullen.com`
2. **Session expired** - Sign out and sign back in
3. **Old code cached** - Hard refresh browser

### Issue: Admin modal doesn't appear

**Solution:**
1. Make sure you're on `/app` route (not `/app/marketing` or other sub-routes)
2. Try clicking logo exactly 5 times rapidly
3. Try keyboard shortcut instead: Ctrl+Shift+A

## Adding New Admin Emails

To add more admin users, edit:
`Frontend/src/components/AdminGuard.tsx`

```typescript
const ADMIN_EMAILS = [
  'info@hillaryedenmcmullen.com',
  'newadmin@example.com', // Add new emails here
];
```

Then commit and deploy the changes.

## Verifying Your Access

Run this in the browser console while logged in:

```javascript
// Check current user
const { data: { user } } = await window.supabase.auth.getUser();
console.log('Current user email:', user?.email);

// Check if it matches admin list
const adminEmails = ['info@hillaryedenmcmullen.com'];
console.log('Is admin?:', adminEmails.includes(user?.email?.toLowerCase()));
```

## Current Status

✅ All React error #310 issues have been fixed in code
✅ CORS configuration updated to support www subdomain
✅ Admin guard properly configured
⏳ Deployment completed - allow 5 minutes for full propagation
🔄 Clear browser cache to get latest code

## If Still Having Issues

1. **Wait 5 minutes** for deployment to fully complete
2. **Clear all browser cache and cookies** for momentumdiy.com
3. **Try in incognito/private mode** 
4. **Check browser console** for any error messages
5. **Verify you're signed in** with the correct admin email
6. **Try direct URL**: https://www.momentumdiy.com/app/admin/marketing-tracks

If issues persist after all of the above, there may be a CDN caching issue. Contact your hosting provider or wait 15-30 minutes for CDN cache to expire.

