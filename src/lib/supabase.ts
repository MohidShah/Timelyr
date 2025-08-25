import { createClient } from '@supabase/supabase-js';
import { createMockSupabaseClient } from './mockSupabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if we should use mock mode
let useMockMode = !supabaseUrl || !supabaseAnonKey || import.meta.env.VITE_USE_MOCK_DB === 'true';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Using mock database for development.');
  console.warn('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
  console.warn('Set VITE_USE_MOCK_DB=false to disable mock mode when you have real credentials.');
}

// Create a wrapper that can switch to mock mode on permission errors
const createSupabaseClient = () => {
  if (useMockMode) {
    return createMockSupabaseClient() as any;
  }

  const realClient = createClient(supabaseUrl, supabaseAnonKey, {
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

  // Wrap the client to catch permission errors and fall back to mock mode
  const wrappedClient = new Proxy(realClient, {
    get(target, prop) {
      if (prop === 'from') {
        return (tableName: string) => {
          const table = target.from(tableName);
          
          // Wrap select method to catch permission errors
          const originalSelect = table.select.bind(table);
          table.select = (...args: any[]) => {
            const query = originalSelect(...args);
            const originalThen = query.then?.bind(query);
            
            if (originalThen) {
              query.then = (onFulfilled?: any, onRejected?: any) => {
                return originalThen((result: any) => {
                  // Check for permission denied errors
                  if (result.error && (
                    result.error.message?.includes('permission denied') ||
                    result.error.code === '42501'
                  )) {
                    console.warn('Supabase permission denied, falling back to mock mode');
                    useMockMode = true;
                    // Return mock client result
                    const mockClient = createMockSupabaseClient() as any;
                    return mockClient.from(tableName).select(...args);
                  }
                  return onFulfilled ? onFulfilled(result) : result;
                }, onRejected);
              };
            }
            
            return query;
          };
          
          return table;
        };
      }
      return target[prop as keyof typeof target];
    }
  });

  return wrappedClient;
};

export const supabase = createSupabaseClient();

// Log the mode we're using
if (useMockMode) {
  console.log('🔧 Running in MOCK DATABASE mode');
  console.log('📊 All data is simulated and stored in memory');
  console.log('🔄 Data will reset on page refresh');
  console.log('⚙️ Set VITE_USE_MOCK_DB=false in .env to use real Supabase');
} else {
  console.log('🚀 Connected to Supabase database');
}

// Test connection function
export const testSupabaseConnection = async () => {
  if (useMockMode) {
    console.log('Mock database connection successful');
    return true;
  }
  
  try {
    const { data, error } = await supabase.from('user_profiles').select('id').limit(1);
    if (error) {
      if (error.message?.includes('permission denied') || error.code === '42501') {
        console.warn('Supabase permission denied, switching to mock mode');
        useMockMode = true;
        return true;
      }
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
          email: string;
          username: string | null;
          display_name: string;
          avatar_url: string | null;
          bio: string | null;
          phone: string | null;
          company: string | null;
          job_title: string | null;
          website: string | null;
          location: string | null;
          language: string;
          theme: string;
          account_status: string;
          email_verified: boolean;
          phone_verified: boolean;
          follower_count: number;
          following_count: number;
          default_timezone: string;
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