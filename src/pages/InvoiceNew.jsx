import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { sendEmailNotification } from '../lib/email'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'

export default function InvoiceNew() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [checkingWallet, setCheckingWallet] = useState(true)

  const [formData, setFormData] = useState({
    client_id: '',
    invoice_category: '',
    invoice_type: 'one_time',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    memo: '',
    notes: '',
    is_recurring: false,
    recurrence_frequency: 'monthly',
  })

  const invoiceCategories = [
    { value: 'judges_mentors', label: 'Judges & Mentors' },
    { value: 'hackerdao_winners', label: 'HackerDAO Winners' },
    { value: 'hackathon_winners', label: 'Hackathon Winners' },
    { value: 'incubation_winners', label: 'Incubation Winners' },
    { value: 'dao_contributor_allowance', label: 'DAO Contributor Allowance' },
    { value: 'monthly_events', label: 'Monthly Events' },
  ]

  const [lineItems, setLineItems] = useState([
    { description: '', quantity: 1, unit_price: 0 },
  ])

  useEffect(() => {
    checkWalletAddress()
    fetchClients()
  }, [])

  const checkWalletAddress = async () => {
    setCheckingWallet(true)
    // Wait a moment for profile to load if needed
    await new Promise(resolve => setTimeout(resolve, 100))
    
    if (!profile?.wallet_address) {
      // Redirect to settings if no wallet address
      navigate('/settings', { 
        state: { 
          message: 'Please configure your cUSD wallet address before creating invoices.' 
        } 
      })
    }
    setCheckingWallet(false)
  }

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name')

      if (error) throw error
      setClients(data || [])
    } catch (err) {
      setError('Failed to load clients')
    }
  }

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unit_price: 0 }])
  }

  const removeLineItem = (index) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index))
    }
  }

  const updateLineItem = (index, field, value) => {
    const updated = [...lineItems]
    updated[index][field] = value
    setLineItems(updated)
  }

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0)
    }, 0)
  }

  const handleSaveDraft = async () => {
    await handleSubmit('draft')
  }

  const handleSubmitForApproval = async () => {
    await handleSubmit('pending')
  }

  const handleSubmit = async (status) => {
    setError('')
    setLoading(true)

    try {
      // Validation
      if (!formData.client_id) {
        throw new Error('Please select a client')
      }
      if (!formData.invoice_category) {
        throw new Error('Please select an invoice category')
      }
      if (!formData.due_date) {
        throw new Error('Please set a due date')
      }
      if (lineItems.some((item) => !item.description || item.unit_price <= 0)) {
        throw new Error('Please fill in all line items with valid amounts')
      }

      const total = calculateTotal()
      if (total <= 0) {
        throw new Error('Invoice total must be greater than 0')
      }

      const invoiceData = {
        user_id: user.id,
        client_id: formData.client_id,
        invoice_category: formData.invoice_category,
        invoice_type: formData.invoice_type,
        status: status,
        amount: total,
        currency: 'cUSD',
        issue_date: formData.issue_date,
        due_date: formData.due_date,
        line_items: lineItems,
        memo: formData.memo,
        notes: formData.notes,
        is_recurring: formData.is_recurring,
        recurrence_frequency: formData.is_recurring ? formData.recurrence_frequency : null,
      }

      const { data, error } = await supabase
        .from('invoices')
        .insert([invoiceData])
        .select()
        .single()

      if (error) throw error

      // Send email notification if submitted for approval
      if (status === 'pending') {
        await sendEmailNotification('invoice_pending', data.id)
      }

      navigate(`/invoices/${data.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const selectedClient = clients.find((c) => c.id === formData.client_id)

  if (checkingWallet) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Invoice</h1>
          <p className="text-gray-600 mt-1">Fill in the details below</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Selection */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Client *
                  </label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Choose a client...</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} ({client.email})
                      </option>
                    ))}
                  </select>
                  {clients.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      No clients found.{' '}
                      <a href="/clients" className="text-primary-600 hover:text-primary-700">
                        Add a client first
                      </a>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invoice Category *
                  </label>
                  <select
                    value={formData.invoice_category}
                    onChange={(e) => setFormData({ ...formData, invoice_category: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Choose a category...</option>
                    {invoiceCategories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Select the category that best describes this invoice
                  </p>
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issue Date *
                    </label>
                    <input
                      type="date"
                      value={formData.issue_date}
                      onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_recurring}
                      onChange={(e) =>
                        setFormData({ ...formData, is_recurring: e.target.checked })
                      }
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Make this a recurring invoice
                    </span>
                  </label>
                </div>

                {formData.is_recurring && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recurrence Frequency
                    </label>
                    <select
                      value={formData.recurrence_frequency}
                      onChange={(e) =>
                        setFormData({ ...formData, recurrence_frequency: e.target.value })
                      }
                      className="input-field"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Line Items */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Line Items</h2>
              <div className="space-y-4">
                {lineItems.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    {/* Description - Full Width */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Description *
                      </label>
                      <input
                        type="text"
                        placeholder="Item description"
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        className="input-field"
                        required
                      />
                    </div>

                    {/* Quantity and Price - Side by Side on Mobile */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          placeholder="Qty"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Price (cUSD) *
                        </label>
                        <input
                          type="number"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateLineItem(index, 'unit_price', e.target.value)}
                          className="input-field"
                          required
                        />
                      </div>
                    </div>

                    {/* Total and Delete Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div>
                        <span className="text-xs text-gray-600">Total: </span>
                        <span className="text-base font-semibold text-gray-900">
                          {(item.quantity * item.unit_price).toFixed(2)} cUSD
                        </span>
                      </div>
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addLineItem}
                className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                + Add Line Item
              </button>
            </div>

            {/* Notes */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Memo</label>
                  <input
                    type="text"
                    value={formData.memo}
                    onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                    className="input-field"
                    placeholder="Brief description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input-field"
                    rows="3"
                    placeholder="Additional notes or terms"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
              
              {selectedClient && (
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600">Billed to:</p>
                  <p className="font-medium text-gray-900">{selectedClient.name}</p>
                  <p className="text-sm text-gray-600">{selectedClient.email}</p>
                </div>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">{calculateTotal().toFixed(2)} cUSD</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span className="text-primary-600">{calculateTotal().toFixed(2)} cUSD</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleSubmitForApproval}
                  disabled={loading}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit for Approval'}
                </button>
                <button
                  onClick={handleSaveDraft}
                  disabled={loading}
                  className="w-full btn-secondary disabled:opacity-50"
                >
                  Save as Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
