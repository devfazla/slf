import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

const AUTH_EMAIL = import.meta.env.VITE_EMAIL

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const navigate = useNavigate()

  // Check existing Supabase session on mount
  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setIsAuthenticated(true)
        setUserId(session.user.id)
      }
    } catch (error) {
      console.error('Session check failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Login: use Supabase email/password auth
  // Email comes from VITE_EMAIL, password is what user types
  const login = async (password) => {
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
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.warn('Supabase signout error:', e)
    }
    setIsAuthenticated(false)
    setUserId(null)
    navigate('/login')
  }

  // Change password via Supabase
  const changePassword = async (oldPassword, newPassword) => {
    try {
      // Re-authenticate with old password first
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: AUTH_EMAIL,
        password: oldPassword
      })

      if (reauthError) {
        return { success: false, message: 'Current password is incorrect' }
      }

      // Update password
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
  }

  const getCurrentUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id || null
  }

  return {
    isAuthenticated,
    isLoading,
    userId,
    login,
    logout,
    changePassword,
    checkSession,
    getCurrentUserId
  }
}
