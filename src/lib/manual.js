// ═══════════════════════════════════════════════════════════
// ORION Gestão Executiva — Manual Dinâmico
// Atualizar este arquivo sempre que mudar funcionalidades
// Usado por: ícone ❓ nas abas, botão Manual, MAXXXI
// ═══════════════════════════════════════════════════════════

export const MANUAL_VERSION = '15.0'
export const MANUAL_DATE = '08/04/2026'

// ── Manual por empresa e aba ──
export const MANUAL = {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GERAL (todas as empresas)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  geral: {
    titulo: 'ORION Gestão Executiva',
    descricao: 'Plataforma de gestão executiva do ecossistema de empresas de Maxwell Oliveira Machado.',
    abas: {
      KPIs: {
        titulo: 'KPIs — Indicadores-Chave',
        icone: '📊',
        objetivo: 'Visualizar os principais indicadores de desempenho da empresa em tempo real.',
        como_usar: [
          'Os KPIs são carregados automaticamente com base nos dados da empresa',
          'Cada card mostra: ícone, nome do indicador e valor atual',
          'Os valores são atualizados conforme lançamentos e movimentações são registrados',
        ],
        dica: 'Compare os KPIs entre empresas na Visão CEO para ter uma visão consolidada do ecossistema.',
      },
      OKRs: {
        titulo: 'OKRs — Objetivos e Resultados-Chave',
        icone: '🎯',
        objetivo: 'Acompanhar o progresso dos objetivos estratégicos da empresa.',
        como_usar: [
          'Cada OKR mostra o objetivo e uma barra de progresso percentual',
          'Verde (≥70%): no caminho certo',
          'Amarelo (40-70%): atenção necessária',
          'Vermelho (<40%): requer ação imediata',
        ],
        dica: 'Revise os OKRs semanalmente e atualize o progresso para manter a equipe alinhada.',
      },
      Tarefas: {
        titulo: 'Tarefas — Kanban',
        icone: '☑️',
        objetivo: 'Gerenciar tarefas da empresa em um quadro visual com 3 colunas.',
        como_usar: [
          'Três colunas: A Fazer → Em Andamento → Concluído',
          'Arraste tarefas entre colunas (drag & drop) para mudar o status',
          'Cada tarefa mostra: título, prioridade (cor) e prazo',
          'Botões rápidos: ▶ Iniciar, ✅ Concluir, 🔄 Reabrir',
          'Prioridades: 🔴 Alta, 🟡 Média, 🔵 Baixa',
        ],
        dica: 'Foque nas tarefas de alta prioridade primeiro. Use o filtro por prioridade na página global de Tarefas.',
      },
      Contratos: {
        titulo: 'Contratos',
        icone: '📄',
        objetivo: 'Visualizar contratos ativos, inadimplentes e em negociação.',
        como_usar: [
          'Cada contrato mostra: nome, valor, status e vencimento',
          'Status: 🟢 Ativo, 🔴 Inadimplente, 🟡 Em Negociação',
        ],
        dica: 'Monitore contratos próximos do vencimento e inicie renovação com antecedência.',
      },
      Riscos: {
        titulo: 'Riscos Mapeados',
        icone: '⚠️',
        objetivo: 'Identificar e monitorar riscos que podem impactar a empresa.',
        como_usar: [
          'Cada risco tem nível: 🔴 Alto, 🟡 Médio, 🔵 Baixo',
          'Revise periodicamente e atualize conforme o cenário muda',
        ],
        dica: 'Riscos de nível alto devem ter plano de ação definido.',
      },
      'Decisões': {
        titulo: 'Registro de Decisões',
        icone: '⚡',
        objetivo: 'Documentar decisões importantes com data e contexto.',
        como_usar: [
          'Cada decisão mostra: descrição, data e responsável',
          'Funciona como timeline — as mais recentes aparecem primeiro',
        ],
        dica: 'Registre decisões no momento em que são tomadas para manter histórico.',
      },
      Pipeline: {
        titulo: 'Pipeline de Receita',
        icone: '📈',
        objetivo: 'Projetar receita futura em 3 níveis de certeza.',
        como_usar: [
          '✅ Garantida: contratos assinados, receita certa',
          '🟡 Provável: em negociação avançada (70% de chance)',
          '🔵 Possível: em proposta inicial (40% de chance)',
          'Gráfico mostra evolução nos próximos 3 meses',
        ],
        dica: 'Use o pipeline para planejar fluxo de caixa e decisões de investimento.',
      },
      'Fluxo de Caixa': {
        titulo: 'Fluxo de Caixa Projetado',
        icone: '💰',
        objetivo: 'Visualizar entradas e saídas projetadas e identificar meses críticos.',
        como_usar: [
          'Selecione o período: 30, 60 ou 90 dias',
          'Barras verdes = entradas, barras vermelhas = saídas',
          'Saldo acumulado mostrado abaixo de cada semana',
          '⚠️ Alerta automático se saldo projetado ficar negativo',
        ],
        dica: 'Se aparecer alerta de saldo negativo, antecipe recebimentos ou adie pagamentos.',
      },
      DRE: {
        titulo: 'DRE — Demonstração de Resultado',
        icone: '📋',
        objetivo: 'Ver o resultado financeiro da empresa no formato contábil padrão.',
        como_usar: [
          'Selecione mês atual e mês de comparação',
          'Estrutura: Receita Bruta → Deduções → Receita Líquida → Custos → Margem Bruta → Despesas → EBITDA → Resultado',
          'Coluna de variação mostra ▲ crescimento ou ▼ queda vs mês anterior',
          'Margem bruta e margem líquida exibidas em destaque',
        ],
        dica: 'Margem líquida abaixo de 10% requer revisão imediata de custos.',
      },
      Arquivos: {
        titulo: 'Drive Centralizado',
        icone: '📁',
        objetivo: 'Armazenar documentos organizados em pastas por categoria.',
        como_usar: [
          '6 pastas padrão: Financeiro/Extratos, Financeiro/NFs, Financeiro/Relatórios, Jurídico/Contratos, Operacional/Documentos, Biblioteca/Estatutos',
          'Clique na pasta para entrar e ver os arquivos',
          'Botão 📎 Enviar Arquivo para upload',
          'Mover arquivos entre pastas usando o seletor',
          'Somente admin pode deletar arquivos',
        ],
        dica: 'Mantenha extratos bancários na pasta Financeiro/Extratos para o MAXXXI classificar.',
      },
      Biblioteca: {
        titulo: 'Biblioteca de Documentos',
        icone: '📚',
        objetivo: 'Acervo de documentos importantes da empresa.',
        como_usar: [
          'Upload de PDF, Word, Excel e imagens (até 20MB)',
          'Cada documento tem: nome, tipo, tamanho, data e quem enviou',
          'Classificação por status: aprovado ou pendente',
        ],
        dica: 'Use para guardar contratos sociais, estatutos e documentos legais.',
      },
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ORIGINAL FOTOGRAFIA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  of: {
    titulo: 'Original Fotografia — ERP Fotográfico',
    descricao: 'Gestão financeira por projeto/turma de formatura. Cada turma é um centro de custo independente.',
    abas: {
      'Financeiro OF': {
        titulo: 'Financeiro OF — ERP Completo',
        icone: '💼',
        objetivo: 'Gestão financeira completa por projeto de formatura com 8 módulos integrados.',
        como_usar: [
          '📊 Dashboard: KPIs consolidados, alertas e gráficos',
          '🎓 Projetos: cadastrar e gerenciar turmas',
          '💳 Lançamentos: receitas e despesas por projeto',
          '📋 Parcelas: controle de inadimplência e cobrança WhatsApp',
          '⚖️ Rateio: dividir despesas fixas entre projetos',
          '📐 Orçado vs Real: comparar planejado com executado',
          '📈 DRE: resultado por projeto ou consolidado',
          '💰 Fluxo de Caixa: projeção de entradas e saídas',
        ],
        dica: 'Comece cadastrando os projetos, depois lance receitas e despesas. O rateio distribui custos fixos automaticamente.',
      },
      Projetos: {
        titulo: 'Projetos — Gestão de Turmas',
        icone: '🎓',
        objetivo: 'Gerenciar turmas de formatura como projetos independentes.',
        como_usar: [
          'Cada projeto tem: nome, turma, instituição, curso, cidade',
          'Status: 🔵 Captação → 🟡 Produção → 🟢 Entregue → ⚫ Encerrado',
          'Defina clientes esperados e ticket médio — a meta é calculada automaticamente',
          'Clique no projeto para ver DRE simplificada, parcelas e break-even',
        ],
        dica: 'Monitore o break-even de cada projeto. Se faltar muitos clientes, intensifique a captação.',
      },
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FORME SEGURO
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  fs: {
    titulo: 'Forme Seguro — Fundos de Formatura',
    descricao: 'Gestão de fundos de formatura premium com projeções e gestão de fundos.',
    abas: {
      'Gestão de Fundos': {
        titulo: 'Gestão de Fundos',
        icone: '🏦',
        objetivo: 'Controlar os fundos de formatura gerenciados pela Forme Seguro.',
        como_usar: [
          'Visualize turmas ativas com valor gerenciado',
          'Acompanhe arrecadação, inadimplência e projeções',
          'Interface dark mode integrada ao ORION',
        ],
        dica: 'Compare o capital atual com as projeções para identificar oportunidades de crescimento.',
      },
      'Projeções': {
        titulo: 'Projeções Financeiras',
        icone: '🔮',
        objetivo: 'Projetar o crescimento do capital gerenciado nos próximos 12 meses.',
        como_usar: [
          'Gráfico de evolução do capital mês a mês',
          'Tabela detalhada com capital projetado e receita estimada',
          'KPIs: capital projetado 12m, turmas ativas, receita mensal, ticket médio',
        ],
        dica: 'Use as projeções para definir metas comerciais e planejar expansão.',
      },
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GESTÃO PESSOAL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  gp: {
    titulo: 'Gestão Pessoal — Patrimônio & Finanças',
    descricao: 'Controle patrimonial e financeiro pessoal de Maxwell.',
    abas: {
      'Patrimônio': {
        titulo: 'Patrimônio Pessoal',
        icone: '🏠',
        objetivo: 'Visualizar e gerenciar o patrimônio total: imóveis, investimentos, veículos, previdência e dívidas.',
        como_usar: [
          'Cards: Total Ativos, Total Passivos (Dívidas), Patrimônio Líquido',
          'Distribuição por categoria com barras visuais',
          'Evolução patrimonial histórica em gráfico',
          'Botão ✏️ Editar para atualizar valores',
        ],
        dica: 'Atualize mensalmente para acompanhar a evolução do patrimônio líquido.',
      },
      'Extratos IA': {
        titulo: 'Extratos com IA — MAXXXI Classificador',
        icone: '🤖',
        objetivo: 'Importar extratos bancários e ter as despesas classificadas automaticamente pelo MAXXXI.',
        como_usar: [
          '📎 Importar: arraste CSV, Excel, PDF, imagem ou Word do seu banco',
          '✅ Validação: revise cada transação — valide ou corrija a categoria',
          '📊 Resumo: veja top categorias de gasto e totais',
          '📂 Histórico: lista de todos os extratos importados',
          '🤖 Regras: veja o que o MAXXXI aprendeu com suas validações',
        ],
        dica: 'Quanto mais você valida, mais o MAXXXI aprende. Após ~50 validações ele classifica 80%+ sozinho.',
      },
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DOCTOR WEALTH
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  dw: {
    titulo: 'Doctor Wealth — Ecossistema Financeiro Médico',
    descricao: 'Gestão contábil e financeira para médicos. Foco em recorrência e crescimento de base.',
    abas: {},
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CDL ITAPERUNA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  cdl: {
    titulo: 'CDL ITAPERUNA — Câmara de Dirigentes Lojistas',
    descricao: 'Gestão da associação com foco em associados, eventos e receita associativa.',
    abas: {},
  },
}

// ── Helper: buscar manual de uma aba específica ──
export function getManualAba(empresaId, nomeAba) {
  // Primeiro busca na empresa específica
  const empManual = MANUAL[empresaId]
  if (empManual?.abas?.[nomeAba]) return empManual.abas[nomeAba]
  // Depois busca no geral
  return MANUAL.geral.abas[nomeAba] || null
}

// ── Helper: buscar manual completo de uma empresa ──
export function getManualEmpresa(empresaId) {
  const emp = MANUAL[empresaId] || {}
  const geral = MANUAL.geral
  // Mesclar abas gerais com específicas da empresa
  return {
    titulo: emp.titulo || geral.titulo,
    descricao: emp.descricao || geral.descricao,
    abas: { ...geral.abas, ...(emp.abas || {}) },
  }
}

// ── Helper: gerar texto completo para MAXXXI ou PDF ──
export function gerarTextoManual(empresaId) {
  const manual = getManualEmpresa(empresaId)
  let texto = `📖 MANUAL — ${manual.titulo}\n${manual.descricao}\n\n`
  texto += `Versão: ${MANUAL_VERSION} (${MANUAL_DATE})\n\n`
  Object.entries(manual.abas).forEach(([nome, aba]) => {
    texto += `━━━ ${aba.icone} ${aba.titulo} ━━━\n`
    texto += `Objetivo: ${aba.objetivo}\n\n`
    texto += `Como usar:\n`
    aba.como_usar.forEach((step, i) => { texto += `  ${i + 1}. ${step}\n` })
    texto += `\n💡 Dica: ${aba.dica}\n\n`
  })
  return texto
}
