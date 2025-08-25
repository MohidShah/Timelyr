// Mock Supabase client for development and testing
export const mockSupabase = {
  auth: {
    signUp: async (credentials: { email: string; password: string }) => {
      console.log('Mock signUp:', credentials.email);
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
    
    signIn: async (credentials: { email: string; password: string }) => {
      console.log('Mock signIn:', credentials.email);
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
    }
  },
  
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        single: () => Promise.resolve({
          data: null,
          error: null
        })
      }),
      order: (column: string, options?: { ascending?: boolean }) => 
        Promise.resolve({
          data: [],
          error: null
        })
    }),
    
    insert: (data: any) => Promise.resolve({
      data: { ...data, id: Math.random().toString(36) },
      error: null
    }),
    
    update: (data: any) => ({
      eq: (column: string, value: any) => Promise.resolve({
        data: { ...data },
        error: null
      })
    }),
    
    delete: () => ({
      eq: (column: string, value: any) => Promise.resolve({
        data: null,
        error: null
      })
    })
  })
};

export const createMockSupabaseClient = () => mockSupabase;

export default mockSupabase;