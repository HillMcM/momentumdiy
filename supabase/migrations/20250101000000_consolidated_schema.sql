-- =====================================================
-- CONSOLIDATED DATABASE SCHEMA MIGRATION
-- =====================================================
-- This file consolidates all database migrations into a single file
-- for easier management and deployment.

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Subscription fields
  subscription_status TEXT DEFAULT 'trial',
  stripe_customer_id TEXT,
  trial_start_date TIMESTAMP WITH TIME ZONE,
  trial_end_date TIMESTAMP WITH TIME ZONE,
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  subscription_plan TEXT DEFAULT 'premium',
  last_payment_date TIMESTAMP WITH TIME ZONE,
  next_payment_date TIMESTAMP WITH TIME ZONE,
  
  -- Onboarding fields
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_data JSONB DEFAULT '{}'::JSONB,
  business_type TEXT,
  business_stage TEXT,
  primary_goal TEXT,
  biggest_challenge TEXT[] DEFAULT '{}'::TEXT[],
  current_activities TEXT[] DEFAULT '{}'::TEXT[],
  time_available TEXT,
  quiz_answers JSONB DEFAULT '{}'::JSONB,
  recommended_track TEXT,
  selected_track TEXT,
  notification_preferences TEXT[] DEFAULT '{}'::TEXT[],
  check_in_day TEXT DEFAULT 'monday',
  
  -- Email preferences
  email_preferences JSONB DEFAULT '{
    "weekly_progress": true,
    "task_reminders": true,
    "marketing_emails": true,
    "trial_emails": true
  }'::jsonb,
  
  -- Extended business/marketing personalization fields
  business_name TEXT,
  business_category TEXT,
  location TEXT,
  contact_email TEXT,
  two_factor_enabled BOOLEAN DEFAULT false,
  business_size TEXT,
  primary_marketing_goal TEXT,
  marketing_channels TEXT[] DEFAULT '{}'::TEXT[],
  skill_levels JSONB DEFAULT '{}'::JSONB,
  industry_keywords TEXT[] DEFAULT '{}'::TEXT[],
  brand_primary_color TEXT,
  brand_secondary_color TEXT,
  brand_font_heading TEXT,
  brand_font_body TEXT,
  favorite_templates TEXT[] DEFAULT '{}'::TEXT[],
  favorite_tools TEXT[] DEFAULT '{}'::TEXT[],
  ai_pinned JSONB DEFAULT '[]'::JSONB
);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  responsible TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  time_spent TEXT DEFAULT '0h',
  notifications BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'completed')),
  marketing_track JSONB, -- Stores marketing track info: {goalId, moduleId, marketingTaskId}
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create business metrics table for analytics
CREATE TABLE IF NOT EXISTS public.business_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  metrics JSONB NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create timeline phases table
CREATE TABLE IF NOT EXISTS public.timeline_phases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed')),
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MARKETING SYSTEM TABLES
-- =====================================================

-- Create marketing track definitions table
CREATE TABLE IF NOT EXISTS public.marketing_track_definitions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  industry_tags TEXT[] DEFAULT '{}',
  duration_weeks INTEGER DEFAULT 12,
  phases JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create marketing goals table
CREATE TABLE IF NOT EXISTS public.marketing_goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  duration INTEGER NOT NULL, -- in weeks
  is_active BOOLEAN DEFAULT false,
  start_date TIMESTAMP WITH TIME ZONE,
  current_week INTEGER DEFAULT 1,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  week_start_dates JSONB, -- Array of dates when each week was started
  last_week_advancement TIMESTAMP WITH TIME ZONE,
  track_definition_id UUID REFERENCES public.marketing_track_definitions(id) ON DELETE SET NULL,
  phases JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create marketing modules table
