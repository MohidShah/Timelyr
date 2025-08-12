import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  BarChart3, 
  Settings, 
  Link as LinkIcon,
  Eye,
  Users,
  TrendingUp,
  Calendar,
  Clock,
  Globe,
  ArrowRight
} from 'lucide-react';
import { LinkCard } from '../components/Dashboard/LinkCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { TimeInput } from '../components/TimeInput';
import { getUserAnalytics } from '../lib/analytics';
import { supabase } from '../lib/supabase';
import { generateSlug } from '../lib/timezone';
import { canCreateLink, incrementLinksCreated, getDefaultExpiration } from '../lib/plans';
import { PlanUpgradePrompt } from '../components/PlanUpgradePrompt';
import type { TimezoneLink } from '../lib/supabase';

export const DashboardPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [links, setLinks] = useState<TimezoneLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
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
  }, []);

  const fetchDashboardData = async () => {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUser(user);
      
      // Fetch user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setUserProfile(profile);
      
      // Fetch user's links directly
      const { data: userLinks, error: linksError } = await supabase
        .from('timezone_links')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (linksError) throw linksError;
      
      setLinks(userLinks || []);
      
      // Calculate basic analytics
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

  const handleCreateLink = async (date: Date, timezone: string, title: string, description?: string) => {
    try {
      if (!user) return;

      // Check if user can create more links
      const { canCreate, reason } = await canCreateLink(user.id);
      if (!canCreate) {
        setUpgradeReason(reason || 'Upgrade to Pro for unlimited links');
        setShowUpgradePrompt(true);
        return;
      }

      const slug = generateSlug(title, date);
      const expirationDate = getDefaultExpiration(userProfile?.plan || 'starter');
      
      const { data, error } = await supabase
        .from('timezone_links')
        .insert({
          title,
          description: description || null,
          scheduled_time: date.toISOString(),
          timezone,
          slug,
          is_active: true,
          expires_at: expirationDate.toISOString(),
          user_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Increment the user's monthly link count
      await incrementLinksCreated(user.id);

      setShowCreateForm(false);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error creating link:', error);
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
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error deleting link:', error);
    }
  };

  const handleDuplicateLink = async (link: TimezoneLink) => {
    try {
      const newSlug = generateSlug(link.title + ' Copy', new Date(link.scheduled_time));
      
      const { error } = await supabase
        .from('timezone_links')
        .insert({
          title: link.title + ' (Copy)',
          description: link.description,
          scheduled_time: link.scheduled_time,
          timezone: link.timezone,
          slug: newSlug,
          is_active: true,
          user_id: user?.id,
        });

      if (error) throw error;
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error duplicating link:', error);
    }
  };

  const filteredLinks = links.filter(link => {
    const matchesSearch = link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         link.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'active') {
      return matchesSearch && link.is_active && (!link.expires_at || new Date(link.expires_at) > new Date());
    } else if (filter === 'expired') {
      return matchesSearch && (!link.is_active || (link.expires_at && new Date(link.expires_at) <= new Date()));
    }
    
    return matchesSearch;
  });

  const getUsagePercentage = () => {
    if (userProfile?.plan === 'pro') return 0; // Unlimited
    return Math.min((analytics.linksCreatedThisMonth / 50) * 100, 100);
  };

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
            Manage your timezone links and view analytics
          </p>
        </div>
        <Button 
          onClick={async () => {
            if (!user) return;
            const { canCreate, reason } = await canCreateLink(user.id);
            if (!canCreate) {
              setUpgradeReason(reason || 'Upgrade to Pro for unlimited links');
              setShowUpgradePrompt(true);
            } else {
              setShowCreateForm(true);
            }
          }}
        >
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
              <Link to="/pricing">
                <Button size="sm">
                  Upgrade Now
                </Button>
              </Link>
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

      {/* Quick Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Create New Link</h2>
              <Button variant="tertiary" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <TimeInput 
              onTimeSelect={handleCreateLink} 
              userPlan={userProfile?.plan as 'starter' | 'pro' || 'starter'}
            />
          </CardContent>
        </Card>
      )}

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
              {analytics.topLinks.slice(0, 3).map((link, index) => (
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

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search links..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({links.length})
          </Button>
          <Button
            variant={filter === 'active' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('active')}
          >
            Active ({links.filter(l => l.is_active).length})
          </Button>
          <Button
            variant={filter === 'expired' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('expired')}
          >
            Expired ({links.filter(l => !l.is_active || (l.expires_at && new Date(l.expires_at) <= new Date())).length})
          </Button>
        </div>
      </div>

      {/* Links Grid */}
      {filteredLinks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLinks.map((link) => (
            <LinkCard
              key={link.id}
              link={link}
              userPlan={userProfile?.plan as 'starter' | 'pro' || 'starter'}
              onEdit={handleEditLink}
              onDelete={handleDeleteLink}
              onDuplicate={handleDuplicateLink}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            {searchQuery || filter !== 'all' ? (
              <>
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No links found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filters
                </p>
                <Button variant="secondary" onClick={() => {
                  setSearchQuery('');
                  setFilter('all');
                }}>
                  Clear Filters
                </Button>
              </>
            ) : (
              <>
                <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No links yet</h3>
                <p className="text-gray-600 mb-6">
                  Create your first timezone link to get started
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Link
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/dashboard/analytics">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg mr-4">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">View Analytics</h3>
                    <p className="text-sm text-gray-600">Detailed insights and reports</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/profile">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg mr-4">
                    <Settings className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Profile Settings</h3>
                    <p className="text-sm text-gray-600">Manage your account preferences</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
};