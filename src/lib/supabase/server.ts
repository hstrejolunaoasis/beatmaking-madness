import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import { cookies as nextCookies } from 'next/headers';

export function createClient(cookieStore: any) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          // In Next.js 15, cookies() returns a Promise
          const cookies = typeof cookieStore.get === 'function' 
            ? cookieStore 
            : nextCookies();
            
          const cookie = cookies.get(name);
          return cookie?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          const cookies = typeof cookieStore.set === 'function' 
            ? cookieStore 
            : nextCookies();
            
          cookies.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          const cookies = typeof cookieStore.set === 'function' 
            ? cookieStore 
            : nextCookies();
            
          cookies.set(name, '', { ...options, maxAge: 0 });
        },
      },
    }
  );
} 