# ORION — Changelog

## [v1.0.0] — 2026-04-17

### Plataforma
- Central do CEO — dashboard executivo com prioridades, KPIs consolidados, portfólio de empresas
- Multi-empresa: Doctor Wealth, Original Fotografia, Forme Seguro, CDL Itaperuna, Gestão Pessoal
- Sidebar com dots coloridos por empresa e health score
- Topbar com MAXXXI, notificações e avatar

### Módulos por empresa
- KPIs, Financeiro, Extrato IA, Documentos, Relatórios, Tarefas, Notas
- Forme Seguro: Rentabilidade (36 meses dados reais Med Vet UVV), Projeções, Fundos

### IA
- MAXXXI — agente executivo com análise de ecossistema
- Extrato IA — upload CSV/OFX/XLSX/imagem com classificação automática
- ORION Decision Engine — recomendações rule-based

### Infraestrutura
- Deploy automático MAXXXI → ORION → Vercel via GitHub Actions
- Supabase conectado (auth, dados, storage)
- Fontes Syne + DM Sans embedadas em base64
- PWA instalável

### Segurança
- RBAC por empresa/módulo
- Rate limit login (5 tentativas/15min)
- Session timeout (30min)
- Audit log completo
