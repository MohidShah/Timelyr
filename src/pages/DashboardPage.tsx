import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, BarChart3, Settings, Link as LinkIcon } from 'lucide-react';
import { DashboardLayout } from '../components/Dashboard/DashboardLayout';
import { LinkCard } from '../components/Dashboard/LinkCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { getUserLinks, getUserAnalytics } from '../lib/analytics';
import { supabase } from '../lib/supabase';
import type { TimezoneLink } from '../lib/supabase';

export const DashboardPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [links, setLinks] = useState<TimezoneLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    uniqueViewers: 0,
    activeLinks: 0,
    linksCreatedThisMonth: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUser(user);
      
      // Fetch user's links
      const userLinks = await getUserLinks(user.id);
      setLinks(userLinks);

      // Fetch analytics
      const userAnalytics = await getUserAnalytics(user.id);
      setAnalytics({
        totalViews: userAnalytics.totalViews,
        uniqueViewers: userAnalytics.uniqueViewers,
        activeLinks: userLinks.filter(link => link.is_active).length,
        linksCreatedThisMonth: userLinks.filter(link => {
          const created = new Date(link.created_at);
          const now = new Date();
          return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
        }).length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Manage your timezone links and view analytics</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Link
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <LinkIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Links</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.activeLinks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalViews}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Settings className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Unique Viewers</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.uniqueViewers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Plus className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.linksCreatedThisMonth}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
              All
            </Button>
            <Button
              variant={filter === 'active' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('active')}
            >
              Active
            </Button>
            <Button
              variant={filter === 'expired' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter('expired')}
            >
              Expired
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
                onUpdate={fetchDashboardData}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || filter !== 'all' ? 'No links found' : 'No links yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || filter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Create your first timezone link to get started'
                }
              </p>
              {!searchQuery && filter === 'all' && (
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Link
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};