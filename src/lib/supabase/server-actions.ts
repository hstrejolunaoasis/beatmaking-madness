'use server';

import { cookies } from 'next/headers';
import { createClient } from './server';

// Safe to use in Server Components and Server Actions
export async function getServerClient() {
  const cookieStore = await cookies();
  return await createClient(cookieStore);
}

export async function getCurrentUser() {
  const supabase = await getServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: { user } } = await supabase.auth.getUser();
  return user;
} 