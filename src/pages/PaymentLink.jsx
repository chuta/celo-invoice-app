import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { QRCodeSVG } from 'qrcode.react'

export default function PaymentLink() {
  const { username } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [showShare, setShowShare] = useState(false)

  const [formData, setFormData] = useState({
    payer_name: '',
    payer_email: '',
    amount: '',
    description: '',
  })

  useEffect(() => {
    fetchProfile()
    trackView()
  }, [username])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      
      // Get public profile
      const { data, error } = await supabase
        .rpc('get_public_profile', { username_param: username })
        .single()

      if (error) throw error
      
      if (!data) {
        setError('Payment link not found or disabled')
        return
      }

      setProfile(data)
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError('Unable to load payment link')
    } finally {
      setLoading(false)
    }
  }

  const trackView = async () => {
    try {
      // Increment view count
      await supabase.rpc('increment_payment_link_view', { username_param: username })

      // Track analytics
      await supabase.from('payment_link_analytics').insert({
        user_id: profile?.id,
        event_type: 'view',
        event_data: { username, page: 'payment_link' },
      })
    } catch (err) {
      console.error('Error tracking view:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      // Validation
      if (!formData.payer_name || !formData.payer_email || !formData.amount) {
        throw new Error('Please fill in all required fields')
      }

      const amount = parseFloat(formData.amount)
      if (amount <= 0) {
        throw new Error('Amount must be greater than 0')
      }

      // Create public payment request
      const { data: paymentRequest, error: requestError } = await supabase
        .from('public_payment_requests')
        .insert({
          recipient_user_id: profile.id,
          payer_name: formData.payer_name,
          payer_email: formData.payer_email,
          amount: amount,
          description: formData.description,
          payment_link: username,
        })
        .select()
        .single()

      if (requestError) throw requestError

      // Track payment event
      await supabase.from('payment_link_analytics').insert({
        user_id: profile.id,
        event_type: 'payment',
        event_data: { 
          username, 
          amount,
          payer_email: formData.payer_email 
        },
      })

      // Increment payment count
      await supabase.rpc('increment_payment_link_payment', { username_param: username })

      // Show success message
      alert(`Payment request created! ${profile.full_name} will review and process your payment.`)
      
      // Reset form
      setFormData({
        payer_name: '',
        payer_email: '',
        amount: '',
        description: '',
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleShare = async (platform) => {
    const url = `${window.location.origin}/pay/${username}`
    const text = `Pay ${profile?.full_name} via CeloAfricaDAO Invoice`

    // Track share event
    await supabase.from('payment_link_analytics').insert({
      user_id: profile?.id,
      event_type: 'share',
      event_data: { username, platform },
    })

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      copy: url,
    }

    if (platform === 'copy') {
      navigator.clipboard.writeText(url)
      alert('Link copied to clipboard!')
    } else {
      window.open(shareUrls[platform], '_blank')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-green-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Link Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'This payment link is not available'}</p>
          <a href="/" className="btn-primary inline-block">
            Go to Homepage
          </a>
        </div>
      </div>
    )
  }

  const paymentUrl = `${window.location.origin}/pay/${username}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-green-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <a href="/" className="inline-block mb-4">
            <img 
              src="https://scarlet-basic-wolf-474.mypinata.cloud/ipfs/bafkreid6hqmetzb4khpt33fzofgwgigpa4sykzvdsdz74xm2n4rpmuptxq" 
              alt="CeloAfricaDAO" 
              className="h-12 mx-auto"
            />
          </a>
        </div>

        {/* Profile Card */}
        <div className="card mb-6">
          <div className="text-center">
            {profile.profile_image_url ? (
              <img
                src={profile.profile_image_url}
                alt={profile.full_name}
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-primary-100"
              />
            ) : (
              <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-primary-100 flex items-center justify-center text-3xl font-bold text-primary-600">
                {profile.full_name?.charAt(0) || '?'}
              </div>
            )}
            
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{profile.full_name}</h1>
            
            {profile.tagline && (
              <p className="text-gray-600 mb-3">{profile.tagline}</p>
            )}

            <div className="inline-flex items-center gap-2 text-sm text-gray-500 mb-4">
              <span>@{profile.username}</span>
              <span>•</span>
              <span>{profile.payment_link_views || 0} views</span>
            </div>

            {profile.bio && (
              <p className="text-gray-700 mb-4 max-w-md mx-auto">{profile.bio}</p>
            )}

            {/* Social Links */}
            {profile.social_links && Object.keys(profile.social_links).length > 0 && (
              <div className="flex justify-center gap-3 mb-4">
                {profile.social_links.twitter && (
                  <a
                    href={profile.social_links.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-primary-600"
                  >
                    🐦 Twitter
                  </a>
                )}
                {profile.social_links.linkedin && (
                  <a
                    href={profile.social_links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-primary-600"
                  >
                    💼 LinkedIn
                  </a>
                )}
                {profile.social_links.website && (
                  <a
                    href={profile.social_links.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-primary-600"
                  >
                    🌐 Website
                  </a>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setShowQR(!showQR)}
                className="btn-secondary text-sm"
              >
                {showQR ? 'Hide' : 'Show'} QR Code
              </button>
              <button
                onClick={() => setShowShare(!showShare)}
                className="btn-secondary text-sm"
              >
                Share Link
              </button>
            </div>

            {/* QR Code */}
            {showQR && (
              <div className="mt-4 p-4 bg-white rounded-lg inline-block">
                <QRCodeSVG
                  value={paymentUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
                <p className="text-xs text-gray-500 mt-2">Scan to pay</p>
              </div>
            )}

            {/* Share Options */}
            {showShare && (
              <div className="mt-4 flex justify-center gap-2 flex-wrap">
                <button
                  onClick={() => handleShare('twitter')}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                >
                  🐦 Twitter
                </button>
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                >
                  💬 WhatsApp
                </button>
                <button
                  onClick={() => handleShare('telegram')}
                  className="px-3 py-2 bg-blue-400 text-white rounded-lg text-sm hover:bg-blue-500"
                >
                  ✈️ Telegram
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="px-3 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700"
                >
                  📋 Copy Link
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Payment Form */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Create Payment Request</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={formData.payer_name}
                onChange={(e) => setFormData({ ...formData, payer_name: e.target.value })}
                className="input-field"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Email *
              </label>
              <input
                type="email"
                required
                value={formData.payer_email}
                onChange={(e) => setFormData({ ...formData, payer_email: e.target.value })}
                className="input-field"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (cUSD) *
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="input-field"
                placeholder="100.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows="3"
                placeholder="What is this payment for?"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary disabled:opacity-50"
            >
              {submitting ? 'Creating Request...' : 'Create Payment Request'}
            </button>

            <p className="text-xs text-gray-500 text-center">
              {profile.full_name} will review your request and process the payment
            </p>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>Powered by <a href="/" className="text-primary-600 hover:text-primary-700 font-medium">CeloAfricaDAO Invoice</a></p>
          <p className="mt-2">
            <a href="/register" className="text-primary-600 hover:text-primary-700">Create your own payment link</a>
          </p>
        </div>
      </div>
    </div>
  )
}
