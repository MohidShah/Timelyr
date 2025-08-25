import { supabase } from './supabase';
import { generateMockAnalyticsData } from './mockData';
import type { LinkAnalytics, TimezoneLink } from './supabase';

// Track link view with analytics
export const trackLinkView = async (linkId: string, viewerData: {
  timezone: string;
  country?: string;
  city?: string;
  userAgent: string;
  referrer?: string;
  ipAddress?: string;
}) => {
  try {
    // Record the view in analytics
    const { error: analyticsError } = await supabase
      .from('link_analytics')
      .insert({
        link_id: linkId,
        viewer_timezone: viewerData.timezone,
        viewer_country: viewerData.country || null,
        viewer_city: viewerData.city || null,
        user_agent: viewerData.userAgent,
        referrer: viewerData.referrer || null,
        ip_address: viewerData.ipAddress || null,
      });

    if (analyticsError) throw analyticsError;

    // Increment total view count
    const { error: updateError } = await supabase
      .from('timezone_links')
      .update({ view_count: supabase.raw('view_count + 1') })
      .eq('id', linkId);

    if (updateError) throw updateError;
  } catch (error) {
    console.error('Error tracking link view:', error);
  }
};

// Get analytics for a specific link
export const getLinkAnalytics = async (linkId: string) => {
  const { data, error } = await supabase
    .from('link_analytics')
    .select('*')
    .eq('link_id', linkId)
    .order('viewed_at', { ascending: false });

  if (error) throw error;

  // Process analytics data
  const totalViews = data.length;
  const uniqueTimezones = new Set(data.map(v => v.viewer_timezone)).size;
  const uniqueCountries = new Set(data.filter(v => v.viewer_country).map(v => v.viewer_country)).size;

  // Top timezones
  const timezoneCount = data.reduce((acc, view) => {
    if (view.viewer_timezone) {
      acc[view.viewer_timezone] = (acc[view.viewer_timezone] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topTimezones = Object.entries(timezoneCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([timezone, count]) => ({ timezone, count }));

  // Top countries
  const countryCount = data.reduce((acc, view) => {
    if (view.viewer_country) {
      acc[view.viewer_country] = (acc[view.viewer_country] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topCountries = Object.entries(countryCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([country, count]) => ({ country, count }));

  // Views over time (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentViews = data.filter(view => 
    new Date(view.viewed_at) >= thirtyDaysAgo
  );

  const viewsByDate = recentViews.reduce((acc, view) => {
    const date = new Date(view.viewed_at).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Peak viewing hours
  const hourCount = data.reduce((acc, view) => {
    const hour = new Date(view.viewed_at).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const peakHours = Object.entries(hourCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }));

  return {
    totalViews,
    uniqueTimezones,
    uniqueCountries,
    topTimezones,
    topCountries,
    viewsByDate,
    peakHours,
    recentViews: recentViews.length,
  };
};

// Get user's overall analytics
export const getUserAnalytics = async (userId: string, days: number = 30) => {
  // Check if we're in mock mode
  const isMockMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_USE_MOCK_DB === 'true';
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('link_analytics')
    .select(`
      *,
      timezone_links!inner(title, user_id, created_at)
    `)
    .eq('timezone_links.user_id', userId)
    .gte('viewed_at', startDate.toISOString());

  if (error) throw error;

  // Get user's links for additional stats
  const { data: links, error: linksError } = await supabase
    .from('timezone_links')
    .select('*')
    .eq('user_id', userId);

  if (linksError) throw linksError;

  const totalLinks = links.length;
  const activeLinks = links.filter(link => link.is_active).length;
  const totalViews = links.reduce((sum, link) => sum + link.view_count, 0);
  const totalUniqueViewers = links.reduce((sum, link) => sum + link.unique_viewers, 0);

  // Most viewed links
  const topLinks = links
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, 5)
    .map(link => ({
      id: link.id,
      title: link.title,
      slug: link.slug,
      views: link.view_count,
      uniqueViewers: link.unique_viewers,
    }));

  // Views trend over time - use mock data if in mock mode
  const viewsByDate = isMockMode 
    ? generateMockAnalyticsData(days)
    : data.reduce((acc, view) => {
        const date = new Date(view.viewed_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

  return {
    links,
    totalLinks,
    activeLinks,
    totalViews,
    totalUniqueViewers,
    recentViews: data.length,
    topLinks,
    viewsByDate,
  };
};

// Get business hours analysis for a scheduled time
export const analyzeBusinessHours = (scheduledTime: Date) => {
  const BUSINESS_REGIONS = [
    { name: 'US East Coast', timezone: 'America/New_York' },
    { name: 'US West Coast', timezone: 'America/Los_Angeles' },
    { name: 'Europe', timezone: 'Europe/London' },
    { name: 'Asia Pacific', timezone: 'Asia/Tokyo' },
    { name: 'Pakistan', timezone: 'Asia/Karachi' },
    { name: 'Australia', timezone: 'Australia/Sydney' },
  ];

  const businessHours = { start: 9, end: 17 }; // 9 AM to 5 PM

  return BUSINESS_REGIONS.map(region => {
    const timeInRegion = new Date(scheduledTime.toLocaleString('en-US', { timeZone: region.timezone }));
    const hour = timeInRegion.getHours();
    const dayOfWeek = timeInRegion.getDay();
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
    const isBusinessHours = hour >= businessHours.start && hour < businessHours.end && isWeekday;

    return {
      ...region,
      localTime: timeInRegion,
      isBusinessHours,
      hour,
      dayOfWeek,
      timeString: timeInRegion.toLocaleString('en-US', {
        timeZone: region.timezone,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      }),
    };
  });
};

// Get optimal meeting time suggestions
export const getOptimalMeetingTimes = (baseTime: Date, participants: string[] = []) => {
  const suggestions = [];
  const regions = participants.length > 0 ? participants : [
    'America/New_York',
    'Europe/London',
    'Asia/Tokyo',
  ];

  // Try different hours around the base time
  for (let hourOffset = -12; hourOffset <= 12; hourOffset++) {
    const testTime = new Date(baseTime);
    testTime.setHours(testTime.getHours() + hourOffset);

    const analysis = analyzeBusinessHours(testTime);
    const businessHoursCount = analysis.filter(region => region.isBusinessHours).length;
    const score = businessHoursCount / analysis.length;

    if (score > 0.5) { // At least 50% in business hours
      suggestions.push({
        time: testTime,
        score,
        businessHoursCount,
        analysis,
      });
    }
  }

  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
};