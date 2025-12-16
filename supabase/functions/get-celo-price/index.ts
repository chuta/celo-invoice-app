// Supabase Edge Function to proxy CoinGecko API requests
// This avoids CORS issues when calling from the browser

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price'

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    // Fetch CELO price from CoinGecko
    const response = await fetch(
      `${COINGECKO_API}?ids=celo&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60', // Cache for 60 seconds
      },
    })
  } catch (error) {
    console.error('Error fetching CELO price:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch CELO price',
        message: error.message 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})
