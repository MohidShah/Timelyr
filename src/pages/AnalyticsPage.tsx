import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Globe, 
  Clock, 
  Users, 
  Eye,
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getUserAnalytics, getLinkAnalytics } from '../lib/analytics';
import { supabase } from '../lib/supabase';
import { hasFeatureAccess } from '../lib/plans';
import { PlanUpgradePrompt } from '../components/PlanUpgradePrompt';
import { format, subDays, parseISO } from 'date-fns';

export const AnalyticsPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    totalUniqueViewers: 0,
    activeLinks: 0,
    recentViews: 0,
    topLinks: [] as any[],
    viewsByDate: {} as Record<string, number>,
    topTimezones: [] as any[],
    topCountries: [] as any[],
    peakHours: [] as any[]
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUser(user);
      
      // Get user profile to check plan
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setUserProfile(profile);
      
      // Fetch user's links
      const { data: userLinks } = await supabase
        .from('timezone_links')
        .select('*')
        .eq('user_id', user.id)
        .order('view_count', { ascending: false });
      
      const totalViews = userLinks?.reduce((sum, link) => sum + link.view_count, 0) || 0;
      const totalUniqueViewers = userLinks?.reduce((sum, link) => sum + link.unique_viewers, 0) || 0;
      const activeLinks = userLinks?.filter(link => link.is_active).length || 0;
      
      const topLinks = userLinks?.slice(0, 5).map(link => ({
        id: link.id,
        title: link.title,
        slug: link.slug,
        views: link.view_count,
        uniqueViewers: link.unique_viewers,
        analytics: {
          topTimezones: [],
          topCountries: [],
          peakHours: []
        }
      })) || [];

      setAnalytics({
        totalViews,
        totalUniqueViewers,
        activeLinks,
        recentViews: 0,
        topLinks,
        viewsByDate: {},
        topTimezones: [],
        topCountries: [],
        peakHours: []
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateViewsChart = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const chartData = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const views = analytics.viewsByDate[date] || 0;
      chartData.push({
        date: format(subDays(new Date(), i), 'MMM d'),
        views
      });
    }
    
    const maxViews = Math.max(...chartData.map(d => d.views), 1);
    
    return chartData.map(data => ({
      ...data,
      percentage: (data.views / maxViews) * 100
    }));
  };

  const exportData = () => {
    const csvContent = [
      ['Date', 'Views'],
      ...Object.entries(analytics.viewsByDate).map(([date, views]) => [date, views])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timelyr-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  const chartData = generateViewsChart();
  const hasAdvancedAnalytics = hasFeatureAccess(userProfile?.plan || 'starter', 'hasAdvancedAnalytics');

  return (
    <div className="p-6 space-y-6">
      {!hasAdvancedAnalytics && (
        <PlanUpgradePrompt
          feature="Advanced Analytics"
          description="Get detailed insights with timezone breakdowns, peak viewing hours, country analytics, and more comprehensive reporting."
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Detailed insights into your timezone links performance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {range === '7d' ? '7 days' : range === '30d' ? '30 days' : '90 days'}
              </button>
            ))}
          </div>
          <Button variant="secondary" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalViews}</p>
                <p className="text-xs text-green-600">
                  +{analytics.recentViews} in last {timeRange}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unique Viewers</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalUniqueViewers}</p>
                <p className="text-xs text-gray-500">All time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Views/Link</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.activeLinks > 0 ? Math.round(analytics.totalViews / analytics.activeLinks) : 0}
                </p>
                <p className="text-xs text-gray-500">Per active link</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Links</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.activeLinks}</p>
                <p className="text-xs text-gray-500">Currently active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Views Over Time Chart */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Views Over Time
          </h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-end space-x-2 h-64">
              {chartData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gray-200 rounded-t-sm relative group">
                    <div
                      className="bg-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-600"
                      style={{ height: `${Math.max(data.percentage, 2)}%` }}
                    ></div>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {data.views} views
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
                    {data.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Performing Links */}
        <Card className={!hasAdvancedAnalytics ? 'opacity-60' : ''}>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Top Performing Links
              {!hasAdvancedAnalytics && (
                <span className="ml-2 px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded-full">
                  Pro Only
                </span>
              )}
            </h2>
          </CardHeader>
          <CardContent>
            <div className={`space-y-4 ${!hasAdvancedAnalytics ? 'filter blur-sm' : ''}`}>
              {analytics.topLinks.length > 0 ? (
                analytics.topLinks.map((link, index) => (
                  <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3 ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 truncate max-w-48">{link.title}</p>
                        <p className="text-sm text-gray-500">/{link.slug}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">{link.views} views</p>
                      <p className="text-sm text-gray-500">{link.uniqueViewers} unique</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Timezones */}
        <Card className={!hasAdvancedAnalytics ? 'opacity-60' : ''}>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Top Viewer Timezones
              {!hasAdvancedAnalytics && (
                <span className="ml-2 px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded-full">
                  Pro Only
                </span>
              )}
            </h2>
          </CardHeader>
          <CardContent>
            <div className={`space-y-4 ${!hasAdvancedAnalytics ? 'filter blur-sm' : ''}`}>
              {analytics.topTimezones.length > 0 ? (
                analytics.topTimezones.slice(0, 5).map((tz, index) => (
                  <div key={tz.timezone} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-gray-800">{tz.timezone.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ 
                            width: `${(tz.count / analytics.topTimezones[0].count) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600 w-8 text-right">
                        {tz.count}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No timezone data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Peak Hours */}
      <Card className={!hasAdvancedAnalytics ? 'opacity-60' : ''}>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Peak Viewing Hours
            {!hasAdvancedAnalytics && (
              <span className="ml-2 px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded-full">
                Pro Only
              </span>
            )}
          </h2>
        </CardHeader>
        <CardContent>
          {analytics.peakHours.length > 0 && hasAdvancedAnalytics ? (
            <div className="grid grid-cols-12 gap-2">
              {Array.from({ length: 24 }, (_, hour) => {
                const hourData = analytics.peakHours.find(h => h.hour === hour);
                const count = hourData?.count || 0;
                const maxCount = Math.max(...analytics.peakHours.map(h => h.count), 1);
                const percentage = (count / maxCount) * 100;
                
                return (
                  <div key={hour} className="text-center">
                    <div className="h-20 flex items-end mb-2">
                      <div
                        className="w-full bg-blue-500 rounded-t-sm"
                        style={{ height: `${Math.max(percentage, 5)}%` }}
                        title={`${hour}:00 - ${count} views`}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {hour.toString().padStart(2, '0')}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              {!hasAdvancedAnalytics ? (
                <div className="filter blur-sm">
                  <div className="grid grid-cols-12 gap-2">
                    {Array.from({ length: 24 }, (_, hour) => (
                      <div key={hour} className="text-center">
                        <div className="h-20 flex items-end mb-2">
                          <div
                            className="w-full bg-blue-500 rounded-t-sm"
                            style={{ height: `${Math.random() * 80 + 20}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {hour.toString().padStart(2, '0')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hourly data available</p>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};