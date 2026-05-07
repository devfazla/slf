// Supabase client initialization
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Single Supabase client - handles auth session automatically
// When user signs in via supabase.auth.signInWithPassword(), the client
// automatically includes the JWT in all requests. RLS policies using auth.uid() just work.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Database table names
export const TABLES = {
  APP_SETTINGS: 'app_settings',
  NOTES: 'notes',
  FOLDERS: 'folders',
  FILES: 'files',
  THEME_PRESETS: 'theme_presets',
  MESSAGE_METADATA: 'message_metadata'
};

// Helper function to handle Supabase errors
export function handleSupabaseError(error) {
  console.error('Supabase error:', error);
  return error.message || 'An unknown error occurred';
}
