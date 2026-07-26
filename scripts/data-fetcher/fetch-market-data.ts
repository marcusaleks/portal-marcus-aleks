/**
 * Script: Fetch Market Data from BCB
 * Busca dados do Banco Central e reconstrói tabelas de números-índice
 *
 * Padrão BCB:
 *   - Base: 1,00000000 em 31/12/1999 (DU anterior ao primeiro registro 03/01/2000)
 *   - Fórmula SELIC:  índice_t = trunc8(índice_{t-1} × (1 + taxa_diaria/100))
 *   - Fórmula PTAX:   índice_t = trunc8(cotacao_t / cotacao_base)
 *   - Fórmula IPCA:   índice_t = trunc8(índice_{t-1} × (1 + vna_mes/100))
 *   - Truncamento (não arredondamento) na 8ª casa decimal
 *   - Janela máx API BCB: 10 anos para séries diárias → busca em blocos
 */

import * as https from "https";
import * as fs from "fs";
import * as path from "path";

// ── Tipos ────────────────────────────────────────────────────────────────────

interface BCBRawEntry {
  data: string;  // "DD/MM/YYYY"
  valor: string;
}

interface SELICEntry {
  date: string;
  taxa_diaria: number;
  indice: number;
  tipo: "historico" | "projecao";
}

interface PTAXEntry {
  date: string;
  cotacao: number;
  indice: number;
}

interface IPCAEntry {
  date: string;         // "YYYY-MM-DD" (dia útil)
  taxa_diaria: number;  // taxa diária equivalente pro-rata (% a.d.)
  indice: number;
  tipo: "oficial" | "projecao";
}

interface IndexTable {
  series: string;
  series_name: string;
  base_date: string;
  base_value: number;
  last_updated: string;
  source: string;
  data: SELICEntry[] | PTAXEntry[] | IPCAEntry[];
}

// ── Utilidades ───────────────────────────────────────────────────────────────

function formatDateBR(d: Date): string {
  const day   = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${d.getFullYear()}`;
}

function dateToISO(dateStr: string): string {
  const [day, month, year] = dateStr.split("/");
  return `${year}-${month}-${day}`;
}

function parseDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day);
}

// Trunca (não arredonda) na 8ª casa decimal — padrão BCB
function trunc8(v: number): number {
  return Math.trunc(v * 1e8) / 1e8;
}

// Verifica se uma data ISO ("YYYY-MM-DD") é dia útil
function isDiaUtil(iso: string, feriadosSet: Set<string>): boolean {
  const [y, m, d] = iso.split("-").map(Number);
  const dow = new Date(y, m - 1, d).getDay(); // 0=Dom, 6=Sáb
  if (dow === 0 || dow === 6) return false;
  return !feriadosSet.has(iso);
}

// Constrói Set de datas ISO a partir da lista de feriados fixos
function buildFeriadosFixosSet(ano: number): Set<string> {
  const fixos = [
    { mes: 1,  dia: 1  }, { mes: 4,  dia: 21 }, { mes: 5,  dia: 1  },
    { mes: 9,  dia: 7  }, { mes: 10, dia: 12 }, { mes: 11, dia: 2  },
    { mes: 11, dia: 15 }, { mes: 12, dia: 25 },
  ];
  const set = new Set<string>();
  for (const f of fixos) {
    set.add(`${ano}-${String(f.mes).padStart(2,"0")}-${String(f.dia).padStart(2,"0")}`);
  }
  return set;
}

// Feriados fixos para vários anos (utilizado na filtragem das projeções COPOM)
function buildFeriadosSet(anoMin: number, anoMax: number): Set<string> {
  const set = new Set<string>();
  for (let ano = anoMin; ano <= anoMax; ano++) {
    for (const iso of buildFeriadosFixosSet(ano)) set.add(iso);
  }
  return set;
}

// Fetch com retry e backoff
function fetchWithRetry(url: string, maxRetries = 3): Promise<string> {
  return new Promise((resolve, reject) => {
    let attempt = 0;
    const doFetch = () => {
      attempt++;
      console.log(`  [Tentativa ${attempt}/${maxRetries}] ${url}`);
      https.get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      }).on("error", (e) => {
        if (attempt < maxRetries) {
          const delay = 500 * attempt;
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

// Busca uma série diária BCB em blocos de até 10 anos
async function fetchSerieCompleta(
  serie: string,
  dataInicial: string, // "DD/MM/YYYY"
  dataFinal: string    // "DD/MM/YYYY"
): Promise<BCBRawEntry[]> {
  const ini = parseDate(dataInicial);
  const fim = parseDate(dataFinal);
  const resultado: BCBRawEntry[] = [];

  let cursor = new Date(ini);
  while (cursor <= fim) {
    // Bloco de até 10 anos
    const blocoFim = new Date(cursor);
    blocoFim.setFullYear(blocoFim.getFullYear() + 10);
    if (blocoFim > fim) blocoFim.setTime(fim.getTime());

    const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${serie}/dados?format=json` +
      `&dataInicial=${formatDateBR(cursor)}&dataFinal=${formatDateBR(blocoFim)}`;

    const raw = await fetchWithRetry(url);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error(`Série ${serie}: resposta inesperada: ${JSON.stringify(parsed).substring(0, 100)}`);
    }
    resultado.push(...(parsed as BCBRawEntry[]));
    console.log(`  Bloco ${formatDateBR(cursor)} → ${formatDateBR(blocoFim)}: ${parsed.length} registros`);

    // Avança cursor para o dia seguinte ao fim do bloco
    cursor = new Date(blocoFim);
    cursor.setDate(cursor.getDate() + 1);
  }

  // Ordenar crescente e deduplicar
  resultado.sort((a, b) => parseDate(a.data).getTime() - parseDate(b.data).getTime());
  const seen = new Set<string>();
  return resultado.filter((e) => {
    if (seen.has(e.data)) return false;
    seen.add(e.data);
    return true;
  });
}

