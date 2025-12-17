import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { sendEmailNotification } from '../lib/email'
import Layout from '../components/Layout'
import ReportsSection from '../components/ReportsSection'
import { getInvoiceCategories, getCategoryLabel, getCategoryColorClasses, getCategoryIcon } from '../utils/categoryUtils'

export default function Admin() {
  const [stats, setStats] = useState({
    pendingCount: 0,
    approvedCount: 0,
    paidCount: 0,
    totalAmount: 0,
    usersCount: 0,
  })
  const [pendingInvoices, setPendingInvoices] = useState([])
  const [allInvoices, setAllInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [exporting, setExporting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [selectedInvoices, setSelectedInvoices] = useState([])
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [actionNotes, setActionNotes] = useState('')
  const [currentAction, setCurrentAction] = useState(null)

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      setLoading(true)

      // Fetch all invoices with user and client info
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          *,
          clients (name, email),
          profiles (full_name, email)
        `)
        .order('created_at', { ascending: false })

      if (invoicesError) throw invoicesError

      // Calculate stats
      const pending = invoices.filter((inv) => inv.status === 'pending')
      const approved = invoices.filter((inv) => inv.status === 'approved')
      const paid = invoices.filter((inv) => inv.status === 'paid')
      const totalAmount = approved.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)

      // Get users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      setStats({
        pendingCount: pending.length,
        approvedCount: approved.length,
        paidCount: paid.length,
        totalAmount,
        usersCount: usersCount || 0,
      })

      setPendingInvoices(pending)
      setAllInvoices(invoices)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (invoiceId, notes = '') => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ 
          status: 'approved',
          notes: notes || null
        })
        .eq('id', invoiceId)

      if (error) throw error
      
      // Send email notification with notes
      await sendEmailNotification('invoice_approved', invoiceId, notes)
      
      setSuccess('Invoice approved successfully')
      setSelectedInvoices([])
      fetchAdminData()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleReject = async (invoiceId, notes = '') => {
    try {
      const { error} = await supabase
        .from('invoices')
        .update({ 
          status: 'rejected',
          notes: notes || null
        })
        .eq('id', invoiceId)

      if (error) throw error
      
      // Send email notification with notes
      await sendEmailNotification('invoice_rejected', invoiceId, notes)
      
      setSuccess('Invoice rejected')
      setSelectedInvoices([])
      fetchAdminData()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleVoid = async (invoiceId, notes = '') => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ 
          status: 'voided',
          notes: notes || null
        })
        .eq('id', invoiceId)

      if (error) throw error
      
      // Send email notification with notes
      await sendEmailNotification('invoice_voided', invoiceId, notes)
      
      setSuccess('Invoice voided')
      setSelectedInvoices([])
      fetchAdminData()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleMarkAsPaid = async (invoiceId) => {
    console.log('🔄 handleMarkAsPaid called with invoiceId:', invoiceId)
    
    // Add confirmation dialog
    if (!confirm('Mark this invoice as paid?')) {
      console.log('❌ User cancelled mark as paid action')
      return
    }
    
    try {
      console.log('📝 Updating invoice status to paid...')
      const { error } = await supabase
        .from('invoices')
        .update({ 
          status: 'paid',
          paid_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', invoiceId)

      if (error) {
        console.error('❌ Database update failed:', error)
        throw error
      }
      
      console.log('✅ Database update successful')
      
      // Send email notification with better error handling
      console.log('📧 About to send invoice_paid email notification for invoice:', invoiceId)
      console.log('📧 Calling sendEmailNotification function...')
      
      const emailResult = await sendEmailNotification('invoice_paid', invoiceId)
      
      console.log('📧 Email function returned. Result:', emailResult)
      console.log('📧 Email result success:', emailResult?.success)
      console.log('📧 Email result data:', emailResult?.data)
      console.log('📧 Email result error:', emailResult?.error)
      
      if (emailResult.success) {
        console.log('✅ Email notification sent successfully:', emailResult.data)
        setSuccess('Invoice marked as paid and notification sent')
      } else {
        console.error('❌ Email notification failed:', emailResult.error)
        setSuccess(`Invoice marked as paid (email notification failed: ${emailResult.error})`)
      }
      
      setSelectedInvoices([])
      fetchAdminData()
    } catch (err) {
      console.error('❌ Error in handleMarkAsPaid:', err)
      setError(err.message)
    }
  }

  const openActionModal = (action, invoiceId) => {
    setCurrentAction({ action, invoiceId })
    setActionNotes('')
    setShowNotesModal(true)
  }

  const executeAction = async () => {
    if (!currentAction) return

    const { action, invoiceId } = currentAction

    switch (action) {
      case 'approve':
        await handleApprove(invoiceId, actionNotes)
        break
      case 'reject':
        await handleReject(invoiceId, actionNotes)
        break
      case 'void':
        await handleVoid(invoiceId, actionNotes)
        break
    }

    setShowNotesModal(false)
    setCurrentAction(null)
    setActionNotes('')
  }

  const handleBulkApprove = async () => {
    if (selectedInvoices.length === 0) return
    if (!confirm(`Approve ${selectedInvoices.length} invoice(s)?`)) return

    try {
      for (const invoiceId of selectedInvoices) {
        await handleApprove(invoiceId)
      }
      setSuccess(`${selectedInvoices.length} invoice(s) approved`)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleBulkReject = async () => {
    if (selectedInvoices.length === 0) return
    if (!confirm(`Reject ${selectedInvoices.length} invoice(s)?`)) return

    try {
      for (const invoiceId of selectedInvoices) {
        await handleReject(invoiceId)
      }
      setSuccess(`${selectedInvoices.length} invoice(s) rejected`)
    } catch (err) {
      setError(err.message)
    }
  }

  const toggleSelectInvoice = (invoiceId) => {
    setSelectedInvoices((prev) =>
      prev.includes(invoiceId)
        ? prev.filter((id) => id !== invoiceId)
        : [...prev, invoiceId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedInvoices.length === pendingInvoices.length) {
      setSelectedInvoices([])
    } else {
      setSelectedInvoices(pendingInvoices.map((inv) => inv.id))
    }
  }

  const exportToCSV = async () => {
    try {
      setExporting(true)
      setError('')

      // Get approved invoices with user wallet addresses
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select(`
          *,
          profiles (wallet_address, full_name, email)
        `)
        .eq('status', 'approved')

      if (error) throw error

      if (!invoices || invoices.length === 0) {
        setError('No approved invoices to export')
        return
      }

      // Check for missing wallet addresses
      const missingWallets = invoices.filter((inv) => !inv.profiles?.wallet_address)
      if (missingWallets.length > 0) {
        setError(
          `${missingWallets.length} invoice(s) have users without wallet addresses. Please ensure all users have configured their wallet addresses in Settings.`
        )
        return
      }

      // Format for Safe (Gnosis Safe) CSV Airdrop
      // Format: token_type,token_address,receiver,amount,id
      const csvRows = [
        ['token_type', 'token_address', 'receiver', 'amount', 'id'].join(','),
      ]

      // cUSD on Celo Mainnet: 0x765DE816845861e75A25fCA122bb6898B8B1282a
      // cUSD on Celo Alfajores (Testnet): 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1
      const cUSD_ADDRESS = '0x765DE816845861e75A25fCA122bb6898B8B1282a'

      invoices.forEach((invoice) => {
        // Safe CSV Airdrop expects the amount in decimal format (not Wei)
        // The Safe app will handle the conversion to Wei internally
        csvRows.push(
          [
            'erc20',
            cUSD_ADDRESS,
            invoice.profiles.wallet_address,
            parseFloat(invoice.amount).toFixed(2), // Format amount with 2 decimals
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

      setSuccess(`Exported ${invoices.length} approved invoices to CSV`)
    } catch (err) {
      setError(err.message)
    } finally {
      setExporting(false)
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

  const filteredInvoices =
    statusFilter === 'all'
      ? allInvoices
      : (allInvoices || []).filter((inv) => inv.status === statusFilter)

  // Calculate category statistics
  const categoryStats = useMemo(() => {
    const categories = getInvoiceCategories()
    const stats = categories.map(category => {
      const categoryInvoices = allInvoices.filter(inv => inv.invoice_category === category.value)
      const totalAmount = categoryInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
      const approvedCount = categoryInvoices.filter(inv => inv.status === 'approved' || inv.status === 'paid').length
      
      return {
        ...category,
        count: categoryInvoices.length,
        totalAmount,
        approvedCount
      }
    })

    // Add uncategorized invoices
    const uncategorized = allInvoices.filter(inv => !inv.invoice_category)
    if (uncategorized.length > 0) {
      stats.push({
        value: 'uncategorized',
        label: 'Uncategorized',
        count: uncategorized.length,
        totalAmount: uncategorized.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0),
        approvedCount: uncategorized.filter(inv => inv.status === 'approved' || inv.status === 'paid').length
      })
    }

    return stats.filter(stat => stat.count > 0).sort((a, b) => b.totalAmount - a.totalAmount)
  }, [allInvoices])

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage all invoices and users</p>
          </div>
          <button
            onClick={exportToCSV}
            disabled={exporting}
            className="btn-primary disabled:opacity-50"
          >
            {exporting ? 'Exporting...' : '📥 Export Approved to CSV'}
          </button>
        </div>

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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.approvedCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.paidCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💵</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Approved</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalAmount.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">cUSD</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.usersCount}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Analytics */}
        {!loading && categoryStats.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Invoice Categories</h2>
                <p className="text-sm text-gray-600 mt-1">Breakdown by category type</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryStats.map((stat) => (
                <div key={stat.value} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCategoryIcon(stat.value)}</span>
                      <div>
                        <h3 className="font-medium text-gray-900">{stat.label}</h3>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border mt-1 ${
                            stat.value === 'uncategorized' 
                              ? 'bg-gray-100 text-gray-800 border-gray-200'
                              : getCategoryColorClasses(stat.value)
                          }`}
                        >
                          {stat.count} {stat.count === 1 ? 'invoice' : 'invoices'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Amount:</span>
                      <span className="font-semibold text-gray-900">
                        {stat.totalAmount.toFixed(2)} cUSD
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Approved/Paid:</span>
                      <span className="text-sm text-green-600 font-medium">
                        {stat.approvedCount} of {stat.count}
                      </span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${(stat.approvedCount / stat.count) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-right">
                        {((stat.approvedCount / stat.count) * 100).toFixed(0)}% approved
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {categoryStats.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No invoices with categories yet
              </div>
            )}
          </div>
        )}

        {/* Reports Section */}
        <ReportsSection 
          allInvoices={allInvoices}
          loading={loading}
          onRefresh={fetchAdminData}
        />

        {/* Pending Invoices - Quick Actions */}
        {pendingInvoices.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Pending Approvals ({pendingInvoices.length})
              </h2>
              {selectedInvoices.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={handleBulkApprove}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg"
                  >
                    ✓ Approve Selected ({selectedInvoices.length})
                  </button>
                  <button
                    onClick={handleBulkReject}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg"
                  >
                    ✗ Reject Selected ({selectedInvoices.length})
                  </button>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.length === pendingInvoices.length}
                        onChange={toggleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Invoice #
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Client
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Due Date
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedInvoices.includes(invoice.id)}
                          onChange={() => toggleSelectInvoice(invoice.id)}
                          className="rounded"
                        />
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
                      <td className="py-3 px-4 text-gray-900">
                        {parseFloat(invoice.amount).toFixed(2)} cUSD
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(invoice.due_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openActionModal('approve', invoice.id)}
                            className="text-green-600 hover:text-green-700 font-medium text-sm"
                            title="Approve with optional notes"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => openActionModal('reject', invoice.id)}
                            className="text-red-600 hover:text-red-700 font-medium text-sm"
                            title="Reject with optional notes"
                          >
                            ✗ Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* All Invoices */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">All Invoices</h2>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field w-48"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="draft">Draft</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
              <option value="voided">Voided</option>
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No invoices found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Invoice #
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">User</th>
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
                      Due Date
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
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
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(invoice.due_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          {invoice.status === 'pending' && (
                            <>
                              <button
                                onClick={() => openActionModal('approve', invoice.id)}
                                className="text-green-600 hover:text-green-700 text-sm"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => openActionModal('reject', invoice.id)}
                                className="text-red-600 hover:text-red-700 text-sm"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {invoice.status === 'approved' && (
                            <>
                              <button
                                onClick={() => handleMarkAsPaid(invoice.id)}
                                className="text-blue-600 hover:text-blue-700 text-sm"
                              >
                                Mark Paid
                              </button>
                              <button
                                onClick={() => openActionModal('void', invoice.id)}
                                className="text-red-600 hover:text-red-700 text-sm"
                              >
                                Void
                              </button>
                            </>
                          )}
                          {invoice.status === 'rejected' && (
                            <button
                              onClick={() => handleApprove(invoice.id)}
                              className="text-green-600 hover:text-green-700 text-sm"
                            >
                              Re-approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Action Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {currentAction?.action === 'approve' && '✓ Approve Invoice'}
              {currentAction?.action === 'reject' && '✗ Reject Invoice'}
              {currentAction?.action === 'void' && '⊘ Void Invoice'}
            </h2>

            <p className="text-sm text-gray-600 mb-4">
              {currentAction?.action === 'approve' &&
                'Optionally add notes about this approval (visible to user).'}
              {currentAction?.action === 'reject' &&
                'Add notes explaining why this invoice was rejected (visible to user).'}
              {currentAction?.action === 'void' &&
                'Add notes explaining why this invoice was voided (visible to user).'}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                className="input-field"
                rows="4"
                placeholder="Add any notes or comments..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={executeAction}
                className={`flex-1 font-medium py-2 px-4 rounded-lg transition-colors ${
                  currentAction?.action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {currentAction?.action === 'approve' && 'Approve'}
                {currentAction?.action === 'reject' && 'Reject'}
                {currentAction?.action === 'void' && 'Void'}
              </button>
              <button
                onClick={() => {
                  setShowNotesModal(false)
                  setCurrentAction(null)
                  setActionNotes('')
                }}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
