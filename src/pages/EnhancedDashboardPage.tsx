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
  User,
  Share2,
  Copy,
  ExternalLink,
  RefreshCw,
  Zap,
  AlertCircle,
  RefreshCcw
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
  const [error, setError] = useState<string | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    totalUniqueViewers: 0,
    activeLinks: 0,
    linksCreatedThisMonth: 0,
    topLinks: [] as any[],
    viewsByDate: {} as Record<string, number>,
    weeklyViews: [] as {date: string, views: number}[],
    conversionRate: 0,
    averageTimeOnPage: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

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
      
      // Generate weekly views data for the chart
      const weeklyViews = generateWeeklyViewsData(userLinks || []);
      
      // Calculate conversion rate (unique viewers / total views)
      const conversionRate = totalViews > 0 ? (totalUniqueViewers / totalViews) * 100 : 0;
      
      // Mock average time on page (would be replaced with real data)
      const averageTimeOnPage = Math.floor(Math.random() * 120) + 30; // 30-150 seconds
      
      setAnalytics({
        totalViews,
        totalUniqueViewers,
        activeLinks,
        linksCreatedThisMonth,
        topLinks,
        viewsByDate: {},
        weeklyViews,
        conversionRate,
        averageTimeOnPage
      });
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError(error?.message || 'Failed to load dashboard data. Please try again.');
      // Set default empty values for analytics
      setAnalytics({
        totalViews: 0,
        totalUniqueViewers: 0,
        activeLinks: 0,
        linksCreatedThisMonth: 0,
        topLinks: [],
        viewsByDate: {},
        weeklyViews: [],
        conversionRate: 0,
        averageTimeOnPage: 0
      });
      setLinks([]);
    } finally {
      setLoading(false);
    }
  };

  // Generate weekly views data for the chart
  const generateWeeklyViewsData = (links: TimezoneLink[]) => {
    const now = new Date();
    const result = [];
    
    // Generate data for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      // Count views for this date
      const viewsOnDate = links.reduce((sum, link) => {
        // This is a simplification - in a real app, you'd have a views_by_date field
        // For now, we'll generate some random data based on the link's view count
        const randomFactor = Math.random() * 0.5 + 0.5; // 0.5 to 1.0
        return sum + Math.floor(link.view_count * randomFactor / 7);
      }, 0);
      
      result.push({
        date: dateString,
        views: viewsOnDate
      });
    }
    
    return result;
  };
  
  const handleCreateLink = async () => {
    if (!user) return;
    
    try {
      const { canCreate, reason } = await canCreateLink(user.id);
      if (!canCreate) {
        setUpgradeReason(reason || 'Upgrade to Pro for unlimited links');
        setShowUpgradePrompt(true);
      } else {
        // Navigate to create link or show modal
        setActiveTab('links');
      }
    } catch (error: any) {
      console.error('Error checking link creation limits:', error);
      // Show error in a more user-friendly way
      setError(error?.message || 'Failed to check link creation limits. Please try again.');
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

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="bg-red-100 text-red-800 p-4 rounded-lg flex items-start max-w-lg">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium">Error loading dashboard</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
          <Button 
            onClick={() => fetchDashboardData()}
            className="mt-4"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
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
            
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <RefreshCw className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.conversionRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">Unique/Total views</p>
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

          {/* Weekly Analytics Chart */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Weekly Views
              </h2>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <div className="flex h-48 items-end space-x-2">
                  {analytics.weeklyViews.map((day, index) => {
                    const maxViews = Math.max(...analytics.weeklyViews.map(d => d.views || 0), 1);
                    const percentage = (day.views / maxViews) * 100;
                    
                    return (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div 
                          className="w-full bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-all"
                          style={{ height: `${percentage}%` }}
                          title={`${day.views} views`}
                        ></div>
                        <div className="text-xs text-gray-500 mt-2">
                          {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Quick Actions
              </h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center justify-center h-24 space-y-2"
                  onClick={handleCreateLink}
                >
                  <Plus className="w-6 h-6" />
                  <span>New Link</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center justify-center h-24 space-y-2"
                  onClick={() => setActiveTab('links')}
                >
                  <LinkIcon className="w-6 h-6" />
                  <span>Manage Links</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center justify-center h-24 space-y-2"
                  onClick={() => setActiveTab('profile')}
                >
                  <User className="w-6 h-6" />
                  <span>Edit Profile</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center justify-center h-24 space-y-2"
                  onClick={() => window.open('https://docs.timelyr.com', '_blank')}
                >
                  <ExternalLink className="w-6 h-6" />
                  <span>Documentation</span>
                </Button>
              </div>
            </CardContent>
          </Card>

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
                  <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-800">{link.title}</p>
                        <div className="flex items-center text-sm text-gray-500 space-x-2">
                          <span>Created {new Date(link.created_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className={`px-1.5 py-0.5 rounded-full text-xs ${link.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {link.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="p-1" 
                        title="Copy Link"
                        onClick={() => navigator.clipboard.writeText(`https://timelyr.com/${link.slug}`)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="p-1" 
                        title="Share Link"
                        onClick={() => setActiveTab('links')}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <div className="text-right ml-2">
                        <p className="text-sm font-medium text-gray-800">{link.view_count} views</p>
                        <p className="text-xs text-gray-500">
                          {link.unique_viewers} unique
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'links' && (
        <ErrorBoundary fallback={<LinkManagementErrorFallback onRetry={fetchDashboardData} />}>
          <LinkManagement
            user={user}
            userProfile={userProfile}
            links={links}
            onLinksUpdate={fetchDashboardData}
          />
        </ErrorBoundary>
      )}

      {activeTab === 'profile' && (
        <ErrorBoundary fallback={<ProfileSettingsErrorFallback />}>
          <ProfileSettings
            user={user}
            userProfile={userProfile}
            onProfileUpdate={(updatedProfile) => {
              // Update the profile in parent component
              window.location.reload(); // Simple refresh for now
            }}
          />
        </ErrorBoundary>
      )}

      {activeTab === 'notifications' && (
        <ErrorBoundary fallback={<NotificationSettingsErrorFallback />}>
          <NotificationSettings userId={user.id} />
        </ErrorBoundary>
      )}
    </div>
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Error Fallback Components
const LinkManagementErrorFallback = ({ onRetry }: { onRetry: () => void }) => (
  <div className="p-6 bg-gray-50 rounded-lg">
    <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
      <div className="bg-red-100 text-red-800 p-4 rounded-lg flex items-start max-w-lg">
        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium">Error loading link management</h3>
          <p className="text-sm">We couldn't load your links. This might be a temporary issue.</p>
        </div>
      </div>
      <Button onClick={onRetry} className="mt-2">
        <RefreshCcw className="w-4 h-4 mr-2" />
        Try Again
      </Button>
    </div>
  </div>
);

const ProfileSettingsErrorFallback = () => (
  <div className="p-6 bg-gray-50 rounded-lg">
    <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
      <div className="bg-red-100 text-red-800 p-4 rounded-lg flex items-start max-w-lg">
        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium">Error loading profile settings</h3>
          <p className="text-sm">We couldn't load your profile settings. Please refresh the page and try again.</p>
        </div>
      </div>
      <Button onClick={() => window.location.reload()} className="mt-2">
        <RefreshCcw className="w-4 h-4 mr-2" />
        Refresh Page
      </Button>
    </div>
  </div>
);

const NotificationSettingsErrorFallback = () => (
  <div className="p-6 bg-gray-50 rounded-lg">
    <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
      <div className="bg-red-100 text-red-800 p-4 rounded-lg flex items-start max-w-lg">
        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium">Error loading notification settings</h3>
          <p className="text-sm">We couldn't load your notification preferences. Please refresh the page and try again.</p>
        </div>
      </div>
      <Button onClick={() => window.location.reload()} className="mt-2">
        <RefreshCcw className="w-4 h-4 mr-2" />
        Refresh Page
      </Button>
    </div>
  </div>
);