import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  // Only allow in development mode
  if (process.env.DEV_MODE !== 'true' && process.env.NEXT_PUBLIC_DEV_MODE !== 'true') {
    return NextResponse.json(
      { error: 'Dev mode not enabled on this environment' },
      { status: 403 }
    );
  }

  // In Next.js 15, we need to check cookie existence using a different approach
  const response = NextResponse.json({ active: false });
  
  // Use request cookies header instead
  const requestHeaders = new Headers();
  const cookie = requestHeaders.get('cookie');
  const active = cookie?.includes('dev-session=true') ?? false;
  
  return NextResponse.json({ active });
} 