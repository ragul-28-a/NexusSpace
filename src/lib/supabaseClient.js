import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabasePublishableKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isLiveSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabasePublishableKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project-id')
);

export const supabase = isLiveSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null;

if (typeof window !== 'undefined') {
  [
    'nexus_profiles',
    'nexus_projects',
    'nexus_tasks',
    'nexus_files',
    'nexus_credentials',
    'nexus_user'
  ].forEach((key) => window.localStorage.removeItem(key));
}
