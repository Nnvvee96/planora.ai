// middleware.ts

// Attempt to read environment variables
const BASIC_AUTH_USER_FROM_ENV = process.env.BASIC_AUTH_USER;
const BASIC_AUTH_PASSWORD_FROM_ENV = process.env.BASIC_AUTH_PASSWORD;

export async function middleware(request: Request) {
  const url = new URL(request.url);

  // Explicitly log the values (and types) of the env vars as seen by the middleware
  console.log(`[AUTH DEBUG] BASIC_AUTH_USER_FROM_ENV: "${BASIC_AUTH_USER_FROM_ENV}" (Type: ${typeof BASIC_AUTH_USER_FROM_ENV})`);
  console.log(`[AUTH DEBUG] BASIC_AUTH_PASSWORD_FROM_ENV: "${BASIC_AUTH_PASSWORD_FROM_ENV}" (Type: ${typeof BASIC_AUTH_PASSWORD_FROM_ENV})`);

  // Check if the environment variables were actually loaded
  if (!BASIC_AUTH_USER_FROM_ENV || !BASIC_AUTH_PASSWORD_FROM_ENV) {
    console.error(
      'CRITICAL: Basic Auth credentials NOT PROPERLY SET or ACCESSIBLE in environment. Denying access.'
    );
    // Return a generic error to avoid leaking information, and to make it clear if this block is hit
    return new Response('Internal Server Error: Auth Configuration Issue', { status: 500 });
  }

  const authorizationHeader = request.headers.get('authorization');
  console.log(`[AUTH DEBUG] Path: ${url.pathname}, Authorization Header: "${authorizationHeader}"`);

  if (authorizationHeader) {
    const authValue = authorizationHeader.split(' ')[1];
    // Check if authValue is defined and not empty
    if (authValue) {
      try {
        // Decode base64 credentials
        const decodedCredentials = atob(authValue); // atob is a Web API
        const [user, password] = decodedCredentials.split(':');
        console.log(`[AUTH DEBUG] Decoded User: "${user}", Decoded Pass: "${password ? '***' : 'EMPTY'}"`); // Avoid logging actual password

        if (user === BASIC_AUTH_USER_FROM_ENV && password === BASIC_AUTH_PASSWORD_FROM_ENV) {
          console.log('[AUTH DEBUG] Access GRANTED for path:', url.pathname);
          return undefined; // undefined allows the request to proceed
        } else {
          console.log('[AUTH DEBUG] Credentials MISMATCH.');
        }
      } catch (e) {
        // Error decoding base64 or splitting credentials, treat as invalid
        console.error('[AUTH DEBUG] Error processing credentials:', e);
      }
    } else {
      console.log('[AUTH DEBUG] Authorization header present but auth value is empty after split.');
    }
  } else {
    console.log('[AUTH DEBUG] No Authorization Header found. Expecting to send 401.');
  }

  // If no/invalid authorization header, send 401 Unauthorized
  console.log('[AUTH DEBUG] Access DENIED, attempting to send 401 for path:', url.pathname);
  return new Response('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area - Debugging V2"', // Changed realm slightly for cache-busting
    },
  });
}

// No config object is used here. Vercel Edge Middleware at the root
// (or src/) should apply to all paths by default.

