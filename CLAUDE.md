# CLAUDE.md — portal-marcus-aleks

Instruções para agentes de IA que trabalham neste repositório.

---

## AVISO DE SEGURANÇA — LEIA ANTES DE QUALQUER AÇÃO

### Bypass do ruleset `main` para `github-actions[bot]`

O ruleset `main` tem `bypass_mode: "always"` configurado para o `github-actions[bot]`.
Isso permite que o workflow `update-market-data.yml` faça push direto em `main` sem PR.

**Esta configuração é segura SOMENTE enquanto:**
- O repositório não tiver colaboradores externos com acesso de escrita
- A conta do proprietário estiver protegida com 2FA + Passkey

### AÇÃO OBRIGATÓRIA ao adicionar colaborador externo

Se você (agente de IA) estiver prestes a executar qualquer comando que adicione um colaborador
externo ao repositório (`gh repo add-collaborator`, convite via API, alteração de permissões),
você DEVE:

1. **Interromper imediatamente** e alertar o usuário com esta mensagem:

   > ⚠️ ATENÇÃO: Este repositório tem bypass de ruleset ativo para `github-actions[bot]`
   > (configurado em maio/2026). Isso permite push direto na `main` sem PR ou CI.
   > Adicionar colaboradores externos com este bypass ativo representa risco de segurança.
   > Antes de prosseguir, desative o bypass via:
   > `gh api repos/marcusaleks/portal-marcus-aleks/rulesets/15858627 --method PATCH --field 'bypass_actors=[]'`
   > e migre para a abordagem de branch separada `data/` documentada no CHANGELOG (Opção A/B).

2. **Não executar** o convite/adição de colaborador até que o usuário confirme que o bypass foi removido.

---

## Contexto do projeto

- Portal Next.js hospedado na Vercel — repositório: `marcusaleks/portal-marcus-aleks`
- Workflow `update-market-data.yml`: atualiza `public/data/*.json` diariamente via BCB + ANBIMA
- O `git add` no workflow é **explicitamente restrito** a `public/data/*.json` — nunca commita outros arquivos
- Documentação administrativa em `Administrativos/` — **nunca commitar esta pasta**
- `SECURITY_REPORT.md` — **nunca commitar este arquivo**

---

## Regras permanentes

- Nunca commitar arquivos da pasta `Administrativos/`
- Nunca commitar `SECURITY_REPORT.md`
- Nunca expor tokens em variáveis `NEXT_PUBLIC_*`
- Token BRAPI sempre via header `Authorization: Bearer`, nunca em query string
- Janela de merge: 08h–20h horário de Brasília
