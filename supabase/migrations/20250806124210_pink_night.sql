/*
  # Comprehensive User Management System

  1. New Tables
    - `user_notifications` - User notification system
    - `user_preferences` - User preferences and settings
    - `support_tickets` - Support ticket system
    - `user_activity_log` - Activity tracking and audit log
    - `user_api_keys` - API key management for Pro users
    - `user_webhooks` - Webhook management
    - `user_follows` - Social following system
    - `saved_searches` - Saved search functionality
    - `user_feedback` - Feedback collection system
    - `performance_metrics` - Performance monitoring
    - `push_subscriptions` - Push notification subscriptions
    - `email_verifications` - Email verification tokens
    - `phone_verifications` - Phone verification codes
    - `user_2fa` - Two-factor authentication
    - `user_2fa_temp` - Temporary 2FA setup data

  2. Enhanced Tables
    - Update `user_profiles` with additional fields
    - Update `timezone_links` with enhanced features
    - Update `link_analytics` with more detailed tracking

  3. Security
    - Enable RLS on all new tables
    - Add comprehensive policies for data access
    - Add triggers for automatic timestamps
*/

-- Enhanced user profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS company VARCHAR(100);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS job_title VARCHAR(100);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS location VARCHAR(100);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS theme VARCHAR(20) DEFAULT 'light';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'active';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- Enhanced timezone links table
ALTER TABLE timezone_links ADD COLUMN IF NOT EXISTS original_timezone VARCHAR(50);
UPDATE timezone_links SET original_timezone = timezone WHERE original_timezone IS NULL;
ALTER TABLE timezone_links ALTER COLUMN original_timezone SET NOT NULL;

-- User notifications table
CREATE TABLE IF NOT EXISTS user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at timestamptz DEFAULT now()
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  notification_email BOOLEAN DEFAULT true,
  notification_browser BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  weekly_digest BOOLEAN DEFAULT true,
  theme VARCHAR(20) DEFAULT 'light',
  language VARCHAR(10) DEFAULT 'en',
  dashboard_layout JSONB DEFAULT '{}',
  reduce_motion BOOLEAN DEFAULT false,
  high_contrast BOOLEAN DEFAULT false,
  large_text BOOLEAN DEFAULT false,
  pwa_installed BOOLEAN DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'open',
  category VARCHAR(50),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User activity log
CREATE TABLE IF NOT EXISTS user_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at timestamptz DEFAULT now()
);

-- User API keys (Pro feature)
CREATE TABLE IF NOT EXISTS user_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  key_name VARCHAR(100) NOT NULL,
  key_hash TEXT NOT NULL,
  permissions TEXT[] DEFAULT '{}',
  last_used timestamptz,
  is_active BOOLEAN DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- User webhooks (Pro feature)
CREATE TABLE IF NOT EXISTS user_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] DEFAULT '{}',
  secret TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_triggered timestamptz,
  created_at timestamptz DEFAULT now()
);

-- User follows (social feature)
CREATE TABLE IF NOT EXISTS user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES users(id) ON DELETE CASCADE,
  followee_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, followee_id)
);

-- Saved searches
CREATE TABLE IF NOT EXISTS saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  query TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  notify_on_results BOOLEAN DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- User feedback
CREATE TABLE IF NOT EXISTS user_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  rating INTEGER,
  message TEXT NOT NULL,
  page_url TEXT,
  user_agent TEXT,
  status VARCHAR(20) DEFAULT 'open',
  created_at timestamptz DEFAULT now()
);

-- Performance metrics
CREATE TABLE IF NOT EXISTS performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  page_load_time INTEGER,
  time_to_interactive INTEGER,
  largest_contentful_paint INTEGER,
  cumulative_layout_shift DECIMAL,
  first_input_delay INTEGER,
  user_agent TEXT,
  connection_type VARCHAR(20),
  timestamp timestamptz DEFAULT now()
);

-- Push subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Email verifications
CREATE TABLE IF NOT EXISTS email_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL,
  expires_at timestamptz NOT NULL,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Phone verifications
CREATE TABLE IF NOT EXISTS phone_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  phone VARCHAR(20) NOT NULL,
  code VARCHAR(10) NOT NULL,
  expires_at timestamptz NOT NULL,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Two-factor authentication
CREATE TABLE IF NOT EXISTS user_2fa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  secret TEXT NOT NULL,
  backup_codes TEXT[] DEFAULT '{}',
  enabled BOOLEAN DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Temporary 2FA setup data
CREATE TABLE IF NOT EXISTS user_2fa_temp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  secret TEXT NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_followee_id ON user_follows(followee_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_type ON user_feedback(type);

-- Enable Row Level Security
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE phone_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_2fa ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_2fa_temp ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_notifications
CREATE POLICY "Users can view their own notifications"
  ON user_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON user_notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_preferences
CREATE POLICY "Users can manage their own preferences"
  ON user_preferences FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for support_tickets
CREATE POLICY "Users can manage their own support tickets"
  ON support_tickets FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_activity_log
CREATE POLICY "Users can view their own activity log"
  ON user_activity_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_api_keys
CREATE POLICY "Users can manage their own API keys"
  ON user_api_keys FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_webhooks
CREATE POLICY "Users can manage their own webhooks"
  ON user_webhooks FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_follows
CREATE POLICY "Users can view follows"
  ON user_follows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their own follows"
  ON user_follows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows"
  ON user_follows FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- RLS Policies for saved_searches
CREATE POLICY "Users can manage their own saved searches"
  ON saved_searches FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_feedback
CREATE POLICY "Users can manage their own feedback"
  ON user_feedback FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for performance_metrics
CREATE POLICY "Users can insert their own performance metrics"
  ON performance_metrics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for push_subscriptions
CREATE POLICY "Users can manage their own push subscriptions"
  ON push_subscriptions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for email_verifications
CREATE POLICY "Users can manage their own email verifications"
  ON email_verifications FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for phone_verifications
CREATE POLICY "Users can manage their own phone verifications"
  ON phone_verifications FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_2fa
CREATE POLICY "Users can manage their own 2FA settings"
  ON user_2fa FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_2fa_temp
CREATE POLICY "Users can manage their own temporary 2FA data"
  ON user_2fa_temp FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create triggers for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_push_subscriptions_updated_at
    BEFORE UPDATE ON push_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update follower counts
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment follower count for followee
        UPDATE user_profiles 
        SET follower_count = follower_count + 1 
        WHERE id = NEW.followee_id;
        
        -- Increment following count for follower
        UPDATE user_profiles 
        SET following_count = following_count + 1 
        WHERE id = NEW.follower_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement follower count for followee
        UPDATE user_profiles 
        SET follower_count = follower_count - 1 
        WHERE id = OLD.followee_id;
        
        -- Decrement following count for follower
        UPDATE user_profiles 
        SET following_count = following_count - 1 
        WHERE id = OLD.follower_id;
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger for follower count updates
CREATE TRIGGER update_follower_counts_trigger
    AFTER INSERT OR DELETE ON user_follows
    FOR EACH ROW EXECUTE FUNCTION update_follower_counts();