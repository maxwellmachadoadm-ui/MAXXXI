import { useState, useRef, useCallback } from 'react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'

function autoClassifyByKeyword(text) {
  const t = text.toLowerCase()
  if (t.includes('salário') || t.includes('folha') || t.includes('holerite')) return { categoria: 'PESSOAL', subcategoria: 'Salários', confidence: 85 }
  if (t.includes('pró-labore') || t.includes('pro labore')) return { categoria: 'PESSOAL', subcategoria: 'Pró-labore', confidence: 85 }
  if (t.includes('aluguel') || t.includes('locação')) return { categoria: 'ESCRITÓRIO', subcategoria: 'Aluguel', confidence: 85 }
  if (t.includes('internet') || t.includes('telefone') || t.includes('tim ') || t.includes('vivo') || t.includes('claro')) return { categoria: 'ESCRITÓRIO', subcategoria: 'Internet / Telefone', confidence: 85 }
  if (t.includes('material') && t.includes('limpeza')) return { categoria: 'ESCRITÓRIO', subcategoria: 'Material de Limpeza', confidence: 85 }
  if (t.includes('material') && t.includes('consumo')) return { categoria: 'ESCRITÓRIO', subcategoria: 'Material de Consumo', confidence: 82 }
  if (t.includes('instagram') || t.includes('facebook') || t.includes('tráfego') || t.includes('ads')) return { categoria: 'MARKETING', subcategoria: 'Redes Sociais', confidence: 85 }
  if (t.includes('publicidade') || t.includes('marketing')) return { categoria: 'MARKETING', subcategoria: 'Publicidade', confidence: 82 }
  if (t.includes('imposto') || t.includes('simples') || t.includes('das')) return { categoria: 'IMPOSTOS', subcategoria: 'Simples Nacional', confidence: 88 }
  if (t.includes('iss')) return { categoria: 'IMPOSTOS', subcategoria: 'ISS', confidence: 88 }
  if (t.includes('tarifa') || t.includes('ted') || t.includes('doc')) return { categoria: 'FINANCEIRO', subcategoria: 'Tarifas Bancárias', confidence: 85 }
  if (t.includes('honorário') || t.includes('mensalidade') || t.includes('contabilidade')) return { categoria: 'RECEITAS', subcategoria: 'Honorários / Mensalidades', confidence: 88 }
  if (t.includes('extrato') || t.includes('receita') || t.includes('pagamento recebido')) return { categoria: 'RECEITAS', subcategoria: 'Outros', confidence: 70 }
  return null
}

function getFileIcon(nome) {
  const ext = (nome || '').split('.').pop().toLowerCase()
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return '🖼'
  if (ext === 'pdf') return '📄'
  if (['xlsx', 'xls', 'csv'].includes(ext)) return '📊'
  if (['docx', 'doc'].includes(ext)) return '📝'
  if (ext === 'txt') return '📃'
  return '📎'
}

function formatBytes(b) {
  if (!b) return '—'
  if (b < 1024) return b + ' B'
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'
  return (b / 1048576).toFixed(1) + ' MB'
}

