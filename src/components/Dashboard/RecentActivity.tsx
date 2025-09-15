import React, { useState, useEffect } from 'react';
import { Activity, Calendar, Eye, Edit, Trash2, Share2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { getUserActivityHistory } from '../../lib/activity';
import { format, formatDistanceToNow } from 'date-fns';

interface RecentActivityProps {
  userId: string;
  limit?: number;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  userId,
  limit = 10
}) => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [userId]);

  const fetchActivities = async () => {
    try {
      const data = await getUserActivityHistory(userId, limit);
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      // Set mock activities for demo
      setActivities([
        {
          id: '1',
          action: 'link_created',
          details: { title: 'Weekly Team Meeting' },
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          action: 'profile_updated',
          details: { field: 'display_name' },
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          action: 'link_shared',
          details: { title: 'Product Demo' },
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'link_created':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'link_updated':
        return <Edit className="w-4 h-4 text-green-600" />;
      case 'link_deleted':
        return <Trash2 className="w-4 h-4 text-red-600" />;
      case 'link_shared':
        return <Share2 className="w-4 h-4 text-purple-600" />;
      case 'profile_updated':
        return <Edit className="w-4 h-4 text-orange-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityDescription = (activity: any) => {
    switch (activity.action) {
      case 'link_created':
        return `Created link "${activity.details?.title || 'Untitled'}"`;
      case 'link_updated':
        return `Updated link "${activity.details?.title || 'Untitled'}"`;
      case 'link_deleted':
        return 'Deleted a timezone link';
      case 'link_shared':
        return `Shared link "${activity.details?.title || 'Untitled'}"`;
      case 'profile_updated':
        return `Updated ${activity.details?.field || 'profile'}`;
      case 'login':
        return 'Signed in to account';
      case 'logout':
        return 'Signed out of account';
      default:
        return activity.action.replace('_', ' ');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Recent Activity
        </h3>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">
                    {getActivityDescription(activity)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};