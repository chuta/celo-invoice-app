import { useAuth } from '../contexts/AuthContext';
import { useInactivityMonitor } from '../hooks/useInactivityMonitor';
import InactivityWarningDialog from './InactivityWarningDialog';
import { INACTIVITY_CONFIG } from '../config/inactivity';

/**
 * InactivityMonitor Wrapper Component
 * 
 * This component wraps the application and provides inactivity monitoring
 * for authenticated users. It initializes the useInactivityMonitor hook
 * and renders the InactivityWarningDialog when needed.
 * 
 * Requirements: 1.2, 3.1, 3.2, 3.3, 4.1
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {Object} props.config - Optional configuration overrides
 * @param {number} props.config.warningTimeMinutes - Minutes before showing warning
 * @param {number} props.config.signOutTimeMinutes - Minutes before automatic sign-out
 * @param {boolean} props.config.enabled - Whether monitoring is enabled
 */
export default function InactivityMonitor({ children, config = {} }) {
  const { user, signOut } = useAuth();

  // Merge provided config with defaults
  const monitorConfig = {
    warningTimeMinutes: config.warningTimeMinutes || INACTIVITY_CONFIG.WARNING_TIME_MINUTES,
    signOutTimeMinutes: config.signOutTimeMinutes || INACTIVITY_CONFIG.SIGN_OUT_TIME_MINUTES,
    enabled: config.enabled !== undefined ? config.enabled : INACTIVITY_CONFIG.ENABLED,
    checkIntervalMs: config.checkIntervalMs || INACTIVITY_CONFIG.CHECK_INTERVAL_MS,
    activityEvents: config.activityEvents || INACTIVITY_CONFIG.ACTIVITY_EVENTS
  };

  // Only enable monitoring for authenticated users
  const shouldMonitor = user && monitorConfig.enabled;

  // Initialize inactivity monitoring hook (only when user is authenticated)
  const {
    showWarning,
    remainingSeconds,
    extendSession,
    signOutNow
  } = useInactivityMonitor(
    { ...monitorConfig, enabled: shouldMonitor },
    signOut
  );

  return (
    <>
      {/* Render child components */}
      {children}
      
      {/* Render warning dialog when needed (only for authenticated users) */}
      {shouldMonitor && (
        <InactivityWarningDialog
          isOpen={showWarning}
          remainingSeconds={remainingSeconds}
          onStayLoggedIn={extendSession}
          onSignOut={signOutNow}
        />
      )}
    </>
  );
}
