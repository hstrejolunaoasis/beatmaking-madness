import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';

export async function createClient(cookieStore: {
  get: (name: string) => { value: string } | undefined | Promise<{ value: string } | undefined>;
  set: (params: { name: string; value: string; options?: CookieOptions }) => void;
}) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookie = await cookieStore.get(name);
          return cookie?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', options });
        },
      },
    }
  );
} 