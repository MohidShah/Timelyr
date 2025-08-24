// Mock Supabase client for development and testing
import { 
  mockUsers, 
  mockUserProfiles, 
  mockTimezoneLinks, 
  mockLinkAnalytics, 
  mockNotifications,
  mockUserPreferences,
  mockSupportTickets,
  mockUserFeedback,
  mockActivityLog,
  generateMockAnalyticsData
} from './mockData';

// In-memory storage for mock data
let mockStorage = {
  users: { ...mockUsers },
  userProfiles: { ...mockUserProfiles },
  timezoneLinks: [...mockTimezoneLinks],
  linkAnalytics: [...mockLinkAnalytics],
  notifications: [...mockNotifications],
  userPreferences: { ...mockUserPreferences },
  supportTickets: [...mockSupportTickets],
  userFeedback: [...mockUserFeedback],
  activityLog: [...mockActivityLog],
  currentUser: null as any,
  session: null as any
};

// Mock auth methods
const mockAuth = {
  getSession: async () => ({
    data: { session: mockStorage.session },
    error: null
  }),
  
  getUser: async () => ({
    data: { user: mockStorage.currentUser },
    error: null
  }),
  
  signUp: async ({ email, password, options }: any) => {
    const userId = `user-${Date.now()}`;
    const newUser = {
      id: userId,
      email,
      user_metadata: options?.data || {},
      created_at: new Date().toISOString()
    };
    
    mockStorage.users[userId] = newUser;
    mockStorage.currentUser = newUser;
    mockStorage.session = { user: newUser, access_token: 'mock-token' };
    
    return {
      data: { user: newUser, session: mockStorage.session },
      error: null
    };
  },
  
  signInWithPassword: async ({ email, password }: any) => {
    // Find user by email
    const user = Object.values(mockStorage.users).find((u: any) => u.email === email);
    
    if (!user) {
      return {
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' }
      };
    }
    
    mockStorage.currentUser = user;
    mockStorage.session = { user, access_token: 'mock-token' };
    
    return {
      data: { user, session: mockStorage.session },
      error: null
    };
  },
  
  signOut: async () => {
    mockStorage.currentUser = null;
    mockStorage.session = null;
    return { error: null };
  },
  
  updateUser: async (updates: any) => {
    if (!mockStorage.currentUser) {
      return { data: { user: null }, error: { message: 'Not authenticated' } };
    }
    
    mockStorage.currentUser = { ...mockStorage.currentUser, ...updates };
    return { data: { user: mockStorage.currentUser }, error: null };
  },
  
  onAuthStateChange: (callback: any) => {
    // Mock subscription
    return {
      data: {
        subscription: {
          unsubscribe: () => {}
        }
      }
    };
  }
};

