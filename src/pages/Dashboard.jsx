import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'

export default function Dashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState({
    totalInvoices: 0,
    pendingInvoices: 0,
    approvedInvoices: 0,
    totalAmount: 0,
  })
  const [recentInvoices, setRecentInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch invoice stats
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error

      // Calculate stats
      const total = invoices?.length || 0
      const pending = invoices?.filter((inv) => inv.status === 'pending').length || 0
      const approved = invoices?.filter((inv) => inv.status === 'approved').length || 0
      const totalAmount = invoices?.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0) || 0

      setStats({
        totalInvoices: total,
        pendingInvoices: pending,
        approvedInvoices: approved,
        totalAmount,
      })

      setRecentInvoices(invoices || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
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

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Welcome back, {profile?.full_name || 'User'}! 👋
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Here's what's happening with your invoices</p>
          </div>
          <Link 
            to="/invoices/new" 
            className="btn-primary text-center whitespace-nowrap px-6 py-3 text-base font-semibold shadow-lg"
          >
            + Create Invoice
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <div className="card p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-600">Total Invoices</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{stats.totalInvoices}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl sm:text-2xl">📄</span>
              </div>
            </div>
          </div>

          <div className="card p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-600">Pending</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-600 mt-1">{stats.pendingInvoices}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl sm:text-2xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="card p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-600">Approved</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">{stats.approvedInvoices}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl sm:text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="card p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-600">Total Amount</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalAmount.toFixed(2)} <span className="text-sm sm:text-base">cUSD</span>
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xl sm:text-2xl">💰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Invoices</h2>
            <Link to="/invoices" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View all →
            </Link>
          </div>

          {recentInvoices.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-5xl mb-4 block">📄</span>
              <p className="text-gray-500 mb-3">No invoices yet</p>
              <Link to="/invoices/new" className="btn-primary inline-block">
                Create your first invoice
              </Link>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden space-y-3">
                {recentInvoices.map((invoice) => (
                  <Link
                    key={invoice.id}
                    to={`/invoices/${invoice.id}`}
                    className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-primary-600 text-base">
                          {invoice.invoice_number}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          Due: {new Date(invoice.due_date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-gray-900">
                        {parseFloat(invoice.amount).toFixed(2)} cUSD
                      </p>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Invoice #</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInvoices.map((invoice) => (
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
                          {parseFloat(invoice.amount).toFixed(2)} cUSD
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(invoice.due_date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
