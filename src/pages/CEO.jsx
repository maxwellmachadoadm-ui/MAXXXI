import { useNavigate } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { useApp } from '../contexts/AppContext'

export default function CEO() {
  const { empresas, kpis, fmt, loaded, generateAlertsV5, generateAlerts, getCashFlow, getPipeline, getPatrimonio } = useData()
  const { presentationMode } = useApp()
  const navigate = useNavigate()

  if (!loaded) return <div className="loading">Carregando...</div>

  const empsAtivas = empresas.filter(e => e.id !== 'gp')
  const ranked = [...empsAtivas].sort((a, b) => b.faturamento - a.faturamento)
  const fatTotal = empsAtivas.reduce((s, e) => s + (e.faturamento || 0), 0)
  const resTotal = empsAtivas.reduce((s, e) => s + (e.resultado || 0), 0)
  const avgScore = Math.round(empsAtivas.reduce((s, e) => s + (e.score || 0), 0) / (empsAtivas.length || 1))
  const scoreColor = avgScore >= 70 ? 'var(--green)' : avgScore >= 40 ? 'var(--amber)' : 'var(--red)'

  const alerts = generateAlertsV5 ? generateAlertsV5() : generateAlerts()
  const criticos = alerts.filter(a => a.level === 'critico')

  // Fluxo de caixa consolidado (soma das empresas)
  const cfConsolidado = empsAtivas.reduce((acc, e) => {
    const cf = getCashFlow ? getCashFlow(e.id, 90) : { semanas: [] }
    cf.semanas.forEach((s, i) => {
      if (!acc[i]) acc[i] = { semana: s.semana, entrada: 0, saida: 0, saldo: 0 }
      acc[i].entrada += s.entrada
      acc[i].saida += s.saida
      acc[i].saldo += s.saldo
    })
    return acc
  }, [])
  const cfAlerta = empsAtivas.some(e => getCashFlow ? getCashFlow(e.id, 30).alertaNegativo : false)

  // Pipeline consolidado
  const pipelineTotal = empsAtivas.reduce((acc, e) => {
    const p = getPipeline ? getPipeline(e.id) : { garantida: 0, provavel: 0, possivel: 0, total: 0 }
    acc.garantida += p.garantida
    acc.provavel += p.provavel
    acc.possivel += p.possivel
    acc.total += p.total
    return acc
  }, { garantida: 0, provavel: 0, possivel: 0, total: 0 })

  // Patrimônio
  const pat = getPatrimonio ? getPatrimonio() : null
  const patrimonioLiquido = pat ? (pat.imoveis + pat.investimentos + pat.participacoes + pat.veiculos + pat.previdencia) - pat.dividas : 0

  const maxCF = Math.max(...cfConsolidado.map(s => Math.max(s.entrada, s.saida)), 1)

  return (
    <div className="page ceo">
      <h1>Visão CEO</h1>
      <p className="subtitle">Painel consolidado do ecossistema Maxwell Machado</p>

      {/* Seção 1 — KPIs Consolidados */}
      <div className="ceo-kpi-grid">
        <div className="card">
          <div className="lbl">Receita Total do Ecossistema</div>
          <div className="val txt-blue">{presentationMode ? '••••' : fmt(fatTotal)}</div>
          <div className="delta-up">&#9650; +8,2% vs mês anterior</div>
        </div>
        <div className="card">
          <div className="lbl">Resultado Líquido Total</div>
          <div className="val txt-green">{presentationMode ? '••••' : fmt(resTotal)}</div>
          <div className="delta-up">&#9650; Margem {fatTotal > 0 ? ((resTotal / fatTotal) * 100).toFixed(1) : 0}%</div>
        </div>
        <div className="card">
          <div className="lbl">Health Score Médio</div>
          <div className="val" style={{ color: scoreColor }}>{avgScore}/100</div>
          <div className="delta-neu">{empsAtivas.length} empresas ativas</div>
        </div>
        <div className="card">
          <div className="lbl">Total de Alertas</div>
          <div className="val" style={{ color: criticos.length > 0 ? 'var(--red)' : 'var(--amber)' }}>{alerts.length}</div>
          <div className="delta-neu" style={{ color: criticos.length > 0 ? 'var(--red)' : undefined }}>
            {criticos.length} críticos · {alerts.filter(a => a.level === 'atencao').length} atenção
          </div>
        </div>
      </div>

      {/* Seção 2 — Health Score Comparativo */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontFamily: "'Syne',sans-serif", marginBottom: 16 }}>Health Score Comparativo</h3>
        {ranked.map(emp => {
          const hColor = emp.score >= 70 ? 'var(--green)' : emp.score >= 40 ? 'var(--amber)' : 'var(--red)'
          const hLabel = emp.score >= 70 ? 'Saudável' : emp.score >= 40 ? 'Atenção' : 'Crítico'
          return (
            <div key={emp.id} className="health-bar-row" style={{ cursor: 'pointer' }} onClick={() => navigate(`/empresa/${emp.id}`)}>
              <span className="emp-sigla-sm" style={{ background: emp.cor, flexShrink: 0 }}>{emp.sigla}</span>
              <span style={{ minWidth: 140, fontSize: 13 }}>{emp.nome}</span>
              <div className="health-bar-track" style={{ flex: 1 }}>
                <div className="health-bar-fill" style={{ width: `${emp.score}%`, background: hColor }} />
              </div>
              <span style={{ minWidth: 32, textAlign: 'right', fontFamily: "'Syne',sans-serif", fontWeight: 700, color: hColor, fontSize: 15 }}>{emp.score}</span>
              <span style={{ minWidth: 56, fontSize: 11, color: hColor, textAlign: 'right' }}>{hLabel}</span>
            </div>
          )
        })}
      </div>

      {/* Seção 3 — Fluxo de Caixa Consolidado */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ fontFamily: "'Syne',sans-serif" }}>Fluxo de Caixa Consolidado — 90 dias</h3>
          {cfAlerta && <span className="status-badge danger">⚠️ Saldo negativo detectado</span>}
        </div>
        {cfConsolidado.length > 0 ? (
          <>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 160, overflowX: 'auto' }}>
              {cfConsolidado.slice(0, 13).map((s, i) => {
                const hE = Math.round((s.entrada / maxCF) * 140)
                const hS = Math.round((s.saida / maxCF) * 140)
                return (
                  <div key={i} style={{ flex: 1, minWidth: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 140 }}>
                      <div style={{ width: 10, height: hE, background: 'var(--green)', borderRadius: '3px 3px 0 0', opacity: .8 }} />
                      <div style={{ width: 10, height: hS, background: 'var(--red)', borderRadius: '3px 3px 0 0', opacity: .8 }} />
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--tx3)' }}>{s.semana}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: s.saldo >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {s.saldo >= 0 ? '+' : ''}{presentationMode ? '••' : (s.saldo / 1000).toFixed(0) + 'k'}
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11 }}>
              <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--green)', borderRadius: 2, marginRight: 4 }} />Entradas</span>
              <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--red)', borderRadius: 2, marginRight: 4 }} />Saídas</span>
              <span style={{ marginLeft: 'auto', color: 'var(--tx3)' }}>
                Saldo final projetado: <strong style={{ color: cfConsolidado[cfConsolidado.length - 1]?.saldo >= 0 ? 'var(--green)' : 'var(--red)' }}>
                  {presentationMode ? '••••' : fmt(cfConsolidado[cfConsolidado.length - 1]?.saldo || 0)}
                </strong>
              </span>
            </div>
          </>
        ) : <p className="empty">Sem dados de fluxo de caixa.</p>}
      </div>

      {/* Seção 4 — Pipeline Total */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontFamily: "'Syne',sans-serif", marginBottom: 16 }}>Pipeline Total de Receita Futura</h3>
        <div className="g4" style={{ marginBottom: 16 }}>
          <div style={{ padding: '12px 16px', background: 'var(--s2)', borderRadius: 'var(--r2)', borderLeft: '3px solid var(--green)' }}>
            <div className="lbl">Garantida</div>
            <div className="val txt-green">{presentationMode ? '••••' : fmt(pipelineTotal.garantida)}</div>
            <div style={{ fontSize: 11, color: 'var(--tx3)' }}>Contratos ativos</div>
          </div>
          <div style={{ padding: '12px 16px', background: 'var(--s2)', borderRadius: 'var(--r2)', borderLeft: '3px solid var(--amber)' }}>
            <div className="lbl">Provável</div>
            <div className="val" style={{ color: 'var(--amber)' }}>{presentationMode ? '••••' : fmt(pipelineTotal.provavel)}</div>
            <div style={{ fontSize: 11, color: 'var(--tx3)' }}>Negociação (70%)</div>
          </div>
          <div style={{ padding: '12px 16px', background: 'var(--s2)', borderRadius: 'var(--r2)', borderLeft: '3px solid var(--blue)' }}>
            <div className="lbl">Possível</div>
            <div className="val txt-blue">{presentationMode ? '••••' : fmt(pipelineTotal.possivel)}</div>
            <div style={{ fontSize: 11, color: 'var(--tx3)' }}>Proposta (40%)</div>
          </div>
          <div style={{ padding: '12px 16px', background: 'var(--s2)', borderRadius: 'var(--r2)', borderLeft: '3px solid var(--purple)' }}>
            <div className="lbl">Total Pipeline</div>
            <div className="val" style={{ color: 'var(--purple)' }}>{presentationMode ? '••••' : fmt(pipelineTotal.total)}</div>
            <div style={{ fontSize: 11, color: 'var(--tx3)' }}>Próximos 3 meses</div>
          </div>
        </div>
      </div>

      {/* Seção 5 — Ranking Expandido */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontFamily: "'Syne',sans-serif", marginBottom: 12 }}>Ranking por Faturamento</h3>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Empresa</th>
                <th>Faturamento</th>
                <th>Resultado</th>
                <th>Margem</th>
                <th>Crescimento</th>
                <th>Score</th>
                <th>Pipeline</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((emp, i) => {
                const pct = fatTotal > 0 ? ((emp.faturamento / fatTotal) * 100).toFixed(1) : 0
                const margem = emp.faturamento > 0 ? ((emp.resultado / emp.faturamento) * 100).toFixed(1) : 0
                const pipe = getPipeline ? getPipeline(emp.id) : { total: 0 }
                return (
                  <tr key={emp.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/empresa/${emp.id}`)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, color: 'var(--tx3)' }}>#{i + 1}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="emp-sigla-sm" style={{ background: emp.cor }}>{emp.sigla}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{emp.nome}</div>
                          <div style={{ fontSize: 10, color: 'var(--tx3)' }}>{pct}% da receita total</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700 }}>{presentationMode ? '••••' : fmt(emp.faturamento)}</td>
                    <td style={{ color: emp.resultado >= 0 ? 'var(--green)' : 'var(--red)' }}>{presentationMode ? '••••' : fmt(emp.resultado)}</td>
                    <td>{margem}%</td>
                    <td style={{ color: emp.crescimento >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {emp.crescimento > 0 ? '+' : ''}{emp.crescimento}%
                    </td>
                    <td>
                      <span style={{ color: emp.score >= 70 ? 'var(--green)' : emp.score >= 50 ? 'var(--amber)' : 'var(--red)', fontFamily: "'Syne',sans-serif", fontWeight: 700 }}>
                        {emp.score}
                      </span>
                    </td>
                    <td style={{ color: 'var(--purple)' }}>{presentationMode ? '••••' : fmt(pipe.total)}</td>
                    <td>
                      <span className="badge" style={{ background: emp.status_cor }}>{emp.status}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2}><strong>Total</strong></td>
                <td><strong>{presentationMode ? '••••' : fmt(fatTotal)}</strong></td>
                <td><strong style={{ color: resTotal >= 0 ? 'var(--green)' : 'var(--red)' }}>{presentationMode ? '••••' : fmt(resTotal)}</strong></td>
                <td colSpan={5} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Seção 6 — Alertas Críticos */}
      {criticos.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Syne',sans-serif", marginBottom: 12, color: 'var(--red)' }}>🔴 Alertas Críticos Ativos</h3>
          {criticos.map((a, i) => (
            <div key={i} className="alert-r" style={{ cursor: 'pointer', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}
              onClick={() => navigate(`/empresa/${a.emp}`)}>
              🔴 {a.text}
              {a.tipo && <span style={{ fontSize: 10, color: 'var(--tx3)', marginLeft: 'auto' }}>{a.tipo}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Seção 7 — Patrimônio */}
      {pat && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Syne',sans-serif", marginBottom: 16 }}>💰 Patrimônio Líquido Pessoal</h3>
          <div className="g3" style={{ marginBottom: 16 }}>
            <div style={{ padding: '12px 16px', background: 'var(--s2)', borderRadius: 'var(--r2)', borderLeft: '3px solid var(--green)' }}>
              <div className="lbl">Total Ativos</div>
              <div className="val txt-green">{presentationMode ? '••••' : fmt(pat.imoveis + pat.investimentos + pat.participacoes + pat.veiculos + pat.previdencia)}</div>
            </div>
            <div style={{ padding: '12px 16px', background: 'var(--s2)', borderRadius: 'var(--r2)', borderLeft: '3px solid var(--red)' }}>
              <div className="lbl">Passivos (Dívidas)</div>
              <div className="val txt-red">{presentationMode ? '••••' : fmt(pat.dividas)}</div>
            </div>
            <div style={{ padding: '12px 16px', background: 'var(--s2)', borderRadius: 'var(--r2)', borderLeft: '3px solid var(--blue)' }}>
              <div className="lbl">Patrimônio Líquido</div>
              <div className="val txt-blue">{presentationMode ? '••••' : fmt(patrimonioLiquido)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { label: 'Imóveis', val: pat.imoveis, color: 'var(--blue)' },
              { label: 'Investimentos', val: pat.investimentos, color: 'var(--green)' },
              { label: 'Participações', val: pat.participacoes, color: 'var(--purple)' },
              { label: 'Veículos', val: pat.veiculos, color: 'var(--amber)' },
              { label: 'Previdência', val: pat.previdencia, color: 'var(--cyan)' },
            ].map(c => (
              <div key={c.label} style={{ flex: '1 1 140px', padding: '10px 14px', background: 'var(--s2)', borderRadius: 'var(--r2)', borderTop: `2px solid ${c.color}` }}>
                <div style={{ fontSize: 11, color: 'var(--tx3)', marginBottom: 4 }}>{c.label}</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, color: c.color }}>{presentationMode ? '••••' : fmt(c.val)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Distribuição */}
      <div className="card">
        <h3 style={{ fontFamily: "'Syne',sans-serif", marginBottom: 12 }}>Distribuição de Receita</h3>
        <div className="dist-bars">
          <div className="dist-bar-row">
            {ranked.map(emp => {
              const pct = fatTotal > 0 ? (emp.faturamento / fatTotal) * 100 : 0
              return (
                <div key={emp.id} className="dist-segment"
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
                  <i style={{ background: emp.cor }} />{emp.sigla} ({pct}%)
                </span>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
