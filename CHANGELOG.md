# CHANGELOG — portal-marcus-aleks

Todas as mudanças relevantes deste projeto são documentadas aqui.  
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).  
Versionamento segue [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [Não lançado]

### Added
- Commitlint + Husky: validação de formato de commits local (Adendo 01)
- `.github/workflows/mad-compliance.yml`: CI com 5 jobs (build, .mad-project, gitleaks, npm audit, conformidade visual)
- Branches `dev` e `staging` criadas e publicadas
- Tags retroativas `v0.0.1` → `v0.4.1`
- Branch Protection Rules ativas em `main` e `staging`

### Changed
- `next` fixado em `^16.2.4` (corrige CVE DoS em Server Components)
- `postcss` fixado em `^8.5.10` (corrige CVE XSS via `</style>`)
- `overrides.postcss` adicionado ao `package.json` para forçar versão segura em subdependências
- CSP no `vercel.json`: remove `unsafe-eval` e referência ao CDN Tailwind removido; `frame-ancestors 'self'` → `'none'`

### Security
- **[High]** Next.js DoS via Server Components — corrigido com `next@^16.2.4`
- **[Moderate]** PostCSS XSS via `</style>` — corrigido com `postcss@^8.5.10`
- `npm audit --audit-level=high`: **0 vulnerabilidades** em 02/05/2026

---

## [Não lançado — anterior]

### Added
- `.mad-project` com declaração formal de stack `vercel-legacy` e alvo de migração `cloudflare`
- `CHANGELOG.md` (este arquivo) com histórico retroativo
- Assinatura `.mad-signature` em todas as páginas (index, login, dashboard-intel, osint_hub)
- `.github/pull_request_template.md` e `.github/CODEOWNERS`
- `secrets.manifest.json` e `.gitleaks.toml`
- `src/assets/mad-logo.svg` como SVG master da identidade MAD

### Changed
- `_app.tsx`: links de favicon corrigidos para `image/png` + `apple-touch-icon`
- `vercel.json`: `X-Frame-Options` alterado de `SAMEORIGIN` para `DENY`
- `.gitignore` expandido com `.env*`, `.next/`, IDE configs

### Security
- `pages/osint_hub.tsx` protegido com verificação de sessão (cookie httpOnly)

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
