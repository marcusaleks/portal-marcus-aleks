import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const token = process.env.BRAPI_TOKEN;
  const symbols = ['%5EBVSP', 'PETR4', 'VALE3', 'ITUB4', 'BBAS3', 'BBDC4', 'ABEV3', 'MGLU3'];

  try {
    const r = await fetch(`https://brapi.dev/api/quote/${symbols.join(',')}?token=${token}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) {
      console.error(`BRAPI error: ${r.status}`);
      return res.status(502).json({ error: `Upstream error: ${r.status}` });
    }
    const d = await r.json();
    // Normaliza o símbolo do IBOVESPA de volta para ^BVSP
    const results = (d.results || []).map((s: any) =>
      s.symbol === '%5EBVSP' ? { ...s, symbol: '^BVSP' } : s
    );
    res.status(200).json({ results });
  } catch (e) {
    res.status(502).json({ error: 'Upstream error' });
  }
}
