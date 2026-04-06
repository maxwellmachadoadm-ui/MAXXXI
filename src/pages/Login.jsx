import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { user, signIn, signUp, loading } = useAuth()
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [cpf, setCpf] = useState('')

  useEffect(() => { if (!loading && user) navigate('/', { replace: true }) }, [user, loading, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Nome e obrigatorio')
        await signUp(email, password, name, phone, cpf)
      } else {
        await signIn(email, password)
      }
    } catch (err) {
      setError(err.message || 'Erro ao autenticar')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return null
  if (user) return null

  return (
    <div className="login-screen">
      <div className="login-box">
        <div className="login-logo">
          <div className="logo-mark" style={{ width: 40, height: 40, borderRadius: 10 }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
              <circle cx="12" cy="12" r="2.5" fill="white"/>
              <circle cx="5" cy="6" r="1.5" fill="rgba(255,255,255,.7)"/>
              <circle cx="19" cy="6" r="1.5" fill="rgba(255,255,255,.7)"/>
              <circle cx="19" cy="18" r="1.5" fill="rgba(255,255,255,.5)"/>
              <circle cx="5" cy="18" r="1" fill="rgba(255,255,255,.4)"/>
              <line x1="12" y1="12" x2="5" y2="6" stroke="rgba(255,255,255,.35)" strokeWidth="1"/>
              <line x1="12" y1="12" x2="19" y2="6" stroke="rgba(255,255,255,.35)" strokeWidth="1"/>
              <line x1="12" y1="12" x2="19" y2="18" stroke="rgba(255,255,255,.25)" strokeWidth="1"/>
              <line x1="5" y1="6" x2="19" y2="6" stroke="rgba(255,255,255,.2)" strokeWidth=".8"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 20, color: '#fff', letterSpacing: 2 }}>ORION</div>
            <div style={{ fontSize: 9, color: 'var(--tx3)', letterSpacing: 3, textTransform: 'uppercase' }}>Gestao Executiva</div>
          </div>
        </div>

        {!isRegister ? (
          <form onSubmit={handleSubmit}>
            <div className="login-title">Bem-vindo de volta</div>
            <div className="login-sub">Acesse sua plataforma executiva</div>
            {error && <div className="alert-r" style={{ marginBottom: 12 }}>{error}</div>}
            <input className="inp" type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} />
            <input className="inp" type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} />
            <button className="btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Entrando...' : 'Entrar na plataforma'}
            </button>
            <div className="login-switch">
              Nao tem conta? <span onClick={() => { setIsRegister(true); setError('') }}>Criar acesso</span>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="login-title">Criar conta</div>
            <div className="login-sub">Preencha seus dados</div>
            {error && <div className="alert-r" style={{ marginBottom: 12 }}>{error}</div>}
            <input className="inp" type="text" placeholder="Nome completo" value={name} onChange={e => setName(e.target.value)} />
            <input className="inp" type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} />
            <input className="inp" type="tel" placeholder="Celular" value={phone} onChange={e => setPhone(e.target.value)} />
            <input className="inp" type="text" placeholder="CPF (opcional)" value={cpf} onChange={e => setCpf(e.target.value)} />
            <input className="inp" type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} />
            <button className="btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Criando...' : 'Criar conta'}
            </button>
            <div className="login-switch">
              Ja tem conta? <span onClick={() => { setIsRegister(false); setError('') }}>Entrar</span>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
