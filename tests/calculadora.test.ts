import {
  toISO,
  fromISO,
  isWeekend,
  isDiaUtil,
  ultimoDiaUtil,
  contarDiasUteis,
  buscaAnteriorOuIgual,
  buildFeriadosSet,
} from "../lib/calculadora/utils";
import { indiceSelicNaData, calcularFatorSelic } from "../lib/calculadora/selic";
import { calcularFatorPTAX, indicePTAXNaData } from "../lib/calculadora/ptax";
import { calcularFluxoIndexado } from "../lib/calculadora/index";
import { isErroCalculadora } from "../lib/types/market-data";
import type {
  SELICData,
  IPCAData,
  PTAXData,
  FeriadosData,
  MarketData,
} from "../lib/types/market-data";

// ─── Fixtures ───────────────────────────────────────────────────────────────

const feriadosSemFeriados: FeriadosData = {
  last_updated: "2026-01-01T00:00:00Z",
  source: "mock",
  feriados: [],
};

const feriadosComFeriado: FeriadosData = {
  last_updated: "2026-01-01T00:00:00Z",
  source: "mock",
  feriados: [
    { date: "2026-05-01", nome: "Dia do Trabalho" },
  ],
};

// SELIC com taxa 10,5% ao ano e índice calculado recursivamente.
// Base 1,00000000 em 04/05/2026 (domingo) para que data_ini=05/05 tenha DU anterior.
function gerarSelicFixture(dias: number): SELICData {
  const metaAnual = 10.5 / 100;
  const fator = Math.pow(1 + metaAnual, 1 / 252);
  let indice = 1.0;
  const data: SELICData["data"] = [];

  for (let i = 0; i < dias; i++) {
    const d = new Date(2026, 4, 4 + i); // 04/05/2026 + i dias
    indice = indice * fator;
    data.push({
      date: toISO(d),
      taxa_diaria: parseFloat(((fator - 1) * 100).toFixed(6)),
      indice: parseFloat(indice.toFixed(8)),
      tipo: "historico",
    });
  }

  return {
    series: "11",
    series_name: "Taxa SELIC — mock",
    base_date: "2026-05-03",
    base_value: 1,
    last_updated: "2026-05-10T00:00:00Z",
    source: "mock",
    data,
  };
}

const selicFixture = gerarSelicFixture(30);

const ptaxFixture: PTAXData = {
  series: "10813",
  series_name: "PTAX mock",
  base_date: "1999-12-31",
  base_value: 1,
  last_updated: "2026-05-10T00:00:00Z",
  source: "mock",
  data: [
    { date: "2026-05-05", cotacao: 5.00, indice: 1.0 },
    { date: "2026-05-06", cotacao: 5.05, indice: 1.01 },
    { date: "2026-05-07", cotacao: 5.10, indice: 1.02 },
    { date: "2026-05-08", cotacao: 5.20, indice: 1.04 },
  ],
};

// IPCA diário: simula maio/2026 com taxa mensal de 0,40% distribuída em 20 DU
// DU de maio/2026: 04,05,06,07,08,11,12,13,14,15,18,19,20,21,22,25,26,27,28,29
function gerarIpcaFixture(): IPCAData {
  const ipcaMensal = 0.40 / 100;
  const duMes = 20;
  const taxaDiaria = Math.pow(1 + ipcaMensal, 1 / duMes) - 1;
  const diasUteisMaio = [4,5,6,7,8,11,12,13,14,15,18,19,20,21,22,25,26,27,28,29];
  let indice = 1.0;
  const data: IPCAData["data"] = [];
  for (const dia of diasUteisMaio) {
    indice = indice * (1 + taxaDiaria);
    data.push({
      date: `2026-05-${String(dia).padStart(2,"0")}`,
      taxa_diaria: parseFloat((taxaDiaria * 100).toFixed(8)),
      indice: parseFloat(indice.toFixed(8)),
      tipo: "oficial",
    });
  }
  return {
    series: "433",
    series_name: "IPCA mock",
    base_date: "1999-12-31",
    base_value: 1,
    last_updated: "2026-05-10T00:00:00Z",
    source: "mock",
    data,
  };
}

const ipcaFixture = gerarIpcaFixture();

const marketDataFixture: MarketData = {
  selic: selicFixture,
  ipca: ipcaFixture,
  ptax: ptaxFixture,
  feriados: feriadosSemFeriados,
  loaded_at: "2026-05-10T00:00:00Z",
};

// ─── Utils ───────────────────────────────────────────────────────────────────

