import React from 'react';
import { useState, useEffect } from 'react';
import { Plus, TrendingUp, Eye, Link as LinkIcon, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { LinkCard } from '../components/Dashboard/LinkCard';
import { supabase } from '../lib/supabase';
import { getUserAnalytics } from '../lib/analytics';
import { getUserProfile } from '../lib/profile';
import type { TimezoneLink, UserProfile } from '../lib/supabase';

export const DashboardPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [links, setLinks] = useState<TimezoneLink[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUser(user);

      // Fetch user profile
      const profile = await getUserProfile(user.id);
      setUserProfile(profile);

      // Fetch recent links
      const { data: linksData, error: linksError } = await supabase
        .from('timezone_links')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (linksError) throw linksError;
      setLinks(linksData || []);

      // Fetch analytics
      const analyticsData = await getUserAnalytics(user.id);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditLink = (link: TimezoneLink) => {
    // TODO: Implement edit functionality
    console.log('Edit link:', link);
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('timezone_links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;
      
      // Refresh links
      setLinks(links.filter(link => link.id !== linkId));
    } catch (error) {
      console.error('Error deleting link:', error);
    }
  };

  const handleDuplicateLink = (link: TimezoneLink) => {
    // TODO: Implement duplicate functionality
    console.log('Duplicate link:', link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {userProfile?.display_name || user?.email?.split('@')[0]}!
            </h1>
            <p className="mt-2 text-gray-600">
              Here's what's happening with your timezone links
            </p>
          </div>
          <Link to="/dashboard/create">
            <Button size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Create Link
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <LinkIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Links</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.totalLinks || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.totalViews || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userProfile?.links_created_this_month || 0}
                  {userProfile?.plan === 'starter' && (
                    <span className="text-sm text-gray-500 ml-1">/50</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Links</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.activeLinks || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Links */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Recent Links</h2>
          <Link to="/dashboard/links">
            <Button variant="tertiary">View All</Button>
          </Link>
        </div>

        {links.length > 0 ? (
          <div className="grid gap-6">
            {links.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                onEdit={handleEditLink}
                onDelete={handleDeleteLink}
                onDuplicate={handleDuplicateLink}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                No links yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first timezone link to get started
              </p>
              <Link to="/dashboard/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Link
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top Performing Links */}
      {analytics?.topLinks && analytics.topLinks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Top Performing Links
          </h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {analytics.topLinks.map((link: any, index: number) => (
                  <div key={link.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{link.title}</h4>
                        <p className="text-sm text-gray-500">/{link.slug}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">{link.views} views</p>
                      <p className="text-sm text-gray-500">
                        {link.uniqueViewers} unique
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Plan Usage Warning */}
      {userProfile?.plan === 'starter' && userProfile.links_created_this_month >= 40 && (
        <div className="mt-8">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-yellow-800">
                    Approaching Link Limit
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    You've used {userProfile.links_created_this_month} of 50 links this month.
                    Upgrade to Pro for unlimited links.
                  </p>
                </div>
                <Link to="/pricing">
                  <Button variant="secondary">
                    Upgrade Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usage</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Settings</p>
                <p className="text-2xl font-bold text-gray-900">Ready</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-500 text-center py-8">No recent activity to display</p>
          </div>
        </div>
      </div>
    </div>
  );
};