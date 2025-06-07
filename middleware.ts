// middleware.ts
export async function middleware(request: Request) {
  const url = new URL(request.url);
  console.log('[VANILLA WEB API MIDDLEWARE INVOKED] - Path:', url.pathname);

  // By returning undefined, the request should pass through to the Next.js application.
  return undefined;
}

// No config object is used here. Vercel Edge Middleware at the root
// (or src/) should apply to all paths by default.
