// /Users/nnvve/Documents/Programming/Planora/planora.ai/functions/_middleware.ts

// If you don't have Cloudflare Pages types set up in your project,
// you might need to install them: npm install --save-dev @cloudflare/workers-types
// And then ensure your tsconfig.json includes them, for example:
// "compilerOptions": {
//   "types": ["@cloudflare/workers-types"]
// }
// Alternatively, you can define PagesFunction locally if needed.
// Define PagesFunction type locally to avoid dependency issues
type PagesFunction<Env = unknown> = (context: {
  request: Request;
  next: () => Response | Promise<Response>;
  env: Env;
}) => Response | Promise<Response>;

interface Env {
    // Define environment variable bindings here if your middleware needs them.
    // This interface is intentionally minimal for basic middleware functionality
    [key: string]: unknown;
  }
  
  export const onRequest: PagesFunction<Env> = async (context) => {
    const { request, next } = context;
    const url = new URL(request.url);
    const hostname = url.hostname;
  
    // Define allowed hostnames
    const allowedHostnames = [
      'localhost',          // For local development
      'getplanora.app',     // Your primary production domain
      'www.getplanora.app', // WWW subdomain
      // Add any other specific subdomains if necessary, e.g., 'www.getplanora.app'
    ];
  
    // Check if the current hostname is in the allowed list or is a subdomain of getplanora.app
    const isAllowed = allowedHostnames.includes(hostname) || hostname.endsWith('.getplanora.app');
  
    if (isAllowed) {
      // Hostname is allowed.
      // If you had other middleware logic (like Basic Auth previously in Vercel's middleware.ts),
      // you would integrate or chain that logic here.
      return next();
    }
  
    // Hostname is not allowed (e.g., 'planora-ai.pages.dev' or other preview domains).
    // Return a 403 Forbidden response.
    return new Response(`Forbidden: Access via this hostname (${hostname}) is not allowed.`, {
      status: 403,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  };