# 🔍 Admin Access Debug Script

## Step 1: Check if you're logged in with the admin email

Open browser console (F12) and run:

```javascript
// Get current user
const { data: { user } } = await window.supabase.auth.getUser();
console.log('✅ Current user email:', user?.email);
console.log('✅ User ID:', user?.id);

// Check if admin
const ADMIN_EMAILS = ['info@hillaryedenmcmullen.com'];
const isAdmin = user && user.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
console.log('✅ Is Admin?:', isAdmin);
```

**Expected Output:**
```
✅ Current user email: info@hillaryedenmcmullen.com
✅ User ID: [some-uuid]
✅ Is Admin?: true
```

If `Is Admin?` is `false`, you need to sign in with the correct email.

---

## Step 2: Test Admin Routes

Run this to check if you can access admin routes:

```javascript
console.log('🔗 Current URL:', window.location.href);
console.log('📍 Try navigating to: https://www.momentumdiy.com/app/admin/marketing-tracks');

// Try to navigate programmatically
window.location.href = '/app/admin/marketing-tracks';
```

---

## Step 3: Check for JavaScript Errors

Look for any errors in the console. Common issues:

- **Red errors** - These are problems that need fixing
- **`logger is not defined`** - Old cached code, need hard refresh
- **`Failed to fetch`** - Network/CORS issue
- **`React error #310`** - useEffect issue, need hard refresh

---

## Step 4: Force Cache Clear

Run in console:

```javascript
// Clear localStorage
localStorage.clear();

// Clear sessionStorage
sessionStorage.clear();

// Force reload from server
window.location.reload(true);
```

---

## Step 5: Check Deployment Version

Run in console to see if you have the latest code:

```javascript
// Check if the fix is deployed
console.log('Checking for useSubscription fix...');
// If this logs without error, you have the latest code
import('/src/hooks/useSubscription.ts').then(m => {
  console.log('✅ useSubscription module loaded successfully');
}).catch(e => {
  console.log('❌ Error loading module:', e);
});
```

---

## Step 6: Manual Admin Access Test

Try these URLs directly:

1. **Visual Admin (Recommended):**
   ```
   https://www.momentumdiy.com/app/admin/marketing-tracks
   ```

2. **Legacy Admin:**
   ```
   https://www.momentumdiy.com/app/admin/marketing-tracks-old
   ```

3. **Affiliate Admin:**
   ```
   https://www.momentumdiy.com/app/admin/affiliate
   ```

---

## If Error Persists: Get Debug Info

Run this comprehensive debug script:

```javascript
console.log('=== ADMIN ACCESS DEBUG INFO ===');

// 1. Check user
const { data: { user } } = await window.supabase.auth.getUser();
console.log('1. User:', {
  email: user?.email,
  id: user?.id,
  isAdmin: ['info@hillaryedenmcmullen.com'].includes(user?.email?.toLowerCase())
});

// 2. Check current route
console.log('2. Current Route:', window.location.pathname);

// 3. Check for errors
const errors = window.performance.getEntriesByType('navigation');
console.log('3. Navigation Errors:', errors);

// 4. Check if admin components are loaded
console.log('4. Checking React components...');
try {
  const root = document.getElementById('root');
  console.log('   - Root element exists:', !!root);
  console.log('   - Root has content:', root?.children.length > 0);
} catch (e) {
  console.log('   - Error:', e.message);
}

// 5. Check localStorage
console.log('5. LocalStorage keys:', Object.keys(localStorage));

// 6. Check API connectivity
console.log('6. Testing API connection...');
fetch('https://momentumdiy-backend.onrender.com/health')
  .then(r => r.json())
  .then(data => console.log('   - Backend health:', data))
  .catch(e => console.log('   - Backend error:', e.message));

console.log('=== END DEBUG INFO ===');
```

Copy all the console output and share it if you need additional help.

---

## Quick Fix Checklist

- [ ] Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R)
- [ ] Signed in as: `info@hillaryedenmcmullen.com`
- [ ] Tried incognito/private mode
- [ ] Cleared browser cache for momentumdiy.com
- [ ] Waited 5+ minutes after deployment
- [ ] Checked console for errors
- [ ] Tried direct URL navigation

---

## Expected Behavior

When everything works correctly:

1. Navigate to `/app/admin/marketing-tracks`
2. You should see: "Visual Marketing Tracks Admin" page
3. With sections for:
   - Tracks list
   - Modules list  
   - Create New Track button
   - Track actions (Edit, Generate, Publish)

If you see this, admin access is working! 🎉

