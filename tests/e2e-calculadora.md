# Roteiro de Testes E2E — Calculadora de Fluxo Indexado

**Versão:** 1.0  
**Data:** 2026-05-10  
**Referência oficial:** https://www3.bcb.gov.br/CALCIDADAO/publico/exibirFormCorrecaoValores.do  
**Critério de aprovação:** diferença ≤ R$ 0,02 em todos os casos (diferenças na última casa decimal são artefato de exibição do BCB, não erro de cálculo)

---

## Caso 1 — SELIC, ano completo

**Objetivo:** verificar correção SELIC em período de 12 meses.

| Campo | Valor |
|-------|-------|
| Data inicial | 02/01/2020 |
| Data final | 31/12/2020 |
| Valor | R$ 10.000,00 |
| Fluxos adicionais | nenhum |

**No BCB:** aba "Taxa Selic" — mesmo período e valor.

**Resultado esperado (SELIC):** ≈ R$ 10.274,00  
*(fator ≈ 1,02740 — ano da queda de juros COVID)*

**Checklist:**
- [ ] Portal aceita as datas sem erro
- [ ] Resultado SELIC confere com BCB (≤ R$ 0,02 de diferença)
- [ ] Cards IPCA e PTAX exibem valores sem erro
- [ ] Gráfico renderiza 3 linhas para o período

---

## Caso 2 — IPCA, período longo

**Objetivo:** confirmar paridade com BCB em período histórico longo.  
*(Este caso já foi verificado nos testes unitários — serve para validar que o frontend repassa os parâmetros corretamente ao motor)*

| Campo | Valor |
|-------|-------|
| Data inicial | 03/01/2000 |
| Data final | 01/04/2026 |
| Valor | R$ 1.000,00 |
| Fluxos adicionais | nenhum |

**No BCB:** aba "IPCA" — mesmo período e valor.

**Resultado esperado (IPCA):** R$ 4.749,97

**Checklist:**
- [ ] Portal aceita período de 26 anos sem erro
- [ ] Resultado IPCA = R$ 4.749,97 (≤ R$ 0,02 de diferença)
- [ ] Gráfico renderiza sem travar (período longo com ~320 pontos mensais)

---

## Caso 3 — PTAX, data inicial em feriado nacional

**Objetivo:** verificar retroatuação correta quando a data inicial cai em feriado.

| Campo | Valor |
|-------|-------|
| Data inicial | 07/09/2021 (Independência — feriado nacional) |
| Data final | 07/09/2022 |
| Valor | R$ 10.000,00 |
| Fluxos adicionais | nenhum |

**No BCB:** aba "Dólar americano (PTAX)" — mesmo período e valor.

**O que verificar:** a calculadora deve aceitar 07/09/2021 sem erro e usar internamente a cotação de 06/09/2021 (último DU anterior). Comparar valor final PTAX com o BCB.

**Checklist:**
- [ ] Portal aceita 07/09/2021 sem erro de validação
- [ ] Resultado PTAX confere com BCB (≤ R$ 0,02 de diferença)
- [ ] Resultado SELIC e IPCA também exibem valores coerentes para o mesmo período

---

## Caso 4 — SELIC, com aporte intermediário

**Objetivo:** verificar capitalização individualizada por fluxo.

| Campo | Valor |
|-------|-------|
| Data inicial | 02/01/2023 |
| Data final | 02/01/2024 |
| Valor | R$ 10.000,00 |
| Fluxo adicional | + R$ 5.000,00 em 03/07/2023 |

**No BCB:** calcule separadamente e some:
1. R$ 10.000 de 02/01/2023 a 02/01/2024
2. R$ 5.000 de 03/07/2023 a 02/01/2024

**Resultado esperado (SELIC):** soma dos dois resultados acima  
*(R$ 10.000 × fator_ano + R$ 5.000 × fator_semestre)*

**Checklist:**
- [ ] Portal aceita fluxo adicional sem erro
- [ ] Resultado SELIC confere com a soma manual calculada no BCB (≤ R$ 0,02)
- [ ] Gráfico mostra salto no saldo na data do aporte (03/07/2023)

---

## Caso 5 — Período curto (mesmo mês)

**Objetivo:** verificar comportamento em período inferior a 1 mês.

| Campo | Valor |
|-------|-------|
| Data inicial | 02/01/2026 |
| Data final | 30/01/2026 |
| Valor | R$ 10.000,00 |
| Fluxos adicionais | nenhum |

**No BCB:** aba "Taxa Selic" — mesmo período e valor.

**Resultado esperado (SELIC):** ≈ R$ 10.110,84

**O que verificar:** período curto sem erro; IPCA mostra variação pequena (pro-rata dentro do mês); PTAX mostra variação cambial do período.

**Checklist:**
- [ ] Portal aceita período de 28 dias úteis sem erro
- [ ] Resultado SELIC ≈ R$ 10.110,84 (≤ R$ 0,02 de diferença)
- [ ] IPCA exibe valor menor que SELIC (juros altos em jan/2026)
- [ ] Gráfico renderiza mesmo com poucos pontos de amostragem

---

## Resultado Consolidado

| Caso | Índice principal | Status | Observações |
|------|-----------------|--------|-------------|
| 1 — SELIC ano completo | SELIC | ⬜ | |
| 2 — IPCA período longo | IPCA | ⬜ | |
| 3 — PTAX com feriado | PTAX | ⬜ | |
| 4 — SELIC com aporte | SELIC | ⬜ | |
| 5 — Período curto | SELIC/IPCA/PTAX | ⬜ | |

**Legenda:** ✅ Aprovado · ❌ Reprovado · ⬜ Não testado

---

*Roteiro gerado em 2026-05-10 — preencher durante testes no preview Vercel antes do merge para `main`*
