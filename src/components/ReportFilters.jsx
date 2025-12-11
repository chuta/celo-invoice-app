import { useState, useEffect } from 'react'
import {
  getPresetDateRange,
  formatDateForInput,
  parseDateFromInput,
  validateFilters,
  getUniqueClients,
  getUniqueUsers,
  getStatusOptions,
  getPresetOptions
} from '../utils/reportUtils'

export default function ReportFilters({ filters, onFiltersChange, invoices, className = '' }) {
  const [validationErrors, setValidationErrors] = useState({})
  const [clients, setClients] = useState([])
  const [users, setUsers] = useState([])

  // Extract unique clients and users from invoices
  useEffect(() => {
    if (invoices && invoices.length > 0) {
      setClients(getUniqueClients(invoices))
      setUsers(getUniqueUsers(invoices))
    }
  }, [invoices])

  // Validate filters when they change
  useEffect(() => {
    const validation = validateFilters(filters)
    setValidationErrors(validation.errors)
  }, [filters])

  const handleDateRangeChange = (field, value) => {
    const date = parseDateFromInput(value)
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: date
      }
    })
  }

  const handlePresetClick = (preset) => {
    const dateRange = getPresetDateRange(preset)
    onFiltersChange({
      ...filters,
      dateRange
    })
  }

  const handleStatusChange = (status) => {
    onFiltersChange({
      ...filters,
      status
    })
  }

  const handleClientChange = (clientId) => {
    onFiltersChange({
      ...filters,
      clientId
    })
  }

  const handleUserChange = (userId) => {
    onFiltersChange({
      ...filters,
      userId
    })
  }

  const handleAmountRangeChange = (field, value) => {
    onFiltersChange({
      ...filters,
      amountRange: {
        ...filters.amountRange,
        [field]: value
      }
    })
  }

  const handleClearFilters = () => {
    onFiltersChange({
      dateRange: { start: null, end: null },
      status: 'all',
      clientId: 'all',
      userId: 'all',
      amountRange: { min: '', max: '' }
    })
  }

  const statusOptions = getStatusOptions()
  const presetOptions = getPresetOptions()

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
                value={formatDateForInput(filters.dateRange.start)}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">End Date</label>
              <input
                type="date"
                value={formatDateForInput(filters.dateRange.end)}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
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

          {/* Client Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client
            </label>
            <select
              value={filters.clientId}
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
              value={filters.userId}
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
                value={filters.amountRange.min}
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
                value={filters.amountRange.max}
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
      {(filters.dateRange.start || filters.dateRange.end || filters.status !== 'all' || 
        filters.clientId !== 'all' || filters.userId !== 'all' || 
        filters.amountRange.min || filters.amountRange.max) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-2">Active Filters:</p>
          <div className="flex flex-wrap gap-1">
            {filters.dateRange.start && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                From: {filters.dateRange.start.toLocaleDateString()}
              </span>
            )}
            {filters.dateRange.end && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                To: {filters.dateRange.end.toLocaleDateString()}
              </span>
            )}
            {filters.status !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Status: {filters.status}
              </span>
            )}
            {filters.clientId !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                Client: {clients.find(c => c.id === filters.clientId)?.name || 'Unknown'}
              </span>
            )}
            {filters.userId !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                User: {users.find(u => u.id === filters.userId)?.name || 'Unknown'}
              </span>
            )}
            {filters.amountRange.min && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                Min: {filters.amountRange.min} cUSD
              </span>
            )}
            {filters.amountRange.max && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                Max: {filters.amountRange.max} cUSD
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}