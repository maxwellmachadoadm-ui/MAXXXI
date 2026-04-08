# ORION — Plataforma de Gestão Executiva

## Arquitetura

- **Tipo**: Single-file static HTML app (`index.html`)
- **Deploy**: Vercel (static build via `@vercel/static`)
- **Framework**: Vanilla JS, CSS-in-file, no build tools
- **Fontes**: DM Sans (body), Syne (headings/valores)
- **Persistência**: Supabase (primário) + localStorage (cache/fallback)
- **IA**: Anthropic API (claude-sonnet-4-20250514) com fallback local
- **Supabase**: CDN @supabase/supabase-js@2, credenciais em localStorage

## Estrutura de Arquivos

```
/
├── index.html        # App inteiro (HTML + CSS + JS)
├── vercel.json       # Config deploy Vercel (static + SPA routing)
├── .env              # VITE_ANTHROPIC_KEY (não utilizado no runtime)
├── README.md         # Descrição básica
├── CLAUDE.md         # Este arquivo
└── supabase/
    ├── v16_company_id.sql  # Migration empresa_id
    ├── v17_financeiro.sql  # Migration financeiro: categorias, contas, DRE, views
    └── v19_full_schema.sql # Schema completo: todas as tabelas + seeds
```

## Empresas (5 ativas)

| ID   | Nome               | Sigla | Tipo           | Health Score |
|------|--------------------|-------|----------------|--------------|
| dw   | Doctor Wealth      | DW    | Portfólio      | 80           |
| of   | Original Fotografia| OF    | Portfólio      | 52           |
| fs   | Forme Seguro       | FS    | Portfólio      | 65           |
| cdl  | CDL Divinópolis    | CDL   | Portfólio      | 88           |
| gp   | Gestão Pessoal     | GP    | Pessoal        | 75           |

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
  - `orion_agenda` — agenda global
  - `orion_alerts` — alertas
  - `orion_ci_{date}` — check-in diário
  - `orion_lanc_{id}` — lançamentos financeiros por empresa
  - `orion_mx_briefing` — data do último briefing MAXXXI

## Diagnóstico v16

### Conexão Supabase v19
O app usa Supabase como fonte primária de dados (quando conectado) com localStorage como cache/fallback.
- Configuração via menu usuário → ⚙️ Supabase
- Credenciais salvas em `orion_sb_url` e `orion_sb_key`
- Sync bidirecional: startup puxa do Supabase → localStorage; writes vão para ambos
- Todas as operações CRUD (lancamentos, tarefas, CRM, notas, agenda, alertas, checkins, empresas) sincronizam com Supabase

### Tabelas Supabase (schema v19):

| Tabela              | empresa_id | Status        |
|---------------------|------------|---------------|
| lancamentos         | ✅ SIM     | Planejada     |
| tarefas             | ✅ SIM     | Planejada     |
| leads               | ✅ SIM     | Planejada     |
| compromissos        | ✅ SIM     | Planejada     |
| extratos            | ❌ NÃO     | Precisa ADD   |
| transacoes          | ❌ NÃO     | Precisa ADD   |
| of_lancamentos      | via projeto_id | Planejada |
| of_parcelas         | via projeto_id | Planejada |
| maxxxi_alertas      | ✅ SIM     | Planejada     |
| maxxxi_conversas    | ✅ SIM     | Planejada     |
| empresas            | ✅ SIM     | Conectada     |
| crm_itens           | ✅ SIM     | Conectada     |
| notas               | ✅ SIM     | Conectada     |
| agenda              | — global   | Conectada     |
| alertas             | — global   | Conectada     |
| checkins            | — global   | Conectada     |
| categorias          | ✅ SIM     | Conectada     |

### Riscos Identificados
1. API key do Anthropic armazenada em localStorage (risco de segurança)
2. Credenciais Supabase em localStorage (necessário para client-side app)

### Inconsistências Corrigidas na v16
- empresaAtiva agora persiste em localStorage entre sessões
- Home dividida em PORTFÓLIO (DW, OF, FS, CDL) e PESSOAL (GP)
- MAXXXI migrado de chat flutuante para drawer lateral
- Badge de alertas no topbar
- Sidebar com hierarquia visual clara

### Engine Financeira v17
- FMT utilities NaN-safe: `FMT.brl()`, `FMT.brlK()`, `FMT.pct()`, `FMT.pctVal()`, `FMT.score()`, `FMT.num()`
- Lançamentos CRUD via localStorage (`orion_lanc_{empresaId}`)
- DRE: receita, despesas por categoria, resultado operacional, margem
- Fluxo de Caixa: 8 meses com entradas, saídas, saldo, acumulado
- Categorias: 23 categorias pré-definidas (income/expense/transfer/investment)
- Formulário de lançamento completo com validações inline
- Aba "Financeiro" no workspace com DRE + Fluxo + Lista de lançamentos
- Supabase migration v17: tabelas categorias, contas, views DRE/fluxo/resumo

### Visão CEO v18
- Painel executivo READ ONLY com 8 seções
- S1: Header com seletor período (mês/trimestre/ano) + atualização
- S2: 5 KPIs consolidados (receita, despesa, resultado, health score, alertas)
- S3: MAXXXI Insights — cards horizontais com análise automática
- S4: Gráfico barras receita×despesa×resultado + ranking por resultado
- S5: Gargalos automáticos + Top 5 prioridades com ação sugerida
- S6: Tabela comparativa todas métricas × empresas + exportar CSV
- S7: Pipeline CRM funil por empresa + patrimônio GP
- S8: Central de alertas agrupados por criticidade
- CEO Intelligence: identificar melhor/pior empresa, gargalos, prioridades

## Variáveis de Ambiente

| Variável            | Uso                    | Onde           |
|---------------------|------------------------|----------------|
| VITE_ANTHROPIC_KEY  | API Anthropic (MAXXXI) | .env (não usado runtime) |
| orion_api_key       | API key em localStorage | Runtime browser |

## Deploy (Vercel)

- `vercel.json` configura build estático e SPA routing
- Sem crons configurados (app é 100% client-side)
