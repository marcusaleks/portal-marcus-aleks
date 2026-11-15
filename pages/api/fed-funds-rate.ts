import type { NextApiRequest, NextApiResponse } from 'next';

type SuccessPayload = {
  status: 'live';
  banda: string;        // ex: "4,25%–4,50%"
  limite_inferior: string;
  limite_superior: string;
  data: string;         // ISO "YYYY-MM-DD" (data de vigência)
  fetched_at: string;   // ISO timestamp do fetch server-side
};

type ErrorPayload = {
  status: 'offline';
  error: string;
  fetched_at: string;
};

type Payload = SuccessPayload | ErrorPayload;

const FRED_API_KEY = process.env.FRED_API_KEY;

function obsUrl(seriesId: string): string {
  return `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=1`;
}

async function fetchLatest(seriesId: string): Promise<{ data: string; valor: number }> {
  const r = await fetch(obsUrl(seriesId), { signal: AbortSignal.timeout(4000) });
  if (!r.ok) throw new Error(`FRED HTTP ${r.status}`);
  const json = await r.json();
  const entry = json?.observations?.[0];
  if (!entry || entry.value === '.') throw new Error(`payload inesperado para ${seriesId}`);
  return { data: entry.date, valor: parseFloat(entry.value) };
}

function fmtPct(v: number): string {
  return v.toFixed(2).replace('.', ',');
}

export default async function handler(_req: NextApiRequest, res: NextApiResponse<Payload>) {
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

  const fetched_at = new Date().toISOString();

  if (!FRED_API_KEY) {
    return res.status(200).json({ status: 'offline', error: 'FRED_API_KEY não configurada', fetched_at });
  }

  try {
    const [lower, upper] = await Promise.all([
      fetchLatest('DFEDTARL'),
      fetchLatest('DFEDTARU'),
    ]);

    return res.status(200).json({
      status: 'live',
      banda: `${fmtPct(lower.valor)}%–${fmtPct(upper.valor)}%`,
      limite_inferior: `${fmtPct(lower.valor)}%`,
      limite_superior: `${fmtPct(upper.valor)}%`,
      data: upper.data,
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
