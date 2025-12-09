import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'

export default function PaymentRequests() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [processingId, setProcessingId] = useState(null)

  useEffect(() => {
    fetchPaymentRequests()
  }, [statusFilter, user])

  const fetchPaymentRequests = async () => {
    try {
      setLoading(true)
      setError('')
      
      let query = supabase
        .from('public_payment_requests')
        .select('*')
        .eq('recipient_user_id', user.id)
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching payment requests:', error)
        throw error
      }
      
      console.log('Payment requests loaded:', data?.length || 0)
      setRequests(data || [])
    } catch (err) {
      setError(`Failed to load payment requests: ${err.message}`)
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateInvoice = async (request) => {
    try {
      setProcessingId(request.id)
      setError('')
      setSuccess('')

      // Create a client first if they don't exist
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('email', request.payer_email)
        .eq('user_id', user.id)
        .single()

      let clientId = existingClient?.id

      if (!clientId) {
        // Create new client
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            user_id: user.id,
            name: request.payer_name,
            email: request.payer_email,
          })
          .select()
          .single()

        if (clientError) throw clientError
        clientId = newClient.id
      }

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          user_id: user.id,
          client_id: clientId,
          invoice_type: 'one_time',
          status: 'approved', // Auto-approve since it came from payment link
          amount: request.amount,
          currency: request.currency,
          issue_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
          line_items: [
            {
              description: request.description || 'Payment via payment link',
              quantity: 1,
              unit_price: request.amount,
            },
          ],
          memo: `Payment request from ${request.payer_name}`,
          notes: `Created from payment link request`,
        })
        .select()
        .single()

      if (invoiceError) throw invoiceError

      // Update payment request with invoice ID and mark as completed
      const { error: updateError } = await supabase
        .from('public_payment_requests')
        .update({
          status: 'completed',
          invoice_id: invoice.id,
          completed_at: new Date().toISOString(),
        })
        .eq('id', request.id)

      if (updateError) throw updateError

      setSuccess('Invoice created successfully!')
      fetchPaymentRequests()

      // Navigate to invoice after a short delay
      setTimeout(() => {
        navigate(`/invoices/${invoice.id}`)
      }, 1500)
    } catch (err) {
      setError(err.message)
      console.error(err)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (requestId) => {
    if (!confirm('Are you sure you want to reject this payment request?')) return

    try {
      setProcessingId(requestId)
      setError('')

      const { error } = await supabase
        .from('public_payment_requests')
        .update({ status: 'expired' })
        .eq('id', requestId)

      if (error) throw error

      setSuccess('Payment request rejected')
      fetchPaymentRequests()
    } catch (err) {
      setError(err.message)
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      expired: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Requests</h1>
            <p className="text-gray-600 mt-1">
              Requests received via your payment link
            </p>
          </div>
          <button
            onClick={fetchPaymentRequests}
            disabled={loading}
            className="btn-secondary disabled:opacity-50"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Success/Error Messages */}
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

        {/* Filter */}
        <div className="card">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field max-w-xs"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="expired">Rejected</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>

        {/* Payment Requests List */}
        <div className="card">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-500 mb-4">
                {statusFilter === 'pending'
                  ? 'No pending payment requests'
                  : 'No payment requests found'}
              </p>
              <p className="text-sm text-gray-400">
                Share your payment link to start receiving requests
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {request.payer_name}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {request.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{request.payer_email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary-600">
                        {parseFloat(request.amount).toFixed(2)} {request.currency}
                      </p>
                    </div>
                  </div>

                  {request.description && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{request.description}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>Received: {formatDate(request.created_at)}</span>
                    {request.expires_at && request.status === 'pending' && (
                      <span>Expires: {formatDate(request.expires_at)}</span>
                    )}
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCreateInvoice(request)}
                        disabled={processingId === request.id}
                        className="flex-1 btn-primary disabled:opacity-50"
                      >
                        {processingId === request.id
                          ? 'Creating Invoice...'
                          : '✅ Create Invoice'}
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        disabled={processingId === request.id}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  )}

                  {request.status === 'completed' && request.invoice_id && (
                    <button
                      onClick={() => navigate(`/invoices/${request.invoice_id}`)}
                      className="w-full btn-secondary"
                    >
                      📄 View Invoice
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        {!loading && requests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-primary-600">
                {requests
                  .reduce((sum, r) => sum + parseFloat(r.amount), 0)
                  .toFixed(2)}{' '}
                cUSD
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {requests.filter((r) => r.status === 'pending').length}
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
