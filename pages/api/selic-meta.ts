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

// Nota: o endpoint /dados/ultimos/N desta série específica (1178) fica
// preso retornando 304 Not Modified de forma consistente e imprevisível
// — observado em /ultimos/1 (21/11/2026) e depois também em /ultimos/5
// (26/11/2026, o workaround anterior), mesmo sem nenhum header condicional
// enviado. Parece ser cache da CDN do BCB travado para valores específicos
// de N, não um N "seguro" fixo — qualquer path fixo pode eventualmente
// travar. Fix: tentar o formato de range de datas primeiro (não depende de
// um N mágico), com /ultimos/10 como segunda tentativa se o primeiro falhar.
function dateToISO(brDate: string): string {
  const [day, month, year] = brDate.split('/');
  return `${year}-${month}-${day}`;
}

function todayBR(): string {
  return new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

function daysAgoBR(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

async function fetchLatestEntry(): Promise<{ valor: string; data: string }> {
  const rangeUrl = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.1178/dados?formato=json&dataInicial=${daysAgoBR(15)}&dataFinal=${todayBR()}`;
  const fallbackUrl = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.1178/dados/ultimos/10?formato=json';

  for (const url of [rangeUrl, fallbackUrl]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (!r.ok) continue;
      const arr = await r.json();
      if (!Array.isArray(arr) || arr.length === 0) continue;
      const entry = arr[arr.length - 1]; // range vem em ordem crescente; ultimos/10 teria o mais recente primeiro, mas pegar o de maior data cobre os dois formatos
      const mostRecent = arr.reduce((latest: any, cur: any) => {
        const [ld, lm, ly] = latest.data.split('/').map(Number);
        const [cd, cm, cy] = cur.data.split('/').map(Number);
        return new Date(cy, cm - 1, cd) > new Date(ly, lm - 1, ld) ? cur : latest;
      }, entry);
      if (mostRecent?.valor && mostRecent?.data) return mostRecent;
    } catch {
      // tenta a próxima URL
    }
  }
  throw new Error('BCB indisponível (range e /ultimos/10 falharam)');
}

export default async function handler(_req: NextApiRequest, res: NextApiResponse<Payload>) {
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

  const fetched_at = new Date().toISOString();

  try {
    const entry = await fetchLatestEntry();
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
