import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../services/supabase'

const AuthContext = createContext(null)

/**
 * AuthProvider — wraps the app and provides user session state.
 * Works in demo mode when Supabase is not configured.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      // Demo mode — restore user from localStorage if present
      const stored = localStorage.getItem('stylenest_user')
      if (stored) {
        try { setUser(JSON.parse(stored)) } catch { localStorage.removeItem('stylenest_user') }
      }
      setLoading(false)
      return
    }

    // Get the current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  /** Sign up with email + password */
  const signUp = async (email, password) => {
    if (!supabase) {
      // Demo mode: simulate signup
      const demoUser = { id: 'demo-user', email, user_metadata: { full_name: email.split('@')[0] } }
      setUser(demoUser)
      localStorage.setItem('stylenest_user', JSON.stringify(demoUser))
      return { user: demoUser }
    }
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  }

  /** Sign in with email + password */
  const signIn = async (email, password) => {
    if (!supabase) {
      // Demo mode: simulate login
      const demoUser = { id: 'demo-user', email, user_metadata: { full_name: email.split('@')[0] } }
      setUser(demoUser)
      localStorage.setItem('stylenest_user', JSON.stringify(demoUser))
      return { user: demoUser }
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  /** Sign in with Google OAuth */
  const signInWithGoogle = async () => {
    if (!supabase) {
      alert('Google sign-in requires Supabase configuration')
      return
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    if (error) throw error
    return data
  }

  /** Sign out */
  const signOut = async () => {
    if (!supabase) {
      setUser(null)
      setSession(null)
      localStorage.removeItem('stylenest_user')
      return
    }
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/** Hook to access auth context */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
