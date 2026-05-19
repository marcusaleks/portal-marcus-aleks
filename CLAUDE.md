# CLAUDE.md — portal-marcus-aleks

Instruções para agentes de IA que trabalham neste repositório.

---

## AVISO DE SEGURANÇA — LEIA ANTES DE QUALQUER AÇÃO

### Bypass do ruleset `main` — Repository admin

O ruleset `main` tem bypass configurado para **Repository admin** (configurado em maio/2026).
O workflow `update-market-data.yml` usa o secret `DATA_BOT_TOKEN` (PAT clássico da conta
`marcusaleks` com escopo `repo`) no checkout e no push, autenticando como admin e passando
pelo bypass. Isso permite que o workflow faça push direto em `main` sem PR.

**Por que não `github-actions[bot]`:** o GitHub Actions não aparece como opção de bypass actor
no plano atual da conta — apenas Deploy keys, Repository admin, Maintain, Write, Copilot e Vercel.

**Riscos conhecidos e aceitos (maio/2026):**
- O PAT `DATA_BOT_TOKEN` tem escopo `repo` completo — em caso de vazamento, daria acesso
  de leitura e escrita a todos os repositórios da conta `marcusaleks`, não só a este
- O bypass de "Repository admin" é mais amplo que o ideal — qualquer admin bypassa o ruleset,
  não apenas o bot
- Zero Trust não foi comprometido: o token não está no código, não aparece em logs
  (GitHub mascara automaticamente) e não está em variáveis públicas

**Mitigação futura:** quando fine-grained PATs com escopo por repositório (`contents: write`
apenas para este repo) tiverem suporte estável a bypass de rulesets, migrar e revogar o PAT atual.

**Esta configuração é segura SOMENTE enquanto:**
- O repositório não tiver colaboradores externos com acesso de escrita
- A conta do proprietário estiver protegida com 2FA + Passkey
- O `DATA_BOT_TOKEN` não for comprometido (rotacionar em caso de suspeita)

### AÇÃO OBRIGATÓRIA ao adicionar colaborador externo

Se você (agente de IA) estiver prestes a executar qualquer comando que adicione um colaborador
externo ao repositório (`gh repo add-collaborator`, convite via API, alteração de permissões),
você DEVE:

1. **Interromper imediatamente** e alertar o usuário com esta mensagem:

   > ⚠️ ATENÇÃO: Este repositório tem duas configurações que precisam ser revistas antes
   > de adicionar colaboradores externos (configuradas em maio/2026):
   >
   > 1. **Bypass de ruleset:** "Repository admin" pode fazer push direto na `main` sem PR ou CI.
   >    Remover via: Settings → Rules → main → Bypass list → remover Repository admin.
   >    Depois migrar para branch separada `data/` (Opção A/B do histórico de decisões).
   >
   > 2. **DATA_BOT_TOKEN:** PAT clássico com escopo `repo` completo armazenado como Actions Secret.
   >    Revogar em: github.com/settings/tokens — e substituir por fine-grained PAT com escopo
   >    restrito a este repositório (`contents: write` apenas).
   >
   > Não prosseguir com o convite até que o usuário confirme que ambos os pontos foram tratados.

2. **Não executar** o convite/adição de colaborador até que o usuário confirme explicitamente.

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
