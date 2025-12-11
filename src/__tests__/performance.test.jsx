import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import ReportTable from '../components/ReportTable'
import ReportStatistics from '../components/ReportStatistics'
import { 
  applyFilters, 
  calculateReportStatistics, 
  generateCSVContent,
  generatePDFContent 
} from '../utils/reportUtils'

const Wrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
)

// Generate large dataset for performance testing
const generateLargeInvoiceDataset = (count) => {
  const statuses = ['draft', 'pending', 'approved', 'paid', 'cancelled']
  const clients = Array.from({ length: 50 }, (_, i) => ({
    id: `client-${i}`,
    name: `Client ${i}`,
    email: `client${i}@test.com`
  }))
  const users = Array.from({ length: 20 }, (_, i) => ({
    id: `user-${i}`,
    name: `User ${i}`,
    email: `user${i}@test.com`
  }))

  return Array.from({ length: count }, (_, i) => {
    const client = clients[i % clients.length]
    const user = users[i % users.length]
    const status = statuses[i % statuses.length]
    
    return {
      id: `invoice-${i}`,
      invoice_number: `INV-${String(i + 1).padStart(6, '0')}`,
      amount: Math.random() * 10000 + 100,
      status,
      issue_date: new Date(2024, 0, 1 + (i % 365)).toISOString().split('T')[0],
      due_date: new Date(2024, 1, 1 + (i % 365)).toISOString().split('T')[0],
      created_at: new Date(2024, 0, 1 + (i % 365)).toISOString(),
      updated_at: new Date(2024, 0, 1 + (i % 365)).toISOString(),
      description: `Invoice description ${i}`,
      notes: i % 3 === 0 ? `Notes for invoice ${i}` : null,
      client_id: client.id,
      user_id: user.id,
      clients: client,
      profiles: user
    }
  })
}

