# CLAUDE.md — portal-marcus-aleks

Instruções para agentes de IA que trabalham neste repositório.

---

## Regras permanentes

- Nunca commitar arquivos da pasta `Administrativos/`
- Nunca commitar `SECURITY_REPORT.md`
- Nunca expor tokens em variáveis `NEXT_PUBLIC_*`
- Token BRAPI sempre via header `Authorization: Bearer`, nunca em query string
- Janela de merge: 08h–20h horário de Brasília

## Contexto do projeto

- Portal Next.js hospedado na Vercel — repositório: `marcusaleks/portal-marcus-aleks`
- Workflow `update-market-data.yml`: atualiza `public/data/*.json` diariamente via BCB + ANBIMA
- Documentação administrativa em `Administrativos/` — nunca commitar esta pasta

## Antes de adicionar colaboradores externos

Consulte o responsável pelo projeto antes de qualquer alteração de permissões ou convite de colaboradores. Há configurações de infraestrutura que precisam ser revisadas nesse cenário.
