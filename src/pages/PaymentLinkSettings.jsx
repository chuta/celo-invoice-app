import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { QRCodeSVG } from 'qrcode.react'
import Layout from '../components/Layout'

export default function PaymentLinkSettings() {
  const { user, profile, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [available, setAvailable] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showQR, setShowQR] = useState(false)

  const [formData, setFormData] = useState({
    username: profile?.username || '',
    public_profile: profile?.public_profile || false,
    payment_link_enabled: profile?.payment_link_enabled !== false,
    tagline: profile?.tagline || '',
    bio: profile?.bio || '',
    social_links: profile?.social_links || {},
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        public_profile: profile.public_profile || false,
        payment_link_enabled: profile.payment_link_enabled !== false,
        tagline: profile.tagline || '',
        bio: profile.bio || '',
        social_links: profile.social_links || {},
      })
    }
  }, [profile])

  const checkUsernameAvailability = async (username) => {
    if (!username || username.length < 3) {
      setAvailable(null)
      return
    }

    // Check format
    if (!/^[a-z0-9_-]{3,50}$/.test(username)) {
      setAvailable(false)
      setError('Username can only contain lowercase letters, numbers, hyphens, and underscores')
      return
    }

    setChecking(true)
    setError('')

    try {
      const { data, error } = await supabase
        .rpc('check_username_available', { username_to_check: username })

      if (error) throw error

      // If it's the current user's username, it's available
      if (username.toLowerCase() === profile?.username?.toLowerCase()) {
        setAvailable(true)
      } else {
        setAvailable(data)
        if (!data) {
          setError('Username is already taken')
        }
      }
    } catch (err) {
      console.error('Error checking username:', err)
      setError('Error checking username availability')
    } finally {
      setChecking(false)
    }
  }

  const handleUsernameChange = (value) => {
    const lowercase = value.toLowerCase()
    setFormData({ ...formData, username: lowercase })
    checkUsernameAvailability(lowercase)
  }

  const handleSave = async () => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Validation
      if (!formData.username) {
        throw new Error('Username is required')
      }

      if (formData.username.length < 3) {
        throw new Error('Username must be at least 3 characters')
      }

      if (!/^[a-z0-9_-]{3,50}$/.test(formData.username)) {
        throw new Error('Username can only contain lowercase letters, numbers, hyphens, and underscores')
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: formData.username.toLowerCase(),
          public_profile: formData.public_profile,
          payment_link_enabled: formData.payment_link_enabled,
          tagline: formData.tagline,
          bio: formData.bio,
          social_links: formData.social_links,
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setSuccess('Payment link settings saved successfully!')
      await refreshProfile()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/pay/${formData.username}`
    navigator.clipboard.writeText(url)
    setSuccess('Link copied to clipboard!')
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleDownloadQR = () => {
    const svg = document.getElementById('payment-qr-code')
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL('image/png')
      
      const downloadLink = document.createElement('a')
      downloadLink.download = `payment-link-${formData.username}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  const paymentUrl = formData.username 
    ? `${window.location.origin}/pay/${formData.username}`
    : ''

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Link Settings</h1>
          <p className="text-gray-600 mt-1">Configure your personalized payment link</p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Username */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Payment Link</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username *
                  </label>
                  <div className="flex gap-2">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      celo-invoice.app/pay/
                    </span>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      className="input-field rounded-l-none flex-1"
                      placeholder="yourname"
                      pattern="[a-z0-9_-]+"
                    />
                  </div>
                  
                  {checking && (
                    <p className="text-sm text-gray-500 mt-1">Checking availability...</p>
                  )}
                  
                  {available === true && formData.username && (
                    <p className="text-sm text-green-600 mt-1">✅ Available!</p>
                  )}
                  
                  {available === false && (
                    <p className="text-sm text-red-600 mt-1">❌ Username is taken</p>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-1">
                    3-50 characters. Lowercase letters, numbers, hyphens, and underscores only.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="public_profile"
                    checked={formData.public_profile}
                    onChange={(e) => setFormData({ ...formData, public_profile: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="public_profile" className="text-sm font-medium text-gray-700">
                    Make my profile public
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="payment_link_enabled"
                    checked={formData.payment_link_enabled}
                    onChange={(e) => setFormData({ ...formData, payment_link_enabled: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="payment_link_enabled" className="text-sm font-medium text-gray-700">
                    Enable payment link
                  </label>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="input-field"
                    placeholder="Web Developer & Designer"
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    A short description of what you do
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="input-field"
                    rows="4"
                    placeholder="Tell people about yourself and your services..."
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Twitter
                  </label>
                  <input
                    type="url"
                    value={formData.social_links.twitter || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      social_links: { ...formData.social_links, twitter: e.target.value }
                    })}
                    className="input-field"
                    placeholder="https://twitter.com/yourhandle"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    value={formData.social_links.linkedin || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      social_links: { ...formData.social_links, linkedin: e.target.value }
                    })}
                    className="input-field"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.social_links.website || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      social_links: { ...formData.social_links, website: e.target.value }
                    })}
                    className="input-field"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={loading || !available}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

          {/* Preview & Actions */}
          <div className="lg:col-span-1">
            <div className="card sticky top-8 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Preview & Share</h2>
              
              {formData.username && formData.public_profile && formData.payment_link_enabled ? (
                <>
                  <div className="bg-gray-50 p-3 rounded-lg break-all text-sm">
                    <a 
                      href={paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      {paymentUrl}
                    </a>
                  </div>

                  <button
                    onClick={handleCopyLink}
                    className="w-full btn-secondary"
                  >
                    📋 Copy Link
                  </button>

                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="w-full btn-secondary"
                  >
                    {showQR ? 'Hide' : 'Show'} QR Code
                  </button>

                  {showQR && (
                    <div className="text-center">
                      <div className="bg-white p-4 rounded-lg inline-block">
                        <QRCodeSVG
                          id="payment-qr-code"
                          value={paymentUrl}
                          size={200}
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                      <button
                        onClick={handleDownloadQR}
                        className="mt-2 text-sm text-primary-600 hover:text-primary-700"
                      >
                        Download QR Code
                      </button>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Stats</p>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Views:</span>
                        <span className="font-medium">{profile?.payment_link_views || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payments:</span>
                        <span className="font-medium">{profile?.payment_link_payments || 0}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">
                    {!formData.username && 'Set a username to enable your payment link'}
                    {formData.username && !formData.public_profile && 'Enable public profile to activate your payment link'}
                    {formData.username && formData.public_profile && !formData.payment_link_enabled && 'Enable payment link to start receiving payments'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
