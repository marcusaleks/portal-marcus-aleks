import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();
  const session = req.cookies['mad_session'];
  if (session === '1') return res.status(200).json({ valid: true });
  return res.status(401).json({ valid: false });
}
