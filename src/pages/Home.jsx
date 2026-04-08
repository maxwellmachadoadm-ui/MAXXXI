import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData, safeName } from '../contexts/DataContext'
import { useApp } from '../contexts/AppContext'

export default function Home() {
  const { empresas, tarefas, generateAlertsV5, generateAlerts, fmt, loaded, getPatrimonio } = useData()
  const { presentationMode } = useApp()
  const navigate = useNavigate()
  const [monitorAlertas, setMonitorAlertas] = useState([])
  const [monitorLoading, setMonitorLoading] = useState(false)
  const [lastAnalysis, setLastAnalysis] = useState(null)

  // Chamar monitor em background ao carregar
  useEffect(() => {
    if (!loaded) return
    const cached = sessionStorage.getItem('orion_monitor_cache')
    if (cached) {
      try { const d = JSON.parse(cached); setMonitorAlertas(d.mensagens || []); setLastAnalysis(d.time) } catch {}
      return
    }
    fetchMonitor()
  }, [loaded])

  async function fetchMonitor() {
    setMonitorLoading(true)
    try {
      const r = await fetch('/api/monitor')
      if (r.ok) {
        const d = await r.json()
        setMonitorAlertas(d.mensagens || [])
        const time = new Date().toISOString()
        setLastAnalysis(time)
        sessionStorage.setItem('orion_monitor_cache', JSON.stringify({ mensagens: d.mensagens, time }))
      }
    } catch (_) {}
    setMonitorLoading(false)
  }

  if (!loaded) return null

  const empsAtivas = empresas.filter(e => e.id !== 'gp')
  const fatTotal = empsAtivas.reduce((s, e) => s + (e.faturamento || 0), 0)
  const resTotal = empsAtivas.reduce((s, e) => s + (e.resultado || 0), 0)
  const avgScore = Math.round(empresas.reduce((s, e) => s + (e.score || 0), 0) / (empresas.length || 1))
  const scoreColor = avgScore >= 70 ? 'var(--green)' : avgScore >= 40 ? 'var(--amber)' : 'var(--red)'
  const alerts = generateAlertsV5 ? generateAlertsV5() : generateAlerts()

  return (
    <>
      {presentationMode && (
        <div className="presentation-banner">
          🔒 MODO APRESENTAÇÃO — valores sensíveis ocultos
        </div>
      )}

      {/* KPIs */}
      <div className="g4 mb">
        <div className="card">
          <div className="lbl">Faturamento do Ecossistema</div>
          <div className="val txt-blue">{presentationMode ? '••••' : fmt(fatTotal)}</div>
          <div className="delta-neu">{empsAtivas.length} empresas ativas</div>
        </div>
        <div className="card">
          <div className="lbl">Resultado Líquido</div>
          <div className="val txt-green">{presentationMode ? '••••' : fmt(resTotal)}</div>
          <div className={resTotal >= 0 ? 'delta-up' : 'delta-down'}>Margem {fatTotal > 0 ? ((resTotal / fatTotal) * 100).toFixed(1) + '%' : '—'}</div>
        </div>
        <div className="card">
          <div className="lbl">Health Score Médio</div>
          <div className="val" style={{ color: scoreColor }}>{avgScore}</div>
          <div className="delta-neu">{empresas.length} empresas ativas</div>
        </div>
        <div className="card">
          <div className="lbl">Alertas Ativos</div>
          <div className="val txt-red">{alerts.length}</div>
          <div className="delta-neu">{alerts.filter(a => a.level === 'critico').length} críticos · {alerts.filter(a => a.level === 'atencao').length} atenção</div>
        </div>
      </div>

      {/* Empresas */}
      <div className="slbl">Selecione uma empresa</div>
      <div className="emp-grid">
        {empresas.map(e => {
          const pct = e.meta > 0 ? Math.min(e.faturamento / e.meta * 100, 100).toFixed(0) : 0
          const cresc = (e.crescimento != null && isFinite(e.crescimento)) ? e.crescimento : null
          const crescC = (cresc ?? 0) >= 0 ? 'var(--green)' : 'var(--red)'
          const crescS = (cresc ?? 0) >= 0 ? '▲' : '▼'
          const scoreColor = e.score >= 70 ? 'var(--green)' : e.score >= 40 ? 'var(--amber)' : 'var(--red)'
          return (
            <div key={e.id} className="emp-card" onClick={() => navigate(`/empresa/${e.id}`)}
              style={{ '--emp-c': e.cor, '--emp-rgb': e.rgb }}>
              <div className="emp-top"></div>
              <div className="emp-header">
                <div className="flex aic gap12">
                  <div className="emp-sig">{e.sigla}</div>
                  <div><div className="emp-name">{safeName(e.nome)}</div><div className="emp-desc">{e.descricao}</div></div>
                </div>
                <span className="stag" style={{ color: e.status_cor, background: e.status_cor + '18' }}>{e.status}</span>
              </div>
              {e.id !== 'gp' ? (
                <>
                  <div className="emp-nums">
                    <div><div className="emp-nlbl">Faturamento</div><div className="emp-nval" style={{ color: e.cor }}>{presentationMode ? '••••' : fmt(e.faturamento)}</div></div>
                    <div><div className="emp-nlbl">Margem</div><div className="emp-nval">{e.faturamento > 0 ? ((e.resultado / e.faturamento) * 100).toFixed(0) + '%' : '—'}</div></div>
                    <div><div className="emp-nlbl">vs Meta</div><div className="emp-nval" style={{ color: crescC }}>{cresc != null ? `${crescS} ${Math.abs(cresc)}%` : '—'}</div></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--tx3)', marginBottom: 4 }}>
                    <span>{presentationMode ? '••••' : fmt(e.faturamento)}</span>
                    <span>Meta {presentationMode ? '••••' : fmt(e.meta)}</span>
                  </div>
                  <div className="pbar"><div className="pfill" style={{ width: pct + '%', background: e.cor }}></div></div>
                </>
              ) : (
                <div className="emp-nums">
                  <div><div className="emp-nlbl">Patrimônio</div><div className="emp-nval" style={{ color: e.cor }}>{presentationMode ? '••••' : fmt((() => { const p = getPatrimonio ? getPatrimonio() : null; return p ? p.imoveis + p.investimentos + p.participacoes + p.veiculos + p.previdencia : 0 })())}</div></div>
                  <div><div className="emp-nlbl">Investimentos</div><div className="emp-nval">{presentationMode ? '••••' : fmt(getPatrimonio ? (getPatrimonio()?.investimentos || 0) : 0)}</div></div>
                  <div><div className="emp-nlbl">Dívidas</div><div className="emp-nval txt-red">{presentationMode ? '••••' : fmt(getPatrimonio ? (getPatrimonio()?.dividas || 0) : 0)}</div></div>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                <div className="flex aic gap8">
                  <div className="hring" style={{ borderColor: scoreColor, color: scoreColor }}>{e.score}</div>
                  <span style={{ fontSize: 11, color: 'var(--tx3)' }}>Health Score</span>
                </div>
                <span style={{ fontSize: 12, color: 'var(--tx3)' }}>Clique para abrir →</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* MAXXXI Monitor */}
      {(monitorAlertas.length > 0 || monitorLoading) && (
        <div className="module-card mb">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>🤖</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>MAXXXI — Análise Proativa</div>
                <div style={{ fontSize: 10, color: 'var(--tx3)' }}>
                  {monitorLoading ? 'Analisando...' : lastAnalysis ? `Última análise: ${new Date(lastAnalysis).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : ''}
                </div>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={fetchMonitor} disabled={monitorLoading}>
              {monitorLoading ? '⏳' : '🔍 Analisar agora'}
            </button>
          </div>
          {monitorAlertas.map((a, i) => (
            <div key={i} style={{
              padding: '10px 14px', borderRadius: 8, marginBottom: 8, fontSize: 13, lineHeight: 1.6,
              background: a.nivel === 'critico' ? 'rgba(239,68,68,.08)' : a.nivel === 'atencao' ? 'rgba(245,158,11,.08)' : 'rgba(59,130,246,.08)',
              borderLeft: `3px solid ${a.nivel === 'critico' ? 'var(--red)' : a.nivel === 'atencao' ? 'var(--gold)' : 'var(--blue)'}`,
            }}>
              <div style={{ fontSize: 10, color: 'var(--tx3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
                {a.nivel === 'critico' ? '🔴' : a.nivel === 'atencao' ? '🟡' : 'ℹ️'} {a.empresa} — {a.tipo?.replace(/_/g, ' ')}
              </div>
              <div style={{ color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{a.mensagem}</div>
            </div>
          ))}
        </div>
      )}

      {/* Alertas */}
      <div className="slbl">Central de Alertas</div>
      {alerts.length === 0 && monitorAlertas.length === 0 && <div style={{ color: 'var(--green)', fontSize: 13, padding: 12 }}>Nenhum alerta ativo — ecossistema saudável</div>}
      {alerts.map((a, i) => (
        <div key={i} className={a.level === 'critico' ? 'alert-r' : 'alert-a'} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => navigate(`/empresa/${a.emp}`)}>
          {a.level === 'critico' ? '🔴' : '🟡'} {a.text}
          {a.tipo && <span style={{ fontSize: 10, color: 'var(--tx3)', marginLeft: 'auto' }}>{a.tipo}</span>}
        </div>
      ))}

    </>
  )
}
