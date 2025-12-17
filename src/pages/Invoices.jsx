import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'
import { getInvoiceCategories, getCategoryLabel, getCategoryColorClasses, getCategoryIcon } from '../utils/categoryUtils'

export default function Invoices() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInvoices, setSelectedInvoices] = useState([])
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showWalletWarning, setShowWalletWarning] = useState(false)

  const invoiceCategories = getInvoiceCategories()

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          clients (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setInvoices(data || [])
    } catch (err) {
      console.error('Error fetching invoices:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      paid: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      voided: 'bg-red-100 text-red-800',
      rejected: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const toggleSelectInvoice = (invoiceId) => {
    setSelectedInvoices((prev) =>
      prev.includes(invoiceId)
        ? prev.filter((id) => id !== invoiceId)
        : [...prev, invoiceId]
    )
  }

  const toggleSelectAll = () => {
    const approvedInvoices = filteredInvoices.filter((inv) => inv.status === 'approved')
    if (selectedInvoices.length === approvedInvoices.length && approvedInvoices.length > 0) {
      setSelectedInvoices([])
    } else {
      setSelectedInvoices(approvedInvoices.map((inv) => inv.id))
    }
  }

  const exportSelectedToCSV = async () => {
    try {
      setExporting(true)
      setError('')
      setSuccess('')

      if (selectedInvoices.length === 0) {
        setError('Please select at least one invoice to export')
        return
      }

      // Get selected invoices with user wallet addresses
      const { data: invoicesToExport, error: fetchError } = await supabase
        .from('invoices')
        .select(`
          *,
          profiles (wallet_address, full_name, email)
        `)
        .in('id', selectedInvoices)

      if (fetchError) throw fetchError

      if (!invoicesToExport || invoicesToExport.length === 0) {
        setError('No invoices found to export')
        return
      }

      // Check for missing wallet addresses
      const missingWallets = invoicesToExport.filter((inv) => !inv.profiles?.wallet_address)
      if (missingWallets.length > 0) {
        setError(
          `${missingWallets.length} invoice(s) have users without wallet addresses. Please ensure all users have configured their wallet addresses in Settings.`
        )
        return
      }

      // Format for Safe (Gnosis Safe) CSV Airdrop
      const csvRows = [
        ['token_type', 'token_address', 'receiver', 'amount', 'id'].join(','),
      ]

      // cUSD on Celo Mainnet
      const cUSD_ADDRESS = '0x765DE816845861e75A25fCA122bb6898B8B1282a'

      invoicesToExport.forEach((invoice) => {
        csvRows.push(
          [
            'erc20',
            cUSD_ADDRESS,
            invoice.profiles.wallet_address,
            parseFloat(invoice.amount).toFixed(2),
            invoice.invoice_number,
          ].join(',')
        )
      })

      const csvContent = csvRows.join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute('download', `celo-invoices-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setSuccess(`Exported ${invoicesToExport.length} invoice(s) to CSV`)
      setSelectedInvoices([])
    } catch (err) {
      setError(err.message)
    } finally {
      setExporting(false)
    }
  }

  const handleCreateInvoiceClick = (e) => {
    if (!profile?.wallet_address) {
      e.preventDefault()
      setShowWalletWarning(true)
      setTimeout(() => setShowWalletWarning(false), 5000)
    }
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || invoice.invoice_category === categoryFilter
    const matchesSearch =
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clients?.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesCategory && matchesSearch
  })

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
            <p className="text-gray-600 mt-1">Manage your invoices</p>
          </div>
          <div className="flex gap-3">
            {selectedInvoices.length > 0 && (
              <button
                onClick={exportSelectedToCSV}
                disabled={exporting}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {exporting ? 'Exporting...' : `📥 Export Selected (${selectedInvoices.length})`}
              </button>
            )}
            {profile?.wallet_address ? (
              <Link to="/invoices/new" className="btn-primary">
                + Create Invoice
              </Link>
            ) : (
              <button
                onClick={handleCreateInvoiceClick}
                className="btn-primary"
              >
                + Create Invoice
              </button>
            )}
          </div>
        </div>

        {/* Wallet Warning */}
        {showWalletWarning && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <span className="text-2xl mr-3">⚠️</span>
              <div className="flex-1">
                <h3 className="text-yellow-900 font-semibold mb-1">
                  Wallet Address Required
                </h3>
                <p className="text-yellow-800 text-sm mb-3">
                  You need to configure your cUSD wallet address before creating invoices. This ensures you can receive payments.
                </p>
                <Link
                  to="/settings"
                  className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  Go to Settings →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                placeholder="🔍 Search by invoice # or client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">All Categories</option>
                {invoiceCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Invoices List */}
        <div className="card">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'No invoices found matching your filters'
                  : 'No invoices yet'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Link to="/invoices/new" className="text-primary-600 hover:text-primary-700">
                  Create your first invoice
                </Link>
              )}
            </div>
          ) : (
            <div>
              {filteredInvoices.filter((inv) => inv.status === 'approved').length > 0 && (
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {selectedInvoices.length > 0
                      ? `${selectedInvoices.length} invoice(s) selected`
                      : 'Select approved invoices to export'}
                  </p>
                  <button
                    onClick={toggleSelectAll}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    {selectedInvoices.length === filteredInvoices.filter((inv) => inv.status === 'approved').length
                      ? 'Deselect All'
                      : 'Select All Approved'}
                  </button>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 w-12">
                        {filteredInvoices.filter((inv) => inv.status === 'approved').length > 0 && (
                          <input
                            type="checkbox"
                            checked={
                              selectedInvoices.length > 0 &&
                              selectedInvoices.length ===
                                filteredInvoices.filter((inv) => inv.status === 'approved').length
                            }
                            onChange={toggleSelectAll}
                            className="rounded"
                          />
                        )}
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Invoice #
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Client
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Category
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Due Date
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Type
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          {invoice.status === 'approved' && (
                            <input
                              type="checkbox"
                              checked={selectedInvoices.includes(invoice.id)}
                              onChange={() => toggleSelectInvoice(invoice.id)}
                              className="rounded"
                            />
                          )}
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
                          {invoice.clients?.name || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {parseFloat(invoice.amount).toFixed(2)} cUSD
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              invoice.status
                            )}`}
                          >
                            {invoice.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {invoice.invoice_category ? (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColorClasses(
                                invoice.invoice_category
                              )}`}
                            >
                              <span>{getCategoryIcon(invoice.invoice_category)}</span>
                              <span>{getCategoryLabel(invoice.invoice_category)}</span>
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">No category</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(invoice.due_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {invoice.is_recurring ? (
                            <span className="flex items-center gap-1">
                              🔄 Recurring
                            </span>
                          ) : (
                            'One-time'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
