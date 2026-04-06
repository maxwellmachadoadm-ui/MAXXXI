import { useState } from 'react'
import { useData, CLASSIFICATION_BANK } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'

export default function Classificacoes() {
  const { maxxxi_learned, learnClassification } = useData()
  const { isAdmin, canDelete } = useAuth()

  // Banco de classificações editável (começa do CLASSIFICATION_BANK importado)
  const [bank, setBank] = useState(() => {
    try {
      const saved = localStorage.getItem('orion_class_bank')
      return saved ? JSON.parse(saved) : CLASSIFICATION_BANK
    } catch { return CLASSIFICATION_BANK }
  })

  const [modalGrupo, setModalGrupo] = useState(false)
  const [novoGrupo, setNovoGrupo] = useState('')
  const [modalSubcat, setModalSubcat] = useState(null) // grupo para adicionar subcat
  const [novaSubcat, setNovaSubcat] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null) // { type: 'grupo'|'subcat', grupo, subcat }
  const [editGrupo, setEditGrupo] = useState(null) // { oldName, newName }

  function saveBank(next) {
    setBank(next)
    localStorage.setItem('orion_class_bank', JSON.stringify(next))
  }

  function handleAddGrupo() {
    if (!novoGrupo.trim()) return
    const key = novoGrupo.toUpperCase().trim()
    if (bank[key]) { alert('Grupo já existe'); return }
    saveBank({ ...bank, [key]: [] })
    setNovoGrupo('')
    setModalGrupo(false)
  }

  function handleAddSubcat() {
    if (!modalSubcat || !novaSubcat.trim()) return
    const next = { ...bank, [modalSubcat]: [...(bank[modalSubcat] || []), novaSubcat.trim()] }
    saveBank(next)
    setNovaSubcat('')
    setModalSubcat(null)
  }

  function handleDeleteGrupo(grupo) {
    const next = { ...bank }
    delete next[grupo]
    saveBank(next)
    setConfirmDelete(null)
  }

  function handleDeleteSubcat(grupo, subcat) {
    const next = { ...bank, [grupo]: bank[grupo].filter(s => s !== subcat) }
    saveBank(next)
    setConfirmDelete(null)
  }

  function handleRenameGrupo() {
    if (!editGrupo || !editGrupo.newName.trim()) return
    const { oldName, newName } = editGrupo
    const key = newName.toUpperCase().trim()
    const next = {}
    Object.entries(bank).forEach(([k, v]) => {
      next[k === oldName ? key : k] = v
    })
    saveBank(next)
    setEditGrupo(null)
  }

  function handleClearLearned() {
    if (!window.confirm('Limpar todo o aprendizado do MAXXXI?')) return
    localStorage.setItem('orion_maxxxi_learned', '{}')
    window.location.reload()
  }

  const learnedEntries = Object.entries(maxxxi_learned || {})

  return (
    <div>
      {/* HEADER */}
      <div className="page-header">
        <div>
          <div className="page-title">Banco de Classificações</div>
          <div className="page-subtitle">Categorias e padrões aprendidos pelo MAXXXI</div>
        </div>
        {isAdmin && (
          <button className="btn btn-blue" onClick={() => setModalGrupo(true)}>+ Novo Grupo</button>
        )}
      </div>

      {/* GRUPOS DE CLASSIFICAÇÃO */}
      <div className="g2 mb">
        {Object.entries(bank).map(([grupo, subcats]) => (
          <div key={grupo} className="module-card">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <div className="class-group-title" style={{ marginBottom:0, flex:1 }}>🏷 {grupo}</div>
              {isAdmin && (
                <div style={{ display:'flex', gap:6 }}>
                  <button className="btn btn-icon btn-v4-sm" style={{ fontSize:12 }} onClick={() => setEditGrupo({ oldName: grupo, newName: grupo })} title="Renomear">✏</button>
                  <button className="btn btn-icon btn-v4-sm" style={{ fontSize:12, color:'var(--blue3)' }} onClick={() => setModalSubcat(grupo)} title="Adicionar subcategoria">+</button>
                  {canDelete && <button className="btn btn-icon btn-v4-sm" style={{ fontSize:12, color:'var(--red)' }} onClick={() => setConfirmDelete({ type:'grupo', grupo })} title="Remover grupo">🗑</button>}
                </div>
              )}
            </div>
            {subcats.length === 0 ? (
              <div style={{ fontSize:12, color:'var(--tx3)', fontStyle:'italic' }}>Nenhuma subcategoria</div>
            ) : (
              subcats.map((s, i) => (
                <div key={i} className="class-item" style={{ justifyContent:'space-between' }}>
                  <span>• {s}</span>
                  {canDelete && (
                    <button className="btn btn-icon" style={{ fontSize:11, padding:'2px 6px', color:'var(--tx3)' }}
                      onClick={() => setConfirmDelete({ type:'subcat', grupo, subcat: s })}>✕</button>
                  )}
                </div>
              ))
            )}
          </div>
        ))}
      </div>

      {/* PADRÕES APRENDIDOS */}
      <div className="module-card">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <div className="module-card-title" style={{ margin:0 }}>🤖 Padrões Aprendidos pelo MAXXXI ({learnedEntries.length})</div>
          {isAdmin && learnedEntries.length > 0 && (
            <button className="btn btn-red" style={{ fontSize:12 }} onClick={handleClearLearned}>🗑 Limpar Aprendizado</button>
          )}
        </div>

        {learnedEntries.length === 0 ? (
          <div className="empty-state-v4">
            <span className="empty-icon">🤖</span>
            <div className="empty-text">Nenhum padrão aprendido ainda</div>
            <div className="empty-sub">Confirme classificações no Arquivo Digital para o MAXXXI aprender</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Subcategoria</th>
                <th>Confirmações</th>
              </tr>
            </thead>
            <tbody>
              {learnedEntries.sort((a, b) => b[1].count - a[1].count).map(([desc, data]) => (
                <tr key={desc}>
                  <td style={{ fontWeight:500, color:'var(--tx)' }}>{desc}</td>
                  <td><span className="status-badge gold">{data.categoria}</span></td>
                  <td style={{ color:'var(--tx2)' }}>{data.subcategoria}</td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div className="progress-bar-v4" style={{ width:60 }}>
                        <div className="progress-fill-v4" style={{ width: `${Math.min(data.count * 20, 100)}%` }}></div>
                      </div>
                      <span style={{ fontSize:12, fontWeight:700, fontFamily:"'Syne',sans-serif" }}>{data.count}×</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL NOVO GRUPO */}
      {modalGrupo && (
        <div className="modal-overlay show" onClick={e => e.target === e.currentTarget && setModalGrupo(false)}>
          <div className="modal" style={{ width:400 }}>
            <div className="modal-title">
              <span>🏷 Novo Grupo</span>
              <button className="modal-close" onClick={() => setModalGrupo(false)}>×</button>
            </div>
            <div className="form-group">
              <label className="form-label">Nome do Grupo</label>
              <input className="inp" placeholder="Ex.: TECNOLOGIA" value={novoGrupo} onChange={e => setNovoGrupo(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddGrupo()} autoFocus />
            </div>
            <button className="btn-primary" onClick={handleAddGrupo}>Criar Grupo</button>
          </div>
        </div>
      )}

      {/* MODAL NOVA SUBCATEGORIA */}
      {modalSubcat && (
        <div className="modal-overlay show" onClick={e => e.target === e.currentTarget && setModalSubcat(null)}>
          <div className="modal" style={{ width:400 }}>
            <div className="modal-title">
              <span>+ Subcategoria em {modalSubcat}</span>
              <button className="modal-close" onClick={() => setModalSubcat(null)}>×</button>
            </div>
            <div className="form-group">
              <label className="form-label">Nome da Subcategoria</label>
              <input className="inp" placeholder="Ex.: Cursos e Treinamentos" value={novaSubcat} onChange={e => setNovaSubcat(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddSubcat()} autoFocus />
            </div>
            <button className="btn-primary" onClick={handleAddSubcat}>Adicionar</button>
          </div>
        </div>
      )}

      {/* MODAL RENOMEAR GRUPO */}
      {editGrupo && (
        <div className="modal-overlay show" onClick={e => e.target === e.currentTarget && setEditGrupo(null)}>
          <div className="modal" style={{ width:400 }}>
            <div className="modal-title">
              <span>✏ Renomear Grupo</span>
              <button className="modal-close" onClick={() => setEditGrupo(null)}>×</button>
            </div>
            <div className="form-group">
              <label className="form-label">Novo Nome</label>
              <input className="inp" value={editGrupo.newName} onChange={e => setEditGrupo(g => ({ ...g, newName: e.target.value }))} autoFocus />
            </div>
            <button className="btn-primary" onClick={handleRenameGrupo}>Salvar</button>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR DELETE */}
      {confirmDelete && (
        <div className="modal-overlay show" onClick={e => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div className="modal" style={{ width:380 }}>
            <div className="modal-title">
              <span>⚠ Confirmar Remoção</span>
              <button className="modal-close" onClick={() => setConfirmDelete(null)}>×</button>
            </div>
            <p style={{ fontSize:14, color:'var(--tx2)', marginBottom:20 }}>
              {confirmDelete.type === 'grupo'
                ? `Remover o grupo "${confirmDelete.grupo}" e todas as suas subcategorias?`
                : `Remover a subcategoria "${confirmDelete.subcat}" do grupo "${confirmDelete.grupo}"?`}
            </p>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-red" style={{ flex:1 }} onClick={() => {
                if (confirmDelete.type === 'grupo') handleDeleteGrupo(confirmDelete.grupo)
                else handleDeleteSubcat(confirmDelete.grupo, confirmDelete.subcat)
              }}>Remover</button>
              <button className="btn" onClick={() => setConfirmDelete(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
