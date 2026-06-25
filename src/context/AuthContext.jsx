// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [session,        setSession]        = useState(null)
  const [usuario,        setUsuario]        = useState(null)  // usuarios row
  const [clinica,        setClinica]        = useState(null)  // clinicas row
  const [loading,        setLoading]        = useState(true)  // initial auth check
  const [clinicaLoading, setClinicaLoading] = useState(false) // profile fetch in progress

  // ─── Core: resolve usuario + clinica from a Supabase auth user ID ──────────
  //
  // BUG FIX (original code):
  //   The original query was `.from('clinicas').eq('id', session.user.id)`.
  //   clinicas.id is not the same as auth user id. The correct path is:
  //     usuarios.id (= auth uid) → usuarios.clinica_id → clinicas.id
  //
  const carregarPerfil = useCallback(async (userId) => {
    if (!userId) {
      setUsuario(null)
      setClinica(null)
      return
    }

    setClinicaLoading(true)

    // Step 1: resolve the user row
    const { data: u, error: uErr } = await supabase
      .from('usuarios')
      .select('id, nome, email, role, clinica_id')
      .eq('id', userId)
      .single()

    if (uErr || !u) {
      console.error('Erro ao buscar usuário:', uErr?.message)
      setUsuario(null)
      setClinica(null)
      setClinicaLoading(false)
      return
    }

    setUsuario(u)

    // Step 2: resolve the clinic row via the FK on the user
    if (u.clinica_id) {
      const { data: c, error: cErr } = await supabase
        .from('clinicas')
        .select('id, nome, telefone')
        .eq('id', u.clinica_id)
        .single()

      if (cErr) console.error('Erro ao buscar clínica:', cErr.message)
      setClinica(c ?? null)
    } else {
      setClinica(null)
    }

    setClinicaLoading(false)
  }, [])

  // ─── Session watcher ───────────────────────────────────────────────────────
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

  // ─── Profile watcher (re-fires when session changes) ──────────────────────
  useEffect(() => {
    if (session?.user?.id) {
      carregarPerfil(session.user.id)
    } else {
      setUsuario(null)
      setClinica(null)
    }
  }, [session, carregarPerfil])

  // ─── Public API ───────────────────────────────────────────────────────────
  // refreshPerfil: called by PerfilClinica after a successful save so that any
  // component reading `usuario` or `clinica` from context (e.g. the sidebar)
  // sees the updated values without requiring a full page reload.
  const refreshPerfil = useCallback(
    (userId) => carregarPerfil(userId),
    [carregarPerfil]
  )

  const signIn  = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signOut = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider
      value={{
        session,
        usuario,        // added — consumers can read the current user row
        clinica,
        loading,
        clinicaLoading,
        signIn,
        signOut,
        refreshPerfil,  // added — call after profile mutations to sync context
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (ctx === undefined) {
    throw new Error('useAuth precisa estar dentro de AuthProvider')
  }
  return ctx
}