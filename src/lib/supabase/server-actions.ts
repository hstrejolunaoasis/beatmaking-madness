'use server';

import { cookies } from 'next/headers';
import { createClient } from './server';
import type { CookieOptions } from '@supabase/ssr';

// Safe to use in Server Components and Server Actions
export async function getServerClient() {
  return createClient(cookies());
}

// Mock user for development
const mockUser = {
  id: 'dev-user-id',
  email: 'dev@example.com',
  user_metadata: {
    name: 'Development User',
    avatar_url: 'https://ui-avatars.com/api/?name=Dev+User',
  },
  app_metadata: {
    role: 'admin',
  },
  created_at: new Date().toISOString(),
};

export async function getCurrentUser() {
  // Check if dev mode is enabled and has a dev session cookie
  // This functionality is now primarily handled in middleware
  const supabase = await getServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: { user } } = await supabase.auth.getUser();
  return user;
} 