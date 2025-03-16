import { supabase } from '@/lib/supabase';
import { getCurrentUser as getUser } from '@/lib/supabase/server-actions';

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
    throw new Error(error.message);
  }

  return data;
}

export async function signUpWithEmail(credentials: SignUpCredentials) {
  const { data, error } = await supabase.auth.signUp({
    email: credentials.email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: {
        name: credentials.name,
      }
    },
  });

  if (error) {
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
export const getCurrentUser = getUser; 