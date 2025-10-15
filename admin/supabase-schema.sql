-- AI Agent System Database Schema for Supabase
-- Deploy this to your Supabase SQL editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Agent execution history
CREATE TABLE IF NOT EXISTS agent_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id TEXT NOT NULL,
    task TEXT NOT NULL,
    input JSONB,
    output JSONB,
    status TEXT NOT NULL,
    duration_ms INTEGER,
    tokens_used INTEGER,
    cost NUMERIC(10, 6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social media content for approval
CREATE TABLE IF NOT EXISTS social_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform TEXT NOT NULL,
    content TEXT NOT NULL,
    hashtags TEXT[],
    image_prompt TEXT,
    enhanced_prompt TEXT,
    blog_post_id UUID,
    status TEXT DEFAULT 'pending', -- pending, approved, published, rejected
    approved_by TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market research data
CREATE TABLE IF NOT EXISTS market_research (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trending_topics JSONB,
    competitor_analysis JSONB,
    content_gaps JSONB,
    opportunities JSONB,
    data_sources JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    research_id UUID REFERENCES market_research(id),
    wix_post_id TEXT,
    status TEXT DEFAULT 'draft', -- draft, published
    seo_title TEXT,
    meta_description TEXT,
    keywords TEXT[],
    published_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resource usage tracking
CREATE TABLE IF NOT EXISTS resource_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service TEXT NOT NULL, -- 'openai', 'gemini', 'news_api', 'serp_api', 'buffer'
    usage_type TEXT NOT NULL, -- 'tokens', 'requests', 'calls', 'posts'
    amount INTEGER NOT NULL,
    cost NUMERIC(10, 6),
    metadata JSONB,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent output storage (for approval workflow)
CREATE TABLE IF NOT EXISTS agent_outputs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent TEXT NOT NULL,
    type TEXT NOT NULL, -- 'blog-post', 'social-posts', 'research', etc.
    content JSONB NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected, published
    approved_by TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    feedback TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_executions_agent_id ON agent_executions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_created_at ON agent_executions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_executions_status ON agent_executions(status);

CREATE INDEX IF NOT EXISTS idx_social_content_status ON social_content(status);
CREATE INDEX IF NOT EXISTS idx_social_content_platform ON social_content(platform);
CREATE INDEX IF NOT EXISTS idx_social_content_created_at ON social_content(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_content_blog_post ON social_content(blog_post_id);

CREATE INDEX IF NOT EXISTS idx_market_research_created_at ON market_research(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_research ON blog_posts(research_id);

CREATE INDEX IF NOT EXISTS idx_resource_usage_date ON resource_usage(date DESC);
CREATE INDEX IF NOT EXISTS idx_resource_usage_service ON resource_usage(service);

CREATE INDEX IF NOT EXISTS idx_agent_outputs_status ON agent_outputs(status);
CREATE INDEX IF NOT EXISTS idx_agent_outputs_agent ON agent_outputs(agent);
CREATE INDEX IF NOT EXISTS idx_agent_outputs_created_at ON agent_outputs(created_at DESC);

-- Row Level Security (RLS) - Enable if using Supabase auth
-- ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE social_content ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE market_research ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE resource_usage ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE agent_outputs ENABLE ROW LEVEL SECURITY;

-- Optional: Create policies for admin access only
-- CREATE POLICY "Admin access only" ON agent_executions FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

