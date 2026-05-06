// Supabase client initialization
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to get user ID from session
export function getUserId() {
  // For now, we'll use a fixed user ID since this is a single-user app
  // In production, this could be derived from the password hash or a session token
  return 'selfdesk_user_1';
}

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
