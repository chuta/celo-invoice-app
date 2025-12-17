import { useMemo } from 'react'
import { 
  calculateReportStatistics, 
  calculatePercentageChange, 
  formatCurrency, 
  getStatusColorClasses, 
  getStatusIcon 
} from '../utils/reportUtils'

/**
 * Calculate percentage change for trends
 * @param {Array} trends - Monthly trends array
 * @returns {Object} Trend analysis with percentage change
 */
const calculateTrendAnalysis = (trends) => {
  if (trends.length < 2) {
    return { change: 0, direction: 'neutral' }
  }
  
  const current = trends[trends.length - 1].totalAmount
  const previous = trends[trends.length - 2].totalAmount
  
  return calculatePercentageChange(current, previous)
}

/**
 * ReportStatistics Component
 * Displays comprehensive statistics and visual summaries for filtered invoice data
 */
const ReportStatistics = ({ invoices, loading = false }) => {
  // Calculate statistics using memoization for performance
  const statistics = useMemo(() => calculateReportStatistics(invoices), [invoices])
  const trendAnalysis = useMemo(() => calculateTrendAnalysis(statistics.monthlyTrends), [statistics.monthlyTrends])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Invoices */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {statistics.totalInvoices.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(statistics.totalRevenue)}
              </p>
              <div className="flex items-center mt-1">
                {trendAnalysis.direction === 'up' && (
                  <span className="text-xs text-green-600 flex items-center">
                    ↗ +{trendAnalysis.change.toFixed(1)}%
                  </span>
                )}
                {trendAnalysis.direction === 'down' && (
                  <span className="text-xs text-red-600 flex items-center">
                    ↘ -{trendAnalysis.change.toFixed(1)}%
                  </span>
                )}
                {trendAnalysis.direction === 'neutral' && (
                  <span className="text-xs text-gray-500">→ No change</span>
                )}
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        {/* Average Invoice Amount */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Amount</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {formatCurrency(statistics.averageAmount)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>

        {/* Pending Invoices */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {statistics.statusDistribution.pending || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {statistics.statusDistribution && typeof statistics.statusDistribution === 'object' && Object.entries(statistics.statusDistribution).map(([status, count]) => (
            <div key={status} className="text-center">
              <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border ${getStatusColorClasses(status)}`}>
                <span className="mr-2">{getStatusIcon(status)}</span>
                <span className="capitalize">{status}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{count}</p>
              <p className="text-xs text-gray-500">
                {statistics.totalInvoices > 0 
                  ? `${((count / statistics.totalInvoices) * 100).toFixed(1)}%`
                  : '0%'
                }
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Clients and Monthly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clients */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Clients by Revenue</h3>
          {statistics.topClients.length > 0 ? (
            <div className="space-y-3">
              {statistics.topClients.map((client, index) => (
                <div key={client.clientId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-bold text-primary-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{client.clientName}</p>
                      <p className="text-sm text-gray-500">{client.invoiceCount} invoices</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(client.totalAmount)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl mb-2 block">📊</span>
              <p>No client data available</p>
            </div>
          )}
        </div>

        {/* Monthly Trends */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends (Last 6 Months)</h3>
          {statistics.monthlyTrends.length > 0 ? (
            <div className="space-y-3">
              {statistics.monthlyTrends.map((month, index) => {
                const maxAmount = Math.max(...statistics.monthlyTrends.map(m => m.totalAmount))
                const widthPercentage = maxAmount > 0 ? (month.totalAmount / maxAmount) * 100 : 0
                
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{month.month}</span>
                      <span className="text-sm text-gray-900">{formatCurrency(month.totalAmount)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${widthPercentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {month.invoiceCount} invoice{month.invoiceCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl mb-2 block">📈</span>
              <p>No trend data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReportStatistics