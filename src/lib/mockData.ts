// Mock data for testing all functionality
import { addDays, subDays, addHours, subHours } from 'date-fns';

// Mock user data
export const mockUsers = {
  'user-1': {
    id: 'user-1',
    email: 'john@example.com',
    user_metadata: {
      full_name: 'John Doe'
    }
  },
  'user-2': {
    id: 'user-2',
    email: 'jane@example.com',
    user_metadata: {
      full_name: 'Jane Smith'
    }
  }
};

// Mock user profiles
export const mockUserProfiles = {
  'user-1': {
    id: 'user-1',
    username: 'johndoe',
    display_name: 'John Doe',
    email: 'john@example.com',
    avatar_url: null,
    bio: 'Product Manager at TechCorp. Love coordinating global meetings!',
    phone: '+1-555-0123',
    company: 'TechCorp',
    job_title: 'Product Manager',
    website: 'https://johndoe.dev',
    location: 'San Francisco, CA',
    default_timezone: 'America/Los_Angeles',
    date_format: 'MM/DD/YYYY',
    time_format: '12h',
    business_hours_start: '09:00:00',
    business_hours_end: '17:00:00',
    email_notifications: true,
    profile_visibility: 'public' as const,
    plan: 'pro' as const,
    links_created_this_month: 15,
    created_at: subDays(new Date(), 30).toISOString(),
    updated_at: new Date().toISOString()
  },
  'user-2': {
    id: 'user-2',
    username: 'janesmith',
    display_name: 'Jane Smith',
    email: 'jane@example.com',
    avatar_url: null,
    bio: 'UX Designer passionate about remote collaboration',
    phone: null,
    company: 'DesignStudio',
    job_title: 'Senior UX Designer',
    website: null,
    location: 'London, UK',
    default_timezone: 'Europe/London',
    date_format: 'DD/MM/YYYY',
    time_format: '24h',
    business_hours_start: '09:00:00',
    business_hours_end: '17:00:00',
    email_notifications: true,
    profile_visibility: 'public' as const,
    plan: 'starter' as const,
    links_created_this_month: 8,
    created_at: subDays(new Date(), 45).toISOString(),
    updated_at: new Date().toISOString()
  }
};

// Mock timezone links
export const mockTimezoneLinks = [
  {
    id: 'link-1',
    user_id: 'user-1',
    title: 'Weekly Team Standup',
    slug: 'weekly-team-standup-jan-15',
    scheduled_time: addDays(new Date(), 1).toISOString(),
    timezone: 'America/Los_Angeles',
    description: 'Our regular Monday morning standup to sync on the week ahead',
    is_recurring: true,
    recurrence_pattern: 'weekly',
    expires_at: addDays(new Date(), 365).toISOString(),
    is_active: true,
    view_count: 47,
    unique_viewers: 12,
    created_at: subDays(new Date(), 7).toISOString(),
    updated_at: subDays(new Date(), 2).toISOString()
  },
  {
    id: 'link-2',
    user_id: 'user-1',
    title: 'Product Demo Session',
    slug: 'product-demo-session-jan-20',
    scheduled_time: addDays(new Date(), 5).toISOString(),
    timezone: 'America/Los_Angeles',
    description: 'Quarterly product demo for stakeholders across all regions',
    is_recurring: false,
    recurrence_pattern: null,
    expires_at: addDays(new Date(), 365).toISOString(),
    is_active: true,
    view_count: 23,
    unique_viewers: 18,
    created_at: subDays(new Date(), 3).toISOString(),
    updated_at: subDays(new Date(), 1).toISOString()
  },
  {
    id: 'link-3',
    user_id: 'user-2',
    title: 'Design Review Meeting',
    slug: 'design-review-meeting-jan-18',
    scheduled_time: addDays(new Date(), 3).toISOString(),
    timezone: 'Europe/London',
    description: 'Review of the new dashboard designs with the development team',
    is_recurring: false,
    recurrence_pattern: null,
    expires_at: addDays(new Date(), 30).toISOString(),
    is_active: true,
    view_count: 8,
    unique_viewers: 6,
    created_at: subDays(new Date(), 2).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'link-4',
    user_id: 'user-1',
    title: 'Coffee Chat with Investors',
    slug: 'coffee-chat-investors-jan-12',
    scheduled_time: subDays(new Date(), 3).toISOString(),
    timezone: 'America/New_York',
    description: 'Casual coffee meeting to discuss Q1 progress',
    is_recurring: false,
    recurrence_pattern: null,
    expires_at: addDays(new Date(), 365).toISOString(),
    is_active: false,
    view_count: 15,
    unique_viewers: 8,
    created_at: subDays(new Date(), 10).toISOString(),
    updated_at: subDays(new Date(), 5).toISOString()
  },
  {
    id: 'link-5',
    user_id: 'user-2',
    title: 'Client Presentation',
    slug: 'client-presentation-dec-28',
    scheduled_time: subDays(new Date(), 18).toISOString(),
    timezone: 'Europe/London',
    description: 'Final presentation of the redesigned user interface',
    is_recurring: false,
    recurrence_pattern: null,
    expires_at: subDays(new Date(), 5).toISOString(),
    is_active: false,
    view_count: 32,
    unique_viewers: 14,
    created_at: subDays(new Date(), 25).toISOString(),
    updated_at: subDays(new Date(), 18).toISOString()
  }
];

