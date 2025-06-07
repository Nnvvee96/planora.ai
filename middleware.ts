// middleware.ts

// Attempt to read environment variables
const BASIC_AUTH_USER_FROM_ENV = process.env.BASIC_AUTH_USER;
const BASIC_AUTH_PASSWORD_FROM_ENV = process.env.BASIC_AUTH_PASSWORD;

// Explicitly export a config object with the broadest matcher
export const config = {
  matcher: '/(.*)', // Match ALL paths. If this doesn't log, the middleware isn't running.
};

export async function middleware(request: Request) {
  const url = new URL(request.url);

  // Updated log prefixes
  console.log(`[AUTH DEBUG V3 - BROAD MATCHER] Invoked for path: ${url.pathname}`);
  console.log(`[AUTH DEBUG V3 - BROAD MATCHER] BASIC_AUTH_USER_FROM_ENV: "${BASIC_AUTH_USER_FROM_ENV}" (Type: ${typeof BASIC_AUTH_USER_FROM_ENV})`);
  console.log(`[AUTH DEBUG V3 - BROAD MATCHER] BASIC_AUTH_PASSWORD_FROM_ENV: "${BASIC_AUTH_PASSWORD_FROM_ENV}" (Type: ${typeof BASIC_AUTH_PASSWORD_FROM_ENV})`);

  if (!BASIC_AUTH_USER_FROM_ENV || !BASIC_AUTH_PASSWORD_FROM_ENV) {
    console.error(
      'CRITICAL V3: Basic Auth credentials NOT PROPERLY SET or ACCESSIBLE in environment. Denying access.'
    );
    return new Response('Internal Server Error: Auth Configuration Issue V3', { status: 500 });
  }

  const authorizationHeader = request.headers.get('authorization');
  console.log(`[AUTH DEBUG V3 - BROAD MATCHER] Authorization Header: "${authorizationHeader}"`);

  if (authorizationHeader) {
    const authValue = authorizationHeader.split(' ')[1];
    if (authValue) {
      try {
        const decodedCredentials = atob(authValue);
        const [user, password] = decodedCredentials.split(':');
        console.log(`[AUTH DEBUG V3 - BROAD MATCHER] Decoded User: "${user}", Decoded Pass: "${password ? '***' : 'EMPTY'}"`);

        if (user === BASIC_AUTH_USER_FROM_ENV && password === BASIC_AUTH_PASSWORD_FROM_ENV) {
          console.log('[AUTH DEBUG V3 - BROAD MATCHER] Access GRANTED for path:', url.pathname);
          return undefined; 
        } else {
          console.log('[AUTH DEBUG V3 - BROAD MATCHER] Credentials MISMATCH.');
        }
      } catch (e) {
        console.error('[AUTH DEBUG V3 - BROAD MATCHER] Error processing credentials:', e);
      }
    } else {
      console.log('[AUTH DEBUG V3 - BROAD MATCHER] Authorization header present but auth value is empty after split.');
    }
  } else {
    console.log('[AUTH DEBUG V3 - BROAD MATCHER] No Authorization Header found. Expecting to send 401.');
  }

  console.log('[AUTH DEBUG V3 - BROAD MATCHER] Access DENIED, attempting to send 401 for path:', url.pathname);
  return new Response('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area - Debugging V4 - Broad Matcher"', 
    },
  });
}

