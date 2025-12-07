import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'

export default function UserManagement() {
  const { isSuperAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (isSuperAdmin) {
      fetchUsers()
    }
  }, [isSuperAdmin])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      setError('')
      setSuccess('')

      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      setSuccess(`User role updated to ${newRole}`)
      fetchUsers()
    } catch (err) {
      setError(err.message)
    }
  }

  const getRoleBadgeColor = (role) => {
    const colors = {
      super_admin: 'bg-purple-100 text-purple-800',
      admin: 'bg-blue-100 text-blue-800',
      user: 'bg-gray-100 text-gray-800',
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  const getRoleIcon = (role) => {
    const icons = {
      super_admin: '👑',
      admin: '🔐',
      user: '👤',
    }
    return icons[role] || '👤'
  }

  const filteredUsers = users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isSuperAdmin) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-600 text-lg">Access Denied</p>
          <p className="text-gray-600 mt-2">Only super admins can access this page.</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage user roles and permissions</p>
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

        {/* Info Box */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">👑</span>
            <div>
              <h3 className="font-semibold text-purple-900">Super Admin Privileges</h3>
              <p className="text-sm text-purple-700 mt-1">
                As a super admin, you can promote users to admin or demote them back to regular users.
                Super admin status can only be changed directly in the database.
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="card">
          <input
            type="text"
            placeholder="🔍 Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />
        </div>

        {/* Users Table */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            All Users ({filteredUsers.length})
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Wallet Address
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Current Role
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Joined
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold text-sm">
                            {user.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">
                            {user.full_name || 'No name'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{user.email}</td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {user.wallet_address ? (
                          <span className="font-mono">
                            {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
                          </span>
                        ) : (
                          <span className="text-gray-400">Not set</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {getRoleIcon(user.role)} {user.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {user.role === 'super_admin' ? (
                          <span className="text-xs text-gray-500">Protected</span>
                        ) : (
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="user">👤 User</option>
                            <option value="admin">🔐 Admin</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Role Descriptions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Role Descriptions</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <span className="text-2xl">👑</span>
              <div>
                <h3 className="font-semibold text-purple-900">Super Admin</h3>
                <p className="text-sm text-purple-700">
                  Full system access. Can manage user roles, approve invoices, export data, and
                  access all features. Cannot be changed via UI.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-2xl">🔐</span>
              <div>
                <h3 className="font-semibold text-blue-900">Admin</h3>
                <p className="text-sm text-blue-700">
                  Can view all invoices, approve/reject submissions, export to CSV, and access admin
                  dashboard. Cannot manage user roles.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">👤</span>
              <div>
                <h3 className="font-semibold text-gray-900">User</h3>
                <p className="text-sm text-gray-700">
                  Can create and manage own invoices, add clients, and configure wallet address.
                  Cannot access admin features.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
