# CHANGELOG — portal-marcus-aleks

Todas as mudanças relevantes deste projeto são documentadas aqui.  
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).  
Versionamento segue [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [1.4.1] — 2026-07-21

### Security

- **Bump `fast-uri` via override (`3.1.3`) — corrige [GHSA-4c8g-83qw-93j6](https://github.com/advisories/GHSA-4c8g-83qw-93j6) (host confusion via IDN, high):** advisory publicada horas após a release 1.4.0, novamente bloqueando o check `npm audit --audit-level=high`. `fast-uri` é dep transitiva do Next.js. Fix via `overrides` pinando `fast-uri@3.1.3` para o range vulnerável `>=3.0.0 <=3.1.2`.

### Compliance (auditoria 2026-07-21)

- **[MEDIO-5] ISSUE-001 encerrado — `fetchYahooIndex` e `fetchYahooCurrency` migrados de `range=1d` para `range=5d`** ([pages/api/market.ts:11](pages/api/market.ts#L11) e [pages/api/market.ts:30](pages/api/market.ts#L30)). Yahoo omitia `previousClose` no payload de 1 dia após fechamento do mercado (observado no EWZ), fazendo o fallback em cascata cair no `previousClose` sintético calculado a partir do `defaultChange` hardcoded. Com janela de 5 dias, `chartPreviousClose` vem confiável do histórico. Preço já era correto; agora a variação % também é.
- **[MEDIO-4 + BAIXO-7] `mad-compliance.yml` estendido** com dois jobs novos: `commitlint` (bloqueante, roda em pull_request e push, valida mensagens de commit contra o Adendo 01 §A) e `pr-template` (verifica presença de `.github/pull_request_template.md` conforme Lei §7). Workflow agora também dispara em `push` para `main` e `staging`, cobrindo o gap identificado pela auditoria.
- **Governança:** fluxo de duas contas (`DATA_BOT_TOKEN` / `DATA_BOT_APPROVER_TOKEN`) documentado em [CLAUDE.md](CLAUDE.md). Metadata completa do novo secret registrada em `secrets.manifest.json` (arquivo interno, não commitado — regra permanente do repositório). Exceção formal da janela 08h-20h para o workflow `update-market-data` registrada em `Administrativos/ADENDO_02_LEI_OPERACAO_MAD_v1_0_LLM.md` (documento interno, não commitado).

### Notas administrativas

- Achado ALTO-1 da auditoria (branch protection de `main` sem `required_approving_review_count` nem `require_code_owner_reviews`) requer ação manual do Tech Lead pela UI do GitHub — passo-a-passo em `Administrativos/ACAO_MANUAL_ALTO_1_BRANCH_PROTECTION.md`. Este PR não altera branch protection.
- Achados BAIXO-6 (CODEOWNERS granularidade) e BAIXO-8 (tracking dos achados 01/02 da auditoria 2026-05-17) reconhecidos e deixados como backlog de baixa prioridade.

---

## [1.4.0] — 2026-07-21

### Security

- **Bump `brace-expansion` / `js-yaml` / `@babel/core` via overrides:** advisories publicadas no GitHub Security Database entre 2026-07-20 e 2026-07-21 bloquearam o check `npm audit --audit-level=high` em todos os PRs automáticos de `data/automated` — [GHSA-3jxr-9vmj-r5cp](https://github.com/advisories/GHSA-3jxr-9vmj-r5cp) DoS em `brace-expansion <1.1.16 || >=2.0.0 <2.1.2`, [GHSA-h67p-54hq-rp68](https://github.com/advisories/GHSA-h67p-54hq-rp68) + [GHSA-52cp-r559-cp3m](https://github.com/advisories/GHSA-52cp-r559-cp3m) DoS quadrático em `js-yaml <=3.14.2 || 4.0.0-4.2.0`, [GHSA-4x5r-pxfx-6jf8](https://github.com/advisories/GHSA-4x5r-pxfx-6jf8) arbitrary file read em `@babel/core <=7.29.0`. Fix via `overrides` no `package.json` (mesmo padrão do fix do `tmp` em maio) pinando `brace-expansion@1.1.16` (canal 1.x) + `2.1.2` (canal 2.x), `js-yaml@3.15.0` (canal 3.x) + `4.3.0` (canal 4.x), `@babel/core@^7.29.1`. Auditoria de supply-chain (573 deps × IoCs jun-jul/2026: Red Hat Miasma, Injective Labs, jscrambler, AsyncAPI) executada antes do bump — zero matches. Permanecem 2 alertas moderate no `uuid<11.1.1` via `exceljs` (não bloqueiam threshold high). PR #88.

### Added

- **Rota `/api/selic-meta` server-side** consumindo a Série BCB 1178 (meta COPOM em % a.d.). Substitui o fetch client-side direto a `api.bcb.gov.br` no card "Selic Meta" da home — elimina dependência de CORS, esconde URL externa do bundle, e habilita cache HTTP edge (`s-maxage=300, stale-while-revalidate=600`). PR #44.

### Changed

- **Card "Selic Meta" resiliente ([`components/mercados/CurvaDICard.tsx`](components/mercados/CurvaDICard.tsx)):** estado inicial mudou de `'14,40%'` hardcoded para `null+loading`. Quando o BCB está indisponível, o card mostra `—` + dot âmbar + tooltip explicativo em vez de valor falso indistinguível de real. Timestamp "HH:MM" exibido ao lado do valor quando `live`. Label corrigido de "Selic Efetiva" para "Selic Meta" (Série 1178 é meta COPOM, não taxa efetiva diária — que é a Série 11). PR #44.

---

## [1.3.4] — 2026-05-27

### Security

- **Bump `tmp` via override (`^0.2.6`) — corrige [GHSA-ph9p-34f9-6g65](https://github.com/advisories/GHSA-ph9p-34f9-6g65) (Path Traversal, high):** advisory publicada em 2026-05-26 bloqueou o check `npm audit --audit-level=high` em todos os PRs automáticos de `data/automated` sem qualquer alteração no projeto (o step consulta o registry a cada execução). `tmp` é dep transitiva de `exceljs@4.4.0`; override força `0.2.7` (patch bump compatível com o range `^0.2.0` declarado por exceljs — sem breaking change). Auditoria de supply-chain (577 deps × IoCs de 7 campanhas: Nx s1ngularity, qix chalk/debug, duckdb, Shai-Hulud 1.0/2.0, Mini Shai-Hulud) executada antes do bump — zero matches. Permanecem 2 alertas moderate no `uuid<11.1.1` via exceljs (não bloqueiam threshold high). PR #43.

---

## [1.3.3] — 2026-05-19

### Fixed

- **Aprovação automática do bot no workflow `update-market-data`:** o ruleset `main` exige 1 aprovação mesmo com todos os checks verdes. O `DATA_BOT_TOKEN` (Repository admin) passa a aprovar o próprio PR antes de habilitar o auto-merge, preservando a proteção geral de `main` para PRs humanos. (Nota histórica: este fluxo foi substituído em 2026-07-21 pela conta secundária `marcus-aleks` no PR #89 — o GitHub bloqueia auto-aprovação da mesma identidade que abriu o PR, quebrando este mecanismo em algum momento após maio/2026.)

---

## [1.3.2] — 2026-05-19

### Fixed

- **Informações de infraestrutura expostas no `CLAUDE.md` público:** detalhes de configurações internas foram removidos do arquivo e movidos para memória privada do agente (fora do repositório). O `CLAUDE.md` mantém apenas regras operacionais genéricas.

---

## [1.3.1] — 2026-05-18

### Fixed

- **Data fixa no card Curva DI · Juros Futuros:** o campo `asOf` representa a data do pregão ANBIMA (estática por definição) e não refletia quando o dado foi de fato atualizado. Substituído por `last_updated` (timestamp ISO gerado pelo script `fetch-curva-di.ts` a cada execução), com `timeZone: 'America/Sao_Paulo'` para exibição correta no fuso brasileiro. A data exibida agora muda automaticamente a cada run do workflow diário.

---

## [1.3.0] — 2026-05-19

### Fixed

- **Câmbio (USD, EUR, GBP) com valores desatualizados (~1 ano):** a AwesomeAPI falhava silenciosamente nas requisições originadas nos servidores Vercel, servindo fallbacks hardcoded sem aviso ao usuário. Migrado para **Yahoo Finance** (`BRL=X`, `EURBRL=X`, `GBPBRL=X`) via nova função `fetchYahooCurrency`. Corrigido cálculo de variação diária via `chartPreviousClose` (Yahoo não retorna `previousClose` para pares de câmbio). Payload enriquecido com `currenciesOffline` para detecção precisa de fallback no frontend.

- **Criptomoedas (BTC, ETH, BNB, XRP, SOL, XMR) com valores desatualizados (~1 ano):** mesma causa raiz do câmbio (AwesomeAPI falhando na Vercel). Migrado para **CoinGecko**, expandindo a chamada já existente para XMR. Remove dependência da AwesomeAPI completamente do backend. Payload enriquecido com `cryptosOffline`.

- **EWZ (iShares MSCI Brazil ETF) hardcoded em $28.21:** valor correspondia a ~1 ano atrás. Agora buscado via `fetchYahooIndex('EWZ')` e entregue em `globalIndices.EWZ`. `BolsasMundiaisCard` simplificado para consumir EWZ via `getIndexData`, removendo lógica avulsa de busca em `stocks`.

### Added

- **Curva DI — Juros Futuros via ANBIMA ETTJ:** novo script `scripts/fetch-curva-di.ts` faz scraping da página pública da ANBIMA (`https://www.anbima.com.br/informacoes/est-termo/CZ.asp`), extraindo a taxa prefixada para os vértices de 252, 504, 1260 e 2520 dias úteis (~1, 2, 5 e 10 anos). O script persiste a taxa do dia anterior para calcular a variação em pontos-base. Resultado salvo em `public/data/curva_di.json`; `market.ts` lê o arquivo via `loadCurvaDI()`. `CurvaDICard` atualizado com schema `taxa_str` / `taxa_anterior` / `var_pb` e colorização de variação (vermelho=alta, verde=queda).
- **Workflow `update-market-data.yml`** estendido com step de Curva DI. Cron ajustado para 00h30 UTC (21h30 BRT), após a publicação diária da ETTJ pela ANBIMA (~20h BRT).

---

## [1.2.3] — 2026-05-18

### Fixed

- **Automação de dados BCB quebrada silenciosamente:** `tsconfig.json` principal declara `"types": ["jest"]`, excluindo `@types/node`. O `ts-node` falhava ao compilar `scripts/fetch-market-data.ts` (módulos `https`, `fs`, `path` e `process` não encontrados). Com `continue-on-error: true` no workflow, o pipeline reportava `success` mas os dados pararam de ser atualizados desde 10/05/2026.
- Criado `tsconfig.scripts.json` com `"types": ["node"]` e `"moduleResolution": "node"` para uso exclusivo dos scripts Node.js, sem afetar o tsconfig do Next.js.
- Workflow `update-market-data.yml` atualizado para usar `--project tsconfig.scripts.json` ao invocar `ts-node`.
- Dados atualizados manualmente: SELIC até 2026-06-17 (proj. COPOM), PTAX até 2026-05-18, IPCA até 2026-06-30 (proj. Focus).

---

## [1.2.2] — 2026-05-18

### Fixed

- **Cotações de câmbio e cripto com valores incorretos (complemento):** timeout da AwesomeAPI no backend aumentado de 5s para 12s. O timeout insuficiente causava fallback silencioso para valores hardcoded após a remoção do fetch duplicado do frontend (v1.2.1).

---

## [1.2.1] — 2026-05-18

### Fixed

- **Cotações de câmbio e cripto com valores incorretos:** removido fetch duplicado da AwesomeAPI no frontend (`pages/index.tsx`). O fetch direto do browser sobrescrevia os dados corretos retornados pelo backend; quando falhava (rate limit, timeout silencioso), exibia fallbacks hardcoded desatualizados sem indicação visual ao usuário. Câmbio e cripto agora consumidos exclusivamente via `/api/market`.

---

## [1.1.0] — 2026-05-17

### Added
- **Painel Integrado de Mercados** (`pages/index.tsx`): Nova interface premium, responsiva e fluida com 6 blocos visuais harmoniosos de alta fidelidade.
- **Grades de Câmbio e Cripto** (`components/mercados/CambioCriptoCard.tsx`): Exibição simultânea de moedas (Dólar, Euro, Libra) com máximas/mínimas diárias e 5 criptomoedas principais (BTC, ETH, BNB, XRP, SOL) cotadas em USD e BRL.
- **Selic Efetiva Dinâmica**: Integração direta via client-side fetch ao barramento de dados do SGS Banco Central do Brasil (Série 1178) com formatação em padrão pt-BR.
- **Reunião COPOM Automatizada**: Parser client-side do cronograma oficial em `public/copom.md` calculando a data futura mais próxima de forma dinâmica.
- **Curva DI Premium** (`components/mercados/CurvaDICard.tsx`): Tabela estilizada de juros futuros de 1 a 10 anos acompanhada de rodapé integrado exibindo a Selic Efetiva e o COPOM.
- **Resiliência Server-side** (`pages/api/market.ts`): Fallbacks estruturados de cotações de contingência e busca sequencial de 18 ativos para mitigar rate limit da API BRAPI.
- **Movimentação do Diretório MAD-Mercados**: Isolamento completo da pasta de roteiros, checagens e mockups dentro de `Administrativos/` para proteção contra vazamentos de commits.

### Changed
- **Arquitetura de Câmbio/Cripto**: Migração do fetch de moedas do lado do servidor para o lado do cliente (Client-side) no index principal. Isso elimina gargalos de timeout de Serverless Functions da Vercel e contorna bloqueios de IP/Scraping em servidores de nuvem.
- **Banner Rotativo (Ticker)**: Integração do feed client-side de cotações em tempo real de Dólar, Euro, Bitcoin e Ethereum no marquee superior.

### Fixed
- **Cotações Congeladas**: Correção do bug onde o painel de desenvolvimento mostrava a cotação padrão de R$ 5,74 de fallback estático, passando a sincronizar com a cotação real (R$ 5,0518) via AwesomeAPI no navegador do usuário.

---

## [1.0.0] — 2026-05-14

### Added

- **Calculadora de Fluxo Indexado** (`/calculadora`): simulação de investimentos corrigidos por SELIC, IPCA e PTAX com múltiplos aportes e resgates — capitalização individualizada por fluxo
- `scripts/fetch-market-data.ts`: geração dos JSONs de dados de mercado via API BCB SEAD (Séries 11, 432, 433, 10813 + Focus) — 4 arquivos, ~26.000 registros no total
- `public/data/selic.json`: 6.617 registros históricos (Série 11) + projeções COPOM (Série 432), base 1999-12-31
- `public/data/ipca.json`: ~6.740 registros diários pro-rata (Série 433 + Focus expandida por DU real do mês), base 1999-12-31
- `public/data/ptax.json`: 6.617 registros históricos (Série 10813), base 1999-12-31
- `public/data/feriados_nacionais.json`: 224 feriados fixos nacionais (2000–2027)
- `lib/calculadora/`: motores SELIC, IPCA e PTAX com convenção overnight unificada; orquestrador com 6 códigos de erro tipados
- `lib/types/market-data.ts`: interfaces TypeScript para todos os JSONs de dados de mercado
- `components/calculadora/ResultadoCards.tsx`: 3 cards simultâneos (SELIC, IPCA, PTAX) com custo de oportunidade vs SELIC
- `components/calculadora/EvolutionChart.tsx`: gráfico Recharts com 3 linhas usando amostragem real dos motores por mês
- `components/calculadora/PrintReport.tsx`: relatório Bloomberg Noir para impressão (A4) — gráfico SVG com dados reais, cards de resultado, disclaimer e rodapé MAD
- `pages/api/market-data-excel.ts`: endpoint `GET /api/market-data-excel` — exporta `.xlsx` com 3 abas (ExcelJS)
- `tests/calculadora.test.ts`: 39 testes (utils, motores, orquestrador) — paridade verificada com Calculadora do Cidadão BCB
- Botão **Imprimir resultado** na página da calculadora — aciona `window.print()` com timestamp capturado
- Aba **Ferramentas** no dashboard restrito (SIFAZ) com acesso à calculadora e download de dados
- Commitlint + Husky: validação de formato de commits local (Adendo 01)
- `.github/workflows/mad-compliance.yml`: CI com 5 jobs (build, .mad-project, gitleaks, npm audit, conformidade visual)
- Branches `dev` e `staging` criadas e publicadas
- Tags retroativas `v0.0.1` → `v0.4.1`
- Branch Protection Rules ativas em `main` e `staging`
- `.mad-project` com declaração formal de stack `vercel-legacy` e alvo de migração `cloudflare`
- `secrets.manifest.json` e `.gitleaks.toml`
- `src/assets/mad-logo.svg` como SVG master da identidade MAD
- `.github/pull_request_template.md` e `.github/CODEOWNERS`

### Changed

- Título da calculadora: "Calculadora do Marcão!" → **Calculadora de Fluxo Indexado**
- `pages/calculadora.tsx`: removido seletor de índice — todos os 3 índices calculados simultaneamente; resultado triplo (`ResultadoTriplo`)
- `components/calculadora/CalculadoraForm.tsx`: campos de valor migrados de `input[type=number]` para `input[type=text]` com máscara BRL em tempo real
- `components/calculadora/ResultadoCards.tsx` / `EvolutionChart.tsx`: cores padronizadas — SELIC azul, IPCA âmbar, PTAX verde
- `styles/globals.css`: isolamento de impressão via `.screen-only` / `.print-report-page`; CSS Bloomberg Noir completo no `@media print`
- `next` fixado em `^16.2.4` (corrige CVE DoS em Server Components)
- `postcss` fixado em `^8.5.10` (corrige CVE XSS via `</style>`)
- `overrides.postcss` adicionado ao `package.json` para forçar versão segura em subdependências
- CSP no `vercel.json`: remove `unsafe-eval`; `frame-ancestors 'self'` → `'none'`
- `_app.tsx`: links de favicon corrigidos para `image/png` + `apple-touch-icon`
- `vercel.json`: `X-Frame-Options` alterado de `SAMEORIGIN` para `DENY`
- `.gitignore` expandido com `.env*`, `.next/`, IDE configs, `Administrativos/`

### Fixed

- Motor SELIC: retorna base `1.0` quando data recuada pela convenção overnight cai em 31/12/1999; lança erro explícito para datas anteriores a 03/01/2000
- Impressão em branco: `PrintReport` movido para fora do wrapper `.screen-only` no JSX root
- Gráfico SVG do relatório impresso: substituída interpolação linear por cálculo via motores reais (mesma lógica do `EvolutionChart`)
- Labels dos valores finais no gráfico SVG: separação mínima de 13px garantida por algoritmo com linha guia quando deslocado; `PAD_R` ajustado para 110px evitando corte fora do `viewBox`
- IDs duplicados em fluxos adicionais do formulário

### Security

- **[High]** Next.js DoS via Server Components — corrigido com `next@^16.2.4`
- **[Moderate]** PostCSS XSS via `</style>` — corrigido com `postcss@^8.5.10`
- `npm audit --audit-level=high`: **0 vulnerabilidades** em 02/05/2026
- `pages/osint_hub.tsx` protegido com verificação de sessão (cookie httpOnly)
- Sessão migrada para `iron-session` com cookie criptografado (`SESSION_SECRET` via variável de ambiente)

---

## [0.8.0] — 2026-05-06

### Fixed

- Cotação USD/BRL congela quando a aba fica em background: adicionado listener `visibilitychange` que força refresh imediato ao retornar à aba (`pages/index.tsx`)

### Changed

- Janela de aprovação de merge atualizada de 09h–18h para 08h–20h em toda a documentação (`Administrativos/LEI_OPERACAO_MAD_v1_0_LLM.md` — 5 ocorrências: seções 4.1, 4.2, 6.2, 07 e Regra 7)

---

## [0.3.0] — 2026-05-02

### Added

- Build local do Tailwind CSS via PostCSS (migração do CDN)
- `@tailwindcss/postcss` como devDependency
- `styles/globals.css` com sintaxe Tailwind v4 (`@import "tailwindcss"`) e keyframes do marquee via `@theme`

### Changed

- `postcss.config.js` atualizado para API do Tailwind v4
- `_app.tsx`: importação do CSS local substituindo script CDN externo

---

## [0.2.0] — 2026-05-02

### Added

- Auto-refresh de cotações a cada 3 minutos (`setInterval` com `clearInterval` no unmount)
- Auto-refresh de notícias a cada 1 hora no dashboard restrito
- Lista de 18 ativos no banner rotativo: ^BVSP, AXIA6, BBAS3, BBDC3, BBSE3, CMIG4, CSMG3, ISAE4, ITSA4, ITUB4, MXRF11, PETR4, PMLL11, ROMI3, VALE3, VISC11, VIVT3, XPML11

### Changed

- Velocidade do banner ajustada para ciclo de 280 segundos

### Fixed

- Banner de cotações: substituição de chamada em lote (incompatível com plano free BRAPI) por 18 requisições paralelas individuais
- Encoding do símbolo `^BVSP` na URL (`encodeURIComponent`)
- Fetch paralelo e isolado no index: cada fonte (USD, SELIC, BRAPI) falha independentemente via `Promise.allSettled`

### Security

- 6 vulnerabilidades corrigidas identificadas no SECURITY_REPORT de 28/04/2026:
  - [Crítico] Token BRAPI movido para API route no servidor (`/api/market`)
  - [Alto] Rate limiting implementado no endpoint de login (10 tentativas/min, bloqueio 5 min)
  - [Alto] Páginas OSINT convertidas para `.tsx` com verificação de sessão
  - [Médio] Sessão migrada de `localStorage` para cookie `httpOnly; SameSite=Strict`
  - [Médio] Endpoint `/api/verify` redundante removido
  - [Baixo] `old_osint_hub.html` removido do repositório

---

## [0.1.0] — 2026-04-28

### Added

- Favicon SVG/PNG/apple-touch-icon adicionados a `public/`
- `pages/osint_hub.tsx`: Hub OSINT com 17+ seções, sidebar, busca e layout em tabela

### Fixed

- Favicon corrigido: movido para `public/` e referenciado em `_app.tsx`

---

## [0.0.3] — 2026-03-21

### Added

- Calendário COPOM em `public/copom.md` com leitura client-side
- Seção de próxima reunião COPOM no painel de indicadores

### Fixed

- Compatibilidade com SSG do Vercel: leitura do `copom.md` migrada para client-side fetch estático
- Tag `<section>` faltando que corrompía o build

---

## [0.0.2] — 2026-03-17

### Added

- GitHub Actions workflow `update_news.yml`: atualização automática de notícias a cada 6 horas via RSS + tradução automática
- Downloads: link para Portfolio Manager v0.0.1

### Changed

- Actions atualizados: `actions/checkout@v3 → v4`, `setup-python@v4 → v5`
- Credenciais do News Robot atualizadas

### Fixed

- CSP no `vercel.json` ajustada para permitir APIs externas

---

## [0.0.1] — 2026-03-07

### Added

- Estrutura inicial do portal Next.js
- Dashboard público: IBOVESPA, USD/BRL, SELIC Efetiva com sparklines
- Banner rotativo com cotações de ações em tempo real
- Sistema de autenticação com chave operacional
- Dashboard restrito SIFAZ: briefing de inteligência fazendária, dorks OSINT, legislação
- Headers HTTP de segurança via `vercel.json`
- Workflow GitHub Actions para atualização de notícias
