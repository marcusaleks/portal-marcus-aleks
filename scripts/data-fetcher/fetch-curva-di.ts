/**
 * Script: Fetch Curva DI from ANBIMA
 * Faz scraping da página pública de ETTJ da ANBIMA e salva curva_di.json.
 *
 * Fonte: https://www.anbima.com.br/informacoes/est-termo/CZ.asp
 * - Dados em HTML estático, sem autenticação
 * - Atualizado diariamente após fechamento do mercado
 * - Vértices em dias úteis: 252 (~1a), 504 (~2a), 1260 (~5a), 2520 (~10a)
 */

import * as https from "https";
import * as fs from "fs";
import * as path from "path";

const ANBIMA_URL = "https://www.anbima.com.br/informacoes/est-termo/CZ.asp";
const OUTPUT_PATH = path.join(__dirname, "../../public/data/curva_di.json");

// Vértices em dias úteis que queremos extrair
const VERTICES = [
  { du: 252, label: "DI 1 ano" },
  { du: 504, label: "DI 2 anos" },
  { du: 1260, label: "DI 5 anos" },
  { du: 2520, label: "DI 10 anos" },
];

interface CurvaItem {
  label: string;
  vertice_du: number;
  taxa: number;         // % a.a. prefixada hoje
  taxa_str: string;     // formatada "14,0475"
  taxa_anterior: number | null;  // % a.a. do dia útil anterior
  var_pb: number | null;         // variação em pontos-base (taxa - taxa_anterior) * 100
}

interface CurvaDI {
  source: string;
  last_updated: string;
  asOf: string;
  items: CurvaItem[];
}

function fetchHtml(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const chunks: Buffer[] = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        // Página usa ISO-8859-1
        resolve(Buffer.concat(chunks).toString("latin1"));
      });
      res.on("error", reject);
    }).on("error", reject);
  });
}

function parseEttj(html: string): CurvaItem[] {
  // Estrutura da tabela principal ANBIMA ETTJ:
  //   col 0: vértice em dias úteis
  //   col 1: taxa IPCA (% a.a.)
  //   col 2: taxa prefixada (% a.a.)  ← queremos esta
  //   col 3: taxa implícita (break-even)
  //
  // Há uma segunda tabela com layout diferente (2 vértices por linha).
  // Filtramos garantindo que a linha tenha exatamente 4 colunas numéricas.

  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const cellRegex = /<td[^>]*>\s*([\d.,]+)\s*<\/td>/gi;

  const results: CurvaItem[] = [];
  const targetDus = new Set(VERTICES.map((v) => v.du));
  const foundDus = new Set<number>();

  let rowMatch: RegExpExecArray | null;
  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const rowHtml = rowMatch[1];
    const cells: string[] = [];
    let cellMatch: RegExpExecArray | null;
    cellRegex.lastIndex = 0;
    while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
      cells.push(cellMatch[1].trim());
    }

    // Linha principal da ETTJ tem exatamente 4 colunas
    if (cells.length !== 4) continue;

    const duRaw = cells[0].replace(/\./g, "");
    if (!/^\d+$/.test(duRaw)) continue;
    const du = parseInt(duRaw, 10);

    if (!targetDus.has(du) || foundDus.has(du)) continue;

    // Taxa prefixada: coluna 2 (índice 1 = IPCA, índice 2 = prefixada)
    const taxaRaw = cells[2];
    const taxa = parseFloat(taxaRaw.replace(",", "."));
    if (isNaN(taxa) || taxa < 5 || taxa > 50) continue;

    const taxaStr = taxaRaw;
    const vertice = VERTICES.find((v) => v.du === du)!;
    results.push({ label: vertice.label, vertice_du: du, taxa, taxa_str: taxaStr, taxa_anterior: null, var_pb: null });
    foundDus.add(du);
  }

  return results;
}

function loadPreviousTaxas(today: string): Map<number, number> {
  try {
    const raw = fs.readFileSync(OUTPUT_PATH, "utf-8");
    const existing: CurvaDI = JSON.parse(raw);
    const map = new Map<number, number>();

    // Reprocessamento do mesmo pregão (ex: workflow_dispatch manual repetido
    // no mesmo dia): a taxa_anterior já salva é o fechamento real do dia útil
    // anterior e deve ser preservada. Sem isso, uma segunda execução no mesmo
    // dia usaria a taxa recém-gravada como "anterior", zerando var_pb.
    const reprocessandoMesmoDia = existing.asOf === today;

    for (const item of existing.items) {
      const valorReferencia = reprocessandoMesmoDia ? item.taxa_anterior : item.taxa;
      if (valorReferencia !== null && valorReferencia > 0) {
        map.set(item.vertice_du, valorReferencia);
      }
    }
    return map;
  } catch {
    return new Map();
  }
}

function todayBRT(): string {
  return new Date()
    .toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })
    .split("/")
    .reverse()
    .join("-");
}

async function main() {
  console.log("🔍 Buscando Curva DI da ANBIMA...");

  const today = todayBRT();
  const previousTaxas = loadPreviousTaxas(today);

  const html = await fetchHtml(ANBIMA_URL);
  console.log(`   HTML recebido: ${html.length} bytes`);

  const items = parseEttj(html);

  // Enriquecer com taxa anterior e variação em p.b.
  for (const item of items) {
    const anterior = previousTaxas.get(item.vertice_du) ?? null;
    item.taxa_anterior = anterior;
    item.var_pb = anterior !== null ? Math.round((item.taxa - anterior) * 100) : null;
  }

  if (items.length === 0) {
    throw new Error("Nenhum vértice encontrado no HTML da ANBIMA");
  }

  // Verificar se todos os vértices foram encontrados
  const foundDus = new Set(items.map((i) => i.vertice_du));
  const missing = VERTICES.filter((v) => !foundDus.has(v.du));
  if (missing.length > 0) {
    console.warn(`⚠️  Vértices não encontrados: ${missing.map((v) => v.label).join(", ")}`);
  }

  // Ordenar por vértice
  items.sort((a, b) => a.vertice_du - b.vertice_du);

  const output: CurvaDI = {
    source: ANBIMA_URL,
    last_updated: new Date().toISOString(),
    asOf: today,
    items,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), "utf-8");

  console.log(`✅ curva_di.json atualizado — ${today}`);
  items.forEach((i) => {
    console.log(`   ${i.label} (${i.vertice_du} DU): ${i.taxa_str}% a.a.`);
  });
}

main().catch((err) => {
  console.error("❌ Erro ao buscar Curva DI:", err.message);
  process.exit(1);
});
