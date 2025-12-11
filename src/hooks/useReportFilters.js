import { useState, useCallback, useMemo } from 'react'
import { applyFilters, validateFilters } from '../utils/reportUtils'

/**
 * Custom hook for managing report filter state and logic
 * @param {Array} invoices - Array of invoice data
 * @returns {Object} Filter state and handlers
 */
export function useReportFilters(invoices = []) {
  const [filters, setFilters] = useState({
    dateRange: { start: null, end: null },
    status: 'all',
    clientId: 'all',
    userId: 'all',
    amountRange: { min: '', max: '' }
  })

  // Validate current filters
  const validation = useMemo(() => validateFilters(filters), [filters])

  // Apply filters to invoice data
  const filteredInvoices = useMemo(() => {
    if (!validation.isValid) return invoices
    return applyFilters(invoices, filters)
  }, [invoices, filters, validation.isValid])

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(newFilters)
  }, [])

  // Reset filters to default state
  const resetFilters = useCallback(() => {
    setFilters({
      dateRange: { start: null, end: null },
      status: 'all',
      clientId: 'all',
      userId: 'all',
      amountRange: { min: '', max: '' }
    })
  }, [])

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.dateRange.start !== null ||
      filters.dateRange.end !== null ||
      filters.status !== 'all' ||
      filters.clientId !== 'all' ||
      filters.userId !== 'all' ||
      filters.amountRange.min !== '' ||
      filters.amountRange.max !== ''
    )
  }, [filters])

  // Get filter summary for display
  const filterSummary = useMemo(() => {
    const summary = []
    
    if (filters.dateRange.start || filters.dateRange.end) {
      let dateText = 'Date: '
      if (filters.dateRange.start && filters.dateRange.end) {
        dateText += `${filters.dateRange.start.toLocaleDateString()} - ${filters.dateRange.end.toLocaleDateString()}`
      } else if (filters.dateRange.start) {
        dateText += `From ${filters.dateRange.start.toLocaleDateString()}`
      } else {
        dateText += `Until ${filters.dateRange.end.toLocaleDateString()}`
      }
      summary.push(dateText)
    }

    if (filters.status !== 'all') {
      summary.push(`Status: ${filters.status}`)
    }

    if (filters.amountRange.min || filters.amountRange.max) {
      let amountText = 'Amount: '
      if (filters.amountRange.min && filters.amountRange.max) {
        amountText += `${filters.amountRange.min} - ${filters.amountRange.max} cUSD`
      } else if (filters.amountRange.min) {
        amountText += `≥ ${filters.amountRange.min} cUSD`
      } else {
        amountText += `≤ ${filters.amountRange.max} cUSD`
      }
      summary.push(amountText)
    }

    return summary
  }, [filters])

  return {
    filters,
    filteredInvoices,
    validation,
    hasActiveFilters,
    filterSummary,
    updateFilters,
    resetFilters
  }
}