// Mock database methods
const createMockTable = (tableName: string) => ({
  select: (columns = '*') => ({
    // Add support for multiple filters
    eq: (column: string, value: any) => createMockQuery(tableName, { [column]: value }),
    order: (column: string, options: any = {}) => createMockOrderedQuery(tableName, column, options),
    limit: (count: number) => createMockLimitedQuery(tableName, count),
    gte: (column: string, value: any) => createMockQuery(tableName, { [`${column}_gte`]: value }),
    in: (column: string, values: any[]) => createMockQuery(tableName, { [`${column}_in`]: values }),
    neq: (column: string, value: any) => createMockQuery(tableName, { [`${column}_neq`]: value }),
    
    // Add direct query execution
    then: async (callback: any) => {
      let data;
      
      switch (tableName) {
        case 'timezone_links':
          data = mockStorage.timezoneLinks;
          break;
        case 'user_notifications':
          data = mockStorage.notifications;
          break;
        case 'user_profiles':
          data = Object.values(mockStorage.userProfiles);
          break;
        default:
          data = [];
      }
      
      return callback({ data, error: null });
    }
  }),
  
  insert: (data: any) => ({
    select: () => ({
      single: async () => {
        const newItem = {
          id: `${tableName}-${Date.now()}`,
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        switch (tableName) {
          case 'user_profiles':
            mockStorage.userProfiles[newItem.id] = newItem;
            break;
          case 'timezone_links':
            mockStorage.timezoneLinks.push(newItem);
            break;
          case 'link_analytics':
            mockStorage.linkAnalytics.push(newItem);
            break;
          case 'user_notifications':
            mockStorage.notifications.push(newItem);
            break;
          case 'support_tickets':
            mockStorage.supportTickets.push(newItem);
            break;
          case 'user_feedback':
            mockStorage.userFeedback.push(newItem);
            break;
          case 'user_activity_log':
            mockStorage.activityLog.push(newItem);
            break;
        }
        
        return { data: newItem, error: null };
      }
    })
  }),
  
  update: (updates: any) => ({
    eq: (column: string, value: any) => ({
      select: () => ({
        single: async () => {
          let updatedItem;
          
          switch (tableName) {
            case 'user_profiles':
              const profile = Object.values(mockStorage.userProfiles).find((p: any) => p[column] === value);
              if (profile) {
                updatedItem = { ...profile, ...updates, updated_at: new Date().toISOString() };
                mockStorage.userProfiles[updatedItem.id] = updatedItem;
              }
              break;
            case 'timezone_links':
              const linkIndex = mockStorage.timezoneLinks.findIndex((l: any) => l[column] === value);
              if (linkIndex !== -1) {
                updatedItem = { 
                  ...mockStorage.timezoneLinks[linkIndex], 
                  ...updates, 
                  updated_at: new Date().toISOString() 
                };
                mockStorage.timezoneLinks[linkIndex] = updatedItem;
              }
              break;
            case 'user_preferences':
              const pref = Object.values(mockStorage.userPreferences).find((p: any) => p[column] === value);
              if (pref) {
                updatedItem = { ...pref, ...updates, updated_at: new Date().toISOString() };
                mockStorage.userPreferences[updatedItem.user_id] = updatedItem;
              }
              break;
          }
          
          return { data: updatedItem, error: null };
        }
      }),
      
      // Add support for update without select
      then: async (callback: any) => {
        switch (tableName) {
          case 'timezone_links':
            const linkIndex = mockStorage.timezoneLinks.findIndex((l: any) => l[column] === value);
            if (linkIndex !== -1) {
              mockStorage.timezoneLinks[linkIndex] = { 
                ...mockStorage.timezoneLinks[linkIndex], 
                ...updates, 
                updated_at: new Date().toISOString() 
              };
            }
            break;
          case 'user_notifications':
            mockStorage.notifications = mockStorage.notifications.map((n: any) => 
              n[column] === value ? { ...n, ...updates } : n
            );
            break;
        }
        
        return callback({ error: null });
      }
    }),
    
    // Add missing method for raw SQL updates
    raw: (sql: string) => ({
      eq: (column: string, value: any) => ({
        then: async (callback: any) => {
          // Handle raw SQL updates like incrementing counters
          if (tableName === 'user_profiles' && sql.includes('links_created_this_month')) {
            const profile = Object.values(mockStorage.userProfiles).find((p: any) => p[column] === value);
            if (profile) {
              const updatedProfile = { 
                ...profile, 
                links_created_this_month: (profile.links_created_this_month || 0) + 1,
                updated_at: new Date().toISOString() 
              };
              mockStorage.userProfiles[updatedProfile.id] = updatedProfile;
            }
          }
          return callback({ error: null });
        }
      })
    })
  }),
  
  insert: (data: any) => ({
    select: () => ({
      single: async () => {
        const newItem = {
          id: `${tableName}-${Date.now()}`,
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        switch (tableName) {
          case 'user_profiles':
            mockStorage.userProfiles[newItem.id] = newItem;
            break;
          case 'timezone_links':
            mockStorage.timezoneLinks.push(newItem);
            break;
          case 'link_analytics':
            mockStorage.linkAnalytics.push(newItem);
            break;
          case 'user_notifications':
  delete: () => ({
    eq: (column: string, value: any) => ({
      then: async (callback: any) => {
        switch (tableName) {
          case 'timezone_links':
            mockStorage.timezoneLinks = mockStorage.timezoneLinks.filter((l: any) => l[column] !== value);
            break;
          case 'user_notifications':
            mockStorage.notifications = mockStorage.notifications.filter((n: any) => n[column] !== value);
            break;
        }
        
        return callback({ error: null });
      }
    })
  }),
  
  upsert: (data: any) => ({
    select: () => ({
      single: async () => {
        // For upsert, check if record exists first
        let existingItem;
        
        switch (tableName) {
          case 'user_preferences':
            existingItem = Object.values(mockStorage.userPreferences).find((p: any) => p.user_id === data.user_id);
            if (existingItem) {
              const updatedItem = { ...existingItem, ...data, updated_at: new Date().toISOString() };
              mockStorage.userPreferences[data.user_id] = updatedItem;
              return { data: updatedItem, error: null };
            } else {
              const newItem = {
                id: `${tableName}-${Date.now()}`,
                ...data,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
              mockStorage.userPreferences[data.user_id] = newItem;
              return { data: newItem, error: null };
            }
          default:
            // Fallback to insert
            const newItem = {
              id: `${tableName}-${Date.now()}`,
              ...data,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            switch (tableName) {
              case 'user_profiles':
                mockStorage.userProfiles[newItem.id] = newItem;
                break;
              case 'timezone_links':
                mockStorage.timezoneLinks.push(newItem);
                break;
              case 'link_analytics':
                mockStorage.linkAnalytics.push(newItem);
                break;
              case 'user_notifications':
                mockStorage.notifications.push(newItem);
                break;
              case 'support_tickets':
                mockStorage.supportTickets.push(newItem);
                break;
              case 'user_feedback':
                mockStorage.userFeedback.push(newItem);
                break;
              case 'user_activity_log':
                mockStorage.activityLog.push(newItem);
                break;
            }
            
            return { data: newItem, error: null };
        }
        
        switch (tableName) {
          case 'user_preferences':
            existingItem = Object.values(mockStorage.userPreferences).find((p: any) => p.user_id === data.user_id);
            if (existingItem) {
              const updatedItem = { ...existingItem, ...data, updated_at: new Date().toISOString() };
              mockStorage.userPreferences[data.user_id] = updatedItem;
              return { data: updatedItem, error: null };
            } else {
              const newItem = {
                id: `${tableName}-${Date.now()}`,
                ...data,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
              mockStorage.userPreferences[data.user_id] = newItem;
              return { data: newItem, error: null };
            }
          default:
            // Fallback to insert
            return this.insert(data).select().single();
        }
      }
    })
  })
});

// Helper functions for mock queries
const createMockQuery = (tableName: string, filters: Record<string, any>) => ({
  single: async () => {
    let data;
    
    switch (tableName) {
      case 'user_profiles':
        data = Object.values(mockStorage.userProfiles).find((p: any) => {
          return Object.entries(filters).every(([key, value]) => {
            if (key.endsWith('_neq')) {
              const field = key.replace('_neq', '');
              return p[field] !== value;
            }
            return p[key] === value;
          });
        });
        break;
      case 'timezone_links':
        data = mockStorage.timezoneLinks.find((l: any) => {
          return Object.entries(filters).every(([key, value]) => l[key] === value);
        });
        break;
      default:
        data = null;
    }
    
    return { data, error: null };
  },
  
  maybeSingle: async () => {
    const result = await this.single();
    return result;
  },
  
  // Add support for chaining with other methods
  order: (column: string, options: any = {}) => createMockOrderedQuery(tableName, column, options),
  limit: (count: number) => createMockLimitedQuery(tableName, count)
});

const createMockOrderedQuery = (tableName: string, column: string, options: any) => ({
  limit: (count: number) => ({
    then: async (callback: any) => {
      let data;
      
      switch (tableName) {
        case 'timezone_links':
          data = [...mockStorage.timezoneLinks]
            .sort((a: any, b: any) => {
              const aVal = new Date(a[column]).getTime();
              const bVal = new Date(b[column]).getTime();
              return options.ascending ? aVal - bVal : bVal - aVal;
            })
            .slice(0, count);
          break;
        case 'user_notifications':
          data = [...mockStorage.notifications]
            .sort((a: any, b: any) => {
              const aVal = new Date(a[column]).getTime();
              const bVal = new Date(b[column]).getTime();
              return options.ascending ? aVal - bVal : bVal - aVal;
            })
            .slice(0, count);
          break;
        default:
          data = [];
      }
      
      return callback({ data, error: null });
    }
  })
});

const createMockLimitedQuery = (tableName: string, count: number) => ({
  then: async (callback: any) => {
    let data;
    
    switch (tableName) {
      case 'timezone_links':
        data = mockStorage.timezoneLinks.slice(0, count);
        break;
      case 'user_notifications':
        data = mockStorage.notifications.slice(0, count);
        break;
      default:
        data = [];
    }
    
    return callback({ data, error: null });
  }
});
// Mock storage methods
const mockStorage_api = {
  from: (bucket: string) => ({
    upload: async (path: string, file: File, options: any = {}) => {
      // Mock file upload - return a fake URL
      const fakeUrl = `https://mock-storage.supabase.co/storage/v1/object/public/${bucket}/${path}`;
      return { data: { path }, error: null };
    },
    
    getPublicUrl: (path: string) => ({
      data: { publicUrl: `https://mock-storage.supabase.co/storage/v1/object/public/${path}` }
    }),
    
    remove: async (paths: string[]) => ({
      data: paths,
      error: null
    })
  })
};

// Mock channel methods
const mockChannel = (channelName: string) => ({
  on: (type: string, config: any, callback: any) => mockChannel(channelName),
  send: async (message: any) => ({ error: null }),
  subscribe: () => ({ error: null }),
  unsubscribe: () => ({ error: null })
});

// Create mock Supabase client
export const createMockSupabaseClient = () => ({
  auth: mockAuth,
  
  from: (tableName: string) => createMockTable(tableName),
  
  storage: mockStorage_api,
  
  channel: mockChannel,
  
  removeChannel: (channel: any) => {},
  
  raw: (sql: string) => sql, // For raw SQL queries
  
  // Mock realtime subscriptions
  realtime: {
    channel: mockChannel,
    removeChannel: () => {}
  },
  
  // Add count functionality
  count: async () => ({ count: 0, error: null })
});

// Export mock analytics data generator
export { generateMockAnalyticsData };