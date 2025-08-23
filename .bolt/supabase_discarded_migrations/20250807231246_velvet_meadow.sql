/*
  # Complete Timelyr Database Schema

  This migration creates the complete database schema for Timelyr with all necessary tables,
  functions, triggers, and security policies.

  ## Tables Created:
  1. user_profiles - User profile information
  2. timezone_links - Timezone link data
  3. link_analytics - Link view analytics
  4. user_sessions - User session tracking
  5. link_templates - Link templates for users
  6. notification_preferences - User notification settings
  7. user_notifications - User notifications
  8. user_preferences - User app preferences
  9. user_activity_log - User activity tracking
  10. support_tickets - Support ticket system
  11. user_feedback - User feedback system

  ## Security:
  - Row Level Security enabled on all tables
  - Appropriate policies for data access
  - Triggers for automatic updates
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create function to set default expiration
CREATE OR REPLACE FUNCTION set_default_expiration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.expires_at IS NULL THEN
        NEW.expires_at = NEW.created_at + INTERVAL '30 days';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create function to increment unique viewers
CREATE OR REPLACE FUNCTION increment_unique_viewers()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if this is a unique viewer (simplified logic)
    UPDATE timezone_links 
    SET unique_viewers = unique_viewers + 1
    WHERE id = NEW.link_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username varchar(50) UNIQUE,
    display_name varchar(100) NOT NULL,
    email text NOT NULL,
    avatar_url text,
    bio text,
    phone varchar(20),
    company varchar(100),
    job_title varchar(100),
    website text,
    location varchar(100),
    default_timezone varchar(50) DEFAULT 'UTC',
    date_format varchar(20) DEFAULT 'MM/DD/YYYY',
    time_format varchar(10) DEFAULT '12h',
    business_hours_start time DEFAULT '09:00:00',
    business_hours_end time DEFAULT '17:00:00',
    email_notifications boolean DEFAULT true,
    profile_visibility varchar(20) DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'team')),
    plan varchar(20) DEFAULT 'starter' CHECK (plan IN ('starter', 'pro')),
    links_created_this_month integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create timezone_links table
CREATE TABLE IF NOT EXISTS timezone_links (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Create link_analytics table
CREATE TABLE IF NOT EXISTS link_analytics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    link_id uuid REFERENCES timezone_links(id) ON DELETE CASCADE,
    viewer_timezone varchar(50),
    viewer_country varchar(2),
    viewer_city varchar(100),
    viewed_at timestamptz DEFAULT now(),
    user_agent text,
    referrer text,
    ip_address inet
);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    device_info text,
    browser_info text,
    ip_address inet,
    location varchar(100),
    last_active timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- Create link_templates table
CREATE TABLE IF NOT EXISTS link_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    name varchar(100) NOT NULL,
    title_template varchar(200) NOT NULL,
    description_template text,
    default_timezone varchar(50),
    is_favorite boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    email_link_expiring boolean DEFAULT true,
    email_usage_limit boolean DEFAULT true,
    email_security_alerts boolean DEFAULT true,
    email_weekly_summary boolean DEFAULT false,
    push_notifications boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create user_notifications table
CREATE TABLE IF NOT EXISTS user_notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    type varchar(50) NOT NULL,
    title varchar(200) NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    action_url text,
    created_at timestamptz DEFAULT now()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_email boolean DEFAULT true,
    notification_browser boolean DEFAULT true,
    marketing_emails boolean DEFAULT false,
    weekly_digest boolean DEFAULT true,
    theme varchar(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    language varchar(10) DEFAULT 'en',
    dashboard_layout jsonb DEFAULT '{}',
    reduce_motion boolean DEFAULT false,
    high_contrast boolean DEFAULT false,
    large_text boolean DEFAULT false,
    pwa_installed boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create user_activity_log table
CREATE TABLE IF NOT EXISTS user_activity_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    action varchar(50) NOT NULL,
    details jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamptz DEFAULT now()
);

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    subject varchar(200) NOT NULL,
    message text NOT NULL,
    priority varchar(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status varchar(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    category varchar(20) CHECK (category IN ('technical', 'billing', 'feature_request', 'bug_report')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create user_feedback table
CREATE TABLE IF NOT EXISTS user_feedback (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    type varchar(20) NOT NULL CHECK (type IN ('bug', 'feature_request', 'improvement', 'compliment')),
    rating integer CHECK (rating >= 1 AND rating <= 5),
    message text NOT NULL,
    page_url text NOT NULL,
    user_agent text,
    status varchar(20) DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'implemented', 'closed')),
    created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_timezone_links_user_id ON timezone_links(user_id);
CREATE INDEX IF NOT EXISTS idx_timezone_links_slug ON timezone_links(slug);
CREATE INDEX IF NOT EXISTS idx_timezone_links_scheduled_time ON timezone_links(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_timezone_links_is_active ON timezone_links(is_active);
CREATE INDEX IF NOT EXISTS idx_link_analytics_link_id ON link_analytics(link_id);
CREATE INDEX IF NOT EXISTS idx_link_analytics_viewed_at ON link_analytics(viewed_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE timezone_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Public profiles are viewable by everyone" ON user_profiles
    FOR SELECT USING (profile_visibility = 'public');

CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for timezone_links
CREATE POLICY "Public links are viewable by everyone" ON timezone_links
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their own links" ON timezone_links
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own links" ON timezone_links
    FOR INSERT WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL));

CREATE POLICY "Users can update their own links" ON timezone_links
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own links" ON timezone_links
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for link_analytics
CREATE POLICY "Anyone can insert analytics" ON link_analytics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view analytics for their links" ON link_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM timezone_links 
            WHERE timezone_links.id = link_analytics.link_id 
            AND timezone_links.user_id = auth.uid()
        )
    );

-- Create RLS policies for user_sessions
CREATE POLICY "Users can view their own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON user_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" ON user_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for link_templates
CREATE POLICY "Users can manage their own templates" ON link_templates
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for notification_preferences
CREATE POLICY "Users can manage their own notification preferences" ON notification_preferences
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_notifications
CREATE POLICY "Users can view their own notifications" ON user_notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON user_notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON user_notifications
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_preferences
CREATE POLICY "Users can manage their own preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_activity_log
CREATE POLICY "Users can view their own activity" ON user_activity_log
    FOR SELECT USING (auth.uid() = user_id);

-- Create RLS policies for support_tickets
CREATE POLICY "Users can manage their own tickets" ON support_tickets
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_feedback
CREATE POLICY "Users can manage their own feedback" ON user_feedback
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timezone_links_updated_at
    BEFORE UPDATE ON timezone_links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for setting default expiration
CREATE TRIGGER set_link_expiration_trigger
    BEFORE INSERT ON timezone_links
    FOR EACH ROW EXECUTE FUNCTION set_default_expiration();

-- Create trigger for incrementing unique viewers
CREATE TRIGGER increment_unique_viewers_trigger
    AFTER INSERT ON link_analytics
    FOR EACH ROW EXECUTE FUNCTION increment_unique_viewers();