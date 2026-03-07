import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const { password } = req.body;
  
  // Puxa a lista de senhas que você salvou na Vercel (ALLOWED_KEYS)
  const allowedKeys = process.env.ALLOWED_KEYS || '';
  const keysArray = allowedKeys.split(',');

  if (keysArray.includes(password)) {
    // Se a senha estiver na lista, retorna sucesso
    return res.status(200).json({ authenticated: true });
  } else {
    // Se não estiver, retorna erro
    return res.status(401).json({ authenticated: false, message: 'Credencial Inválida' });
  }
}
