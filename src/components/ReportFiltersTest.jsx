import { useState } from 'react'
import ReportFilters from './ReportFilters'
import { useReportFilters } from '../hooks/useReportFilters'

// Mock invoice data for testing
const mockInvoices = [
  {
    id: '1',
    invoice_number: 'INV-001',
    amount: '100.00',
    status: 'pending',
    issue_date: '2024-12-01',
    due_date: '2024-12-15',
    client_id: 'client-1',
    user_id: 'user-1',
    clients: { name: 'Client A', email: 'clienta@example.com' },
    profiles: { full_name: 'User One', email: 'user1@example.com' }
  },
  {
    id: '2',
    invoice_number: 'INV-002',
    amount: '250.50',
    status: 'approved',
    issue_date: '2024-12-05',
    due_date: '2024-12-20',
    client_id: 'client-2',
    user_id: 'user-2',
    clients: { name: 'Client B', email: 'clientb@example.com' },
    profiles: { full_name: 'User Two', email: 'user2@example.com' }
  },
  {
    id: '3',
    invoice_number: 'INV-003',
    amount: '75.25',
    status: 'paid',
    issue_date: '2024-11-28',
    due_date: '2024-12-12',
    client_id: 'client-1',
    user_id: 'user-1',
    clients: { name: 'Client A', email: 'clienta@example.com' },
    profiles: { full_name: 'User One', email: 'user1@example.com' }
  }
]

export default function ReportFiltersTest() {
  const {
    filters,
    filteredInvoices,
    validation,
    hasActiveFilters,
    filterSummary,
    updateFilters,
    resetFilters
  } = useReportFilters(mockInvoices)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Report Filters Test</h1>
      
      <ReportFilters
        filters={filters}
        onFiltersChange={updateFilters}
        invoices={mockInvoices}
        className="mb-6"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Filter State */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Filter State</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Has Active Filters:</strong> {hasActiveFilters ? 'Yes' : 'No'}</p>
            <p><strong>Validation:</strong> {validation.isValid ? 'Valid' : 'Invalid'}</p>
            {!validation.isValid && (
              <div className="text-red-600">
                <p><strong>Errors:</strong></p>
                <ul className="list-disc list-inside">
                  {Object.entries(validation.errors).map(([key, error]) => (
                    <li key={key}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            {filterSummary.length > 0 && (
              <div>
                <p><strong>Summary:</strong></p>
                <ul className="list-disc list-inside">
                  {filterSummary.map((summary, index) => (
                    <li key={index}>{summary}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Filtered Results */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            Filtered Results ({filteredInvoices.length} of {mockInvoices.length})
          </h3>
          <div className="space-y-2">
            {filteredInvoices.map((invoice) => (
              <div key={invoice.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{invoice.invoice_number}</p>
                    <p className="text-sm text-gray-600">
                      {invoice.clients.name} • {invoice.profiles.full_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {invoice.amount} cUSD • {invoice.status}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p>Issue: {new Date(invoice.issue_date).toLocaleDateString()}</p>
                    <p>Due: {new Date(invoice.due_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
            {filteredInvoices.length === 0 && (
              <p className="text-gray-500 text-center py-4">No invoices match the current filters</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={resetFilters}
          className="btn-secondary"
        >
          Reset Filters
        </button>
        <button
          onClick={() => console.log('Current filters:', filters)}
          className="btn-primary"
        >
          Log Filters to Console
        </button>
      </div>
    </div>
  )
}