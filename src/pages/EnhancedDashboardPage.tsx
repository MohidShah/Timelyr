import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  BarChart3, 
  Settings, 
  Link as LinkIcon,
  Eye,
  Users,
  TrendingUp,
  Calendar,
  Clock,
  Bell,
  User
} from 'lucide-react';
import { LinkManagement } from '../components/Dashboard/LinkManagement';
import { ProfileSettings } from '../components/Profile/ProfileSettings';
import { NotificationSettings } from '../components/Dashboard/NotificationSettings';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { getUserAnalytics } from '../lib/analytics';
import { supabase } from '../lib/supabase';
import { canCreateLink } from '../lib/plans';
import { PlanUpgradePrompt } from '../components/PlanUpgradePrompt';
import type { TimezoneLink } from '../lib/supabase';

interface EnhancedDashboardPageProps {
  user: any;
  userProfile: any;
}

export const EnhancedDashboardPage: React.FC<EnhancedDashboardPageProps> = ({
  user,
  userProfile
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'links' | 'profile' | 'notifications'>('overview');
  const [links, setLinks] = useState<TimezoneLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    totalUniqueViewers: 0,
    activeLinks: 0,
    linksCreatedThisMonth: 0,
    topLinks: [] as any[],
    viewsByDate: {} as Record<string, number>
  });

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch user's links
      const { data: userLinks, error: linksError } = await supabase
        .from('timezone_links')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (linksError) throw linksError;
      
      setLinks(userLinks || []);
      
      // Calculate analytics
      const totalViews = userLinks?.reduce((sum, link) => sum + link.view_count, 0) || 0;
      const totalUniqueViewers = userLinks?.reduce((sum, link) => sum + link.unique_viewers, 0) || 0;
      const activeLinks = userLinks?.filter(link => link.is_active).length || 0;
      const linksCreatedThisMonth = userLinks?.filter(link => {
        const created = new Date(link.created_at);
        const now = new Date();
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      }).length || 0;
      
      const topLinks = userLinks?.sort((a, b) => b.view_count - a.view_count)
        .slice(0, 5)
        .map(link => ({
          id: link.id,
          title: link.title,
          slug: link.slug,
          views: link.view_count,
          uniqueViewers: link.unique_viewers,
        })) || [];
      
      setAnalytics({
        totalViews,
        totalUniqueViewers,
        activeLinks,
        linksCreatedThisMonth,
        topLinks,
        viewsByDate: {}
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async () => {
    if (!user) return;
    
    const { canCreate, reason } = await canCreateLink(user.id);
    if (!canCreate) {
      setUpgradeReason(reason || 'Upgrade to Pro for unlimited links');
      setShowUpgradePrompt(true);
    } else {
      // Navigate to create link or show modal
      setActiveTab('links');
    }
  };

  const getUsagePercentage = () => {
    if (userProfile?.plan === 'pro') return 0; // Unlimited
    return Math.min((analytics.linksCreatedThisMonth / 50) * 100, 100);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'links', label: 'Links', icon: LinkIcon },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {userProfile?.display_name || user?.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your timezone links, profile, and preferences
          </p>
        </div>
        <Button onClick={handleCreateLink}>
          <Plus className="w-4 h-4 mr-2" />
          Create Link
        </Button>
      </div>

      {/* Plan Usage Warning */}
      {userProfile?.plan === 'starter' && analytics.linksCreatedThisMonth >= 40 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                <div>
                  <p className="font-medium text-amber-800">
                    You've used {analytics.linksCreatedThisMonth} of 50 links this month
                  </p>
                  <p className="text-sm text-amber-600">
                    Upgrade to Pro for unlimited links
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={() => setShowUpgradePrompt(true)}>
                Upgrade Now
              </Button>
            </div>
            <div className="mt-3">
              <div className="w-full bg-amber-200 rounded-full h-2">
                <div 
                  className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getUsagePercentage()}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Prompt */}
      {showUpgradePrompt && (
        <PlanUpgradePrompt
          feature="Unlimited Links"
          description={upgradeReason}
          onClose={() => setShowUpgradePrompt(false)}
        />
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <LinkIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Links</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.activeLinks}</p>
                    <p className="text-xs text-gray-500">
                      {userProfile?.plan === 'starter' ? `${analytics.linksCreatedThisMonth}/50 this month` : 'Unlimited'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Eye className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Views</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalViews}</p>
                    <p className="text-xs text-gray-500">All time</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Unique Viewers</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalUniqueViewers}</p>
                    <p className="text-xs text-gray-500">All time</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg. Views</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.activeLinks > 0 ? Math.round(analytics.totalViews / analytics.activeLinks) : 0}
                    </p>
                    <p className="text-xs text-gray-500">Per link</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Links */}
          {analytics.topLinks.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Top Performing Links
                </h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topLinks.slice(0, 5).map((link, index) => (
                    <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3 ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{link.title}</p>
                          <p className="text-sm text-gray-500">/{link.slug}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">{link.views} views</p>
                        <p className="text-sm text-gray-500">{link.uniqueViewers} unique</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Recent Activity
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {links.slice(0, 5).map((link) => (
                  <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-800">{link.title}</p>
                        <p className="text-sm text-gray-500">
                          Created {new Date(link.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-800">{link.view_count} views</p>
                      <p className="text-xs text-gray-500">
                        {link.is_active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'links' && (
        <LinkManagement
          user={user}
          userProfile={userProfile}
          links={links}
          onLinksUpdate={fetchDashboardData}
        />
      )}

      {activeTab === 'profile' && (
        <ProfileSettings
          user={user}
          userProfile={userProfile}
          onProfileUpdate={(updatedProfile) => {
            // Update the profile in parent component
            window.location.reload(); // Simple refresh for now
          }}
        />
      )}

      {activeTab === 'notifications' && (
        <NotificationSettings userId={user.id} />
      )}
    </div>
  );
};