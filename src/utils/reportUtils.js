/**
 * Utility functions for report filtering and date calculations
 */

/**
 * Calculate date range for preset options
 * @param {string} preset - The preset option ('7days', '30days', 'quarter', 'year')
 * @returns {Object} Object with start and end dates
 */
export const getPresetDateRange = (preset) => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  switch (preset) {
    case '7days':
      return {
        start: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000),
        end: today
      }
    case '30days':
      return {
        start: new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000),
        end: today
      }
    case 'quarter':
      return {
        start: new Date(today.getTime() - 89 * 24 * 60 * 60 * 1000),
        end: today
      }
    case 'year':
      return {
        start: new Date(today.getTime() - 364 * 24 * 60 * 60 * 1000),
        end: today
      }
    default:
      return { start: null, end: null }
  }
}

/**
 * Format date for input fields (YYYY-MM-DD)
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDateForInput = (date) => {
  if (!date) return ''
  return date.toISOString().split('T')[0]
}

/**
 * Parse date from input field
 * @param {string} dateString - The date string from input
 * @returns {Date|null} Parsed date or null
 */
export const parseDateFromInput = (dateString) => {
  if (!dateString) return null
  return new Date(dateString)
}

/**
 * Validate filter parameters
 * @param {Object} filters - The filter object to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validateFilters = (filters) => {
  const errors = {}
  let isValid = true

  // Validate date range
  if (filters.dateRange.start && filters.dateRange.end) {
    if (filters.dateRange.start > filters.dateRange.end) {
      errors.dateRange = 'Start date must be before end date'
      isValid = false
    }
  }

  // Validate amount range
  if (filters.amountRange.min && filters.amountRange.max) {
    const min = parseFloat(filters.amountRange.min)
    const max = parseFloat(filters.amountRange.max)
    
    if (isNaN(min) || isNaN(max)) {
      errors.amountRange = 'Amount values must be valid numbers'
      isValid = false
    } else if (min > max) {
      errors.amountRange = 'Minimum amount must be less than maximum amount'
      isValid = false
    } else if (min < 0 || max < 0) {
      errors.amountRange = 'Amount values must be positive'
      isValid = false
    }
  } else if (filters.amountRange.min && isNaN(parseFloat(filters.amountRange.min))) {
    errors.amountRange = 'Minimum amount must be a valid number'
    isValid = false
  } else if (filters.amountRange.max && isNaN(parseFloat(filters.amountRange.max))) {
    errors.amountRange = 'Maximum amount must be a valid number'
    isValid = false
  }

  return { isValid, errors }
}

/**
 * Apply filters to invoice data
 * @param {Array} invoices - Array of invoice objects
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered invoice array
 */
export const applyFilters = (invoices, filters) => {
  // Add null check to prevent "filter is not a function" error
  if (!invoices || !Array.isArray(invoices)) {
    return []
  }
  
  return invoices.filter(invoice => {
    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      const invoiceDate = new Date(invoice.issue_date)
      
      if (filters.dateRange.start && invoiceDate < filters.dateRange.start) {
        return false
      }
      
      if (filters.dateRange.end && invoiceDate > filters.dateRange.end) {
        return false
      }
    }

    // Status filter
    if (filters.status !== 'all' && invoice.status !== filters.status) {
      return false
    }

    // Client filter
    if (filters.clientId !== 'all' && invoice.client_id !== filters.clientId) {
      return false
    }

    // User filter
    if (filters.userId !== 'all' && invoice.user_id !== filters.userId) {
      return false
    }

    // Amount range filter
    const amount = parseFloat(invoice.amount)
    
    if (filters.amountRange.min && amount < parseFloat(filters.amountRange.min)) {
      return false
    }
    
    if (filters.amountRange.max && amount > parseFloat(filters.amountRange.max)) {
      return false
    }

    return true
  })
}

/**
 * Get unique clients from invoice data
 * @param {Array} invoices - Array of invoice objects
 * @returns {Array} Array of unique client objects
 */
