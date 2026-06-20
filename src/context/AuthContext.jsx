import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [clinica, setClinica] = useState(null)
  const [loading, setLoading] = useState(true)
  const [clinicaLoading, setClinicaLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      // Garante que o loading some mesmo num signOut
      if (!newSession) setLoading(false)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session?.user) {
      setClinica(null)
      return
    }

    setClinicaLoading(true)

    supabase
      .from('clinicas')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error('Erro ao buscar dados da clínica:', error.message)
          setClinica(null)
        } else {
          setClinica(data)
        }
        setClinicaLoading(false)
      })
  }, [session])

  // signIn retorna { data, error } — o componente decide o que fazer com o erro
  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  // signOut limpa tudo; o onAuthStateChange cuida de zerar a session
  const signOut = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider value={{ session, clinica, loading, clinicaLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (ctx === undefined) throw new Error('useAuth precisa estar dentro de AuthProvider')
  return ctx
}