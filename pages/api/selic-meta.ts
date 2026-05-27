import type { NextApiRequest, NextApiResponse } from 'next';

type SuccessPayload = {
  status: 'live';
  valor: string;        // ex: "14,40"
  valor_pct: string;    // ex: "14,40%"
  data: string;         // ISO "YYYY-MM-DD" (dia da publicação no BCB)
  fetched_at: string;   // ISO timestamp do fetch server-side
};

type ErrorPayload = {
  status: 'offline';
  error: string;
  fetched_at: string;
};

type Payload = SuccessPayload | ErrorPayload;

const BCB_URL = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.1178/dados/ultimos/1?formato=json';

function dateToISO(brDate: string): string {
  const [day, month, year] = brDate.split('/');
  return `${year}-${month}-${day}`;
}

export default async function handler(_req: NextApiRequest, res: NextApiResponse<Payload>) {
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

  const fetched_at = new Date().toISOString();

  try {
    const r = await fetch(BCB_URL, { signal: AbortSignal.timeout(4000) });
    if (!r.ok) throw new Error(`BCB HTTP ${r.status}`);
    const arr = await r.json();
    const entry = Array.isArray(arr) ? arr[0] : null;
    if (!entry?.valor || !entry?.data) throw new Error('payload inesperado');

    const valor = String(entry.valor).replace('.', ',');
    return res.status(200).json({
      status: 'live',
      valor,
      valor_pct: `${valor}%`,
      data: dateToISO(entry.data),
      fetched_at,
    });
  } catch (e: any) {
    return res.status(200).json({
      status: 'offline',
      error: e?.message ?? 'unknown',
      fetched_at,
    });
  }
}
