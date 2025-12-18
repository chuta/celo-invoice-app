import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import InactivityMonitor from '../InactivityMonitor';
import { INACTIVITY_CONFIG } from '../../config/inactivity';

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ 
        data: { 
          session: { 
            user: { id: 'test-user-id', email: 'test@example.com' } 
          } 
        } 
      })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
      signOut: vi.fn(() => Promise.resolve({ error: null }))
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ 
            data: { 
              id: 'test-user-id', 
              email: 'test@example.com',
              full_name: 'Test User',
              role: 'user'
            }, 
            error: null 
          }))
        }))
      }))
    }))
  }
}));

// Test pages
const Page1 = () => {
  const navigate = useNavigate();
  return (
    <div>
      <h1>Page 1</h1>
      <button onClick={() => navigate('/page2')}>Go to Page 2</button>
    </div>
  );
};

const Page2 = () => {
  const navigate = useNavigate();
  return (
    <div>
      <h1>Page 2</h1>
      <button onClick={() => navigate('/page1')}>Go to Page 1</button>
    </div>
  );
};

describe('InactivityMonitor - Cross-Page Navigation', () => {
  let originalDateNow;
  let currentTime;

  beforeEach(() => {
    // Mock Date.now() for consistent timing
    currentTime = 1000000000000;
    originalDateNow = Date.now;
    Date.now = vi.fn(() => currentTime);
    
    // Clear any stored data
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    Date.now = originalDateNow;
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should maintain timer state when navigating between pages', async () => {
    vi.useFakeTimers();

    // Use very short timeouts for testing (1 second warning, 2 seconds sign-out)
    const testConfig = {
      warningTimeMinutes: 1 / 60, // 1 second
      signOutTimeMinutes: 2 / 60, // 2 seconds
      enabled: true,
      checkIntervalMs: 100 // Check every 100ms for faster testing
    };

    const { rerender } = render(
      <MemoryRouter initialEntries={['/page1']}>
        <AuthProvider>
          <InactivityMonitor config={testConfig}>
            <Routes>
              <Route path="/" element={<Page1 />} />
              <Route path="/page1" element={<Page1 />} />
              <Route path="/page2" element={<Page2 />} />
            </Routes>
          </InactivityMonitor>
        </AuthProvider>
      </MemoryRouter>
    );

    // Wait for initial render and auth
    await waitFor(() => {
      expect(screen.getByText('Page 1')).toBeInTheDocument();
    });

    // Advance time by 500ms (halfway to warning)
    act(() => {
      currentTime += 500;
      vi.advanceTimersByTime(500);
    });

    // Navigate to Page 2
    const goToPage2Button = screen.getByText('Go to Page 2');
    act(() => {
      goToPage2Button.click();
    });

    await waitFor(() => {
      expect(screen.getByText('Page 2')).toBeInTheDocument();
    });

    // Advance time by another 600ms (total 1100ms, past warning threshold)
    act(() => {
      currentTime += 600;
      vi.advanceTimersByTime(600);
    });

    // Warning dialog should appear even though we navigated
    await waitFor(() => {
      expect(screen.getByText(/session will expire/i)).toBeInTheDocument();
    }, { timeout: 2000 });

    vi.useRealTimers();
  });

  it('should continue tracking activity on all pages', async () => {
    vi.useFakeTimers();

    const testConfig = {
      warningTimeMinutes: 1 / 60, // 1 second
      signOutTimeMinutes: 2 / 60, // 2 seconds
      enabled: true,
      checkIntervalMs: 100
    };

    render(
      <MemoryRouter initialEntries={['/page1']}>
        <AuthProvider>
          <InactivityMonitor config={testConfig}>
            <Routes>
              <Route path="/" element={<Page1 />} />
              <Route path="/page1" element={<Page1 />} />
              <Route path="/page2" element={<Page2 />} />
            </Routes>
          </InactivityMonitor>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Page 1')).toBeInTheDocument();
    });

    // Advance time by 500ms
    act(() => {
      currentTime += 500;
      vi.advanceTimersByTime(500);
    });

    // Navigate to Page 2
    const goToPage2Button = screen.getByText('Go to Page 2');
    act(() => {
      goToPage2Button.click();
    });

    await waitFor(() => {
      expect(screen.getByText('Page 2')).toBeInTheDocument();
    });

    // Simulate activity on Page 2 (mouse movement)
    act(() => {
      const mouseMoveEvent = new MouseEvent('mousemove', { bubbles: true });
      window.dispatchEvent(mouseMoveEvent);
      currentTime += 100; // Small time advance for throttle
      vi.advanceTimersByTime(600); // Wait for throttle + some extra time
    });

    // Advance time by 900ms more (should not trigger warning because activity reset timer)
    act(() => {
      currentTime += 900;
      vi.advanceTimersByTime(900);
    });

    // Warning should NOT appear because activity reset the timer
    await waitFor(() => {
      expect(screen.queryByText(/session will expire/i)).not.toBeInTheDocument();
    });

    vi.useRealTimers();
  });

  it('should track activity events across page navigation', async () => {
    vi.useFakeTimers();

    const testConfig = {
      warningTimeMinutes: 1 / 60,
      signOutTimeMinutes: 2 / 60,
      enabled: true,
      checkIntervalMs: 100
    };

    render(
      <MemoryRouter initialEntries={['/page1']}>
        <AuthProvider>
          <InactivityMonitor config={testConfig}>
            <Routes>
              <Route path="/" element={<Page1 />} />
              <Route path="/page1" element={<Page1 />} />
              <Route path="/page2" element={<Page2 />} />
            </Routes>
          </InactivityMonitor>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Page 1')).toBeInTheDocument();
    });

    // Navigate to Page 2
    const goToPage2Button = screen.getByText('Go to Page 2');
    act(() => {
      goToPage2Button.click();
    });

    await waitFor(() => {
      expect(screen.getByText('Page 2')).toBeInTheDocument();
    });

    // Simulate click activity on Page 2
    act(() => {
      const clickEvent = new MouseEvent('click', { bubbles: true });
      window.dispatchEvent(clickEvent);
      currentTime += 100;
      vi.advanceTimersByTime(600);
    });

    // Advance time but not enough to trigger warning (because activity reset timer)
    act(() => {
      currentTime += 800;
      vi.advanceTimersByTime(800);
    });

    // No warning should appear
    expect(screen.queryByText(/session will expire/i)).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});
