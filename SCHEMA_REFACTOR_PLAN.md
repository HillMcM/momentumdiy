# Marketing Track Schema Refactor Plan

## Current Problems

### 1. **Massive Duplication**
- Track progress stored in 3 places: `profiles`, `user_track_progress`, `marketing_goals`
- Module/task data duplicated between templates and user instances
- Complex relationships that are hard to maintain

### 2. **Redundant Tables**
- `user_track_progress`, `user_module_progress`, `user_task_progress` - all tracking the same concept
- `marketing_goals` vs `marketing_track_definitions` - confusing separation

### 3. **Profile Table Bloat**
- 50+ columns mixing business info, subscription, track progress, onboarding
- Data stored both in JSONB and individual columns

## Proposed Clean Architecture

### **Core Tables (Keep & Simplify)**

#### 1. `marketing_tracks` (renamed from `marketing_track_definitions`)
```sql
CREATE TABLE marketing_tracks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  duration_weeks integer NOT NULL,
  industry_tags text[] DEFAULT '{}',
  phases jsonb DEFAULT '[]',
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### 2. `marketing_modules` (simplified)
```sql
CREATE TABLE marketing_modules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  track_id uuid REFERENCES marketing_tracks(id) ON DELETE CASCADE,
  week_number integer NOT NULL,
  title text NOT NULL,
  description text,
  content text,
  pro_tip text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(track_id, week_number)
);
```

#### 3. `marketing_tasks` (simplified)
```sql
CREATE TABLE marketing_tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id uuid REFERENCES marketing_modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  estimated_time text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### 4. `user_track_enrollments` (new - replaces 3 progress tables)
```sql
CREATE TABLE user_track_enrollments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id uuid REFERENCES marketing_tracks(id) ON DELETE CASCADE,
  is_active boolean DEFAULT false,
  start_date timestamptz,
  current_week integer DEFAULT 1,
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  week_start_dates jsonb DEFAULT '[]',
  last_week_advancement timestamptz,
  completion_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, track_id) -- One enrollment per track per user
);
```

#### 5. `user_task_completions` (new - simple progress tracking)
```sql
CREATE TABLE user_task_completions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id uuid REFERENCES marketing_tasks(id) ON DELETE CASCADE,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, task_id)
);
```

### **Simplified Profile Table**
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  
  -- Business Info (keep essential only)
  business_name text,
  business_type text,
  business_stage text,
  location text,
  
  -- Onboarding (consolidate to JSONB)
  onboarding_data jsonb DEFAULT '{}',
  
  -- Subscription (keep essential only)
  subscription_status text DEFAULT 'trial',
  subscription_plan text DEFAULT 'premium',
  stripe_customer_id text,
  trial_end_date timestamptz,
  subscription_end_date timestamptz,
  
  -- Preferences
  email_preferences jsonb DEFAULT '{"trial_emails": true, "task_reminders": true, "weekly_progress": true, "marketing_emails": true}',
  check_in_day text DEFAULT 'monday',
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

## Migration Strategy

### Phase 1: Create New Tables
1. Create new simplified tables
2. Migrate data from old tables
3. Update application code to use new structure

### Phase 2: Remove Old Tables
1. Drop redundant tables:
   - `marketing_track_definitions` → `marketing_tracks`
   - `marketing_goals` → `user_track_enrollments`
   - `user_track_progress` → `user_track_enrollments`
   - `user_module_progress` → (remove, use week-based logic)
   - `user_task_progress` → `user_task_completions`

### Phase 3: Clean Profile Table
1. Remove duplicate columns
2. Consolidate onboarding data to JSONB
3. Remove track progress fields (now in enrollments)

## Benefits

### 1. **Eliminates Duplication**
- Single source of truth for track progress
- No more sync issues between tables
- Cleaner data relationships

### 2. **Simplifies Queries**
- Get user's active track: `SELECT * FROM user_track_enrollments WHERE user_id = ? AND is_active = true`
- Get track modules: `SELECT * FROM marketing_modules WHERE track_id = ? ORDER BY week_number`
- Get completed tasks: `SELECT * FROM user_task_completions WHERE user_id = ?`

### 3. **Easier Maintenance**
- Fewer tables to maintain
- Clear separation of concerns
- Simpler relationships

### 4. **Better Scalability**
- Easy to add new track types
- Simple to track multiple enrollments per user
- Clean progress tracking

## Implementation Priority

1. **High Priority**: Fix the marketing track duplication (biggest pain point)
2. **Medium Priority**: Simplify profile table
3. **Low Priority**: Remove unused tables

This refactor will make the system much more maintainable and eliminate the current clunkiness.
