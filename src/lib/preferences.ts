import { supabase } from './supabase';
import { logUserActivity } from './activity';

export interface UserPreferences {
  id: string;
  user_id: string;
  notification_email: boolean;
  notification_browser: boolean;
  marketing_emails: boolean;
  weekly_digest: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  dashboard_layout: any;
  reduce_motion: boolean;
  high_contrast: boolean;
  large_text: boolean;
  pwa_installed: boolean;
  created_at: string;
  updated_at: string;
}

// Get user preferences
export const getUserPreferences = async (userId: string): Promise<UserPreferences | null> => {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

// Update user preferences
export const updateUserPreferences = async (userId: string, preferences: Partial<UserPreferences>) => {
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: userId,
      ...preferences,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
    
  if (error) throw error;
  
  // Log activity for significant preference changes
  if (preferences.theme) {
    await logUserActivity(userId, 'theme_changed', { theme: preferences.theme });
  }
  
  if (preferences.notification_email !== undefined || preferences.marketing_emails !== undefined) {
    await logUserActivity(userId, 'preferences_updated', { 
      type: 'notifications',
      changes: Object.keys(preferences)
    });
  }
  
  return data;
};

// Update theme preference
export const updateTheme = async (userId: string, theme: 'light' | 'dark' | 'auto') => {
  await updateUserPreferences(userId, { theme });
  
  // Apply theme immediately
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme-preference', theme);
  
  // Handle auto theme
  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }
};

// Update accessibility settings
export const updateAccessibilitySettings = async (userId: string, settings: {
  reduce_motion?: boolean;
  high_contrast?: boolean;
  large_text?: boolean;
}) => {
  await updateUserPreferences(userId, settings);
  
  // Apply settings immediately
  if (settings.reduce_motion !== undefined) {
    if (settings.reduce_motion) {
      document.documentElement.style.setProperty('--animation-duration', '0s');
      document.documentElement.style.setProperty('--transition-duration', '0s');
    } else {
      document.documentElement.style.removeProperty('--animation-duration');
      document.documentElement.style.removeProperty('--transition-duration');
    }
  }
  
  if (settings.high_contrast !== undefined) {
    document.documentElement.classList.toggle('high-contrast', settings.high_contrast);
  }
  
  if (settings.large_text !== undefined) {
    document.documentElement.classList.toggle('large-text', settings.large_text);
  }
};

// Update dashboard layout preferences
export const updateDashboardLayout = async (userId: string, layout: {
  sidebar_collapsed?: boolean;
  default_view?: 'grid' | 'list';
  items_per_page?: number;
  show_analytics_widget?: boolean;
  show_business_hours_widget?: boolean;
}) => {
  const currentPrefs = await getUserPreferences(userId);
  const currentLayout = currentPrefs?.dashboard_layout || {};
  
  const updatedLayout = {
    ...currentLayout,
    ...layout
  };
  
  await updateUserPreferences(userId, { dashboard_layout: updatedLayout });
  return updatedLayout;
};

// Initialize user preferences with defaults
export const initializeUserPreferences = async (userId: string) => {
  const existingPrefs = await getUserPreferences(userId);
  if (existingPrefs) return existingPrefs;
  
  const defaultPreferences = {
    user_id: userId,
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
    pwa_installed: false
  };
  
  const { data, error } = await supabase
    .from('user_preferences')
    .insert(defaultPreferences)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Apply preferences to DOM
export const applyPreferencesToDOM = (preferences: UserPreferences) => {
  // Apply theme
  if (preferences.theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    document.documentElement.setAttribute('data-theme', preferences.theme);
  }
  
  // Apply accessibility settings
  if (preferences.reduce_motion) {
    document.documentElement.style.setProperty('--animation-duration', '0s');
    document.documentElement.style.setProperty('--transition-duration', '0s');
  }
  
  document.documentElement.classList.toggle('high-contrast', preferences.high_contrast);
  document.documentElement.classList.toggle('large-text', preferences.large_text);
  
  // Set language
  document.documentElement.lang = preferences.language;
};

// Get quick actions based on user preferences and plan
export const getQuickActions = (userPlan: string, preferences?: UserPreferences) => {
  const baseActions = [
    { id: 'create-link', label: 'Create Link', shortcut: 'Cmd+N', icon: 'plus' },
    { id: 'search', label: 'Search', shortcut: 'Cmd+K', icon: 'search' },
    { id: 'profile', label: 'Profile', shortcut: 'Cmd+,', icon: 'user' }
  ];
  
  if (userPlan === 'pro') {
    baseActions.push(
      { id: 'analytics', label: 'Analytics', shortcut: 'Cmd+A', icon: 'bar-chart' },
      { id: 'export', label: 'Export Data', shortcut: 'Cmd+E', icon: 'download' }
    );
  }
  
  return baseActions;
};

// Default preferences
export const DEFAULT_PREFERENCES = {
  notification_email: true,
  notification_browser: true,
  marketing_emails: false,
  weekly_digest: true,
  theme: 'light' as const,
  language: 'en',
  reduce_motion: false,
  high_contrast: false,
  large_text: false,
  pwa_installed: false
};