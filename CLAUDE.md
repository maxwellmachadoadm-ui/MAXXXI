# ORION — Plataforma de Gestão Executiva

> **REGRA DE DEPLOY — LER ANTES DE QUALQUER COMMIT:**
> Todo push DEVE ir para origin (`maxwellmachadoadm-ui/ORION`).
> **NUNCA** fazer push apenas para MAXXXI esperando chegar ao Vercel.
> Após cada commit, executar:
> ```
> git remote -v        # confirmar que origin = ORION
> git push origin main
> ```
> Se o remote não for ORION, **parar e avisar Maxwell imediatamente**.

## Arquitetura

- **Tipo**: Single-file static HTML app (`index.html`)
- **Deploy**: Vercel (static build via `@vercel/static`)
- **Framework**: Vanilla JS, CSS-in-file, no build tools
- **Fontes**: DM Sans (body), Syne (headings/valores)
- **Persistência**: Supabase (primário) + localStorage (cache/fallback)
- **IA**: Anthropic API (claude-sonnet-4-20250514) com fallback local
- **Supabase**: CDN @supabase/supabase-js@2, credenciais em localStorage

> **IMPORTANTE**: NÃO existe src/, NÃO existe React, NÃO existe npm.
> Todo o código está em `index.html` (3172 linhas, ~169KB).
> NÃO usar `npm run build` — o deploy é estático direto.

## Estrutura de Arquivos

```
/
├── index.html              # App inteiro (HTML + CSS + JS)
├── vercel.json             # Config deploy Vercel (static + SPA routing)
├── .env                    # VITE_ANTHROPIC_KEY (não utilizado no runtime)
├── README.md               # Descrição básica
├── CLAUDE.md               # Este arquivo
├── public/
│   ├── manifest.json       # PWA manifest
│   └── orion-logo.svg      # Logo constelação Orion (favicon + PWA)
└── supabase/
    ├── v15.sql             # Schema: lancamentos, tarefas, leads, invites, empresa_modulos
    ├── v16_company_id.sql  # Migration: empresa_id + índices
    ├── v17_financeiro.sql  # Migration: categorias, contas, DRE views
    ├── v19_full_schema.sql # Schema completo: todas tabelas + seeds
    └── create_buckets.sql  # Storage: avatars, logos, biblioteca
```

## Remote e Deploy

- **GitHub (produção)**: `maxwellmachadoadm-ui/ORION` — este é o repo que o Vercel monitora
- **GitHub (dev)**: `maxwellmachadoadm-ui/MAXXXI` — repo separado, NÃO vai ao Vercel
- **Vercel**: conectado ao repo **ORION**, deploy automático em push para `main`
- **URL produção**: https://orion-platform-wine.vercel.app
- **Branch de desenvolvimento**: `claude/autonomous-mode-setup-WMj8y` (no repo MAXXXI)

> **NUNCA** fazer push para MAXXXI esperando que chegue ao Vercel.
> Para deployar: push para `main` do repo **ORION**.

## Empresas (5 ativas)

| ID   | Nome               | Sigla | Tipo      | Fat    | Result | Score |
|------|--------------------|-------|-----------|--------|--------|-------|
| dw   | Doctor Wealth      | DW    | Portfólio | 48.500 | 22.000 | 80    |
| of   | Original Fotografia| OF    | Portfólio | 28.000 | 4.200  | 52    |
| fs   | Forme Seguro       | FS    | Portfólio | 15.000 | 8.500  | 65    |
| cdl  | CDL Divinópolis    | CDL   | Portfólio | 35.000 | 12.000 | 88    |
| gp   | Gestão Pessoal     | GP    | Pessoal   | 0      | 0      | 75    |

## Estado Global

- `curEmp` — empresa ativa (null = home)
- `curTab` — aba ativa no workspace
- `mxOpen` — estado do drawer MAXXXI
- `mxHistory` — histórico de chat
- Persistência: `localStorage` com prefixo `orion_`
  - `orion_session` — sessão do usuário
  - `orion_users` — lista de usuários
  - `orion_empresa_ativa` — empresa ativa persistida
  - `orion_tasks_{id}` — tarefas por empresa
  - `orion_crm_{id}` — CRM por empresa
  - `orion_notas_{id}` — notas por empresa
  - `orion_lanc_{id}` — lançamentos financeiros por empresa
  - `orion_modulos_{id}` — módulos ativos por empresa
  - `orion_agenda` — agenda global
  - `orion_alerts` — alertas
  - `orion_ci_{date}` — check-in diário
  - `orion_invites` — convites de usuário
  - `orion_sb_url` — URL Supabase
  - `orion_sb_key` — Anon key Supabase
  - `orion_api_key` — API key Anthropic (MAXXXI)
  - `orion_mx_briefing` — data do último briefing MAXXXI

