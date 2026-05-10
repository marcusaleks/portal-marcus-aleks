# Status da Fase 2 — Automação (GitHub Actions)

**Data de Início:** 2026-05-10  
**Status:** 🔄 **EM ANDAMENTO**  
**Branch:** dev

---

## 📋 Entregáveis Fase 2

### 1. 🔄 GitHub Actions Workflow (`.github/workflows/update-market-data.yml`)
- **Status:** ✅ **CRIADO** — 160 linhas
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

**Solução para Fase 2:**
Modificar `scripts/fetch-market-data.ts` para usar **janelas deslizantes de 10 anos**:

```typescript
// Ao invés de buscar 8-9 anos de uma vez:
// dataInicio: 10/05/2018, dataFim: 10/05/2026
// BCB rejeita: "janela máxima é 10 anos"

// Solução: fazer múltiplas buscas de 10 anos:
// 1ª: 10/05/2018 até 10/05/2028 (espera aprovação)
// 2ª: 11/05/2008 até 10/05/2018 (se precisar histórico completo)

// Para Fase 2:
// - Buscar apenas últimos 10 anos (cobre todo histórico necessário)
// - GitHub Actions roda diariamente = sempre terá dados recentes
```

**Implementação prevista:**
```typescript
const today = new Date();
const tenYearsAgo = new Date(today);
tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);

// Garante que sempre respeita limite BCB
const selicDataInicio = formatDate(tenYearsAgo);  // ex: 10/05/2016
const selicDataFim = formatDate(today);           // ex: 10/05/2026
```

**Status:** ⏳ **Será implementado na continuação de Fase 2**

---

### Problema 2: Feriados precisam ser dinâmicos
**Contexto:** Atualmente é hardcoded (4 feriados mock 2026).

**Solução para Fase 2:**
1. Instalar `npm install brazilian-holidays`
2. Usar para gerar feriados dinamicamente por ano

**Pseudocódigo:**
```typescript
import holidays from "brazilian-holidays";

const feriadosData = {
  year: now.getFullYear(),
  last_updated: now.toISOString(),
  source: "brazilian-holidays (npm)",
  feriados: holidays
    .getHolidays(now.getFullYear())
    .map(h => ({
      date: h.date.toISOString().split('T')[0],
      nome: h.name,
      tipo: "recorrente" as const,
      categoria: "nacional" as const,
    }))
};
```

**Status:** ⏳ **Será implementado na continuação de Fase 2**

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
| Corrigir fetch com janelas 10 anos | ⏳ TODO | 45 min |
| Adicionar brazilian-holidays | ⏳ TODO | 15 min |
| Testar workflow em dry-run | ⏳ TODO | 30 min |
| Merge para dev | ⏳ TODO | 5 min |
| **TOTAL FASE 2** | 🔄 **Em andamento** | **~2h** |

---

## ✅ Checklist Fase 2

- [x] Criar `.github/workflows/update-market-data.yml`
- [ ] Corrigir `scripts/fetch-market-data.ts` para janelas de 10 anos
- [ ] Instalar `brazilian-holidays` e integrar
- [ ] Testar workflow manualmente (workflow_dispatch)
- [ ] Validar GitHub Issue creation em falha
- [ ] Validar email notification em falha
- [ ] Git commit da continuação de Fase 2
- [ ] Merge para dev (não precisa main ainda)

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

