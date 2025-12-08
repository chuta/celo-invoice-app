// Supabase Edge Function for sending emails via Resend
// Deploy with: supabase functions deploy send-email

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'admin@celoafricadao.org'
const APP_URL = Deno.env.get('APP_URL') || 'https://your-app-url.com'

interface EmailRequest {
  type: 'invoice_pending' | 'invoice_approved' | 'invoice_rejected' | 'invoice_cancelled' | 'invoice_voided' | 'invoice_paid' | 'recurring_generated'
  invoiceId: string
  notes?: string
}

serve(async (req) => {
  try {
    const { type, invoiceId }: EmailRequest = await req.json()

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Fetch invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        clients (name, email),
        profiles (full_name, email, wallet_address)
      `)
      .eq('id', invoiceId)
      .single()

    if (invoiceError) throw invoiceError

    // Helper function to create email HTML with Celo branding
    const createEmailHTML = (title: string, content: string, ctaText?: string, ctaUrl?: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #FCFF52 0%, #FBCC5C 50%, #35D07F 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
          .header { background: rgba(255,255,255,0.95); padding: 30px; text-align: center; border-bottom: 3px solid #35D07F; }
          .header h1 { font-size: 24px; font-weight: 700; color: #111827; margin: 0; }
          .content { background: #ffffff; padding: 30px; }
          .title { font-size: 20px; font-weight: 600; color: #111827; margin-bottom: 20px; }
          .message { font-size: 16px; color: #4b5563; margin-bottom: 20px; }
          .details { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: 600; color: #6b7280; }
          .detail-value { color: #111827; }
          .cta { text-align: center; margin: 30px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #35D07F 0%, #FBCC5C 100%); color: #111827; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(53,208,127,0.4); }
          .notes { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 14px; border-radius: 8px; margin: 20px 0; font-size: 14px; color: #92400e; }
          .footer { background: rgba(255,255,255,0.95); padding: 20px; text-align: center; border-top: 3px solid #35D07F; font-size: 13px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌍 CeloAfricaDAO Invoice</h1>
          </div>
          <div class="content">
            <div class="title">${title}</div>
            ${content}
            ${ctaText && ctaUrl ? `<div class="cta"><a href="${ctaUrl}" class="button">${ctaText}</a></div>` : ''}
          </div>
          <div class="footer">
            <p><strong>CeloAfricaDAO Invoice Management</strong></p>
            <p>Powered by Celo Blockchain • Built for Africa</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Prepare email content based on type
    let to: string
    let subject: string
    let html: string
    const { notes } = await req.json()

    switch (type) {
      case 'invoice_pending':
        // Email to admin when invoice is submitted
        to = ADMIN_EMAIL
        subject = `📋 New Invoice Submitted: ${invoice.invoice_number}`
        html = createEmailHTML(
          '📋 New Invoice Awaiting Approval',
          `
            <div class="message">A new invoice has been submitted and requires your review.</div>
            <div class="details">
              <div class="detail-row"><span class="detail-label">Invoice #:</span><span class="detail-value">${invoice.invoice_number}</span></div>
              <div class="detail-row"><span class="detail-label">Submitted by:</span><span class="detail-value">${invoice.profiles.full_name}</span></div>
              <div class="detail-row"><span class="detail-label">Email:</span><span class="detail-value">${invoice.profiles.email}</span></div>
              <div class="detail-row"><span class="detail-label">Client:</span><span class="detail-value">${invoice.clients?.name || 'N/A'}</span></div>
              <div class="detail-row"><span class="detail-label">Amount:</span><span class="detail-value">${invoice.amount} cUSD</span></div>
              <div class="detail-row"><span class="detail-label">Due Date:</span><span class="detail-value">${new Date(invoice.due_date).toLocaleDateString()}</span></div>
              ${invoice.memo ? `<div class="detail-row"><span class="detail-label">Memo:</span><span class="detail-value">${invoice.memo}</span></div>` : ''}
            </div>
            <div class="message">Please review and take action on this invoice in the admin dashboard.</div>
          `,
          '👀 Review Invoice',
          `${APP_URL}/admin`
        )
        break

      case 'invoice_approved':
        // Email to user when invoice is approved
        to = invoice.profiles.email
        subject = `✅ Invoice Approved: ${invoice.invoice_number}`
        html = createEmailHTML(
          '✅ Great News! Your Invoice Has Been Approved',
          `
            <div class="message">Hi ${invoice.profiles.full_name},</div>
            <div class="message">Congratulations! Your invoice has been approved and is ready for payment processing.</div>
            <div class="details">
              <div class="detail-row"><span class="detail-label">Invoice #:</span><span class="detail-value">${invoice.invoice_number}</span></div>
              <div class="detail-row"><span class="detail-label">Client:</span><span class="detail-value">${invoice.clients?.name || 'N/A'}</span></div>
              <div class="detail-row"><span class="detail-label">Amount:</span><span class="detail-value">${invoice.amount} cUSD</span></div>
              <div class="detail-row"><span class="detail-label">Payment Address:</span><span class="detail-value">${invoice.profiles.wallet_address || 'Not set'}</span></div>
              <div class="detail-row"><span class="detail-label">Due Date:</span><span class="detail-value">${new Date(invoice.due_date).toLocaleDateString()}</span></div>
            </div>
            ${notes ? `<div class="notes"><strong>Admin Notes:</strong><br>${notes}</div>` : ''}
            <div class="message">Payment will be processed according to the payment schedule. You'll receive another notification when payment is completed.</div>
          `,
          '📄 View Invoice',
          `${APP_URL}/invoices/${invoice.id}`
        )
        break

      case 'invoice_paid':
        // Email to user when payment is completed
        to = invoice.profiles.email
        subject = `💰 Payment Completed: ${invoice.invoice_number}`
        html = createEmailHTML(
          '💰 Payment Completed Successfully!',
          `
            <div class="message">Hi ${invoice.profiles.full_name},</div>
            <div class="message">Excellent news! Your invoice payment has been completed.</div>
            <div class="details">
              <div class="detail-row"><span class="detail-label">Invoice #:</span><span class="detail-value">${invoice.invoice_number}</span></div>
              <div class="detail-row"><span class="detail-label">Client:</span><span class="detail-value">${invoice.clients?.name || 'N/A'}</span></div>
              <div class="detail-row"><span class="detail-label">Amount Paid:</span><span class="detail-value">${invoice.amount} cUSD</span></div>
              <div class="detail-row"><span class="detail-label">Payment Address:</span><span class="detail-value">${invoice.profiles.wallet_address}</span></div>
              <div class="detail-row"><span class="detail-label">Payment Date:</span><span class="detail-value">${new Date(invoice.paid_date || Date.now()).toLocaleDateString()}</span></div>
            </div>
            <div class="message">The payment has been sent to your wallet address. Please allow a few minutes for the transaction to be confirmed on the Celo blockchain.</div>
            <div class="message">Thank you for using CeloAfricaDAO Invoice Management! 💚</div>
          `,
          '📄 View Invoice',
          `${APP_URL}/invoices/${invoice.id}`
        )
        break

      case 'invoice_rejected':
        // Email to user when invoice is rejected
        to = invoice.profiles.email
        subject = `❌ Invoice Rejected: ${invoice.invoice_number}`
        html = createEmailHTML(
          '❌ Invoice Rejected',
          `
            <div class="message">Hi ${invoice.profiles.full_name},</div>
            <div class="message">Unfortunately, your invoice has been rejected by the administrator.</div>
            <div class="details">
              <div class="detail-row"><span class="detail-label">Invoice #:</span><span class="detail-value">${invoice.invoice_number}</span></div>
              <div class="detail-row"><span class="detail-label">Client:</span><span class="detail-value">${invoice.clients?.name || 'N/A'}</span></div>
              <div class="detail-row"><span class="detail-label">Amount:</span><span class="detail-value">${invoice.amount} cUSD</span></div>
            </div>
            ${notes ? `<div class="notes"><strong>Rejection Reason:</strong><br>${notes}</div>` : ''}
            <div class="message">Please review the rejection reason and make necessary corrections. You can create a new invoice or contact the administrator for more information.</div>
          `,
          '📄 View Invoice',
          `${APP_URL}/invoices/${invoice.id}`
        )
        break

      case 'invoice_voided':
        // Email to user when invoice is voided by admin
        to = invoice.profiles.email
        subject = `⊘ Invoice Voided: ${invoice.invoice_number}`
        html = createEmailHTML(
          '⊘ Invoice Has Been Voided',
          `
            <div class="message">Hi ${invoice.profiles.full_name},</div>
            <div class="message">Your previously approved invoice has been voided by the administrator.</div>
            <div class="details">
              <div class="detail-row"><span class="detail-label">Invoice #:</span><span class="detail-value">${invoice.invoice_number}</span></div>
              <div class="detail-row"><span class="detail-label">Client:</span><span class="detail-value">${invoice.clients?.name || 'N/A'}</span></div>
              <div class="detail-row"><span class="detail-label">Amount:</span><span class="detail-value">${invoice.amount} cUSD</span></div>
            </div>
            ${notes ? `<div class="notes"><strong>Void Reason:</strong><br>${notes}</div>` : ''}
            <div class="message">This invoice will not be processed for payment. If you believe this is an error, please contact the administrator.</div>
          `,
          '📄 View Invoice',
          `${APP_URL}/invoices/${invoice.id}`
        )
        break

      case 'invoice_cancelled':
        // Email to admin when user cancels invoice
        to = ADMIN_EMAIL
        subject = `🚫 Invoice Cancelled: ${invoice.invoice_number}`
        html = createEmailHTML(
          '🚫 Invoice Cancelled by User',
          `
            <div class="message">An invoice has been cancelled by the user.</div>
            <div class="details">
              <div class="detail-row"><span class="detail-label">Invoice #:</span><span class="detail-value">${invoice.invoice_number}</span></div>
              <div class="detail-row"><span class="detail-label">User:</span><span class="detail-value">${invoice.profiles.full_name} (${invoice.profiles.email})</span></div>
              <div class="detail-row"><span class="detail-label">Client:</span><span class="detail-value">${invoice.clients?.name || 'N/A'}</span></div>
              <div class="detail-row"><span class="detail-label">Amount:</span><span class="detail-value">${invoice.amount} cUSD</span></div>
              <div class="detail-row"><span class="detail-label">Cancelled Date:</span><span class="detail-value">${new Date().toLocaleDateString()}</span></div>
            </div>
            <div class="message">This invoice has been removed from the approval queue.</div>
          `,
          '👀 View Dashboard',
          `${APP_URL}/admin`
        )
        break

      case 'recurring_generated':
        // Email to user when recurring invoice is generated
        to = invoice.profiles.email
        subject = `🔄 New Recurring Invoice: ${invoice.invoice_number}`
        html = createEmailHTML(
          '🔄 New Recurring Invoice Generated',
          `
            <div class="message">Hi ${invoice.profiles.full_name},</div>
            <div class="message">A new recurring invoice has been automatically generated based on your recurring invoice schedule.</div>
            <div class="details">
              <div class="detail-row"><span class="detail-label">Invoice #:</span><span class="detail-value">${invoice.invoice_number}</span></div>
              <div class="detail-row"><span class="detail-label">Client:</span><span class="detail-value">${invoice.clients?.name || 'N/A'}</span></div>
              <div class="detail-row"><span class="detail-label">Amount:</span><span class="detail-value">${invoice.amount} cUSD</span></div>
              <div class="detail-row"><span class="detail-label">Due Date:</span><span class="detail-value">${new Date(invoice.due_date).toLocaleDateString()}</span></div>
            </div>
            <div class="message">Please review this invoice and submit it for approval when ready.</div>
          `,
          '📄 Review & Submit',
          `${APP_URL}/invoices/${invoice.id}`
        )
        break

      default:
        throw new Error('Invalid email type')
    }

    // Send email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: Deno.env.get('FROM_EMAIL') || 'CeloAfricaDAO Invoice <onboarding@resend.dev>',
        to,
        subject,
        html,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Resend API error: ${error}`)
    }

    const data = await response.json()

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
