import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please check your .env file.');
  console.warn('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
  console.warn('App will continue but database features will not work.');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-key', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'timelyr'
    }
  }
});

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
};
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          username: string | null;
          display_name: string;
          email: string;
          avatar_url: string | null;
          bio: string | null;
          default_timezone: string;
          date_format: string;
          time_format: string;
          business_hours_start: string;
          business_hours_end: string;
          email_notifications: boolean;
          profile_visibility: 'public' | 'private' | 'team';
          plan: 'starter' | 'pro';
          links_created_this_month: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>;
      };
      timezone_links: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          slug: string;
          scheduled_time: string;
          timezone: string;
          description: string | null;
          is_recurring: boolean;
          recurrence_pattern: string | null;
          expires_at: string | null;
          is_active: boolean;
          view_count: number;
          unique_viewers: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['timezone_links']['Row'], 'id' | 'created_at' | 'updated_at' | 'view_count' | 'unique_viewers'>;
        Update: Partial<Database['public']['Tables']['timezone_links']['Insert']>;
      };
      link_analytics: {
        Row: {
          id: string;
          link_id: string;
          viewer_timezone: string | null;
          viewer_country: string | null;
          viewer_city: string | null;
          viewed_at: string;
          user_agent: string | null;
          referrer: string | null;
          ip_address: string | null;
        };
        Insert: Omit<Database['public']['Tables']['link_analytics']['Row'], 'id' | 'viewed_at'>;
        Update: Partial<Database['public']['Tables']['link_analytics']['Insert']>;
      };
      user_sessions: {
        Row: {
          id: string;
          user_id: string;
          device_info: string | null;
          browser_info: string | null;
          ip_address: string | null;
          location: string | null;
          last_active: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_sessions']['Row'], 'id' | 'created_at' | 'last_active'>;
        Update: Partial<Database['public']['Tables']['user_sessions']['Insert']>;
      };
      link_templates: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          title_template: string;
          description_template: string | null;
          default_timezone: string | null;
          is_favorite: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['link_templates']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['link_templates']['Insert']>;
      };
      notification_preferences: {
        Row: {
          id: string;
          user_id: string;
          email_link_expiring: boolean;
          email_usage_limit: boolean;
          email_security_alerts: boolean;
          email_weekly_summary: boolean;
          push_notifications: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notification_preferences']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['notification_preferences']['Insert']>;
      };
    };
  };
};

// Helper types
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type TimezoneLink = Database['public']['Tables']['timezone_links']['Row'];
export type LinkAnalytics = Database['public']['Tables']['link_analytics']['Row'];
export type UserSession = Database['public']['Tables']['user_sessions']['Row'];
export type LinkTemplate = Database['public']['Tables']['link_templates']['Row'];
export type NotificationPreferences = Database['public']['Tables']['notification_preferences']['Row'];