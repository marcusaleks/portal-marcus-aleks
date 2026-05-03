import type { NextApiRequest, NextApiResponse } from 'next';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '../../lib/session';

const attempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 60 * 1000;
const BLOCK_MS = 5 * 60 * 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = attempts.get(ip);

  if (record) {
    if (now < record.until) return res.status(429).json({ error: 'Muitas tentativas. Tente novamente em alguns minutos.' });
    if (now - record.until > WINDOW_MS) attempts.delete(ip);
  }

  const { key } = req.body;
  const allowed = process.env.ALLOWED_KEYS || '';
  const keysArray = allowed.split(',').map(k => k.trim());

  if (keysArray.includes(key)) {
    attempts.delete(ip);
    const session = await getIronSession(req, res, sessionOptions);
    session.authorized = true;
    await session.save();
    return res.status(200).json({ authorized: true });
  }

  const current = attempts.get(ip) || { count: 0, until: 0 };
  current.count += 1;
  if (current.count >= MAX_ATTEMPTS) current.until = now + BLOCK_MS;
  attempts.set(ip, current);
  return res.status(401).json({ authorized: false });
}
