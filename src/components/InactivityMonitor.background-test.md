# Background Tab Behavior - Manual Test Guide

This document provides instructions for manually testing the inactivity monitor's background tab behavior.

## Requirements Being Tested

- **Requirement 4.3**: WHEN the Application is in a background tab THEN the Application SHALL continue monitoring the Inactivity Period
- **Requirement 4.4**: WHEN a User returns to a background tab after the timeout period THEN the Application SHALL perform Automatic Sign-Out if the Inactivity Period has elapsed

## Test Setup

For faster testing, temporarily modify the configuration in `src/config/inactivity.js`:

```javascript
export const INACTIVITY_CONFIG = {
  WARNING_TIME_MINUTES: 1,  // 1 minute for testing
  SIGN_OUT_TIME_MINUTES: 2, // 2 minutes for testing
  ENABLED: true,
  CHECK_INTERVAL_MS: 1000,
  ACTIVITY_EVENTS: ['mousemove', 'keydown', 'click', 'touchstart', 'scroll']
};
```

## Test Scenarios

### Test 1: Background Tab Continues Monitoring

**Steps:**
1. Log in to the application
2. Navigate to any protected page (e.g., Dashboard)
3. Note the current time
4. Open a new tab or switch to another application (put the app in background)
5. Wait for 2 minutes without returning to the app tab
6. Switch back to the application tab

**Expected Result:**
- The application should immediately redirect to the login page with an inactivity message
- This proves the timer continued running in the background

**Why This Works:**
- The hook uses `Date.now()` timestamps, not interval counting
- When you return to the tab, the next interval check calculates: `Date.now() - lastActivityTime`
- If this exceeds the sign-out threshold, automatic sign-out occurs

### Test 2: Warning in Background Tab

**Steps:**
1. Log in to the application
2. Navigate to any protected page
3. Note the current time
4. Switch to another tab (put the app in background)
5. Wait for 1 minute (warning threshold)
6. Switch back to the application tab

**Expected Result:**
- The warning dialog should appear immediately when you return
- The countdown should show the remaining time until sign-out

### Test 3: Activity Before Background

**Steps:**
1. Log in to the application
2. Navigate to any protected page
3. Perform some activity (move mouse, click, type)
4. Immediately switch to another tab
5. Wait for 2 minutes
6. Switch back to the application tab

**Expected Result:**
- The application should redirect to login
- The timer started counting from your last activity, not from when you switched tabs

### Test 4: Multiple Tabs

**Steps:**
1. Log in to the application
2. Open the application in two browser tabs
3. In Tab 1: Navigate to Dashboard
4. In Tab 2: Navigate to Invoices
5. Leave both tabs inactive for 2 minutes
6. Return to Tab 1

**Expected Result:**
- Tab 1 should redirect to login
- Tab 2 (when you switch to it) should also redirect to login
- Each tab monitors independently

## Implementation Details

The background tab behavior works correctly because:

1. **Timestamp-Based Calculation**: The hook uses `Date.now()` to calculate elapsed time, not interval counting
   ```javascript
   const inactivityDuration = Date.now() - lastActivityRef.current;
   ```

2. **Immune to Throttling**: Even if browsers throttle `setInterval` in background tabs, the timestamp comparison remains accurate

3. **Immediate Check on Return**: When the user returns to the tab, the next interval check (within 1 second) will detect if the timeout has elapsed

4. **No Page Visibility API Needed**: The current implementation doesn't need the Page Visibility API because timestamp comparison handles background tabs correctly

## Troubleshooting

If the tests don't work as expected:

1. **Check Configuration**: Ensure `ENABLED: true` in the config
2. **Check Authentication**: Ensure you're logged in (monitoring only works for authenticated users)
3. **Check Browser Console**: Look for any errors in the console
4. **Check Local Storage**: Verify authentication tokens are present

## Restoring Production Settings

After testing, restore the production settings in `src/config/inactivity.js`:

```javascript
export const INACTIVITY_CONFIG = {
  WARNING_TIME_MINUTES: 50,
  SIGN_OUT_TIME_MINUTES: 60,
  ENABLED: true,
  CHECK_INTERVAL_MS: 1000,
  ACTIVITY_EVENTS: ['mousemove', 'keydown', 'click', 'touchstart', 'scroll']
};
```
