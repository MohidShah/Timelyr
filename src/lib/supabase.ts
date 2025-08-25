import { createClient } from '@supabase/supabase-js';
import { mockSupabase } from './mockSupabase';

// Check if we should use mock database
const useMockDb = import.meta.env.VITE_USE_MOCK_DB === 'true';

// Get Supabase environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create and export the Supabase client
export const supabase = useMockDb || !supabaseUrl || !supabaseAnonKey
  ? mockSupabase
  : createClient(supabaseUrl, supabaseAnonKey);

// Re-export types for convenience
export type { Session, User } from '@supabase/supabase-js';