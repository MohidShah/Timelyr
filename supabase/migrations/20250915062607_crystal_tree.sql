/*
  # Complete Timelyr Database Schema

  1. Core Tables
    - user_profiles (enhanced with admin flags)
    - timezone_links (complete with all features)
    - link_analytics (detailed tracking)
    - user_notifications (notification system)
    - user_preferences (settings and themes)
    - user_activity_log (audit trail)

  2. Support & Feedback
    - support_tickets (customer support)
    - user_feedback (product feedback)

  3. Admin & Business
    - admin_activity_log (admin actions)
    - revenue_tracking (business metrics)
    - system_health_metrics (monitoring)

  4. Security & Performance
    - RLS policies for all tables
    - Performance indexes
    - Audit triggers
*/

-- Enhanced user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  username text UNIQUE,
  display_name text NOT NULL,
  avatar_url text,
  bio text,
  phone text,
  company text,
  job_title text,
  website text,
  location text,
  language text DEFAULT 'en',
  theme text DEFAULT 'light',
  account_status text DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'deleted')),
  email_verified boolean DEFAULT false,
  phone_verified boolean DEFAULT false,
  follower_count integer DEFAULT 0,
  following_count integer DEFAULT 0,
  default_timezone text DEFAULT 'UTC',
  profile_visibility text DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private')),
  plan text DEFAULT 'starter' CHECK (plan IN ('starter', 'pro')),
  is_admin boolean DEFAULT false,
  links_created_this_month integer DEFAULT 0,
  total_views_this_month integer DEFAULT 0,
  active_links integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enhanced timezone_links table
CREATE TABLE IF NOT EXISTS timezone_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (length(title) <= 200),
  slug text UNIQUE NOT NULL,
  description text CHECK (length(description) <= 1000),
  scheduled_time timestamptz NOT NULL,
  timezone text NOT NULL,
  original_timezone text NOT NULL,
  visibility text DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'unlisted')),
  is_recurring boolean DEFAULT false,
  recurrence_pattern text,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  view_count integer DEFAULT 0,
  unique_viewers integer DEFAULT 0,
  custom_slug text,
  qr_code_url text,
  calendar_integration jsonb DEFAULT '{}',
  business_hours_analysis jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Link analytics table
CREATE TABLE IF NOT EXISTS link_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid REFERENCES timezone_links(id) ON DELETE CASCADE,
  viewer_timezone text,
  viewer_country text,
  viewer_city text,
  viewer_region text,
  viewed_at timestamptz DEFAULT now(),
  user_agent text,
  referrer text,
  ip_address inet,
  session_id text,
  device_type text,
  browser_name text,
  os_name text
);

-- User notifications table
CREATE TABLE IF NOT EXISTS user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  action_url text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
  notification_email boolean DEFAULT true,
  notification_browser boolean DEFAULT true,
  marketing_emails boolean DEFAULT false,
  weekly_digest boolean DEFAULT true,
  theme text DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  language text DEFAULT 'en',
  dashboard_layout jsonb DEFAULT '{"sidebar_collapsed": false, "default_view": "grid", "items_per_page": 12}',
  reduce_motion boolean DEFAULT false,
  high_contrast boolean DEFAULT false,
  large_text boolean DEFAULT false,
  pwa_installed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User activity log table
CREATE TABLE IF NOT EXISTS user_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  action text NOT NULL,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  session_id text,
  created_at timestamptz DEFAULT now()
);

-- Support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  subject text NOT NULL,
  message text NOT NULL,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  category text CHECK (category IN ('technical', 'billing', 'feature_request', 'bug_report')),
  assigned_to uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  resolution text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User feedback table
CREATE TABLE IF NOT EXISTS user_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('bug', 'feature_request', 'improvement', 'compliment')),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  message text NOT NULL,
  page_url text,
  user_agent text,
  status text DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'implemented', 'closed')),
  admin_notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE timezone_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- RLS Policies for timezone_links
CREATE POLICY "Users can manage own links"
  ON timezone_links
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public links are viewable by everyone"
  ON timezone_links
  FOR SELECT
  TO anon, authenticated
  USING (visibility = 'public' AND is_active = true);

CREATE POLICY "Admins can view all links"
  ON timezone_links
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- RLS Policies for link_analytics
CREATE POLICY "Users can view analytics for own links"
  ON link_analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM timezone_links 
      WHERE id = link_analytics.link_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert analytics"
  ON link_analytics
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

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

CREATE POLICY "System can create notifications"
  ON user_notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for user_preferences
CREATE POLICY "Users can manage own preferences"
  ON user_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_activity_log
CREATE POLICY "Users can view own activity"
  ON user_activity_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can log activity"
  ON user_activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all activity"
  ON user_activity_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- RLS Policies for support_tickets
CREATE POLICY "Users can manage own tickets"
  ON support_tickets
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all tickets"
  ON support_tickets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- RLS Policies for user_feedback
CREATE POLICY "Users can manage own feedback"
  ON user_feedback
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback"
  ON user_feedback
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_timezone_links_user_id ON timezone_links(user_id);
CREATE INDEX IF NOT EXISTS idx_timezone_links_slug ON timezone_links(slug);
CREATE INDEX IF NOT EXISTS idx_timezone_links_scheduled_time ON timezone_links(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_timezone_links_is_active ON timezone_links(is_active);
CREATE INDEX IF NOT EXISTS idx_timezone_links_expires_at ON timezone_links(expires_at);

CREATE INDEX IF NOT EXISTS idx_link_analytics_link_id ON link_analytics(link_id);
CREATE INDEX IF NOT EXISTS idx_link_analytics_viewed_at ON link_analytics(viewed_at);
CREATE INDEX IF NOT EXISTS idx_link_analytics_viewer_country ON link_analytics(viewer_country);
CREATE INDEX IF NOT EXISTS idx_link_analytics_viewer_timezone ON link_analytics(viewer_timezone);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_action ON user_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);

-- Update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timezone_links_updated_at
  BEFORE UPDATE ON timezone_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();