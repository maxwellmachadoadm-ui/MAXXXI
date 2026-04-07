import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OrionLogo } from '../components/OrionLogo'

// Página intermediária que recebe o callback do Supabase
// (link de reset de senha, confirmação de email, etc.)
// O Supabase redireciona para /auth/callback com #access_token=...&type=recovery
// O AuthContext detecta o hash e dispara PASSWORD_RECOVERY via onAuthStateChange,
// que então redireciona para /reset-password.
// Esta página apenas exibe um loading enquanto isso acontece.

export default function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('Processando autenticação...')

  useEffect(() => {
    // Verificar tipo de callback na URL
    const hash = window.location.hash
    const params = new URLSearchParams(hash.slice(1))
    const type = params.get('type')
    const errorDesc = params.get('error_description')

    if (errorDesc) {
      setStatus('Erro: ' + decodeURIComponent(errorDesc.replace(/\+/g, ' ')))
      setTimeout(() => navigate('/login', { replace: true }), 3000)
      return
    }

    if (type === 'recovery') {
      setStatus('Verificando token de recuperação...')
      // O AuthContext (onAuthStateChange PASSWORD_RECOVERY) vai redirecionar
      // para /reset-password automaticamente. Apenas aguardamos.
      setTimeout(() => {
        // Fallback: se após 5s nada aconteceu, vai para reset-password mesmo assim
        if (window.location.pathname === '/auth/callback') {
          navigate('/reset-password', { replace: true })
        }
      }, 5000)
      return
    }

    if (type === 'signup' || type === 'magiclink') {
      setStatus('Confirmando acesso...')
      setTimeout(() => navigate('/', { replace: true }), 2000)
      return
    }

    // Fallback genérico
    setTimeout(() => navigate('/', { replace: true }), 2000)
  }, [navigate])

  return (
    <div style={{
      minHeight: '100vh', background: '#080c14',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ textAlign: 'center' }}>
        <OrionLogo size={48} />
        <div style={{
          fontSize: 24, fontWeight: 800, letterSpacing: 4, marginTop: 16, marginBottom: 4,
          background: 'linear-gradient(135deg,#fff,#93c5fd)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>ORION</div>
        <div style={{ fontSize: 9, color: '#475569', letterSpacing: 3, textTransform: 'uppercase', fontFamily: "'DM Mono', monospace", marginBottom: 32 }}>
          Gestão Executiva
        </div>
        <div style={{
          width: 32, height: 32, border: '3px solid #1e2a3d', borderTop: '3px solid #f59e0b',
          borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 20px',
        }} />
        <div style={{ fontSize: 13, color: '#64748b' }}>{status}</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )
}