export default function Arquivo() {
  const {
    empresas, CLASSIFICATION_BANK, REVENUE_ORIGINS, BANKS,
    lancamentos, pendingClassifications, arquivos,
    addLancamento, approveLancamento, deleteLancamento, deleteArquivo, addArquivo,
    learnClassification, suggestClassification,
  } = useData()
  const { profile, canDelete } = useAuth()

  const [tab, setTab] = useState('fila')
  const [filtroEmp, setFiltroEmp] = useState('all')
  const [filtroMes, setFiltroMes] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('all')
  const [dragover, setDragover] = useState(false)
  const [uploadForm, setUploadForm] = useState({ empresa_id: 'dw', mes_competencia: '', descricao: '' })
  const [modalCorrecao, setModalCorrecao] = useState(null)
  const [modalCorrectData, setModalCorrectData] = useState({ categoria: '', subcategoria: '', banco: '', origem: '' })
  const [modalNovoLanc, setModalNovoLanc] = useState(false)
  const [novoLancForm, setNovoLancForm] = useState({
    empresa_id: 'dw', tipo: 'despesa', categoria: 'PESSOAL', subcategoria: 'Salários',
    banco: 'Nubank', origem: 'PIX', valor: '', mes: new Date().toISOString().slice(0, 7),
    descricao: '', status: 'aprovado'
  })
  const fileInputRef = useRef()

  // ── FILA DE APROVAÇÃO ──
  const filaItems = lancamentos.filter(l => l.status === 'pendente').filter(l => {
    const empOk = filtroEmp === 'all' || l.empresa_id === filtroEmp
    const mesOk = !filtroMes || l.mes === filtroMes
    return empOk && mesOk
  })

  function handleConfirmItem(item) {
    learnClassification(item.descricao, item.categoria, item.subcategoria)
    approveLancamento(item.id)
  }

  function handleOpenCorrection(item) {
    setModalCorrecao(item)
    setModalCorrectData({ categoria: item.categoria || '', subcategoria: item.subcategoria || '', banco: item.banco || '', origem: item.origem || '' })
  }

  function handleSaveCorrection() {
    if (!modalCorrecao) return
    learnClassification(modalCorrecao.descricao, modalCorrectData.categoria, modalCorrectData.subcategoria)
    // Atualizar o lançamento com a classificação corrigida e aprovar
    const updated = { ...modalCorrecao, ...modalCorrectData, status: 'aprovado' }
    approveLancamento(modalCorrecao.id)
    // Também atualiza os campos — como addLancamento não tem update, aprovamos e confiamos no state
    setModalCorrecao(null)
  }

  // ── UPLOAD ──
  const processFiles = useCallback((files) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        const descricao = file.name.replace(/\.[^/.]+$/, '')
        const suggestion = suggestClassification(descricao) || autoClassifyByKeyword(file.name) || autoClassifyByKeyword(descricao)
        const confidence = suggestion?.confidence || 50
        const status = confidence >= 80 ? 'aprovado' : 'pendente'

        // Arquivo
        const arq = {
          empresa_id: uploadForm.empresa_id,
          nome: file.name,
          tipo: file.type,
          tamanho: file.size,
          mes_competencia: uploadForm.mes_competencia,
          categoria: suggestion?.categoria || '',
          subcategoria: suggestion?.subcategoria || '',
          url: reader.result,
          criado_por: profile?.id,
          criado_por_nome: profile?.name,
          status,
          descricao: uploadForm.descricao || descricao,
        }
        addArquivo(arq)

        // Lançamento pendente
        const lancamento = {
          empresa_id: uploadForm.empresa_id,
          tipo: 'despesa',
          categoria: suggestion?.categoria || '',
          subcategoria: suggestion?.subcategoria || '',
          banco: '',
          origem: null,
          valor: 0,
          mes: uploadForm.mes_competencia || new Date().toISOString().slice(0, 7),
          descricao: uploadForm.descricao || descricao,
          data: new Date().toISOString().slice(0, 10),
          status,
          anexo_nome: file.name,
          criado_por: profile?.id,
        }
        addLancamento(lancamento)
      }
      reader.readAsDataURL(file)
    })
  }, [uploadForm, profile, suggestClassification, addArquivo, addLancamento])

  function handleDrop(e) {
    e.preventDefault()
    setDragover(false)
    processFiles(e.dataTransfer.files)
  }

  function handleFileInput(e) {
    processFiles(e.target.files)
    e.target.value = ''
  }

  // ── NOVO LANÇAMENTO MANUAL ──
  function handleSaveNovoLanc() {
    if (!novoLancForm.descricao || !novoLancForm.valor) return
    addLancamento({
      ...novoLancForm,
      valor: parseFloat(novoLancForm.valor),
      data: new Date().toISOString().slice(0, 10),
      criado_por: profile?.id,
    })
    setModalNovoLanc(false)
    setNovoLancForm({
      empresa_id: 'dw', tipo: 'despesa', categoria: 'PESSOAL', subcategoria: 'Salários',
      banco: 'Nubank', origem: 'PIX', valor: '', mes: new Date().toISOString().slice(0, 7),
      descricao: '', status: 'aprovado'
    })
  }

  // ── LANÇAMENTOS FILTRADOS ──
  const lancFiltrados = lancamentos.filter(l => {
    const empOk = filtroEmp === 'all' || l.empresa_id === filtroEmp
    const mesOk = !filtroMes || l.mes === filtroMes
    const statusOk = filtroStatus === 'all' || l.status === filtroStatus
    return empOk && mesOk && statusOk
  })

  const totalReceitas = lancFiltrados.filter(l => l.tipo === 'receita' && l.status === 'aprovado').reduce((s, l) => s + l.valor, 0)
  const totalDespesas = lancFiltrados.filter(l => l.tipo === 'despesa' && l.status === 'aprovado').reduce((s, l) => s + l.valor, 0)

  function fmtVal(v) {
    if (!v && v !== 0) return '—'
    const abs = Math.abs(v)
    const prefix = v < 0 ? '-R$ ' : 'R$ '
    if (abs >= 1000000) return prefix + (abs / 1000000).toFixed(1) + 'M'
    if (abs >= 1000) return prefix + (abs / 1000).toFixed(1) + 'k'
    return prefix + abs.toLocaleString('pt-BR')
  }

  const TABS = [
    { id: 'fila',    label: `⏳ Fila de Aprovação (${filaItems.length})` },
    { id: 'upload',  label: '📁 Arquivos' },
    { id: 'lanc',    label: '📋 Lançamentos' },
  ]

  return (
    <div>
      {/* HEADER */}
      <div className="page-header">
        <div>
          <div className="page-title">Arquivo Digital</div>
          <div className="page-subtitle">Classificação e gestão de documentos</div>
        </div>
        <button className="btn btn-blue" onClick={() => setModalNovoLanc(true)}>+ Novo Lançamento</button>
      </div>

      {/* FILTROS */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
        <select className="inp" style={{ width:'auto', padding:'7px 12px', fontSize:13 }} value={filtroEmp} onChange={e => setFiltroEmp(e.target.value)}>
          <option value="all">Todas as empresas</option>
          {empresas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
        </select>
        <input type="month" className="inp" style={{ width:'auto', padding:'7px 12px', fontSize:13 }} value={filtroMes} onChange={e => setFiltroMes(e.target.value)} placeholder="Mês competência" />
        <select className="inp" style={{ width:'auto', padding:'7px 12px', fontSize:13 }} value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
          <option value="all">Todos os status</option>
          <option value="aprovado">Aprovado</option>
          <option value="pendente">Pendente</option>
          <option value="rascunho">Rascunho</option>
        </select>
      </div>

      {/* TABS */}
      <div className="tabs mb">
        {TABS.map(t => (
          <button key={t.id} className={`tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* ─── ABA FILA DE APROVAÇÃO ─── */}
      {tab === 'fila' && (
        <div>
          {filaItems.length === 0 ? (
            <div className="empty-state-v4">
              <span className="empty-icon">✅</span>
              <div className="empty-text">Nenhum item na fila</div>
              <div className="empty-sub">Todos os documentos foram classificados</div>
            </div>
          ) : (
            filaItems.map(item => {
              const emp = empresas.find(e => e.id === item.empresa_id)
              return (
                <div key={item.id} className="approval-card">
                  <div className="approval-header">
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:600, color:'var(--tx)', marginBottom:4 }}>{item.descricao || item.anexo_nome || 'Sem descrição'}</div>
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                        {emp && <span className="pill pill-blue" style={{ fontSize:10 }}>{emp.sigla}</span>}
                        <span className="pill pill-amber" style={{ fontSize:10 }}>Pendente</span>
                        {item.mes && <span style={{ fontSize:11, color:'var(--tx3)' }}>📅 {item.mes}</span>}
                        {item.valor > 0 && <span style={{ fontSize:12, fontWeight:700, color: item.tipo === 'receita' ? 'var(--green)' : 'var(--red)' }}>{fmtVal(item.valor)}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign:'right', fontSize:12, color:'var(--tx3)' }}>
                      {item.criado_em ? new Date(item.criado_em).toLocaleDateString('pt-BR') : ''}
                    </div>
                  </div>

                  {(item.categoria || item.subcategoria) && (
                    <div className="notification-bar-v4" style={{ marginBottom:0, marginTop:4, padding:'6px 12px' }}>
                      🤖 Sugestão MAXXXI: <strong>{item.categoria}</strong> → {item.subcategoria}
                    </div>
                  )}

                  <div className="approval-actions">
                    <button className="btn btn-green" onClick={() => handleConfirmItem(item)}>✅ Confirmar</button>
                    <button className="btn btn-blue" onClick={() => handleOpenCorrection(item)}>✏ Corrigir</button>
                    <button className="btn btn-red" onClick={() => canDelete && deleteLancamento(item.id)} title="Somente administrador pode rejeitar">🗑 Rejeitar</button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ─── ABA UPLOAD ─── */}
      {tab === 'upload' && (
        <div>
          {/* Formulário metadados */}
          <div className="module-card mb">
            <div className="module-card-title">📋 Metadados do Upload</div>
            <div className="form-row-v4 cols-3">
              <div>
                <label className="form-label-v4">Empresa</label>
                <select className="inp" value={uploadForm.empresa_id} onChange={e => setUploadForm(f => ({ ...f, empresa_id: e.target.value }))}>
                  {empresas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label-v4">Mês de Competência</label>
                <input type="month" className="inp" value={uploadForm.mes_competencia} onChange={e => setUploadForm(f => ({ ...f, mes_competencia: e.target.value }))} />
              </div>
              <div>
                <label className="form-label-v4">Descrição (opcional)</label>
                <input className="inp" placeholder="Ex.: Extrato bancário" value={uploadForm.descricao} onChange={e => setUploadForm(f => ({ ...f, descricao: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Zona de upload */}
          <div
            className={`upload-zone mb${dragover ? ' dragover' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragover(true) }}
            onDragLeave={() => setDragover(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div style={{ fontSize:36, marginBottom:10 }}>📁</div>
            <div style={{ fontSize:15, fontWeight:600, color:'var(--tx)', marginBottom:4 }}>Arraste arquivos aqui ou clique para selecionar</div>
            <div style={{ fontSize:12, color:'var(--tx3)' }}>PDF, TXT, DOCX, XLSX, JPG, PNG, extratos</div>
            <div style={{ fontSize:11, color:'var(--blue3)', marginTop:8 }}>O MAXXXI classificará automaticamente</div>
            <input ref={fileInputRef} type="file" multiple accept=".pdf,.txt,.docx,.xlsx,.jpg,.jpeg,.png,.csv" style={{ display:'none' }} onChange={handleFileInput} />
          </div>

          {/* Lista de arquivos */}
          <div className="module-card">
            <div className="module-card-title">📎 Arquivos ({arquivos.filter(a => filtroEmp === 'all' || a.empresa_id === filtroEmp).length})</div>
            {arquivos.filter(a => filtroEmp === 'all' || a.empresa_id === filtroEmp).length === 0 ? (
              <div className="empty-state-v4"><span className="empty-icon">📂</span><div className="empty-text">Nenhum arquivo</div><div className="empty-sub">Faça upload de documentos acima</div></div>
            ) : (
              arquivos.filter(a => filtroEmp === 'all' || a.empresa_id === filtroEmp).map(arq => {
                const emp = empresas.find(e => e.id === arq.empresa_id)
                return (
                  <div key={arq.id} className="file-item-v4">
                    <div className="file-icon-v4">{getFileIcon(arq.nome)}</div>
                    <div className="file-meta-v4">
                      <div className="file-name-v4">{arq.nome}</div>
                      <div className="file-size-v4">{formatBytes(arq.tamanho)} · {emp?.sigla} · {arq.mes_competencia || 'sem data'} · {arq.categoria || 'não classificado'}</div>
                    </div>
                    <span className={`status-badge ${arq.status === 'aprovado' ? 'success' : arq.status === 'pendente' ? 'warning' : 'neutral'}`}>{arq.status}</span>
                    {arq.url && <a href={arq.url} download={arq.nome} className="btn btn-icon" title="Download" style={{ fontSize:14 }}>⬇</a>}
                    {canDelete && <button className="btn btn-icon btn-red" style={{ fontSize:14 }} onClick={() => deleteArquivo(arq.id)} title="Excluir">🗑</button>}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* ─── ABA LANÇAMENTOS ─── */}
      {tab === 'lanc' && (
        <div>
          {/* Totais */}
          <div className="g3 mb">
            <div className="metric-card" style={{ '--accent-c': 'var(--green)' }}>
              <span className="metric-label">Total Receitas</span>
              <div className="metric-value txt-green">{fmtVal(totalReceitas)}</div>
            </div>
            <div className="metric-card" style={{ '--accent-c': 'var(--red)' }}>
              <span className="metric-label">Total Despesas</span>
              <div className="metric-value txt-red">{fmtVal(totalDespesas)}</div>
            </div>
            <div className="metric-card" style={{ '--accent-c': totalReceitas - totalDespesas >= 0 ? 'var(--green)' : 'var(--red)' }}>
              <span className="metric-label">Resultado</span>
              <div className={`metric-value ${totalReceitas - totalDespesas >= 0 ? 'txt-green' : 'txt-red'}`}>{fmtVal(totalReceitas - totalDespesas)}</div>
            </div>
          </div>

          <div className="module-card">
            <div className="module-card-title">📋 Lançamentos ({lancFiltrados.length})</div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Empresa</th>
                  <th>Categoria</th>
                  <th>Banco</th>
                  <th>Valor</th>
                  <th>Status</th>
                  {canDelete && <th></th>}
                </tr>
              </thead>
              <tbody>
                {lancFiltrados.sort((a, b) => (b.data || b.mes || '').localeCompare(a.data || a.mes || '')).map(l => {
                  const emp = empresas.find(e => e.id === l.empresa_id)
                  return (
                    <tr key={l.id}>
                      <td style={{ color:'var(--tx3)', fontSize:11, whiteSpace:'nowrap' }}>{l.data ? new Date(l.data).toLocaleDateString('pt-BR') : l.mes}</td>
                      <td style={{ fontWeight:500, color:'var(--tx)' }}>{l.descricao}</td>
                      <td>{emp ? <span className="pill pill-blue" style={{ fontSize:10 }}>{emp.sigla}</span> : <span style={{ color:'var(--tx3)' }}>—</span>}</td>
                      <td style={{ fontSize:12, color:'var(--tx2)' }}>{l.categoria}{l.subcategoria ? ` / ${l.subcategoria}` : ''}</td>
                      <td style={{ fontSize:12, color:'var(--tx3)' }}>{l.banco || '—'}</td>
                      <td style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color: l.tipo === 'receita' ? 'var(--green)' : 'var(--red)' }}>
                        {l.tipo === 'receita' ? '+' : '-'}{fmtVal(l.valor)}
                      </td>
                      <td><span className={`status-badge ${l.status === 'aprovado' ? 'success' : l.status === 'pendente' ? 'warning' : 'neutral'}`}>{l.status}</span></td>
                      {canDelete && (
                        <td>
                          <button className="btn btn-icon" style={{ color:'var(--red)', fontSize:14 }} onClick={() => deleteLancamento(l.id)} title="Excluir">🗑</button>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL CORREÇÃO */}
      {modalCorrecao && (
        <div className="modal-overlay show" onClick={e => e.target === e.currentTarget && setModalCorrecao(null)}>
          <div className="modal" style={{ width:480 }}>
            <div className="modal-title">
              <span>✏ Corrigir Classificação</span>
              <button className="modal-close" onClick={() => setModalCorrecao(null)}>×</button>
            </div>
            <div style={{ fontSize:13, color:'var(--tx3)', marginBottom:16 }}>{modalCorrecao.descricao}</div>

            <div className="form-group">
              <label className="form-label">Categoria</label>
              <select className="inp" value={modalCorrectData.categoria} onChange={e => setModalCorrectData(d => ({ ...d, categoria: e.target.value, subcategoria: '' }))}>
                <option value="">Selecionar...</option>
                {Object.keys(CLASSIFICATION_BANK).map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>

            {modalCorrectData.categoria && (
              <div className="form-group">
                <label className="form-label">Subcategoria</label>
                <select className="inp" value={modalCorrectData.subcategoria} onChange={e => setModalCorrectData(d => ({ ...d, subcategoria: e.target.value }))}>
                  <option value="">Selecionar...</option>
                  {(CLASSIFICATION_BANK[modalCorrectData.categoria] || []).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}

            {modalCorrecao.tipo === 'receita' && (
              <>
                <div className="form-group">
                  <label className="form-label">Origem do Pagamento</label>
                  <select className="inp" value={modalCorrectData.origem} onChange={e => setModalCorrectData(d => ({ ...d, origem: e.target.value }))}>
                    <option value="">Selecionar...</option>
                    {['PIX', 'Boleto', 'Cartão', 'Transferência', 'Dinheiro'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Banco Recebedor</label>
                  <select className="inp" value={modalCorrectData.banco} onChange={e => setModalCorrectData(d => ({ ...d, banco: e.target.value }))}>
                    <option value="">Selecionar...</option>
                    {['Nubank', 'C6 Bank', 'Caixa Econômica', 'Itaú', 'Bradesco', 'Santander', 'BTG Pactual', 'Inter', 'Outro'].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </>
            )}

            <div style={{ display:'flex', gap:8, marginTop:16 }}>
              <button className="btn-primary" style={{ flex:1 }} onClick={handleSaveCorrection}>Salvar e Aprovar</button>
              <button className="btn" onClick={() => setModalCorrecao(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOVO LANÇAMENTO */}
      {modalNovoLanc && (
        <div className="modal-overlay show" onClick={e => e.target === e.currentTarget && setModalNovoLanc(false)}>
          <div className="modal" style={{ width:520 }}>
            <div className="modal-title">
              <span>💳 Novo Lançamento</span>
              <button className="modal-close" onClick={() => setModalNovoLanc(false)}>×</button>
            </div>

            <div className="form-row-v4 cols-2" style={{ marginBottom:12 }}>
              <div>
                <label className="form-label">Empresa</label>
                <select className="inp" value={novoLancForm.empresa_id} onChange={e => setNovoLancForm(f => ({ ...f, empresa_id: e.target.value }))}>
                  {empresas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Tipo</label>
                <select className="inp" value={novoLancForm.tipo} onChange={e => setNovoLancForm(f => ({ ...f, tipo: e.target.value }))}>
                  <option value="despesa">Despesa</option>
                  <option value="receita">Receita</option>
                </select>
              </div>
            </div>

            <div className="form-row-v4 cols-2" style={{ marginBottom:12 }}>
              <div>
                <label className="form-label">Categoria</label>
                <select className="inp" value={novoLancForm.categoria} onChange={e => setNovoLancForm(f => ({ ...f, categoria: e.target.value, subcategoria: '' }))}>
                  {Object.keys(CLASSIFICATION_BANK).map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Subcategoria</label>
                <select className="inp" value={novoLancForm.subcategoria} onChange={e => setNovoLancForm(f => ({ ...f, subcategoria: e.target.value }))}>
                  <option value="">Selecionar...</option>
                  {(CLASSIFICATION_BANK[novoLancForm.categoria] || []).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row-v4 cols-2" style={{ marginBottom:12 }}>
              <div>
                <label className="form-label">Banco</label>
                <select className="inp" value={novoLancForm.banco} onChange={e => setNovoLancForm(f => ({ ...f, banco: e.target.value }))}>
                  {['Nubank', 'C6 Bank', 'Caixa Econômica', 'Itaú', 'Bradesco', 'Santander', 'BTG Pactual', 'Inter', 'Outro'].map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              {novoLancForm.tipo === 'receita' && (
                <div>
                  <label className="form-label">Origem</label>
                  <select className="inp" value={novoLancForm.origem} onChange={e => setNovoLancForm(f => ({ ...f, origem: e.target.value }))}>
                    {['PIX', 'Boleto', 'Cartão', 'Transferência', 'Dinheiro'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Descrição</label>
              <input className="inp" placeholder="Ex.: Salário equipe, Aluguel, etc." value={novoLancForm.descricao} onChange={e => setNovoLancForm(f => ({ ...f, descricao: e.target.value }))} />
            </div>

            <div className="form-row-v4 cols-2">
              <div>
                <label className="form-label">Valor (R$)</label>
                <input className="inp" type="number" min="0" step="0.01" placeholder="Ex.: 2500" value={novoLancForm.valor} onChange={e => setNovoLancForm(f => ({ ...f, valor: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Mês Competência</label>
                <input type="month" className="inp" value={novoLancForm.mes} onChange={e => setNovoLancForm(f => ({ ...f, mes: e.target.value }))} />
              </div>
            </div>

            <button className="btn-primary" style={{ marginTop:16 }} onClick={handleSaveNovoLanc}>Registrar Lançamento</button>
          </div>
        </div>
      )}
    </div>
  )
}
