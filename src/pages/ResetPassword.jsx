import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { OrionLogo } from '../components/OrionLogo'

const S = {
  screen: {
    minHeight: '100vh', width: '100%', background: '#080c14',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '24px 16px', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
  },
  card: {
    width: '100%', maxWidth: 420, background: '#0d1424',
    border: '1px solid #1e2a3d', borderRadius: 16, padding: '40px 36px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
  },
  logoRow: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 },
  logoText: {
    fontSize: 22, fontWeight: 800, letterSpacing: 4,
    background: 'linear-gradient(135deg,#fff,#93c5fd)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1,
  },
  logoSub: {
    fontSize: 9, color: '#64748b', letterSpacing: 3, textTransform: 'uppercase',
    fontFamily: "'DM Mono', monospace", marginTop: 4,
  },
  title: { fontSize: 20, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 },
  sub: { fontSize: 13, color: '#64748b', marginBottom: 28 },
  label: {
    display: 'block', fontSize: 11, color: '#64748b',
    fontFamily: "'DM Mono', monospace", letterSpacing: 1,
    textTransform: 'uppercase', marginBottom: 6,
  },
  input: {
    display: 'block', width: '100%', padding: '11px 14px', marginBottom: 16,
    background: '#111827', border: '1px solid #1e2a3d', borderRadius: 8,
    color: '#f1f5f9', fontSize: 14, fontFamily: "'DM Sans', sans-serif",
    outline: 'none', boxSizing: 'border-box',
  },
  inputFocus: { borderColor: '#3b82f6' },
  btn: {
    display: 'block', width: '100%', padding: 13,
    background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#0d1424',
    border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700,
    letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif", marginTop: 4,
  },
  btnDisabled: { opacity: 0.6, cursor: 'not-allowed' },
  error: {
    padding: '10px 14px', borderRadius: 8, marginBottom: 16,
    background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)',
    color: '#ef4444', fontSize: 13, lineHeight: 1.5,
  },
  success: {
    padding: '10px 14px', borderRadius: 8, marginBottom: 16,
    background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.25)',
    color: '#10b981', fontSize: 13, lineHeight: 1.5,
  },
  rule: { height: 1, background: '#1e2a3d', margin: '8px 0 16px' },
  hint: { fontSize: 11, color: '#475569', marginTop: -10, marginBottom: 14 },
}

function PasswordInput({ label, placeholder, value, onChange }) {
  const [focused, setFocused] = useState(false)
  const [show, setShow] = useState(false)
  return (
    <div>
      <label style={S.label}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ ...S.input, ...(focused ? S.inputFocus : {}), paddingRight: 44 }}
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 16,
          }}
        >{show ? '🙈' : '👁'}</button>
      </div>
    </div>
  )
}

export default function ResetPassword() {
  const { updatePassword } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // Verificação de força da senha
  const strength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3
  const strengthLabel = ['', 'Muito fraca', 'Fraca', 'Boa', 'Forte']
  const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981']

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres'); return }
    if (password !== confirm) { setError('As senhas não coincidem'); return }
    setLoading(true)
    try {
      await updatePassword(password)
      setSuccess('Senha alterada com sucesso! Redirecionando para o login...')
      setTimeout(() => navigate('/login', { replace: true }), 2500)
    } catch (err) {
      setError(err.message || 'Erro ao alterar senha. O link pode ter expirado.')
    } finally {
      setLoading(false)
    }
  }

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

        <div style={S.title}>Criar nova senha</div>
        <div style={S.sub}>Escolha uma senha segura para sua conta</div>

        {error && <div style={S.error}>⚠ {error}</div>}
        {success && <div style={S.success}>✓ {success}</div>}

        {!success && (
          <form onSubmit={handleSubmit} noValidate>
            <PasswordInput
              label="Nova senha *"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            {/* Barra de força da senha */}
            {password.length > 0 && (
              <div style={{ marginTop: -10, marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{
                      flex: 1, height: 3, borderRadius: 2,
                      background: i <= strength ? strengthColor[strength] : '#1e2a3d',
                      transition: 'background .2s',
                    }} />
                  ))}
                </div>
                <div style={{ fontSize: 11, color: strengthColor[strength] }}>
                  {strengthLabel[strength]}
                </div>
              </div>
            )}

            <PasswordInput
              label="Confirmar nova senha *"
              placeholder="Repita a senha"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
            />

            {confirm.length > 0 && password !== confirm && (
              <div style={{ fontSize: 11, color: '#ef4444', marginTop: -10, marginBottom: 14 }}>
                ⚠ As senhas não coincidem
              </div>
            )}
            {confirm.length > 0 && password === confirm && confirm.length >= 6 && (
              <div style={{ fontSize: 11, color: '#10b981', marginTop: -10, marginBottom: 14 }}>
                ✓ Senhas coincidem
              </div>
            )}

            <div style={S.rule} />

            <button
              type="submit"
              disabled={loading}
              style={{ ...S.btn, ...(loading ? S.btnDisabled : {}) }}
            >
              {loading ? 'Salvando...' : '🔒 Salvar nova senha'}
            </button>

            <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#475569' }}>
              Lembrou a senha?{' '}
              <span
                style={{ color: '#f59e0b', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => navigate('/login', { replace: true })}
              >
                Voltar ao login
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
