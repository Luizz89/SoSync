import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [session, setSession]               = useState(null)
  const [clinica, setClinica]               = useState(null)
  const [loading, setLoading]               = useState(true)
  const [clinicaLoading, setClinicaLoading] = useState(false)

  // Extraída para poder ser chamada externamente via refreshPerfil
  const carregarClinica = useCallback(async (userId) => {
    if (!userId) { setClinica(null); return }

    setClinicaLoading(true)
    const { data, error } = await supabase
      .from('clinicas')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Erro ao buscar dados da clínica:', error.message)
      setClinica(null)
    } else {
      setClinica(data)
    }
    setClinicaLoading(false)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      if (!newSession) setLoading(false)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session?.user) {
      setClinica(null)
      return
    }
    carregarClinica(session.user.id)
  }, [session, carregarClinica])

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signOut = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider value={{
      session,
      clinica,
      loading,
      clinicaLoading,
      signIn,
      signOut,
      refreshPerfil: carregarClinica,   // ← alias para compatibilidade com PerfilClinica
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (ctx === undefined) throw new Error('useAuth precisa estar dentro de AuthProvider')
  return ctx
}