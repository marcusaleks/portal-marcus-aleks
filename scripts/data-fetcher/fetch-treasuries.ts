/**
 * Script: Fetch Treasuries (US) from FRED (Federal Reserve Economic Data)
 * Busca yields de Treasuries e breakeven de inflação, salva treasuries.json.
 *
 * Fonte: https://fred.stlouisfed.org/
 * - API JSON oficial, requer FRED_API_KEY (gratuita, sem custo)
 * - Séries de yield atualizadas em dias úteis (D-1 ou D0, após fechamento)
 */

import * as https from "https";
import * as fs from "fs";
import * as path from "path";

const FRED_API_KEY = process.env.FRED_API_KEY;
const OUTPUT_PATH = path.join(__dirname, "../../public/data/treasuries.json");

const SERIES = [
  { id: "DGS1MO", label: "T-Bill 1 mês" },
  { id: "DGS2", label: "T-Note 2 anos" },
  { id: "DGS10", label: "T-Note 10 anos" },
  { id: "DGS30", label: "T-Bond 30 anos" },
  { id: "T5YIE", label: "Breakeven 5 anos (TIPS)" },
  { id: "T10YIE", label: "Breakeven 10 anos (TIPS)" },
];

// CPI realizado (YoY) e expectativa de inflação 12m (survey University of
// Michigan) — não são yields, tratados à parte sem var_pb em pontos-base.
const INFLATION_SERIES = [
  { id: "CPIAUCSL", label: "CPI 12m (realizado)", units: "pc1" as const },
  { id: "MICH", label: "Expectativa CPI 12m (Michigan)", units: "lin" as const },
];

interface TreasuryItem {
  series_id: string;
  label: string;
  taxa: number | null;        // % a.a. hoje
  taxa_str: string;           // formatada "4.25"
  taxa_anterior: number | null; // % a.a. da observação anterior
  var_pb: number | null;       // variação em pontos-base
  data_obs: string | null;     // ISO data da observação mais recente
}

interface InflationItem {
  series_id: string;
  label: string;
  valor: number | null;       // % a.a.
  valor_str: string;          // formatada "3.70"
  data_obs: string | null;    // ISO data/mês de referência da observação
}

interface TreasuriesData {
  source: string;
  last_updated: string;
  asOf: string;
  items: TreasuryItem[];
  spread_10a_2a_pb: number | null; // DGS10 - DGS2, em pontos-base
  inflation: InflationItem[];
}

function fetchJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString("utf-8")));
          } catch (e) {
            reject(e);
          }
        });
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

// FRED retorna "." para dias sem observação (feriado/mercado fechado nos EUA)
function parseValue(raw: string): number | null {
  if (raw === "." || raw === undefined || raw === null) return null;
  const v = parseFloat(raw);
  return isNaN(v) ? null : v;
}

async function fetchSeries(seriesId: string): Promise<{ data_obs: string; taxa: number }[]> {
  // Últimas 10 observações para garantir pelo menos 2 dias úteis válidos
  // mesmo em semanas com feriado americano.
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=10`;
  const json = await fetchJson(url);
  const obs = json?.observations;
  if (!Array.isArray(obs)) throw new Error(`payload inesperado para ${seriesId}`);

  return obs
    .map((o: any) => ({ data_obs: o.date, taxa: parseValue(o.value) }))
    .filter((o: any) => o.taxa !== null) as { data_obs: string; taxa: number }[];
}

async function fetchLatestInflation(
  seriesId: string,
  units: "pc1" | "lin"
): Promise<{ data_obs: string; valor: number } | null> {
  // Séries mensais (CPI, Michigan) — últimas 3 observações, suficiente mesmo
  // com defasagem de publicação do mês corrente.
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&units=${units}&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=3`;
  const json = await fetchJson(url);
  const obs = json?.observations;
  if (!Array.isArray(obs)) throw new Error(`payload inesperado para ${seriesId}`);

  const valid = obs
    .map((o: any) => ({ data_obs: o.date, valor: parseValue(o.value) }))
    .filter((o: any) => o.valor !== null) as { data_obs: string; valor: number }[];

  return valid.length > 0 ? valid[0] : null;
}

