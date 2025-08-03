import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// For client-side usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For client components
export function createClientSupabase() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}