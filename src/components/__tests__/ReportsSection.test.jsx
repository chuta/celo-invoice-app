import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import ReportsSection from '../ReportsSection'

// Mock the supabase client
vi.mock('../../lib/supabase', () => ({
  supabase: {
    rpc: vi.fn()
  }
}))

// Mock child components
vi.mock('../ReportStatistics', () => ({
  default: ({ invoices, loading, error, onRetry }) => (
    <div data-testid="report-statistics">
      {loading && <div>Statistics Loading...</div>}
      {error && <div>Statistics Error: {error}</div>}
      {onRetry && <button onClick={onRetry}>Retry Statistics</button>}
      <div>Statistics for {Array.isArray(invoices) ? invoices.length : 0} invoices</div>
    </div>
  )
}))

vi.mock('../ReportFilters', () => ({
  default: ({ filters, onFiltersChange, invoices }) => (
    <div data-testid="report-filters">
      <button 
        onClick={() => onFiltersChange({
          ...filters,
          status: 'paid'
        })}
      >
        Apply Filter
      </button>
      <div>Filters for {invoices.length} invoices</div>
    </div>
  )
}))

vi.mock('../ReportTable', () => ({
  default: ({ invoices, loading }) => (
    <div data-testid="report-table">
      {loading && <div>Table Loading...</div>}
      <div>Table with {invoices.length} invoices</div>
    </div>
  )
}))

vi.mock('../ExportControls', () => ({
  default: ({ invoices, filters, disabled }) => (
    <div data-testid="export-controls">
      <button disabled={disabled}>Export CSV</button>
      <div>Export {invoices.length} invoices</div>
    </div>
  )
}))

const Wrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
)