// ── Main ─────────────────────────────────────────────────────────────────────

(async () => {
  const now = new Date();
  const dataDir = path.join(__dirname, "..", "..", "public", "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const DATA_INICIAL = "03/01/2000"; // primeiro DU de 2000
  const DATA_FINAL   = formatDateBR(now);
  const BASE_DATE    = "1999-12-31";
  const BASE_VALUE   = 1.00000000;

  console.log("🚀 Iniciando fetch de dados do Banco Central...");
  console.log(`   Período: ${DATA_INICIAL} → ${DATA_FINAL}`);
  console.log(`   Base: ${BASE_DATE} = ${BASE_VALUE}\n`);

  // ══════════════════════════════════════════════════════════════════════════
  // 1. SELIC — Série 11 (taxa diária % a.d.)
  // ══════════════════════════════════════════════════════════════════════════
  console.log("📊 Buscando SELIC (Série 11)...");
  const selicRaw = await fetchSerieCompleta("11", DATA_INICIAL, DATA_FINAL);
  console.log(`  Total bruto: ${selicRaw.length} registros`);

  let selicIndice = BASE_VALUE;
  const selicEntries: SELICEntry[] = selicRaw.map((e) => {
    const taxa = parseFloat(e.valor);
    selicIndice = selicIndice * (1 + taxa / 100); // sem arredondamento intermediário
    return {
      date:        dateToISO(e.data),
      taxa_diaria: taxa,
      indice:      trunc8(selicIndice),            // truncar apenas na gravação
      tipo:        "historico" as const,
    };
  });

  // ── Projeção COPOM via Série 432 (SELIC-meta % a.a.) ────────────────────
  // A Série 432 publica a meta vigente para cada dia, incluindo dias futuros
  // já deliberados pelo COPOM (até a próxima reunião agendada).
  console.log("📊 Buscando projeções COPOM (Série 432)...");
  const hoje    = formatDateBR(now);
  const janFim  = new Date(now);
  janFim.setMonth(janFim.getMonth() + 3); // busca até 3 meses à frente
  try {
    const serie432Raw = await fetchWithRetry(
      `https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados?format=json` +
      `&dataInicial=${hoje}&dataFinal=${formatDateBR(janFim)}`
    );
    const serie432 = JSON.parse(serie432Raw) as BCBRawEntry[];
    console.log(`  Série 432: ${serie432.length} registros futuros`);

    // Último índice acumulado (puro, sem truncamento) — continua do histórico
    const ultimoHistorico = selicEntries[selicEntries.length - 1];
    const ultimaDataHist  = ultimoHistorico.date; // "YYYY-MM-DD"

    const projecoesCOPOM: SELICEntry[] = [];
    // selicIndice ainda contém o valor puro (não truncado) do último dia histórico
    let indiceProj = selicIndice;

    // Série 432 inclui sábados, domingos e feriados — filtrar apenas dias úteis
    const feriadosProj = buildFeriadosSet(now.getFullYear(), janFim.getFullYear());

    for (const e of serie432) {
      const iso = dateToISO(e.data);
      if (iso <= ultimaDataHist) continue; // só dias após o histórico
      if (!isDiaUtil(iso, feriadosProj)) continue; // ignora fins de semana e feriados

      // Converte meta anual % a.a. para fator diário (base 252 DU/ano — padrão BCB)
      const metaAnual  = parseFloat(e.valor) / 100;
      const taxaDiaria = Math.pow(1 + metaAnual, 1 / 252) - 1;
      indiceProj = indiceProj * (1 + taxaDiaria);

      projecoesCOPOM.push({
        date:        iso,
        taxa_diaria: parseFloat((taxaDiaria * 100).toFixed(6)),
        indice:      trunc8(indiceProj),
        tipo:        "projecao",
      });
    }

    selicEntries.push(...projecoesCOPOM);
    console.log(`  Projeções COPOM adicionadas: ${projecoesCOPOM.length} registros (até ${projecoesCOPOM[projecoesCOPOM.length - 1]?.date ?? "—"})`);
  } catch (e) {
    console.log(`  ⚠️  Sem projeções COPOM: ${e}`);
  }

  const selicTable: IndexTable = {
    series:       "11",
    series_name:  "SELIC — Taxa diária (% a.d.)",
    base_date:    BASE_DATE,
    base_value:   BASE_VALUE,
    last_updated: now.toISOString(),
    source:       "BCB — bcdata.sgs.11 + Série 432 (projeção COPOM)",
    data:         selicEntries,
  };
  fs.writeFileSync(path.join(dataDir, "selic.json"), JSON.stringify(selicTable, null, 2));
  const selicHist = selicEntries.filter(e => e.tipo === "historico").length;
  const selicProj = selicEntries.filter(e => e.tipo === "projecao").length;
  console.log(`✅ selic.json: ${selicHist} históricos + ${selicProj} projeções | índice final: ${selicEntries[selicEntries.length-1].indice}`);

  // ══════════════════════════════════════════════════════════════════════════
  // 2. PTAX — Série 10813 (cotação BRL/USD)
  // ══════════════════════════════════════════════════════════════════════════
  console.log("\n📊 Buscando PTAX (Série 10813)...");
  const ptaxRaw = await fetchSerieCompleta("10813", DATA_INICIAL, DATA_FINAL);
  console.log(`  Total bruto: ${ptaxRaw.length} registros`);

  // Base PTAX = cotação do DU anterior ao primeiro registro (31/12/1999)
  // Buscamos explicitamente
  let ptaxBase = BASE_VALUE;
  try {
    const ptaxBaseRaw = await fetchWithRetry(
      "https://api.bcb.gov.br/dados/serie/bcdata.sgs.10813/dados?format=json&dataInicial=30/12/1999&dataFinal=31/12/1999"
    );
    const ptaxBaseArr = JSON.parse(ptaxBaseRaw) as BCBRawEntry[];
    if (ptaxBaseArr.length > 0) {
      // Último DU de 1999
      const ultimo = ptaxBaseArr[ptaxBaseArr.length - 1];
      ptaxBase = parseFloat(ultimo.valor);
      console.log(`  Cotação base (${ultimo.data}): ${ptaxBase}`);
    }
  } catch (e) {
    console.log(`  ⚠️  Não conseguiu buscar cotação base PTAX: ${e}. Usando 1,00.`);
  }

  const ptaxEntries: PTAXEntry[] = ptaxRaw.map((e) => {
    const cotacao = parseFloat(e.valor);
    return {
      date:    dateToISO(e.data),
      cotacao: cotacao,
      indice:  trunc8(cotacao / ptaxBase),
    };
  });

  const ptaxTable: IndexTable = {
    series:       "10813",
    series_name:  "PTAX — Cotação USD/BRL (venda)",
    base_date:    BASE_DATE,
    base_value:   BASE_VALUE,
    last_updated: now.toISOString(),
    source:       "BCB — bcdata.sgs.10813",
    data:         ptaxEntries,
  };
  fs.writeFileSync(path.join(dataDir, "ptax.json"), JSON.stringify(ptaxTable, null, 2));
  console.log(`✅ ptax.json: ${ptaxEntries.length} registros | cotação base: ${ptaxBase} | índice final: ${ptaxEntries[ptaxEntries.length-1].indice}`);

  // ══════════════════════════════════════════════════════════════════════════
  // 3. IPCA — Série 433 (% mensal) + projeções Focus
  // ══════════════════════════════════════════════════════════════════════════
  console.log("\n📊 Buscando IPCA (Série 433)...");
  const ipcaRawStr = await fetchWithRetry(
    "https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?format=json&dataInicial=01/01/2000&dataFinal=" + DATA_FINAL
  );
  const ipcaRaw = JSON.parse(ipcaRawStr) as BCBRawEntry[];
  console.log(`  Total bruto: ${ipcaRaw.length} registros`);

  // Projeções Focus para meses ainda não divulgados
  const ultimoIPCA    = ipcaRaw[ipcaRaw.length - 1];
  const ultimaDataISO = dateToISO(ultimoIPCA.data);
  const [anoUlt, mesUlt] = ultimaDataISO.split("-").map(Number);

  console.log("📊 Buscando projeções IPCA Focus (BCB)...");
  const projecoesFocus: Array<{ data: string; valor: string }> = [];
  try {
    const mes1Num = mesUlt + 1 > 12 ? 1      : mesUlt + 1;
    const ano1    = mesUlt + 1 > 12 ? anoUlt + 1 : anoUlt;
    const mes2Num = mes1Num + 1 > 12 ? 1      : mes1Num + 1;
    const ano2    = mes1Num + 1 > 12 ? ano1 + 1  : ano1;
    const ref1 = `${String(mes1Num).padStart(2,"0")}/${ano1}`;
    const ref2 = `${String(mes2Num).padStart(2,"0")}/${ano2}`;

    const focusUrl = `https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativaMercadoMensais?` +
      `%24filter=Indicador%20eq%20'IPCA'%20and%20(DataReferencia%20eq%20'${ref1}'%20or%20DataReferencia%20eq%20'${ref2}')` +
      `&%24orderby=Data%20desc&%24top=4&%24format=json&%24select=Indicador,Data,DataReferencia,Mediana`;
    const focusStr = await fetchWithRetry(focusUrl);
    const focusParsed = JSON.parse(focusStr) as { value: Array<{ DataReferencia: string; Mediana: number }> };

    const vistos = new Set<string>();
    for (const entry of focusParsed.value) {
      if (vistos.has(entry.DataReferencia)) continue;
      vistos.add(entry.DataReferencia);
      const [mm, yyyy] = entry.DataReferencia.split("/");
      projecoesFocus.push({ data: `01/${mm}/${yyyy}`, valor: String(entry.Mediana) });
    }
    projecoesFocus.sort((a, b) => parseDate(a.data).getTime() - parseDate(b.data).getTime());
    console.log(`  Projeções: ${projecoesFocus.map(p => `${p.data}=${p.valor}%`).join(", ")}`);
  } catch (e) {
    console.log(`  ⚠️  Sem projeções Focus: ${e}`);
  }

  const ipcaTodos = [
    ...ipcaRaw.map(e => ({ data: e.data, valor: e.valor, tipo: "oficial" as const })),
    ...projecoesFocus.map(e => ({ data: e.data, valor: e.valor, tipo: "projecao" as const })),
  ];

  // Expande IPCA mensal para registros diários (um por DU) com pro-rata por DU reais do mês.
  // Convenção: taxa_diaria = (1 + ipca_mensal/100)^(1/du_mes) - 1
  // Acumulação em float puro; trunc8 apenas na gravação — padrão BCB.
  const feriadosIPCA = buildFeriadosSet(2000, now.getFullYear() + 1);

  // Conta dias úteis em um mês (ano, mes 0-based)
  function duDoMes(ano: number, mes: number): number {
    let count = 0;
    const dias = new Date(ano, mes + 1, 0).getDate();
    for (let d = 1; d <= dias; d++) {
      const iso = `${ano}-${String(mes + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      if (isDiaUtil(iso, feriadosIPCA)) count++;
    }
    return count;
  }

  // Gera array de DU de um mês em ordem crescente
  function duListDoMes(ano: number, mes: number): string[] {
    const list: string[] = [];
    const dias = new Date(ano, mes + 1, 0).getDate();
    for (let d = 1; d <= dias; d++) {
      const iso = `${ano}-${String(mes + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      if (isDiaUtil(iso, feriadosIPCA)) list.push(iso);
    }
    return list;
  }

  let ipcaIndice = BASE_VALUE;
  const ipcaEntries: IPCAEntry[] = [];

  for (const e of ipcaTodos) {
    const isoMes = dateToISO(e.data); // "YYYY-MM-DD" (primeiro dia do mês)
    const [ano, mes] = isoMes.split("-").map(Number);
    const valorMensal = parseFloat(e.valor);

    const duMes = duDoMes(ano, mes - 1);
    const taxaDiaria = duMes > 0
      ? Math.pow(1 + valorMensal / 100, 1 / duMes) - 1
      : 0;

    for (const iso of duListDoMes(ano, mes - 1)) {
      ipcaIndice = ipcaIndice * (1 + taxaDiaria);
      ipcaEntries.push({
        date:        iso,
        taxa_diaria: parseFloat((taxaDiaria * 100).toFixed(8)),
        indice:      trunc8(ipcaIndice),
        tipo:        e.tipo,
      });
    }
  }

  const ipcaTable: IndexTable = {
    series:       "433",
    series_name:  "IPCA — Índice de Preços ao Consumidor Amplo (% mensal)",
    base_date:    BASE_DATE,
    base_value:   BASE_VALUE,
    last_updated: now.toISOString(),
    source:       "BCB — bcdata.sgs.433 + Expectativas Focus",
    data:         ipcaEntries,
  };
  fs.writeFileSync(path.join(dataDir, "ipca.json"), JSON.stringify(ipcaTable, null, 2));
  const ipcaOficiais  = ipcaEntries.filter(e => e.tipo === "oficial").length;
  const ipcaProjecoes = ipcaEntries.filter(e => e.tipo === "projecao").length;
  console.log(`✅ ipca.json: ${ipcaOficiais} oficiais + ${ipcaProjecoes} projeções | índice final: ${ipcaEntries[ipcaEntries.length-1].indice}`);

  // ══════════════════════════════════════════════════════════════════════════
  // 4. Feriados (mock — sem dependência de biblioteca externa)
  // ══════════════════════════════════════════════════════════════════════════
  console.log("\n📊 Gerando feriados nacionais...");
  const feriadosFixos = [
    { mes: 1,  dia: 1,  nome: "Confraternização Universal" },
    { mes: 4,  dia: 21, nome: "Tiradentes" },
    { mes: 5,  dia: 1,  nome: "Dia do Trabalho" },
    { mes: 9,  dia: 7,  nome: "Independência do Brasil" },
    { mes: 10, dia: 12, nome: "Nossa Senhora Aparecida" },
    { mes: 11, dia: 2,  nome: "Finados" },
    { mes: 11, dia: 15, nome: "Proclamação da República" },
    { mes: 12, dia: 25, nome: "Natal" },
  ];
  const feriados: Array<{ date: string; nome: string }> = [];
  for (let ano = 2000; ano <= now.getFullYear() + 1; ano++) {
    for (const f of feriadosFixos) {
      feriados.push({
        date: `${ano}-${String(f.mes).padStart(2,"0")}-${String(f.dia).padStart(2,"0")}`,
        nome: f.nome,
      });
    }
  }
  const feriadosData = {
    last_updated: now.toISOString(),
    source: "Feriados nacionais fixos (Lei 9.093/1995)",
    feriados,
  };
  fs.writeFileSync(path.join(dataDir, "feriados_nacionais.json"), JSON.stringify(feriadosData, null, 2));
  console.log(`✅ feriados_nacionais.json: ${feriados.length} registros`);

  // ══════════════════════════════════════════════════════════════════════════
  // Resumo final
  // ══════════════════════════════════════════════════════════════════════════
  console.log("\n✅ Concluído!");
  console.log(`   selic.json  : ${selicEntries.length} registros (${selicEntries[0].date} → ${selicEntries[selicEntries.length-1].date})`);
  console.log(`   ptax.json   : ${ptaxEntries.length} registros (${ptaxEntries[0].date} → ${ptaxEntries[ptaxEntries.length-1].date})`);
  console.log(`   ipca.json   : ${ipcaEntries.length} registros (${ipcaEntries[0].date} → ${ipcaEntries[ipcaEntries.length-1].date})`);
})();
