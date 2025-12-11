import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ReportFilters from '../ReportFilters'

describe('ReportFilters', () => {
  const mockInvoices = [
    {
      id: '1',
      client_id: 'client-1',
      user_id: 'user-1',
      clients: { name: 'Client A', email: 'clienta@test.com' },
      profiles: { full_name: 'User One', email: 'user1@test.com' }
    },
    {
      id: '2',
      client_id: 'client-2',
      user_id: 'user-2',
      clients: { name: 'Client B', email: 'clientb@test.com' },
      profiles: { full_name: 'User Two', email: 'user2@test.com' }
    }
  ]

  const defaultFilters = {
    dateRange: { start: null, end: null },
    status: 'all',
    clientId: 'all',
    userId: 'all',
    amountRange: { min: '', max: '' }
  }

  const mockOnFiltersChange = vi.fn()

  beforeEach(() => {
    mockOnFiltersChange.mockClear()
  })

  it('should render all filter controls', () => {
    render(
      <ReportFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        invoices={mockInvoices}
      />
    )

    expect(screen.getByText('Report Filters')).toBeInTheDocument()
    expect(screen.getByText('Date Range')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Client')).toBeInTheDocument()
    expect(screen.getByText('User')).toBeInTheDocument()
    expect(screen.getByText('Amount Range (cUSD)')).toBeInTheDocument()
  })

  it('should render preset date buttons', () => {
    render(
      <ReportFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        invoices={mockInvoices}
      />
    )

    expect(screen.getByText('Last 7 Days')).toBeInTheDocument()
    expect(screen.getByText('Last 30 Days')).toBeInTheDocument()
    expect(screen.getByText('Last Quarter')).toBeInTheDocument()
    expect(screen.getByText('Last Year')).toBeInTheDocument()
  })

  it('should populate client and user dropdowns from invoice data', async () => {
    render(
      <ReportFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        invoices={mockInvoices}
      />
    )

    const clientSelect = screen.getByDisplayValue('All Clients')
    const userSelect = screen.getByDisplayValue('All Users')

    // Check that options are populated
    fireEvent.click(clientSelect)
    await waitFor(() => {
      expect(screen.getByText('Client A')).toBeInTheDocument()
      expect(screen.getByText('Client B')).toBeInTheDocument()
    })

    fireEvent.click(userSelect)
    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument()
      expect(screen.getByText('User Two')).toBeInTheDocument()
    })
  })

  it('should call onFiltersChange when date inputs change', async () => {
    const user = userEvent.setup()
    
    render(
      <ReportFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        invoices={mockInvoices}
      />
    )

    const startDateInput = screen.getByLabelText('Start Date')
    await user.type(startDateInput, '2024-01-15')

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      dateRange: {
        ...defaultFilters.dateRange,
        start: new Date('2024-01-15')
      }
    })
  })

  it('should call onFiltersChange when preset date button is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <ReportFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        invoices={mockInvoices}
      />
    )

    const lastSevenDaysButton = screen.getByText('Last 7 Days')
    await user.click(lastSevenDaysButton)

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        dateRange: expect.objectContaining({
          start: expect.any(Date),
          end: expect.any(Date)
        })
      })
    )
  })

  it('should call onFiltersChange when status changes', async () => {
    const user = userEvent.setup()
    
    render(
      <ReportFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        invoices={mockInvoices}
      />
    )

    const statusSelect = screen.getByDisplayValue('All Statuses')
    await user.selectOptions(statusSelect, 'paid')

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      status: 'paid'
    })
  })

  it('should call onFiltersChange when client changes', async () => {
    const user = userEvent.setup()
    
    render(
      <ReportFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        invoices={mockInvoices}
      />
    )

    const clientSelect = screen.getByDisplayValue('All Clients')
    await user.selectOptions(clientSelect, 'client-1')

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      clientId: 'client-1'
    })
  })

  it('should call onFiltersChange when amount range changes', async () => {
    const user = userEvent.setup()
    
    render(
      <ReportFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        invoices={mockInvoices}
      />
    )

    const minAmountInput = screen.getByPlaceholderText('0.00')
    await user.type(minAmountInput, '50')

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      amountRange: { min: '50', max: '' }
    })
  })

  it('should clear all filters when Clear All button is clicked', async () => {
    const user = userEvent.setup()
    
    const activeFilters = {
      dateRange: { start: new Date('2024-01-01'), end: new Date('2024-01-31') },
      status: 'paid',
      clientId: 'client-1',
      userId: 'user-1',
      amountRange: { min: '50', max: '200' }
    }

    render(
      <ReportFilters
        filters={activeFilters}
        onFiltersChange={mockOnFiltersChange}
        invoices={mockInvoices}
      />
    )

    const clearButton = screen.getByText('Clear All')
    await user.click(clearButton)

    expect(mockOnFiltersChange).toHaveBeenCalledWith(defaultFilters)
  })

  it('should display validation errors', () => {
    const filtersWithErrors = {
      ...defaultFilters,
      dateRange: { start: new Date('2024-01-31'), end: new Date('2024-01-01') },
      amountRange: { min: '100', max: '50' }
    }

    render(
      <ReportFilters
        filters={filtersWithErrors}
        onFiltersChange={mockOnFiltersChange}
        invoices={mockInvoices}
      />
    )

    expect(screen.getByText('Start date must be before end date')).toBeInTheDocument()
    expect(screen.getByText('Minimum amount must be less than maximum amount')).toBeInTheDocument()
  })

  it('should display active filters summary', () => {
    const activeFilters = {
      dateRange: { start: new Date('2024-01-01'), end: new Date('2024-01-31') },
      status: 'paid',
      clientId: 'client-1',
      userId: 'user-1',
      amountRange: { min: '50', max: '200' }
    }

    render(
      <ReportFilters
        filters={activeFilters}
        onFiltersChange={mockOnFiltersChange}
        invoices={mockInvoices}
      />
    )

    expect(screen.getByText('Active Filters:')).toBeInTheDocument()
    expect(screen.getByText(/From:/)).toBeInTheDocument()
    expect(screen.getByText(/To:/)).toBeInTheDocument()
    expect(screen.getByText('Status: paid')).toBeInTheDocument()
    expect(screen.getByText('Client: Client A')).toBeInTheDocument()
    expect(screen.getByText('User: User One')).toBeInTheDocument()
    expect(screen.getByText('Min: 50 cUSD')).toBeInTheDocument()
    expect(screen.getByText('Max: 200 cUSD')).toBeInTheDocument()
  })

  it('should not display active filters summary when no filters are active', () => {
    render(
      <ReportFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        invoices={mockInvoices}
      />
    )

    expect(screen.queryByText('Active Filters:')).not.toBeInTheDocument()
  })

  it('should handle empty invoices array', () => {
    render(
      <ReportFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        invoices={[]}
      />
    )

    const clientSelect = screen.getByDisplayValue('All Clients')
    const userSelect = screen.getByDisplayValue('All Users')

    // Should only have default options
    expect(clientSelect.children).toHaveLength(1)
    expect(userSelect.children).toHaveLength(1)
  })

  it('should apply custom className', () => {
    const { container } = render(
      <ReportFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        invoices={mockInvoices}
        className="custom-class"
      />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should handle invoices without client/user data gracefully', () => {
    const incompleteInvoices = [
      { id: '1', client_id: 'client-1', user_id: 'user-1' },
      { id: '2', client_id: 'client-2', user_id: 'user-2' }
    ]

    render(
      <ReportFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        invoices={incompleteInvoices}
      />
    )

    const clientSelect = screen.getByDisplayValue('All Clients')
    const userSelect = screen.getByDisplayValue('All Users')

    // Should only have default options since no client/user data
    expect(clientSelect.children).toHaveLength(1)
    expect(userSelect.children).toHaveLength(1)
  })
})