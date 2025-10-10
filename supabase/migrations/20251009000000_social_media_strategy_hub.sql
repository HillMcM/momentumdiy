-- Social Media Strategy Hub Migration
-- Create tables for managing social media strategies and share links

-- Create social media strategies table
CREATE TABLE IF NOT EXISTS public.social_media_strategies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id UUID,  -- Optional reference to track, no FK constraint to avoid dependency issues
  
  -- Content Pillars (3-4 core topics)
  content_pillars JSONB DEFAULT '[]'::jsonb, -- [{id, name, description, colorTag, exampleIdeas: []}]
  
  -- Brand Voice & Visual Style
  brand_voice JSONB DEFAULT '{}'::jsonb, -- {tone: [], adjectives: [], personalityNotes: "", styleGuide: ""}
  visual_style JSONB DEFAULT '{}'::jsonb, -- {colors: [], fonts: {heading: "", body: ""}, imageStyle: "", designNotes: ""}
  
  -- Posting Schedule
  posting_schedule JSONB DEFAULT '{}'::jsonb, -- {frequency: 3, days: ["monday", "wednesday", "friday"], postTypes: {monday: "educate", ...}}
  
  -- Metrics Tracking
  baseline_metrics JSONB DEFAULT '{}'::jsonb, -- {followers: 0, avgLikes: 0, avgComments: 0, storyViews: 0, date: ""}
  current_metrics JSONB DEFAULT '{}'::jsonb, -- Same structure as baseline
  weekly_snapshots JSONB DEFAULT '[]'::jsonb, -- [{week: 1, date: "", metrics: {...}}]
  
  -- Collaboration & Notes
  notes TEXT,
  collaborators JSONB DEFAULT '[]'::jsonb, -- [{name: "", role: "", email: "", accessLevel: "view"}]
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, track_id)
);

-- Add indexes for performance
CREATE INDEX idx_social_media_strategies_user ON public.social_media_strategies(user_id);
CREATE INDEX idx_social_media_strategies_track ON public.social_media_strategies(track_id);

-- Add comments for documentation
COMMENT ON TABLE public.social_media_strategies IS 'Stores social media strategy data for users enrolled in social media tracks';
COMMENT ON COLUMN public.social_media_strategies.content_pillars IS '3-4 core content themes with examples';
COMMENT ON COLUMN public.social_media_strategies.brand_voice IS 'Brand voice definition including tone, adjectives, and style guide';
COMMENT ON COLUMN public.social_media_strategies.visual_style IS 'Visual branding elements including colors, fonts, and image style';
COMMENT ON COLUMN public.social_media_strategies.posting_schedule IS 'Weekly posting frequency and schedule';
COMMENT ON COLUMN public.social_media_strategies.baseline_metrics IS 'Starting metrics snapshot';
COMMENT ON COLUMN public.social_media_strategies.current_metrics IS 'Current metrics snapshot';
COMMENT ON COLUMN public.social_media_strategies.weekly_snapshots IS 'Historical weekly metric snapshots';

-- Create share links table for public sharing
CREATE TABLE IF NOT EXISTS public.social_strategy_share_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  strategy_id UUID REFERENCES public.social_media_strategies(id) ON DELETE CASCADE,
  access_code TEXT UNIQUE NOT NULL,
  recipient_name TEXT,
  recipient_email TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE
);

-- Add index for access code lookups
CREATE INDEX idx_social_strategy_share_links_code ON public.social_strategy_share_links(access_code);
CREATE INDEX idx_social_strategy_share_links_strategy ON public.social_strategy_share_links(strategy_id);

COMMENT ON TABLE public.social_strategy_share_links IS 'Secure share links for sharing strategy with external collaborators';
COMMENT ON COLUMN public.social_strategy_share_links.access_code IS 'Unique access code for the share link';
COMMENT ON COLUMN public.social_strategy_share_links.expires_at IS 'Optional expiration date for the link';
COMMENT ON COLUMN public.social_strategy_share_links.is_active IS 'Whether the link is currently active';
COMMENT ON COLUMN public.social_strategy_share_links.last_accessed_at IS 'Last time the link was accessed';

-- Enable Row Level Security
ALTER TABLE public.social_media_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_strategy_share_links ENABLE ROW LEVEL SECURITY;

-- Add foreign key constraint for track_id if marketing_track_definitions exists
-- This is done conditionally to avoid errors if the table doesn't exist yet
DO $$ 
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'marketing_track_definitions'
  ) THEN
    ALTER TABLE public.social_media_strategies
    ADD CONSTRAINT fk_social_strategies_track 
    FOREIGN KEY (track_id) 
    REFERENCES public.marketing_track_definitions(id) 
    ON DELETE SET NULL;
  END IF;
END $$;

-- RLS Policies for social_media_strategies
-- Users can only see their own strategies
CREATE POLICY "Users can view their own strategies"
  ON public.social_media_strategies
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own strategies
CREATE POLICY "Users can create their own strategies"
  ON public.social_media_strategies
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own strategies
CREATE POLICY "Users can update their own strategies"
  ON public.social_media_strategies
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own strategies
CREATE POLICY "Users can delete their own strategies"
  ON public.social_media_strategies
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for social_strategy_share_links
-- Users can view share links for their own strategies
CREATE POLICY "Users can view their own share links"
  ON public.social_strategy_share_links
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.social_media_strategies
      WHERE id = strategy_id AND user_id = auth.uid()
    )
  );

-- Users can create share links for their own strategies
CREATE POLICY "Users can create share links for their strategies"
  ON public.social_strategy_share_links
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.social_media_strategies
      WHERE id = strategy_id AND user_id = auth.uid()
    )
  );

-- Users can update share links for their own strategies
CREATE POLICY "Users can update their own share links"
  ON public.social_strategy_share_links
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.social_media_strategies
      WHERE id = strategy_id AND user_id = auth.uid()
    )
  );

-- Users can delete share links for their own strategies
CREATE POLICY "Users can delete their own share links"
  ON public.social_strategy_share_links
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.social_media_strategies
      WHERE id = strategy_id AND user_id = auth.uid()
    )
  );

