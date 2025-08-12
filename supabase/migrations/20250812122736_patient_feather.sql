/*
  # Fix duplicate policy errors

  1. Security Policy Updates
    - Drop existing policies if they exist before recreating them
    - Ensure all RLS policies are properly configured
    - Handle potential conflicts from previous migrations

  2. Changes
    - Use DROP POLICY IF EXISTS before creating policies
    - Recreate all necessary policies for user_profiles table
    - Ensure consistent policy naming and permissions
*/

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;

-- Recreate policies with proper permissions
CREATE POLICY "Public profiles are viewable by everyone"
  ON user_profiles
  FOR SELECT
  TO public
  USING (profile_visibility = 'public');

CREATE POLICY "Users can insert their own profile"
  ON user_profiles
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  TO public
  USING (auth.uid() = id);

CREATE POLICY "Users can view their own profile"
  ON user_profiles
  FOR SELECT
  TO public
  USING (auth.uid() = id);

-- Ensure RLS is enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Also fix any potential issues with other tables
DROP POLICY IF EXISTS "Public links are viewable by everyone" ON timezone_links;
DROP POLICY IF EXISTS "Users can insert their own links" ON timezone_links;
DROP POLICY IF EXISTS "Users can update their own links" ON timezone_links;
DROP POLICY IF EXISTS "Users can view their own links" ON timezone_links;
DROP POLICY IF EXISTS "Users can delete their own links" ON timezone_links;

-- Recreate timezone_links policies
CREATE POLICY "Public links are viewable by everyone"
  ON timezone_links
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Users can insert their own links"
  ON timezone_links
  FOR INSERT
  TO public
  WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL));

CREATE POLICY "Users can update their own links"
  ON timezone_links
  FOR UPDATE
  TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own links"
  ON timezone_links
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own links"
  ON timezone_links
  FOR DELETE
  TO public
  USING (auth.uid() = user_id);

-- Ensure RLS is enabled for timezone_links
ALTER TABLE timezone_links ENABLE ROW LEVEL SECURITY;

-- Fix link_analytics policies
DROP POLICY IF EXISTS "Anyone can insert analytics" ON link_analytics;
DROP POLICY IF EXISTS "Users can view analytics for their links" ON link_analytics;

CREATE POLICY "Anyone can insert analytics"
  ON link_analytics
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can view analytics for their links"
  ON link_analytics
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM timezone_links
      WHERE timezone_links.id = link_analytics.link_id
      AND timezone_links.user_id = auth.uid()
    )
  );

-- Ensure RLS is enabled for link_analytics
ALTER TABLE link_analytics ENABLE ROW LEVEL SECURITY;