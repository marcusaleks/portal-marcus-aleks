export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();
  const { key } = req.body;
  const allowed = process.env.ALLOWED_KEYS || ""; 
  const keysArray = allowed.split(',').map(k => k.trim());

  if (keysArray.includes(key)) {
    return res.status(200).json({ authorized: true });
  }
  return res.status(401).json({ authorized: false });
}
