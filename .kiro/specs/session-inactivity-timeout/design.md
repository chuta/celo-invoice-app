# Session Inactivity Timeout - Design Document

## Overview

The Session Inactivity Timeout feature enhances application security by automatically signing out users after a period of inactivity. The system monitors user interactions (mouse movements, keyboard input, clicks, and touch events) and displays a warning dialog before automatic sign-out occurs. This design integrates seamlessly with the existing React application structure and Supabase authentication system.

The feature consists of three main components:
1. An activity monitoring hook that tracks user interactions
2. A warning dialog component that alerts users before timeout
3. Integration with the AuthContext to handle automatic sign-out

## Architecture

### Component Architecture

```
App (Router)
  └── AuthProvider
        ├── InactivityMonitor (new)
        │     ├── Activity Tracking
        │     ├── Timer Management
        │     └── InactivityWarningDialog (new)
        └── Protected Routes
              └── Application Pages
```

### Data Flow

1. **Activity Detection**: User interactions trigger event listeners that update the last activity timestamp
2. **Timer Monitoring**: A background interval checks elapsed time since last activity
3. **Warning Phase**: At 50 minutes, the warning dialog appears with a countdown
4. **Sign-Out Phase**: At 60 minutes (or countdown expiration), automatic sign-out occurs
5. **Session Extension**: User interaction or "Stay Logged In" button resets the timer

### State Management

The inactivity monitoring state will be managed within a custom React hook and context:
- `lastActivityTime`: Timestamp of the last detected user activity
- `showWarning`: Boolean indicating if the warning dialog is visible
- `remainingTime`: Seconds remaining until automatic sign-out (used in warning dialog)

## Components and Interfaces

### 1. useInactivityMonitor Hook

A custom React hook that encapsulates all inactivity monitoring logic.

```javascript
interface InactivityConfig {
  warningTimeMinutes: number;  // Default: 50
  signOutTimeMinutes: number;  // Default: 60
  enabled: boolean;             // Default: true
}

interface InactivityMonitorReturn {
  showWarning: boolean;
  remainingSeconds: number;
  resetTimer: () => void;
  extendSession: () => void;
  signOutNow: () => void;
}

function useInactivityMonitor(config: InactivityConfig): InactivityMonitorReturn
```

**Responsibilities:**
- Track user activity events (mousemove, keydown, click, touchstart)
- Maintain last activity timestamp
- Calculate elapsed inactivity time
- Trigger warning dialog at configured threshold
- Trigger automatic sign-out at timeout
- Provide methods to reset timer and extend session

### 2. InactivityWarningDialog Component

A modal dialog that warns users of impending session termination.

```javascript
interface InactivityWarningDialogProps {
  isOpen: boolean;
  remainingSeconds: number;
  onStayLoggedIn: () => void;
  onSignOut: () => void;
}

function InactivityWarningDialog(props: InactivityWarningDialogProps): JSX.Element
```

**UI Elements:**
- Modal overlay (prevents interaction with background)
- Warning icon and message
- Countdown timer display (updates every second)
- "Stay Logged In" button (primary action)
- "Sign Out Now" button (secondary action)

### 3. InactivityMonitor Wrapper Component

A component that wraps the application and provides inactivity monitoring.

```javascript
interface InactivityMonitorProps {
  children: React.ReactNode;
  config?: Partial<InactivityConfig>;
}

function InactivityMonitor(props: InactivityMonitorProps): JSX.Element
```

**Responsibilities:**
- Initialize the useInactivityMonitor hook
- Render the InactivityWarningDialog
- Pass through children components
- Integrate with AuthContext for sign-out functionality

### 4. Configuration Module

A centralized configuration file for timeout settings.

```javascript
// src/config/inactivity.js
export const INACTIVITY_CONFIG = {
  WARNING_TIME_MINUTES: 50,
  SIGN_OUT_TIME_MINUTES: 60,
  ENABLED: true,
  CHECK_INTERVAL_MS: 1000, // Check every second
  ACTIVITY_EVENTS: ['mousemove', 'keydown', 'click', 'touchstart', 'scroll']
}
```

## Data Models

### Activity Timestamp

