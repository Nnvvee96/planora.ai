// middleware.ts

// Attempt to read environment variables
const BASIC_AUTH_USER_FROM_ENV = process.env.BASIC_AUTH_USER;
const BASIC_AUTH_PASSWORD_FROM_ENV = process.env.BASIC_AUTH_PASSWORD;

// Explicitly export a config object
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     *
     * This is a common matcher pattern. We can adjust if needed,
     * but for now, the goal is to get ANY logs from the middleware.
     * If this works, we can make it simpler like '/(.*)'
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export async function middleware(request: Request) {
  const url = new URL(request.url);

  // Explicitly log the values (and types) of the env vars as seen by the middleware
  console.log(`[AUTH DEBUG V2 - MATCHER] BASIC_AUTH_USER_FROM_ENV: "${BASIC_AUTH_USER_FROM_ENV}" (Type: ${typeof BASIC_AUTH_USER_FROM_ENV})`);
  console.log(`[AUTH DEBUG V2 - MATCHER] BASIC_AUTH_PASSWORD_FROM_ENV: "${BASIC_AUTH_PASSWORD_FROM_ENV}" (Type: ${typeof BASIC_AUTH_PASSWORD_FROM_ENV})`);

  // Check if the environment variables were actually loaded
  if (!BASIC_AUTH_USER_FROM_ENV || !BASIC_AUTH_PASSWORD_FROM_ENV) {
    console.error(
      'CRITICAL V2: Basic Auth credentials NOT PROPERLY SET or ACCESSIBLE in environment. Denying access.'
    );
    return new Response('Internal Server Error: Auth Configuration Issue V2', { status: 500 });
  }

  const authorizationHeader = request.headers.get('authorization');
  console.log(`[AUTH DEBUG V2 - MATCHER] Path: ${url.pathname}, Authorization Header: "${authorizationHeader}"`);

  if (authorizationHeader) {
    const authValue = authorizationHeader.split(' ')[1];
    if (authValue) {
      try {
        const decodedCredentials = atob(authValue);
        const [user, password] = decodedCredentials.split(':');
        console.log(`[AUTH DEBUG V2 - MATCHER] Decoded User: "${user}", Decoded Pass: "${password ? '***' : 'EMPTY'}"`);

        if (user === BASIC_AUTH_USER_FROM_ENV && password === BASIC_AUTH_PASSWORD_FROM_ENV) {
          console.log('[AUTH DEBUG V2 - MATCHER] Access GRANTED for path:', url.pathname);
          return undefined; 
        } else {
          console.log('[AUTH DEBUG V2 - MATCHER] Credentials MISMATCH.');
        }
      } catch (e) {
        console.error('[AUTH DEBUG V2 - MATCHER] Error processing credentials:', e);
      }
    } else {
      console.log('[AUTH DEBUG V2 - MATCHER] Authorization header present but auth value is empty after split.');
    }
  } else {
    console.log('[AUTH DEBUG V2 - MATCHER] No Authorization Header found. Expecting to send 401.');
  }

  console.log('[AUTH DEBUG V2 - MATCHER] Access DENIED, attempting to send 401 for path:', url.pathname);
  return new Response('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area - Debugging V3 - Matcher"', 
    },
  });
}

