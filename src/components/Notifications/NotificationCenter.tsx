import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Trash2, Settings, MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { 
  getUserNotifications, 
  markNotificationsRead, 
  markAllNotificationsRead,
  deleteNotification,
  getUnreadNotificationCount,
  subscribeToNotifications,
  type UserNotification 
} from '../../lib/notifications';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCenterProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  userId,
  isOpen,
  onClose
}) => {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, userId]);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToNotifications(userId, (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
    });

    return unsubscribe;
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      let data = await getUserNotifications(userId);
      
      // If no notifications exist, create some sample ones for demo
      if (!data || data.length === 0) {
        const sampleNotifications = [
          {
            id: 'sample-1',
            user_id: userId,
            type: 'link_expiring',
            title: 'Link Expiring Soon',
            message: 'Your link "Team Meeting" will expire in 3 days.',
            is_read: false,
            action_url: '/dashboard',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
          },
          {
            id: 'sample-2',
            user_id: userId,
            type: 'feature_announcement',
            title: 'New Feature: Business Hours Intelligence',
            message: 'Now see if your meeting time works across different business hours!',
            is_read: true,
            action_url: '/how-it-works',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
          },
          {
            id: 'sample-3',
            user_id: userId,
            type: 'usage_limit_warning',
            title: 'Approaching Monthly Limit',
            message: 'You\'ve used 45 of 50 links this month. Consider upgrading to Pro.',
            is_read: false,
            action_url: '/pricing',
            created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
          }
        ];
        data = sampleNotifications;
      }
      
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Set sample notifications on error for demo
      setNotifications([
        {
          id: 'error-sample',
          user_id: userId,
          type: 'system_error',
          title: 'Demo Mode Active',
          message: 'You\'re viewing sample notifications in demo mode.',
          is_read: false,
          action_url: null,
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationIds: string[]) => {
    try {
      await markNotificationsRead(userId, notificationIds);
      setNotifications(prev => 
        prev.map(notification => 
          notificationIds.includes(notification.id) 
            ? { ...notification, is_read: true }
            : notification
        )
      );
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsRead(userId);
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(userId, notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const filteredNotifications = notifications.filter(notification => 
    filter === 'all' || !notification.is_read
  );

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'link_expiring':
      case 'link_expired':
        return '⏰';
      case 'new_follower':
        return '👤';
      case 'support_ticket_created':
        return '🎫';
      case 'feedback_received':
        return '💬';
      case 'system_error':
        return '⚠️';
      case 'feature_announcement':
        return '🎉';
      default:
        return '📢';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-start justify-center pt-16 p-4 z-50">
      <Card className="w-full max-w-md max-h-[80vh] overflow-hidden">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
              {unreadCount > 0 && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="tertiary" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex space-x-1">
              <Button
                variant={filter === 'all' ? 'primary' : 'tertiary'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'unread' ? 'primary' : 'tertiary'}
                size="sm"
                onClick={() => setFilter('unread')}
              >
                Unread ({unreadCount})
              </Button>
            </div>
            
            {unreadCount > 0 && (
              <Button variant="tertiary" size="sm" onClick={handleMarkAllAsRead}>
                <Check className="w-4 h-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-y-auto max-h-96">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
              </h3>
              <p className="text-gray-600">
                {filter === 'unread' 
                  ? 'All caught up! Check back later for updates.'
                  : 'We\'ll notify you when something important happens.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">
                        {getNotificationIcon(notification.type)}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 mb-1">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.is_read && (
                            <Button
                              variant="tertiary"
                              size="sm"
                              onClick={() => handleMarkAsRead([notification.id])}
                              title="Mark as read"
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            variant="tertiary"
                            size="sm"
                            onClick={() => handleDeleteNotification(notification.id)}
                            title="Delete notification"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {notification.action_url && (
                        <div className="mt-2">
                          <a
                            href={notification.action_url}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            onClick={onClose}
                          >
                            View Details →
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        {selectedNotifications.length > 0 && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedNotifications.length} selected
              </span>
              <div className="flex space-x-2">
                <Button
                  variant="tertiary"
                  size="sm"
                  onClick={() => handleMarkAsRead(selectedNotifications)}
                >
                  Mark as read
                </Button>
                <Button
                  variant="tertiary"
                  size="sm"
                  onClick={() => setSelectedNotifications([])}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};