import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { supabase, isDemoMode } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { DEMO_DATA } from '../lib/demoData'

// ── BANCO DE CLASSIFICAÇÕES ──
export const CLASSIFICATION_BANK = {
  RECEITAS:   ['Honorários / Mensalidades', 'Serviços Avulsos', 'Eventos', 'Outros'],
  PESSOAL:    ['Salários', 'Pró-labore', 'Comissões', 'Encargos'],
  ESCRITÓRIO: ['Aluguel', 'Internet / Telefone', 'Material de Consumo', 'Material de Limpeza'],
  MARKETING:  ['Redes Sociais', 'Publicidade', 'Materiais Gráficos'],
  IMPOSTOS:   ['Simples Nacional', 'ISS', 'Outros Tributos'],
  FINANCEIRO: ['Tarifas Bancárias', 'Juros', 'Parcelamentos'],
  OUTROS:     ['Despesas Diversas'],
}

export const REVENUE_ORIGINS = ['PIX', 'Boleto', 'Cartão', 'Transferência', 'Dinheiro']
export const BANKS = ['Nubank', 'C6 Bank', 'Caixa Econômica', 'Itaú', 'Bradesco', 'Santander', 'BTG Pactual', 'Inter', 'Outro']

// ── LANÇAMENTOS DEMO ──
const DEMO_LANCAMENTOS_V4 = [
  { id:'l01', empresa_id:'dw', tipo:'receita',  categoria:'RECEITAS',   subcategoria:'Honorários / Mensalidades', banco:'Nubank',         origem:'PIX',           valor:38000, mes:'2026-03', descricao:'Mensalidades médicos março',       data:'2026-03-05', status:'aprovado', anexo_nome:null, criado_por:'admin', criado_em:'2026-03-05T09:00:00Z' },
  { id:'l02', empresa_id:'dw', tipo:'despesa',  categoria:'PESSOAL',    subcategoria:'Salários',                  banco:'C6 Bank',         origem:null,            valor:12000, mes:'2026-03', descricao:'Salário equipe DW',               data:'2026-03-05', status:'aprovado', anexo_nome:'folha_mar26.pdf', criado_por:'admin', criado_em:'2026-03-05T10:00:00Z' },
  { id:'l03', empresa_id:'dw', tipo:'despesa',  categoria:'IMPOSTOS',   subcategoria:'Simples Nacional',          banco:'Nubank',         origem:null,            valor:4200,  mes:'2026-03', descricao:'DAS Simples Nacional',             data:'2026-03-20', status:'aprovado', anexo_nome:'das_mar.pdf', criado_por:'admin', criado_em:'2026-03-20T08:00:00Z' },
  { id:'l04', empresa_id:'dw', tipo:'despesa',  categoria:'ESCRITÓRIO', subcategoria:'Internet / Telefone',       banco:'Nubank',         origem:null,            valor:890,   mes:'2026-03', descricao:'Servidor cloud ORION',             data:'2026-03-10', status:'aprovado', anexo_nome:null, criado_por:'admin', criado_em:'2026-03-10T08:00:00Z' },
  { id:'l05', empresa_id:'dw', tipo:'despesa',  categoria:'ESCRITÓRIO', subcategoria:'Aluguel',                   banco:'Caixa Econômica', origem:null,            valor:3500,  mes:'2026-03', descricao:'Aluguel escritório matriz',        data:'2026-03-01', status:'aprovado', anexo_nome:null, criado_por:'admin', criado_em:'2026-03-01T07:00:00Z' },
  { id:'l06', empresa_id:'of', tipo:'receita',  categoria:'RECEITAS',   subcategoria:'Serviços Avulsos',          banco:'C6 Bank',         origem:'Boleto',        valor:28000, mes:'2026-03', descricao:'Ensaios e eventos março',          data:'2026-03-08', status:'aprovado', anexo_nome:null, criado_por:'admin', criado_em:'2026-03-08T09:00:00Z' },
  { id:'l07', empresa_id:'of', tipo:'despesa',  categoria:'PESSOAL',    subcategoria:'Salários',                  banco:'C6 Bank',         origem:null,            valor:7500,  mes:'2026-03', descricao:'Salário equipe OF',               data:'2026-03-05', status:'aprovado', anexo_nome:null, criado_por:'admin', criado_em:'2026-03-05T09:30:00Z' },
  { id:'l08', empresa_id:'of', tipo:'despesa',  categoria:'MARKETING',  subcategoria:'Redes Sociais',             banco:'Nubank',         origem:null,            valor:1200,  mes:'2026-03', descricao:'Campanha Instagram OF',            data:'2026-03-12', status:'aprovado', anexo_nome:null, criado_por:'admin', criado_em:'2026-03-12T11:00:00Z' },
  { id:'l09', empresa_id:'fs', tipo:'receita',  categoria:'RECEITAS',   subcategoria:'Honorários / Mensalidades', banco:'BTG Pactual',     origem:'Transferência', valor:15000, mes:'2026-03', descricao:'Gestão fundos março',              data:'2026-03-03', status:'aprovado', anexo_nome:null, criado_por:'admin', criado_em:'2026-03-03T09:00:00Z' },
  { id:'l10', empresa_id:'fs', tipo:'despesa',  categoria:'MARKETING',  subcategoria:'Publicidade',               banco:'Nubank',         origem:null,            valor:1200,  mes:'2026-03', descricao:'Campanha captação turmas',         data:'2026-03-15', status:'aprovado', anexo_nome:null, criado_por:'admin', criado_em:'2026-03-15T10:00:00Z' },
  { id:'l11', empresa_id:'cdl',tipo:'receita',  categoria:'RECEITAS',   subcategoria:'Honorários / Mensalidades', banco:'Caixa Econômica', origem:'Boleto',        valor:35000, mes:'2026-03', descricao:'Associatividade CDL março',        data:'2026-03-05', status:'aprovado', anexo_nome:null, criado_por:'admin', criado_em:'2026-03-05T08:00:00Z' },
  { id:'l12', empresa_id:'cdl',tipo:'despesa',  categoria:'PESSOAL',    subcategoria:'Salários',                  banco:'Caixa Econômica', origem:null,            valor:9000,  mes:'2026-03', descricao:'Folha de pagamento CDL',          data:'2026-03-05', status:'aprovado', anexo_nome:null, criado_por:'admin', criado_em:'2026-03-05T09:00:00Z' },
  { id:'l13', empresa_id:'dw', tipo:'receita',  categoria:'RECEITAS',   subcategoria:'Honorários / Mensalidades', banco:'Nubank',         origem:'PIX',           valor:36000, mes:'2026-02', descricao:'Mensalidades médicos fevereiro',  data:'2026-02-05', status:'aprovado', anexo_nome:null, criado_por:'admin', criado_em:'2026-02-05T09:00:00Z' },
  { id:'l14', empresa_id:'dw', tipo:'despesa',  categoria:'PESSOAL',    subcategoria:'Salários',                  banco:'C6 Bank',         origem:null,            valor:12000, mes:'2026-02', descricao:'Salário equipe DW fev',           data:'2026-02-05', status:'aprovado', anexo_nome:null, criado_por:'admin', criado_em:'2026-02-05T10:00:00Z' },
  { id:'l15', empresa_id:'dw', tipo:'despesa',  categoria:'IMPOSTOS',   subcategoria:'Simples Nacional',          banco:'Nubank',         origem:null,            valor:4100,  mes:'2026-02', descricao:'DAS Simples Nacional fev',        data:'2026-02-20', status:'aprovado', anexo_nome:null, criado_por:'admin', criado_em:'2026-02-20T08:00:00Z' },
]

