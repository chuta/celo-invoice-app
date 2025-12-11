import { supabase } from './supabase'

/**
 * Send email notification via Supabase Edge Function
 * @param {string} type - Email type: 'invoice_pending', 'invoice_approved', 'invoice_rejected', 'invoice_cancelled', 'invoice_voided', 'invoice_paid', 'recurring_generated'
 * @param {string} invoiceId - Invoice ID
 * @param {string} notes - Optional notes to include in email
 */
export async function sendEmailNotification(type, invoiceId, notes = '') {
  try {
    console.log(`📧 Sending email notification: ${type} for invoice ${invoiceId}`)
    
    // Validate inputs
    if (!type || !invoiceId) {
      throw new Error('Email type and invoice ID are required')
    }

    if (!Object.values(EMAIL_TYPES).includes(type)) {
      throw new Error(`Invalid email type: ${type}`)
    }

    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { type, invoiceId, notes },
    })

    if (error) {
      console.error('Supabase function error:', error)
      throw error
    }

    console.log('✅ Email notification sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('❌ Email notification error:', {
      type,
      invoiceId,
      notes,
      error: error.message,
      stack: error.stack
    })
    // Don't throw - email failures shouldn't block the main operation
    return { success: false, error: error.message }
  }
}

/**
 * Email type constants for easy reference
 */
export const EMAIL_TYPES = {
  PENDING: 'invoice_pending',
  APPROVED: 'invoice_approved',
  REJECTED: 'invoice_rejected',
  CANCELLED: 'invoice_cancelled',
  VOIDED: 'invoice_voided',
  PAID: 'invoice_paid',
  RECURRING: 'recurring_generated',
}
