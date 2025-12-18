import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getValidatedConfig, 
  minutesToMs, 
  getWarningDurationSeconds,
  INACTIVITY_CONFIG 
} from '../config/inactivity';

/**
 * Custom hook for monitoring user inactivity and managing session timeouts
 * 
 * This hook tracks user activity events, displays warnings before timeout,
 * and triggers automatic sign-out after prolonged inactivity.
 * 
 * @param {Object} config - Configuration object for inactivity monitoring
 * @param {number} config.warningTimeMinutes - Minutes before showing warning (default: 50)
 * @param {number} config.signOutTimeMinutes - Minutes before automatic sign-out (default: 60)
 * @param {Function} signOut - Function to call for signing out the user
 * @returns {Object} Hook state and methods
 */
export const useInactivityMonitor = (config = {}, signOut) => {
  // Validate and merge configuration with defaults
  const validatedConfig = getValidatedConfig({
    WARNING_TIME_MINUTES: config.warningTimeMinutes || INACTIVITY_CONFIG.WARNING_TIME_MINUTES,
    SIGN_OUT_TIME_MINUTES: config.signOutTimeMinutes || INACTIVITY_CONFIG.SIGN_OUT_TIME_MINUTES,
    ENABLED: config.enabled !== undefined ? config.enabled : INACTIVITY_CONFIG.ENABLED,
    CHECK_INTERVAL_MS: config.checkIntervalMs || INACTIVITY_CONFIG.CHECK_INTERVAL_MS,
    ACTIVITY_EVENTS: config.activityEvents || INACTIVITY_CONFIG.ACTIVITY_EVENTS
  });

  // State management
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(getWarningDurationSeconds());
  
  // Refs for managing intervals and preventing stale closures
  const lastActivityRef = useRef(lastActivityTime);
  const warningShownRef = useRef(false);
  const checkIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  
  const navigate = useNavigate();

  // Convert config times to milliseconds
  const warningTimeMs = minutesToMs(validatedConfig.WARNING_TIME_MINUTES);
  const signOutTimeMs = minutesToMs(validatedConfig.SIGN_OUT_TIME_MINUTES);

  /**
   * Reset the inactivity timer to current time
   * Requirements: 2.4, 6.5
   */
  const resetTimer = useCallback(() => {
    const now = Date.now();
    setLastActivityTime(now);
    lastActivityRef.current = now;
    
    // Close warning dialog if open
    if (showWarning) {
      setShowWarning(false);
      warningShownRef.current = false;
    }
    
    // Reset countdown
    setRemainingSeconds(getWarningDurationSeconds());
  }, [showWarning]);

  /**
   * Extend the session (same as reset timer, called from "Stay Logged In" button)
   * Requirements: 2.4, 6.5
   */
  const extendSession = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  /**
   * Sign out immediately (called from "Sign Out Now" button)
   * Requirements: 2.5, 3.4
   */
  const signOutNow = useCallback(async () => {
    try {
      // Store current path for post-login redirect
      const currentPath = window.location.pathname;
      sessionStorage.setItem('redirectAfterLogin', currentPath);
      
      // Clear authentication tokens from local storage
      localStorage.removeItem('supabase.auth.token');
      
      // Call the sign-out function
      await signOut();
      
      // Navigate to login with inactivity message
      navigate('/login?reason=inactivity', { replace: true });
    } catch (error) {
      console.error('Error during manual sign-out:', error);
      // Even if sign-out fails, redirect to login
      navigate('/login?reason=inactivity', { replace: true });
    }
  }, [signOut, navigate]);

  /**
   * Perform automatic sign-out when timeout is reached
   * Requirements: 3.1, 3.2, 3.3, 3.5
   */
  const performAutoSignOut = useCallback(async () => {
    try {
      // Store current path for post-login redirect
      const currentPath = window.location.pathname;
      sessionStorage.setItem('redirectAfterLogin', currentPath);
      
      // Clear authentication tokens from local storage
      localStorage.removeItem('supabase.auth.token');
      
      // Call the sign-out function
      await signOut();
      
      // Navigate to login with inactivity message
      navigate('/login?reason=inactivity', { replace: true });
    } catch (error) {
      console.error('Error during automatic sign-out:', error);
      // Even if sign-out fails, redirect to login
      navigate('/login?reason=inactivity', { replace: true });
    }
  }, [signOut, navigate]);

  /**
   * Throttled activity handler to update last activity time
   * Requirements: 1.1, 1.2, 1.3, 1.5
   */
  const handleActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  /**
   * Set up activity event listeners
   * Requirements: 1.1, 1.2, 1.3, 1.5
   */
  useEffect(() => {
    if (!validatedConfig.ENABLED) return;

    // Throttle activity events to avoid excessive updates
    let throttleTimeout = null;
    const throttledHandler = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          handleActivity();
          throttleTimeout = null;
        }, 500); // 500ms throttle
      }
    };

    // Add event listeners for all activity events
    validatedConfig.ACTIVITY_EVENTS.forEach(eventType => {
      window.addEventListener(eventType, throttledHandler, { passive: true });
    });

    // Cleanup function to remove event listeners
    return () => {
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
      validatedConfig.ACTIVITY_EVENTS.forEach(eventType => {
        window.removeEventListener(eventType, throttledHandler);
      });
    };
  }, [validatedConfig.ENABLED, validatedConfig.ACTIVITY_EVENTS, handleActivity]);

  /**
   * Monitor inactivity and trigger warnings/sign-out
   * Requirements: 1.4, 2.1, 2.2, 6.2, 6.4, 3.1, 3.2, 3.3, 3.5, 4.3, 4.4
   * 
   * Background tab behavior (Requirements 4.3, 4.4):
   * - Uses timestamp comparison (Date.now()) instead of interval counting
   * - This makes the timer immune to browser tab suspension/throttling
   * - When user returns to an inactive background tab, the next interval check
   *   will calculate the correct elapsed time and trigger sign-out if needed
   */
  useEffect(() => {
    if (!validatedConfig.ENABLED) return;

    // Check inactivity every second
    // Note: Browsers may throttle this interval in background tabs, but that's okay
    // because we use timestamp comparison, not interval counting
    checkIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const inactivityDuration = now - lastActivityRef.current;

      // Check if we've reached the sign-out threshold
      if (inactivityDuration >= signOutTimeMs) {
        performAutoSignOut();
        return;
      }

      // Check if we've reached the warning threshold
      if (inactivityDuration >= warningTimeMs && !warningShownRef.current) {
        setShowWarning(true);
        warningShownRef.current = true;
        
        // Calculate initial remaining seconds
        const remaining = Math.ceil((signOutTimeMs - inactivityDuration) / 1000);
        setRemainingSeconds(remaining);
      }
    }, validatedConfig.CHECK_INTERVAL_MS);

    // Cleanup interval on unmount
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [validatedConfig.ENABLED, validatedConfig.CHECK_INTERVAL_MS, warningTimeMs, signOutTimeMs, performAutoSignOut]);

  /**
   * Update countdown timer when warning is shown
   * Requirements: 6.2, 6.3, 6.4
   */
  useEffect(() => {
    if (!showWarning) {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      return;
    }

    // Update countdown every second
    countdownIntervalRef.current = setInterval(() => {
      setRemainingSeconds(prev => {
        const newValue = prev - 1;
        
        // Trigger sign-out when countdown reaches zero
        if (newValue <= 0) {
          performAutoSignOut();
          return 0;
        }
        
        return newValue;
      });
    }, 1000);

    // Cleanup countdown interval
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [showWarning, performAutoSignOut]);

  return {
    showWarning,
    remainingSeconds,
    resetTimer,
    extendSession,
    signOutNow
  };
};

export default useInactivityMonitor;
