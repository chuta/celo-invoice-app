import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import ReportStatistics from './ReportStatistics'
import ReportFilters from './ReportFilters'
import ReportTable from './ReportTable'
import ExportControls from './ExportControls'
import { useReportFilters } from '../hooks/useReportFilters'

/**
 * ReportsSection Component
 * Main container for all reporting functionality in the Admin dashboard
 * Handles data fetching, filtering, and statistics calculation with performance optimizations
 */
export default function ReportsSection({ allInvoices = [], loading = false, onRefresh }) {
  const [reportLoading, setReportLoading] = useState(false)
  const [reportError, setReportError] = useState('')
  const [reportData, setReportData] = useState([])
  const [reportStats, setReportStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState('')
  
  // Performance optimization: debounce filter changes
  const debounceTimeoutRef = useRef(null)
  const abortControllerRef = useRef(null)

  // Report filtering functionality
  const {
    filters,
    filteredInvoices,
    validation,
    hasActiveFilters,
    filterSummary,
    updateFilters,
    resetFilters
  } = useReportFilters(reportData)

  // Use allInvoices as the base data source, but allow for independent report data fetching
  useEffect(() => {
    setReportData(allInvoices)
  }, [allInvoices])

  // Cleanup function for aborting requests
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  // Optimized function to fetch filtered data using database functions
  const fetchFilteredData = useCallback(async (appliedFilters, signal) => {
    try {
      setReportLoading(true)
      setReportError('')

      // Validate filters before making request
      const filterValidation = validation
      if (!filterValidation.isValid) {
        throw new Error('Invalid filter parameters: ' + Object.values(filterValidation.errors).join(', '))
      }

      // Sanitize and prepare filter parameters
      const sanitizedFilters = {
        startDate: appliedFilters.dateRange.start ? appliedFilters.dateRange.start.toISOString().split('T')[0] : null,
        endDate: appliedFilters.dateRange.end ? appliedFilters.dateRange.end.toISOString().split('T')[0] : null,
        status: appliedFilters.status === 'all' ? null : appliedFilters.status,
        clientId: appliedFilters.clientId === 'all' ? null : appliedFilters.clientId,
        userId: appliedFilters.userId === 'all' ? null : appliedFilters.userId,
        minAmount: appliedFilters.amountRange.min ? parseFloat(appliedFilters.amountRange.min) : null,
        maxAmount: appliedFilters.amountRange.max ? parseFloat(appliedFilters.amountRange.max) : null
      }

      // Use optimized database function for better performance
      const { data, error } = await supabase.rpc('get_filtered_invoices', {
        p_start_date: sanitizedFilters.startDate,
        p_end_date: sanitizedFilters.endDate,
        p_status: sanitizedFilters.status,
        p_client_id: sanitizedFilters.clientId,
        p_user_id: sanitizedFilters.userId,
        p_min_amount: sanitizedFilters.minAmount,
        p_max_amount: sanitizedFilters.maxAmount,
        p_limit: 1000, // Reasonable limit for performance
        p_offset: 0
      }, { signal })

      if (error) throw error

      // Transform the data to match expected format
      const transformedData = (data || []).map(row => ({
        id: row.id,
        invoice_number: row.invoice_number,
        user_id: row.user_id,
        client_id: row.client_id,
        status: row.status,
        amount: row.amount,
        issue_date: row.issue_date,
        due_date: row.due_date,
        created_at: row.created_at,
        updated_at: row.updated_at,
        clients: row.client_name ? {
          id: row.client_id,
          name: row.client_name,
          email: row.client_email
        } : null,
        profiles: row.user_name ? {
          id: row.user_id,
          full_name: row.user_name,
          email: row.user_email,
          wallet_address: row.user_wallet
        } : null
      }))

      setReportData(transformedData)
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Request aborted')
        return
      }
      setReportError(err.message || 'Failed to fetch report data')
      console.error('Error fetching filtered report data:', err)
    } finally {
      setReportLoading(false)
    }
  }, [validation])

  // Optimized function to fetch report statistics
  const fetchReportStatistics = useCallback(async (appliedFilters, signal) => {
    try {
      setStatsLoading(true)
      setStatsError('')

      // Sanitize filter parameters
      const sanitizedFilters = {
        startDate: appliedFilters.dateRange.start ? appliedFilters.dateRange.start.toISOString().split('T')[0] : null,
        endDate: appliedFilters.dateRange.end ? appliedFilters.dateRange.end.toISOString().split('T')[0] : null,
        status: appliedFilters.status === 'all' ? null : appliedFilters.status,
        clientId: appliedFilters.clientId === 'all' ? null : appliedFilters.clientId,
        userId: appliedFilters.userId === 'all' ? null : appliedFilters.userId,
        minAmount: appliedFilters.amountRange.min ? parseFloat(appliedFilters.amountRange.min) : null,
        maxAmount: appliedFilters.amountRange.max ? parseFloat(appliedFilters.amountRange.max) : null
      }

      // Fetch statistics using optimized database function
      const { data: statsData, error: statsError } = await supabase.rpc('get_report_statistics', {
        p_start_date: sanitizedFilters.startDate,
        p_end_date: sanitizedFilters.endDate,
        p_status: sanitizedFilters.status,
        p_client_id: sanitizedFilters.clientId,
        p_user_id: sanitizedFilters.userId,
        p_min_amount: sanitizedFilters.minAmount,
        p_max_amount: sanitizedFilters.maxAmount
      }, { signal })

      if (statsError) throw statsError

      // Fetch top clients data
      const { data: topClientsData, error: clientsError } = await supabase.rpc('get_top_clients_by_revenue', {
        p_start_date: sanitizedFilters.startDate,
        p_end_date: sanitizedFilters.endDate,
        p_limit: 5
      }, { signal })

      if (clientsError) throw clientsError

      // Fetch monthly trends
      const { data: trendsData, error: trendsError } = await supabase.rpc('get_monthly_trends', {
        p_months: 6
      }, { signal })

      if (trendsError) throw trendsError

      // Combine all statistics
      const stats = statsData?.[0] || {}
      setReportStats({
        totalInvoices: parseInt(stats.total_invoices) || 0,
        totalRevenue: parseFloat(stats.total_revenue) || 0,
        averageAmount: parseFloat(stats.average_amount) || 0,
        statusDistribution: {
          draft: parseInt(stats.draft_count) || 0,
          pending: parseInt(stats.pending_count) || 0,
          approved: parseInt(stats.approved_count) || 0,
          paid: parseInt(stats.paid_count) || 0,
          cancelled: parseInt(stats.cancelled_count) || 0,
          rejected: parseInt(stats.rejected_count) || 0,
          voided: parseInt(stats.voided_count) || 0
        },
        topClients: topClientsData || [],
        monthlyTrends: trendsData || []
      })
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Statistics request aborted')
        return
      }
      setStatsError(err.message || 'Failed to fetch report statistics')
      console.error('Error fetching report statistics:', err)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  // Handle filter changes with debouncing for performance
  const handleFiltersChange = useCallback(async (newFilters) => {
    updateFilters(newFilters)
    
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    // Only fetch from database if we have active filters that require server-side filtering
    const needsServerFiltering = (
      newFilters.dateRange.start || 
      newFilters.dateRange.end || 
      newFilters.status !== 'all' || 
      newFilters.clientId !== 'all' || 
      newFilters.userId !== 'all' || 
      newFilters.amountRange.min || 
      newFilters.amountRange.max
    )

    if (needsServerFiltering) {
      // Debounce the API call to avoid excessive requests
      debounceTimeoutRef.current = setTimeout(async () => {
        try {
          await Promise.all([
            fetchFilteredData(newFilters, signal),
            fetchReportStatistics(newFilters, signal)
          ])
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error('Error in debounced filter fetch:', err)
          }
        }
      }, 300) // 300ms debounce
    } else {
      // Reset to all invoices when no filters are active
      setReportData(allInvoices)
      setReportStats(null)
      setReportError('')
      setStatsError('')
    }
  }, [updateFilters, fetchFilteredData, fetchReportStatistics, allInvoices])

  // Handle refresh action with error recovery
  const handleRefresh = useCallback(async () => {
    try {
      setReportError('')
      setStatsError('')
      
      if (onRefresh) {
        await onRefresh()
      }
      
      // Re-apply current filters if any are active
      if (hasActiveFilters && validation.isValid) {
        // Create new abort controller for refresh
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
        }
        abortControllerRef.current = new AbortController()
        const signal = abortControllerRef.current.signal

        await Promise.all([
          fetchFilteredData(filters, signal),
          fetchReportStatistics(filters, signal)
        ])
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setReportError('Failed to refresh report data')
        console.error('Error refreshing report data:', err)
      }
    }
  }, [onRefresh, hasActiveFilters, validation.isValid, filters, fetchFilteredData, fetchReportStatistics])

  // Calculate statistics for filtered data (fallback when no server stats)
  const reportStatistics = useMemo(() => {
    return reportStats || filteredInvoices
  }, [reportStats, filteredInvoices])

  const isLoading = loading || reportLoading

  return (
    <div className="space-y-6">
      {/* Reports Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Invoice Reports & Analytics</h2>
          <p className="text-sm text-gray-600 mt-1">
            Analyze invoice data with customizable filters and export capabilities
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-sm text-gray-600 hover:text-gray-800 font-medium"
            >
              Clear Filters
            </button>
          )}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="btn-secondary disabled:opacity-50"
          >
            {isLoading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {(reportError || statsError) && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              <div>
                {reportError && <div>Report Error: {reportError}</div>}
                {statsError && <div>Statistics Error: {statsError}</div>}
              </div>
            </div>
            <button
              onClick={() => {
                setReportError('')
                setStatsError('')
              }}
              className="text-red-500 hover:text-red-700 ml-4"
              title="Dismiss error"
            >
              ✕
            </button>
          </div>
          {(reportError || statsError) && (
            <div className="mt-2">
              <button
                onClick={handleRefresh}
                className="text-sm text-red-600 hover:text-red-800 font-medium underline"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* Filter Summary */}
      {hasActiveFilters && filterSummary.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-900">Active Filters</h3>
              <p className="text-sm text-blue-700 mt-1">
                {filterSummary.join(' • ')} ({filteredInvoices.length} invoices)
              </p>
            </div>
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Report Statistics */}
      <ReportStatistics 
        invoices={reportStatistics} 
        loading={isLoading || statsLoading}
        error={statsError}
        onRetry={() => {
          if (hasActiveFilters && validation.isValid) {
            fetchReportStatistics(filters, abortControllerRef.current?.signal)
          }
        }}
      />

      {/* Report Filters */}
      <ReportFilters 
        filters={filters}
        onFiltersChange={handleFiltersChange}
        invoices={allInvoices} // Use all invoices for filter options
      />

      {/* Export Controls */}
      <ExportControls 
        invoices={filteredInvoices}
        filters={filters}
        disabled={isLoading}
      />

      {/* Report Table */}
      <ReportTable 
        invoices={filteredInvoices}
        loading={isLoading}
      />

      {/* Report Summary Footer */}
      {!isLoading && filteredInvoices.length > 0 && (
        <div className="text-center text-sm text-gray-600 py-4 border-t border-gray-200">
          Showing {filteredInvoices.length} of {allInvoices.length} total invoices
          {hasActiveFilters && (
            <span className="ml-2">
              • <button 
                onClick={resetFilters}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                View all invoices
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}