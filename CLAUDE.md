# CLAUDE.md — portal-marcus-aleks

Instruções para agentes de IA que trabalham neste repositório.

---

## Regras permanentes

- Nunca commitar arquivos da pasta `Administrativos/`
- Nunca commitar `SECURITY_REPORT.md`
- Nunca expor tokens em variáveis `NEXT_PUBLIC_*`
- Token BRAPI sempre via header `Authorization: Bearer`, nunca em query string
- Janela de merge: 08h–20h horário de Brasília
  - **Exceção formal:** workflow `update-market-data` opera fora da janela por dependência das fontes (ANBIMA ~20h BRT, IBGE de manhã). Ver `Administrativos/ADENDO_02_LEI_OPERACAO_MAD_v1_0_LLM.md`.

## Contexto do projeto

- Portal Next.js hospedado na Vercel — repositório: `marcusaleks/portal-marcus-aleks`
- Workflow `update-market-data.yml`: atualiza `public/data/*.json` diariamente via BCB + ANBIMA
- Documentação administrativa em `Administrativos/` — nunca commitar esta pasta

## Automação de dados — fluxo de duas contas

O workflow `update-market-data` usa duas identidades para preservar Lei §10.2 (aprovação obrigatória):

- **`DATA_BOT_TOKEN`** — PAT da conta `marcusaleks` (admin). Faz push em `data/automated`, abre o PR, e habilita `--auto` no merge.
- **`DATA_BOT_APPROVER_TOKEN`** — PAT classic da conta secundária `marcus-aleks` (permissão `write`, escopo `repo`). Aprova o PR aberto pelo `DATA_BOT_TOKEN` — o GitHub bloqueia auto-aprovação da mesma identidade que abriu o PR.

Ambos rotacionados conforme Lei §10.3 (90 dias). Ver `secrets.manifest.json`.

## Antes de adicionar colaboradores externos

Consulte o responsável pelo projeto antes de qualquer alteração de permissões ou convite de colaboradores. Há configurações de infraestrutura que precisam ser revisadas nesse cenário.
