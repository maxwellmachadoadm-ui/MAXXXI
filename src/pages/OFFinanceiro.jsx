import { useState } from 'react'
import useOFFinanceiro, { STATUS_LABELS, STATUS_COLORS } from '../hooks/useOFFinanceiro'

const TABS = [
  { key: 'dashboard', label: '📊 Dashboard' },
  { key: 'projetos',  label: '🎓 Projetos' },
  { key: 'lanc',      label: '💳 Lançamentos' },
  { key: 'parcelas',  label: '📋 Parcelas' },
  { key: 'rateio',    label: '⚖️ Rateio' },
  { key: 'orcado',    label: '📐 Orçado vs Real' },
  { key: 'dre',       label: '📈 DRE' },
  { key: 'fluxo',     label: '💰 Fluxo de Caixa' },
]

export default function OFFinanceiro() {
  const of = useOFFinanceiro()
  const [tab, setTab] = useState('dashboard')
  const [selProjeto, setSelProjeto] = useState(null)
  const [selComp, setSelComp] = useState(of.mesAtual)
  const [showNewProj, setShowNewProj] = useState(false)
  const [showNewLanc, setShowNewLanc] = useState(false)
  const [newProj, setNewProj] = useState({ nome:'', turma:'', instituicao:'', curso:'', cidade:'', status:'captacao', num_clientes_esperados:0, ticket_medio_esperado:0 })
  const [newLanc, setNewLanc] = useState({ tipo:'despesa', natureza:'direta', descricao:'', valor_previsto:0, valor_realizado:0, projeto_id:'', conta_codigo:'', competencia:of.mesAtual, status:'previsto' })
  const [filterProjeto, setFilterProjeto] = useState('all')
  const [rateioLancId, setRateioLancId] = useState(null)
  const [rateioTipo, setRateioTipo] = useState('igualitario')

  const consolidada = of.calcularDREConsolidada(selComp)
  const inadTotal = of.calcularInadimplencia(null)
  const alertas = of.calcularAlertas()
  const fluxo = of.calcularFluxoCaixa(6)
  const projetosAtivos = of.projetos.filter(p => p.status === 'producao')

  function handleAddProj(e) {
    e.preventDefault()
    const meta = (newProj.num_clientes_esperados || 0) * (newProj.ticket_medio_esperado || 0)
    of.addProjeto({ ...newProj, meta_receita: meta })
    setShowNewProj(false)
    setNewProj({ nome:'', turma:'', instituicao:'', curso:'', cidade:'', status:'captacao', num_clientes_esperados:0, ticket_medio_esperado:0 })
  }

  function handleAddLanc(e) {
    e.preventDefault()
    of.addLancamento(newLanc)
    setShowNewLanc(false)
    setNewLanc({ tipo:'despesa', natureza:'direta', descricao:'', valor_previsto:0, valor_realizado:0, projeto_id:'', conta_codigo:'', competencia:of.mesAtual, status:'previsto' })
  }

  return (
    <div>
      {/* Tabs */}
      <div className="tab-nav mb" style={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
        {TABS.map(t => (
          <button key={t.key} className={`tab-btn ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {/* ═══ DASHBOARD ═══ */}
      {tab === 'dashboard' && (
        <div>
          {/* KPIs Linha 1 */}
          <div className="g4 mb">
            <div className="card" style={{ padding: 14 }}>
              <div className="lbl">Faturamento Mês</div>
              <div className="val txt-blue" style={{ fontSize: 20 }}>{of.fmt(consolidada.receitaTotal)}</div>
              <div className="delta-neu">{projetosAtivos.length} projetos ativos</div>
            </div>
            <div className="card" style={{ padding: 14 }}>
              <div className="lbl">Resultado Líquido</div>
              <div className="val" style={{ fontSize: 20, color: consolidada.resultadoTotal >= 0 ? 'var(--green)' : 'var(--red)' }}>{of.fmt(consolidada.resultadoTotal)}</div>
              <div className="delta-neu">Margem {consolidada.margemMedia}%</div>
            </div>
            <div className="card" style={{ padding: 14 }}>
              <div className="lbl">Ticket Médio Geral</div>
              <div className="val txt-purple" style={{ fontSize: 20 }}>{of.fmt(projetosAtivos.reduce((s,p) => s + (p.ticket_medio_contratado || 0), 0) / (projetosAtivos.length || 1))}</div>
            </div>
            <div className="card" style={{ padding: 14 }}>
              <div className="lbl">Inadimplência</div>
              <div className="val txt-red" style={{ fontSize: 20 }}>{of.fmt(inadTotal.totalVencido)}</div>
              <div className="delta-neu">{inadTotal.percentual}% do total</div>
            </div>
          </div>

          {/* KPIs Linha 2 */}
          <div className="g4 mb">
            {consolidada.ranking[0] && (
              <div className="card" style={{ padding: 14 }}>
                <div className="lbl">Mais Lucrativo</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{consolidada.ranking[0].projeto?.nome?.split(' ').slice(0,2).join(' ')}</div>
                <div className="val txt-green" style={{ fontSize: 16 }}>{of.fmt(consolidada.ranking[0].resultado)}</div>
              </div>
            )}
            {inadTotal.inadimplentes[0] && (
              <div className="card" style={{ padding: 14 }}>
                <div className="lbl">Maior Atraso</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{inadTotal.inadimplentes[0].cliente_nome}</div>
                <div className="val txt-red" style={{ fontSize: 16 }}>{inadTotal.inadimplentes[0].dias_atraso} dias</div>
              </div>
            )}
            <div className="card" style={{ padding: 14 }}>
              <div className="lbl">Parcelas a Vencer (30d)</div>
              <div className="val txt-amber" style={{ fontSize: 20 }}>
                {of.parcelas.filter(p => p.status === 'aberto' && p.data_vencimento >= of.hoje && p.data_vencimento <= new Date(Date.now() + 30*86400000).toISOString().slice(0,10)).length}
              </div>
            </div>
            <div className="card" style={{ padding: 14 }}>
              <div className="lbl">Projetos em Captação</div>
              <div className="val txt-blue" style={{ fontSize: 20 }}>{of.projetos.filter(p => p.status === 'captacao').length}</div>
            </div>
          </div>

          {/* Receita por Projeto */}
          <div className="module-card mb">
            <div className="module-card-title">Receita vs Despesa por Projeto</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', height: 160 }}>
              {projetosAtivos.map(p => {
                const dre = of.calcularDREProjeto(p.id, selComp)
                const maxV = Math.max(dre.receitaBruta, dre.despesasDiretas + dre.rateioTotal, 1)
                const hR = Math.round((dre.receitaBruta / maxV) * 140)
                const hD = Math.round(((dre.despesasDiretas + dre.rateioTotal) / maxV) * 140)
                return (
                  <div key={p.id} style={{ flex: 1, textAlign: 'center', minWidth: 50 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 3, height: 140 }}>
                      <div style={{ width: 14, height: hR, background: 'var(--green)', borderRadius: '3px 3px 0 0', opacity: .8 }} title={`Receita: ${of.fmt(dre.receitaBruta)}`} />
                      <div style={{ width: 14, height: hD, background: 'var(--red)', borderRadius: '3px 3px 0 0', opacity: .8 }} title={`Despesa: ${of.fmt(dre.despesasDiretas + dre.rateioTotal)}`} />
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--tx3)', marginTop: 4 }}>{p.turma || p.nome.split(' ')[0]}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Alertas */}
          {alertas.length > 0 && (
            <div className="module-card">
              <div className="module-card-title">🚨 Alertas ({alertas.length})</div>
              {alertas.map((a, i) => (
                <div key={i} className={a.level === 'critico' ? 'alert-r' : a.level === 'ok' ? 'alert-g' : 'alert-a'} style={{ marginBottom: 6, fontSize: 13, padding: '8px 12px', borderRadius: 8 }}>
                  {a.level === 'critico' ? '🔴' : a.level === 'ok' ? '🟢' : '🟡'} {a.text}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ PROJETOS ═══ */}
      {tab === 'projetos' && (
        <div>
          <div className="flex aic jsb mb">
            <div className="slbl" style={{ margin: 0 }}>Projetos ({of.projetos.length})</div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowNewProj(true)}>+ Novo Projeto</button>
          </div>
          <div className="module-card" style={{ overflowX: 'auto' }}>
            <table className="exec-table">
              <thead>
                <tr><th>Turma</th><th>Instituição</th><th>Status</th><th>Clientes</th><th>Receita</th><th>Meta</th><th>%</th><th>Margem</th><th>Ticket</th></tr>
              </thead>
              <tbody>
                {of.projetos.map(p => {
                  const dre = of.calcularDREProjeto(p.id, selComp)
                  const pctMeta = p.meta_receita > 0 ? of.pct(dre.receitaBruta, p.meta_receita) : '—'
                  return (
                    <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => setSelProjeto(selProjeto === p.id ? null : p.id)}>
                      <td style={{ fontWeight: 600 }}>{p.turma || p.nome}</td>
                      <td style={{ fontSize: 12, color: 'var(--tx3)' }}>{p.instituicao}</td>
                      <td><span style={{ fontSize: 11, color: STATUS_COLORS[p.status] }}>{STATUS_LABELS[p.status]}</span></td>
                      <td>{p.num_clientes_confirmados}/{p.num_clientes_esperados}</td>
                      <td style={{ fontWeight: 700, color: 'var(--green)' }}>{of.fmt(dre.receitaBruta)}</td>
                      <td style={{ fontSize: 12, color: 'var(--tx3)' }}>{of.fmt(p.meta_receita)}</td>
                      <td style={{ fontWeight: 600 }}>{pctMeta}%</td>
                      <td style={{ color: parseFloat(dre.margem) >= 15 ? 'var(--green)' : 'var(--red)' }}>{dre.margem}%</td>
                      <td>{of.fmt(dre.ticketReal)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Detalhes do projeto selecionado */}
          {selProjeto && (() => {
            const p = of.projetos.find(x => x.id === selProjeto)
            const dre = of.calcularDREProjeto(selProjeto, selComp)
            const inad = of.calcularInadimplencia(selProjeto)
            const be = of.calcularBreakEven(selProjeto)
            if (!p) return null
            return (
              <div className="module-card" style={{ marginTop: 12 }}>
                <div className="module-card-title">{p.nome} — Resumo</div>
                <div className="g4 mb">
                  <div className="card" style={{ padding: 12 }}><div className="lbl">Receita</div><div className="val txt-green">{of.fmt(dre.receitaBruta)}</div></div>
                  <div className="card" style={{ padding: 12 }}><div className="lbl">Resultado</div><div className="val" style={{ color: dre.resultado >= 0 ? 'var(--green)' : 'var(--red)' }}>{of.fmt(dre.resultado)}</div></div>
                  <div className="card" style={{ padding: 12 }}><div className="lbl">Inadimplência</div><div className="val txt-red">{inad.percentual}%</div><div className="delta-neu">{of.fmt(inad.totalVencido)}</div></div>
                  <div className="card" style={{ padding: 12 }}><div className="lbl">Break-even</div><div className="val" style={{ color: be?.atingido ? 'var(--green)' : 'var(--red)' }}>{be?.atingido ? '✅ Atingido' : `Faltam ${be?.faltam} clientes`}</div></div>
                </div>
              </div>
            )
          })()}

          {/* Modal novo projeto */}
          {showNewProj && (
            <div className="modal-overlay show" onClick={e => e.target === e.currentTarget && setShowNewProj(false)}>
              <div className="modal" style={{ maxWidth: 480 }}>
                <div className="modal-title"><span>🎓 Novo Projeto</span><button className="modal-close" onClick={() => setShowNewProj(false)}>×</button></div>
                <form onSubmit={handleAddProj}>
                  <div className="form-group"><label className="form-label">Nome *</label><input className="inp" required value={newProj.nome} onChange={e => setNewProj(p => ({...p, nome: e.target.value}))} placeholder="Medicina UNIFENAS 2027" /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group"><label className="form-label">Turma</label><input className="inp" value={newProj.turma} onChange={e => setNewProj(p => ({...p, turma: e.target.value}))} /></div>
                    <div className="form-group"><label className="form-label">Instituição</label><input className="inp" value={newProj.instituicao} onChange={e => setNewProj(p => ({...p, instituicao: e.target.value}))} /></div>
                    <div className="form-group"><label className="form-label">Curso</label><input className="inp" value={newProj.curso} onChange={e => setNewProj(p => ({...p, curso: e.target.value}))} /></div>
                    <div className="form-group"><label className="form-label">Cidade</label><input className="inp" value={newProj.cidade} onChange={e => setNewProj(p => ({...p, cidade: e.target.value}))} /></div>
                    <div className="form-group"><label className="form-label">Clientes Esperados</label><input className="inp" type="number" value={newProj.num_clientes_esperados} onChange={e => setNewProj(p => ({...p, num_clientes_esperados: parseInt(e.target.value)||0}))} /></div>
                    <div className="form-group"><label className="form-label">Ticket Médio</label><input className="inp" type="number" value={newProj.ticket_medio_esperado} onChange={e => setNewProj(p => ({...p, ticket_medio_esperado: parseFloat(e.target.value)||0}))} /></div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--tx3)', margin: '8px 0' }}>Meta automática: {of.fmt((newProj.num_clientes_esperados||0) * (newProj.ticket_medio_esperado||0))}</div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowNewProj(false)}>Cancelar</button>
                    <button type="submit" className="btn btn-primary">Criar Projeto</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ LANÇAMENTOS ═══ */}
      {tab === 'lanc' && (
        <div>
          <div className="flex aic jsb mb">
            <div style={{ display: 'flex', gap: 8 }}>
              <select className="inp" style={{ width: 150, fontSize: 12 }} value={filterProjeto} onChange={e => setFilterProjeto(e.target.value)}>
                <option value="all">Todos projetos</option>
                <option value="fixas">Despesas fixas</option>
                {of.projetos.map(p => <option key={p.id} value={p.id}>{p.turma || p.nome}</option>)}
              </select>
              <input type="month" className="inp" style={{ width: 140, fontSize: 12 }} value={selComp} onChange={e => setSelComp(e.target.value)} />
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowNewLanc(true)}>+ Novo Lançamento</button>
          </div>
          <div className="module-card" style={{ overflowX: 'auto' }}>
            <table className="exec-table">
              <thead><tr><th>Data</th><th>Projeto</th><th>Tipo</th><th>Descrição</th><th style={{ textAlign:'right' }}>Previsto</th><th style={{ textAlign:'right' }}>Realizado</th><th>Status</th><th>Ações</th></tr></thead>
              <tbody>
                {of.lancamentos
                  .filter(l => (filterProjeto === 'all' || (filterProjeto === 'fixas' ? l.natureza === 'fixa' : l.projeto_id === filterProjeto)))
                  .filter(l => !selComp || l.competencia === selComp)
                  .map(l => {
                  const proj = of.projetos.find(p => p.id === l.projeto_id)
                  return (
                    <tr key={l.id}>
                      <td style={{ fontSize: 11, color: 'var(--tx3)' }}>{l.data_realizada || l.data_prevista || '—'}</td>
                      <td style={{ fontSize: 12 }}>{proj ? proj.turma || proj.nome.split(' ')[0] : l.natureza === 'fixa' ? '⚙️ Fixa' : '—'}</td>
                      <td><span className="badge" style={{ background: l.tipo === 'receita' ? 'rgba(16,185,129,.15)' : 'rgba(239,68,68,.15)', color: l.tipo === 'receita' ? 'var(--green)' : 'var(--red)', fontSize: 10 }}>{l.tipo}</span></td>
                      <td style={{ fontSize: 12 }}>{l.descricao}</td>
                      <td style={{ textAlign: 'right', fontSize: 12, color: 'var(--tx3)' }}>{of.fmt(l.valor_previsto)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: l.tipo === 'receita' ? 'var(--green)' : 'var(--red)' }}>{of.fmt(l.valor_realizado)}</td>
                      <td><span className="badge" style={{ fontSize: 9, background: l.status === 'pago' ? 'rgba(16,185,129,.12)' : 'rgba(245,158,11,.12)', color: l.status === 'pago' ? 'var(--green)' : 'var(--gold)' }}>{l.status}</span></td>
                      <td><button className="btn btn-sm btn-del" style={{ fontSize: 10, padding: '2px 6px' }} onClick={() => of.deleteLancamento(l.id)}>🗑</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {showNewLanc && (
            <div className="modal-overlay show" onClick={e => e.target === e.currentTarget && setShowNewLanc(false)}>
              <div className="modal" style={{ maxWidth: 500 }}>
                <div className="modal-title"><span>💳 Novo Lançamento</span><button className="modal-close" onClick={() => setShowNewLanc(false)}>×</button></div>
                <form onSubmit={handleAddLanc}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group"><label className="form-label">Tipo</label>
                      <select className="inp" value={newLanc.tipo} onChange={e => setNewLanc(p => ({...p, tipo: e.target.value}))}><option value="receita">Receita</option><option value="despesa">Despesa</option></select>
                    </div>
                    <div className="form-group"><label className="form-label">Natureza</label>
                      <select className="inp" value={newLanc.natureza} onChange={e => setNewLanc(p => ({...p, natureza: e.target.value}))}><option value="direta">Direta</option><option value="fixa">Fixa (rateável)</option></select>
                    </div>
                  </div>
                  {newLanc.natureza === 'direta' && (
                    <div className="form-group"><label className="form-label">Projeto</label>
                      <select className="inp" value={newLanc.projeto_id} onChange={e => setNewLanc(p => ({...p, projeto_id: e.target.value}))}>
                        <option value="">Selecione</option>
                        {of.projetos.map(p => <option key={p.id} value={p.id}>{p.turma || p.nome}</option>)}
                      </select>
                    </div>
                  )}
                  <div className="form-group"><label className="form-label">Descrição *</label><input className="inp" required value={newLanc.descricao} onChange={e => setNewLanc(p => ({...p, descricao: e.target.value}))} /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group"><label className="form-label">Valor Previsto</label><input className="inp" type="number" step="0.01" value={newLanc.valor_previsto} onChange={e => setNewLanc(p => ({...p, valor_previsto: parseFloat(e.target.value)||0}))} /></div>
                    <div className="form-group"><label className="form-label">Valor Realizado</label><input className="inp" type="number" step="0.01" value={newLanc.valor_realizado} onChange={e => setNewLanc(p => ({...p, valor_realizado: parseFloat(e.target.value)||0}))} /></div>
                    <div className="form-group"><label className="form-label">Competência</label><input className="inp" type="month" value={newLanc.competencia} onChange={e => setNewLanc(p => ({...p, competencia: e.target.value}))} /></div>
                    <div className="form-group"><label className="form-label">Status</label>
                      <select className="inp" value={newLanc.status} onChange={e => setNewLanc(p => ({...p, status: e.target.value}))}><option value="previsto">Previsto</option><option value="confirmado">Confirmado</option><option value="pago">Pago</option></select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowNewLanc(false)}>Cancelar</button>
                    <button type="submit" className="btn btn-primary">Salvar</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ PARCELAS ═══ */}
      {tab === 'parcelas' && (
        <div>
          <div className="g4 mb">
            <div className="card" style={{ padding: 14 }}><div className="lbl">Total a Receber</div><div className="val txt-blue">{of.fmt(inadTotal.totalAberto + inadTotal.totalVencido)}</div></div>
            <div className="card" style={{ padding: 14 }}><div className="lbl">Vencido</div><div className="val txt-red">{of.fmt(inadTotal.totalVencido)}</div><div className="delta-neu">{inadTotal.qtdVencidas} parcelas</div></div>
            <div className="card" style={{ padding: 14 }}><div className="lbl">A Vencer (30d)</div><div className="val txt-amber">{of.parcelas.filter(p => p.status === 'aberto' && p.data_vencimento >= of.hoje).length}</div></div>
            <div className="card" style={{ padding: 14 }}><div className="lbl">Recebido Mês</div><div className="val txt-green">{of.fmt(of.parcelas.filter(p => p.status === 'pago' && p.data_pagamento?.startsWith(of.mesAtual)).reduce((s,p) => s + p.valor, 0))}</div></div>
          </div>
          <div className="module-card" style={{ overflowX: 'auto' }}>
            <table className="exec-table">
              <thead><tr><th>Cliente</th><th>Projeto</th><th>Parcela</th><th style={{ textAlign:'right' }}>Valor</th><th>Vencimento</th><th>Status</th><th>Atraso</th><th>Ações</th></tr></thead>
              <tbody>
                {of.parcelas.sort((a,b) => a.data_vencimento.localeCompare(b.data_vencimento)).map(p => {
                  const proj = of.projetos.find(x => x.id === p.projeto_id)
                  const vencida = p.status === 'aberto' && p.data_vencimento < of.hoje
                  const dias = vencida ? Math.floor((new Date(of.hoje) - new Date(p.data_vencimento)) / 86400000) : 0
                  return (
                    <tr key={p.id} style={{ background: vencida ? 'rgba(239,68,68,.04)' : undefined }}>
                      <td style={{ fontWeight: 500 }}>{p.cliente_nome}</td>
                      <td style={{ fontSize: 12, color: 'var(--tx3)' }}>{proj?.turma || '—'}</td>
                      <td style={{ fontSize: 11 }}>{p.numero_parcela}/{p.total_parcelas}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{of.fmt(p.valor)}</td>
                      <td style={{ fontSize: 12 }}>{new Date(p.data_vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                      <td><span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: p.status === 'pago' ? 'rgba(16,185,129,.12)' : vencida ? 'rgba(239,68,68,.12)' : 'rgba(245,158,11,.12)', color: p.status === 'pago' ? 'var(--green)' : vencida ? 'var(--red)' : 'var(--gold)', fontWeight: 700 }}>{p.status === 'pago' ? '🟢 Pago' : vencida ? '🔴 Vencido' : '🟡 A vencer'}</span></td>
                      <td style={{ color: 'var(--red)', fontWeight: vencida ? 700 : 400 }}>{vencida ? `${dias}d` : '—'}</td>
                      <td>
                        {p.status === 'aberto' && <button className="btn btn-sm btn-done" style={{ fontSize: 10, padding: '2px 8px' }} onClick={() => of.marcarParcPago(p.id)}>✅ Pago</button>}
                        {vencida && <a href={`https://wa.me/?text=Olá ${p.cliente_nome}, sua parcela de ${of.fmt(p.valor)} venceu em ${new Date(p.data_vencimento+'T00:00:00').toLocaleDateString('pt-BR')}. Por favor, regularize.`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-secondary" style={{ fontSize: 10, padding: '2px 8px', marginLeft: 4 }}>📱 WhatsApp</a>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ RATEIO ═══ */}
      {tab === 'rateio' && (
        <div>
          <div className="module-card mb">
            <div className="module-card-title">⚖️ Despesas Fixas para Ratear — {selComp}</div>
            <input type="month" className="inp mb" style={{ width: 160 }} value={selComp} onChange={e => setSelComp(e.target.value)} />
            {of.lancamentos.filter(l => l.natureza === 'fixa' && l.competencia === selComp).map(l => {
              const jaRateado = of.rateios.some(r => r.lancamento_id === l.id)
              return (
                <div key={l.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', marginBottom: 8 }}>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{l.descricao}</div><div style={{ fontSize: 11, color: 'var(--tx3)' }}>{l.conta_codigo}</div></div>
                  <div style={{ fontWeight: 700 }}>{of.fmt(l.valor_realizado || l.valor_previsto)}</div>
                  {jaRateado ? (
                    <button className="btn btn-danger btn-sm" onClick={() => of.estornarRateio(l.id)}>↩ Estornar</button>
                  ) : (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <select className="inp" style={{ fontSize: 11, width: 140 }} value={rateioTipo} onChange={e => setRateioTipo(e.target.value)}>
                        <option value="igualitario">Igualitário</option>
                        <option value="proporcional_receita">Por Receita</option>
                        <option value="proporcional_clientes">Por Clientes</option>
                      </select>
                      <button className="btn btn-primary btn-sm" onClick={() => of.aplicarRateio(l.id, rateioTipo)}>Ratear</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          {/* Rateios aplicados */}
          {of.rateios.filter(r => r.competencia === selComp).length > 0 && (
            <div className="module-card">
              <div className="module-card-title">Rateios Aplicados</div>
              <table className="exec-table">
                <thead><tr><th>Projeto</th><th style={{ textAlign:'right' }}>%</th><th style={{ textAlign:'right' }}>Valor</th><th>Competência</th></tr></thead>
                <tbody>
                  {of.rateios.filter(r => r.competencia === selComp).map(r => {
                    const proj = of.projetos.find(p => p.id === r.projeto_id)
                    return <tr key={r.id}><td>{proj?.turma || '—'}</td><td style={{ textAlign:'right' }}>{r.percentual}%</td><td style={{ textAlign:'right', fontWeight: 700 }}>{of.fmt(r.valor_rateado)}</td><td style={{ fontSize: 11, color: 'var(--tx3)' }}>{r.competencia}</td></tr>
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══ ORÇADO VS REALIZADO ═══ */}
      {tab === 'orcado' && (
        <div>
          <div className="flex aic gap8 mb">
            <select className="inp" style={{ width: 200, fontSize: 12 }} value={selProjeto || ''} onChange={e => setSelProjeto(e.target.value || null)}>
              <option value="">Selecione um projeto</option>
              {of.projetos.map(p => <option key={p.id} value={p.id}>{p.turma || p.nome}</option>)}
            </select>
          </div>
          {selProjeto ? (
            <div className="module-card">
              <div className="module-card-title">📐 Orçado vs Realizado — {of.projetos.find(p => p.id === selProjeto)?.turma}</div>
              <table className="exec-table">
                <thead><tr><th>Conta</th><th style={{ textAlign:'right' }}>Orçado</th><th style={{ textAlign:'right' }}>Realizado</th><th style={{ textAlign:'right' }}>Variação</th><th>%</th><th>Status</th></tr></thead>
                <tbody>
                  {of.calcularOrcadoRealizado(selProjeto).map((c, i) => (
                    <tr key={i}>
                      <td>{c.descricao}</td>
                      <td style={{ textAlign:'right', color: 'var(--tx3)' }}>{of.fmt(c.orcado)}</td>
                      <td style={{ textAlign:'right', fontWeight: 700 }}>{of.fmt(c.realizado)}</td>
                      <td style={{ textAlign:'right', color: c.variacao > 0 ? 'var(--red)' : 'var(--green)' }}>{of.fmt(c.variacao)}</td>
                      <td style={{ color: c.variacao > 0 ? 'var(--red)' : 'var(--green)' }}>{c.variacaoPct}%</td>
                      <td><span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: c.status === 'ok' ? 'rgba(16,185,129,.12)' : c.status === 'atencao' ? 'rgba(245,158,11,.12)' : 'rgba(239,68,68,.12)', color: c.status === 'ok' ? 'var(--green)' : c.status === 'atencao' ? 'var(--gold)' : 'var(--red)', fontWeight: 700 }}>{c.status === 'ok' ? '✅ OK' : c.status === 'atencao' ? '⚠️ Atenção' : '🔴 Estouro'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div className="module-card"><div className="empty-state"><p>Selecione um projeto para comparar</p></div></div>}
        </div>
      )}

      {/* ═══ DRE ═══ */}
      {tab === 'dre' && (
        <div>
          <div className="flex aic gap8 mb">
            <select className="inp" style={{ width: 200, fontSize: 12 }} value={selProjeto || 'consolidado'} onChange={e => setSelProjeto(e.target.value === 'consolidado' ? null : e.target.value)}>
              <option value="consolidado">📊 Consolidado</option>
              {of.projetos.map(p => <option key={p.id} value={p.id}>{p.turma || p.nome}</option>)}
            </select>
            <input type="month" className="inp" style={{ width: 140, fontSize: 12 }} value={selComp} onChange={e => setSelComp(e.target.value)} />
          </div>
          {(() => {
            const dre = selProjeto ? of.calcularDREProjeto(selProjeto, selComp) : consolidada
            const rows = [
              { label: '(+) RECEITA BRUTA', value: dre.receitaBruta || dre.receitaTotal, bold: true, color: 'var(--green)' },
              { label: '(-) Impostos / Deduções', value: dre.impostos || 0, indent: true },
              { label: '(=) RECEITA LÍQUIDA', value: dre.receitaLiquida || (dre.receitaTotal || 0), bold: true },
              { label: '(-) Custos Diretos', value: dre.despesasDiretas || dre.despesaTotal || 0, indent: true },
              { label: '(=) LUCRO BRUTO', value: (dre.receitaLiquida || dre.receitaTotal || 0) - (dre.despesasDiretas || 0), bold: true, color: 'var(--blue)' },
              { label: '(-) Despesas Rateadas', value: dre.rateioTotal || 0, indent: true },
              { label: '(=) RESULTADO OPERACIONAL', value: dre.resultado || dre.resultadoTotal || 0, bold: true, big: true, color: (dre.resultado || dre.resultadoTotal || 0) >= 0 ? 'var(--green)' : 'var(--red)' },
            ]
            return (
              <div className="module-card">
                <div className="module-card-title">DRE — {selProjeto ? of.projetos.find(p=>p.id===selProjeto)?.turma : 'Consolidado'} — {selComp}</div>
                <table className="exec-table">
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} style={{ borderTop: r.bold ? '1px solid rgba(255,255,255,.08)' : undefined }}>
                        <td style={{ paddingLeft: r.indent ? 24 : 12, fontWeight: r.bold ? 700 : 400, fontSize: r.big ? 15 : 13 }}>{r.label}</td>
                        <td style={{ textAlign: 'right', fontWeight: r.bold ? 700 : 400, color: r.color, fontSize: r.big ? 16 : 13 }}>{of.fmt(r.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ marginTop: 12, display: 'flex', gap: 20, fontSize: 13 }}>
                  <div><span className="lbl">Margem</span> <strong style={{ color: parseFloat(dre.margem || dre.margemMedia || 0) >= 15 ? 'var(--green)' : 'var(--red)' }}>{dre.margem || dre.margemMedia || '0.0'}%</strong></div>
                  {selProjeto && dre.ticketReal > 0 && <div><span className="lbl">Ticket Real</span> <strong>{of.fmt(dre.ticketReal)}</strong></div>}
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* ═══ FLUXO DE CAIXA ═══ */}
      {tab === 'fluxo' && (
        <div>
          <div className="module-card mb">
            <div className="module-card-title">💰 Fluxo de Caixa Projetado</div>
            <div style={{ overflowX: 'auto' }}>
              <table className="exec-table">
                <thead><tr><th>Período</th><th style={{ textAlign:'right' }}>Entradas Prev.</th><th style={{ textAlign:'right' }}>Entradas Real.</th><th style={{ textAlign:'right' }}>Saídas Prev.</th><th style={{ textAlign:'right' }}>Saídas Real.</th><th style={{ textAlign:'right' }}>Saldo</th><th style={{ textAlign:'right' }}>Acumulado</th></tr></thead>
                <tbody>
                  {fluxo.map((f, i) => (
                    <tr key={i} style={{ background: f.acumulado < 0 ? 'rgba(239,68,68,.05)' : undefined }}>
                      <td style={{ fontWeight: 600 }}>{f.label}</td>
                      <td style={{ textAlign:'right', color: 'var(--tx3)', fontSize: 12 }}>{of.fmt(f.entradasPrev)}</td>
                      <td style={{ textAlign:'right', color: 'var(--green)' }}>{of.fmt(f.entradasReal)}</td>
                      <td style={{ textAlign:'right', color: 'var(--tx3)', fontSize: 12 }}>{of.fmt(f.saidasPrev)}</td>
                      <td style={{ textAlign:'right', color: 'var(--red)' }}>{of.fmt(f.saidasReal)}</td>
                      <td style={{ textAlign:'right', fontWeight: 700, color: f.saldo >= 0 ? 'var(--green)' : 'var(--red)' }}>{of.fmt(f.saldo)}</td>
                      <td style={{ textAlign:'right', fontWeight: 700, color: f.acumulado >= 0 ? 'var(--green)' : 'var(--red)' }}>
                        {f.acumulado < 0 && '⚠️ '}{of.fmt(f.acumulado)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Gráfico visual */}
          <div className="module-card">
            <div className="module-card-title">Saldo Acumulado</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140 }}>
              {fluxo.map((f, i) => {
                const maxAbs = Math.max(...fluxo.map(x => Math.abs(x.acumulado)), 1)
                const h = Math.round((Math.abs(f.acumulado) / maxAbs) * 120)
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ fontSize: 9, color: 'var(--tx3)' }}>{of.fmt(f.acumulado).replace('R$ ','')}</div>
                    <div style={{ width: '80%', height: h, background: f.acumulado >= 0 ? 'var(--green)' : 'var(--red)', borderRadius: '3px 3px 0 0', opacity: .7 }} />
                    <div style={{ fontSize: 9, color: 'var(--tx3)' }}>{f.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
