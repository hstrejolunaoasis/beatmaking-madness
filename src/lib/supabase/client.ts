import { createBrowserClient } from '@supabase/ssr';

export const createClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable");
  }
  
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce', // Use PKCE flow for better security
        persistSession: true,
        detectSessionInUrl: true,
      },
    }
  );
};

export const supabase = createClient(); 