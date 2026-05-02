import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const token = process.env.BRAPI_TOKEN;
  const symbols = ['^BVSP', 'AXIA6', 'BBAS3', 'BBDC3', 'BBSE3', 'CMIG4', 'CSMG3', 'ISAE4', 'ITSA4', 'ITUB4', 'MXRF11', 'PETR4', 'PMLL11', 'ROMI3', 'VALE3', 'VISC11', 'VIVT3', 'XPML11'];

  try {
    const responses = await Promise.all(
      symbols.map(s =>
        fetch(`https://brapi.dev/api/quote/${encodeURIComponent(s)}?token=${token}`, {
          signal: AbortSignal.timeout(8000),
        })
          .then(r => r.ok ? r.json() : null)
          .then(d => d?.results?.[0] ?? null)
          .catch(() => null)
      )
    );
    const results = responses.filter(Boolean);
    res.status(200).json({ results });
  } catch (e) {
    res.status(502).json({ error: 'Upstream error' });
  }
}
