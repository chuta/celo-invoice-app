import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'

export default function Settings() {
  const { profile, updateProfile } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [walletAddress, setWalletAddress] = useState(profile?.wallet_address || '')
  const [isCkashWallet, setIsCkashWallet] = useState(profile?.is_ckash_wallet || false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      await updateProfile({
        full_name: fullName,
        wallet_address: walletAddress,
        is_ckash_wallet: isCkashWallet,
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            Profile updated successfully!
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={profile?.email || ''}
                disabled
                className="input-field bg-gray-50 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700 mb-1">
                cUSD Wallet Address
              </label>
              <input
                id="walletAddress"
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="input-field"
                placeholder="0x..."
              />
              <p className="text-xs text-gray-500 mt-1">
                This is where you'll receive invoice payments
              </p>
              
              {/* cKASH Wallet Checkbox */}
              <div className="mt-3 flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="isCkashWallet"
                    type="checkbox"
                    checked={isCkashWallet}
                    onChange={(e) => setIsCkashWallet(e.target.checked)}
                    className="w-4 h-4 text-[#35D07F] bg-gray-100 border-gray-300 rounded focus:ring-[#35D07F] focus:ring-2"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="isCkashWallet" className="text-sm font-medium text-gray-700 cursor-pointer">
                    This is a cKASH wallet address
                  </label>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Using{' '}
                    <a 
                      href="https://ckash.app/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#35D07F] hover:text-[#2AB86F] font-medium underline"
                    >
                      cKASH
                    </a>
                    {' '}helps support CeloAfricaDAO's payment infrastructure 💚
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
                {profile?.role === 'super_admin' ? '👑 Super Admin' : 
                 profile?.role === 'admin' ? '🔐 Admin' : '👤 User'}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}
