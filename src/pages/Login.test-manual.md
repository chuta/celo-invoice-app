# Manual Test Guide for Login Page Inactivity Features

## Test Case 1: Inactivity Message Display

**Objective:** Verify that the inactivity message is displayed when user is redirected after session timeout.

**Steps:**
1. Navigate to `/login?reason=inactivity` in the browser
2. Observe the page

**Expected Result:**
- A blue information banner should appear above the login form
- The banner should display: "Your session has ended due to inactivity. Please sign in again to continue."
- The banner should have a clock emoji (⏱️) icon
- The message should automatically disappear after 10 seconds

**Requirements Validated:** 3.4

---

## Test Case 2: Post-Login Redirect

**Objective:** Verify that users are redirected to their previous page after logging in following an inactivity timeout.

**Steps:**
1. Log in to the application
2. Navigate to a specific page (e.g., `/invoices`)
3. Wait for inactivity timeout (or manually trigger by navigating to `/login?reason=inactivity`)
4. Observe that `sessionStorage` contains `redirectAfterLogin` with value `/invoices`
5. Log in again with valid credentials
6. Observe the navigation

**Expected Result:**
- After successful login, user should be redirected to `/invoices` (the page they were on before timeout)
- The `redirectAfterLogin` item should be removed from `sessionStorage`
- If no redirect path is stored, user should be redirected to `/dashboard` (default behavior)

**Requirements Validated:** 3.5

---

## Test Case 3: Normal Login Flow (No Inactivity)

**Objective:** Verify that normal login flow is not affected by the new features.

**Steps:**
1. Navigate to `/login` (without query parameters)
2. Enter valid credentials
3. Submit the form

**Expected Result:**
- No inactivity message should be displayed
- User should be redirected to `/dashboard` (default)
- Login process should work normally

---

## Test Case 4: Error Handling

**Objective:** Verify that error messages and inactivity messages can coexist.

**Steps:**
1. Navigate to `/login?reason=inactivity`
2. Enter invalid credentials
3. Submit the form

**Expected Result:**
- Both the inactivity message (blue banner) and error message (red banner) should be visible
- The inactivity message should be above the error message
- Both messages should be clearly distinguishable

---

## Integration Test with InactivityMonitor

**Objective:** Verify end-to-end flow from timeout to redirect.

**Steps:**
1. Log in to the application
2. Navigate to `/invoices` page
3. Trigger inactivity timeout (wait for configured timeout or use browser dev tools to simulate)
4. Observe automatic sign-out
5. Verify redirect to `/login?reason=inactivity`
6. Verify inactivity message is displayed
7. Log in again
8. Verify redirect back to `/invoices`

**Expected Result:**
- Complete flow should work seamlessly
- User should see the inactivity message
- User should be returned to their previous page after login

**Requirements Validated:** 3.1, 3.2, 3.3, 3.4, 3.5

---

## Browser DevTools Verification

**Check sessionStorage:**
```javascript
// Before timeout (while on /invoices page)
sessionStorage.getItem('redirectAfterLogin') // Should be null

// After timeout (on login page)
sessionStorage.getItem('redirectAfterLogin') // Should be '/invoices'

// After successful login
sessionStorage.getItem('redirectAfterLogin') // Should be null (cleaned up)
```

**Check URL parameters:**
```javascript
// On login page after timeout
window.location.search // Should include '?reason=inactivity'
```
