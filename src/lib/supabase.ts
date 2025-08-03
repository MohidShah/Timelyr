import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      timezone_links: {
        Row: {
          id: string;
          created_at: string;
          user_id: string | null;
          title: string;
          description: string | null;
          scheduled_time: string;
          timezone: string;
          slug: string;
          expires_at: string | null;
          view_count: number;
          is_active: boolean;
        };
        Insert: Omit<Database['public']['Tables']['timezone_links']['Row'], 'id' | 'created_at' | 'view_count'>;
        Update: Partial<Database['public']['Tables']['timezone_links']['Insert']>;
      };
      profiles: {
        Row: {
          id: string;
          created_at: string;
          email: string;
          full_name: string | null;
          username: string | null;
          avatar_url: string | null;
          plan: 'starter' | 'pro';
          links_created_this_month: number;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'links_created_this_month'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
    };
  };
};