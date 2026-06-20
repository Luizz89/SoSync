import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [clinica, setClinica] = useState(null)
  const [loading, setLoading] = useState(true)       // sessão ainda sendo verificada
  const [clinicaLoading, setClinicaLoading] = useState(false) // dados da clínica sendo buscados

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  // Busca os dados da clínica sempre que a sessão muda
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
          // Perfil ainda não criado ou erro real — ambos precisam ser tratados
          console.error('Erro ao buscar dados da clínica:', error.message)
          setClinica(null)
        } else {
          setClinica(data)
        }
        setClinicaLoading(false)
      })
  }, [session])

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