import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  console.log(`[UNCONDITIONAL 401 AUTH TEST] - Function invoked for path: ${req.url}`);
  res.setHeader('WWW-Authenticate', 'Basic realm="Forced Secure Area"');
  return res.status(401).send('Unconditional authentication required by test.');
}