// Mock link analytics
export const mockLinkAnalytics = [
  {
    id: 'analytics-1',
    link_id: 'link-1',
    viewer_timezone: 'America/New_York',
    viewer_country: 'US',
    viewer_city: 'New York',
    viewed_at: subHours(new Date(), 2).toISOString(),
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    referrer: 'https://slack.com',
    ip_address: '192.168.1.1'
  },
  {
    id: 'analytics-2',
    link_id: 'link-1',
    viewer_timezone: 'Europe/London',
    viewer_country: 'GB',
    viewer_city: 'London',
    viewed_at: subHours(new Date(), 5).toISOString(),
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    referrer: 'https://teams.microsoft.com',
    ip_address: '192.168.1.2'
  },
  {
    id: 'analytics-3',
    link_id: 'link-1',
    viewer_timezone: 'Asia/Tokyo',
    viewer_country: 'JP',
    viewer_city: 'Tokyo',
    viewed_at: subHours(new Date(), 8).toISOString(),
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
    referrer: 'https://whatsapp.com',
    ip_address: '192.168.1.3'
  },
  {
    id: 'analytics-4',
    link_id: 'link-2',
    viewer_timezone: 'Australia/Sydney',
    viewer_country: 'AU',
    viewer_city: 'Sydney',
    viewed_at: subHours(new Date(), 12).toISOString(),
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    referrer: 'https://email.google.com',
    ip_address: '192.168.1.4'
  },
  {
    id: 'analytics-5',
    link_id: 'link-2',
    viewer_timezone: 'Asia/Karachi',
    viewer_country: 'PK',
    viewer_city: 'Karachi',
    viewed_at: subHours(new Date(), 15).toISOString(),
    user_agent: 'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0',
    referrer: 'https://twitter.com',
    ip_address: '192.168.1.5'
  }
];

// Mock notifications
export const mockNotifications = [
  {
    id: 'notif-1',
    user_id: 'user-1',
    type: 'link_expiring',
    title: 'Link Expiring Soon',
    message: 'Your link "Coffee Chat with Investors" will expire in 3 days.',
    is_read: false,
    action_url: '/dashboard',
    created_at: subHours(new Date(), 2).toISOString()
  },
  {
    id: 'notif-2',
    user_id: 'user-1',
    type: 'usage_limit_warning',
    title: 'Approaching Monthly Limit',
    message: 'You\'ve used 45 of 50 links this month. Consider upgrading to Pro.',
    is_read: false,
    action_url: '/pricing',
    created_at: subHours(new Date(), 6).toISOString()
  },
  {
    id: 'notif-3',
    user_id: 'user-1',
    type: 'feature_announcement',
    title: 'New Feature: Business Hours Intelligence',
    message: 'Now see if your meeting time works across different business hours!',
    is_read: true,
    action_url: '/how-it-works',
    created_at: subDays(new Date(), 1).toISOString()
  }
];

