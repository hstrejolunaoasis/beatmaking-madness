import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  // Only allow in development mode
  if (process.env.DEV_MODE !== 'true' && process.env.NEXT_PUBLIC_DEV_MODE !== 'true') {
    return NextResponse.json(
      { error: 'Dev mode not enabled on this environment' },
      { status: 403 }
    );
  }

  // Remove the dev session cookie in the response
  const response = NextResponse.json({ success: true });
  
  response.cookies.set({
    name: 'dev-session',
    value: '',
    path: '/',
    maxAge: 0,
  });

  return response;
} 