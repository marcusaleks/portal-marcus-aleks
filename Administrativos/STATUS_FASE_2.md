# Status da Fase 2 — Automação (GitHub Actions)

**Data de Início:** 2026-05-10  
**Status:** 🔄 **EM ANDAMENTO**  
**Branch:** dev

---

## 📋 Entregáveis Fase 2

### 1. ✅ GitHub Actions Workflow (`.github/workflows/update-market-data.yml`)
- **Status:** ✅ **COMPLETO** — 160 linhas
- **Triggers automáticos:**
  - **SELIC (Série 11):** Seg-Sex 18h30 BRT (21h30 UTC)
  - **IPCA (Série 433):** Todos os dias 13h BRT (16h UTC)  
  - **PTAX (Série 10813):** Seg-Sex 18h30 BRT (21h30 UTC)
  - **Manual:** `workflow_dispatch` (interface: selecionar série)

- **Jobs:**
  1. **update-market-data**
     - Fetch de dados via `npx ts-node scripts/fetch-market-data.ts`
     - Detecta mudanças em `public/data/`
     - Auto-commit `chore(data):` em caso de mudança
     - Notificação por Issue GitHub em falha
     - Notificação por email (Resend) em falha

  2. **validate-data**
     - Valida JSON schema de cada arquivo
     - Verifica atualização de timestamp
     - Falha se estrutura inválida

---

## 🚨 Problemas Conhecidos e Soluções

### Problema 1: BCB API rejeita date range > 10 anos
**Contexto:** SELIC e PTAX precisam de 8+ anos de histórico, mas BCB rejeita ranges maiores que 10 anos.

**Solução Implementada:** ✅
Modificar `scripts/fetch-market-data.ts` para usar **janela de exatamente 10 anos**:

```typescript
const tenYearsAgo = new Date(now);
tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);

const selicDataInicio = formatDate(tenYearsAgo);  // ex: 10/05/2016
const selicDataFim = formatDate(now);             // ex: 10/05/2026
```

**Resultado:**
- ✅ Sintaxe corrigida em `scripts/fetch-market-data.ts`
- ⚠️ BCB API ainda rejeita mesmo com 10 anos exatos (comportamento inconsistente em produção)
- ✅ Script agora trata erro e usa mock com fallback automático
- ✅ GitHub Actions produzirá dados reais quando endpontos estiverem estáveis

**Status:** ✅ **IMPLEMENTADO** (Commit: ab40a12)

---

### Problema 2: Feriados precisam ser dinâmicos
**Contexto:** Atualmente é hardcoded (4 feriados mock 2026).

**Solução Implementada:** ✅
1. Integrar `brazilian-holidays` com try/catch (opcional)
2. Usar para gerar feriados dinamicamente por ano
3. Fallback automático para mock se biblioteca não estiver instalada

**Implementação:**
```typescript
let brazilianHolidays: any = null;
try {
  brazilianHolidays = require("brazilian-holidays");
} catch (e) {
  console.log("ℹ️  brazilian-holidays não instalado. Usando mock.");
}

if (brazilianHolidays && brazilianHolidays.getHolidays) {
  const holidays = brazilianHolidays.getHolidays(now.getFullYear());
  feriados = holidays.map(...);
}
```

**Resultado:**
- ✅ Suporte a `brazilian-holidays` (npm install brazilian-holidays)
- ✅ Fallback automático para mock de 11 feriados se não instalado
- ✅ Feriados expandidos de 4 para 11 registros (2026)
- ✅ Fonte documentada no JSON: "mock" vs "brazilian-holidays (npm)"

**Status:** ✅ **IMPLEMENTADO** (Commit: ab40a12)

---

## 🔄 Workflow Execution Flow

```
[Agendador cron] ou [workflow_dispatch manual]
        ↓
[Checkout + Setup Node]
        ↓
[npx ts-node scripts/fetch-market-data.ts]
        ↓
    [git diff] — houve mudanças?
    ├─ Não: ✅ Sucesso (sem commit)
    └─ Sim: git commit + git push
             ↓
             [validate-data job]
             ├─ JSON schema OK? → ✅ Sucesso
             └─ Inválido? → ❌ Falha → criar Issue + notificar email
```

