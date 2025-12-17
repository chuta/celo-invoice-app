/**
 * Utility functions for invoice statuses
 * Mirrors the pattern from categoryUtils.js which works flawlessly
 */

/**
 * Get all invoice status options with labels
 * @returns {Array} Array of status objects
 */
export const getInvoiceStatuses = () => [
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
 * Get status label from value
 * @param {string} value - Status value
 * @returns {string} Status label
 */
export const getStatusLabel = (value) => {
  const statuses = getInvoiceStatuses()
  const status = statuses.find(s => s.value === value)
  return status ? status.label : value
}

/**
 * Get status color classes for badges
 * @param {string} status - Status value
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
 * @param {string} status - Status value
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
