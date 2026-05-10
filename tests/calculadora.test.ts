import {
  toISO,
  fromISO,
  addDays,
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
  year: 2026,
  last_updated: "2026-01-01T00:00:00Z",
  source: "mock",
  feriados: [],
};

const feriadosComFeriado: FeriadosData = {
  year: 2026,
  last_updated: "2026-01-01T00:00:00Z",
  source: "mock",
  feriados: [
    { date: "2026-05-01", nome: "Dia do Trabalho", tipo: "recorrente", categoria: "nacional" },
  ],
};

// SELIC com taxa 10,5% ao ano e índice calculado recursivamente
// Base 100.000 em 2026-05-05 (segunda-feira)
function gerarSelicFixture(dias: number): SELICData {
  const taxa = 10.5;
  const fator = Math.pow(1 + taxa / 100, 1 / 252);
  let indice = 100000;
  const data: SELICData["data"] = [];

  for (let i = 0; i < dias; i++) {
    const d = new Date(2026, 4, 5 + i); // 05/05/2026 + i dias
    indice = indice * fator;
    data.push({
      date: toISO(d),
      taxa_diaria: taxa,
      indice_acumulado: parseFloat(indice.toFixed(6)),
      is_feriado: false,
      is_weekend: isWeekend(d),
    });
  }

  return {
    series: "11",
    series_name: "Taxa SELIC — média diária",
    unit: "%",
    last_updated: "2026-05-10T00:00:00Z",
    source: "mock",
    data,
  };
}

const selicFixture = gerarSelicFixture(30);

const ptaxFixture: PTAXData = {
  series: "10813",
  series_name: "Taxa de câmbio nominal — USD/BRL",
  unit: "BRL/USD",
  last_updated: "2026-05-10T00:00:00Z",
  source: "mock",
  data: [
    { date: "2026-05-05", cotacao: 5.00, is_feriado: false, is_weekend: false },
    { date: "2026-05-06", cotacao: 5.05, is_feriado: false, is_weekend: false },
    { date: "2026-05-07", cotacao: 5.10, is_feriado: false, is_weekend: false },
    { date: "2026-05-08", cotacao: 5.20, is_feriado: false, is_weekend: false },
  ],
};

const ipcaFixture: IPCAData = {
  series: "433",
  series_name: "IPCA",
  unit: "%",
  last_updated: "2026-05-10T00:00:00Z",
  source: "mock",
  oficial: { mes: "2026-04", valor: 0.52, data_divulgacao: "2026-05-08T00:00:00Z" },
  projecao: { mes: "2026-05", valor: 0.40, fonte: "mock", data_atualizacao: "2026-05-10T00:00:00Z" },
  vna_historico: [
    { date: "2026-01-01", vna: 0.35, tipo: "oficial" },
    { date: "2026-02-01", vna: 0.42, tipo: "oficial" },
    { date: "2026-03-01", vna: 0.63, tipo: "oficial" },
    { date: "2026-04-01", vna: 0.52, tipo: "oficial" },
  ],
};

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
    expect(val).toBeGreaterThan(100000);
  });

  test("retroatua fim de semana para sexta", () => {
    // 09/05 sáb → deve usar 08/05 sex
    const valSab = indiceSelicNaData(new Date(2026, 4, 9), selicFixture, feriadosSemFeriados);
    const valSex = indiceSelicNaData(new Date(2026, 4, 8), selicFixture, feriadosSemFeriados);
    expect(valSab).toBe(valSex);
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
      // Com aporte de 5000, saldo_final > que sem aporte
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
