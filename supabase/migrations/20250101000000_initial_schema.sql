-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_timeline_phases_project_id ON public.timeline_phases(project_id);
CREATE INDEX IF NOT EXISTS idx_marketing_modules_goal_id ON public.marketing_modules(goal_id);
CREATE INDEX IF NOT EXISTS idx_marketing_tasks_module_id ON public.marketing_tasks(module_id);
CREATE INDEX IF NOT EXISTS idx_assets_category ON public.assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_tags ON public.assets USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON public.calendar_events(start_time);

-- Create RLS (Row Level Security) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branding_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branding_kit_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects policies (for now, allow all authenticated users to access all projects)
CREATE POLICY "Authenticated users can access projects" ON public.projects FOR ALL USING (auth.role() = 'authenticated');

-- Tasks policies
CREATE POLICY "Authenticated users can access tasks" ON public.tasks FOR ALL USING (auth.role() = 'authenticated');

-- Timeline phases policies
CREATE POLICY "Authenticated users can access timeline phases" ON public.timeline_phases FOR ALL USING (auth.role() = 'authenticated');

-- Marketing goals policies
CREATE POLICY "Authenticated users can access marketing goals" ON public.marketing_goals FOR ALL USING (auth.role() = 'authenticated');

-- Marketing modules policies
CREATE POLICY "Authenticated users can access marketing modules" ON public.marketing_modules FOR ALL USING (auth.role() = 'authenticated');

-- Marketing tasks policies
CREATE POLICY "Authenticated users can access marketing tasks" ON public.marketing_tasks FOR ALL USING (auth.role() = 'authenticated');

-- Calendar events policies
CREATE POLICY "Authenticated users can access calendar events" ON public.calendar_events FOR ALL USING (auth.role() = 'authenticated');

-- Assets policies
CREATE POLICY "Authenticated users can access assets" ON public.assets FOR ALL USING (auth.role() = 'authenticated');

-- Branding kits policies
CREATE POLICY "Authenticated users can access branding kits" ON public.branding_kits FOR ALL USING (auth.role() = 'authenticated');

-- Branding kit assets policies
CREATE POLICY "Authenticated users can access branding kit assets" ON public.branding_kit_assets FOR ALL USING (auth.role() = 'authenticated');

-- Share links policies
CREATE POLICY "Authenticated users can access share links" ON public.share_links FOR ALL USING (auth.role() = 'authenticated');

-- Insert default asset categories
INSERT INTO public.asset_categories (id, name, icon, color) VALUES
  ('logos', 'Logos', '🎨', '#EF8E81'),
  ('photos', 'Photos', '📸', '#4ECDC4'),
  ('documents', 'Documents', '📄', '#45B7D1'),
  ('videos', 'Videos', '🎥', '#96CEB4'),
  ('templates', 'Templates', '📋', '#FFEAA7'),
  ('other', 'Other', '📁', '#95A5A6')
ON CONFLICT (id) DO NOTHING;

-- Create functions for automatic timestamp updates
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
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_branding_kits_updated_at BEFORE UPDATE ON public.branding_kits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_share_links_updated_at BEFORE UPDATE ON public.share_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 