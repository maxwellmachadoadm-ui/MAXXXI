import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'

export default function Home() {
  const { profile } = useAuth()
  const { empresas, tarefas, checkin, saveCheckin, generateAlerts, fmt, loaded } = useData()
  const navigate = useNavigate()
  const [ci, setCi] = useState(checkin)

  if (!loaded) return <div className="loading">Carregando...</div>

  // Greeting
  const h = new Date().getHours()
  const greeting = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
  const userName = profile?.name || 'Executivo'

  // KPIs
  const empsAtivas = empresas.filter(e => e.id !== 'gp')
  const fatTotal = empsAtivas.reduce((s, e) => s + (e.faturamento || 0), 0)
  const resTotal = empsAtivas.reduce((s, e) => s + (e.resultado || 0), 0)
  const avgScore = empsAtivas.length > 0
    ? Math.round(empsAtivas.reduce((s, e) => s + (e.score || 0), 0) / empsAtivas.length)
    : 0
  const alerts = generateAlerts()

  function handleCiChange(field, value) {
    const next = { ...ci, [field]: value }
    setCi(next)
  }

  function handleCiSave() {
    saveCheckin(ci)
  }

  return (
    <div className="page home">
      <h1>{greeting}, {userName} 👋</h1>
      <p className="subtitle">Painel executivo — visao consolidada</p>

      {/* KPI Cards */}
      <div className="g4">
        <div className="card kpi-card">
          <span className="lbl">Faturamento Total</span>
          <span className="val">{fmt(fatTotal)}</span>
        </div>
        <div className="card kpi-card">
          <span className="lbl">Resultado Liquido</span>
          <span className="val">{fmt(resTotal)}</span>
        </div>
        <div className="card kpi-card">
          <span className="lbl">Health Score Medio</span>
          <span className="val">{avgScore}/100</span>
        </div>
        <div className="card kpi-card">
          <span className="lbl">Alertas Ativos</span>
          <span className="val" style={{ color: alerts.length > 0 ? '#ef4444' : '#10b981' }}>
            {alerts.length}
          </span>
        </div>
      </div>

      {/* Empresas Grid */}
      <h2>Suas Empresas</h2>
      <div className="g4">
        {empresas.map(emp => {
          const pct = emp.meta > 0 ? Math.round((emp.faturamento / emp.meta) * 100) : 0
          return (
            <div
              key={emp.id}
              className="card emp-card"
              style={{ borderLeft: `4px solid ${emp.cor}`, cursor: 'pointer' }}
              onClick={() => navigate(`/empresa/${emp.id}`)}
            >
              <div className="emp-card-header">
                <span className="emp-sigla" style={{ background: emp.cor }}>{emp.sigla}</span>
                <div>
                  <strong>{emp.nome}</strong>
                  <small>{emp.descricao}</small>
                </div>
              </div>
              <div className="emp-card-body">
                <div className="emp-stat">
                  <span className="lbl">Faturamento</span>
                  <span className="val">{fmt(emp.faturamento)}</span>
                </div>
                <div className="emp-stat">
                  <span className="lbl">Resultado</span>
                  <span className="val">{fmt(emp.resultado)}</span>
                </div>
                <div className="emp-stat">
                  <span className="lbl">Crescimento</span>
                  <span className="val" style={{ color: emp.crescimento >= 0 ? '#10b981' : '#ef4444' }}>
                    {emp.crescimento > 0 ? '+' : ''}{emp.crescimento}%
                  </span>
                </div>
              </div>
              <div className="score-bar-wrap">
                <div className="score-bar" style={{ width: `${emp.score}%`, background: emp.cor }} />
              </div>
              <div className="emp-card-footer">
                <span className="badge" style={{ background: emp.status_cor }}>{emp.status}</span>
                <span className="lbl">Score {emp.score}</span>
                {emp.meta > 0 && <span className="lbl">Meta {pct}%</span>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Check-in Diario */}
      <h2>Check-in Diario</h2>
      <div className="card checkin-card">
        <div className="checkin-fields">
          <div className="checkin-field">
            <label>🎯 Prioridade do dia</label>
            <textarea
              value={ci.prioridade}
              onChange={e => handleCiChange('prioridade', e.target.value)}
              placeholder="Qual e a sua principal prioridade hoje?"
              rows={3}
            />
          </div>
          <div className="checkin-field">
            <label>⚡ Decisao pendente</label>
            <textarea
              value={ci.decisao}
              onChange={e => handleCiChange('decisao', e.target.value)}
              placeholder="Alguma decisao importante para tomar hoje?"
              rows={3}
            />
          </div>
          <div className="checkin-field">
            <label>✅ Resultado esperado</label>
            <textarea
              value={ci.resultado}
              onChange={e => handleCiChange('resultado', e.target.value)}
              placeholder="O que voce espera entregar ate o fim do dia?"
              rows={3}
            />
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleCiSave}>Salvar Check-in</button>
      </div>

      {/* Alertas */}
      {alerts.length > 0 && (
        <>
          <h2>Alertas</h2>
          <div className="alerts-list">
            {alerts.map((a, i) => (
              <div
                key={i}
                className={`card alert-item alert-${a.level}`}
                onClick={() => navigate(`/empresa/${a.emp}`)}
                style={{ cursor: 'pointer' }}
              >
                <span className="alert-icon">{a.level === 'critico' ? '🚨' : '⚠️'}</span>
                <span className="alert-text">{a.text}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Quick Stats */}
      <h2>Tarefas Resumo</h2>
      <div className="g4">
        <div className="card kpi-card">
          <span className="lbl">Total</span>
          <span className="val">{tarefas.length}</span>
        </div>
        <div className="card kpi-card">
          <span className="lbl">A Fazer</span>
          <span className="val">{tarefas.filter(t => t.status === 'todo').length}</span>
        </div>
        <div className="card kpi-card">
          <span className="lbl">Em Andamento</span>
          <span className="val">{tarefas.filter(t => t.status === 'doing').length}</span>
        </div>
        <div className="card kpi-card">
          <span className="lbl">Concluidas</span>
          <span className="val">{tarefas.filter(t => t.status === 'done').length}</span>
        </div>
      </div>
    </div>
  )
}