## Features Implementadas (v16)

### Multiempresa (v16)
- Isolamento completo por company_id em todas as entidades
- Troca de empresa atualiza toda a UI
- empresaAtiva persiste em localStorage entre sessões
- Home dividida em PORTFÓLIO (DW, OF, FS, CDL) e PESSOAL (GP)

### Engine Financeira (v17)
- FMT utilities NaN-safe: `brl`, `brlK`, `pct`, `pctVal`, `score`, `num`
- Lançamentos CRUD com type (income/expense/transfer/investment)
- `impacta_resultado`: transfer e investment NÃO afetam resultado operacional
- 23 categorias pré-definidas (saúde, alimentação, moradia, transporte, etc.)
- DRE estruturada: receita → impostos → despesas por categoria → resultado → margem
- Fluxo de caixa: 8 meses com entradas, saídas, saldo, acumulado
- Formulário de lançamento completo com validações inline
- Fallback demoData (`temLancamentos`) quando sem lançamentos reais

### Visão CEO (v18)
- 8 seções executivas READ ONLY
- S1: Header com seletor período (mês/trimestre/ano)
- S2: 5 KPIs consolidados (receita, despesa, resultado, health score, alertas)
- S3: MAXXXI Insights — cards de análise automática
- S4: Gráfico barras receita×despesa×resultado + ranking por resultado
- S5: Gargalos automáticos + Top 5 prioridades com ação sugerida
- S6: Tabela comparativa 7 métricas × empresas + exportar CSV
- S7: Pipeline CRM funil por empresa + patrimônio GP
- S8: Central de alertas por criticidade
- CEO Intelligence: identificar melhor/pior empresa, gargalos, prioridades

### MAXXXI (v16+)
- Drawer lateral (não chat flutuante)
- Badge de alertas no topbar e sidebar
- Briefing automático na primeira abertura do dia
- Chat com API Anthropic + fallback local
- Alertas não lidos no topo do drawer

### Supabase (v19)
- Client via CDN @supabase/supabase-js@2
- Configuração via menu usuário → ⚙️ Supabase
- Sync bidirecional: startup puxa → localStorage; writes → ambos
- Entidades sincronizadas: lancamentos, tarefas, CRM, notas, agenda, alertas, checkins, empresas
- Fallback automático: sem Supabase configurado, tudo funciona via localStorage
- Storage buckets: avatars (público), logos (público), biblioteca (privado)

### Interface (v12)
- Barra de empresas no topo do workspace removida
- Módulos configuráveis por empresa (checklist ao criar)
- GP enxuto: apenas KPIs, Financeiro, Notas, Arquivos
- Convite de usuário: modal com email, role, empresas, expiração, link copiável
- Tarefas e CRM filtrados por curEmp
- Favicon SVG constelação Orion (7 estrelas, Betelgeuse dourada)
- PWA manifest com ícone SVG

### Integridade
- Braces balanceadas: 870/870
- Zero NaN em HTML estático
- Zero duplicate style attributes
- renderTab guard contra curEmp null
- FMT.score retorna mínimo 50 (nunca 0)
- Health score com fallback consistente

## Variáveis de Ambiente

| Variável           | Onde                    | Obrigatório |
|--------------------|-------------------------|-------------|
| orion_api_key      | localStorage (runtime)  | Não — MAXXXI funciona com fallback local |
| orion_sb_url       | localStorage (runtime)  | Não — app funciona 100% com localStorage |
| orion_sb_key       | localStorage (runtime)  | Não — idem |
| VITE_ANTHROPIC_KEY | .env (não usado runtime) | Não |

## Deploy (Vercel)

1. Push para `main` no repo **ORION** (`maxwellmachadoadm-ui/ORION`)
2. Vercel detecta automaticamente e deploya
3. `vercel.json` configura:
   - `index.html` como build estático
   - `public/**` servido com rotas para manifest.json e orion-logo.svg
   - SPA routing: todas as rotas → index.html
4. Sem variáveis de ambiente no Vercel necessárias (tudo é client-side)

## Tabelas Supabase

