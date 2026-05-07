import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, AlertCircle, Settings } from 'lucide-react'

const Login = () => {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isFirstTime, setIsFirstTime] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!password.trim()) {
      setError('Please enter a password')
      return
    }

    setLoading(true)
    setError('')

    try {
      // TODO: Replace with actual authentication logic
      // For now, simulate authentication
      const response = await simulateAuth(password)
      
      if (response.success) {
        // Store session token
        localStorage.setItem('selfdesk_session', response.token)
        localStorage.setItem('selfdesk_user_id', response.userId)
        
        // Redirect to chat
        navigate('/chat')
      } else {
        setError(response.message || 'Authentication failed')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Temporary simulation function - will be replaced with real auth
  const simulateAuth = async (password) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Check if this is first time setup
    const hasSetup = localStorage.getItem('selfdesk_setup')
    
    if (!hasSetup) {
      // First time setup - accept any password
      localStorage.setItem('selfdesk_setup', 'true')
      localStorage.setItem('selfdesk_password_hash', btoa(password)) // Simple encoding for demo
      
      return {
        success: true,
        token: btoa(Date.now().toString()),
        userId: 'user_' + Date.now()
      }
    } else {
      // Verify password
      const storedHash = localStorage.getItem('selfdesk_password_hash')
      if (btoa(password) === storedHash) {
        return {
          success: true,
          token: btoa(Date.now().toString()),
          userId: 'user_' + Date.now()
        }
      } else {
        return {
          success: false,
          message: 'Incorrect password'
        }
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary bg-opacity-10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-text_primary">
            Welcome to SelfDesk
          </h2>
          <p className="mt-2 text-sm text-text_secondary">
            Enter your password to continue
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Password Input */}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-border rounded-lg placeholder-text_tertiary text-text_primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-text_tertiary" />
                  ) : (
                    <Eye className="h-4 w-4 text-text_tertiary" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 text-danger text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {/* First Time Setup Notice */}
            {!localStorage.getItem('selfdesk_setup') && (
              <div className="bg-info bg-opacity-10 border border-info border-opacity-20 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-info" />
                  <p className="text-sm text-info">
                    First time setup! Your password will be set for future logins.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>

        {/* Settings Link */}
        {localStorage.getItem('selfdesk_setup') && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/settings')}
              className="flex items-center space-x-2 text-sm text-text_secondary hover:text-primary transition-colors mx-auto"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-text_tertiary">
          <p>SelfDesk - Your Personal Workspace</p>
        </div>
      </div>
    </div>
  )
}

export default Login
