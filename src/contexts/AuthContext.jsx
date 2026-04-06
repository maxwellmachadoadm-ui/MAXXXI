import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isDemoMode } from '../lib/supabase'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

// Demo user for when Supabase isn't configured
const DEMO_USER = { id: 'demo', name: 'Maxwell Machado', email: 'maxwell@orion.app', role: 'admin', avatar_url: null }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemoMode) {
      // Check localStorage for demo session
      const saved = localStorage.getItem('orion_demo_session')
      if (saved) {
        const p = JSON.parse(saved)
        setUser({ id: p.id })
        setProfile(p)
      }
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) setProfile(data)
  }

  async function signIn(email, password) {
    if (isDemoMode) {
      // Demo mode: localStorage auth
      const users = JSON.parse(localStorage.getItem('orion_users') || '[]')
      const u = users.find(x => x.email === email && x.pass === btoa(password))
      if (!u) throw new Error('Usuario ou senha incorretos')
      setUser({ id: u.id })
      setProfile(u)
      localStorage.setItem('orion_demo_session', JSON.stringify(u))
      return
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signUp(email, password, name, phone, cpf) {
    if (isDemoMode) {
      const users = JSON.parse(localStorage.getItem('orion_users') || '[]')
      if (users.find(x => x.email === email)) throw new Error('E-mail ja cadastrado')
      const u = { id: Date.now().toString(), name, email, phone, cpf, pass: btoa(password), role: users.length === 0 ? 'admin' : 'viewer', avatar_url: null }
      users.push(u)
      localStorage.setItem('orion_users', JSON.stringify(users))
      setUser({ id: u.id })
      setProfile(u)
      localStorage.setItem('orion_demo_session', JSON.stringify(u))
      return
    }
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name, phone, cpf } }
    })
    if (error) throw error
  }

  async function signOut() {
    if (isDemoMode) {
      localStorage.removeItem('orion_demo_session')
      setUser(null)
      setProfile(null)
      return
    }
    await supabase.auth.signOut()
  }

  async function updateProfile(updates) {
    if (isDemoMode) {
      const p = { ...profile, ...updates }
      setProfile(p)
      localStorage.setItem('orion_demo_session', JSON.stringify(p))
      return
    }
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id)
    if (error) throw error
    setProfile(prev => ({ ...prev, ...updates }))
  }

  async function inviteUser(email, role = 'viewer') {
    if (isDemoMode) {
      const invites = JSON.parse(localStorage.getItem('orion_invites') || '[]')
      invites.push({ id: Date.now(), email, role, accepted: false, token: Math.random().toString(36).slice(2) })
      localStorage.setItem('orion_invites', JSON.stringify(invites))
      return
    }
    const { error } = await supabase.from('invites').insert({ email, role, invited_by: user.id })
    if (error) throw error
    // In production, send email via api/invite.js
    await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role })
    }).catch(() => {})
  }

  async function getInvites() {
    if (isDemoMode) return JSON.parse(localStorage.getItem('orion_invites') || '[]')
    const { data } = await supabase.from('invites').select('*').order('created_at', { ascending: false })
    return data || []
  }

  async function getUsers() {
    if (isDemoMode) return JSON.parse(localStorage.getItem('orion_users') || '[]')
    const { data } = await supabase.from('profiles').select('*').order('created_at')
    return data || []
  }

  const isAdmin = profile?.role === 'admin'
  const canEdit = profile?.role === 'admin' || profile?.role === 'editor'

  return (
    <AuthContext.Provider value={{
      user, profile, loading, isAdmin, canEdit,
      signIn, signUp, signOut, updateProfile,
      inviteUser, getInvites, getUsers
    }}>
      {children}
    </AuthContext.Provider>
  )
}
