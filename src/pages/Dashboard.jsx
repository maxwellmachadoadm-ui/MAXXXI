import { useNavigate } from 'react-router-dom'
import { useData } from '../contexts/DataContext'

const REVENUE_HISTORY = [
  { mes: 'Out', valor: 98000 },
  { mes: 'Nov', valor: 105000 },
  { mes: 'Dez', valor: 112000 },
  { mes: 'Jan', valor: 95000 },
  { mes: 'Fev', valor: 108000 },
  { mes: 'Mar', valor: 126500 },
]

const CLIENT_HISTORY = [32, 35, 38, 36, 40, 42]

export default function Dashboard() {
  const { empresas, tarefas, fmt, loaded } = useData()
  const navigate = useNavigate()

  if (!loaded) return <div className="loading">Carregando...</div>

  const empsAtivas = empresas.filter(e => e.id !== 'gp')
  const maxRev = Math.max(...REVENUE_HISTORY.map(r => r.valor))

  // Task stats
  const todoCount = tarefas.filter(t => t.status === 'todo').length
  const doingCount = tarefas.filter(t => t.status === 'doing').length
  const doneCount = tarefas.filter(t => t.status === 'done').length
  const totalTasks = tarefas.length || 1

  // Donut chart values
  const donutSize = 120
  const strokeWidth = 18
  const radius = (donutSize - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const todoPct = todoCount / totalTasks
  const doingPct = doingCount / totalTasks
  const donePct = doneCount / totalTasks

  const todoOffset = 0
  const doingOffset = todoPct * circumference
  const doneOffset = (todoPct + doingPct) * circumference

  // Sparkline helper
  function Sparkline({ data, color, width = 120, height = 40 }) {
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    const points = data.map((v, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((v - min) / range) * (height - 4) - 2
      return `${x},${y}`
    }).join(' ')
    return (
      <svg width={width} height={height} className="sparkline">
        <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
      </svg>
    )
  }

  return (
    <div className="page dashboard">
      <h1>Dashboard Executivo</h1>
      <p className="subtitle">Visao analitica consolidada</p>

      {/* Revenue Bar Chart */}
      <div className="g2">
        <div className="card">
          <h3>Receita Mensal</h3>
          <div className="bar-chart">
            {REVENUE_HISTORY.map((r, i) => (
              <div key={i} className="bar-col">
                <span className="bar-val">{fmt(r.valor)}</span>
                <div
                  className="bar"
                  style={{
                    height: `${(r.valor / maxRev) * 160}px`,
                    background: i === REVENUE_HISTORY.length - 1 ? '#3b82f6' : 'rgba(59,130,246,0.4)',
                  }}
                />
                <span className="bar-label">{r.mes}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut Chart */}
        <div className="card">
          <h3>Tarefas por Status</h3>
          <div className="donut-wrap">
            <svg width={donutSize} height={donutSize} viewBox={`0 0 ${donutSize} ${donutSize}`}>
              {/* Todo */}
              <circle
                cx={donutSize / 2} cy={donutSize / 2} r={radius}
                fill="none" stroke="#ef4444" strokeWidth={strokeWidth}
                strokeDasharray={`${todoPct * circumference} ${circumference}`}
                strokeDashoffset={-todoOffset}
                transform={`rotate(-90 ${donutSize / 2} ${donutSize / 2})`}
              />
              {/* Doing */}
              <circle
                cx={donutSize / 2} cy={donutSize / 2} r={radius}
                fill="none" stroke="#f59e0b" strokeWidth={strokeWidth}
                strokeDasharray={`${doingPct * circumference} ${circumference}`}
                strokeDashoffset={-doingOffset}
                transform={`rotate(-90 ${donutSize / 2} ${donutSize / 2})`}
              />
              {/* Done */}
              <circle
                cx={donutSize / 2} cy={donutSize / 2} r={radius}
                fill="none" stroke="#10b981" strokeWidth={strokeWidth}
                strokeDasharray={`${donePct * circumference} ${circumference}`}
                strokeDashoffset={-doneOffset}
                transform={`rotate(-90 ${donutSize / 2} ${donutSize / 2})`}
              />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="18" fontWeight="bold">
                {tarefas.length}
              </text>
            </svg>
            <div className="donut-legend">
              <span><i style={{ background: '#ef4444' }} /> A Fazer ({todoCount})</span>
              <span><i style={{ background: '#f59e0b' }} /> Em Andamento ({doingCount})</span>
              <span><i style={{ background: '#10b981' }} /> Concluidas ({doneCount})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sparklines */}
      <div className="g2">
        <div className="card">
          <h3>Tendencia Receita</h3>
          <Sparkline data={REVENUE_HISTORY.map(r => r.valor)} color="#3b82f6" width={280} height={60} />
          <p className="spark-note">Ultimos 6 meses</p>
        </div>
        <div className="card">
          <h3>Tendencia Clientes</h3>
          <Sparkline data={CLIENT_HISTORY} color="#10b981" width={280} height={60} />
          <p className="spark-note">Ultimos 6 meses</p>
        </div>
      </div>

      {/* Health Score Bars */}
      <div className="card">
        <h3>Health Score por Empresa</h3>
        <div className="health-bars">
          {empresas.map(emp => (
            <div key={emp.id} className="health-row">
              <span className="health-label">
                <span className="emp-sigla-sm" style={{ background: emp.cor }}>{emp.sigla}</span>
                {emp.nome}
              </span>
              <div className="health-bar-track">
                <div
                  className="health-bar-fill"
                  style={{
                    width: `${emp.score}%`,
                    background: emp.score >= 70 ? '#10b981' : emp.score >= 50 ? '#f59e0b' : '#ef4444',
                  }}
                />
              </div>
              <span className="health-val">{emp.score}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance vs Meta */}
      <div className="card">
        <h3>Performance vs Meta</h3>
        <div className="health-bars">
          {empsAtivas.filter(e => e.meta > 0).map(emp => {
            const pct = Math.min(Math.round((emp.faturamento / emp.meta) * 100), 100)
            return (
              <div key={emp.id} className="health-row">
                <span className="health-label">
                  <span className="emp-sigla-sm" style={{ background: emp.cor }}>{emp.sigla}</span>
                  {emp.nome}
                </span>
                <div className="health-bar-track">
                  <div
                    className="health-bar-fill"
                    style={{
                      width: `${pct}%`,
                      background: pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444',
                    }}
                  />
                </div>
                <span className="health-val">{pct}%</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <h2>Acoes Rapidas</h2>
      <div className="g4">
        <button className="btn btn-action" onClick={() => navigate('/tarefas')}>📋 Tarefas</button>
        <button className="btn btn-action" onClick={() => navigate('/ceo')}>📊 Visao CEO</button>
        {empresas.map(emp => (
          <button key={emp.id} className="btn btn-action" onClick={() => navigate(`/empresa/${emp.id}`)}>
            {emp.sigla} — {emp.nome}
          </button>
        ))}
      </div>
    </div>
  )
}
