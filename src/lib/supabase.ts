import { createClient } from '@supabase/supabase-js';

// Check if we should use mock database
const useMockDb = import.meta.env.VITE_USE_MOCK_DB === 'true';

// Get Supabase environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Mock Supabase client for development and testing
const mockSupabase = {
  auth: {
    signUp: async (credentials: { email: string; password: string; options?: any }) => {
      console.log('Mock signUp:', credentials.email);
      return {
        data: {
          user: {
            id: 'mock-user-id',
            email: credentials.email,
            created_at: new Date().toISOString(),
            user_metadata: credentials.options?.data || {}
          }
        },
        error: null
      };
    },
    
    signInWithPassword: async (credentials: { email: string; password: string }) => {
      console.log('Mock signInWithPassword:', credentials.email);
      return {
        data: {
          user: {
            id: 'mock-user-id',
            email: credentials.email,
            created_at: new Date().toISOString()
          }
        },
        error: null
      };
    },
    
    signOut: async () => {
      console.log('Mock signOut');
      return { error: null };
    },
    
    getUser: async () => {
      return {
        data: {
          user: {
            id: 'mock-user-id',
            email: 'user@example.com',
            created_at: new Date().toISOString()
          }
        },
        error: null
      };
    },
    
    getSession: async () => {
      return {
        data: {
          session: {
            user: {
              id: 'mock-user-id',
              email: 'user@example.com',
              created_at: new Date().toISOString()
            }
          }
        },
        error: null
      };
    },
    
    onAuthStateChange: (callback: any) => {
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      };
    },
    
    updateUser: async (updates: any) => {
      console.log('Mock updateUser:', updates);
      return { error: null };
    }
  },
  
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        single: () => Promise.resolve({
          data: null,
          error: null
        }),
        maybeSingle: () => Promise.resolve({
          data: null,
          error: null
        })
      }),
      order: (column: string, options?: { ascending?: boolean }) => ({
        limit: (count: number) => Promise.resolve({
          data: [],
          error: null
        })
      }),
      limit: (count: number) => Promise.resolve({
        data: [],
        error: null
      })
    }),
    
    insert: (data: any) => ({
      select: () => ({
        single: () => Promise.resolve({
          data: { ...data, id: Math.random().toString(36) },
          error: null
        })
      })
    }),
    
    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        select: () => ({
          single: () => Promise.resolve({
            data: { ...data },
            error: null
          })
        })
      })
    }),
    
    upsert: (data: any) => ({
      select: () => ({
        single: () => Promise.resolve({
          data: { ...data, id: Math.random().toString(36) },
          error: null
        })
      })
    }),
    
    delete: () => ({
      eq: (column: string, value: any) => Promise.resolve({
        data: null,
        error: null
      })
    })
  }),
  
  channel: (name: string) => ({
    on: (event: string, options: any, callback: any) => ({
      subscribe: () => {}
    }),
    send: (data: any) => Promise.resolve()
  }),
  
  removeChannel: (channel: any) => {},
  
  storage: {
    from: (bucket: string) => ({
      upload: (path: string, file: File, options?: any) => Promise.resolve({
        data: { path },
        error: null
      }),
      getPublicUrl: (path: string) => ({
        data: { publicUrl: `https://mock-storage.com/${path}` }
      }),
      remove: (paths: string[]) => Promise.resolve({
        data: null,
        error: null
      })
    })
  }
};

// Create and export the Supabase client
export const supabase = useMockDb || !supabaseUrl || !supabaseAnonKey
  ? mockSupabase
  : createClient(supabaseUrl, supabaseAnonKey);

// Re-export types for convenience
export type { Session, User } from '@supabase/supabase-js';

// Define types for the application
export interface TimezoneLink {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  description?: string;
  scheduled_time: string;
  timezone: string;
  original_timezone: string;
  visibility: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  expires_at?: string;
  is_active: boolean;
  view_count: number;
  unique_viewers: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  website?: string;
  location?: string;
  language: string;
  theme: string;
  account_status: string;
  email_verified: boolean;
  phone_verified: boolean;
  follower_count: number;
  following_count: number;
  default_timezone: string;
  profile_visibility: string;
  plan?: string;
  links_created_this_month?: number;
  total_views_this_month?: number;
  active_links?: number;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_link_expiring: boolean;
  email_usage_limit: boolean;
  email_security_alerts: boolean;
  email_weekly_summary: boolean;
  push_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface LinkAnalytics {
  id: string;
  link_id: string;
  viewer_timezone?: string;
  viewer_country?: string;
  viewer_city?: string;
  viewed_at: string;
  user_agent?: string;
  referrer?: string;
  ip_address?: string;
}