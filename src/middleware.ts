import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Check if dev mode is enabled
  const devMode = process.env.DEV_MODE === 'true' || process.env.NEXT_PUBLIC_DEV_MODE === 'true';
  
  // If dev mode is enabled and includes a dev-session query param for dashboard access, 
  // allow access without authentication
  if (devMode && request.nextUrl.pathname.startsWith('/dashboard') && 
      (request.nextUrl.searchParams.has('dev-session'))) {
    return NextResponse.next();
  }
  
  // In dev mode, check for dev-mode cookie passed from client
  if (devMode && request.nextUrl.pathname.startsWith('/dashboard') && 
      request.cookies.has('dev-mode')) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // This is needed for production deployments
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          // This is needed for production deployments
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If dev mode is enabled, bypass authentication checks
  if (devMode) {
    // Set the dev session cookie if it's in the URL
    if (request.nextUrl.searchParams.has('dev-session')) {
      response.cookies.set({
        name: 'dev-session',
        value: 'true',
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
        sameSite: 'lax',
      });
    }
    return response;
  }

  // If the user is not signed in and trying to access the dashboard, redirect to sign-in
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    const redirectUrl = new URL('/sign-in', request.url);
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If the user is already signed in and trying to access the auth pages, redirect to dashboard
  if (session && (request.nextUrl.pathname.startsWith('/sign-in') || request.nextUrl.pathname.startsWith('/sign-up'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 