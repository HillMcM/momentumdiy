# 🔧 Supabase Production Setup Guide

## 🎯 **Goal**
Connect your production backend to your Supabase project at: https://supabase.com/dashboard/project/mnjczhlwcnwipdbajwkj

## 📋 **Step 1: Get Your Supabase Credentials**

1. **Go to your Supabase dashboard**: https://supabase.com/dashboard/project/mnjczhlwcnwipdbajwkj
2. **Navigate to**: Settings → API
3. **Copy these values**:

### **Project URL**
```
https://mnjczhlwcnwipdbajwkj.supabase.co
```

### **anon public key**
```
eyJ... (starts with eyJ, very long string)
```

### **service_role secret key**
```
eyJ... (starts with eyJ, very long string - this is the secret one!)
```

## 🔧 **Step 2: Set Environment Variables**

### **For Local Development:**
```bash
export SUPABASE_URL="https://mnjczhlwcnwipdbajwkj.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key-here"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
```

### **For Production (Render):**
Add these as environment variables in your Render dashboard:
- `SUPABASE_URL` = `https://mnjczhlwcnwipdbajwkj.supabase.co`
- `SUPABASE_ANON_KEY` = `your-anon-key`
- `SUPABASE_SERVICE_ROLE_KEY` = `your-service-role-key`

## 🧪 **Step 3: Test the Connection**

```bash
cd backend
npm run test-supabase-connection
```

## 🌱 **Step 4: Seed Your Production Database**

Once connected, run these scripts to populate your production database:

```bash
# Create the marketing track content
npm run seed:marketing-track

# Activate the goal
tsx src/scripts/activate-marketing-goal.ts
```

## 🚀 **Step 5: Deploy to Production**

1. **Commit your changes**:
```bash
git add .
git commit -m "Connect to production Supabase"
git push origin main
```

2. **Redeploy your backend on Render** (or it will auto-deploy if connected to GitHub)

## ✅ **Step 6: Verify Everything Works**

1. **Test the production API**:
```bash
curl https://momentumdiy-backend.onrender.com/api/marketing/goals/active
```

2. **Check your frontend**: https://momentumdiy.vercel.app

## 🔍 **Troubleshooting**

### **If you get connection errors:**
- Double-check your Supabase URL and keys
- Make sure you're using the `service_role` key (not the `anon` key) for backend operations
- Verify your Supabase project is active and not paused

### **If the API returns null:**
- Run the seeding scripts to populate your database
- Make sure the marketing goal is set to `is_active = true`

## 📊 **Expected Result**

After setup, your production API should return:
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "title": "Increase Local Foot Traffic",
    "modules": [
      {
        "weekNumber": 1,
        "title": "Week 1: Foundation & Assessment",
        "tasks": [...]
      }
    ]
  }
}
```

## 🎉 **Success!**

Once everything is connected, your marketing track will show real content from your Supabase database instead of mock data!
