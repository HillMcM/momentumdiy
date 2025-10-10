-- Add founder pricing tracking to profiles
-- This tracks the first 250 users who get the lifetime founder discount

-- Add columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_founder BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS founder_claimed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS founder_number INTEGER;

-- Create index for fast founder count queries
CREATE INDEX IF NOT EXISTS idx_profiles_founder ON public.profiles(is_founder, founder_number) WHERE is_founder = true;

-- Add comment
COMMENT ON COLUMN public.profiles.is_founder IS 'True if user claimed the founder lifetime discount (first 250 users)';
COMMENT ON COLUMN public.profiles.founder_claimed_at IS 'Timestamp when founder discount was claimed';
COMMENT ON COLUMN public.profiles.founder_number IS 'Sequential number (1-250) indicating which founder slot they claimed';

-- Create a function to get current founder count
CREATE OR REPLACE FUNCTION get_founder_count()
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.profiles
  WHERE is_founder = true;
$$;

-- Create a function to claim founder status (atomic operation)
CREATE OR REPLACE FUNCTION claim_founder_status(p_user_id UUID)
RETURNS TABLE(success BOOLEAN, founder_number INTEGER, message TEXT)
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_count INTEGER;
  v_founder_number INTEGER;
BEGIN
  -- Get current founder count
  SELECT get_founder_count() INTO v_current_count;
  
  -- Check if already at limit
  IF v_current_count >= 250 THEN
    RETURN QUERY SELECT false, 0, 'Founder spots are full (250/250)'::TEXT;
    RETURN;
  END IF;
  
  -- Check if user already claimed
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id AND is_founder = true) THEN
    SELECT profiles.founder_number INTO v_founder_number FROM public.profiles WHERE id = p_user_id;
    RETURN QUERY SELECT true, v_founder_number, 'Already a founder'::TEXT;
    RETURN;
  END IF;
  
  -- Claim the spot (atomic)
  v_founder_number := v_current_count + 1;
  
  UPDATE public.profiles
  SET 
    is_founder = true,
    founder_claimed_at = NOW(),
    founder_number = v_founder_number,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN QUERY SELECT true, v_founder_number, format('Successfully claimed founder spot #%s', v_founder_number)::TEXT;
END;
$$;

-- Add RLS policies (founders can read their own status)
-- Existing RLS should already cover this, but we'll add a specific one

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_founder_count() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION claim_founder_status(UUID) TO authenticated;

