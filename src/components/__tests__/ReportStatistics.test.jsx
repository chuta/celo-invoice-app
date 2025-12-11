import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ReportStatistics from '../ReportStatistics'

describe('ReportStatistics', () => {
  const mockInvoices = [
    {
      id: '1',
      invoice_number: 'INV-001',
      amount: 100.50,
      status: 'paid',
      issue_date: '2024-01-15',
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
      client_id: 'client-1',
      user_id: 'user-1',
      clients: { name: 'Client A', email: 'clienta@test.com' },
      profiles: { full_name: 'User One', email: 'user1@test.com' }
    },
    {
      id: '4',
      invoice_number: 'INV-004',
      amount: 150.00,
      status: 'draft',
      issue_date: '2024-02-05',
      client_id: 'client-3',
      user_id: 'user-1',
      clients: { name: 'Client C', email: 'clientc@test.com' },
      profiles: { full_name: 'User One', email: 'user1@test.com' }
    }
  ]

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-02-15'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render loading state', () => {
    render(<ReportStatistics invoices={[]} loading={true} />)
    
    const loadingElements = screen.getAllByRole('generic')
    const animatedElements = loadingElements.filter(el => 
      el.className.includes('animate-pulse')
    )
    expect(animatedElements.length).toBeGreaterThan(0)
  })

  it('should display basic statistics correctly', () => {
    render(<ReportStatistics invoices={mockInvoices} />)
    
    // Total invoices
    expect(screen.getByText('Total Invoices')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    
    // Total revenue (paid + approved only)
    expect(screen.getByText('Total Revenue')).toBeInTheDocument()
    expect(screen.getByText('175.75 cUSD')).toBeInTheDocument()
    
    // Average amount
    expect(screen.getByText('Average Amount')).toBeInTheDocument()
    expect(screen.getByText('144.13 cUSD')).toBeInTheDocument()
    
    // Pending invoices
    expect(screen.getByText('Pending Approval')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('should display status distribution', () => {
    render(<ReportStatistics invoices={mockInvoices} />)
    
    expect(screen.getByText('Status Distribution')).toBeInTheDocument()
    
    // Check for status badges and counts
    expect(screen.getByText('Paid')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('Approved')).toBeInTheDocument()
    expect(screen.getByText('Draft')).toBeInTheDocument()
    
    // Check percentages
    expect(screen.getByText('25.0%')).toBeInTheDocument() // Each status is 25%
  })

  it('should display top clients by revenue', () => {
    render(<ReportStatistics invoices={mockInvoices} />)
    
    expect(screen.getByText('Top Clients by Revenue')).toBeInTheDocument()
    
    // Client A should be #1 with highest revenue (paid + approved = 175.75)
    expect(screen.getByText('Client A')).toBeInTheDocument()
    expect(screen.getByText('2 invoices')).toBeInTheDocument()
    expect(screen.getByText('175.75 cUSD')).toBeInTheDocument()
    
    // Check ranking indicators
    expect(screen.getByText('#1')).toBeInTheDocument()
  })

  it('should display monthly trends', () => {
    render(<ReportStatistics invoices={mockInvoices} />)
    
    expect(screen.getByText('Revenue Trends (Last 6 Months)')).toBeInTheDocument()
    
    // Should show months with revenue data
    // The component shows last 6 months, so we should see some month labels
    const monthElements = screen.getAllByText(/\w{3} \d{4}/) // Format like "Jan 2024"
    expect(monthElements.length).toBeGreaterThan(0)
  })

  it('should handle empty invoice data gracefully', () => {
    render(<ReportStatistics invoices={[]} />)
    
    // Should show zero values
    expect(screen.getByText('0')).toBeInTheDocument() // Total invoices
    expect(screen.getByText('0.00 cUSD')).toBeInTheDocument() // Total revenue
    
    // Should show empty state messages
    expect(screen.getByText('No client data available')).toBeInTheDocument()
    expect(screen.getByText('No trend data available')).toBeInTheDocument()
  })

  it('should display trend indicators correctly', () => {
    // Create invoices with clear trend (increasing revenue)
    const trendInvoices = [
      {
        ...mockInvoices[0],
        issue_date: '2024-01-15',
        status: 'paid',
        amount: 100
      },
      {
        ...mockInvoices[1],
        issue_date: '2024-02-15',
        status: 'paid',
        amount: 200
      }
    ]
    
    render(<ReportStatistics invoices={trendInvoices} />)
    
    // Should show upward trend indicator
    const trendElement = screen.getByText(/↗/)
    expect(trendElement).toBeInTheDocument()
  })

  it('should show neutral trend when no change', () => {
    // Create invoices with same revenue across months
    const flatTrendInvoices = [
      {
        ...mockInvoices[0],
        issue_date: '2024-01-15',
        status: 'paid',
        amount: 100
      },
      {
        ...mockInvoices[1],
        issue_date: '2024-02-15',
        status: 'paid',
        amount: 100
      }
    ]
    
    render(<ReportStatistics invoices={flatTrendInvoices} />)
    
    // Should show neutral trend indicator
    expect(screen.getByText('→ No change')).toBeInTheDocument()
  })

  it('should calculate percentages correctly for status distribution', () => {
    // Use invoices with known distribution
    const testInvoices = [
      { ...mockInvoices[0], status: 'paid' },
      { ...mockInvoices[1], status: 'paid' },
      { ...mockInvoices[2], status: 'pending' },
      { ...mockInvoices[3], status: 'pending' }
    ]
    
    render(<ReportStatistics invoices={testInvoices} />)
    
    // Each status should be 50%
    const percentageElements = screen.getAllByText('50.0%')
    expect(percentageElements).toHaveLength(2)
  })

  it('should handle invoices without client data', () => {
    const incompleteInvoices = [
      {
        id: '1',
        amount: 100,
        status: 'paid',
        issue_date: '2024-01-15'
        // No clients or profiles data
      }
    ]
    
    render(<ReportStatistics invoices={incompleteInvoices} />)
    
    // Should still show basic stats
    expect(screen.getByText('1')).toBeInTheDocument() // Total invoices
    expect(screen.getByText('100.00 cUSD')).toBeInTheDocument() // Revenue
    
    // Should show empty client data message
    expect(screen.getByText('No client data available')).toBeInTheDocument()
  })

  it('should display proper icons for statistics cards', () => {
    render(<ReportStatistics invoices={mockInvoices} />)
    
    // Check for emoji icons in statistics cards
    expect(screen.getByText('📊')).toBeInTheDocument() // Total invoices
    expect(screen.getByText('💰')).toBeInTheDocument() // Total revenue
    expect(screen.getByText('📈')).toBeInTheDocument() // Average amount
    expect(screen.getByText('⏳')).toBeInTheDocument() // Pending invoices
  })

  it('should display status icons in distribution', () => {
    render(<ReportStatistics invoices={mockInvoices} />)
    
    // Check for status icons (these come from getStatusIcon utility)
    expect(screen.getByText('💵')).toBeInTheDocument() // Paid
    expect(screen.getByText('⏳')).toBeInTheDocument() // Pending
    expect(screen.getByText('✅')).toBeInTheDocument() // Approved
    expect(screen.getByText('📝')).toBeInTheDocument() // Draft
  })

  it('should format large numbers with locale formatting', () => {
    const largeInvoices = [
      { ...mockInvoices[0], amount: 1000000, status: 'paid' }
    ]
    
    render(<ReportStatistics invoices={largeInvoices} />)
    
    // Should format large numbers with commas
    expect(screen.getByText('1')).toBeInTheDocument() // Total invoices (no commas needed)
    expect(screen.getByText('1,000,000.00 cUSD')).toBeInTheDocument() // Revenue with commas
  })
})