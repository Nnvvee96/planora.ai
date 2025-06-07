// middleware.ts

export const config = {
  matcher: '/(.*)', // Match all paths for diagnostics
};

export function middleware(request: Request) {
  console.log(`[EDGE MIDDLEWARE INVOKED] - Path: ${new URL(request.url).pathname}`);

  const basicAuthUser = process.env.BASIC_AUTH_USER;
  const basicAuthPassword = process.env.BASIC_AUTH_PASSWORD;

  if (!basicAuthUser || !basicAuthPassword) {
    console.error('[EDGE MIDDLEWARE ERROR] - Basic auth credentials not set in env.');
    // Return a 500 for misconfiguration, but don't reveal details.
    // Or, for a "fail-open" approach during setup, you could allow access:
    // return NextResponse.next();
    return new Response('Authentication configuration error on server.', {
      status: 500,
    });
  }

  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    console.log('[EDGE MIDDLEWARE] - No auth header, prompting.');
    return new Response('Authentication required.', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
    });
  }

  try {
    // Browsers send 'Basic base64string'
    const auth = atob(authHeader.split(' ')[1]);
    const [user, pwd] = auth.split(':');

    if (user === basicAuthUser && pwd === basicAuthPassword) {
      console.log('[EDGE MIDDLEWARE] - Auth successful.');
      return; // Allow request to pass through by returning undefined
    } else {
      console.warn('[EDGE MIDDLEWARE] - Invalid credentials.');
      return new Response('Invalid credentials.', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
      });
    }
  } catch (error) {
    console.error('[EDGE MIDDLEWARE ERROR] - Error processing auth header:', error);
    return new Response('Authentication error.', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
    });
  }
}
