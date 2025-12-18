/**
 * Manual Test Component for InactivityWarningDialog
 * 
 * This is a standalone component for manually testing the InactivityWarningDialog.
 * To use: Import this component in your App.jsx temporarily and render it.
 * 
 * Example usage in App.jsx:
 * import InactivityWarningDialogManualTest from './components/InactivityWarningDialog.test-manual';
 * 
 * Then add <InactivityWarningDialogManualTest /> somewhere in your component tree.
 */

import { useState } from 'react';
import InactivityWarningDialog from './InactivityWarningDialog';

export default function InactivityWarningDialogManualTest() {
  const [isOpen, setIsOpen] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(600);

  const handleStayLoggedIn = () => {
    console.log('Stay Logged In clicked');
    setIsOpen(false);
    setRemainingSeconds(600);
  };

  const handleSignOut = () => {
    console.log('Sign Out Now clicked');
    setIsOpen(false);
  };

  const openDialog = (seconds) => {
    setRemainingSeconds(seconds);
    setIsOpen(true);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">InactivityWarningDialog Manual Test</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Test Scenarios:</h2>
            <div className="space-y-2">
              <button
                onClick={() => openDialog(600)}
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
              >
                Open Dialog (10:00 remaining)
              </button>
              
              <button
                onClick={() => openDialog(125)}
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
              >
                Open Dialog (02:05 remaining)
              </button>
              
              <button
                onClick={() => openDialog(65)}
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
              >
                Open Dialog (01:05 remaining)
              </button>
              
              <button
                onClick={() => openDialog(30)}
                className="block w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded"
              >
                Open Dialog (00:30 remaining)
              </button>
              
              <button
                onClick={() => openDialog(10)}
                className="block w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
              >
                Open Dialog (00:10 remaining)
              </button>
            </div>
          </div>

          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold mb-2">Test Checklist:</h2>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>✓ Dialog displays with proper styling</li>
              <li>✓ Countdown timer shows in MM:SS format</li>
              <li>✓ Warning icon is visible</li>
              <li>✓ Both action buttons are present</li>
              <li>✓ "Stay Logged In" button works (check console)</li>
              <li>✓ "Sign Out Now" button works (check console)</li>
              <li>✓ Escape key closes dialog (check console)</li>
              <li>✓ Tab key cycles through buttons</li>
              <li>✓ Dialog is responsive on mobile</li>
              <li>✓ Overlay prevents clicking background</li>
            </ul>
          </div>

          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold mb-2">Keyboard Navigation:</h2>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li><kbd className="px-2 py-1 bg-gray-200 rounded">Esc</kbd> - Close dialog (Stay Logged In)</li>
              <li><kbd className="px-2 py-1 bg-gray-200 rounded">Tab</kbd> - Navigate between buttons</li>
              <li><kbd className="px-2 py-1 bg-gray-200 rounded">Enter</kbd> - Activate focused button</li>
            </ul>
          </div>

          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold mb-2">Current State:</h2>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm">Dialog Open: <strong>{isOpen ? 'Yes' : 'No'}</strong></p>
              <p className="text-sm">Remaining Seconds: <strong>{remainingSeconds}</strong></p>
            </div>
          </div>
        </div>
      </div>

      {/* The actual dialog component being tested */}
      <InactivityWarningDialog
        isOpen={isOpen}
        remainingSeconds={remainingSeconds}
        onStayLoggedIn={handleStayLoggedIn}
        onSignOut={handleSignOut}
      />
    </div>
  );
}
