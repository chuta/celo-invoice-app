// Netlify Function to proxy CoinGecko API requests
// This avoids CORS issues when calling from the browser

exports.handler = async function(event, context) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
      body: '',
    }
  }

  try {
    // Fetch CELO price from CoinGecko
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=celo&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true',
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CeloAfricaDAO-Invoice-App',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60', // Cache for 60 seconds
      },
      body: JSON.stringify(data),
    }
  } catch (error) {
    console.error('Error fetching CELO price:', error)
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Failed to fetch CELO price',
        message: error.message 
      }),
    }
  }
}
