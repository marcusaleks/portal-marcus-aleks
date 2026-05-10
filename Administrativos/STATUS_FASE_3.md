# Status da Fase 3 — Lógica de Cálculo (Concluída)

**Data de Conclusão:** 2026-05-10  
**Status:** ✅ **CONCLUÍDA**  
**Commit:** `da4e070`  
**Branch:** feat/calculadora-fundacao

---

## Entregáveis

### lib/calculadora/utils.ts
Helpers compartilhados por todos os motores.

- `toISO` / `fromISO` — conversão Date ↔ "YYYY-MM-DD" sem desvio de timezone
- `isWeekend`, `isFeriado`, `isDiaUtil` — classificação de dias
- `ultimoDiaUtil` — retroatua para o último dia útil (usado em feriados/fins de semana)
- `contarDiasUteis` — conta dias úteis em [ini, fim) — usado em dias_uteis e interpolação VNA
- `buscaAnteriorOuIgual` — busca binária em arrays ordenadas por date (O log n)
- `buildFeriadosSet` — constrói Set<string> a partir de FeriadosData

### lib/calculadora/selic.ts
Motor de cálculo SELIC.

- `indiceSelicNaData` — índice acumulado numa data específica com retroatuação
- `calcularFatorSelic` — fator entre data_ini e data_fim
- Implementa a regra crítica: **termina no dia útil ANTERIOR a data_fim**
- Tolerante a gaps de dados via `buscaAnteriorOuIgual`

### lib/calculadora/ipca.ts
Motor de cálculo IPCA com interpolação VNA.

- `calcularVNA` — calcula VNA para qualquer data pela fórmula:
  `VNA_d = VNA_15ant × (1 + IPCA_mes)^(du / DU)`
- `calcularFatorIPCA` — razão VNA_fim / VNA_ini
- `indiceIPCANaData` — exposto para o orquestrador
- Prioridade de dados: histórico real > oficial > projeção Focus

### lib/calculadora/ptax.ts
Motor de cálculo PTAX.

- `calcularFatorPTAX` — fator = PTAX_fim / PTAX_ini
- `indicePTAXNaData` — cotação com retroatuação automática em feriados
- Retroatuação em ambas as pontas (ini e fim)

### lib/calculadora/index.ts
Orquestrador principal — `calcularFluxoIndexado`.

**Algoritmo — Valor Presente Individualizado:**
```
Saldo_Final = Σ V_i × (Índice_final / Índice_i)
```

**Validações implementadas:**

| Código | Condição |
|--------|----------|
| `DATA_INVALIDA` | data_inicial ou data_final não é Date válida |
| `PERIODO_INVALIDO` | data_final ≤ data_inicial |
| `OVERFLOW_NUMERICO` | período > 50 anos |
| `FLUXO_FORA_PERIODO` | fluxo com data fora de [data_ini, data_fim] |
| `DADOS_INCOMPLETOS` | índice indisponível em data_final |
| `INDICE_NAO_ENCONTRADO` | índice indisponível na data de um fluxo |

### tests/calculadora.test.ts
Suite de 34 testes — 100% passando.

| Grupo | Testes |
|-------|--------|
| utils (toISO, fromISO) | 2 |
| utils (isWeekend) | 3 |
| utils (isDiaUtil) | 3 |
| utils (ultimoDiaUtil) | 3 |
| utils (contarDiasUteis) | 2 |
| utils (buscaAnteriorOuIgual) | 4 |
| SELIC (indiceSelicNaData) | 2 |
| SELIC (calcularFatorSelic) | 3 |
| PTAX (calcularFatorPTAX) | 3 |
| Orquestrador (validações) | 3 |
| Orquestrador (SELIC) | 4 |
| Orquestrador (PTAX) | 1 |
| Orquestrador (overflow) | 1 |
| **Total** | **34** |

---

## Decisões de Implementação

**Por que `buscaAnteriorOuIgual` em vez de busca exata?**
Dados do BCB têm gaps naturais (fins de semana e feriados não têm registros). A busca retroativa garante que sempre encontramos o índice mais recente disponível sem lançar erro desnecessário.

**Por que `ultimoDiaUtil` em vez de avançar para o próximo dia útil?**
A especificação e o padrão BCB/Tesouro retroatuam (usam o último disponível). Avançar alteraria o período de capitalização de forma incorreta.

**Por que `indice_final` calculado uma vez e reutilizado?**
O algoritmo Valor Presente Individualizado requer o mesmo `Índice_final` para todos os fluxos. Calculá-lo fora do loop garante consistência e evita N chamadas à API de dados.

---

## Resultado de Testes

```
Test Suites: 1 passed, 1 total
Tests:       34 passed, 34 total
Time:        0.696s
```

TypeScript: `npx tsc --noEmit` — 0 erros.

---

## Checklist Fase 3

- [x] lib/calculadora/utils.ts — helpers compartilhados
- [x] lib/calculadora/selic.ts — motor SELIC
- [x] lib/calculadora/ipca.ts — motor IPCA com VNA
- [x] lib/calculadora/ptax.ts — motor PTAX
- [x] lib/calculadora/index.ts — orquestrador com 6 validações
- [x] tests/calculadora.test.ts — 34 testes, 100% passando
- [x] TypeScript sem erros de compilação
- [x] Commit da4e070 em feat/calculadora-fundacao

---

## Estado Geral do Projeto

| Fase | Status | Commit |
|------|--------|--------|
| 1 — Fundação | ✅ Concluída | 8afe0d6 |
| 2 — Automação | ✅ Concluída | 8f78f27 |
| 3 — Lógica | ✅ Concluída | da4e070 |
| 4 — UI | 🔄 Iniciando | — |
| 5 — Export | ⏳ Aguardando | — |
| 6 — Deploy | ⏳ Aguardando | — |
