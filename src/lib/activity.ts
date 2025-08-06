import { supabase } from './supabase';

export interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Log user activity
export const logUserActivity = async (userId: string, action: string, details?: any) => {
  try {
    const { error } = await supabase
      .from('user_activity_log')
      .insert({
        user_id: userId,
        action,
        details,
        ip_address: await getUserIP(),
        user_agent: navigator.userAgent
      });
      
    if (error) console.error('Failed to log activity:', error);
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

// Get user activity history
export const getUserActivityHistory = async (userId: string, limit = 50) => {
  const { data, error } = await supabase
    .from('user_activity_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
    
  if (error) throw error;
  return data;
};

// Get user IP address (simplified - in production use a proper service)
const getUserIP = async (): Promise<string | null> => {
  try {
    // In production, you might want to use a proper IP detection service
    // For now, we'll return null and let the database handle it
    return null;
  } catch (error) {
    return null;
  }
};

// Activity types to track
export const ACTIVITY_TYPES = {
  // Authentication
  LOGIN: 'login',
  LOGOUT: 'logout',
  PASSWORD_CHANGED: 'password_changed',
  EMAIL_CHANGED: 'email_changed',
  
  // Profile
  PROFILE_UPDATED: 'profile_updated',
  AVATAR_UPDATED: 'avatar_updated',
  AVATAR_REMOVED: 'avatar_removed',
  USERNAME_CHANGED: 'username_changed',
  
  // Links
  LINK_CREATED: 'link_created',
  LINK_UPDATED: 'link_updated',
  LINK_DELETED: 'link_deleted',
  LINK_SHARED: 'link_shared',
  LINK_DUPLICATED: 'link_duplicated',
  
  // Security
  TWO_FA_ENABLED: '2fa_enabled',
  TWO_FA_DISABLED: '2fa_disabled',
  SESSION_REVOKED: 'session_revoked',
  API_KEY_GENERATED: 'api_key_generated',
  API_KEY_REVOKED: 'api_key_revoked',
  
  // Social
  USER_FOLLOWED: 'user_followed',
  USER_UNFOLLOWED: 'user_unfollowed',
  
  // Support
  SUPPORT_TICKET_CREATED: 'support_ticket_created',
  FEEDBACK_SUBMITTED: 'feedback_submitted',
  
  // System
  PWA_INSTALLED: 'pwa_installed',
  PUSH_NOTIFICATIONS_ENABLED: 'push_notifications_enabled',
  THEME_CHANGED: 'theme_changed',
  PREFERENCES_UPDATED: 'preferences_updated',
  DATA_EXPORTED: 'data_exported',
  ACCOUNT_DELETED: 'account_deleted'
};

// Get activity summary for dashboard
export const getActivitySummary = async (userId: string, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('user_activity_log')
    .select('action, created_at')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString());
    
  if (error) throw error;
  
  // Process activity data
  const activityByType = data.reduce((acc, activity) => {
    acc[activity.action] = (acc[activity.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const activityByDate = data.reduce((acc, activity) => {
    const date = new Date(activity.created_at).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    totalActivities: data.length,
    activityByType,
    activityByDate,
    mostActiveDay: Object.entries(activityByDate).sort(([,a], [,b]) => b - a)[0]?.[0],
    mostCommonAction: Object.entries(activityByType).sort(([,a], [,b]) => b - a)[0]?.[0]
  };
};