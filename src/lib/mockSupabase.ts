// Mock Supabase client for testing without a real database connection
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
  mockCurrentUser,
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
  currentUser: mockCurrentUser,
  currentSession: {
    user: mockCurrentUser,
    access_token: 'mock-token',
    refresh_token: 'mock-refresh-token'
  }
};

// Helper function to simulate async operations
const delay = (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to generate IDs
const generateId = () => `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Mock query builder
class MockQueryBuilder {
  private tableName: string;
  private filters: any[] = [];
  private selectFields = '*';
  private orderBy: { column: string; ascending: boolean } | null = null;
  private limitCount: number | null = null;
  private single = false;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(fields = '*') {
    this.selectFields = fields;
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ type: 'eq', column, value });
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push({ type: 'neq', column, value });
    return this;
  }

  in(column: string, values: any[]) {
    this.filters.push({ type: 'in', column, values });
    return this;
  }

  gte(column: string, value: any) {
    this.filters.push({ type: 'gte', column, value });
    return this;
  }

  order(column: string, options: { ascending?: boolean } = {}) {
    this.orderBy = { column, ascending: options.ascending !== false };
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  maybeSingle() {
    this.single = true;
    return this;
  }

  async execute() {
    await delay();

    let data: any[] = [];

    // Get data from mock storage
    switch (this.tableName) {
      case 'user_profiles':
        data = Object.values(mockStorage.userProfiles);
        break;
      case 'timezone_links':
        data = mockStorage.timezoneLinks;
        break;
      case 'link_analytics':
        data = mockStorage.linkAnalytics;
        break;
      case 'user_notifications':
        data = mockStorage.notifications;
        break;
      case 'user_preferences':
        data = Object.values(mockStorage.userPreferences);
        break;
      case 'support_tickets':
        data = mockStorage.supportTickets;
        break;
      case 'user_feedback':
        data = mockStorage.userFeedback;
        break;
      case 'user_activity_log':
        data = mockStorage.activityLog;
        break;
      default:
        data = [];
    }

    // Apply filters
    data = data.filter(item => {
      return this.filters.every(filter => {
        const value = item[filter.column];
        switch (filter.type) {
          case 'eq':
            return value === filter.value;
          case 'neq':
            return value !== filter.value;
          case 'in':
            return filter.values.includes(value);
          case 'gte':
            return new Date(value) >= new Date(filter.value);
          default:
            return true;
        }
      });
    });

    // Apply ordering
    if (this.orderBy) {
      data.sort((a, b) => {
        const aVal = a[this.orderBy!.column];
        const bVal = b[this.orderBy!.column];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return this.orderBy!.ascending ? comparison : -comparison;
      });
    }

    // Apply limit
    if (this.limitCount) {
      data = data.slice(0, this.limitCount);
    }

    // Return single item if requested
    if (this.single) {
      return { data: data[0] || null, error: null };
    }

    return { data, error: null };
  }

  // Alias for execute to match Supabase API
  then(onResolve: any, onReject?: any) {
    return this.execute().then(onResolve, onReject);
  }
}

// Mock insert builder
class MockInsertBuilder {
  private tableName: string;
  private insertData: any;

  constructor(tableName: string, data: any) {
    this.tableName = tableName;
    this.insertData = data;
  }

  select(fields = '*') {
    return this;
  }

  single() {
    return this;
  }

  async execute() {
    await delay();

    const newItem = {
      ...this.insertData,
      id: this.insertData.id || generateId(),
      created_at: this.insertData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Add to mock storage
    switch (this.tableName) {
      case 'user_profiles':
        mockStorage.userProfiles[newItem.id] = newItem;
        break;
      case 'timezone_links':
        mockStorage.timezoneLinks.push(newItem);
        break;
      case 'link_analytics':
        mockStorage.linkAnalytics.push(newItem);
        // Increment view count
        const link = mockStorage.timezoneLinks.find(l => l.id === newItem.link_id);
        if (link) {
          link.view_count += 1;
        }
        break;
      case 'user_notifications':
        mockStorage.notifications.push(newItem);
        break;
      case 'user_preferences':
        mockStorage.userPreferences[newItem.user_id] = newItem;
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

  then(onResolve: any, onReject?: any) {
    return this.execute().then(onResolve, onReject);
  }
}

// Mock update builder
class MockUpdateBuilder {
  private tableName: string;
  private updateData: any;
  private filters: any[] = [];

  constructor(tableName: string, data: any) {
    this.tableName = tableName;
    this.updateData = data;
  }

  eq(column: string, value: any) {
    this.filters.push({ type: 'eq', column, value });
    return this;
  }

  select(fields = '*') {
    return this;
  }

  single() {
    return this;
  }

  async execute() {
    await delay();

    let updatedItem = null;

    // Update in mock storage
    switch (this.tableName) {
      case 'user_profiles':
        const profileId = this.filters.find(f => f.column === 'id')?.value;
        if (profileId && mockStorage.userProfiles[profileId]) {
          mockStorage.userProfiles[profileId] = {
            ...mockStorage.userProfiles[profileId],
            ...this.updateData,
            updated_at: new Date().toISOString()
          };
          updatedItem = mockStorage.userProfiles[profileId];
        }
        break;
      case 'timezone_links':
        const linkIndex = mockStorage.timezoneLinks.findIndex(item =>
          this.filters.every(filter => item[filter.column] === filter.value)
        );
        if (linkIndex !== -1) {
          mockStorage.timezoneLinks[linkIndex] = {
            ...mockStorage.timezoneLinks[linkIndex],
            ...this.updateData,
            updated_at: new Date().toISOString()
          };
          updatedItem = mockStorage.timezoneLinks[linkIndex];
        }
        break;
      case 'user_notifications':
        const notifIndex = mockStorage.notifications.findIndex(item =>
          this.filters.every(filter => item[filter.column] === filter.value)
        );
        if (notifIndex !== -1) {
          mockStorage.notifications[notifIndex] = {
            ...mockStorage.notifications[notifIndex],
            ...this.updateData
          };
          updatedItem = mockStorage.notifications[notifIndex];
        }
        break;
      case 'user_preferences':
        const userId = this.filters.find(f => f.column === 'user_id')?.value;
        if (userId && mockStorage.userPreferences[userId]) {
          mockStorage.userPreferences[userId] = {
            ...mockStorage.userPreferences[userId],
            ...this.updateData,
            updated_at: new Date().toISOString()
          };
          updatedItem = mockStorage.userPreferences[userId];
        }
        break;
    }

    return { data: updatedItem, error: null };
  }

  then(onResolve: any, onReject?: any) {
    return this.execute().then(onResolve, onReject);
  }
}

// Mock delete builder
class MockDeleteBuilder {
  private tableName: string;
  private filters: any[] = [];

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  eq(column: string, value: any) {
    this.filters.push({ type: 'eq', column, value });
    return this;
  }

  async execute() {
    await delay();

    // Delete from mock storage
    switch (this.tableName) {
      case 'timezone_links':
        const linkIndex = mockStorage.timezoneLinks.findIndex(item =>
          this.filters.every(filter => item[filter.column] === filter.value)
        );
        if (linkIndex !== -1) {
          mockStorage.timezoneLinks.splice(linkIndex, 1);
        }
        break;
      case 'user_notifications':
        const notifIndex = mockStorage.notifications.findIndex(item =>
          this.filters.every(filter => item[filter.column] === filter.value)
        );
        if (notifIndex !== -1) {
          mockStorage.notifications.splice(notifIndex, 1);
        }
        break;
    }

    return { error: null };
  }

  then(onResolve: any, onReject?: any) {
    return this.execute().then(onResolve, onReject);
  }
}

// Mock Supabase client
export const createMockSupabaseClient = () => ({
  auth: {
    getSession: async () => ({
      data: { session: mockStorage.currentSession },
      error: null
    }),
    
    getUser: async () => ({
      data: { user: mockStorage.currentUser },
      error: null
    }),
    
    onAuthStateChange: (callback: any) => {
      // Simulate auth state change
      setTimeout(() => {
        callback('SIGNED_IN', mockStorage.currentSession);
      }, 100);
      
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      };
    },
    
    signUp: async (credentials: any) => {
      await delay();
      const newUser = {
        id: generateId(),
        email: credentials.email,
        user_metadata: credentials.options?.data || {}
      };
      
      mockStorage.users[newUser.id] = newUser;
      mockStorage.currentUser = newUser;
      mockStorage.currentSession = {
        user: newUser,
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token'
      };
      
      return { data: { user: newUser }, error: null };
    },
    
    signInWithPassword: async (credentials: any) => {
      await delay();
      // For demo purposes, always allow login with any email/password
      let user = Object.values(mockStorage.users).find(u => u.email === credentials.email);
      
      // If user doesn't exist, create a new one for demo
      if (!user) {
        user = {
          id: generateId(),
          email: credentials.email,
          user_metadata: {
            full_name: credentials.email.split('@')[0]
          }
        };
        mockStorage.users[user.id] = user;
        
        // Create a basic profile for the new user
        mockStorage.userProfiles[user.id] = {
          id: user.id,
          username: null,
          display_name: user.user_metadata.full_name,
          email: user.email,
          avatar_url: null,
          bio: null,
          phone: null,
          company: null,
          job_title: null,
          website: null,
          location: null,
          default_timezone: 'UTC',
          date_format: 'MM/DD/YYYY',
          time_format: '12h',
          business_hours_start: '09:00:00',
          business_hours_end: '17:00:00',
          email_notifications: true,
          profile_visibility: 'public' as const,
          plan: 'starter' as const,
          links_created_this_month: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      
      mockStorage.currentUser = user;
      mockStorage.currentSession = {
        user,
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token'
      };
      
      return { data: { user }, error: null };
    },
    
    signOut: async () => {
      await delay();
      mockStorage.currentUser = null;
      mockStorage.currentSession = null;
      return { error: null };
    }
  },
  
  from: (tableName: string) => ({
    select: (fields?: string) => new MockQueryBuilder(tableName).select(fields),
    insert: (data: any) => new MockInsertBuilder(tableName, data),
    update: (data: any) => new MockUpdateBuilder(tableName, data),
    delete: () => new MockDeleteBuilder(tableName),
    upsert: (data: any) => new MockInsertBuilder(tableName, data)
  }),
  
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => {
        await delay();
        // Simulate file upload
        const mockUrl = `https://mock-storage.supabase.co/${bucket}/${path}`;
        return { data: { path }, error: null };
      },
      
      getPublicUrl: (path: string) => ({
        data: { publicUrl: `https://mock-storage.supabase.co/${path}` }
      }),
      
      remove: async (paths: string[]) => {
        await delay();
        return { error: null };
      }
    })
  },
  
  channel: (name: string) => ({
    on: (event: string, options: any, callback: any) => ({
      subscribe: () => {}
    }),
    send: async (options: any) => {
      await delay();
      return { error: null };
    }
  }),
  
  removeChannel: (channel: any) => {},
  
  raw: (sql: string) => sql
});

// Export mock analytics data generator
export { generateMockAnalyticsData };