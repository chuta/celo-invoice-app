import { supabase } from './supabase'

/**
 * Send email notification via Supabase Edge Function
 * @param {string} type - Email type: 'invoice_submitted', 'invoice_approved', 'invoice_rejected', 'invoice_cancelled'
 * @param {string} invoiceId - Invoice ID
 */
export async function sendEmailNotification(type, invoiceId) {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { type, invoiceId },
    })

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Email notification error:', error)
    // Don't throw - email failures shouldn't block the main operation
    return { success: false, error: error.message }
  }
}
