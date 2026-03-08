import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { key } = req.body;
  
  // 1. Busca a string de senhas da Vercel
  const allowedKeysRaw = process.env.ALLOWED_KEYS || '';
  
  // 2. Converte a string (separada por vírgulas) em uma lista (Array)
  const keyList = allowedKeysRaw.split(',').map(k => k.trim());

  // 3. Validação segura
  if (keyList.includes(key)) {
    return res.status(200).json({ authorized: true });
  }

  return res.status(401).json({ authorized: false });
}
