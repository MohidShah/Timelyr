import React, { useState, useEffect } from 'react';
import { Bell, Mail, Globe, Smartphone, Clock, Shield, Save } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { 
  getNotificationPreferences, 
  updateNotificationPreferences 
} from '../../lib/notifications';
import { logUserActivity } from '../../lib/activity';

interface NotificationSettingsProps {
  userId: string;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ userId }) => {
  const [preferences, setPreferences] = useState({
    notification_email: true,
    notification_browser: true,
    marketing_emails: false,
    weekly_digest: true,
    link_expiring: true,
    usage_limit_warning: true,
    security_alerts: true,
    feature_announcements: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, [userId]);

  const fetchPreferences = async () => {
    try {
      const prefs = await getNotificationPreferences(userId);
      if (prefs) {
        setPreferences({
          notification_email: prefs.notification_email,
          notification_browser: prefs.notification_browser,
          marketing_emails: prefs.marketing_emails,
          weekly_digest: prefs.weekly_digest,
          link_expiring: true, // Default values for new settings
          usage_limit_warning: true,
          security_alerts: true,
          feature_announcements: true,
        });
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateNotificationPreferences(userId, preferences);
      
      // Log activity
      await logUserActivity(userId, 'preferences_updated', { 
        type: 'notifications',
        preferences 
      });
      
      alert('Notification preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const notificationTypes = [
    {
      category: 'General Notifications',
      icon: Bell,
      settings: [
        {
          key: 'notification_email',
          title: 'Email Notifications',
          description: 'Receive notifications via email',
          icon: Mail
        },
        {
          key: 'notification_browser',
          title: 'Browser Notifications',
          description: 'Show notifications in your browser',
          icon: Globe
        }
      ]
    },
    {
      category: 'Link & Event Notifications',
      icon: Clock,
      settings: [
        {
          key: 'link_expiring',
          title: 'Link Expiring Soon',
          description: 'Get notified when your links are about to expire',
          icon: Clock
        },
        {
          key: 'usage_limit_warning',
          title: 'Usage Limit Warnings',
          description: 'Alert when approaching monthly link limits',
          icon: Bell
        }
      ]
    },
    {
      category: 'Security & Updates',
      icon: Shield,
      settings: [
        {
          key: 'security_alerts',
          title: 'Security Alerts',
          description: 'Important security notifications and login alerts',
          icon: Shield
        },
        {
          key: 'feature_announcements',
          title: 'Feature Announcements',
          description: 'Updates about new features and improvements',
          icon: Bell
        }
      ]
    },
    {
      category: 'Marketing & Digest',
      icon: Mail,
      settings: [
        {
          key: 'marketing_emails',
          title: 'Marketing Emails',
          description: 'Tips, best practices, and product updates',
          icon: Mail
        },
        {
          key: 'weekly_digest',
          title: 'Weekly Digest',
          description: 'Weekly summary of your link performance',
          icon: Mail
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>
          <p className="text-gray-600 mt-1">
            Manage how and when you receive notifications from Timelyr
          </p>
        </div>
        <Button onClick={handleSave} loading={saving}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {notificationTypes.map((category, categoryIndex) => (
        <Card key={categoryIndex}>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <category.icon className="w-5 h-5 mr-2" />
              {category.category}
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {category.settings.map((setting, settingIndex) => (
              <div key={settingIndex} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <setting.icon className="w-5 h-5 text-gray-600" />
                  <div>
                    <h4 className="font-medium text-gray-800">{setting.title}</h4>
                    <p className="text-sm text-gray-600">{setting.description}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences[setting.key as keyof typeof preferences]}
                    onChange={() => handleToggle(setting.key)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Browser Notification Permission */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-800">Browser Notification Permission</h4>
                <p className="text-sm text-blue-600">
                  {Notification.permission === 'granted' 
                    ? 'Browser notifications are enabled'
                    : Notification.permission === 'denied'
                    ? 'Browser notifications are blocked. Enable them in your browser settings.'
                    : 'Click to enable browser notifications'
                  }
                </p>
              </div>
            </div>
            {Notification.permission === 'default' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => Notification.requestPermission()}
              >
                Enable
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Notification */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-800">Test Notifications</h3>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Send a test notification to make sure everything is working correctly.
          </p>
          <Button
            variant="secondary"
            onClick={() => {
              if (Notification.permission === 'granted') {
                new Notification('Test Notification from Timelyr', {
                  body: 'Your notifications are working correctly!',
                  icon: '/favicon.ico'
                });
              } else {
                alert('Please enable browser notifications first.');
              }
            }}
          >
            <Bell className="w-4 h-4 mr-2" />
            Send Test Notification
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};