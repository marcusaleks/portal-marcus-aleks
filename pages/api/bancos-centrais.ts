import type { NextApiRequest, NextApiResponse } from 'next';

type BancoCentralItem = {
  pais: string;
  banco: string;
  taxa_str: string | null;  // ex: "4,25%–4,50%" ou "2,00%" ou "--"
  data: string | null;      // ISO da observação
  tipo: 'oficial_diaria' | 'proxy_mensal';
  status: 'live' | 'offline';
};

type Payload = {
  fetched_at: string;
  bancos: BancoCentralItem[];
};

const FRED_API_KEY = process.env.FRED_API_KEY;

function obsUrl(seriesId: string): string {
  return `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=1`;
}

async function fetchLatest(seriesId: string): Promise<{ data: string; valor: number } | null> {
  try {
    const r = await fetch(obsUrl(seriesId), { signal: AbortSignal.timeout(4000) });
    if (!r.ok) throw new Error(`FRED HTTP ${r.status}`);
    const json = await r.json();
    const entry = json?.observations?.[0];
    if (!entry || entry.value === '.') throw new Error('payload inesperado');
    return { data: entry.date, valor: parseFloat(entry.value) };
  } catch {
    return null;
  }
}

function fmtPct(v: number): string {
  return v.toFixed(2).replace('.', ',') + '%';
}

export default async function handler(_req: NextApiRequest, res: NextApiResponse<Payload>) {
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

  const fetched_at = new Date().toISOString();

  if (!FRED_API_KEY) {
    return res.status(200).json({
      fetched_at,
      bancos: [
        { pais: 'EUA', banco: 'Federal Reserve', taxa_str: null, data: null, tipo: 'oficial_diaria', status: 'offline' },
        { pais: 'Zona do Euro', banco: 'BCE', taxa_str: null, data: null, tipo: 'oficial_diaria', status: 'offline' },
        { pais: 'Reino Unido', banco: 'Bank of England', taxa_str: null, data: null, tipo: 'oficial_diaria', status: 'offline' },
        { pais: 'Japão', banco: 'Bank of Japan', taxa_str: null, data: null, tipo: 'proxy_mensal', status: 'offline' },
        { pais: 'China', banco: 'PBoC', taxa_str: null, data: null, tipo: 'proxy_mensal', status: 'offline' },
      ],
    });
  }

  const [fedLower, fedUpper, ecb, boe, boj, pboc] = await Promise.all([
    fetchLatest('DFEDTARL'),
    fetchLatest('DFEDTARU'),
    fetchLatest('ECBDFR'),
    fetchLatest('BOERUKM'),
    fetchLatest('IRSTCB01JPM156N'),
    fetchLatest('IRSTCB01CNM156N'),
  ]);

  const bancos: BancoCentralItem[] = [
    {
      pais: 'EUA',
      banco: 'Federal Reserve',
      taxa_str: fedLower && fedUpper ? `${fmtPct(fedLower.valor)}–${fmtPct(fedUpper.valor)}` : null,
      data: fedUpper?.data ?? null,
      tipo: 'oficial_diaria',
      status: fedLower && fedUpper ? 'live' : 'offline',
    },
    {
      pais: 'Zona do Euro',
      banco: 'BCE (depósito)',
      taxa_str: ecb ? fmtPct(ecb.valor) : null,
      data: ecb?.data ?? null,
      tipo: 'oficial_diaria',
      status: ecb ? 'live' : 'offline',
    },
    {
      pais: 'Reino Unido',
      banco: 'Bank of England',
      taxa_str: boe ? fmtPct(boe.valor) : null,
      data: boe?.data ?? null,
      tipo: 'oficial_diaria',
      status: boe ? 'live' : 'offline',
    },
    {
      pais: 'Japão',
      banco: 'Bank of Japan',
      taxa_str: boj ? fmtPct(boj.valor) : null,
      data: boj?.data ?? null,
      tipo: 'proxy_mensal',
      status: boj ? 'live' : 'offline',
    },
    {
      pais: 'China',
      banco: 'PBoC',
      taxa_str: pboc ? fmtPct(pboc.valor) : null,
      data: pboc?.data ?? null,
      tipo: 'proxy_mensal',
      status: pboc ? 'live' : 'offline',
    },
  ];

  return res.status(200).json({ fetched_at, bancos });
}
