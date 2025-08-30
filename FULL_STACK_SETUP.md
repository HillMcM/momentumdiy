# 🚀 Full Stack Marketing Track Setup Guide

This guide will walk you through setting up complete frontend-backend functionality for the marketing track feature.

## 📋 Prerequisites

- ✅ Backend server running on port 3001
- ✅ Frontend running on port 3001  
- ✅ Supabase database configured
- ✅ Environment variables set up

## 🔧 Step 1: Backend Setup

### 1.1 Install Dependencies
```bash
cd backend
npm install
```

### 1.2 Start Backend Server
```bash
npm run dev
```

The backend will start on `http://localhost:3001`

### 1.3 Verify Backend Routes
The following endpoints should now be available:

- `GET /api/marketing/goals/active` - Get active marketing goal
- `GET /api/marketing/goals/:id/modules` - Get modules for a goal
- `PUT /api/marketing/tasks/:id` - Toggle task completion
- `PUT /api/marketing/goals/:id` - Update goal progress

## 🌱 Step 2: Database Seeding

### 2.1 Run the Seeding Script
```bash
cd backend
npm run seed:marketing-track
```

This will create:
- ✅ Marketing goal: "Increase Local Foot Traffic"
- ✅ 3 marketing modules (weeks 1-3)
- ✅ Associated tasks for each module
- ✅ Pro Tip content embedded in HTML

### 2.2 Verify Database Content
Check your Supabase dashboard to confirm:
- `marketing_goals` table has the goal
- `marketing_modules` table has the modules  
- `marketing_tasks` table has the tasks

## 🎨 Step 3: Frontend Setup

### 3.1 Install Dependencies
```bash
cd Frontend
npm install
```

### 3.2 Start Frontend
```bash
npm run dev
```

The frontend will start on `http://localhost:3001`

## 🔄 Step 4: Test Full Functionality

### 4.1 Test Data Loading
- Navigate to `/app/marketing-track`
- Verify the 12-week track loads from the database
- Check that week 1 content appears

### 4.2 Test Task Interactions
- Click on task checkboxes
- Verify tasks toggle completion status
- Check that progress bars update
- Confirm changes persist in the database

### 4.3 Test Accordion Functionality
- Expand/collapse different weeks
- Verify Pro Tip callouts appear below content
- Check that locked weeks show lock icons

## 🐛 Troubleshooting

### Backend Connection Issues
```bash
# Check if backend is running
curl http://localhost:3001/health

# Check backend logs
cd backend
npm run dev
```

### Database Issues
```bash
# Re-run seeding
cd backend
npm run seed:marketing-track

# Check Supabase connection
# Verify environment variables in .env
```

### Frontend Issues
```bash
# Clear cache and restart
cd Frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 📊 Expected Behavior

### ✅ What Should Work
- **Data Loading**: Marketing track loads from database
- **Task Toggling**: Checkboxes update and persist changes
- **Progress Updates**: Progress bars reflect real data
- **Week Unlocking**: Logic based on start dates
- **Pro Tip Display**: Callouts appear below lesson content
- **Accordion State**: Each week maintains expand/collapse state

### 🔄 Data Flow
1. **Frontend** calls `/api/marketing/goals/active`
2. **Backend** queries Supabase for active goal
3. **Backend** fetches associated modules and tasks
4. **Frontend** displays data in beautiful UI
5. **User interactions** trigger API calls to update database
6. **Changes persist** and sync across sessions

## 🎯 Next Steps

### Add More Content
- Complete the remaining 9 weeks of content
- Add more detailed tasks and Pro Tips
- Include multimedia content (images, videos)

### Enhanced Features
- User progress tracking
- Achievement badges
- Social sharing
- Export functionality

### Performance Optimization
- Implement caching
- Add pagination for large datasets
- Optimize database queries

## 🎉 Success Indicators

You'll know everything is working when:
- ✅ No console errors in browser
- ✅ Tasks toggle and persist changes
- ✅ Progress bars update in real-time
- ✅ Pro Tips display in beautiful callouts
- ✅ Accordions expand/collapse smoothly
- ✅ Data loads from database (not mock data)

## 🆘 Need Help?

If you encounter issues:
1. Check the console for error messages
2. Verify backend server is running
3. Confirm database seeding completed successfully
4. Check network tab for failed API calls
5. Review environment variable configuration

---

**Happy coding! 🚀✨**
