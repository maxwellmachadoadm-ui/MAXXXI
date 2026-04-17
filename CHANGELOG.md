# CHANGELOG — ORION

Histórico de releases da plataforma ORION (Gestão Executiva).

Formato inspirado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

---

## [v1.0.0] — 2026-04-17

Primeira versão formalmente tagueada. Representa o estado consolidado da plataforma publicada em produção (Vercel) após várias iterações de design, estrutura e estabilização.

### Funcionalidades entregues

- **Multiempresa (v16)** — isolamento por `company_id`; troca de empresa atualiza toda a UI; `empresaAtiva` persistida em localStorage; home dividida em PORTFÓLIO (DW, OF, FS, CDL) e PESSOAL (GP)
- **Engine Financeira (v17)** — FMT NaN-safe (`brl`, `brlK`, `pct`, `score`, `num`); lançamentos CRUD com 4 tipos; `impacta_resultado` diferencia transfer/investment; 23 categorias; DRE estruturada; fluxo de caixa 8 meses; fallback `demoData`
- **Visão CEO / Central do CEO (v18)** — 8 seções executivas read-only, 5 KPIs consolidados, MAXXXI Insights, gráfico receita×despesa×resultado, gargalos automáticos, Top 5 prioridades, tabela comparativa 7 métricas × empresas, pipeline CRM por empresa, central de alertas
- **MAXXXI (IA)** — drawer lateral, badge de alertas, briefing automático diário, chat com API Anthropic + fallback local
- **Supabase (v19)** — client via CDN; configuração via menu usuário; sync bidirecional; fallback completo via localStorage; storage buckets (avatars, logos, biblioteca)
- **Reset de senha via Resend** — fluxo "esqueci minha senha" com token de 1h (email via resend.dev)
- **Workspace por empresa** — 7 abas unificadas: KPIs, Tarefas, Financeiro, Extrato IA, Documentos, Relatórios, Notas
- **PWA** — manifest + favicon SVG constelação Orion
- **Autenticação / Convites** — modal de convite com email, role, empresas, expiração e link copiável

### Padrão visual definitivo

- Escala tipográfica unificada: título 28px Syne 800, KPI grande 22px Syne 700, KPI médio 18px Syne 700, corpo 13px DM Sans, labels 11px DM Sans uppercase, badge 10px DM Sans 600
- Tokens de cor: bg `#080c18`, surface `#0d1225`, border `#1e2a45`, tx `#f1f5f9`, tx2 `#94a3b8`, amber `#f59e0b`, blue `#3b82f6`, green `#10b981`, red `#ef4444`, purple `#a78bfa`
- Sidebar 220px · Topbar 56px · Painel direito 300px
- Cards empresa com border-left 4px colorida · radius 8–12px
- Fontes Syne + DM Sans embedadas em base64 (independência de CDN)

### Correções recentes nesta release

- KPI cards home: valores Syne 24px `nowrap`, labels 10px uppercase com ellipsis
- Cards empresa: nomes/descrição `nowrap` com ellipsis, border-left colorida
- Workspace KPI cards: `.val-sm` 20px → 18px Syne 700, `min-width:160px`, `overflow:visible` (corrige corte de "R$ 18,5k/mês")
- Tabs workspace reduzidas aos 7 módulos (removidos OKRs, Projetos, Equipe, Contratos, Riscos, Decisões do `WS_TABS_ALL` e dos defaults)
- `initPlatform()` limpa `orion_modulos_*` do localStorage no startup
- Login title `nowrap` 24px
- Body geral 12px
- Override tipográfico `html body *` com `!important` garantindo consistência

### Arquitetura

- Single-file static HTML (`index.html` ~720KB, ~10.6k linhas) — HTML + CSS + JS inline
- Deploy Vercel via `@vercel/static`, SPA routing em `vercel.json`
- Sem build tools, sem React, sem npm runtime
- Persistência híbrida: Supabase primário + localStorage fallback

### Tabelas Supabase ativas

`empresas`, `lancamentos`, `tarefas`, `crm_itens`, `notas`, `leads`, `invites`, `empresa_modulos`, `agenda`, `alertas`, `checkins`, `categorias` — todas com `company_id` onde aplicável.

---

## Próximas versões

A partir de v1.1.0 todas as features seguem o fluxo:

1. Branch `release/vX.Y-nome-feature`
2. Commits atômicos por fase
3. Validação (parse / build / lint / typecheck)
4. Deploy preview Vercel
5. Merge para `main` após validação
6. Atualização deste CHANGELOG + nova tag
