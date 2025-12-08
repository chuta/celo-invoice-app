import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'

export default function Clients() {
  const { user } = useAuth()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isCeloAfricaDAO, setIsCeloAfricaDAO] = useState(false)

  // CeloAfricaDAO default information
  const CELO_AFRICA_DAO_INFO = {
    name: 'Celo Africa DAO',
    email: 'team@celoafricadao.xyz',
    phone: '',
    address: 'P.O. Box 30772-00100\nNairobi, Kenya',
  }

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  })

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setClients(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      if (editingClient) {
        // Update existing client
        const { error } = await supabase
          .from('clients')
          .update(formData)
          .eq('id', editingClient.id)

        if (error) throw error
        setSuccess('Client updated successfully!')
      } else {
        // Create new client
        const { error } = await supabase
          .from('clients')
          .insert([{ ...formData, user_id: user.id }])

        if (error) throw error
        setSuccess('Client created successfully!')
      }

      fetchClients()
      closeModal()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEdit = (client) => {
    setEditingClient(client)
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      address: client.address || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this client?')) return

    try {
      const { error } = await supabase.from('clients').delete().eq('id', id)

      if (error) throw error
      setSuccess('Client deleted successfully!')
      fetchClients()
    } catch (err) {
      setError(err.message)
    }
  }

  const openModal = () => {
    setEditingClient(null)
    setFormData({ name: '', email: '', phone: '', address: '' })
    setIsCeloAfricaDAO(false)
    setShowModal(true)
    setError('')
    setSuccess('')
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingClient(null)
    setFormData({ name: '', email: '', phone: '', address: '' })
    setIsCeloAfricaDAO(false)
  }

  const handleCeloAfricaDAOToggle = (checked) => {
    setIsCeloAfricaDAO(checked)
    if (checked) {
      setFormData(CELO_AFRICA_DAO_INFO)
    } else {
      setFormData({ name: '', email: '', phone: '', address: '' })
    }
  }

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-600 mt-1">Manage your client information</p>
          </div>
          <button onClick={openModal} className="btn-primary">
            + Add Client
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

        {/* Search */}
        <div className="card">
          <input
            type="text"
            placeholder="🔍 Search clients by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />
        </div>

        {/* Clients List */}
        <div className="card">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'No clients found matching your search' : 'No clients yet'}
              </p>
              {!searchTerm && (
                <button onClick={openModal} className="text-primary-600 hover:text-primary-700">
                  Add your first client
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Phone</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Address</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{client.name}</td>
                      <td className="py-3 px-4 text-gray-600">{client.email}</td>
                      <td className="py-3 px-4 text-gray-600">{client.phone || '-'}</td>
                      <td className="py-3 px-4 text-gray-600">{client.address || '-'}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleEdit(client)}
                          className="text-primary-600 hover:text-primary-700 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingClient ? 'Edit Client' : 'Add New Client'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* CeloAfricaDAO Quick Fill */}
              {!editingClient && (
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCeloAfricaDAO}
                      onChange={(e) => handleCeloAfricaDAOToggle(e.target.checked)}
                      className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900">
                        I'm a CeloAfricaDAO member
                      </span>
                      <p className="text-xs text-gray-600 mt-1">
                        Check this to autofill CeloAfricaDAO organization details
                      </p>
                    </div>
                  </label>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Client name"
                  disabled={isCeloAfricaDAO}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  placeholder="client@example.com"
                  disabled={isCeloAfricaDAO}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                  placeholder="+1234567890"
                  disabled={isCeloAfricaDAO}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="Client address"
                  disabled={isCeloAfricaDAO}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingClient ? 'Update Client' : 'Add Client'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
