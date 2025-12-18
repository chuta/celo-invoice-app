# ⚠️ RESTORE PRODUCTION TIMEOUTS

## Current Status: TESTING MODE

The inactivity timeouts are currently set to **TESTING VALUES** for quick testing:
- Warning: 1 minute
- Sign-out: 2 minutes

## Before Production Deployment

**YOU MUST restore the production values in `src/config/inactivity.js`:**

```javascript
export const INACTIVITY_CONFIG = {
  // Restore production values:
  WARNING_TIME_MINUTES: 50,      // Change from 1 to 50
  SIGN_OUT_TIME_MINUTES: 60,     // Change from 2 to 60
  
  ENABLED: true,
  CHECK_INTERVAL_MS: 1000,
  ACTIVITY_EVENTS: [
    'mousemove',
    'keydown',
    'click',
    'touchstart',
    'scroll'
  ]
};
```

## Quick Restore Command

Run this to restore production values:

```bash
cd celo-invoice-app
# Edit src/config/inactivity.js and change:
# WARNING_TIME_MINUTES: 1 → 50
# SIGN_OUT_TIME_MINUTES: 2 → 60

git add src/config/inactivity.js
git commit -m "chore: restore production inactivity timeouts (50min/60min)"
git push origin main
```

## Why This Matters

With 1-minute timeouts in production:
- Users would get warning dialogs after just 1 minute of reading
- Users would be signed out after 2 minutes of inactivity
- This would create a poor user experience

Production values (50/60 minutes) provide:
- Reasonable security (1 hour timeout)
- Good user experience (users can read/think without interruption)
- Industry-standard session timeout duration

---

**DELETE THIS FILE** after restoring production values.
