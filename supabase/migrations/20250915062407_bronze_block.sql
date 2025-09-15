/*
  # Admin Schema Setup

  1. New Tables
    - Add admin flag to user_profiles
    - Create admin_activity_log for admin actions
    - Create system_health_metrics for monitoring
    - Create revenue_tracking for business metrics

  2. Security
    - Enable RLS on all new tables
    - Add policies for admin-only access
    - Add audit logging for admin actions

  3. Indexes
    - Add performance indexes for admin queries
    - Add composite indexes for analytics
*/

-- Add admin flag to user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;

-- Create admin activity log
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  action text NOT NULL,
  target_user_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin activity log"
  ON admin_activity_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can insert admin activity log"
  ON admin_activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Create system health metrics
CREATE TABLE IF NOT EXISTS system_health_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  metric_unit text,
  recorded_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);

ALTER TABLE system_health_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view system health metrics"
  ON system_health_metrics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Create revenue tracking
CREATE TABLE IF NOT EXISTS revenue_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  plan_type text NOT NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'USD',
  billing_period text NOT NULL, -- 'monthly' or 'annual'
  transaction_date timestamptz DEFAULT now(),
  status text DEFAULT 'active', -- 'active', 'cancelled', 'refunded'
  metadata jsonb DEFAULT '{}'
);

ALTER TABLE revenue_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view revenue tracking"
  ON revenue_tracking
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can manage revenue tracking"
  ON revenue_tracking
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_user_id ON admin_activity_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_system_health_metrics_recorded_at ON system_health_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_user_id ON revenue_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_transaction_date ON revenue_tracking(transaction_date);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin ON user_profiles(is_admin) WHERE is_admin = true;
CREATE INDEX IF NOT EXISTS idx_user_profiles_plan ON user_profiles(plan);
CREATE INDEX IF NOT EXISTS idx_user_profiles_account_status ON user_profiles(account_status);

-- Create a default admin user (update email as needed)
DO $$
BEGIN
  -- Only create if no admin exists
  IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE is_admin = true) THEN
    -- This would typically be done through a separate admin setup process
    -- For now, we'll just ensure the structure is ready
    NULL;
  END IF;
END $$;