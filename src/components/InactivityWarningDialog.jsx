import { useEffect, useRef } from 'react';

/**
 * InactivityWarningDialog Component
 * 
 * A modal dialog that warns users of impending session termination due to inactivity.
 * Displays a countdown timer and provides options to extend the session or sign out immediately.
 * 
 * Requirements: 2.2, 2.3, 6.1, 6.2, 6.3
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the dialog is visible
 * @param {number} props.remainingSeconds - Seconds remaining until automatic sign-out
 * @param {Function} props.onStayLoggedIn - Callback when user clicks "Stay Logged In"
 * @param {Function} props.onSignOut - Callback when user clicks "Sign Out Now"
 */
export default function InactivityWarningDialog({ 
  isOpen, 
  remainingSeconds, 
  onStayLoggedIn, 
  onSignOut 
}) {
  const dialogRef = useRef(null);
  const stayButtonRef = useRef(null);

  /**
   * Format seconds as MM:SS
   * Requirements: 6.2
   */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Handle keyboard navigation
   * Requirements: 6.1 (Accessibility - keyboard navigation)
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // Handle Escape key to stay logged in (safer default action)
      if (e.key === 'Escape') {
        e.preventDefault();
        onStayLoggedIn();
      }
      
      // Handle Enter key on focused button
      if (e.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.tagName === 'BUTTON') {
          e.preventDefault();
          activeElement.click();
        }
      }

      // Trap focus within dialog
      if (e.key === 'Tab') {
        const focusableElements = dialogRef.current?.querySelectorAll(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift + Tab: move focus backwards
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: move focus forwards
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Focus the "Stay Logged In" button when dialog opens
    if (stayButtonRef.current) {
      stayButtonRef.current.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onStayLoggedIn]);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <>
      {/* Modal Overlay - Requirements: 6.1 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 transition-opacity"
        aria-hidden="true"
        onClick={(e) => {
          // Prevent closing when clicking overlay (user must make explicit choice)
          e.stopPropagation();
        }}
      >
        {/* Dialog Container - Requirements: 2.2, 2.3, 6.1 */}
        <div
          ref={dialogRef}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="inactivity-dialog-title"
          aria-describedby="inactivity-dialog-description"
          className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Dialog Content */}
          <div className="p-6 sm:p-8">
            {/* Warning Icon */}
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full">
              <svg 
                className="w-8 h-8 text-yellow-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>

            {/* Warning Message */}
            <h2 
              id="inactivity-dialog-title"
              className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-2"
            >
              Session Timeout Warning
            </h2>
            
            <p 
              id="inactivity-dialog-description"
              className="text-gray-600 text-center mb-6"
            >
              Your session will expire due to inactivity. You will be automatically signed out in:
            </p>

            {/* Countdown Timer Display - Requirements: 6.2, 6.3, 6.4 */}
            <div 
              className="bg-gray-50 rounded-lg p-6 mb-6 border-2 border-gray-200"
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="text-center">
                <div 
                  className="text-4xl sm:text-5xl font-bold text-gray-900 font-mono tabular-nums"
                  aria-label={`${remainingSeconds} seconds remaining`}
                >
                  {formatTime(remainingSeconds)}
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  minutes:seconds
                </div>
              </div>
            </div>

            {/* Action Buttons - Requirements: 2.3 */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Primary Action: Stay Logged In */}
              <button
                ref={stayButtonRef}
                onClick={onStayLoggedIn}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                aria-label="Stay logged in and continue your session"
              >
                Stay Logged In
              </button>

              {/* Secondary Action: Sign Out Now */}
              <button
                onClick={onSignOut}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                aria-label="Sign out now"
              >
                Sign Out Now
              </button>
            </div>

            {/* Additional Info */}
            <p className="text-xs text-gray-500 text-center mt-4">
              Any activity will automatically extend your session
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