export const getUniqueClients = (invoices) => {
  const clientMap = new Map()
  
  invoices.forEach(invoice => {
    if (invoice.clients && invoice.client_id) {
      clientMap.set(invoice.client_id, {
        id: invoice.client_id,
        name: invoice.clients.name,
        email: invoice.clients.email
      })
    }
  })
  
  return Array.from(clientMap.values()).sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Get unique users from invoice data
 * @param {Array} invoices - Array of invoice objects
 * @returns {Array} Array of unique user objects
 */
export const getUniqueUsers = (invoices) => {
  const userMap = new Map()
  
  invoices.forEach(invoice => {
    if (invoice.profiles && invoice.user_id) {
      userMap.set(invoice.user_id, {
        id: invoice.user_id,
        name: invoice.profiles.full_name,
        email: invoice.profiles.email
      })
    }
  })
  
  return Array.from(userMap.values()).sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Get available status options
 * @returns {Array} Array of status options
 */
export const getStatusOptions = () => [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'paid', label: 'Paid' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'voided', label: 'Voided' }
]

/**
 * Get preset date range options
 * @returns {Array} Array of preset options
 */
export const getPresetOptions = () => [
  { value: '7days', label: 'Last 7 Days' },
  { value: '30days', label: 'Last 30 Days' },
  { value: 'quarter', label: 'Last Quarter' },
  { value: 'year', label: 'Last Year' }
]

/**
 * Calculate comprehensive statistics from invoice data
 * @param {Array} invoices - Array of invoice objects
 * @returns {Object} Statistics object with calculated metrics
 */
export const calculateReportStatistics = (invoices) => {
  if (!invoices || invoices.length === 0) {
    return {
      totalInvoices: 0,
      totalRevenue: 0,
      averageAmount: 0,
      statusDistribution: {},
      topClients: [],
      monthlyTrends: []
    }
  }

  // Basic counts and totals
  const totalInvoices = invoices.length
  
  // Calculate revenue from approved and paid invoices only
  const revenueInvoices = invoices.filter(inv => 
    inv.status === 'approved' || inv.status === 'paid'
  )
  const totalRevenue = revenueInvoices.reduce((sum, inv) => 
    sum + parseFloat(inv.amount || 0), 0
  )
  
  // Average amount across all invoices
  const averageAmount = totalInvoices > 0 
    ? invoices.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0) / totalInvoices
    : 0

  // Status distribution
  const statusDistribution = invoices.reduce((acc, inv) => {
    acc[inv.status] = (acc[inv.status] || 0) + 1
    return acc
  }, {})

  // Top clients by revenue (from approved/paid invoices only)
  const clientRevenue = revenueInvoices.reduce((acc, inv) => {
    if (inv.clients && inv.client_id) {
      const clientId = inv.client_id
      if (!acc[clientId]) {
        acc[clientId] = {
          clientId,
          clientName: inv.clients.name,
          totalAmount: 0,
          invoiceCount: 0
        }
      }
      acc[clientId].totalAmount += parseFloat(inv.amount || 0)
      acc[clientId].invoiceCount += 1
    }
    return acc
  }, {})

  const topClients = Object.values(clientRevenue)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 5) // Top 5 clients

  // Monthly trends (last 6 months)
  const monthlyTrends = []
  const now = new Date()
  
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
    
    const monthInvoices = revenueInvoices.filter(inv => {
      const invoiceDate = new Date(inv.issue_date)
      return invoiceDate >= monthStart && invoiceDate <= monthEnd
    })
    
    monthlyTrends.push({
      month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      totalAmount: monthInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0),
      invoiceCount: monthInvoices.length
    })
  }

  return {
    totalInvoices,
    totalRevenue,
    averageAmount,
    statusDistribution,
    topClients,
    monthlyTrends
  }
}

/**
 * Calculate percentage change between two values
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {Object} Change analysis with percentage and direction
 */
export const calculatePercentageChange = (current, previous) => {
  if (previous === 0) {
    return { change: current > 0 ? 100 : 0, direction: current > 0 ? 'up' : 'neutral' }
  }
  
  const change = ((current - previous) / previous) * 100
  const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
  
  return { change: Math.abs(change), direction }
}

/**
 * Format currency amount with cUSD suffix
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return `${amount.toFixed(2)} cUSD`
}

/**
 * Get status color classes for badges
 * @param {string} status - Invoice status
 * @returns {string} CSS classes for status styling
 */
export const getStatusColorClasses = (status) => {
  const colors = {
    draft: 'bg-gray-100 text-gray-800 border-gray-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    paid: 'bg-blue-100 text-blue-800 border-blue-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    voided: 'bg-red-100 text-red-800 border-red-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
  }
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
}

/**
 * Get status icon for visual indicators
 * @param {string} status - Invoice status
 * @returns {string} Emoji icon for status
 */
export const getStatusIcon = (status) => {
  const icons = {
    draft: '📝',
    pending: '⏳',
    approved: '✅',
    paid: '💵',
    cancelled: '❌',
    voided: '⊘',
    rejected: '❌',
  }
  return icons[status] || '📄'
}

/**
 * Generate CSV content from invoice data
 * @param {Array} invoices - Array of invoice objects
 * @param {Object} filters - Applied filters for metadata
 * @returns {string} CSV content string
 */
