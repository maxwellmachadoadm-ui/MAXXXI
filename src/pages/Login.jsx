import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { OrionLogo } from '../components/OrionLogo'

// Estilos inline completos — não depende de CSS externo
const S = {
  screen: {
    minHeight: '100vh',
    width: '100%',
    background: '#080c14',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: 'border-box',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    background: '#0d1424',
    border: '1px solid #1e2a3d',
    borderRadius: 16,
    padding: '40px 36px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginBottom: 32,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: 4,
    background: 'linear-gradient(135deg,#fff,#93c5fd)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    lineHeight: 1,
  },
  logoSub: {
    fontSize: 9,
    color: '#64748b',
    letterSpacing: 3,
    textTransform: 'uppercase',
    fontFamily: "'DM Mono', monospace",
    marginTop: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: '#f1f5f9',
    marginBottom: 6,
  },
  sub: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 28,
  },
  input: {
    display: 'block',
    width: '100%',
    padding: '11px 14px',
    marginBottom: 12,
    background: '#111827',
    border: '1px solid #1e2a3d',
    borderRadius: 8,
    color: '#f1f5f9',
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color .15s',
  },
  inputFocus: {
    borderColor: '#3b82f6',
  },
  forgotRow: {
    textAlign: 'right',
    marginBottom: 20,
    marginTop: -4,
  },
  forgotLink: {
    fontSize: 12,
    color: '#3b82f6',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  btn: {
    display: 'block',
    width: '100%',
    padding: '13px',
    background: 'linear-gradient(135deg,#f59e0b,#d97706)',
    color: '#0d1424',
    border: 'none',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    marginTop: 4,
    transition: 'opacity .15s',
  },
  btnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  switchRow: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 13,
    color: '#475569',
  },
  switchLink: {
    color: '#f59e0b',
    cursor: 'pointer',
    fontWeight: 600,
  },
  error: {
    padding: '10px 14px',
    borderRadius: 8,
    marginBottom: 16,
    background: 'rgba(239,68,68,0.10)',
    border: '1px solid rgba(239,68,68,0.25)',
    color: '#ef4444',
    fontSize: 13,
    lineHeight: 1.5,
  },
  success: {
    padding: '10px 14px',
    borderRadius: 8,
    marginBottom: 16,
    background: 'rgba(16,185,129,0.10)',
    border: '1px solid rgba(16,185,129,0.25)',
    color: '#10b981',
    fontSize: 13,
    lineHeight: 1.5,
  },
  divider: {
    height: 1,
    background: '#1e2a3d',
    margin: '24px 0',
  },
  label: {
    display: 'block',
    fontSize: 11,
    color: '#64748b',
    fontFamily: "'DM Mono', monospace",
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
}

function InputField({ type = 'text', placeholder, value, onChange, label }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={S.label}>{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ ...S.input, ...(focused ? S.inputFocus : {}), marginBottom: 0 }}
        autoComplete={type === 'password' ? 'current-password' : type === 'email' ? 'email' : 'off'}
      />
    </div>
  )
}

