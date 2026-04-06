import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { user, signIn, signUp, loading } = useAuth()
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Form fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [cpf, setCpf] = useState('')

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true })
    }
  }, [user, loading, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Nome e obrigatorio')
        if (!email.trim()) throw new Error('E-mail e obrigatorio')
        if (password.length < 6) throw new Error('Senha deve ter pelo menos 6 caracteres')
        await signUp(email, password, name, phone, cpf)
      } else {
        if (!email.trim()) throw new Error('E-mail e obrigatorio')
        if (!password.trim()) throw new Error('Senha e obrigatoria')
        await signIn(email, password)
      }
    } catch (err) {
      setError(err.message || 'Erro ao autenticar')
    } finally {
      setSubmitting(false)
    }
  }

  function toggleMode() {
    setIsRegister(!isRegister)
    setError('')
  }

  if (loading) return <div className="loading">Carregando...</div>
  if (user) return null

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand">
          <h1 className="login-logo">ORION</h1>
          <p className="login-tagline">Plataforma de Gestao Executiva</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <h2>{isRegister ? 'Criar Conta' : 'Entrar'}</h2>

          {error && (
            <div className="login-error">
              <span>⚠️</span> {error}
            </div>
          )}

          {isRegister && (
            <>
              <div className="form-group">
                <label>Nome completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  autoComplete="name"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Telefone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    autoComplete="tel"
                  />
                </div>
                <div className="form-group">
                  <label>CPF</label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={e => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Sua senha"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-login"
            disabled={submitting}
          >
            {submitting ? 'Aguarde...' : isRegister ? 'Criar Conta' : 'Entrar'}
          </button>

          <div className="login-toggle">
            <span>
              {isRegister ? 'Ja tem uma conta?' : 'Nao tem conta?'}
            </span>
            <button type="button" className="btn-link" onClick={toggleMode}>
              {isRegister ? 'Fazer login' : 'Criar conta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