describe("utils — toISO / fromISO", () => {
  test("toISO formata corretamente sem timezone shift", () => {
    const d = new Date(2026, 4, 10); // 10/05/2026 local
    expect(toISO(d)).toBe("2026-05-10");
  });

  test("fromISO cria data em meia-noite local", () => {
    const d = fromISO("2026-05-10");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(4);
    expect(d.getDate()).toBe(10);
  });
});

describe("utils — isWeekend", () => {
  test("sábado é fim de semana", () => {
    expect(isWeekend(new Date(2026, 4, 9))).toBe(true);  // sáb
  });
  test("domingo é fim de semana", () => {
    expect(isWeekend(new Date(2026, 4, 10))).toBe(true); // dom
  });
  test("segunda não é fim de semana", () => {
    expect(isWeekend(new Date(2026, 4, 11))).toBe(false);// seg
  });
});

describe("utils — isDiaUtil", () => {
  const ferSet = buildFeriadosSet(feriadosComFeriado);

  test("01/05 é feriado — não é dia útil", () => {
    expect(isDiaUtil(new Date(2026, 4, 1), ferSet)).toBe(false);
  });
  test("segunda sem feriado é dia útil", () => {
    expect(isDiaUtil(new Date(2026, 4, 4), ferSet)).toBe(true);
  });
  test("sábado não é dia útil", () => {
    expect(isDiaUtil(new Date(2026, 4, 9), ferSet)).toBe(false);
  });
});

describe("utils — ultimoDiaUtil", () => {
  test("domingo retrocede para sexta", () => {
    const domingo = new Date(2026, 4, 10);
    const result = ultimoDiaUtil(domingo, buildFeriadosSet(feriadosSemFeriados));
    expect(toISO(result)).toBe("2026-05-08"); // sexta
  });

  test("01/05 (feriado sexta) retrocede para 30/04 (quinta)", () => {
    const result = ultimoDiaUtil(new Date(2026, 4, 1), buildFeriadosSet(feriadosComFeriado));
    expect(toISO(result)).toBe("2026-04-30");
  });

  test("dia útil permanece inalterado", () => {
    const seg = new Date(2026, 4, 11);
    const result = ultimoDiaUtil(seg, buildFeriadosSet(feriadosSemFeriados));
    expect(toISO(result)).toBe("2026-05-11");
  });
});

describe("utils — contarDiasUteis", () => {
  test("semana completa seg-sex = 5 dias úteis", () => {
    const ini = new Date(2026, 4, 11); // seg
    const fim = new Date(2026, 4, 16); // sáb (exclusive)
    const count = contarDiasUteis(ini, fim, buildFeriadosSet(feriadosSemFeriados));
    expect(count).toBe(5);
  });

  test("feriado na semana reduz contagem", () => {
    const ini = new Date(2026, 3, 27); // seg
    const fim = new Date(2026, 4, 2);  // sáb (exclusive), inclui 01/05
    const count = contarDiasUteis(ini, fim, buildFeriadosSet(feriadosComFeriado));
    expect(count).toBe(4); // seg,ter,qua,qui — 01/05 sexta é feriado
  });
});

describe("utils — buscaAnteriorOuIgual", () => {
  const arr = [
    { date: "2026-05-05", v: 1 },
    { date: "2026-05-07", v: 2 },
    { date: "2026-05-09", v: 3 },
  ];

  test("data exata retorna o registro correto", () => {
    expect(buscaAnteriorOuIgual(arr, "2026-05-07")?.v).toBe(2);
  });

  test("data entre registros retorna o anterior", () => {
    expect(buscaAnteriorOuIgual(arr, "2026-05-06")?.v).toBe(1);
  });

  test("data antes de tudo retorna null", () => {
    expect(buscaAnteriorOuIgual(arr, "2026-05-01")).toBeNull();
  });

  test("data depois de tudo retorna o último", () => {
    expect(buscaAnteriorOuIgual(arr, "2026-05-15")?.v).toBe(3);
  });
});

// ─── Motor SELIC ─────────────────────────────────────────────────────────────

