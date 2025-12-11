import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ExportControls from '../ExportControls'

// Mock the report utils
vi.mock('../../utils/reportUtils', () => ({
  generateCSVContent: vi.fn(),
  generateExportFilename: vi.fn(),
  generatePDFContent: vi.fn(),
  downloadCSVFile: vi.fn(),
  downloadPDFFile: vi.fn(),
  calculateReportStatistics: vi.fn()
}))

describe('ExportControls', () => {
  const mockInvoices = [
    {
      id: '1',
      invoice_number: 'INV-001',
      amount: 100.50,
      status: 'paid',
      issue_date: '2024-01-15',
      due_date: '2024-02-15',
      created_at: '2024-01-15T10:00:00Z',
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
      clients: { name: 'Client B', email: 'clientb@test.com' },
      profiles: { full_name: 'User Two', email: 'user2@test.com' }
    }
  ]

  const mockFilters = {
    dateRange: { start: new Date('2024-01-01'), end: new Date('2024-01-31') },
    status: 'all',
    clientId: 'all',
    userId: 'all',
    amountRange: { min: '', max: '' }
  }

  const mockStatistics = {
    totalInvoices: 2,
    totalRevenue: 351.25,
    averageAmount: 175.63,
    statusDistribution: { paid: 1, pending: 1 }
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Setup default mock implementations
    const { 
      generateCSVContent, 
      generateExportFilename, 
      generatePDFContent,
      downloadCSVFile,
      downloadPDFFile,
      calculateReportStatistics
    } = await import('../../utils/reportUtils')
    
    generateCSVContent.mockReturnValue('mocked,csv,content')
    generateExportFilename.mockReturnValue('test-export-2024-01-15.csv')
    generatePDFContent.mockResolvedValue(new Blob(['pdf content'], { type: 'application/pdf' }))
    downloadCSVFile.mockImplementation(() => {})
    downloadPDFFile.mockImplementation(() => {})
    calculateReportStatistics.mockReturnValue(mockStatistics)
  })

  it('should render export controls', () => {
    render(
      <ExportControls 
        invoices={mockInvoices} 
        filters={mockFilters} 
        statistics={mockStatistics}
      />
    )

    expect(screen.getByText('Export Report')).toBeInTheDocument()
    expect(screen.getByText('Export CSV')).toBeInTheDocument()
    expect(screen.getByText('Export PDF')).toBeInTheDocument()
  })

  it('should handle CSV export successfully', async () => {
    const user = userEvent.setup()
    const { generateCSVContent, downloadCSVFile, generateExportFilename } = await import('../../utils/reportUtils')
    
    render(
      <ExportControls 
        invoices={mockInvoices} 
        filters={mockFilters} 
        statistics={mockStatistics}
      />
    )

    const csvButton = screen.getByText('Export CSV')
    await user.click(csvButton)

    expect(generateCSVContent).toHaveBeenCalledWith(mockInvoices, mockFilters)
    expect(generateExportFilename).toHaveBeenCalledWith('invoice-report', 'csv')
    expect(downloadCSVFile).toHaveBeenCalledWith('mocked,csv,content', 'test-export-2024-01-15.csv')
  })

  it('should handle PDF export successfully', async () => {
    const user = userEvent.setup()
    const { generatePDFContent, downloadPDFFile, generateExportFilename } = await import('../../utils/reportUtils')
    
    render(
      <ExportControls 
        invoices={mockInvoices} 
        filters={mockFilters} 
        statistics={mockStatistics}
      />
    )

    const pdfButton = screen.getByText('Export PDF')
    await user.click(pdfButton)

    await waitFor(() => {
      expect(generatePDFContent).toHaveBeenCalledWith(mockInvoices, mockFilters, mockStatistics)
    })

    await waitFor(() => {
      expect(generateExportFilename).toHaveBeenCalledWith('invoice-report', 'pdf')
      expect(downloadPDFFile).toHaveBeenCalled()
    })
  })

  it('should show loading state during CSV export', async () => {
    const user = userEvent.setup()
    const { generateCSVContent } = await import('../../utils/reportUtils')
    
    // Make CSV generation take some time
    generateCSVContent.mockImplementation(() => {
      return new Promise(resolve => setTimeout(() => resolve('csv,content'), 100))
    })
    
    render(
      <ExportControls 
        invoices={mockInvoices} 
        filters={mockFilters} 
        statistics={mockStatistics}
      />
    )

    const csvButton = screen.getByText('Export CSV')
    await user.click(csvButton)

    // Should show loading state
    expect(screen.getByText('Exporting...')).toBeInTheDocument()
    expect(csvButton).toBeDisabled()

    // Wait for export to complete
    await waitFor(() => {
      expect(screen.queryByText('Exporting...')).not.toBeInTheDocument()
    }, { timeout: 200 })
  })

  it('should show loading state during PDF export', async () => {
    const user = userEvent.setup()
    const { generatePDFContent } = await import('../../utils/reportUtils')
    
    // Make PDF generation take some time
    generatePDFContent.mockImplementation(() => {
      return new Promise(resolve => 
        setTimeout(() => resolve(new Blob(['pdf'], { type: 'application/pdf' })), 100)
      )
    })
    
    render(
      <ExportControls 
        invoices={mockInvoices} 
        filters={mockFilters} 
        statistics={mockStatistics}
      />
    )

    const pdfButton = screen.getByText('Export PDF')
    await user.click(pdfButton)

    // Should show PDF-specific loading state
    expect(screen.getByText('Generating PDF...')).toBeInTheDocument()
    expect(pdfButton).toBeDisabled()

    // Wait for export to complete
    await waitFor(() => {
      expect(screen.queryByText('Generating PDF...')).not.toBeInTheDocument()
    }, { timeout: 200 })
  })

  it('should handle CSV export errors', async () => {
    const user = userEvent.setup()
    const { generateCSVContent } = await import('../../utils/reportUtils')
    
    generateCSVContent.mockImplementation(() => {
      throw new Error('CSV generation failed')
    })
    
    render(
      <ExportControls 
        invoices={mockInvoices} 
        filters={mockFilters} 
        statistics={mockStatistics}
      />
    )

    const csvButton = screen.getByText('Export CSV')
    await user.click(csvButton)

    await waitFor(() => {
      expect(screen.getByText(/Failed to export CSV/)).toBeInTheDocument()
    })
  })

  it('should handle PDF export errors', async () => {
    const user = userEvent.setup()
    const { generatePDFContent } = await import('../../utils/reportUtils')
    
    generatePDFContent.mockRejectedValue(new Error('PDF generation failed'))
    
    render(
      <ExportControls 
        invoices={mockInvoices} 
        filters={mockFilters} 
        statistics={mockStatistics}
      />
    )

    const pdfButton = screen.getByText('Export PDF')
    await user.click(pdfButton)

    await waitFor(() => {
      expect(screen.getByText(/Failed to export PDF/)).toBeInTheDocument()
    })
  })

  it('should disable export buttons when no invoices', () => {
    render(
      <ExportControls 
        invoices={[]} 
        filters={mockFilters} 
        statistics={mockStatistics}
      />
    )

    expect(screen.getByText('Export CSV')).toBeDisabled()
    expect(screen.getByText('Export PDF')).toBeDisabled()
  })

  it('should show success message after successful export', async () => {
    const user = userEvent.setup()
    
    render(
      <ExportControls 
        invoices={mockInvoices} 
        filters={mockFilters} 
        statistics={mockStatistics}
      />
    )

    const csvButton = screen.getByText('Export CSV')
    await user.click(csvButton)

    await waitFor(() => {
      expect(screen.getByText(/CSV exported successfully/)).toBeInTheDocument()
    })
  })

  it('should apply custom className', () => {
    const { container } = render(
      <ExportControls 
        invoices={mockInvoices} 
        filters={mockFilters} 
        statistics={mockStatistics}
        className="custom-class"
      />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should handle missing statistics gracefully', () => {
    render(
      <ExportControls 
        invoices={mockInvoices} 
        filters={mockFilters} 
        statistics={null}
      />
    )

    // Should still render export controls
    expect(screen.getByText('Export CSV')).toBeInTheDocument()
    expect(screen.getByText('Export PDF')).toBeInTheDocument()
  })

  it('should display export information', () => {
    render(
      <ExportControls 
        invoices={mockInvoices} 
        filters={mockFilters} 
        statistics={mockStatistics}
      />
    )

    // Should show information about what will be exported
    expect(screen.getByText(/2 invoices/)).toBeInTheDocument()
  })

  it('should prevent multiple simultaneous exports', async () => {
    const user = userEvent.setup()
    const { generateCSVContent } = await import('../../utils/reportUtils')
    
    // Make CSV generation take some time
    generateCSVContent.mockImplementation(() => {
      return new Promise(resolve => setTimeout(() => resolve('csv,content'), 100))
    })
    
    render(
      <ExportControls 
        invoices={mockInvoices} 
        filters={mockFilters} 
        statistics={mockStatistics}
      />
    )

    const csvButton = screen.getByText('Export CSV')
    const pdfButton = screen.getByText('Export PDF')
    
    // Start CSV export
    await user.click(csvButton)
    
    // Both buttons should be disabled during export
    expect(csvButton).toBeDisabled()
    expect(pdfButton).toBeDisabled()

    // Wait for export to complete
    await waitFor(() => {
      expect(csvButton).not.toBeDisabled()
      expect(pdfButton).not.toBeDisabled()
    }, { timeout: 200 })
  })
})