import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validSession, setValidSession] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const { updatePassword } = useAuth()
  const navigate = useNavigate()

  // Check if user has a valid recovery session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        // Check if this is a recovery session
        if (session) {
          setValidSession(true)
        } else {
          setError('Invalid or expired reset link. Please request a new password reset.')
        }
      } catch (err) {
        setError('Failed to verify reset link. Please try again.')
      } finally {
        setCheckingSession(false)
      }
    }

    checkSession()

    // Listen for auth state changes (recovery link clicked)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setValidSession(true)
        setCheckingSession(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const validatePassword = () => {
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return false
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!validatePassword()) return

    setLoading(true)

    try {
      await updatePassword(password)
      setSuccess(true)
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      setError(err.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#35D07F] mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying reset link...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Section with Celo Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#FCFF52] via-[#FBCC5C] to-[#35D07F] relative overflow-hidden">
        <div className="absolute inset-0 bg-black/5"></div>
        
        {/* Decorative circles */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 py-12">
          <div className="mb-12">
            <img 
              src="/celologo.jpg" 
              alt="CeloAfricaDAO" 
              className="h-24 w-auto mb-8 rounded-lg shadow-lg"
            />
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Reset Password
            </h1>
            <p className="text-xl text-gray-800 leading-relaxed">
              Create a new secure password for your account
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🔐</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Strong Password</h3>
                <p className="text-gray-800">Use at least 8 characters with a mix of letters and numbers</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">✨</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Fresh Start</h3>
                <p className="text-gray-800">Your new password will be active immediately</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Reset Password Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-md w-full space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <img 
              src="/celologo.jpg" 
              alt="CeloAfricaDAO" 
              className="h-20 w-auto rounded-lg shadow-md"
            />
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Create new password
            </h2>
            <p className="mt-2 text-gray-600">
              Enter your new password below
            </p>
          </div>

          {success ? (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <h3 className="font-semibold mb-1">Password Reset Successful!</h3>
                    <p className="text-sm">
                      Your password has been updated. You'll be redirected to the login page shortly.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Link 
                  to="/login" 
                  className="inline-block bg-gradient-to-r from-[#35D07F] to-[#FBCC5C] hover:from-[#2AB86F] hover:to-[#F5C04C] text-gray-900 font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg"
                >
                  Go to Sign in
                </Link>
              </div>
            </div>
          ) : !validSession ? (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h3 className="font-semibold mb-1">Invalid Reset Link</h3>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-4">
                <Link 
                  to="/forgot-password" 
                  className="inline-block bg-gradient-to-r from-[#35D07F] to-[#FBCC5C] hover:from-[#2AB86F] hover:to-[#F5C04C] text-gray-900 font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg"
                >
                  Request New Reset Link
                </Link>
                <div>
                  <Link 
                    to="/login" 
                    className="font-semibold text-[#35D07F] hover:text-[#2AB86F] transition-colors"
                  >
                    ← Back to Sign in
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <span className="flex-1">{error}</span>
                </div>
              )}

              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-5">
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#35D07F] focus:border-transparent transition-all"
                      placeholder="••••••••"
                      minLength={8}
                    />
                    <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#35D07F] focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#35D07F] to-[#FBCC5C] hover:from-[#2AB86F] hover:to-[#F5C04C] text-gray-900 font-semibold py-3 px-4 rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Resetting...
                      </span>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          <div className="pt-6 border-t border-gray-200">
            <p className="text-center text-xs text-gray-500">
              Powered by Celo blockchain • Built by CeloAfricaDAO
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