export const generateCSVContent = (invoices, filters = {}) => {
  if (!invoices || invoices.length === 0) {
    return 'No data available for export'
  }

  // Define CSV headers
  const headers = [
    'Invoice Number',
    'Client Name',
    'Client Email',
    'User Name',
    'User Email',
    'Amount (cUSD)',
    'Status',
    'Issue Date',
    'Due Date',
    'Created Date',
    'Description',
    'Notes'
  ]

  // Convert invoices to CSV rows
  const rows = invoices.map(invoice => [
    invoice.invoice_number || '',
    invoice.clients?.name || '',
    invoice.clients?.email || '',
    invoice.profiles?.full_name || '',
    invoice.profiles?.email || '',
    parseFloat(invoice.amount || 0).toFixed(2),
    invoice.status || '',
    invoice.issue_date || '',
    invoice.due_date || '',
    new Date(invoice.created_at).toISOString().split('T')[0],
    invoice.description || '',
    invoice.notes || ''
  ])

  // Escape CSV values (handle commas, quotes, newlines)
  const escapeCSVValue = (value) => {
    const stringValue = String(value || '')
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`
    }
    return stringValue
  }

  // Build CSV content
  const csvLines = []
  
  // Add metadata header
  csvLines.push('# Invoice Report Export')
  csvLines.push(`# Generated: ${new Date().toISOString()}`)
  csvLines.push(`# Total Records: ${invoices.length}`)
  
  // Add filter information if filters are applied
  if (filters.dateRange?.start || filters.dateRange?.end) {
    const startDate = filters.dateRange.start ? filters.dateRange.start.toISOString().split('T')[0] : 'N/A'
    const endDate = filters.dateRange.end ? filters.dateRange.end.toISOString().split('T')[0] : 'N/A'
    csvLines.push(`# Date Range: ${startDate} to ${endDate}`)
  }
  
  if (filters.status && filters.status !== 'all') {
    csvLines.push(`# Status Filter: ${filters.status}`)
  }
  
  if (filters.clientId && filters.clientId !== 'all') {
    const clientName = invoices.find(inv => inv.client_id === filters.clientId)?.clients?.name || 'Unknown'
    csvLines.push(`# Client Filter: ${clientName}`)
  }
  
  if (filters.userId && filters.userId !== 'all') {
    const userName = invoices.find(inv => inv.user_id === filters.userId)?.profiles?.full_name || 'Unknown'
    csvLines.push(`# User Filter: ${userName}`)
  }
  
  if (filters.amountRange?.min || filters.amountRange?.max) {
    const min = filters.amountRange.min || '0'
    const max = filters.amountRange.max || 'unlimited'
    csvLines.push(`# Amount Range: ${min} to ${max} cUSD`)
  }
  
  csvLines.push('') // Empty line before data
  
  // Add headers
  csvLines.push(headers.map(escapeCSVValue).join(','))
  
  // Add data rows
  rows.forEach(row => {
    csvLines.push(row.map(escapeCSVValue).join(','))
  })

  return csvLines.join('\n')
}

/**
 * Download CSV file with given content
 * @param {string} csvContent - CSV content string
 * @param {string} filename - Filename for download
 */
export const downloadCSVFile = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

/**
 * Generate filename for export with timestamp
 * @param {string} prefix - Filename prefix
 * @param {string} extension - File extension
 * @returns {string} Generated filename
 */
export const generateExportFilename = (prefix = 'invoice-report', extension = 'csv') => {
  const now = new Date()
  const timestamp = now.toISOString().split('T')[0] // YYYY-MM-DD format
  const timeString = now.toTimeString().split(' ')[0].replace(/:/g, '-') // HH-MM-SS format
  return `${prefix}-${timestamp}-${timeString}.${extension}`
}

/**
 * Generate PDF content from invoice data with professional formatting
 * @param {Array} invoices - Array of invoice objects
 * @param {Object} filters - Applied filters for metadata
 * @param {Object} statistics - Report statistics
 * @returns {Promise<Blob>} PDF blob for download
 */
export const generatePDFContent = async (invoices, filters = {}, statistics = {}) => {
  // Dynamic import to avoid bundling issues
  const { jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  if (!invoices || invoices.length === 0) {
    throw new Error('No data available for PDF export')
  }

  // Create new PDF document
  const doc = new jsPDF()
  
  // Set up document properties
  doc.setProperties({
    title: 'Invoice Report',
    subject: 'Invoice Processing Report',
    author: 'Invoice Management System',
    creator: 'Invoice Management System'
  })

  let yPosition = 20

  // Add company header/branding
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Invoice Processing Report', 20, yPosition)
  
  yPosition += 15
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yPosition)
  
  yPosition += 10
  doc.text(`Total Records: ${invoices.length}`, 20, yPosition)

  // Add filter information
  yPosition += 15
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Applied Filters:', 20, yPosition)
  
  yPosition += 8
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  if (filters.dateRange?.start || filters.dateRange?.end) {
    const startDate = filters.dateRange.start ? filters.dateRange.start.toLocaleDateString() : 'N/A'
    const endDate = filters.dateRange.end ? filters.dateRange.end.toLocaleDateString() : 'N/A'
    doc.text(`Date Range: ${startDate} to ${endDate}`, 25, yPosition)
    yPosition += 6
  }
  
  if (filters.status && filters.status !== 'all') {
    doc.text(`Status: ${filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}`, 25, yPosition)
    yPosition += 6
  }
  
  if (filters.clientId && filters.clientId !== 'all') {
    const clientName = invoices.find(inv => inv.client_id === filters.clientId)?.clients?.name || 'Unknown'
    doc.text(`Client: ${clientName}`, 25, yPosition)
    yPosition += 6
  }
  
  if (filters.userId && filters.userId !== 'all') {
    const userName = invoices.find(inv => inv.user_id === filters.userId)?.profiles?.full_name || 'Unknown'
    doc.text(`User: ${userName}`, 25, yPosition)
    yPosition += 6
  }
  
  if (filters.amountRange?.min || filters.amountRange?.max) {
    const min = filters.amountRange.min || '0'
    const max = filters.amountRange.max || 'unlimited'
    doc.text(`Amount Range: ${min} to ${max} cUSD`, 25, yPosition)
    yPosition += 6
  }

  // Add statistics section if provided
  if (statistics && Object.keys(statistics).length > 0) {
    yPosition += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Report Statistics:', 20, yPosition)
    
    yPosition += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    doc.text(`Total Invoices: ${statistics.totalInvoices || 0}`, 25, yPosition)
    yPosition += 6
    
    doc.text(`Total Revenue: ${formatCurrency(statistics.totalRevenue || 0)}`, 25, yPosition)
    yPosition += 6
    
    doc.text(`Average Amount: ${formatCurrency(statistics.averageAmount || 0)}`, 25, yPosition)
    yPosition += 6

    // Status distribution
    if (statistics.statusDistribution && Object.keys(statistics.statusDistribution).length > 0) {
      yPosition += 4
      doc.text('Status Distribution:', 25, yPosition)
      yPosition += 6
      
      Object.entries(statistics.statusDistribution).forEach(([status, count]) => {
        doc.text(`  ${status.charAt(0).toUpperCase() + status.slice(1)}: ${count}`, 30, yPosition)
        yPosition += 5
      })
    }
  }

  // Add invoice data table
  yPosition += 15
  
  // Prepare table data
  const tableHeaders = [
    'Invoice #',
    'Client',
    'User',
    'Amount (cUSD)',
    'Status',
    'Issue Date',
    'Due Date'
  ]
  
  const tableData = invoices.map(invoice => [
    invoice.invoice_number || '',
    invoice.clients?.name || '',
    invoice.profiles?.full_name || '',
    parseFloat(invoice.amount || 0).toFixed(2),
    invoice.status || '',
    invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString() : '',
    invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : ''
  ])

  // Add table using autoTable
  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: yPosition,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [66, 139, 202], // Bootstrap primary blue
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245] // Light gray
    },
    columnStyles: {
      0: { cellWidth: 25 }, // Invoice #
      1: { cellWidth: 35 }, // Client
      2: { cellWidth: 30 }, // User
      3: { cellWidth: 25, halign: 'right' }, // Amount
      4: { cellWidth: 20 }, // Status
      5: { cellWidth: 25 }, // Issue Date
      6: { cellWidth: 25 }  // Due Date
    },
    margin: { left: 20, right: 20 },
    didDrawPage: function (data) {
      // Add page numbers
      const pageCount = doc.internal.getNumberOfPages()
      const pageSize = doc.internal.pageSize
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight()
      
      doc.setFontSize(8)
      doc.text(`Page ${data.pageNumber} of ${pageCount}`, 
        data.settings.margin.left, 
        pageHeight - 10
      )
    }
  })

  // Add footer with generation info
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    const pageSize = doc.internal.pageSize
    const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight()
    
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('Generated by Invoice Management System', 
      20, 
      pageHeight - 20
    )
  }

  return doc.output('blob')
}

/**
 * Download PDF file with given content
 * @param {Blob} pdfBlob - PDF blob content
 * @param {string} filename - Filename for download
 */
export const downloadPDFFile = (pdfBlob, filename) => {
  const link = document.createElement('a')
  const url = URL.createObjectURL(pdfBlob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}