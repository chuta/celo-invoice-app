import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useReportFilters } from '../useReportFilters'

describe('useReportFilters', () => {
  const mockInvoices = [
    {
      id: '1',
      invoice_number: 'INV-001',
      amount: 100.50,
      status: 'paid',
      issue_date: '2024-01-15',
      client_id: 'client-1',
      user_id: 'user-1',
      clients: { name: 'Client A' },
      profiles: { full_name: 'User One' }
    },
    {
      id: '2',
      invoice_number: 'INV-002',
      amount: 250.75,
      status: 'pending',
      issue_date: '2024-01-20',
      client_id: 'client-2',
      user_id: 'user-2',
      clients: { name: 'Client B' },
      profiles: { full_name: 'User Two' }
    },
    {
      id: '3',
      invoice_number: 'INV-003',
      amount: 75.25,
      status: 'approved',
      issue_date: '2024-02-01',
      client_id: 'client-1',
      user_id: 'user-1',
      clients: { name: 'Client A' },
      profiles: { full_name: 'User One' }
    }
  ]

  it('should initialize with default filter state', () => {
    const { result } = renderHook(() => useReportFilters(mockInvoices))
    
    expect(result.current.filters).toEqual({
      dateRange: { start: null, end: null },
      status: 'all',
      clientId: 'all',
      userId: 'all',
      amountRange: { min: '', max: '' }
    })
    
    expect(result.current.filteredInvoices).toEqual(mockInvoices)
    expect(result.current.hasActiveFilters).toBe(false)
    expect(result.current.validation.isValid).toBe(true)
  })

  it('should update filters correctly', () => {
    const { result } = renderHook(() => useReportFilters(mockInvoices))
    
    act(() => {
      result.current.updateFilters({
        ...result.current.filters,
        status: 'paid'
      })
    })
    
    expect(result.current.filters.status).toBe('paid')
    expect(result.current.filteredInvoices).toHaveLength(1)
    expect(result.current.filteredInvoices[0].status).toBe('paid')
    expect(result.current.hasActiveFilters).toBe(true)
  })

  it('should reset filters to default state', () => {
    const { result } = renderHook(() => useReportFilters(mockInvoices))
    
    // First set some filters
    act(() => {
      result.current.updateFilters({
        ...result.current.filters,
        status: 'paid',
        clientId: 'client-1'
      })
    })
    
    expect(result.current.hasActiveFilters).toBe(true)
    
    // Then reset
    act(() => {
      result.current.resetFilters()
    })
    
    expect(result.current.filters).toEqual({
      dateRange: { start: null, end: null },
      status: 'all',
      clientId: 'all',
      userId: 'all',
      amountRange: { min: '', max: '' }
    })
    expect(result.current.hasActiveFilters).toBe(false)
    expect(result.current.filteredInvoices).toEqual(mockInvoices)
  })

  it('should detect active filters correctly', () => {
    const { result } = renderHook(() => useReportFilters(mockInvoices))
    
    // Test date range filter
    act(() => {
      result.current.updateFilters({
        ...result.current.filters,
        dateRange: { start: new Date('2024-01-01'), end: null }
      })
    })
    expect(result.current.hasActiveFilters).toBe(true)
    
    // Reset and test status filter
    act(() => {
      result.current.resetFilters()
    })
    act(() => {
      result.current.updateFilters({
        ...result.current.filters,
        status: 'pending'
      })
    })
    expect(result.current.hasActiveFilters).toBe(true)
    
    // Reset and test amount range filter
    act(() => {
      result.current.resetFilters()
    })
    act(() => {
      result.current.updateFilters({
        ...result.current.filters,
        amountRange: { min: '50', max: '' }
      })
    })
    expect(result.current.hasActiveFilters).toBe(true)
  })

  it('should generate filter summary correctly', () => {
    const { result } = renderHook(() => useReportFilters(mockInvoices))
    
    act(() => {
      result.current.updateFilters({
        ...result.current.filters,
        dateRange: { 
          start: new Date('2024-01-01'), 
          end: new Date('2024-01-31') 
        },
        status: 'paid',
        amountRange: { min: '50', max: '200' }
      })
    })
    
    const summary = result.current.filterSummary
    expect(summary).toContain('Date: 1/1/2024 - 1/31/2024')
    expect(summary).toContain('Status: paid')
    expect(summary).toContain('Amount: 50 - 200 cUSD')
  })

  it('should handle partial date ranges in summary', () => {
    const { result } = renderHook(() => useReportFilters(mockInvoices))
    
    // Test start date only
    act(() => {
      result.current.updateFilters({
        ...result.current.filters,
        dateRange: { start: new Date('2024-01-01'), end: null }
      })
    })
    
    expect(result.current.filterSummary[0]).toContain('From 1/1/2024')
    
    // Test end date only
    act(() => {
      result.current.updateFilters({
        ...result.current.filters,
        dateRange: { start: null, end: new Date('2024-01-31') }
      })
    })
    
    expect(result.current.filterSummary[0]).toContain('Until 1/31/2024')
  })

  it('should handle partial amount ranges in summary', () => {
    const { result } = renderHook(() => useReportFilters(mockInvoices))
    
    // Test min amount only
    act(() => {
      result.current.updateFilters({
        ...result.current.filters,
        amountRange: { min: '50', max: '' }
      })
    })
    
    expect(result.current.filterSummary[0]).toContain('≥ 50 cUSD')
    
    // Test max amount only
    act(() => {
      result.current.updateFilters({
        ...result.current.filters,
        amountRange: { min: '', max: '200' }
      })
    })
    
    expect(result.current.filterSummary[0]).toContain('≤ 200 cUSD')
  })

  it('should validate filters and prevent filtering with invalid data', () => {
    const { result } = renderHook(() => useReportFilters(mockInvoices))
    
    // Set invalid date range
    act(() => {
      result.current.updateFilters({
        ...result.current.filters,
        dateRange: { 
          start: new Date('2024-01-31'), 
          end: new Date('2024-01-01') 
        }
      })
    })
    
    expect(result.current.validation.isValid).toBe(false)
    expect(result.current.validation.errors.dateRange).toBeDefined()
    // Should return original data when validation fails
    expect(result.current.filteredInvoices).toEqual(mockInvoices)
  })

  it('should filter invoices by multiple criteria', () => {
    const { result } = renderHook(() => useReportFilters(mockInvoices))
    
    act(() => {
      result.current.updateFilters({
        dateRange: { start: new Date('2024-01-01'), end: new Date('2024-01-31') },
        status: 'all',
        clientId: 'client-1',
        userId: 'all',
        amountRange: { min: '50', max: '150' }
      })
    })
    
    const filtered = result.current.filteredInvoices
    expect(filtered).toHaveLength(1)
    expect(filtered[0].invoice_number).toBe('INV-001')
    expect(filtered[0].client_id).toBe('client-1')
    expect(filtered[0].amount).toBe(100.50)
  })

  it('should handle empty invoice array', () => {
    const { result } = renderHook(() => useReportFilters([]))
    
    expect(result.current.filteredInvoices).toEqual([])
    expect(result.current.hasActiveFilters).toBe(false)
    
    act(() => {
      result.current.updateFilters({
        ...result.current.filters,
        status: 'paid'
      })
    })
    
    expect(result.current.filteredInvoices).toEqual([])
  })

  it('should handle undefined invoices', () => {
    const { result } = renderHook(() => useReportFilters())
    
    expect(result.current.filteredInvoices).toEqual([])
    expect(result.current.validation.isValid).toBe(true)
  })
})