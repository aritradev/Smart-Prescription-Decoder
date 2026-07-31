import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (
    !supabaseUrl ||
    supabaseUrl.includes('your-project') ||
    !supabaseAnonKey ||
    supabaseAnonKey.includes('your_supabase')
  ) {
    // Fallback stub for development/demo mode when env vars are not configured
    console.warn('[Supabase] Client not initialized — missing or placeholder env vars. Running in mock/guest mode.');
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
