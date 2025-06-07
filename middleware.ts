// middleware.ts

// Ensure these environment variables are set in your Vercel project settings
const BASIC_AUTH_USER = process.env.BASIC_AUTH_USER;
const BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD;

export async function middleware(request: Request) {
  const url = new URL(request.url);
  // console.log('[BASIC AUTH MIDDLEWARE INVOKED] - Path:', url.pathname); // Log can be verbose, enable if needed for debugging

  // If auth credentials are not set in environment, it's a critical misconfiguration.
  // For security, deny access. In a local dev environment without these vars, this would block access.
  if (!BASIC_AUTH_USER || !BASIC_AUTH_PASSWORD) {
    console.error(
      'CRITICAL: Basic Auth credentials not set in environment. Denying access.'
    );
    // Return a generic error to avoid leaking information
    return new Response('Internal Server Error: Auth Misconfiguration', { status: 500 });
  }

  const authorizationHeader = request.headers.get('authorization');

  if (authorizationHeader) {
    const authValue = authorizationHeader.split(' ')[1];
    // Check if authValue is defined and not empty
    if (authValue) {
      try {
        // Decode base64 credentials
        // atob is a Web API, safe for Edge Runtime
        const decodedCredentials = atob(authValue);
        const [user, password] = decodedCredentials.split(':');

        if (user === BASIC_AUTH_USER && password === BASIC_AUTH_PASSWORD) {
          // Credentials are correct, allow request to pass through
          // console.log('[BASIC AUTH] Access granted for path:', url.pathname);
          return undefined; // undefined allows the request to proceed
        }
      } catch (e) {
        // Error decoding base64 or splitting credentials, treat as invalid
        console.error('[BASIC AUTH] Error processing credentials:', e);
      }
    }
  }

  // If no/invalid authorization header, send 401 Unauthorized
  // console.log('[BASIC AUTH] Access denied, prompting for credentials for path:', url.pathname);
  return new Response('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}

// No config object is used here. Vercel Edge Middleware at the root
// (or src/) should apply to all paths by default.