describe('Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Large Dataset Filtering Performance', () => {
    it('should filter 10,000 invoices within acceptable time', () => {
      const largeDataset = generateLargeInvoiceDataset(10000)
      const filters = {
        dateRange: { start: new Date('2024-01-01'), end: new Date('2024-06-30') },
        status: 'paid',
        clientId: 'all',
        userId: 'all',
        amountRange: { min: '1000', max: '5000' }
      }

      const startTime = performance.now()
      const filteredResults = applyFilters(largeDataset, filters)
      const endTime = performance.now()
      
      const executionTime = endTime - startTime
      
      // Should complete within 100ms for 10k records
      expect(executionTime).toBeLessThan(100)
      expect(filteredResults.length).toBeGreaterThan(0)
      expect(filteredResults.every(inv => inv.status === 'paid')).toBe(true)
    })

    it('should handle multiple filter criteria efficiently', () => {
      const largeDataset = generateLargeInvoiceDataset(5000)
      const complexFilters = {
        dateRange: { start: new Date('2024-03-01'), end: new Date('2024-09-30') },
        status: 'approved',
        clientId: 'client-5',
        userId: 'user-3',
        amountRange: { min: '500', max: '8000' }
      }

      const startTime = performance.now()
      const filteredResults = applyFilters(largeDataset, complexFilters)
      const endTime = performance.now()
      
      const executionTime = endTime - startTime
      
      // Should complete within 50ms for 5k records with complex filters
      expect(executionTime).toBeLessThan(50)
      expect(Array.isArray(filteredResults)).toBe(true)
    })
  })

  describe('Statistics Calculation Performance', () => {
    it('should calculate statistics for 10,000 invoices efficiently', () => {
      const largeDataset = generateLargeInvoiceDataset(10000)

      const startTime = performance.now()
      const statistics = calculateReportStatistics(largeDataset)
      const endTime = performance.now()
      
      const executionTime = endTime - startTime
      
      // Should complete within 200ms for 10k records
      expect(executionTime).toBeLessThan(200)
      expect(statistics.totalInvoices).toBe(10000)
      expect(statistics.totalRevenue).toBeGreaterThan(0)
      expect(statistics.averageAmount).toBeGreaterThan(0)
      expect(Object.keys(statistics.statusDistribution)).toHaveLength(5)
      expect(statistics.topClients.length).toBeLessThanOrEqual(5)
      expect(statistics.monthlyTrends.length).toBeLessThanOrEqual(6)
    })

    it('should handle statistics calculation with memory efficiency', () => {
      const largeDataset = generateLargeInvoiceDataset(20000)
      
      // Monitor memory usage (approximate)
      const initialMemory = performance.memory?.usedJSHeapSize || 0
      
      const statistics = calculateReportStatistics(largeDataset)
      
      const finalMemory = performance.memory?.usedJSHeapSize || 0
      const memoryIncrease = finalMemory - initialMemory
      
      // Memory increase should be reasonable (less than 50MB for 20k records)
      if (performance.memory) {
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
      }
      
      expect(statistics.totalInvoices).toBe(20000)
    })
  })

  describe('CSV Export Performance', () => {
    it('should generate CSV for 5,000 invoices within acceptable time', () => {
      const largeDataset = generateLargeInvoiceDataset(5000)
      const filters = {
        dateRange: { start: new Date('2024-01-01'), end: new Date('2024-12-31') },
        status: 'all',
        clientId: 'all',
        userId: 'all',
        amountRange: { min: '', max: '' }
      }

      const startTime = performance.now()
      const csvContent = generateCSVContent(largeDataset, filters)
      const endTime = performance.now()
      
      const executionTime = endTime - startTime
      
      // Should complete within 500ms for 5k records
      expect(executionTime).toBeLessThan(500)
      expect(csvContent).toContain('Invoice Number,Client Name')
      expect(csvContent.split('\n').length).toBeGreaterThan(5000)
    })

    it('should handle CSV generation with special characters efficiently', () => {
      const specialDataset = generateLargeInvoiceDataset(1000).map(invoice => ({
        ...invoice,
        description: 'Invoice with "quotes", commas, and\nnewlines',
        notes: 'Notes with special chars: áéíóú & symbols @#$%'
      }))

      const startTime = performance.now()
      const csvContent = generateCSVContent(specialDataset)
      const endTime = performance.now()
      
      const executionTime = endTime - startTime
      
      // Should handle special characters without significant performance impact
      expect(executionTime).toBeLessThan(200)
      expect(csvContent).toContain('"Invoice with ""quotes"", commas, and\nnewlines"')
    })
  })

  describe('PDF Export Performance', () => {
    it('should generate PDF for 1,000 invoices within reasonable time', async () => {
      const dataset = generateLargeInvoiceDataset(1000)
      const statistics = calculateReportStatistics(dataset)
      const filters = { dateRange: { start: null, end: null }, status: 'all' }

      const startTime = performance.now()
      const pdfBlob = await generatePDFContent(dataset, filters, statistics)
      const endTime = performance.now()
      
      const executionTime = endTime - startTime
      
      // PDF generation is more intensive, allow up to 3 seconds for 1k records
      expect(executionTime).toBeLessThan(3000)
      expect(pdfBlob).toBeInstanceOf(Blob)
      expect(pdfBlob.type).toBe('application/pdf')
      expect(pdfBlob.size).toBeGreaterThan(1000) // Should have substantial content
    })

    it('should handle PDF generation memory efficiently', async () => {
      const dataset = generateLargeInvoiceDataset(500)
      const statistics = calculateReportStatistics(dataset)
      
      const initialMemory = performance.memory?.usedJSHeapSize || 0
      
      const pdfBlob = await generatePDFContent(dataset, {}, statistics)
      
      const finalMemory = performance.memory?.usedJSHeapSize || 0
      const memoryIncrease = finalMemory - initialMemory
      
      // PDF generation should not cause excessive memory usage
      if (performance.memory) {
        expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024) // Less than 100MB
      }
      
      expect(pdfBlob.size).toBeGreaterThan(0)
    })
  })

  describe('Component Rendering Performance', () => {
    it('should render ReportTable with 100 invoices efficiently', async () => {
      const dataset = generateLargeInvoiceDataset(100)

      const startTime = performance.now()
      
      render(
        <Wrapper>
          <ReportTable invoices={dataset} />
        </Wrapper>
      )
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Initial render should be fast
      expect(renderTime).toBeLessThan(500)
      
      // Should show pagination for large dataset
      expect(screen.getByText(/Page 1 of/)).toBeInTheDocument()
      expect(screen.getByText(/Showing 1 to 50 of 100/)).toBeInTheDocument()
    })

    it('should handle ReportStatistics rendering with large dataset', () => {
      const dataset = generateLargeInvoiceDataset(1000)

      const startTime = performance.now()
      
      render(<ReportStatistics invoices={dataset} />)
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Statistics rendering should be efficient
      expect(renderTime).toBeLessThan(300)
      
      expect(screen.getByText('1,000')).toBeInTheDocument() // Total invoices
      expect(screen.getByText('Status Distribution')).toBeInTheDocument()
    })

    it('should handle table sorting performance with large dataset', async () => {
      const user = userEvent.setup()
      const dataset = generateLargeInvoiceDataset(200) // Use smaller dataset for UI testing

      render(
        <Wrapper>
          <ReportTable invoices={dataset} />
        </Wrapper>
      )

      const amountHeader = screen.getByText('Amount')
      
      const startTime = performance.now()
      await user.click(amountHeader)
      const endTime = performance.now()
      
      const sortTime = endTime - startTime
      
      // Sorting should be responsive
      expect(sortTime).toBeLessThan(200)
      
      // Should maintain pagination after sort
      expect(screen.getByText(/Page 1 of/)).toBeInTheDocument()
    })

    it('should handle pagination navigation efficiently', async () => {
      const user = userEvent.setup()
      const dataset = generateLargeInvoiceDataset(150) // 3 pages

      render(
        <Wrapper>
          <ReportTable invoices={dataset} />
        </Wrapper>
      )

      const nextButton = screen.getByText('Next')
      
      const startTime = performance.now()
      await user.click(nextButton)
      const endTime = performance.now()
      
      const navigationTime = endTime - startTime
      
      // Page navigation should be instant
      expect(navigationTime).toBeLessThan(100)
      
      expect(screen.getByText(/Page 2 of/)).toBeInTheDocument()
      expect(screen.getByText(/Showing 51 to 100 of 150/)).toBeInTheDocument()
    })
  })

  describe('Memory Leak Prevention', () => {
    it('should not leak memory when repeatedly filtering large datasets', () => {
      const largeDataset = generateLargeInvoiceDataset(5000)
      const filters = [
        { status: 'paid', dateRange: { start: null, end: null }, clientId: 'all', userId: 'all', amountRange: { min: '', max: '' } },
        { status: 'pending', dateRange: { start: null, end: null }, clientId: 'all', userId: 'all', amountRange: { min: '', max: '' } },
        { status: 'approved', dateRange: { start: null, end: null }, clientId: 'all', userId: 'all', amountRange: { min: '', max: '' } }
      ]

      const initialMemory = performance.memory?.usedJSHeapSize || 0

      // Perform multiple filtering operations
      for (let i = 0; i < 10; i++) {
        filters.forEach(filter => {
          const result = applyFilters(largeDataset, filter)
          // Force garbage collection opportunity
          if (global.gc) global.gc()
        })
      }

      const finalMemory = performance.memory?.usedJSHeapSize || 0
      const memoryIncrease = finalMemory - initialMemory

      // Memory should not increase significantly after repeated operations
      if (performance.memory) {
        expect(memoryIncrease).toBeLessThan(20 * 1024 * 1024) // Less than 20MB increase
      }
    })

    it('should clean up component resources properly', () => {
      const dataset = generateLargeInvoiceDataset(100)

      const { unmount } = render(
        <Wrapper>
          <ReportTable invoices={dataset} />
        </Wrapper>
      )

      // Should unmount without errors or warnings
      expect(() => unmount()).not.toThrow()
    })
  })

  describe('Concurrent Operations Performance', () => {
    it('should handle simultaneous filtering and statistics calculation', async () => {
      const largeDataset = generateLargeInvoiceDataset(3000)
      const filters = {
        dateRange: { start: new Date('2024-01-01'), end: new Date('2024-06-30') },
        status: 'paid',
        clientId: 'all',
        userId: 'all',
        amountRange: { min: '', max: '' }
      }

      const startTime = performance.now()
      
      // Simulate concurrent operations
      const [filteredData, statistics] = await Promise.all([
        Promise.resolve(applyFilters(largeDataset, filters)),
        Promise.resolve(calculateReportStatistics(largeDataset))
      ])
      
      const endTime = performance.now()
      const totalTime = endTime - startTime

      // Concurrent operations should complete efficiently
      expect(totalTime).toBeLessThan(300)
      expect(filteredData.length).toBeGreaterThan(0)
      expect(statistics.totalInvoices).toBe(3000)
    })
  })
})