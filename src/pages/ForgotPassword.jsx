import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { resetPasswordForEmail } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      await resetPasswordForEmail(email)
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
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
              Password Recovery
            </h1>
            <p className="text-xl text-gray-800 leading-relaxed">
              Don't worry, it happens to the best of us. We'll help you get back into your account.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📧</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Check Your Email</h3>
                <p className="text-gray-800">We'll send you a secure link to reset your password</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🔒</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Secure Process</h3>
                <p className="text-gray-800">Your account security is our top priority</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Forgot Password Form */}
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
              Forgot your password?
            </h2>
            <p className="mt-2 text-gray-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {success ? (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h3 className="font-semibold mb-1">Check your email</h3>
                    <p className="text-sm">
                      We've sent a password reset link to <strong>{email}</strong>. 
                      Please check your inbox and follow the instructions.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
                <p>💡 <strong>Tip:</strong> If you don't see the email, check your spam folder.</p>
              </div>

              <div className="text-center pt-4">
                <Link 
                  to="/login" 
                  className="font-semibold text-[#35D07F] hover:text-[#2AB86F] transition-colors"
                >
                  ← Back to Sign in
                </Link>
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
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#35D07F] focus:border-transparent transition-all"
                    placeholder="you@example.com"
                  />
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
                        Sending...
                      </span>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </div>

                <div className="text-center pt-4">
                  <Link 
                    to="/login" 
                    className="font-semibold text-[#35D07F] hover:text-[#2AB86F] transition-colors"
                  >
                    ← Back to Sign in
                  </Link>
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
