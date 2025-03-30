import { supabase } from '@/lib/supabase/client';
import { createClient } from '@/lib/supabase/server';

export interface SignInCredentials {
  email: string;
}

export interface SignUpCredentials {
  email: string;
  name: string;
}

export async function signInWithEmail(credentials: SignInCredentials) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email: credentials.email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    console.error("Auth error:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function signUpWithEmail(credentials: SignUpCredentials) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email: credentials.email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: {
        name: credentials.name,
      }
    },
  });

  if (error) {
    console.error("Sign up error:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

// Re-export the getCurrentUser function from server-actions
export { getCurrentUser } from '@/lib/supabase/server-actions'; 