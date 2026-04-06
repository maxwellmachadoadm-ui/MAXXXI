import { useState } from 'react'
import { useData } from '../contexts/DataContext'

const PRIORITY_COLORS = { alta: '#ef4444', media: '#f59e0b', baixa: '#3b82f6' }
const PRIORITY_LABELS = { alta: 'Alta', media: 'Media', baixa: 'Baixa' }

const emptyTask = {
  titulo: '',
  descricao: '',
  empresa_id: '',
  prioridade: 'media',
  status: 'todo',
  prazo: '',
}

export default function Tasks() {
  const { tarefas, empresas, addTask, updateTask, deleteTask, loaded } = useData()
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterEmpresa, setFilterEmpresa] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ ...emptyTask })

  if (!loaded) return <div className="loading">Carregando...</div>

  // Filter
  let filtered = [...tarefas]
  if (filterPriority !== 'all') filtered = filtered.filter(t => t.prioridade === filterPriority)
  if (filterEmpresa !== 'all') filtered = filtered.filter(t => t.empresa_id === filterEmpresa)

  const todo = filtered.filter(t => t.status === 'todo')
  const doing = filtered.filter(t => t.status === 'doing')
  const done = filtered.filter(t => t.status === 'done')

  function getEmpNome(id) {
    const e = empresas.find(x => x.id === id)
    return e ? e.sigla : id
  }

  function getEmpCor(id) {
    const e = empresas.find(x => x.id === id)
    return e ? e.cor : '#666'
  }

  async function handleAdd() {
    if (!form.titulo.trim()) return
    await addTask({
      titulo: form.titulo,
      descricao: form.descricao,
      empresa_id: form.empresa_id || empresas[0]?.id || '',
      prioridade: form.prioridade,
      status: form.status,
      prazo: form.prazo || null,
    })
    setForm({ ...emptyTask })
    setShowModal(false)
  }

  function TaskCard({ task }) {
    return (
      <div className="card task-card" style={{ borderLeft: `4px solid ${PRIORITY_COLORS[task.prioridade] || '#666'}` }}>
        <div className="task-card-header">
          <span className="badge" style={{ background: getEmpCor(task.empresa_id) }}>
            {getEmpNome(task.empresa_id)}
          </span>
          <span className="badge priority-badge" style={{ background: PRIORITY_COLORS[task.prioridade] || '#666' }}>
            {PRIORITY_LABELS[task.prioridade] || task.prioridade}
          </span>
        </div>
        <p className="task-title">{task.titulo}</p>
        {task.descricao && <p className="task-desc">{task.descricao}</p>}
        {task.prazo && <p className="task-date">📅 {task.prazo}</p>}
        <div className="task-actions">
          {task.status === 'todo' && (
            <button className="btn btn-sm btn-doing" onClick={() => updateTask(task.id, { status: 'doing' })}>
              ▶ Iniciar
            </button>
          )}
          {task.status === 'doing' && (
            <>
              <button className="btn btn-sm btn-done" onClick={() => updateTask(task.id, { status: 'done' })}>
                ✅ Concluir
              </button>
              <button className="btn btn-sm btn-back" onClick={() => updateTask(task.id, { status: 'todo' })}>
                ↩ Voltar
              </button>
            </>
          )}
          {task.status === 'done' && (
            <button className="btn btn-sm btn-reopen" onClick={() => updateTask(task.id, { status: 'todo' })}>
              🔄 Reabrir
            </button>
          )}
          <button className="btn btn-sm btn-del" onClick={() => deleteTask(task.id)}>🗑</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page tasks">
      <div className="page-header">
        <h1>Quadro de Tarefas</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Nova Tarefa</button>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label>Prioridade:</label>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="all">Todas</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baixa">Baixa</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Empresa:</label>
          <select value={filterEmpresa} onChange={e => setFilterEmpresa(e.target.value)}>
            <option value="all">Todas</option>
            {empresas.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.sigla} — {emp.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="kanban">
        <div className="kanban-col">
          <div className="kanban-col-header todo-header">
            <h3>📋 A Fazer</h3>
            <span className="count">{todo.length}</span>
          </div>
          <div className="kanban-col-body">
            {todo.map(t => <TaskCard key={t.id} task={t} />)}
          </div>
        </div>
        <div className="kanban-col">
          <div className="kanban-col-header doing-header">
            <h3>🔄 Em Andamento</h3>
            <span className="count">{doing.length}</span>
          </div>
          <div className="kanban-col-body">
            {doing.map(t => <TaskCard key={t.id} task={t} />)}
          </div>
        </div>
        <div className="kanban-col">
          <div className="kanban-col-header done-header">
            <h3>✅ Concluidas</h3>
            <span className="count">{done.length}</span>
          </div>
          <div className="kanban-col-body">
            {done.map(t => <TaskCard key={t.id} task={t} />)}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="g4 task-stats">
        <div className="card kpi-card">
          <span className="lbl">Total</span>
          <span className="val">{filtered.length}</span>
        </div>
        <div className="card kpi-card">
          <span className="lbl">A Fazer</span>
          <span className="val" style={{ color: '#ef4444' }}>{todo.length}</span>
        </div>
        <div className="card kpi-card">
          <span className="lbl">Em Andamento</span>
          <span className="val" style={{ color: '#f59e0b' }}>{doing.length}</span>
        </div>
        <div className="card kpi-card">
          <span className="lbl">Concluidas</span>
          <span className="val" style={{ color: '#10b981' }}>{done.length}</span>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nova Tarefa</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Titulo</label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={e => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Titulo da tarefa"
                />
              </div>
              <div className="form-group">
                <label>Descricao</label>
                <textarea
                  value={form.descricao}
                  onChange={e => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Descricao (opcional)"
                  rows={3}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Empresa</label>
                  <select value={form.empresa_id} onChange={e => setForm({ ...form, empresa_id: e.target.value })}>
                    <option value="">Selecione</option>
                    {empresas.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.sigla} — {emp.nome}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Prioridade</label>
                  <select value={form.prioridade} onChange={e => setForm({ ...form, prioridade: e.target.value })}>
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="baixa">Baixa</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="todo">A Fazer</option>
                    <option value="doing">Em Andamento</option>
                    <option value="done">Concluida</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Prazo</label>
                  <input
                    type="date"
                    value={form.prazo}
                    onChange={e => setForm({ ...form, prazo: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleAdd}>Criar Tarefa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