describe("SELIC — indiceSelicNaData", () => {
  test("retorna índice para dia útil disponível", () => {
    const val = indiceSelicNaData(new Date(2026, 4, 7), selicFixture, feriadosSemFeriados);
    expect(val).toBeGreaterThan(1);
  });

  test("retroatua fim de semana — sábado e domingo produzem mesmo índice", () => {
    // Convenção overnight: indiceSelicNaData(d) usa DU anterior a d
    // sáb 09/05 → DU anterior = sex 08/05
    // dom 10/05 → recua para sáb 09/05 → ultimoDiaUtil = sex 08/05
    const valSab = indiceSelicNaData(new Date(2026, 4, 9), selicFixture, feriadosSemFeriados);
    const valDom = indiceSelicNaData(new Date(2026, 4, 10), selicFixture, feriadosSemFeriados);
    expect(valSab).toBe(valDom);
  });

  test("retorna 1.0 quando data_ini = 03/01/2000 (base inferida por descapitalização de 31/12/1999)", () => {
    const selicBase: SELICData = {
      series: "11",
      series_name: "mock base",
      base_date: "1999-12-31",
      base_value: 1,
      last_updated: "2026-01-01T00:00:00Z",
      source: "mock",
      data: [
        { date: "2000-01-03", taxa_diaria: 0.069186, indice: 1.00069186, tipo: "historico" },
        { date: "2000-01-04", taxa_diaria: 0.069186, indice: 1.00138419, tipo: "historico" },
      ],
    };
    // data_ini = 03/01/2000 → recua 1 dia → 02/01/2000 (dom) → último DU = 31/12/1999 → retorna 1.0
    const val = indiceSelicNaData(new Date(2000, 0, 3), selicBase, feriadosSemFeriados);
    expect(val).toBe(1.0);
  });

  test("lança erro para datas anteriores a 03/01/2000", () => {
    const selicBase: SELICData = {
      series: "11",
      series_name: "mock base",
      base_date: "1999-12-31",
      base_value: 1,
      last_updated: "2026-01-01T00:00:00Z",
      source: "mock",
      data: [
        { date: "2000-01-03", taxa_diaria: 0.069186, indice: 1.00069186, tipo: "historico" },
      ],
    };
    // data_ini = 02/01/2000 → recua 1 dia → 01/01/2000 (sáb) → último DU = 31/12/1999... não, recua mais
    // Usar 15/12/1999 para garantir data recuada < 31/12/1999
    expect(() =>
      indiceSelicNaData(new Date(1999, 11, 15), selicBase, feriadosSemFeriados)
    ).toThrow("Base de dados inexistente para datas anteriores a 03/01/2000");
  });
});

describe("SELIC — calcularFatorSelic", () => {
  test("fator > 1 para período positivo", () => {
    const ini = new Date(2026, 4, 5);
    const fim = new Date(2026, 4, 12);
    const r = calcularFatorSelic(ini, fim, selicFixture, feriadosSemFeriados);
    expect(r.fator).toBeGreaterThan(1);
  });

  test("fator termina no dia útil anterior a data_fim (SELIC para antes)", () => {
    const ini = new Date(2026, 4, 5);
    const fim = new Date(2026, 4, 8); // qui
    const r = calcularFatorSelic(ini, fim, selicFixture, feriadosSemFeriados);
    // data_fim_efetiva deve ser 07/05 (qua) — dia útil anterior a 08/05
    expect(r.data_fim_efetiva).toBe("2026-05-07");
  });

  test("corretude aproximada para 1 dia útil com taxa 10,5%", () => {
    // Entre 05/05 e 06/05 (1 dia útil), fator esperado ≈ (1,105)^(1/252)
    const ini = new Date(2026, 4, 5);
    const fim = new Date(2026, 4, 7); // para terminar em 06/05
    const r = calcularFatorSelic(ini, fim, selicFixture, feriadosSemFeriados);
    const esperado = Math.pow(1.105, 1 / 252);
    expect(r.fator).toBeCloseTo(esperado, 4);
  });
});

// ─── Motor PTAX ──────────────────────────────────────────────────────────────

describe("PTAX — calcularFatorPTAX", () => {
  test("fator correto entre duas datas com dados", () => {
    const ini = new Date(2026, 4, 5); // 5,00
    const fim = new Date(2026, 4, 8); // 5,20
    const r = calcularFatorPTAX(ini, fim, ptaxFixture, feriadosSemFeriados);
    expect(r.fator).toBeCloseTo(5.20 / 5.00, 6);
    expect(r.cotacao_ini).toBe(5.00);
    expect(r.cotacao_fim).toBe(5.20);
  });

  test("fim de semana retroatua — domingo usa sexta", () => {
    // 10/05 dom → retroatua para 08/05 sex
    const val = indicePTAXNaData(new Date(2026, 4, 10), ptaxFixture, feriadosSemFeriados);
    expect(val).toBe(5.20); // cotação de 08/05
  });

  test("lança erro se sem dados anteriores", () => {
    const ini = new Date(2026, 0, 1); // 01/01/2026 — antes do fixture
    const fim = new Date(2026, 4, 8);
    expect(() =>
      calcularFatorPTAX(ini, fim, ptaxFixture, feriadosSemFeriados)
    ).toThrow();
  });
});

