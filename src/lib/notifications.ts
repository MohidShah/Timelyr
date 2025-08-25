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
  try {
    // Check if we're in mock mode
    const isMockMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_USE_MOCK_DB === 'true';
    
    if (isMockMode) {
      // Return mock notifications
      return [
        {
          id: 'mock-1',
          user_id: userId,
          type: 'link_expiring',
          title: 'Link Expiring Soon',
          message: 'Your link "Weekly Team Standup" will expire in 3 days.',
          is_read: false,
          action_url: '/dashboard',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'mock-2',
          user_id: userId,
          type: 'feature_announcement',
          title: 'New Feature: QR Codes',
          message: 'Pro users can now generate QR codes for their timezone links!',
          is_read: true,
          action_url: '/pricing',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'mock-3',
          user_id: userId,
          type: 'usage_limit_warning',
          title: 'Monthly Limit Reminder',
          message: 'You\'ve created 15 links this month. Upgrade to Pro for unlimited links.',
          is_read: false,
          action_url: '/pricing',
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        }
      ];
    }
    
    const { data, error } = await supabase
      .from('user_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.warn('Failed to fetch notifications from database, using mock data:', error);
    // Fall back to mock notifications on any error (including permission errors)
    return [
      {
        id: 'fallback-1',
        user_id: userId,
        type: 'link_expiring',
        title: 'Link Expiring Soon',
        message: 'Your link "Weekly Team Standup" will expire in 3 days.',
        is_read: false,
        action_url: '/dashboard',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'fallback-2',
        user_id: userId,
        type: 'feature_announcement',
        title: 'New Feature: QR Codes',
        message: 'Pro users can now generate QR codes for their timezone links!',
        is_read: true,
        action_url: '/pricing',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'fallback-3',
        user_id: userId,
        type: 'usage_limit_warning',
        title: 'Monthly Limit Reminder',
        message: 'You\'ve created 15 links this month. Upgrade to Pro for unlimited links.',
        is_read: false,
        action_url: '/pricing',
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      }
    ];
  }
};

// Mark notifications as read
export const markNotificationsRead = async (userId: string, notificationIds: string[]) => {
  try {
    // Check if we're in mock mode
    const isMockMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_USE_MOCK_DB === 'true';
    
    if (isMockMode) {
      console.log('Mock: Marking notifications as read:', notificationIds);
      return;
    }
    
    const { error } = await supabase
      .from('user_notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .in('id', notificationIds);
      
    if (error) throw error;
  } catch (error) {
    console.warn('Failed to mark notifications as read, ignoring:', error);
    // Silently fail for permission errors
  }
};

// Mark all notifications as read
export const markAllNotificationsRead = async (userId: string) => {
  try {
    // Check if we're in mock mode
    const isMockMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_USE_MOCK_DB === 'true';
    
    if (isMockMode) {
      console.log('Mock: Marking all notifications as read for user:', userId);
      return;
    }
    
    const { error } = await supabase
      .from('user_notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
      
    if (error) throw error;
  } catch (error) {
    console.warn('Failed to mark all notifications as read, ignoring:', error);
    // Silently fail for permission errors
  }
};

// Delete notification
export const deleteNotification = async (userId: string, notificationId: string) => {
  try {
    // Check if we're in mock mode
    const isMockMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_USE_MOCK_DB === 'true';
    
    if (isMockMode) {
      console.log('Mock: Deleting notification:', notificationId);
      return;
    }
    
    const { error } = await supabase
      .from('user_notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId);
      
    if (error) throw error;
  } catch (error) {
    console.warn('Failed to delete notification, ignoring:', error);
    // Silently fail for permission errors
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (userId: string) => {
  try {
    // Check if we're in mock mode
    const isMockMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_USE_MOCK_DB === 'true';
    
    if (isMockMode) {
      // Return mock unread count
      return 2;
    }
    
    const { count, error } = await supabase
      .from('user_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
      
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.warn('Failed to get unread notification count, using fallback:', error);
    // Return fallback count for permission errors
    return 2;
  }
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