import { useData } from '../contexts/DataContext'

export default function CEO() {
  const { empresas, kpis, fmt, loaded } = useData()

  if (!loaded) return <div className="loading">Carregando...</div>

  const empsAtivas = empresas.filter(e => e.id !== 'gp')
  const ranked = [...empsAtivas].sort((a, b) => b.faturamento - a.faturamento)
  const fatTotal = empsAtivas.reduce((s, e) => s + (e.faturamento || 0), 0)

  // Stat cards
  const maiorMargem = [...empsAtivas].sort((a, b) => {
    const mA = a.faturamento > 0 ? (a.resultado / a.faturamento) * 100 : 0
    const mB = b.faturamento > 0 ? (b.resultado / b.faturamento) * 100 : 0
    return mB - mA
  })[0]
  const margemPct = maiorMargem && maiorMargem.faturamento > 0
    ? ((maiorMargem.resultado / maiorMargem.faturamento) * 100).toFixed(1)
    : 0

  const maiorCresc = [...empsAtivas].sort((a, b) => b.crescimento - a.crescimento)[0]
  const emAtencao = empsAtivas.filter(e => e.score < 60)

  // Total clientes (parse from kpis)
  let totalClientes = 0
  empsAtivas.forEach(e => {
    const kpi = kpis.filter(k => k.empresa_id === e.id).find(k =>
      k.label.toLowerCase().includes('cliente') || k.label.toLowerCase().includes('associado')
    )
    if (kpi) {
      const match = kpi.valor.match(/[\d.]+/)
      if (match) totalClientes += parseInt(match[0].replace('.', ''), 10)
    }
  })

  return (
    <div className="page ceo">
      <h1>Visao CEO Consolidada</h1>
      <p className="subtitle">Ranking e indicadores estrategicos</p>

      {/* Stat Cards */}
      <div className="g4">
        <div className="card kpi-card">
          <span className="lbl">Maior Margem</span>
          <span className="val">{maiorMargem?.sigla || '—'}</span>
          <span className="sub">{margemPct}% margem liquida</span>
        </div>
        <div className="card kpi-card">
          <span className="lbl">Maior Crescimento</span>
          <span className="val" style={{ color: '#10b981' }}>
            {maiorCresc ? `${maiorCresc.sigla} +${maiorCresc.crescimento}%` : '—'}
          </span>
        </div>
        <div className="card kpi-card">
          <span className="lbl">Em Atencao</span>
          <span className="val" style={{ color: emAtencao.length > 0 ? '#f59e0b' : '#10b981' }}>
            {emAtencao.length > 0 ? emAtencao.map(e => e.sigla).join(', ') : 'Nenhuma'}
          </span>
        </div>
        <div className="card kpi-card">
          <span className="lbl">Clientes Total</span>
          <span className="val">{totalClientes > 0 ? totalClientes.toLocaleString('pt-BR') : '—'}</span>
        </div>
      </div>

      {/* Ranking por Faturamento */}
      <div className="card">
        <h3>Ranking por Faturamento</h3>
        <div className="ranking-list">
          {ranked.map((emp, i) => {
            const pct = fatTotal > 0 ? ((emp.faturamento / fatTotal) * 100).toFixed(1) : 0
            return (
              <div key={emp.id} className="ranking-row">
                <span className="ranking-pos">#{i + 1}</span>
                <span className="emp-sigla-sm" style={{ background: emp.cor }}>{emp.sigla}</span>
                <span className="ranking-name">{emp.nome}</span>
                <div className="ranking-bar-track">
                  <div
                    className="ranking-bar-fill"
                    style={{
                      width: `${(emp.faturamento / (ranked[0]?.faturamento || 1)) * 100}%`,
                      background: emp.cor,
                    }}
                  />
                </div>
                <span className="ranking-val">{fmt(emp.faturamento)}</span>
                <span className="ranking-pct">{pct}%</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Distribuicao de Receita */}
      <div className="card">
        <h3>Distribuicao de Receita</h3>
        <div className="dist-bars">
          <div className="dist-bar-row">
            {ranked.map(emp => {
              const pct = fatTotal > 0 ? (emp.faturamento / fatTotal) * 100 : 0
              return (
                <div
                  key={emp.id}
                  className="dist-segment"
                  style={{ width: `${pct}%`, background: emp.cor, minWidth: '2%' }}
                  title={`${emp.sigla}: ${pct.toFixed(1)}%`}
                />
              )
            })}
          </div>
          <div className="dist-legend">
            {ranked.map(emp => {
              const pct = fatTotal > 0 ? ((emp.faturamento / fatTotal) * 100).toFixed(1) : 0
              return (
                <span key={emp.id} className="dist-legend-item">
                  <i style={{ background: emp.cor }} />
                  {emp.sigla} ({pct}%)
                </span>
              )
            })}
          </div>
        </div>
      </div>

      {/* Detalhamento */}
      <div className="card">
        <h3>Detalhamento por Empresa</h3>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Faturamento</th>
                <th>Resultado</th>
                <th>Margem</th>
                <th>Crescimento</th>
                <th>Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map(emp => {
                const margem = emp.faturamento > 0 ? ((emp.resultado / emp.faturamento) * 100).toFixed(1) : 0
                return (
                  <tr key={emp.id}>
                    <td>
                      <span className="emp-sigla-sm" style={{ background: emp.cor }}>{emp.sigla}</span>
                      {emp.nome}
                    </td>
                    <td>{fmt(emp.faturamento)}</td>
                    <td>{fmt(emp.resultado)}</td>
                    <td>{margem}%</td>
                    <td style={{ color: emp.crescimento >= 0 ? '#10b981' : '#ef4444' }}>
                      {emp.crescimento > 0 ? '+' : ''}{emp.crescimento}%
                    </td>
                    <td>
                      <span style={{ color: emp.score >= 70 ? '#10b981' : emp.score >= 50 ? '#f59e0b' : '#ef4444' }}>
                        {emp.score}
                      </span>
                    </td>
                    <td>
                      <span className="badge" style={{ background: emp.status_cor }}>{emp.status}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr>
                <td><strong>Total</strong></td>
                <td><strong>{fmt(fatTotal)}</strong></td>
                <td><strong>{fmt(empsAtivas.reduce((s, e) => s + e.resultado, 0))}</strong></td>
                <td colSpan={4} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
