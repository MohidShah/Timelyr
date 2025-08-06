/*
  # Add Plan-Based Features

  1. Updates
    - Add expires_at column to timezone_links if not exists
    - Add function to reset monthly link counts
    - Add trigger to automatically set expiration dates

  2. Functions
    - Function to reset monthly counters
    - Function to set default expiration based on plan
*/

-- Add expires_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'timezone_links' AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE timezone_links ADD COLUMN expires_at timestamptz;
  END IF;
END $$;

-- Function to reset monthly link counts (to be called monthly via cron)
CREATE OR REPLACE FUNCTION reset_monthly_link_counts()
RETURNS void AS $$
BEGIN
  UPDATE user_profiles 
  SET links_created_this_month = 0
  WHERE links_created_this_month > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to set default expiration based on plan
CREATE OR REPLACE FUNCTION set_default_expiration()
RETURNS TRIGGER AS $$
DECLARE
  user_plan text;
  expiration_days integer;
BEGIN
  -- Get user's plan
  IF NEW.user_id IS NOT NULL THEN
    SELECT plan INTO user_plan
    FROM user_profiles
    WHERE id = NEW.user_id;
    
    -- Set expiration based on plan
    IF user_plan = 'pro' THEN
      expiration_days := 365; -- 1 year for pro
    ELSE
      expiration_days := 30; -- 30 days for starter
    END IF;
    
    -- Set expiration if not already set
    IF NEW.expires_at IS NULL THEN
      NEW.expires_at := NEW.created_at + (expiration_days || ' days')::interval;
    END IF;
  ELSE
    -- Anonymous links expire in 30 days
    IF NEW.expires_at IS NULL THEN
      NEW.expires_at := NEW.created_at + interval '30 days';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for setting default expiration
DROP TRIGGER IF EXISTS set_link_expiration_trigger ON timezone_links;
CREATE TRIGGER set_link_expiration_trigger
  BEFORE INSERT ON timezone_links
  FOR EACH ROW
  EXECUTE FUNCTION set_default_expiration();

-- Update existing links without expiration dates
UPDATE timezone_links 
SET expires_at = CASE 
  WHEN user_id IS NULL THEN created_at + interval '30 days'
  ELSE (
    SELECT CASE 
      WHEN up.plan = 'pro' THEN timezone_links.created_at + interval '365 days'
      ELSE timezone_links.created_at + interval '30 days'
    END
    FROM user_profiles up 
    WHERE up.id = timezone_links.user_id
  )
END
WHERE expires_at IS NULL;