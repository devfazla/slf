import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient'

const AUTH_EMAIL = import.meta.env.VITE_EMAIL

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState(null)

  // Check session ONCE on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          setIsAuthenticated(false)
          setUserId(null)
        } else if (session?.user) {
          setIsAuthenticated(true)
          setUserId(session.user.id)
        } else {
          setIsAuthenticated(false)
          setUserId(null)
        }
      } catch (error) {
        setIsAuthenticated(false)
        setUserId(null)
      } finally {
        setIsLoading(false)
      }
    }
    initSession()
  }, [])

  // Listen for Supabase auth state changes (handles signOut, token refresh, etc.)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setIsAuthenticated(false)
        setUserId(null)
      } else if (event === 'SIGNED_IN' && session?.user) {
        setIsAuthenticated(true)
        setUserId(session.user.id)
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setIsAuthenticated(true)
        setUserId(session.user.id)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const login = useCallback(async (password) => {
    try {
      if (!AUTH_EMAIL) {
        return { success: false, message: 'App not configured: missing email' }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: AUTH_EMAIL,
        password: password
      })

      if (error) {
        return { success: false, message: 'Incorrect password' }
      }

      setIsAuthenticated(true)
      setUserId(data.user.id)

      return { success: true, userId: data.user.id }
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, message: 'Authentication failed' }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      setIsAuthenticated(false)
      setUserId(null)
      await supabase.auth.signOut()
    } catch (e) {
      console.warn('Supabase signout error:', e)
      setIsAuthenticated(false)
      setUserId(null)
    }
  }, [])

  const changePassword = useCallback(async (oldPassword, newPassword) => {
    try {
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: AUTH_EMAIL,
        password: oldPassword
      })

      if (reauthError) {
        return { success: false, message: 'Current password is incorrect' }
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        return { success: false, message: 'Failed to update password' }
      }

      return { success: true, message: 'Password changed successfully' }
    } catch (error) {
      console.error('Password change failed:', error)
      return { success: false, message: 'Failed to change password' }
    }
  }, [])

  const getCurrentUserId = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id || null
  }, [])

  const value = useMemo(() => ({
    isAuthenticated,
    isLoading,
    userId,
    login,
    logout,
    changePassword,
    getCurrentUserId
  }), [isAuthenticated, isLoading, userId, login, logout, changePassword, getCurrentUserId])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
