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

// FRED BOERUKM (usada anteriormente) é uma série histórica congelada do
// projeto "Three Centuries of Macroeconomic Data" do BoE — não é
// atualizada desde janeiro/2017 (confirmado 26/11/2026: mostrava 0,25%,
// taxa real na data era 4,00%). IUDBEDR, mantida pelo próprio Bank of
// England via IADB (Interactive Statistical Database), é a série diária
// correta do Bank Rate. Não tem API JSON — retorna CSV, sem necessidade
// de chave.
function todayDDMonYYYY(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleDateString('en-GB', { month: 'short' });
  return `${day}/${month}/${d.getFullYear()}`;
}

async function fetchBoeBankRate(): Promise<{ data: string; valor: number } | null> {
  try {
    const dateFrom = todayDDMonYYYY(15);
    const dateTo = todayDDMonYYYY(0);
    const url = `https://www.bankofengland.co.uk/boeapps/database/_iadb-fromshowcolumns.asp?csv.x=yes&Datefrom=${dateFrom}&Dateto=${dateTo}&SeriesCodes=IUDBEDR&CSVF=TT&UsingCodes=Y&VPD=Y`;
    const r = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!r.ok) throw new Error(`BoE HTTP ${r.status}`);
    const text = await r.text();

    // Formato: bloco de cabeçalho, linha em branco, "DATE,IUDBEDR", depois
    // linhas "DD Mon YYYY,valor" em ordem crescente — pegamos a última.
    const lines = text.trim().split('\n').map((l) => l.trim()).filter(Boolean);
    const dataLines = lines.filter((l) => /^\d{2} \w{3} \d{4},/.test(l));
    if (dataLines.length === 0) throw new Error('nenhuma observação no CSV');

    const lastLine = dataLines[dataLines.length - 1];
    const [dateStr, valueStr] = lastLine.split(',');
    const valor = parseFloat(valueStr);
    if (isNaN(valor)) throw new Error('valor inválido no CSV');

    const [day, monStr, year] = dateStr.split(' ');
    const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(monStr) + 1;
    const isoDate = `${year}-${String(monthIndex).padStart(2, '0')}-${day.padStart(2, '0')}`;

    return { data: isoDate, valor };
  } catch {
    return null;
  }
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
    fetchBoeBankRate(),
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
