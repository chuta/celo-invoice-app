import { useEffect, useState } from 'react'

export default function CeloPriceWidget() {
  const [priceData, setPriceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCeloPrice()
    // Refresh price every 60 seconds
    const interval = setInterval(fetchCeloPrice, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchCeloPrice = async () => {
    try {
      // Use Supabase Edge Function to avoid CORS issues
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const response = await fetch(
        `${supabaseUrl}/functions/v1/get-celo-price`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      
      if (!response.ok) throw new Error('Failed to fetch price')
      
      const data = await response.json()
      
      if (data.celo) {
        setPriceData({
          price: data.celo.usd,
          change24h: data.celo.usd_24h_change,
          volume24h: data.celo.usd_24h_vol,
          marketCap: data.celo.usd_market_cap,
        })
        setError(null)
      }
    } catch (err) {
      console.error('Error fetching CELO price:', err)
      setError('Unable to fetch price')
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
    return `$${num.toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="card p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-xl sm:text-2xl">🪙</span>
          </div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-xl sm:text-2xl">🪙</span>
          </div>
          <div className="flex-1">
            <p className="text-xs sm:text-sm text-gray-600">CELO Price</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  const isPositive = priceData.change24h >= 0

  return (
    <div className="card p-4 sm:p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xl sm:text-2xl">🪙</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-gray-600 mb-1">CELO Price</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                ${priceData.price.toFixed(4)}
              </p>
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                isPositive 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                <span>{isPositive ? '↑' : '↓'}</span>
                <span>{Math.abs(priceData.change24h).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <a
          href="https://www.coingecko.com/en/coins/celo"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-primary-600 transition-colors flex-shrink-0"
          title="View on CoinGecko"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      {/* Additional Stats */}
      <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-gray-500 mb-1">24h Volume</p>
          <p className="font-semibold text-gray-900">{formatNumber(priceData.volume24h)}</p>
        </div>
        <div>
          <p className="text-gray-500 mb-1">Market Cap</p>
          <p className="font-semibold text-gray-900">{formatNumber(priceData.marketCap)}</p>
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-3 text-xs text-gray-400 text-center">
        Updates every 60 seconds
      </div>
    </div>
  )
}
