# Implementation Plan

- [x] 1. Create configuration module for inactivity settings
  - Create centralized configuration file with timeout values and activity events
  - Export constants for warning time, sign-out time, check interval, and activity event types
  - _Requirements: 5.1, 5.3, 5.4_

- [x] 2. Implement useInactivityMonitor custom hook
  - [x] 2.1 Create hook structure with state management
    - Define state variables for lastActivityTime, showWarning, remainingSeconds
    - Implement configuration validation with default fallback values
    - _Requirements: 5.5_

  - [ ]* 2.2 Write property test for configuration validation
    - **Property 9: Configuration validation and defaults**
    - **Validates: Requirements 5.5**

  - [x] 2.3 Implement activity event tracking
    - Set up event listeners for mousemove, keydown, click, touchstart, scroll
    - Implement throttled activity handler to update lastActivityTime
    - Ensure event listeners are cleaned up on unmount
    - _Requirements: 1.1, 1.2, 1.3, 1.5_

  - [ ]* 2.4 Write property test for activity reset
    - **Property 1: Activity resets timer and updates timestamp**
    - **Validates: Requirements 1.1, 1.3, 1.5, 6.5**

  - [x] 2.5 Implement inactivity timer monitoring
    - Create interval to check elapsed time since last activity
    - Calculate inactivity period accurately using timestamps
    - _Requirements: 1.4_

  - [ ]* 2.6 Write property test for inactivity calculation
    - **Property 2: Inactivity period calculation accuracy**
    - **Validates: Requirements 1.4**

  - [x] 2.7 Implement warning threshold logic
    - Trigger warning dialog when inactivity reaches warning threshold
    - Calculate remaining seconds until sign-out
    - Update countdown every second
    - _Requirements: 2.1, 2.2, 6.2, 6.4_

  - [ ]* 2.8 Write property test for warning threshold
    - **Property 3: Warning threshold triggers dialog**
    - **Validates: Requirements 2.1**

  - [x] 2.9 Implement automatic sign-out logic
    - Trigger sign-out when inactivity reaches sign-out threshold
    - Integrate with AuthContext signOut method
    - Clear authentication tokens from local storage
    - Preserve previous page URL for post-login redirect
    - _Requirements: 3.1, 3.2, 3.3, 3.5_

  - [ ]* 2.10 Write property test for sign-out threshold
    - **Property 7: Automatic sign-out at timeout**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

  - [x] 2.11 Implement session extension functionality
    - Create resetTimer method to reset inactivity timer
    - Create extendSession method for "Stay Logged In" action
    - Ensure warning dialog closes when timer is reset
    - _Requirements: 2.4, 6.5_

  - [ ]* 2.12 Write property test for session extension
    - **Property 5: Session extension from warning**
    - **Validates: Requirements 2.4**

  - [x] 2.13 Implement manual sign-out from warning
    - Create signOutNow method for immediate sign-out
    - Redirect to login page with inactivity message
    - _Requirements: 2.5, 3.4_

  - [ ]* 2.14 Write property test for manual sign-out
    - **Property 6: Manual sign-out from warning**
    - **Validates: Requirements 2.5**

- [x] 3. Create InactivityWarningDialog component
  - [x] 3.1 Build modal dialog structure
    - Create modal overlay with proper z-index
    - Implement dialog container with warning icon and message
    - Add countdown timer display
    - Add "Stay Logged In" and "Sign Out Now" buttons
    - _Requirements: 2.2, 2.3, 6.1_

  - [ ]* 3.2 Write property test for dialog elements
    - **Property 4: Warning dialog contains required elements**
    - **Validates: Requirements 2.2, 2.3**

  - [x] 3.3 Implement countdown timer display
    - Format remaining seconds as MM:SS
    - Update display every second
    - Trigger sign-out when countdown reaches zero
    - _Requirements: 6.2, 6.3_

  - [ ]* 3.4 Write property test for countdown behavior
    - **Property 8: Countdown monotonic decrease**
    - **Validates: Requirements 6.2, 6.3, 6.4**

  - [x] 3.4 Add accessibility features
    - Implement keyboard navigation (Tab, Enter, Escape)
    - Add ARIA labels for screen readers
    - Trap focus within dialog when visible
    - Ensure high contrast mode compatibility
    - _Requirements: 6.1_

  - [x] 3.5 Style dialog for responsiveness
    - Make dialog mobile-friendly
    - Respect mobile safe areas
    - Ensure visibility on all screen sizes
    - _Requirements: 6.1_

- [x] 4. Create InactivityMonitor wrapper component
  - [x] 4.1 Implement wrapper component structure
    - Initialize useInactivityMonitor hook with configuration
    - Render InactivityWarningDialog with appropriate props
    - Pass through children components
    - _Requirements: 1.2_

  - [x] 4.2 Integrate with AuthContext
    - Access signOut method from AuthContext
    - Pass signOut to useInactivityMonitor hook
    - Handle sign-out errors gracefully
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 4.3 Write property test for configuration application
    - **Property 10: Configuration application**
    - **Validates: Requirements 5.2, 5.3, 5.4**

- [x] 5. Integrate InactivityMonitor into application
  - [x] 5.1 Add InactivityMonitor to App component
    - Wrap authenticated routes with InactivityMonitor
    - Ensure monitoring only occurs for authenticated users
    - Pass configuration from config module
    - _Requirements: 1.2, 4.1_

  - [x] 5.2 Test cross-page navigation
    - Verify timer state persists across page changes
    - Verify activity tracking continues on all pages
    - _Requirements: 4.1_

  - [ ]* 5.3 Write property test for cross-page persistence
    - **Property 11: Cross-page timer persistence**
    - **Validates: Requirements 4.1**

  - [x] 5.4 Handle background tab behavior
    - Verify monitoring continues in background tabs
    - Test sign-out occurs when returning to inactive tab
    - _Requirements: 4.3, 4.4_

- [x] 6. Add inactivity message to login page
  - [x] 6.1 Update login page to display inactivity message
    - Check for inactivity flag in URL params or state
    - Display user-friendly message about session timeout
    - Clear message after display
    - _Requirements: 3.4_

  - [x] 6.2 Implement post-login redirect
    - Store previous page URL before sign-out
    - Redirect to stored URL after successful login
    - _Requirements: 3.5_

- [ ] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

