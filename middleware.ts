// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  console.log('[MINIMAL EDGE MIDDLEWARE INVOKED] - Path:', request.nextUrl.pathname);
  return NextResponse.next();
}
