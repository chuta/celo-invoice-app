import { useState, useMemo, useCallback, memo } from 'react'
import { Link } from 'react-router-dom'
import { getStatusColorClasses, getStatusIcon, formatCurrency } from '../utils/reportUtils'

// Memoized table row component for better performance
const TableRow = memo(({ invoice, isExpanded, onToggleExpand, onInvoiceAction }) => {
  const handleToggleExpand = useCallback(() => {
    onToggleExpand(invoice.id)
  }, [invoice.id, onToggleExpand])

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50">
        <td className="py-3 px-4">
          <button
            onClick={handleToggleExpand}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title={isExpanded ? 'Collapse details' : 'Expand details'}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        </td>
        <td className="py-3 px-4">
          <Link
            to={`/invoices/${invoice.id}`}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            {invoice.invoice_number}
          </Link>
        </td>
        <td className="py-3 px-4 text-gray-900">
          {invoice.profiles?.full_name || 'N/A'}
        </td>
        <td className="py-3 px-4 text-gray-900">
          {invoice.clients?.name || 'N/A'}
        </td>
        <td className="py-3 px-4 text-gray-900 text-right font-medium">
          {formatCurrency(parseFloat(invoice.amount || 0))}
        </td>
        <td className="py-3 px-4">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColorClasses(invoice.status)}`}
          >
            <span className="mr-1">{getStatusIcon(invoice.status)}</span>
            {invoice.status}
          </span>
        </td>
        <td className="py-3 px-4 text-gray-600">
          {new Date(invoice.issue_date).toLocaleDateString()}
        </td>
        <td className="py-3 px-4 text-gray-600">
          {new Date(invoice.due_date).toLocaleDateString()}
        </td>
      </tr>
      {isExpanded && <ExpandedRow invoice={invoice} />}
    </>
  )
})

// Memoized expanded row component
const ExpandedRow = memo(({ invoice }) => (
  <tr className="bg-gray-50">
    <td colSpan="8" className="px-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Invoice Details</h4>
          <div className="space-y-1">
            <p><span className="text-gray-600">Description:</span> {invoice.description || 'No description'}</p>
            <p><span className="text-gray-600">Created:</span> {new Date(invoice.created_at).toLocaleDateString()}</p>
            <p><span className="text-gray-600">Updated:</span> {new Date(invoice.updated_at).toLocaleDateString()}</p>
            {invoice.paid_date && (
              <p><span className="text-gray-600">Paid Date:</span> {new Date(invoice.paid_date).toLocaleDateString()}</p>
            )}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Client Information</h4>
          <div className="space-y-1">
            <p><span className="text-gray-600">Name:</span> {invoice.clients?.name || 'N/A'}</p>
            <p><span className="text-gray-600">Email:</span> {invoice.clients?.email || 'N/A'}</p>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-2">User Information</h4>
          <div className="space-y-1">
            <p><span className="text-gray-600">Name:</span> {invoice.profiles?.full_name || 'N/A'}</p>
            <p><span className="text-gray-600">Email:</span> {invoice.profiles?.email || 'N/A'}</p>
            {invoice.profiles?.wallet_address && (
              <p><span className="text-gray-600">Wallet:</span> 
                <span className="font-mono text-xs ml-1">
                  {invoice.profiles.wallet_address.slice(0, 6)}...{invoice.profiles.wallet_address.slice(-4)}
                </span>
              </p>
            )}
          </div>
        </div>
        
        {invoice.notes && (
          <div className="md:col-span-2 lg:col-span-3">
            <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
            <p className="text-gray-700 bg-white p-3 rounded border">{invoice.notes}</p>
          </div>
        )}
      </div>
    </td>
  </tr>
))

export default function ReportTable({ 
  invoices = [], 
  loading = false, 
  className = '',
  onInvoiceAction = null 
}) {
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedRows, setExpandedRows] = useState(new Set())
  const itemsPerPage = 50

  // Sort invoices based on current sort configuration
  const sortedInvoices = useMemo(() => {
    if (!invoices || invoices.length === 0) return []

    const sorted = [...invoices].sort((a, b) => {
      let aValue, bValue

      switch (sortConfig.key) {
        case 'amount':
          aValue = parseFloat(a.amount || 0)
          bValue = parseFloat(b.amount || 0)
          break
        case 'issue_date':
        case 'due_date':
        case 'created_at':
          aValue = new Date(a[sortConfig.key])
          bValue = new Date(b[sortConfig.key])
          break
        case 'status':
          aValue = a.status || ''
          bValue = b.status || ''
          break
        case 'client_name':
          aValue = a.clients?.name || ''
          bValue = b.clients?.name || ''
          break
        case 'user_name':
          aValue = a.profiles?.full_name || ''
          bValue = b.profiles?.full_name || ''
          break
        case 'invoice_number':
          aValue = a.invoice_number || ''
          bValue = b.invoice_number || ''
          break
        default:
          aValue = a[sortConfig.key] || ''
          bValue = b[sortConfig.key] || ''
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })

    return sorted
  }, [invoices, sortConfig])

  // Paginate sorted invoices
  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return sortedInvoices.slice(startIndex, endIndex)
  }, [sortedInvoices, currentPage])

  // Calculate pagination info
  const totalPages = Math.ceil(sortedInvoices.length / itemsPerPage)
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, sortedInvoices.length)

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }))
    setCurrentPage(1) // Reset to first page when sorting
  }

  const toggleExpandRow = (invoiceId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(invoiceId)) {
        newSet.delete(invoiceId)
      } else {
        newSet.add(invoiceId)
      }
      return newSet
    })
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    setExpandedRows(new Set()) // Collapse all rows when changing pages
  }

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return '↕️'
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓'
  }

  const renderSortableHeader = (label, key, className = '') => (
    <th 
      className={`text-left py-3 px-4 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 select-none ${className}`}
      onClick={() => handleSort(key)}
    >
      <div className="flex items-center gap-1">
        {label}
        <span className="text-xs opacity-60">{getSortIcon(key)}</span>
      </div>
    </th>
  )

  const renderExpandedRow = (invoice) => (
    <tr key={`${invoice.id}-expanded`} className="bg-gray-50">
      <td colSpan="8" className="px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Invoice Details</h4>
            <div className="space-y-1">
              <p><span className="text-gray-600">Description:</span> {invoice.description || 'No description'}</p>
              <p><span className="text-gray-600">Created:</span> {new Date(invoice.created_at).toLocaleDateString()}</p>
              <p><span className="text-gray-600">Updated:</span> {new Date(invoice.updated_at).toLocaleDateString()}</p>
              {invoice.paid_date && (
                <p><span className="text-gray-600">Paid Date:</span> {new Date(invoice.paid_date).toLocaleDateString()}</p>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Client Information</h4>
            <div className="space-y-1">
              <p><span className="text-gray-600">Name:</span> {invoice.clients?.name || 'N/A'}</p>
              <p><span className="text-gray-600">Email:</span> {invoice.clients?.email || 'N/A'}</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">User Information</h4>
            <div className="space-y-1">
              <p><span className="text-gray-600">Name:</span> {invoice.profiles?.full_name || 'N/A'}</p>
              <p><span className="text-gray-600">Email:</span> {invoice.profiles?.email || 'N/A'}</p>
              {invoice.profiles?.wallet_address && (
                <p><span className="text-gray-600">Wallet:</span> 
                  <span className="font-mono text-xs ml-1">
                    {invoice.profiles.wallet_address.slice(0, 6)}...{invoice.profiles.wallet_address.slice(-4)}
                  </span>
                </p>
              )}
            </div>
          </div>
          
          {invoice.notes && (
            <div className="md:col-span-2 lg:col-span-3">
              <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
              <p className="text-gray-700 bg-white p-3 rounded border">{invoice.notes}</p>
            </div>
          )}
        </div>
      </td>
    </tr>
  )

  const renderPaginationControls = () => {
    if (totalPages <= 1) return null

    const getPageNumbers = () => {
      const pages = []
      const maxVisiblePages = 5
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        const start = Math.max(1, currentPage - 2)
        const end = Math.min(totalPages, start + maxVisiblePages - 1)
        
        if (start > 1) {
          pages.push(1)
          if (start > 2) pages.push('...')
        }
        
        for (let i = start; i <= end; i++) {
          pages.push(i)
        }
        
        if (end < totalPages) {
          if (end < totalPages - 1) pages.push('...')
          pages.push(totalPages)
        }
      }
      
      return pages
    }

    return (
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-700">
          <span>
            Showing {startItem} to {endItem} of {sortedInvoices.length} invoices
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex gap-1">
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && handlePageChange(page)}
                disabled={page === '...'}
                className={`px-3 py-1 text-sm border rounded-md ${
                  page === currentPage
                    ? 'bg-primary-600 text-white border-primary-600'
                    : page === '...'
                    ? 'border-transparent cursor-default'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`card ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div className={`card ${className}`}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
          <p className="text-gray-500">Try adjusting your filters to see more results.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Invoice Report ({sortedInvoices.length} invoices)
        </h3>
        <div className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 w-12">
                {/* Expand/Collapse column */}
              </th>
              {renderSortableHeader('Invoice #', 'invoice_number')}
              {renderSortableHeader('User', 'user_name')}
              {renderSortableHeader('Client', 'client_name')}
              {renderSortableHeader('Amount', 'amount', 'text-right')}
              {renderSortableHeader('Status', 'status')}
              {renderSortableHeader('Issue Date', 'issue_date')}
              {renderSortableHeader('Due Date', 'due_date')}
            </tr>
          </thead>
          <tbody>
            {paginatedInvoices.map((invoice) => (
              <>
                <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleExpandRow(invoice.id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title={expandedRows.has(invoice.id) ? 'Collapse details' : 'Expand details'}
                    >
                      {expandedRows.has(invoice.id) ? '▼' : '▶'}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      to={`/invoices/${invoice.id}`}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {invoice.invoice_number}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-gray-900">
                    {invoice.profiles?.full_name || 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-gray-900">
                    {invoice.clients?.name || 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-gray-900 text-right font-medium">
                    {formatCurrency(parseFloat(invoice.amount || 0))}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColorClasses(invoice.status)}`}
                    >
                      <span className="mr-1">{getStatusIcon(invoice.status)}</span>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(invoice.issue_date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(invoice.due_date).toLocaleDateString()}
                  </td>
                </tr>
                {expandedRows.has(invoice.id) && renderExpandedRow(invoice)}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {renderPaginationControls()}
    </div>
  )
}