// Mock user preferences
export const mockUserPreferences = {
  'user-1': {
    id: 'pref-1',
    user_id: 'user-1',
    notification_email: true,
    notification_browser: true,
    marketing_emails: false,
    weekly_digest: true,
    theme: 'light' as const,
    language: 'en',
    dashboard_layout: {
      sidebar_collapsed: false,
      default_view: 'grid',
      items_per_page: 12,
      show_analytics_widget: true,
      show_business_hours_widget: true
    },
    reduce_motion: false,
    high_contrast: false,
    large_text: false,
    pwa_installed: false,
    created_at: subDays(new Date(), 30).toISOString(),
    updated_at: new Date().toISOString()
  },
  'user-2': {
    id: 'pref-2',
    user_id: 'user-2',
    notification_email: true,
    notification_browser: false,
    marketing_emails: true,
    weekly_digest: false,
    theme: 'dark' as const,
    language: 'en',
    dashboard_layout: {
      sidebar_collapsed: true,
      default_view: 'list',
      items_per_page: 20,
      show_analytics_widget: false,
      show_business_hours_widget: true
    },
    reduce_motion: true,
    high_contrast: false,
    large_text: true,
    pwa_installed: true,
    created_at: subDays(new Date(), 45).toISOString(),
    updated_at: subDays(new Date(), 2).toISOString()
  }
};

// Mock support tickets
export const mockSupportTickets = [
  {
    id: 'ticket-1',
    user_id: 'user-1',
    subject: 'Link not working in Slack',
    message: 'When I share my timezone link in Slack, it doesn\'t show the preview correctly. The time appears to be wrong.',
    priority: 'medium' as const,
    status: 'open' as const,
    category: 'technical' as const,
    created_at: subHours(new Date(), 4).toISOString(),
    updated_at: subHours(new Date(), 4).toISOString()
  },
  {
    id: 'ticket-2',
    user_id: 'user-1',
    subject: 'Billing question about Pro plan',
    message: 'I upgraded to Pro but I\'m still seeing the monthly limit warning. When will this be updated?',
    priority: 'low' as const,
    status: 'resolved' as const,
    category: 'billing' as const,
    created_at: subDays(new Date(), 3).toISOString(),
    updated_at: subDays(new Date(), 2).toISOString()
  }
];

// Mock user feedback
export const mockUserFeedback = [
  {
    id: 'feedback-1',
    user_id: 'user-1',
    type: 'improvement' as const,
    rating: 4,
    message: 'Love the app! Would be great to have a mobile app version.',
    page_url: '/dashboard',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
    status: 'open' as const,
    created_at: subDays(new Date(), 1).toISOString()
  },
  {
    id: 'feedback-2',
    user_id: 'user-2',
    type: 'compliment' as const,
    rating: 5,
    message: 'This app has saved me so much time coordinating with my global team. Thank you!',
    page_url: '/',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: 'reviewed' as const,
    created_at: subDays(new Date(), 5).toISOString()
  }
];

// Mock activity log
export const mockActivityLog = [
  {
    id: 'activity-1',
    user_id: 'user-1',
    action: 'link_created',
    details: { linkId: 'link-1', title: 'Weekly Team Standup' },
    ip_address: '192.168.1.1',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    created_at: subDays(new Date(), 7).toISOString()
  },
  {
    id: 'activity-2',
    user_id: 'user-1',
    action: 'profile_updated',
    details: { field: 'bio' },
    ip_address: '192.168.1.1',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    created_at: subDays(new Date(), 5).toISOString()
  },
  {
    id: 'activity-3',
    user_id: 'user-1',
    action: 'login',
    details: {},
    ip_address: '192.168.1.1',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    created_at: subHours(new Date(), 2).toISOString()
  }
];

// Generate more analytics data for charts
export const generateMockAnalyticsData = (days: number = 30) => {
  const data: Record<string, number> = {};
  
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i).toISOString().split('T')[0];
    // Generate realistic view patterns (more views on weekdays)
    const dayOfWeek = subDays(new Date(), i).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseViews = isWeekend ? Math.floor(Math.random() * 5) : Math.floor(Math.random() * 15) + 5;
    data[date] = baseViews;
  }
  
  return data;
};

// Mock current user (for testing)
export const mockCurrentUser = mockUsers['user-1'];
export const mockCurrentUserProfile = mockUserProfiles['user-1'];