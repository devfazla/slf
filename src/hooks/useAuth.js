import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { hashPassword, verifyPassword, generateRandomString } from '../lib/crypto'
import { setSession, getSession, clearSession } from '../lib/storage'

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const navigate = useNavigate()

  // Check session on mount
  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = () => {
    try {
      const session = getSession()
      const userId = localStorage.getItem('selfdesk_user_id')
      
      if (session && userId) {
        setIsAuthenticated(true)
        setUserId(userId)
      }
    } catch (error) {
      console.error('Session check failed:', error)
      clearSession()
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (password) => {
    try {
      // Check if this is first time setup
      const hasSetup = localStorage.getItem('selfdesk_setup')
      
      if (!hasSetup) {
        // First time setup - create password
        const hashedPassword = await hashPassword(password)
        localStorage.setItem('selfdesk_setup', 'true')
        localStorage.setItem('selfdesk_password_hash', hashedPassword)
        
        // Create new session
        const token = generateRandomString(32)
        const newUserId = 'user_' + Date.now()
        
        setSession(token)
        localStorage.setItem('selfdesk_user_id', newUserId)
        
        return {
          success: true,
          isFirstTime: true,
          userId: newUserId
        }
      } else {
        // Verify existing password
        const storedHash = localStorage.getItem('selfdesk_password_hash')
        const isValid = await verifyPassword(password, storedHash)
        
        if (!isValid) {
          return {
            success: false,
            message: 'Incorrect password'
          }
        }
        
        // Create new session
        const token = generateRandomString(32)
        const existingUserId = localStorage.getItem('selfdesk_user_id') || 'user_' + Date.now()
        
        setSession(token)
        localStorage.setItem('selfdesk_user_id', existingUserId)
        
        return {
          success: true,
          isFirstTime: false,
          userId: existingUserId
        }
      }
    } catch (error) {
      console.error('Login failed:', error)
      return {
        success: false,
        message: 'Authentication failed'
      }
    }
  }

  const logout = () => {
    clearAuthSession()
    navigate('/login')
  }

  const changePassword = async (oldPassword, newPassword) => {
    try {
      // Verify old password first
      const storedHash = localStorage.getItem('selfdesk_password_hash')
      const isOldPasswordValid = await verifyPassword(oldPassword, storedHash)
      
      if (!isOldPasswordValid) {
        return {
          success: false,
          message: 'Current password is incorrect'
        }
      }
      
      // Hash and store new password
      const newHashedPassword = await hashPassword(newPassword)
      localStorage.setItem('selfdesk_password_hash', newHashedPassword)
      
      // Clear current session to force re-login
      clearAuthSession()
      
      return {
        success: true,
        message: 'Password changed successfully'
      }
    } catch (error) {
      console.error('Password change failed:', error)
      return {
        success: false,
        message: 'Failed to change password'
      }
    }
  }

  const setSessionState = (userId) => {
    setIsAuthenticated(true)
    setUserId(userId)
  }

  const clearAuthSession = () => {
    clearSession()
    localStorage.removeItem('selfdesk_user_id')
    setIsAuthenticated(false)
    setUserId(null)
  }

  const getCurrentUserId = () => {
    return localStorage.getItem('selfdesk_user_id') || userId
  }

  return {
    isAuthenticated,
    isLoading,
    userId,
    login,
    logout,
    changePassword,
    checkSession,
    getCurrentUserId,
    setSessionState,
    clearAuthSession
  }
}
