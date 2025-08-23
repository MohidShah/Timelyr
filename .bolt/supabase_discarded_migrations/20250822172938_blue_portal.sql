/*
  # Comprehensive User Management and Enhanced Features

  1. New Tables
    - `user_notifications` - User notification system with types and read status
    - `user_preferences` - User preferences including theme, language, dashboard layout
    - `support_tickets` - Support ticket system with categories and priorities
    - `user_activity_log` - Activity tracking and audit log for security
    - `user_api_keys` - API key management for Pro users
    - `user_webhooks` - Webhook management for integrations
    - `user_follows` - Social following system between users
    - `saved_searches` - Saved search functionality for links
    - `user_feedback` - Feedback collection system with ratings
    - `performance_metrics` - Performance monitoring and analytics
    - `push_subscriptions` - Push notification subscriptions
    - `email_verifications` - Email verification tokens
    - `phone_verifications` - Phone verification codes
    - `user_2fa` - Two-factor authentication settings
    - `user_2fa_temp` - Temporary 2FA setup data

  2. Enhanced Tables
    - Enhanced `user_profiles` with additional fields
    - Enhanced `timezone_links` with more features
    - Enhanced `link_analytics` with detailed tracking

  3. Security
    - Enable RLS on all tables
    - Add comprehensive policies for data access
    - Add triggers for automatic timestamps
*/

-- Enhanced user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone varchar(20);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS company varchar(255);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS job_title varchar(255);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS website varchar(500);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS location varchar(255);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS date_format varchar(20) DEFAULT 'MM/DD/YYYY';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS time_format varchar(10) DEFAULT '12h';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS business_hours_start time DEFAULT '09:00:00';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS business_hours_end time DEFAULT '17:00:00';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email_notifications boolean DEFAULT true;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_visibility varchar(20) DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'team'));
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS total_views_this_month integer DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS active_links integer DEFAULT 0;

-- Enhanced timezone_links table
ALTER TABLE timezone_links ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE timezone_links ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false;
ALTER TABLE timezone_links ADD COLUMN IF NOT EXISTS recurrence_pattern varchar(50);
ALTER TABLE timezone_links ADD COLUMN IF NOT EXISTS custom_slug varchar(100);
ALTER TABLE timezone_links ADD COLUMN IF NOT EXISTS password_protected boolean DEFAULT false;
ALTER TABLE timezone_links ADD COLUMN IF NOT EXISTS password_hash varchar(255);
ALTER TABLE timezone_links ADD COLUMN IF NOT EXISTS max_attendees integer;
ALTER TABLE timezone_links ADD COLUMN IF NOT EXISTS registration_required boolean DEFAULT false;
ALTER TABLE timezone_links ADD COLUMN IF NOT EXISTS tags text[];
ALTER TABLE timezone_links ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

-- Enhanced link_analytics table
ALTER TABLE link_analytics ADD COLUMN IF NOT EXISTS session_id varchar(255);
ALTER TABLE link_analytics ADD COLUMN IF NOT EXISTS device_type varchar(50);
ALTER TABLE link_analytics ADD COLUMN IF NOT EXISTS browser_name varchar(100);
ALTER TABLE link_analytics ADD COLUMN IF NOT EXISTS browser_version varchar(50);
ALTER TABLE link_analytics ADD COLUMN IF NOT EXISTS os_name varchar(100);
ALTER TABLE link_analytics ADD COLUMN IF NOT EXISTS os_version varchar(50);
ALTER TABLE link_analytics ADD COLUMN IF NOT EXISTS screen_resolution varchar(20);
ALTER TABLE link_analytics ADD COLUMN IF NOT EXISTS language varchar(10);
ALTER TABLE link_analytics ADD COLUMN IF NOT EXISTS time_on_page integer;
ALTER TABLE link_analytics ADD COLUMN IF NOT EXISTS utm_source varchar(100);
ALTER TABLE link_analytics ADD COLUMN IF NOT EXISTS utm_medium varchar(100);
ALTER TABLE link_analytics ADD COLUMN IF NOT EXISTS utm_campaign varchar(100);

