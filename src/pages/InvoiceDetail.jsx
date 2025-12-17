import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { sendEmailNotification } from '../lib/email'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'
import { getCategoryLabel, getCategoryColorClasses, getCategoryIcon } from '../utils/categoryUtils'

export default function InvoiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [invoice, setInvoice] = useState(null)
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchInvoice()
  }, [id])

  const fetchInvoice = async () => {
    try {
      setLoading(true)
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          *,
          profiles (
            full_name,
            email,
            wallet_address
          )
        `)
        .eq('id', id)
        .single()

      if (invoiceError) throw invoiceError

      setInvoice(invoiceData)

      if (invoiceData.client_id) {
        const { data: clientData } = await supabase
          .from('clients')
          .select('*')
          .eq('id', invoiceData.client_id)
          .single()

        setClient(clientData)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this invoice?')) return

    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'cancelled' })
        .eq('id', id)

      if (error) throw error
      
      // Send email notification
      await sendEmailNotification('invoice_cancelled', id)
      
      setSuccess('Invoice cancelled successfully')
      fetchInvoice()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleApprove = async () => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'approved' })
        .eq('id', id)

      if (error) throw error
      
      // Send email notification
      await sendEmailNotification('invoice_approved', id)
      
      setSuccess('Invoice approved successfully')
      fetchInvoice()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleReject = async () => {
    if (!confirm('Are you sure you want to reject this invoice?')) return

    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'rejected' })
        .eq('id', id)

      if (error) throw error
      
      // Send email notification
      await sendEmailNotification('invoice_rejected', id)
      
      setSuccess('Invoice rejected')
      fetchInvoice()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleVoid = async () => {
    if (!confirm('Are you sure you want to void this invoice? This action cannot be undone.')) return

    try {
      console.log('🔄 handleVoid called for invoice:', id)
      
      // Update invoice status in database
      console.log('📝 Updating invoice status to voided...')
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'voided' })
        .eq('id', id)

      if (error) {
        console.error('❌ Database update failed:', error)
        throw error
      }
      
      console.log('✅ Database update successful')
      
      // Send email notification
      console.log('📧 Sending invoice_voided email notification...')
      const emailResult = await sendEmailNotification('invoice_voided', id)
      
      console.log('📧 Email result:', emailResult)
      
      if (emailResult.success) {
        console.log('✅ Email notification sent successfully')
        setSuccess('Invoice voided and notification sent')
      } else {
        console.error('❌ Email notification failed:', emailResult.error)
        setSuccess(`Invoice voided (email notification failed: ${emailResult.error})`)
      }
      
      fetchInvoice()
    } catch (err) {
      console.error('❌ Error in handleVoid:', err)
      setError(err.message)
    }
  }

  const handleMarkPaid = async () => {
    if (!confirm('Mark this invoice as paid?')) return

    try {
      console.log('🔄 handleMarkPaid called for invoice:', id)
      
      // Update invoice status in database
      console.log('📝 Updating invoice status to paid...')
      const { error } = await supabase
        .from('invoices')
        .update({ 
          status: 'paid',
          paid_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', id)

      if (error) {
        console.error('❌ Database update failed:', error)
        throw error
      }
      
      console.log('✅ Database update successful')
      
      // Send email notification
      console.log('📧 Sending invoice_paid email notification...')
      const emailResult = await sendEmailNotification('invoice_paid', id)
      
      console.log('📧 Email result:', emailResult)
      
      if (emailResult.success) {
        console.log('✅ Email notification sent successfully')
        setSuccess('Invoice marked as paid and notification sent')
      } else {
        console.error('❌ Email notification failed:', emailResult.error)
        setSuccess(`Invoice marked as paid (email notification failed: ${emailResult.error})`)
      }
      
      fetchInvoice()
    } catch (err) {
      console.error('❌ Error in handleMarkPaid:', err)
      setError(err.message)
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

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  if (!invoice) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Invoice not found</p>
          <Link to="/invoices" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
            Back to Invoices
          </Link>
        </div>
      </Layout>
    )
  }

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'
  const canEdit = invoice.status === 'draft'
  const canCancel = ['draft', 'pending'].includes(invoice.status)
  const canApprove = invoice.status === 'pending' && isAdmin
  const canReject = invoice.status === 'pending' && isAdmin
  const canVoid = invoice.status === 'approved' && isAdmin
  const canMarkPaid = invoice.status === 'approved' && isAdmin

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link to="/invoices" className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-block">
              ← Back to Invoices
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Invoice {invoice.invoice_number}</h1>
            {invoice.invoice_category && (
              <div className="mt-2">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColorClasses(
                    invoice.invoice_category
                  )}`}
                >
                  <span>{getCategoryIcon(invoice.invoice_category)}</span>
                  <span>{getCategoryLabel(invoice.invoice_category)}</span>
                </span>
              </div>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
            {invoice.status}
          </span>
        </div>

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

        {/* Invoice Details */}
        <div className="card">
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* From */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">From</h3>
              {invoice.profiles ? (
                <>
                  <p className="font-medium text-gray-900">{invoice.profiles.full_name || 'No name'}</p>
                  <p className="text-sm text-gray-600">{invoice.profiles.email}</p>
                  {invoice.profiles.wallet_address && (
                    <p className="text-sm text-gray-600 font-mono mt-1">
                      {invoice.profiles.wallet_address.slice(0, 6)}...{invoice.profiles.wallet_address.slice(-4)}
                    </p>
                  )}
                </>
              ) : (
                <p className="font-medium text-gray-900">User information not available</p>
              )}
            </div>

            {/* To */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Billed To</h3>
              {client ? (
                <>
                  <p className="font-medium text-gray-900">{client.name}</p>
                  <p className="text-sm text-gray-600">{client.email}</p>
                  {client.phone && <p className="text-sm text-gray-600">{client.phone}</p>}
                  {client.address && <p className="text-sm text-gray-600">{client.address}</p>}
                </>
              ) : (
                <p className="text-gray-500">No client information</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-200">
            <div>
              <p className="text-sm text-gray-600">Issue Date</p>
              <p className="font-medium text-gray-900">
                {new Date(invoice.issue_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Due Date</p>
              <p className="font-medium text-gray-900">
                {new Date(invoice.due_date).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Line Items</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm font-medium text-gray-700">Description</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-700">Qty</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-700">Price</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.line_items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 text-gray-900">{item.description}</td>
                    <td className="py-3 text-right text-gray-600">{item.quantity}</td>
                    <td className="py-3 text-right text-gray-600">
                      {parseFloat(item.unit_price).toFixed(2)} cUSD
                    </td>
                    <td className="py-3 text-right text-gray-900 font-medium">
                      {(item.quantity * item.unit_price).toFixed(2)} cUSD
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-2 border-t-2 border-gray-900">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-xl text-primary-600">
                  {parseFloat(invoice.amount).toFixed(2)} cUSD
                </span>
              </div>
            </div>
          </div>

          {/* Memo & Notes */}
          {(invoice.memo || invoice.notes) && (
            <div className="mt-8 pt-8 border-t border-gray-200 space-y-4">
              {invoice.memo && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Memo</h3>
                  <p className="text-gray-900">{invoice.memo}</p>
                </div>
              )}
              {invoice.notes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Notes</h3>
                  <p className="text-gray-600">{invoice.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Recurring Info */}
          {invoice.is_recurring && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  🔄 This is a recurring invoice ({invoice.recurrence_frequency})
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
          
          {/* Admin Actions for Pending Invoices */}
          {canApprove && (
            <div className="mb-4 pb-4 border-b border-gray-200">
              <p className="text-sm text-gray-600 mb-3">Admin Actions:</p>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={handleApprove} 
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span>✓</span>
                  <span>Approve Invoice</span>
                </button>
                <button 
                  onClick={handleReject} 
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span>✗</span>
                  <span>Reject Invoice</span>
                </button>
              </div>
            </div>
          )}

          {/* Admin Actions for Approved Invoices */}
          {canVoid && (
            <div className="mb-4 pb-4 border-b border-gray-200">
              <p className="text-sm text-gray-600 mb-3">Admin Actions:</p>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={handleMarkPaid} 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span>💰</span>
                  <span>Mark as Paid</span>
                </button>
                <button 
                  onClick={handleVoid} 
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span>⊘</span>
                  <span>Void Invoice</span>
                </button>
              </div>
            </div>
          )}

          {/* User Actions */}
          {(canCancel || canEdit) && (
            <div>
              <p className="text-sm text-gray-600 mb-3">
                {isAdmin ? 'Other Actions:' : 'Available Actions:'}
              </p>
              <div className="flex flex-wrap gap-3">
                {canCancel && !isAdmin && (
                  <button onClick={handleCancel} className="btn-secondary">
                    Cancel Invoice
                  </button>
                )}
                {canEdit && (
                  <Link to={`/invoices/${id}/edit`} className="btn-secondary">
                    Edit Invoice
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* No Actions Available */}
          {!canApprove && !canReject && !canVoid && !canMarkPaid && !canCancel && !canEdit && (
            <p className="text-gray-500 text-sm">
              No actions available for this invoice in its current status.
            </p>
          )}
        </div>
      </div>
    </Layout>
  )
}
