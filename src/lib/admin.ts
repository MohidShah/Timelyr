import { supabase } from './supabase';
import { createNotification } from './notifications';
import { logUserActivity } from './activity';

export interface AdminUser {
  id: string;
  email: string;
  display_name: string;
  plan: 'starter' | 'pro';
  account_status: 'active' | 'suspended' | 'deleted';
  created_at: string;
  last_login?: string;
  links_count: number;
  total_views: number;
  revenue_contribution: number;
}

export interface SystemHealth {
  database_status: 'healthy' | 'degraded' | 'down';
  api_response_time: number;
  error_rate: number;
  uptime_percentage: number;
  active_connections: number;
  storage_usage: number;
}

// Check if user is admin
export const isAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();
    
    if (error) return false;
    return data?.is_admin || false;
  } catch (error) {
    return false;
  }
};

// Get admin dashboard stats
export const getAdminStats = async () => {
  const { data: users, error: usersError } = await supabase
    .from('user_profiles')
    .select('*');
  
  const { data: links, error: linksError } = await supabase
    .from('timezone_links')
    .select('*');
  
  if (usersError || linksError) {
    throw new Error('Failed to fetch admin stats');
  }

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.account_status === 'active').length;
  const proUsers = users.filter(u => u.plan === 'pro').length;
  const totalViews = links.reduce((sum, link) => sum + link.view_count, 0);
  
  const today = new Date().toISOString().split('T')[0];
  const newUsersToday = users.filter(u => u.created_at.startsWith(today)).length;
  const linksCreatedToday = links.filter(l => l.created_at.startsWith(today)).length;

  return {
    totalUsers,
    activeUsers,
    totalLinks: links.length,
    totalViews,
    proUsers,
    revenue: proUsers * 12, // $12/month per pro user
    newUsersToday,
    linksCreatedToday,
    conversionRate: totalUsers > 0 ? (proUsers / totalUsers) * 100 : 0,
    averageLinksPerUser: totalUsers > 0 ? links.length / totalUsers : 0
  };
};

// Get all users for admin management
export const getAllUsers = async (): Promise<AdminUser[]> => {
  const { data: users, error: usersError } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (usersError) throw usersError;

  // Get link counts for each user
  const { data: linkCounts, error: linksError } = await supabase
    .from('timezone_links')
    .select('user_id, view_count');
  
  if (linksError) throw linksError;

  // Process user data
  return users.map(user => {
    const userLinks = linkCounts.filter(l => l.user_id === user.id);
    const linksCount = userLinks.length;
    const totalViews = userLinks.reduce((sum, link) => sum + link.view_count, 0);
    const revenueContribution = user.plan === 'pro' ? 12 : 0;

    return {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      plan: user.plan || 'starter',
      account_status: user.account_status || 'active',
      created_at: user.created_at,
      last_login: user.updated_at,
      links_count: linksCount,
      total_views: totalViews,
      revenue_contribution: revenueContribution
    };
  });
};

// Update user plan
export const updateUserPlan = async (userId: string, plan: 'starter' | 'pro') => {
  const { error } = await supabase
    .from('user_profiles')
    .update({ plan })
    .eq('id', userId);
  
  if (error) throw error;
  
  // Send notification to user
  await createNotification(userId, {
    type: 'plan_changed',
    title: `Plan ${plan === 'pro' ? 'Upgraded' : 'Downgraded'}`,
    message: `Your plan has been ${plan === 'pro' ? 'upgraded to Pro' : 'downgraded to Starter'} by an administrator.`,
    action_url: '/dashboard'
  });
  
  // Log admin activity
  await logUserActivity(userId, 'plan_changed_by_admin', { new_plan: plan });
};

// Update user status
export const updateUserStatus = async (userId: string, status: 'active' | 'suspended') => {
  const { error } = await supabase
    .from('user_profiles')
    .update({ account_status: status })
    .eq('id', userId);
  
  if (error) throw error;
  
  // Send notification to user
  await createNotification(userId, {
    type: 'account_status_changed',
    title: `Account ${status === 'active' ? 'Reactivated' : 'Suspended'}`,
    message: `Your account has been ${status === 'active' ? 'reactivated' : 'suspended'} by an administrator.`,
    action_url: status === 'suspended' ? '/contact' : '/dashboard'
  });
  
  // Log admin activity
  await logUserActivity(userId, 'account_status_changed_by_admin', { new_status: status });
};

// Get system health metrics
export const getSystemHealth = async (): Promise<SystemHealth> => {
  try {
    // Test database connection
    const start = Date.now();
    const { error } = await supabase.from('user_profiles').select('count').limit(1);
    const responseTime = Date.now() - start;
    
    return {
      database_status: error ? 'down' : responseTime > 1000 ? 'degraded' : 'healthy',
      api_response_time: responseTime,
      error_rate: 0.1, // Would be calculated from error logs
      uptime_percentage: 99.9,
      active_connections: 45, // Would come from connection pool
      storage_usage: 2.3 // GB, would come from storage metrics
    };
  } catch (error) {
    return {
      database_status: 'down',
      api_response_time: 0,
      error_rate: 100,
      uptime_percentage: 0,
      active_connections: 0,
      storage_usage: 0
    };
  }
};

// Send bulk email to users
export const sendBulkEmail = async (userIds: string[], subject: string, message: string) => {
  try {
    // Create notifications for all selected users
    const notifications = userIds.map(userId => ({
      user_id: userId,
      type: 'admin_message',
      title: subject,
      message,
      created_at: new Date().toISOString()
    }));
    
    const { error } = await supabase
      .from('user_notifications')
      .insert(notifications);
    
    if (error) throw error;
    
    return { success: true, count: userIds.length };
  } catch (error) {
    throw new Error('Failed to send bulk email');
  }
};

// Get revenue analytics
export const getRevenueAnalytics = async (days: number = 30) => {
  const { data: users, error } = await supabase
    .from('user_profiles')
    .select('plan, created_at')
    .eq('plan', 'pro');
  
  if (error) throw error;
  
  const revenue = users.length * 12; // $12 per pro user
  const newProUsers = users.filter(u => {
    const created = new Date(u.created_at);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return created >= cutoff;
  }).length;
  
  return {
    totalRevenue: revenue,
    newRevenue: newProUsers * 12,
    proUsers: users.length,
    newProUsers,
    averageRevenuePerUser: users.length > 0 ? revenue / users.length : 0
  };
};