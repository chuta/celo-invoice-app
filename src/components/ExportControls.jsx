import { useState } from 'react'
import { 
  generateCSVContent, 
  downloadCSVFile, 
  generateExportFilename,
  generatePDFContent,
  downloadPDFFile,
  calculateReportStatistics
} from '../utils/reportUtils'

/**
 * ExportControls Component
 * Provides CSV export functionality for report data
 * Includes progress indicators and success/error notifications
 */
export default function ExportControls({ 
  invoices = [], 
  filters = {}, 
  disabled = false,
  className = '' 
}) {
  const [exportLoading, setExportLoading] = useState(false)
  const [pdfExportLoading, setPdfExportLoading] = useState(false)
  const [exportStatus, setExportStatus] = useState(null) // 'success', 'error', or null
  const [exportMessage, setExportMessage] = useState('')

  /**
   * Handle CSV export with progress tracking
   */
  const handleCSVExport = async () => {
    try {
      setExportLoading(true)
      setExportStatus(null)
      setExportMessage('')

      // Validate data
      if (!invoices || invoices.length === 0) {
        throw new Error('No invoice data available for export')
      }

      // Generate CSV content
      const csvContent = generateCSVContent(invoices, filters)
      
      // Generate filename with timestamp
      const filename = generateExportFilename('invoice-report', 'csv')
      
      // Simulate processing time for user feedback (minimum 500ms)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Download the file
      downloadCSVFile(csvContent, filename)
      
      // Show success message
      setExportStatus('success')
      setExportMessage(`Successfully exported ${invoices.length} invoices to ${filename}`)
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setExportStatus(null)
        setExportMessage('')
      }, 5000)
      
    } catch (error) {
      console.error('CSV export error:', error)
      setExportStatus('error')
      setExportMessage(error.message || 'Failed to export CSV file')
      
      // Clear error message after 8 seconds
      setTimeout(() => {
        setExportStatus(null)
        setExportMessage('')
      }, 8000)
    } finally {
      setExportLoading(false)
    }
  }

  /**
   * Handle PDF export with progress tracking and professional formatting
   */
  const handlePDFExport = async () => {
    try {
      setPdfExportLoading(true)
      setExportStatus(null)
      setExportMessage('')

      // Validate data
      if (!invoices || invoices.length === 0) {
        throw new Error('No invoice data available for export')
      }

      // Calculate statistics for the PDF
      const statistics = calculateReportStatistics(invoices)
      
      // Generate PDF content with company branding and formatting
      const pdfBlob = await generatePDFContent(invoices, filters, statistics)
      
      // Generate filename with timestamp
      const filename = generateExportFilename('invoice-report', 'pdf')
      
      // Download the file
      downloadPDFFile(pdfBlob, filename)
      
      // Show success message
      setExportStatus('success')
      setExportMessage(`Successfully exported ${invoices.length} invoices to ${filename}`)
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setExportStatus(null)
        setExportMessage('')
      }, 5000)
      
    } catch (error) {
      console.error('PDF export error:', error)
      setExportStatus('error')
      setExportMessage(error.message || 'Failed to export PDF file')
      
      // Clear error message after 8 seconds
      setTimeout(() => {
        setExportStatus(null)
        setExportMessage('')
      }, 8000)
    } finally {
      setPdfExportLoading(false)
    }
  }

  /**
   * Get export button text based on current state
   */
  const getButtonText = (type = 'csv') => {
    const isLoading = type === 'csv' ? exportLoading : pdfExportLoading
    if (isLoading) return 'Exporting...'
    if (disabled || !invoices.length) return 'No Data to Export'
    return `Export ${type.toUpperCase()} (${invoices.length} invoices)`
  }

  /**
   * Get button classes based on current state
   */
  const getButtonClasses = (type = 'csv') => {
    const baseClasses = 'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200'
    const isLoading = type === 'csv' ? exportLoading : pdfExportLoading
    
    if (disabled || !invoices.length || isLoading) {
      return `${baseClasses} bg-gray-300 text-gray-500 cursor-not-allowed`
    }
    
    if (type === 'pdf') {
      return `${baseClasses} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`
    }
    
    return `${baseClasses} bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500`
  }

  /**
   * Get status message classes
   */
  const getStatusClasses = () => {
    const baseClasses = 'text-sm px-3 py-2 rounded-md border'
    
    if (exportStatus === 'success') {
      return `${baseClasses} bg-green-50 text-green-700 border-green-200`
    }
    
    if (exportStatus === 'error') {
      return `${baseClasses} bg-red-50 text-red-700 border-red-200`
    }
    
    return baseClasses
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Export Controls Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Export Options</h3>
          <p className="text-xs text-gray-600 mt-1">
            Download report data in various formats
          </p>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex items-center gap-3">
        {/* CSV Export Button */}
        <button
          onClick={handleCSVExport}
          disabled={disabled || !invoices.length || exportLoading}
          className={getButtonClasses('csv')}
          title={disabled || !invoices.length ? 'No data available for export' : 'Export data as CSV file'}
        >
          {exportLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Exporting...
            </>
          ) : (
            <>
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {getButtonText('csv')}
            </>
          )}
        </button>

        {/* PDF Export Button */}
        <button
          onClick={handlePDFExport}
          disabled={disabled || !invoices.length || pdfExportLoading}
          className={getButtonClasses('pdf')}
          title={disabled || !invoices.length ? 'No data available for export' : 'Export formatted report as PDF file'}
        >
          {pdfExportLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating PDF...
            </>
          ) : (
            <>
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {getButtonText('pdf')}
            </>
          )}
        </button>
      </div>

      {/* Export Status Messages */}
      {exportStatus && exportMessage && (
        <div className={getStatusClasses()}>
          <div className="flex items-center">
            {exportStatus === 'success' ? (
              <svg className="mr-2 h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="mr-2 h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span>{exportMessage}</span>
          </div>
        </div>
      )}

      {/* Export Information */}
      {invoices.length > 0 && (
        <div className="text-xs text-gray-500 bg-gray-50 rounded-md p-3">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Records to export:</span>
              <span className="font-medium">{invoices.length} invoices</span>
            </div>
            <div className="flex justify-between">
              <span>Export formats:</span>
              <span className="font-medium">CSV & PDF with metadata</span>
            </div>
            <div className="flex justify-between">
              <span>File includes:</span>
              <span className="font-medium">Applied filters & timestamp</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}