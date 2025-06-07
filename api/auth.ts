import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[AUTH FUNCTION INVOKED] - Attempting Basic Auth');

  const user = process.env.BASIC_AUTH_USER;
  const password = process.env.BASIC_AUTH_PASSWORD;

  if (!user || !password) {
    console.error('[AUTH FUNCTION ERROR] - Basic auth credentials not set in environment variables.');
    res.status(500).send('Authentication configuration error.');
    return;
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log('[AUTH FUNCTION] - No authorization header, prompting for credentials.');
    res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
    res.status(401).send('Authentication required.');
    return;
  }

  try {
    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString();
    const [providedUser, providedPassword] = auth.split(':');

    if (providedUser === user && providedPassword === password) {
      console.log('[AUTH FUNCTION] - Authentication successful.');
      // Auth successful, let Vercel serve the content by not sending a response here.
      // The request will fall through to the next handler in Vercel's chain.
      return;
    } else {
      console.warn('[AUTH FUNCTION] - Invalid credentials.');
      res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
      res.status(401).send('Invalid credentials.');
    }
  } catch (error) {
    console.error('[AUTH FUNCTION ERROR] - Error processing auth header:', error);
    res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
    res.status(401).send('Authentication error.');
  }
}