function todayISO(): string {
  // FRED publica em horário de Nova York; usamos a data America/New_York
  // para alinhar "asOf" com o pregão de referência.
  return new Date()
    .toLocaleDateString("en-CA", { timeZone: "America/New_York" }); // en-CA -> YYYY-MM-DD
}

async function main() {
  if (!FRED_API_KEY) {
    throw new Error("FRED_API_KEY não definida no ambiente");
  }

  console.log("🔍 Buscando Treasuries (FRED)...");

  const items: TreasuryItem[] = [];
  let asOf = todayISO();

  for (const serie of SERIES) {
    try {
      const obs = await fetchSeries(serie.id);
      if (obs.length === 0) {
        items.push({
          series_id: serie.id,
          label: serie.label,
          taxa: null,
          taxa_str: "--",
          taxa_anterior: null,
          var_pb: null,
          data_obs: null,
        });
        continue;
      }

      const [latest, previous] = obs;
      const taxa = latest.taxa;
      const taxaAnterior = previous?.taxa ?? null;
      const varPb = taxaAnterior !== null ? Math.round((taxa - taxaAnterior) * 100) : null;

      items.push({
        series_id: serie.id,
        label: serie.label,
        taxa,
        taxa_str: taxa.toFixed(2),
        taxa_anterior: taxaAnterior,
        var_pb: varPb,
        data_obs: latest.data_obs,
      });

      // asOf do card = data de observação mais recente entre as séries
      if (latest.data_obs > asOf) asOf = latest.data_obs;
      if (latest.data_obs < asOf) {
        // Mantém o mais recente observado; séries diferentes podem atualizar
        // em dias ligeiramente diferentes (ex: feriado parcial).
      }
    } catch (err: any) {
      console.warn(`⚠️  Falha ao buscar ${serie.id}: ${err.message}`);
      items.push({
        series_id: serie.id,
        label: serie.label,
        taxa: null,
        taxa_str: "--",
        taxa_anterior: null,
        var_pb: null,
        data_obs: null,
      });
    }
  }

  if (items.every((i) => i.taxa === null)) {
    throw new Error("Nenhuma série de Treasuries pôde ser obtida");
  }

  const dgs2 = items.find((i) => i.series_id === "DGS2")?.taxa ?? null;
  const dgs10 = items.find((i) => i.series_id === "DGS10")?.taxa ?? null;
  const spread10a2aPb = dgs2 !== null && dgs10 !== null
    ? Math.round((dgs10 - dgs2) * 100)
    : null;

  const inflation: InflationItem[] = [];
  for (const serie of INFLATION_SERIES) {
    try {
      const latest = await fetchLatestInflation(serie.id, serie.units);
      inflation.push({
        series_id: serie.id,
        label: serie.label,
        valor: latest?.valor ?? null,
        valor_str: latest ? latest.valor.toFixed(2) : "--",
        data_obs: latest?.data_obs ?? null,
      });
    } catch (err: any) {
      console.warn(`⚠️  Falha ao buscar ${serie.id}: ${err.message}`);
      inflation.push({
        series_id: serie.id,
        label: serie.label,
        valor: null,
        valor_str: "--",
        data_obs: null,
      });
    }
  }

  const output: TreasuriesData = {
    source: "https://fred.stlouisfed.org/ (FRED API)",
    last_updated: new Date().toISOString(),
    asOf,
    items,
    spread_10a_2a_pb: spread10a2aPb,
    inflation,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), "utf-8");

  console.log(`✅ treasuries.json atualizado — ${asOf}`);
  items.forEach((i) => {
    console.log(`   ${i.label}: ${i.taxa_str}%`);
  });
  console.log(`   Spread 10a-2a: ${spread10a2aPb !== null ? `${spread10a2aPb > 0 ? '+' : ''}${spread10a2aPb} p.b.` : '--'}`);
  inflation.forEach((i) => {
    console.log(`   ${i.label}: ${i.valor_str}%`);
  });
}

main().catch((err) => {
  console.error("❌ Erro ao buscar Treasuries:", err.message);
  process.exit(1);
});
