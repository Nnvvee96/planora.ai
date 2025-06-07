// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _vercel (Vercel internals)
     * - assets (your static assets)
     * - images (your static assets)
     * - js (your static assets)
     * - css (your static assets)
     * - media (your static assets)
     * - fonts (your static assets)
     * - favicon.ico (favicon file)
     * - site.webmanifest
     * - robots.txt
     * - sitemap.xml
     * - sw.js
     * - workbox-*.js (service worker files)
     *
     * This ensures that only actual page requests are subject to auth.
     */
    '/((?!api|_next/static|_vercel|assets|images|js|css|media|fonts|favicon.ico|site.webmanifest|robots.txt|sitemap.xml|sw.js|workbox-.*\\.js).*)',
  ],
};

export function middleware(request: NextRequest) {
  console.log(`[EDGE MIDDLEWARE INVOKED] - Path: ${request.nextUrl.pathname}`);

  const basicAuthUser = process.env.BASIC_AUTH_USER;
  const basicAuthPassword = process.env.BASIC_AUTH_PASSWORD;

  if (!basicAuthUser || !basicAuthPassword) {
    console.error('[EDGE MIDDLEWARE ERROR] - Basic auth credentials not set in env.');
    // Return a 500 for misconfiguration, but don't reveal details.
    // Or, for a "fail-open" approach during setup, you could allow access:
    // return NextResponse.next();
    return new NextResponse('Authentication configuration error on server.', {
      status: 500,
    });
  }

  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    console.log('[EDGE MIDDLEWARE] - No auth header, prompting.');
    return new NextResponse('Authentication required.', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
    });
  }

  try {
    // Browsers send 'Basic base64string'
    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString();
    const [user, pwd] = auth.split(':');

    if (user === basicAuthUser && pwd === basicAuthPassword) {
      console.log('[EDGE MIDDLEWARE] - Auth successful.');
      return NextResponse.next(); // Proceed to the requested page
    } else {
      console.warn('[EDGE MIDDLEWARE] - Invalid credentials.');
      return new NextResponse('Invalid credentials.', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
      });
    }
  } catch (error) {
    console.error('[EDGE MIDDLEWARE ERROR] - Error processing auth header:', error);
    return new NextResponse('Authentication error.', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
    });
  }
}