describe('ReportsSection', () => {
  const mockInvoices = [
    {
      id: '1',
      invoice_number: 'INV-001',
      amount: 100.50,
      status: 'paid',
      issue_date: '2024-01-15',
      due_date: '2024-02-15',
      created_at: '2024-01-15T10:00:00Z',
      client_id: 'client-1',
      user_id: 'user-1',
      clients: { name: 'Client A', email: 'clienta@test.com' },
      profiles: { full_name: 'User One', email: 'user1@test.com' }
    },
    {
      id: '2',
      invoice_number: 'INV-002',
      amount: 250.75,
      status: 'pending',
      issue_date: '2024-01-20',
      due_date: '2024-02-20',
      created_at: '2024-01-20T14:30:00Z',
      client_id: 'client-2',
      user_id: 'user-2',
      clients: { name: 'Client B', email: 'clientb@test.com' },
      profiles: { full_name: 'User Two', email: 'user2@test.com' }
    }
  ]

  const mockOnRefresh = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default supabase mock responses
    const { supabase } = require('../../lib/supabase')
    supabase.rpc.mockResolvedValue({ data: [], error: null })
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  it('should render all report components', () => {
    render(
      <Wrapper>
        <ReportsSection 
          allInvoices={mockInvoices} 
          onRefresh={mockOnRefresh}
        />
      </Wrapper>
    )

    expect(screen.getByText('Invoice Reports & Analytics')).toBeInTheDocument()
    expect(screen.getByTestId('report-statistics')).toBeInTheDocument()
    expect(screen.getByTestId('report-filters')).toBeInTheDocument()
    expect(screen.getByTestId('report-table')).toBeInTheDocument()
    expect(screen.getByTestId('export-controls')).toBeInTheDocument()
  })

  it('should display loading state', () => {
    render(
      <Wrapper>
        <ReportsSection 
          allInvoices={mockInvoices} 
          loading={true}
          onRefresh={mockOnRefresh}
        />
      </Wrapper>
    )

    expect(screen.getByText('Statistics Loading...')).toBeInTheDocument()
    expect(screen.getByText('Table Loading...')).toBeInTheDocument()
    expect(screen.getByText('Refreshing...')).toBeInTheDocument()
  })

  it('should handle refresh action', async () => {
    const user = userEvent.setup()
    
    render(
      <Wrapper>
        <ReportsSection 
          allInvoices={mockInvoices} 
          onRefresh={mockOnRefresh}
        />
      </Wrapper>
    )

    const refreshButton = screen.getByText('🔄 Refresh')
    await user.click(refreshButton)

    expect(mockOnRefresh).toHaveBeenCalledTimes(1)
  })

  it('should handle filter changes with debouncing', async () => {
    vi.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    
    const { supabase } = require('../../lib/supabase')
    supabase.rpc.mockResolvedValue({ 
      data: [mockInvoices[0]], // Return filtered data
      error: null 
    })

    render(
      <Wrapper>
        <ReportsSection 
          allInvoices={mockInvoices} 
          onRefresh={mockOnRefresh}
        />
      </Wrapper>
    )

    // Apply filter
    const applyFilterButton = screen.getByText('Apply Filter')
    await user.click(applyFilterButton)

    // Fast-forward debounce timer
    vi.advanceTimersByTime(300)

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith(
        'get_filtered_invoices',
        expect.objectContaining({
          p_status: 'paid'
        }),
        expect.any(Object)
      )
    })

    vi.useRealTimers()
  })

  it('should display error messages', async () => {
    const { supabase } = require('../../lib/supabase')
    supabase.rpc.mockRejectedValue(new Error('Database connection failed'))

    render(
      <Wrapper>
        <ReportsSection 
          allInvoices={mockInvoices} 
          onRefresh={mockOnRefresh}
        />
      </Wrapper>
    )

    // Trigger filter change to cause error
    const applyFilterButton = screen.getByText('Apply Filter')
    await userEvent.click(applyFilterButton)

    await waitFor(() => {
      expect(screen.getByText(/Report Error:/)).toBeInTheDocument()
    })
  })

  it('should dismiss error messages', async () => {
    const user = userEvent.setup()
    const { supabase } = require('../../lib/supabase')
    supabase.rpc.mockRejectedValue(new Error('Test error'))

    render(
      <Wrapper>
        <ReportsSection 
          allInvoices={mockInvoices} 
          onRefresh={mockOnRefresh}
        />
      </Wrapper>
    )

    // Trigger error
    const applyFilterButton = screen.getByText('Apply Filter')
    await user.click(applyFilterButton)

    await waitFor(() => {
      expect(screen.getByText(/Report Error:/)).toBeInTheDocument()
    })

    // Dismiss error
    const dismissButton = screen.getByTitle('Dismiss error')
    await user.click(dismissButton)

    expect(screen.queryByText(/Report Error:/)).not.toBeInTheDocument()
  })

  it('should show active filters summary', async () => {
    const user = userEvent.setup()
    
    render(
      <Wrapper>
        <ReportsSection 
          allInvoices={mockInvoices} 
          onRefresh={mockOnRefresh}
        />
      </Wrapper>
    )

    // Apply filter to show active filters
    const applyFilterButton = screen.getByText('Apply Filter')
    await user.click(applyFilterButton)

    await waitFor(() => {
      expect(screen.getByText('Active Filters')).toBeInTheDocument()
    })
  })

  it('should clear all filters', async () => {
    const user = userEvent.setup()
    
    render(
      <Wrapper>
        <ReportsSection 
          allInvoices={mockInvoices} 
          onRefresh={mockOnRefresh}
        />
      </Wrapper>
    )

    // Apply filter first
    const applyFilterButton = screen.getByText('Apply Filter')
    await user.click(applyFilterButton)

    await waitFor(() => {
      expect(screen.getByText('Active Filters')).toBeInTheDocument()
    })

    // Clear filters
    const clearButtons = screen.getAllByText('Clear Filters')
    await user.click(clearButtons[0])

    await waitFor(() => {
      expect(screen.queryByText('Active Filters')).not.toBeInTheDocument()
    })
  })

  it('should display report summary footer', () => {
    render(
      <Wrapper>
        <ReportsSection 
          allInvoices={mockInvoices} 
          onRefresh={mockOnRefresh}
        />
      </Wrapper>
    )

    expect(screen.getByText(/Showing 2 of 2 total invoices/)).toBeInTheDocument()
  })

  it('should handle empty invoice data', () => {
    render(
      <Wrapper>
        <ReportsSection 
          allInvoices={[]} 
          onRefresh={mockOnRefresh}
        />
      </Wrapper>
    )

    expect(screen.getByText('Statistics for 0 invoices')).toBeInTheDocument()
    expect(screen.getByText('Table with 0 invoices')).toBeInTheDocument()
    expect(screen.getByText('Export 0 invoices')).toBeInTheDocument()
  })

  it('should disable export controls when loading', () => {
    render(
      <Wrapper>
        <ReportsSection 
          allInvoices={mockInvoices} 
          loading={true}
          onRefresh={mockOnRefresh}
        />
      </Wrapper>
    )

    const exportButton = screen.getByText('Export CSV')
    expect(exportButton).toBeDisabled()
  })

  it('should abort previous requests when filters change', async () => {
    vi.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    
    const { supabase } = require('../../lib/supabase')
    const mockAbort = vi.fn()
    
    // Mock AbortController
    global.AbortController = vi.fn(() => ({
      signal: { aborted: false },
      abort: mockAbort
    }))

    supabase.rpc.mockResolvedValue({ data: [], error: null })

    render(
      <Wrapper>
        <ReportsSection 
          allInvoices={mockInvoices} 
          onRefresh={mockOnRefresh}
        />
      </Wrapper>
    )

    // Apply filter multiple times quickly
    const applyFilterButton = screen.getByText('Apply Filter')
    await user.click(applyFilterButton)
    await user.click(applyFilterButton)
    await user.click(applyFilterButton)

    // Should abort previous requests
    expect(mockAbort).toHaveBeenCalled()

    vi.useRealTimers()
  })

  it('should handle statistics retry', async () => {
    const user = userEvent.setup()
    const { supabase } = require('../../lib/supabase')
    
    // First call fails, second succeeds
    supabase.rpc
      .mockRejectedValueOnce(new Error('Statistics failed'))
      .mockResolvedValue({ data: [{ total_invoices: 2 }], error: null })

    render(
      <Wrapper>
        <ReportsSection 
          allInvoices={mockInvoices} 
          onRefresh={mockOnRefresh}
        />
      </Wrapper>
    )

    // Trigger filter to cause statistics error
    const applyFilterButton = screen.getByText('Apply Filter')
    await user.click(applyFilterButton)

    await waitFor(() => {
      expect(screen.getByText(/Statistics Error:/)).toBeInTheDocument()
    })

    // Retry statistics
    const retryButton = screen.getByText('Retry Statistics')
    await user.click(retryButton)

    await waitFor(() => {
      expect(screen.queryByText(/Statistics Error:/)).not.toBeInTheDocument()
    })
  })

  it('should sanitize filter parameters before API calls', async () => {
    vi.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    
    const { supabase } = require('../../lib/supabase')
    supabase.rpc.mockResolvedValue({ data: [], error: null })

    render(
      <Wrapper>
        <ReportsSection 
          allInvoices={mockInvoices} 
          onRefresh={mockOnRefresh}
        />
      </Wrapper>
    )

    // Apply filter
    const applyFilterButton = screen.getByText('Apply Filter')
    await user.click(applyFilterButton)

    vi.advanceTimersByTime(300)

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith(
        'get_filtered_invoices',
        expect.objectContaining({
          p_start_date: null,
          p_end_date: null,
          p_status: 'paid',
          p_client_id: null,
          p_user_id: null,
          p_min_amount: null,
          p_max_amount: null,
          p_limit: 1000,
          p_offset: 0
        }),
        expect.any(Object)
      )
    })

    vi.useRealTimers()
  })

  it('should handle component cleanup properly', () => {
    const { unmount } = render(
      <Wrapper>
        <ReportsSection 
          allInvoices={mockInvoices} 
          onRefresh={mockOnRefresh}
        />
      </Wrapper>
    )

    // Should not throw errors on unmount
    expect(() => unmount()).not.toThrow()
  })
})