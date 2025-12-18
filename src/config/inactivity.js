/**
 * Session Inactivity Timeout Configuration
 * 
 * This module provides centralized configuration for the session inactivity
 * timeout feature. All timeout values and activity event types are defined here
 * to allow easy adjustment without code changes.
 * 
 * Requirements: 5.1, 5.3, 5.4
 */

/**
 * Default inactivity timeout configuration
 * 
 * @constant {Object} INACTIVITY_CONFIG
 * @property {number} WARNING_TIME_MINUTES - Minutes of inactivity before showing warning dialog (default: 50)
 * @property {number} SIGN_OUT_TIME_MINUTES - Minutes of inactivity before automatic sign-out (default: 60)
 * @property {boolean} ENABLED - Whether inactivity monitoring is enabled (default: true)
 * @property {number} CHECK_INTERVAL_MS - Milliseconds between inactivity checks (default: 1000)
 * @property {string[]} ACTIVITY_EVENTS - DOM events that count as user activity
 */
export const INACTIVITY_CONFIG = {
  // ⚠️ TESTING CONFIGURATION - REDUCED TIMEOUTS FOR QUICK TESTING
  // Warning threshold: Show warning dialog after 1 minute of inactivity (TESTING: normally 50)
  WARNING_TIME_MINUTES: 1,
  
  // Sign-out threshold: Automatically sign out after 2 minutes of inactivity (TESTING: normally 60)
  SIGN_OUT_TIME_MINUTES: 2,
  
  // Enable/disable inactivity monitoring
  ENABLED: true,
  
  // Check interval: How often to check for inactivity (in milliseconds)
  CHECK_INTERVAL_MS: 1000,
  
  // Activity events: DOM events that reset the inactivity timer
  ACTIVITY_EVENTS: [
    'mousemove',   // Mouse movement
    'keydown',     // Keyboard input
    'click',       // Mouse clicks
    'touchstart',  // Touch events (mobile)
    'scroll'       // Scrolling
  ]
};

/**
 * Convert minutes to milliseconds
 * 
 * @param {number} minutes - Time in minutes
 * @returns {number} Time in milliseconds
 */
export const minutesToMs = (minutes) => minutes * 60 * 1000;

/**
 * Convert milliseconds to minutes
 * 
 * @param {number} ms - Time in milliseconds
 * @returns {number} Time in minutes
 */
export const msToMinutes = (ms) => ms / 60 / 1000;

/**
 * Get warning time in milliseconds
 * 
 * @returns {number} Warning threshold in milliseconds
 */
export const getWarningTimeMs = () => minutesToMs(INACTIVITY_CONFIG.WARNING_TIME_MINUTES);

/**
 * Get sign-out time in milliseconds
 * 
 * @returns {number} Sign-out threshold in milliseconds
 */
export const getSignOutTimeMs = () => minutesToMs(INACTIVITY_CONFIG.SIGN_OUT_TIME_MINUTES);

/**
 * Get the time between warning and sign-out in milliseconds
 * 
 * @returns {number} Warning duration in milliseconds
 */
export const getWarningDurationMs = () => {
  return getSignOutTimeMs() - getWarningTimeMs();
};

/**
 * Get the time between warning and sign-out in seconds
 * 
 * @returns {number} Warning duration in seconds
 */
export const getWarningDurationSeconds = () => {
  return Math.floor(getWarningDurationMs() / 1000);
};

/**
 * Validate configuration values
 * Returns true if configuration is valid, false otherwise
 * 
 * @param {Object} config - Configuration object to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const validateConfig = (config) => {
  // Check if warning time is a positive number
  if (typeof config.WARNING_TIME_MINUTES !== 'number' || config.WARNING_TIME_MINUTES <= 0) {
    return false;
  }
  
  // Check if sign-out time is a positive number
  if (typeof config.SIGN_OUT_TIME_MINUTES !== 'number' || config.SIGN_OUT_TIME_MINUTES <= 0) {
    return false;
  }
  
  // Check if warning time is less than sign-out time
  if (config.WARNING_TIME_MINUTES >= config.SIGN_OUT_TIME_MINUTES) {
    return false;
  }
  
  return true;
};

/**
 * Get configuration with defaults for invalid values
 * If provided config is invalid, returns default configuration
 * 
 * @param {Object} customConfig - Custom configuration object (optional)
 * @returns {Object} Valid configuration object
 */
export const getValidatedConfig = (customConfig = {}) => {
  const config = {
    ...INACTIVITY_CONFIG,
    ...customConfig
  };
  
  if (!validateConfig(config)) {
    console.warn(
      'Invalid inactivity timeout configuration provided. Using defaults:',
      `Warning: ${INACTIVITY_CONFIG.WARNING_TIME_MINUTES} minutes,`,
      `Sign-out: ${INACTIVITY_CONFIG.SIGN_OUT_TIME_MINUTES} minutes`
    );
    return INACTIVITY_CONFIG;
  }
  
  return config;
};

export default INACTIVITY_CONFIG;