// ─── Orquestrador ────────────────────────────────────────────────────────────

describe("calcularFluxoIndexado — validações", () => {
  test("erro DATA_INVALIDA com datas inválidas", () => {
    const r = calcularFluxoIndexado({
      valor_inicial: 1000,
      fluxos: [],
      data_inicial: new Date("invalid"),
      data_final: new Date(2026, 4, 10),
      indice: "selic",
      marketData: marketDataFixture,
    });
    expect(isErroCalculadora(r)).toBe(true);
    if (isErroCalculadora(r)) expect(r.codigo).toBe("DATA_INVALIDA");
  });

  test("erro PERIODO_INVALIDO quando data_fim <= data_ini", () => {
    const r = calcularFluxoIndexado({
      valor_inicial: 1000,
      fluxos: [],
      data_inicial: new Date(2026, 4, 10),
      data_final: new Date(2026, 4, 5),
      indice: "selic",
      marketData: marketDataFixture,
    });
    expect(isErroCalculadora(r)).toBe(true);
    if (isErroCalculadora(r)) expect(r.codigo).toBe("PERIODO_INVALIDO");
  });

  test("erro FLUXO_FORA_PERIODO quando fluxo está antes de data_ini", () => {
    const r = calcularFluxoIndexado({
      valor_inicial: 1000,
      fluxos: [{ data: new Date(2026, 3, 1), valor: 500 }], // abr/2026 — antes do período
      data_inicial: new Date(2026, 4, 5),
      data_final: new Date(2026, 4, 10),
      indice: "selic",
      marketData: marketDataFixture,
    });
    expect(isErroCalculadora(r)).toBe(true);
    if (isErroCalculadora(r)) expect(r.codigo).toBe("FLUXO_FORA_PERIODO");
  });
});

describe("calcularFluxoIndexado — cálculo SELIC", () => {
  test("resultado sem fluxos adicionais — saldo cresce com SELIC", () => {
    const r = calcularFluxoIndexado({
      valor_inicial: 10000,
      fluxos: [],
      data_inicial: new Date(2026, 4, 5),
      data_final: new Date(2026, 4, 9), // 5 dias depois
      indice: "selic",
      marketData: marketDataFixture,
    });

    expect(isErroCalculadora(r)).toBe(false);
    if (!isErroCalculadora(r)) {
      expect(r.valor_final).toBeGreaterThan(10000);
      expect(r.taxa_retorno).toBeGreaterThan(0);
      expect(r.valor_inicial).toBe(10000);
      expect(r.detalhamento).toHaveLength(1);
    }
  });

  test("aporte no meio do período é capitalizado da data do aporte", () => {
    const r = calcularFluxoIndexado({
      valor_inicial: 10000,
      fluxos: [{ data: new Date(2026, 4, 7), valor: 5000 }],
      data_inicial: new Date(2026, 4, 5),
      data_final: new Date(2026, 4, 12),
      indice: "selic",
      marketData: marketDataFixture,
    });

    expect(isErroCalculadora(r)).toBe(false);
    if (!isErroCalculadora(r)) {
      expect(r.valor_final).toBeGreaterThan(15000);
      expect(r.detalhamento).toHaveLength(2);
    }
  });

  test("resgate reduz o saldo final", () => {
    const semResgate = calcularFluxoIndexado({
      valor_inicial: 10000,
      fluxos: [],
      data_inicial: new Date(2026, 4, 5),
      data_final: new Date(2026, 4, 12),
      indice: "selic",
      marketData: marketDataFixture,
    });

    const comResgate = calcularFluxoIndexado({
      valor_inicial: 10000,
      fluxos: [{ data: new Date(2026, 4, 7), valor: -3000 }],
      data_inicial: new Date(2026, 4, 5),
      data_final: new Date(2026, 4, 12),
      indice: "selic",
      marketData: marketDataFixture,
    });

    if (!isErroCalculadora(semResgate) && !isErroCalculadora(comResgate)) {
      expect(comResgate.valor_final).toBeLessThan(semResgate.valor_final);
    }
  });

  test("propriedades de output corretas", () => {
    const r = calcularFluxoIndexado({
      valor_inicial: 10000,
      fluxos: [],
      data_inicial: new Date(2026, 4, 5),
      data_final: new Date(2026, 4, 12),
      indice: "selic",
      marketData: marketDataFixture,
    });

    if (!isErroCalculadora(r)) {
      expect(r.dias_uteis).toBeGreaterThan(0);
      expect(r.custo_oportunidade).toBeCloseTo(r.valor_final - r.valor_inicial, 2);
      expect(r.taxa_retorno_decimal).toBeCloseTo(r.taxa_retorno / 100, 5);
      expect(r.indice).toBe("selic");
    }
  });
});

