import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import ReportTable from '../ReportTable'

// Mock react-router-dom Link component
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Link: ({ to, children, ...props }) => (
      <a href={to} {...props}>
        {children}
      </a>
    )
  }
})

const Wrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
)

describe('ReportTable', () => {
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
      notes: 'Test notes for invoice 1',
      client_id: 'client-1',
      user_id: 'user-1',
      clients: { name: 'Client A', email: 'clienta@test.com' },
      profiles: { 
        full_name: 'User One', 
        email: 'user1@test.com',
        wallet_address: '0x1234567890abcdef1234567890abcdef12345678'
      }
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
    },
    {
      id: '3',
      invoice_number: 'INV-003',
      amount: 75.25,
      status: 'approved',
      issue_date: '2024-02-01',
      due_date: '2024-03-01',
      created_at: '2024-02-01T09:15:00Z',
      updated_at: '2024-02-01T09:15:00Z',
      description: 'Test invoice 3',
      client_id: 'client-1',
      user_id: 'user-1',
      clients: { name: 'Client A', email: 'clienta@test.com' },
      profiles: { full_name: 'User One', email: 'user1@test.com' }
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render loading state', () => {
    render(
      <Wrapper>
        <ReportTable invoices={[]} loading={true} />
      </Wrapper>
    )
    
    expect(screen.getByRole('generic')).toHaveClass('animate-spin')
  })

  it('should render empty state when no invoices', () => {
    render(
      <Wrapper>
        <ReportTable invoices={[]} />
      </Wrapper>
    )
    
    expect(screen.getByText('No invoices found')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your filters to see more results.')).toBeInTheDocument()
  })

  it('should render table with invoice data', () => {
    render(
      <Wrapper>
        <ReportTable invoices={mockInvoices} />
      </Wrapper>
    )
    
    // Check table headers
    expect(screen.getByText('Invoice #')).toBeInTheDocument()
    expect(screen.getByText('User')).toBeInTheDocument()
    expect(screen.getByText('Client')).toBeInTheDocument()
    expect(screen.getByText('Amount')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Issue Date')).toBeInTheDocument()
    expect(screen.getByText('Due Date')).toBeInTheDocument()
    
    // Check invoice data
    expect(screen.getByText('INV-001')).toBeInTheDocument()
    expect(screen.getByText('INV-002')).toBeInTheDocument()
    expect(screen.getByText('INV-003')).toBeInTheDocument()
    
    expect(screen.getByText('Client A')).toBeInTheDocument()
    expect(screen.getByText('Client B')).toBeInTheDocument()
    
    expect(screen.getByText('100.50 cUSD')).toBeInTheDocument()
    expect(screen.getByText('250.75 cUSD')).toBeInTheDocument()
    expect(screen.getByText('75.25 cUSD')).toBeInTheDocument()
  })

  it('should display correct invoice count in header', () => {
    render(
      <Wrapper>
        <ReportTable invoices={mockInvoices} />
      </Wrapper>
    )
    
    expect(screen.getByText('Invoice Report (3 invoices)')).toBeInTheDocument()
  })

  it('should sort invoices when column headers are clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <Wrapper>
        <ReportTable invoices={mockInvoices} />
      </Wrapper>
    )
    
    // Click on Amount header to sort by amount
    const amountHeader = screen.getByText('Amount')
    await user.click(amountHeader)
    
    // Check that invoices are sorted by amount (ascending)
    const rows = screen.getAllByRole('row')
    const firstDataRow = rows[1] // Skip header row
    expect(firstDataRow).toHaveTextContent('75.25 cUSD') // Smallest amount first
    
    // Click again to sort descending
    await user.click(amountHeader)
    
    const rowsDesc = screen.getAllByRole('row')
    const firstDataRowDesc = rowsDesc[1]
    expect(firstDataRowDesc).toHaveTextContent('250.75 cUSD') // Largest amount first
  })

  it('should display sort indicators in column headers', () => {
    render(
      <Wrapper>
        <ReportTable invoices={mockInvoices} />
      </Wrapper>
    )
    
    // Should show sort indicators (arrows or symbols)
    const headers = screen.getAllByRole('columnheader')
    headers.forEach(header => {
      if (header.textContent && header.textContent.trim() !== '') {
        // Each sortable header should have a sort indicator
        expect(header.textContent).toMatch(/[↕️↑↓]/)
      }
    })
  })

  it('should expand and collapse invoice details', async () => {
    const user = userEvent.setup()
    
    render(
      <Wrapper>
        <ReportTable invoices={mockInvoices} />
      </Wrapper>
    )
    
    // Find expand button for first invoice
    const expandButtons = screen.getAllByTitle(/Expand details|Collapse details/)
    const firstExpandButton = expandButtons[0]
    
    // Initially should show expand icon
    expect(firstExpandButton).toHaveTextContent('▶')
    
    // Click to expand
    await user.click(firstExpandButton)
    
    // Should show collapse icon and expanded content
    expect(firstExpandButton).toHaveTextContent('▼')
    expect(screen.getByText('Invoice Details')).toBeInTheDocument()
    expect(screen.getByText('Client Information')).toBeInTheDocument()
    expect(screen.getByText('User Information')).toBeInTheDocument()
    expect(screen.getByText('Test invoice 1')).toBeInTheDocument()
    expect(screen.getByText('Test notes for invoice 1')).toBeInTheDocument()
    
    // Click to collapse
    await user.click(firstExpandButton)
    
    // Should show expand icon and hide expanded content
    expect(firstExpandButton).toHaveTextContent('▶')
    expect(screen.queryByText('Invoice Details')).not.toBeInTheDocument()
  })

  it('should display wallet address in shortened format', async () => {
    const user = userEvent.setup()
    
    render(
      <Wrapper>
        <ReportTable invoices={mockInvoices} />
      </Wrapper>
    )
    
    // Expand first invoice which has wallet address
    const expandButtons = screen.getAllByTitle(/Expand details/)
    await user.click(expandButtons[0])
    
    // Should show shortened wallet address
    expect(screen.getByText('0x1234...5678')).toBeInTheDocument()
  })

  it('should handle invoices without optional data gracefully', () => {
    const incompleteInvoices = [
      {
        id: '1',
        invoice_number: 'INV-001',
        amount: 100,
        status: 'paid',
        issue_date: '2024-01-15',
        due_date: '2024-02-15',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
        // Missing clients, profiles, description, notes
      }
    ]
    
    render(
      <Wrapper>
        <ReportTable invoices={incompleteInvoices} />
      </Wrapper>
    )
    
    // Should show N/A for missing data
    expect(screen.getAllByText('N/A')).toHaveLength(2) // Client and User columns
  })

  it('should render pagination controls for large datasets', () => {
    // Create 60 invoices to trigger pagination (50 per page)
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
    
    // Should show pagination info
    expect(screen.getByText('Showing 1 to 50 of 60 invoices')).toBeInTheDocument()
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
    
    // Should show pagination buttons
    expect(screen.getByText('Previous')).toBeInTheDocument()
    expect(screen.getByText('Next')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('should navigate between pages', async () => {
    const user = userEvent.setup()
    
    // Create 60 invoices to trigger pagination
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
    
    // Click Next button
    const nextButton = screen.getByText('Next')
    await user.click(nextButton)
    
    // Should show page 2
    expect(screen.getByText('Showing 51 to 60 of 60 invoices')).toBeInTheDocument()
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()
    
    // Previous button should be enabled, Next should be disabled
    const prevButton = screen.getByText('Previous')
    expect(prevButton).not.toBeDisabled()
    expect(nextButton).toBeDisabled()
  })

  it('should reset to first page when sorting', async () => {
    const user = userEvent.setup()
    
    // Create many invoices and go to page 2
    const manyInvoices = Array.from({ length: 60 }, (_, i) => ({
      ...mockInvoices[0],
      id: `invoice-${i}`,
      invoice_number: `INV-${String(i + 1).padStart(3, '0')}`,
      amount: Math.random() * 1000
    }))
    
    render(
      <Wrapper>
        <ReportTable invoices={manyInvoices} />
      </Wrapper>
    )
    
    // Go to page 2
    const nextButton = screen.getByText('Next')
    await user.click(nextButton)
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()
    
    // Sort by amount
    const amountHeader = screen.getByText('Amount')
    await user.click(amountHeader)
    
    // Should reset to page 1
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
  })

  it('should collapse expanded rows when changing pages', async () => {
    const user = userEvent.setup()
    
    const manyInvoices = Array.from({ length: 60 }, (_, i) => ({
      ...mockInvoices[0],
      id: `invoice-${i}`,
      invoice_number: `INV-${String(i + 1).padStart(3, '0')}`,
      description: `Description ${i + 1}`
    }))
    
    render(
      <Wrapper>
        <ReportTable invoices={manyInvoices} />
      </Wrapper>
    )
    
    // Expand first row
    const expandButton = screen.getAllByTitle(/Expand details/)[0]
    await user.click(expandButton)
    expect(screen.getByText('Invoice Details')).toBeInTheDocument()
    
    // Go to next page
    const nextButton = screen.getByText('Next')
    await user.click(nextButton)
    
    // Go back to first page
    const prevButton = screen.getByText('Previous')
    await user.click(prevButton)
    
    // Expanded content should be collapsed
    expect(screen.queryByText('Invoice Details')).not.toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <Wrapper>
        <ReportTable invoices={mockInvoices} className="custom-class" />
      </Wrapper>
    )
    
    expect(container.firstChild.firstChild).toHaveClass('custom-class')
  })

  it('should format dates correctly', () => {
    render(
      <Wrapper>
        <ReportTable invoices={mockInvoices} />
      </Wrapper>
    )
    
    // Should format dates in locale format
    expect(screen.getByText('1/15/2024')).toBeInTheDocument() // Issue date
    expect(screen.getByText('2/15/2024')).toBeInTheDocument() // Due date
  })

  it('should display status badges with correct styling', () => {
    render(
      <Wrapper>
        <ReportTable invoices={mockInvoices} />
      </Wrapper>
    )
    
    // Should show status badges
    expect(screen.getByText('paid')).toBeInTheDocument()
    expect(screen.getByText('pending')).toBeInTheDocument()
    expect(screen.getByText('approved')).toBeInTheDocument()
    
    // Should include status icons
    expect(screen.getByText('💵')).toBeInTheDocument() // Paid icon
    expect(screen.getByText('⏳')).toBeInTheDocument() // Pending icon
    expect(screen.getByText('✅')).toBeInTheDocument() // Approved icon
  })

  it('should create links to invoice detail pages', () => {
    render(
      <Wrapper>
        <ReportTable invoices={mockInvoices} />
      </Wrapper>
    )
    
    // Should create links with correct hrefs
    const invoiceLinks = screen.getAllByRole('link')
    expect(invoiceLinks[0]).toHaveAttribute('href', '/invoices/1')
    expect(invoiceLinks[1]).toHaveAttribute('href', '/invoices/2')
    expect(invoiceLinks[2]).toHaveAttribute('href', '/invoices/3')
  })

  it('should handle missing dates gracefully', () => {
    const invoicesWithMissingDates = [
      {
        ...mockInvoices[0],
        issue_date: null,
        due_date: undefined,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      }
    ]
    
    render(
      <Wrapper>
        <ReportTable invoices={invoicesWithMissingDates} />
      </Wrapper>
    )
    
    // Should handle invalid dates without crashing
    // The component should render without throwing errors
    expect(screen.getByText('INV-001')).toBeInTheDocument()
  })
})