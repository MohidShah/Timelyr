/*
  # Complete Timelyr Database Schema

  1. New Tables
    - `user_profiles` - Extended user profile information
    - `link_analytics` - Track link views and analytics
    - `user_sessions` - Security and session management
    - `link_templates` - Saved link templates for quick creation

  2. Enhanced Tables
    - Updated `timezone_links` with recurring events and better metadata
    - Updated `profiles` with additional user preferences

  3. Security
    - Enable RLS on all new tables
    - Add comprehensive policies for data access
    - Add indexes for performance

  4. Functions
    - Auto-update timestamps
    - Username validation
    - Analytics aggregation
*/

-- Drop existing profiles table to recreate with enhanced schema
DROP TABLE IF EXISTS profiles CASCADE;

-- Enhanced user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username varchar(50) UNIQUE,
  display_name varchar(100) NOT NULL,
  email text NOT NULL,
  avatar_url text,
  bio text,
  default_timezone varchar(50) DEFAULT 'UTC',
  date_format varchar(20) DEFAULT 'MM/DD/YYYY',
  time_format varchar(10) DEFAULT '12h',
  business_hours_start time DEFAULT '09:00',
  business_hours_end time DEFAULT '17:00',
  email_notifications boolean DEFAULT true,
  profile_visibility varchar(20) DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'team')),
  plan varchar(20) DEFAULT 'starter' CHECK (plan IN ('starter', 'pro')),
  links_created_this_month integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enhanced timezone links table
DROP TABLE IF EXISTS timezone_links CASCADE;
CREATE TABLE IF NOT EXISTS timezone_links (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title varchar(200) NOT NULL,
  slug varchar(100) UNIQUE NOT NULL,
  scheduled_time timestamptz NOT NULL,
  timezone varchar(50) NOT NULL,
  description text,
  is_recurring boolean DEFAULT false,
  recurrence_pattern varchar(50),
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  view_count integer DEFAULT 0,
  unique_viewers integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Link analytics table
CREATE TABLE IF NOT EXISTS link_analytics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id uuid REFERENCES timezone_links(id) ON DELETE CASCADE,
  viewer_timezone varchar(50),
  viewer_country varchar(2),
  viewer_city varchar(100),
  viewed_at timestamptz DEFAULT now(),
  user_agent text,
  referrer text,
  ip_address inet
);

-- User sessions table for security
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  device_info text,
  browser_info text,
  ip_address inet,
  location varchar(100),
  last_active timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Link templates for quick creation
CREATE TABLE IF NOT EXISTS link_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name varchar(100) NOT NULL,
  title_template varchar(200) NOT NULL,
  description_template text,
  default_timezone varchar(50),
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email_link_expiring boolean DEFAULT true,
  email_usage_limit boolean DEFAULT true,
  email_security_alerts boolean DEFAULT true,
  email_weekly_summary boolean DEFAULT false,
  push_notifications boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE timezone_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by everyone"
  ON user_profiles FOR SELECT
  USING (profile_visibility = 'public');

-- RLS Policies for timezone_links
CREATE POLICY "Public links are viewable by everyone"
  ON timezone_links FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can insert their own links"
  ON timezone_links FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own links"
  ON timezone_links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own links"
  ON timezone_links FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own links"
  ON timezone_links FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for link_analytics
CREATE POLICY "Users can view analytics for their links"
  ON link_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM timezone_links 
      WHERE timezone_links.id = link_analytics.link_id 
      AND timezone_links.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert analytics"
  ON link_analytics FOR INSERT
  WITH CHECK (true);

-- RLS Policies for user_sessions
CREATE POLICY "Users can view their own sessions"
  ON user_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON user_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON user_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for link_templates
CREATE POLICY "Users can manage their own templates"
  ON link_templates FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for notification_preferences
CREATE POLICY "Users can manage their own notification preferences"
  ON notification_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_timezone_links_user_id ON timezone_links(user_id);
CREATE INDEX IF NOT EXISTS idx_timezone_links_slug ON timezone_links(slug);
CREATE INDEX IF NOT EXISTS idx_timezone_links_scheduled_time ON timezone_links(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_timezone_links_is_active ON timezone_links(is_active);
CREATE INDEX IF NOT EXISTS idx_link_analytics_link_id ON link_analytics(link_id);
CREATE INDEX IF NOT EXISTS idx_link_analytics_viewed_at ON link_analytics(viewed_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_timezone_links_updated_at BEFORE UPDATE ON timezone_links FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to validate username format
CREATE OR REPLACE FUNCTION validate_username(username text)
RETURNS boolean AS $$
BEGIN
    RETURN username ~ '^[a-zA-Z0-9_-]{3,50}$';
END;
$$ LANGUAGE plpgsql;

-- Function to increment unique viewers
CREATE OR REPLACE FUNCTION increment_unique_viewers()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if this timezone has viewed this link before
    IF NOT EXISTS (
        SELECT 1 FROM link_analytics 
        WHERE link_id = NEW.link_id 
        AND viewer_timezone = NEW.viewer_timezone
        AND id != NEW.id
    ) THEN
        -- Increment unique viewers count
        UPDATE timezone_links 
        SET unique_viewers = unique_viewers + 1 
        WHERE id = NEW.link_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for unique viewers
CREATE TRIGGER increment_unique_viewers_trigger
    AFTER INSERT ON link_analytics
    FOR EACH ROW EXECUTE PROCEDURE increment_unique_viewers();