-- AI Usage Tracking Table
-- Tracks token usage and costs per user for $5/month limit enforcement

CREATE TABLE IF NOT EXISTS ai_usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  conversation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Token usage
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  cached_tokens INTEGER NOT NULL DEFAULT 0,
  cache_creation_tokens INTEGER NOT NULL DEFAULT 0,
  cache_read_tokens INTEGER NOT NULL DEFAULT 0,
  
  -- Cost tracking (in cents for precision)
  cost_cents INTEGER NOT NULL DEFAULT 0, -- e.g., 64 = $0.0064
  
  -- Metadata
  endpoint VARCHAR(100), -- e.g., '/api/ai/chat'
  model_version VARCHAR(100), -- e.g., 'claude-sonnet-4-5-20250929'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date ON ai_usage_tracking(user_id, conversation_date);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created ON ai_usage_tracking(created_at);

-- View for monthly usage aggregation
CREATE OR REPLACE VIEW monthly_ai_usage AS
SELECT 
  user_id,
  DATE_TRUNC('month', conversation_date) as month,
  COUNT(*) as total_conversations,
  SUM(input_tokens) as total_input_tokens,
  SUM(output_tokens) as total_output_tokens,
  SUM(cached_tokens) as total_cached_tokens,
  SUM(cost_cents) as total_cost_cents,
  ROUND(SUM(cost_cents) / 100.0, 2) as total_cost_dollars,
  MAX(conversation_date) as last_conversation_date
FROM ai_usage_tracking
GROUP BY user_id, DATE_TRUNC('month', conversation_date);

-- View for daily usage aggregation
CREATE OR REPLACE VIEW daily_ai_usage AS
SELECT 
  user_id,
  conversation_date,
  COUNT(*) as total_conversations,
  SUM(input_tokens) as total_input_tokens,
  SUM(output_tokens) as total_output_tokens,
  SUM(cost_cents) as total_cost_cents,
  ROUND(SUM(cost_cents) / 100.0, 2) as total_cost_dollars
FROM ai_usage_tracking
GROUP BY user_id, conversation_date;

-- Function to get current month usage for a user
CREATE OR REPLACE FUNCTION get_user_monthly_ai_usage(p_user_id UUID)
RETURNS TABLE (
  conversations INTEGER,
  cost_cents INTEGER,
  cost_dollars NUMERIC,
  percentage_of_limit INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(COUNT(*)::INTEGER, 0) as conversations,
    COALESCE(SUM(cost_cents)::INTEGER, 0) as cost_cents,
    ROUND(COALESCE(SUM(cost_cents), 0) / 100.0, 2) as cost_dollars,
    ROUND((COALESCE(SUM(cost_cents), 0) / 500.0) * 100)::INTEGER as percentage_of_limit
  FROM ai_usage_tracking
  WHERE user_id = p_user_id
    AND DATE_TRUNC('month', conversation_date) = DATE_TRUNC('month', CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has exceeded limit
CREATE OR REPLACE FUNCTION check_ai_usage_limit(p_user_id UUID)
RETURNS TABLE (
  within_limit BOOLEAN,
  current_cost_cents INTEGER,
  limit_cost_cents INTEGER,
  remaining_cents INTEGER,
  conversations_used INTEGER,
  estimated_conversations_remaining INTEGER
) AS $$
DECLARE
  v_cost_cents INTEGER;
  v_conversations INTEGER;
  v_limit_cents INTEGER := 500; -- $5.00 limit
  v_avg_cost_per_chat INTEGER := 64; -- $0.0064 average
BEGIN
  -- Get current month usage
  SELECT 
    COALESCE(SUM(cost_cents), 0),
    COALESCE(COUNT(*), 0)
  INTO v_cost_cents, v_conversations
  FROM ai_usage_tracking
  WHERE user_id = p_user_id
    AND DATE_TRUNC('month', conversation_date) = DATE_TRUNC('month', CURRENT_DATE);
  
  RETURN QUERY
  SELECT 
    (v_cost_cents < v_limit_cents) as within_limit,
    v_cost_cents as current_cost_cents,
    v_limit_cents as limit_cost_cents,
    GREATEST(0, v_limit_cents - v_cost_cents) as remaining_cents,
    v_conversations as conversations_used,
    GREATEST(0, (v_limit_cents - v_cost_cents) / v_avg_cost_per_chat) as estimated_conversations_remaining;
END;
$$ LANGUAGE plpgsql;

-- Add comment for documentation
COMMENT ON TABLE ai_usage_tracking IS 'Tracks AI token usage and costs per user for enforcing monthly $5 limit';
COMMENT ON FUNCTION get_user_monthly_ai_usage IS 'Returns current month AI usage stats for a user';
COMMENT ON FUNCTION check_ai_usage_limit IS 'Checks if user is within $5/month AI usage limit';

-- Grant permissions
GRANT SELECT ON ai_usage_tracking TO authenticated;
GRANT SELECT ON monthly_ai_usage TO authenticated;
GRANT SELECT ON daily_ai_usage TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_monthly_ai_usage TO authenticated;
GRANT EXECUTE ON FUNCTION check_ai_usage_limit TO authenticated;

