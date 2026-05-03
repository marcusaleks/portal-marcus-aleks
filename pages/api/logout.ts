import type { NextApiRequest, NextApiResponse } from 'next';
import { getIronSession } from 'iron-session';
import { sessionOptions, type SessionData } from '../../lib/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  session.destroy();
  return res.status(200).end();
}
