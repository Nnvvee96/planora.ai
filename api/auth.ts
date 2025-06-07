import { Buffer } from 'node:buffer';
import * as vercelNode from '@vercel/node';

export function handler(req: vercelNode.VercelRequest, res: vercelNode.VercelResponse) {
  console.log(`[AUTH FUNCTION INVOKED] Path: ${req.url}, Headers: ${JSON.stringify(req.headers)}`);

  const expectedUser = process.env.BASIC_AUTH_USER;
  const expectedPassword = process.env.BASIC_AUTH_PASSWORD;

  // Check if environment variables are set
  if (!expectedUser || !expectedPassword) {
    console.error('Server Error: Basic authentication credentials are not configured in environment variables.');
    // Send a generic error to the client, but log the specific issue
    return res.status(500).send('Authentication configuration error on the server.');
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Restricted Area - Please enter credentials"');
    return res.status(401).send('Authentication required to access this site.');
  }

  // The authHeader is expected to be "Basic <base64_encoded_credentials>"
  const [scheme, encodedCredentials] = authHeader.split(' ');

  if (scheme !== 'Basic' || !encodedCredentials) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Restricted Area - Malformed header"');
    return res.status(401).send('Malformed authentication header. Expected "Basic <credentials>".');
  }

  let decodedCredentials;
  try {
    // Decode the base64 string. It should be in the format "username:password"
    decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString();
  } catch (error) {
    console.error('Error decoding base64 credentials:', error);
    res.setHeader('WWW-Authenticate', 'Basic realm="Restricted Area - Invalid encoding"');
    return res.status(401).send('Invalid credential encoding.');
  }
  
  const [user, password] = decodedCredentials.split(':');

  if (user === expectedUser && password === expectedPassword) {
    // Authentication successful.
    // By not sending a response here and simply returning,
    // Vercel will proceed to serve the static file for the original request path,
    // as per the rewrite rule in vercel.json.
    // For this to work, the function MUST NOT send a response for successful auth.
    // It should allow the request to fall through to the next handler (the static file serving).
    return; 
  } else {
    // Invalid credentials
    res.setHeader('WWW-Authenticate', 'Basic realm="Restricted Area - Invalid credentials"');
    return res.status(401).send('Invalid username or password.');
  }
}
