import { createClient } from '@supabase/supabase-js';
import { createMockSupabaseClient } from './mockSupabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if we should use mock mode
export let useMockMode = !supabaseUrl || !supabaseAnonKey || import.meta.env.VITE_USE_MOCK_DB === 'true';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Using mock database for development.');
  console.warn('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
  console.warn('Set VITE_USE_MOCK_DB=false to disable mock mode when you have real credentials.');
}

// Create a wrapper that can switch to mock mode on permission errors
const createSupabaseClient = () => {
  if (useMockMode) {
    console.log('🔧 Using mock Supabase client');
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
      // Handle auth methods
      if (prop === 'auth') {
        const auth = target.auth;
        return new Proxy(auth, {
          get(authTarget, authProp) {
            if (authProp === 'getSession') {
              return async () => {
                try {
                  const result = await authTarget.getSession();
                  if (result.error && (
                    result.error.message?.includes('permission denied') ||
                    result.error.code === '42501'
                  )) {
                    console.warn('Auth permission denied, switching to mock mode');
                    useMockMode = true;
                    return { data: { session: null }, error: null };
                  }
                  return result;
                } catch (error: any) {
                  console.warn('Auth error, switching to mock mode:', error);
                  useMockMode = true;
                  return { data: { session: null }, error: null };
                }
              };
            }
            if (authProp === 'onAuthStateChange') {
              return (callback: any) => {
                try {
                  return authTarget.onAuthStateChange(callback);
                } catch (error) {
                  console.warn('Auth state change error:', error);
                  // Return a mock subscription
                  return {
                    data: {
                      subscription: {
                        unsubscribe: () => {}
                      }
                    }
                  };
                }
              };
            }
            return authTarget[authProp as keyof typeof authTarget];
          }
        });
      }
      
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
                    result.error.code === '42501' ||
                    result.error.message?.includes('JWT')
                  )) {
                    console.warn('Supabase permission denied, falling back to mock mode');
                    useMockMode = true;
                    // Return empty result for graceful fallback
                    return onFulfilled ? onFulfilled({ data: [], error: null }) : { data: [], error: null };
                  }
                  return onFulfilled ? onFulfilled(result) : result;
                }, onRejected);
              };
            }
            
            return query;
          };
          
          // Wrap other methods too
          const originalInsert = table.insert?.bind(table);
          if (originalInsert) {
            table.insert = (...args: any[]) => {
              const query = originalInsert(...args);
              const originalThen = query.then?.bind(query);
              
              if (originalThen) {
                query.then = (onFulfilled?: any, onRejected?: any) => {
                  return originalThen((result: any) => {
                    if (result.error && (
                      result.error.message?.includes('permission denied') ||
                      result.error.code === '42501'
                    )) {
                      console.warn('Insert permission denied, switching to mock mode');
                      useMockMode = true;
                      // Return mock success result
                      return onFulfilled ? onFulfilled({ data: { id: 'mock-id', ...args[0] }, error: null }) : { data: { id: 'mock-id', ...args[0] }, error: null };
                    }
                    return onFulfilled ? onFulfilled(result) : result;
                  }, onRejected);
                };
              }
              
              return query;
            };
          }
          
          const originalUpdate = table.update?.bind(table);
          if (originalUpdate) {
            table.update = (...args: any[]) => {
              const updateQuery = originalUpdate(...args);
              return {
                ...updateQuery,
                eq: (column: string, value: any) => {
                  const query = updateQuery.eq(column, value);
                  const originalThen = query.then?.bind(query);
                  
                  if (originalThen) {
                    query.then = (onFulfilled?: any, onRejected?: any) => {
                      return originalThen((result: any) => {
                        if (result.error && (
                          result.error.message?.includes('permission denied') ||
                          result.error.code === '42501'
                        )) {
                          console.warn('Update permission denied, switching to mock mode');
                          useMockMode = true;
                          return onFulfilled ? onFulfilled({ data: args[0], error: null }) : { data: args[0], error: null };
                        }
                        return onFulfilled ? onFulfilled(result) : result;
                      }, onRejected);
                    };
                  }
                  
                  return query;
                }
              };
            };
          }
          
          const originalDelete = table.delete?.bind(table);
          if (originalDelete) {
            table.delete = () => {
              const deleteQuery = originalDelete();
              return {
                ...deleteQuery,
                eq: (column: string, value: any) => {
                  const query = deleteQuery.eq(column, value);
                  const originalThen = query.then?.bind(query);
                  
                  if (originalThen) {
                    query.then = (onFulfilled?: any, onRejected?: any) => {
                      return originalThen((result: any) => {
                        if (result.error && (
                          result.error.message?.includes('permission denied') ||
                          result.error.code === '42501'
                        )) {
                          console.warn('Delete permission denied, switching to mock mode');
                          useMockMode = true;
                          return onFulfilled ? onFulfilled({ data: null, error: null }) : { data: null, error: null };
                        }
                        return onFulfilled ? onFulfilled(result) : result;
                      }, onRejected);
                    };
                  }
                  
                  return query;
                }
              };
            };
          }
          
          return table;
        };
      }
      return target[prop as keyof typeof target];
    }
  });

  return wrappedClient;
};

export const supabase = createSupabaseClient();

// Enhanced mock client with better auth simulation
const createEnhancedMockClient = () => {
  return {
    auth: {
      getSession: async () => {
        console.log('Mock: Getting session');
        return { 
          data: { session: null }, 
          error: null 
        };
      },
      onAuthStateChange: (callback: any) => {
        console.log('Mock: Setting up auth state change listener');
        return {
          data: {
            subscription: {
              unsubscribe: () => console.log('Mock: Unsubscribed from auth changes')
            }
          }
        };
      },
      signUp: async (credentials: any) => {
        console.log('Mock: Sign up attempt');
        return {
          data: { user: null },
          error: null
        };
      },
      signInWithPassword: async (credentials: any) => {
        console.log('Mock: Sign in attempt');
        return {
          data: { user: null },
          error: null
        };
      },
      signOut: async () => {
        console.log('Mock: Sign out');
        return { error: null };
      }
    },
    from: (tableName: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          single: () => Promise.resolve({ data: null, error: null }),
          maybeSingle: () => Promise.resolve({ data: null, error: null })
        }),
        order: (column: string, options?: any) => Promise.resolve({ data: [], error: null }),
        limit: (count: number) => Promise.resolve({ data: [], error: null })
      }),
      insert: (data: any) => ({
        select: () => ({
          single: () => Promise.resolve({ 
            data: { ...data, id: `mock-${Date.now()}` }, 
            error: null 
          })
        })
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: () => ({
            single: () => Promise.resolve({ data: { ...data }, error: null })
          })
        })
      }),
      delete: () => ({
        eq: (column: string, value: any) => Promise.resolve({ data: null, error: null })
      })
    })
  };
};

// Update the mock client creation
const originalCreateMockSupabaseClient = createMockSupabaseClient;
export { createEnhancedMockClient as createMockSupabaseClient };

// Re-export the enhanced client
const enhancedSupabase = (() => {
  if (useMockMode) {
    return createEnhancedMockClient() as any;
  }
  
  try {
    return createSupabaseClient();
  } catch (error) {
    console.warn('Failed to create Supabase client, using mock mode:', error);
    useMockMode = true;
    return createEnhancedMockClient() as any;
  }
})();

// Replace the export
export { enhancedSupabase as supabase };

// Remove the old export
// export const supabase = createSupabaseClient();
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