describe("calcularFluxoIndexado — cálculo PTAX", () => {
  test("resultado PTAX reflete variação cambial", () => {
    const r = calcularFluxoIndexado({
      valor_inicial: 10000,
      fluxos: [],
      data_inicial: new Date(2026, 4, 5), // 5,00
      data_final: new Date(2026, 4, 8),   // 5,20
      indice: "ptax",
      marketData: marketDataFixture,
    });

    expect(isErroCalculadora(r)).toBe(false);
    if (!isErroCalculadora(r)) {
      // Valorização de 4%: 5,20/5,00 = 1,04
      expect(r.valor_final).toBeCloseTo(10400, 0);
      expect(r.taxa_retorno).toBeCloseTo(4.0, 1);
    }
  });
});

describe("calcularFluxoIndexado — cálculo IPCA (pro-rata diário)", () => {
  test("saldo cresce com IPCA ao longo de dias úteis", () => {
    const r = calcularFluxoIndexado({
      valor_inicial: 10000,
      fluxos: [],
      data_inicial: new Date(2026, 4, 5),  // 05/05
      data_final:   new Date(2026, 4, 12), // 12/05
      indice: "ipca",
      marketData: marketDataFixture,
    });
    expect(isErroCalculadora(r)).toBe(false);
    if (!isErroCalculadora(r)) {
      expect(r.valor_final).toBeGreaterThan(10000);
      expect(r.taxa_retorno).toBeGreaterThan(0);
    }
  });

  test("resultado pro-rata: 5 DU vale menos que 10 DU", () => {
    const r5 = calcularFluxoIndexado({
      valor_inicial: 10000,
      fluxos: [],
      data_inicial: new Date(2026, 4, 5),
      data_final:   new Date(2026, 4, 11), // 5 DU
      indice: "ipca",
      marketData: marketDataFixture,
    });
    const r10 = calcularFluxoIndexado({
      valor_inicial: 10000,
      fluxos: [],
      data_inicial: new Date(2026, 4, 5),
      data_final:   new Date(2026, 4, 19), // 10 DU
      indice: "ipca",
      marketData: marketDataFixture,
    });
    if (!isErroCalculadora(r5) && !isErroCalculadora(r10)) {
      expect(r5.valor_final).toBeLessThan(r10.valor_final);
    }
  });

  test("acumulação correta: 20 DU (mês inteiro) ≈ 0,40% sobre 10.000", () => {
    // Convenção overnight: indice_ini = DU anterior a data_ini, indice_fim = DU anterior a data_fim
    // Para capturar os 20 DU de maio, precisamos:
    //   data_ini tal que DU anterior = antes do primeiro DU da tabela → base_value=1
    //   data_fim tal que DU anterior = 29/05 (último DU do mês)
    // data_ini = 04/05 → DU anterior = 30/04 (fora da tabela) → base_value=1
    // data_fim = 30/05 (ou qualquer dia cujo DU anterior seja 29/05)
    const indiceFim = ipcaFixture.data[ipcaFixture.data.length - 1].indice; // índice após 20 DU
    const esperado = 10000 * (indiceFim / ipcaFixture.base_value);
    const r = calcularFluxoIndexado({
      valor_inicial: 10000,
      fluxos: [],
      data_inicial: new Date(2026, 4, 4),  // 04/05 → DU anterior = 30/04 (fora da tabela) → base_value
      data_final:   new Date(2026, 4, 30), // 30/05 → DU anterior = 29/05 (último DU do mês)
      indice: "ipca",
      marketData: marketDataFixture,
    });
    if (!isErroCalculadora(r)) {
      expect(r.valor_final).toBeCloseTo(esperado, 1);
    }
  });
});

describe("calcularFluxoIndexado — overflow", () => {
  test("erro OVERFLOW_NUMERICO para período > 50 anos", () => {
    const r = calcularFluxoIndexado({
      valor_inicial: 1000,
      fluxos: [],
      data_inicial: new Date(1970, 0, 1),
      data_final: new Date(2026, 4, 10),
      indice: "selic",
      marketData: marketDataFixture,
    });
    expect(isErroCalculadora(r)).toBe(true);
    if (isErroCalculadora(r)) expect(r.codigo).toBe("OVERFLOW_NUMERICO");
  });
});
