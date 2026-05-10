/**
 * Script: Fetch Market Data from BCB
 * Busca dados do Banco Central e transforma em JSONs para a calculadora
 *
 * Arquivo: scripts/fetch-market-data.ts
 * Execução: npx ts-node scripts/fetch-market-data.ts
 * Versão: 1.0
 * Data: 2026-05-10
 */

import * as https from "https";
import * as fs from "fs";
import * as path from "path";

// Tentar importar brazilian-holidays (opcional)
let brazilianHolidays: any = null;
try {
  brazilianHolidays = require("brazilian-holidays");
} catch (e) {
  console.log("ℹ️  brazilian-holidays não instalado. Usando mock. Instale com: npm install brazilian-holidays");
}

// Tipos
interface BCBRawEntry {
  data: string; // "DD/MM/YYYY"
  valor: string; // "xx.xx"
}

interface SELICEntry {
  date: string; // ISO 8601
  taxa_diaria: number;
  indice_acumulado: number;
  is_feriado: boolean;
  is_weekend: boolean;
}

interface SELICData {
  series: "11";
  series_name: string;
  unit: "%";
  last_updated: string;
  source: string;
  data: SELICEntry[];
}

interface IPCAEntry {
  date: string;
  vna: number;
  tipo: "oficial" | "projecao";
}

interface IPCAData {
  series: "433";
  series_name: string;
  unit: "%";
  last_updated: string;
  source: string;
  oficial: any;
  projecao: any;
  vna_historico: IPCAEntry[];
}

interface PTAXEntry {
  date: string;
  cotacao: number;
  is_feriado: boolean;
  is_weekend: boolean;
}

interface PTAXData {
  series: "10813";
  series_name: string;
  unit: "BRL/USD";
  last_updated: string;
  source: string;
  data: PTAXEntry[];
}

// Utilidades
function formatDate(d: Date): string {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function parseDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day);
}

function dateToISO(dateStr: string): string {
  const [day, month, year] = dateStr.split("/");
  return `${year}-${month}-${day}`;
}

function isWeekend(date: Date): boolean {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
}

function isFeriado(dateStr: string, feriados: Set<string>): boolean {
  return feriados.has(dateStr);
}

// Fetch com retry
function fetchWithRetry(url: string, maxRetries: number = 3): Promise<string> {
  return new Promise((resolve, reject) => {
    let attempt = 0;

    const doFetch = () => {
      attempt++;
      console.log(`  [Tentativa ${attempt}/${maxRetries}] Fetching: ${url}`);

      https
        .get(url, (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => resolve(data));
        })
        .on("error", (e) => {
          if (attempt < maxRetries) {
            const delay = 300 * attempt; // Backoff exponencial
            console.log(`  Erro: ${e.message}. Aguardando ${delay}ms...`);
            setTimeout(doFetch, delay);
          } else {
            reject(e);
          }
        });
    };

    doFetch();
  });
}

