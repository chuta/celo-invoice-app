// Supabase Edge Function for sending emails via Resend
// Deploy with: supabase functions deploy send-email

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

interface EmailRequest {
  type: 'invoice_submitted' | 'invoice_approved' | 'invoice_rejected' | 'invoice_cancelled' | 'recurring_generated'
  invoiceId: string
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

    // Prepare email content based on type
    let to: string
    let subject: string
    let html: string

    switch (type) {
      case 'invoice_submitted':
        // Email to admin
        to = 'admin@celoafricadao.org' // Replace with actual admin email
        subject = `New Invoice Submitted: ${invoice.invoice_number}`
        html = `
          <h2>New Invoice Submitted for Approval</h2>
          <p><strong>Invoice #:</strong> ${invoice.invoice_number}</p>
          <p><strong>User:</strong> ${invoice.profiles.full_name} (${invoice.profiles.email})</p>
          <p><strong>Client:</strong> ${invoice.clients.name}</p>
          <p><strong>Amount:</strong> ${invoice.amount} cUSD</p>
          <p><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</p>
          <p><strong>Memo:</strong> ${invoice.memo || 'N/A'}</p>
          <br>
          <p>Please review and approve this invoice in the admin dashboard.</p>
          <p><a href="${SUPABASE_URL}/invoices/${invoice.id}">View Invoice</a></p>
        `
        break

      case 'invoice_approved':
        // Email to user
        to = invoice.profiles.email
        subject = `Invoice Approved: ${invoice.invoice_number}`
        html = `
          <h2>Your Invoice Has Been Approved! ✅</h2>
          <p>Hi ${invoice.profiles.full_name},</p>
          <p>Great news! Your invoice has been approved.</p>
          <br>
          <p><strong>Invoice #:</strong> ${invoice.invoice_number}</p>
          <p><strong>Client:</strong> ${invoice.clients.name}</p>
          <p><strong>Amount:</strong> ${invoice.amount} cUSD</p>
          <p><strong>Payment will be sent to:</strong> ${invoice.profiles.wallet_address}</p>
          <br>
          <p>Payment will be processed according to the payment schedule.</p>
          <p><a href="${SUPABASE_URL}/invoices/${invoice.id}">View Invoice</a></p>
        `
        break

      case 'invoice_rejected':
        // Email to user
        to = invoice.profiles.email
        subject = `Invoice Rejected: ${invoice.invoice_number}`
        html = `
          <h2>Invoice Rejected</h2>
          <p>Hi ${invoice.profiles.full_name},</p>
          <p>Your invoice has been rejected.</p>
          <br>
          <p><strong>Invoice #:</strong> ${invoice.invoice_number}</p>
          <p><strong>Client:</strong> ${invoice.clients.name}</p>
          <p><strong>Amount:</strong> ${invoice.amount} cUSD</p>
          <br>
          <p>Please contact the admin for more information or submit a revised invoice.</p>
          <p><a href="${SUPABASE_URL}/invoices/${invoice.id}">View Invoice</a></p>
        `
        break

      case 'invoice_cancelled':
        // Email to admin
        to = 'admin@celoafricadao.org' // Replace with actual admin email
        subject = `Invoice Cancelled: ${invoice.invoice_number}`
        html = `
          <h2>Invoice Cancelled</h2>
          <p><strong>Invoice #:</strong> ${invoice.invoice_number}</p>
          <p><strong>User:</strong> ${invoice.profiles.full_name} (${invoice.profiles.email})</p>
          <p><strong>Client:</strong> ${invoice.clients.name}</p>
          <p><strong>Amount:</strong> ${invoice.amount} cUSD</p>
          <br>
          <p>This invoice has been cancelled by the user.</p>
        `
        break

      case 'recurring_generated':
        // Email to user
        to = invoice.profiles.email
        subject = `New Recurring Invoice Generated: ${invoice.invoice_number}`
        html = `
          <h2>New Recurring Invoice Generated</h2>
          <p>Hi ${invoice.profiles.full_name},</p>
          <p>A new recurring invoice has been automatically generated.</p>
          <br>
          <p><strong>Invoice #:</strong> ${invoice.invoice_number}</p>
          <p><strong>Client:</strong> ${invoice.clients.name}</p>
          <p><strong>Amount:</strong> ${invoice.amount} cUSD</p>
          <p><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</p>
          <br>
          <p>Please review and submit this invoice for approval.</p>
          <p><a href="${SUPABASE_URL}/invoices/${invoice.id}">View Invoice</a></p>
        `
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
        from: 'CELOAfricaDAO Invoice <noreply@celoafricadao.org>', // Replace with your verified domain
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