const DataContext = createContext(null)
export const useData = () => useContext(DataContext)

export function DataProvider({ children }) {
  const { user, userCompanies, isAdmin } = useAuth()
  const [empresas, setEmpresas] = useState([])
  const [tarefas, setTarefas] = useState([])
  const [kpis, setKpis] = useState([])
  const [okrs, setOkrs] = useState([])
  const [contratos, setContratos] = useState([])
  const [riscos, setRiscos] = useState([])
  const [decisoes, setDecisoes] = useState([])
  const [crmLeads, setCrmLeads] = useState([])
  const [checkin, setCheckin] = useState({ prioridade: '', decisao: '', resultado: '' })
  const [loaded, setLoaded] = useState(false)

  // ── LANÇAMENTOS FINANCEIROS ──
  const [lancamentos, setLancamentos] = useState(() => {
    try {
      const saved = localStorage.getItem('orion_lancamentos_v4')
      return saved ? JSON.parse(saved) : DEMO_LANCAMENTOS_V4
    } catch { return DEMO_LANCAMENTOS_V4 }
  })

  // ── FILA DE APROVAÇÃO ──
  const [pendingClassifications, setPendingClassifications] = useState(() => {
    try { return JSON.parse(localStorage.getItem('orion_pending_class') || '[]') } catch { return [] }
  })

  // ── ARQUIVOS ──
  const [arquivos, setArquivos] = useState(() => {
    try { return JSON.parse(localStorage.getItem('orion_arquivos') || '[]') } catch { return [] }
  })

  // ── APRENDIZADO MAXXXI ──
  const [maxxxi_learned, setMaxxxiLearned] = useState(() => {
    try { return JSON.parse(localStorage.getItem('orion_maxxxi_learned') || '{}') } catch { return {} }
  })

  const loadAll = useCallback(async () => {
    if (!user) return
    if (isDemoMode) {
      setEmpresas(DEMO_DATA.empresas)
      setKpis(DEMO_DATA.kpis)
      setOkrs(DEMO_DATA.okrs)
      setContratos(DEMO_DATA.contratos)
      setRiscos(DEMO_DATA.riscos)
      setDecisoes(DEMO_DATA.decisoes)
      setCrmLeads(DEMO_DATA.crmLeads)
      const savedTasks = localStorage.getItem('orion_tasks_v2')
      setTarefas(savedTasks ? JSON.parse(savedTasks) : DEMO_DATA.tarefas)
      const savedCI = localStorage.getItem('orion_ci_' + new Date().toDateString())
      if (savedCI) setCheckin(JSON.parse(savedCI))
      setLoaded(true)
      return
    }
    const [e, t, k, o, c, r, d, crm] = await Promise.all([
      supabase.from('empresas').select('*'),
      supabase.from('tarefas').select('*').order('created_at', { ascending: false }),
      supabase.from('kpis').select('*').order('ordem'),
      supabase.from('okrs').select('*'),
      supabase.from('contratos').select('*'),
      supabase.from('riscos').select('*'),
      supabase.from('decisoes').select('*'),
      supabase.from('crm_leads').select('*')
    ])
    setEmpresas(e.data || [])
    setTarefas(t.data || [])
    setKpis(k.data || [])
    setOkrs(o.data || [])
    setContratos(c.data || [])
    setRiscos(r.data || [])
    setDecisoes(d.data || [])
    setCrmLeads(crm.data || [])
    // Load today's checkin
    const { data: ci } = await supabase.from('checkins')
      .select('*').eq('user_id', user.id).eq('data', new Date().toISOString().slice(0, 10)).single()
    if (ci) setCheckin({ prioridade: ci.prioridade || '', decisao: ci.decisao || '', resultado: ci.resultado || '' })
    setLoaded(true)
  }, [user])

  useEffect(() => { loadAll() }, [loadAll])

  // Realtime subscriptions
  useEffect(() => {
    if (isDemoMode || !user) return
    const channel = supabase.channel('orion-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tarefas' }, () => {
        supabase.from('tarefas').select('*').order('created_at', { ascending: false }).then(({ data }) => setTarefas(data || []))
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'empresas' }, () => {
        supabase.from('empresas').select('*').then(({ data }) => setEmpresas(data || []))
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [user])

  // ── TASK CRUD ──
  async function addTask(task) {
    if (isDemoMode) {
      const t = { ...task, id: Date.now().toString(), created_at: new Date().toISOString() }
      const next = [t, ...tarefas]
      setTarefas(next)
      localStorage.setItem('orion_tasks_v2', JSON.stringify(next))
      return t
    }
    const { data, error } = await supabase.from('tarefas').insert({ ...task, created_by: user.id }).select().single()
    if (error) throw error
    setTarefas(prev => [data, ...prev])
    return data
  }

  async function updateTask(id, updates) {
    if (isDemoMode) {
      const next = tarefas.map(t => t.id === id ? { ...t, ...updates } : t)
      setTarefas(next)
      localStorage.setItem('orion_tasks_v2', JSON.stringify(next))
      return
    }
    const { error } = await supabase.from('tarefas').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) throw error
    setTarefas(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  async function deleteTask(id) {
    if (isDemoMode) {
      const next = tarefas.filter(t => t.id !== id)
      setTarefas(next)
      localStorage.setItem('orion_tasks_v2', JSON.stringify(next))
      return
    }
    await supabase.from('tarefas').delete().eq('id', id)
    setTarefas(prev => prev.filter(t => t.id !== id))
  }

  // ── CHECKIN ──
  async function saveCheckin(ci) {
    setCheckin(ci)
    if (isDemoMode) {
      localStorage.setItem('orion_ci_' + new Date().toDateString(), JSON.stringify(ci))
      return
    }
    await supabase.from('checkins').upsert({
      user_id: user.id,
      data: new Date().toISOString().slice(0, 10),
      ...ci
    })
  }

  // ── LANÇAMENTOS CRUD ──
  function addLancamento(lancamento) {
    const novo = { ...lancamento, id: Date.now().toString(), criado_em: new Date().toISOString() }
    const next = [novo, ...lancamentos]
    setLancamentos(next)
    localStorage.setItem('orion_lancamentos_v4', JSON.stringify(next))
  }

  function approveLancamento(id) {
    const next = lancamentos.map(l => l.id === id ? { ...l, status: 'aprovado' } : l)
    setLancamentos(next)
    localStorage.setItem('orion_lancamentos_v4', JSON.stringify(next))
    // Remove da fila de pendentes
    const pendNext = pendingClassifications.filter(p => p.lancamento_id !== id)
    setPendingClassifications(pendNext)
    localStorage.setItem('orion_pending_class', JSON.stringify(pendNext))
  }

  function deleteLancamento(id) {
    if (!isAdmin) return
    const next = lancamentos.filter(l => l.id !== id)
    setLancamentos(next)
    localStorage.setItem('orion_lancamentos_v4', JSON.stringify(next))
  }

  function getLancamentosByEmpresa(empresaId, mes) {
    return lancamentos.filter(l => {
      const empOk = !empresaId || empresaId === 'all' || l.empresa_id === empresaId
      const mesOk = !mes || l.mes === mes
      return empOk && mesOk
    })
  }

  function getResumoFinanceiro(empresaId) {
    const items = lancamentos.filter(l =>
      l.status === 'aprovado' &&
      (!empresaId || empresaId === 'all' || l.empresa_id === empresaId)
    )
    const receitas = items.filter(l => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0)
    const despesas = items.filter(l => l.tipo === 'despesa').reduce((s, l) => s + l.valor, 0)
    const resultado = receitas - despesas
    const margem = receitas > 0 ? ((resultado / receitas) * 100).toFixed(1) : 0

    const porCategoria = {}
    items.forEach(l => {
      if (!porCategoria[l.categoria]) porCategoria[l.categoria] = { receitas: 0, despesas: 0 }
      if (l.tipo === 'receita') porCategoria[l.categoria].receitas += l.valor
      else porCategoria[l.categoria].despesas += l.valor
    })

    const porBanco = {}
    items.forEach(l => {
      if (!l.banco) return
      if (!porBanco[l.banco]) porBanco[l.banco] = { entradas: 0, saidas: 0 }
      if (l.tipo === 'receita') porBanco[l.banco].entradas += l.valor
      else porBanco[l.banco].saidas += l.valor
    })

    return { receitas, despesas, resultado, margem, porCategoria, porBanco }
  }

  // ── ARQUIVOS CRUD ──
  function addArquivo(arquivo) {
    const novo = { ...arquivo, id: Date.now().toString(), data_upload: new Date().toISOString() }
    const next = [novo, ...arquivos]
    setArquivos(next)
    localStorage.setItem('orion_arquivos', JSON.stringify(next))
  }

  function deleteArquivo(id) {
    if (!isAdmin) return
    const next = arquivos.filter(a => a.id !== id)
    setArquivos(next)
    localStorage.setItem('orion_arquivos', JSON.stringify(next))
  }

  // ── APRENDIZADO MAXXXI ──
  function learnClassification(descricao, categoria, subcategoria) {
    const key = descricao.toLowerCase().trim()
    const next = {
      ...maxxxi_learned,
      [key]: { categoria, subcategoria, count: ((maxxxi_learned[key]?.count) || 0) + 1 }
    }
    setMaxxxiLearned(next)
    localStorage.setItem('orion_maxxxi_learned', JSON.stringify(next))
  }

  function suggestClassification(descricao) {
    const key = descricao.toLowerCase().trim()
    // Busca exata
    if (maxxxi_learned[key]) return { ...maxxxi_learned[key], confidence: 95 }
    // Busca parcial
    const keys = Object.keys(maxxxi_learned)
    for (const k of keys) {
      if (key.includes(k) || k.includes(key)) {
        return { ...maxxxi_learned[k], confidence: 70 }
      }
    }
    return null
  }

  // ── Empresas filtradas pelo acesso do usuário ──
  const empresasVisiveis = useMemo(() => {
    if (!userCompanies || userCompanies.length === 0) return empresas
    return empresas.filter(e => userCompanies.includes(e.id))
  }, [empresas, userCompanies])

  // ── HELPERS ──
  function getEmpresa(id) { return empresas.find(e => e.id === id) }
  function getKpis(empId) { return kpis.filter(k => k.empresa_id === empId) }
  function getOkrs(empId) { return okrs.filter(o => o.empresa_id === empId) }
  function getTarefas(empId) { return tarefas.filter(t => t.empresa_id === empId) }
  function getContratos(empId) { return contratos.filter(c => c.empresa_id === empId) }
  function getRiscos(empId) { return riscos.filter(r => r.empresa_id === empId) }
  function getDecisoes(empId) { return decisoes.filter(d => d.empresa_id === empId) }
  function getCrmLeads(empId) { return crmLeads.filter(l => l.empresa_id === empId) }

  const fmt = v => {
    if (!v && v !== 0) return '—'
    if (v === 0) return 'R$ 0'
    if (v >= 1000000) return 'R$ ' + (v / 1000000).toFixed(1) + 'M'
    if (v >= 1000) return 'R$ ' + (v / 1000).toFixed(0) + 'k'
    return 'R$ ' + Number(v).toLocaleString('pt-BR')
  }

  function generateAlerts() {
    const alerts = []
    // Alertas segmentados — apenas empresas visíveis ao usuário
    empresasVisiveis.filter(e => e.id !== 'gp').forEach(e => {
      const inadKpi = getKpis(e.id).find(k => k.label.toLowerCase().includes('inadim'))
      if (inadKpi) {
        const val = parseFloat(inadKpi.valor)
        if (val > 5) alerts.push({ level: 'critico', text: `${e.nome} — Inadimplencia em ${inadKpi.valor} (limite: 5%)`, emp: e.id })
      }
      if (e.meta > 0) {
        const pct = ((e.faturamento / e.meta) * 100).toFixed(0)
        if (pct < 50) alerts.push({ level: 'atencao', text: `${e.nome} — Meta mensal: apenas ${pct}% atingida (${fmt(e.faturamento)} / ${fmt(e.meta)})`, emp: e.id })
      }
      getContratos(e.id).filter(c => c.status === 'inadim').forEach(c => {
        alerts.push({ level: 'critico', text: `${e.nome} — Contrato ${c.nome} inadimplente`, emp: e.id })
      })
      const altaPend = getTarefas(e.id).filter(t => t.prioridade === 'alta' && t.status !== 'done')
      if (altaPend.length >= 3) alerts.push({ level: 'atencao', text: `${e.nome} — ${altaPend.length} tarefas de alta prioridade`, emp: e.id })
    })
    return alerts
  }

  return (
    <DataContext.Provider value={{
      empresas: empresasVisiveis, // filtradas pelo acesso do usuário
      _allEmpresas: empresas,      // todas, para uso interno
      tarefas, kpis, okrs, contratos, riscos, decisoes, crmLeads,
      checkin, loaded, fmt,
      getEmpresa, getKpis, getOkrs, getTarefas, getContratos, getRiscos, getDecisoes, getCrmLeads,
      addTask, updateTask, deleteTask, saveCheckin, generateAlerts, reload: loadAll,
      setCrmLeads,
      // Financeiro v4
      CLASSIFICATION_BANK, REVENUE_ORIGINS, BANKS,
      lancamentos, pendingClassifications,
      addLancamento, approveLancamento, deleteLancamento,
      getLancamentosByEmpresa, getResumoFinanceiro,
      // Arquivos
      arquivos, addArquivo, deleteArquivo,
      // MAXXXI aprendizado
      maxxxi_learned, learnClassification, suggestClassification,
    }}>
      {children}
    </DataContext.Provider>
  )
}
