import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '../ui/Button';
import { NotificationCenter } from './NotificationCenter';
import { getUnreadNotificationCount, subscribeToNotifications } from '../../lib/notifications';

interface NotificationBellProps {
  userId: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ userId }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // Fetch initial unread count
    const fetchUnreadCount = async () => {
      try {
        const count = await getUnreadNotificationCount(userId);
        setUnreadCount(count);
      } catch (error) {
       console.warn('Error fetching unread count, using fallback:', error);
       // Set to 0 as fallback when there's an error
       setUnreadCount(0);
      }
    };

    fetchUnreadCount();

    // Subscribe to new notifications
    const unsubscribe = subscribeToNotifications(userId, () => {
      setUnreadCount(prev => prev + 1);
    });

    return unsubscribe;
  }, [userId]);

  const handleToggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      // Reset unread count when opening notifications
      setTimeout(() => setUnreadCount(0), 1000);
    }
  };

  return (
    <>
      <div className="relative">
        <Button
          variant="tertiary"
          onClick={handleToggleNotifications}
          className="relative"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </div>

      <NotificationCenter
        userId={userId}
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
};