CREATE TABLE IF NOT EXISTS public.marketing_modules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  goal_id UUID REFERENCES public.marketing_goals(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  is_unlocked BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  pro_tip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create marketing tasks table
CREATE TABLE IF NOT EXISTS public.marketing_tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  module_id UUID REFERENCES public.marketing_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  estimated_time TEXT,
  is_completed BOOLEAN DEFAULT false,
  due_date TIMESTAMP WITH TIME ZONE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CALENDAR AND ASSETS TABLES
-- =====================================================

-- Create calendar events table
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  type TEXT NOT NULL CHECK (type IN ('task', 'project', 'custom')),
  ref_id UUID, -- task or project id if applicable
  category TEXT CHECK (category IN ('meeting', 'social-post', 'networking', 'content-creation', 'email-campaign', 'ad-campaign', 'website-update', 'client-presentation', 'strategy-session', 'training', 'other')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create asset categories table
CREATE TABLE IF NOT EXISTS public.asset_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assets table
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT REFERENCES public.asset_categories(id),
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  url TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create branding kits table
CREATE TABLE IF NOT EXISTS public.branding_kits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_complete BOOLEAN DEFAULT false,
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create branding kit assets junction table
CREATE TABLE IF NOT EXISTS public.branding_kit_assets (
  kit_id UUID REFERENCES public.branding_kits(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
  PRIMARY KEY (kit_id, asset_id)
);

-- Create share links table
CREATE TABLE IF NOT EXISTS public.share_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  permissions TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  access_code TEXT NOT NULL UNIQUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Core table indexes
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_is_archived ON public.tasks(is_archived);
CREATE INDEX IF NOT EXISTS idx_timeline_phases_project_id ON public.timeline_phases(project_id);

-- Marketing system indexes
CREATE INDEX IF NOT EXISTS idx_marketing_modules_goal_id ON public.marketing_modules(goal_id);
CREATE INDEX IF NOT EXISTS idx_marketing_tasks_module_id ON public.marketing_tasks(module_id);
CREATE INDEX IF NOT EXISTS idx_marketing_goals_track_definition_id ON public.marketing_goals(track_definition_id);
CREATE INDEX IF NOT EXISTS idx_marketing_track_definitions_slug ON public.marketing_track_definitions(slug);
CREATE INDEX IF NOT EXISTS idx_marketing_track_definitions_industry_tags ON public.marketing_track_definitions USING GIN(industry_tags);
CREATE INDEX IF NOT EXISTS idx_marketing_modules_pro_tip ON public.marketing_modules(pro_tip) WHERE pro_tip IS NOT NULL;

-- Profile indexes
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_email_preferences ON public.profiles USING gin (email_preferences);

-- Asset indexes
CREATE INDEX IF NOT EXISTS idx_assets_category ON public.assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_tags ON public.assets USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON public.calendar_events(start_time);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_track_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branding_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branding_kit_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Business metrics policies
CREATE POLICY "Users can view own business metrics" ON public.business_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own business metrics" ON public.business_metrics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own business metrics" ON public.business_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own business metrics" ON public.business_metrics FOR DELETE USING (auth.uid() = user_id);

-- General authenticated user policies
CREATE POLICY "Authenticated users can access projects" ON public.projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can access tasks" ON public.tasks FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can access timeline phases" ON public.timeline_phases FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can access marketing goals" ON public.marketing_goals FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can access marketing modules" ON public.marketing_modules FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can access marketing tasks" ON public.marketing_tasks FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can access marketing track definitions" ON public.marketing_track_definitions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can access calendar events" ON public.calendar_events FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can access assets" ON public.assets FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can access branding kits" ON public.branding_kits FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can access branding kit assets" ON public.branding_kit_assets FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can access share links" ON public.share_links FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- COMMENTS AND DOCUMENTATION
-- =====================================================

-- Add column comments for clarity
COMMENT ON COLUMN public.profiles.email_preferences IS 'User email notification preferences. Structure: {"weekly_progress": boolean, "task_reminders": boolean, "marketing_emails": boolean, "trial_emails": boolean}. trial_emails should always be true and cannot be disabled.';
COMMENT ON COLUMN public.marketing_track_definitions.phases IS 'JSON array storing phase information (title, description, startWeek, endWeek, color)';
COMMENT ON COLUMN public.marketing_goals.phases IS 'JSON array storing phase information for the active marketing goal';
COMMENT ON COLUMN public.marketing_modules.pro_tip IS 'Weekly pro tip content for marketing modules';

-- =====================================================
-- DEFAULT DATA
-- =====================================================

-- Insert default asset categories
INSERT INTO public.asset_categories (id, name, icon, color) VALUES
  ('logos', 'Logos', '🎨', '#EF8E81'),
  ('photos', 'Photos', '📸', '#4ECDC4'),
  ('documents', 'Documents', '📄', '#45B7D1'),
  ('videos', 'Videos', '🎥', '#96CEB4'),
  ('templates', 'Templates', '📋', '#FFEAA7'),
  ('other', 'Other', '📁', '#95A5A6')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Create function for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_timeline_phases_updated_at BEFORE UPDATE ON public.timeline_phases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketing_goals_updated_at BEFORE UPDATE ON public.marketing_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketing_modules_updated_at BEFORE UPDATE ON public.marketing_modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketing_tasks_updated_at BEFORE UPDATE ON public.marketing_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketing_track_definitions_updated_at BEFORE UPDATE ON public.marketing_track_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_branding_kits_updated_at BEFORE UPDATE ON public.branding_kits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_share_links_updated_at BEFORE UPDATE ON public.share_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DATA MIGRATIONS
-- =====================================================

-- Update existing profiles to have trial status with 30-day trial
UPDATE public.profiles
SET
  subscription_status = 'trial',
  trial_start_date = NOW(),
  trial_end_date = NOW() + INTERVAL '30 days'
WHERE subscription_status IS NULL OR subscription_status = '';

-- Set default 4-phase structure for existing marketing goals
UPDATE public.marketing_goals 
SET phases = '[
  {"id": "1", "title": "Phase 1: Spark Traffic", "description": "Get people in the door immediately", "startWeek": 1, "endWeek": 3, "color": "#EF8E81"},
  {"id": "2", "title": "Phase 2: Build Momentum", "description": "Create consistent engagement", "startWeek": 4, "endWeek": 6, "color": "#D4AF37"},
  {"id": "3", "title": "Phase 3: Scale Up", "description": "Expand your reach and impact", "startWeek": 7, "endWeek": 9, "color": "#8B5CF6"},
  {"id": "4", "title": "Phase 4: Optimize", "description": "Refine and perfect your strategy", "startWeek": 10, "endWeek": 12, "color": "#10B981"}
]'::jsonb
WHERE phases IS NULL OR phases = '[]'::jsonb;

-- Set default 4-phase structure for existing marketing track definitions
UPDATE public.marketing_track_definitions 
SET phases = '[
  {"id": "1", "title": "Foundation Phase", "description": "Building your strategy foundation", "startWeek": 1, "endWeek": 3, "color": "#EF8E81"},
  {"id": "2", "title": "Implementation Phase", "description": "Putting strategies into action", "startWeek": 4, "endWeek": 6, "color": "#D4AF37"},
  {"id": "3", "title": "Growth Phase", "description": "Scaling and expanding your reach", "startWeek": 7, "endWeek": 9, "color": "#8B5CF6"},
  {"id": "4", "title": "Optimization Phase", "description": "Refining and optimizing performance", "startWeek": 10, "endWeek": 12, "color": "#10B981"}
]'::jsonb
WHERE phases IS NULL OR phases = '[]'::jsonb;

-- Keep updated_at fresh for all tables
UPDATE public.profiles SET updated_at = NOW();
