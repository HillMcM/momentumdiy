-- =====================================================
-- ENHANCE PROFILE FIELDS, CHAT SESSIONS & ASSET SHARING
-- =====================================================
-- This migration:
-- 1. Adds brand_accent_color column to public.profiles
-- 2. Creates public.chat_sessions table for AI chat persistence
-- 3. Creates public.asset_share_links table for Asset Library sharing
-- 4. Sets up RLS policies and update triggers for the new tables

-- 1. Add brand_accent_color to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS brand_accent_color TEXT;

-- 2. Create chat_sessions table
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on chat_sessions
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for chat_sessions
CREATE POLICY "Users can manage their own chat sessions" ON public.chat_sessions
  FOR ALL USING (auth.uid() = user_id);

-- 3. Create asset_share_links table
CREATE TABLE IF NOT EXISTS public.asset_share_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shared_asset_ids UUID[] DEFAULT NULL,
  name TEXT NOT NULL,
  email TEXT,
  access_code TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on asset_share_links
ALTER TABLE public.asset_share_links ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for asset_share_links
CREATE POLICY "Users can manage their own asset share links" ON public.asset_share_links
  FOR ALL USING (auth.uid() = user_id);

-- 4. Create update triggers
DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON public.chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON public.chat_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_asset_share_links_updated_at ON public.asset_share_links;
CREATE TRIGGER update_asset_share_links_updated_at BEFORE UPDATE ON public.asset_share_links 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