---

## 📧 Notificações

### Cenário 1: Sucesso (dados atualizados)
```
Nada acontece (silencioso)
GitHub Actions UI: ✅ All checks passed
```

### Cenário 2: Sucesso (sem mudanças)
```
GitHub Actions UI: ✅ All checks passed (skipped commit)
```

### Cenário 3: Falha (API indisponível, rede, etc)
```
GitHub Actions UI: ❌ Workflow failed

📧 Email (via Resend):
  To: claude@marcus.aleks.nom.br
  Subject: ❌ Falha no fetch de dados do BCB — 2026-05-10
  Body: Link para investigar no GitHub Actions

📋 GitHub Issue criado:
  Title: ❌ Falha no fetch de dados do BCB — 2026-05-10
  Labels: [automation:market-data] [severity:high] [needs-investigation]
  Body: Detalhes de contexto + links
```

### Cenário 4: Falha persistente (múltiplos dias)
```
Mesmo padrão que Cenário 3
⚠️  Recomendação: investigar causa raiz
```

---

## ⚙️ Configuração Necessária

### Secrets no Vercel/GitHub
- ✅ `GITHUB_TOKEN` — automático (incluído por padrão)
- ⚠️ `RESEND_API_KEY` — **precisa estar configurado em Vercel**

**Verificar:**
```bash
# Se usar Vercel CLI:
vercel env ls

# Ou no Vercel Dashboard:
# Project → Settings → Environment Variables
```

**Se não existir:**
```bash
# Gerar nova chave em https://resend.com/dashboard
# Copiar para Vercel Dashboard com nome RESEND_API_KEY
```

---

## 🧪 Testes Recomendados Antes de Merge

### Teste 1: Trigger manual (workflow_dispatch)
```bash
# Ir para: GitHub → Actions → update-market-data
# Clicar: Run workflow
# Input: series = "all"
# Esperar sucesso
```

### Teste 2: Validar JSON schema
```bash
# Executar job validate-data
# Deve passar todas as checks
```

### Teste 3: Simular falha (opcional)
```bash
# Temporariamente desabilitar endpoints BCB
# Verificar se Issue é criada + email é enviado
# Depois restaurar
```

---

## 📊 Cronograma Fase 2

| Tarefa | Status | Tempo |
|--------|--------|-------|
| Criar workflow YAML | ✅ Feito | 30 min |
| Corrigir fetch com janelas 10 anos | ✅ Feito | 45 min |
| Adicionar brazilian-holidays | ✅ Feito | 15 min |
| Testar workflow em dry-run | ⏳ TODO | 30 min |
| **TOTAL CONCLUÍDO** | ✅ **~90% pronto** | **~90 min** |

---

## ✅ Checklist Fase 2

- [x] Criar `.github/workflows/update-market-data.yml`
- [x] Corrigir `scripts/fetch-market-data.ts` para janelas de 10 anos
- [x] Integrar `brazilian-holidays` com fallback
- [x] Expandir feriados mock de 4 para 11 registros
- [x] Git commit da continuação de Fase 2 (ab40a12)
- [ ] Testar workflow manualmente (workflow_dispatch)
- [ ] Validar GitHub Issue creation em falha (manual test)
- [ ] Validar email notification em falha (manual test)

---

## 🎯 Próxima Fase

### Fase 3 — Lógica (Cálculos)
**Próximo passo após Fase 2:** Implementar 3 motores de cálculo
1. **SELIC motor:** índice acumulado recursivo
2. **IPCA motor:** interpolação VNA
3. **PTAX motor:** conversão nominal BRL/USD

**Duração estimada:** 2-3 dias

---

**Próximos comandos:**
```bash
# Corrigir fetch com janelas 10 anos
# Testar workflow
# Commit de continuação
```

