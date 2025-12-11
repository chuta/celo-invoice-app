import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getPresetDateRange,
  formatDateForInput,
  parseDateFromInput,
  validateFilters,
  applyFilters,
  getUniqueClients,
  getUniqueUsers,
  calculateReportStatistics,
  calculatePercentageChange,
  formatCurrency,
  getStatusColorClasses,
  getStatusIcon,
  generateCSVContent,
  generateExportFilename,
} from '../reportUtils'

describe('reportUtils', () => {
  // Mock data for testing
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
    },
    {
      id: '3',
      invoice_number: 'INV-003',
      amount: 75.25,
      status: 'approved',
      issue_date: '2024-02-01',
      due_date: '2024-03-01',
      created_at: '2024-02-01T09:15:00Z',
      client_id: 'client-1',
      user_id: 'user-1',
      clients: { name: 'Client A', email: 'clienta@test.com' },
      profiles: { full_name: 'User One', email: 'user1@test.com' }
    }
  ]

  describe('Date utilities', () => {
    beforeEach(() => {
      // Mock current date to ensure consistent test results
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-02-15'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should calculate preset date ranges correctly', () => {
      const sevenDays = getPresetDateRange('7days')
      expect(sevenDays.start.toDateString()).toEqual(new Date('2024-02-09').toDateString())
      expect(sevenDays.end.toDateString()).toEqual(new Date('2024-02-15').toDateString())

      const thirtyDays = getPresetDateRange('30days')
      expect(thirtyDays.start.toDateString()).toEqual(new Date('2024-01-17').toDateString())
      expect(thirtyDays.end.toDateString()).toEqual(new Date('2024-02-15').toDateString())

      const quarter = getPresetDateRange('quarter')
      expect(quarter.start.toDateString()).toEqual(new Date('2023-11-18').toDateString())
      expect(quarter.end.toDateString()).toEqual(new Date('2024-02-15').toDateString())

      const year = getPresetDateRange('year')
      expect(year.start.toDateString()).toEqual(new Date('2023-02-16').toDateString())
      expect(year.end.toDateString()).toEqual(new Date('2024-02-15').toDateString())
    })

    it('should return null dates for invalid preset', () => {
      const result = getPresetDateRange('invalid')
      expect(result.start).toBeNull()
      expect(result.end).toBeNull()
    })

    it('should format dates for input fields', () => {
      const date = new Date('2024-01-15')
      expect(formatDateForInput(date)).toBe('2024-01-15')
      expect(formatDateForInput(null)).toBe('')
    })

    it('should parse dates from input fields', () => {
      expect(parseDateFromInput('2024-01-15')).toEqual(new Date('2024-01-15'))
      expect(parseDateFromInput('')).toBeNull()
      expect(parseDateFromInput(null)).toBeNull()
    })
  })

  describe('Filter validation', () => {
    it('should validate correct filters', () => {
      const validFilters = {
        dateRange: { start: new Date('2024-01-01'), end: new Date('2024-01-31') },
        amountRange: { min: '10', max: '100' }
      }
      
      const result = validateFilters(validFilters)
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
    })

    it('should detect invalid date range', () => {
      const invalidFilters = {
        dateRange: { start: new Date('2024-01-31'), end: new Date('2024-01-01') },
        amountRange: { min: '', max: '' }
      }
      
      const result = validateFilters(invalidFilters)
      expect(result.isValid).toBe(false)
      expect(result.errors.dateRange).toBe('Start date must be before end date')
    })

    it('should detect invalid amount range', () => {
      const invalidFilters = {
        dateRange: { start: null, end: null },
        amountRange: { min: '100', max: '50' }
      }
      
      const result = validateFilters(invalidFilters)
      expect(result.isValid).toBe(false)
      expect(result.errors.amountRange).toBe('Minimum amount must be less than maximum amount')
    })

    it('should detect negative amounts', () => {
      const invalidFilters = {
        dateRange: { start: null, end: null },
        amountRange: { min: '-10', max: '50' }
      }
      
      const result = validateFilters(invalidFilters)
      expect(result.isValid).toBe(false)
      expect(result.errors.amountRange).toBe('Amount values must be positive')
    })

    it('should detect non-numeric amounts', () => {
      const invalidFilters = {
        dateRange: { start: null, end: null },
        amountRange: { min: 'abc', max: '50' }
      }
      
      const result = validateFilters(invalidFilters)
      expect(result.isValid).toBe(false)
      expect(result.errors.amountRange).toBe('Amount values must be valid numbers')
    })
  })

  describe('Filter application', () => {
    it('should filter by date range', () => {
      const filters = {
        dateRange: { start: new Date('2024-01-16'), end: new Date('2024-01-31') },
        status: 'all',
        clientId: 'all',
        userId: 'all',
        amountRange: { min: '', max: '' }
      }
      
      const result = applyFilters(mockInvoices, filters)
      expect(result).toHaveLength(1)
      expect(result[0].invoice_number).toBe('INV-002')
    })

    it('should filter by status', () => {
      const filters = {
        dateRange: { start: null, end: null },
        status: 'paid',
        clientId: 'all',
        userId: 'all',
        amountRange: { min: '', max: '' }
      }
      
      const result = applyFilters(mockInvoices, filters)
      expect(result).toHaveLength(1)
      expect(result[0].status).toBe('paid')
    })

    it('should filter by client', () => {
      const filters = {
        dateRange: { start: null, end: null },
        status: 'all',
        clientId: 'client-1',
        userId: 'all',
        amountRange: { min: '', max: '' }
      }
      
      const result = applyFilters(mockInvoices, filters)
      expect(result).toHaveLength(2)
      expect(result.every(inv => inv.client_id === 'client-1')).toBe(true)
    })

    it('should filter by amount range', () => {
      const filters = {
        dateRange: { start: null, end: null },
        status: 'all',
        clientId: 'all',
        userId: 'all',
        amountRange: { min: '80', max: '200' }
      }
      
      const result = applyFilters(mockInvoices, filters)
      expect(result).toHaveLength(1)
      expect(result[0].amount).toBe(100.50)
    })

    it('should apply multiple filters', () => {
      const filters = {
        dateRange: { start: new Date('2024-01-01'), end: new Date('2024-01-31') },
        status: 'all',
        clientId: 'client-1',
        userId: 'all',
        amountRange: { min: '50', max: '150' }
      }
      
      const result = applyFilters(mockInvoices, filters)
      expect(result).toHaveLength(1)
      expect(result[0].invoice_number).toBe('INV-001')
    })
  })

  describe('Data extraction utilities', () => {
    it('should extract unique clients', () => {
      const clients = getUniqueClients(mockInvoices)
      expect(clients).toHaveLength(2)
      expect(clients[0].name).toBe('Client A')
      expect(clients[1].name).toBe('Client B')
    })

    it('should extract unique users', () => {
      const users = getUniqueUsers(mockInvoices)
      expect(users).toHaveLength(2)
      expect(users[0].name).toBe('User One')
      expect(users[1].name).toBe('User Two')
    })

    it('should handle invoices without client/user data', () => {
      const incompleteInvoices = [
        { id: '1', client_id: 'client-1', user_id: 'user-1' }
      ]
      
      const clients = getUniqueClients(incompleteInvoices)
      const users = getUniqueUsers(incompleteInvoices)
      
      expect(clients).toHaveLength(0)
      expect(users).toHaveLength(0)
    })
  })

  describe('Statistics calculations', () => {
    it('should calculate basic statistics', () => {
      const stats = calculateReportStatistics(mockInvoices)
      
      expect(stats.totalInvoices).toBe(3)
      expect(stats.totalRevenue).toBe(175.75) // paid + approved only
      expect(stats.averageAmount).toBeCloseTo(142.17, 2)
    })

    it('should calculate status distribution', () => {
      const stats = calculateReportStatistics(mockInvoices)
      
      expect(stats.statusDistribution).toEqual({
        paid: 1,
        pending: 1,
        approved: 1
      })
    })

    it('should calculate top clients', () => {
      const stats = calculateReportStatistics(mockInvoices)
      
      // Only Client A should appear since Client B's invoice is 'pending' (not approved/paid)
      expect(stats.topClients).toHaveLength(1)
      expect(stats.topClients[0].clientName).toBe('Client A')
      expect(stats.topClients[0].totalAmount).toBe(175.75)
      expect(stats.topClients[0].invoiceCount).toBe(2)
    })

    it('should handle empty invoice array', () => {
      const stats = calculateReportStatistics([])
      
      expect(stats.totalInvoices).toBe(0)
      expect(stats.totalRevenue).toBe(0)
      expect(stats.averageAmount).toBe(0)
      expect(stats.statusDistribution).toEqual({})
      expect(stats.topClients).toEqual([])
      expect(stats.monthlyTrends).toEqual([])
    })

    it('should handle null/undefined input', () => {
      const stats = calculateReportStatistics(null)
      
      expect(stats.totalInvoices).toBe(0)
      expect(stats.totalRevenue).toBe(0)
      expect(stats.averageAmount).toBe(0)
    })
  })

  describe('Percentage change calculations', () => {
    it('should calculate positive change', () => {
      const result = calculatePercentageChange(120, 100)
      expect(result.change).toBe(20)
      expect(result.direction).toBe('up')
    })

    it('should calculate negative change', () => {
      const result = calculatePercentageChange(80, 100)
      expect(result.change).toBe(20)
      expect(result.direction).toBe('down')
    })

    it('should handle zero previous value', () => {
      const result = calculatePercentageChange(100, 0)
      expect(result.change).toBe(100)
      expect(result.direction).toBe('up')
    })

    it('should handle no change', () => {
      const result = calculatePercentageChange(100, 100)
      expect(result.change).toBe(0)
      expect(result.direction).toBe('neutral')
    })
  })

  describe('Formatting utilities', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(100.5)).toBe('100.50 cUSD')
      expect(formatCurrency(0)).toBe('0.00 cUSD')
      expect(formatCurrency(1234.567)).toBe('1234.57 cUSD')
    })

    it('should return correct status colors', () => {
      expect(getStatusColorClasses('paid')).toContain('bg-blue-100')
      expect(getStatusColorClasses('pending')).toContain('bg-yellow-100')
      expect(getStatusColorClasses('approved')).toContain('bg-green-100')
      expect(getStatusColorClasses('invalid')).toContain('bg-gray-100')
    })

    it('should return correct status icons', () => {
      expect(getStatusIcon('paid')).toBe('💵')
      expect(getStatusIcon('pending')).toBe('⏳')
      expect(getStatusIcon('approved')).toBe('✅')
      expect(getStatusIcon('invalid')).toBe('📄')
    })
  })

  describe('CSV generation', () => {
    it('should generate CSV content with headers and data', () => {
      const csv = generateCSVContent(mockInvoices)
      
      expect(csv).toContain('Invoice Number,Client Name')
      expect(csv).toContain('INV-001,Client A')
      expect(csv).toContain('INV-002,Client B')
      expect(csv).toContain('100.50,paid')
      expect(csv).toContain('250.75,pending')
    })

    it('should include metadata in CSV', () => {
      const csv = generateCSVContent(mockInvoices)
      
      expect(csv).toContain('# Invoice Report Export')
      expect(csv).toContain('# Total Records: 3')
      expect(csv).toContain('# Generated:')
    })

    it('should include filter information in CSV', () => {
      const filters = {
        dateRange: { start: new Date('2024-01-01'), end: new Date('2024-01-31') },
        status: 'paid',
        clientId: 'client-1',
        userId: 'user-1',
        amountRange: { min: '50', max: '200' }
      }
      
      const csv = generateCSVContent(mockInvoices, filters)
      
      expect(csv).toContain('# Date Range: 2024-01-01 to 2024-01-31')
      expect(csv).toContain('# Status Filter: paid')
      expect(csv).toContain('# Amount Range: 50 to 200 cUSD')
    })

    it('should handle empty data', () => {
      const csv = generateCSVContent([])
      expect(csv).toBe('No data available for export')
    })

    it('should escape CSV special characters', () => {
      const specialInvoices = [{
        ...mockInvoices[0],
        description: 'Invoice with "quotes" and, commas',
        notes: 'Notes with\nnewlines'
      }]
      
      const csv = generateCSVContent(specialInvoices)
      expect(csv).toContain('"Invoice with ""quotes"" and, commas"')
      expect(csv).toContain('"Notes with\nnewlines"')
    })
  })

  describe('Filename generation', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-02-15T14:30:45'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should generate filename with timestamp', () => {
      const filename = generateExportFilename('test-report', 'csv')
      expect(filename).toBe('test-report-2024-02-15-14-30-45.csv')
    })

    it('should use default values', () => {
      const filename = generateExportFilename()
      expect(filename).toBe('invoice-report-2024-02-15-14-30-45.csv')
    })
  })
})