```javascript
{
  lastActivityTime: number, // Unix timestamp in milliseconds
  sessionStartTime: number  // Unix timestamp when session began
}
```

### Inactivity State

```javascript
{
  isActive: boolean,        // Whether monitoring is active
  showWarning: boolean,     // Whether warning dialog is visible
  remainingSeconds: number, // Seconds until sign-out (when warning shown)
  warningShownAt: number    // Timestamp when warning was first shown
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Activity resets timer and updates timestamp
*For any* authenticated session with active inactivity monitoring, when a user performs any activity event (mouse movement, keyboard input, click, or touch), the inactivity timer should be reset to zero, the last activity timestamp should be updated, and any visible warning dialog should be dismissed without requiring server communication.
**Validates: Requirements 1.1, 1.3, 1.5, 6.5**

### Property 2: Inactivity period calculation accuracy
*For any* authenticated session at any point in time, the calculated inactivity period should equal the current time minus the last activity timestamp.
**Validates: Requirements 1.4**

### Property 3: Warning threshold triggers dialog
*For any* authenticated session and any inactivity duration, the warning dialog should be displayed if and only if the inactivity duration is greater than or equal to the configured warning threshold and less than the sign-out threshold.
**Validates: Requirements 2.1**

### Property 4: Warning dialog contains required elements
*For any* displayed warning dialog, it should show the remaining time until automatic sign-out and provide both "Stay Logged In" and "Sign Out Now" action buttons.
**Validates: Requirements 2.2, 2.3**

### Property 5: Session extension from warning
*For any* authenticated session with a visible warning dialog, when the user clicks "Stay Logged In", the inactivity timer should be reset to zero and the warning dialog should be closed.
**Validates: Requirements 2.4**

### Property 6: Manual sign-out from warning
*For any* authenticated session with a visible warning dialog, when the user clicks "Sign Out Now", the session should be immediately terminated and the user should be redirected to the login page.
**Validates: Requirements 2.5**

### Property 7: Automatic sign-out at timeout
*For any* authenticated session and any inactivity duration, if the inactivity duration reaches or exceeds the configured sign-out threshold without user interaction, the system should perform automatic sign-out, clear all authentication tokens from local storage, redirect to the login page with an inactivity message, and preserve the previous page URL for post-login redirection.
**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

### Property 8: Countdown monotonic decrease
*For any* visible warning dialog with a countdown timer, the displayed countdown value should decrease by exactly 1 for each elapsed second, and when the countdown reaches zero, automatic sign-out should occur.
**Validates: Requirements 6.2, 6.3, 6.4**

### Property 9: Configuration validation and defaults
*For any* provided timeout configuration values, if the warning time is greater than or equal to the sign-out time, or if any values are negative or non-numeric, the system should use default values of 50 minutes for warning and 60 minutes for sign-out.
**Validates: Requirements 5.5**

### Property 10: Configuration application
*For any* valid timeout configuration values provided, the system should apply those values and trigger warnings and sign-outs at the configured thresholds.
**Validates: Requirements 5.2, 5.3, 5.4**

### Property 11: Cross-page timer persistence
*For any* authenticated session, when a user navigates between different pages within the application, the inactivity timer state (last activity timestamp and elapsed time) should be maintained and continue counting from the same point.
**Validates: Requirements 4.1**

## Error Handling

### Invalid Configuration
- **Error**: Invalid timeout values provided (negative, non-numeric, warning >= sign-out)
- **Handling**: Log warning to console, use default values (50/60 minutes)
- **User Impact**: None, system continues with safe defaults

### Sign-Out Failure
- **Error**: Supabase sign-out API call fails
- **Handling**: Clear local authentication state anyway, redirect to login, log error
- **User Impact**: User is redirected to login but may need to clear browser cache if tokens persist

### Timer Drift
- **Error**: System clock changes or browser tab suspended causing timer inaccuracy
- **Handling**: Use timestamp comparison instead of interval counting, recalculate on each check
- **User Impact**: None, system remains accurate regardless of tab state

### Event Listener Cleanup
- **Error**: Component unmounts without removing event listeners
- **Handling**: Use React useEffect cleanup functions to remove all listeners
- **User Impact**: None, prevents memory leaks

### Multiple Tabs
- **Error**: User has multiple tabs open, each with independent timers
- **Handling**: Each tab monitors independently (by design), sign-out in one tab doesn't affect others
- **User Impact**: User may be signed out in one tab while still active in another (acceptable behavior)

## Testing Strategy

### Unit Tests

Unit tests will verify specific behaviors and edge cases:

1. **Timer Reset on Activity**
   - Test that activity events reset the timer
   - Test that timer resets when warning is visible
   - Test multiple rapid activity events

2. **Warning Dialog Display**
   - Test warning appears at correct threshold
   - Test warning props are passed correctly
   - Test warning dismisses on activity

3. **Configuration Handling**
   - Test default values are used
   - Test custom configuration is applied
   - Test invalid configuration falls back to defaults

4. **Sign-Out Behavior**
   - Test automatic sign-out is called at timeout
   - Test manual sign-out from warning dialog
   - Test authentication state is cleared

### Property-Based Tests

Property-based tests will verify universal behaviors across many inputs using the **fast-check** library for JavaScript/React:

1. **Property 1: Activity resets timer**
   - Generate random activity events and timestamps
   - Verify timer always resets to zero after activity
   - Verify warning dialog closes on activity

2. **Property 2: Warning threshold accuracy**
   - Generate random inactivity durations
   - Verify warning appears only when duration >= warning threshold
   - Verify warning doesn't appear before threshold

3. **Property 3: Sign-out threshold accuracy**
   - Generate random inactivity durations
   - Verify sign-out occurs only when duration >= sign-out threshold
   - Verify sign-out doesn't occur before threshold

4. **Property 4: Countdown consistency**
   - Generate random starting countdown values
   - Verify countdown decreases monotonically
   - Verify sign-out occurs when countdown reaches zero

5. **Property 5: Configuration validation**
   - Generate random configuration values (valid and invalid)
   - Verify system always operates with valid configuration
   - Verify invalid configs result in defaults

### Integration Tests

Integration tests will verify the feature works within the full application context:

1. Test inactivity monitoring across page navigation
2. Test integration with AuthContext sign-out
3. Test warning dialog interaction with other UI elements
4. Test behavior when user returns to inactive tab

### Manual Testing Scenarios

For time-based features, manual testing with reduced timeouts is essential:

1. Set warning to 1 minute, sign-out to 2 minutes for testing
2. Verify warning appears after 1 minute of inactivity
3. Verify countdown is accurate
4. Verify "Stay Logged In" extends session
5. Verify automatic sign-out after 2 minutes
6. Verify activity during warning dismisses dialog
7. Test across different pages and user roles

## Implementation Notes

### Performance Considerations

1. **Event Throttling**: Activity events (especially mousemove) should be throttled to avoid excessive state updates. Use a debounce of 500ms for activity detection.

2. **Timer Efficiency**: Use a single setInterval for checking elapsed time rather than multiple timers. Check interval: 1 second.

3. **Memory Management**: Ensure all event listeners are properly cleaned up when components unmount to prevent memory leaks.

### Browser Compatibility

1. **Timestamp API**: Use `Date.now()` for timestamp generation (widely supported)
2. **Local Storage**: Use localStorage for persisting last activity time (optional enhancement)
3. **Visibility API**: Consider using Page Visibility API to pause monitoring when tab is hidden (optional enhancement)

### Security Considerations

1. **Client-Side Only**: This is a client-side security feature. Server-side session management should also be implemented for complete security.

2. **Token Expiration**: Coordinate with Supabase token expiration settings to ensure consistency.

3. **No Sensitive Data**: Don't log or store sensitive information in activity tracking.

### Accessibility

1. **Keyboard Navigation**: Warning dialog must be fully keyboard accessible
2. **Screen Readers**: Use ARIA labels for warning dialog and countdown
3. **Focus Management**: Trap focus within warning dialog when visible
4. **High Contrast**: Ensure warning dialog is visible in high contrast mode

### Mobile Considerations

1. **Touch Events**: Include touchstart and touchmove in activity events
2. **Background Tabs**: Mobile browsers may suspend background tabs, affecting timers
3. **Screen Size**: Warning dialog should be responsive and mobile-friendly
4. **Safe Areas**: Respect mobile safe areas (notches, home indicators)
