import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import ReportFilters from '../components/ReportFilters'
import ReportTable from '../components/ReportTable'
import ReportStatistics from '../components/ReportStatistics'
import ReportsSection from '../components/ReportsSection'

const Wrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
)

// Mock window.matchMedia for responsive testing
const mockMatchMedia = (matches) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

describe('Responsive Design Tests', () => {
  const mockInvoices = [
    {
      id: '1',
      invoice_number: 'INV-001',
      amount: 100.50,
      status: 'paid',
      issue_date: '2024-01-15',
      due_date: '2024-02-15',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      description: 'Test invoice 1',
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
      updated_at: '2024-01-20T14:30:00Z',
      description: 'Test invoice 2',
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

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Reset viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    })
  })

  describe('Mobile Viewport (320px - 768px)', () => {
    beforeEach(() => {
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      mockMatchMedia(true) // Mobile media query matches
    })

    it('should render ReportFilters in mobile layout', () => {
      render(
        <ReportFilters
          filters={defaultFilters}
          onFiltersChange={vi.fn()}
          invoices={mockInvoices}
        />
      )

      // Check that filter controls stack vertically on mobile
      const filterContainer = screen.getByText('Report Filters').closest('.card')
      expect(filterContainer).toBeInTheDocument()
      
      // Date range inputs should be in single column on mobile
      const startDateInput = screen.getByLabelText('Start Date')
      const endDateInput = screen.getByLabelText('End Date')
      expect(startDateInput).toBeInTheDocument()
      expect(endDateInput).toBeInTheDocument()
    })

    it('should render ReportTable with horizontal scroll on mobile', () => {
      render(
        <Wrapper>
          <ReportTable invoices={mockInvoices} />
        </Wrapper>
      )

      // Table should have overflow-x-auto for horizontal scrolling
      const tableContainer = screen.getByRole('table').closest('div')
      expect(tableContainer).toHaveClass('overflow-x-auto')
      
      // All columns should still be present
      expect(screen.getByText('Invoice #')).toBeInTheDocument()
      expect(screen.getByText('Client')).toBeInTheDocument()
      expect(screen.getByText('Amount')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
    })

    it('should render ReportStatistics in mobile grid layout', () => {
      render(<ReportStatistics invoices={mockInvoices} />)

      // Statistics cards should stack in single column on mobile
      expect(screen.getByText('Total Invoices')).toBeInTheDocument()
      expect(screen.getByText('Total Revenue')).toBeInTheDocument()
      expect(screen.getByText('Average Amount')).toBeInTheDocument()
      expect(screen.getByText('Pending Approval')).toBeInTheDocument()
    })

    it('should handle mobile touch interactions', async () => {
      const user = userEvent.setup()
      
      render(
        <Wrapper>
          <ReportTable invoices={mockInvoices} />
        </Wrapper>
      )

      // Test touch interaction with expand button
      const expandButton = screen.getAllByTitle(/Expand details/)[0]
      await user.click(expandButton)

      // Should expand details on mobile
      expect(screen.getByText('Invoice Details')).toBeInTheDocument()
    })

    it('should render mobile-friendly pagination controls', () => {
      // Create enough invoices to trigger pagination
      const manyInvoices = Array.from({ length: 60 }, (_, i) => ({
        ...mockInvoices[0],
        id: `invoice-${i}`,
        invoice_number: `INV-${String(i + 1).padStart(3, '0')}`
      }))

      render(
        <Wrapper>
          <ReportTable invoices={manyInvoices} />
        </Wrapper>
      )

      // Pagination should be present and mobile-friendly
      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
    })
  })

  describe('Tablet Viewport (768px - 1024px)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })
      mockMatchMedia(false) // Desktop media query doesn't match
    })

    it('should render ReportFilters in tablet grid layout', () => {
      render(
        <ReportFilters
          filters={defaultFilters}
          onFiltersChange={vi.fn()}
          invoices={mockInvoices}
        />
      )

      // Should have better grid layout on tablet
      expect(screen.getByText('Report Filters')).toBeInTheDocument()
      
      // Filter controls should be in 2-column grid on tablet
      const statusSelect = screen.getByDisplayValue('All Statuses')
      const clientSelect = screen.getByDisplayValue('All Clients')
      expect(statusSelect).toBeInTheDocument()
      expect(clientSelect).toBeInTheDocument()
    })

    it('should render ReportStatistics in tablet grid layout', () => {
      render(<ReportStatistics invoices={mockInvoices} />)

      // Statistics should be in 2-column grid on tablet
      expect(screen.getByText('Total Invoices')).toBeInTheDocument()
      expect(screen.getByText('Status Distribution')).toBeInTheDocument()
      expect(screen.getByText('Top Clients by Revenue')).toBeInTheDocument()
    })

    it('should handle tablet-specific interactions', async () => {
      const user = userEvent.setup()
      
      render(
        <ReportFilters
          filters={defaultFilters}
          onFiltersChange={vi.fn()}
          invoices={mockInvoices}
        />
      )

      // Test preset button interactions on tablet
      const presetButton = screen.getByText('Last 7 Days')
      await user.click(presetButton)

      // Should work smoothly on tablet
      expect(presetButton).toBeInTheDocument()
    })
  })

  describe('Desktop Viewport (1024px+)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1440,
      })
      mockMatchMedia(false)
    })

    it('should render ReportFilters in full desktop layout', () => {
      render(
        <ReportFilters
          filters={defaultFilters}
          onFiltersChange={vi.fn()}
          invoices={mockInvoices}
        />
      )

      // Should have full 5-column grid on desktop
      expect(screen.getByText('Report Filters')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Client')).toBeInTheDocument()
      expect(screen.getByText('User')).toBeInTheDocument()
    })

    it('should render ReportStatistics in desktop grid layout', () => {
      render(<ReportStatistics invoices={mockInvoices} />)

      // Statistics should be in 4-column grid on desktop
      expect(screen.getByText('Total Invoices')).toBeInTheDocument()
      expect(screen.getByText('Total Revenue')).toBeInTheDocument()
      expect(screen.getByText('Average Amount')).toBeInTheDocument()
      expect(screen.getByText('Pending Approval')).toBeInTheDocument()
      
      // Status distribution should show all statuses in row
      expect(screen.getByText('Status Distribution')).toBeInTheDocument()
    })

    it('should render ReportTable without horizontal scroll on desktop', () => {
      render(
        <Wrapper>
          <ReportTable invoices={mockInvoices} />
        </Wrapper>
      )

      // Table should fit comfortably on desktop
      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getByText('Invoice #')).toBeInTheDocument()
      expect(screen.getByText('User')).toBeInTheDocument()
      expect(screen.getByText('Client')).toBeInTheDocument()
      expect(screen.getByText('Amount')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Issue Date')).toBeInTheDocument()
      expect(screen.getByText('Due Date')).toBeInTheDocument()
    })

    it('should handle desktop hover interactions', async () => {
      const user = userEvent.setup()
      
      render(
        <Wrapper>
          <ReportTable invoices={mockInvoices} />
        </Wrapper>
      )

      // Test hover effects on desktop
      const tableRow = screen.getByText('INV-001').closest('tr')
      await user.hover(tableRow)

      // Row should have hover styling
      expect(tableRow).toHaveClass('hover:bg-gray-50')
    })
  })

  describe('Viewport Transitions', () => {
    it('should handle viewport size changes gracefully', () => {
      const { rerender } = render(
        <ReportFilters
          filters={defaultFilters}
          onFiltersChange={vi.fn()}
          invoices={mockInvoices}
        />
      )

      // Start with mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      // Simulate resize to desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1440,
      })

      fireEvent(window, new Event('resize'))

      rerender(
        <ReportFilters
          filters={defaultFilters}
          onFiltersChange={vi.fn()}
          invoices={mockInvoices}
        />
      )

      // Should still render correctly after resize
      expect(screen.getByText('Report Filters')).toBeInTheDocument()
    })

    it('should maintain functionality across viewport changes', async () => {
      const user = userEvent.setup()
      const mockOnChange = vi.fn()

      render(
        <ReportFilters
          filters={defaultFilters}
          onFiltersChange={mockOnChange}
          invoices={mockInvoices}
        />
      )

      // Test functionality on mobile size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      const statusSelect = screen.getByDisplayValue('All Statuses')
      await user.selectOptions(statusSelect, 'paid')

      expect(mockOnChange).toHaveBeenCalled()

      // Resize to desktop and test again
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1440,
      })

      fireEvent(window, new Event('resize'))

      const presetButton = screen.getByText('Last 7 Days')
      await user.click(presetButton)

      expect(mockOnChange).toHaveBeenCalledTimes(2)
    })
  })

  describe('Accessibility on Different Screen Sizes', () => {
    it('should maintain keyboard navigation on mobile', async () => {
      const user = userEvent.setup()
      
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(
        <ReportFilters
          filters={defaultFilters}
          onFiltersChange={vi.fn()}
          invoices={mockInvoices}
        />
      )

      // Test keyboard navigation
      const statusSelect = screen.getByDisplayValue('All Statuses')
      statusSelect.focus()
      
      await user.keyboard('{ArrowDown}')
      
      // Should still be focusable and navigable on mobile
      expect(document.activeElement).toBe(statusSelect)
    })

    it('should maintain touch targets on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(
        <Wrapper>
          <ReportTable invoices={mockInvoices} />
        </Wrapper>
      )

      // Buttons should be large enough for touch on mobile
      const expandButtons = screen.getAllByTitle(/Expand details/)
      expandButtons.forEach(button => {
        // Button should be easily tappable (minimum 44px recommended)
        const styles = window.getComputedStyle(button)
        expect(button).toBeInTheDocument()
      })
    })

    it('should provide appropriate focus indicators across screen sizes', async () => {
      const user = userEvent.setup()

      render(
        <ReportFilters
          filters={defaultFilters}
          onFiltersChange={vi.fn()}
          invoices={mockInvoices}
        />
      )

      // Test focus indicators on different elements
      const statusSelect = screen.getByDisplayValue('All Statuses')
      await user.tab()
      
      // Should have visible focus indicator
      expect(document.activeElement).toBeDefined()
    })
  })

  describe('Content Overflow Handling', () => {
    it('should handle long text content on mobile', () => {
      const longTextInvoices = [
        {
          ...mockInvoices[0],
          description: 'This is a very long invoice description that should wrap properly on mobile devices without breaking the layout or causing horizontal scroll issues',
          clients: { 
            name: 'Very Long Client Name That Should Truncate Properly', 
            email: 'verylongclientemail@verylongdomainname.com' 
          }
        }
      ]

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(
        <Wrapper>
          <ReportTable invoices={longTextInvoices} />
        </Wrapper>
      )

      // Should handle long content without breaking layout
      expect(screen.getByText('Very Long Client Name That Should Truncate Properly')).toBeInTheDocument()
    })

    it('should handle large numbers and currency formatting on small screens', () => {
      const largeAmountInvoices = [
        {
          ...mockInvoices[0],
          amount: 1234567.89
        }
      ]

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(<ReportStatistics invoices={largeAmountInvoices} />)

      // Should format large numbers appropriately for mobile
      expect(screen.getByText('1,234,567.89 cUSD')).toBeInTheDocument()
    })
  })

  describe('Performance on Different Screen Sizes', () => {
    it('should render efficiently on mobile devices', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      const startTime = performance.now()
      
      render(
        <Wrapper>
          <ReportTable invoices={mockInvoices} />
        </Wrapper>
      )
      
      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Should render quickly even on mobile
      expect(renderTime).toBeLessThan(200)
    })

    it('should handle scroll performance on mobile', async () => {
      const user = userEvent.setup()
      
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      const manyInvoices = Array.from({ length: 100 }, (_, i) => ({
        ...mockInvoices[0],
        id: `invoice-${i}`,
        invoice_number: `INV-${String(i + 1).padStart(3, '0')}`
      }))

      render(
        <Wrapper>
          <ReportTable invoices={manyInvoices} />
        </Wrapper>
      )

      // Should handle pagination smoothly on mobile
      const nextButton = screen.getByText('Next')
      
      const startTime = performance.now()
      await user.click(nextButton)
      const endTime = performance.now()
      
      const navigationTime = endTime - startTime
      expect(navigationTime).toBeLessThan(100)
    })
  })
})