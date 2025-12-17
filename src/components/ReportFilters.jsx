import { useState, useEffect } from 'react'
import {
  getPresetDateRange,
  formatDateForInput,
  parseDateFromInput,
  validateFilters,
  getUniqueClients,
  getUniqueUsers,
  getPresetOptions
} from '../utils/reportUtils'
import { getInvoiceCategories } from '../utils/categoryUtils'
import { getInvoiceStatuses } from '../utils/statusUtils'

export default function ReportFilters({ filters, onFiltersChange, invoices, className = '' }) {
  const [validationErrors, setValidationErrors] = useState({})
  const [clients, setClients] = useState([])
  const [users, setUsers] = useState([])

  // Ensure filters object has all required properties with safe defaults
  const safeFilters = {
    dateRange: filters?.dateRange || { start: null, end: null },
    status: filters?.status || 'all',
    category: filters?.category || 'all',
    clientId: filters?.clientId || 'all',
    userId: filters?.userId || 'all',
    amountRange: filters?.amountRange || { min: '', max: '' }
  }

  // Extract unique clients and users from invoices
  useEffect(() => {
    if (invoices && invoices.length > 0) {
      setClients(getUniqueClients(invoices))
      setUsers(getUniqueUsers(invoices))
    }
  }, [invoices])

  // Validate filters when they change
  useEffect(() => {
    const validation = validateFilters(safeFilters)
    setValidationErrors(validation.errors)
  }, [safeFilters.dateRange, safeFilters.status, safeFilters.category, safeFilters.clientId, safeFilters.userId, safeFilters.amountRange])

  const handleDateRangeChange = (field, value) => {
    const date = parseDateFromInput(value)
    onFiltersChange({
      ...safeFilters,
      dateRange: {
        ...safeFilters.dateRange,
        [field]: date
      }
    })
  }

  const handlePresetClick = (preset) => {
    const dateRange = getPresetDateRange(preset)
    onFiltersChange({
      ...safeFilters,
      dateRange
    })
  }

  const handleStatusChange = (status) => {
    onFiltersChange({
      ...safeFilters,
      status
    })
  }

  const handleClientChange = (clientId) => {
    onFiltersChange({
      ...safeFilters,
      clientId
    })
  }

  const handleUserChange = (userId) => {
    onFiltersChange({
      ...safeFilters,
      userId
    })
  }

  const handleAmountRangeChange = (field, value) => {
    onFiltersChange({
      ...safeFilters,
      amountRange: {
        ...safeFilters.amountRange,
        [field]: value
      }
    })
  }

  const handleCategoryChange = (category) => {
    onFiltersChange({
      ...safeFilters,
      category
    })
  }

  const handleClearFilters = () => {
    onFiltersChange({
      dateRange: { start: null, end: null },
      status: 'all',
      category: 'all',
      clientId: 'all',
      userId: 'all',
      amountRange: { min: '', max: '' }
    })
  }

  // Safely get options with fallbacks - using same pattern as category filter
  const statusOptions = getInvoiceStatuses() || []
  const presetOptions = getPresetOptions() || []
  const categoryOptions = getInvoiceCategories() || []

  return (
    <div className={`card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Report Filters</h3>
        <button
          onClick={handleClearFilters}
          className="text-sm text-gray-600 hover:text-gray-800 font-medium"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-4">
        {/* Date Range Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          
          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-2 mb-3">
            {presetOptions.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePresetClick(preset.value)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Date Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Start Date</label>
              <input
                type="date"
                value={formatDateForInput(safeFilters.dateRange.start)}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">End Date</label>
              <input
                type="date"
                value={formatDateForInput(safeFilters.dateRange.end)}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                className="input-field text-sm"
              />
            </div>
          </div>
          
          {validationErrors.dateRange && (
            <p className="text-red-600 text-xs mt-1">{validationErrors.dateRange}</p>
          )}
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={safeFilters.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="input-field text-sm"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={safeFilters.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="input-field text-sm"
            >
              <option value="all">All Categories</option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Client Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client
            </label>
            <select
              value={safeFilters.clientId}
              onChange={(e) => handleClientChange(e.target.value)}
              className="input-field text-sm"
            >
              <option value="all">All Clients</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          {/* User Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User
            </label>
            <select
              value={safeFilters.userId}
              onChange={(e) => handleUserChange(e.target.value)}
              className="input-field text-sm"
            >
              <option value="all">All Users</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Amount Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount Range (cUSD)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Minimum</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={safeFilters.amountRange.min}
                onChange={(e) => handleAmountRangeChange('min', e.target.value)}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Maximum</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="No limit"
                value={safeFilters.amountRange.max}
                onChange={(e) => handleAmountRangeChange('max', e.target.value)}
                className="input-field text-sm"
              />
            </div>
          </div>
          
          {validationErrors.amountRange && (
            <p className="text-red-600 text-xs mt-1">{validationErrors.amountRange}</p>
          )}
        </div>
      </div>

      {/* Active Filters Summary */}
      {(safeFilters.dateRange.start || safeFilters.dateRange.end || safeFilters.status !== 'all' || 
        safeFilters.category !== 'all' || safeFilters.clientId !== 'all' || safeFilters.userId !== 'all' || 
        safeFilters.amountRange.min || safeFilters.amountRange.max) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-2">Active Filters:</p>
          <div className="flex flex-wrap gap-1">
            {safeFilters.dateRange.start && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                From: {safeFilters.dateRange.start.toLocaleDateString()}
              </span>
            )}
            {safeFilters.dateRange.end && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                To: {safeFilters.dateRange.end.toLocaleDateString()}
              </span>
            )}
            {safeFilters.status !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Status: {safeFilters.status}
              </span>
            )}
            {safeFilters.category && safeFilters.category !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800">
                Category: {categoryOptions.find(c => c.value === safeFilters.category)?.label || 'Unknown'}
              </span>
            )}
            {safeFilters.clientId !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                Client: {clients.find(c => c.id === safeFilters.clientId)?.name || 'Unknown'}
              </span>
            )}
            {safeFilters.userId !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                User: {users.find(u => u.id === safeFilters.userId)?.name || 'Unknown'}
              </span>
            )}
            {safeFilters.amountRange.min && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                Min: {safeFilters.amountRange.min} cUSD
              </span>
            )}
            {safeFilters.amountRange.max && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                Max: {safeFilters.amountRange.max} cUSD
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}