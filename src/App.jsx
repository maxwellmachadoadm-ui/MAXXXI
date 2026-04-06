import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import CEO from './pages/CEO'
import Workspace from './pages/Workspace'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Syne', fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: 2 }}>ORION</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>Carregando...</div>
        </div>
      </div>
    )
  }

  if (!user) return <Login />

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tarefas" element={<Tasks />} />
        <Route path="/ceo" element={<CEO />} />
        <Route path="/empresa/:id" element={<Workspace />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  )
}