| Tabela           | company_id | Status    |
|------------------|------------|-----------|
| empresas         | ✅ PK      | Conectada |
| lancamentos      | ✅ SIM     | Conectada |
| tarefas          | ✅ SIM     | Conectada |
| crm_itens        | ✅ SIM     | Conectada |
| notas            | ✅ SIM     | Conectada |
| leads            | ✅ SIM     | Pronta    |
| invites          | — global   | Pronta    |
| empresa_modulos  | ✅ SIM     | Pronta    |
| agenda           | — global   | Conectada |
| alertas          | — global   | Conectada |
| checkins         | — global   | Conectada |
| categorias       | ✅ SIM     | Conectada |

## PADRÃO VISUAL DEFINITIVO

> **Referência CONCLUSIVA** — screenshot "Central do CEO" 15/abr/2026 aprovada.
> Toda tela / módulo / modal / sidebar / card / tabela / botão / input / tipografia
> **DEVE** seguir EXATAMENTE este padrão. Nenhuma exceção.

### Layout

| Região    | Dimensão | Background | Borda                       |
| --------- | -------- | ---------- | --------------------------- |
| Sidebar   | 220px    | `#0d1225`  | border-right 1px `#1e2a45`  |
| Topbar    | 56px     | `#0d1225`  | border-bottom 1px `#1e2a45` |
| Content   | flex:1   | `#080c18`  | padding 24px                |
| Painel ≫  | 300px    | `#080c18`  | cards internos `#0a0f1e`    |

### Cores (tokens)

| Token            | Hex        |
| ---------------- | ---------- |
| bg principal     | `#080c18`  |
| surface / cards  | `#0d1225`  |
| surface-deep     | `#0a0f1e`  |
| border           | `#1e2a45`  |
| texto principal  | `#f1f5f9`  |
| texto muted      | `#94a3b8`  |
| texto hint       | `#4a5568`  |
| azul             | `#3b82f6`  |
| verde            | `#10b981`  |
| vermelho         | `#ef4444`  |
| âmbar            | `#f59e0b`  |
| roxo             | `#a78bfa`  |

### Tipografia

| Uso                    | Fonte / peso     | Tamanho          |
| ---------------------- | ---------------- | ---------------- |
| Headers / títulos      | Syne 700/800     | —                |
| Body / labels          | DM Sans 400/500  | —                |
| Título da página       | Syne 800         | **28px**         |
| Label de seção         | DM Sans 700      | **11px** uppercase letter-spacing 2px |
| Valor KPI              | Syne 800         | **24px**         |
| Body                   | DM Sans 400/500  | **13px**         |

### Componentes

**Cards de empresa**
- bg `#0d1225`, border 1px `#1e2a45`, **border-left 4px** na cor da empresa
- border-radius 8px
- Health Score: círculo SVG 48px com número em Syne bold

**Badges de status** — pill pequeno, uppercase, bg opacidade 15%
- CRESCIMENTO (verde) · AJUSTAR (âmbar) · ESCALAR (roxo) · ESTÁVEL (azul-claro)
- RISCO (vermelho) · OPORTUNIDADE (âmbar)

**KPI cards** — bg `#0d1225`, border 1px `#1e2a45`, ícone colorido 32px com bg opacidade 15%, sparkline SVG inline à direita

**Botões**
- Primário: bg `#3b82f6`, texto `#ffffff`, border-radius 6px
- Âmbar (destaque): bg `#f59e0b`, texto `#080c18`, border-radius 6px
- Secundário: bg `#0d1225`, border 1px `#1e2a45`, texto `#f1f5f9`

**Inputs** — bg `#0a0f1e`, border 1px `#1e2a45`, focus border `#3b82f6`

**Sidebar**
- Item ativo: bg `#f59e0b15`, **border-left 3px `#f59e0b`**
- Labels de seção: **8px** uppercase letter-spacing 2px `#4a5568`
- Item regular: hover bg `rgba(255,255,255,.03)`

**Tabelas**
- Header bg `#0a0f1e`, texto `#94a3b8` 10px uppercase letter-spacing .08em
- Linhas alternadas `#0d1225` / `#080c18`, hover `#1e2a45`
- Linhas críticas: border-left 3px `#ef4444`

**Modais**
- bg `#0d1225`, border 1px `#1e2a45`, **border-left 3px `#f59e0b`**
- border-radius 16px, backdrop `rgba(2,5,14,.78)` blur 8px