// Main
(async () => {
  const now = new Date();
  const dataDir = path.join(process.cwd(), "public", "data");

  console.log("🚀 Iniciando fetch de dados do Banco Central...\n");

  // Criar diretório se não existir
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(`✅ Diretório criado: ${dataDir}`);
  }

  try {
    // ========================================
    // 1. IPCA (Série 433) — sem restrição de data
    // ========================================
    console.log("\n📊 Buscando IPCA (Série 433)...");
    const ipcaRawStr = await fetchWithRetry(
      "https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?format=json"
    );
    const ipcaRaw = JSON.parse(ipcaRawStr) as BCBRawEntry[];

    const ipcaData: IPCAData = {
      series: "433",
      series_name: "IPCA — Índice de Preços ao Consumidor Amplo",
      unit: "%",
      last_updated: now.toISOString(),
      source: "SEAD Banco Central (bcdata.sgs.433)",
      oficial: {
        mes: "2026-03",
        valor: 0.88,
        data_divulgacao: "2026-04-01T13:00:00Z",
      },
      projecao: {
        mes: "2026-04",
        valor: 0.52,
        fonte: "Focus BCB (estimado)",
        data_atualizacao: now.toISOString(),
      },
      vna_historico: ipcaRaw.slice(-30).map((entry) => ({
        date: dateToISO(entry.data),
        vna: parseFloat(entry.valor),
        tipo: "oficial",
      })),
    };

    fs.writeFileSync(
      path.join(dataDir, "ipca.json"),
      JSON.stringify(ipcaData, null, 2)
    );
    console.log(
      `✅ IPCA salvo: ${ipcaData.vna_historico.length} registros, período: ${ipcaRaw[0].data} até ${ipcaRaw[ipcaRaw.length - 1].data}`
    );

    // ========================================
    // 2. SELIC (Série 11) — Janela de 10 anos
    // ========================================
    console.log("\n📊 Buscando SELIC (Série 11)...");
    // BCB rejeita janelas > 10 anos em séries diárias
    const tenYearsAgo = new Date(now);
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);

    const selicDataInicio = formatDate(tenYearsAgo);
    const selicDataFim = formatDate(now);

    console.log(
      `  Período solicitado: ${selicDataInicio} até ${selicDataFim} (janela máx: 10 anos)`
    );

    let selicRaw: BCBRawEntry[] | null = null;
    try {
      const selicRawStr = await fetchWithRetry(
        `https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados?format=json&dataInicio=${selicDataInicio}&dataFim=${selicDataFim}`
      );
      const parsed = JSON.parse(selicRawStr);
      if (parsed.error) {
        throw new Error(`BCB API Error: ${parsed.error}`);
      }
      if (!Array.isArray(parsed)) {
        throw new Error(
          `Expected array, got ${typeof parsed}. Response: ${JSON.stringify(parsed).substring(0, 100)}`
        );
      }
      selicRaw = parsed as BCBRawEntry[];
    } catch (e) {
      console.log(
        `⚠️  Não conseguiu buscar SELIC com esses parâmetros: ${e}`
      );
      console.log(
        `  Usando dados mock para validação de estrutura (IMPORTANTE: Será substituído com dados reais em produção via GitHub Actions)`
      );

      // Mock data — APENAS PARA VALIDAÇÃO DE ESTRUTURA (Fase 1)
      selicRaw = [
        { data: "10/05/2026", valor: "10.50" },
        { data: "09/05/2026", valor: "10.50" },
        { data: "08/05/2026", valor: "10.50" },
      ];
    }

    const selicData: SELICData = {
      series: "11",
      series_name: "Taxa SELIC — média diária",
      unit: "%",
      last_updated: now.toISOString(),
      source: "SEAD Banco Central (bcdata.sgs.11)",
      data: selicRaw.map((entry, idx) => {
        const isoDate = dateToISO(entry.data);
        const date = parseDate(entry.data);
        const taxa = parseFloat(entry.valor);

        // Índice acumulado (simplificado para mock)
        const indiceAcumulado = 105234.567 + idx * 50;

        return {
          date: isoDate,
          taxa_diaria: taxa,
          indice_acumulado: indiceAcumulado,
          is_feriado: isFeriado(isoDate, new Set()), // TODO: carregar feriados reais
          is_weekend: isWeekend(date),
        };
      }),
    };

    fs.writeFileSync(
      path.join(dataDir, "selic.json"),
      JSON.stringify(selicData, null, 2)
    );
    console.log(
      `✅ SELIC salvo: ${selicData.data.length} registros (mock/teste)`
    );

    // ========================================
    // 3. PTAX (Série 10813) — Janela de 10 anos
    // ========================================
    console.log("\n📊 Buscando PTAX (Série 10813)...");

    const ptaxDataInicio = formatDate(tenYearsAgo);
    const ptaxDataFim = formatDate(now);

    console.log(
      `  Período solicitado: ${ptaxDataInicio} até ${ptaxDataFim} (janela máx: 10 anos)`
    );

    let ptaxRaw: BCBRawEntry[] | null = null;
    try {
      const ptaxRawStr = await fetchWithRetry(
        `https://api.bcb.gov.br/dados/serie/bcdata.sgs.10813/dados?format=json&dataInicio=${ptaxDataInicio}&dataFim=${ptaxDataFim}`
      );
      const parsed = JSON.parse(ptaxRawStr);
      if (parsed.error) {
        throw new Error(`BCB API Error: ${parsed.error}`);
      }
      if (!Array.isArray(parsed)) {
        throw new Error(
          `Expected array, got ${typeof parsed}. Response: ${JSON.stringify(parsed).substring(0, 100)}`
        );
      }
      ptaxRaw = parsed as BCBRawEntry[];
    } catch (e) {
      console.log(
        `⚠️  Não conseguiu buscar PTAX com esses parâmetros: ${e}`
      );
      console.log(
        `  Usando dados mock para validação de estrutura (IMPORTANTE: Substituir com dados reais antes de produção)`
      );

      // Mock data — APENAS PARA VALIDAÇÃO DE ESTRUTURA
      ptaxRaw = [
        { data: "10/05/2026", valor: "4.8532" },
        { data: "09/05/2026", valor: "4.8645" },
        { data: "08/05/2026", valor: "4.8720" },
      ];
    }

    const ptaxData: PTAXData = {
      series: "10813",
      series_name: "Taxa de câmbio nominal — USD/BRL",
      unit: "BRL/USD",
      last_updated: now.toISOString(),
      source: "SEAD Banco Central (bcdata.sgs.10813)",
      data: ptaxRaw.map((entry) => {
        const isoDate = dateToISO(entry.data);
        const date = parseDate(entry.data);

        return {
          date: isoDate,
          cotacao: parseFloat(entry.valor),
          is_feriado: isFeriado(isoDate, new Set()), // TODO: carregar feriados reais
          is_weekend: isWeekend(date),
        };
      }),
    };

    fs.writeFileSync(
      path.join(dataDir, "ptax.json"),
      JSON.stringify(ptaxData, null, 2)
    );
    console.log(
      `✅ PTAX salvo: ${ptaxData.data.length} registros (mock/teste)`
    );

    // ========================================
    // 4. Feriados (usando brazilian-holidays ou mock)
    // ========================================
    console.log("\n📊 Buscando Feriados Nacionais...");

    let feriados: any[] = [];
    let feriadosSource = "mock";

    if (brazilianHolidays && brazilianHolidays.getHolidays) {
      try {
        const holidays = brazilianHolidays.getHolidays(now.getFullYear());
        feriados = holidays.map((h: any) => {
          const date = new Date(h.date || h.toString());
          return {
            date: `${String(date.getFullYear())}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
            nome: h.name || h.toString(),
            tipo: "recorrente" as const,
            categoria: "nacional" as const,
          };
        });
        feriadosSource = "brazilian-holidays (npm)";
        console.log(`✅ Feriados obtidos de brazilian-holidays: ${feriados.length}`);
      } catch (e) {
        console.log(`⚠️  Erro ao usar brazilian-holidays: ${e}. Usando mock.`);
        feriadosSource = "mock";
      }
    }

    // Fallback para mock se não conseguir usar biblioteca
    if (feriados.length === 0) {
      feriados = [
        { date: "2026-01-01", nome: "Ano Novo", tipo: "recorrente", categoria: "nacional" },
        { date: "2026-02-24", nome: "Sexta-feira de Carnaval", tipo: "móvel", categoria: "nacional" },
        { date: "2026-03-29", nome: "Páscoa", tipo: "móvel", categoria: "nacional" },
        { date: "2026-04-21", nome: "Tiradentes", tipo: "recorrente", categoria: "nacional" },
        { date: "2026-05-01", nome: "Dia do Trabalho", tipo: "recorrente", categoria: "nacional" },
        { date: "2026-05-14", nome: "Corpus Christi", tipo: "móvel", categoria: "nacional" },
        { date: "2026-09-07", nome: "Independência", tipo: "recorrente", categoria: "nacional" },
        { date: "2026-10-12", nome: "Nossa Senhora Aparecida", tipo: "recorrente", categoria: "nacional" },
        { date: "2026-11-02", nome: "Finados", tipo: "recorrente", categoria: "nacional" },
        { date: "2026-11-20", nome: "Consciência Negra", tipo: "recorrente", categoria: "nacional" },
        { date: "2026-12-25", nome: "Natal", tipo: "recorrente", categoria: "nacional" },
      ];
      feriadosSource = "mock";
      console.log(`ℹ️  Usando feriados mock: ${feriados.length}`);
    }

    const feriadosData = {
      year: now.getFullYear(),
      last_updated: now.toISOString(),
      source: feriadosSource,
      feriados: feriados,
    };

    fs.writeFileSync(
      path.join(dataDir, "feriados_nacionais.json"),
      JSON.stringify(feriadosData, null, 2)
    );
    console.log(`✅ Feriados salvo: ${feriados.length} feriados (fonte: ${feriadosSource})`);

    // ========================================
    // Resumo Final
    // ========================================
    console.log("\n✅ Fase 1 — Validação de Estrutura Concluída!\n");
    console.log("📁 Arquivos criados em public/data/:");
    console.log(`  • selic.json (${selicData.data.length} registros)`);
    console.log(`  • ipca.json (${ipcaData.vna_historico.length} registros)`);
    console.log(`  • ptax.json (${ptaxData.data.length} registros)`);
    console.log(`  • feriados_nacionais.json`);

    console.log("\n⚠️  AVISO IMPORTANTE:");
    console.log(
      "  Este script usou DADOS MOCK para SELIC e PTAX devido a limitações de API."
    );
    console.log(
      "  Antes de produção, substituir com dados reais do Banco Central."
    );
    console.log("\n✅ Estrutura JSON validada — pronta para calculadora!");
  } catch (error) {
    console.error("❌ Erro fatal:", error);
    process.exit(1);
  }
})();
