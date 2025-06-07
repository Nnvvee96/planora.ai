// Intentionally not importing VercelRequest or VercelResponse for this test
export function handler(req: any, res: any) {
  console.log('[MINIMAL AUTH FUNCTION INVOKED]');
  res.status(200).json({ message: "Minimal auth function is alive!" });
}