-- User notifications table
CREATE TABLE IF NOT EXISTS user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type varchar(50) NOT NULL,
  title varchar(255) NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  action_url varchar(500),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  read_at timestamptz
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  notification_email boolean DEFAULT true,
  notification_browser boolean DEFAULT true,
  marketing_emails boolean DEFAULT false,
  weekly_digest boolean DEFAULT true,
  theme varchar(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  language varchar(10) DEFAULT 'en',
  dashboard_layout jsonb DEFAULT '{"sidebar_collapsed": false, "default_view": "grid", "items_per_page": 12}',
  reduce_motion boolean DEFAULT false,
  high_contrast boolean DEFAULT false,
  large_text boolean DEFAULT false,
  pwa_installed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject varchar(255) NOT NULL,
  message text NOT NULL,
  priority varchar(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status varchar(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  category varchar(50) CHECK (category IN ('technical', 'billing', 'feature_request', 'bug_report')),
  assigned_to varchar(255),
  resolution text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- User activity log table
CREATE TABLE IF NOT EXISTS user_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action varchar(100) NOT NULL,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- User API keys table
CREATE TABLE IF NOT EXISTS user_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name varchar(255) NOT NULL,
  key_hash varchar(255) NOT NULL UNIQUE,
  key_prefix varchar(20) NOT NULL,
  permissions text[] DEFAULT '{}',
  last_used_at timestamptz,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User webhooks table
CREATE TABLE IF NOT EXISTS user_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name varchar(255) NOT NULL,
  url varchar(500) NOT NULL,
  events text[] NOT NULL,
  secret varchar(255),
  is_active boolean DEFAULT true,
  last_triggered_at timestamptz,
  failure_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User follows table
CREATE TABLE IF NOT EXISTS user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Saved searches table
CREATE TABLE IF NOT EXISTS saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name varchar(255) NOT NULL,
  query text NOT NULL,
  filters jsonb DEFAULT '{}',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User feedback table
CREATE TABLE IF NOT EXISTS user_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type varchar(50) NOT NULL CHECK (type IN ('bug', 'feature_request', 'improvement', 'compliment')),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  message text NOT NULL,
  page_url varchar(500),
  user_agent text,
  status varchar(20) DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'implemented', 'closed')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name varchar(100) NOT NULL,
  metric_value numeric NOT NULL,
  metric_unit varchar(20),
  tags jsonb DEFAULT '{}',
  recorded_at timestamptz DEFAULT now()
);

-- Push subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint varchar(500) NOT NULL UNIQUE,
  p256dh varchar(255) NOT NULL,
  auth varchar(255) NOT NULL,
  user_agent text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Email verifications table
CREATE TABLE IF NOT EXISTS email_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email varchar(255) NOT NULL,
  token varchar(255) NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Phone verifications table
CREATE TABLE IF NOT EXISTS phone_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  phone varchar(20) NOT NULL,
  code varchar(10) NOT NULL,
  expires_at timestamptz NOT NULL,
  verified_at timestamptz,
  attempts integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- User 2FA table
CREATE TABLE IF NOT EXISTS user_2fa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  method varchar(20) NOT NULL CHECK (method IN ('totp', 'sms', 'email')),
  secret varchar(255),
  backup_codes text[],
  is_enabled boolean DEFAULT false,
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User 2FA temporary setup table
CREATE TABLE IF NOT EXISTS user_2fa_temp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  method varchar(20) NOT NULL CHECK (method IN ('totp', 'sms', 'email')),
  secret varchar(255),
  qr_code_url varchar(500),
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE timezone_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_analytics ENABLE ROW LEVEL SECURITY;
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
CREATE POLICY "Users can view own notifications"
  ON user_notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON user_notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_preferences
CREATE POLICY "Users can view own preferences"
  ON user_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for support_tickets
CREATE POLICY "Users can view own support tickets"
  ON support_tickets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create support tickets"
  ON support_tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own support tickets"
  ON support_tickets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_activity_log
CREATE POLICY "Users can view own activity log"
  ON user_activity_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity log"
  ON user_activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_api_keys
CREATE POLICY "Users can manage own API keys"
  ON user_api_keys
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_webhooks
CREATE POLICY "Users can manage own webhooks"
  ON user_webhooks
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_follows
CREATE POLICY "Users can view follows involving them"
  ON user_follows
  FOR SELECT
  TO authenticated
  USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can create follows"
  ON user_follows
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete own follows"
  ON user_follows
  FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- RLS Policies for saved_searches
CREATE POLICY "Users can manage own saved searches"
  ON saved_searches
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_feedback
CREATE POLICY "Users can view own feedback"
  ON user_feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create feedback"
  ON user_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for performance_metrics
CREATE POLICY "Performance metrics are read-only for authenticated users"
  ON performance_metrics
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for push_subscriptions
CREATE POLICY "Users can manage own push subscriptions"
  ON push_subscriptions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for email_verifications
CREATE POLICY "Users can view own email verifications"
  ON email_verifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage email verifications"
  ON email_verifications
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for phone_verifications
CREATE POLICY "Users can view own phone verifications"
  ON phone_verifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage phone verifications"
  ON phone_verifications
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_2fa
CREATE POLICY "Users can manage own 2FA settings"
  ON user_2fa
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_2fa_temp
CREATE POLICY "Users can manage own temporary 2FA data"
  ON user_2fa_temp
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update existing RLS policies for enhanced tables
DROP POLICY IF EXISTS "Users can read own data" ON user_profiles;
CREATE POLICY "Users can read own profile data"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile data"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Public profiles policy (for profile_visibility = 'public')
CREATE POLICY "Public profiles are viewable by all authenticated users"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (profile_visibility = 'public');

-- Enhanced timezone_links policies
DROP POLICY IF EXISTS "Users can read own links" ON timezone_links;
DROP POLICY IF EXISTS "Users can create links" ON timezone_links;
DROP POLICY IF EXISTS "Users can update own links" ON timezone_links;
DROP POLICY IF EXISTS "Users can delete own links" ON timezone_links;

CREATE POLICY "Users can read own links"
  ON timezone_links
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read active public links"
  ON timezone_links
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true AND password_protected = false);

