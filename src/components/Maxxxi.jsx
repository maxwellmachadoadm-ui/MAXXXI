import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'

export default function Maxxxi() {
  const { profile } = useAuth()
  const { empresas, tarefas, fmt, generateAlerts, getKpis } = useData()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Ola! Sou o MAXXXI — seu agente executivo com IA. Posso analisar empresas, gerar briefings e muito mais.' }
  ])
  const [loading, setLoading] = useState(false)
  const [serverApi, setServerApi] = useState(null)
  const msgsRef = useRef(null)

  useEffect(() => {
    fetch('/api/status').then(r => r.json()).then(d => setServerApi(d.api_configured)).catch(() => setServerApi(false))
  }, [])

  function scrollBottom() { if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight }
  useEffect(scrollBottom, [messages])

  function buildSystemPrompt() {
    const pending = tarefas.filter(t => t.status !== 'done')
    const taskList = pending.slice(0, 10).map(t => {
      const e = empresas.find(x => x.id === t.empresa_id)
      return `- [${e?.sigla}] ${t.titulo} (${t.prioridade})`
    }).join('\n')
    return `Voce e MAXXXI — Agente Executivo IA da plataforma ORION de ${profile?.name || 'Maxwell'}.
Empresas: ${empresas.map(e => `${e.nome} (${e.sigla}, score ${e.score}, fat ${fmt(e.faturamento)})`).join('; ')}.
Tarefas pendentes (${pending.length}):\n${taskList}
Alertas: ${generateAlerts().map(a => a.text).join('; ') || 'nenhum'}.
Responda em portugues, direto e executivo. Max 3 paragrafos.`
  }

  function getLocalResponse(txt) {
    const lower = txt.toLowerCase()
    if (lower.includes('prioridade') || lower.includes('atencao'))
      return 'Original Fotografia precisa de atencao imediata — inadimplencia 8,7%. Forme Seguro esta abaixo da meta (30%). CDL e Doctor Wealth estao saudaveis.'
    if (lower.includes('briefing') || lower.includes('ecossistema'))
      return `Faturamento total: ${fmt(empresas.reduce((s, e) => s + e.faturamento, 0))}. Health Score medio: ${Math.round(empresas.reduce((s, e) => s + e.score, 0) / empresas.length)}. CDL lidera em score (88). Forme Seguro maior crescimento (+50%).`
    if (lower.includes('tarefa'))
      return `${tarefas.length} tarefas total. ${tarefas.filter(t => t.status !== 'done').length} pendentes. ${tarefas.filter(t => t.prioridade === 'alta' && t.status !== 'done').length} de alta prioridade.`
    return 'Para respostas com IA real, configure a ANTHROPIC_API_KEY no Vercel. Pergunte sobre: prioridades, briefing, tarefas.'
  }

  async function send() {
    if (!input.trim() || loading) return
    const txt = input.trim()
    setInput('')
    const newMsgs = [...messages, { role: 'user', content: txt }]
    setMessages(newMsgs)

    if (!serverApi) {
      setLoading(true)
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: getLocalResponse(txt) }])
        setLoading(false)
      }, 600)
      return
    }

    setLoading(true)
    try {
      const apiMessages = newMsgs.filter(m => m.role === 'user' || m.role === 'assistant').slice(1).slice(-12)
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1024, system: buildSystemPrompt(), messages: apiMessages })
      })
      const data = await res.json()
      const reply = data.content?.[0]?.text || 'Sem resposta.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erro de conexao: ' + e.message }])
    }
    setLoading(false)
  }

  const quickActions = ['Qual empresa precisa de atencao?', 'Briefing executivo', 'Analise minhas tarefas', 'Plano semanal']

  return (
    <div className="mx-panel">
      {open && (
        <div className="mx-chat">
          <div className="mx-hdr">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div><div className="mx-hname">🤖 MAXXXI</div><div className="mx-hsub">INTELIGENCIA EXECUTIVA</div></div>
              <span className={`mx-api-status ${serverApi ? 'ok' : 'off'}`}>{serverApi ? 'SERVER' : serverApi === false ? 'LOCAL' : '...'}</span>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 20, cursor: 'pointer' }}>×</button>
          </div>
          <div className="mx-msgs" ref={msgsRef}>
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'assistant' ? 'msg-ai' : 'msg-u'}>
                {m.role === 'assistant' && <div className="msg-from">MAXXXI</div>}
                <div className={m.role === 'assistant' ? 'msg-bubble-ai' : 'msg-bubble-u'}
                  dangerouslySetInnerHTML={{ __html: m.content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              </div>
            ))}
            {loading && <div className="msg-ai"><div className="msg-from">MAXXXI</div><div className="msg-bubble-ai"><div className="mx-typing"><span></span><span></span><span></span></div></div></div>}
          </div>
          <div className="mx-quick">
            {quickActions.map(q => <button key={q} className="qbtn" onClick={() => { setInput(q); setTimeout(send, 50) }}>{q}</button>)}
          </div>
          <div className="mx-input">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Consulte o MAXXXI..." />
            <button className="mx-send" onClick={send}>→</button>
          </div>
        </div>
      )}
      <div className="mx-fab" onClick={() => setOpen(!open)}>
        <div className="fi">🤖</div><div className="fl">MAXXXI</div>
      </div>
    </div>
  )
}
