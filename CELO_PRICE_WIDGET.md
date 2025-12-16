# CELO Price Widget

## Overview
Real-time CELO price display on the dashboard using CoinGecko's free API.

## Features

### Live Price Data
- ✅ Current CELO price in USD
- ✅ 24-hour price change percentage
- ✅ 24-hour trading volume
- ✅ Market capitalization
- ✅ Auto-refresh every 60 seconds
- ✅ Visual indicators (green for up, red for down)

### User Experience
- Responsive design (mobile & desktop)
- Loading state with skeleton animation
- Error handling with fallback display
- Link to CoinGecko for detailed charts
- Compact card design that fits dashboard layout

## Implementation

### Component: `CeloPriceWidget.jsx`
Located at: `src/components/CeloPriceWidget.jsx`

**Key Features:**
- Fetches data from CoinGecko API
- Auto-refreshes every 60 seconds
- Formats large numbers (K, M, B)
- Shows price change with color coding
- Displays volume and market cap
- Links to CoinGecko for more details

### API Endpoint
```
https://api.coingecko.com/api/v3/simple/price?ids=celo&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true
```

**Response Format:**
```json
{
  "celo": {
    "usd": 0.6234,
    "usd_24h_change": 2.45,
    "usd_24h_vol": 12500000,
    "usd_market_cap": 450000000
  }
}
```

## Usage

### Dashboard Integration
The widget is automatically displayed at the top of the dashboard, right after the welcome message and before the stats cards.

```jsx
import CeloPriceWidget from '../components/CeloPriceWidget'

// In Dashboard component
<CeloPriceWidget />
```

### Standalone Usage
Can be used in any page:

```jsx
import CeloPriceWidget from '../components/CeloPriceWidget'

function MyPage() {
  return (
    <div>
      <CeloPriceWidget />
    </div>
  )
}
```

## Display Information

### Main Display
- **CELO Price:** Current price in USD (4 decimal places)
- **24h Change:** Percentage change with up/down arrow
- **Color Coding:** Green for positive, red for negative

### Additional Stats
- **24h Volume:** Trading volume in last 24 hours
- **Market Cap:** Total market capitalization
- **Format:** Abbreviated (K, M, B) for readability

### Interactive Elements
- **External Link:** Click icon to view on CoinGecko
- **Auto-refresh:** Updates every 60 seconds
- **Hover Effect:** Card shadow on hover

## States

### Loading State
Shows skeleton animation while fetching data:
- Animated coin icon
- Placeholder bars for text

### Error State
Displays error message if API fails:
- Static coin icon
- Error message text
- Maintains card layout

### Success State
Shows full price information:
- Live price data
- Change indicator
- Volume and market cap
- Last updated timestamp

## Styling

### Responsive Design
- **Mobile:** Compact layout, smaller text
- **Desktop:** Full layout with all details
- **Breakpoints:** Uses Tailwind's sm: and lg: prefixes

### Color Scheme
- **Positive Change:** Green (bg-green-100, text-green-700)
- **Negative Change:** Red (bg-red-100, text-red-700)
- **Neutral:** Gray tones for text and backgrounds
- **Primary:** Primary color for icon background

## API Considerations

### Rate Limits
CoinGecko free API limits:
- 10-50 calls/minute (depending on plan)
- Our implementation: 1 call/minute per user
- No API key required for basic usage

### Caching
- Data refreshes every 60 seconds
- Reduces API calls
- Provides near real-time updates

### Error Handling
- Network errors caught and displayed
- Doesn't break dashboard if API fails
- Graceful degradation

## Future Enhancements

### Potential Additions
- [ ] Historical price chart (7d, 30d)
- [ ] Price alerts/notifications
- [ ] Multiple currency support (EUR, GBP, etc.)
- [ ] cUSD price display
- [ ] Price conversion calculator
- [ ] Sparkline mini-chart
- [ ] More detailed statistics

### Advanced Features
- [ ] WebSocket for real-time updates
- [ ] Local storage caching
- [ ] Offline mode with last known price
- [ ] Price history tracking
- [ ] Custom refresh intervals

## Testing

### Manual Testing
1. Load dashboard
2. Verify price displays correctly
3. Check 24h change indicator
4. Confirm auto-refresh works
5. Test external link to CoinGecko
6. Verify responsive design on mobile

### Error Testing
1. Disconnect internet
2. Verify error state displays
3. Reconnect and verify recovery
4. Check console for errors

## Troubleshooting

### Price Not Displaying
**Issue:** Widget shows loading state indefinitely
**Solution:** 
- Check browser console for errors
- Verify internet connection
- Check CoinGecko API status
- Clear browser cache

### Incorrect Price
**Issue:** Price seems outdated or wrong
**Solution:**
- Wait for next auto-refresh (60 seconds)
- Manually refresh page
- Compare with CoinGecko website

### Layout Issues
**Issue:** Widget doesn't fit properly
**Solution:**
- Check responsive breakpoints
- Verify Tailwind classes
- Test on different screen sizes

## Resources

- **CoinGecko API Docs:** https://www.coingecko.com/en/api
- **CELO on CoinGecko:** https://www.coingecko.com/en/coins/celo
- **Component Location:** `src/components/CeloPriceWidget.jsx`
- **Dashboard Integration:** `src/pages/Dashboard.jsx`

## Notes

- No API key required for basic usage
- Free tier is sufficient for this use case
- Updates are near real-time (60-second intervals)
- Widget is fully responsive and mobile-friendly
- Gracefully handles API failures
- Links to CoinGecko for detailed information

---

**Status:** ✅ Implemented and Ready
**Version:** 1.0
**Last Updated:** December 2025