CREATE POLICY "Users can create links"
  ON timezone_links
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own links"
  ON timezone_links
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own links"
  ON timezone_links
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Enhanced link_analytics policies
DROP POLICY IF EXISTS "Anyone can insert analytics" ON link_analytics;
CREATE POLICY "Anyone can insert analytics for active links"
  ON link_analytics
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM timezone_links 
      WHERE id = link_id AND is_active = true
    )
  );

CREATE POLICY "Link owners can view analytics"
  ON link_analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM timezone_links 
      WHERE id = link_id AND user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_action ON user_activity_log(action);

CREATE INDEX IF NOT EXISTS idx_user_api_keys_user_id ON user_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_key_hash ON user_api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_is_active ON user_api_keys(is_active);

CREATE INDEX IF NOT EXISTS idx_user_webhooks_user_id ON user_webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_webhooks_is_active ON user_webhooks(is_active);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON user_follows(following_id);

CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON saved_searches(user_id);

CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_type ON user_feedback(type);
CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON user_feedback(status);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_metric_name ON performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_recorded_at ON performance_metrics(recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token);

CREATE INDEX IF NOT EXISTS idx_phone_verifications_user_id ON phone_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_phone ON phone_verifications(phone);

CREATE INDEX IF NOT EXISTS idx_user_2fa_user_id ON user_2fa(user_id);

CREATE INDEX IF NOT EXISTS idx_user_2fa_temp_user_id ON user_2fa_temp(user_id);

-- Enhanced indexes for existing tables
CREATE INDEX IF NOT EXISTS idx_timezone_links_user_id ON timezone_links(user_id);
CREATE INDEX IF NOT EXISTS idx_timezone_links_slug ON timezone_links(slug);
CREATE INDEX IF NOT EXISTS idx_timezone_links_is_active ON timezone_links(is_active);
CREATE INDEX IF NOT EXISTS idx_timezone_links_created_at ON timezone_links(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_timezone_links_scheduled_time ON timezone_links(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_timezone_links_tags ON timezone_links USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_link_analytics_link_id ON link_analytics(link_id);
CREATE INDEX IF NOT EXISTS idx_link_analytics_viewed_at ON link_analytics(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_link_analytics_viewer_country ON link_analytics(viewer_country);
CREATE INDEX IF NOT EXISTS idx_link_analytics_viewer_timezone ON link_analytics(viewer_timezone);

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to tables with updated_at columns
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_api_keys_updated_at
    BEFORE UPDATE ON user_api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_webhooks_updated_at
    BEFORE UPDATE ON user_webhooks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_searches_updated_at
    BEFORE UPDATE ON saved_searches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_feedback_updated_at
    BEFORE UPDATE ON user_feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_push_subscriptions_updated_at
    BEFORE UPDATE ON push_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_2fa_updated_at
    BEFORE UPDATE ON user_2fa
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
    -- Clean up expired email verifications
    DELETE FROM email_verifications WHERE expires_at < now();
    
    -- Clean up expired phone verifications
    DELETE FROM phone_verifications WHERE expires_at < now();
    
    -- Clean up expired 2FA temp data
    DELETE FROM user_2fa_temp WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Create function to update user profile stats
CREATE OR REPLACE FUNCTION update_user_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update active links count
        UPDATE user_profiles 
        SET active_links = (
            SELECT COUNT(*) FROM timezone_links 
            WHERE user_id = NEW.user_id AND is_active = true
        )
        WHERE id = NEW.user_id;
        
        -- Update links created this month
        IF date_trunc('month', NEW.created_at) = date_trunc('month', now()) THEN
            UPDATE user_profiles 
            SET links_created_this_month = links_created_this_month + 1
            WHERE id = NEW.user_id;
        END IF;
        
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Update active links count for both old and new user (if changed)
        UPDATE user_profiles 
        SET active_links = (
            SELECT COUNT(*) FROM timezone_links 
            WHERE user_id = NEW.user_id AND is_active = true
        )
        WHERE id = NEW.user_id;
        
        IF OLD.user_id != NEW.user_id THEN
            UPDATE user_profiles 
            SET active_links = (
                SELECT COUNT(*) FROM timezone_links 
                WHERE user_id = OLD.user_id AND is_active = true
            )
            WHERE id = OLD.user_id;
        END IF;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update active links count
        UPDATE user_profiles 
        SET active_links = (
            SELECT COUNT(*) FROM timezone_links 
            WHERE user_id = OLD.user_id AND is_active = true
        )
        WHERE id = OLD.user_id;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update user profile stats
CREATE TRIGGER update_user_profile_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON timezone_links
    FOR EACH ROW
    EXECUTE FUNCTION update_user_profile_stats();