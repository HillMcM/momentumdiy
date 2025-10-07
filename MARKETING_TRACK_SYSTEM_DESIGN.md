# Marketing Track System - Complete Redesign

## 🎯 **System Overview**

A streamlined marketing track system that allows admins to create content templates and users to activate personalized 12-week programs with automatic weekly content drip.

## 📊 **Database Architecture**

### **1. Track Templates (Admin-Managed)**
```sql
-- marketing_track_definitions: Template tracks created by admins
CREATE TABLE marketing_track_definitions (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_weeks INTEGER DEFAULT 12,
  phases JSONB DEFAULT '[]',
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- marketing_modules: Weekly content templates
CREATE TABLE marketing_modules (
  id UUID PRIMARY KEY,
  track_definition_id UUID REFERENCES marketing_track_definitions(id),
  week_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  pro_tip TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- marketing_tasks: Task templates for each module
CREATE TABLE marketing_tasks (
  id UUID PRIMARY KEY,
  module_id UUID REFERENCES marketing_modules(id),
  title TEXT NOT NULL,
  description TEXT,
  estimated_time TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **2. User Progress (User-Specific)**
```sql
-- user_track_progress: Individual user's track activation and progress
CREATE TABLE user_track_progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  track_definition_id UUID REFERENCES marketing_track_definitions(id),
  start_date TIMESTAMP NOT NULL,
  current_week INTEGER DEFAULT 1,
  progress INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- user_module_progress: Individual user's module completion status
CREATE TABLE user_module_progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  module_id UUID REFERENCES marketing_modules(id),
  is_unlocked BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- user_task_progress: Individual user's task completion status
CREATE TABLE user_task_progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  task_id UUID REFERENCES marketing_tasks(id),
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔄 **System Flow**

### **Admin Workflow**
1. **Create Track Template**
   - Define track title, description, phases
   - Set duration (default 12 weeks)
   - Save as draft

2. **Add Weekly Modules**
   - Create 12 weekly modules
   - Add content, pro tips, tasks for each week
   - Preview and edit

3. **Publish Track**
   - Mark track as published
   - Track becomes available to users

### **User Workflow**
1. **Select Track**
   - Browse published tracks
   - Choose track to activate
   - System creates user progress records

2. **Weekly Content Drip**
   - Week 1 unlocked immediately
   - Subsequent weeks unlock automatically
   - Based on start date + 7 days per week

3. **Progress Tracking**
   - Complete tasks to advance
   - System tracks completion
   - Progress bar updates

4. **Track Completion**
   - After 12 weeks, track marked complete
   - User can select new track
   - Cycle continues

## 🛠 **API Endpoints**

### **Admin APIs**
```
GET    /api/admin/tracks                    # List all tracks
POST   /api/admin/tracks                    # Create new track
PUT    /api/admin/tracks/:id                # Update track
DELETE /api/admin/tracks/:id                # Delete track

GET    /api/admin/tracks/:id/modules        # List track modules
POST   /api/admin/tracks/:id/modules        # Create module
PUT    /api/admin/modules/:id               # Update module
DELETE /api/admin/modules/:id               # Delete module

GET    /api/admin/modules/:id/tasks         # List module tasks
POST   /api/admin/modules/:id/tasks         # Create task
PUT    /api/admin/tasks/:id                 # Update task
DELETE /api/admin/tasks/:id                 # Delete task

POST   /api/admin/tracks/:id/publish        # Publish track
```

### **User APIs**
```
GET    /api/marketing/tracks                # List published tracks
POST   /api/marketing/tracks/:id/activate   # Activate track for user
GET    /api/marketing/progress              # Get user's active track progress
GET    /api/marketing/modules/:id           # Get module content
POST   /api/marketing/tasks/:id/complete    # Mark task as complete
```

## 🎯 **Key Benefits**

1. **Clean Separation**: Templates vs User Progress
2. **Automatic Drip**: Weekly content unlocks automatically
3. **Scalable**: Easy to add new tracks and users
4. **Maintainable**: Clear data relationships
5. **Flexible**: Easy to modify content and add features

## 🚀 **Implementation Plan**

1. Create new database schema
2. Implement clean API endpoints
3. Update frontend to use new APIs
4. Test complete user flow
5. Deploy and monitor
