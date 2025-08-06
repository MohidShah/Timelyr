import { supabase } from './supabase';

export interface UserNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

export interface NotificationPreferences {
  notification_email: boolean;
  notification_browser: boolean;
  marketing_emails: boolean;
  weekly_digest: boolean;
}

// Create notification
export const createNotification = async (userId: string, notification: {
  type: string;
  title: string;
  message: string;
  action_url?: string;
}) => {
  const { data, error } = await supabase
    .from('user_notifications')
    .insert({
      user_id: userId,
      ...notification
    })
    .select()
    .single();
    
  if (error) throw error;
  
  // Send real-time notification
  await supabase
    .channel(`notifications:${userId}`)
    .send({
      type: 'broadcast',
      event: 'new_notification',
      payload: data
    });
    
  return data;
};

// Get user notifications
export const getUserNotifications = async (userId: string, limit = 20) => {
  const { data, error } = await supabase
    .from('user_notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
    
  if (error) throw error;
  return data;
};

// Mark notifications as read
export const markNotificationsRead = async (userId: string, notificationIds: string[]) => {
  const { error } = await supabase
    .from('user_notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .in('id', notificationIds);
    
  if (error) throw error;
};

// Mark all notifications as read
export const markAllNotificationsRead = async (userId: string) => {
  const { error } = await supabase
    .from('user_notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
    
  if (error) throw error;
};

// Delete notification
export const deleteNotification = async (userId: string, notificationId: string) => {
  const { error } = await supabase
    .from('user_notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', userId);
    
  if (error) throw error;
};

// Get unread notification count
export const getUnreadNotificationCount = async (userId: string) => {
  const { count, error } = await supabase
    .from('user_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
    
  if (error) throw error;
  return count || 0;
};

// Update notification preferences
export const updateNotificationPreferences = async (userId: string, preferences: Partial<NotificationPreferences>) => {
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: userId,
      ...preferences,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Get notification preferences
export const getNotificationPreferences = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('notification_email, notification_browser, marketing_emails, weekly_digest')
    .eq('user_id', userId)
    .single();
    
  if (error && error.code !== 'PGRST116') throw error;
  
  // Return default preferences if none exist
  return data || {
    notification_email: true,
    notification_browser: true,
    marketing_emails: false,
    weekly_digest: true
  };
};

// Subscribe to real-time notifications
export const subscribeToNotifications = (userId: string, callback: (notification: UserNotification) => void) => {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on('broadcast', { event: 'new_notification' }, ({ payload }) => {
      callback(payload);
    })
    .subscribe();
    
  return () => {
    supabase.removeChannel(channel);
  };
};

// Notification types
export const NOTIFICATION_TYPES = {
  // Account
  EMAIL_VERIFICATION: 'email_verification',
  ACCOUNT_STATUS: 'account_status',
  PASSWORD_CHANGED: 'password_changed',
  TWO_FA_ENABLED: '2fa_enabled',
  
  // Links
  LINK_EXPIRING: 'link_expiring',
  LINK_EXPIRED: 'link_expired',
  LINK_SHARED: 'link_shared',
  
  // Usage
  USAGE_LIMIT_WARNING: 'usage_limit_warning',
  USAGE_LIMIT_REACHED: 'usage_limit_reached',
  
  // Social
  NEW_FOLLOWER: 'new_follower',
  
  // Support
  SUPPORT_TICKET_CREATED: 'support_ticket_created',
  SUPPORT_TICKET_UPDATED: 'support_ticket_updated',
  
  // System
  SYSTEM_ERROR: 'system_error',
  MAINTENANCE: 'maintenance',
  FEATURE_ANNOUNCEMENT: 'feature_announcement',
  
  // Feedback
  FEEDBACK_RECEIVED: 'feedback_received'
};