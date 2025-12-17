/**
 * Utility functions for invoice categories
 */

/**
 * Get all invoice categories with labels
 * @returns {Array} Array of category objects
 */
export const getInvoiceCategories = () => [
  { value: 'judges_mentors', label: 'Judges & Mentors' },
  { value: 'hackerdao_winners', label: 'HackerDAO Winners' },
  { value: 'hackathon_winners', label: 'Hackathon Winners' },
  { value: 'incubation_winners', label: 'Incubation Winners' },
  { value: 'dao_contributor_allowance', label: 'DAO Contributor Allowance' },
  { value: 'monthly_events', label: 'Monthly Events' },
]

/**
 * Get category label from value
 * @param {string} value - Category value
 * @returns {string} Category label
 */
export const getCategoryLabel = (value) => {
  const categories = getInvoiceCategories()
  const category = categories.find(c => c.value === value)
  return category ? category.label : value
}

/**
 * Get category color classes for badges
 * @param {string} category - Category value
 * @returns {string} CSS classes for category styling
 */
export const getCategoryColorClasses = (category) => {
  const colors = {
    judges_mentors: 'bg-purple-100 text-purple-800 border-purple-200',
    hackerdao_winners: 'bg-blue-100 text-blue-800 border-blue-200',
    hackathon_winners: 'bg-green-100 text-green-800 border-green-200',
    incubation_winners: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    dao_contributor_allowance: 'bg-pink-100 text-pink-800 border-pink-200',
    monthly_events: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  }
  return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200'
}

/**
 * Get category icon for visual indicators
 * @param {string} category - Category value
 * @returns {string} Emoji icon for category
 */
export const getCategoryIcon = (category) => {
  const icons = {
    judges_mentors: '👨‍⚖️',
    hackerdao_winners: '🏆',
    hackathon_winners: '💻',
    incubation_winners: '🚀',
    dao_contributor_allowance: '💰',
    monthly_events: '📅',
  }
  return icons[category] || '📄'
}