export default function Login() {
  const { user, signIn, signUp, resetPassword, loading } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // login | register | forgot
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [cpf, setCpf] = useState('')

  useEffect(() => {
    if (!loading && user) navigate('/', { replace: true })
  }, [user, loading, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      if (mode === 'forgot') {
        if (!email.trim()) throw new Error('Digite seu e-mail')
        await resetPassword(email)
        setSuccess('E-mail de recuperação enviado! Verifique sua caixa de entrada.')
      } else if (mode === 'register') {
        if (!name.trim()) throw new Error('Nome é obrigatório')
        if (!email.trim()) throw new Error('E-mail é obrigatório')
        if (!password.trim()) throw new Error('Senha é obrigatória')
        await signUp(email, password, name, phone, cpf)
        setSuccess('Conta criada! Aguardando aprovação do administrador.')
      } else {
        if (!email.trim()) throw new Error('Digite seu e-mail')
        if (!password.trim()) throw new Error('Digite sua senha')
        await signIn(email, password)
      }
    } catch (err) {
      setError(err.message || 'Erro ao processar')
    } finally {
      setSubmitting(false)
    }
  }

  function switchMode(m) {
    setMode(m)
    setError('')
    setSuccess('')
  }

  if (loading) return null
  if (user) return null

  return (
    <div style={S.screen}>
      <div style={S.card}>

        {/* Logo */}
        <div style={S.logoRow}>
          <OrionLogo size={44} />
          <div>
            <div style={S.logoText}>ORION</div>
            <div style={S.logoSub}>Gestão Executiva</div>
          </div>
        </div>

        {/* ── LOGIN ── */}
        {mode === 'login' && (
          <form onSubmit={handleSubmit} noValidate>
            <div style={S.title}>Bem-vindo de volta</div>
            <div style={S.sub}>Acesse sua plataforma executiva</div>

            {error && <div style={S.error}>⚠ {error}</div>}

            <InputField
              type="email"
              label="E-mail"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <InputField
              type="password"
              label="Senha"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            <div style={S.forgotRow}>
              <span style={S.forgotLink} onClick={() => switchMode('forgot')}>
                Esqueci minha senha
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{ ...S.btn, ...(submitting ? S.btnDisabled : {}) }}
            >
              {submitting ? 'Entrando...' : 'Entrar na plataforma'}
            </button>

            <div style={S.switchRow}>
              Não tem conta?{' '}
              <span style={S.switchLink} onClick={() => switchMode('register')}>
                Criar acesso
              </span>
            </div>
          </form>
        )}

        {/* ── ESQUECI SENHA ── */}
        {mode === 'forgot' && (
          <form onSubmit={handleSubmit} noValidate>
            <div style={S.title}>Recuperar senha</div>
            <div style={S.sub}>Enviaremos um link para redefinir sua senha</div>

            {error && <div style={S.error}>⚠ {error}</div>}
            {success && <div style={S.success}>✓ {success}</div>}

            <InputField
              type="email"
              label="E-mail cadastrado"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            <button
              type="submit"
              disabled={submitting}
              style={{ ...S.btn, ...(submitting ? S.btnDisabled : {}) }}
            >
              {submitting ? 'Enviando...' : 'Enviar link de recuperação'}
            </button>

            <div style={S.switchRow}>
              Lembrou a senha?{' '}
              <span style={S.switchLink} onClick={() => switchMode('login')}>
                Voltar ao login
              </span>
            </div>
          </form>
        )}

        {/* ── CRIAR CONTA ── */}
        {mode === 'register' && (
          <form onSubmit={handleSubmit} noValidate>
            <div style={S.title}>Criar conta</div>
            <div style={S.sub}>Preencha seus dados para solicitar acesso</div>

            {error && <div style={S.error}>⚠ {error}</div>}
            {success && <div style={S.success}>✓ {success}</div>}

            <InputField
              type="text"
              label="Nome completo *"
              placeholder="Maxwell Oliveira"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <InputField
              type="email"
              label="E-mail *"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <InputField
              type="tel"
              label="Celular"
              placeholder="(22) 99999-9999"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
            <InputField
              type="text"
              label="CPF (opcional)"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={e => setCpf(e.target.value)}
            />
            <InputField
              type="password"
              label="Senha *"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            <button
              type="submit"
              disabled={submitting}
              style={{ ...S.btn, ...(submitting ? S.btnDisabled : {}) }}
            >
              {submitting ? 'Criando conta...' : 'Criar conta'}
            </button>

            <div style={S.switchRow}>
              Já tem conta?{' '}
              <span style={S.switchLink} onClick={() => switchMode('login')}>
                Entrar
              </span>
            </div>
          </form>
        )}


      </div>
    </div>
  )
}
